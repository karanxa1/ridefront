"""
Main API router for v1 endpoints
"""

from fastapi import APIRouter
from .endpoints import (
    auth,
    users,
    reviews,
    location,
    chat,
    notifications,
    mapbox,
    websocket,
    unified_rides,
    rides,
    bookings,
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(location.router, prefix="/location", tags=["location"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(
    notifications.router, prefix="/notifications", tags=["notifications"]
)
api_router.include_router(mapbox.router, prefix="/mapbox", tags=["mapbox"])
api_router.include_router(websocket.router, prefix="/ws", tags=["websocket"])
api_router.include_router(
    unified_rides.router, prefix="/unified-rides", tags=["unified-rides"]
)
api_router.include_router(rides.router, prefix="/rides", tags=["rides"])
