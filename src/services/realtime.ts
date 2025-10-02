export interface LocationUpdate {
  user_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
}

export interface NearbyUser {
  user_id: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: number;
  };
  distance_km: number;
}

type EventCallback = (...args: any[]) => void;

class RealtimeLocationService {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private eventCallbacks: Map<string, EventCallback[]> = new Map();

  constructor() {
    // Initialize event callbacks map
  }

  // Simple event emitter implementation
  private emit(event: string, ...args: any[]): void {
    const callbacks = this.eventCallbacks.get(event) || [];
    callbacks.forEach(callback => callback(...args));
  }

  on(event: string, callback: EventCallback): void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.eventCallbacks.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  connect(userId: string): void {
    this.userId = userId;
    this.establishConnection();
  }

  private establishConnection(): void {
    if (!this.userId) return;

    try {
      const wsUrl = `${import.meta.env.VITE_API_BASE_URL?.replace('http', 'ws')}/api/v1/ws/location/${this.userId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.emit('disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Error establishing WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.establishConnection();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed');
    }
  }

  private handleMessage(data: any): void {
    switch (data.type) {
      case 'location_update':
        this.emit('location_update', data);
        break;
      case 'location_confirmed':
        this.emit('location_confirmed', data);
        break;
      case 'nearby_users':
        this.emit('nearby_users', data.users);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  sendLocationUpdate(latitude: number, longitude: number, address?: string): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({
        type: 'location_update',
        latitude,
        longitude,
        address
      }));
    }
  }

  subscribeToUser(targetUserId: string): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        target_user_id: targetUserId
      }));
    }
  }

  unsubscribeFromUser(targetUserId: string): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        target_user_id: targetUserId
      }));
    }
  }

  getNearbyUsers(latitude: number, longitude: number, radius: number = 2.0): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({
        type: 'get_nearby',
        latitude,
        longitude,
        radius
      }));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.userId = null;
  }

  isLocationPermissionGranted(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { timeout: 1000 }
      );
    });
  }

  requestLocationPermission(): Promise<{ latitude: number; longitude: number; address?: string }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Get address from coordinates
            const response = await fetch('/api/v1/location/current-location', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ latitude, longitude }),
            });
            
            const data = await response.json();
            resolve({
              latitude,
              longitude,
              address: data.address
            });
          } catch (error) {
            resolve({
              latitude,
              longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            });
          }
        },
        (_error) => {
          reject(new Error('Location access denied'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  startLocationTracking(intervalMs: number = 30000): void {
    if (!this.userId) return;

    const trackLocation = async () => {
      try {
        const location = await this.requestLocationPermission();
        this.sendLocationUpdate(location.latitude, location.longitude, location.address);
      } catch (error) {
        console.error('Error tracking location:', error);
      }
    };

    // Track immediately
    trackLocation();

    // Then track at intervals
    setInterval(trackLocation, intervalMs);
  }
}

export default new RealtimeLocationService();