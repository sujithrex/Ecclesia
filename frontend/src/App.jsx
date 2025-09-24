import React, { useState } from 'react';
import {
  FluentProvider,
  webLightTheme,
} from '@fluentui/react-components';
import TitleBar from './components/TitleBar';
import WelcomeScreen from './components/WelcomeScreen';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // 'welcome' | 'login' | 'forgotPassword'

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
        />
      )}
      {currentScreen === 'forgotPassword' && (
        <ForgotPasswordPage onBack={handleBackToLogin} />
      )}
    </FluentProvider>
  );
}

export default App;
