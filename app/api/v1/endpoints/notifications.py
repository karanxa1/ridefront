"""
FCM notifications endpoints
"""

from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.notifications import get_notification_service

router = APIRouter()


class NotificationRequest(BaseModel):
    """Notification request schema"""
    token: str
    title: str
    body: str
    data: Dict[str, str] = {}
    image: str = None


class MulticastNotificationRequest(BaseModel):
    """Multicast notification request schema"""
    tokens: List[str]
    title: str
    body: str
    data: Dict[str, str] = {}
    image: str = None


class TopicNotificationRequest(BaseModel):
    """Topic notification request schema"""
    topic: str
    title: str
    body: str
    data: Dict[str, str] = {}
    image: str = None


class RideNotificationRequest(BaseModel):
    """Ride notification request schema"""
    ride_id: str
    user_ids: List[str]
    notification_type: str
    message: str
    data: Dict[str, str] = {}


class TopicSubscriptionRequest(BaseModel):
    """Topic subscription request schema"""
    tokens: List[str]
    topic: str


@router.post("/send")
async def send_notification(request: NotificationRequest):
    """Send a notification to a single device"""
    try:
        notification_service = get_notification_service()
        success = await notification_service.send_notification(
            token=request.token,
            title=request.title,
            body=request.body,
            data=request.data,
            image=request.image
        )

        if success:
            return {"message": "Notification sent successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send notification"
            )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send notification: {str(e)}"
        )


@router.post("/send-multicast")
async def send_multicast_notification(request: MulticastNotificationRequest):
    """Send a notification to multiple devices"""
    try:
        notification_service = get_notification_service()
        result = await notification_service.send_multicast_notification(
            tokens=request.tokens,
            title=request.title,
            body=request.body,
            data=request.data,
            image=request.image
        )

        return {
            "message": "Multicast notification sent",
            "success_count": result["success_count"],
            "failure_count": result["failure_count"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send multicast notification: {str(e)}"
        )


@router.post("/send-topic")
async def send_topic_notification(request: TopicNotificationRequest):
    """Send a notification to a topic"""
    try:
        notification_service = get_notification_service()
        success = await notification_service.send_to_topic(
            topic=request.topic,
            title=request.title,
            body=request.body,
            data=request.data,
            image=request.image
        )

        if success:
            return {"message": "Topic notification sent successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send topic notification"
            )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send topic notification: {str(e)}"
        )


@router.post("/ride-notification")
async def send_ride_notification(request: RideNotificationRequest):
    """Send ride-related notification to users"""
    try:
        notification_service = get_notification_service()
        result = await notification_service.send_ride_notification(
            ride_id=request.ride_id,
            user_ids=request.user_ids,
            notification_type=request.notification_type,
            message=request.message,
            data=request.data
        )

        return {
            "message": "Ride notification sent",
            "success_count": result["success_count"],
            "failure_count": result["failure_count"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send ride notification: {str(e)}"
        )


@router.post("/subscribe-topic")
async def subscribe_to_topic(request: TopicSubscriptionRequest):
    """Subscribe tokens to a topic"""
    try:
        notification_service = get_notification_service()
        result = await notification_service.subscribe_to_topic(
            tokens=request.tokens,
            topic=request.topic
        )

        return {
            "message": "Tokens subscribed to topic",
            "success_count": result["success_count"],
            "failure_count": result["failure_count"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to subscribe to topic: {str(e)}"
        )


@router.post("/unsubscribe-topic")
async def unsubscribe_from_topic(request: TopicSubscriptionRequest):
    """Unsubscribe tokens from a topic"""
    try:
        notification_service = get_notification_service()
        result = await notification_service.unsubscribe_from_topic(
            tokens=request.tokens,
            topic=request.topic
        )

        return {
            "message": "Tokens unsubscribed from topic",
            "success_count": result["success_count"],
            "failure_count": result["failure_count"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unsubscribe from topic: {str(e)}"
        )


@router.post("/register-token")
async def register_fcm_token(user_id: str, token: str):
    """Register FCM token for a user"""
    try:
        from app.core.firebase import get_firestore_client

        db = get_firestore_client()

        # Update user's FCM token
        db.collection("users").document(user_id).update({
            "fcm_token": token,
            "updated_at": "SERVER_TIMESTAMP"  # This would need firestore import
        })

        return {"message": "FCM token registered successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register FCM token: {str(e)}"
        )


@router.delete("/unregister-token")
async def unregister_fcm_token(user_id: str):
    """Unregister FCM token for a user"""
    try:
        from app.core.firebase import get_firestore_client

        db = get_firestore_client()

        # Remove user's FCM token
        db.collection("users").document(user_id).update({
            "fcm_token": None,
            "updated_at": "SERVER_TIMESTAMP"  # This would need firestore import
        })

        return {"message": "FCM token unregistered successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unregister FCM token: {str(e)}"
        )
