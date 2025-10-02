import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useStore } from './hooks/useStore';
import { AuthGuard } from './components/AuthGuard';
import { LoadingSpinner } from './components/LoadingSpinner';

// Pages
import {
  LandingPage,
  LoginPage,
  SignupPage,
  HomePage,
  RideSearchPage,
  CreateRidePage,
  RequestRidePage,
  RideDetailsPage,
  RideTrackingPage,
  ChatPage,
  ProfilePage,
  SettingsPage,
  RideHistoryPage,
  NotificationsPage,
  MapViewPage,
  BookingsPage,
} from './pages';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

function App() {
  const { initialize, isLoading, isAuthenticated, theme } = useStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
      >
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/home" replace /> : <LandingPage />}
          />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/home" replace /> : <SignupPage />}
          />
          <Route
            path="/forgot-password"
            element={isAuthenticated ? <Navigate to="/home" replace /> : <ForgotPasswordPage />}
          />

          {/* Public Map View */}
          <Route path="/map" element={<MapViewPage />} />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <AuthGuard>
                <HomePage />
              </AuthGuard>
            }
          />

          <Route
            path="/search"
            element={
              <AuthGuard>
                <RideSearchPage />
              </AuthGuard>
            }
          />

          <Route
            path="/bookings"
            element={
              <AuthGuard>
                <BookingsPage />
              </AuthGuard>
            }
          />

          <Route
            path="/create-ride"
            element={
              <AuthGuard>
                <CreateRidePage />
              </AuthGuard>
            }
          />

          <Route
            path="/request-ride"
            element={
              <AuthGuard>
                <RequestRidePage />
              </AuthGuard>
            }
          />

          <Route
            path="/ride/:id"
            element={
              <AuthGuard>
                <RideDetailsPage />
              </AuthGuard>
            }
          />

          <Route
            path="/ride/:id/track"
            element={
              <AuthGuard>
                <RideTrackingPage />
              </AuthGuard>
            }
          />

          <Route
            path="/chat/:rideId"
            element={
              <AuthGuard>
                <ChatPage />
              </AuthGuard>
            }
          />

          <Route
            path="/profile"
            element={
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            }
          />

          <Route
            path="/settings"
            element={
              <AuthGuard>
                <SettingsPage />
              </AuthGuard>
            }
          />

          <Route
            path="/history"
            element={
              <AuthGuard>
                <RideHistoryPage />
              </AuthGuard>
            }
          />

          <Route
            path="/notifications"
            element={
              <AuthGuard>
                <NotificationsPage />
              </AuthGuard>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/home' : '/'} replace />} />
        </Routes>

        {/* Toast notifications */}
        <Toaster position="top-center" richColors closeButton duration={4000} />
      </div>
    </Router>
  );
}

export default App;
