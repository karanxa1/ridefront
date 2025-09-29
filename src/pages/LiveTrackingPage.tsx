import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Users, 
  Clock, 
  Car,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';
import MapboxMap from '../components/MapboxMap';
import RealtimeLocationService, { type NearbyUser, type LocationUpdate } from '../services/realtime';
import LocationService, { type LocationData } from '../services/location';
import { useStore } from '../hooks/useStore';
import { toast } from 'sonner';

interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicle: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  distance_km: number;
  eta_minutes: number;
}

export function LiveTrackingPage() {
  const { rideId } = useParams<{ rideId: string }>();
  const { user } = useStore();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    initializeLocation();
    setupRealtimeTracking();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      RealtimeLocationService.disconnect();
    };
  }, []);

  const initializeLocation = async () => {
    try {
      // Check if location permission is granted
      const hasPermission = await RealtimeLocationService.isLocationPermissionGranted();
      setIsLocationPermissionGranted(hasPermission);

      if (hasPermission) {
        // Get current location
        const location = await LocationService.getCurrentLocation();
        setCurrentLocation(location);
        setMapCenter([location.longitude, location.latitude]);
        
        // Get nearby drivers
        await getNearbyDrivers(location.latitude, location.longitude);
      } else {
        // Request location permission
        await requestLocationPermission();
      }
    } catch (error) {
      console.error('Error initializing location:', error);
      toast.error('Could not access your location. Please enable location services.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const location = await RealtimeLocationService.requestLocationPermission();
      setCurrentLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || 'Current location'
      });
      setMapCenter([location.longitude, location.latitude]);
      setIsLocationPermissionGranted(true);
      await getNearbyDrivers(location.latitude, location.longitude);
    } catch (error) {
      console.error('Error requesting location permission:', error);
      toast.error('Location access is required to find nearby drivers.');
    }
  };

  const setupRealtimeTracking = () => {
    if (!user?.uid) return;

    // Connect to WebSocket
    RealtimeLocationService.connect(user.uid);

    // Listen for location updates
    RealtimeLocationService.on('location_update', (data: LocationUpdate) => {
      console.log('Location update received:', data);
    });

    // Listen for nearby users
    RealtimeLocationService.on('nearby_users', (users: NearbyUser[]) => {
      console.log('Nearby users received:', users);
      updateNearbyDrivers(users);
    });

    // Listen for connection status
    RealtimeLocationService.on('connected', () => {
      console.log('Realtime connection established');
      setIsTracking(true);
    });

    RealtimeLocationService.on('disconnected', () => {
      console.log('Realtime connection lost');
      setIsTracking(false);
    });
  };

  const getNearbyDrivers = async (latitude: number, longitude: number) => {
    try {
      // Get nearby drivers from WebSocket
      RealtimeLocationService.getNearbyUsers(latitude, longitude, 2.0);
      
      // Also get from HTTP API as fallback
      const response = await fetch(`/api/v1/ws/location/nearby/${user?.uid}?latitude=${latitude}&longitude=${longitude}&radius_km=2.0`);
      const data = await response.json();
      
      if (data.nearby_users) {
        updateNearbyDrivers(data.nearby_users);
      }
    } catch (error) {
      console.error('Error getting nearby drivers:', error);
    }
  };

  const updateNearbyDrivers = (nearbyUsers: NearbyUser[]) => {
    // Convert nearby users to driver format
    const drivers: Driver[] = nearbyUsers.map(user => ({
      id: user.user_id,
      name: `Driver ${user.user_id.slice(-4)}`, // Use last 4 chars of ID
      rating: 4.5, // Mock rating
      vehicle: 'Toyota Camry', // Mock vehicle
      location: {
        latitude: user.location.latitude,
        longitude: user.location.longitude,
        address: user.location.address || 'Unknown location'
      },
      distance_km: user.distance_km,
      eta_minutes: Math.round(user.distance_km * 2) // Mock ETA
    }));

    setNearbyDrivers(drivers);
    updateMapMarkers(drivers);
  };

  const updateMapMarkers = (drivers: Driver[]) => {
    const newMarkers = drivers.map(driver => ({
      id: driver.id,
      latitude: driver.location.latitude,
      longitude: driver.location.longitude,
      title: `${driver.name} - ${driver.distance_km.toFixed(1)}km away`,
      color: '#10B981',
      isDriver: true
    }));

    // Add current location marker
    if (currentLocation) {
      newMarkers.push({
        id: 'current-location',
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        title: 'Your Location',
        color: '#3B82F6',
        isDriver: false
      });
    }

    setMarkers(newMarkers);
  };

  const selectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setMapCenter([driver.location.longitude, driver.location.latitude]);
  };

  const refreshDrivers = async () => {
    if (currentLocation) {
      await getNearbyDrivers(currentLocation.latitude, currentLocation.longitude);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Loading live tracking...</p>
        </div>
      </div>
    );
  }

  if (!isLocationPermissionGranted) {
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="bg-black border-b border-gray-800">
          <div className="px-4 py-3">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Back</span>
              </Link>
              <h1 className="ml-6 text-xl font-semibold text-white">Live Tracking</h1>
            </div>
          </div>
        </header>

        <div className="px-4 py-6">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Location Access Required</h2>
            <p className="text-gray-300 mb-6">
              We need access to your location to show nearby drivers and provide accurate tracking.
            </p>
            <button
              onClick={requestLocationPermission}
              className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Enable Location Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Back</span>
              </Link>
              <h1 className="ml-6 text-xl font-semibold text-white">Live Tracking</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center ${isTracking ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${isTracking ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-sm">{isTracking ? 'Live' : 'Offline'}</span>
              </div>
              <button
                onClick={refreshDrivers}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Map */}
        <div className="flex-1 lg:w-2/3">
          <MapboxMap
            center={mapCenter}
            zoom={13}
            markers={markers}
            showUserLocation={true}
            className="h-full"
          />
        </div>

        {/* Driver List */}
        <div className="lg:w-1/3 bg-gray-900 border-l border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Nearby Drivers</h2>
            <p className="text-gray-300 text-sm">{nearbyDrivers.length} drivers within 2km</p>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-200px)]">
            {nearbyDrivers.length === 0 ? (
              <div className="p-4 text-center">
                <Car className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No drivers nearby</p>
                <p className="text-sm text-gray-500 mt-1">Try refreshing or check back later</p>
              </div>
            ) : (
              nearbyDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${
                    selectedDriver?.id === driver.id ? 'bg-gray-800' : 'hover:bg-gray-800'
                  }`}
                  onClick={() => selectDriver(driver)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <Car className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{driver.name}</p>
                        <div className="flex items-center text-sm text-gray-300">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          {driver.rating}
                          <span className="mx-2">•</span>
                          {driver.vehicle}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{driver.distance_km.toFixed(1)}km</p>
                      <p className="text-sm text-gray-300">{driver.eta_minutes} min</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
