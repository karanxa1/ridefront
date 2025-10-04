import ApiService, { type LoginRequest, type SignupRequest, type ApiResponse } from './api';
import { type User, type SignupCredentials, type LoginCredentials } from '../types';
import { getErrorMessage } from '../utils';

// Auth service class
export class AuthService {
  private static currentUser: User | null = null;
  private static authToken: string | null = null;

  // Sign up with email and password
  static async signUp(credentials: SignupCredentials): Promise<User> {
    try {
      const signupData: SignupRequest = {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        phone: credentials.phone,
      };

      const response: ApiResponse = await ApiService.signup(signupData);

      if (response.error) {
        throw new Error(response.error);
      }

      // Store auth token if provided
      if (response.data?.token) {
        this.authToken = response.data.token;
        if (this.authToken) {
          ApiService.setAuthToken(this.authToken);
          localStorage.setItem('authToken', this.authToken);
        }
      }

      // Store user data
      if (response.data?.user) {
        this.currentUser = response.data.user;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      }

      return this.currentUser || response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Sign in with email and password
  static async signIn(credentials: LoginCredentials): Promise<User> {
    try {
      const loginData: LoginRequest = {
        username: credentials.email, // API expects username field
        password: credentials.password,
      };

      const response: ApiResponse = await ApiService.login(loginData);

      if (response.error) {
        throw new Error(response.error);
      }

      // Store auth token
      if (response.data?.access_token) {
        this.authToken = response.data.access_token;
        if (this.authToken) {
          ApiService.setAuthToken(this.authToken);
          localStorage.setItem('authToken', this.authToken);
        }
      }

      // Get user profile data using the user_id from login response
      if (response.data?.user_id) {
        console.log('🔍 Getting user profile for user_id:', response.data.user_id);
        const profileResponse = await ApiService.getUserProfile(response.data.user_id);
        console.log('👤 Profile response:', profileResponse);
        if (profileResponse.data) {
          this.currentUser = profileResponse.data;
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          console.log('✅ User profile stored:', this.currentUser);
        } else {
          console.error('❌ No user data in profile response');
        }
      } else {
        console.error('❌ No user_id in login response:', response.data);
      }

      console.log('🔐 signIn returning:', this.currentUser || response.data);
      return this.currentUser || response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Sign in with Google (placeholder - would need OAuth implementation)
  static async signInWithGoogle(): Promise<User> {
    throw new Error('Google sign-in not implemented with backend API yet');
  }

  // Complete Google sign-up with role selection
  static async completeGoogleSignUp(_role: 'driver' | 'passenger'): Promise<User> {
    throw new Error('Google sign-up not implemented with backend API yet');
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');

      // Clear service state
      this.authToken = null;
      this.currentUser = null;
      ApiService.clearAuthToken();
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Reset password (placeholder - would need backend implementation)
  static async resetPassword(_email: string): Promise<void> {
    throw new Error('Password reset not implemented with backend API yet');
  }

  // Get current user data
  static async getCurrentUser(): Promise<User | null> {
    console.log('getCurrentUser called');

    // Check if user is already loaded
    if (this.currentUser) {
      console.log('User already loaded:', this.currentUser);
      return this.currentUser;
    }

    // Try to load from localStorage
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');

    console.log('Stored user:', storedUser ? 'exists' : 'null');
    console.log('Stored token:', storedToken ? 'exists' : 'null');

    if (storedUser && storedToken) {
      try {
        this.currentUser = JSON.parse(storedUser);
        this.authToken = storedToken;
        ApiService.setAuthToken(this.authToken);

        console.log('Parsed user:', this.currentUser);
        console.log('Set auth token:', this.authToken);

        // Verify token is still valid by fetching fresh user data
        if (this.currentUser && this.currentUser.uid) {
          try {
            console.log('Fetching user profile for uid:', this.currentUser.uid);
            const response = await ApiService.getUserProfile(this.currentUser.uid);
            console.log('User profile response:', response);

            if (response.data) {
              this.currentUser = response.data;
              localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
              console.log('Updated user profile:', this.currentUser);
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            // Don't clear data on first failure, just log the error
            console.log('Token validation failed, but keeping stored user data');
          }
        }

        return this.currentUser;
      } catch (error) {
        console.error('Error validating stored user:', error);
        // Clear invalid stored data
        this.signOut();
        return null;
      }
    }

    console.log('No stored user or token found');
    return null;
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const response = await ApiService.updateUser(userId, updates);

      if (response.error) {
        throw new Error(response.error);
      }

      // Update local user data if this is the current user
      if (this.currentUser && this.currentUser.uid === userId) {
        this.currentUser = { ...this.currentUser, ...updates };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      }
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // Get auth token
  static getAuthToken(): string | null {
    return this.authToken;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.authToken && !!this.currentUser;
  }

  // Auth state observer (simplified for API-based auth)
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    console.log('onAuthStateChanged called');

    // For API-based auth, we'll just call the callback with current user
    // In a real implementation, you might want to set up periodic token validation
    this.getCurrentUser()
      .then((user) => {
        console.log('getCurrentUser resolved with:', user);
        callback(user);
      })
      .catch((error) => {
        console.error('getCurrentUser failed:', error);
        callback(null);
      });

    // Also set up a listener for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Storage change detected:', e.key);
      if (e.key === 'currentUser' || e.key === 'authToken') {
        this.getCurrentUser()
          .then((user) => {
            console.log('Storage change - getCurrentUser resolved with:', user);
            callback(user);
          })
          .catch((error) => {
            console.error('Storage change - getCurrentUser failed:', error);
            callback(null);
          });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Return unsubscribe function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }
}
