import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Navigation, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Users,
  Car,
  User,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatTime, formatDistance, formatDuration } from '../utils';
import { toast } from 'sonner';
import type { Ride, DriverLocation } from '../types/index';

// Mock Mapbox component since we can't use the actual library without API key
const MapComponent = ({ ride, driverLocation }: { ride: Ride; driverLocation: DriverLocation | null }) => {
  return (
    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
      {/* Mock map background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
        <div className="absolute inset-0 opacity-20">
          {/* Mock road lines */}
          <svg className="w-full h-full">
            <path d="M0,100 Q150,50 300,100 T600,100" stroke="#666" strokeWidth="3" fill="none" />
            <path d="M100,0 Q150,150 200,300 T300,600" stroke="#666" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>
      
      {/* Pickup marker */}
      <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
        <div className="bg-green-500 rounded-full p-2 shadow-lg">
          <MapPin className="h-4 w-4 text-white" />
        </div>
        <div className="bg-white px-2 py-1 rounded shadow-md text-xs mt-1 whitespace-nowrap">
          Pickup
        </div>
      </div>
      
      {/* Destination marker */}
      <div className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2">
        <div className="bg-red-500 rounded-full p-2 shadow-lg">
          <MapPin className="h-4 w-4 text-white" />
        </div>
        <div className="bg-white px-2 py-1 rounded shadow-md text-xs mt-1 whitespace-nowrap">
          Destination
        </div>
      </div>
      
      {/* Driver location */}
      {driverLocation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-blue-500 rounded-full p-2 shadow-lg animate-pulse">
            <Car className="h-4 w-4 text-white" />
          </div>
          <div className="bg-white px-2 py-1 rounded shadow-md text-xs mt-1 whitespace-nowrap">
            Driver
          </div>
        </div>
      )}
      
      {/* Mock route line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <path 
          d="M25% 25% Q50% 50% 75% 75%" 
          stroke="#3B82F6" 
          strokeWidth="3" 
          fill="none" 
          strokeDasharray="5,5"
          className="animate-pulse"
        />
      </svg>
      
      <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md">
        <p className="text-sm text-gray-600">Live Tracking</p>
      </div>
    </div>
  );
};

export function RideTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { user, getRideById, getDriverLocation, isLoading } = useStore();
  const [ride, setRide] = useState<Ride | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [eta, setEta] = useState<string>('Calculating...');
  const [distance, setDistance] = useState<string>('--');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (id) {
      loadRide(id);
      startLocationTracking(id);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [id]);

  const loadRide = async (rideId: string) => {
    try {
      const rideData = await getRideById(rideId);
      setRide(rideData);
    } catch (error) {
      toast.error('Failed to load ride details');
    }
  };

  const startLocationTracking = (rideId: string) => {
    // Update location every 10 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const location = await getDriverLocation(rideId);
        setDriverLocation(location);
        
        // Mock ETA and distance calculations
        const mockEta = Math.floor(Math.random() * 30) + 5; // 5-35 minutes
        const mockDistance = (Math.random() * 10 + 1).toFixed(1); // 1-11 km
        
        setEta(`${mockEta} min`);
        setDistance(`${mockDistance} km`);
      } catch (error) {
        console.error('Failed to get driver location:', error);
      }
    }, 10000);
    
    // Initial load
    getDriverLocation(rideId).then(location => {
      setDriverLocation(location);
    }).catch(console.error);
  };

  const isDriver = ride && user && user.uid === ride.driver_id;
  const isPassenger = ride && user && ride.passengers?.some(p => p.uid === user.uid);

  if (isLoading || !ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isDriver && !isPassenger) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to track this ride.</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to={`/ride/${ride.id}`} className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Back</span>
              </Link>
              <h1 className="ml-6 text-xl font-semibold text-gray-900">Live Tracking</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                to={`/chat/${ride.id}`}
                className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
              
              {!isDriver && (
                <button className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg">
                  <Phone className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapComponent ride={ride} driverLocation={driverLocation} />
        
        {/* Trip Info Overlay */}
        <div className="absolute top-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Trip Progress</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              ride.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              ride.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {ride.status === 'in_progress' ? 'In Progress' : 
               ride.status === 'completed' ? 'Completed' : 
               ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{eta}</p>
              <p className="text-sm text-gray-600">ETA</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{distance}</p>
              <p className="text-sm text-gray-600">Distance</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{formatTime(ride.departure_time)}</p>
              <p className="text-sm text-gray-600">Departure</p>
            </div>
          </div>
        </div>
        
        {/* Route Info */}
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">From</p>
                <p className="font-medium text-gray-900 truncate">{ride.pickup_location.address}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 rounded-full p-2">
                <MapPin className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">To</p>
                <p className="font-medium text-gray-900 truncate">{ride.destination.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          {isDriver ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {ride.passengers?.length || 0} passenger{(ride.passengers?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center">
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate
                </button>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                  End Trip
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {ride.driver.profile_pic ? (
                  <img
                    src={ride.driver.profile_pic}
                    alt={ride.driver.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                )}
                
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{ride.driver.name}</p>
                  <p className="text-sm text-gray-600">
                    {ride.vehicle_info.color} {ride.vehicle_info.make} {ride.vehicle_info.model}
                  </p>
                  <p className="text-sm text-gray-600">{ride.vehicle_info.license_plate}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">On the way</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Link
                  to={`/chat/${ride.id}`}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Driver
                </Link>
                <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                  <Phone className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}