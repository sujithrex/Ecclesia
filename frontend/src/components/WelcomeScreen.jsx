import React from 'react';
import { makeStyles } from '@fluentui/react-components';
import StatusBar from './StatusBar';
import csiLogo from '../assets/Church_of_South_India.png';
import dioceseLogo from '../assets/CSI_Tirunelveli_Diocese_Logo.png';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 32px)', /* Account for title bar */
    backgroundColor: 'white',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    overflow: 'hidden', /* Disable scrolling */
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
  logosContainer: {
    display: 'flex',
    gap: '40px',
    marginBottom: '60px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '96px', // 80% of 120px
    height: '96px', // 80% of 120px
    objectFit: 'contain',
  },
  welcomeTitle: {
    fontSize: '48px',
    fontWeight: '300',
    color: '#323130',
    margin: '0 0 20px 0',
    lineHeight: '1.2',
    fontFamily: 'Meribold, Segoe UI, sans-serif',
  },
  subtitle: {
    fontSize: '18px',
    color: '#605e5c',
    lineHeight: '1.4',
    marginBottom: '40px',
    maxWidth: '500px',
    opacity: 0.9,
  },
  getStartedButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '2px',
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#9a2855',
      transform: 'translateY(-1px)',
    },
    '&:focus': {
      outline: '2px solid #B5316A',
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
        {/* CSI and Diocese Logos */}
        <div className={styles.logosContainer}>
          <img
            src={csiLogo}
            alt="Church of South India Logo"
            className={styles.logoImage}
          />
          <img
            src={dioceseLogo}
            alt="CSI Tirunelveli Diocese Logo"
            className={styles.logoImage}
          />
        </div>

        {/* Welcome Text */}
        <h1 className={styles.welcomeTitle}>Welcome to Ecclesia!</h1>
        <p className={styles.subtitle}>
          Manage your church community with ease using your administrative account.
          Switch to full application to access all features.
        </p>

        {/* Get Started Button */}
        <button
          className={styles.getStartedButton}
          onClick={onGetStarted}
        >
          Get started
        </button>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

export default WelcomeScreen;