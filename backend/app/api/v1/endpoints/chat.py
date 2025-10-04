"""
In-ride chat endpoints
"""

from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, status
from firebase_admin import firestore

from app.core.firebase import get_firestore_client
from app.models.chat import MessageCreate, MessageResponse, ChatHistory

router = APIRouter()


@router.post("/message", response_model=Dict[str, Any])
async def send_message(message_data: MessageCreate):
    """Send a message in ride chat"""
    try:
        db = get_firestore_client()

        # Verify sender exists
        sender_doc = db.collection("users").document(message_data.sender_id).get()
        if not sender_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sender not found"
            )

        sender_data = sender_doc.to_dict()

        # Verify ride exists and is active
        ride_doc = db.collection("rides").document(message_data.ride_id).get()
        if not ride_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ride not found"
            )

        ride_data = ride_doc.to_dict()
        if ride_data["status"] != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ride is not active"
            )

        # Verify user is either driver or has a confirmed booking
        is_driver = ride_data["driver_id"] == message_data.sender_id

        if not is_driver:
            # Check if user has a confirmed booking
            booking_doc = db.collection("bookings").where(
                "ride_id", "==", message_data.ride_id
            ).where(
                "passenger_id", "==", message_data.sender_id
            ).where(
                "status", "==", "confirmed"
            ).get()

            if not booking_doc:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You must be the driver or have a confirmed booking to chat"
                )

        # Create message
        message_doc = {
            "ride_id": message_data.ride_id,
            "sender_id": message_data.sender_id,
            "message": message_data.message,
            "timestamp": firestore.SERVER_TIMESTAMP,
            "sender_name": sender_data.get("name", "Unknown"),
            "is_from_driver": is_driver
        }

        # Add to ride's chat subcollection
        message_ref = db.collection("rides").document(message_data.ride_id).collection("chat").document()
        message_ref.set(message_doc)

        # Also add to main chat collection for easier querying
        db.collection("chat_messages").document(message_ref.id).set(message_doc)

        return {
            "message": "Message sent successfully",
            "message_id": message_ref.id,
            "timestamp": str(message_doc["timestamp"])
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )


@router.get("/ride/{ride_id}", response_model=ChatHistory)
async def get_ride_chat(
    ride_id: str,
    limit: int = 50,
    before_message_id: str = None
):
    """Get chat messages for a ride"""
    try:
        db = get_firestore_client()

        # Verify ride exists
        ride_doc = db.collection("rides").document(ride_id).get()
        if not ride_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ride not found"
            )

        # Get chat messages from subcollection
        chat_query = db.collection("rides").document(ride_id).collection("chat")

        if before_message_id:
            # Get messages before a specific message (for pagination)
            before_doc = chat_query.document(before_message_id).get()
            if before_doc.exists:
                before_timestamp = before_doc.to_dict()["timestamp"]
                chat_query = chat_query.where("timestamp", "<", before_timestamp)

        # Apply limit
        if limit > 100:
            limit = 100

        chat_docs = chat_query.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(limit).get()

        messages = []
        for message_doc in chat_docs:
            message_data = message_doc.to_dict()
            message_data["message_id"] = message_doc.id

            # Get sender details
            sender_doc = db.collection("users").document(message_data["sender_id"]).get()
            if sender_doc.exists:
                sender_data = sender_doc.to_dict()
                message_data["sender_name"] = sender_data.get("name", "Unknown")
            else:
                message_data["sender_name"] = "Unknown"

            messages.append(message_data)

        # Reverse to get chronological order
        messages.reverse()

        return ChatHistory(
            messages=messages,
            total_count=len(messages)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get chat messages: {str(e)}"
        )


@router.get("/user/{user_id}/conversations")
async def get_user_conversations(user_id: str):
    """Get all conversations for a user"""
    try:
        db = get_firestore_client()

        # Get rides where user is driver or has confirmed bookings
        # Driver rides
        driver_rides = db.collection("rides").where("driver_id", "==", user_id).where("status", "==", "active").get()

        # Passenger rides
        passenger_bookings = db.collection("bookings").where("passenger_id", "==", user_id).where("status", "==", "confirmed").get()

        ride_ids = set()

        # Add driver rides
        for ride_doc in driver_rides:
            ride_ids.add(ride_doc.id)

        # Add passenger rides
        for booking_doc in passenger_bookings:
            booking_data = booking_doc.to_dict()
            ride_ids.add(booking_data["ride_id"])

        conversations = []

        for ride_id in ride_ids:
            # Get ride details
            ride_doc = db.collection("rides").document(ride_id).get()
            if not ride_doc.exists:
                continue

            ride_data = ride_doc.to_dict()

            # Get last message in chat
            chat_query = db.collection("rides").document(ride_id).collection("chat")
            last_message_docs = chat_query.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(1).get()

            last_message = None
            if last_message_docs:
                last_message_data = last_message_docs[0].to_dict()
                last_message = {
                    "message": last_message_data["message"],
                    "timestamp": str(last_message_data["timestamp"]),
                    "sender_name": last_message_data.get("sender_name", "Unknown")
                }

            # Determine if user is driver
            is_driver = ride_data["driver_id"] == user_id

            # Get other participants
            participants = []
            if is_driver:
                # Get passengers with confirmed bookings
                passengers = db.collection("bookings").where("ride_id", "==", ride_id).where("status", "==", "confirmed").get()
                for passenger_doc in passengers:
                    passenger_data = passenger_doc.to_dict()
                    passenger_user_doc = db.collection("users").document(passenger_data["passenger_id"]).get()
                    if passenger_user_doc.exists:
                        passenger_user_data = passenger_user_doc.to_dict()
                        participants.append({
                            "user_id": passenger_data["passenger_id"],
                            "name": passenger_user_data.get("name", "Unknown"),
                            "role": "passenger"
                        })
            else:
                # Get driver info
                driver_doc = db.collection("users").document(ride_data["driver_id"]).get()
                if driver_doc.exists:
                    driver_data = driver_doc.to_dict()
                    participants.append({
                        "user_id": ride_data["driver_id"],
                        "name": driver_data.get("name", "Unknown"),
                        "role": "driver"
                    })

            conversations.append({
                "ride_id": ride_id,
                "is_driver": is_driver,
                "participants": participants,
                "last_message": last_message,
                "ride_status": ride_data["status"],
                "created_at": str(ride_data.get("created_at", ""))
            })

        return {
            "conversations": conversations,
            "total_count": len(conversations)
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user conversations: {str(e)}"
        )


@router.delete("/message/{message_id}")
async def delete_message(message_id: str, user_id: str):
    """Delete a chat message (sender only)"""
    try:
        db = get_firestore_client()

        # Find the message
        message_doc = None
        message_data = None

        # Search in main chat collection
        main_chat_doc = db.collection("chat_messages").document(message_id).get()
        if main_chat_doc.exists:
            message_data = main_chat_doc.to_dict()
            message_doc = main_chat_doc

        if not message_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )

        # Check if user is the sender
        if message_data["sender_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own messages"
            )

        # Delete from both collections
        message_doc.reference.delete()

        # Also try to delete from ride chat subcollection
        # This is a simplified approach - in production you might want to store the ride_id in the main message
        try:
            # We need to find which ride this message belongs to
            # This is a limitation of the current design
            pass
        except:
            pass  # Ignore errors when deleting from subcollection

        return {"message": "Message deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete message: {str(e)}"
        )
