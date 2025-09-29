from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.services.location_service import location_service

router = APIRouter()

class LocationRequest(BaseModel):
    latitude: float
    longitude: float

class SearchPlacesRequest(BaseModel):
    query: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class LocationResponse(BaseModel):
    address: str
    latitude: float
    longitude: float
    context: List[dict] = []

class PlaceResponse(BaseModel):
    id: str
    name: str
    address: str
    latitude: float
    longitude: float
    category: str = ""
    relevance: float = 0.0
    distance: Optional[float] = None

@router.post("/current-location", response_model=LocationResponse)
async def get_current_location(request: LocationRequest):
    """Get current location details from coordinates"""
    try:
        location = await location_service.get_current_location(
            request.latitude, 
            request.longitude
        )
        
        if not location:
            raise HTTPException(
                status_code=404,
                detail="Location not found"
            )
        
        return LocationResponse(**location)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get location: {str(e)}"
        )

@router.post("/search-places", response_model=List[PlaceResponse])
async def search_places(request: SearchPlacesRequest):
    """Search for places using query"""
    try:
        places = await location_service.search_places(
            request.query,
            request.latitude,
            request.longitude
        )
        
        return [PlaceResponse(**place) for place in places]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search places: {str(e)}"
        )

@router.post("/nearby-places", response_model=List[PlaceResponse])
async def get_nearby_places(request: LocationRequest):
    """Get nearby places from current location"""
    try:
        places = await location_service.get_nearby_places(
            request.latitude,
            request.longitude
        )
        
        return [PlaceResponse(**place) for place in places]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get nearby places: {str(e)}"
        )