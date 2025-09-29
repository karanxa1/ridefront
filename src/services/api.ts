// API Service for backend communication
// Base URL: http://localhost:8000

// Types for API requests and responses
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  success?: boolean;
}

interface LoginRequest {
  username: string; // email
  password: string;
}

interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: 'passenger' | 'driver';
}

interface CreateRideRequest {
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
  departure_time: string;
  seats_available: number;
  price_per_seat: number;
}

interface CreateBookingRequest {
  ride_id: string;
  passenger_id: string;
  seats_booked: number;
}

interface UpdateLocationRequest {
  ride_id: string;
  lat: number;
  lng: number;
}

interface SendMessageRequest {
  ride_id: string;
  sender_id: string;
  message: string;
}

interface SubmitReviewRequest {
  ride_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
}

class ApiService {
  private static readonly BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  private static authToken: string | null = null;

  // Set authentication token
  static setAuthToken(token: string) {
    this.authToken = token;
  }

  // Clear authentication token
  static clearAuthToken() {
    this.authToken = null;
  }

  // Get default headers
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Generic API request method
  static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      console.log(`🌐 Making request to: ${url}`);
      // Log request body safely
      let bodyForLogging = undefined;
      if (config.body) {
        try {
          // Try to parse as JSON first
          bodyForLogging = JSON.parse(config.body as string);
        } catch {
          // If not JSON, show as string (for form-encoded data)
          bodyForLogging = config.body;
        }
      }
      
      console.log('📋 Request config:', {
        method: config.method || 'GET',
        headers: config.headers,
        body: bodyForLogging
      });
      
      const response = await fetch(url, config);
      
      console.log('📡 Response status:', response.status, response.statusText);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('❌ API Error Response:', errorData);
        console.error('❌ Response status:', response.status);
        console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Handle validation errors from FastAPI
        if (errorData.detail && Array.isArray(errorData.detail)) {
          const validationErrors = errorData.detail.map((err: any) => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
          throw new Error(`Validation Error: ${validationErrors}`);
        }
        
        throw new Error(errorData.message || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      console.log('📄 Response Content-Type:', contentType);
      
      // Always get the response as text first to see what we're dealing with
      const textResponse = await response.text();
      console.log('📄 Raw response text:', textResponse);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(textResponse);
        } catch (parseError) {
          console.error('❌ Failed to parse JSON response:', parseError);
          console.log('📄 Raw text that failed to parse:', textResponse);
          throw new Error(`Invalid JSON response: ${textResponse.substring(0, 100)}...`);
        }
      } else {
        // For non-JSON responses, try to parse as JSON anyway
        try {
          data = JSON.parse(textResponse);
        } catch (parseError) {
          console.log('⚠️ Response is not JSON, returning as text');
          data = { message: textResponse, success: true };
        }
      }
      
