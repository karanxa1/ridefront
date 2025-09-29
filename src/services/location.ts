import ApiService from './api';

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
            const response = await ApiService.request('/api/v1/location/current-location', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                latitude,
                longitude
              }),
            });

            this.currentLocation = {
              latitude,
              longitude,
              address: response.address
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
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  async searchPlaces(query: string, currentLocation?: LocationData): Promise<PlaceData[]> {
    try {
      const response = await ApiService.request('/api/v1/location/search-places', {
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

      return response;
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  async getNearbyPlaces(currentLocation: LocationData): Promise<PlaceData[]> {
    try {
      const response = await ApiService.request('/api/v1/location/nearby-places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        }),
      });

      return response;
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
