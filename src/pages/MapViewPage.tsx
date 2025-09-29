import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, MapPin, Clock, Users, Star, Car } from 'lucide-react';
import { toast } from 'sonner';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Driver {
  id: string;
  driver: {
    name: string;
    rating: number;
  };
  origin: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  departure_time: string;
  seats_available: number;
  price_per_seat: number;
}

export default function MapViewPage() {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return; // Initialize map only once

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [73.8567, 18.5204], // Pune coordinates
      zoom: 12
    });

    map.current.on('load', () => {
      console.log('Map loaded successfully');
      setMapReady(true);
    });

    map.current.on('error', (e) => {
      console.error('Map error:', e);
    });

    return () => {
      if (map.current) {
        // Clean up all route layers and sources
        for (let i = 0; i < 100; i++) { // Clean up potential route layers
          const routeId = `route-${i}`;
          const sourceId = `route-source-${i}`;
          
          if (map.current.getLayer(routeId)) {
            map.current.removeLayer(routeId);
          }
          if (map.current.getSource(sourceId)) {
            map.current.removeSource(sourceId);
          }
        }
        
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Load drivers
  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/unified-rides/offers?destination_lat=18.5204&destination_lng=73.8567&max_distance=50&page=1&limit=100`);
      
      if (!response.ok) {
        const fallbackResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/rides/`);
        if (!fallbackResponse.ok) {
          throw new Error('Failed to load drivers');
        }
        const fallbackData = await fallbackResponse.json();
        const drivers = Array.isArray(fallbackData) ? fallbackData : (fallbackData.data || []);
        setDrivers(drivers);
      } else {
        const data = await response.json();
        let drivers = [];
        
        if (data.success && data.data && data.data.rides) {
          drivers = data.data.rides;
        } else if (data.success && Array.isArray(data.data)) {
          drivers = data.data;
        } else if (Array.isArray(data)) {
          drivers = data;
        } else if (data.data && Array.isArray(data.data)) {
          drivers = data.data;
        } else if (data.rides && Array.isArray(data.rides)) {
          drivers = data.rides;
        }
        
        console.log('Loaded drivers:', drivers);
        
        // If no drivers found, create some sample data for testing
        if (drivers.length === 0) {
          console.log('No drivers found, creating sample data for testing...');
          const sampleDrivers = [
            {
              id: 'sample-1',
              driver: { name: 'John Doe', rating: 4.8 },
              origin: { 
                address: 'Pune Railway Station, Pune, Maharashtra', 
                lat: 18.5304, 
                lng: 73.8756 
              },
              destination: { 
                address: 'Pune Airport, Pune, Maharashtra', 
                lat: 18.5821, 
                lng: 73.9197 
              },
              departure_time: new Date().toISOString(),
              seats_available: 3,
              price_per_seat: 150
            },
            {
              id: 'sample-2',
              driver: { name: 'Jane Smith', rating: 4.6 },
              origin: { 
                address: 'Koregaon Park, Pune, Maharashtra', 
                lat: 18.5404, 
                lng: 73.8956 
              },
              destination: { 
                address: 'Hinjewadi IT Park, Pune, Maharashtra', 
                lat: 18.5916, 
                lng: 73.7389 
              },
              departure_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              seats_available: 2,
              price_per_seat: 200
            }
          ];
          setDrivers(sampleDrivers);
        } else {
          setDrivers(drivers);
        }
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
      toast.error('Failed to load driver locations');
    } finally {
      setIsLoading(false);
    }
  };

  // Add markers to map
  useEffect(() => {
    if (!map.current || !mapReady || drivers.length === 0) {
      console.log('Map not ready or no drivers:', { 
        mapExists: !!map.current, 
        mapReady, 
        driversCount: drivers.length 
      });
      return;
    }

    console.log('Adding markers for', drivers.length, 'drivers');
    setLoadingRoutes(true);

    // Clear existing markers and routes
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(marker => marker.remove());

    // Remove existing route layers and sources
    drivers.forEach((_, index) => {
      const routeId = `route-${index}`;
      const sourceId = `route-source-${index}`;
      
      if (map.current.getLayer(routeId)) {
        map.current.removeLayer(routeId);
      }
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    });

    const getValidCoordinates = (location: any, fallbackName: string) => {
      if (!location) {
        return null;
      }

      let lat = location.lat || location.latitude;
      let lng = location.lng || location.longitude;

      // If coordinates are in a different format, try to extract them
      if (typeof lat === 'string') lat = parseFloat(lat);
      if (typeof lng === 'string') lng = parseFloat(lng);

      // Validate coordinates
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        return null;
      }

      // Check if coordinates are within reasonable bounds (India)
      if (lat < 6 || lat > 37 || lng < 68 || lng > 97) {
        return null;
      }

      return { lat, lng };
    };

    let routesCompleted = 0;
    const totalRoutes = drivers.filter(driver => {
      const pickupCoords = getValidCoordinates(driver.origin, 'pickup');
      const destCoords = getValidCoordinates(driver.destination, 'destination');
      return pickupCoords && destCoords;
    }).length;

    drivers.forEach((driver, index) => {
      console.log('Processing driver:', driver);
      
      const pickupCoords = getValidCoordinates(driver.origin, 'pickup');
      const destCoords = getValidCoordinates(driver.destination, 'destination');

      // Skip this driver if no valid coordinates
      if (!pickupCoords && !destCoords) {
        console.warn(`Skipping driver ${index} - no valid coordinates`);
        return;
      }

      try {
        // Create pickup marker if valid coordinates
        if (pickupCoords) {
          const pickupEl = document.createElement('div');
          pickupEl.className = 'pickup-marker';
          pickupEl.innerHTML = `
            <div class="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
            </div>
          `;

          const pickupPopup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-gray-800">Pickup Location</h3>
                <p class="text-sm text-gray-600">${driver.origin?.address || 'Unknown Address'}</p>
                <p class="text-xs text-gray-500">Driver: ${driver.driver?.name || 'Unknown'}</p>
              </div>
            `);

          new mapboxgl.Marker(pickupEl)
            .setLngLat([pickupCoords.lng, pickupCoords.lat])
            .setPopup(pickupPopup)
            .addTo(map.current);
        }

        // Create destination marker if valid coordinates
        if (destCoords) {
          const destEl = document.createElement('div');
          destEl.className = 'destination-marker';
          destEl.innerHTML = `
            <div class="w-8 h-8 bg-red-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
            </div>
          `;

          const destPopup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-gray-800">Destination</h3>
                <p class="text-sm text-gray-600">${driver.destination?.address || 'Unknown Address'}</p>
                <p class="text-xs text-gray-500">Driver: ${driver.driver?.name || 'Unknown'}</p>
              </div>
            `);

          new mapboxgl.Marker(destEl)
            .setLngLat([destCoords.lng, destCoords.lat])
            .setPopup(destPopup)
            .addTo(map.current);
        }

        // Create driving route between pickup and destination if both coordinates are valid
        if (pickupCoords && destCoords) {
          const routeId = `route-${index}`;
          const sourceId = `route-source-${index}`;
          
          // Get driving directions using Mapbox Directions API
          const getDrivingRoute = async () => {
            try {
              const start = `${pickupCoords.lng},${pickupCoords.lat}`;
              const end = `${destCoords.lng},${destCoords.lat}`;
              
              const response = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&access_token=${mapboxgl.accessToken}`
              );
              
              const data = await response.json();
              
              if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const routeGeometry = route.geometry;
                
                // Add route source with actual driving directions
                if (!map.current.getSource(sourceId)) {
                  map.current.addSource(sourceId, {
                    type: 'geojson',
                    data: {
                      type: 'Feature',
                      properties: {
                        driver: driver.driver?.name || 'Unknown',
                        driverId: driver.id,
                        duration: Math.round(route.duration / 60), // Duration in minutes
                        distance: Math.round(route.distance / 1000) // Distance in km
                      },
                      geometry: routeGeometry
                    }
                  });

                  // Add route layer with driving directions
                  map.current.addLayer({
                    id: routeId,
                    type: 'line',
                    source: sourceId,
                    layout: {
                      'line-join': 'round',
                      'line-cap': 'round'
                    },
                    paint: {
                      'line-color': index % 2 === 0 ? '#3b82f6' : '#8b5cf6', // Alternate colors
                      'line-width': 4,
                      'line-opacity': 0.8
                    }
                  });

                  // Add route popup on click with driving info
                  map.current.on('click', routeId, (e) => {
                    const coordinates = e.lngLat;
                    const driverName = driver.driver?.name || 'Unknown';
                    const pickupAddress = driver.origin?.address || 'Unknown';
                    const destAddress = driver.destination?.address || 'Unknown';
                    const duration = Math.round(route.duration / 60);
                    const distance = Math.round(route.distance / 1000);
                    
                    new mapboxgl.Popup()
                      .setLngLat(coordinates)
                      .setHTML(`
                        <div class="p-3">
                          <h3 class="font-semibold text-gray-800 mb-2">${driverName}'s Route</h3>
                          <div class="space-y-1 text-sm">
                            <div class="flex items-center space-x-2">
                              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span class="text-gray-600">From: ${pickupAddress}</span>
                            </div>
                            <div class="flex items-center space-x-2">
                              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span class="text-gray-600">To: ${destAddress}</span>
                            </div>
                            <div class="mt-2 pt-2 border-t border-gray-200">
                              <div class="flex justify-between text-xs text-gray-500">
                                <span>⏱️ ${duration} min</span>
                                <span>📏 ${distance} km</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      `)
                      .addTo(map.current);
                  });

                  // Change cursor on hover
                  map.current.on('mouseenter', routeId, () => {
                    map.current!.getCanvas().style.cursor = 'pointer';
                  });

                  map.current.on('mouseleave', routeId, () => {
                    map.current!.getCanvas().style.cursor = '';
                  });
                }
                
                // Mark route as completed
                routesCompleted++;
                if (routesCompleted >= totalRoutes) {
                  setLoadingRoutes(false);
                }
              } else {
                console.warn('No route found for driver', index);
                routesCompleted++;
                if (routesCompleted >= totalRoutes) {
                  setLoadingRoutes(false);
                }
              }
            } catch (error) {
              console.error('Error fetching driving directions for driver', index, ':', error);
              routesCompleted++;
              if (routesCompleted >= totalRoutes) {
                setLoadingRoutes(false);
              }
            }
          };

          // Fetch driving route
          getDrivingRoute();
        }
      } catch (error) {
        console.error('Error adding markers for driver', index, ':', error);
      }
    });
  }, [drivers, mapReady]);

  const formatTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <h1 className="text-lg font-semibold text-white">Live Driver Map</h1>
        <button
          onClick={loadDrivers}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-10">
            <div className="bg-gray-800 rounded-lg p-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-white">Loading drivers...</span>
            </div>
          </div>
        )}

        {/* Route Loading Overlay */}
        {loadingRoutes && (
          <div className="absolute top-4 right-4 bg-gray-800 rounded-lg p-3 flex items-center space-x-2 z-10">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-white text-sm">Loading routes...</span>
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <div className="bg-gray-900 border-t border-gray-700 p-4 max-h-64 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">
            {drivers.length} Active Driver{drivers.length !== 1 ? 's' : ''}
          </h2>
          <div className="text-sm text-gray-400">
            Tap to view details
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {drivers.map((driver, index) => (
            <div
              key={index}
              onClick={() => setSelectedDriver(selectedDriver?.id === driver.id ? null : driver)}
              className={`bg-gray-800 rounded-lg p-3 cursor-pointer transition-colors ${
                selectedDriver?.id === driver.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-700'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-white">
                      {driver.driver?.name || 'Driver'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-400">
                        {driver.driver?.rating || '4.5'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <MapPin className="h-4 w-4 text-green-400" />
                      <span className="truncate">
                        {driver.origin?.address || 'Pickup Location'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-300">
                      <MapPin className="h-4 w-4 text-red-400" />
                      <span className="truncate">
                        {driver.destination?.address || 'Destination'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(driver.departure_time)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{driver.seats_available} seats</span>
                    </div>
                    <div className="text-sm font-medium text-white">
                      ₹{driver.price_per_seat}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {drivers.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Car className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No active drivers found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try refreshing or check back later
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
