import React, { useState } from 'react';
import { makeStyles } from '@fluentui/react-components';
import {
  BuildingRegular,
  PersonRegular,
  EyeRegular,
  EyeOffRegular,
  MailRegular,
  LockClosedRegular,
  KeyRegular,
  CheckmarkCircleRegular,
  DismissCircleRegular,
  InfoRegular
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import csiLogo from '../assets/Church_of_South_India.png';
import dioceseLogo from '../assets/CSI_Tirunelveli_Diocese_Logo.png';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    height: 'calc(100vh - 32px)', /* Account for title bar */
    backgroundColor: '#f8f8f8',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    overflow: 'hidden',
  },
  leftPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#B5316A',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    padding: '40px',
    height: '100%',
  },
  logosWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '40px',
  },
  CSIlogoImage: {
    width: '96px', // 80% of 120px
    height: '96px', // 80% of 120px
    objectFit: 'contain',
  },
  DioceseLogoImage: {
    width: '120px', 
    height: '120px',
    objectFit: 'contain',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: '40px',
    overflow: 'hidden', /* Disable scrolling */
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '30px',
  },
  logoIcon: {
    fontSize: '48px',
    marginRight: '16px',
  },
  logoText: {
    fontSize: '32px',
    fontWeight: '300',
    margin: 0,
    color: 'white',
    fontFamily: 'Meribold, Segoe UI, sans-serif',
  },
  tagline: {
    fontSize: '18px',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: '1.5',
    maxWidth: '300px',
    color: 'white',
  },
  forgotPasswordForm: {
    width: '100%',
    maxWidth: '360px',
  },
  forgotPasswordTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#323130',
    margin: '0 0 8px 0',
    textAlign: 'center',
  },
  forgotPasswordSubtitle: {
    fontSize: '14px',
    color: '#605e5c',
    marginBottom: '32px',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '6px',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    border: '1px solid #8a8886',
    borderRadius: '2px',
    fontSize: '14px',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: 'white',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
    },
    '&::placeholder': {
      color: '#a19f9d',
    }
  },
  passwordInput: {
    paddingRight: '48px', // Make room for eye icon
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#605e5c',
    fontSize: '16px',
  },
  eyeIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#605e5c',
    fontSize: '16px',
    '&:hover': {
      color: '#323130',
    }
  },
  resetButton: {
    width: '100%',
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '2px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'Segoe UI, sans-serif',
    cursor: 'pointer',
    marginBottom: '20px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#B5316A',
    },
    '&:focus': {
      outline: '2px solid #B5316A',
      outlineOffset: '2px',
    }
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#B5316A',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline',
    '&:hover': {
      color: '#B5316A',
    }
  },
  // Loading and notification styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingSpinner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #B5316A',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  },
  loadingText: {
    fontSize: '14px',
    color: '#323130',
    fontWeight: '500',
  },
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 20px',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 1001,
    maxWidth: '400px',
    fontSize: '14px',
    fontWeight: '500',
    animation: 'slideIn 0.3s ease-out',
  },
  '@keyframes slideIn': {
    from: {
      transform: 'translateX(100%)',
      opacity: 0,
    },
    to: {
      transform: 'translateX(0)',
      opacity: 1,
    }
  },
  notificationSuccess: {
    backgroundColor: '#DFF6DD',
    color: '#107C10',
    border: '1px solid #92C353',
  },
  notificationError: {
    backgroundColor: '#FDE7E9',
    color: '#D13438',
    border: '1px solid #F7B9B9',
  },
  notificationInfo: {
    backgroundColor: '#F0F6FF',
    color: '#0078D4',
    border: '1px solid #B3D6FC',
  },
  disabledButton: {
    backgroundColor: '#a19f9d',
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: '#a19f9d',
    }
  }
});

