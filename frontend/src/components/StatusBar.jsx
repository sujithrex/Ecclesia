import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@fluentui/react-components';
import {
  BuildingRegular,
  ChevronUpRegular,
  CheckmarkCircleRegular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  statusBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#B5316A',
    color: 'white',
    padding: '8px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 1000,
  },
  statusLeft: {
    fontWeight: '500',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
      opacity: 0.9,
    },
  },
  statusCenter: {
    fontWeight: '600',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  statusRight: {
    fontWeight: '400',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '400',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      opacity: 0.9,
    },
  },
  divider: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  pastorateContainer: {
    position: 'relative',
    display: 'inline-block',
  },
  pastorateSelector: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      textDecoration: 'underline',
    },
  },
  pastorateDropdown: {
    position: 'absolute',
    bottom: '100%',
    left: '0',
    backgroundColor: 'white',
    border: '1px solid #e1dfdd',
    borderRadius: '6px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    minWidth: '280px',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 1001,
    marginBottom: '8px',
  },
  dropdownHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f2f1',
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    borderBottom: '1px solid #f3f2f1',
    gap: '12px',
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  dropdownItemSelected: {
    backgroundColor: '#fef9fc',
    borderLeft: '3px solid #B5316A',
  },
  dropdownItemIcon: {
    fontSize: '16px',
    color: '#B5316A',
    flexShrink: 0,
  },
  dropdownItemContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  dropdownItemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
  },
  dropdownItemShortName: {
    fontSize: '12px',
    color: '#605e5c',
    fontWeight: '500',
  },
  dropdownItemCheck: {
    fontSize: '16px',
    color: '#B5316A',
    flexShrink: 0,
  },
  createPastorateItem: {
    borderTop: '1px solid #f3f2f1',
    color: '#B5316A',
    fontWeight: '600',
    '&:hover': {
      backgroundColor: '#fef9fc',
    },
  },
  loadingDropdown: {
    padding: '20px',
    textAlign: 'center',
    color: '#605e5c',
  },
});

const StatusBar = ({
  user,
  onLogout,
  onProfileClick,
  currentPastorate,
  onPastorateChange,
  onCreatePastorate
}) => {
  const styles = useStyles();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPastorateDropdown, setShowPastorateDropdown] = useState(false);
  const [userPastorates, setUserPastorates] = useState([]);
  const [loadingPastorates, setLoadingPastorates] = useState(false);
  const dropdownRef = useRef(null);
  const pastorateButtonRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showPastorateDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        pastorateButtonRef.current &&
        !pastorateButtonRef.current.contains(event.target)
      ) {
        setShowPastorateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPastorateDropdown]);

  // Load user pastorates when dropdown opens
  useEffect(() => {
    if (showPastorateDropdown && user && userPastorates.length === 0) {
      loadUserPastorates();
    }
  }, [showPastorateDropdown, user]);

  const loadUserPastorates = async () => {
    if (!user) return;
    
    setLoadingPastorates(true);
    try {
      const result = await window.electron.pastorate.getUserPastorates(user.id);
      if (result.success) {
        setUserPastorates(result.pastorates);
      }
    } catch (error) {
      console.error('Load pastorates error:', error);
    } finally {
      setLoadingPastorates(false);
    }
  };

  const handlePastorateClick = () => {
    if (currentPastorate) {
      setShowPastorateDropdown(!showPastorateDropdown);
    }
  };

  const handlePastorateSelect = async (pastorate) => {
    if (pastorate.id !== currentPastorate?.id && onPastorateChange) {
      try {
        const result = await window.electron.pastorate.select({
          userId: user.id,
          pastorateId: pastorate.id
        });

        if (result.success) {
          onPastorateChange(result.pastorate);
          setShowPastorateDropdown(false);
        }
      } catch (error) {
        console.error('Switch pastorate error:', error);
      }
    }
  };

  const handleCreatePastorate = () => {
    setShowPastorateDropdown(false);
    if (onCreatePastorate) {
      onCreatePastorate();
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick && user) {
      onProfileClick();
    }
  };

  return (
    <div className={styles.statusBar}>
      <span
        className={styles.statusLeft}
        onClick={handleProfileClick}
        style={{ cursor: (user && onProfileClick) ? 'pointer' : 'default' }}
        title={user && onProfileClick ? 'Click to view profile' : (user ? 'Profile' : '')}
      >
        {user ? user.name || user.username : 'Ready'}
      </span>
      
      {/* Center section with pastorate info */}
      <div className={styles.statusCenter}>
        {currentPastorate ? (
          <div className={styles.pastorateContainer}>
            <button
              ref={pastorateButtonRef}
              className={styles.pastorateSelector}
              onClick={handlePastorateClick}
              title="Click to switch pastorate"
            >
              <BuildingRegular />
              Pastorate: {currentPastorate.pastorate_name} ({currentPastorate.pastorate_short_name})
              <ChevronUpRegular />
            </button>
            
            {showPastorateDropdown && (
              <div ref={dropdownRef} className={styles.pastorateDropdown}>
                <div className={styles.dropdownHeader}>
                  <BuildingRegular />
                  Switch Pastorate
                </div>
                
                {loadingPastorates ? (
                  <div className={styles.loadingDropdown}>
                    Loading pastorates...
                  </div>
                ) : (
                  <>
                    {userPastorates.map((pastorate) => (
                      <div
                        key={pastorate.id}
                        className={`${styles.dropdownItem} ${
                          currentPastorate.id === pastorate.id ? styles.dropdownItemSelected : ''
                        }`}
                        onClick={() => handlePastorateSelect(pastorate)}
                      >
                        <div className={styles.dropdownItemIcon}>
                          <BuildingRegular />
                        </div>
                        <div className={styles.dropdownItemContent}>
                          <div className={styles.dropdownItemName}>
                            {pastorate.pastorate_name}
                          </div>
                          <div className={styles.dropdownItemShortName}>
                            {pastorate.pastorate_short_name}
                          </div>
                        </div>
                        {currentPastorate.id === pastorate.id && (
                          <div className={styles.dropdownItemCheck}>
                            <CheckmarkCircleRegular />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div
                      className={`${styles.dropdownItem} ${styles.createPastorateItem}`}
                      onClick={handleCreatePastorate}
                    >
                      <div className={styles.dropdownItemIcon}>
                        <BuildingRegular />
                      </div>
                      <div className={styles.dropdownItemContent}>
                        <div className={styles.dropdownItemName}>
                          Create New Pastorate
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          'rexmi.in'
        )}
      </div>
      
      <div className={styles.statusRight}>
        {user && (
          <>
            <button
              className={styles.logoutButton}
              onClick={handleLogout}
              title="Click to logout"
            >
              Logout
            </button>
            <span className={styles.divider}>|</span>
          </>
        )}
        <span>{formatDateTime(currentTime)}</span>
      </div>
    </div>
  );
};

export default StatusBar;