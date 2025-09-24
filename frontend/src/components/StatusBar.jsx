import React, { useState, useEffect } from 'react';
import { makeStyles } from '@fluentui/react-components';

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
});

const StatusBar = ({ user, onLogout, onProfileClick }) => {
  const styles = useStyles();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
        style={{ cursor: user ? 'pointer' : 'default' }}
        title={user ? 'Click to view profile' : ''}
      >
        {user ? user.name || user.username : 'Ready'}
      </span>
      <span className={styles.statusCenter}>rexmi.in</span>
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