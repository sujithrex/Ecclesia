import React, { createContext, useContext, useState, useCallback } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState(new Map());

  // Start loading with optional key for multiple concurrent loadings
  const startLoading = useCallback((key = 'default', options = {}) => {
    setLoadingStates(prev => {
      const newStates = new Map(prev);
      newStates.set(key, {
        isLoading: true,
        ...options
      });
      return newStates;
    });
  }, []);

  // Stop loading for specific key
  const stopLoading = useCallback((key = 'default') => {
    setLoadingStates(prev => {
      const newStates = new Map(prev);
      newStates.delete(key);
      return newStates;
    });
  }, []);

  // Check if any loading is active
  const isLoading = useCallback((key = null) => {
    if (key) {
      return loadingStates.has(key);
    }
    return loadingStates.size > 0;
  }, [loadingStates]);

  // Get loading state for specific key
  const getLoadingState = useCallback((key = 'default') => {
    return loadingStates.get(key) || null;
  }, [loadingStates]);

  // Clear all loading states
  const clearAllLoading = useCallback(() => {
    setLoadingStates(new Map());
  }, []);

  const value = {
    startLoading,
    stopLoading,
    isLoading,
    getLoadingState,
    clearAllLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {/* Global loading overlays */}
      {Array.from(loadingStates.entries()).map(([key, state]) => {
        if (state.type === 'fullscreen') {
          return (
            <LoadingSpinner
              key={key}
              type="fullscreen"
              spinner={state.spinner || 'clip'}
              text={state.text || 'Loading...'}
              subtext={state.subtext || ''}
              color={state.color || '#B5316A'}
              size={state.size || 35}
            />
          );
        }
        return null;
      })}
    </LoadingContext.Provider>
  );
};

// Higher-order component for automatic loading management
export const withLoading = (WrappedComponent, loadingKey = 'default') => {
  return function WithLoadingComponent(props) {
    const { startLoading, stopLoading, isLoading } = useLoading();
    
    return (
      <WrappedComponent
        {...props}
        startLoading={(options) => startLoading(loadingKey, options)}
        stopLoading={() => stopLoading(loadingKey)}
        isLoading={isLoading(loadingKey)}
      />
    );
  };
};

// Custom hook for async operations with loading
export const useAsyncWithLoading = () => {
  const { startLoading, stopLoading } = useLoading();

  const executeWithLoading = useCallback(async (
    asyncFn, 
    loadingKey = 'default',
    loadingOptions = {}
  ) => {
    try {
      startLoading(loadingKey, loadingOptions);
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading(loadingKey);
    }
  }, [startLoading, stopLoading]);

  return { executeWithLoading };
};