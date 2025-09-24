import React, { useState } from 'react';
import { makeStyles } from '@fluentui/react-components';
import {
  BuildingRegular,
  PersonRegular,
  EyeRegular,
  EyeOffRegular,
  MailRegular,
  LockClosedRegular
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
  loginForm: {
    width: '100%',
    maxWidth: '360px',
  },
  loginTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#323130',
    margin: '0 0 8px 0',
    textAlign: 'center',
  },
  loginSubtitle: {
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
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
  },
  checkbox: {
    marginRight: '8px',
    accentColor: '#B5316A',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#323130',
    cursor: 'pointer',
  },
  loginButton: {
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
  forgotPasswordLink: {
    display: 'block',
    textAlign: 'center',
    fontSize: '14px',
    color: '#B5316A',
    textDecoration: 'none',
    marginBottom: '20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Segoe UI, sans-serif',
    '&:hover': {
      textDecoration: 'underline',
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

const LoginPage = ({ onBack, onForgotPassword, onLoginSuccess }) => {
  const styles = useStyles();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here - for now just navigate to dashboard
    console.log('Login attempt:', formData);
    onLoginSuccess();
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
            Manage your congregation with modern tools and insights.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={styles.rightPanel}>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <h2 className={styles.loginTitle}>Sign in</h2>
          <p className={styles.loginSubtitle}>
            Enter your credentials to access Ecclesia
          </p>

          {/* User Name Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>User name</label>
            <div className={styles.inputContainer}>
              <PersonRegular className={styles.inputIcon} />
              <input
                type="text"
                id="email"
                name="email"
                className={styles.input}
                placeholder="Enter your user name"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.inputContainer}>
              <LockClosedRegular className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className={`${styles.input} ${styles.passwordInput}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <span
                className={styles.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffRegular /> : <EyeRegular />}
              </span>
            </div>
          </div>

          {/* Remember Me */}
          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              className={styles.checkbox}
              checked={formData.rememberMe}
              onChange={handleInputChange}
            />
            <label htmlFor="rememberMe" className={styles.checkboxLabel}>
              Keep me signed in
            </label>
          </div>

          {/* Login Button */}
          <button type="submit" className={styles.loginButton}>
            Sign in
          </button>

          {/* Forgot Password */}
          <button
            type="button"
            className={styles.forgotPasswordLink}
            onClick={onForgotPassword}
          >
            Forgot your password?
          </button>

          {/* Back to Welcome */}
          <button type="button" className={styles.backButton} onClick={onBack}>
            ← Back to welcome
          </button>
        </form>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

export default LoginPage;