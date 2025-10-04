import json
import asyncio
import logging
from typing import Dict, List, Set
from fastapi import WebSocket, WebSocketDisconnect
from app.core.firebase import get_firestore_client

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections for real-time location updates"""
    
    def __init__(self):
        # Active connections: {user_id: websocket}
        self.active_connections: Dict[str, WebSocket] = {}
        # User locations: {user_id: {lat, lng, timestamp}}
        self.user_locations: Dict[str, Dict] = {}
        # User subscriptions: {user_id: [subscribed_user_ids]}
        self.subscriptions: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected")
    
    def disconnect(self, user_id: str):
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.user_locations:
            del self.user_locations[user_id]
        if user_id in self.subscriptions:
            del self.subscriptions[user_id]
        logger.info(f"User {user_id} disconnected")
    
    async def update_location(self, user_id: str, latitude: float, longitude: float, address: str = None):
        """Update user location and notify subscribers"""
        import time
        
        location_data = {
            "latitude": latitude,
            "longitude": longitude,
            "address": address,
            "timestamp": time.time()
        }
        
        self.user_locations[user_id] = location_data
        
        # Notify all subscribers of this user's location
        await self._notify_subscribers(user_id, location_data)
    
    async def subscribe_to_user(self, subscriber_id: str, target_user_id: str):
        """Subscribe to location updates from another user"""
        if subscriber_id not in self.subscriptions:
            self.subscriptions[subscriber_id] = set()
        
        self.subscriptions[subscriber_id].add(target_user_id)
        logger.info(f"User {subscriber_id} subscribed to {target_user_id}")
    
    async def unsubscribe_from_user(self, subscriber_id: str, target_user_id: str):
        """Unsubscribe from location updates"""
        if subscriber_id in self.subscriptions:
            self.subscriptions[subscriber_id].discard(target_user_id)
    
    async def _notify_subscribers(self, user_id: str, location_data: Dict):
        """Notify all subscribers about location update"""
        for subscriber_id, subscribed_users in self.subscriptions.items():
            if user_id in subscribed_users:
                await self._send_to_user(subscriber_id, {
                    "type": "location_update",
                    "user_id": user_id,
                    "location": location_data
                })
    
    async def _send_to_user(self, user_id: str, message: Dict):
        """Send message to specific user"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to {user_id}: {e}")
                # Remove broken connection
                self.disconnect(user_id)
    
    async def get_nearby_users(self, user_id: str, latitude: float, longitude: float, radius_km: float = 2.0) -> List[Dict]:
        """Get users within radius of given location"""
        nearby_users = []
        
        for uid, location in self.user_locations.items():
            if uid == user_id:
                continue
                
            distance = self._calculate_distance(
                latitude, longitude,
                location["latitude"], location["longitude"]
            )
            
            if distance <= radius_km:
                nearby_users.append({
                    "user_id": uid,
                    "location": location,
                    "distance_km": distance
                })
        
        return nearby_users
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        import math
        
        R = 6371  # Earth's radius in kilometers
        
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        
        a = (math.sin(dlat/2) * math.sin(dlat/2) + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
             math.sin(dlon/2) * math.sin(dlon/2))
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c  # Distance in kilometers

# Global connection manager
connection_manager = ConnectionManager()

