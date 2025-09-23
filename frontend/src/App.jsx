import React from 'react';
import {
  FluentProvider,
  webLightTheme,
} from '@fluentui/react-components';
import WelcomeScreen from './components/WelcomeScreen';

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <WelcomeScreen />
    </FluentProvider>
  );
}

export default App;
