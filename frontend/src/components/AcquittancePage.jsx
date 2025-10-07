import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  InfoRegular,
  DocumentRegular,
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
    borderBottom: '1px solid #f3f2f1',
    fontSize: '14px',
    color: '#605e5c',
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
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  editButton: {
    color: '#0078d4',
    '&:hover': {
      backgroundColor: '#e1f3ff',
    },
  },
  deleteButton: {
    color: '#d13438',
    '&:hover': {
      backgroundColor: '#fde7e9',
    },
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderTop: '1px solid #e1dfdd',
    backgroundColor: '#faf9f8',
  },
  pageInfo: {
    fontSize: '14px',
    color: '#605e5c',
  },
  pageButtons: {
    display: 'flex',
    gap: '8px',
  },
  pageButton: {
    backgroundColor: 'white',
    border: '1px solid #e1dfdd',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
    '&:hover:not(:disabled)': {
      backgroundColor: '#f3f2f1',
      borderColor: '#B5316A',
    },
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5,
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
    marginBottom: '8px',
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
  deleteModal: {
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
  deleteModalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
  },
  deleteModalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#323130',
  },
  deleteModalText: {
    fontSize: '14px',
    color: '#605e5c',
    marginBottom: '24px',
  },
  deleteModalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  modalButton: {
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
  },
  cancelButton: {
    backgroundColor: 'white',
    color: '#323130',
    border: '1px solid #8a8886',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  confirmDeleteButton: {
    backgroundColor: '#d13438',
    color: 'white',
    '&:hover': {
      backgroundColor: '#a72b2e',
    },
  },
  filterSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
  },
  filterDropdown: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #e1dfdd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    minWidth: '200px',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
    },
  },
  summarySection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    padding: '24px',
    marginBottom: '16px',
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '16px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  summaryCard: {
    padding: '16px',
    backgroundColor: '#f8f8f8',
    borderRadius: '6px',
    border: '1px solid #e1dfdd',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#605e5c',
    marginBottom: '8px',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#B5316A',
  },
});

