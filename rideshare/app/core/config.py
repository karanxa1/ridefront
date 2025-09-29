"""
Application configuration settings
"""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator, ConfigDict
import os


class Settings(BaseSettings):
    """Application settings"""

    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "College Ride-Share API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Zero-budget ride-sharing platform for college students"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "http://localhost:5174",  # Vite dev server (alternative port)
    ]

    # Firebase Configuration
    FIREBASE_PROJECT_ID: str = "durvesh-ff5c1"
    FIREBASE_PRIVATE_KEY_ID: str = "3c24b1b58a6f09e02359c65d33c9e8be834271bf"
    FIREBASE_PRIVATE_KEY: str = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCgzxtyjMHOi2O2\ncZZRej8s4Q0Py9THv+AG9CcnCtcvbXI4U5r8f2Tk6CPwUhwSmV+/af8eU8xjoB+H\ns9XckUl998/uBn65dlLgahV63MabXvfnnbqWtWasVTjmfRAMu18SUE/RjqyTo857\nMfNIrsWNynedx8mndDUd+n0QOw+Wklc/4EPvrKUnYeP8QyXU8Ux4kJzmHV/bNGzS\n+KX7S08LaxcxcXoU7fBwB0KWjgHEhE8pL7Xg2QnqJa/nrA/ItBYTBP/UPBy+s60N\nPo7KRGOK8FJjJkBxWofW+dODdGYr6fiO1oU/3Y2gVHtV8Q8pwXKfZqgyDn3IU5jr\nOPLhav3TAgMBAAECggEAL33a8lKlrjU2ZpxXM4rx+3QfommlVrTRGdyjb4FhGc2t\n7PqsDCQnjP8OFhx50/hd8a8BPFitRUL17OLspy51UPGOBBMA/A743PQXkeh/80Tx\n3AKWJ4o9X2nv2wpWYhw4MLVtTUtgpl27TmDrI60SBRUljICDiqPkSA1BQDjhGqt3\ncuKSUURGonUJEBMaV40X7T2lb3bHMLhFGwZ1CZntCznmUvSOZlqTm/pKlSqhvLGp\nqPSeEiKFB3smT7NX1I4xAu40s4EwKZh/AE4T+YdqSzV8I9WhO980AxMP1bQocAZR\nXnujq5Q5x7xDEKwQmMmySr6LOnGNDxdK1BIia+V5uQKBgQDXDkYkdHOBdD/6jOMM\nufPr71fKso2d6rT8vIjDDuDRE9TZEPGqLJr8tV6s8CKZfxX3f43SsK7NZdkxKxRQ\nY/r5WoMiLEjGZXdn2G0MZG2NWEShkjNep0giVCOhwNnxfY3Oq/PN87r9rMZ89H/x\nPqjaDlNKawOa/3vCagPTAVYQrQKBgQC/bN62lWrLEnXriWBo9W8NkxuboI8MRB+M\nMK8wGYTe2YKsX0mNVuX6nOMJ3aM5gtLLH04tHVlY40NbtvneUYf0blfWMzpGldt1\nEAjHicipAfyUZr4YCb0c/HeWBUPpnVqZAVVBhncq95aUka1pxkvBVp3PHbSx6sqB\nsPS0ZVqYfwKBgFSuTDRinnDlI6Q3AdirCD9pGXq5YEZEe0vhuUCFhUUOuAtZPq+x\nrL3BdSxHyngCsNWqJmBGLi624hUYT4FwPQ0e9O/p3CYzIheEAzyT9wdnMG8msI+e\n8yqBUx6IX8lVlRdCYlhAlur4s5fUduS5tadXaLiu9tZ7r3HYaPUXW5ppAoGBAKdO\nwFlUvsI+oFH9AAa8fROgP8EF1AEkiW4+HuArbbZY5Z1Cq0adbORduxIkZUUe0p41\n/l3wCOdnureudTWajPlWd+7/Vy/aSrVGDmZYRslwsxIBuqPH30I2Z073yyOkJEsW\nny1mGUG0pCe2K5sHda7FxagAjq3ySIyR3U7ORyCBAoGAFlax1EAByT7+M+nfRYxY\nNlDcjEM8tNquJ1LzcTAU1xvRJ16fpcJdtoyEuqGrJlfkSU7HRm/pKjdG5jzXnldh\nRvcLLchkpf/280u3GZ5eZjwylLUgQYxvlSRUTBLmTkFiQ9GDcb2JYxfs844DXdSY\n+jvooh3ziV80/Dod2+LTNac=\n-----END PRIVATE KEY-----\n"
    FIREBASE_CLIENT_EMAIL: str = "firebase-adminsdk-fbsvc@durvesh-ff5c1.iam.gserviceaccount.com"
    FIREBASE_CLIENT_ID: str = "110730231166840450694"
    FIREBASE_AUTH_URI: str = "https://accounts.google.com/o/oauth2/auth"
    FIREBASE_TOKEN_URI: str = "https://oauth2.googleapis.com/token"
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL: str = "https://www.googleapis.com/oauth2/v1/certs"
    FIREBASE_CLIENT_X509_CERT_URL: str = "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40durvesh-ff5c1.iam.gserviceaccount.com"
    FIREBASE_STORAGE_BUCKET: str = "durvesh-ff5c1.firebasestorage.app"

    # Mapbox Configuration
    MAPBOX_ACCESS_TOKEN: str = "pk.eyJ1Ijoia2FyYW54YSIsImEiOiJjbWcydnlkaTQwdHJ3MmtzNmU0ZjhtNjNhIn0.MefwJP2ybogMMLcAqNSegg"

    # Environment
    DEBUG: bool = True

    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore"  # Ignore extra environment variables
    )


settings = Settings()
