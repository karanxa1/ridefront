"""
Mapbox API endpoints
"""

from fastapi import APIRouter, HTTPException, status, Query
from app.services.mapbox import get_mapbox_service
from app.models.mapbox import RouteRequest, RouteResponse, ETARequest, ETAResponse

router = APIRouter()


@router.get("/route", response_model=RouteResponse)
async def get_route(
    origin_lat: float = Query(..., ge=-90, le=90, description="Origin latitude"),
    origin_lng: float = Query(..., ge=-180, le=180, description="Origin longitude"),
    destination_lat: float = Query(..., ge=-90, le=90, description="Destination latitude"),
    destination_lng: float = Query(..., ge=-180, le=180, description="Destination longitude"),
    profile: str = Query("driving", description="Routing profile (driving, walking, cycling)")
):
    """Get route between two points"""
    try:
        mapbox_service = get_mapbox_service()
        route_data = await mapbox_service.get_route(
            origin_lat=origin_lat,
            origin_lng=origin_lng,
            destination_lat=destination_lat,
            destination_lng=destination_lng,
            profile=profile
        )

        return RouteResponse(**route_data)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get route: {str(e)}"
        )


@router.get("/eta", response_model=ETAResponse)
async def get_eta(
    origin_lat: float = Query(..., ge=-90, le=90, description="Origin latitude"),
    origin_lng: float = Query(..., ge=-180, le=180, description="Origin longitude"),
    destination_lat: float = Query(..., ge=-90, le=90, description="Destination latitude"),
    destination_lng: float = Query(..., ge=-180, le=180, description="Destination longitude"),
    profile: str = Query("driving", description="Routing profile (driving, walking, cycling)")
):
    """Get estimated time of arrival between two points"""
    try:
        mapbox_service = get_mapbox_service()
        eta_data = await mapbox_service.get_eta(
            origin_lat=origin_lat,
            origin_lng=origin_lng,
            destination_lat=destination_lat,
            destination_lng=destination_lng,
            profile=profile
        )

        return ETAResponse(**eta_data)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get ETA: {str(e)}"
        )


@router.get("/geocode")
async def geocode_address(address: str = Query(..., description="Address to geocode")):
    """Geocode an address to get coordinates"""
    try:
        mapbox_service = get_mapbox_service()
        coordinates = await mapbox_service.geocode_address(address)

        if not coordinates:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Address not found"
            )

        return coordinates

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Geocoding failed: {str(e)}"
        )
