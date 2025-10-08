import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  MoneyRegular,
  BuildingBankRegular,
  DocumentRegular,
  ReceiptMoneyRegular,
  BuildingRegular,
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';
import CreateLedgerCategoryModal from './CreateLedgerCategoryModal';
import CreateLedgerSubCategoryModal from './CreateLedgerSubCategoryModal';
import CreateCustomBookModal from './CreateCustomBookModal';

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
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    }
  },
  statIcon: {
    fontSize: '32px',
    color: '#B5316A',
  },
  statLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#323130',
    textAlign: 'center',
    fontFamily: 'Pavanam, Segoe UI, sans-serif',
    lineHeight: '1.4',
    marginBottom: '8px',
  },
  statDetails: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  statRowLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#605E5C',
  },
  statRowValueIncome: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#107C10', // Green for income
  },
  statRowValueExpense: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#D13438', // Red for expenses
  },
  statRowValueBalancePositive: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#107C10', // Green for positive balance
  },
  statRowValueBalanceNegative: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#D13438', // Red for negative balance
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#B5316A',
  },
  bookSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
  },
  bookSectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#B5316A',
    margin: '0 0 20px 0',
    textAlign: 'left',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    minWidth: '140px',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: '#A12B5E',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(181, 49, 106, 0.3)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
  actionButtonOutlined: {
    backgroundColor: 'white',
    color: '#B5316A',
    border: '2px solid #B5316A',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    minWidth: '140px',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: '#f8f8f8',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(181, 49, 106, 0.2)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
  twoColumnLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
});

