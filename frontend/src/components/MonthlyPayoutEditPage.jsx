import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  ArrowLeftRegular,
  CheckmarkRegular,
  DismissRegular,
  AddRegular,
  EditRegular,
  DeleteRegular,
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
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '16px',
  },
  th: {
    backgroundColor: '#f3f2f1',
    padding: '12px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
    borderBottom: '2px solid #e1dfdd',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#605e5c',
    borderBottom: '1px solid #e1dfdd',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  iconButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  addButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '16px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e1dfdd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#323130',
    margin: 0,
  },
  modalBody: {
    padding: '24px',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e1dfdd',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  modalButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modalButtonPrimary: {
    backgroundColor: '#B5316A',
    color: 'white',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
  },
  modalButtonSecondary: {
    backgroundColor: '#f3f2f1',
    color: '#323130',
    '&:hover': {
      backgroundColor: '#e1dfdd',
    },
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
    employeeSalaries: [],
    employeeAllowances: [],
    employeeDeductions: [],
    pastorateAllowances: [],
    payments: []
  });

  // Modal states for editing
  const [showPastorateAllowanceModal, setShowPastorateAllowanceModal] = useState(false);
  const [editingPastorateAllowance, setEditingPastorateAllowance] = useState(null);
  const [pastorateAllowanceForm, setPastorateAllowanceForm] = useState({
    name: '',
    position: '',
    date_of_birth: '',
    allowance_name: '',
    allowance_amount: 0
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_name: '',
    payment_amount: 0
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
      // Calculate new total from the new snapshot structure
      let employeeTotal = 0;

      // Calculate from employeeSalaries, employeeAllowances, and employeeDeductions
      if (snapshotData.employeeSalaries && snapshotData.employeeSalaries.length > 0) {
        // Sum salaries
        employeeTotal += snapshotData.employeeSalaries.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0);

        // Sum allowances (DA + custom allowances)
        if (snapshotData.employeeAllowances) {
          snapshotData.employeeAllowances.forEach(allow => {
            employeeTotal += parseFloat(allow.dearness_allowance) || 0;
            if (allow.custom_allowances) {
              try {
                const customAllow = typeof allow.custom_allowances === 'string'
                  ? JSON.parse(allow.custom_allowances)
                  : allow.custom_allowances;
                employeeTotal += Object.values(customAllow).reduce((s, v) => s + (parseFloat(v) || 0), 0);
              } catch (e) {
                console.error('Error parsing custom_allowances:', e);
              }
            }
          });
        }

        // Sum deductions
        if (snapshotData.employeeDeductions) {
          snapshotData.employeeDeductions.forEach(ded => {
            employeeTotal += (parseFloat(ded.sangam) || 0) + (parseFloat(ded.dpf) || 0) +
                           (parseFloat(ded.cpf) || 0) + (parseFloat(ded.dfbf) || 0) +
                           (parseFloat(ded.cswf) || 0) + (parseFloat(ded.dmaf) || 0);
            if (ded.custom_deductions) {
              try {
                const customDed = typeof ded.custom_deductions === 'string'
                  ? JSON.parse(ded.custom_deductions)
                  : ded.custom_deductions;
                employeeTotal += Object.values(customDed).reduce((s, v) => s + (parseFloat(v) || 0), 0);
              } catch (e) {
                console.error('Error parsing custom_deductions:', e);
              }
            }
          });
        }
      }

      const pastorateAllowanceTotal = (snapshotData.pastorateAllowances || []).reduce((sum, allow) => sum + (parseFloat(allow.allowance_amount) || 0), 0);
      const paymentTotal = (snapshotData.payments || []).reduce((sum, pay) => sum + (parseFloat(pay.payment_amount) || 0), 0);
      const totalAmount = employeeTotal + pastorateAllowanceTotal + paymentTotal;

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

  // Employee Salaries handlers
  const updateEmployeeSalaryField = (index, field, value) => {
    const newData = [...snapshotData.employeeSalaries];
    newData[index] = { ...newData[index], [field]: field === 'salary' ? (parseFloat(value) || 0) : value };
    setSnapshotData({ ...snapshotData, employeeSalaries: newData });
  };

  // Employee Allowances handlers
  const updateEmployeeAllowanceField = (index, field, value) => {
    const newData = [...snapshotData.employeeAllowances];
    if (field === 'dearness_allowance' || field === 'total_allowance') {
      newData[index] = { ...newData[index], [field]: parseFloat(value) || 0 };
    } else {
      newData[index] = { ...newData[index], [field]: value };
    }
    setSnapshotData({ ...snapshotData, employeeAllowances: newData });
  };

  // Employee Deductions handlers
  const updateEmployeeDeductionField = (index, field, value) => {
    const newData = [...snapshotData.employeeDeductions];
    const numericFields = ['sangam', 'dpf', 'cpf', 'dfbf', 'cswf', 'dmaf', 'total_deduction'];
    if (numericFields.includes(field)) {
      newData[index] = { ...newData[index], [field]: parseFloat(value) || 0 };
    } else {
      newData[index] = { ...newData[index], [field]: value };
    }
    setSnapshotData({ ...snapshotData, employeeDeductions: newData });
  };

  // Pastorate Allowances handlers
  const handleAddPastorateAllowance = () => {
    setEditingPastorateAllowance(null);
    setPastorateAllowanceForm({
      name: '',
      position: '',
      date_of_birth: '',
      allowance_name: '',
      allowance_amount: 0
    });
    setShowPastorateAllowanceModal(true);
  };

  const handleEditPastorateAllowance = (allowance, index) => {
    setEditingPastorateAllowance(index);
    setPastorateAllowanceForm({
      name: allowance.name || '',
      position: allowance.position || '',
      date_of_birth: allowance.date_of_birth || '',
      allowance_name: allowance.allowance_name || '',
      allowance_amount: allowance.allowance_amount || 0
    });
    setShowPastorateAllowanceModal(true);
  };

  const handleSavePastorateAllowance = () => {
    const newAllowances = [...(snapshotData.pastorateAllowances || [])];
    if (editingPastorateAllowance !== null) {
      // Edit existing
      newAllowances[editingPastorateAllowance] = {
        ...newAllowances[editingPastorateAllowance],
        ...pastorateAllowanceForm
      };
    } else {
      // Add new
      newAllowances.push({
        id: Date.now(), // Temporary ID
        ...pastorateAllowanceForm
      });
    }
    setSnapshotData({ ...snapshotData, pastorateAllowances: newAllowances });
    setShowPastorateAllowanceModal(false);
  };

  const handleDeletePastorateAllowance = (index) => {
    const newAllowances = snapshotData.pastorateAllowances.filter((_, i) => i !== index);
    setSnapshotData({ ...snapshotData, pastorateAllowances: newAllowances });
  };

  // Payments handlers
  const handleAddPayment = () => {
    setEditingPayment(null);
    setPaymentForm({
      payment_name: '',
      payment_amount: 0
    });
    setShowPaymentModal(true);
  };

  const handleEditPayment = (payment, index) => {
    setEditingPayment(index);
    setPaymentForm({
      payment_name: payment.payment_name || '',
      payment_amount: payment.payment_amount || 0
    });
    setShowPaymentModal(true);
  };

  const handleSavePayment = () => {
    const newPayments = [...(snapshotData.payments || [])];
    if (editingPayment !== null) {
      // Edit existing
      newPayments[editingPayment] = {
        ...newPayments[editingPayment],
        ...paymentForm
      };
    } else {
      // Add new
      newPayments.push({
        id: Date.now(), // Temporary ID
        ...paymentForm
      });
    }
    setSnapshotData({ ...snapshotData, payments: newPayments });
    setShowPaymentModal(false);
  };

  const handleDeletePayment = (index) => {
    const newPayments = snapshotData.payments.filter((_, i) => i !== index);
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

        {/* Employee Salaries */}
        {snapshotData.employeeSalaries && snapshotData.employeeSalaries.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Employee Salaries</h2>
            {snapshotData.employeeSalaries.map((emp, index) => (
              <div key={emp.id || index}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#605e5c', marginBottom: '12px' }}>
                  {emp.name} - {emp.position}
                </h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Name</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={emp.name || ''}
                      onChange={(e) => updateEmployeeSalaryField(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Position</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={emp.position || ''}
                      onChange={(e) => updateEmployeeSalaryField(index, 'position', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Date of Birth</label>
                    <input
                      type="date"
                      className={styles.input}
                      value={emp.date_of_birth || ''}
                      onChange={(e) => updateEmployeeSalaryField(index, 'date_of_birth', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Salary</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={emp.salary || 0}
                      onChange={(e) => updateEmployeeSalaryField(index, 'salary', e.target.value)}
                      step="0.01"
                    />
                  </div>
                </div>
                {index < snapshotData.employeeSalaries.length - 1 && (
                  <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e1dfdd' }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Employee Allowances */}
        {snapshotData.employeeAllowances && snapshotData.employeeAllowances.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Employee Allowances</h2>
            {snapshotData.employeeAllowances.map((allow, index) => (
              <div key={allow.id || index}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#605e5c', marginBottom: '12px' }}>
                  {allow.name} - {allow.position}
                </h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Dearness Allowance (DA)</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={allow.dearness_allowance || 0}
                      onChange={(e) => updateEmployeeAllowanceField(index, 'dearness_allowance', e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Custom Allowances (JSON)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={typeof allow.custom_allowances === 'string' ? allow.custom_allowances : JSON.stringify(allow.custom_allowances || {})}
                      onChange={(e) => updateEmployeeAllowanceField(index, 'custom_allowances', e.target.value)}
                      placeholder='{"HRA": 1000, "Transport": 500}'
                    />
                  </div>
                </div>
                {index < snapshotData.employeeAllowances.length - 1 && (
                  <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e1dfdd' }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Employee Deductions */}
        {snapshotData.employeeDeductions && snapshotData.employeeDeductions.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>Employee Deductions</h2>
            {snapshotData.employeeDeductions.map((ded, index) => (
              <div key={ded.id || index}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#605e5c', marginBottom: '12px' }}>
                  {ded.name} - {ded.position}
                </h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Sangam</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={ded.sangam || 0}
                      onChange={(e) => updateEmployeeDeductionField(index, 'sangam', e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>DPF</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={ded.dpf || 0}
                      onChange={(e) => updateEmployeeDeductionField(index, 'dpf', e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>CPF</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={ded.cpf || 0}
                      onChange={(e) => updateEmployeeDeductionField(index, 'cpf', e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>DFBF</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={ded.dfbf || 0}
                      onChange={(e) => updateEmployeeDeductionField(index, 'dfbf', e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>CSWF</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={ded.cswf || 0}
                      onChange={(e) => updateEmployeeDeductionField(index, 'cswf', e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>DMAF</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={ded.dmaf || 0}
                      onChange={(e) => updateEmployeeDeductionField(index, 'dmaf', e.target.value)}
                      step="0.01"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Custom Deductions (JSON)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={typeof ded.custom_deductions === 'string' ? ded.custom_deductions : JSON.stringify(ded.custom_deductions || {})}
                      onChange={(e) => updateEmployeeDeductionField(index, 'custom_deductions', e.target.value)}
                      placeholder='{"Loan": 500}'
                    />
                  </div>
                </div>
                {index < snapshotData.employeeDeductions.length - 1 && (
                  <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e1dfdd' }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pastorate Workers Allowances */}
        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Pastorate Workers Allowances</h2>
            <button className={styles.addButton} onClick={handleAddPastorateAllowance}>
              <AddRegular fontSize={16} />
              Add Allowance
            </button>
          </div>
          {snapshotData.pastorateAllowances && snapshotData.pastorateAllowances.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Position</th>
                  <th className={styles.th}>Date of Birth</th>
                  <th className={styles.th}>Allowance Name</th>
                  <th className={styles.th}>Amount</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {snapshotData.pastorateAllowances.map((allow, index) => (
                  <tr key={allow.id || index}>
                    <td className={styles.td}>{allow.name}</td>
                    <td className={styles.td}>{allow.position}</td>
                    <td className={styles.td}>{allow.date_of_birth || 'N/A'}</td>
                    <td className={styles.td}>{allow.allowance_name}</td>
                    <td className={styles.td}>₹{parseFloat(allow.allowance_amount || 0).toFixed(2)}</td>
                    <td className={styles.td}>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.iconButton}
                          onClick={() => handleEditPastorateAllowance(allow, index)}
                          title="Edit"
                        >
                          <EditRegular fontSize={18} style={{ color: '#B5316A' }} />
                        </button>
                        <button
                          className={styles.iconButton}
                          onClick={() => handleDeletePastorateAllowance(index)}
                          title="Delete"
                        >
                          <DeleteRegular fontSize={18} style={{ color: '#D13438' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#605e5c', fontSize: '14px', marginTop: '16px' }}>
              No pastorate allowances in this snapshot. Click "Add Allowance" to add one.
            </p>
          )}
        </div>

        {/* Indent Payments */}
        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Indent Payments</h2>
            <button className={styles.addButton} onClick={handleAddPayment}>
              <AddRegular fontSize={16} />
              Add Payment
            </button>
          </div>
          {snapshotData.payments && snapshotData.payments.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Payment Name</th>
                  <th className={styles.th}>Amount</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {snapshotData.payments.map((payment, index) => (
                  <tr key={payment.id || index}>
                    <td className={styles.td}>{payment.payment_name}</td>
                    <td className={styles.td}>₹{parseFloat(payment.payment_amount || 0).toFixed(2)}</td>
                    <td className={styles.td}>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.iconButton}
                          onClick={() => handleEditPayment(payment, index)}
                          title="Edit"
                        >
                          <EditRegular fontSize={18} style={{ color: '#B5316A' }} />
                        </button>
                        <button
                          className={styles.iconButton}
                          onClick={() => handleDeletePayment(index)}
                          title="Delete"
                        >
                          <DeleteRegular fontSize={18} style={{ color: '#D13438' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#605e5c', fontSize: '14px', marginTop: '16px' }}>
              No payments in this snapshot. Click "Add Payment" to add one.
            </p>
          )}
        </div>
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

      {/* Pastorate Allowance Modal */}
      {showPastorateAllowanceModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPastorateAllowanceModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingPastorateAllowance !== null ? 'Edit Pastorate Allowance' : 'Add Pastorate Allowance'}
              </h2>
              <button
                className={styles.iconButton}
                onClick={() => setShowPastorateAllowanceModal(false)}
              >
                <DismissRegular fontSize={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={pastorateAllowanceForm.name}
                  onChange={(e) => setPastorateAllowanceForm({ ...pastorateAllowanceForm, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Position</label>
                <input
                  type="text"
                  className={styles.input}
                  value={pastorateAllowanceForm.position}
                  onChange={(e) => setPastorateAllowanceForm({ ...pastorateAllowanceForm, position: e.target.value })}
                  placeholder="Enter position"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  className={styles.input}
                  value={pastorateAllowanceForm.date_of_birth}
                  onChange={(e) => setPastorateAllowanceForm({ ...pastorateAllowanceForm, date_of_birth: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Allowance Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={pastorateAllowanceForm.allowance_name}
                  onChange={(e) => setPastorateAllowanceForm({ ...pastorateAllowanceForm, allowance_name: e.target.value })}
                  placeholder="e.g., Wife Allowance, Sexton Allowance"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Allowance Amount</label>
                <input
                  type="number"
                  className={styles.input}
                  value={pastorateAllowanceForm.allowance_amount}
                  onChange={(e) => setPastorateAllowanceForm({ ...pastorateAllowanceForm, allowance_amount: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.modalButton} ${styles.modalButtonSecondary}`}
                onClick={() => setShowPastorateAllowanceModal(false)}
              >
                Cancel
              </button>
              <button
                className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
                onClick={handleSavePastorateAllowance}
              >
                {editingPastorateAllowance !== null ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingPayment !== null ? 'Edit Payment' : 'Add Payment'}
              </h2>
              <button
                className={styles.iconButton}
                onClick={() => setShowPaymentModal(false)}
              >
                <DismissRegular fontSize={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Payment Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={paymentForm.payment_name}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_name: e.target.value })}
                  placeholder="e.g., Pastorate Assessment, Electricity Bill"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Payment Amount</label>
                <input
                  type="number"
                  className={styles.input}
                  value={paymentForm.payment_amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_amount: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={`${styles.modalButton} ${styles.modalButtonSecondary}`}
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
              <button
                className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
                onClick={handleSavePayment}
              >
                {editingPayment !== null ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyPayoutEditPage;

