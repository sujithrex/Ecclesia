import React, { useState } from 'react';
import {
  FluentProvider,
  webLightTheme,
} from '@fluentui/react-components';
import TitleBar from './components/TitleBar';
import WelcomeScreen from './components/WelcomeScreen';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import Dashboard from './components/Dashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // 'welcome' | 'login' | 'forgotPassword' | 'dashboard'

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

  const handleLoginSuccess = () => {
    setCurrentScreen('dashboard');
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
        <ForgotPasswordPage onBack={handleBackToLogin} />
      )}
      {currentScreen === 'dashboard' && (
        <Dashboard />
      )}
    </FluentProvider>
  );
}

export default App;
