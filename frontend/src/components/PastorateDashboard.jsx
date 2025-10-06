import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  PeopleRegular,
  BuildingRegular,
  AddRegular,
  SearchRegular,
  SettingsRegular,
  DocumentRegular,
  MoneyRegular
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 32px)',
    backgroundColor: '#f8f8f8',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: '20px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: '0',
  },
  welcomeContainer: {
    textAlign: 'center',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '40px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    marginBottom: '24px',
  },
  welcomeTitle: {
    fontSize: '48px',
    fontWeight: '300',
    color: '#B5316A',
    margin: '0 0 16px 0',
    fontFamily: 'Meribold, Segoe UI, sans-serif',
  },
  welcomeSubtitle: {
    fontSize: '24px',
    fontWeight: '400',
    color: '#323130',
    margin: '0 0 24px 0',
  },
  welcomeMessage: {
    fontSize: '16px',
    color: '#605e5c',
    lineHeight: '1.5',
    marginBottom: '32px',
  },
  pastorateInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#f8f8f8',
    borderRadius: '8px',
    border: '1px solid #e1dfdd',
  },
  pastorateIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    backgroundColor: '#B5316A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '20px',
    fontWeight: '600',
  },
  pastorateDetails: {
    textAlign: 'left',
  },
  pastorateName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#323130',
    margin: '0 0 4px 0',
  },
  pastorateShortName: {
    fontSize: '14px',
    color: '#605e5c',
    margin: '0',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '20px',
    marginBottom: '24px',
  },
  statsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  settingsButton: {
    padding: '8px 16px',
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#8E2654',
    }
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    }
  },
  statIcon: {
    fontSize: '32px',
    color: '#B5316A',
  },
  statLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#323130',
    textAlign: 'center',
    fontFamily: 'Pavanam, Segoe UI, sans-serif',
    lineHeight: '1.4',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#B5316A',
  },
  buttonRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '24px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    minWidth: '180px',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: '#A12B5E',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(181, 49, 106, 0.3)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
});

const PastorateDashboard = ({
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
  const styles = useStyles();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalChurches: 0,
    totalFamilies: 0,
    totalMembers: 0,
    totalBaptised: 0,
    totalConfirmed: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  // Build stats array from dynamic data
  const stats = [
    {
      icon: <BuildingRegular />,
      label: 'Churches',
      value: statistics.totalChurches,
    },
    {
      icon: <HomeRegular />,
      label: 'Total Families',
      value: statistics.totalFamilies,
    },
    {
      icon: <PeopleRegular />,
      label: 'Total Members',
      value: statistics.totalMembers,
    },
    {
      icon: <PeopleRegular />,
      label: 'Baptised',
      value: statistics.totalBaptised,
    },
    {
      icon: <PeopleRegular />,
      label: 'Confirmed',
      value: statistics.totalConfirmed,
    },
  ];

  // Load pastorate statistics when pastorate changes
  useEffect(() => {
    if (currentPastorate && user) {
      loadPastorateStatistics();
    }
  }, [currentPastorate?.id, user?.id]);

  const loadPastorateStatistics = async () => {
    if (!currentPastorate || !user) return;
    
    setStatsLoading(true);
    try {
      const result = await window.electron.pastorate.getStatistics({
        pastorateId: currentPastorate.id,
        userId: user.id
      });
      
      if (result.success) {
        setStatistics(result.statistics);
      } else {
        console.error('Failed to load pastorate statistics:', result.error);
        setStatistics({
          totalChurches: userChurches?.length || 0,
          totalFamilies: 0,
          totalMembers: 0,
          totalBaptised: 0,
          totalConfirmed: 0
        });
      }
    } catch (error) {
      console.error('Error loading pastorate statistics:', error);
      setStatistics({
        totalChurches: userChurches?.length || 0,
        totalFamilies: 0,
        totalMembers: 0,
        totalBaptised: 0,
        totalConfirmed: 0
      });
    } finally {
      setStatsLoading(false);
      setLoading(false);
    }
  };

  const handlePastorateSettings = () => {
    navigate('/pastorate-settings');
  };

  const handleAdultBaptism = () => {
    navigate('/adult-baptism');
  };

  const handleInfantBaptism = () => {
    navigate('/infant-baptism');
  };

  const handleLetterpad = () => {
    navigate('/letterpad');
  };

  const handleAccounts = () => {
    navigate('/pastorate-accounts');
  };

  if (!currentPastorate) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={`${currentPastorate.pastorate_name}`}
        breadcrumbs={[
          {
            label: 'Pastorate Dashboard',
            icon: <HomeRegular />,
            current: true
          }
        ]}
        onNavigate={() => {}}
      />

      {/* Content */}
      <div className={styles.content}>
        {/* Stats Header with Settings Button */}
        <div className={styles.statsHeader}>
          <div></div>
          <button
            className={styles.settingsButton}
            onClick={handlePastorateSettings}
            title="Pastorate Settings"
          >
            <SettingsRegular fontSize={16} />
            Pastorate Settings
          </button>
        </div>

        {/* Statistics Cards */}
        <div className={styles.statsContainer}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statIcon}>
                {stat.icon}
              </div>
              <div className={styles.statLabel}>
                {stat.label}
              </div>
              <div className={styles.statValue}>
                {statsLoading ? '...' : stat.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className={styles.buttonRow}>
          <button
            className={styles.actionButton}
            onClick={handleAccounts}
            type="button"
          >
            <MoneyRegular />
            Accounts
          </button>
          <button
            className={styles.actionButton}
            onClick={handleAdultBaptism}
            type="button"
          >
            <DocumentRegular />
            Certificate - Adult Bap
          </button>
          <button
            className={styles.actionButton}
            onClick={handleInfantBaptism}
            type="button"
          >
            <DocumentRegular />
            Certificate - Infant Bap
          </button>
          <button
            className={styles.actionButton}
            onClick={handleLetterpad}
            type="button"
          >
            <DocumentRegular />
            Letterpad
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
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
        onChurchChange={onChurchChange}
        onCreateChurch={onCreateChurch}
        onEditChurch={onEditChurch}
        onDeleteChurch={onDeleteChurch}
        currentView="pastorate"
      />

    </div>
  );
};

export default PastorateDashboard;