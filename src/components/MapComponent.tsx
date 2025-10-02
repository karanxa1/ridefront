import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Zap } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  center: Location;
  zoom?: number;
  markers?: {
    id: string;
    position: Location;
    title: string;
    type: 'pickup' | 'dropoff' | 'driver' | 'passenger';
    icon?: string;
  }[];
  route?: Location[];
  onLocationSelect?: (location: Location) => void;
  className?: string;
  interactive?: boolean;
}

export function MapComponent({
  center,
  zoom: _zoom = 13,
  markers = [],
  route = [],
  onLocationSelect,
  className = '',
  interactive = true
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock implementation - in a real app, this would integrate with Mapbox GL JS
  useEffect(() => {
    if (!mapRef.current) return;

    // Simulate map loading
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'pickup':
        return (
          <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
            <MapPin className="h-4 w-4" />
          </div>
        );
      case 'dropoff':
        return (
          <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
            <MapPin className="h-4 w-4" />
          </div>
        );
      case 'driver':
        return (
          <div className="bg-blue-500 text-white p-2 rounded-full shadow-lg animate-pulse">
            <Navigation className="h-4 w-4" />
          </div>
        );
      case 'passenger':
        return (
          <div className="bg-purple-500 text-white p-2 rounded-full shadow-lg">
            <MapPin className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-500 text-white p-2 rounded-full shadow-lg">
            <MapPin className="h-4 w-4" />
          </div>
        );
    }
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onLocationSelect) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Mock coordinate conversion - in a real app, this would convert pixel coordinates to lat/lng
    const mockLat = center.lat + (y - rect.height / 2) * 0.001;
    const mockLng = center.lng + (x - rect.width / 2) * 0.001;
    
    onLocationSelect({ lat: mockLat, lng: mockLng });
  };

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Zap className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setMapLoaded(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Mock Map Container */}
      <div
        ref={mapRef}
        onClick={handleMapClick}
        className={`w-full h-full relative ${
          interactive ? 'cursor-crosshair' : 'cursor-default'
        }`}
        style={{
          backgroundImage: `linear-gradient(45deg, #f0f9ff 25%, transparent 25%), 
                           linear-gradient(-45deg, #f0f9ff 25%, transparent 25%), 
                           linear-gradient(45deg, transparent 75%, #f0f9ff 75%), 
                           linear-gradient(-45deg, transparent 75%, #f0f9ff 75%)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      >
        {!mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Map Grid Pattern */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Route Path */}
            {route.length > 1 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d={`M ${route.map((_, i) => `${100 + i * 50} ${150 + i * 30}`).join(' L ')}`}
                  stroke="#3b82f6"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              </svg>
            )}

            {/* Markers */}
            {markers.map((marker, index) => (
              <div
                key={marker.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  left: `${50 + (index * 20)}%`,
                  top: `${40 + (index * 15)}%`
                }}
                title={marker.title}
              >
                {getMarkerIcon(marker.type)}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                  <div className="bg-white px-2 py-1 rounded shadow-lg text-xs font-medium text-gray-900 whitespace-nowrap">
                    {marker.title}
                  </div>
                </div>
              </div>
            ))}

            {/* Center Marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-blue-800 rounded-full"></div>
            </div>

            {/* Mock Street Names */}
            <div className="absolute top-4 left-4 bg-white px-2 py-1 rounded shadow text-xs font-medium text-gray-700">
              Main Street
            </div>
            <div className="absolute bottom-4 right-4 bg-white px-2 py-1 rounded shadow text-xs font-medium text-gray-700">
              Campus Drive
            </div>
          </>
        )}
      </div>

      {/* Map Controls */}
      {interactive && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={() => console.log('Zoom in')}
            className="bg-white hover:bg-gray-50 border border-gray-300 rounded p-2 shadow-sm transition-colors"
            title="Zoom in"
          >
            <span className="text-lg font-bold text-gray-700">+</span>
          </button>
          <button
            onClick={() => console.log('Zoom out')}
            className="bg-white hover:bg-gray-50 border border-gray-300 rounded p-2 shadow-sm transition-colors"
            title="Zoom out"
          >
            <span className="text-lg font-bold text-gray-700">−</span>
          </button>
        </div>
      )}

      {/* Attribution */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
        © Mock Map Service
      </div>
    </div>
  );
}