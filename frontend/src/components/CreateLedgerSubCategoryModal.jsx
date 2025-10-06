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
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
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
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #8a8886',
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
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
    display: 'block',
    fontSize: '12px',
    color: '#D13438',
    marginTop: '4px',
  },
  helperText: {
    display: 'block',
    fontSize: '12px',
    color: '#605e5c',
    marginTop: '4px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #e1dfdd',
  },
  button: {
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
  cancelButton: {
    backgroundColor: 'white',
    color: '#323130',
    border: '1px solid #8a8886',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  submitButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
  },
});

const CreateLedgerSubCategoryModal = ({
  isOpen,
  onClose,
  onSuccess,
  user,
  currentPastorate,
  bookType, // 'cash', 'bank', or 'diocese'
  categories = [], // List of parent categories
  editMode = false,
  initialData = null
}) => {
  const styles = useStyles();
  const [formData, setFormData] = useState({
    parent_category_id: '',
    sub_category_name: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (isOpen && editMode && initialData) {
      setFormData({
        parent_category_id: initialData.parent_category_id || '',
        sub_category_name: initialData.sub_category_name || '',
      });
    } else if (isOpen && !editMode) {
      setFormData({
        parent_category_id: '',
        sub_category_name: '',
      });
    }
  }, [isOpen, editMode, initialData]);

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
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.parent_category_id) {
      newErrors.parent_category_id = 'Please select a parent category';
    }

    if (!formData.sub_category_name.trim()) {
      newErrors.sub_category_name = 'Sub-category name is required';
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
    setNotification(null);

    try {
      // TODO: Replace with actual API call
      const result = editMode
        ? await window.electron.ledger.updateSubCategory({
            subCategoryId: initialData.id,
            ...formData,
            pastorateId: currentPastorate.id,
            bookType,
            userId: user.id
          })
        : await window.electron.ledger.createSubCategory({
            ...formData,
            pastorateId: currentPastorate.id,
            bookType,
            userId: user.id
          });

      if (result.success) {
        setNotification({
          type: 'success',
          message: `Sub-category ${editMode ? 'updated' : 'created'} successfully!`
        });
        setTimeout(() => {
          onSuccess(result.subCategory);
          handleClose();
        }, 1500);
      } else {
        setNotification({
          type: 'error',
          message: result.error || `Failed to ${editMode ? 'update' : 'create'} sub-category`
        });
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'creating'} sub-category:`, error);
      setNotification({
        type: 'error',
        message: `Failed to ${editMode ? 'update' : 'create'} sub-category`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      parent_category_id: '',
      sub_category_name: '',
    });
    setErrors({});
    setIsLoading(false);
    setNotification(null);
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <DocumentRegular />
            {editMode ? 'Edit Ledger Sub-Category' : 'Create Ledger Sub-Category'}
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
                  {category.category_name} ({category.category_type})
                </option>
              ))}
            </select>
            {errors.parent_category_id && (
              <span className={styles.errorMessage}>{errors.parent_category_id}</span>
            )}
            {!errors.parent_category_id && (
              <span className={styles.helperText}>
                Select the parent category for this sub-category
              </span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="sub_category_name" className={styles.label}>
              Sub-Category Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="sub_category_name"
              name="sub_category_name"
              className={`${styles.input} ${errors.sub_category_name ? styles.errorInput : ''}`}
              placeholder="Enter sub-category name"
              value={formData.sub_category_name}
              onChange={handleInputChange}
              disabled={isLoading}
              maxLength={100}
              required
            />
            {errors.sub_category_name && (
              <span className={styles.errorMessage}>{errors.sub_category_name}</span>
            )}
            {!errors.sub_category_name && (
              <span className={styles.helperText}>
                Enter a descriptive name for this sub-category (e.g., "Building Fund", "Staff Salaries")
              </span>
            )}
          </div>
        </form>

        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.submitButton}`}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (editMode ? 'Update Sub-Category' : 'Create Sub-Category')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateLedgerSubCategoryModal;

