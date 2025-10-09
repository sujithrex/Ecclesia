import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  ArrowLeftRegular,
  CheckmarkRegular,
  DismissRegular,
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
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#323130',
    margin: 0,
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  saveButton: {
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
  cancelButton: {
    backgroundColor: '#f3f2f1',
    color: '#323130',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&:hover': {
      backgroundColor: '#e1dfdd',
    },
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    padding: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '16px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d1d1',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      borderColor: '#B5316A',
    },
  },
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '16px 24px',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '500',
  },
  notificationSuccess: {
    backgroundColor: '#DFF6DD',
    color: '#107C10',
    border: '1px solid #107C10',
  },
  notificationError: {
    backgroundColor: '#FDE7E9',
    color: '#A80000',
    border: '1px solid #A80000',
  },
});

const MonthlyPayoutEditPage = ({
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
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [payout, setPayout] = useState(null);
  const [snapshotData, setSnapshotData] = useState({
    employees: [],
    allowances: [],
    payments: []
  });

  useEffect(() => {
    if (id && currentPastorate && user) {
      loadPayoutData();
    }
  }, [id, currentPastorate?.id, user?.id]);

  const loadPayoutData = async () => {
    setLoading(true);
    try {
      const result = await window.electron.indent.getMonthlyPayout({ payoutId: parseInt(id) });
      if (result.success && result.payout) {
        setPayout(result.payout);
        const data = JSON.parse(result.payout.snapshot_data || '{}');
        setSnapshotData(data);
      } else {
        showNotification('Failed to load payout data', 'error');
      }
    } catch (error) {
      console.error('Failed to load payout:', error);
      showNotification('Failed to load payout data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async () => {
    try {
      // Calculate new total
      const employeeTotal = snapshotData.employees.reduce((sum, emp) => {
        let total = emp.salary + emp.da + emp.dpf + emp.cpf + emp.dfbf + emp.cswf + emp.dmaf + emp.sangam;
        if (emp.custom_deductions) {
          try {
            const customDed = typeof emp.custom_deductions === 'string'
              ? JSON.parse(emp.custom_deductions)
              : emp.custom_deductions;
            total += Object.values(customDed).reduce((s, v) => s + (parseFloat(v) || 0), 0);
          } catch (e) {
            console.error('Error parsing custom_deductions in save:', e);
          }
        }
        return sum + total;
      }, 0);

      const allowanceTotal = snapshotData.allowances.reduce((sum, allow) => sum + (allow.allowance_amount || 0), 0);
      const paymentTotal = snapshotData.payments.reduce((sum, pay) => sum + (pay.payment_amount || 0), 0);
      const totalAmount = employeeTotal + allowanceTotal + paymentTotal;

      const result = await window.electron.indent.updateMonthlyPayout({
        payoutId: parseInt(id),
        payoutData: {
          month: payout.month,
          year: payout.year,
          total_amount: totalAmount,
          snapshot_data: JSON.stringify(snapshotData)
        }
      });

      if (result.success) {
        showNotification('Monthly payout updated successfully');
        setTimeout(() => navigate('/indent'), 1500);
      } else {
        showNotification('Failed to update monthly payout', 'error');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      showNotification('Failed to save changes', 'error');
    }
  };

  const handleCancel = () => {
    navigate('/indent');
  };

  const updateEmployeeField = (index, field, value) => {
    const newEmployees = [...snapshotData.employees];
    newEmployees[index] = { ...newEmployees[index], [field]: parseFloat(value) || 0 };
    setSnapshotData({ ...snapshotData, employees: newEmployees });
  };

  const updateAllowanceField = (index, field, value) => {
    const newAllowances = [...snapshotData.allowances];
    newAllowances[index] = { ...newAllowances[index], [field]: parseFloat(value) || 0 };
    setSnapshotData({ ...snapshotData, allowances: newAllowances });
  };

  const updatePaymentField = (index, field, value) => {
    const newPayments = [...snapshotData.payments];
    newPayments[index] = { ...newPayments[index], [field]: parseFloat(value) || 0 };
    setSnapshotData({ ...snapshotData, payments: newPayments });
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || '';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          pageTitle="Edit Monthly Payout"
          titleAlign="left"
          breadcrumbs={[
            {
              label: 'Home',
              icon: <HomeRegular />,
              onClick: () => navigate('/')
            },
            {
              label: 'Pastorate Accounts',
              onClick: () => navigate('/pastorate-accounts')
            },
            {
              label: 'Indent Book',
              onClick: () => navigate('/indent')
            },
            {
              label: 'Edit Monthly Payout',
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
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={`Edit Monthly Payout - ${payout ? `${getMonthName(payout.month)} ${payout.year}` : ''}`}
        titleAlign="left"
        breadcrumbs={[
          {
            label: 'Home',
            icon: <HomeRegular />,
            onClick: () => navigate('/')
          },
          {
            label: 'Pastorate Accounts',
            onClick: () => navigate('/pastorate-accounts')
          },
          {
            label: 'Indent Book',
            onClick: () => navigate('/indent')
          },
          {
            label: 'Edit Monthly Payout',
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
          <h1 className={styles.title}>
            {payout && `${getMonthName(payout.month)} ${payout.year}`}
          </h1>
          <div className={styles.buttonGroup}>
            <button className={styles.cancelButton} onClick={handleCancel}>
              <ArrowLeftRegular fontSize={18} />
              Cancel
            </button>
            <button className={styles.saveButton} onClick={handleSave}>
              <CheckmarkRegular fontSize={18} />
              Save Changes
            </button>
          </div>
        </div>

        {/* Employee Deductions */}
        {snapshotData.employees && snapshotData.employees.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Employee Deductions</h2>
            {snapshotData.employees.map((emp, index) => (
              <div key={emp.id || index}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#605e5c', marginBottom: '12px' }}>
                  {emp.name} - {emp.position}
                </h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Salary</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={emp.salary || 0}
                      onChange={(e) => updateEmployeeField(index, 'salary', e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>D.A</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={emp.da || 0}
                      onChange={(e) => updateEmployeeField(index, 'da', e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>DPF</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={emp.dpf || 0}
                      onChange={(e) => updateEmployeeField(index, 'dpf', e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>CPF</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={emp.cpf || 0}
                      onChange={(e) => updateEmployeeField(index, 'cpf', e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>DFBF</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={emp.dfbf || 0}
                      onChange={(e) => updateEmployeeField(index, 'dfbf', e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>CSWF</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={emp.cswf || 0}
                      onChange={(e) => updateEmployeeField(index, 'cswf', e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>DMAF</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={emp.dmaf || 0}
                      onChange={(e) => updateEmployeeField(index, 'dmaf', e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Sangam</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={emp.sangam || 0}
                      onChange={(e) => updateEmployeeField(index, 'sangam', e.target.value)}
                      step="0.01"
                    />
                  </div>
                </div>
                {index < snapshotData.employees.length - 1 && (
                  <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e1dfdd' }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Allowances */}
        {snapshotData.allowances && snapshotData.allowances.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Allowances</h2>
            <div className={styles.formGrid}>
              {snapshotData.allowances.map((allow, index) => (
                <div key={allow.id || index} className={styles.formGroup}>
                  <label className={styles.label}>
                    {allow.name} - {allow.allowance_name}
                  </label>
                  <input
                    type="number"
                    className={styles.input}
                    value={allow.allowance_amount || 0}
                    onChange={(e) => updateAllowanceField(index, 'allowance_amount', e.target.value)}
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payments */}
        {snapshotData.payments && snapshotData.payments.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Indent Payments</h2>
            <div className={styles.formGrid}>
              {snapshotData.payments.map((payment, index) => (
                <div key={payment.id || index} className={styles.formGroup}>
                  <label className={styles.label}>{payment.payment_name}</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={payment.payment_amount || 0}
                    onChange={(e) => updatePaymentField(index, 'payment_amount', e.target.value)}
                    step="0.01"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
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

      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${notification.type === 'success' ? styles.notificationSuccess : styles.notificationError}`}>
          {notification.type === 'success' ? <CheckmarkRegular fontSize={20} /> : <DismissRegular fontSize={20} />}
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default MonthlyPayoutEditPage;

