// User types
export interface User {
  uid: string;
  email: string;
  name: string;
  profile_pic?: string;
  vehicle_info?: VehicleInfo;
  rating: number;
  created_at: Date;
  updated_at: Date;
  fcm_token?: string;
  phone?: string;
  bio?: string;
  location?: string;
  emergency_contact?: string;
  role?: 'driver' | 'passenger';
  verified?: boolean;
  total_ratings?: number;
  total_rides?: number;
  settings?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
    location_sharing: boolean;
  };
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  seats: number;
}

// Location type
export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

// Ride types
export interface Ride {
  ride_id: string;
  id?: string;
  driver_id: string;
  origin: Location;
  destination: Location;
  departure_time: Date;
  seats_available: number;
  available_seats?: number;
  total_seats?: number;
  price_per_seat: number;
  status: 'active' | 'cancelled' | 'completed' | 'in_progress';
  created_at: Date;
  updated_at: Date;
  driver?: User;
  passengers?: User[];
  pickup_location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
  vehicle_info?: VehicleInfo;
  driver_rating?: number;
  description?: string;
}

// Booking types
export interface Booking {
  booking_id: string;
  ride_id: string;
  passenger_id: string;
  seats_booked: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
  ride?: Ride;
  passenger?: User;
}

// Review types
export interface Review {
  review_id: string;
  ride_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: Date;
}

// Real-time types
export interface DriverLocation {
  location_id: string;
  ride_id: string;
  driver_id: string;
  lat: number;
  lng: number;
  timestamp: Date;
}

export interface ChatMessage {
  message_id: string;
  id?: string;
  ride_id: string;
  sender_id: string;
  message: string;
  content?: string;
  sender_name: string;
  is_from_driver: boolean;
  timestamp: Date;
}

// Auth types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  role: 'driver' | 'passenger';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Search filters
export interface RideSearchFilters {
  origin?: Location;
  destination?: Location;
  departure_date?: Date;
  departure_time?: Date;
  min_seats?: number;
  seats_needed?: number;
  max_price?: number;
  min_rating?: number;
  pickup_location?: Location;
}

// Form types
export interface CreateRideForm {
  origin: Location;
  destination: Location;
  departure_time: Date;
  seats_available: number;
  price_per_seat: number;
}

export interface ProfileSetupForm {
  name: string;
  profile_pic?: File;
  vehicle_info?: VehicleInfo;
}

// Navigation types
export interface RouteParams {
  rideId?: string;
  bookingId?: string;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

// Map types
export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface RouteInfo {
  distance: number;
  duration: number;
  geometry: any;
}

// Store types
export interface AppState {
  auth: AuthState;
  rides: Ride[];
  bookings: Booking[];
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

// Location data type
export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

// Place data type
export interface PlaceData {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

// Ride offer response
export interface RideOfferResponse {
  ride_id: string;
  driver_id: string;
  origin: Location;
  destination: Location;
  departure_time: Date;
  seats_available: number;
  price_per_seat: number;
  status: string;
  driver: User;
  vehicle_info?: VehicleInfo;
}

// Ride request response
export interface RideRequestResponse {
  request_id: string;
  passenger_id: string;
  origin: Location;
  destination: Location;
  departure_time: Date;
  seats_needed: number;
  max_price: number;
  status: string;
  passenger: User;
}

// Types are already exported above, no need for explicit re-exports