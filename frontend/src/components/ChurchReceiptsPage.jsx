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
  ReceiptMoneyRegular,
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
    backgroundColor: '#f8f8f8',
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid #e1dfdd',
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
    transition: 'background-color 0.2s',
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
    backgroundColor: 'white',
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#605e5c',
  },
  paginationButtons: {
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
    transition: 'all 0.2s',
    '&:hover:not(:disabled)': {
      backgroundColor: '#f3f2f1',
      borderColor: '#c8c6c4',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  activePageButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    borderColor: '#B5316A',
    '&:hover': {
      backgroundColor: '#A12B5E',
      borderColor: '#A12B5E',
    },
  },
  filterSection: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
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
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  emptyStateSubtext: {
    fontSize: '14px',
    color: '#8a8886',
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
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
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
    transition: 'all 0.2s',
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
  summarySection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    padding: '20px',
  },
  summaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#323130',
  },
  summaryTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  summaryRow: {
    borderBottom: '1px solid #e1dfdd',
  },
  summaryCell: {
    padding: '12px',
    fontSize: '14px',
    color: '#605e5c',
  },
  summaryCellBold: {
    fontWeight: '600',
    color: '#323130',
  },
});

const getNotificationStyle = (type) => {
  const styles = useStyles();
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

const ChurchReceiptsPage = ({
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
  const [searchParams] = useSearchParams();
  const bookType = searchParams.get('bookType') || 'cash';
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [summaryMonth, setSummaryMonth] = useState(null);

  const itemsPerPage = 10;

  const bookTypeLabel = bookType.charAt(0).toUpperCase() + bookType.slice(1);

  useEffect(() => {
    if (currentChurch) {
      loadAllTransactions();
    }
  }, [currentChurch, bookType]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadAllTransactions = async () => {
    setLoading(true);
    try {
      const result = await window.electron.churchReceipts.getTransactions({
        churchId: currentChurch.id,
        userId: user.id,
        page: 1,
        limit: 10000,
        filters: { bookType }
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
    navigate(`/church-receipts/add?bookType=${bookType}`);
  };

  const handleEditTransaction = (transaction) => {
    navigate(`/church-receipts/edit/${transaction.id}?bookType=${bookType}`);
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      const result = await window.electron.churchReceipts.deleteTransaction({
        transactionId: transactionToDelete.id,
        userId: user.id
      });

      if (result.success) {
        setNotification({
          type: 'success',
          message: 'Receipt transaction deleted successfully!'
        });
        loadAllTransactions();
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Failed to delete transaction'
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatMonthDisplay = (monthKey) => {
    if (monthKey === 'all') return 'All Months';
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Filter transactions by selected month
  const filteredTransactions = selectedMonth === 'all'
    ? allTransactions
    : allTransactions.filter(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === selectedMonth;
      });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get unique months from all transactions
  const getAvailableMonths = () => {
    const months = new Set();
    allTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  // Calculate summary by offering type for selected month
  const getSummary = () => {
    const monthToUse = summaryMonth || selectedMonth;
    let filtered = allTransactions;

    if (monthToUse !== 'all' && monthToUse) {
      filtered = allTransactions.filter(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === monthToUse;
      });
    }

    // Group by offering type and sum amounts
    const byType = {};
    filtered.forEach(t => {
      const type = t.offering_type;
      if (!byType[type]) {
        byType[type] = 0;
      }
      byType[type] += parseFloat(t.amount || 0);
    });

    // Convert to array, filter out zero amounts, and sort by amount
    const sortedTypes = Object.entries(byType)
      .map(([type, amount]) => ({ type, amount }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return sortedTypes;
  };

  const availableMonths = getAvailableMonths();
  const summary = getSummary();

  if (!currentChurch) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${getNotificationStyle(notification.type)}`}>
          {getNotificationIcon(notification.type)}
          {notification.message}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className={styles.deleteConfirmOverlay} onClick={handleDeleteCancel}>
          <div className={styles.deleteConfirmDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteConfirmTitle}>Delete Receipt Transaction</div>
            <div className={styles.deleteConfirmMessage}>
              Are you sure you want to delete this receipt transaction? This action cannot be undone.
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

      <Breadcrumb
        pageTitle={`Receipts (${bookTypeLabel} Book) - ${currentChurch.church_name}`}
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
            label: `Receipts (${bookTypeLabel} Book)`,
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
        <div className={styles.header}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#323130' }}>
            Receipt Transactions
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

        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateText}>Loading transactions...</div>
            </div>
          ) : allTransactions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <ReceiptMoneyRegular />
              </div>
              <div className={styles.emptyStateText}>No receipt transactions yet</div>
              <div className={styles.emptyStateSubtext}>
                Click "Add Transaction" to record your first receipt
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <ReceiptMoneyRegular />
              </div>
              <div className={styles.emptyStateText}>No transactions found for selected month</div>
              <div className={styles.emptyStateSubtext}>
                Try selecting a different month or add new transactions
              </div>
            </div>
          ) : (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={styles.th}>Transaction ID</th>
                      <th className={styles.th}>Receipt Number</th>
                      <th className={styles.th}>Name of Giver</th>
                      <th className={styles.th}>Date</th>
                      <th className={styles.th}>Amount</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className={styles.td}>{transaction.transaction_id}</td>
                        <td className={styles.td}>{transaction.receipt_number}</td>
                        <td className={styles.td}>{transaction.giver_name}</td>
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
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <div className={styles.paginationInfo}>
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                  </div>
                  <div className={styles.paginationButtons}>
                    <button
                      className={styles.pageButton}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeftRegular />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`${styles.pageButton} ${page === currentPage ? styles.activePageButton : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      className={styles.pageButton}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRightRegular />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Summary Section */}
        {allTransactions.length > 0 && (
          <div className={styles.summarySection}>
            <div className={styles.summaryHeader}>
              <div className={styles.summaryTitle}>Summary</div>
              <select
                className={styles.filterDropdown}
                value={summaryMonth || selectedMonth}
                onChange={(e) => setSummaryMonth(e.target.value)}
                style={{ minWidth: '200px' }}
              >
                <option value="all">All Months</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>
                    {formatMonthDisplay(month)}
                  </option>
                ))}
              </select>
            </div>
            <table className={styles.summaryTable}>
              <thead>
                <tr className={styles.summaryRow}>
                  <th className={`${styles.summaryCell} ${styles.summaryCellBold}`}>Category</th>
                  <th className={`${styles.summaryCell} ${styles.summaryCellBold}`} style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((item, index) => (
                  <tr key={index} className={styles.summaryRow}>
                    <td className={styles.summaryCell}>{item.type}</td>
                    <td className={styles.summaryCell} style={{ textAlign: 'right' }}>{formatAmount(item.amount)}</td>
                  </tr>
                ))}
                {summary.length > 0 && (
                  <tr className={styles.summaryRow}>
                    <td className={`${styles.summaryCell} ${styles.summaryCellBold}`}>Total</td>
                    <td className={`${styles.summaryCell} ${styles.summaryCellBold}`} style={{ textAlign: 'right' }}>
                      {formatAmount(summary.reduce((sum, item) => sum + item.amount, 0))}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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

export default ChurchReceiptsPage;


