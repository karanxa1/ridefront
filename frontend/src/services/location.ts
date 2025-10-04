// import ApiService from './api';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export interface PlaceData {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  relevance: number;
  distance?: number;
}

class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationData | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Get address from coordinates using our backend
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://sihrun-8291e677bb29.herokuapp.com';
            const response = await fetch(`${apiBaseUrl}/api/v1/location/current-location`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                latitude,
                longitude
              }),
            });
            
            const data = await response.json();

            this.currentLocation = {
              latitude,
              longitude,
              address: data.address
            };

            resolve(this.currentLocation);
          } catch (error) {
            console.error('Error getting address from coordinates:', error);
            // Fallback to coordinates if address lookup fails
            this.currentLocation = {
              latitude,
              longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            };
            resolve(this.currentLocation);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(new Error('Unable to retrieve your location'));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000 // 1 minute for better accuracy
        }
      );
    });
  }

  async searchPlaces(query: string, currentLocation?: LocationData): Promise<PlaceData[]> {
    try {
      const response = await fetch('/api/v1/location/search-places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          latitude: currentLocation?.latitude,
          longitude: currentLocation?.longitude
        }),
      });

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  async getNearbyPlaces(currentLocation: LocationData): Promise<PlaceData[]> {
    try {
      const response = await fetch('/api/v1/location/nearby-places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        }),
      });

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting nearby places:', error);
      return [];
    }
  }

  getStoredLocation(): LocationData | null {
    return this.currentLocation;
  }

  clearLocation(): void {
    this.currentLocation = null;
  }
}

export default LocationService.getInstance();
