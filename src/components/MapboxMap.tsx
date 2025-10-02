import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
  center?: [number, number];
  zoom?: number;
  onLocationSelect?: (location: { latitude: number; longitude: number; address: string }) => void;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    color?: string;
    isDriver?: boolean;
  }>;
  showUserLocation?: boolean;
  onMapClick?: (location: { latitude: number; longitude: number }) => void;
  className?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  center = [0, 0],
  zoom = 13,
  onLocationSelect: _onLocationSelect,
  markers = [],
  showUserLocation = true,
  onMapClick,
  className = 'w-full h-96',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: zoom,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Handle map load
      map.current.on('load', () => {
        setIsLoaded(true);
      });

      // Handle map clicks
      if (onMapClick) {
        map.current.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          onMapClick({ latitude: lat, longitude: lng });
        });
      }
    }
  }, []);

  // Update map center when center prop changes
  useEffect(() => {
    if (map.current && isLoaded) {
      map.current.setCenter(center);
    }
  }, [center, isLoaded]);

  // Get user's current location
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });

          if (map.current) {
            map.current.setCenter([longitude, latitude]);
            map.current.setZoom(15);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [showUserLocation]);

  // Add markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapbox-marker');
    existingMarkers.forEach((marker) => marker.remove());

    // Add user location marker
    if (userLocation) {
      const userMarker = new mapboxgl.Marker({
        color: '#3B82F6',
        scale: 1.2,
      })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(map.current);

      // Add popup for user location
      userMarker.setPopup(
        new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-blue-600">Your Location</h3>
            <p class="text-sm text-gray-600">Current position</p>
          </div>
        `)
      );
    }

    // Add other markers
    markers.forEach((marker) => {
      const markerElement = document.createElement('div');
      markerElement.className = 'mapbox-marker';
      markerElement.style.width = '30px';
      markerElement.style.height = '30px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.backgroundColor =
        marker.color || (marker.isDriver ? '#10B981' : '#EF4444');
      markerElement.style.border = '3px solid white';
      markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      markerElement.style.cursor = 'pointer';

      const mapMarker = new mapboxgl.Marker(markerElement)
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(map.current!);

      if (marker.title) {
        mapMarker.setPopup(
          new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${marker.title}</h3>
              <p class="text-sm text-gray-600">${marker.isDriver ? 'Driver' : 'Location'}</p>
            </div>
          `)
        );
      }
    });
  }, [markers, userLocation, isLoaded]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
