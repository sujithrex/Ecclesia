import React from 'react';
import { useNavigate } from 'react-router-dom';
import PastorateDashboard from './PastorateDashboard';

const PastorateDashboardPage = ({
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

  // Handler for switching back to church dashboard
  const handleChurchSelect = (church) => {
    onChurchChange(church);
    navigate('/church-dashboard');
  };

  return (
    <PastorateDashboard
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
    />
  );
};

export default PastorateDashboardPage;