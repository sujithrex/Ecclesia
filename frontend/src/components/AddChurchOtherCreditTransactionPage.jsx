import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  MoneyRegular,
  CheckmarkRegular,
  DismissRegular,
  ReceiptMoneyRegular,
  CheckmarkCircleRegular,
  DismissCircleRegular,
  InfoRegular,
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 32px)',
    backgroundColor: '#f8f8f8',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: '20px 40px 40px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: '0',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    padding: '32px',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formGroupFull: {
    gridColumn: '1 / -1',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
  },
  required: {
    color: '#d13438',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #e1dfdd',
    borderRadius: '4px',
    backgroundColor: 'white',
    transition: 'border-color 0.2s',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
    },
    '&:disabled': {
      backgroundColor: '#f3f2f1',
      cursor: 'not-allowed',
    },
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #e1dfdd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
    },
    '&:disabled': {
      backgroundColor: '#f3f2f1',
      cursor: 'not-allowed',
    },
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
    justifyContent: 'flex-end',
    marginTop: '32px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '6px',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  primaryButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    '&:hover': {
      backgroundColor: '#A12B5E',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(181, 49, 106, 0.3)',
    },
    '&:disabled': {
      backgroundColor: '#c8c6c4',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
  },
  secondaryButton: {
    backgroundColor: '#8B4789',
    color: 'white',
    '&:hover': {
      backgroundColor: '#7A3E78',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(139, 71, 137, 0.3)',
    },
    '&:disabled': {
      backgroundColor: '#c8c6c4',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
  },
  cancelButton: {
    backgroundColor: '#f3f2f1',
    color: '#323130',
    '&:hover': {
      backgroundColor: '#e1dfdd',
    },
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #d1d1d1',
    borderRadius: '4px',
    marginTop: '4px',
    maxHeight: '200px',
    overflowY: 'auto',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  },
  dropdownItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f3f2f1',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: 1000,
    minWidth: '300px',
    animation: 'slideIn 0.3s ease-out',
  },
  notificationSuccess: {
    backgroundColor: '#dff6dd',
    color: '#107c10',
    border: '1px solid #107c10',
  },
  notificationError: {
    backgroundColor: '#fde7e9',
    color: '#d13438',
    border: '1px solid #d13438',
  },
  notificationInfo: {
    backgroundColor: '#e6f2ff',
    color: '#0078d4',
    border: '1px solid #0078d4',
  },
});

const getNotificationStyle = (type, styles) => {
  switch (type) {
    case 'success':
      return styles.notificationSuccess;
    case 'error':
      return styles.notificationError;
    case 'info':
      return styles.notificationInfo;
    default:
      return styles.notificationInfo;
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckmarkCircleRegular />;
    case 'error':
      return <DismissCircleRegular />;
    case 'info':
      return <InfoRegular />;
    default:
      return <InfoRegular />;
  }
};

