import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { MapPin, Search, Clock, Users, IndianRupee, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import UnifiedRidesService from '../services/unifiedRides';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

const RequestRidePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useStore();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    departure_time: '',
    seats_needed: 1,
    max_price_per_seat: 50
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({
            latitude,
            longitude,
            address: 'Getting address...'
          });

          // Get address from coordinates
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
            );
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              setCurrentLocation({
                latitude,
                longitude,
                address: data.features[0].place_name
              });
            }
          } catch (error) {
            console.error('Error getting address:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Please enable location access to use this feature');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  }, [isAuthenticated, navigate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.destination-search-container')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleDestinationSearch = async (query: string) => {
    console.log('🔍 Searching for:', query);
    
    if (query.length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&limit=5`;
        console.log('🌐 Fetching URL:', url);
        
        const response = await fetch(url);
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', response.headers);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Search response:', data);
        console.log('📍 Features found:', data.features?.length || 0);
        
        if (data.features && data.features.length > 0) {
          console.log('✅ First result:', data.features[0]);
        }
        
        setSearchResults(data.features || []);
      } catch (error) {
        console.error('❌ Error searching destinations:', error);
        console.error('❌ Error details:', error);
        toast.error('Error searching destinations');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    setSearchTimeout(timeout);
  };

  const selectDestination = (place: any) => {
    const [longitude, latitude] = place.center;
    setDestination({
      latitude,
      longitude,
      address: place.place_name
    });
    setSearchQuery(place.place_name);
    setSearchResults([]);
    setShowDropdown(false);
  };

  const clearDestination = () => {
    setDestination(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const validateForm = () => {
    if (!destination) {
      toast.error('Please select a destination');
      return false;
    }
    if (!formData.departure_time) {
      toast.error('Please select departure time');
      return false;
    }
    if (formData.seats_needed < 1) {
      toast.error('Please enter valid number of seats');
      return false;
    }
    if (formData.max_price_per_seat <= 0) {
      toast.error('Please enter valid maximum price');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentLocation || !destination || !user) {
      return;
    }

    try {
      const rideData = {
        destination_address: destination.address,
        destination_latitude: destination.latitude,
        destination_longitude: destination.longitude,
        departure_time: formData.departure_time,
        seats_needed: formData.seats_needed,
        max_price_per_seat: formData.max_price_per_seat
      };

      const response = await UnifiedRidesService.createRideRequest(
        rideData,
        user.uid,
        currentLocation.latitude,
        currentLocation.longitude
      );

      toast.success('Ride request created successfully!');
      navigate(`/ride/${response.data.ride_id}`);
    } catch (error) {
      console.error('Error creating ride request:', error);
      toast.error('Failed to create ride request. Please try again.');
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-gray-300"
          >
            <Navigation className="w-6 h-6 rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Request a Ride</h1>
            <p className="text-gray-400 text-sm">Find someone going your way</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Current Location */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-blue-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-400">From</p>
              <p className="font-medium">
                {currentLocation ? currentLocation.address : 'Getting location...'}
              </p>
            </div>
          </div>
        </div>

        {/* Destination Search */}
        <div className="space-y-2 destination-search-container">
          <label className="block text-sm font-medium text-gray-300">
            To
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Where do you want to go?"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleDestinationSearch(e.target.value);
              }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-3 flex items-center space-x-2">
              {destination && (
                <button
                  type="button"
                  onClick={clearDestination}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Search Results */}
          {showDropdown && (
            <>
              {isSearching && (
                <div className="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded-lg mt-2 p-3 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-gray-400">Searching...</span>
                  </div>
                </div>
              )}
              
              {!isSearching && searchResults && searchResults.length > 0 && (
                <div className="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded-lg mt-2 max-h-48 overflow-y-auto shadow-lg">
                  {searchResults.map((place, index) => (
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
              
              {!isSearching && searchQuery.length >= 3 && searchResults && searchResults.length === 0 && (
                <div className="absolute z-50 w-full bg-gray-800 border border-gray-700 rounded-lg mt-2 p-3 shadow-lg">
                  <p className="text-gray-400 text-center">No results found</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Departure Time */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            <Clock className="w-4 h-4 inline mr-2" />
            Departure Time
          </label>
          <input
            type="datetime-local"
            value={formData.departure_time}
            onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={new Date().toISOString().slice(0, 16)}
            required
          />
        </div>

        {/* Seats Needed */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            <Users className="w-4 h-4 inline mr-2" />
            Seats Needed
          </label>
          <input
            type="number"
            min="1"
            max="8"
            value={formData.seats_needed}
            onChange={(e) => setFormData({ ...formData, seats_needed: parseInt(e.target.value) || 1 })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Max Price */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            <IndianRupee className="w-4 h-4 inline mr-2" />
            Maximum Price per Seat (₹)
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={formData.max_price_per_seat}
            onChange={(e) => setFormData({ ...formData, max_price_per_seat: parseFloat(e.target.value) || 0 })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!destination || !currentLocation}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
        >
          Request Ride
        </button>
      </form>
    </div>
  );
};

export default RequestRidePage;
