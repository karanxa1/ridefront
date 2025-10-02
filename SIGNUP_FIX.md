# Signup API Fix - Phone Field Issue

## Problem
The signup API was returning a 422 Unprocessable Content error with the message:
```
Validation Error: body.phone: Field required
```

## Root Cause
The backend API (`/api/v1/auth/signup`) was updated to require a `phone` field instead of a `role` field, but the frontend was still sending `role` in the signup request.

### Backend Expected (Updated):
```python
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str  # ✅ Required field
```

### Frontend Was Sending (Old):
```typescript
interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: 'passenger' | 'driver';  // ❌ Wrong field
}
```

## Solution

### 1. Updated API Interface (`src/services/api.ts`)

**Before:**
```typescript
interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role: 'passenger' | 'driver';  // ❌ Old field
}
```

**After:**
```typescript
interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone: string;  // ✅ Correct field
}
```

### 2. Updated Auth Service (`src/services/auth.ts`)

**Before:**
```typescript
const signupData: SignupRequest = {
  email: credentials.email,
  password: credentials.password,
  name: credentials.name,
  role: credentials.role  // ❌ Wrong field
};
```

**After:**
```typescript
const signupData: SignupRequest = {
  email: credentials.email,
  password: credentials.password,
  name: credentials.name,
  phone: credentials.phone  // ✅ Correct field
};
```

## Type Safety

The `SignupCredentials` interface in `src/types/index.ts` was already correct:
```typescript
export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  phone: string;  // ✅ Already had phone field
}
```

This means the signup form was already collecting the phone number, but the API service wasn't sending it to the backend.

## Verification

### Frontend Signup Flow:
1. User fills out signup form with:
   - Name
   - Email
   - Phone (validated for Indian phone numbers)
   - Password
   - Confirm Password

2. Frontend validates phone number format:
   - Must be 10 digits starting with 6-9
   - Supports formats: +91XXXXXXXXXX, 91XXXXXXXXXX, or XXXXXXXXXX
   - Automatically normalizes to +91XXXXXXXXXX

3. Frontend sends to backend:
   ```json
   {
     "email": "user@example.com",
     "password": "securepassword",
     "name": "John Doe",
     "phone": "+919876543210"
   }
   ```

4. Backend validates and creates user:
   - Creates Firebase Auth user
   - Stores user data in Firestore with phone
   - Returns success response

## Testing

### Test Signup with:
```
Name: Test User
Email: test@example.com
Phone: 9876543210 (or +919876543210)
Password: Test@1234
Confirm Password: Test@1234
```

Expected Result: ✅ User created successfully

### SIH Demo Credentials:
```
Email: karanravirajput2@gmail.com
Password: 12345678
```
(This account should already exist, use for login testing)

## Status
✅ **FIXED** - Signup now sends phone field correctly to backend API

## Files Modified
1. `src/services/api.ts` - Updated SignupRequest interface
2. `src/services/auth.ts` - Updated signUp method to send phone

## Related Features
- Phone number validation on frontend (Indian phone format)
- Backend phone number validation (same format)
- User profile includes phone number
- Phone stored in Firestore user document

## Impact
- ✅ New user signups now work correctly
- ✅ Phone number properly validated and stored
- ✅ No breaking changes to existing users
- ✅ Login functionality unaffected

---

**Fix Applied:** December 2025  
**Issue:** Signup 422 Error - Phone field required  
**Resolution Time:** Immediate  
**Status:** ✅ Resolved