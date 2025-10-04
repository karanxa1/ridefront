#!/usr/bin/env python3
"""
Setup script to create .env file with your credentials
"""

import os

# Your Firebase and Mapbox credentials
FIREBASE_CONFIG = {
    'PROJECT_ID': 'durvesh-ff5c1',
    'STORAGE_BUCKET': 'durvesh-ff5c1.firebasestorage.app',
    'MAPBOX_TOKEN': 'pk.eyJ1Ijoia2FyYW54YSIsImEiOiJjbWcydnlkaTQwdHJ3MmtzNmU0ZjhtNjNhIn0.MefwJP2ybogMMLcAqNSegg'
}

def create_env_file():
    """Create .env file with your credentials"""

    env_content = f'''# Firebase Configuration
FIREBASE_PROJECT_ID={FIREBASE_CONFIG['PROJECT_ID']}
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
YOUR-FIREBASE-PRIVATE-KEY-HERE
-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your-service-account@{FIREBASE_CONFIG['PROJECT_ID']}.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET={FIREBASE_CONFIG['STORAGE_BUCKET']}

# Mapbox Configuration
MAPBOX_ACCESS_TOKEN={FIREBASE_CONFIG['MAPBOX_TOKEN']}

# Application Configuration
DEBUG=True
SECRET_KEY=college-rideshare-backend-secret-key-2025
ACCESS_TOKEN_EXPIRE_MINUTES=11520

# CORS Configuration (for development)
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
'''

    with open('.env', 'w') as f:
        f.write(env_content)

    print(".env file created successfully!")
    print("\nNext steps:")
    print("1. Get your Firebase service account private key and client email")
    print("2. Replace YOUR-FIREBASE-PRIVATE-KEY-HERE with your actual private key")
    print("3. Replace your-service-account@durvesh-ff5c1.iam.gserviceaccount.com with your actual client email")
    print("4. Run: python main.py")

if __name__ == "__main__":
    create_env_file()
