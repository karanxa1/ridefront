"""
Mapbox integration models and schemas
"""

from pydantic import BaseModel
from typing import List, Optional


class RouteRequest(BaseModel):
    """Route request schema"""
    origin_lat: float
    origin_lng: float
    destination_lat: float
    destination_lng: float


class RouteStep(BaseModel):
    """Individual route step"""
    distance: float
    duration: float
    instruction: str
    maneuver: dict


class RouteResponse(BaseModel):
    """Route response schema"""
    distance: float  # in meters
    duration: float  # in seconds
    geometry: dict  # GeoJSON geometry as dict
    steps: List[RouteStep]
    waypoints: Optional[List[dict]] = []


class ETARequest(RouteRequest):
    """ETA request schema"""
    pass


class ETAResponse(BaseModel):
    """ETA response schema"""
    duration: float  # in seconds
    distance: float  # in meters
