import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  MoneyRegular,
  DocumentRegular,
  BuildingRegular,
  ArrowLeftRegular,
  SettingsRegular,
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';
import AddCustomBookCategoryModal from './AddCustomBookCategoryModal';
import AddCustomBookSubcategoryModal from './AddCustomBookSubcategoryModal';
import ManageCategoriesModal from './ManageCategoriesModal';

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
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '8px',
  },
  backButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#B5316A',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  bookTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#323130',
    margin: 0,
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  statLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#605E5C',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
  },
  statValueCredit: {
    color: '#107C10',
  },
  statValueDebit: {
    color: '#D13438',
  },
  statValueBalance: {
    color: '#107C10',
  },
  statValueBalanceNegative: {
    color: '#D13438',
  },
  buttonSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#323130',
    marginBottom: '16px',
  },
  buttonRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    minWidth: '160px',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: '#9a2858',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(181, 49, 106, 0.3)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
});

const CustomBookDetailPage = ({
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
  isChurchLevel = false,
}) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { bookId } = useParams();
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(null);
  const [balance, setBalance] = useState({ totalCredit: 0, totalDebit: 0, balance: 0 });
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);

  useEffect(() => {
    if (bookId) {
      loadBookDetails();
    }
  }, [bookId]);

  const loadBookDetails = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      
      // Get book details
      const bookResult = isChurchLevel
        ? await window.electron.churchCustomBook.getById({ bookId: parseInt(bookId), userId: parseInt(userId) })
        : await window.electron.customBook.getById({ bookId: parseInt(bookId), userId: parseInt(userId) });

      if (bookResult.success) {
        setBook(bookResult.book);
      }

      // Get balance
      const balanceResult = isChurchLevel
        ? await window.electron.churchCustomBook.getBalance({ bookId: parseInt(bookId) })
        : await window.electron.customBook.getBalance({ bookId: parseInt(bookId) });

      if (balanceResult.success) {
        setBalance(balanceResult.data);
      }
    } catch (error) {
      console.error('Failed to load book details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const handleBack = () => {
    if (isChurchLevel) {
      navigate('/church-accounts');
    } else {
      navigate('/pastorate-accounts');
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
      onClick: handleBack,
    },
    {
      label: book?.book_name || 'Custom Book',
      current: true,
    },
  ];

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <Breadcrumb
        pageTitle={book?.book_name || 'Custom Book'}
        breadcrumbs={breadcrumbItems}
        titleAlign="left"
        onNavigate={(breadcrumb) => {
          if (breadcrumb.onClick) {
            breadcrumb.onClick();
          }
        }}
      />

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            <ArrowLeftRegular />
            Back
          </button>
          <h1 className={styles.bookTitle}>
            <BuildingRegular style={{ marginRight: '12px' }} />
            {book?.book_name || 'Loading...'}
          </h1>
        </div>

        {/* Balance Cards */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Credit</div>
            <div className={`${styles.statValue} ${styles.statValueCredit}`}>
              {loading ? '...' : formatCurrency(balance.totalCredit)}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Debit</div>
            <div className={`${styles.statValue} ${styles.statValueDebit}`}>
              {loading ? '...' : formatCurrency(balance.totalDebit)}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Balance</div>
            <div className={`${styles.statValue} ${balance.balance >= 0 ? styles.statValueBalance : styles.statValueBalanceNegative}`}>
              {loading ? '...' : formatCurrency(balance.balance)}
            </div>
          </div>
        </div>

        {/* Transaction Buttons */}
        <div className={styles.buttonSection}>
          <h2 className={styles.sectionTitle}>Transactions</h2>
          <div className={styles.buttonRow}>
            <button
              className={styles.actionButton}
              onClick={() => navigate(isChurchLevel ? `/church-custom-book-credit/${bookId}?church=true` : `/custom-book-credit/${bookId}`)}
            >
              <MoneyRegular />
              Credit Vouchers
            </button>
            <button
              className={styles.actionButton}
              onClick={() => navigate(isChurchLevel ? `/church-custom-book-debit/${bookId}?church=true` : `/custom-book-debit/${bookId}`)}
            >
              <DocumentRegular />
              Debit Vouchers
            </button>
            <button
              className={styles.actionButton}
              onClick={() => navigate(isChurchLevel ? `/church-custom-book-contra/${bookId}?church=true` : `/custom-book-contra/${bookId}`)}
            >
              <MoneyRegular />
              Contra Vouchers
            </button>
          </div>
        </div>

        {/* Settings Section */}
        <div className={styles.buttonSection}>
          <h2 className={styles.sectionTitle}>Settings</h2>
          <div className={styles.buttonRow}>
            <button
              className={styles.actionButton}
              onClick={() => setShowAddCategoryModal(true)}
            >
              <DocumentRegular />
              Add Category
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setShowAddSubcategoryModal(true)}
            >
              <DocumentRegular />
              Add Subcategory
            </button>
            <button
              className={styles.actionButton}
              onClick={() => setShowManageCategoriesModal(true)}
            >
              <SettingsRegular />
              Manage Categories
            </button>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <AddCustomBookCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onSuccess={() => {
          // Optionally reload data or show success message
        }}
        customBookId={parseInt(bookId)}
        pastorateId={currentPastorate?.id}
        churchId={currentChurch?.id}
        isChurchLevel={isChurchLevel}
      />

      {/* Add Subcategory Modal */}
      <AddCustomBookSubcategoryModal
        isOpen={showAddSubcategoryModal}
        onClose={() => setShowAddSubcategoryModal(false)}
        onSuccess={() => {
          // Optionally reload data or show success message
        }}
        customBookId={parseInt(bookId)}
        pastorateId={currentPastorate?.id}
        churchId={currentChurch?.id}
        isChurchLevel={isChurchLevel}
      />

      {/* Manage Categories Modal */}
      <ManageCategoriesModal
        isOpen={showManageCategoriesModal}
        onClose={() => setShowManageCategoriesModal(false)}
        customBookId={parseInt(bookId)}
        pastorateId={currentPastorate?.id}
        churchId={currentChurch?.id}
        isChurchLevel={isChurchLevel}
      />

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
        currentView={isChurchLevel ? "church" : "pastorate"}
        disablePastorateChurchChange={isChurchLevel}
        disableChurchSelector={!isChurchLevel}
      />
    </div>
  );
};

export default CustomBookDetailPage;

