"""
Unified ride endpoints for both offering and requesting rides
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, Query
from firebase_admin import firestore
from datetime import datetime
from pydantic import BaseModel

from app.core.firebase import get_firestore_client
from app.services.location_service import location_service

router = APIRouter()

class UnifiedRideCreate(BaseModel):
    """Unified ride creation for both offering and requesting rides"""
    destination_address: str
    destination_latitude: float
    destination_longitude: float
    departure_time: str
    seats_available: int = 1
    price_per_seat: float
    ride_type: str  # "offer" or "request"

class RideRequestCreate(BaseModel):
    """Ride request creation with automatic location detection"""
    destination_address: str
    destination_latitude: float
    destination_longitude: float
    departure_time: str
    seats_needed: int = 1
    max_price_per_seat: float = 100.0

class RideOfferCreate(BaseModel):
    """Ride offer creation with automatic location detection"""
    destination_address: str
    destination_latitude: float
    destination_longitude: float
    departure_time: str
    seats_available: int = 1
    price_per_seat: float

@router.post("/offer", response_model=Dict[str, Any])
async def create_ride_offer(
    ride_data: RideOfferCreate,
    user_id: str,
    current_latitude: float,
    current_longitude: float
):
    """Create a ride offer (user offers to drive)"""
    try:
        db = get_firestore_client()

        # Verify user exists
        user_doc = db.collection("users").document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Get current location details
        current_location = await location_service.get_current_location(
            current_latitude, 
            current_longitude
        )
        
        if not current_location:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not determine current location"
            )

        # Create ride offer document
        ride_doc = {
            "user_id": user_id,
            "ride_type": "offer",
            "origin": {
                "address": current_location["address"],
                "latitude": current_latitude,
                "longitude": current_longitude
            },
            "destination": {
                "address": ride_data.destination_address,
                "latitude": ride_data.destination_latitude,
                "longitude": ride_data.destination_longitude
            },
            "departure_time": ride_data.departure_time,
            "seats_available": ride_data.seats_available,
            "price_per_seat": ride_data.price_per_seat,
            "status": "active",
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        }

        # Add to Firestore
        ride_ref = db.collection("rides").add(ride_doc)
        ride_id = ride_ref[1].id

        return {
            "message": "Ride offer created successfully",
            "ride_id": ride_id,
            "origin": current_location["address"],
            "destination": ride_data.destination_address
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create ride offer: {str(e)}"
        )

@router.post("/request", response_model=Dict[str, Any])
async def create_ride_request(
    ride_data: RideRequestCreate,
    user_id: str,
    current_latitude: float,
    current_longitude: float
):
    """Create a ride request (user requests a ride)"""
    try:
        db = get_firestore_client()

        # Verify user exists
        user_doc = db.collection("users").document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Get current location details
        current_location = await location_service.get_current_location(
            current_latitude, 
            current_longitude
        )
        
        if not current_location:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not determine current location"
            )

        # Create ride request document
        ride_doc = {
            "user_id": user_id,
            "ride_type": "request",
            "origin": {
                "address": current_location["address"],
                "latitude": current_latitude,
                "longitude": current_longitude
            },
            "destination": {
                "address": ride_data.destination_address,
                "latitude": ride_data.destination_latitude,
                "longitude": ride_data.destination_longitude
            },
            "departure_time": ride_data.departure_time,
            "seats_needed": ride_data.seats_needed,
            "max_price_per_seat": ride_data.max_price_per_seat,
            "status": "active",
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        }

        # Add to Firestore
        ride_ref = db.collection("rides").add(ride_doc)
        ride_id = ride_ref[1].id

        return {
            "message": "Ride request created successfully",
            "ride_id": ride_id,
            "origin": current_location["address"],
            "destination": ride_data.destination_address
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create ride request: {str(e)}"
        )

@router.get("/offers", response_model=Dict[str, Any])
async def get_ride_offers(
    destination_lat: float = Query(..., ge=-90, le=90),
    destination_lng: float = Query(..., ge=-180, le=180),
    max_distance: float = Query(2.0, ge=0.1, le=50.0),  # km
    max_price: float = Query(None, ge=0),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get available ride offers near destination"""
    try:
        db = get_firestore_client()

        # Query active ride offers
        rides_query = db.collection("rides").where("ride_type", "==", "offer").where("status", "==", "active")

        # Apply pagination
        offset = (page - 1) * limit
        rides_docs = rides_query.limit(limit * 2).get()  # Get more to filter

        rides = []
        for ride_doc in rides_docs:
            ride_data = ride_doc.to_dict()
            ride_data["ride_id"] = ride_doc.id

            # Calculate distance to destination
            dest_lat = ride_data["destination"]["latitude"]
            dest_lng = ride_data["destination"]["longitude"]
            distance = calculate_distance(destination_lat, destination_lng, dest_lat, dest_lng)

            # Filter by distance
            if distance > max_distance:
                continue

            # Filter by price
            if max_price and ride_data["price_per_seat"] > max_price:
                continue

            # Get user information
            user_doc = db.collection("users").document(ride_data["user_id"]).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                ride_data["driver_name"] = user_data.get("name", "Unknown")
                ride_data["driver_rating"] = user_data.get("rating", 0.0)
            else:
                ride_data["driver_name"] = "Unknown"
                ride_data["driver_rating"] = 0.0

            ride_data["distance_to_destination"] = distance
            rides.append(ride_data)

        # Sort by distance
        rides.sort(key=lambda x: x["distance_to_destination"])

        return {
            "rides": rides[offset:offset + limit],
            "total_count": len(rides),
            "page": page,
            "limit": limit
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get ride offers: {str(e)}"
        )

