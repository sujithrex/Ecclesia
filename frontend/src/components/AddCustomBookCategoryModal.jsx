import React, { useState, useEffect } from 'react';
import { makeStyles } from '@fluentui/react-components';
import {
  DismissRegular,
  CheckmarkCircleRegular,
  DismissCircleRegular,
  DocumentRegular,
} from '@fluentui/react-icons';

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
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #e1dfdd',
  },
  title: {
    fontSize: '20px',
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
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#605e5c',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
  notification: {
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '4px',
    margin: '16px 24px 0',
  },
  notificationSuccess: {
    backgroundColor: '#DFF6DD',
    color: '#107C10',
    border: '1px solid #9FD89F',
  },
  notificationError: {
    backgroundColor: '#FDE7E9',
    color: '#D13438',
    border: '1px solid #F7B9B9',
  },
  form: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '8px',
  },
  required: {
    color: '#D13438',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #8a8886',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      borderColor: '#B5316A',
    },
    '&:disabled': {
      backgroundColor: '#f3f2f1',
      cursor: 'not-allowed',
    },
  },
  errorInput: {
    borderColor: '#D13438',
  },
  errorMessage: {
    color: '#D13438',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block',
  },
  helperText: {
    color: '#605e5c',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block',
  },
  radioGroup: {
    display: 'flex',
    gap: '16px',
    marginTop: '8px',
  },
  radioOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  radioInput: {
    cursor: 'pointer',
  },
  radioLabel: {
    fontSize: '14px',
    color: '#323130',
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    padding: '16px 24px',
    borderTop: '1px solid #e1dfdd',
  },
  button: {
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
  primaryButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    '&:hover': {
      backgroundColor: '#9c2959',
    },
  },
  secondaryButton: {
    backgroundColor: '#f3f2f1',
    color: '#323130',
    '&:hover': {
      backgroundColor: '#e1dfdd',
    },
  },
});

const AddCustomBookCategoryModal = ({
  isOpen,
  onClose,
  onSuccess,
  customBookId,
  pastorateId,
  churchId,
  isChurchLevel = false,
}) => {
  const styles = useStyles();
  const [formData, setFormData] = useState({
    category_name: '',
    category_type: 'income',
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        category_name: '',
        category_type: 'income',
      });
      setErrors({});
      setNotification(null);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleRadioChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      category_type: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category_name.trim()) {
      newErrors.category_name = 'Category name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const categoryAPI = isChurchLevel 
        ? window.electron.churchCustomBookCategory 
        : window.electron.customBookCategory;

      const params = {
        customBookId: parseInt(customBookId),
        categoryName: formData.category_name.trim(),
        categoryType: formData.category_type,
      };

      if (isChurchLevel) {
        params.churchId = parseInt(churchId);
      } else {
        params.pastorateId = parseInt(pastorateId);
      }

      const result = await categoryAPI.create(params);

      if (result.success) {
        setNotification({
          type: 'success',
          message: 'Category created successfully!',
        });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Failed to create category',
        });
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setNotification({
        type: 'error',
        message: 'An error occurred while creating the category',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <DocumentRegular />
            Add Category
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

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="category_name" className={styles.label}>
              Category Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="category_name"
              name="category_name"
              className={`${styles.input} ${errors.category_name ? styles.errorInput : ''}`}
              placeholder="Enter category name"
              value={formData.category_name}
              onChange={handleInputChange}
              disabled={isLoading}
              maxLength={100}
              required
            />
            {errors.category_name && (
              <span className={styles.errorMessage}>{errors.category_name}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Category Type <span className={styles.required}>*</span>
            </label>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="category_type"
                  value="income"
                  checked={formData.category_type === 'income'}
                  onChange={() => handleRadioChange('income')}
                  disabled={isLoading}
                  className={styles.radioInput}
                />
                <span className={styles.radioLabel}>Income</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="category_type"
                  value="expense"
                  checked={formData.category_type === 'expense'}
                  onChange={() => handleRadioChange('expense')}
                  disabled={isLoading}
                  className={styles.radioInput}
                />
                <span className={styles.radioLabel}>Expense</span>
              </label>
            </div>
          </div>
        </form>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomBookCategoryModal;

