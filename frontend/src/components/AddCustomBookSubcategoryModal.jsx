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
  select: {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #8a8886',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: 'white',
    cursor: 'pointer',
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

const AddCustomBookSubcategoryModal = ({
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
    parent_category_id: '',
    subcategory_name: '',
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        parent_category_id: '',
        subcategory_name: '',
      });
      setErrors({});
      setNotification(null);
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const categoryAPI = isChurchLevel 
        ? window.electron.churchCustomBookCategory 
        : window.electron.customBookCategory;

      const params = isChurchLevel
        ? { customBookId: parseInt(customBookId), churchId: parseInt(churchId) }
        : { customBookId: parseInt(customBookId), pastorateId: parseInt(pastorateId) };

      const result = await categoryAPI.getAll(params);
      setCategories(result || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load categories',
      });
    }
  };

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.parent_category_id) {
      newErrors.parent_category_id = 'Parent category is required';
    }

    if (!formData.subcategory_name.trim()) {
      newErrors.subcategory_name = 'Subcategory name is required';
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
        categoryId: parseInt(formData.parent_category_id),
        subcategoryData: {
          subcategory_name: formData.subcategory_name.trim(),
        },
      };

      const result = await categoryAPI.createSubcategory(params);

      if (result.success) {
        setNotification({
          type: 'success',
          message: 'Subcategory created successfully!',
        });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Failed to create subcategory',
        });
      }
    } catch (error) {
      console.error('Error creating subcategory:', error);
      setNotification({
        type: 'error',
        message: 'An error occurred while creating the subcategory',
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
            Add Subcategory
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
            <label htmlFor="parent_category_id" className={styles.label}>
              Parent Category <span className={styles.required}>*</span>
            </label>
            <select
              id="parent_category_id"
              name="parent_category_id"
              className={`${styles.select} ${errors.parent_category_id ? styles.errorInput : ''}`}
              value={formData.parent_category_id}
              onChange={handleInputChange}
              disabled={isLoading}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.category_name} ({category.category_type === 'income' ? 'Income' : 'Expense'})
                </option>
              ))}
            </select>
            {errors.parent_category_id && (
              <span className={styles.errorMessage}>{errors.parent_category_id}</span>
            )}
            {!errors.parent_category_id && categories.length === 0 && (
              <span className={styles.helperText}>
                No categories available. Please create a category first.
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="subcategory_name" className={styles.label}>
              Subcategory Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="subcategory_name"
              name="subcategory_name"
              className={`${styles.input} ${errors.subcategory_name ? styles.errorInput : ''}`}
              placeholder="Enter subcategory name"
              value={formData.subcategory_name}
              onChange={handleInputChange}
              disabled={isLoading}
              maxLength={100}
              required
            />
            {errors.subcategory_name && (
              <span className={styles.errorMessage}>{errors.subcategory_name}</span>
            )}
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
            disabled={isLoading || categories.length === 0}
          >
            {isLoading ? 'Creating...' : 'Create Subcategory'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomBookSubcategoryModal;

