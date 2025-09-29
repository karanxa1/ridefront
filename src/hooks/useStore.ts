import { create } from 'zustand';
import { AuthService } from '../services/auth';
import ApiService from '../services/api';

// Define types locally to avoid import issues
interface User {
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

interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  seats: number;
}

interface Location {
  lat: number;
  lng: number;
  address?: string;
}

interface Ride {
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

interface Booking {
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

interface DriverLocation {
  location_id: string;
  ride_id: string;
  driver_id: string;
  lat: number;
  lng: number;
  timestamp: Date;
}

interface ChatMessage {
  message_id: string;
  ride_id: string;
  sender_id: string;
  message: string;
  sender_name: string;
  is_from_driver: boolean;
  timestamp: Date;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface RideState {
  currentRide: Ride | null;
  activeBooking: Booking | null;
  nearbyDrivers: DriverLocation[];
  rideHistory: Ride[];
  isSearching: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  unreadCount: number;
  isTyping: boolean;
}

interface AppState {
  notifications: Notification[];
  isOnline: boolean;
  theme: 'light' | 'dark';
  mapViewport: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
}

interface StoreState extends AuthState, RideState, ChatState, AppState {
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (credentials: any) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  unsubscribe?: () => void;
  
  // Ride actions
  createRide: (rideData: any) => Promise<string>;
  searchRides: (filters: any) => Promise<void>;
  getRideById: (rideId: string) => Promise<Ride>;
  getDriverLocation: (rideId: string) => Promise<DriverLocation>;
  bookRide: (rideId: string, seatsToBook: number) => Promise<Booking>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  getBooking: (bookingId: string) => Promise<Booking>;
  getUserBookings: (status?: string) => Promise<Booking[]>;
  availableRides: Ride[];
  setCurrentRide: (ride: Ride | null) => void;
  setActiveBooking: (booking: Booking | null) => void;
  setNearbyDrivers: (drivers: DriverLocation[]) => void;
  addToRideHistory: (ride: Ride) => void;
  setSearching: (searching: boolean) => void;
  
  // Chat actions
  getChatMessages: (rideId: string) => Promise<ChatMessage[]>;
  sendMessage: (rideId: string, message: string) => Promise<any>;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  markMessagesAsRead: () => void;
  setTyping: (typing: boolean) => void;
  
  // App actions
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setOnlineStatus: (online: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setMapViewport: (viewport: { latitude: number; longitude: number; zoom: number }) => void;
  
  // Initialize store
  initialize: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  
  currentRide: null,
  activeBooking: null,
  nearbyDrivers: [],
  rideHistory: [],
  availableRides: [],
  isSearching: false,
  
  messages: [],
  unreadCount: 0,
  isTyping: false,
  
  notifications: [],
  isOnline: navigator.onLine,
  theme: 'light',
  mapViewport: {
    latitude: 40.7128,
    longitude: -74.0060,
    zoom: 13,
  },
  
  // Auth actions
  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.signIn({ email, password });
      console.log('🔐 signIn result:', user);
      set({ 
        user, 
        isAuthenticated: !!user, 
        isLoading: false,
        error: null 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Sign in failed',
        isLoading: false 
      });
      throw error;
    }
  },
  
  signUp: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await AuthService.signUp(credentials);
      console.log('🔐 signUp result:', user);
      set({ 
        user, 
        isAuthenticated: !!user, 
        isLoading: false,
        error: null 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Sign up failed',
        isLoading: false 
      });
      throw error;
    }
  },
  
