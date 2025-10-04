"""
User models and schemas
"""

from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional
from datetime import datetime
import re


class UserBase(BaseModel):
    """Base user schema"""

    name: str
    email: EmailStr
    phone: str = Field(..., description="Indian phone number with country code")

    @validator("phone")
    def validate_indian_phone(cls, v):
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


class UserCreate(UserBase):
    """User creation schema"""

    password: str


class UserUpdate(BaseModel):
    """User update schema"""

    name: Optional[str] = None
    phone: Optional[str] = None
    profile_pic: Optional[str] = None
    vehicle_info: Optional[dict] = None

    @validator("phone")
    def validate_phone_update(cls, v):
        """Validate phone number on update if provided"""
        if v is None:
            return v

        # Use same validation as UserBase
        cleaned = re.sub(r"[\s\-\(\)]", "", v)

        patterns = [r"^\+91[6-9]\d{9}$", r"^91[6-9]\d{9}$", r"^[6-9]\d{9}$"]

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


class VehicleInfo(BaseModel):
    """Vehicle information for users who offer rides"""

    make: str
    model: str
    year: int
    color: str
    license_plate: str
    seats: int


class UserInDB(UserBase):
    """User as stored in database"""

    uid: str
    rating: float = 0.0
    profile_pic: Optional[str] = None
    vehicle_info: Optional[VehicleInfo] = None
    created_at: datetime
    updated_at: datetime


class UserProfile(UserBase):
    """User profile response"""

    uid: str
    rating: float = 0.0
    profile_pic: Optional[str] = None
    vehicle_info: Optional[VehicleInfo] = None
    created_at: str
    updated_at: str


class RideBookingRequest(BaseModel):
    """Schema for booking a ride"""

    ride_id: str
    passenger_id: str
    seats_requested: int = Field(default=1, ge=1, description="Number of seats to book")
    pickup_location: Optional[dict] = None
    message: Optional[str] = Field(
        None, max_length=500, description="Optional message to driver"
    )


class RideBookingResponse(BaseModel):
    """Schema for ride booking response"""

    booking_id: str
    ride_id: str
    passenger_id: str
    driver_id: str
    seats_booked: int
    status: str  # "pending", "accepted", "rejected", "cancelled"
    created_at: str
    message: Optional[str] = None


class BookingActionRequest(BaseModel):
    """Schema for driver accepting/rejecting booking"""

    action: str = Field(..., description="Action to take: 'accept' or 'reject'")
    driver_id: str
    message: Optional[str] = Field(
        None, max_length=500, description="Optional message to passenger"
    )

    @validator("action")
    def validate_action(cls, v):
        """Validate action is either accept or reject"""
        if v.lower() not in ["accept", "reject"]:
            raise ValueError('Action must be either "accept" or "reject"')
        return v.lower()
