#!/usr/bin/env python3
"""
Test all endpoints on the deployed Heroku app
"""

import requests
import json

BASE_URL = "https://sihrun-8291e677bb29.herokuapp.com"

def test_endpoint(method, endpoint, description="", data=None, params=None):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method.upper() == "GET":
            response = requests.get(url, params=params, timeout=10)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, timeout=10)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, timeout=10)
        elif method.upper() == "DELETE":
            response = requests.delete(url, timeout=10)
        else:
            return f"❌ {description}: Unsupported method {method}"
        
        if response.status_code == 200:
            try:
                json_data = response.json()
                return f"✅ {description}: {response.status_code} - {json_data}"
            except:
                return f"✅ {description}: {response.status_code} - {response.text[:100]}"
        elif response.status_code == 404:
            return f"⚠️  {description}: {response.status_code} - Not Found"
        elif response.status_code == 405:
            return f"⚠️  {description}: {response.status_code} - Method Not Allowed"
        elif response.status_code == 422:
            return f"⚠️  {description}: {response.status_code} - Validation Error"
        elif response.status_code == 503:
            return f"❌ {description}: {response.status_code} - Service Unavailable"
        else:
            return f"⚠️  {description}: {response.status_code} - {response.text[:100]}"
    except requests.exceptions.RequestException as e:
        return f"❌ {description}: Connection error - {str(e)[:100]}"

