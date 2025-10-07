import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  MoneyRegular,
  CheckmarkRegular,
  DismissRegular,
  CheckmarkCircleRegular,
  DismissCircleRegular,
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
  formContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    padding: '32px',
    maxWidth: '80%',
    margin: '0 auto',
    width: '100%',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
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
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
    },
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #e1dfdd',
    borderRadius: '4px',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
    },
  },
  textarea: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #e1dfdd',
    borderRadius: '4px',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    resize: 'vertical',
    minHeight: '80px',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
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
    marginTop: '24px',
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
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  cancelButton: {
    backgroundColor: '#f3f2f1',
    color: '#323130',
    '&:hover:not(:disabled)': {
      backgroundColor: '#e1dfdd',
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
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '500',
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
});

const AddContraTransactionPage = ({
  user,
  onLogout,
  onProfileClick,
  currentPastorate,
  userPastorates,
  onPastorateChange,
  onCreatePastorate,
  onEditPastorate,
  onDeletePastorate,
  currentChurch,
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
    from_account_type: '',
    from_category_id: null,
    to_account_type: '',
    to_category_id: null,
    date: new Date().toISOString().split('T')[0],
    amount: '',
    notes: '',
    bookType: bookType,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [fromCategories, setFromCategories] = useState([]);
  const [toCategories, setToCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const getBookTypeName = () => {
    switch (bookType) {
      case 'cash': return 'Pastorate Cash Book';
      case 'bank': return 'Pastorate Bank Book';
      case 'diocese': return 'Diocese Book';
      default: return 'Cash Book';
    }
  };

  useEffect(() => {
    if (currentPastorate && user) {
      if (isEditMode) {
        loadTransaction();
      } else {
        generateTransactionId();
        getNextVoucherNumber();
      }
    }
  }, [currentPastorate?.id, user?.id, transactionId]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load categories when account type changes
  useEffect(() => {
    if (formData.from_account_type) {
      loadFromCategories();
    } else {
      setFromCategories([]);
      setFormData(prev => ({ ...prev, from_category_id: null }));
    }
  }, [formData.from_account_type]);

  useEffect(() => {
    if (formData.to_account_type) {
      loadToCategories();
    } else {
      setToCategories([]);
      setFormData(prev => ({ ...prev, to_category_id: null }));
    }
  }, [formData.to_account_type]);

  const generateTransactionId = async () => {
    try {
      const result = await window.electron.contra.generateTransactionId();
      if (result.success) {
        setFormData(prev => ({ ...prev, transaction_id: result.transactionId }));
      }
    } catch (error) {
      console.error('Error generating transaction ID:', error);
    }
  };

  const getNextVoucherNumber = async () => {
    try {
      const result = await window.electron.contra.getNextVoucherNumber({
        pastorateId: currentPastorate.id,
        bookType: bookType
      });
      if (result.success) {
        setFormData(prev => ({ ...prev, voucher_number: result.nextVoucherNumber.toString() }));
      }
    } catch (error) {
      console.error('Error getting next voucher number:', error);
    }
  };

  const loadTransaction = async () => {
    setLoading(true);
    try {
      const result = await window.electron.contra.getTransaction({ transactionId });
      if (result.success) {
        const transaction = result.transaction;
        setFormData({
          id: transaction.id,
          transaction_id: transaction.transaction_id,
          voucher_number: transaction.voucher_number.toString(),
          from_account_type: transaction.from_account_type,
          from_category_id: transaction.from_category_id,
          to_account_type: transaction.to_account_type,
          to_category_id: transaction.to_category_id,
          date: transaction.date,
          amount: transaction.amount.toString(),
          notes: transaction.notes || '',
          bookType: transaction.book_type,
        });
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Failed to load transaction'
        });
      }
    } catch (error) {
      console.error('Error loading transaction:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load transaction'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFromCategories = async () => {
    setLoadingCategories(true);
    try {
      const result = await window.electron.ledger.getCategories({
        pastorateId: currentPastorate.id,
        bookType: formData.from_account_type
      });
      if (result.success) {
        // Filter only expense categories and their subcategories
        const expenseCategories = (result.categories || []).filter(
          cat => cat.category_type === 'expense'
        );
        setFromCategories(expenseCategories);
      } else {
        setFromCategories([]);
      }
    } catch (error) {
      console.error('Error loading from categories:', error);
      setFromCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadToCategories = async () => {
    setLoadingCategories(true);
    try {
      const result = await window.electron.ledger.getCategories({
        pastorateId: currentPastorate.id,
        bookType: formData.to_account_type
      });
      if (result.success) {
        // Filter only income categories and their subcategories
        const incomeCategories = (result.categories || []).filter(
          cat => cat.category_type === 'income'
        );
        setToCategories(incomeCategories);
      } else {
        setToCategories([]);
      }
    } catch (error) {
      console.error('Error loading to categories:', error);
      setToCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.transaction_id.trim()) {
      newErrors.transaction_id = 'Transaction ID is required';
    } else if (!formData.transaction_id.match(/^CT-[A-Z0-9]{5}$/)) {
      newErrors.transaction_id = 'Transaction ID must be in format CT-XXXXX';
    }

    if (!formData.voucher_number || parseInt(formData.voucher_number) <= 0) {
      newErrors.voucher_number = 'Please enter a valid voucher number';
    }

    if (!formData.from_account_type) {
      newErrors.from_account_type = 'Please select from account type';
    }

    if (!formData.to_account_type) {
      newErrors.to_account_type = 'Please select to account type';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
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
        ? await window.electron.contra.updateTransaction({
            id: transactionId,
            ...formData,
            voucher_number: parseInt(formData.voucher_number),
            amount: parseFloat(formData.amount),
            pastorateId: currentPastorate.id,
            userId: user.id
          })
        : await window.electron.contra.createTransaction({
            ...formData,
            voucher_number: parseInt(formData.voucher_number),
            amount: parseFloat(formData.amount),
            pastorateId: currentPastorate.id,
            userId: user.id
          });

      if (result.success) {
        setNotification({
          type: 'success',
          message: `Transaction ${isEditMode ? 'updated' : 'created'} successfully`
        });

        if (closeAfter) {
          setTimeout(() => {
            navigate(`/contra-vouchers?bookType=${bookType}`);
          }, 1500);
        } else {
          // Reset form for new entry
          setFormData({
            id: null,
            transaction_id: '',
            voucher_number: '',
            from_account_type: '',
            from_category_id: null,
            to_account_type: '',
            to_category_id: null,
            date: new Date().toISOString().split('T')[0],
            amount: '',
            notes: '',
            bookType: bookType,
          });
          setErrors({});
          generateTransactionId();
          getNextVoucherNumber();
          // Focus on from account type dropdown
          setTimeout(() => {
            const fromAccountSelect = document.querySelector('select[name="from_account_type"]');
            if (fromAccountSelect) {
              fromAccountSelect.focus();
            }
          }, 100);
        }
      } else {
        setNotification({
          type: 'error',
          message: result.error || `Failed to ${isEditMode ? 'update' : 'create'} transaction`
        });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} transaction:`, error);
      setNotification({
        type: 'error',
        message: `Failed to ${isEditMode ? 'update' : 'create'} transaction`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/contra-vouchers?bookType=${bookType}`);
  };

  if (!currentPastorate) {
    return null;
  }

  const capitalizeAccountType = (type) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1) + ' - Pastorate';
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={`${isEditMode ? 'Edit' : 'Add'} Contra Transaction - ${getBookTypeName()}`}
        titleAlign="left"
        breadcrumbs={[
          {
            label: 'Pastorate Dashboard',
            icon: <HomeRegular />,
            onClick: () => navigate('/pastorate-dashboard')
          },
          {
            label: 'Accounts',
            icon: <MoneyRegular />,
            onClick: () => navigate('/pastorate-accounts')
          },
          {
            label: 'Contra Vouchers',
            icon: <MoneyRegular />,
            onClick: () => navigate(`/contra-vouchers?bookType=${bookType}`)
          },
          {
            label: isEditMode ? 'Edit Transaction' : 'Add Transaction',
            icon: <MoneyRegular />,
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
          <div className={`${styles.notification} ${notification.type === 'success' ? styles.notificationSuccess : styles.notificationError}`}>
            {notification.type === 'success' ? <CheckmarkCircleRegular /> : <DismissCircleRegular />}
            {notification.message}
          </div>
        )}

        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>
            {isEditMode ? 'Edit Contra Transaction' : 'Add New Contra Transaction'}
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
                placeholder="e.g., CT-A1B2C"
              />
              {errors.transaction_id && (
                <span className={styles.errorMessage}>{errors.transaction_id}</span>
              )}
              {!errors.transaction_id && (
                <span className={styles.helperText}>Format: CT-XXXXX (5 alphanumeric characters)</span>
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

            <div className={styles.formGroup}>
              <label className={styles.label}>
                From Account Type <span className={styles.required}>*</span>
              </label>
              <select
                name="from_account_type"
                className={`${styles.select} ${errors.from_account_type ? styles.errorInput : ''}`}
                value={formData.from_account_type}
                onChange={(e) => handleInputChange('from_account_type', e.target.value)}
                disabled={loading}
              >
                <option value="">Select Account Type</option>
                <option value="cash">Cash - Pastorate</option>
                <option value="bank">Bank - Pastorate</option>
                <option value="diocese">Diocese - Pastorate</option>
              </select>
              {errors.from_account_type && (
                <span className={styles.errorMessage}>{errors.from_account_type}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                From Category (Expense)
              </label>
              <select
                className={styles.select}
                value={formData.from_category_id || ''}
                onChange={(e) => handleInputChange('from_category_id', e.target.value ? parseInt(e.target.value) : null)}
                disabled={loading || !formData.from_account_type || loadingCategories}
              >
                <option value="">Select Category (Optional)</option>
                {fromCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
              <span className={styles.helperText}>
                {!formData.from_account_type ? 'Select account type first' : 'Optional expense category'}
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                To Account Type <span className={styles.required}>*</span>
              </label>
              <select
                className={`${styles.select} ${errors.to_account_type ? styles.errorInput : ''}`}
                value={formData.to_account_type}
                onChange={(e) => handleInputChange('to_account_type', e.target.value)}
                disabled={loading}
              >
                <option value="">Select Account Type</option>
                <option value="cash">Cash - Pastorate</option>
                <option value="bank">Bank - Pastorate</option>
                <option value="diocese">Diocese - Pastorate</option>
              </select>
              {errors.to_account_type && (
                <span className={styles.errorMessage}>{errors.to_account_type}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                To Category (Income)
              </label>
              <select
                className={styles.select}
                value={formData.to_category_id || ''}
                onChange={(e) => handleInputChange('to_category_id', e.target.value ? parseInt(e.target.value) : null)}
                disabled={loading || !formData.to_account_type || loadingCategories}
              >
                <option value="">Select Category (Optional)</option>
                {toCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
              <span className={styles.helperText}>
                {!formData.to_account_type ? 'Select account type first' : 'Optional income category'}
              </span>
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
                Amount (₹) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                className={`${styles.input} ${errors.amount ? styles.errorInput : ''}`}
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                disabled={loading}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.amount && (
                <span className={styles.errorMessage}>{errors.amount}</span>
              )}
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>
                Notes
              </label>
              <textarea
                className={styles.textarea}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={loading}
                placeholder="Enter any additional notes..."
              />
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
              {loading ? 'Saving...' : (isEditMode ? 'Update' : 'Save & Close')}
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
        userPastorates={userPastorates}
        onPastorateChange={onPastorateChange}
        onCreatePastorate={onCreatePastorate}
        onEditPastorate={onEditPastorate}
        onDeletePastorate={onDeletePastorate}
        currentChurch={currentChurch}
        userChurches={userChurches}
        onChurchChange={onChurchChange}
        onCreateChurch={onCreateChurch}
        onEditChurch={onEditChurch}
        onDeleteChurch={onDeleteChurch}
        currentView="pastorate"
        disablePastorateChurchChange={false}
        disableChurchSelector={true}
      />
    </div>
  );
};

export default AddContraTransactionPage;

