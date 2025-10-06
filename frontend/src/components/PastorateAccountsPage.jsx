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
    pastorateCash: 0,
    pastorateBank: 0,
    diocesanBalance: 0,
    totalAmount: 0
  });

  // Load account balances when pastorate changes
  useEffect(() => {
    if (currentPastorate && user) {
      loadAccountBalances();
    }
  }, [currentPastorate?.id, user?.id]);

  const loadAccountBalances = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to fetch account balances
      // For now, using placeholder values
      const mockBalances = {
        pastorateCash: 50000,
        pastorateBank: 150000,
        diocesanBalance: 75000,
        totalAmount: 275000
      };
      
      setBalances(mockBalances);
    } catch (error) {
      console.error('Failed to load account balances:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build balance cards array
  const balanceCards = [
    {
      icon: <MoneyRegular />,
      label: 'Pastorate Cash Balance',
      value: balances.pastorateCash,
    },
    {
      icon: <BuildingBankRegular />,
      label: 'Pastorate Bank Balance',
      value: balances.pastorateBank,
    },
    {
      icon: <BuildingBankRegular />,
      label: 'Diocesan Balance',
      value: balances.diocesanBalance,
    },
    {
      icon: <MoneyRegular />,
      label: 'Total Amount',
      value: balances.totalAmount,
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
              <div className={styles.statValue}>
                {loading ? '...' : formatCurrency(card.value)}
              </div>
            </div>
          ))}
        </div>

        {/* Pastorate Cash Book Section */}
        <div className={styles.bookSection}>
          <h2 className={styles.bookSectionTitle}>Pastorate Cash Book</h2>

          {/* Row 1: Ledger Categories */}
          <div className={styles.buttonRow}>
            <button className={styles.actionButton}>
              <DocumentRegular />
              Ledger Categories
            </button>
            <button className={styles.actionButton}>
              <DocumentRegular />
              Ledger Sub Categories
            </button>
          </div>

          {/* Row 2: All Transaction Buttons */}
          <div className={styles.buttonRow}>
            <button className={styles.actionButton}>
              <ReceiptMoneyRegular />
              Receipts
            </button>
            <button className={styles.actionButton}>
              <BuildingRegular />
              Offering
            </button>
            <button className={styles.actionButton}>
              <MoneyRegular />
              Other Credits
            </button>
            <button className={styles.actionButtonOutlined}>
              <DocumentRegular />
              Bills / Vouchers
            </button>
            <button className={styles.actionButtonOutlined}>
              <DocumentRegular />
              Aqudence
            </button>
            <button className={styles.actionButtonOutlined}>
              <MoneyRegular />
              Other Debits
            </button>
            <button className={styles.actionButton}>
              <MoneyRegular />
              Contra
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
              <button className={styles.actionButton}>
                <DocumentRegular />
                Ledger Categories
              </button>
              <button className={styles.actionButton}>
                <DocumentRegular />
                Ledger Sub Categories
              </button>
            </div>

            {/* Row 2: All Transaction Buttons */}
            <div className={styles.buttonRow}>
              <button className={styles.actionButton}>
                <ReceiptMoneyRegular />
                Receipts
              </button>
              <button className={styles.actionButton}>
                <MoneyRegular />
                Other Credits
              </button>
              <button className={styles.actionButtonOutlined}>
                <DocumentRegular />
                Bills / Vouchers
              </button>
              <button className={styles.actionButtonOutlined}>
                <DocumentRegular />
                Aqudence
              </button>
              <button className={styles.actionButtonOutlined}>
                <MoneyRegular />
                Other Debits
              </button>
              <button className={styles.actionButton}>
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
              <button className={styles.actionButton}>
                <DocumentRegular />
                Ledger Categories
              </button>
              <button className={styles.actionButton}>
                <DocumentRegular />
                Ledger Sub Categories
              </button>
            </div>

            {/* Row 2: All Transaction Buttons */}
            <div className={styles.buttonRow}>
              <button className={styles.actionButton}>
                <ReceiptMoneyRegular />
                Receipts
              </button>
              <button className={styles.actionButton}>
                <MoneyRegular />
                Other Credits
              </button>
              <button className={styles.actionButtonOutlined}>
                <DocumentRegular />
                Bills / Vouchers
              </button>
              <button className={styles.actionButtonOutlined}>
                <MoneyRegular />
                Other Debits
              </button>
              <button className={styles.actionButton}>
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
    </div>
  );
};

export default PastorateAccountsPage;

