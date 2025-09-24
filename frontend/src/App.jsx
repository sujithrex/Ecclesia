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
import CreatePastorateModal from './components/CreatePastorateModal';
import PastorateSelectionModal from './components/PastorateSelectionModal';
import { LoadingProvider } from './contexts/LoadingContext';

function App() {
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [currentPastorate, setCurrentPastorate] = useState(null);
  const [showCreatePastorateModal, setShowCreatePastorateModal] = useState(false);
  const [showPastorateSelectionModal, setShowPastorateSelectionModal] = useState(false);
  const [userPastorates, setUserPastorates] = useState([]);
  const [editingPastorate, setEditingPastorate] = useState(null);
  const navigate = useNavigate();

  // Check for existing session ONLY on app startup
  useEffect(() => {
    const checkExistingSession = async () => {
      const savedSessionId = localStorage.getItem('ecclesia_session');
      if (savedSessionId) {
        try {
          const result = await window.electron.auth.checkSession(savedSessionId);
          if (result.success) {
            setUser(result.user);
            setSessionId(savedSessionId);
            // Check pastorate after successful session validation
            await handlePastorateCheck(result.user);
          } else {
            localStorage.removeItem('ecclesia_session');
          }
        } catch (error) {
          console.error('Session check failed:', error);
          localStorage.removeItem('ecclesia_session');
        }
      }
    };

    if (window.electron && window.electron.auth) {
      checkExistingSession();
    }
  }, []); // Remove navigate dependency - this should only run on mount

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

  const handlePastorateCheck = async (userData) => {
    try {
      // Get user's pastorates
      const pastoratesResult = await window.electron.pastorate.getUserPastorates(userData.id);
      
      if (pastoratesResult.success) {
        const pastorates = pastoratesResult.pastorates;
        setUserPastorates(pastorates);
        
        if (pastorates.length === 0) {
          // No pastorates - show create pastorate modal
          setShowCreatePastorateModal(true);
        } else {
          // Check for last selected pastorate
          const lastSelectedResult = await window.electron.pastorate.getLastSelected(userData.id);
          
          if (lastSelectedResult.success && lastSelectedResult.pastorate) {
            // Has last selected pastorate - auto-select it
            setCurrentPastorate(lastSelectedResult.pastorate);
            navigate('/dashboard');
          } else {
            // Has pastorates but no last selected - show selection modal
            setShowPastorateSelectionModal(true);
          }
        }
      } else {
        console.error('Failed to get user pastorates:', pastoratesResult.error);
        // If we can't get pastorates, show create modal
        setShowCreatePastorateModal(true);
      }
    } catch (error) {
      console.error('Pastorate check error:', error);
      setShowCreatePastorateModal(true);
    }
  };

  const handleLoginSuccess = async (userData, userSessionId) => {
    setUser(userData);
    setSessionId(userSessionId);
    // Check pastorate logic after successful login
    await handlePastorateCheck(userData);
  };

  const handleLogout = async () => {
    try {
      if (sessionId) {
        await window.electron.auth.logout();
      }
      localStorage.removeItem('ecclesia_session');
      setUser(null);
      setSessionId(null);
      setCurrentPastorate(null);
      setUserPastorates([]);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('ecclesia_session');
      setUser(null);
      setSessionId(null);
      setCurrentPastorate(null);
      setUserPastorates([]);
      navigate('/login');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handlePastorateCreated = (pastorate) => {
    if (editingPastorate) {
      // Update existing pastorate
      setCurrentPastorate(pastorate);
      setUserPastorates(prev => prev.map(p => p.id === pastorate.id ? pastorate : p));
    } else {
      // Add new pastorate
      setCurrentPastorate(pastorate);
      setUserPastorates(prev => [...prev, pastorate]);
    }
    setShowCreatePastorateModal(false);
    setEditingPastorate(null);
    navigate('/dashboard');
  };

  const handlePastorateSelected = (pastorate) => {
    setCurrentPastorate(pastorate);
    setShowPastorateSelectionModal(false);
    navigate('/dashboard');
  };

  const handlePastorateChange = (pastorate) => {
    setCurrentPastorate(pastorate);
    // Update the pastorates list with new last_selected_at
    setUserPastorates(prev =>
      prev.map(p =>
        p.id === pastorate.id
          ? { ...p, last_selected_at: new Date().toISOString() }
          : { ...p, last_selected_at: null }
      )
    );
  };

  const handleCreatePastorateFromStatus = () => {
    setEditingPastorate(null);
    setShowCreatePastorateModal(true);
  };

  const handleEditPastorate = (pastorate) => {
    setEditingPastorate(pastorate);
    setShowCreatePastorateModal(true);
  };

  const handleDeletePastorate = async () => {
    // Refresh the user's pastorates and current selection
    try {
      const pastoratesResult = await window.electron.pastorate.getUserPastorates(user.id);
      
      if (pastoratesResult.success) {
        setUserPastorates(pastoratesResult.pastorates);
        
        // Check if current pastorate still exists
        const currentExists = pastoratesResult.pastorates.some(p => p.id === currentPastorate?.id);
        if (!currentExists) {
          // Current pastorate was deleted, select the first available or clear
          if (pastoratesResult.pastorates.length > 0) {
            const lastSelectedResult = await window.electron.pastorate.getLastSelected(user.id);
            if (lastSelectedResult.success && lastSelectedResult.pastorate) {
              setCurrentPastorate(lastSelectedResult.pastorate);
            } else {
              setCurrentPastorate(pastoratesResult.pastorates[0]);
            }
          } else {
            setCurrentPastorate(null);
            setShowCreatePastorateModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh pastorates after deletion:', error);
    }
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
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
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
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onBack={handleBackToDashboard}
                onProfileUpdate={handleProfileUpdate}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Pastorate Modals */}
        <CreatePastorateModal
          isOpen={showCreatePastorateModal}
          onClose={() => {
            setShowCreatePastorateModal(false);
            setEditingPastorate(null);
          }}
          onSuccess={handlePastorateCreated}
          user={user}
          editMode={!!editingPastorate}
          initialData={editingPastorate}
        />
        
        <PastorateSelectionModal
          isOpen={showPastorateSelectionModal}
          onClose={() => setShowPastorateSelectionModal(false)}
          onSelect={handlePastorateSelected}
          user={user}
          pastorates={userPastorates}
        />
      </LoadingProvider>
    </FluentProvider>
  );
}

export default App;
