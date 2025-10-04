"""
Booking endpoints - Handle ride booking requests with driver notifications
"""

from typing import Any
from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field
from firebase_admin import firestore

from ....core.firebase import get_firestore_client

router = APIRouter()


class BookingCreate(BaseModel):
    """Create a new booking"""

    ride_id: str
    passenger_id: str
    seats_requested: int = Field(default=1, ge=1, le=8)
    pickup_location: dict[str, Any] | None = None
    message: str | None = Field(None, max_length=500)


class BookingUpdate(BaseModel):
    """Update booking status"""

    action: str  # "accept", "reject", "cancel"
    message: str | None = Field(None, max_length=500)


@router.post("/", response_model=dict[str, Any])
async def create_booking(booking_data: BookingCreate):
    """
    Create a new ride booking request
    - Passenger requests to book seats on a ride
    - Creates a pending booking
    - Notifies the driver about the booking request
    """
    try:
        db = get_firestore_client()

        # 1. Get ride details
        ride_ref = db.collection("rides").document(booking_data.ride_id)
        ride_doc = ride_ref.get()

        if not ride_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Ride not found"
            )

        ride_data = ride_doc.to_dict()
        driver_id = ride_data.get("driver_id")

        # 2. Check if passenger is trying to book their own ride
        if driver_id == booking_data.passenger_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot book your own ride",
            )

        # 3. Check available seats
        seats_available = ride_data.get("seats_available", 0)
        if seats_available < booking_data.seats_requested:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough seats available. Only {seats_available} seats left",
            )

        # 4. Check if passenger already has a pending/accepted booking for this ride
        existing_bookings = (
            db.collection("bookings")
            .where("ride_id", "==", booking_data.ride_id)
            .where("passenger_id", "==", booking_data.passenger_id)
            .where("status", "in", ["pending", "accepted"])
            .get()
        )

        if len(existing_bookings) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an active booking for this ride",
            )

        # 5. Get passenger details
        passenger_doc = db.collection("users").document(booking_data.passenger_id).get()
        if not passenger_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Passenger not found"
            )

        passenger_data = passenger_doc.to_dict()

        # 6. Create booking document
        booking_ref = db.collection("bookings").document()
        booking_id = booking_ref.id

        booking_doc = {
            "booking_id": booking_id,
            "ride_id": booking_data.ride_id,
            "passenger_id": booking_data.passenger_id,
            "driver_id": driver_id,
            "seats_booked": booking_data.seats_requested,
            "status": "pending",
            "passenger_message": booking_data.message,
            "driver_message": None,
            "pickup_location": booking_data.pickup_location,
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP,
            "passenger_name": passenger_data.get("name", "Unknown"),
            "passenger_phone": passenger_data.get("phone", ""),
            "passenger_rating": passenger_data.get("rating", 0.0),
        }

        booking_ref.set(booking_doc)

        # 7. Create notification for driver
        notification_ref = db.collection("notifications").document()
        notification_doc = {
            "notification_id": notification_ref.id,
            "user_id": driver_id,
            "type": "booking_request",
            "title": "New Booking Request",
            "message": f"{passenger_data.get('name', 'A passenger')} wants to book {booking_data.seats_requested} seat(s) on your ride",
            "data": {
                "booking_id": booking_id,
                "ride_id": booking_data.ride_id,
                "passenger_id": booking_data.passenger_id,
                "passenger_name": passenger_data.get("name", "Unknown"),
                "seats_requested": booking_data.seats_requested,
                "passenger_message": booking_data.message,
            },
            "read": False,
            "created_at": firestore.SERVER_TIMESTAMP,
        }
        notification_ref.set(notification_doc)

        return {
            "success": True,
            "message": "Booking request sent to driver",
            "booking_id": booking_id,
            "status": "pending",
            "booking": {
                "booking_id": booking_id,
                "ride_id": booking_data.ride_id,
                "seats_booked": booking_data.seats_requested,
                "status": "pending",
                "driver_id": driver_id,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create booking: {str(e)}",
        )


@router.get("/{booking_id}", response_model=dict[str, Any])
async def get_booking(booking_id: str):
    """Get booking details by ID"""
    try:
        db = get_firestore_client()
        booking_doc = db.collection("bookings").document(booking_id).get()

        if not booking_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
            )

        booking_data = booking_doc.to_dict()

        # Enrich with ride and user details
        ride_doc = db.collection("rides").document(booking_data["ride_id"]).get()
        if ride_doc.exists:
            booking_data["ride"] = ride_doc.to_dict()

        passenger_doc = (
            db.collection("users").document(booking_data["passenger_id"]).get()
        )
        if passenger_doc.exists:
            passenger_info = passenger_doc.to_dict()
            booking_data["passenger"] = {
                "uid": booking_data["passenger_id"],
                "name": passenger_info.get("name"),
                "phone": passenger_info.get("phone"),
                "rating": passenger_info.get("rating"),
                "profile_pic": passenger_info.get("profile_pic"),
            }

        return booking_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get booking: {str(e)}",
        )


