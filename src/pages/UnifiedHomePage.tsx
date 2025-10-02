import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { MapPin, Car, Users, Clock, IndianRupee, Navigation, Map } from 'lucide-react';

const UnifiedHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, theme } = useStore();
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

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
            address: 'Getting address...',
          });

          // Get address from coordinates
          try {
            const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

            if (!mapboxToken || mapboxToken === 'undefined') {
              console.warn('Mapbox token not found, using fallback address');
              setCurrentLocation((prev) => ({
                ...prev!,
                address: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
              }));
              return;
            }

            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}`
            );

            if (!response.ok) {
              throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            if (data.features && data.features.length > 0) {
              setCurrentLocation((prev) => ({
                ...prev!,
                address: data.features[0].place_name,
              }));
            } else {
              // Fallback if no features found
              setCurrentLocation((prev) => ({
                ...prev!,
                address: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
              }));
            }
          } catch (error) {
            console.error('Error getting address:', error);
            // Set a fallback address if geocoding fails
            setCurrentLocation((prev) => ({
              ...prev!,
              address: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            }));
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div
        className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}
      >
        <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-xl`}>
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}
    >
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-black' : 'bg-white border-b border-gray-200'} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">RideShare</h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Welcome back, {user?.name || 'User'}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
        </div>
      </div>

      {/* Current Location */}
      {currentLocation && (
        <div
          className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-4 m-4 rounded-lg`}
        >
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Current Location
              </p>
              <p className="font-medium">{currentLocation.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Options */}
      <div className="p-4 space-y-4">
        <h2
          className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        >
          What would you like to do?
        </h2>

        {/* Offer a Ride */}
        <div
          onClick={() => navigate('/create-ride')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">Offer a Ride</h3>
              <p className="text-blue-100">Share your journey and earn money</p>
            </div>
            <Navigation className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Request a Ride */}
        <div
          onClick={() => navigate('/request-ride')}
          className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-xl cursor-pointer hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">Request a Ride</h3>
              <p className="text-green-100">Find someone going your way</p>
            </div>
            <Navigation className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Open Map */}
        <div
          onClick={() => navigate('/map')}
          className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl cursor-pointer hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">Open Map</h3>
              <p className="text-purple-100">View nearby rides and routes</p>
            </div>
            <Navigation className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-4 rounded-lg`}
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Active Rides
                </p>
                <p className="text-xl font-semibold">0</p>
              </div>
            </div>
          </div>
          <div
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-4 rounded-lg`}
          >
            <div className="flex items-center space-x-2">
              <IndianRupee className="w-5 h-5 text-green-400" />
              <div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Earnings
                </p>
                <p className="text-xl font-semibold">₹0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6">
          <h3
            className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            Recent Activity
          </h3>
          <div
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'} p-4 rounded-lg`}
          >
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-center`}>
              No recent activity
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        className={`fixed bottom-0 left-0 right-0 ${theme === 'dark' ? 'bg-black border-t border-gray-700' : 'bg-white border-t border-gray-200'}`}
      >
        <div className="flex justify-around py-2">
          <button className="flex flex-col items-center space-y-1 p-2">
            <div className="w-6 h-6 bg-blue-600 rounded"></div>
            <span className={`text-xs ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              Home
            </span>
          </button>
          <button
            onClick={() => navigate('/my-rides')}
            className={`flex flex-col items-center space-y-1 p-2 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <Car className="w-6 h-6" />
            <span className="text-xs">My Rides</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center space-y-1 p-2 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedHomePage;
