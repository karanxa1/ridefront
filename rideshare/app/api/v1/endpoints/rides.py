"""
Ride endpoints (fetch ride details by id)
"""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status

from app.core.firebase import get_firestore_client

router = APIRouter()


@router.get("/{ride_id}", response_model=Dict[str, Any])
async def get_ride(ride_id: str):
    """Get ride details by id from Firestore."""
    try:
        db = get_firestore_client()
        ride_doc = db.collection("rides").document(ride_id).get()

        if not ride_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Not Found"
            )

        ride_data = ride_doc.to_dict() or {}
        ride_data["ride_id"] = ride_id

        # Optionally enrich with driver info if available
        driver_id = ride_data.get("driver_id")
        if driver_id:
            user_doc = db.collection("users").document(driver_id).get()
            if user_doc.exists:
                user_data = user_doc.to_dict() or {}
                ride_data["driver"] = {
                    "uid": driver_id,
                    "name": user_data.get("name"),
                    "rating": user_data.get("rating"),
                    "profile_pic": user_data.get("profile_pic"),
                }

        return ride_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get ride: {str(e)}"
        )



