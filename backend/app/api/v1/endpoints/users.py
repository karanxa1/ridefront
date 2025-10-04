"""
User management endpoints
"""

from typing import Any
from fastapi import APIRouter, HTTPException, status
from firebase_admin import firestore

from ....core.firebase import get_firestore_client

router = APIRouter()


@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile by ID"""
    try:
        db = get_firestore_client()
        user_doc = db.collection("users").document(user_id).get()

        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        user_data = user_doc.to_dict()

        # Simple response with available fields
        # Handle both old users (with role) and new users (without role)
        profile_data = {
            "uid": user_id,
            "email": user_data.get("email", ""),
            "name": user_data.get("name", ""),
            "phone": user_data.get("phone", ""),
            "profile_pic": user_data.get("profile_pic", ""),
            "rating": user_data.get("rating", 0.0),
            "created_at": str(user_data.get("created_at", "")),
        }

        # If old user has role field, we can ignore it or migrate it
        # For now, we just return the profile without role
        return profile_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user profile: {str(e)}",
        )


@router.put("/{user_id}")
async def update_user_profile(user_id: str, user_update: dict):
    """Update user profile"""
    try:
        db = get_firestore_client()
        user_doc = db.collection("users").document(user_id).get()

        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Prepare update data (only update provided fields)
        update_data = {k: v for k, v in user_update.items() if v is not None}
        update_data["updated_at"] = firestore.SERVER_TIMESTAMP

        # Update user document
        db.collection("users").document(user_id).update(update_data)

        return {
            "message": "Profile updated successfully",
            "updated_fields": list(update_data.keys()),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}",
        )


@router.get("/{user_id}/reviews")
async def get_user_reviews(user_id: str, page: int = 1, limit: int = 20):
    """Get reviews for a user"""
    try:
        db = get_firestore_client()

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
            reviewer_doc = (
                db.collection("users").document(review_data["reviewer_id"]).get()
            )
            if reviewer_doc.exists:
                reviewer_data = reviewer_doc.to_dict()
                review_data["reviewer_name"] = reviewer_data.get("name", "Unknown")

            # Get reviewee name
            reviewee_doc = (
                db.collection("users").document(review_data["reviewee_id"]).get()
            )
            if reviewee_doc.exists:
                reviewee_data = reviewee_doc.to_dict()
                review_data["reviewee_name"] = reviewee_data.get("name", "Unknown")

            reviews.append(review_data)
            total_rating += review_data.get("rating", 0)
            review_count += 1

        average_rating = total_rating / review_count if review_count > 0 else 0.0

        return {
            "reviews": reviews,
            "average_rating": average_rating,
            "total_reviews": review_count,
            "page": page,
            "limit": limit,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user reviews: {str(e)}",
        )


@router.get("/{user_id}/rides")
async def get_user_rides(user_id: str, role: str = None, status: str = None):
    """Get rides for a user (as driver or passenger)"""
    try:
        db = get_firestore_client()

        if role == "driver":
            # Get rides where user is the driver
            rides_query = db.collection("rides").where("driver_id", "==", user_id)
        else:
            # Get rides where user has bookings
            bookings_query = db.collection("bookings").where(
                "passenger_id", "==", user_id
            )
            bookings_docs = bookings_query.get()

            ride_ids = [booking.to_dict()["ride_id"] for booking in bookings_docs]
            if not ride_ids:
                return {"rides": [], "total_count": 0}

            rides_query = db.collection("rides").where(
                "ride_id", "in", ride_ids[:10]
            )  # Limit to 10

        # Apply status filter if provided
        if status:
            rides_query = rides_query.where("status", "==", status)

        rides_docs = rides_query.get()
        rides = []

        for ride_doc in rides_docs:
            ride_data = ride_doc.to_dict()
            ride_data["ride_id"] = ride_doc.id

            # Get driver name
            driver_doc = db.collection("users").document(ride_data["driver_id"]).get()
            if driver_doc.exists:
                driver_data = driver_doc.to_dict()
                ride_data["driver_name"] = driver_data.get("name", "Unknown")

            rides.append(ride_data)

        return {"rides": rides, "total_count": len(rides)}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user rides: {str(e)}",
        )
