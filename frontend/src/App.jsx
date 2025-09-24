import React, { useState, useEffect } from 'react';
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

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // 'welcome' | 'login' | 'forgotPassword' | 'dashboard' | 'profile'
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);

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
            setCurrentScreen('dashboard');
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
  }, []);

  const handleGetStarted = () => {
    setCurrentScreen('login');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  const handleForgotPassword = () => {
    setCurrentScreen('forgotPassword');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
  };

  const handlePasswordReset = () => {
    setCurrentScreen('login');
  };

  const handleLoginSuccess = (userData, userSessionId) => {
    setUser(userData);
    setSessionId(userSessionId);
    setCurrentScreen('dashboard');
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
      setCurrentScreen('welcome');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if backend call fails
      localStorage.removeItem('ecclesia_session');
      setUser(null);
      setSessionId(null);
      setCurrentScreen('welcome');
    }
  };

  const handleProfileClick = () => {
    setCurrentScreen('profile');
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <TitleBar />
      {currentScreen === 'welcome' && (
        <WelcomeScreen onGetStarted={handleGetStarted} />
      )}
      {currentScreen === 'login' && (
        <LoginPage
          onBack={handleBackToWelcome}
          onForgotPassword={handleForgotPassword}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {currentScreen === 'forgotPassword' && (
        <ForgotPasswordPage
          onBack={handleBackToLogin}
          onPasswordReset={handlePasswordReset}
        />
      )}
      {currentScreen === 'dashboard' && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onProfileClick={handleProfileClick}
        />
      )}
      {currentScreen === 'profile' && (
        <ProfilePage
          user={user}
          onBack={handleBackToDashboard}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </FluentProvider>
  );
}

export default App;
