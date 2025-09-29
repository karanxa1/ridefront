"""
Firebase configuration and initialization
"""

import firebase_admin
from firebase_admin import credentials, firestore, auth, messaging
from app.core.config import settings
import logging

# Global variables for Firebase services
db = None
auth_client = None
messaging_client = None

async def init_firebase():
    """Initialize Firebase services"""
    global db, auth_client, messaging_client

    try:
        # Check if Firebase is already initialized
        if firebase_admin._apps:
            app = firebase_admin.get_app()
        else:
            # Initialize Firebase Admin SDK with provided credentials
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": settings.FIREBASE_PROJECT_ID,
                "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
                "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n"),
                "client_email": settings.FIREBASE_CLIENT_EMAIL,
                "client_id": settings.FIREBASE_CLIENT_ID,
                "auth_uri": settings.FIREBASE_AUTH_URI,
                "token_uri": settings.FIREBASE_TOKEN_URI,
                "auth_provider_x509_cert_url": settings.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
                "client_x509_cert_url": settings.FIREBASE_CLIENT_X509_CERT_URL,
            })

            app = firebase_admin.initialize_app(cred, {
                'storageBucket': settings.FIREBASE_STORAGE_BUCKET
            })

        # Initialize services
        db = firestore.client(app)
        auth_client = auth
        messaging_client = messaging

        logging.info("Firebase initialized successfully")

    except Exception as e:
        logging.error(f"Failed to initialize Firebase: {str(e)}")
        raise

def get_firestore_client():
    """Get Firestore client instance"""
    if db is None:
        raise RuntimeError("Firebase not initialized")
    return db

def get_auth_client():
    """Get Firebase Auth client instance"""
    if auth_client is None:
        raise RuntimeError("Firebase not initialized")
    return auth_client

def get_messaging_client():
    """Get Firebase Cloud Messaging client instance"""
    if messaging_client is None:
        raise RuntimeError("Firebase not initialized")
    return messaging_client
