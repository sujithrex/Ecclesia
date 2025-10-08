import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  MoneyRegular,
  AddRegular,
  EditRegular,
  DeleteRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  addButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#A12B5E',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(181, 49, 106, 0.3)',
    },
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: '500px',
    maxHeight: 'calc(100vh - 300px)',
  },
  tableWrapper: {
    flex: 1,
    overflowX: 'auto',
    overflowY: 'auto',
    minHeight: '400px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px',
  },
  tableHeader: {
    backgroundColor: '#f8f8f8',
    borderBottom: '2px solid #e1dfdd',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#605e5c',
    borderBottom: '1px solid #f3f2f1',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  iconButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  editButton: {
    color: '#0078d4',
  },
  deleteButton: {
    color: '#d13438',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderTop: '1px solid #e1dfdd',
    backgroundColor: '#faf9f8',
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#605e5c',
  },
  paginationButtons: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  paginationButton: {
    backgroundColor: 'white',
    border: '1px solid #e1dfdd',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
    '&:hover:not(:disabled)': {
      backgroundColor: '#f3f2f1',
      borderColor: '#d2d0ce',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: '#605e5c',
  },
  emptyStateIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  emptyStateSubtext: {
    fontSize: '14px',
    color: '#8a8886',
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
  deleteConfirmOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  deleteConfirmDialog: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '400px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  deleteConfirmTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#323130',
  },
  deleteConfirmMessage: {
    fontSize: '14px',
    color: '#605e5c',
    marginBottom: '24px',
  },
  deleteConfirmButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  deleteConfirmButton: {
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
  },
  deleteConfirmButtonCancel: {
    backgroundColor: '#f3f2f1',
    color: '#323130',
    '&:hover': {
      backgroundColor: '#e1dfdd',
    },
  },
  deleteConfirmButtonDelete: {
    backgroundColor: '#d13438',
    color: 'white',
    '&:hover': {
      backgroundColor: '#a4262c',
    },
  },
});

const CustomBookContraPage = ({
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
  const { bookId } = useParams();
  const [searchParams] = useSearchParams();
  const isChurchLevel = searchParams.get('church') === 'true';
  
  const [book, setBook] = useState(null);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (bookId) {
      loadBookDetails();
      loadAllTransactions();
    }
  }, [bookId]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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

  const loadAllTransactions = async () => {
    setLoading(true);
    try {
      const result = isChurchLevel
        ? await window.electron.churchCustomBookTransaction.getTransactions({
            customBookId: parseInt(bookId),
            transactionType: 'contra',
            page: 1,
            limit: 10000,
            filters: {}
          })
        : await window.electron.customBookTransaction.getTransactions({
            customBookId: parseInt(bookId),
            transactionType: 'contra',
            page: 1,
            limit: 10000,
            filters: {}
          });

      if (result.success) {
        setAllTransactions(result.transactions || []);
      } else {
        console.error('Failed to load transactions:', result.error);
        setAllTransactions([]);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setAllTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = () => {
    navigate(`/custom-book-contra/${bookId}/add${isChurchLevel ? '?church=true' : ''}`);
  };

  const handleEditTransaction = (transaction) => {
    navigate(`/custom-book-contra/${bookId}/edit/${transaction.id}${isChurchLevel ? '?church=true' : ''}`);
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      const userId = localStorage.getItem('userId');
      const result = isChurchLevel
        ? await window.electron.churchCustomBookTransaction.deleteContraTransaction({
            transactionId: transactionToDelete.id,
            userId: parseInt(userId)
          })
        : await window.electron.customBookTransaction.deleteContraTransaction({
            transactionId: transactionToDelete.id,
            userId: parseInt(userId)
          });

      if (result.success) {
        setNotification({
          type: 'success',
          message: 'Transaction deleted successfully'
        });
        loadAllTransactions();
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Failed to delete transaction'
        });
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setNotification({
        type: 'error',
        message: 'Failed to delete transaction'
      });
    } finally {
      setShowDeleteConfirm(false);
      setTransactionToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setTransactionToDelete(null);
  };

  // Pagination
  const totalPages = Math.ceil(allTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = allTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Helper functions
  const formatAmount = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
      onClick: () => navigate(isChurchLevel ? `/church-custom-book-detail/${bookId}?church=true` : `/custom-book-detail/${bookId}`),
    },
    {
      label: 'Contra Vouchers',
      current: true,
    },
  ];

  return (
    <div className={styles.container}>
      <Breadcrumb
        pageTitle={`Contra Vouchers - ${book?.book_name || 'Loading...'}`}
        breadcrumbs={breadcrumbItems}
        titleAlign="left"
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

        <div className={styles.header}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#323130' }}>
            Contra Vouchers
          </h2>
          <button className={styles.addButton} onClick={handleAddTransaction}>
            <AddRegular />
            Add Transaction
          </button>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            {loading ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateText}>Loading...</div>
              </div>
            ) : currentTransactions.length === 0 ? (
              <div className={styles.emptyState}>
                <MoneyRegular className={styles.emptyStateIcon} />
                <div className={styles.emptyStateText}>No contra vouchers found</div>
                <div className={styles.emptyStateSubtext}>Click "Add Transaction" to create your first contra voucher</div>
              </div>
            ) : (
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.th}>Transaction ID</th>
                    <th className={styles.th}>Voucher Number</th>
                    <th className={styles.th}>From Name</th>
                    <th className={styles.th}>To Name</th>
                    <th className={styles.th}>Category</th>
                    <th className={styles.th}>Subcategory</th>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Amount</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className={styles.td}>{transaction.transaction_id}</td>
                      <td className={styles.td}>{transaction.voucher_number}</td>
                      <td className={styles.td}>{transaction.from_name}</td>
                      <td className={styles.td}>{transaction.to_name}</td>
                      <td className={styles.td}>{transaction.category_name || '-'}</td>
                      <td className={styles.td}>{transaction.subcategory_name || '-'}</td>
                      <td className={styles.td}>{formatDate(transaction.date)}</td>
                      <td className={styles.td}>{formatAmount(transaction.amount)}</td>
                      <td className={styles.td}>
                        <div className={styles.actionButtons}>
                          <button
                            className={`${styles.iconButton} ${styles.editButton}`}
                            onClick={() => handleEditTransaction(transaction)}
                            title="Edit"
                          >
                            <EditRegular />
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.deleteButton}`}
                            onClick={() => handleDeleteClick(transaction)}
                            title="Delete"
                          >
                            <DeleteRegular />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && currentTransactions.length > 0 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, allTransactions.length)} of {allTransactions.length} transactions
              </div>
              <div className={styles.paginationButtons}>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftRegular />
                  Previous
                </button>
                <span style={{ fontSize: '14px', color: '#605e5c' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className={styles.paginationButton}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRightRegular />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className={styles.deleteConfirmOverlay}>
          <div className={styles.deleteConfirmDialog}>
            <div className={styles.deleteConfirmTitle}>Confirm Delete</div>
            <div className={styles.deleteConfirmMessage}>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </div>
            <div className={styles.deleteConfirmButtons}>
              <button
                className={`${styles.deleteConfirmButton} ${styles.deleteConfirmButtonCancel}`}
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                className={`${styles.deleteConfirmButton} ${styles.deleteConfirmButtonDelete}`}
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

export default CustomBookContraPage;

