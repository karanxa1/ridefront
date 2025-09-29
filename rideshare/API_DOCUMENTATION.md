# 🚗 College Ride-Share App - Complete API Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Base URL & Authentication](#base-url--authentication)
3. [API Endpoints](#api-endpoints)
4. [Frontend Pages Required](#frontend-pages-required)
5. [Database Schema](#database-schema)
6. [Real-time Features](#real-time-features)
7. [Deployment Guide](#deployment-guide)

---

## 🎯 Overview

**Zero-budget ride-sharing platform for college students** with real-time GPS tracking, in-ride chat, and push notifications.

### Tech Stack
- **Backend**: FastAPI (Python)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Maps**: Mapbox API (Free Tier)
- **Notifications**: Firebase Cloud Messaging
- **Real-time**: Firestore Listeners

---

## 🔗 Base URL & Authentication

### Base URL
```
http://localhost:8000
```

### Authentication
- **Type**: Firebase Authentication
- **Methods**: Email/Password, Google OAuth
- **Token**: Firebase ID Token (Bearer token)

### Headers
```json
{
  "Authorization": "Bearer <firebase_id_token>",
  "Content-Type": "application/json"
}
```

---

## 📡 API Endpoints

### 🔐 Authentication Endpoints

#### 1. User Signup
```http
POST /api/v1/auth/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "passenger" // or "driver"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user_id": "firebase_user_id",
  "email": "user@example.com"
}
```

#### 2. User Login
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "username": "user@example.com", // email
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "firebase_custom_token",
  "token_type": "bearer",
  "expires_in": 691200,
  "user_id": "firebase_user_id",
  "role": "passenger"
}
```

#### 3. Get User Profile
```http
GET /api/v1/auth/profile/{user_id}
```

**Response:**
```json
{
  "uid": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "passenger",
  "profile_pic": "https://...",
  "rating": 4.5,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 👤 User Management Endpoints

#### 1. Get User Profile
```http
GET /api/v1/users/{user_id}
```

#### 2. Update User Profile
```http
PUT /api/v1/users/{user_id}
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "profile_pic": "https://...",
  "vehicle_info": {
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "color": "Blue",
    "license_plate": "ABC123",
    "seats": 4
  }
}
```

#### 3. Get User Reviews
```http
GET /api/v1/users/{user_id}/reviews?page=1&limit=20
```

#### 4. Get User Rides
```http
GET /api/v1/users/{user_id}/rides?role=driver&status=active
```

---

### 🚗 Ride Management Endpoints

#### 1. Create Ride (Drivers Only)
```http
POST /api/v1/rides/?driver_id={driver_id}
```

**Request Body:**
```json
{
  "origin": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "destination": {
    "lat": 40.7589,
    "lng": -73.9851
  },
  "departure_time": "2024-12-01T10:00:00Z",
  "seats_available": 3,
  "price_per_seat": 15.0
}
```

#### 2. Get Ride Details
```http
GET /api/v1/rides/{ride_id}
```

**Response:**
```json
{
  "ride_id": "ride_123",
  "driver_id": "driver_123",
  "driver_name": "John Driver",
  "driver_rating": 4.8,
  "origin": {"lat": 40.7128, "lng": -74.0060},
  "destination": {"lat": 40.7589, "lng": -73.9851},
  "departure_time": "2024-12-01T10:00:00Z",
  "seats_available": 2,
  "price_per_seat": 15.0,
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### 3. Update Ride
```http
PUT /api/v1/rides/{ride_id}?driver_id={driver_id}
```

#### 4. Cancel Ride
```http
DELETE /api/v1/rides/{ride_id}?driver_id={driver_id}
```

#### 5. Search Rides (Passengers)
```http
GET /api/v1/rides/search/?origin_lat=40.7128&origin_lng=-74.0060&destination_lat=40.7589&destination_lng=-73.9851&departure_date=2024-12-01&max_price=20&min_seats=1
```

#### 6. Get Driver Rides
```http
GET /api/v1/rides/driver/{driver_id}?status=active&page=1&limit=20
```

---

### 🎫 Booking Management Endpoints

#### 1. Create Booking
```http
POST /api/v1/bookings/
```

**Request Body:**
```json
{
  "ride_id": "ride_123",
  "passenger_id": "passenger_123",
  "seats_booked": 1
}
```

#### 2. Get Booking Details
```http
GET /api/v1/bookings/{booking_id}
```

#### 3. Update Booking
```http
PUT /api/v1/bookings/{booking_id}?passenger_id={passenger_id}
```

#### 4. Cancel Booking
```http
DELETE /api/v1/bookings/{booking_id}?passenger_id={passenger_id}
```

#### 5. Get Passenger Bookings
```http
GET /api/v1/bookings/passenger/{passenger_id}?status=confirmed&page=1&limit=20
```

---

### ⭐ Review & Rating Endpoints

#### 1. Submit Review
```http
POST /api/v1/reviews/
```

**Request Body:**
```json
{
  "ride_id": "ride_123",
  "reviewer_id": "passenger_123",
  "reviewee_id": "driver_123",
  "rating": 5,
  "comment": "Great ride! Very punctual."
}
```

#### 2. Get Review
```http
GET /api/v1/reviews/{review_id}
```

#### 3. Get User Reviews
```http
GET /api/v1/reviews/user/{user_id}?page=1&limit=20
```

---

### 🗺️ Mapbox Integration Endpoints

#### 1. Get Route
```http
GET /api/v1/mapbox/route?origin_lat=40.7128&origin_lng=-74.0060&destination_lat=40.7589&destination_lng=-73.9851&profile=driving
```

**Response:**
```json
{
  "distance": 7989.537,
  "duration": 1416.808,
  "geometry": {
    "type": "LineString",
    "coordinates": [[-74.006, 40.7128], ...]
  },
  "steps": [
    {
      "distance": 100,
      "duration": 30,
      "instruction": "Head north on Main St",
      "maneuver": {...}
    }
  ],
  "waypoints": []
}
```

#### 2. Get ETA
```http
GET /api/v1/mapbox/eta?origin_lat=40.7128&origin_lng=-74.0060&destination_lat=40.7589&destination_lng=-73.9851
```

#### 3. Geocode Address
```http
GET /api/v1/mapbox/geocode?address=123 Main St, New York, NY
```

---

### 📍 Real-time Location Endpoints

#### 1. Update Driver Location
```http
POST /api/v1/location/update?driver_id={driver_id}
```

**Request Body:**
```json
{
  "ride_id": "ride_123",
  "lat": 40.7128,
  "lng": -74.0060
}
```

#### 2. Get Location History
```http
GET /api/v1/location/ride/{ride_id}?limit=50&hours=24
```

#### 3. Get Current Location
```http
GET /api/v1/location/current/{ride_id}
```

#### 4. Get Driver Active Rides
```http
GET /api/v1/location/driver/{driver_id}/active-rides
```

---

### 💬 Chat Endpoints

#### 1. Send Message
```http
POST /api/v1/chat/message
```

**Request Body:**
```json
{
  "ride_id": "ride_123",
  "sender_id": "user_123",
  "message": "Hello! I'm on my way."
}
```

#### 2. Get Chat History
```http
GET /api/v1/chat/ride/{ride_id}?limit=50&before_message_id=msg_123
```

#### 3. Get User Conversations
```http
GET /api/v1/chat/user/{user_id}/conversations
```

#### 4. Delete Message
```http
DELETE /api/v1/chat/message/{message_id}?user_id={user_id}
```

---

### 🔔 Notification Endpoints

#### 1. Send Notification
```http
POST /api/v1/notifications/send
```

**Request Body:**
```json
{
  "token": "fcm_token",
  "title": "Ride Update",
  "body": "Your driver is 5 minutes away",
  "data": {
    "ride_id": "ride_123",
    "type": "driver_arriving"
  }
}
```

#### 2. Send Multicast Notification
```http
POST /api/v1/notifications/send-multicast
```

#### 3. Send Topic Notification
```http
POST /api/v1/notifications/send-topic
```

#### 4. Register FCM Token
```http
POST /api/v1/notifications/register-token?user_id={user_id}&token={fcm_token}
```

---

## 🎨 Frontend Pages Required

### 📱 **Mobile App Pages**

#### 1. **Authentication Pages**
- **Login Screen** (`/login`)
  - Email/password form
  - Google OAuth button
  - "Forgot Password" link
  - "Sign Up" link

- **Signup Screen** (`/signup`)
  - User registration form
  - Role selection (Driver/Passenger)
  - Terms & conditions checkbox
  - "Already have account?" link

- **Profile Setup** (`/profile-setup`)
  - Name, profile picture
  - Vehicle info (for drivers)
  - Phone number verification

#### 2. **Main Navigation Pages**
- **Home/Dashboard** (`/`)
  - Quick ride search
  - Recent rides
  - Notifications
  - User profile access

- **Profile Page** (`/profile`)
  - Personal information
  - Vehicle details (drivers)
  - Rating & reviews
  - Settings

#### 3. **Ride Management Pages**

**For Passengers:**
- **Search Rides** (`/search`)
  - Origin/destination input
  - Date/time picker
  - Filters (price, seats)
  - Map view with results

- **Ride Details** (`/ride/{ride_id}`)
  - Driver information
  - Route on map
  - Price breakdown
  - Book ride button

- **My Bookings** (`/bookings`)
  - Upcoming rides
  - Past rides
  - Booking status

**For Drivers:**
- **Create Ride** (`/create-ride`)
  - Origin/destination picker
  - Date/time selection
  - Price setting
  - Available seats

- **My Rides** (`/my-rides`)
  - Active rides
  - Past rides
  - Ride statistics

#### 4. **Real-time Pages**
- **Active Ride** (`/ride/{ride_id}/active`)
  - Live driver location
  - ETA updates
  - Chat interface
  - Emergency contact

- **Driver Dashboard** (`/driver-dashboard`)
  - Current ride status
  - Passenger list
  - Navigation integration
  - Location sharing toggle

#### 5. **Communication Pages**
- **Chat Screen** (`/chat/{ride_id}`)
  - Message history
  - Real-time messaging
  - Media sharing
  - Typing indicators

#### 6. **Review & Rating Pages**
- **Rate Ride** (`/rate/{ride_id}`)
  - Star rating
  - Comment text area
  - Submit review

- **Reviews** (`/reviews/{user_id}`)
  - User review history
  - Average rating display

#### 7. **Settings & Support**
- **Settings** (`/settings`)
  - Notification preferences
  - Privacy settings
  - Account management

- **Help & Support** (`/help`)
  - FAQ section
  - Contact support
  - Report issues

### 💻 **Web Admin Dashboard Pages**

#### 1. **Admin Dashboard** (`/admin`)
- User statistics
- Ride analytics
- System health
- Revenue tracking

#### 2. **User Management** (`/admin/users`)
- User list with filters
- User details
- Account status management
- Review moderation

#### 3. **Ride Management** (`/admin/rides`)
- All rides overview
- Ride details
- Dispute resolution
- Analytics

---

## 🗄️ Database Schema

### **Firestore Collections**

#### 1. **Users Collection**
```javascript
users/{userId} {
  name: string,
  email: string,
  role: "driver" | "passenger",
  profile_pic: string?,
  vehicle_info: object?,
  rating: number,
  created_at: timestamp,
  updated_at: timestamp,
  fcm_token: string?
}
```

#### 2. **Rides Collection**
```javascript
rides/{rideId} {
  driver_id: string,
  origin: {lat: number, lng: number},
  destination: {lat: number, lng: number},
  departure_time: timestamp,
  seats_available: number,
  price_per_seat: number,
  status: "active" | "cancelled" | "completed",
  created_at: timestamp,
  updated_at: timestamp
}
```

#### 3. **Bookings Collection**
```javascript
bookings/{bookingId} {
  ride_id: string,
  passenger_id: string,
  seats_booked: number,
  status: "pending" | "confirmed" | "cancelled",
  created_at: timestamp,
  updated_at: timestamp
}
```

#### 4. **Reviews Collection**
```javascript
reviews/{reviewId} {
  ride_id: string,
  reviewer_id: string,
  reviewee_id: string,
  rating: number (1-5),
  comment: string?,
  created_at: timestamp
}
```

#### 5. **Subcollections**

**Driver Location Tracking:**
```javascript
rides/{rideId}/driver_location/{locationId} {
  lat: number,
  lng: number,
  timestamp: timestamp,
  ride_id: string,
  driver_id: string
}
```

**In-Ride Chat:**
```javascript
rides/{rideId}/chat/{messageId} {
  sender_id: string,
  message: string,
  timestamp: timestamp,
  sender_name: string,
  is_from_driver: boolean
}
```

---

## ⚡ Real-time Features

### 1. **Location Tracking**
- **Driver App**: Updates location every 5-10 seconds
- **Passenger App**: Subscribes to location updates via Firestore listeners
- **Implementation**: Firestore real-time listeners (no WebSockets needed)

### 2. **Chat System**
- **Real-time messaging** via Firestore subcollections
- **Typing indicators** and message status
- **Media sharing** support

### 3. **Push Notifications**
- **Booking confirmations**
- **Ride updates** (driver arriving, ride started)
- **Chat messages**
- **Emergency alerts**

---

## 🚀 Deployment Guide

### **Zero-Budget Hosting Options**

#### 1. **Railway (Recommended)**
```bash
# Connect GitHub repository
# Add environment variables
# Auto-deploy on push
```

#### 2. **Render**
```bash
# Connect GitHub repository
# Select Python environment
# Add environment variables
```

#### 3. **Fly.io**
```bash
fly launch
fly deploy
```

#### 4. **Heroku**
```bash
heroku create your-app-name
git push heroku main
```

### **Environment Variables**
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_STORAGE_BUCKET=your-bucket
MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

---

## 📊 API Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

## 🔧 Frontend Integration Examples

### **React/Next.js Integration**

```javascript
// API Client
const apiClient = {
  baseURL: 'http://localhost:8000',
  
  async signup(userData) {
    const response = await fetch(`${this.baseURL}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },
  
  async searchRides(params) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}/api/v1/rides/search?${queryString}`);
    return response.json();
  }
};
```

### **Firebase Real-time Listeners**

```javascript
// Listen to driver location updates
const unsubscribe = db.collection('rides')
  .doc(rideId)
  .collection('driver_location')
  .orderBy('timestamp', 'desc')
  .limit(1)
  .onSnapshot((snapshot) => {
    snapshot.forEach((doc) => {
      const location = doc.data();
      updateDriverLocation(location.lat, location.lng);
    });
  });
```

---

## 🎯 Next Steps

1. **Set up Firebase project** with Firestore and Authentication
2. **Get Mapbox access token** (free tier)
3. **Deploy backend** to Railway/Render
4. **Build frontend** using React/Next.js
5. **Implement real-time features** with Firestore listeners
6. **Add push notifications** with FCM
7. **Test with real users** and iterate

---

**🎉 Your zero-budget ride-sharing platform is ready to scale!** 🚗💨
