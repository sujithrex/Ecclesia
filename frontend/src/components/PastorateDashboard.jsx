import React, { useState, useEffect } from 'react';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  PeopleRegular,
  BuildingRegular,
  AddRegular,
  SearchRegular
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
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

  if (!currentPastorate) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={`Pastorate Dashboard - ${currentPastorate.pastorate_name}`}
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
        {/* Welcome Section */}
        <div className={styles.welcomeContainer}>
          <h1 className={styles.welcomeTitle}>Pastorate Dashboard</h1>
          <h2 className={styles.welcomeSubtitle}>Welcome to {currentPastorate.pastorate_name}</h2>
          <p className={styles.welcomeMessage}>
            Overview of all churches, families, and members within this pastorate.
            Manage your entire pastorate from this centralized dashboard.
          </p>
          <div className={styles.pastorateInfo}>
            <div className={styles.pastorateIcon}>
              <BuildingRegular />
            </div>
            <div className={styles.pastorateDetails}>
              <div className={styles.pastorateName}>{currentPastorate.pastorate_name}</div>
              <div className={styles.pastorateShortName}>{currentPastorate.pastorate_short_name}</div>
            </div>
          </div>
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