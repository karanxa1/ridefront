#!/usr/bin/env python3
"""
Comprehensive test of all backend endpoints
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_endpoint(method, endpoint, data=None, expected_status=None):
    """Test an endpoint and return result"""
    try:
        url = f"{BASE_URL}{endpoint}"
        headers = {'Content-Type': 'application/json'}

        if method == 'GET':
            response = requests.get(url, timeout=10)
        elif method == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=10)
        elif method == 'PUT':
            response = requests.put(url, json=data, headers=headers, timeout=10)
        elif method == 'DELETE':
            response = requests.delete(url, timeout=10)

        status = response.status_code
        try:
            response_data = response.json()
        except:
            response_data = response.text

        if expected_status and status != expected_status:
            return f"ERROR {method} {endpoint}: Expected {expected_status}, got {status} - {response_data}"

        if status >= 200 and status < 300:
            return f"OK {method} {endpoint}: {status}"
        else:
            return f"WARN {method} {endpoint}: {status} - {str(response_data)[:100]}"

    except Exception as e:
        return f"❌ {method} {endpoint}: Error - {str(e)}"

def main():
    print("COMPREHENSIVE ENDPOINT TESTING")
    print("=" * 60)

    results = []

    # 1. Basic endpoints
    print("\nBASIC ENDPOINTS")
    print("-" * 30)
    results.append(test_endpoint('GET', '/health'))
    results.append(test_endpoint('GET', '/'))
    results.append(test_endpoint('GET', '/docs'))

    # 2. Authentication endpoints
    print("\nAUTHENTICATION ENDPOINTS")
    print("-" * 30)
    results.append(test_endpoint('POST', '/api/v1/auth/signup', {
        'email': 'newuser@example.com',
        'password': 'password123',
        'name': 'New User',
        'role': 'passenger'
    }, 200))
    results.append(test_endpoint('POST', '/api/v1/auth/login', {
        'email': 'newuser@example.com',
        'password': 'password123'
    }))

    # 3. Mapbox endpoints
    print("\nMAPBOX ENDPOINTS")
    print("-" * 30)
    results.append(test_endpoint('GET', '/api/v1/mapbox/route?origin_lat=40.7128&origin_lng=-74.0060&destination_lat=40.7589&destination_lng=-73.9851'))
    results.append(test_endpoint('GET', '/api/v1/mapbox/eta?origin_lat=40.7128&origin_lng=-74.0060&destination_lat=40.7589&destination_lng=-73.9851'))

    # 4. User endpoints
    print("\nUSER MANAGEMENT ENDPOINTS")
    print("-" * 30)
    results.append(test_endpoint('GET', '/api/v1/users/test-user-id'))
    results.append(test_endpoint('PUT', '/api/v1/users/test-user-id', {
        'name': 'Updated Name'
    }))

    # 5. Ride endpoints
    print("\nRIDE ENDPOINTS")
    print("-" * 30)
    results.append(test_endpoint('POST', '/api/v1/rides/', {
        'origin': {'lat': 40.7128, 'lng': -74.0060},
        'destination': {'lat': 40.7589, 'lng': -73.9851},
        'departure_time': '2025-12-01T10:00:00Z',
        'seats_available': 3,
        'price_per_seat': 15.0
    }, 200))
    results.append(test_endpoint('GET', '/api/v1/rides/search?origin_lat=40.7128&origin_lng=-74.0060&destination_lat=40.7589&destination_lng=-73.9851'))

    # 6. Booking endpoints
    print("\nBOOKING ENDPOINTS")
    print("-" * 30)
    results.append(test_endpoint('POST', '/api/v1/bookings/', {
        'ride_id': 'test-ride-id',
        'passenger_id': 'test-passenger-id',
        'seats_booked': 1
    }))
    results.append(test_endpoint('GET', '/api/v1/bookings/test-booking-id'))

    # 7. Review endpoints
    print("\nREVIEW ENDPOINTS")
    print("-" * 30)
    results.append(test_endpoint('POST', '/api/v1/reviews/', {
        'ride_id': 'test-ride-id',
        'reviewer_id': 'test-reviewer-id',
        'reviewee_id': 'test-reviewee-id',
        'rating': 5,
        'comment': 'Great ride!'
    }))
    results.append(test_endpoint('GET', '/api/v1/reviews/test-user-id'))

    # 8. Location endpoints
    print("\nLOCATION ENDPOINTS")
    print("-" * 30)
    results.append(test_endpoint('POST', '/api/v1/location/update', {
        'ride_id': 'test-ride-id',
        'lat': 40.7128,
        'lng': -74.0060
    }))
    results.append(test_endpoint('GET', '/api/v1/location/ride/test-ride-id'))

    # 9. Chat endpoints
    print("\nCHAT ENDPOINTS")
    print("-" * 30)
    results.append(test_endpoint('POST', '/api/v1/chat/message', {
        'ride_id': 'test-ride-id',
        'sender_id': 'test-sender-id',
        'message': 'Hello!'
    }))
    results.append(test_endpoint('GET', '/api/v1/chat/ride/test-ride-id'))

    # 10. Notification endpoints
    print("\nNOTIFICATION ENDPOINTS")
    print("-" * 30)
    results.append(test_endpoint('POST', '/api/v1/notifications/send', {
        'token': 'test-token',
        'title': 'Test Notification',
        'body': 'This is a test'
    }))

    # Summary
    print("\nTEST SUMMARY")
    print("=" * 60)

    success_count = sum(1 for result in results if result.startswith("OK"))
    warning_count = sum(1 for result in results if result.startswith("WARN"))
    error_count = sum(1 for result in results if result.startswith("ERROR"))

    print(f"Successful: {success_count}")
    print(f"Warnings: {warning_count}")
    print(f"Errors: {error_count}")
    print(f"Total: {len(results)}")

    print("\nDETAILED RESULTS")
    print("=" * 60)
    for result in results:
        print(result)

    print(f"\nBackend is {'WORKING' if error_count == 0 else 'MOSTLY WORKING'}!")
    print(f"API Documentation: {BASE_URL}/docs")
    print(f"Health Check: {BASE_URL}/health")

if __name__ == "__main__":
    main()