@router.get("/requests", response_model=Dict[str, Any])
async def get_ride_requests(
    destination_lat: float = Query(..., ge=-90, le=90),
    destination_lng: float = Query(..., ge=-180, le=180),
    max_distance: float = Query(2.0, ge=0.1, le=50.0),  # km
    min_price: float = Query(0, ge=0),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get available ride requests near destination"""
    try:
        db = get_firestore_client()

        # Query active ride requests
        rides_query = db.collection("rides").where("ride_type", "==", "request").where("status", "==", "active")

        # Apply pagination
        offset = (page - 1) * limit
        rides_docs = rides_query.limit(limit * 2).get()  # Get more to filter

        rides = []
        for ride_doc in rides_docs:
            ride_data = ride_doc.to_dict()
            ride_data["ride_id"] = ride_doc.id

            # Calculate distance to destination
            dest_lat = ride_data["destination"]["latitude"]
            dest_lng = ride_data["destination"]["longitude"]
            distance = calculate_distance(destination_lat, destination_lng, dest_lat, dest_lng)

            # Filter by distance
            if distance > max_distance:
                continue

            # Filter by price
            if ride_data["max_price_per_seat"] < min_price:
                continue

            # Get user information
            user_doc = db.collection("users").document(ride_data["user_id"]).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                ride_data["passenger_name"] = user_data.get("name", "Unknown")
                ride_data["passenger_rating"] = user_data.get("rating", 0.0)
            else:
                ride_data["passenger_name"] = "Unknown"
                ride_data["passenger_rating"] = 0.0

            ride_data["distance_to_destination"] = distance
            rides.append(ride_data)

        # Sort by distance
        rides.sort(key=lambda x: x["distance_to_destination"])

        return {
            "rides": rides[offset:offset + limit],
            "total_count": len(rides),
            "page": page,
            "limit": limit
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get ride requests: {str(e)}"
        )

@router.get("/user/{user_id}", response_model=Dict[str, Any])
async def get_user_rides(
    user_id: str,
    ride_type: str = Query(None),  # "offer" or "request"
    status: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get rides created by a user"""
    try:
        db = get_firestore_client()

        # Verify user exists
        user_doc = db.collection("users").document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Query rides
        rides_query = db.collection("rides").where("user_id", "==", user_id)

        if ride_type:
            rides_query = rides_query.where("ride_type", "==", ride_type)

        if status:
            rides_query = rides_query.where("status", "==", status)

        # Apply pagination
        offset = (page - 1) * limit
        rides_docs = rides_query.limit(limit).offset(offset).get()

        rides = []
        for ride_doc in rides_docs:
            ride_data = ride_doc.to_dict()
            ride_data["ride_id"] = ride_doc.id
            rides.append(ride_data)

        return {
            "rides": rides,
            "total_count": len(rides),
            "page": page,
            "limit": limit
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user rides: {str(e)}"
        )

@router.put("/{ride_id}", response_model=Dict[str, Any])
async def update_ride(ride_id: str, ride_update: Dict[str, Any], user_id: str):
    """Update a ride (only by creator)"""
    try:
        db = get_firestore_client()
        ride_doc = db.collection("rides").document(ride_id).get()

        if not ride_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ride not found"
            )

        ride_data = ride_doc.to_dict()

        # Check if user is the creator
        if ride_data["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the creator can update this ride"
            )

        # Check if ride can be updated
        if ride_data["status"] in ["completed", "cancelled"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update completed or cancelled ride"
            )

        # Prepare update data
        update_data = {k: v for k, v in ride_update.items() if v is not None}
        update_data["updated_at"] = firestore.SERVER_TIMESTAMP

        # Update ride
        db.collection("rides").document(ride_id).update(update_data)

        return {
            "message": "Ride updated successfully",
            "updated_fields": list(update_data.keys())
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update ride: {str(e)}"
        )

@router.delete("/{ride_id}", response_model=Dict[str, Any])
async def cancel_ride(ride_id: str, user_id: str):
    """Cancel a ride (only by creator)"""
    try:
        db = get_firestore_client()
        ride_doc = db.collection("rides").document(ride_id).get()

        if not ride_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ride not found"
            )

        ride_data = ride_doc.to_dict()

        # Check if user is the creator
        if ride_data["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the creator can cancel this ride"
            )

        # Check if ride can be cancelled
        if ride_data["status"] == "completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel completed ride"
            )

        # Update ride status to cancelled
        db.collection("rides").document(ride_id).update({
            "status": "cancelled",
            "updated_at": firestore.SERVER_TIMESTAMP
        })

        return {"message": "Ride cancelled successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel ride: {str(e)}"
        )

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in kilometers using Haversine formula"""
    import math
    
    R = 6371  # Earth's radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat/2) * math.sin(dlat/2) + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon/2) * math.sin(dlon/2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance


