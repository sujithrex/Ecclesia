import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  PersonRegular,
  MailRegular,
  CallRegular,
  ImageRegular,
  KeyRegular,
  LockClosedRegular,
  CheckmarkCircleRegular,
  DismissCircleRegular,
  InfoRegular,
  SaveRegular,
  EyeRegular,
  EyeOffRegular,
  HomeRegular
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import LoadingSpinner from './LoadingSpinner';
import Breadcrumb from './Breadcrumb';
import { useLoading } from '../contexts/LoadingContext';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 32px)', /* Account for title bar */
    backgroundColor: '#f8f8f8',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: '30px 40px 40px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  formContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '20px',
    alignItems: 'start',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    border: '1px solid #8a8886',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: 'white',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
      boxShadow: '0 0 0 2px rgba(181, 49, 106, 0.2)',
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
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '10px',
  },
  saveButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 32px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'Segoe UI, sans-serif',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#9e2c5f',
    },
    '&:focus': {
      outline: '2px solid #B5316A',
      outlineOffset: '2px',
    }
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
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#323130',
    margin: '0 0 16px 0',
    paddingBottom: '8px',
    borderBottom: '2px solid #B5316A',
  },
  imageUploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
    border: '2px dashed #8a8886',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    transition: 'border-color 0.2s ease',
    '&:hover': {
      borderColor: '#B5316A',
    }
  },
  imagePreview: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #B5316A',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  },
  noImagePlaceholder: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#e1dfdd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    color: '#605e5c',
    border: '3px solid #8a8886'
  },
  uploadButton: {
    backgroundColor: '#0078d4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#106ebe',
    }
  },
  removeButton: {
    backgroundColor: '#d13438',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#b01e24',
    }
  },
  imageUploadText: {
    fontSize: '14px',
    color: '#605e5c',
    textAlign: 'center',
    margin: '8px 0'
  }
});

const ProfilePage = ({
  user,
  onBack,
  onProfileUpdate,
  currentPastorate,
  userPastorates,
  onPastorateChange,
  onCreatePastorate,
  onEditPastorate,
  onDeletePastorate
}) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { startLoading, stopLoading, isLoading } = useLoading();
  const [notification, setNotification] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    image: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    resetPin: '',
    confirmPin: ''
  });

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        image: user.image || '',
        resetPin: user.reset_pin || '1919',
        confirmPin: user.reset_pin || '1919'
      }));
      
      // Set image preview if user has an image
      if (user.image) {
        loadImagePreview(user.image);
      } else {
        // Clear image preview if no image
        setImagePreview(null);
      }
    }
  }, [user]);

  const loadImagePreview = async (imagePath) => {
    try {
      if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        setImagePreview(imagePath);
      } else {
        // Try to get the local file path
        const result = await window.electron.file.getImagePath(imagePath);
        if (result.success) {
          setImagePreview(result.url);
        }
      }
    } catch (error) {
      console.error('Error loading image preview:', error);
    }
  };

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

  const handleImagePicker = async () => {
    try {
      const result = await window.electron.file.openImagePicker();
      
      if (result.success && !result.canceled) {
        setSelectedImage(result.data);
        
        // Create preview URL
        const previewUrl = `data:${result.data.mimeType};base64,${result.data.base64Data}`;
        setImagePreview(previewUrl);
        
        showNotification('Image selected successfully', 'info');
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      showNotification('Failed to select image', 'error');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    showNotification('Image removed', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.username.trim()) {
      showNotification('Name and username are required', 'error');
      return;
    }

    // Validate password change if provided
    if (formData.newPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        showNotification('Current password is required to change password', 'error');
        return;
      }
      if (!formData.newPassword) {
        showNotification('New password is required', 'error');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
      }
      if (formData.newPassword.length < 6) {
        showNotification('New password must be at least 6 characters', 'error');
        return;
      }
    }

    // Validate PIN confirmation if PIN is changed
    if (formData.resetPin !== (user.reset_pin || '1919')) {
      if (formData.resetPin !== formData.confirmPin) {
        showNotification('PIN confirmation does not match', 'error');
        return;
      }
      if (formData.resetPin.length < 4) {
        showNotification('PIN must be at least 4 characters', 'error');
        return;
      }
    }

    startLoading('profile', {
      type: 'overlay',
      spinner: 'ring',
      text: 'Saving changes...',
      subtext: 'Please wait while we update your profile'
    });

    try {
      let imagePath = formData.image.trim();
      
      // Upload new image if selected
      if (selectedImage) {
        const uploadResult = await window.electron.file.saveProfileImage({
          userId: user.id,
          imageData: selectedImage
        });
        
        if (uploadResult.success) {
          imagePath = uploadResult.filename;
        } else {
          showNotification('Failed to upload image: ' + uploadResult.error, 'error');
          stopLoading('profile');
          return;
        }
      }

      // Update profile information
      const profileData = {
        userId: user.id,
        userData: {
          name: formData.name.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          image: imagePath
        }
      };

      const profileResult = await window.electron.user.updateProfile(profileData);
      
      if (!profileResult.success) {
        showNotification(profileResult.error || 'Failed to update profile', 'error');
        stopLoading('profile');
        return;
      }

      let passwordChanged = false;

      // Change password if provided
      if (formData.currentPassword && formData.newPassword) {
        const passwordResult = await window.electron.user.changePassword({
          userId: user.id,
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword
        });

        if (!passwordResult.success) {
          showNotification(passwordResult.error || 'Failed to change password', 'error');
          stopLoading('profile');
          return;
        }
        passwordChanged = true;
      }

      // Update PIN if changed
      if (formData.resetPin !== (user.reset_pin || '1919')) {
        const pinResult = await window.electron.user.updatePin({
          userId: user.id,
          newPin: formData.resetPin
        });

        if (!pinResult.success) {
          showNotification(pinResult.error || 'Failed to update PIN', 'error');
          stopLoading('profile');
          return;
        }
      }

      // Show success message
      const message = passwordChanged 
        ? 'Profile updated successfully! Password has been changed.' 
        : 'Profile updated successfully!';
      
      showNotification(message, 'success');

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        confirmPin: formData.resetPin
      }));

      // Clear selected image after successful upload
      setSelectedImage(null);
      
      // Update form data with new image path
      setFormData(prev => ({
        ...prev,
        image: imagePath
      }));
      
      // Update the image preview to show the saved image
      if (imagePath && imagePath !== formData.image) {
        await loadImagePreview(imagePath);
      }
      
      // Update parent component with new user data
      if (onProfileUpdate) {
        onProfileUpdate(profileResult.user);
      }

    } catch (error) {
      console.error('Profile update error:', error);
      showNotification('Connection error. Please try again.', 'error');
    } finally {
      stopLoading('profile');
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

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${getNotificationStyle(notification.type)}`}>
          {getNotificationIcon(notification.type)}
          {notification.message}
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle="Profile"
        breadcrumbs={[
          {
            label: 'Dashboard',
            icon: <HomeRegular />,
            onClick: () => navigate('/pastorate-dashboard')
          },
          {
            label: 'Profile',
            current: true
          }
        ]}
        onNavigate={(path) => navigate(path)}
      />

      {/* Content */}
      <div className={styles.content} style={{ position: 'relative' }}>
        {/* Loading Overlay */}
        {isLoading('profile') && (
          <LoadingSpinner
            type="overlay"
            spinner="ring"
            text="Saving changes..."
            subtext="Please wait while we update your profile"
          />
        )}

        <form className={styles.formContainer} onSubmit={handleSubmit}>
          {/* Personal Information */}
          <h2 className={styles.sectionTitle}>Personal Information</h2>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <PersonRegular /> Full Name
              </label>
              <div className={styles.inputContainer}>
                <PersonRegular className={styles.inputIcon} />
                <input
                  type="text"
                  name="name"
                  className={styles.input}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading('profile')}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <PersonRegular /> Username
              </label>
              <div className={styles.inputContainer}>
                <PersonRegular className={styles.inputIcon} />
                <input
                  type="text"
                  name="username"
                  className={styles.input}
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading('profile')}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <MailRegular /> Email
              </label>
              <div className={styles.inputContainer}>
                <MailRegular className={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  className={styles.input}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading('profile')}
                />
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <CallRegular /> Phone Number
              </label>
              <div className={styles.inputContainer}>
                <CallRegular className={styles.inputIcon} />
                <input
                  type="tel"
                  name="phone"
                  className={styles.input}
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading('profile')}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <KeyRegular /> Reset PIN
              </label>
              <div className={styles.inputContainer}>
                <KeyRegular className={styles.inputIcon} />
                <input
                  type="password"
                  name="resetPin"
                  className={styles.input}
                  placeholder="Enter reset PIN"
                  value={formData.resetPin}
                  onChange={handleInputChange}
                  disabled={isLoading('profile')}
                  maxLength="6"
                />
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <KeyRegular /> Confirm PIN
              </label>
              <div className={styles.inputContainer}>
                <KeyRegular className={styles.inputIcon} />
                <input
                  type="password"
                  name="confirmPin"
                  className={styles.input}
                  placeholder="Confirm reset PIN"
                  value={formData.confirmPin}
                  onChange={handleInputChange}
                  disabled={isLoading('profile')}
                  maxLength="6"
                />
              </div>
            </div>
          </div>

          {/* Password Change */}
          <h2 className={styles.sectionTitle}>Change Password</h2>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <LockClosedRegular /> Current Password
              </label>
              <div className={styles.inputContainer}>
                <LockClosedRegular className={styles.inputIcon} />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  className={`${styles.input} ${styles.passwordInput}`}
                  placeholder="Enter current password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  disabled={isLoading('profile')}
                />
                <span
                  className={styles.eyeIcon}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{ cursor: isLoading('profile') ? 'not-allowed' : 'pointer', opacity: isLoading('profile') ? 0.5 : 1 }}
                >
                  {showCurrentPassword ? <EyeOffRegular /> : <EyeRegular />}
                </span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <LockClosedRegular /> New Password
              </label>
              <div className={styles.inputContainer}>
                <LockClosedRegular className={styles.inputIcon} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  className={`${styles.input} ${styles.passwordInput}`}
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  disabled={isLoading('profile')}
                />
                <span
                  className={styles.eyeIcon}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ cursor: isLoading('profile') ? 'not-allowed' : 'pointer', opacity: isLoading('profile') ? 0.5 : 1 }}
                >
                  {showNewPassword ? <EyeOffRegular /> : <EyeRegular />}
                </span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <LockClosedRegular /> Confirm New Password
              </label>
              <div className={styles.inputContainer}>
                <LockClosedRegular className={styles.inputIcon} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className={`${styles.input} ${styles.passwordInput}`}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading('profile')}
                />
                <span
                  className={styles.eyeIcon}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ cursor: isLoading('profile') ? 'not-allowed' : 'pointer', opacity: isLoading('profile') ? 0.5 : 1 }}
                >
                  {showConfirmPassword ? <EyeOffRegular /> : <EyeRegular />}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Image */}
          <h2 className={styles.sectionTitle}>Profile Image</h2>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                <ImageRegular /> Profile Image
              </label>
              <div className={styles.imageUploadContainer}>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className={styles.imagePreview}
                    onError={(e) => {
                      console.error('Image load error:', e);
                      setImagePreview(null);
                    }}
                  />
                ) : (
                  <div className={styles.noImagePlaceholder}>
                    <ImageRegular />
                  </div>
                )}
                
                <div className={styles.imageUploadText}>
                  {imagePreview ? 'Current profile image' : 'No image selected'}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={styles.uploadButton}
                    onClick={handleImagePicker}
                    disabled={isLoading('profile')}
                  >
                    <ImageRegular />
                    {imagePreview ? 'Change Image' : 'Select Image'}
                  </button>
                  
                  {imagePreview && (
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={removeImage}
                      disabled={isLoading('profile')}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className={styles.buttonContainer}>
            <button 
              type="submit" 
              className={`${styles.saveButton} ${isLoading('profile') ? styles.disabledButton : ''}`}
              disabled={isLoading('profile')}
            >
              {isLoading('profile') ? (
                <>
                  <LoadingSpinner type="button" spinner="pulse" size={12} />
                  Saving...
                </>
              ) : (
                <>
                  <SaveRegular />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Status Bar */}
      <StatusBar
        user={user}
        onLogout={async () => {
          try {
            // Call backend logout
            await window.electron.auth.logout();
            
            // Clear local storage
            localStorage.removeItem('ecclesia_session');
            
            // Navigate to login page using React Router
            navigate('/login');
          } catch (error) {
            console.error('Logout error:', error);
            // Still logout locally even if backend call fails
            localStorage.removeItem('ecclesia_session');
            navigate('/login');
          }
        }}
        onProfileClick={null}
        currentPastorate={currentPastorate}
        userPastorates={userPastorates}
        onPastorateChange={onPastorateChange}
        onCreatePastorate={onCreatePastorate}
        onEditPastorate={onEditPastorate}
        onDeletePastorate={onDeletePastorate}
      />
    </div>
  );
};

export default ProfilePage;