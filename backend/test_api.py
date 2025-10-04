#!/usr/bin/env python3
import requests
import json

print("Testing API endpoints...")
print("=" * 50)

# Test Mapbox route endpoint
try:
    response = requests.get('http://localhost:8000/api/v1/mapbox/route?origin_lat=40.7128&origin_lng=-74.0060&destination_lat=40.7589&destination_lng=-73.9851', timeout=10)
    print(f"Mapbox Route: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"  Distance: {data.get('distance', 0)} meters")
        print(f"  Duration: {data.get('duration', 0)} seconds")
except Exception as e:
    print(f"Mapbox Route failed: {e}")

print()

# Test Mapbox ETA endpoint
try:
    response = requests.get('http://localhost:8000/api/v1/mapbox/eta?origin_lat=40.7128&origin_lng=-74.0060&destination_lat=40.7589&destination_lng=-73.9851', timeout=10)
    print(f"Mapbox ETA: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"  ETA: {data.get('duration', 0)} seconds")
        print(f"  Distance: {data.get('distance', 0)} meters")
except Exception as e:
    print(f"Mapbox ETA failed: {e}")

print()

# Test Firebase Authentication endpoints
try:
    # Test signup endpoint
    signup_data = {
        'email': 'test@example.com',
        'password': 'testpass123',
        'name': 'Test User',
        'role': 'passenger'
    }
    response = requests.post('http://localhost:8000/api/v1/auth/signup', json=signup_data, timeout=10)
    print(f"Auth Signup: {response.status_code}")
    if response.status_code == 200:
        print(f"  Response: {response.json()}")
except Exception as e:
    print(f"Auth Signup failed: {e}")

print()
print("API endpoints tested!")
print("Full API Documentation: http://localhost:8000/docs")
