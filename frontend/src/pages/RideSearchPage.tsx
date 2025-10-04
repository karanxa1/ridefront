import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Filter,
  Calendar,
  IndianRupee,
  ArrowLeft,
  User,
  Car,
  Navigation,
  Loader2,
  Map
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { formatTime, formatDate, formatPrice } from '../utils';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'sonner';
import type { RideSearchFilters } from '../types';

export function RideSearchPage() {
  const { searchRides, availableRides, isLoading } = useStore();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<RideSearchFilters>({
    pickup_location: undefined,
    destination: undefined,
    departure_date: undefined,
    departure_time: undefined,
    seats_needed: 1,
    max_price: undefined
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Search recommendations state
  const [pickupQuery, setPickupQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [pickupResults, setPickupResults] = useState<any[]>([]);
  const [destinationResults, setDestinationResults] = useState<any[]>([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [pickupTimeout, setPickupTimeout] = useState<number | null>(null);
  const [destinationTimeout, setDestinationTimeout] = useState<number | null>(null);
  

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (pickupTimeout) {
        clearTimeout(pickupTimeout);
      }
      if (destinationTimeout) {
        clearTimeout(destinationTimeout);
      }
    };
  }, [pickupTimeout, destinationTimeout]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.pickup-search-container') && !target.closest('.destination-search-container')) {
        setShowPickupDropdown(false);
        setShowDestinationDropdown(false);
      }
    };

    if (showPickupDropdown || showDestinationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPickupDropdown, showDestinationDropdown]);

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

      setFilters(prev => ({ ...prev, pickup_location: { lat: 0, lng: 0, address } }));
      setPickupQuery(address);
      toast.success('Location detected successfully!');
    } catch (error) {
      console.error('Error getting location:', error);
      toast.error('Could not detect your location. Please enable location services.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const searchPickupPlaces = async (query: string) => {
    setPickupQuery(query);
    
    if (query.length < 3) {
      setPickupResults([]);
      setShowPickupDropdown(false);
      return;
    }

    setShowPickupDropdown(true);

    // Clear previous timeout
    if (pickupTimeout) {
      clearTimeout(pickupTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(async () => {
      setIsSearchingPickup(true);
      try {
        const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&limit=5`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        setPickupResults(data.features || []);
      } catch (error) {
        console.error('Error searching pickup places:', error);
        setPickupResults([]);
      } finally {
        setIsSearchingPickup(false);
      }
    }, 300); // 300ms debounce

    setPickupTimeout(timeout);
  };

  const searchDestinationPlaces = async (query: string) => {
    setDestinationQuery(query);
    
    if (query.length < 3) {
      setDestinationResults([]);
      setShowDestinationDropdown(false);
      return;
    }

    setShowDestinationDropdown(true);

    // Clear previous timeout
    if (destinationTimeout) {
      clearTimeout(destinationTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(async () => {
      setIsSearchingDestination(true);
      try {
        const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&limit=5`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        setDestinationResults(data.features || []);
      } catch (error) {
        console.error('Error searching destination places:', error);
        setDestinationResults([]);
      } finally {
        setIsSearchingDestination(false);
      }
    }, 300); // 300ms debounce

    setDestinationTimeout(timeout);
  };

  const selectPickupLocation = (place: any) => {
    setFilters(prev => ({ ...prev, pickup_location: place.place_name }));
    setPickupQuery(place.place_name);
    setPickupResults([]);
    setShowPickupDropdown(false);
  };

  const selectDestination = (place: any) => {
    setFilters(prev => ({ ...prev, destination: place.place_name }));
    setDestinationQuery(place.place_name);
    setDestinationResults([]);
    setShowDestinationDropdown(false);
  };


  const openMapView = () => {
    navigate('/map');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filters.pickup_location || !filters.destination) {
      return;
    }
    
    setSearchPerformed(true);
    
    try {
      // Geocode pickup location and destination to get coordinates
      const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
      
      // Geocode pickup location
      const pickupResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(filters.pickup_location?.address || '')}.json?access_token=${mapboxToken}&limit=1`
      );
      const pickupData = await pickupResponse.json();
      
      // Geocode destination
      const destResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(filters.destination?.address || '')}.json?access_token=${mapboxToken}&limit=1`
      );
      const destData = await destResponse.json();
      
      if (!pickupData.features || pickupData.features.length === 0) {
        toast.error('Could not find pickup location');
        return;
      }
      
      if (!destData.features || destData.features.length === 0) {
        toast.error('Could not find destination');
        return;
      }
      
      const pickupCoords = pickupData.features[0].center;
      const destCoords = destData.features[0].center;
      
      // Convert filters to API format
      const searchParams = {
        origin_lat: pickupCoords[1],
        origin_lng: pickupCoords[0],
        destination_lat: destCoords[1],
        destination_lng: destCoords[0],
        departure_date: filters.departure_date,
        max_price: filters.max_price,
        min_seats: filters.seats_needed
      };
      
      await searchRides(searchParams);
    } catch (error) {
      console.error('Error geocoding locations:', error);
      toast.error('Error processing locations. Please try again.');
    }
  };

  const handleFilterChange = (key: keyof RideSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      pickup_location: undefined,
      destination: undefined,
      departure_date: undefined,
      departure_time: undefined,
      seats_needed: 1,
      max_price: undefined
    });
    setSearchPerformed(false);
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
            <h1 className="ml-6 text-xl font-semibold text-white">Find a Ride</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Uber-style Search Form */}
        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Location Inputs - Uber Style */}
            <div className="space-y-4">
              <div className="pickup-search-container">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  From
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={pickupQuery}
                    onChange={(e) => {
                      setPickupQuery(e.target.value);
                      searchPickupPlaces(e.target.value);
                    }}
                    placeholder="Enter pickup location"
                    className="w-full pl-10 pr-20 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    {isGettingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">
                      {isGettingLocation ? 'Detecting...' : 'Use Current'}
                    </span>
                  </button>
                </div>

                {/* Pickup Search Results */}
                {showPickupDropdown && (
                  <>
                    {isSearchingPickup && (
                      <div className="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded-lg mt-2 p-3 shadow-lg">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          <span className="text-gray-400">Searching...</span>
                        </div>
                      </div>
                    )}
                    
                    {!isSearchingPickup && pickupResults && pickupResults.length > 0 && (
                      <div className="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded-lg mt-2 max-h-48 overflow-y-auto shadow-lg">
                        {pickupResults.map((place, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectPickupLocation(place)}
                            className="w-full text-left p-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-colors"
                          >
                            <p className="font-medium text-white">{place.place_name}</p>
                            {place.context && (
                              <p className="text-sm text-gray-400 mt-1">
                                {place.context.map((ctx: any) => ctx.text).join(', ')}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {!isSearchingPickup && pickupQuery.length >= 3 && pickupResults && pickupResults.length === 0 && (
                      <div className="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded-lg mt-2 p-3 shadow-lg">
                        <p className="text-gray-400 text-center">No results found</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="destination-search-container">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  To
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => {
                      setDestinationQuery(e.target.value);
                      searchDestinationPlaces(e.target.value);
                    }}
                    placeholder="Enter destination"
                    className="w-full pl-10 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                    required
                  />
                </div>

                {/* Destination Search Results */}
                {showDestinationDropdown && (
                  <>
                    {isSearchingDestination && (
                      <div className="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded-lg mt-2 p-3 shadow-lg">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          <span className="text-gray-400">Searching...</span>
                        </div>
                      </div>
                    )}
                    
                    {!isSearchingDestination && destinationResults && destinationResults.length > 0 && (
                      <div className="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded-lg mt-2 max-h-48 overflow-y-auto shadow-lg">
                        {destinationResults.map((place, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectDestination(place)}
                            className="w-full text-left p-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-colors"
                          >
                            <p className="font-medium text-white">{place.place_name}</p>
                            {place.context && (
                              <p className="text-sm text-gray-400 mt-1">
                                {place.context.map((ctx: any) => ctx.text).join(', ')}
                              </p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {!isSearchingDestination && destinationQuery.length >= 3 && destinationResults && destinationResults.length === 0 && (
                      <div className="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded-lg mt-2 p-3 shadow-lg">
                        <p className="text-gray-400 text-center">No results found</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Date and Time - Uber Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={filters.departure_date ? filters.departure_date.toISOString().split('T')[0] : ''}
                    onChange={(e) => handleFilterChange('departure_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    value={filters.departure_time ? filters.departure_time.toTimeString().split(' ')[0]?.slice(0, 5) || '' : ''}
                    onChange={(e) => handleFilterChange('departure_time', e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Seats
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={filters.seats_needed}
                    onChange={(e) => handleFilterChange('seats_needed', parseInt(e.target.value))}
                    className="w-full pl-10 pr-4 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-white focus:border-transparent transition-colors appearance-none"
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num} seat{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-500"
              >
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? 'Hide' : 'Show'} filters
              </button>
              
              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Price per Seat
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={filters.max_price || ''}
                        onChange={(e) => handleFilterChange('max_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="Any price"
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - Uber Style */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isLoading || !filters.pickup_location || !filters.destination}
                className="flex-1 bg-white text-black py-4 px-6 rounded-xl font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search Rides
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={openMapView}
                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center transition-colors"
              >
                <Map className="h-5 w-5 mr-2" />
                View Map
              </button>
              
              {searchPerformed && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-6 py-4 border border-gray-600 text-gray-300 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>


        {/* Search Results - Uber Style */}
        {searchPerformed && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {availableRides.length} ride{availableRides.length !== 1 ? 's' : ''} found
              </h2>
            </div>

            {availableRides.length > 0 ? (
              <div className="space-y-4">
                {availableRides.map((ride) => (
                  <div key={ride.id} className="bg-gray-900 rounded-2xl border border-gray-700 p-6 hover:bg-gray-800 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        {/* Route */}
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex items-center space-x-2 text-white">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{ride.pickup_location?.address || 'Pickup location'}</span>
                          </div>
                          <span className="text-gray-400">→</span>
                          <div className="flex items-center space-x-2 text-white">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{ride.destination.address}</span>
                          </div>
                        </div>

                        {/* Time and Details */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-3">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(ride.departure_time)} at {formatTime(ride.departure_time)}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''} available
                          </div>
                          <div className="flex items-center">
                            <Car className="h-4 w-4 mr-1" />
                            {ride.vehicle_info?.make} {ride.vehicle_info?.model}
                          </div>
                        </div>

                        {/* Driver Info */}
                        <div className="flex items-center space-x-3">
                          {ride.driver?.profile_pic ? (
                            <img
                              src={ride.driver.profile_pic}
                              alt={ride.driver?.name || 'Driver'}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-300" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">{ride.driver?.name || 'Driver'}</p>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="text-sm text-gray-300">
                                {ride.driver_rating ? ride.driver_rating.toFixed(1) : 'New driver'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-end">
                        <div className="text-right mb-3">
                          <p className="text-2xl font-bold text-white">
                            {formatPrice(ride.price_per_seat)}
                          </p>
                          <p className="text-sm text-gray-300">per seat</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link
                            to={`/ride/${ride.id}`}
                            className="bg-gray-800 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-700 transition-colors flex items-center"
                          >
                            View Details
                          </Link>
                          <Link
                            to={`/live-tracking/${ride.id}`}
                            className="bg-white text-black px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center"
                          >
                            Live Map
                            <Navigation className="h-4 w-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-2xl border border-gray-700 p-12 text-center">
                <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No rides found</h3>
                <p className="text-gray-300 mb-4">
                  Try adjusting your search criteria or check back later.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-white hover:text-gray-300 font-medium transition-colors"
                >
                  Clear filters and search again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}