      console.log('✅ API Success Response:', data);
      return {
        success: true,
        data: data,
        message: data.message || 'Success'
      };
    } catch (error) {
      console.error(`💥 API Request failed: ${endpoint}`, error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      throw error;
    }
  }

  // Authentication Endpoints
  static async signup(data: SignupRequest): Promise<ApiResponse> {
    console.log('Signup request data:', data);
    return this.request('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async login(data: LoginRequest): Promise<ApiResponse> {
    // Convert to form data for OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
  }

  static async getUserProfile(userId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/users/${userId}`);
  }

  // User Management Endpoints
  static async getUser(userId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/users/${userId}`);
  }

  static async updateUser(userId: string, data: any): Promise<ApiResponse> {
    return this.request(`/api/v1/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async getUserReviews(userId: string, page = 1, limit = 20): Promise<ApiResponse> {
    return this.request(`/api/v1/users/${userId}/reviews?page=${page}&limit=${limit}`);
  }

  static async getUserRides(userId: string, role?: string, status?: string): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    const endpoint = `/api/v1/users/${userId}/rides${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  // Ride Management Endpoints
  static async createRide(driverId: string, data: CreateRideRequest): Promise<ApiResponse> {
    console.log('🔧 ApiService.createRide called');
    console.log('🔑 Driver ID:', driverId);
    console.log('📦 Request data:', data);
    console.log('🌐 Endpoint: /api/v1/rides/?driver_id=' + driverId);
    
    try {
      const response = await this.request(`/api/v1/rides/?driver_id=${driverId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      console.log('📡 createRide API response:', response);
      return response;
    } catch (error) {
      console.error('💥 createRide API error:', error);
      throw error;
    }
  }

  static async getRide(rideId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/rides/${rideId}`);
  }

  static async updateRide(rideId: string, driverId: string, data: any): Promise<ApiResponse> {
    return this.request(`/api/v1/rides/${rideId}?driver_id=${driverId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async cancelRide(rideId: string, driverId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/rides/${rideId}?driver_id=${driverId}`, {
      method: 'DELETE',
    });
  }

  static async searchRides(params: {
    origin_lat: number;
    origin_lng: number;
    destination_lat: number;
    destination_lng: number;
    departure_date?: string;
    max_price?: number;
    min_seats?: number;
  }): Promise<ApiResponse> {
    // Use the unified ride offers endpoint instead of the old rides search
    const queryString = new URLSearchParams();
    queryString.append('destination_lat', String(params.destination_lat));
    queryString.append('destination_lng', String(params.destination_lng));
    queryString.append('max_distance', '2.0'); // 2km default
    queryString.append('page', '1');
    queryString.append('limit', '20');
    
    if (params.max_price) {
      queryString.append('max_price', String(params.max_price));
    }
    
    return this.request(`/api/v1/unified-rides/offers?${queryString.toString()}`);
  }

  static async getDriverRides(driverId: string, status?: string, page = 1, limit = 20): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', String(page));
    params.append('limit', String(limit));
    
    return this.request(`/api/v1/rides/driver/${driverId}?${params.toString()}`);
  }

  // Booking Management Endpoints
  static async createBooking(data: CreateBookingRequest): Promise<ApiResponse> {
    return this.request('/api/v1/bookings/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getBooking(bookingId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${bookingId}`);
  }

  static async updateBooking(bookingId: string, passengerId: string, data: any): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${bookingId}?passenger_id=${passengerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async cancelBooking(bookingId: string, passengerId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/bookings/${bookingId}?passenger_id=${passengerId}`, {
      method: 'DELETE',
    });
  }

  static async getPassengerBookings(passengerId: string, status?: string, page = 1, limit = 20): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', String(page));
    params.append('limit', String(limit));
    
    return this.request(`/api/v1/bookings/passenger/${passengerId}?${params.toString()}`);
  }

  // Review & Rating Endpoints
  static async submitReview(data: SubmitReviewRequest): Promise<ApiResponse> {
    return this.request('/api/v1/reviews/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getReview(reviewId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/reviews/${reviewId}`);
  }

  static async getReviewsForUser(userId: string, page = 1, limit = 20): Promise<ApiResponse> {
    return this.request(`/api/v1/reviews/user/${userId}?page=${page}&limit=${limit}`);
  }

  // Mapbox Integration Endpoints
  static async getRoute(params: {
    origin_lat: number;
    origin_lng: number;
    destination_lat: number;
    destination_lng: number;
    profile?: string;
  }): Promise<ApiResponse> {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, String(value));
      }
    });
    
    return this.request(`/api/v1/mapbox/route?${queryString.toString()}`);
  }

  static async getETA(params: {
    origin_lat: number;
    origin_lng: number;
    destination_lat: number;
    destination_lng: number;
  }): Promise<ApiResponse> {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryString.append(key, String(value));
    });
    
    return this.request(`/api/v1/mapbox/eta?${queryString.toString()}`);
  }

  static async geocodeAddress(address: string): Promise<ApiResponse> {
    const params = new URLSearchParams({ address });
    return this.request(`/api/v1/mapbox/geocode?${params.toString()}`);
  }

  // Real-time Location Endpoints
  static async updateDriverLocation(driverId: string, data: UpdateLocationRequest): Promise<ApiResponse> {
    return this.request(`/api/v1/location/update?driver_id=${driverId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getLocationHistory(rideId: string, limit = 50, hours = 24): Promise<ApiResponse> {
    return this.request(`/api/v1/location/ride/${rideId}?limit=${limit}&hours=${hours}`);
  }

  static async getCurrentLocation(rideId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/location/current/${rideId}`);
  }

  static async getDriverActiveRides(driverId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/location/driver/${driverId}/active-rides`);
  }

  // Chat Endpoints
  static async sendMessage(data: SendMessageRequest): Promise<ApiResponse> {
    return this.request('/api/v1/chat/message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getChatHistory(rideId: string, limit = 50, beforeMessageId?: string): Promise<ApiResponse> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (beforeMessageId) {
      params.append('before_message_id', beforeMessageId);
    }
    
    return this.request(`/api/v1/chat/ride/${rideId}?${params.toString()}`);
  }

  static async getUserConversations(userId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/chat/user/${userId}/conversations`);
  }

  static async deleteMessage(messageId: string, userId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/chat/message/${messageId}?user_id=${userId}`, {
      method: 'DELETE',
    });
  }

  // Notification Endpoints
  static async sendNotification(data: {
    token: string;
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<ApiResponse> {
    return this.request('/api/v1/notifications/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async sendMulticastNotification(data: {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<ApiResponse> {
    return this.request('/api/v1/notifications/send-multicast', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async sendTopicNotification(data: {
    topic: string;
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<ApiResponse> {
    return this.request('/api/v1/notifications/send-topic', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async registerFCMToken(userId: string, token: string): Promise<ApiResponse> {
    return this.request(`/api/v1/notifications/register-token?user_id=${userId}&token=${token}`, {
      method: 'POST',
    });
  }
}

export default ApiService;
export type {
  LoginRequest,
  SignupRequest,
  CreateRideRequest,
  CreateBookingRequest,
  UpdateLocationRequest,
  SendMessageRequest,
  SubmitReviewRequest,
};