import React, { useState } from 'react';
import { makeStyles } from '@fluentui/react-components';
import {
  BuildingRegular,
  PersonRegular,
  EyeRegular,
  EyeOffRegular,
  MailRegular,
  LockClosedRegular,
  KeyRegular
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
  }
});

const ForgotPasswordPage = ({ onBack }) => {
  const styles = useStyles();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    pin: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Handle password reset logic here
    console.log('Password reset attempt:', formData);
  };

  return (
    <div className={styles.container}>
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
            Reset your password securely and get back to managing your congregation with ease.
          </p>
        </div>
      </div>

      {/* Right Panel - Reset Password Form */}
      <div className={styles.rightPanel}>
        <form className={styles.forgotPasswordForm} onSubmit={handleSubmit}>
          <h2 className={styles.forgotPasswordTitle}>Reset Password</h2>
          <p className={styles.forgotPasswordSubtitle}>
            Enter your details to reset your password
          </p>

          {/* Username Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <div className={styles.inputContainer}>
              <PersonRegular className={styles.inputIcon} />
              <input
                type="text"
                id="username"
                name="username"
                className={styles.input}
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

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
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
              />
              <span 
                className={styles.eyeIcon}
                onClick={() => setShowNewPassword(!showNewPassword)}
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
                required
              />
              <span 
                className={styles.eyeIcon}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOffRegular /> : <EyeRegular />}
              </span>
            </div>
          </div>

          {/* Reset Button */}
          <button type="submit" className={styles.resetButton}>
            Reset Password
          </button>

          {/* Back to Login */}
          <button type="button" className={styles.backButton} onClick={onBack}>
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