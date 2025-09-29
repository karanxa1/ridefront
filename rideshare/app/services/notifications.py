"""
Firebase Cloud Messaging notifications service
"""

from typing import Dict, List, Optional
from firebase_admin import messaging
from app.core.firebase import get_messaging_client
import logging


class NotificationService:
    """FCM notification service"""

    def __init__(self):
        self.messaging_client = get_messaging_client()

    async def send_notification(
        self,
        token: str,
        title: str,
        body: str,
        data: Optional[Dict] = None,
        image: Optional[str] = None
    ) -> bool:
        """
        Send a notification to a single device

        Args:
            token: FCM registration token
            title: Notification title
            body: Notification body
            data: Additional data payload
            image: Notification image URL

        Returns:
            bool: Success status
        """
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                    image=image
                ),
                data=data or {},
                token=token
            )

            response = self.messaging_client.send(message)
            logging.info(f"Notification sent successfully: {response}")
            return True

        except Exception as e:
            logging.error(f"Failed to send notification: {str(e)}")
            return False

    async def send_multicast_notification(
        self,
        tokens: List[str],
        title: str,
        body: str,
        data: Optional[Dict] = None,
        image: Optional[str] = None
    ) -> Dict[str, int]:
        """
        Send a notification to multiple devices

        Args:
            tokens: List of FCM registration tokens
            title: Notification title
            body: Notification body
            data: Additional data payload
            image: Notification image URL

        Returns:
            Dict with success and failure counts
        """
        try:
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                    image=image
                ),
                data=data or {},
                tokens=tokens
            )

            response = self.messaging_client.send_multicast(message)

            return {
                "success_count": response.success_count,
                "failure_count": response.failure_count
            }

        except Exception as e:
            logging.error(f"Failed to send multicast notification: {str(e)}")
            return {
                "success_count": 0,
                "failure_count": len(tokens)
            }

    async def send_to_topic(
        self,
        topic: str,
        title: str,
        body: str,
        data: Optional[Dict] = None,
        image: Optional[str] = None
    ) -> bool:
        """
        Send a notification to a topic

        Args:
            topic: Topic name
            title: Notification title
            body: Notification body
            data: Additional data payload
            image: Notification image URL

        Returns:
            bool: Success status
        """
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                    image=image
                ),
                data=data or {},
                topic=topic
            )

            response = self.messaging_client.send(message)
            logging.info(f"Topic notification sent successfully: {response}")
            return True

        except Exception as e:
            logging.error(f"Failed to send topic notification: {str(e)}")
            return False

    async def send_ride_notification(
        self,
        ride_id: str,
        user_ids: List[str],
        notification_type: str,
        message: str,
        data: Optional[Dict] = None
    ) -> Dict[str, int]:
        """
        Send ride-related notification to multiple users

        Args:
            ride_id: Ride ID
            user_ids: List of user IDs to notify
            notification_type: Type of notification (booking_confirmed, ride_started, etc.)
            message: Notification message
            data: Additional data

        Returns:
            Dict with success and failure counts
        """
        try:
            from app.core.firebase import get_firestore_client

            db = get_firestore_client()

            # Get user tokens
            tokens = []
            for user_id in user_ids:
                user_doc = db.collection("users").document(user_id).get()
                if user_doc.exists:
                    user_data = user_doc.to_dict()
                    fcm_token = user_data.get("fcm_token")
                    if fcm_token:
                        tokens.append(fcm_token)

            if not tokens:
                return {"success_count": 0, "failure_count": len(user_ids)}

            # Create notification data
            notification_data = {
                "ride_id": ride_id,
                "type": notification_type,
                **(data or {})
            }

            # Send notification
            title = "Ride-Share Update"
            body = message

            return await self.send_multicast_notification(
                tokens=tokens,
                title=title,
                body=body,
                data=notification_data
            )

        except Exception as e:
            logging.error(f"Failed to send ride notification: {str(e)}")
            return {"success_count": 0, "failure_count": len(user_ids)}

    async def subscribe_to_topic(self, tokens: List[str], topic: str) -> Dict[str, int]:
        """
        Subscribe tokens to a topic

        Args:
            tokens: List of FCM tokens
            topic: Topic name

        Returns:
            Dict with success and failure counts
        """
        try:
            response = self.messaging_client.subscribe_to_topic(tokens, topic)
            return {
                "success_count": response.success_count,
                "failure_count": response.failure_count
            }
        except Exception as e:
            logging.error(f"Failed to subscribe to topic: {str(e)}")
            return {
                "success_count": 0,
                "failure_count": len(tokens)
            }

    async def unsubscribe_from_topic(self, tokens: List[str], topic: str) -> Dict[str, int]:
        """
        Unsubscribe tokens from a topic

        Args:
            tokens: List of FCM tokens
            topic: Topic name

        Returns:
            Dict with success and failure counts
        """
        try:
            response = self.messaging_client.unsubscribe_from_topic(tokens, topic)
            return {
                "success_count": response.success_count,
                "failure_count": response.failure_count
            }
        except Exception as e:
            logging.error(f"Failed to unsubscribe from topic: {str(e)}")
            return {
                "success_count": 0,
                "failure_count": len(tokens)
            }


# Global service instance - initialized lazily
_notification_service = None

def get_notification_service():
    """Get notification service instance, initializing if needed"""
    global _notification_service
    if _notification_service is None:
        _notification_service = NotificationService()
    return _notification_service
