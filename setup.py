from setuptools import setup, find_packages

setup(
    name="ride-share-backend",
    version="1.0.0",
    description="FastAPI Backend for College Ride-Share App",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0",
        "firebase-admin==6.2.0",
        "python-multipart==0.0.6",
        "python-dotenv==1.0.0",
        "pydantic==2.5.0",
        "pydantic-settings==2.1.0",
        "requests==2.31.0",
        "httpx==0.25.2",
        "python-jose[cryptography]==3.3.0",
        "passlib[bcrypt]==1.7.4",
        "aiofiles==23.2.1",
        "gunicorn==21.2.0",
    ],
    python_requires=">=3.11",
)