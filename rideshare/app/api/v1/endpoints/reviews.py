"""
Review and rating endpoints
"""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status
from firebase_admin import firestore

from app.core.firebase import get_firestore_client
from app.models.review import ReviewCreate, ReviewResponse, UserReviews

router = APIRouter()


@router.post("/", response_model=Dict[str, Any])
async def create_review(review_data: ReviewCreate):
    """Create a review for a ride"""
    try:
        db = get_firestore_client()

        # Verify reviewer exists and has passenger role
        reviewer_doc = db.collection("users").document(review_data.reviewer_id).get()
        if not reviewer_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reviewer not found"
            )

        reviewer_data = reviewer_doc.to_dict()
        if reviewer_data.get("role") != "passenger":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only passengers can leave reviews"
            )

        # Verify reviewee exists and has driver role
        reviewee_doc = db.collection("users").document(review_data.reviewee_id).get()
        if not reviewee_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )

        reviewee_data = reviewee_doc.to_dict()
        if reviewee_data.get("role") != "driver":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only review drivers"
            )

        # Verify ride exists and is completed
        ride_doc = db.collection("rides").document(review_data.ride_id).get()
        if not ride_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ride not found"
            )

        ride_data = ride_doc.to_dict()
        if ride_data["status"] != "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only review completed rides"
            )

        # Verify reviewer was a passenger on this ride
        booking_doc = db.collection("bookings").where(
            "ride_id", "==", review_data.ride_id
        ).where(
            "passenger_id", "==", review_data.reviewer_id
        ).where(
            "status", "==", "confirmed"
        ).get()

        if not booking_doc:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must have been a passenger on this ride to leave a review"
            )

        # Check if review already exists
        existing_review = db.collection("reviews").where(
            "ride_id", "==", review_data.ride_id
        ).where(
            "reviewer_id", "==", review_data.reviewer_id
        ).get()

        if existing_review:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reviewed this ride"
            )

        # Validate rating
        if not (1 <= review_data.rating <= 5):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rating must be between 1 and 5"
            )

        # Create review
        review_doc = {
            "ride_id": review_data.ride_id,
            "reviewer_id": review_data.reviewer_id,
            "reviewee_id": review_data.reviewee_id,
            "rating": review_data.rating,
            "comment": review_data.comment,
            "created_at": firestore.SERVER_TIMESTAMP
        }

        review_ref = db.collection("reviews").document()
        review_ref.set(review_doc)

        # Update driver's average rating
        await _update_driver_rating(review_data.reviewee_id)

        return {
            "message": "Review submitted successfully",
            "review_id": review_ref.id
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create review: {str(e)}"
        )


@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(review_id: str):
    """Get review details"""
    try:
        db = get_firestore_client()
        review_doc = db.collection("reviews").document(review_id).get()

        if not review_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found"
            )

        review_data = review_doc.to_dict()
        review_data["review_id"] = review_id

        # Get reviewer name
        reviewer_doc = db.collection("users").document(review_data["reviewer_id"]).get()
        if reviewer_doc.exists:
            reviewer_data = reviewer_doc.to_dict()
            review_data["reviewer_name"] = reviewer_data.get("name", "Unknown")
        else:
            review_data["reviewer_name"] = "Unknown"

        # Get reviewee name
        reviewee_doc = db.collection("users").document(review_data["reviewee_id"]).get()
        if reviewee_doc.exists:
            reviewee_data = reviewee_doc.to_dict()
            review_data["reviewee_name"] = reviewee_data.get("name", "Unknown")
        else:
            review_data["reviewee_name"] = "Unknown"

        # Get ride details
        ride_doc = db.collection("rides").document(review_data["ride_id"]).get()
        if ride_doc.exists:
            ride_data = ride_doc.to_dict()
            review_data["ride_details"] = ride_data
        else:
            review_data["ride_details"] = {}

        return ReviewResponse(**review_data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get review: {str(e)}"
        )


@router.get("/user/{user_id}", response_model=UserReviews)
async def get_user_reviews(
    user_id: str,
    page: int = 1,
    limit: int = 20
):
    """Get reviews for a user"""
    try:
        db = get_firestore_client()

        # Verify user exists
        user_doc = db.collection("users").document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Get reviews where user is the reviewee
        reviews_query = db.collection("reviews").where("reviewee_id", "==", user_id)

        # Apply pagination
        if page < 1:
            page = 1
        if limit > 100:
            limit = 100

        offset = (page - 1) * limit
        reviews_docs = reviews_query.limit(limit).offset(offset).get()

        reviews = []
        total_rating = 0
        review_count = 0

        for review_doc in reviews_docs:
            review_data = review_doc.to_dict()
            review_data["review_id"] = review_doc.id

            # Get reviewer name
            reviewer_doc = db.collection("users").document(review_data["reviewer_id"]).get()
            if reviewer_doc.exists:
                reviewer_data = reviewer_doc.to_dict()
                review_data["reviewer_name"] = reviewer_data.get("name", "Unknown")
            else:
                review_data["reviewer_name"] = "Unknown"

            # Get ride details
            ride_doc = db.collection("rides").document(review_data["ride_id"]).get()
            if ride_doc.exists:
                ride_data = ride_doc.to_dict()
                review_data["ride_details"] = ride_data
            else:
                review_data["ride_details"] = {}

            reviews.append(review_data)
            total_rating += review_data.get("rating", 0)
            review_count += 1

        average_rating = total_rating / review_count if review_count > 0 else 0.0

        return UserReviews(
            reviews=reviews,
            average_rating=round(average_rating, 2),
            total_reviews=review_count
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user reviews: {str(e)}"
        )


async def _update_driver_rating(driver_id: str):
    """Update driver's average rating after a new review"""
    try:
        db = get_firestore_client()

        # Get all reviews for this driver
        reviews_docs = db.collection("reviews").where("reviewee_id", "==", driver_id).get()

        total_rating = 0
        review_count = 0

        for review_doc in reviews_docs:
            review_data = review_doc.to_dict()
            total_rating += review_data.get("rating", 0)
            review_count += 1

        average_rating = total_rating / review_count if review_count > 0 else 0.0

        # Update driver's rating
        db.collection("users").document(driver_id).update({
            "rating": round(average_rating, 2),
            "updated_at": firestore.SERVER_TIMESTAMP
        })

    except Exception as e:
        # Log error but don't fail the review creation
        print(f"Failed to update driver rating: {str(e)}")
