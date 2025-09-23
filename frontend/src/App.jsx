import React, { useState } from 'react';
import {
  FluentProvider,
  webLightTheme,
} from '@fluentui/react-components';
import WelcomeScreen from './components/WelcomeScreen';
import LoginPage from './components/LoginPage';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome'); // 'welcome' | 'login'

  const handleGetStarted = () => {
    setCurrentScreen('login');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  return (
    <FluentProvider theme={webLightTheme}>
      {currentScreen === 'welcome' && (
        <WelcomeScreen onGetStarted={handleGetStarted} />
      )}
      {currentScreen === 'login' && (
        <LoginPage onBack={handleBackToWelcome} />
      )}
    </FluentProvider>
  );
}

export default App;
