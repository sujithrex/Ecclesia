import React, { useState } from 'react';
import { makeStyles } from '@fluentui/react-components';
import {
  LocationRegular,
  TagRegular,
  CheckmarkCircleRegular,
  DismissCircleRegular,
  DismissRegular,
  BuildingRegular
} from '@fluentui/react-icons';
import LoadingSpinner from './LoadingSpinner';

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '32px',
    width: '100%',
    maxWidth: '70%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#323130',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#605e5c',
    padding: '4px',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#f3f2f1',
      color: '#323130',
    },
  },
  description: {
    fontSize: '14px',
    color: '#605e5c',
    marginBottom: '32px',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
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
    transition: 'border-color 0.2s ease',
    '&:focus': {
      outline: '2px solid #B5316A',
      outlineOffset: '1px',
      borderColor: '#B5316A',
    },
    '&::placeholder': {
      color: '#a19f9d',
    }
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#605e5c',
    fontSize: '16px',
  },
  errorInput: {
    borderColor: '#d13438',
  },
  errorMessage: {
    fontSize: '12px',
    color: '#d13438',
    marginTop: '4px',
  },
  helperText: {
    fontSize: '12px',
    color: '#605e5c',
    marginTop: '4px',
  },
  churchInfo: {
    backgroundColor: '#f3f2f1',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#323130',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'Segoe UI, sans-serif',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
    '&:disabled': {
      backgroundColor: '#a19f9d',
      cursor: 'not-allowed',
    },
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#323130',
    border: '1px solid #8a8886',
    borderRadius: '4px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'Segoe UI, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f3f2f1',
      borderColor: '#605e5c',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  notification: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
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
});

const CreateAreaModal = ({
  isOpen,
  onClose,
  onSuccess,
  user,
  currentChurch,
  editMode = false,
  initialData = null
}) => {
  const styles = useStyles();
  const [formData, setFormData] = useState({
    area_name: '',
    area_identity: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Initialize form data when modal opens or editMode/initialData changes
  React.useEffect(() => {
    if (isOpen && editMode && initialData) {
      setFormData({
        area_name: initialData.area_name || '',
        area_identity: initialData.area_identity || '',
      });
    } else if (isOpen && !editMode) {
      setFormData({
        area_name: '',
        area_identity: '',
      });
    }
  }, [isOpen, editMode, initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.area_name.trim()) {
      newErrors.area_name = 'Area name is required';
    } else if (formData.area_name.trim().length < 2) {
      newErrors.area_name = 'Area name must be at least 2 characters';
    }

    if (!formData.area_identity.trim()) {
      newErrors.area_identity = 'Area identity is required';
    } else if (formData.area_identity.trim().length < 2) {
      newErrors.area_identity = 'Area identity must be at least 2 characters';
    } else if (formData.area_identity.trim().length > 20) {
      newErrors.area_identity = 'Area identity must be 20 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!currentChurch && !editMode) {
      showNotification('No church selected. Please select a church first.', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      let result;
      if (editMode && initialData) {
        result = await window.electron.area.update({
          areaId: initialData.id,
          area_name: formData.area_name.trim(),
          area_identity: formData.area_identity.trim(),
          userId: user.id
        });
      } else {
        result = await window.electron.area.create({
          churchId: currentChurch.id,
          area_name: formData.area_name.trim(),
          area_identity: formData.area_identity.trim(),
          userId: user.id
        });
      }

      if (result.success) {
        const successMessage = editMode ? 'Area updated successfully!' : 'Area created successfully!';
        showNotification(successMessage, 'success');
        setTimeout(() => {
          onSuccess(result.area);
        }, 1500);
      } else {
        const errorMessage = editMode ? 'Failed to update area' : 'Failed to create area';
        showNotification(result.error || errorMessage, 'error');
      }
    } catch (error) {
      console.error('Area operation error:', error);
      showNotification('Connection error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ area_name: '', area_identity: '' });
      setErrors({});
      setNotification(null);
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    // Only close if clicking directly on overlay, not on modal content or inputs
    if (e.target === e.currentTarget && !e.defaultPrevented) {
      e.stopPropagation();
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <LocationRegular />
            {editMode ? 'Edit Area' : 'Create New Area'}
          </h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isLoading}
            type="button"
          >
            <DismissRegular />
          </button>
        </div>

        {notification && (
          <div className={`${styles.notification} ${
            notification.type === 'success' 
              ? styles.notificationSuccess 
              : styles.notificationError
          }`}>
            {notification.type === 'success' ? (
              <CheckmarkCircleRegular />
            ) : (
              <DismissCircleRegular />
            )}
            {notification.message}
          </div>
        )}

        {currentChurch && !editMode && (
          <div className={styles.churchInfo}>
            <BuildingRegular />
            Creating area in: <strong>{currentChurch.church_name}</strong>
          </div>
        )}

        <p className={styles.description}>
          {editMode
            ? 'Update the area information below. Changes will be saved immediately.'
            : 'Create a new area within your current church. This will help organize members and activities by geographical or administrative regions.'
          }
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="area_name" className={styles.label}>
              Area Name *
            </label>
            <div className={styles.inputContainer}>
              <LocationRegular className={styles.inputIcon} />
              <input
                type="text"
                id="area_name"
                name="area_name"
                className={`${styles.input} ${errors.area_name ? styles.errorInput : ''}`}
                placeholder="Enter the area name"
                value={formData.area_name}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={100}
                required
              />
            </div>
            {errors.area_name && (
              <span className={styles.errorMessage}>{errors.area_name}</span>
            )}
            {!errors.area_name && (
              <span className={styles.helperText}>
                The descriptive name of the area (e.g., "North District", "Central Region")
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="area_identity" className={styles.label}>
              Area Identity *
            </label>
            <div className={styles.inputContainer}>
              <TagRegular className={styles.inputIcon} />
              <input
                type="text"
                id="area_identity"
                name="area_identity"
                className={`${styles.input} ${errors.area_identity ? styles.errorInput : ''}`}
                placeholder="Enter area identity code"
                value={formData.area_identity}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={20}
                required
              />
            </div>
            {errors.area_identity && (
              <span className={styles.errorMessage}>{errors.area_identity}</span>
            )}
            {!errors.area_identity && (
              <span className={styles.helperText}>
                A unique identifier for the area (e.g., "NORTH-01", "CENT-A", max 20 characters)
              </span>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner type="button" spinner="beat" size={12} />
                  {editMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editMode ? 'Update Area' : 'Create Area'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAreaModal;