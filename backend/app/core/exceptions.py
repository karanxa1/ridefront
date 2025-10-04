"""
Custom exception classes and handlers
"""

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import logging


class ValidationException(Exception):
    """Custom validation exception"""
    def __init__(self, message: str, details: dict = None):
        self.message = message
        self.details = details or {}


class RideNotFoundException(ValidationException):
    """Raised when a ride is not found"""
    pass


class UserNotFoundException(ValidationException):
    """Raised when a user is not found"""
    pass


class BookingNotFoundException(ValidationException):
    """Raised when a booking is not found"""
    pass


class InsufficientSeatsException(ValidationException):
    """Raised when there are not enough seats available"""
    pass


class UnauthorizedException(ValidationException):
    """Raised when user is not authorized to perform an action"""
    pass


async def validation_exception_handler(request: Request, exc: ValidationException):
    """Handle custom validation exceptions"""
    logging.error(f"Validation error: {exc.message}", extra={"details": exc.details})

    return JSONResponse(
        status_code=400,
        content={
            "error": "Validation Error",
            "message": exc.message,
            "details": exc.details
        }
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "message": exc.detail
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logging.error(f"Unexpected error: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred"
        }
    )
