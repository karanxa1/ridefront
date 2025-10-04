# College Ride-Share App Backend

A zero-budget, production-ready FastAPI backend for a college ride-sharing platform with real-time features.

## 🎯 Zero-Budget Tech Stack

- **Backend Framework**: Python FastAPI (Async, high-performance)
- **Database & Real-Time**: Firebase Firestore (NoSQL with real-time listeners)
- **Authentication**: Firebase Authentication (Email/password + Google login)
- **Maps/Routing**: Mapbox Free Tier (50k requests/month)
- **Notifications**: Firebase Cloud Messaging (FCM) - Free
- **Hosting**: Railway/Render/Fly.io free tiers

## 🚀 Key Features

✅ **Real-time GPS tracking** via Firestore listeners
✅ **In-ride chat** via Firestore subcollections
✅ **Push notifications** via FCM
✅ **Mapbox routing & ETA**
✅ **Review and rating system**
✅ **Secure authentication** with Firebase Auth
✅ **Dockerized deployment**

## 📁 Project Structure

```
rideshare-backend/
├── app/
│   ├── api/v1/endpoints/
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── users.py         # User management
│   │   ├── rides.py         # Ride CRUD operations
│   │   ├── bookings.py      # Booking management
│   │   ├── reviews.py       # Review system
│   │   ├── location.py      # Real-time location tracking
│   │   ├── chat.py          # In-ride chat
│   │   ├── notifications.py # FCM notifications
│   │   └── mapbox.py        # Mapbox integration
│   ├── core/
│   │   ├── config.py        # Application settings
│   │   ├── firebase.py      # Firebase initialization
│   │   └── exceptions.py    # Custom exceptions
│   ├── models/
│   │   ├── user.py          # User schemas
│   │   ├── ride.py          # Ride schemas
│   │   ├── booking.py       # Booking schemas
│   │   ├── review.py        # Review schemas
│   │   ├── location.py      # Location schemas
│   │   ├── chat.py          # Chat schemas
│   │   └── mapbox.py        # Mapbox schemas
│   └── services/
│       ├── mapbox.py        # Mapbox API service
│       └── notifications.py # FCM service
├── main.py                  # FastAPI application
├── requirements.txt         # Python dependencies
├── Dockerfile              # Container configuration
├── docker-compose.yml      # Local development
└── README.md
```

## 🛠️ Quick Start

### 1. Prerequisites

- Python 3.11+
- Firebase project with Firestore enabled
- Mapbox account (free tier)
- Docker (optional, for containerized deployment)

### 2. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd rideshare-backend

# Install dependencies
pip install -r requirements.txt

# Run setup script to create .env file
python setup.py

# Edit .env file with your Firebase service account credentials
# You need to get these from Firebase Console > Project Settings > Service Accounts
```

### 3. Firebase Setup (Already Configured!)

Your Firebase project `durvesh-ff5c1` is already configured! Just need to:

1. Go to [Firebase Console](https://console.firebase.google.com/project/durvesh-ff5c1)
2. Enable Firestore Database (if not already enabled)
3. Enable Firebase Authentication (if not already enabled)
4. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Update the `.env` file with your private key and client email

### 4. Mapbox Setup (Already Configured!)

Your Mapbox token is already configured! The backend will use:
- **Token**: `pk.eyJ1Ijoia2FyYW54YSIsImEiOiJjbWcydnlkaTQwdHJ3MmtzNmU0ZjhtNjNhIn0.MefwJP2ybogMMLcAqNSegg`
- **Free Tier**: 50,000 map views/month and 50,000 directions requests/month

No additional setup needed for Mapbox! 🎉

### 5. Run Locally

```bash
# Development mode
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Or with Docker
docker-compose up --build
```

Visit http://localhost:8000/docs for API documentation

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create account
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/profile/{user_id}` - Get user profile

### Rides
- `POST /api/v1/rides/` - Create ride (drivers)
- `GET /api/v1/rides/{ride_id}` - Get ride details
- `GET /api/v1/rides/search/` - Search rides (passengers)
- `PUT /api/v1/rides/{ride_id}` - Update ride
- `DELETE /api/v1/rides/{ride_id}` - Cancel ride

### Bookings
- `POST /api/v1/bookings/` - Book a ride
- `GET /api/v1/bookings/{booking_id}` - Get booking
- `GET /api/v1/bookings/passenger/{passenger_id}` - Get user bookings
- `PUT /api/v1/bookings/{booking_id}` - Update booking
- `DELETE /api/v1/bookings/{booking_id}` - Cancel booking

### Reviews
- `POST /api/v1/reviews/` - Submit review
- `GET /api/v1/reviews/{review_id}` - Get review
- `GET /api/v1/reviews/user/{user_id}` - Get user reviews

### Real-time Features
- `POST /api/v1/location/update` - Update driver location
- `GET /api/v1/location/ride/{ride_id}` - Get location history
- `POST /api/v1/chat/message` - Send chat message
- `GET /api/v1/chat/ride/{ride_id}` - Get chat messages

### Notifications
- `POST /api/v1/notifications/send` - Send notification
- `POST /api/v1/notifications/register-token` - Register FCM token

### Mapbox Integration
- `GET /api/v1/mapbox/route` - Get route between points
- `GET /api/v1/mapbox/eta` - Get ETA between points
- `GET /api/v1/mapbox/geocode` - Geocode address

## 🔄 Real-Time Architecture

### Location Tracking
- Drivers update location every 5-10 seconds to `rides/{rideId}/driver_location`
- Passengers subscribe to location updates via Firestore real-time listeners
- No WebSocket servers needed - Firestore handles push updates automatically

### Chat System
- Messages stored in `rides/{rideId}/chat` subcollection
- All ride participants receive real-time message updates
- Messages include sender info and timestamps

### Notifications
- FCM tokens stored with user profiles
- Automatic notifications for booking confirmations, ride updates
- Topic-based notifications for ride-specific updates

## 🐳 Deployment

### Option 1: Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

### Option 2: Render
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Add environment variables
4. Deploy

### Option 3: Fly.io
```bash
fly launch
fly deploy
```

### Option 4: Heroku
```bash
heroku create your-app-name
heroku config:set $(cat .env | grep -v '^#' | xargs)
git push heroku main
```

## 🔒 Security Features

- Firebase Authentication for secure user management
- CORS protection for cross-origin requests
- Input validation with Pydantic models
- Rate limiting ready for production
- Secure environment variable management

## 📊 Database Schema

### Collections:
- `users` - User profiles and settings
- `rides` - Ride information and status
- `bookings` - Passenger bookings
- `reviews` - User reviews and ratings
- `driver_locations` - Current driver locations
- `chat_messages` - Chat message history

### Subcollections:
- `rides/{rideId}/driver_location` - Real-time location updates
- `rides/{rideId}/chat` - In-ride chat messages

## 🚀 Production Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Error Monitoring**: Add Sentry or similar for error tracking
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Caching**: Add Redis for frequently accessed data
5. **Monitoring**: Set up health checks and metrics
6. **Backups**: Configure Firestore backup policies
7. **Security**: Enable Firebase App Check for frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the Firebase and Mapbox documentation

---

**Built with ❤️ for college students** 🚗💨