const AddChurchOtherCreditTransactionPage = ({
  user,
  onLogout,
  onProfileClick,
  currentPastorate,
  currentChurch,
  userPastorates,
  onPastorateChange,
  onCreatePastorate,
  onEditPastorate,
  onDeletePastorate,
  userChurches,
  onChurchChange,
  onCreateChurch,
  onEditChurch,
  onDeleteChurch
}) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { transactionId } = useParams();
  const [searchParams] = useSearchParams();
  const bookType = searchParams.get('bookType') || 'cash';
  const isEditMode = !!transactionId;

  const [formData, setFormData] = useState({
    id: null,
    transaction_id: '',
    credit_number: '',
    family_id: null,
    giver_name: '',
    primary_category_id: '',
    secondary_category_id: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    bookType: bookType,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [familySearchResults, setFamilySearchResults] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [primaryCategories, setPrimaryCategories] = useState([]);
  const [secondaryCategories, setSecondaryCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const dropdownRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (currentChurch && !isEditMode) {
      loadNextCreditNumber();
      generateTransactionId();
    }
    if (currentChurch) {
      loadPrimaryCategories();
    }
  }, [currentChurch, isEditMode]);

  // Debounced family search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (formData.giver_name && formData.giver_name.length >= 2) {
      const timeout = setTimeout(() => {
        searchFamilies(formData.giver_name);
      }, 300);
      setSearchTimeout(timeout);
    } else {
      setFamilySearchResults([]);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [formData.giver_name]);

  // Load secondary categories when primary category changes
  useEffect(() => {
    if (formData.primary_category_id) {
      loadSecondaryCategories(formData.primary_category_id);
    } else {
      setSecondaryCategories([]);
      setFormData(prev => ({
        ...prev,
        secondary_category_id: ''
      }));
    }
  }, [formData.primary_category_id]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFamilySearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isEditMode && transactionId) {
      loadTransaction();
    }
  }, [isEditMode, transactionId]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const generateTransactionId = async () => {
    try {
      const result = await window.electron.churchOtherCredits.generateTransactionId();
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          transaction_id: result.transactionId
        }));
      }
    } catch (error) {
      console.error('Error generating transaction ID:', error);
    }
  };

  const loadNextCreditNumber = async () => {
    try {
      const result = await window.electron.churchOtherCredits.getNextCreditNumber({
        churchId: currentChurch.id,
        bookType: bookType
      });

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          credit_number: result.nextCreditNumber.toString()
        }));
      }
    } catch (error) {
      console.error('Failed to load next credit number:', error);
    }
  };

  const loadPrimaryCategories = async () => {
    try {
      setLoadingCategories(true);
      const result = await window.electron.ledger.getCategories({
        churchId: currentChurch.id,
        bookType: bookType
      });

      if (result.success) {
        setPrimaryCategories(result.categories || []);
      } else {
        console.error('Failed to load categories:', result.error);
        setNotification({
          type: 'error',
          message: 'Failed to load categories: ' + result.error
        });
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load categories: ' + error.message
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSecondaryCategories = async (primaryCategoryId) => {
    try {
      setLoadingCategories(true);
      const result = await window.electron.ledger.getSubCategories({
        parentCategoryId: primaryCategoryId
      });

      if (result.success) {
        setSecondaryCategories(result.subCategories || []);
      } else {
        console.error('Failed to load sub-categories:', result.error);
        setNotification({
          type: 'error',
          message: 'Failed to load sub-categories: ' + result.error
        });
      }
    } catch (error) {
      console.error('Failed to load sub-categories:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load sub-categories: ' + error.message
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadTransaction = async () => {
    try {
      const result = await window.electron.churchOtherCredits.getTransaction({
        transactionId
      });

      if (result.success) {
        setFormData({
          id: result.transaction.id,
          transaction_id: result.transaction.transaction_id,
          credit_number: result.transaction.credit_number.toString(),
          family_id: result.transaction.family_id,
          giver_name: result.transaction.giver_name,
          primary_category_id: result.transaction.primary_category_id || '',
          secondary_category_id: result.transaction.secondary_category_id || '',
          date: result.transaction.date,
          amount: result.transaction.amount,
          bookType: result.transaction.book_type || bookType
        });
      } else {
        console.error('Failed to load transaction:', result.error);
        setNotification({
          type: 'error',
          message: 'Failed to load transaction: ' + result.error
        });
      }
    } catch (error) {
      console.error('Failed to load transaction:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load transaction: ' + error.message
      });
    }
  };

  const searchFamilies = async (searchTerm) => {
    try {
      const result = await window.electron.churchOtherCredits.searchFamilies({
        churchId: currentChurch.id,
        searchTerm
      });

      if (result.success) {
        setFamilySearchResults(result.families || []);
      }
    } catch (error) {
      console.error('Failed to search families:', error);
    }
  };

  const handleFamilySelect = (family) => {
    setFormData(prev => ({
      ...prev,
      family_id: family.id,
      giver_name: family.displayName
    }));
    setFamilySearchResults([]);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.transaction_id) {
      newErrors.transaction_id = 'Transaction ID is required';
    } else if (!formData.transaction_id.match(/^OC-[A-Z0-9]{5}$/)) {
      newErrors.transaction_id = 'Transaction ID must be in format OC-XXXXX';
    }

    if (!formData.credit_number) {
      newErrors.credit_number = 'Credit number is required';
    } else if (isNaN(formData.credit_number) || parseInt(formData.credit_number) < 1) {
      newErrors.credit_number = 'Credit number must be a positive number';
    }

    if (!formData.giver_name || !formData.giver_name.trim()) {
      newErrors.giver_name = 'Giver name is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (closeAfter = false) => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setNotification(null);

    try {
      const result = isEditMode
        ? await window.electron.churchOtherCredits.updateTransaction({
            id: transactionId,
            ...formData,
            credit_number: parseInt(formData.credit_number),
            primary_category_id: formData.primary_category_id || null,
            secondary_category_id: formData.secondary_category_id || null,
            churchId: currentChurch.id,
            bookType: bookType,
            userId: user.id
          })
        : await window.electron.churchOtherCredits.createTransaction({
            ...formData,
            credit_number: parseInt(formData.credit_number),
            primary_category_id: formData.primary_category_id || null,
            secondary_category_id: formData.secondary_category_id || null,
            churchId: currentChurch.id,
            bookType: bookType,
            userId: user.id
          });

      if (result.success) {
        if (closeAfter) {
          // Navigate immediately without showing notification
          navigate(`/church-other-credits?bookType=${bookType}`);
        } else {
          // Show notification for "Save & Create Another"
          if (isMountedRef.current) {
            setNotification({
              type: 'success',
              message: `Other credit transaction ${isEditMode ? 'updated' : 'created'} successfully!`
            });

            // Reset form for new entry
            setFormData({
              id: null,
              transaction_id: '',
              credit_number: '',
              family_id: null,
              giver_name: '',
              primary_category_id: '',
              secondary_category_id: '',
              date: new Date().toISOString().split('T')[0],
              amount: '',
              bookType: bookType,
            });
            setErrors({});
            setFamilySearchResults([]);
            setSecondaryCategories([]);

            loadNextCreditNumber();
            generateTransactionId();
          }
        }
      } else {
        if (isMountedRef.current) {
          setNotification({
            type: 'error',
            message: result.error || `Failed to ${isEditMode ? 'update' : 'create'} transaction`
          });
        }
      }
    } catch (error) {
      console.error('Failed to save transaction:', error);
      if (isMountedRef.current) {
        setNotification({
          type: 'error',
          message: 'Failed to save transaction: ' + error.message
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    navigate(`/church-other-credits?bookType=${bookType}`);
  };

  if (!currentChurch) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${getNotificationStyle(notification.type, styles)}`}>
          {getNotificationIcon(notification.type)}
          {notification.message}
        </div>
      )}

      <Breadcrumb
        pageTitle={`${isEditMode ? 'Edit' : 'Add'} Other Credit Transaction (${bookType.charAt(0).toUpperCase() + bookType.slice(1)} Book) - ${currentChurch.church_name}`}
        titleAlign="left"
        breadcrumbs={[
          {
            label: 'Church Dashboard',
            icon: <HomeRegular />,
            onClick: () => navigate('/church-dashboard')
          },
          {
            label: 'Accounts',
            icon: <MoneyRegular />,
            onClick: () => navigate('/church-accounts')
          },
          {
            label: `Other Credits (${bookType.charAt(0).toUpperCase() + bookType.slice(1)} Book)`,
            icon: <ReceiptMoneyRegular />,
            onClick: () => navigate(`/church-other-credits?bookType=${bookType}`)
          },
          {
            label: isEditMode ? 'Edit Transaction' : 'Add Transaction',
            icon: <ReceiptMoneyRegular />,
            current: true
          }
        ]}
        onNavigate={(breadcrumb) => {
          if (breadcrumb.onClick) {
            breadcrumb.onClick();
          }
        }}
      />

      <div className={styles.content}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {isEditMode ? 'Edit Other Credit Transaction' : 'Add Other Credit Transaction'}
          </h2>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Transaction ID <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.transaction_id ? styles.errorInput : ''}`}
                value={formData.transaction_id}
                onChange={(e) => handleInputChange('transaction_id', e.target.value.toUpperCase())}
                maxLength={8}
                disabled={loading}
                placeholder="e.g., OC-A1B2C"
              />
              {errors.transaction_id && (
                <span className={styles.errorMessage}>{errors.transaction_id}</span>
              )}
              {!errors.transaction_id && (
                <span className={styles.helperText}>Format: OC-XXXXX (5 alphanumeric characters)</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Credit Number <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                className={`${styles.input} ${errors.credit_number ? styles.errorInput : ''}`}
                value={formData.credit_number}
                onChange={(e) => handleInputChange('credit_number', e.target.value)}
                disabled={loading}
                placeholder="e.g., 1"
                min="1"
              />
              {errors.credit_number && (
                <span className={styles.errorMessage}>{errors.credit_number}</span>
              )}
              {!errors.credit_number && (
                <span className={styles.helperText}>Auto-generated, can be edited</span>
              )}
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>
                Name of Family / Giver <span className={styles.required}>*</span>
              </label>
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <input
                  type="text"
                  className={`${styles.input} ${errors.giver_name ? styles.errorInput : ''}`}
                  value={formData.giver_name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      giver_name: value,
                      family_id: null // Clear family_id when typing
                    }));
                  }}
                  placeholder="Type family name or enter custom name"
                  disabled={loading}
                  autoComplete="off"
                  style={{ width: '100%' }}
                />
                {familySearchResults.length > 0 && (
                  <div className={styles.dropdown}>
                    {familySearchResults.map((family) => (
                      <div
                        key={family.id}
                        className={styles.dropdownItem}
                        onClick={() => handleFamilySelect(family)}
                      >
                        {family.displayName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.giver_name && (
                <span className={styles.errorMessage}>{errors.giver_name}</span>
              )}
              {!errors.giver_name && (
                <span className={styles.helperText}>
                  Type at least 2 characters to search families, or enter any custom name
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Primary Category
              </label>
              <select
                className={`${styles.select} ${errors.primary_category_id ? styles.errorInput : ''}`}
                value={formData.primary_category_id}
                onChange={(e) => handleInputChange('primary_category_id', e.target.value)}
                disabled={loading || loadingCategories}
              >
                <option value="">Select Primary Category (Optional)</option>
                {primaryCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name} ({category.category_type})
                  </option>
                ))}
              </select>
              {errors.primary_category_id && (
                <span className={styles.errorMessage}>{errors.primary_category_id}</span>
              )}
              {!errors.primary_category_id && (
                <span className={styles.helperText}>Optional - Choose income or expense category</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Secondary Category
              </label>
              <select
                className={`${styles.select} ${errors.secondary_category_id ? styles.errorInput : ''}`}
                value={formData.secondary_category_id}
                onChange={(e) => handleInputChange('secondary_category_id', e.target.value)}
                disabled={loading || loadingCategories || !formData.primary_category_id}
              >
                <option value="">Select Secondary Category (Optional)</option>
                {secondaryCategories.map((subCategory) => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.sub_category_name}
                  </option>
                ))}
              </select>
              {errors.secondary_category_id && (
                <span className={styles.errorMessage}>{errors.secondary_category_id}</span>
              )}
              {!errors.secondary_category_id && (
                <span className={styles.helperText}>
                  {formData.primary_category_id 
                    ? 'Optional - Choose sub-category' 
                    : 'Select primary category first'}
                </span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Date <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                className={`${styles.input} ${errors.date ? styles.errorInput : ''}`}
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                disabled={loading}
              />
              {errors.date && (
                <span className={styles.errorMessage}>{errors.date}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Amount <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                className={`${styles.input} ${errors.amount ? styles.errorInput : ''}`}
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                disabled={loading}
                placeholder="e.g., 1000.00"
                step="0.01"
                min="0"
              />
              {errors.amount && (
                <span className={styles.errorMessage}>{errors.amount}</span>
              )}
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={handleCancel}
              disabled={loading}
            >
              <DismissRegular />
              Cancel
            </button>
            {!isEditMode && (
              <button
                className={`${styles.button} ${styles.secondaryButton}`}
                onClick={() => handleSubmit(false)}
                disabled={loading}
              >
                <CheckmarkRegular />
                Save & Create Another
              </button>
            )}
            <button
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={() => handleSubmit(true)}
              disabled={loading}
            >
              <CheckmarkRegular />
              {isEditMode ? 'Update' : 'Save & Close'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        user={user}
        onLogout={onLogout}
        onProfileClick={onProfileClick}
        currentPastorate={currentPastorate}
        currentChurch={currentChurch}
        userPastorates={userPastorates}
        onPastorateChange={onPastorateChange}
        onCreatePastorate={onCreatePastorate}
        onEditPastorate={onEditPastorate}
        onDeletePastorate={onDeletePastorate}
        userChurches={userChurches}
        onChurchChange={onChurchChange}
        onCreateChurch={onCreateChurch}
        onEditChurch={onEditChurch}
        onDeleteChurch={onDeleteChurch}
        currentView="church"
        disablePastorateChurchChange={true}
        disableChurchSelector={false}
      />
    </div>
  );
};

export default AddChurchOtherCreditTransactionPage;
