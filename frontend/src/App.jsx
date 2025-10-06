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
import CreateChurchModal from './components/CreateChurchModal';
import ChurchSelectionModal from './components/ChurchSelectionModal';
import AreaPage from './components/AreaPage';
import CreateFamilyPage from './components/CreateFamilyPage';
import FamilyPage from './components/FamilyPage';
import CreateMemberPage from './components/CreateMemberPage';
import MemberDetailsPage from './components/MemberDetailsPage';
import { LoadingProvider } from './contexts/LoadingContext';
import PastorateSettingsPage from './components/PastorateSettingsPage';
import ChurchSettingsPage from './components/ChurchSettingsPage';
import PastorateDashboardPage from './components/PastorateDashboardPage';
import ChurchDashboardPage from './components/ChurchDashboardPage';
import BirthdayListPage from './components/BirthdayListPage';
import WeddingListPage from './components/WeddingListPage';
import SabaiJabithaPage from './components/SabaiJabithaPage';
import AdultBaptismPage from './components/AdultBaptismPage';
import InfantBaptismPage from './components/InfantBaptismPage';
import LetterpadPage from './components/LetterpadPage';
import PastorateAccountsPage from './components/PastorateAccountsPage';

function App() {
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [currentPastorate, setCurrentPastorate] = useState(null);
  const [showCreatePastorateModal, setShowCreatePastorateModal] = useState(false);
  const [showPastorateSelectionModal, setShowPastorateSelectionModal] = useState(false);
  const [userPastorates, setUserPastorates] = useState([]);
  const [editingPastorate, setEditingPastorate] = useState(null);
  
  // Church state
  const [currentChurch, setCurrentChurch] = useState(null);
  const [showCreateChurchModal, setShowCreateChurchModal] = useState(false);
  const [showChurchSelectionModal, setShowChurchSelectionModal] = useState(false);
  const [userChurches, setUserChurches] = useState([]);
  const [editingChurch, setEditingChurch] = useState(null);
  const [isChurchCreationMandatory, setIsChurchCreationMandatory] = useState(false);
  
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

  const handleChurchCheck = async (userData, pastorate) => {
    try {
      // Get user's churches for this pastorate
      const churchesResult = await window.electron.church.getUserChurchesByPastorate({
        userId: userData.id,
        pastorateId: pastorate.id
      });
      
      if (churchesResult.success) {
        const churches = churchesResult.churches;
        setUserChurches(churches);
        
        if (churches.length === 0) {
          // No churches - show mandatory create church modal
          setIsChurchCreationMandatory(true);
          setShowCreateChurchModal(true);
        } else {
          setIsChurchCreationMandatory(false);
          // Check for last selected church in this pastorate
          const lastSelectedResult = await window.electron.church.getLastSelected(userData.id);
          
          if (lastSelectedResult.success && lastSelectedResult.church &&
              lastSelectedResult.church.pastorate_id === pastorate.id) {
            // Has last selected church in current pastorate - set it but navigate to pastorate dashboard
            setCurrentChurch(lastSelectedResult.church);
            navigate('/pastorate-dashboard');
          } else {
            // Has churches but no last selected in this pastorate - auto-select first church
            setCurrentChurch(churches[0]);
            // Update last selected
            await window.electron.church.select({
              userId: userData.id,
              churchId: churches[0].id
            });
            navigate('/pastorate-dashboard');
          }
        }
      } else {
        console.error('Failed to get user churches:', churchesResult.error);
        // If we can't get churches, show mandatory create modal
        setIsChurchCreationMandatory(true);
        setShowCreateChurchModal(true);
      }
    } catch (error) {
      console.error('Church check error:', error);
      setIsChurchCreationMandatory(true);
      setShowCreateChurchModal(true);
    }
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
            // Has last selected pastorate - auto-select it and check churches
            setCurrentPastorate(lastSelectedResult.pastorate);
            await handleChurchCheck(userData, lastSelectedResult.pastorate);
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
      setCurrentChurch(null);
      setUserChurches([]);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('ecclesia_session');
      setUser(null);
      setSessionId(null);
      setCurrentPastorate(null);
      setUserPastorates([]);
      setCurrentChurch(null);
      setUserChurches([]);
      navigate('/login');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleBackToDashboard = () => {
    // Navigate to the appropriate dashboard based on current context
    if (currentChurch) {
      navigate('/church-dashboard');
    } else if (currentPastorate) {
      navigate('/pastorate-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handlePastorateCreated = async (pastorate) => {
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
    
    // After creating/updating pastorate, check for churches
    await handleChurchCheck(user, pastorate);
  };

  const handlePastorateSelected = async (pastorate) => {
    setCurrentPastorate(pastorate);
    setShowPastorateSelectionModal(false);
    
    // After selecting pastorate, check for churches
    await handleChurchCheck(user, pastorate);
  };

  const handlePastorateChange = async (pastorate) => {
    setCurrentPastorate(pastorate);
    // Update the pastorates list with new last_selected_at
    setUserPastorates(prev =>
      prev.map(p =>
        p.id === pastorate.id
          ? { ...p, last_selected_at: new Date().toISOString() }
          : { ...p, last_selected_at: null }
      )
    );
    
    // Clear current church and check for churches in new pastorate
    setCurrentChurch(null);
    setUserChurches([]);
    setIsChurchCreationMandatory(false);
    await handleChurchCheck(user, pastorate);
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
          // Current pastorate was deleted - clear church data
          setCurrentPastorate(null);
          setCurrentChurch(null);
          setUserChurches([]);
          
          if (pastoratesResult.pastorates.length > 0) {
            // Still have pastorates, select the best one
            const lastSelectedResult = await window.electron.pastorate.getLastSelected(user.id);
            if (lastSelectedResult.success && lastSelectedResult.pastorate) {
              setCurrentPastorate(lastSelectedResult.pastorate);
              await handleChurchCheck(user, lastSelectedResult.pastorate);
            } else {
              const firstPastorate = pastoratesResult.pastorates[0];
              setCurrentPastorate(firstPastorate);
              await handleChurchCheck(user, firstPastorate);
            }
          } else {
            // No pastorates left - close selection modal and show create modal
            setShowPastorateSelectionModal(false);
            setShowCreatePastorateModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh pastorates after deletion:', error);
    }
  };

  // Church handlers
  const handleChurchCreated = (church) => {
    if (editingChurch) {
      // Update existing church
      setCurrentChurch(church);
      setUserChurches(prev => prev.map(c => c.id === church.id ? church : c));
    } else {
      // Add new church
      setCurrentChurch(church);
      setUserChurches(prev => [...prev, church]);
    }
    setShowCreateChurchModal(false);
    setEditingChurch(null);
    setIsChurchCreationMandatory(false);
    navigate('/pastorate-dashboard');
  };

  const handleChurchSelected = (church) => {
    setCurrentChurch(church);
    setShowChurchSelectionModal(false);
    navigate('/pastorate-dashboard');
  };

  const handleChurchChange = (church) => {
    setCurrentChurch(church);
    // Update the churches list with new last_selected_at
    setUserChurches(prev =>
      prev.map(c =>
        c.id === church.id
          ? { ...c, last_selected_at: new Date().toISOString() }
          : { ...c, last_selected_at: null }
      )
    );
  };

  const handleCreateChurchFromStatus = () => {
    setEditingChurch(null);
    setIsChurchCreationMandatory(false);
    setShowCreateChurchModal(true);
  };

  const handleEditChurch = (church) => {
    setEditingChurch(church);
    setShowCreateChurchModal(true);
  };

  const handleDeleteChurch = async () => {
    // Refresh the user's churches and current selection
    try {
      if (!currentPastorate) return;
      
      const churchesResult = await window.electron.church.getUserChurchesByPastorate({
        userId: user.id,
        pastorateId: currentPastorate.id
      });
      
      if (churchesResult.success) {
        setUserChurches(churchesResult.churches);
        
        // Check if current church still exists
        const currentExists = churchesResult.churches.some(c => c.id === currentChurch?.id);
        if (!currentExists) {
          // Current church was deleted
          setCurrentChurch(null);
          
          if (churchesResult.churches.length > 0) {
            // Still have churches, select the best one from current pastorate
            const lastSelectedResult = await window.electron.church.getLastSelected(user.id);
            if (lastSelectedResult.success && lastSelectedResult.church &&
                churchesResult.churches.some(c => c.id === lastSelectedResult.church.id)) {
              setCurrentChurch(lastSelectedResult.church);
            } else {
              // Auto-select first church and update selection
              setCurrentChurch(churchesResult.churches[0]);
              await window.electron.church.select({
                userId: user.id,
                churchId: churchesResult.churches[0].id
              });
            }
          } else {
            // No churches left - show mandatory create modal
            setIsChurchCreationMandatory(true);
            setShowCreateChurchModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh churches after deletion:', error);
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
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/pastorate-dashboard"
          element={
            user ? (
              <PastorateDashboardPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/church-dashboard"
          element={
            user ? (
              <ChurchDashboardPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
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
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/area/:areaId"
          element={
            user ? (
              <AreaPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/area/:areaId/family/create"
          element={
            user ? (
              <CreateFamilyPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/area/:areaId/family/edit/:familyId"
          element={
            user ? (
              <CreateFamilyPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/area/:areaId/family/:familyId"
          element={
            user ? (
              <FamilyPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/area/:areaId/family/:familyId/member/create"
          element={
            user ? (
              <CreateMemberPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/area/:areaId/family/:familyId/member/edit/:memberId"
          element={
            user ? (
              <CreateMemberPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/area/:areaId/family/:familyId/member/:memberId"
          element={
            user ? (
              <MemberDetailsPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/pastorate-settings"
          element={
            user ? (
              <PastorateSettingsPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/church-settings"
          element={
            user ? (
              <ChurchSettingsPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/birthday-list"
          element={
            user ? (
              <BirthdayListPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/wedding-list"
          element={
            user ? (
              <WeddingListPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/sabai-jabitha"
          element={
            user ? (
              <SabaiJabithaPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/adult-baptism"
          element={
            user ? (
              <AdultBaptismPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/infant-baptism"
          element={
            user ? (
              <InfantBaptismPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/letterpad"
          element={
            user ? (
              <LetterpadPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/pastorate-accounts"
          element={
            user ? (
              <PastorateAccountsPage
                user={user}
                currentPastorate={currentPastorate}
                userPastorates={userPastorates}
                onLogout={handleLogout}
                onProfileClick={handleProfileClick}
                onPastorateChange={handlePastorateChange}
                onCreatePastorate={handleCreatePastorateFromStatus}
                onEditPastorate={handleEditPastorate}
                onDeletePastorate={handleDeletePastorate}
                currentChurch={currentChurch}
                userChurches={userChurches}
                onChurchChange={handleChurchChange}
                onCreateChurch={handleCreateChurchFromStatus}
                onEditChurch={handleEditChurch}
                onDeleteChurch={handleDeleteChurch}
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
          onCreatePastorate={handleCreatePastorateFromStatus}
        />

        {/* Church Modals */}
        <CreateChurchModal
          isOpen={showCreateChurchModal}
          onClose={() => {
            if (!isChurchCreationMandatory) {
              setShowCreateChurchModal(false);
              setEditingChurch(null);
            }
          }}
          onSuccess={handleChurchCreated}
          user={user}
          currentPastorate={currentPastorate}
          editMode={!!editingChurch}
          initialData={editingChurch}
          mandatory={isChurchCreationMandatory}
        />
        
        <ChurchSelectionModal
          isOpen={showChurchSelectionModal}
          onClose={() => setShowChurchSelectionModal(false)}
          onSelect={handleChurchSelected}
          user={user}
          currentPastorate={currentPastorate}
          churches={userChurches}
          onCreateChurch={handleCreateChurchFromStatus}
        />
      </LoadingProvider>
    </FluentProvider>
  );
}

export default App;
