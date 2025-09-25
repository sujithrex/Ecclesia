import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChurchDashboard from './ChurchDashboard';

const ChurchDashboardPage = ({
  user,
  onLogout,
  onProfileClick,
  currentPastorate,
  userPastorates,
  onPastorateChange,
  onCreatePastorate,
  onEditPastorate,
  onDeletePastorate,
  currentChurch,
  userChurches,
  onChurchChange,
  onCreateChurch,
  onEditChurch,
  onDeleteChurch
}) => {
  const navigate = useNavigate();

  // Handler for switching to pastorate dashboard
  const handlePastorateDashboard = () => {
    navigate('/pastorate-dashboard');
  };

  // Handler for church selection that stays on church dashboard
  const handleChurchSelect = (church) => {
    onChurchChange(church);
    // Stay on current page since we're already on church dashboard
  };

  return (
    <ChurchDashboard
      user={user}
      onLogout={onLogout}
      onProfileClick={onProfileClick}
      currentPastorate={currentPastorate}
      userPastorates={userPastorates}
      onPastorateChange={onPastorateChange}
      onCreatePastorate={onCreatePastorate}
      onEditPastorate={onEditPastorate}
      onDeletePastorate={onDeletePastorate}
      currentChurch={currentChurch}
      userChurches={userChurches}
      onChurchChange={handleChurchSelect}
      onCreateChurch={onCreateChurch}
      onEditChurch={onEditChurch}
      onDeleteChurch={onDeleteChurch}
      currentView="church"
      onPastorateDashboard={handlePastorateDashboard}
    />
  );
};

export default ChurchDashboardPage;