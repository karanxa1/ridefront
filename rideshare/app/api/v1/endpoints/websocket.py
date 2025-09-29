from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.security import HTTPBearer
import json
import logging
from typing import Dict, Any
from app.services.websocket_service import connection_manager
from app.core.firebase import get_firestore_client

router = APIRouter()
security = HTTPBearer()
logger = logging.getLogger(__name__)

@router.websocket("/location/{user_id}")
async def websocket_location_tracking(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time location tracking"""
    await connection_manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive location updates from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "location_update":
                latitude = message.get("latitude")
                longitude = message.get("longitude")
                address = message.get("address")
                
                if latitude and longitude:
                    await connection_manager.update_location(
                        user_id, latitude, longitude, address
                    )
                    
                    # Send confirmation back to client
                    await connection_manager._send_to_user(user_id, {
                        "type": "location_confirmed",
                        "status": "success"
                    })
            
            elif message.get("type") == "subscribe":
                target_user_id = message.get("target_user_id")
                if target_user_id:
                    await connection_manager.subscribe_to_user(user_id, target_user_id)
            
            elif message.get("type") == "unsubscribe":
                target_user_id = message.get("target_user_id")
                if target_user_id:
                    await connection_manager.unsubscribe_from_user(user_id, target_user_id)
            
            elif message.get("type") == "get_nearby":
                latitude = message.get("latitude")
                longitude = message.get("longitude")
                radius = message.get("radius", 2.0)
                
                if latitude and longitude:
                    nearby_users = await connection_manager.get_nearby_users(
                        user_id, latitude, longitude, radius
                    )
                    
                    await connection_manager._send_to_user(user_id, {
                        "type": "nearby_users",
                        "users": nearby_users
                    })
    
    except WebSocketDisconnect:
        connection_manager.disconnect(user_id)
        logger.info(f"User {user_id} disconnected from WebSocket")
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        connection_manager.disconnect(user_id)

@router.post("/location/update")
async def update_user_location(
    user_id: str,
    latitude: float,
    longitude: float,
    address: str = None
):
    """HTTP endpoint to update user location"""
    try:
        await connection_manager.update_location(user_id, latitude, longitude, address)
        return {"status": "success", "message": "Location updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update location: {str(e)}")

@router.get("/location/nearby/{user_id}")
async def get_nearby_users(
    user_id: str,
    latitude: float,
    longitude: float,
    radius_km: float = 2.0
):
    """Get nearby users within radius"""
    try:
        nearby_users = await connection_manager.get_nearby_users(
            user_id, latitude, longitude, radius_km
        )
        return {"nearby_users": nearby_users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get nearby users: {str(e)}")

@router.get("/location/active")
async def get_active_users():
    """Get all active users with their locations"""
    try:
        active_users = []
        for user_id, location in connection_manager.user_locations.items():
            active_users.append({
                "user_id": user_id,
                "location": location
            })
        return {"active_users": active_users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get active users: {str(e)}")