@router.post("/{booking_id}/action", response_model=dict[str, Any])
async def handle_booking_action(
    booking_id: str,
    action_data: BookingUpdate,
    actor_id: str = Query(..., description="ID of user performing the action"),
):
    """
    Handle booking action (accept/reject by driver, cancel by passenger)
    """
    try:
        db = get_firestore_client()

        # 1. Get booking
        booking_ref = db.collection("bookings").document(booking_id)
        booking_doc = booking_ref.get()

        if not booking_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found"
            )

        booking_data = booking_doc.to_dict()

        # 2. Validate action based on user role
        action = action_data.action.lower()
        driver_id = booking_data.get("driver_id")
        passenger_id = booking_data.get("passenger_id")
        current_status = booking_data.get("status")

        if current_status not in ["pending", "accepted"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot modify booking with status: {current_status}",
            )

        # 3. Process action
        if action == "accept":
            # Only driver can accept
            if actor_id != driver_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the driver can accept booking requests",
                )

            if current_status != "pending":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Can only accept pending bookings",
                )

            # Update booking status
            seats_booked = booking_data.get("seats_booked", 1)
            ride_id = booking_data.get("ride_id")

            # Update ride's available seats
            ride_ref = db.collection("rides").document(ride_id)
            ride_doc = ride_ref.get()

            if ride_doc.exists:
                ride_data = ride_doc.to_dict()
                new_available_seats = ride_data.get("seats_available", 0) - seats_booked

                if new_available_seats < 0:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Not enough seats available",
                    )

                ride_ref.update(
                    {
                        "seats_available": new_available_seats,
                        "updated_at": firestore.SERVER_TIMESTAMP,
                    }
                )

            # Update booking
            booking_ref.update(
                {
                    "status": "accepted",
                    "driver_message": action_data.message,
                    "updated_at": firestore.SERVER_TIMESTAMP,
                    "accepted_at": firestore.SERVER_TIMESTAMP,
                }
            )

            # Get driver info for notification
            driver_doc = db.collection("users").document(driver_id).get()
            driver_name = (
                driver_doc.to_dict().get("name", "The driver")
                if driver_doc.exists
                else "The driver"
            )

            # Notify passenger
            notification_ref = db.collection("notifications").document()
            notification_doc = {
                "notification_id": notification_ref.id,
                "user_id": passenger_id,
                "type": "booking_accepted",
                "title": "Booking Accepted!",
                "message": f"{driver_name} accepted your booking request",
                "data": {
                    "booking_id": booking_id,
                    "ride_id": ride_id,
                    "driver_id": driver_id,
                    "driver_message": action_data.message,
                },
                "read": False,
                "created_at": firestore.SERVER_TIMESTAMP,
            }
            notification_ref.set(notification_doc)

            return {
                "success": True,
                "message": "Booking accepted successfully",
                "booking_id": booking_id,
                "status": "accepted",
            }

        elif action == "reject":
            # Only driver can reject
            if actor_id != driver_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the driver can reject booking requests",
                )

            if current_status != "pending":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Can only reject pending bookings",
                )

            # Update booking
            booking_ref.update(
                {
                    "status": "rejected",
                    "driver_message": action_data.message,
                    "updated_at": firestore.SERVER_TIMESTAMP,
                    "rejected_at": firestore.SERVER_TIMESTAMP,
                }
            )

            # Get driver info for notification
            driver_doc = db.collection("users").document(driver_id).get()
            driver_name = (
                driver_doc.to_dict().get("name", "The driver")
                if driver_doc.exists
                else "The driver"
            )

            # Notify passenger
            notification_ref = db.collection("notifications").document()
            notification_doc = {
                "notification_id": notification_ref.id,
                "user_id": passenger_id,
                "type": "booking_rejected",
                "title": "Booking Declined",
                "message": f"{driver_name} declined your booking request",
                "data": {
                    "booking_id": booking_id,
                    "ride_id": booking_data.get("ride_id"),
                    "driver_message": action_data.message,
                },
                "read": False,
                "created_at": firestore.SERVER_TIMESTAMP,
            }
            notification_ref.set(notification_doc)

            return {
                "success": True,
                "message": "Booking rejected",
                "booking_id": booking_id,
                "status": "rejected",
            }

        elif action == "cancel":
            # Passenger can cancel pending or accepted bookings
            # Driver can cancel accepted bookings
            if actor_id not in [driver_id, passenger_id]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You don't have permission to cancel this booking",
                )

            # If booking was accepted, return seats to ride
            if current_status == "accepted":
                seats_booked = booking_data.get("seats_booked", 1)
                ride_id = booking_data.get("ride_id")

                ride_ref = db.collection("rides").document(ride_id)
                ride_doc = ride_ref.get()

                if ride_doc.exists:
                    ride_data = ride_doc.to_dict()
                    new_available_seats = (
                        ride_data.get("seats_available", 0) + seats_booked
                    )

                    ride_ref.update(
                        {
                            "seats_available": new_available_seats,
                            "updated_at": firestore.SERVER_TIMESTAMP,
                        }
                    )

            # Update booking
            booking_ref.update(
                {
                    "status": "cancelled",
                    "cancelled_by": actor_id,
                    "cancellation_message": action_data.message,
                    "updated_at": firestore.SERVER_TIMESTAMP,
                    "cancelled_at": firestore.SERVER_TIMESTAMP,
                }
            )

            # Notify the other party
            notify_user_id = driver_id if actor_id == passenger_id else passenger_id
            canceller_doc = db.collection("users").document(actor_id).get()
            canceller_name = (
                canceller_doc.to_dict().get("name", "User")
                if canceller_doc.exists
                else "User"
            )

            notification_ref = db.collection("notifications").document()
            notification_doc = {
                "notification_id": notification_ref.id,
                "user_id": notify_user_id,
                "type": "booking_cancelled",
                "title": "Booking Cancelled",
                "message": f"{canceller_name} cancelled the booking",
                "data": {
                    "booking_id": booking_id,
                    "ride_id": booking_data.get("ride_id"),
                    "cancelled_by": actor_id,
                    "message": action_data.message,
                },
                "read": False,
                "created_at": firestore.SERVER_TIMESTAMP,
            }
            notification_ref.set(notification_doc)

            return {
                "success": True,
                "message": "Booking cancelled successfully",
                "booking_id": booking_id,
                "status": "cancelled",
            }

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid action: {action}. Must be 'accept', 'reject', or 'cancel'",
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to handle booking action: {str(e)}",
        )


