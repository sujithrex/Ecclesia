import React, { useState } from 'react';
import { makeStyles } from '@fluentui/react-components';
import {
  PeopleRegular,
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
    maxWidth: '480px',
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

const CreatePrayerCellModal = ({
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
    prayer_cell_name: '',
    prayer_cell_identity: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Initialize form data when modal opens or editMode/initialData changes
  React.useEffect(() => {
    if (isOpen && editMode && initialData) {
      setFormData({
        prayer_cell_name: initialData.prayer_cell_name || '',
        prayer_cell_identity: initialData.prayer_cell_identity || '',
      });
    } else if (isOpen && !editMode) {
      setFormData({
        prayer_cell_name: '',
        prayer_cell_identity: '',
      });
    }
  }, [isOpen, editMode, initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.prayer_cell_name.trim()) {
      newErrors.prayer_cell_name = 'Prayer cell name is required';
    } else if (formData.prayer_cell_name.trim().length < 2) {
      newErrors.prayer_cell_name = 'Prayer cell name must be at least 2 characters';
    }

    if (!formData.prayer_cell_identity.trim()) {
      newErrors.prayer_cell_identity = 'Prayer cell identity is required';
    } else if (formData.prayer_cell_identity.trim().length < 2) {
      newErrors.prayer_cell_identity = 'Prayer cell identity must be at least 2 characters';
    } else if (formData.prayer_cell_identity.trim().length > 20) {
      newErrors.prayer_cell_identity = 'Prayer cell identity must be 20 characters or less';
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
        result = await window.electron.prayerCell.update({
          prayerCellId: initialData.id,
          prayer_cell_name: formData.prayer_cell_name.trim(),
          prayer_cell_identity: formData.prayer_cell_identity.trim(),
          userId: user.id
        });
      } else {
        result = await window.electron.prayerCell.create({
          churchId: currentChurch.id,
          prayer_cell_name: formData.prayer_cell_name.trim(),
          prayer_cell_identity: formData.prayer_cell_identity.trim(),
          userId: user.id
        });
      }

      if (result.success) {
        const successMessage = editMode ? 'Prayer cell updated successfully!' : 'Prayer cell created successfully!';
        showNotification(successMessage, 'success');
        setTimeout(() => {
          onSuccess(result.prayerCell);
        }, 1500);
      } else {
        const errorMessage = editMode ? 'Failed to update prayer cell' : 'Failed to create prayer cell';
        showNotification(result.error || errorMessage, 'error');
      }
    } catch (error) {
      console.error('Prayer cell operation error:', error);
      showNotification('Connection error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ prayer_cell_name: '', prayer_cell_identity: '' });
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
            <PeopleRegular />
            {editMode ? 'Edit Prayer Cell' : 'Create New Prayer Cell'}
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
            Creating prayer cell in: <strong>{currentChurch.church_name}</strong>
          </div>
        )}

        <p className={styles.description}>
          {editMode
            ? 'Update the prayer cell information below. Changes will be saved immediately.'
            : 'Create a new prayer cell within your current church. This will help organize small group prayers and fellowship activities.'
          }
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="prayer_cell_name" className={styles.label}>
              Prayer Cell Name *
            </label>
            <div className={styles.inputContainer}>
              <PeopleRegular className={styles.inputIcon} />
              <input
                type="text"
                id="prayer_cell_name"
                name="prayer_cell_name"
                className={`${styles.input} ${errors.prayer_cell_name ? styles.errorInput : ''}`}
                placeholder="Enter the prayer cell name"
                value={formData.prayer_cell_name}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={100}
                required
              />
            </div>
            {errors.prayer_cell_name && (
              <span className={styles.errorMessage}>{errors.prayer_cell_name}</span>
            )}
            {!errors.prayer_cell_name && (
              <span className={styles.helperText}>
                The descriptive name of the prayer cell (e.g., "Morning Glory", "Faith Warriors")
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="prayer_cell_identity" className={styles.label}>
              Prayer Cell Identity *
            </label>
            <div className={styles.inputContainer}>
              <TagRegular className={styles.inputIcon} />
              <input
                type="text"
                id="prayer_cell_identity"
                name="prayer_cell_identity"
                className={`${styles.input} ${errors.prayer_cell_identity ? styles.errorInput : ''}`}
                placeholder="Enter prayer cell identity code"
                value={formData.prayer_cell_identity}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={20}
                required
              />
            </div>
            {errors.prayer_cell_identity && (
              <span className={styles.errorMessage}>{errors.prayer_cell_identity}</span>
            )}
            {!errors.prayer_cell_identity && (
              <span className={styles.helperText}>
                A unique identifier for the prayer cell (e.g., "PC-01", "GLORY-A", max 20 characters)
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
                editMode ? 'Update Prayer Cell' : 'Create Prayer Cell'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePrayerCellModal;