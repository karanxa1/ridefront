import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Car,
  ArrowLeft,
  Plus,
  Minus,
  AlertCircle,
  Search,
  Loader2
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import UnifiedRidesService from '../services/unifiedRides';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'sonner';
import { type LocationData, type PlaceData } from '../services/location';

export function CreateRidePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useStore();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<PlaceData | null>(null);
  const [destinationQuery, setDestinationQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    departure_time: '',
    seats_available: 1,
    price_per_seat: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Get address from coordinates using Mapbox directly
      const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}`
      );
      
      const data = await response.json();
      
      let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      if (data.features && data.features.length > 0) {
        address = data.features[0].place_name;
      }

      const location = {
        latitude,
        longitude,
        address
      };

      setCurrentLocation(location);
      toast.success('Location detected successfully!');
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Could not detect your location. Please enable location services.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleDestinationSearch = async (query: string) => {
    setDestinationQuery(query);
    
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&limit=5`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert Mapbox response to PlaceData format
      const results = (data.features || []).map((feature: any, index: number) => ({
        id: feature.id || `place-${index}`,
        name: feature.place_name,
        address: feature.place_name,
        latitude: feature.center[1],
        longitude: feature.center[0],
        category: feature.place_type?.[0] || 'place',
        relevance: feature.relevance || 1,
        distance: feature.distance
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching places:', error);
      toast.error('Error searching for places');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectDestination = (place: PlaceData) => {
    setDestination(place);
    setDestinationQuery(place.address);
    setSearchResults([]);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentLocation) {
      newErrors.currentLocation = 'Current location is required';
    }
    if (!destination) {
      newErrors.destination = 'Destination is required';
    }
    if (!formData.departure_time) {
      newErrors.departure_time = 'Departure time is required';
    } else {
      const departureDate = new Date(formData.departure_time);
      if (departureDate <= new Date()) {
        newErrors.departure_time = 'Departure time must be in the future';
      }
    }
    if (formData.seats_available < 1 || formData.seats_available > 8) {
      newErrors.seats_available = 'Seats must be between 1 and 8';
    }
    if (formData.price_per_seat <= 0) {
      newErrors.price_per_seat = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast.error('Please log in to create a ride');
      navigate('/login');
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!currentLocation || !destination) {
      toast.error('Location information is missing');
      return;
    }

    setIsSubmitting(true);
    try {
      const rideData = {
        destination_address: destination.address,
        destination_latitude: destination.latitude,
        destination_longitude: destination.longitude,
        departure_time: formData.departure_time,
        seats_available: formData.seats_available,
        price_per_seat: formData.price_per_seat
      };

      const response = await UnifiedRidesService.createRideOffer(
        rideData,
        user.uid as string,
        currentLocation.latitude,
        currentLocation.longitude
      );

      toast.success('Ride offer created successfully!');
      navigate(`/ride/${response.data.ride_id}`);
    } catch (error) {
      console.error('Error creating ride offer:', error);
      toast.error('Failed to create ride offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Uber-style Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="px-4 py-3">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Back</span>
            </Link>
            <h1 className="ml-6 text-xl font-semibold text-white">Offer a Ride</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Location - Uber Style */}
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Current Location</h2>
            
            {isGettingLocation ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-white mr-2" />
                <span className="text-white">Detecting your location...</span>
              </div>
            ) : currentLocation ? (
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-green-400 mr-3" />
                  <div>
                    <p className="text-white font-medium">Current Location</p>
                    <p className="text-gray-300 text-sm">{currentLocation.address}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-white font-medium">Location not detected</p>
                      <p className="text-gray-300 text-sm">Click to detect your location</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Detect Location
                  </button>
                </div>
              </div>
            )}
            
            {errors.currentLocation && (
              <p className="mt-2 text-sm text-red-400 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.currentLocation}
              </p>
            )}
          </div>

          {/* Destination - Uber Style */}
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Where are you going?</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Destination *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => handleDestinationSearch(e.target.value)}
                    placeholder="Search for destination..."
                    className={`w-full pl-10 pr-4 py-4 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:border-transparent transition-colors ${
                      errors.destination ? 'border-red-500' : 'border-gray-600'
                    }`}
                    required
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-gray-400" />
                  )}
                </div>
                
                {/* Search Results */}
                {destinationQuery.length >= 3 && !isSearching && searchResults && searchResults.length > 0 && !destination && (
                  <div className="absolute z-50 w-full mt-2 bg-gray-800 rounded-xl border border-gray-600 max-h-48 overflow-y-auto shadow-lg left-0 right-0">
                    {searchResults.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => selectDestination(place)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-600 last:border-b-0"
                      >
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{place.name}</p>
                            <p className="text-gray-300 text-sm truncate">{place.address}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {destinationQuery.length >= 3 && !isSearching && searchResults && searchResults.length === 0 && !destination && (
                  <div className="absolute z-50 w-full mt-2 bg-gray-800 rounded-xl border border-gray-600 p-3 shadow-lg left-0 right-0">
                    <p className="text-gray-400 text-center">No results found</p>
                  </div>
                )}
                
                {errors.destination && (
                  <p className="mt-2 text-sm text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.destination}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Ride Details - Uber Style */}
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Ride Details</h2>
            
            <div className="space-y-4">
              {/* Departure Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Departure Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={formData.departure_time}
                    onChange={(e) => handleInputChange('departure_time', e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className={`w-full pl-10 pr-4 py-4 bg-gray-800 border rounded-xl text-white focus:ring-2 focus:ring-white focus:border-transparent transition-colors ${
                      errors.departure_time ? 'border-red-500' : 'border-gray-600'
                    }`}
                    required
                  />
                </div>
                {errors.departure_time && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.departure_time}
                  </p>
                )}
              </div>

              {/* Seats Available */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Available Seats *
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('seats_available', Math.max(1, formData.seats_available - 1))}
                    className="w-10 h-10 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-white font-medium text-lg w-8 text-center">
                    {formData.seats_available}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleInputChange('seats_available', Math.min(8, formData.seats_available + 1))}
                    className="w-10 h-10 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {errors.seats_available && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.seats_available}
                  </p>
                )}
              </div>

              {/* Price per Seat */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price per Seat (₹) *
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('price_per_seat', Math.max(0, formData.price_per_seat - 1))}
                    className="w-10 h-10 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={formData.price_per_seat}
                      onChange={(e) => handleInputChange('price_per_seat', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.50"
                      className={`w-full px-4 py-4 bg-gray-800 border rounded-xl text-white focus:ring-2 focus:ring-white focus:border-transparent transition-colors ${
                        errors.price_per_seat ? 'border-red-500' : 'border-gray-600'
                      }`}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('price_per_seat', formData.price_per_seat + 1)}
                    className="w-10 h-10 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {errors.price_per_seat && (
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.price_per_seat}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !currentLocation || !destination}
            className="w-full bg-white text-black py-4 px-6 rounded-xl font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Car className="h-5 w-5 mr-2" />
                Create Ride Offer
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
