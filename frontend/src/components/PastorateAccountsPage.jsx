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
  DocumentPdfRegular,
  PersonRegular,
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';
import CreateLedgerCategoryModal from './CreateLedgerCategoryModal';
import CreateLedgerSubCategoryModal from './CreateLedgerSubCategoryModal';
import { generateRoughCashBookReport, getAvailableMonths } from '../utils/roughCashBookReportPuppeteer';

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
    gridTemplateColumns: 'repeat(4, 1fr)',
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

const PastorateAccountsPage = ({
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
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState({
    cash: { totalIncome: 0, totalExpense: 0, balance: 0 },
    bank: { totalIncome: 0, totalExpense: 0, balance: 0 },
    diocese: { totalIncome: 0, totalExpense: 0, balance: 0 },
    total: { totalIncome: 0, totalExpense: 0, balance: 0 }
  });

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [currentBookType, setCurrentBookType] = useState('cash'); // 'cash', 'bank', 'diocese'
  const [categories, setCategories] = useState([]);

  // Rough Cash Book states
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [reportLoading, setReportLoading] = useState(false);

  // Load account balances when pastorate changes
  useEffect(() => {
    if (currentPastorate && user) {
      loadAccountBalances();
      loadAvailableMonths();
      // Categories will be loaded when opening the sub-category modal
    }
  }, [currentPastorate?.id, user?.id]);

  const loadAccountBalances = async () => {
    setLoading(true);
    try {
      const result = await window.electron.accountBalance.getAllBalances({
        pastorateId: currentPastorate.id
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

  const loadCategories = async (bookType) => {
    try {
      const result = await window.electron.ledger.getCategories({
        pastorateId: currentPastorate.id,
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

  // Load available months for rough cash book
  const loadAvailableMonths = async () => {
    try {
      const result = await getAvailableMonths(currentPastorate.id, user.id);
      if (result.success && result.months && result.months.length > 0) {
        setAvailableMonths(result.months);
        setSelectedMonth(result.months[0]); // Set first month as default
      } else {
        setAvailableMonths([]);
        setSelectedMonth('');
      }
    } catch (error) {
      console.error('Error loading available months:', error);
      setAvailableMonths([]);
      setSelectedMonth('');
    }
  };

  // Format month display (YYYY-MM to "Month Year")
  const formatMonthDisplay = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, parseInt(month) - 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    return `${monthName}-${year}`;
  };

  // Handle rough cash book report generation
  const handleGenerateRoughCashBook = async (action = 'view') => {
    if (!selectedMonth) {
      alert('Please select a month');
      return;
    }

    setReportLoading(true);
    try {
      const result = await generateRoughCashBookReport(
        currentPastorate.id,
        user.id,
        selectedMonth,
        action
      );

      if (!result.success) {
        alert(`Error ${action === 'download' ? 'saving' : action === 'print' ? 'printing' : 'viewing'} report: ${result.error}`);
      }
    } catch (error) {
      console.error('Error generating rough cash book report:', error);
      alert(`Error generating report: ${error.message}`);
    } finally {
      setReportLoading(false);
    }
  };

  // Build balance cards array
  const balanceCards = [
    {
      icon: <MoneyRegular />,
      label: 'Pastorate Cash',
      data: balances.cash,
    },
    {
      icon: <BuildingBankRegular />,
      label: 'Pastorate Bank',
      data: balances.bank,
    },
    {
      icon: <BuildingBankRegular />,
      label: 'Diocesan',
      data: balances.diocese,
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

  if (!currentPastorate) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={`Accounts - ${currentPastorate.pastorate_name}`}
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

        {/* Rough Cash Book Section */}
        <div className={styles.bookSection}>
          <h2 className={styles.bookSectionTitle}>Rough Cash Book</h2>
          <div className={styles.buttonRow} style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#323130' }}>
                Month:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={availableMonths.length === 0}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  border: '1px solid #e1dfdd',
                  backgroundColor: 'white',
                  cursor: availableMonths.length === 0 ? 'not-allowed' : 'pointer',
                  minWidth: '150px'
                }}
              >
                {availableMonths.length === 0 ? (
                  <option value="">No data available</option>
                ) : (
                  availableMonths.map(month => (
                    <option key={month} value={month}>
                      {formatMonthDisplay(month)}
                    </option>
                  ))
                )}
              </select>
            </div>
            <button
              className={styles.actionButton}
              onClick={() => handleGenerateRoughCashBook('view')}
              disabled={!selectedMonth || reportLoading}
              style={{
                opacity: !selectedMonth || reportLoading ? 0.6 : 1,
                cursor: !selectedMonth || reportLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <DocumentPdfRegular />
              {reportLoading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Pastorate Cash Book Section */}
        <div className={styles.bookSection}>
          <h2 className={styles.bookSectionTitle}>Pastorate Cash Book</h2>

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
              onClick={() => navigate('/receipts?bookType=cash')}
            >
              <ReceiptMoneyRegular />
              Receipts
            </button>
            <button
              className={styles.actionButton}
              onClick={() => navigate('/offerings')}
            >
              <BuildingRegular />
              Offering
            </button>
            <button
              className={styles.actionButton}
              onClick={() => navigate('/other-credits?bookType=cash')}
            >
              <MoneyRegular />
              Other Credits
            </button>
            <button
              className={styles.actionButtonOutlined}
              onClick={() => navigate('/bill-vouchers?bookType=cash')}
            >
              <DocumentRegular />
              Bills / Vouchers
            </button>
            <button
              className={styles.actionButtonOutlined}
              onClick={() => navigate('/acquittance?bookType=cash')}
            >
              <DocumentRegular />
              Acquittance
            </button>
            <button
              className={styles.actionButton}
              onClick={() => navigate('/contra-vouchers?bookType=cash')}
            >
              <MoneyRegular />
              Contra
            </button>
            <button
              className={styles.actionButton}
              onClick={() => navigate('/indent')}
            >
              <PersonRegular />
              Indent
            </button>
          </div>
        </div>

        {/* Two Column Layout for Bank and Diocese Books */}
        <div className={styles.twoColumnLayout}>
          {/* Pastorate Bank Book Section */}
          <div className={styles.bookSection}>
            <h2 className={styles.bookSectionTitle}>Pastorate Bank Book</h2>

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
                onClick={() => navigate('/receipts?bookType=bank')}
              >
                <ReceiptMoneyRegular />
                Receipts
              </button>
              <button
                className={styles.actionButton}
                onClick={() => navigate('/other-credits?bookType=bank')}
              >
                <MoneyRegular />
                Other Credits
              </button>
              <button
                className={styles.actionButtonOutlined}
                onClick={() => navigate('/bill-vouchers?bookType=bank')}
              >
                <DocumentRegular />
                Bills / Vouchers
              </button>
              <button
                className={styles.actionButtonOutlined}
                onClick={() => navigate('/acquittance?bookType=bank')}
              >
                <DocumentRegular />
                Acquittance
              </button>
              <button
                className={styles.actionButton}
                onClick={() => navigate('/contra-vouchers?bookType=bank')}
              >
                <MoneyRegular />
                Contra
              </button>
            </div>
          </div>

          {/* Diocese Book Section */}
          <div className={styles.bookSection}>
            <h2 className={styles.bookSectionTitle}>Diocese Book</h2>

            {/* Row 1: Ledger Categories */}
            <div className={styles.buttonRow}>
              <button
                className={styles.actionButton}
                onClick={() => handleOpenCategoryModal('diocese')}
              >
                <DocumentRegular />
                Ledger Categories
              </button>
              <button
                className={styles.actionButton}
                onClick={() => handleOpenSubCategoryModal('diocese')}
              >
                <DocumentRegular />
                Ledger Sub Categories
              </button>
            </div>

            {/* Row 2: All Transaction Buttons */}
            <div className={styles.buttonRow}>
              <button
                className={styles.actionButton}
                onClick={() => navigate('/receipts?bookType=diocese')}
              >
                <ReceiptMoneyRegular />
                Receipts
              </button>
              <button
                className={styles.actionButton}
                onClick={() => navigate('/other-credits?bookType=diocese')}
              >
                <MoneyRegular />
                Other Credits
              </button>
              <button
                className={styles.actionButtonOutlined}
                onClick={() => navigate('/bill-vouchers?bookType=diocese')}
              >
                <DocumentRegular />
                Bills / Vouchers
              </button>
              <button
                className={styles.actionButtonOutlined}
                onClick={() => navigate('/acquittance?bookType=diocese')}
              >
                <DocumentRegular />
                Acquittance
              </button>
              <button
                className={styles.actionButton}
                onClick={() => navigate('/contra-vouchers?bookType=diocese')}
              >
                <MoneyRegular />
                Contra
              </button>
            </div>
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

      {/* Modals */}
      <CreateLedgerCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={handleCategoryCreated}
        user={user}
        currentPastorate={currentPastorate}
        bookType={currentBookType}
      />

      <CreateLedgerSubCategoryModal
        isOpen={showSubCategoryModal}
        onClose={() => setShowSubCategoryModal(false)}
        onSuccess={handleSubCategoryCreated}
        user={user}
        currentPastorate={currentPastorate}
        bookType={currentBookType}
        categories={categories}
      />
    </div>
  );
};

export default PastorateAccountsPage;