const AcquittancePage = ({
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
  const [searchParams] = useSearchParams();
  const bookType = searchParams.get('bookType') || 'cash';
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [statistics, setStatistics] = useState({ total: 0, byCategory: [] });
  const itemsPerPage = 10;

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
      loadTransactions();
      loadStatistics();
    }
  }, [currentPastorate?.id, user?.id, currentPage, selectedMonth, bookType]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const result = await window.electron.acquittance.getTransactions({
        pastorateId: currentPastorate.id,
        userId: user.id,
        bookType: bookType,
        page: currentPage,
        limit: itemsPerPage,
        filters: {
          month: selectedMonth
        }
      });

      if (result.success) {
        setAllTransactions(result.transactions || []);
        setTotalPages(result.pagination?.totalPages || 1);
      } else {
        console.error('Failed to load transactions:', result.error);
        setNotification({
          type: 'error',
          message: 'Failed to load transactions: ' + result.error
        });
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setNotification({
        type: 'error',
        message: 'Failed to load transactions: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const result = await window.electron.acquittance.getStatistics({
        pastorateId: currentPastorate.id,
        bookType: bookType
      });

      if (result.success) {
        setStatistics(result.statistics);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleAddTransaction = () => {
    navigate(`/add-acquittance?bookType=${bookType}`);
  };

  const handleEditTransaction = (transactionId) => {
    navigate(`/add-acquittance/${transactionId}?bookType=${bookType}`);
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      const result = await window.electron.acquittance.deleteTransaction({
        transactionId: transactionToDelete.id,
        userId: user.id
      });

      if (result.success) {
        setNotification({
          type: 'success',
          message: 'Acquittance transaction deleted successfully!'
        });
        loadTransactions();
        loadStatistics();
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to delete transaction: ' + result.error
        });
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      setNotification({
        type: 'error',
        message: 'Failed to delete transaction: ' + error.message
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get unique months from transactions
  const availableMonths = [...new Set(allTransactions.map(t => {
    const date = new Date(t.date);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }))].sort().reverse();

  const formatMonthDisplay = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  if (!currentPastorate) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={`Acquittance - ${getBookTypeName()}`}
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
            label: 'Acquittance',
            icon: <DocumentRegular />,
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

        <div className={styles.header}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#323130' }}>
            Acquittance Transactions
          </h2>
          <button className={styles.addButton} onClick={handleAddTransaction}>
            <AddRegular />
            Add Transaction
          </button>
        </div>

        {/* Filter Section */}
        <div className={styles.filterSection}>
          <span className={styles.filterLabel}>Filter by Month:</span>
          <select
            className={styles.filterDropdown}
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Months</option>
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {formatMonthDisplay(month)}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            {loading ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <InfoRegular />
                </div>
                <div className={styles.emptyStateText}>Loading transactions...</div>
              </div>
            ) : allTransactions.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <DocumentRegular />
                </div>
                <div className={styles.emptyStateText}>No acquittance transactions found</div>
                <div style={{ fontSize: '14px', color: '#8a8886' }}>
                  Click "Add Transaction" to create your first acquittance
                </div>
              </div>
            ) : (
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.th}>Transaction ID</th>
                    <th className={styles.th}>Voucher No.</th>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Payee Name</th>
                    <th className={styles.th}>Primary Category</th>
                    <th className={styles.th}>Secondary Category</th>
                    <th className={styles.th}>Amount</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className={styles.td}>{transaction.transaction_id}</td>
                      <td className={styles.td}>{transaction.voucher_number}</td>
                      <td className={styles.td}>{formatDate(transaction.date)}</td>
                      <td className={styles.td}>{transaction.payee_name}</td>
                      <td className={styles.td}>{transaction.primary_category_name || '-'}</td>
                      <td className={styles.td}>{transaction.secondary_category_name || '-'}</td>
                      <td className={styles.td}>{formatCurrency(transaction.amount)}</td>
                      <td className={styles.td}>
                        <div className={styles.actionButtons}>
                          <button
                            className={`${styles.iconButton} ${styles.editButton}`}
                            onClick={() => handleEditTransaction(transaction.id)}
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

          {/* Pagination */}
          {!loading && allTransactions.length > 0 && (
            <div className={styles.pagination}>
              <div className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </div>
              <div className={styles.pageButtons}>
                <button
                  className={styles.pageButton}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftRegular />
                  Previous
                </button>
                <button
                  className={styles.pageButton}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRightRegular />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className={styles.summarySection}>
          <h3 className={styles.summaryTitle}>Summary</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Total Expenses</div>
              <div className={styles.summaryValue}>{formatCurrency(statistics.total)}</div>
            </div>
            {statistics.byCategory.slice(0, 3).map((cat, idx) => (
              <div key={idx} className={styles.summaryCard}>
                <div className={styles.summaryLabel}>{cat.category_name || 'Uncategorized'}</div>
                <div className={styles.summaryValue}>{formatCurrency(cat.total)}</div>
              </div>
            ))}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.deleteModal} onClick={handleDeleteCancel}>
          <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.deleteModalTitle}>Confirm Delete</h3>
            <p className={styles.deleteModalText}>
              Are you sure you want to delete this acquittance transaction?
              <br />
              <strong>Transaction ID:</strong> {transactionToDelete?.transaction_id}
              <br />
              <strong>Voucher No:</strong> {transactionToDelete?.voucher_number}
              <br />
              <strong>Amount:</strong> {formatCurrency(transactionToDelete?.amount || 0)}
            </p>
            <div className={styles.deleteModalButtons}>
              <button
                className={`${styles.modalButton} ${styles.cancelButton}`}
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                className={`${styles.modalButton} ${styles.confirmDeleteButton}`}
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcquittancePage;




