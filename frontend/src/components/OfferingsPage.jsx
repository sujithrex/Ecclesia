import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DocumentPdfRegular,
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';
import { generateOfferingsReport } from '../utils/offeringsReportPuppeteer';

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
    minHeight: '500px', // Set minimum height for the table
    maxHeight: 'calc(100vh - 300px)', // Prevent it from being too tall
  },
  tableWrapper: {
    flex: 1,
    overflowX: 'auto',
    overflowY: 'auto',
    minHeight: '400px', // Ensure scrollable area has good height
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px', // Ensure minimum width for all columns
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
    backgroundColor: '#f8f8f8', // Ensure background color is set for sticky header
  },
  td: {
    padding: '16px',
    fontSize: '14px',
    color: '#605e5c',
    borderBottom: '1px solid #e1dfdd',
    whiteSpace: 'nowrap',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  iconButton: {
    background: 'none',
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
    color: '#B5316A',
  },
  deleteButton: {
    color: '#D13438',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderTop: '1px solid #e1dfdd',
    backgroundColor: '#fafafa',
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#605e5c',
  },
  paginationButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  paginationButton: {
    border: '1px solid #8a8886',
    borderRadius: '4px',
    padding: '6px 8px',
    backgroundColor: 'white',
    color: '#323130',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    '&:hover:not(:disabled)': {
      backgroundColor: '#f3f2f1',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    color: '#605e5c',
  },
  emptyStateIcon: {
    fontSize: '48px',
    color: '#B5316A',
    marginBottom: '16px',
  },
  emptyStateText: {
    fontSize: '16px',
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
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 1001,
    maxWidth: '400px',
    fontSize: '14px',
    fontWeight: '500',
    animation: 'slideIn 0.3s ease-out',
  },
  '@keyframes slideIn': {
    from: {
      transform: 'translateX(100%)',
      opacity: 0,
    },
    to: {
      transform: 'translateX(0)',
      opacity: 1,
    }
  },
  notificationSuccess: {
    backgroundColor: '#DFF6DD',
    color: '#107C10',
    border: '1px solid #92C353',
  },
  notificationError: {
    backgroundColor: '#FDE7E9',
    color: '#D13438',
    border: '1px solid #F7B9B9',
  },
  notificationInfo: {
    backgroundColor: '#F0F6FF',
    color: '#0078D4',
    border: '1px solid #B3D6FC',
  },
  confirmOverlay: {
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
    animation: 'fadeIn 0.2s ease-out',
  },
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    }
  },
  confirmDialog: {
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    animation: 'scaleIn 0.2s ease-out',
  },
  '@keyframes scaleIn': {
    from: {
      transform: 'scale(0.9)',
      opacity: 0,
    },
    to: {
      transform: 'scale(1)',
      opacity: 1,
    }
  },
  confirmTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '12px',
  },
  confirmMessage: {
    fontSize: '14px',
    color: '#605e5c',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  confirmButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  confirmButton: {
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '2px',
    cursor: 'pointer',
    fontFamily: 'Segoe UI, sans-serif',
    transition: 'all 0.2s ease',
  },
  confirmButtonCancel: {
    backgroundColor: 'white',
    color: '#323130',
    border: '1px solid #8a8886',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  confirmButtonDelete: {
    backgroundColor: '#D13438',
    color: 'white',
    '&:hover': {
      backgroundColor: '#A4262C',
    },
  },
  filterSection: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
  },
  filterDropdown: {
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #8a8886',
    borderRadius: '2px',
    backgroundColor: 'white',
    color: '#323130',
    cursor: 'pointer',
    fontFamily: 'Segoe UI, sans-serif',
    minWidth: '200px',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
    },
  },
  summarySection: {
    marginTop: '24px',
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e1dfdd',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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
    borderRadius: '4px',
    border: '1px solid #e1dfdd',
  },
  summaryCardLabel: {
    fontSize: '12px',
    color: '#605e5c',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  summaryCardValue: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#B5316A',
  },
  pdfButton: {
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
    '&:disabled': {
      backgroundColor: '#d1d1d1',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
  },
});

