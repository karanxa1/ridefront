#!/usr/bin/env python3
import requests
import json

print("Testing endpoints with detailed error checking...")
print("=" * 60)

# Test Mapbox Route with detailed error
try:
    response = requests.get('http://localhost:8000/api/v1/mapbox/route?origin_lat=40.7128&origin_lng=-74.0060&destination_lat=40.7589&destination_lng=-73.9851', timeout=10)
    print(f"Mapbox Route: {response.status_code}")
    if response.status_code != 200:
        print(f"  Error: {response.text}")
    else:
        data = response.json()
        print(f"  Distance: {data.get('distance', 0)} meters")
except Exception as e:
    print(f"Mapbox Route failed: {e}")

print()

# Test Auth Signup with detailed error
try:
    signup_data = {
        'email': 'test2@example.com',
        'password': 'testpass123',
        'name': 'Test User 2',
        'role': 'passenger'
    }
    response = requests.post('http://localhost:8000/api/v1/auth/signup', json=signup_data, timeout=10)
    print(f"Auth Signup: {response.status_code}")
    if response.status_code != 200:
        print(f"  Error: {response.text}")
    else:
        print(f"  Response: {response.json()}")
except Exception as e:
    print(f"Auth Signup failed: {e}")

print()
print("Testing completed!")
