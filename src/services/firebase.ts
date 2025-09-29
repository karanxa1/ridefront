import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVVeldANUrehfGZhgXUR5aePapay3Xgsk",
  authDomain: "durvesh-ff5c1.firebaseapp.com",
  projectId: "durvesh-ff5c1",
  storageBucket: "durvesh-ff5c1.firebasestorage.app",
  messagingSenderId: "1055984089991",
  appId: "1:1055984089991:web:375540eabd2ff233437122",
  measurementId: "G-0B5K4SR72Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize messaging (for push notifications)
let messaging: any = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase messaging not available:', error);
  }
}

// Connect to emulators in development
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulators already connected or not available
    console.warn('Firebase emulators not connected:', error);
  }
}

// FCM token management
export const getFCMToken = async (): Promise<string | null> => {
  if (!messaging) return null;
  
  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, callback);
};

// Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  RIDES: 'rides',
  BOOKINGS: 'bookings',
  REVIEWS: 'reviews',
  DRIVER_LOCATIONS: 'driver_locations',
  CHAT_MESSAGES: 'chat_messages',
} as const;

export default app;