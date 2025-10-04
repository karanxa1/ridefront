"""
College Ride-Share App Backend
Zero-Budget FastAPI Backend with Firebase Integration
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.firebase import init_firebase
from app.api.v1.api import api_router
from app.core.exceptions import ValidationException, validation_exception_handler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    await init_firebase()
    yield
    # Shutdown
    # Cleanup if needed


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for security
if settings.BACKEND_CORS_ORIGINS:
    # Extract hostnames from CORS origins (remove protocol and port)
    allowed_hosts = []
    for origin in settings.BACKEND_CORS_ORIGINS:
        if origin.startswith("http://"):
            hostname = origin[7:]  # Remove "http://"
        elif origin.startswith("https://"):
            hostname = origin[8:]  # Remove "https://"
        else:
            hostname = origin

        # Remove port if present
        if ":" in hostname:
            hostname = hostname.split(":")[0]

        allowed_hosts.append(hostname)

    if allowed_hosts:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

# Global exception handlers
app.add_exception_handler(ValidationException, validation_exception_handler)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": settings.VERSION}


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "College Ride-Share API",
        "docs": "/docs",
        "version": settings.VERSION,
    }


# Include API routers
app.include_router(api_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "main:app", host="0.0.0.0", port=port, reload=settings.DEBUG, log_level="info"
    )