@router.get("/user/{user_id}", response_model=list[dict[str, Any]])
async def get_user_bookings(
    user_id: str,
    booking_status: str | None = Query(None, description="Filter by status"),
    as_driver: bool = Query(False, description="Get bookings as driver"),
    as_passenger: bool = Query(True, description="Get bookings as passenger"),
):
    """
    Get all bookings for a user (as passenger or driver)
    """
    try:
        db = get_firestore_client()
        bookings = []

        # Get bookings as passenger
        if as_passenger:
            query = db.collection("bookings").where("passenger_id", "==", user_id)
            if booking_status:
                query = query.where("status", "==", booking_status)

            passenger_bookings = query.order_by(
                "created_at", direction="DESCENDING"
            ).get()

            for booking_doc in passenger_bookings:
                booking_data = booking_doc.to_dict()
                booking_data["role"] = "passenger"

                # Get ride details
                ride_doc = (
                    db.collection("rides").document(booking_data["ride_id"]).get()
                )
                if ride_doc.exists:
                    booking_data["ride"] = ride_doc.to_dict()

                bookings.append(booking_data)

        # Get bookings as driver
        if as_driver:
            query = db.collection("bookings").where("driver_id", "==", user_id)
            if booking_status:
                query = query.where("status", "==", booking_status)

            driver_bookings = query.order_by("created_at", direction="DESCENDING").get()

            for booking_doc in driver_bookings:
                booking_data = booking_doc.to_dict()
                booking_data["role"] = "driver"

                # Get ride details
                ride_doc = (
                    db.collection("rides").document(booking_data["ride_id"]).get()
                )
                if ride_doc.exists:
                    booking_data["ride"] = ride_doc.to_dict()

                bookings.append(booking_data)

        # Sort by created_at
        bookings.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        return bookings

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get bookings: {str(e)}",
        )


@router.get("/ride/{ride_id}", response_model=list[dict[str, Any]])
async def get_ride_bookings(
    ride_id: str,
    booking_status: str | None = Query(None, description="Filter by status"),
):
    """
    Get all bookings for a specific ride
    """
    try:
        db = get_firestore_client()

        query = db.collection("bookings").where("ride_id", "==", ride_id)
        if booking_status:
            query = query.where("status", "==", booking_status)

        bookings_docs = query.order_by("created_at", direction="DESCENDING").get()

        bookings = []
        for booking_doc in bookings_docs:
            booking_data = booking_doc.to_dict()

            # Get passenger details
            passenger_doc = (
                db.collection("users").document(booking_data["passenger_id"]).get()
            )
            if passenger_doc.exists:
                passenger_info = passenger_doc.to_dict()
                booking_data["passenger"] = {
                    "uid": booking_data["passenger_id"],
                    "name": passenger_info.get("name"),
                    "phone": passenger_info.get("phone"),
                    "rating": passenger_info.get("rating"),
                    "profile_pic": passenger_info.get("profile_pic"),
                }

            bookings.append(booking_data)

        return bookings

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get ride bookings: {str(e)}",
        )
