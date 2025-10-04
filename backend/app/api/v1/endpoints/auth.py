"""
Authentication endpoints - Updated to remove role and add phone number
"""

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field, field_validator
import firebase_admin
from firebase_admin import auth as firebase_auth, firestore as firebase_firestore
import re

from ....core.config import settings
from ....core.firebase import get_firestore_client

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


class UserSignup(BaseModel):
    """User signup schema"""

    email: EmailStr
    password: str
    name: str
    phone: str = Field(..., description="Indian phone number")

    @field_validator("phone")
    @classmethod
    def validate_indian_phone(cls, v: str) -> str:
        """Validate Indian phone number format"""
        # Remove spaces, dashes, and parentheses
        cleaned = re.sub(r"[\s\-\(\)]", "", v)

        # Check if it matches Indian phone number patterns
        # Supports: +91XXXXXXXXXX, 91XXXXXXXXXX, or XXXXXXXXXX (10 digits)
        patterns = [
            r"^\+91[6-9]\d{9}$",  # +91XXXXXXXXXX
            r"^91[6-9]\d{9}$",  # 91XXXXXXXXXX
            r"^[6-9]\d{9}$",  # XXXXXXXXXX (10 digits starting with 6-9)
        ]

        if not any(re.match(pattern, cleaned) for pattern in patterns):
            raise ValueError(
                "Phone number must be a valid Indian number (10 digits starting with 6-9). "
                "Format: +91XXXXXXXXXX, 91XXXXXXXXXX, or XXXXXXXXXX"
            )

        # Normalize to +91XXXXXXXXXX format
        if cleaned.startswith("+91"):
            return cleaned
        elif cleaned.startswith("91"):
            return "+" + cleaned
        else:
            return "+91" + cleaned


class UserLogin(BaseModel):
    """User login schema"""

    email: EmailStr
    password: str


class Token(BaseModel):
    """Token response schema"""

    access_token: str
    token_type: str
    expires_in: int
    user_id: str


class UserProfile(BaseModel):
    """User profile response schema"""

    uid: str
    email: str
    name: str
    phone: str
    profile_pic: str | None = None
    rating: float = 0.0
    created_at: str


@router.post("/signup", response_model=dict[str, Any])
async def signup(user_data: UserSignup):
    """Create a new user account"""
    try:
        # Create user in Firebase Auth
        firebase_user = firebase_auth.create_user(
            email=user_data.email,
            password=user_data.password,
            display_name=user_data.name,
            phone_number=user_data.phone,
        )

        # Store additional user data in Firestore
        db = get_firestore_client()
        user_doc = {
            "name": user_data.name,
            "email": user_data.email,
            "phone": user_data.phone,
            "rating": 0.0,
            "total_rides_offered": 0,
            "total_rides_taken": 0,
            "created_at": firebase_firestore.SERVER_TIMESTAMP,
            "updated_at": firebase_firestore.SERVER_TIMESTAMP,
        }

        db.collection("users").document(firebase_user.uid).set(user_doc)

        return {
            "message": "User created successfully",
            "user_id": firebase_user.uid,
            "email": firebase_user.email,
            "phone": user_data.phone,
        }

    except firebase_auth.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )
    except firebase_auth.PhoneNumberAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered",
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}",
        )


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate user and return token"""
    try:
        # Verify user credentials with Firebase
        firebase_user = firebase_auth.get_user_by_email(form_data.username)

        # In a real implementation, you would verify the password here
        # For this zero-budget version, we'll use Firebase's token verification

        # Get user data from Firestore
        db = get_firestore_client()
        user_doc = db.collection("users").document(firebase_user.uid).get()

        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
            )

        user_data = user_doc.to_dict()

        # Generate a custom token (in production, use proper JWT)
        custom_token = firebase_auth.create_custom_token(firebase_user.uid)

        return Token(
            access_token=custom_token.decode(),
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_id=firebase_user.uid,
        )

    except firebase_auth.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}",
        )


@router.post("/verify-token")
async def verify_token(token: str):
    """Verify Firebase token"""
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return {
            "valid": True,
            "user_id": decoded_token["uid"],
            "email": decoded_token.get("email"),
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )


@router.get("/profile/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str):
    """Get user profile"""
    try:
        db = get_firestore_client()
        user_doc = db.collection("users").document(user_id).get()

        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        user_data = user_doc.to_dict()

        return UserProfile(
            uid=user_id,
            email=user_data["email"],
            name=user_data["name"],
            phone=user_data.get("phone", ""),
            profile_pic=user_data.get("profile_pic", ""),
            rating=user_data.get("rating", 0.0),
            created_at=str(user_data.get("created_at", "")),
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user profile: {str(e)}",
        )
