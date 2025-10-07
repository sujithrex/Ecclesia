import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  MoneyRegular,
  CheckmarkRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';

// Built-in offering sub-categories
const OFFERING_TYPES = [
  'Baptism offertory',
  'Church offertory',
  'Harvest Festival offertory',
  'Holy Communion offertory',
  'House Visit offertory',
  'Marriage offertory',
  'Miscellaneous Collections',
  'Miscellaneous Income',
  'Miscellaneous offertory',
  'Receipts',
  'Sangam (CW/DW)',
  'Sangam - Sabai',
  'Thanks offertory',
  'Tithe offertory',
  'Trumphat Festival'
];

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
    padding: '20px 40px',
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
    color: '#D13438',
  },
  input: {
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
    fontSize: '12px',
    color: '#D13438',
  },
  helperText: {
    fontSize: '12px',
    color: '#605e5c',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '20px',
    borderTop: '1px solid #e1dfdd',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
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
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(181, 49, 106, 0.3)',
    },
  },
  notification: {
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
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

const AddOfferingTransactionPage = ({
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
  const isEditMode = !!transactionId;
  const churchDropdownRef = React.useRef(null); // Add ref for church dropdown

  const [formData, setFormData] = useState({
    id: null, // Store database ID for editing
    transaction_id: '',
    church_id: '',
    offering_type: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [churches, setChurches] = useState([]);

  useEffect(() => {
    if (currentPastorate && user) {
      loadChurches();
      if (isEditMode) {
        loadTransaction();
      } else {
        generateTransactionId();
      }
    }
  }, [currentPastorate?.id, user?.id, transactionId]);

  const loadChurches = async () => {
    try {
      const result = await window.electron.church.getUserChurchesByPastorate({
        userId: user.id,
        pastorateId: currentPastorate.id
      });
      if (result.success) {
        setChurches(result.churches);
      }
    } catch (error) {
      console.error('Failed to load churches:', error);
    }
  };

  const generateTransactionId = () => {
    // Generate a random 5-character alphanumeric ID
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, transaction_id: id }));
  };

  const loadTransaction = async () => {
    try {
      const result = await window.electron.offerings.getTransaction({
        transactionId
      });

      if (result.success) {
        setFormData({
          id: result.transaction.id, // Store database ID
          transaction_id: result.transaction.transaction_id,
          church_id: result.transaction.church_id,
          offering_type: result.transaction.offering_type,
          date: result.transaction.date,
          amount: result.transaction.amount
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
    }
    if (!formData.church_id) {
      newErrors.church_id = 'Please select a church';
    }
    if (!formData.offering_type) {
      newErrors.offering_type = 'Please select an offering type';
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
      // TODO: Replace with actual API call
      const result = isEditMode
        ? await window.electron.offerings.updateTransaction({
            id: transactionId, // Pass the URL parameter as ID
            ...formData,
            pastorateId: currentPastorate.id,
            userId: user.id
          })
        : await window.electron.offerings.createTransaction({
            ...formData,
            pastorateId: currentPastorate.id,
            userId: user.id
          });

      if (result.success) {
        setNotification({
          type: 'success',
          message: `Transaction ${isEditMode ? 'updated' : 'created'} successfully!`
        });

        if (closeAfter) {
          setTimeout(() => {
            navigate('/offerings');
          }, 1500);
        } else {
          // Reset form for another entry
          setTimeout(() => {
            setFormData({
              id: null,
              transaction_id: '',
              church_id: '',
              offering_type: '',
              date: new Date().toISOString().split('T')[0],
              amount: '',
            });
            generateTransactionId();
            setNotification(null);

            // Scroll to church dropdown
            if (churchDropdownRef.current) {
              churchDropdownRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
              // Focus on church dropdown after scroll
              setTimeout(() => {
                churchDropdownRef.current.focus();
              }, 500);
            }
          }, 1500);
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
    navigate('/offerings');
  };

  if (!currentPastorate) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Breadcrumb
        pageTitle={`${isEditMode ? 'Edit' : 'Add'} Offering Transaction`}
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
            label: 'Offerings',
            icon: <MoneyRegular />,
            onClick: () => navigate('/offerings')
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
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>
            {isEditMode ? 'Edit Offering Transaction' : 'Add Offering Transaction'}
          </h2>

          {notification && (
            <div className={`${styles.notification} ${
              notification.type === 'success' 
                ? styles.notificationSuccess 
                : styles.notificationError
            }`}>
              {notification.message}
            </div>
          )}

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
                maxLength={5}
                disabled={loading}
                placeholder="e.g., A1B2C"
              />
              {errors.transaction_id && (
                <span className={styles.errorMessage}>{errors.transaction_id}</span>
              )}
              {!errors.transaction_id && (
                <span className={styles.helperText}>5-digit alphanumeric ID</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Church Name <span className={styles.required}>*</span>
              </label>
              <select
                ref={churchDropdownRef}
                className={`${styles.select} ${errors.church_id ? styles.errorInput : ''}`}
                value={formData.church_id}
                onChange={(e) => handleInputChange('church_id', e.target.value)}
                disabled={loading}
              >
                <option value="">Select a church</option>
                {churches.map(church => (
                  <option key={church.id} value={church.id}>
                    {church.church_name}
                  </option>
                ))}
              </select>
              {errors.church_id && (
                <span className={styles.errorMessage}>{errors.church_id}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Type of Offering <span className={styles.required}>*</span>
              </label>
              <select
                className={`${styles.select} ${errors.offering_type ? styles.errorInput : ''}`}
                value={formData.offering_type}
                onChange={(e) => handleInputChange('offering_type', e.target.value)}
                disabled={loading}
              >
                <option value="">Select offering type</option>
                {OFFERING_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.offering_type && (
                <span className={styles.errorMessage}>{errors.offering_type}</span>
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

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
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
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={handleCancel}
              disabled={loading}
            >
              <DismissRegular />
              Cancel
            </button>
            {!isEditMode && (
              <button
                type="button"
                className={`${styles.button} ${styles.submitButton}`}
                onClick={() => handleSubmit(false)}
                disabled={loading}
              >
                <CheckmarkRegular />
                {loading ? 'Saving...' : 'Submit & Another'}
              </button>
            )}
            <button
              type="button"
              className={`${styles.button} ${styles.submitButton}`}
              onClick={() => handleSubmit(true)}
              disabled={loading}
            >
              <CheckmarkRegular />
              {loading ? 'Saving...' : (isEditMode ? 'Update' : 'Submit & Close')}
            </button>
          </div>
        </div>
      </div>

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
        disableChurchSelector={true}
      />
    </div>
  );
};

export default AddOfferingTransactionPage;

