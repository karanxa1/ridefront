#!/usr/bin/env python3
import requests
import time

print("Testing backend endpoints...")
time.sleep(3)

try:
    response = requests.get('http://localhost:8000/health', timeout=5)
    print(f"Health Check: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Health Check failed: {e}")

try:
    response = requests.get('http://localhost:8000/', timeout=5)
    print(f"Root Endpoint: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Root Endpoint failed: {e}")

try:
    response = requests.get('http://localhost:8000/docs', timeout=5)
    print(f"API Documentation: {response.status_code}")
except Exception as e:
    print(f"API Documentation failed: {e}")

print()
print("Backend test completed!")
print("API Documentation: http://localhost:8000/docs")
print("Root Endpoint: http://localhost:8000/")
print("Health Check: http://localhost:8000/health")
