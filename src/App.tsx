import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useStore } from './hooks/useStore';
import { AuthGuard } from './components/AuthGuard';
import { LoadingSpinner } from './components/LoadingSpinner';

// Pages
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { HomePage } from './pages/HomePage';
import { RideSearchPage } from './pages/RideSearchPage';
import { CreateRidePage } from './pages/CreateRidePage';
import RequestRidePage from './pages/RequestRidePage';
import { RideDetailsPage } from './pages/RideDetailsPage';
import { RideTrackingPage } from './pages/RideTrackingPage';
import { ChatPage } from './pages/ChatPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { RideHistoryPage } from './pages/RideHistoryPage';
import { NotificationsPage } from './pages/NotificationsPage';
import MapViewPage from './pages/MapViewPage';

function App() {
  const { initialize, isLoading, isAuthenticated } = useStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
            } 
          />
          <Route 
            path="/signup" 
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />
            } 
          />
          
          {/* Protected routes */}
          <Route path="/" element={
            <AuthGuard>
              <HomePage />
            </AuthGuard>
          } />
          
          <Route path="/search" element={
            <AuthGuard>
              <RideSearchPage />
            </AuthGuard>
          } />
          
          <Route path="/map" element={
            <AuthGuard>
              <MapViewPage />
            </AuthGuard>
          } />
          
          <Route path="/create-ride" element={
            <AuthGuard>
              <CreateRidePage />
            </AuthGuard>
          } />
          
          <Route path="/request-ride" element={
            <AuthGuard>
              <RequestRidePage />
            </AuthGuard>
          } />
          
          <Route path="/ride/:id" element={
            <AuthGuard>
              <RideDetailsPage />
            </AuthGuard>
          } />
          
          <Route path="/ride/:id/track" element={
            <AuthGuard>
              <RideTrackingPage />
            </AuthGuard>
          } />
          
          <Route path="/chat/:rideId" element={
            <AuthGuard>
              <ChatPage />
            </AuthGuard>
          } />
          
          <Route path="/profile" element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          } />
          
          <Route path="/settings" element={
            <AuthGuard>
              <SettingsPage />
            </AuthGuard>
          } />
          
          <Route path="/history" element={
            <AuthGuard>
              <RideHistoryPage />
            </AuthGuard>
          } />
          
          <Route path="/notifications" element={
            <AuthGuard>
              <NotificationsPage />
            </AuthGuard>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={
            <Navigate to={isAuthenticated ? "/" : "/login"} replace />
          } />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-center"
          richColors
          closeButton
          duration={4000}
        />
      </div>
    </Router>
  );
}

export default App;
