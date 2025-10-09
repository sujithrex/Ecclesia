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
  const bookType = searchParams.get('bookType') || 'all';
  const isEditMode = !!transactionId;

  const [formData, setFormData] = useState({
    id: null,
    transaction_id: '',
    voucher_number: '',
    from_account_type: '',
    from_account_id: '',
    to_account_type: '',
    to_account_id: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);

  useEffect(() => {
    if (currentPastorate && user) {
      loadAllAccounts();
      if (isEditMode) {
        loadTransaction();
      } else {
        generateTransactionId();
        getNextVoucherNumber();
      }
    }
  }, [currentPastorate?.id, user?.id, transactionId]);

  // Pre-select FROM account based on bookType from URL
  useEffect(() => {
    if (!isEditMode && bookType && bookType !== 'all' && allAccounts.length > 0) {
      const accountTypeMap = {
        'cash': 'pastorate_cash',
        'bank': 'pastorate_bank',
        'diocese': 'pastorate_diocese'
      };

      const targetAccountType = accountTypeMap[bookType];
      if (targetAccountType) {
        const matchingAccount = allAccounts.find(acc => acc.type === targetAccountType);
        if (matchingAccount && !formData.from_account_type) {
          setFormData(prev => ({
            ...prev,
            from_account_type: matchingAccount.type,
            from_account_id: matchingAccount.id
          }));
        }
      }
    }
  }, [bookType, allAccounts, isEditMode]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);





  const loadAllAccounts = async () => {
    try {
      const result = await window.electron.accountList.getAllForPastorate({ pastorateId: currentPastorate.id });
      if (result.success) {
        setAllAccounts(result.accounts || []);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };



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

  const getNextVoucherNumber = async (bookType = 'cash') => {
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
          from_account_id: transaction.from_account_id?.toString() || '',
          to_account_type: transaction.to_account_type,
          to_account_id: transaction.to_account_id?.toString() || '',
          date: transaction.date,
          amount: transaction.amount.toString(),
          notes: transaction.notes || '',
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

    if (!formData.from_account_type || !formData.from_account_id) {
      newErrors.from_account_type = 'Please select from account';
    }

    if (!formData.to_account_type || !formData.to_account_id) {
      newErrors.to_account_type = 'Please select to account';
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
      // Determine bookType based on the accounts involved
      // Priority: cash > bank > diocese > all (if custom books involved)
      let bookType = 'all';
      if (formData.from_account_type === 'pastorate_cash' || formData.to_account_type === 'pastorate_cash') {
        bookType = 'cash';
      } else if (formData.from_account_type === 'pastorate_bank' || formData.to_account_type === 'pastorate_bank') {
        bookType = 'bank';
      } else if (formData.from_account_type === 'pastorate_diocese' || formData.to_account_type === 'pastorate_diocese') {
        bookType = 'diocese';
      }

      const result = isEditMode
        ? await window.electron.contra.updateTransaction({
            id: transactionId,
            ...formData,
            voucher_number: parseInt(formData.voucher_number),
            amount: parseFloat(formData.amount),
            bookType,
            pastorateId: currentPastorate.id,
            userId: user.id
          })
        : await window.electron.contra.createTransaction({
            ...formData,
            voucher_number: parseInt(formData.voucher_number),
            amount: parseFloat(formData.amount),
            bookType,
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
            navigate(`/contra-vouchers?bookType=${bookType}&reload=` + Date.now());
          }, 1500);
        } else {
          // Reset form for new entry but keep FROM account if bookType is specified
          const accountTypeMap = {
            'cash': 'pastorate_cash',
            'bank': 'pastorate_bank',
            'diocese': 'pastorate_diocese'
          };

          let preselectedFromType = '';
          let preselectedFromId = '';

          if (bookType && bookType !== 'all') {
            const targetAccountType = accountTypeMap[bookType];
            if (targetAccountType) {
              const matchingAccount = allAccounts.find(acc => acc.type === targetAccountType);
              if (matchingAccount) {
                preselectedFromType = matchingAccount.type;
                preselectedFromId = matchingAccount.id;
              }
            }
          }

          setFormData({
            id: null,
            transaction_id: '',
            voucher_number: '',
            from_account_type: preselectedFromType,
            from_account_id: preselectedFromId,
            to_account_type: '',
            to_account_id: '',
            date: new Date().toISOString().split('T')[0],
            amount: '',
            notes: '',
          });
          setErrors({});
          generateTransactionId();
          getNextVoucherNumber();
          // Focus on to account dropdown since from is pre-selected
          setTimeout(() => {
            const toAccountSelect = document.querySelector('select[name="to_account_type"]');
            if (toAccountSelect) {
              toAccountSelect.focus();
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

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={`${isEditMode ? 'Edit' : 'Add'} Contra Transaction`}
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
                From Account <span className={styles.required}>*</span>
              </label>
              <select
                className={`${styles.select} ${errors.from_account_type ? styles.errorInput : ''}`}
                value={formData.from_account_type && formData.from_account_id ? `${formData.from_account_type}|${formData.from_account_id}` : ''}
                onChange={(e) => {
                  const [type, id] = e.target.value.split('|');

                  // Update both fields at once
                  setFormData(prev => ({
                    ...prev,
                    from_account_type: type || '',
                    from_account_id: id || ''
                  }));

                  // Clear errors
                  if (errors.from_account_type) {
                    setErrors(prev => ({ ...prev, from_account_type: null }));
                  }

                  // Update voucher number based on book type
                  let bookType = 'all';
                  if (type === 'pastorate_cash' || formData.to_account_type === 'pastorate_cash') {
                    bookType = 'cash';
                  } else if (type === 'pastorate_bank' || formData.to_account_type === 'pastorate_bank') {
                    bookType = 'bank';
                  } else if (type === 'pastorate_diocese' || formData.to_account_type === 'pastorate_diocese') {
                    bookType = 'diocese';
                  }

                  if (!isEditMode) {
                    getNextVoucherNumber(bookType);
                  }
                }}
                disabled={loading}
              >
                <option value="">Select From Account</option>
                {allAccounts.map((account, index) => (
                  <option key={index} value={`${account.type}|${account.id}`}>
                    {account.displayName}
                  </option>
                ))}
              </select>
              {errors.from_account_type && (
                <span className={styles.errorMessage}>{errors.from_account_type}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                To Account <span className={styles.required}>*</span>
              </label>
              <select
                className={`${styles.select} ${errors.to_account_type ? styles.errorInput : ''}`}
                value={formData.to_account_type && formData.to_account_id ? `${formData.to_account_type}|${formData.to_account_id}` : ''}
                onChange={(e) => {
                  const [type, id] = e.target.value.split('|');

                  // Update both fields at once
                  setFormData(prev => ({
                    ...prev,
                    to_account_type: type || '',
                    to_account_id: id || ''
                  }));

                  // Clear errors
                  if (errors.to_account_type) {
                    setErrors(prev => ({ ...prev, to_account_type: null }));
                  }

                  // Update voucher number based on book type
                  let bookType = 'all';
                  if (formData.from_account_type === 'pastorate_cash' || type === 'pastorate_cash') {
                    bookType = 'cash';
                  } else if (formData.from_account_type === 'pastorate_bank' || type === 'pastorate_bank') {
                    bookType = 'bank';
                  } else if (formData.from_account_type === 'pastorate_diocese' || type === 'pastorate_diocese') {
                    bookType = 'diocese';
                  }

                  if (!isEditMode) {
                    getNextVoucherNumber(bookType);
                  }
                }}
                disabled={loading}
              >
                <option value="">Select To Account</option>
                {allAccounts.map((account, index) => (
                  <option key={index} value={`${account.type}|${account.id}`}>
                    {account.displayName}
                  </option>
                ))}
              </select>
              {errors.to_account_type && (
                <span className={styles.errorMessage}>{errors.to_account_type}</span>
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