const ChurchAccountsPage = ({
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
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState({
    cash: { totalIncome: 0, totalExpense: 0, balance: 0 },
    bank: { totalIncome: 0, totalExpense: 0, balance: 0 },
    total: { totalIncome: 0, totalExpense: 0, balance: 0 }
  });

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [currentBookType, setCurrentBookType] = useState('cash'); // 'cash', 'bank', 'diocese'
  const [categories, setCategories] = useState([]);
  const [showCustomBookModal, setShowCustomBookModal] = useState(false);
  const [customBooks, setCustomBooks] = useState([]);

  // Load account balances when pastorate changes
  useEffect(() => {
    if (currentChurch && user) {
      loadAccountBalances();
      loadCustomBooks();
      // Categories will be loaded when opening the sub-category modal
    }
  }, [currentChurch?.id, user?.id]);

  const loadAccountBalances = async () => {
    setLoading(true);
    try {
      const result = await window.electron.churchAccountBalance.getAllBalances({
        churchId: currentChurch.id
      });

      if (result.success) {
        setBalances(result.balances);
      } else {
        console.error('Failed to load account balances:', result.error);
      }
    } catch (error) {
      console.error('Failed to load account balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomBooks = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const result = await window.electron.churchCustomBook.getByChurch({
        churchId: currentChurch.id,
        userId: parseInt(userId)
      });

      if (result.success) {
        // Load balances for each custom book
        const booksWithBalances = await Promise.all(
          result.books.map(async (book) => {
            const balanceResult = await window.electron.churchCustomBook.getBalance({
              bookId: book.id
            });
            return {
              ...book,
              balance: balanceResult.success ? balanceResult.data : { totalCredit: 0, totalDebit: 0, balance: 0 }
            };
          })
        );
        setCustomBooks(booksWithBalances);
      } else {
        console.error('Failed to load custom books:', result.error);
      }
    } catch (error) {
      console.error('Failed to load custom books:', error);
    }
  };

  const loadCategories = async (bookType) => {
    try {
      const result = await window.electron.churchLedger.getCategories({
        churchId: currentChurch.id,
        bookType: bookType
      });
      if (result.success) {
        setCategories(result.categories || []);
      } else {
        console.error('Failed to load categories:', result.error);
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    }
  };

  // Modal handlers
  const handleOpenCategoryModal = (bookType) => {
    setCurrentBookType(bookType);
    setShowCategoryModal(true);
  };

  const handleOpenSubCategoryModal = async (bookType) => {
    setCurrentBookType(bookType);
    // Load categories for this book type before opening the modal
    await loadCategories(bookType);
    setShowSubCategoryModal(true);
  };

  const handleCategoryCreated = (category) => {
    setCategories(prev => [...prev, category]);
    loadCategories(currentBookType); // Reload to get fresh data
  };

  const handleSubCategoryCreated = (subCategory) => {
    loadCategories(currentBookType); // Reload to get fresh data
  };

  // Build balance cards array
  const balanceCards = [
    {
      icon: <MoneyRegular />,
      label: 'Church Cash',
      data: balances.cash,
    },
    {
      icon: <BuildingBankRegular />,
      label: 'Church Bank',
      data: balances.bank,
    },
    {
      icon: <MoneyRegular />,
      label: 'Total',
      data: balances.total,
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!currentChurch) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={`Accounts - ${currentChurch.church_name}`}
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
            current: true
          }
        ]}
        onNavigate={(breadcrumb) => {
          if (breadcrumb.onClick) {
            breadcrumb.onClick();
          }
        }}
      />

      {/* Content */}
      <div className={styles.content}>

        {/* Balance Cards */}
        <div className={styles.statsContainer}>
          {balanceCards.map((card, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statIcon}>
                {card.icon}
              </div>
              <div className={styles.statLabel}>
                {card.label}
              </div>
              <div className={styles.statDetails}>
                <div className={styles.statRow}>
                  <span className={styles.statRowLabel}>Total Income:</span>
                  <span className={styles.statRowValueIncome}>
                    {loading ? '...' : formatCurrency(card.data.totalIncome)}
                  </span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statRowLabel}>Total Expenses:</span>
                  <span className={styles.statRowValueExpense}>
                    {loading ? '...' : formatCurrency(card.data.totalExpense)}
                  </span>
                </div>
                <div className={styles.statRow}>
                  <span className={styles.statRowLabel}>Balance:</span>
                  <span className={card.data.balance >= 0 ? styles.statRowValueBalancePositive : styles.statRowValueBalanceNegative}>
                    {loading ? '...' : formatCurrency(card.data.balance)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Church Cash Book Section */}
        <div className={styles.bookSection}>
          <h2 className={styles.bookSectionTitle}>Church Cash Book</h2>

          {/* Row 1: Ledger Categories */}
          <div className={styles.buttonRow}>
            <button
              className={styles.actionButton}
              onClick={() => handleOpenCategoryModal('cash')}
            >
              <DocumentRegular />
              Ledger Categories
            </button>
            <button
              className={styles.actionButton}
              onClick={() => handleOpenSubCategoryModal('cash')}
            >
              <DocumentRegular />
              Ledger Sub Categories
            </button>
          </div>

          {/* Row 2: All Transaction Buttons */}
          <div className={styles.buttonRow}>
            <button
              className={styles.actionButton}
              onClick={() => navigate('/church-receipts?bookType=cash')}
            >
              <ReceiptMoneyRegular />
              Receipts
            </button>
            <button
              className={styles.actionButton}
              onClick={() => navigate('/church-other-credits?bookType=cash')}
            >
              <MoneyRegular />
              Other Credits
            </button>
            <button
              className={styles.actionButtonOutlined}
              onClick={() => navigate('/church-bill-vouchers?bookType=cash')}
            >
              <DocumentRegular />
              Bills / Vouchers
            </button>
            <button
              className={styles.actionButtonOutlined}
              onClick={() => navigate('/church-acquittance?bookType=cash')}
            >
              <DocumentRegular />
              Acquittance
            </button>
            <button
              className={styles.actionButton}
              onClick={() => navigate('/church-contra-vouchers?bookType=cash')}
            >
              <MoneyRegular />
              Contra
            </button>
          </div>
        </div>

        {/* Church Bank Book Section */}
        <div className={styles.bookSection}>
          <h2 className={styles.bookSectionTitle}>Church Bank Book</h2>

            {/* Row 1: Ledger Categories */}
            <div className={styles.buttonRow}>
              <button
                className={styles.actionButton}
                onClick={() => handleOpenCategoryModal('bank')}
              >
                <DocumentRegular />
                Ledger Categories
              </button>
              <button
                className={styles.actionButton}
                onClick={() => handleOpenSubCategoryModal('bank')}
              >
                <DocumentRegular />
                Ledger Sub Categories
              </button>
            </div>

            {/* Row 2: All Transaction Buttons */}
            <div className={styles.buttonRow}>
              <button
                className={styles.actionButton}
                onClick={() => navigate('/church-receipts?bookType=bank')}
              >
                <ReceiptMoneyRegular />
                Receipts
              </button>
              <button
                className={styles.actionButton}
                onClick={() => navigate('/church-other-credits?bookType=bank')}
              >
                <MoneyRegular />
                Other Credits
              </button>
              <button
                className={styles.actionButtonOutlined}
                onClick={() => navigate('/church-bill-vouchers?bookType=bank')}
              >
                <DocumentRegular />
                Bills / Vouchers
              </button>
              <button
                className={styles.actionButtonOutlined}
                onClick={() => navigate('/church-acquittance?bookType=bank')}
              >
                <DocumentRegular />
                Acquittance
              </button>
              <button
                className={styles.actionButton}
                onClick={() => navigate('/church-contra-vouchers?bookType=bank')}
              >
                <MoneyRegular />
                Contra
              </button>
            </div>
          </div>

        {/* Custom Books Section */}
        <div className={styles.bookSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className={styles.bookSectionTitle}>Custom Books</h2>
            <button
              className={styles.actionButton}
              onClick={() => setShowCustomBookModal(true)}
              style={{ margin: 0 }}
            >
              <BuildingRegular />
              Create New Book
            </button>
          </div>

          {customBooks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#605E5C',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e1dfdd'
            }}>
              <BuildingRegular style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
              <p>No custom books created yet. Click "Create New Book" to get started.</p>
            </div>
          ) : (
            <div className={styles.statsContainer}>
              {customBooks.map((book) => (
                <div
                  key={book.id}
                  className={styles.statCard}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/church-custom-book-detail/${book.id}`)}
                >
                  <div className={styles.statIcon}>
                    <BuildingRegular />
                  </div>
                  <div className={styles.statLabel}>
                    {book.book_name}
                  </div>
                  <div className={styles.statDetails}>
                    <div className={styles.statRow}>
                      <span className={styles.statRowLabel}>Total Credit:</span>
                      <span className={styles.statRowValueIncome}>
                        {formatCurrency(book.balance?.totalCredit || 0)}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statRowLabel}>Total Debit:</span>
                      <span className={styles.statRowValueExpense}>
                        {formatCurrency(book.balance?.totalDebit || 0)}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statRowLabel}>Balance:</span>
                      <span className={book.balance?.balance >= 0 ? styles.statRowValueBalancePositive : styles.statRowValueBalanceNegative}>
                        {formatCurrency(book.balance?.balance || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

      {/* Modals */}
      <CreateLedgerCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={handleCategoryCreated}
        user={user}
        currentChurch={currentChurch}
        bookType={currentBookType}
      />

      <CreateLedgerSubCategoryModal
        isOpen={showSubCategoryModal}
        onClose={() => setShowSubCategoryModal(false)}
        onSuccess={handleSubCategoryCreated}
        user={user}
        currentChurch={currentChurch}
        bookType={currentBookType}
        categories={categories}
      />

      <CreateCustomBookModal
        open={showCustomBookModal}
        onClose={() => setShowCustomBookModal(false)}
        onSuccess={loadCustomBooks}
        churchId={currentChurch?.id}
        isChurchLevel={true}
      />
    </div>
  );
};

export default ChurchAccountsPage;

