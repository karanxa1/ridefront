"""
Chat models and schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChatMessage(BaseModel):
    """Chat message schema"""
    ride_id: str
    sender_id: str
    message: str


class MessageCreate(ChatMessage):
    """Message creation schema"""
    pass


class MessageInDB(ChatMessage):
    """Message as stored in database"""
    message_id: str
    timestamp: datetime


class MessageResponse(ChatMessage):
    """Message response schema"""
    message_id: str
    sender_name: str
    timestamp: str
    is_from_driver: bool


class ChatHistory(BaseModel):
    """Chat history response"""
    messages: list[MessageResponse]
    total_count: int