const ForgotPasswordPage = ({ onBack, onPasswordReset }) => {
  const styles = useStyles();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    pin: '',
    newPassword: '',
    confirmPassword: ''
  });

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.pin.trim()) {
      showNotification('Please enter your PIN', 'error');
      return;
    }
    
    if (!formData.newPassword.trim()) {
      showNotification('Please enter a new password', 'error');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (formData.newPassword.length < 6) {
      showNotification('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await window.electron.auth.forgotPassword({
        pin: formData.pin.trim(),
        newPassword: formData.newPassword
      });

      if (result.success) {
        showNotification('Password reset successful! You can now sign in with your new password.', 'success');
        
        // Clear form
        setFormData({
          pin: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Navigate back to login after a delay
        setTimeout(() => {
          if (onPasswordReset) {
            onPasswordReset();
          } else {
            onBack();
          }
        }, 2000);
      } else {
        showNotification(result.error || 'Password reset failed. Please check your PIN and try again.', 'error');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      showNotification('Connection error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckmarkCircleRegular />;
      case 'error':
        return <DismissCircleRegular />;
      case 'info':
      default:
        return <InfoRegular />;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return styles.notificationSuccess;
      case 'error':
        return styles.notificationError;
      case 'info':
      default:
        return styles.notificationInfo;
    }
  };

  return (
    <div className={styles.container}>
      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${getNotificationStyle(notification.type)}`}>
          {getNotificationIcon(notification.type)}
          {notification.message}
        </div>
      )}

      {/* Left Panel - CSI and Diocese Logos */}
      <div className={styles.leftPanel}>
        <div className={styles.logoContainer}>
          <div className={styles.logosWrapper}>
            <img
              src={csiLogo}
              alt="Church of South India Logo"
              className={styles.CSIlogoImage}
            />
            <img
              src={dioceseLogo}
              alt="CSI Tirunelveli Diocese Logo"
              className={styles.DioceseLogoImage}
            />
          </div>
          <div className={styles.logoSection}>
            <h1 className={styles.logoText}>Ecclesia</h1>
          </div>
          <p className={styles.tagline}>
            Reset your password securely using your PIN and get back to managing your congregation with ease.
          </p>
        </div>
      </div>

      {/* Right Panel - Reset Password Form */}
      <div className={styles.rightPanel}>
        {/* Loading Overlay */}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
              <span className={styles.loadingText}>Resetting password...</span>
            </div>
          </div>
        )}

        <form className={styles.forgotPasswordForm} onSubmit={handleSubmit}>
          <h2 className={styles.forgotPasswordTitle}>Reset Password</h2>
          <p className={styles.forgotPasswordSubtitle}>
            Enter your PIN and new password to reset your account
          </p>

          {/* PIN Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="pin" className={styles.label}>PIN</label>
            <div className={styles.inputContainer}>
              <KeyRegular className={styles.inputIcon} />
              <input
                type="password"
                id="pin"
                name="pin"
                className={styles.input}
                placeholder="Enter your PIN"
                value={formData.pin}
                onChange={handleInputChange}
                maxLength="6"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* New Password Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword" className={styles.label}>New Password</label>
            <div className={styles.inputContainer}>
              <LockClosedRegular className={styles.inputIcon} />
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                className={`${styles.input} ${styles.passwordInput}`}
                placeholder="Enter new password (min 6 characters)"
                value={formData.newPassword}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              <span
                className={styles.eyeIcon}
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1 }}
              >
                {showNewPassword ? <EyeOffRegular /> : <EyeRegular />}
              </span>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password</label>
            <div className={styles.inputContainer}>
              <LockClosedRegular className={styles.inputIcon} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className={`${styles.input} ${styles.passwordInput}`}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
              <span
                className={styles.eyeIcon}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1 }}
              >
                {showConfirmPassword ? <EyeOffRegular /> : <EyeRegular />}
              </span>
            </div>
          </div>

          {/* Reset Button */}
          <button
            type="submit"
            className={`${styles.resetButton} ${isLoading ? styles.disabledButton : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>

          {/* Back to Login */}
          <button
            type="button"
            className={styles.backButton}
            onClick={onBack}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.5 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            ← Back to Sign In
          </button>
        </form>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

export default ForgotPasswordPage;