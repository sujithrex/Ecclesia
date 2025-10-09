import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  MoneyRegular,
  CheckmarkRegular,
  DismissRegular,
  BuildingRegular,
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
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
  },
  textarea: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #e1dfdd',
    borderRadius: '4px',
    backgroundColor: 'white',
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'inherit',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
    },
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
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  primaryButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    '&:hover': {
      backgroundColor: '#9a2858',
    },
    '&:disabled': {
      backgroundColor: '#c7c7c7',
      cursor: 'not-allowed',
    },
  },
  secondaryButton: {
    backgroundColor: '#f3f2f1',
    color: '#323130',
    '&:hover': {
      backgroundColor: '#e1dfdd',
    },
  },
  alert: {
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  alertSuccess: {
    backgroundColor: '#dff6dd',
    color: '#107c10',
    border: '1px solid #107c10',
  },
  alertError: {
    backgroundColor: '#fde7e9',
    color: '#d13438',
    border: '1px solid #d13438',
  },
  disabledInput: {
    backgroundColor: '#f3f2f1',
    cursor: 'not-allowed',
  },
});

const AddCustomBookContraPage = ({
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
  onDeleteChurch,
}) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { bookId, transactionId } = useParams();
  const [searchParams] = useSearchParams();
  const isChurchLevel = searchParams.get('church') === 'true';
  const isEditMode = !!transactionId;

  const [book, setBook] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    fromAccountType: '',
    fromAccountId: '',
    toAccountType: '',
    toAccountId: '',
    fromName: '',
    toName: '',
    amount: '',
    remarks: '',
    categoryId: '',
    subcategoryId: '',
    fromCategoryId: '',
    fromSubcategoryId: '',
    toCategoryId: '',
    toSubcategoryId: '',
  });
  const [txId, setTxId] = useState('');
  const [voucherNumber, setVoucherNumber] = useState('');
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fromCategories, setFromCategories] = useState([]);
  const [toCategories, setToCategories] = useState([]);
  const [fromSubcategories, setFromSubcategories] = useState([]);
  const [toSubcategories, setToSubcategories] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [loadingFromCategories, setLoadingFromCategories] = useState(false);
  const [loadingToCategories, setLoadingToCategories] = useState(false);

  useEffect(() => {
    if (bookId) {
      loadBookDetails();
      loadAllAccounts();
      if (isEditMode) {
        loadTransactionData();
      } else {
        generateTransactionId();
        loadNextVoucherNumber();
      }
    }
  }, [bookId, transactionId]);

  const loadBookDetails = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const result = isChurchLevel
        ? await window.electron.churchCustomBook.getById({ bookId: parseInt(bookId), userId: parseInt(userId) })
        : await window.electron.customBook.getById({ bookId: parseInt(bookId), userId: parseInt(userId) });

      if (result.success) {
        setBook(result.book);
      }
    } catch (error) {
      console.error('Failed to load book details:', error);
    }
  };

  const generateTransactionId = async () => {
    try {
      const result = isChurchLevel
        ? await window.electron.churchCustomBookTransaction.generateTransactionId()
        : await window.electron.customBookTransaction.generateTransactionId();

      if (result.success) {
        setTxId(result.transactionId);
      }
    } catch (error) {
      console.error('Failed to generate transaction ID:', error);
    }
  };

  const loadCategoriesForAccount = async (accountType, accountId, isFromAccount = true) => {
    try {
      if (isFromAccount) {
        setLoadingFromCategories(true);
      } else {
        setLoadingToCategories(true);
      }

      const result = await window.electron.accountList.getCategoriesForAccount({
        accountType,
        accountId: parseInt(accountId)
      });

      if (result.success) {
        if (isFromAccount) {
          setFromCategories(result.categories || []);
        } else {
          setToCategories(result.categories || []);
        }
      } else {
        console.error('Failed to load categories:', result.error);
        if (isFromAccount) {
          setFromCategories([]);
        } else {
          setToCategories([]);
        }
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      if (isFromAccount) {
        setFromCategories([]);
      } else {
        setToCategories([]);
      }
    } finally {
      if (isFromAccount) {
        setLoadingFromCategories(false);
      } else {
        setLoadingToCategories(false);
      }
    }
  };

  const loadAllAccounts = async () => {
    try {
      const result = isChurchLevel
        ? await window.electron.accountList.getAllForChurch({ churchId: currentChurch?.id })
        : await window.electron.accountList.getAllForPastorate({ pastorateId: currentPastorate?.id });

      if (result.success) {
        setAllAccounts(result.accounts || []);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const loadNextVoucherNumber = async () => {
    try {
      const result = isChurchLevel
        ? await window.electron.churchCustomBookTransaction.getNextVoucherNumber({
            customBookId: parseInt(bookId),
            transactionType: 'contra',
          })
        : await window.electron.customBookTransaction.getNextVoucherNumber({
            customBookId: parseInt(bookId),
            transactionType: 'contra',
          });

      if (result.success) {
        setVoucherNumber(result.voucherNumber.toString());
      }
    } catch (error) {
      console.error('Failed to load voucher number:', error);
    }
  };

  const loadTransactionData = async () => {
    try {
      const result = isChurchLevel
        ? await window.electron.churchCustomBookTransaction.getContraTransaction({ transactionId: parseInt(transactionId) })
        : await window.electron.customBookTransaction.getContraTransaction({ transactionId: parseInt(transactionId) });

      if (result.success && result.transaction) {
        const tx = result.transaction;
        setTxId(tx.transaction_id);
        setVoucherNumber(tx.voucher_number.toString());
        setFormData({
          date: tx.date,
          fromAccountType: tx.from_account_type || '',
          fromAccountId: tx.from_account_id?.toString() || '',
          toAccountType: tx.to_account_type || '',
          toAccountId: tx.to_account_id?.toString() || '',
          fromName: tx.from_name || '',
          toName: tx.to_name || '',
          amount: tx.amount.toString(),
          remarks: tx.notes || '',
          categoryId: tx.category_id?.toString() || '',
          subcategoryId: tx.subcategory_id?.toString() || '',
          fromCategoryId: tx.from_category_id?.toString() || '',
          fromSubcategoryId: tx.from_subcategory_id?.toString() || '',
          toCategoryId: tx.to_category_id?.toString() || '',
          toSubcategoryId: tx.to_subcategory_id?.toString() || '',
        });

        // Load categories and subcategories for the selected accounts
        if (tx.from_account_type && tx.from_account_id) {
          await loadCategoriesForAccount(tx.from_account_type, tx.from_account_id, true);

          // After categories are loaded, set subcategories if a category is selected
          if (tx.from_category_id) {
            setTimeout(() => {
              const category = fromCategories.find(c => c.id === tx.from_category_id);
              if (category) {
                setFromSubcategories(category.sub_categories || category.subcategories || []);
              }
            }, 100);
          }
        }

        if (tx.to_account_type && tx.to_account_id) {
          await loadCategoriesForAccount(tx.to_account_type, tx.to_account_id, false);

          // After categories are loaded, set subcategories if a category is selected
          if (tx.to_category_id) {
            setTimeout(() => {
              const category = toCategories.find(c => c.id === tx.to_category_id);
              if (category) {
                setToSubcategories(category.sub_categories || category.subcategories || []);
              }
            }, 100);
          }
        }
      } else{
        showAlert('Failed to load transaction data', 'error');
      }
    } catch (error) {
      console.error('Failed to load transaction data:', error);
      showAlert('Failed to load transaction data', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Handle from account change - load categories for the selected account
    if (name === 'fromAccount') {
      const [accountType, accountId] = value.split('|');

      // Reset from category and subcategory
      setFormData(prev => ({
        ...prev,
        fromCategoryId: '',
        fromSubcategoryId: ''
      }));
      setFromCategories([]);
      setFromSubcategories([]);

      // If both account type and id are set, load categories
      if (accountType && accountId) {
        loadCategoriesForAccount(accountType, accountId, true);
      }
    }

    // Handle to account change - load categories for the selected account
    if (name === 'toAccount') {
      const [accountType, accountId] = value.split('|');

      // Reset to category and subcategory
      setFormData(prev => ({
        ...prev,
        toCategoryId: '',
        toSubcategoryId: ''
      }));
      setToCategories([]);
      setToSubcategories([]);

      // If both account type and id are set, load categories
      if (accountType && accountId) {
        loadCategoriesForAccount(accountType, accountId, false);
      }
    }

    // Handle from category change
    if (name === 'fromCategoryId') {
      const category = fromCategories.find(c => c.id === parseInt(value));
      setFromSubcategories(category?.sub_categories || category?.subcategories || []);
      // Reset subcategory when category changes
      setFormData(prev => ({ ...prev, fromSubcategoryId: '' }));
    }

    // Handle to category change
    if (name === 'toCategoryId') {
      const category = toCategories.find(c => c.id === parseInt(value));
      setToSubcategories(category?.sub_categories || category?.subcategories || []);
      // Reset subcategory when category changes
      setFormData(prev => ({ ...prev, toSubcategoryId: '' }));
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleSubmit = async (closeAfter = false) => {
    if (!formData.fromAccountType || !formData.fromAccountId) {
      showAlert('From Account is required', 'error');
      return;
    }

    if (!formData.fromCategoryId) {
      showAlert('From Category is required', 'error');
      return;
    }

    if (!formData.toAccountType || !formData.toAccountId) {
      showAlert('To Account is required', 'error');
      return;
    }

    if (!formData.toCategoryId) {
      showAlert('To Category is required', 'error');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showAlert('Please enter a valid amount', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem('userId');
      const transactionData = {
        transactionId: txId,
        voucherNumber: parseInt(voucherNumber),
        date: formData.date,
        fromAccountType: formData.fromAccountType,
        fromAccountId: parseInt(formData.fromAccountId),
        toAccountType: formData.toAccountType,
        toAccountId: parseInt(formData.toAccountId),
        fromName: formData.fromName.trim() || null,
        toName: formData.toName.trim() || null,
        amount: parseFloat(formData.amount),
        notes: formData.remarks.trim(),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        subcategoryId: formData.subcategoryId ? parseInt(formData.subcategoryId) : null,
        fromCategoryId: formData.fromCategoryId ? parseInt(formData.fromCategoryId) : null,
        fromSubcategoryId: formData.fromSubcategoryId ? parseInt(formData.fromSubcategoryId) : null,
        toCategoryId: formData.toCategoryId ? parseInt(formData.toCategoryId) : null,
        toSubcategoryId: formData.toSubcategoryId ? parseInt(formData.toSubcategoryId) : null,
      };

      let result;
      if (isEditMode) {
        // Update existing transaction
        result = isChurchLevel
          ? await window.electron.churchCustomBookTransaction.updateContraTransaction({
              transactionId: parseInt(transactionId),
              transactionData,
              userId: parseInt(userId),
            })
          : await window.electron.customBookTransaction.updateContraTransaction({
              transactionId: parseInt(transactionId),
              transactionData,
              userId: parseInt(userId),
            });
      } else {
        // Create new transaction
        transactionData.customBookId = parseInt(bookId);

        // Add pastorateId or churchId based on level
        if (isChurchLevel) {
          transactionData.churchId = book?.church_id;
        } else {
          transactionData.pastorateId = book?.pastorate_id;
        }

        result = isChurchLevel
          ? await window.electron.churchCustomBookTransaction.createContra({
              transactionData,
              userId: parseInt(userId),
            })
          : await window.electron.customBookTransaction.createContra({
              transactionData,
              userId: parseInt(userId),
            });
      }

      if (result.success) {
        showAlert(`Contra voucher ${isEditMode ? 'updated' : 'created'} successfully!`, 'success');

        if (closeAfter || isEditMode) {
          setTimeout(() => {
            navigate(isChurchLevel ? `/church-custom-book-contra/${bookId}?church=true` : `/custom-book-contra/${bookId}`);
          }, 1500);
        } else {
          // Reset form for another entry
          setFormData({
            date: new Date().toISOString().split('T')[0],
            fromAccountType: '',
            fromAccountId: '',
            toAccountType: '',
            toAccountId: '',
            fromName: '',
            toName: '',
            amount: '',
            remarks: '',
            categoryId: '',
            subcategoryId: '',
            fromCategoryId: '',
            fromSubcategoryId: '',
            toCategoryId: '',
            toSubcategoryId: '',
          });
          setFromCategories([]);
          setToCategories([]);
          setFromSubcategories([]);
          setToSubcategories([]);
          generateTransactionId();
          loadNextVoucherNumber();
        }
      } else {
        showAlert(result.error || `Failed to ${isEditMode ? 'update' : 'create'} contra voucher`, 'error');
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} contra voucher:`, error);
      showAlert(`An error occurred while ${isEditMode ? 'updating' : 'creating'} the voucher`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbItems = [
    {
      label: 'Home',
      icon: <HomeRegular />,
      onClick: () => navigate('/dashboard'),
    },
    {
      label: isChurchLevel ? 'Church Accounts' : 'Pastorate Accounts',
      onClick: () => navigate(isChurchLevel ? '/church-accounts' : '/pastorate-accounts'),
    },
    {
      label: book?.book_name || 'Custom Book',
      onClick: () => navigate(isChurchLevel ? `/church-custom-book-detail/${bookId}` : `/custom-book-detail/${bookId}`),
    },
    {
      label: 'Contra Vouchers',
      onClick: () => navigate(isChurchLevel ? `/church-custom-book-contra/${bookId}?church=true` : `/custom-book-contra/${bookId}`),
    },
    {
      label: isEditMode ? 'Edit Contra Voucher' : 'Add Contra Voucher',
      current: true,
    },
  ];

  return (
    <div className={styles.container}>
      <Breadcrumb
        pageTitle={`${isEditMode ? 'Edit' : 'Add'} Contra Voucher - ${book?.book_name || 'Loading...'}`}
        breadcrumbs={breadcrumbItems}
        titleAlign="left"
        onNavigate={(breadcrumb) => {
          if (breadcrumb.onClick) {
            breadcrumb.onClick();
          }
        }}
      />

      <div className={styles.content}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            <MoneyRegular />
            {isEditMode ? 'Edit' : 'Add'} Contra Voucher - {book?.book_name || 'Loading...'}
          </h2>

          {alert && (
            <div className={`${styles.alert} ${alert.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
              {alert.message}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Transaction ID <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={txId}
                className={`${styles.input} ${styles.disabledInput}`}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Voucher Number <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Date <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Amount <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                From Account <span className={styles.required}>*</span>
              </label>
              <select
                name="fromAccount"
                value={formData.fromAccountType && formData.fromAccountId ? `${formData.fromAccountType}|${formData.fromAccountId}` : ''}
                onChange={(e) => {
                  const [type, id] = e.target.value.split('|');
                  setFormData(prev => ({
                    ...prev,
                    fromAccountType: type || '',
                    fromAccountId: id || ''
                  }));
                }}
                className={styles.input}
              >
                <option value="">Select From Account</option>
                {allAccounts.map((account, index) => (
                  <option key={index} value={`${account.type}|${account.id}`}>
                    {account.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                From Category <span className={styles.required}>*</span>
              </label>
              <select
                name="fromCategoryId"
                value={formData.fromCategoryId}
                onChange={handleInputChange}
                className={styles.input}
                disabled={loadingFromCategories || !formData.fromAccountType || !formData.fromAccountId}
              >
                <option value="">
                  {loadingFromCategories ? 'Loading categories...' :
                   !formData.fromAccountType || !formData.fromAccountId ? 'Select From Account first' :
                   'Select From Category'}
                </option>
                {fromCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name} ({category.category_type === 'income' ? 'Income' : 'Expense'})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>From Subcategory</label>
              <select
                name="fromSubcategoryId"
                value={formData.fromSubcategoryId}
                onChange={handleInputChange}
                className={styles.input}
                disabled={!formData.fromCategoryId || fromSubcategories.length === 0}
              >
                <option value="">Select From Subcategory (Optional)</option>
                {fromSubcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.subcategory_name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                To Account <span className={styles.required}>*</span>
              </label>
              <select
                name="toAccount"
                value={formData.toAccountType && formData.toAccountId ? `${formData.toAccountType}|${formData.toAccountId}` : ''}
                onChange={(e) => {
                  const [type, id] = e.target.value.split('|');
                  setFormData(prev => ({
                    ...prev,
                    toAccountType: type || '',
                    toAccountId: id || ''
                  }));
                }}
                className={styles.input}
              >
                <option value="">Select To Account</option>
                {allAccounts.map((account, index) => (
                  <option key={index} value={`${account.type}|${account.id}`}>
                    {account.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                To Category <span className={styles.required}>*</span>
              </label>
              <select
                name="toCategoryId"
                value={formData.toCategoryId}
                onChange={handleInputChange}
                className={styles.input}
                disabled={loadingToCategories || !formData.toAccountType || !formData.toAccountId}
              >
                <option value="">
                  {loadingToCategories ? 'Loading categories...' :
                   !formData.toAccountType || !formData.toAccountId ? 'Select To Account first' :
                   'Select To Category'}
                </option>
                {toCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name} ({category.category_type === 'income' ? 'Income' : 'Expense'})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>To Subcategory</label>
              <select
                name="toSubcategoryId"
                value={formData.toSubcategoryId}
                onChange={handleInputChange}
                className={styles.input}
                disabled={!formData.toCategoryId || toSubcategories.length === 0}
              >
                <option value="">Select To Subcategory (Optional)</option>
                {toSubcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.subcategory_name}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                placeholder="Enter remarks (optional)"
                className={styles.textarea}
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={() => navigate(isChurchLevel ? `/church-custom-book-contra/${bookId}?church=true` : `/custom-book-contra/${bookId}`)}
              disabled={isSubmitting}
            >
              <DismissRegular />
              Cancel
            </button>
            {!isEditMode && (
              <button
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                <CheckmarkRegular />
                Save & Create Another
              </button>
            )}
            <button
              className={`${styles.button} ${styles.primaryButton}`}
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
            >
              <CheckmarkRegular />
              {isEditMode ? 'Update' : 'Save & Close'}
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
        currentView={isChurchLevel ? 'church' : 'pastorate'}
        disablePastorateChurchChange={isChurchLevel}
        disableChurchSelector={!isChurchLevel}
      />
    </div>
  );
};

export default AddCustomBookContraPage;

