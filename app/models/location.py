"""
Location models and schemas
"""

from pydantic import BaseModel
from datetime import datetime


class DriverLocation(BaseModel):
    """Driver location update"""
    ride_id: str
    lat: float
    lng: float


class LocationUpdate(DriverLocation):
    """Location update with timestamp"""
    timestamp: datetime


class LocationHistory(BaseModel):
    """Location history response"""
    locations: list[LocationUpdate]
    total_count: int
