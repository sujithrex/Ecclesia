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
  },
  statusCenter: {
    fontWeight: '600',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  statusRight: {
    fontWeight: '400',
  },
});

const StatusBar = () => {
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

  return (
    <div className={styles.statusBar}>
      <span className={styles.statusLeft}>Ready</span>
      <span className={styles.statusCenter}>rexmi.in</span>
      <span className={styles.statusRight}>{formatDateTime(currentTime)}</span>
    </div>
  );
};

export default StatusBar;