import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  MoneyRegular,
  CheckmarkRegular,
  DismissRegular,
  DocumentRegular,
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
  textarea: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #e1dfdd',
    borderRadius: '4px',
    backgroundColor: 'white',
    transition: 'border-color 0.2s',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    resize: 'vertical',
    minHeight: '80px',
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
  },
  helperText: {
    fontSize: '12px',
    color: '#605e5c',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  },
  cancelButton: {
    backgroundColor: 'white',
    color: '#323130',
    border: '1px solid #8a8886',
    '&:hover:not(:disabled)': {
      backgroundColor: '#f3f2f1',
    },
  },
  secondaryButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    '&:hover:not(:disabled)': {
      backgroundColor: '#A12B5E',
    },
  },
  primaryButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    '&:hover:not(:disabled)': {
      backgroundColor: '#A12B5E',
    },
  },
  notification: {
    padding: '12px 24px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '16px',
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
});

const AddChurchBillVoucherTransactionPage = ({
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
    voucher_number: '',
    payee_name: '',
    primary_category_id: '',
    secondary_category_id: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    notes: '',
    bookType: bookType,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [primaryCategories, setPrimaryCategories] = useState([]);
  const [secondaryCategories, setSecondaryCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const isMountedRef = useRef(true);

  const getBookTypeName = () => {
    switch (bookType) {
      case 'cash': return 'Pastorate Cash Book';
      case 'bank': return 'Pastorate Bank Book';
      case 'diocese': return 'Diocese Book';
      default: return 'Cash Book';
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (currentChurch && user) {
      if (isEditMode) {
        loadTransaction();
      } else {
        generateTransactionId();
        loadNextVoucherNumber();
      }
      loadPrimaryCategories();
    }
  }, [currentChurch?.id, user?.id, transactionId]);

  useEffect(() => {
    if (formData.primary_category_id) {
      loadSecondaryCategories(formData.primary_category_id);
    } else {
      setSecondaryCategories([]);
      setFormData(prev => ({ ...prev, secondary_category_id: '' }));
    }
  }, [formData.primary_category_id]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setNotification(null);
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadTransaction = async () => {
    setLoading(true);
    try {
      const result = await window.electron.churchBillVoucher.getTransaction({
        transactionId: transactionId
      });

      if (result.success && isMountedRef.current) {
        const transaction = result.transaction;
        setFormData({
          id: transaction.id,
          transaction_id: transaction.transaction_id,
          voucher_number: transaction.voucher_number.toString(),
          payee_name: transaction.payee_name,
          primary_category_id: transaction.primary_category_id || '',
          secondary_category_id: transaction.secondary_category_id || '',
          date: transaction.date,
          amount: transaction.amount.toString(),
          notes: transaction.notes || '',
          bookType: bookType,
        });
      } else {
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
    } finally {
      setLoading(false);
    }
  };

  const generateTransactionId = async () => {
    try {
      const result = await window.electron.churchBillVoucher.generateTransactionId();
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

  const loadNextVoucherNumber = async () => {
    try {
      const result = await window.electron.churchBillVoucher.getNextVoucherNumber({
        churchId: currentChurch.id,
        bookType: bookType
      });

      if (result.success) {
        setFormData(prev => ({
          ...prev,
          voucher_number: result.nextVoucherNumber.toString()
        }));
      }
    } catch (error) {
      console.error('Failed to load next voucher number:', error);
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
        // Filter only expense categories for bill vouchers
        const expenseCategories = (result.categories || []).filter(
          cat => cat.category_type === 'expense'
        );
        setPrimaryCategories(expenseCategories);
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

    if (!formData.transaction_id.trim()) {
      newErrors.transaction_id = 'Transaction ID is required';
    } else if (!formData.transaction_id.match(/^BV-[A-Z0-9]{5}$/)) {
      newErrors.transaction_id = 'Transaction ID must be in format BV-XXXXX';
    }

    if (!formData.voucher_number || parseInt(formData.voucher_number) < 1) {
      newErrors.voucher_number = 'Voucher number must be at least 1';
    }

    if (!formData.payee_name.trim()) {
      newErrors.payee_name = 'Payee name is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (closeAfter = true) => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setNotification(null);

    try {
      const result = isEditMode
        ? await window.electron.churchBillVoucher.updateTransaction({
            id: transactionId,
            ...formData,
            voucher_number: parseInt(formData.voucher_number),
            primary_category_id: formData.primary_category_id || null,
            secondary_category_id: formData.secondary_category_id || null,
            churchId: currentChurch.id,
            bookType: bookType,
            userId: user.id
          })
        : await window.electron.churchBillVoucher.createTransaction({
            ...formData,
            voucher_number: parseInt(formData.voucher_number),
            primary_category_id: formData.primary_category_id || null,
            secondary_category_id: formData.secondary_category_id || null,
            churchId: currentChurch.id,
            bookType: bookType,
            userId: user.id
          });

      if (result.success) {
        if (closeAfter) {
          // Navigate immediately without showing notification
          navigate(`/church-bill-vouchers?bookType=${bookType}`);
        } else {
          // Show notification for "Save & Create Another"
          if (isMountedRef.current) {
            setNotification({
              type: 'success',
              message: `Bill voucher transaction ${isEditMode ? 'updated' : 'created'} successfully!`
            });

            // Reset form for new entry
            setFormData({
              id: null,
              transaction_id: '',
              voucher_number: '',
              payee_name: '',
              primary_category_id: '',
              secondary_category_id: '',
              date: new Date().toISOString().split('T')[0],
              amount: '',
              notes: '',
              bookType: bookType,
            });
            setErrors({});
            setSecondaryCategories([]);

            loadNextVoucherNumber();
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
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} transaction:`, error);
      if (isMountedRef.current) {
        setNotification({
          type: 'error',
          message: `Failed to ${isEditMode ? 'update' : 'create'} transaction: ${error.message}`
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    navigate(`/church-bill-vouchers?bookType=${bookType}`);
  };

  if (!currentChurch) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={`${isEditMode ? 'Edit' : 'Add'} Bill Voucher - ${getBookTypeName()}`}
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
            label: 'Bills / Vouchers',
            icon: <DocumentRegular />,
            onClick: () => navigate(`/church-bill-vouchers?bookType=${bookType}`)
          },
          {
            label: isEditMode ? 'Edit Transaction' : 'Add Transaction',
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

        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {isEditMode ? 'Edit Bill Voucher Transaction' : 'Add Bill Voucher Transaction'}
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
                placeholder="e.g., BV-A1B2C"
              />
              {errors.transaction_id && (
                <span className={styles.errorMessage}>{errors.transaction_id}</span>
              )}
              {!errors.transaction_id && (
                <span className={styles.helperText}>Format: BV-XXXXX (5 alphanumeric characters)</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Voucher Number <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                className={`${styles.input} ${errors.voucher_number ? styles.errorInput : ''}`}
                value={formData.voucher_number}
                onChange={(e) => handleInputChange('voucher_number', e.target.value)}
                disabled={loading}
                placeholder="e.g., 1"
                min="1"
              />
              {errors.voucher_number && (
                <span className={styles.errorMessage}>{errors.voucher_number}</span>
              )}
              {!errors.voucher_number && (
                <span className={styles.helperText}>Auto-generated, can be edited</span>
              )}
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>
                Payee Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={`${styles.input} ${errors.payee_name ? styles.errorInput : ''}`}
                value={formData.payee_name}
                onChange={(e) => handleInputChange('payee_name', e.target.value)}
                placeholder="Enter payee name"
                disabled={loading}
                autoComplete="off"
                style={{ width: '100%' }}
              />
              {errors.payee_name && (
                <span className={styles.errorMessage}>{errors.payee_name}</span>
              )}
              {!errors.payee_name && (
                <span className={styles.helperText}>
                  Enter the name of the person or organization receiving payment
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
                    {category.category_name}
                  </option>
                ))}
              </select>
              {errors.primary_category_id && (
                <span className={styles.errorMessage}>{errors.primary_category_id}</span>
              )}
              {!errors.primary_category_id && (
                <span className={styles.helperText}>Optional - Choose expense category</span>
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

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>
                Additional Notes
              </label>
              <textarea
                className={`${styles.textarea} ${errors.notes ? styles.errorInput : ''}`}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={loading}
                placeholder="Enter any additional notes or comments..."
                rows="4"
              />
              {errors.notes && (
                <span className={styles.errorMessage}>{errors.notes}</span>
              )}
              {!errors.notes && (
                <span className={styles.helperText}>Optional - Add any relevant notes or comments</span>
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

export default AddChurchBillVoucherTransactionPage;



