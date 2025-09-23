import React from 'react';
import { makeStyles } from '@fluentui/react-components';
import {
  BuildingRegular,
  PeopleRegular,
  DocumentRegular,
  CalendarRegular,
  SettingsRegular,
  CloudRegular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f8f8f8',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
  },
  iconsContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '60px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  appIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px',
  },
  cloudIcon: {
    backgroundColor: '#0078d4',
  },
  excelIcon: {
    backgroundColor: '#107c41',
  },
  outlookIcon: {
    backgroundColor: '#0078d4',
  },
  powerpointIcon: {
    backgroundColor: '#b7472a',
  },
  wordIcon: {
    backgroundColor: '#2b579a',
  },
  teamsIcon: {
    backgroundColor: '#6264a7',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '300',
    color: '#323130',
    margin: '0 0 20px 0',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '14px',
    color: '#605e5c',
    lineHeight: '1.4',
    marginBottom: '40px',
    maxWidth: '400px',
  },
  getStartedButton: {
    backgroundColor: '#6264a7',
    color: 'white',
    border: 'none',
    borderRadius: '2px',
    padding: '12px 32px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#464775',
    },
    '&:focus': {
      outline: '2px solid #6264a7',
      outlineOffset: '2px',
    }
  },
});

const WelcomeScreen = ({ onGetStarted }) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      {/* Main Content */}
      <div className={styles.content}>
        {/* App Icons */}
        <div className={styles.iconsContainer}>
          <div className={`${styles.appIcon} ${styles.cloudIcon}`}>
            <CloudRegular />
          </div>
          <div className={`${styles.appIcon} ${styles.excelIcon}`}>
            <DocumentRegular />
          </div>
          <div className={`${styles.appIcon} ${styles.outlookIcon}`}>
            <PeopleRegular />
          </div>
          <div className={`${styles.appIcon} ${styles.powerpointIcon}`}>
            <CalendarRegular />
          </div>
          <div className={`${styles.appIcon} ${styles.wordIcon}`}>
            <DocumentRegular />
          </div>
          <div className={`${styles.appIcon} ${styles.teamsIcon}`}>
            <BuildingRegular />
          </div>
        </div>

        {/* Welcome Text */}
        <h1 className={styles.welcomeTitle}>Welcome to Ecclesia!</h1>
        <p className={styles.subtitle}>
          Manage your church community with ease using your administrative account.
          Switch to full application to access all church management features.
        </p>

        {/* Get Started Button */}
        <button 
          className={styles.getStartedButton}
          onClick={onGetStarted}
        >
          Get started
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;