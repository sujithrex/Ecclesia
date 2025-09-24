import React, { useState } from 'react';
import { makeStyles } from '@fluentui/react-components';
import {
  BuildingRegular,
  TagRegular,
  CheckmarkCircleRegular,
  DismissCircleRegular,
  DismissRegular
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
      outline: 'none',
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

const CreatePastorateModal = ({ isOpen, onClose, onSuccess, user, editMode = false, initialData = null }) => {
  const styles = useStyles();
  const [formData, setFormData] = useState({
    pastorate_name: '',
    pastorate_short_name: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Initialize form data when modal opens or editMode/initialData changes
  React.useEffect(() => {
    if (isOpen && editMode && initialData) {
      setFormData({
        pastorate_name: initialData.pastorate_name || '',
        pastorate_short_name: initialData.pastorate_short_name || '',
      });
    } else if (isOpen && !editMode) {
      setFormData({
        pastorate_name: '',
        pastorate_short_name: '',
      });
    }
  }, [isOpen, editMode, initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.pastorate_name.trim()) {
      newErrors.pastorate_name = 'Pastorate name is required';
    } else if (formData.pastorate_name.trim().length < 2) {
      newErrors.pastorate_name = 'Pastorate name must be at least 2 characters';
    }

    if (!formData.pastorate_short_name.trim()) {
      newErrors.pastorate_short_name = 'Short name is required';
    } else if (formData.pastorate_short_name.trim().length < 2) {
      newErrors.pastorate_short_name = 'Short name must be at least 2 characters';
    } else if (formData.pastorate_short_name.trim().length > 10) {
      newErrors.pastorate_short_name = 'Short name must be 10 characters or less';
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

    setIsLoading(true);
    
    try {
      let result;
      if (editMode && initialData) {
        result = await window.electron.pastorate.update({
          pastorateId: initialData.id,
          pastorate_name: formData.pastorate_name.trim(),
          pastorate_short_name: formData.pastorate_short_name.trim(),
          userId: user.id
        });
      } else {
        result = await window.electron.pastorate.create({
          pastorate_name: formData.pastorate_name.trim(),
          pastorate_short_name: formData.pastorate_short_name.trim(),
          userId: user.id
        });
      }

      if (result.success) {
        const successMessage = editMode ? 'Pastorate updated successfully!' : 'Pastorate created successfully!';
        showNotification(successMessage, 'success');
        setTimeout(() => {
          onSuccess(result.pastorate);
        }, 1500);
      } else {
        const errorMessage = editMode ? 'Failed to update pastorate' : 'Failed to create pastorate';
        showNotification(result.error || errorMessage, 'error');
      }
    } catch (error) {
      console.error('Create pastorate error:', error);
      showNotification('Connection error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({ pastorate_name: '', pastorate_short_name: '' });
      setErrors({});
      setNotification(null);
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <BuildingRegular />
            {editMode ? 'Edit Pastorate' : 'Create New Pastorate'}
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

        <p className={styles.description}>
          {editMode
            ? 'Update the pastorate information below. Changes will be saved immediately.'
            : 'Create a new pastorate to organize and manage your congregation. You\'ll be automatically assigned to this pastorate once it\'s created.'
          }
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="pastorate_name" className={styles.label}>
              Pastorate Name *
            </label>
            <div className={styles.inputContainer}>
              <BuildingRegular className={styles.inputIcon} />
              <input
                type="text"
                id="pastorate_name"
                name="pastorate_name"
                className={`${styles.input} ${errors.pastorate_name ? styles.errorInput : ''}`}
                placeholder="Enter the full pastorate name"
                value={formData.pastorate_name}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={100}
                required
              />
            </div>
            {errors.pastorate_name && (
              <span className={styles.errorMessage}>{errors.pastorate_name}</span>
            )}
            {!errors.pastorate_name && (
              <span className={styles.helperText}>
                The official name of your pastorate (e.g., "St. Mary's Church Pastorate")
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="pastorate_short_name" className={styles.label}>
              Short Name *
            </label>
            <div className={styles.inputContainer}>
              <TagRegular className={styles.inputIcon} />
              <input
                type="text"
                id="pastorate_short_name"
                name="pastorate_short_name"
                className={`${styles.input} ${errors.pastorate_short_name ? styles.errorInput : ''}`}
                placeholder="Enter a short name"
                value={formData.pastorate_short_name}
                onChange={handleInputChange}
                disabled={isLoading}
                maxLength={10}
                required
              />
            </div>
            {errors.pastorate_short_name && (
              <span className={styles.errorMessage}>{errors.pastorate_short_name}</span>
            )}
            {!errors.pastorate_short_name && (
              <span className={styles.helperText}>
                A brief identifier for display purposes (e.g., "STMARY", max 10 characters)
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
                  Creating...
                </>
              ) : (
                editMode ? 'Update Pastorate' : 'Create Pastorate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePastorateModal;