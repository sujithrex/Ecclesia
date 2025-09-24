import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  FluentProvider,
  webLightTheme,
} from '@fluentui/react-components';
import TitleBar from './components/TitleBar';
import WelcomeScreen from './components/WelcomeScreen';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import { LoadingProvider } from './contexts/LoadingContext';

function App() {
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  // Check for existing session on app startup
  useEffect(() => {
    const checkExistingSession = async () => {
      const savedSessionId = localStorage.getItem('ecclesia_session');
      if (savedSessionId) {
        try {
          const result = await window.electron.auth.checkSession(savedSessionId);
          if (result.success) {
            setUser(result.user);
            setSessionId(savedSessionId);
            navigate('/dashboard');
          } else {
            localStorage.removeItem('ecclesia_session');
          }
        } catch (error) {
          console.error('Session check failed:', error);
          localStorage.removeItem('ecclesia_session');
        }
      }
    };

    // Only check session if electron API is available
    if (window.electron && window.electron.auth) {
      checkExistingSession();
    }
  }, [navigate]);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleBackToWelcome = () => {
    navigate('/');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handlePasswordReset = () => {
    navigate('/login');
  };

  const handleLoginSuccess = (userData, userSessionId) => {
    setUser(userData);
    setSessionId(userSessionId);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      // Call backend logout
      if (sessionId) {
        await window.electron.auth.logout();
      }
      
      // Clear local storage
      localStorage.removeItem('ecclesia_session');
      
      // Reset state
      setUser(null);
      setSessionId(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if backend call fails
      localStorage.removeItem('ecclesia_session');
      setUser(null);
      setSessionId(null);
      navigate('/login');
    }
  };

  const handleProfileClick = () => {
    if (isNavigating) return; // Prevent double navigation
    setIsNavigating(true);
    navigate('/profile');
    // Reset navigation flag after a short delay
    setTimeout(() => setIsNavigating(false), 500);
  };

  const handleBackToDashboard = () => {
    if (isNavigating) return; // Prevent double navigation
    setIsNavigating(true);
    navigate('/dashboard');
    // Reset navigation flag after a short delay
    setTimeout(() => setIsNavigating(false), 500);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <LoadingProvider>
        <TitleBar />
        <Routes>
        <Route path="/" element={<WelcomeScreen onGetStarted={handleGetStarted} />} />
        <Route
          path="/login"
          element={
            <LoginPage
              onBack={handleBackToWelcome}
              onForgotPassword={handleForgotPassword}
              onLoginSuccess={handleLoginSuccess}
            />
          }
        />
        <Route
          path="/forgot-password"
          element={
            <ForgotPasswordPage
              onBack={handleBackToLogin}
              onPasswordReset={handlePasswordReset}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard
                user={user}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            user ? (
              <ProfilePage
                user={user}
                onBack={handleBackToDashboard}
                onProfileUpdate={handleProfileUpdate}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LoadingProvider>
    </FluentProvider>
  );
}

export default App;