def main():
    print("🧪 Testing Heroku App Endpoints")
    print("=" * 50)
    
    # Test core endpoints
    print("\n📋 Core Endpoints:")
    print(test_endpoint("GET", "/", "Root endpoint"))
    print(test_endpoint("GET", "/health", "Health check"))
    print(test_endpoint("GET", "/docs", "API Documentation"))
    print(test_endpoint("GET", "/api/v1/openapi.json", "OpenAPI JSON"))
    
    # Test authentication endpoints
    print("\n🔐 Authentication Endpoints:")
    print(test_endpoint("POST", "/api/v1/auth/signup", "Signup", {
        "email": "heroku_test@example.com",
        "password": "testpass123",
        "name": "Heroku Test User",
        "phone": "+919876543210"
    }))
    print(test_endpoint("POST", "/api/v1/auth/login", "Login", {
        "username": "heroku_test@example.com",
        "password": "testpass123"
    }))
    print(test_endpoint("POST", "/api/v1/auth/verify-token", "Verify Token", params={"token": "test_token"}))
    print(test_endpoint("GET", "/api/v1/auth/profile/test_user_id", "Get User Profile"))
    
    # Test user endpoints
    print("\n👥 User Endpoints:")
    print(test_endpoint("GET", "/api/v1/users/test_user_id", "Get User Profile"))
    print(test_endpoint("PUT", "/api/v1/users/test_user_id", "Update User Profile", {"name": "Updated Name"}))
    print(test_endpoint("GET", "/api/v1/users/test_user_id/reviews", "Get User Reviews"))
    print(test_endpoint("GET", "/api/v1/users/test_user_id/rides", "Get User Rides"))
    
    # Test unified rides endpoints
    print("\n🚗 Unified Rides Endpoints:")
    print(test_endpoint("GET", "/api/v1/unified-rides/offers", "Get Ride Offers", params={
        "destination_lat": 28.6139,
        "destination_lng": 77.2090
    }))
    print(test_endpoint("GET", "/api/v1/unified-rides/requests", "Get Ride Requests", params={
        "destination_lat": 28.6139,
        "destination_lng": 77.2090
    }))
    print(test_endpoint("GET", "/api/v1/unified-rides/user/test_user", "Get User Rides"))
    
    # Test individual rides endpoint
    print("\n🚗 Individual Rides Endpoints:")
    print(test_endpoint("GET", "/api/v1/rides/test_ride_id", "Get Ride Details"))
    
    # Test booking endpoints
    print("\n📅 Booking Endpoints:")
    print(test_endpoint("POST", "/api/v1/bookings/", "Create Booking", {
        "ride_id": "test_ride_id",
        "passenger_id": "test_user",
        "seats_requested": 1
    }))
    print(test_endpoint("GET", "/api/v1/bookings/test_booking_id", "Get Booking"))
    print(test_endpoint("GET", "/api/v1/bookings/user/test_user", "Get User Bookings"))
    print(test_endpoint("GET", "/api/v1/bookings/ride/test_ride_id", "Get Ride Bookings"))
    
    # Test review endpoints
    print("\n⭐ Review Endpoints:")
    print(test_endpoint("POST", "/api/v1/reviews/", "Create Review", {
        "ride_id": "test_ride_id",
        "reviewer_id": "test_user",
        "reviewee_id": "test_driver",
        "rating": 5,
        "comment": "Great ride!"
    }))
    print(test_endpoint("GET", "/api/v1/reviews/test_review_id", "Get Review"))
    print(test_endpoint("GET", "/api/v1/reviews/user/test_user", "Get User Reviews"))
    
    # Test location endpoints
    print("\n📍 Location Endpoints:")
    print(test_endpoint("POST", "/api/v1/location/current-location", "Get Current Location", {
        "latitude": 28.6129,
        "longitude": 77.2089
    }))
    print(test_endpoint("POST", "/api/v1/location/search-places", "Search Places", {
        "query": "restaurant",
        "latitude": 28.6129,
        "longitude": 77.2089
    }))
    print(test_endpoint("POST", "/api/v1/location/nearby-places", "Get Nearby Places", {
        "latitude": 28.6129,
        "longitude": 77.2089
    }))
    
    # Test chat endpoints
    print("\n💬 Chat Endpoints:")
    print(test_endpoint("POST", "/api/v1/chat/message", "Send Message", {
        "ride_id": "test_ride_id",
        "sender_id": "test_user",
        "message": "Hello everyone!"
    }))
    print(test_endpoint("GET", "/api/v1/chat/ride/test_ride_id", "Get Ride Chat"))
    print(test_endpoint("GET", "/api/v1/chat/user/test_user/conversations", "Get User Conversations"))
    
    # Test notification endpoints
    print("\n🔔 Notification Endpoints:")
    print(test_endpoint("POST", "/api/v1/notifications/send", "Send Notification", {
        "token": "test_fcm_token",
        "title": "Test Notification",
        "body": "This is a test notification"
    }))
    print(test_endpoint("POST", "/api/v1/notifications/register-token", "Register FCM Token", params={
        "user_id": "test_user",
        "token": "test_fcm_token"
    }))
    
    # Test mapbox endpoints
    print("\n🗺️ Mapbox Endpoints:")
    print(test_endpoint("GET", "/api/v1/mapbox/route", "Get Route", params={
        "origin_lat": 28.6129,
        "origin_lng": 77.2089,
        "destination_lat": 28.6139,
        "destination_lng": 77.2090
    }))
    print(test_endpoint("GET", "/api/v1/mapbox/eta", "Get ETA", params={
        "origin_lat": 28.6129,
        "origin_lng": 77.2089,
        "destination_lat": 28.6139,
        "destination_lng": 77.2090
    }))
    print(test_endpoint("GET", "/api/v1/mapbox/geocode", "Geocode Address", params={"address": "Delhi, India"}))
    
    # Test websocket endpoints
    print("\n🔌 WebSocket Endpoints:")
    print(test_endpoint("POST", "/api/v1/ws/location/update", "Update User Location", params={
        "user_id": "test_user",
        "latitude": 28.6129,
        "longitude": 77.2089,
        "address": "Test Address"
    }))
    print(test_endpoint("GET", "/api/v1/ws/location/nearby/test_user", "Get Nearby Users", params={
        "latitude": 28.6129,
        "longitude": 77.2089
    }))
    print(test_endpoint("GET", "/api/v1/ws/location/active", "Get Active Users"))
    
    print("\n🎉 Heroku endpoint testing complete!")

if __name__ == "__main__":
    main()
