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
      borderColor: '#c8c6c4',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  notification: {
    position: 'fixed',
    top: '80px',
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
    animation: 'slideIn 0.3s ease',
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
    backgroundColor: '#e1f3ff',
    color: '#0078d4',
    border: '1px solid #0078d4',
  },
  filterSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  emptyStateSubtext: {
    fontSize: '14px',
    color: '#8a8886',
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
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px',
  },
  summaryCard: {
    padding: '16px',
    backgroundColor: '#f8f8f8',
    borderRadius: '6px',
    border: '1px solid #e1dfdd',
  },
  summaryCardLabel: {
    fontSize: '13px',
    color: '#605e5c',
    marginBottom: '8px',
  },
  summaryCardValue: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#323130',
  },
});

const OtherCreditsPage = ({
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
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [summaryMonth, setSummaryMonth] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (currentPastorate) {
      loadTransactions();
    }
  }, [currentPastorate, bookType]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const result = await window.electron.otherCredits.getTransactions({
        pastorateId: currentPastorate.id,
        userId: user.id,
        bookType: bookType,
        page: 1,
        limit: 1000,
        filters: {}
      });

      if (result.success) {
        setAllTransactions(result.transactions || []);
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
        message: 'Failed to load transactions'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = () => {
    navigate(`/other-credits/add?bookType=${bookType}`);
  };

  const handleEditTransaction = (transaction) => {
    navigate(`/other-credits/edit/${transaction.id}?bookType=${bookType}`);
  };

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;

    try {
      const result = await window.electron.otherCredits.deleteTransaction({
        transactionId: transactionToDelete.id,
        userId: user.id
      });

      if (result.success) {
        setNotification({
          type: 'success',
          message: 'Transaction deleted successfully!'
        });
        loadTransactions();
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

  const getNotificationStyle = (type) => {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
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

  const getAvailableMonths = () => {
    const months = new Set();
    allTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  const formatMonthDisplay = (monthKey) => {
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

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth]);

  // Calculate summary by category for selected month
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

    // Group by category and sum amounts
    const byCategory = {};
    filtered.forEach(t => {
      const category = t.primary_category_name || 'Uncategorized';
      if (!byCategory[category]) {
        byCategory[category] = 0;
      }
      byCategory[category] += parseFloat(t.amount || 0);
    });

    // Calculate total
    const total = Object.values(byCategory).reduce((sum, amount) => sum + amount, 0);

    // Convert to array, filter out zero amounts, and sort by amount (highest first)
    const sortedCategories = Object.entries(byCategory)
      .map(([category, amount]) => ({ category, amount }))
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    return { total, categories: sortedCategories };
  };

  const availableMonths = getAvailableMonths();
  const summary = getSummary();

  if (!currentPastorate) {
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
              Confirm Delete
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#605e5c' }}>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleDeleteCancel}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e1dfdd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#d13438',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
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
      />

      <Breadcrumb
        pageTitle={`Other Credits - ${currentPastorate.pastorate_name}`}
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
            label: 'Other Credits',
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
            Other Credit Transactions
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

        {/* Transactions Table */}
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <ReceiptMoneyRegular />
              </div>
              <div className={styles.emptyStateText}>Loading transactions...</div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <ReceiptMoneyRegular />
              </div>
              <div className={styles.emptyStateText}>
                No transactions found
              </div>
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
                      <th className={styles.th}>Credit Number</th>
                      <th className={styles.th}>Name of Giver</th>
                      <th className={styles.th}>Primary Category</th>
                      <th className={styles.th}>Secondary Category</th>
                      <th className={styles.th}>Date</th>
                      <th className={styles.th}>Amount</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className={styles.td}>{transaction.transaction_id}</td>
                        <td className={styles.td}>{transaction.credit_number}</td>
                        <td className={styles.td}>{transaction.giver_name}</td>
                        <td className={styles.td}>{transaction.primary_category_name || '-'}</td>
                        <td className={styles.td}>{transaction.secondary_category_name || '-'}</td>
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
                  <div className={styles.pageInfo}>
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                  </div>
                  <div className={styles.pageButtons}>
                    <button
                      className={styles.pageButton}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeftRegular />
                    </button>
                    <span className={styles.pageInfo}>
                      Page {currentPage} of {totalPages}
                    </span>
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
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryCardLabel}>Total Amount</div>
                <div className={styles.summaryCardValue}>{formatAmount(summary.total)}</div>
              </div>
              {summary.categories.map((item, index) => (
                <div key={index} className={styles.summaryCard}>
                  <div className={styles.summaryCardLabel}>{item.category}</div>
                  <div className={styles.summaryCardValue}>{formatAmount(item.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OtherCreditsPage;

