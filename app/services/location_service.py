import httpx
import logging
from typing import Dict, List, Optional, Tuple
from app.core.config import settings

logger = logging.getLogger(__name__)

class LocationService:
    """Service for handling location-related operations using Mapbox"""
    
    def __init__(self):
        self.mapbox_token = settings.MAPBOX_ACCESS_TOKEN
        self.base_url = "https://api.mapbox.com"
    
    async def get_current_location(self, latitude: float, longitude: float) -> Optional[Dict]:
        """Get current location details from coordinates"""
        try:
            async with httpx.AsyncClient() as client:
                # Reverse geocoding to get address from coordinates
                url = f"{self.base_url}/geocoding/v5/mapbox.places/{longitude},{latitude}.json"
                params = {
                    "access_token": self.mapbox_token,
                    "types": "address,poi"
                }
                
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                if data.get("features"):
                    feature = data["features"][0]
                    return {
                        "address": feature.get("place_name", ""),
                        "latitude": latitude,
                        "longitude": longitude,
                        "context": feature.get("context", [])
                    }
                
        except Exception as e:
            logger.error(f"Error getting current location: {str(e)}")
        
        return None
    
    async def search_places(self, query: str, latitude: float = None, longitude: float = None) -> List[Dict]:
        """Search for places using Mapbox Geocoding API"""
        try:
            async with httpx.AsyncClient() as client:
                url = f"{self.base_url}/geocoding/v5/mapbox.places/{query}.json"
                params = {
                    "access_token": self.mapbox_token,
                    "types": "address,poi",
                    "limit": 5
                }
                
                # Add proximity if coordinates are provided
                if latitude and longitude:
                    params["proximity"] = f"{longitude},{latitude}"
                
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                places = []
                
                for feature in data.get("features", []):
                    coords = feature.get("center", [])
                    if len(coords) >= 2:
                        places.append({
                            "id": feature.get("id"),
                            "name": feature.get("text", ""),
                            "address": feature.get("place_name", ""),
                            "latitude": coords[1],
                            "longitude": coords[0],
                            "category": feature.get("place_type", [""])[0] if feature.get("place_type") else "",
                            "relevance": feature.get("relevance", 0)
                        })
                
                return places
                
        except Exception as e:
            logger.error(f"Error searching places: {str(e)}")
            return []
    
    async def get_nearby_places(self, latitude: float, longitude: float, radius: int = 1000) -> List[Dict]:
        """Get nearby places using Mapbox Places API"""
        try:
            async with httpx.AsyncClient() as client:
                url = f"{self.base_url}/geocoding/v5/mapbox.places/nearby.json"
                params = {
                    "access_token": self.mapbox_token,
                    "proximity": f"{longitude},{latitude}",
                    "types": "poi",
                    "limit": 10
                }
                
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                places = []
                
                for feature in data.get("features", []):
                    coords = feature.get("center", [])
                    if len(coords) >= 2:
                        places.append({
                            "id": feature.get("id"),
                            "name": feature.get("text", ""),
                            "address": feature.get("place_name", ""),
                            "latitude": coords[1],
                            "longitude": coords[0],
                            "category": feature.get("place_type", [""])[0] if feature.get("place_type") else "",
                            "distance": self._calculate_distance(latitude, longitude, coords[1], coords[0])
                        })
                
                # Sort by distance
                places.sort(key=lambda x: x.get("distance", float('inf')))
                return places[:5]  # Return top 5 nearby places
                
        except Exception as e:
            logger.error(f"Error getting nearby places: {str(e)}")
            return []
    
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

# Global instance
location_service = LocationService()

