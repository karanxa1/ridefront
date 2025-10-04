"""
Review models and schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    """Base review schema"""
    ride_id: str
    reviewer_id: str
    reviewee_id: str
    rating: int  # 1-5 stars
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    """Review creation schema"""
    pass


class ReviewInDB(ReviewBase):
    """Review as stored in database"""
    review_id: str
    created_at: datetime


class ReviewResponse(ReviewBase):
    """Review response schema"""
    review_id: str
    reviewer_name: str
    reviewee_name: str
    ride_details: dict
    created_at: str


class UserReviews(BaseModel):
    """User reviews response"""
    reviews: list[ReviewResponse]
    average_rating: float
    total_reviews: int
