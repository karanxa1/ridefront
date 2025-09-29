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
  driver_id: string;
  origin: Location;
  destination: Location;
  departure_time: Date;
  seats_available: number;
  price_per_seat: number;
  status: 'active' | 'cancelled' | 'completed';
  created_at: Date;
  updated_at: Date;
  driver?: User;
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
  ride_id: string;
  sender_id: string;
  message: string;
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
  min_seats?: number;
  max_price?: number;
  min_rating?: number;
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

// Explicit exports to ensure proper module resolution
export type { Location, LoginCredentials, SignupCredentials, User };