const OfferingsPage = ({
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
  const [allTransactions, setAllTransactions] = useState([]); // All transactions from server
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all'); // Format: 'YYYY-MM' or 'all'
  const [summaryMonth, setSummaryMonth] = useState(''); // For summary section
  const [churches, setChurches] = useState([]); // List of churches
  const [selectedChurch, setSelectedChurch] = useState('all'); // Selected church for PDF
  const [reportLoading, setReportLoading] = useState(false); // PDF generation loading state
  const itemsPerPage = 10;

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckmarkCircleRegular />;
      case 'error':
        return <DismissCircleRegular />;
      case 'info':
      default:
        return <InfoRegular />;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return styles.notificationSuccess;
      case 'error':
        return styles.notificationError;
      case 'info':
      default:
        return styles.notificationInfo;
    }
  };

  useEffect(() => {
    if (currentPastorate && user) {
      loadAllTransactions();
      loadChurches();
    }
  }, [currentPastorate?.id, user?.id]);

  // Reset to first page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth]);

  const loadChurches = async () => {
    try {
      const result = await window.electron.church.getUserChurchesByPastorate(currentPastorate.id, user.id);
      if (result.success) {
        setChurches(result.churches || []);
      }
    } catch (error) {
      console.error('Failed to load churches:', error);
      setChurches([]);
    }
  };

  const loadAllTransactions = async () => {
    setLoading(true);
    try {
      const result = await window.electron.offerings.getTransactions({
        pastorateId: currentPastorate.id,
        userId: user.id,
        page: 1,
        limit: 10000, // Large limit to get all transactions
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
    navigate('/offerings/add');
  };

  const handleGeneratePDF = async (action = 'view') => {
    // Validate month selection
    if (selectedMonth === 'all') {
      showNotification('Please select a specific month to generate the report', 'error');
      return;
    }

    setReportLoading(true);
    try {
      const churchId = selectedChurch === 'all' ? null : parseInt(selectedChurch);

      const result = await generateOfferingsReport(
        currentPastorate.id,
        user.id,
        selectedMonth,
        churchId,
        action
      );

      if (result.success) {
        showNotification(`Offertory book report ${action === 'view' ? 'opened' : action === 'download' ? 'downloaded' : 'sent to printer'} successfully`, 'success');
      } else {
        showNotification(`Failed to ${action} report: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification(`Error generating report: ${error.message}`, 'error');
    } finally {
      setReportLoading(false);
    }
  };

  const handleEditTransaction = (transaction) => {
    navigate(`/offerings/edit/${transaction.id}`);
  };

  const handleDeleteTransaction = (transactionId) => {
    setTransactionToDelete(transactionId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    setShowDeleteConfirm(false);

    try {
      const result = await window.electron.offerings.deleteTransaction({
        transactionId: transactionToDelete,
        userId: user.id
      });

      if (result.success) {
        showNotification('Transaction deleted successfully!', 'success');
        loadAllTransactions();
      } else {
        console.error('Failed to delete transaction:', result.error);
        showNotification('Failed to delete transaction: ' + result.error, 'error');
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      showNotification('Failed to delete transaction: ' + error.message, 'error');
    } finally {
      setTransactionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTransactionToDelete(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter and paginate transactions (client-side like AreasDataGrid)
  const filteredTransactions = React.useMemo(() => {
    let filtered = [...allTransactions];

    // Filter by month
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === selectedMonth;
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
  }, [allTransactions, selectedMonth]);

  // Pagination calculations (like AreasDataGrid)
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
    return Array.from(months).sort().reverse(); // Newest first
  };

  // Format month for display
  const formatMonthDisplay = (monthKey) => {
    if (monthKey === 'all') return 'All Months';
    const [year, month] = monthKey.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
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

    // Convert to array, filter out zero amounts, and sort by amount (highest first)
    const sortedTypes = Object.entries(byType)
      .map(([type, amount]) => ({ type, amount }))
      .filter(item => item.amount > 0) // Only show if amount is not 0
      .sort((a, b) => b.amount - a.amount);

    return sortedTypes;
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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className={styles.confirmOverlay} onClick={cancelDelete}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>Delete Transaction</div>
            <div className={styles.confirmMessage}>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </div>
            <div className={styles.confirmButtons}>
              <button
                className={`${styles.confirmButton} ${styles.confirmButtonCancel}`}
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className={`${styles.confirmButton} ${styles.confirmButtonDelete}`}
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Breadcrumb
        pageTitle={`Offerings - ${currentPastorate.pastorate_name}`}
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
            Offering Transactions
          </h2>
          <button className={styles.addButton} onClick={handleAddTransaction}>
            <AddRegular />
            Add Transaction
          </button>
        </div>

        {/* Filter and PDF Generation Section - Combined on Same Row */}
        {allTransactions.length > 0 && (
          <div className={styles.filterSection}>
            {/* Month Filter Group */}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Filter by Month:</span>
              <select
                className={styles.filterDropdown}
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1); // Reset to first page when filter changes
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

            {/* PDF Generation Group */}
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Generate Offertory Book:</span>
              <select
                className={styles.filterDropdown}
                value={selectedChurch}
                onChange={(e) => setSelectedChurch(e.target.value)}
              >
                <option value="all">All Churches</option>
                {churches.map(church => (
                  <option key={church.id} value={church.id}>
                    {church.church_name}
                  </option>
                ))}
              </select>
              <button
                className={styles.pdfButton}
                onClick={() => handleGeneratePDF('view')}
                disabled={reportLoading || selectedMonth === 'all'}
              >
                <DocumentPdfRegular />
                {reportLoading ? 'Generating...' : 'Generate PDF'}
              </button>
            </div>
          </div>
        )}

        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateText}>Loading transactions...</div>
            </div>
          ) : allTransactions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <MoneyRegular />
              </div>
              <div className={styles.emptyStateText}>No offering transactions yet</div>
              <div className={styles.emptyStateSubtext}>
                Click "Add Transaction" to record your first offering
              </div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <MoneyRegular />
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
                      <th className={styles.th}>Church Name</th>
                      <th className={styles.th}>Type of Offering</th>
                      <th className={styles.th}>Date</th>
                      <th className={styles.th}>Amount</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className={styles.td}>{transaction.transaction_id}</td>
                        <td className={styles.td}>{transaction.church_name}</td>
                        <td className={styles.td}>{transaction.offering_type}</td>
                        <td className={styles.td}>{formatDate(transaction.date)}</td>
                        <td className={styles.td}>{formatCurrency(transaction.amount)}</td>
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
                              onClick={() => handleDeleteTransaction(transaction.id)}
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
              
              {filteredTransactions.length > 0 && (
                <div className={styles.pagination}>
                  <div className={styles.paginationInfo}>
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
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
                    <span style={{ fontSize: '14px', color: '#323130', margin: '0 8px' }}>
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
              {summary.map((item, index) => (
                <div key={index} className={styles.summaryCard}>
                  <div className={styles.summaryCardLabel}>{item.type}</div>
                  <div className={styles.summaryCardValue}>{formatCurrency(item.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
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

export default OfferingsPage;

