"""
User models and schemas
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema"""
    name: str
    email: EmailStr
    role: str  # "driver" or "passenger"


class UserCreate(UserBase):
    """User creation schema"""
    password: str


class UserUpdate(BaseModel):
    """User update schema"""
    name: Optional[str] = None
    profile_pic: Optional[str] = None
    vehicle_info: Optional[dict] = None


class VehicleInfo(BaseModel):
    """Vehicle information for drivers"""
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
