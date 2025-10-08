import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  DocumentRegular,
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
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #e1dfdd',
    borderRadius: '4px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxHeight: '200px',
    overflowY: 'auto',
    zIndex: 1000,
    marginTop: '4px',
  },
  dropdownItem: {
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#323130',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  inputWrapper: {
    position: 'relative',
  },
  helperText: {
    fontSize: '12px',
    color: '#605E5C',
    marginTop: '4px',
  },
});

const AddCustomBookDebitPage = ({
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
    name: '',
    congregation: '',
    amount: '',
    remarks: '',
    categoryId: '',
    subcategoryId: '',
  });
  const [txId, setTxId] = useState('');
  const [voucherNumber, setVoucherNumber] = useState('');
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [familySearchResults, setFamilySearchResults] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const dropdownRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    if (bookId) {
      loadBookDetails();
      loadCategories();
      if (isEditMode) {
        loadTransactionData();
      } else {
        generateTransactionId();
        loadNextVoucherNumber();
      }
    }
  }, [bookId, isEditMode]);

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

  const loadCategories = async () => {
    try {
      const categoryAPI = isChurchLevel ? window.electron.churchCustomBookCategory : window.electron.customBookCategory;
      const params = isChurchLevel
        ? { customBookId: parseInt(bookId), churchId: currentChurch?.id }
        : { customBookId: parseInt(bookId), pastorateId: currentPastorate?.id };

      const result = await categoryAPI.getWithSubcategoriesByType({ ...params, categoryType: 'expense' });
      setCategories(result);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadTransactionData = async () => {
    try {
      const result = isChurchLevel
        ? await window.electron.churchCustomBookTransaction.getDebitTransaction({ transactionId: parseInt(transactionId) })
        : await window.electron.customBookTransaction.getDebitTransaction({ transactionId: parseInt(transactionId) });

      if (result.success && result.transaction) {
        const tx = result.transaction;
        setTxId(tx.transaction_id);
        setVoucherNumber(tx.voucher_number.toString());
        setFormData({
          date: tx.date,
          name: tx.name,
          congregation: tx.congregation || '',
          amount: tx.amount.toString(),
          remarks: tx.notes || '',
          categoryId: tx.category_id?.toString() || '',
          subcategoryId: tx.subcategory_id?.toString() || '',
        });

        // Load subcategories if category is selected
        if (tx.category_id) {
          const category = categories.find(c => c.id === tx.category_id);
          if (category) {
            setSubcategories(category.subcategories || []);
          }
        }
      } else {
        showAlert('Failed to load transaction data', 'error');
      }
    } catch (error) {
      console.error('Failed to load transaction data:', error);
      showAlert('Failed to load transaction data', 'error');
    }
  };

  const loadNextVoucherNumber = async () => {
    try {
      const result = isChurchLevel
        ? await window.electron.churchCustomBookTransaction.getNextVoucherNumber({
            customBookId: parseInt(bookId),
            transactionType: 'debit',
          })
        : await window.electron.customBookTransaction.getNextVoucherNumber({
            customBookId: parseInt(bookId),
            transactionType: 'debit',
          });

      if (result.success) {
        setVoucherNumber(result.voucherNumber.toString());
      }
    } catch (error) {
      console.error('Failed to load voucher number:', error);
    }
  };

  const searchFamilies = async (searchTerm) => {
    try {
      const result = isChurchLevel
        ? await window.electron.churchCustomBookTransaction.searchFamilies({
            churchId: currentChurch?.id,
            searchTerm
          })
        : await window.electron.customBookTransaction.searchFamilies({
            pastorateId: currentPastorate?.id,
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
      name: family.displayName,
      congregation: family.church_name || ''
    }));
    setFamilySearchResults([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Handle category change - load subcategories
    if (name === 'categoryId') {
      const category = categories.find(c => c.id === parseInt(value));
      setSubcategories(category?.subcategories || []);
      // Reset subcategory when category changes
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    }

    // Handle family search for name field
    if (name === 'name') {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      if (value.length >= 2) {
        const timeout = setTimeout(() => {
          searchFamilies(value);
        }, 300);
        setSearchTimeout(timeout);
      } else {
        setFamilySearchResults([]);
      }
    }
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleSubmit = async (closeAfter = false) => {
    if (!formData.name.trim()) {
      showAlert('Name is required', 'error');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showAlert('Please enter a valid amount', 'error');
      return;
    }

    if (!formData.categoryId) {
      showAlert('Category is required', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem('userId');

      if (isEditMode) {
        // Update existing transaction
        const transactionData = {
          transactionId: txId,
          voucherNumber: parseInt(voucherNumber),
          date: formData.date,
          name: formData.name.trim(),
          amount: parseFloat(formData.amount),
          notes: formData.remarks.trim(),
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          subcategoryId: formData.subcategoryId ? parseInt(formData.subcategoryId) : null,
        };

        const result = isChurchLevel
          ? await window.electron.churchCustomBookTransaction.updateDebitTransaction({
              transactionId: parseInt(transactionId),
              transactionData,
              userId: parseInt(userId),
            })
          : await window.electron.customBookTransaction.updateDebitTransaction({
              transactionId: parseInt(transactionId),
              transactionData,
              userId: parseInt(userId),
            });

        if (result.success) {
          showAlert('Debit voucher updated successfully!', 'success');
          setTimeout(() => {
            navigate(isChurchLevel ? `/church-custom-book-debit/${bookId}?church=true` : `/custom-book-debit/${bookId}`);
          }, 1500);
        } else {
          showAlert(result.error || 'Failed to update debit voucher', 'error');
        }
      } else {
        // Create new transaction
        const transactionData = {
          customBookId: parseInt(bookId),
          transactionId: txId,
          voucherNumber: parseInt(voucherNumber),
          date: formData.date,
          name: formData.name.trim(),
          amount: parseFloat(formData.amount),
          notes: formData.remarks.trim(),
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          subcategoryId: formData.subcategoryId ? parseInt(formData.subcategoryId) : null,
        };

        // Add pastorateId or churchId based on level
        if (isChurchLevel) {
          transactionData.churchId = book?.church_id;
        } else {
          transactionData.pastorateId = book?.pastorate_id;
        }

        const result = isChurchLevel
          ? await window.electron.churchCustomBookTransaction.createDebit({
              transactionData,
              userId: parseInt(userId),
            })
          : await window.electron.customBookTransaction.createDebit({
              transactionData,
              userId: parseInt(userId),
            });

        if (result.success) {
          showAlert('Debit voucher created successfully!', 'success');

          if (closeAfter) {
            setTimeout(() => {
              navigate(isChurchLevel ? `/church-custom-book-debit/${bookId}?church=true` : `/custom-book-debit/${bookId}`);
            }, 1500);
          } else {
            // Reset form for another entry
            setFormData({
              date: new Date().toISOString().split('T')[0],
              name: '',
              congregation: '',
              amount: '',
              remarks: '',
              categoryId: '',
              subcategoryId: '',
            });
            setSubcategories([]);
            generateTransactionId();
            loadNextVoucherNumber();
          }
        } else {
          showAlert(result.error || 'Failed to create debit voucher', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving debit voucher:', error);
      showAlert('An error occurred while saving the voucher', 'error');
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
      label: 'Debit Vouchers',
      onClick: () => navigate(isChurchLevel ? `/church-custom-book-debit/${bookId}?church=true` : `/custom-book-debit/${bookId}`),
    },
    {
      label: isEditMode ? 'Edit Voucher' : 'Add Voucher',
      current: true,
    },
  ];

  return (
    <div className={styles.container}>
      <Breadcrumb
        pageTitle={`Debit Voucher - ${book?.book_name || 'Loading...'}`}
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
            <DocumentRegular />
            Debit Voucher - {book?.book_name || 'Loading...'}
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
                Category <span className={styles.required}>*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={styles.input}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Subcategory</label>
              <select
                name="subcategoryId"
                value={formData.subcategoryId}
                onChange={handleInputChange}
                className={styles.input}
                disabled={!formData.categoryId || subcategories.length === 0}
              >
                <option value="">Select Subcategory (Optional)</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.subcategory_name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Name <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper} ref={dropdownRef}>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Type family name or enter custom name"
                  className={styles.input}
                  autoComplete="off"
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
              <span className={styles.helperText}>
                Type at least 2 characters to search families, or enter any custom name
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Congregation</label>
              <input
                type="text"
                name="congregation"
                value={formData.congregation}
                onChange={handleInputChange}
                placeholder="Congregation name (auto-filled from family search)"
                className={styles.input}
              />
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
              onClick={() => navigate(isChurchLevel ? `/church-custom-book-debit/${bookId}?church=true` : `/custom-book-debit/${bookId}`)}
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

export default AddCustomBookDebitPage;

