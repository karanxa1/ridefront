#!/usr/bin/env python3
"""
Test script to verify Heroku deployment
"""

import requests
import json
import sys
import os

def test_heroku_app(app_url):
    """Test the deployed Heroku app"""
    
    print(f"🧪 Testing Heroku app at: {app_url}")
    
    try:
        # Test health endpoint
        print("1. Testing health endpoint...")
        health_response = requests.get(f"{app_url}/health", timeout=10)
        
        if health_response.status_code == 200:
            health_data = health_response.json()
            print(f"   ✅ Health check passed: {health_data}")
        else:
            print(f"   ❌ Health check failed: {health_response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Health check failed: {e}")
        return False
    
    try:
        # Test root endpoint
        print("2. Testing root endpoint...")
        root_response = requests.get(f"{app_url}/", timeout=10)
        
        if root_response.status_code == 200:
            root_data = root_response.json()
            print(f"   ✅ Root endpoint passed: {root_data}")
        else:
            print(f"   ❌ Root endpoint failed: {root_response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Root endpoint failed: {e}")
        return False
    
    try:
        # Test API docs endpoint
        print("3. Testing API docs endpoint...")
        docs_response = requests.get(f"{app_url}/docs", timeout=10)
        
        if docs_response.status_code == 200:
            print("   ✅ API docs accessible")
        else:
            print(f"   ❌ API docs failed: {docs_response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ API docs failed: {e}")
    
    print("🎉 All tests completed!")
    return True

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test-heroku.py <heroku-app-url>")
        print("Example: python test-heroku.py https://my-ride-share-backend.herokuapp.com")
        sys.exit(1)
    
    app_url = sys.argv[1]
    if not app_url.startswith("http"):
        app_url = f"https://{app_url}.herokuapp.com"
    
    success = test_heroku_app(app_url)
    sys.exit(0 if success else 1)
