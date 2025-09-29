"""
Mapbox API integration service
"""

import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings


class MapboxService:
    """Mapbox API service for routing and directions"""

    def __init__(self):
        self.base_url = "https://api.mapbox.com"
        self.access_token = settings.MAPBOX_ACCESS_TOKEN

        if not self.access_token:
            raise ValueError("Mapbox access token not configured")

    async def get_route(
        self,
        origin_lat: float,
        origin_lng: float,
        destination_lat: float,
        destination_lng: float,
        profile: str = "driving"
    ) -> Dict[str, Any]:
        """
        Get route between two points using Mapbox Directions API

        Args:
            origin_lat: Origin latitude
            origin_lng: Origin longitude
            destination_lat: Destination latitude
            destination_lng: Destination longitude
            profile: Routing profile (driving, walking, cycling)

        Returns:
            Route data including distance, duration, and geometry
        """
        url = f"{self.base_url}/directions/v5/mapbox/{profile}/{origin_lng},{origin_lat};{destination_lng},{destination_lat}"

        params = {
            "access_token": self.access_token,
            "geometries": "geojson",
            "overview": "full",
            "steps": "true"
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if data.get("code") != "Ok" or not data.get("routes"):
                    raise ValueError("No route found")

                route = data["routes"][0]

                return {
                    "distance": route["distance"],  # meters
                    "duration": route["duration"],  # seconds
                    "geometry": route["geometry"],
                    "steps": [
                        {
                            "distance": step["distance"],
                            "duration": step["duration"],
                            "instruction": step["maneuver"]["instruction"],
                            "maneuver": step["maneuver"]
                        }
                        for step in route["legs"][0]["steps"]
                    ],
                    "waypoints": route.get("waypoints", [])
                }

            except httpx.RequestError as e:
                raise ValueError(f"Mapbox API request failed: {str(e)}")
            except Exception as e:
                raise ValueError(f"Failed to get route: {str(e)}")

    async def get_eta(
        self,
        origin_lat: float,
        origin_lng: float,
        destination_lat: float,
        destination_lng: float,
        profile: str = "driving"
    ) -> Dict[str, Any]:
        """
        Get estimated time of arrival between two points

        Args:
            origin_lat: Origin latitude
            origin_lng: Origin longitude
            destination_lat: Destination latitude
            destination_lng: Destination longitude
            profile: Routing profile

        Returns:
            ETA data with duration and distance
        """
        url = f"{self.base_url}/directions/v5/mapbox/{profile}/{origin_lng},{origin_lat};{destination_lng},{destination_lat}"

        params = {
            "access_token": self.access_token,
            "geometries": "geojson",
            "overview": "false"  # We only need duration/distance
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if data.get("code") != "Ok" or not data.get("routes"):
                    raise ValueError("No route found")

                route = data["routes"][0]

                return {
                    "duration": route["duration"],  # seconds
                    "distance": route["distance"]   # meters
                }

            except httpx.RequestError as e:
                raise ValueError(f"Mapbox API request failed: {str(e)}")
            except Exception as e:
                raise ValueError(f"Failed to get ETA: {str(e)}")

    async def geocode_address(self, address: str) -> Optional[Dict[str, float]]:
        """
        Geocode an address to get coordinates

        Args:
            address: Address to geocode

        Returns:
            Dictionary with lat/lng coordinates or None if not found
        """
        url = f"{self.base_url}/geocoding/v5/mapbox.places/{address}.json"

        params = {
            "access_token": self.access_token,
            "limit": 1
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                if data.get("features"):
                    feature = data["features"][0]
                    coordinates = feature["geometry"]["coordinates"]
                    return {
                        "lng": coordinates[0],
                        "lat": coordinates[1]
                    }

                return None

            except Exception as e:
                raise ValueError(f"Geocoding failed: {str(e)}")


# Global service instance - initialized lazily
_mapbox_service = None

def get_mapbox_service():
    """Get mapbox service instance, initializing if needed"""
    global _mapbox_service
    if _mapbox_service is None:
        _mapbox_service = MapboxService()
    return _mapbox_service