  signOut: async () => {
    set({ isLoading: true });
    try {
      // Clean up auth listener
      const { unsubscribe } = get();
      if (unsubscribe) {
        unsubscribe();
      }
      
      await AuthService.signOut();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null,
        currentRide: null,
        activeBooking: null,
        messages: [],
        unreadCount: 0,
        unsubscribe: undefined,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Sign out failed',
        isLoading: false 
      });
    }
  },
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false 
  }),
  
  setAuthLoading: (loading) => set({ isLoading: loading }),
  
  setAuthError: (error) => set({ error }),
  
  // Ride actions
  createRide: async (rideData) => {
    console.log('🚗 createRide called with data:', rideData);
    
    const { user, isAuthenticated } = get();
    console.log('👤 Current user:', user);
    console.log('🔐 Is authenticated:', isAuthenticated);
    console.log('💾 localStorage currentUser:', localStorage.getItem('currentUser'));
    console.log('💾 localStorage authToken:', localStorage.getItem('authToken'));
    
    if (!user) {
      console.error('❌ User not authenticated');
      console.error('❌ Authentication state:', { user, isAuthenticated });
      throw new Error('User not authenticated');
    }
    
    if (!user.uid) {
      console.error('❌ User has no uid:', user);
      throw new Error('User has no uid');
    }
    
    console.log('🔑 Using user.uid:', user.uid);
    console.log('📊 User role:', user.role);
    
    const requestData = {
      origin: {
        lat: rideData.pickup_location.latitude || 0,
        lng: rideData.pickup_location.longitude || 0
      },
      destination: {
        lat: rideData.destination.latitude || 0,
        lng: rideData.destination.longitude || 0
      },
      departure_time: rideData.departure_time,
      seats_available: rideData.available_seats,
      price_per_seat: rideData.price_per_seat
    };
    
    console.log('📤 Sending request data:', requestData);
    console.log('🌐 API endpoint: /api/v1/rides/?driver_id=' + user.uid);
    
    try {
      const response = await ApiService.createRide(user.uid, requestData);
      console.log('✅ API response:', response);
      
      if (response.success && response.data) {
        console.log('🎉 Ride created successfully with ID:', response.data.ride_id);
        return response.data.ride_id;
      }
      
      console.error('❌ API response indicates failure:', response);
      throw new Error(response.message || 'Failed to create ride');
    } catch (error) {
      console.error('💥 createRide error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  },
  
  searchRides: async (filters) => {
    set({ isSearching: true });
    try {
      const response = await ApiService.searchRides({
        origin_lat: 0, // These would come from geocoding the addresses
        origin_lng: 0,
        destination_lat: 0,
        destination_lng: 0,
        departure_date: filters.departure_date,
        max_price: filters.max_price,
        min_seats: filters.seats_needed
      });
      
      if (response.success && response.data) {
        set({ availableRides: response.data.rides || [] });
      } else {
        set({ availableRides: [] });
      }
    } catch (error) {
      set({ availableRides: [] });
      throw error;
    } finally {
      set({ isSearching: false });
    }
  },
  
  getRideById: async (rideId) => {
    try {
      const response = await ApiService.getRide(rideId);
      if (response.success && response.data) {
        const d: any = response.data as any;

        const origin = d.origin || {};
        const destination = d.destination || {};

        const pickupAddress = origin.address
          || (origin.lat !== undefined && origin.lng !== undefined
              ? `${origin.lat}, ${origin.lng}`
              : 'Pickup');
        const destinationAddress = destination.address
          || (destination.lat !== undefined && destination.lng !== undefined
              ? `${destination.lat}, ${destination.lng}`
              : 'Destination');

        const driver = d.driver || {};
        const vehicleInfo = d.vehicle_info || driver.vehicle_info || {};

        const uiRide: any = {
          id: d.ride_id || d.id || rideId,
          ride_id: d.ride_id || d.id || rideId,
          driver_id: d.driver_id || driver.uid,
          pickup_location: {
            address: pickupAddress,
            latitude: origin.lat,
            longitude: origin.lng,
          },
          destination: {
            address: destinationAddress,
            latitude: destination.lat,
            longitude: destination.lng,
          },
          origin,
          price_per_seat: d.price_per_seat ?? d.price ?? 0,
          departure_time: d.departure_time ? new Date(d.departure_time) : new Date(),
          available_seats: d.available_seats ?? d.seats_available ?? vehicleInfo.seats ?? 0,
          total_seats: d.total_seats ?? vehicleInfo.seats ?? d.seats_available ?? d.available_seats ?? 0,
          status: d.status || 'active',
          created_at: d.created_at ? new Date(d.created_at) : new Date(),
          updated_at: d.updated_at ? new Date(d.updated_at) : new Date(),
          driver: {
            uid: driver.uid || d.driver_id,
            name: driver.name || 'Driver',
            profile_pic: driver.profile_pic,
            rating: driver.rating || 0,
            created_at: driver.created_at ? new Date(driver.created_at) : new Date(),
            updated_at: driver.updated_at ? new Date(driver.updated_at) : new Date(),
            email: driver.email,
            vehicle_info: vehicleInfo,
          },
          driver_rating: driver.rating,
          vehicle_info: vehicleInfo,
          description: d.description || '',
        };

        return uiRide;
      }
      throw new Error(response.message || 'Failed to get ride');
    } catch (error) {
      throw error;
    }
  },

  getDriverLocation: async (rideId) => {
    try {
      const response = await ApiService.getCurrentLocation(rideId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get driver location');
    } catch (error) {
      throw error;
    }
  },

  // Booking actions
  bookRide: async (rideId, seatsToBook) => {
    const { user } = get();
    if (!user) throw new Error('User not authenticated');
    
    try {
      const response = await ApiService.createBooking({
        ride_id: rideId,
        passenger_id: user.uid,
        seats_booked: seatsToBook
      });
      
      if (response.success && response.data) {
        // Update active booking in state
        set({ activeBooking: response.data });
        return response.data;
      }
      throw new Error(response.message || 'Failed to book ride');
    } catch (error) {
      throw error;
    }
  },

  cancelBooking: async (bookingId) => {
    const { user } = get();
    if (!user) throw new Error('User not authenticated');
    
    try {
      const response = await ApiService.cancelBooking(bookingId, user.uid);
      
      if (response.success) {
        // Clear active booking if it was cancelled
        const { activeBooking } = get();
        if (activeBooking && activeBooking.booking_id === bookingId) {
          set({ activeBooking: null });
        }
        return true;
      }
      throw new Error(response.message || 'Failed to cancel booking');
    } catch (error) {
      throw error;
    }
  },

  getBooking: async (bookingId) => {
    try {
      const response = await ApiService.getBooking(bookingId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get booking');
    } catch (error) {
      throw error;
    }
  },

  getUserBookings: async (status) => {
    const { user } = get();
    if (!user) throw new Error('User not authenticated');
    
    try {
      const response = await ApiService.getPassengerBookings(user.uid, status);
      if (response.success && response.data) {
        return response.data.bookings || [];
      }
      return [];
    } catch (error) {
      throw error;
    }
  },
  
  setCurrentRide: (ride) => set({ currentRide: ride }),
  
  setActiveBooking: (booking) => set({ activeBooking: booking }),
  
  setNearbyDrivers: (drivers) => set({ nearbyDrivers: drivers }),
  
  addToRideHistory: (ride) => set((state) => ({
    rideHistory: [ride, ...state.rideHistory]
  })),
  
  setSearching: (searching) => set({ isSearching: searching }),
  
  // Chat actions
  getChatMessages: async (rideId) => {
    try {
      const response = await ApiService.getChatHistory(rideId);
      if (response.success && response.data) {
        return response.data.messages || [];
      }
      return [];
    } catch (error) {
      throw error;
    }
  },

  sendMessage: async (rideId, message) => {
    const { user } = get();
    if (!user) throw new Error('User not authenticated');
    
    try {
      const response = await ApiService.sendMessage({
        ride_id: rideId,
        sender_id: user.uid,
        message: message
      });
      
      if (response.success && response.data) {
        // Add message to local state
        const newMessage = {
          message_id: response.data.message_id,
          ride_id: rideId,
          sender_id: user.uid,
          message: message,
          sender_name: user.name,
          is_from_driver: false, // No role distinction in unified system
          timestamp: new Date()
        };
        get().addMessage(newMessage);
        return response.data;
      }
      throw new Error(response.message || 'Failed to send message');
    } catch (error) {
      throw error;
    }
  },

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
    unreadCount: message.sender_id !== state.user?.uid 
      ? state.unreadCount + 1 
      : state.unreadCount
  })),
  
  setMessages: (messages) => set({ messages }),
  
  markMessagesAsRead: () => set({ unreadCount: 0 }),
  
  setTyping: (typing) => set({ isTyping: typing }),
  
  // App actions
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  setOnlineStatus: (online) => set({ isOnline: online }),
  
  setTheme: (theme) => set({ theme }),
  
  setMapViewport: (viewport) => set({ mapViewport: viewport }),
  
  // Initialize store
  initialize: async () => {
    console.log('🚀 useStore initialize called');
    set({ isLoading: true });
    
    // Check localStorage before setting up auth listener
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    console.log('💾 Initial localStorage check:', { 
      hasUser: !!storedUser, 
      hasToken: !!storedToken,
      user: storedUser ? JSON.parse(storedUser) : null
    });
    
    // Set up auth state listener
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      console.log('🔄 Auth state changed:', user ? 'User logged in' : 'User logged out');
      console.log('👤 Auth state user:', user);
      get().setUser(user);
    });
    
    // Store unsubscribe function for cleanup
    set({ unsubscribe });
    
    // Set up online/offline listeners
    const handleOnline = () => get().setOnlineStatus(true);
    const handleOffline = () => get().setOnlineStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      set({ theme: savedTheme });
    }
    
    // Get user's location for map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          set({
            mapViewport: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              zoom: 13,
            }
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  },
}));

// Persist theme changes to localStorage
useStore.subscribe(
  (state) => state.theme,
  (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
);