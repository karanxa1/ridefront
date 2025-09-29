/**
 * Unified Rides Service
 * Handles both offering and requesting rides
 */

import ApiService from './api';

export interface RideOffer {
  destination_address: string;
  destination_latitude: number;
  destination_longitude: number;
  departure_time: string;
  seats_available: number;
  price_per_seat: number;
}

export interface RideRequest {
  destination_address: string;
  destination_latitude: number;
  destination_longitude: number;
  departure_time: string;
  seats_needed: number;
  max_price_per_seat: number;
}

export interface RideOfferResponse {
  ride_id: string;
  user_id: string;
  ride_type: 'offer';
  origin: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    address: string;
    latitude: number;
    longitude: number;
  };
  departure_time: string;
  seats_available: number;
  price_per_seat: number;
  status: string;
  driver_name: string;
  driver_rating: number;
  distance_to_destination: number;
}

export interface RideRequestResponse {
  ride_id: string;
  user_id: string;
  ride_type: 'request';
  origin: {
    address: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    address: string;
    latitude: number;
    longitude: number;
  };
  departure_time: string;
  seats_needed: number;
  max_price_per_seat: number;
  status: string;
  passenger_name: string;
  passenger_rating: number;
  distance_to_destination: number;
}

class UnifiedRidesService {
  /**
   * Create a ride offer (user offers to drive)
   */
  static async createRideOffer(
    rideData: RideOffer,
    userId: string,
    currentLatitude: number,
    currentLongitude: number
  ): Promise<{ data: { ride_id: string; message: string }; success: boolean; message: string }> {
    const params = new URLSearchParams({
      user_id: userId,
      current_latitude: currentLatitude.toString(),
      current_longitude: currentLongitude.toString()
    });

    return ApiService.request(`/api/v1/unified-rides/offer?${params}`, {
      method: 'POST',
      body: JSON.stringify(rideData)
    });
  }

  /**
   * Create a ride request (user requests a ride)
   */
  static async createRideRequest(
    rideData: RideRequest,
    userId: string,
    currentLatitude: number,
    currentLongitude: number
  ): Promise<{ data: { ride_id: string; message: string }; success: boolean; message: string }> {
    const params = new URLSearchParams({
      user_id: userId,
      current_latitude: currentLatitude.toString(),
      current_longitude: currentLongitude.toString()
    });

    return ApiService.request(`/api/v1/unified-rides/request?${params}`, {
      method: 'POST',
      body: JSON.stringify(rideData)
    });
  }

  /**
   * Get available ride offers near destination
   */
  static async getRideOffers(
    destinationLat: number,
    destinationLng: number,
    maxDistance: number = 2.0,
    maxPrice?: number,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    rides: RideOfferResponse[];
    total_count: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams({
      destination_lat: destinationLat.toString(),
      destination_lng: destinationLng.toString(),
      max_distance: maxDistance.toString(),
      page: page.toString(),
      limit: limit.toString()
    });

    if (maxPrice) {
      params.append('max_price', maxPrice.toString());
    }

    return ApiService.request(`/api/v1/unified-rides/offers?${params}`);
  }

  /**
   * Get available ride requests near destination
   */
  static async getRideRequests(
    destinationLat: number,
    destinationLng: number,
    maxDistance: number = 2.0,
    minPrice: number = 0,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    rides: RideRequestResponse[];
    total_count: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams({
      destination_lat: destinationLat.toString(),
      destination_lng: destinationLng.toString(),
      max_distance: maxDistance.toString(),
      min_price: minPrice.toString(),
      page: page.toString(),
      limit: limit.toString()
    });

    return ApiService.request(`/api/v1/unified-rides/requests?${params}`);
  }

  /**
   * Get user's rides (both offers and requests)
   */
  static async getUserRides(
    userId: string,
    rideType?: 'offer' | 'request',
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    rides: (RideOfferResponse | RideRequestResponse)[];
    total_count: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (rideType) {
      params.append('ride_type', rideType);
    }

    if (status) {
      params.append('status', status);
    }

    return ApiService.request(`/api/v1/unified-rides/user/${userId}?${params}`);
  }

  /**
   * Update a ride
   */
  static async updateRide(
    rideId: string,
    rideUpdate: Partial<RideOffer> | Partial<RideRequest>,
    userId: string
  ): Promise<{ message: string; updated_fields: string[] }> {
    const params = new URLSearchParams({
      user_id: userId
    });

    return ApiService.request(`/api/v1/unified-rides/${rideId}?${params}`, {
      method: 'PUT',
      body: JSON.stringify(rideUpdate)
    });
  }

  /**
   * Cancel a ride
   */
  static async cancelRide(
    rideId: string,
    userId: string
  ): Promise<{ message: string }> {
    const params = new URLSearchParams({
      user_id: userId
    });

    return ApiService.request(`/api/v1/unified-rides/${rideId}?${params}`, {
      method: 'DELETE'
    });
  }
}

export default UnifiedRidesService;
