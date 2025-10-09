import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  AddRegular,
  EditRegular,
  DeleteRegular,
  PersonRegular,
  DismissRegular,
  CheckmarkRegular,
  SettingsRegular,
  MoneyRegular,
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
  twoColumnLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  tableSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#323130',
    margin: 0,
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
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
    minHeight: '400px',
    maxHeight: '600px',
  },
  tableWrapper: {
    flex: 1,
    overflowX: 'auto',
    overflowY: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
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
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#605e5c',
  },
  modal: {
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
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e1dfdd',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#323130',
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
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
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #d1d1d1',
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      borderColor: '#B5316A',
    },
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #e1dfdd',
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
    '&:hover': {
      backgroundColor: '#e1dfdd',
    },
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
    '&:hover': {
      backgroundColor: '#A12B5E',
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
  confirmDialog: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
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
  },
  confirmButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  deleteButton: {
    backgroundColor: '#D13438',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#A80000',
    },
  },
});

const IndentPage = ({
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

  // Employee Deductions state
  const [employees, setEmployees] = useState([]);
  const [deductionFields, setDeductionFields] = useState([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showDeductionFieldsModal, setShowDeductionFieldsModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newDeductionFieldName, setNewDeductionFieldName] = useState('');

  // Allowances state
  const [allowances, setAllowances] = useState([]);
  const [allowanceFields, setAllowanceFields] = useState([]);
  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const [showAllowanceFieldsModal, setShowAllowanceFieldsModal] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState(null);
  const [newAllowanceFieldName, setNewAllowanceFieldName] = useState('');

  // Common state
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Employee form state
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    position: '',
    date_of_birth: '',
    salary: 0,
    da: 0,
    dpf: 0,
    cpf: 0,
    dfbf: 0,
    cswf: 0,
    dmaf: 0,
    sangam: 0,
    custom_deductions: {}
  });

  // Allowance form state
  const [allowanceForm, setAllowanceForm] = useState({
    name: '',
    position: '',
    date_of_birth: '',
    allowance_name: '',
    allowance_amount: 0
  });

  // Load data on mount
  useEffect(() => {
    if (currentPastorate && user) {
      loadAllData();
    }
  }, [currentPastorate?.id, user?.id]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadEmployees(),
      loadDeductionFields(),
      loadAllowances(),
      loadAllowanceFields()
    ]);
    setLoading(false);
  };

  // Load functions
  const loadEmployees = async () => {
    try {
      const result = await window.electron.indent.getEmployees({
        pastorateId: currentPastorate.id,
        filters: {}
      });
      if (result.success) {
        setEmployees(result.employees || []);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadDeductionFields = async () => {
    try {
      const result = await window.electron.indent.getDeductionFields({
        pastorateId: currentPastorate.id
      });
      if (result.success) {
        setDeductionFields(result.fields || []);
      }
    } catch (error) {
      console.error('Failed to load deduction fields:', error);
    }
  };

  const loadAllowances = async () => {
    try {
      const result = await window.electron.indent.getAllowances({
        pastorateId: currentPastorate.id,
        filters: {}
      });
      if (result.success) {
        setAllowances(result.allowances || []);
      }
    } catch (error) {
      console.error('Failed to load allowances:', error);
    }
  };

  const loadAllowanceFields = async () => {
    try {
      const result = await window.electron.indent.getAllowanceFields({
        pastorateId: currentPastorate.id
      });
      if (result.success) {
        setAllowanceFields(result.fields || []);
      }
    } catch (error) {
      console.error('Failed to load allowance fields:', error);
    }
  };

  // Utility functions
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmDialog({ title, message, onConfirm });
  };

  const hideConfirm = () => {
    setConfirmDialog(null);
  };

  // Employee handlers
  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setEmployeeForm({
      name: '',
      position: '',
      date_of_birth: '',
      salary: 0,
      da: 0,
      dpf: 0,
      cpf: 0,
      dfbf: 0,
      cswf: 0,
      dmaf: 0,
      sangam: 0,
      custom_deductions: {}
    });
    setShowEmployeeModal(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      name: employee.name,
      position: employee.position,
      date_of_birth: employee.date_of_birth || '',
      salary: employee.salary,
      da: employee.da,
      dpf: employee.dpf,
      cpf: employee.cpf,
      dfbf: employee.dfbf,
      cswf: employee.cswf,
      dmaf: employee.dmaf,
      sangam: employee.sangam,
      custom_deductions: employee.custom_deductions ? JSON.parse(employee.custom_deductions) : {}
    });
    setShowEmployeeModal(true);
  };

  const handleSaveEmployee = async () => {
    if (!employeeForm.name || !employeeForm.position) {
      showNotification('Please fill in required fields', 'error');
      return;
    }

    try {
      if (editingEmployee) {
        const result = await window.electron.indent.updateEmployee({
          employeeId: editingEmployee.id,
          employeeData: employeeForm
        });
        if (result.success) {
          showNotification('Employee updated successfully');
          loadEmployees();
          setShowEmployeeModal(false);
        } else {
          showNotification('Failed to update employee', 'error');
        }
      } else {
        const result = await window.electron.indent.createEmployee({
          pastorateId: currentPastorate.id,
          userId: user.id,
          employeeData: employeeForm
        });
        if (result.success) {
          showNotification('Employee added successfully');
          loadEmployees();
          setShowEmployeeModal(false);
        } else {
          showNotification('Failed to add employee', 'error');
        }
      }
    } catch (error) {
      console.error('Failed to save employee:', error);
      showNotification('Failed to save employee', 'error');
    }
  };

  const handleDeleteEmployee = (employeeId) => {
    showConfirm(
      'Delete Employee',
      'Are you sure you want to delete this employee? This action cannot be undone.',
      async () => {
        try {
          const result = await window.electron.indent.deleteEmployee({ employeeId });
          if (result.success) {
            showNotification('Employee deleted successfully');
            loadEmployees();
          } else {
            showNotification('Failed to delete employee', 'error');
          }
        } catch (error) {
          console.error('Failed to delete employee:', error);
          showNotification('Failed to delete employee', 'error');
        }
        hideConfirm();
      }
    );
  };

  // Deduction field handlers
  const handleAddDeductionField = async () => {
    if (!newDeductionFieldName.trim()) return;

    try {
      const result = await window.electron.indent.createDeductionField({
        pastorateId: currentPastorate.id,
        fieldData: { field_name: newDeductionFieldName.trim() }
      });
      if (result.success) {
        showNotification('Deduction field added successfully');
        loadDeductionFields();
        setNewDeductionFieldName('');
      } else {
        showNotification('Failed to add deduction field', 'error');
      }
    } catch (error) {
      console.error('Failed to add deduction field:', error);
      showNotification('Failed to add deduction field', 'error');
    }
  };

  const handleDeleteDeductionField = (fieldId) => {
    showConfirm(
      'Delete Deduction Field',
      'Are you sure you want to delete this field? This action cannot be undone.',
      async () => {
        try {
          const result = await window.electron.indent.deleteDeductionField({ fieldId });
          if (result.success) {
            showNotification('Deduction field deleted successfully');
            loadDeductionFields();
          } else {
            showNotification('Failed to delete deduction field', 'error');
          }
        } catch (error) {
          console.error('Failed to delete deduction field:', error);
          showNotification('Failed to delete deduction field', 'error');
        }
        hideConfirm();
      }
    );
  };

  // Allowance handlers
  const handleAddAllowance = () => {
    setEditingAllowance(null);
    setAllowanceForm({
      name: '',
      position: '',
      date_of_birth: '',
      allowance_name: '',
      allowance_amount: 0
    });
    setShowAllowanceModal(true);
  };

  const handleEditAllowance = (allowance) => {
    setEditingAllowance(allowance);
    setAllowanceForm({
      name: allowance.name,
      position: allowance.position,
      date_of_birth: allowance.date_of_birth || '',
      allowance_name: allowance.allowance_name,
      allowance_amount: allowance.allowance_amount
    });
    setShowAllowanceModal(true);
  };

  const handleSaveAllowance = async () => {
    if (!allowanceForm.name || !allowanceForm.position || !allowanceForm.allowance_name) {
      showNotification('Please fill in required fields', 'error');
      return;
    }

    try {
      if (editingAllowance) {
        const result = await window.electron.indent.updateAllowance({
          allowanceId: editingAllowance.id,
          allowanceData: allowanceForm
        });
        if (result.success) {
          showNotification('Allowance updated successfully');
          loadAllowances();
          setShowAllowanceModal(false);
        } else {
          showNotification('Failed to update allowance', 'error');
        }
      } else {
        const result = await window.electron.indent.createAllowance({
          pastorateId: currentPastorate.id,
          userId: user.id,
          allowanceData: allowanceForm
        });
        if (result.success) {
          showNotification('Allowance added successfully');
          loadAllowances();
          setShowAllowanceModal(false);
        } else {
          showNotification('Failed to add allowance', 'error');
        }
      }
    } catch (error) {
      console.error('Failed to save allowance:', error);
      showNotification('Failed to save allowance', 'error');
    }
  };

  const handleDeleteAllowance = (allowanceId) => {
    showConfirm(
      'Delete Allowance',
      'Are you sure you want to delete this allowance? This action cannot be undone.',
      async () => {
        try {
          const result = await window.electron.indent.deleteAllowance({ allowanceId });
          if (result.success) {
            showNotification('Allowance deleted successfully');
            loadAllowances();
          } else {
            showNotification('Failed to delete allowance', 'error');
          }
        } catch (error) {
          console.error('Failed to delete allowance:', error);
          showNotification('Failed to delete allowance', 'error');
        }
        hideConfirm();
      }
    );
  };

  // Allowance field handlers
  const handleAddAllowanceField = async () => {
    if (!newAllowanceFieldName.trim()) return;

    try {
      const result = await window.electron.indent.createAllowanceField({
        pastorateId: currentPastorate.id,
        fieldData: { field_name: newAllowanceFieldName.trim() }
      });
      if (result.success) {
        showNotification('Allowance field added successfully');
        loadAllowanceFields();
        setNewAllowanceFieldName('');
      } else {
        showNotification('Failed to add allowance field', 'error');
      }
    } catch (error) {
      console.error('Failed to add allowance field:', error);
      showNotification('Failed to add allowance field', 'error');
    }
  };

  const handleDeleteAllowanceField = (fieldId) => {
    showConfirm(
      'Delete Allowance Field',
      'Are you sure you want to delete this field? This action cannot be undone.',
      async () => {
        try {
          const result = await window.electron.indent.deleteAllowanceField({ fieldId });
          if (result.success) {
            showNotification('Allowance field deleted successfully');
            loadAllowanceFields();
          } else {
            showNotification('Failed to delete allowance field', 'error');
          }
        } catch (error) {
          console.error('Failed to delete allowance field:', error);
          showNotification('Failed to delete allowance field', 'error');
        }
        hideConfirm();
      }
    );
  };

  // Format functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Breadcrumb
  const breadcrumbItems = [
    { label: 'Home', icon: <HomeRegular />, onClick: () => navigate('/') },
    { label: 'Pastorate Accounts', onClick: () => navigate('/pastorate-accounts') },
    { label: 'Indent Book' }
  ];

  return (
    <div className={styles.container}>
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

      <div className={styles.content}>
        <Breadcrumb items={breadcrumbItems} />

        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#323130', margin: 0 }}>
          Indent Book - Employee Salary & Deductions
        </h1>

        {/* Two-column layout */}
        <div className={styles.twoColumnLayout}>
          {/* Left: Employee Deductions Table */}
          <div className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Employee Deductions</h2>
              <div className={styles.buttonGroup}>
                <button className={styles.addButton} onClick={() => setShowDeductionFieldsModal(true)}>
                  <SettingsRegular fontSize={18} />
                  Add Fields
                </button>
                <button className={styles.addButton} onClick={handleAddEmployee}>
                  <AddRegular fontSize={18} />
                  Add Entry
                </button>
              </div>
            </div>

            {/* Employee table - simplified to show only Name, Position, Actions */}
            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Position</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3" className={styles.emptyState}>
                          Loading...
                        </td>
                      </tr>
                    ) : employees.length === 0 ? (
                      <tr>
                        <td colSpan="3" className={styles.emptyState}>
                          <PersonRegular fontSize={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                          <p>No employees found. Click "Add Entry" to add your first employee.</p>
                        </td>
                      </tr>
                    ) : (
                      employees.map((employee) => (
                        <tr key={employee.id}>
                          <td className={styles.td}>{employee.name}</td>
                          <td className={styles.td}>{employee.position}</td>
                          <td className={styles.td}>
                            <div className={styles.actionButtons}>
                              <button
                                className={styles.iconButton}
                                onClick={() => handleEditEmployee(employee)}
                                title="Edit"
                              >
                                <EditRegular fontSize={18} style={{ color: '#B5316A' }} />
                              </button>
                              <button
                                className={styles.iconButton}
                                onClick={() => handleDeleteEmployee(employee.id)}
                                title="Delete"
                              >
                                <DeleteRegular fontSize={18} style={{ color: '#D13438' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Allowance Table - will be added in next step */}
          <div className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Allowance Table</h2>
              <div className={styles.buttonGroup}>
                <button className={styles.addButton} onClick={() => setShowAllowanceFieldsModal(true)}>
                  <SettingsRegular fontSize={18} />
                  Add Fields
                </button>
                <button className={styles.addButton} onClick={handleAddAllowance}>
                  <AddRegular fontSize={18} />
                  Add Entry
                </button>
              </div>
            </div>

            {/* Allowance table */}
            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Position</th>
                      <th className={styles.th}>Allowance Name</th>
                      <th className={styles.th}>Amount</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className={styles.emptyState}>
                          Loading...
                        </td>
                      </tr>
                    ) : allowances.length === 0 ? (
                      <tr>
                        <td colSpan="5" className={styles.emptyState}>
                          <MoneyRegular fontSize={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                          <p>No allowances found. Click "Add Entry" to add your first allowance.</p>
                        </td>
                      </tr>
                    ) : (
                      allowances.map((allowance) => (
                        <tr key={allowance.id}>
                          <td className={styles.td}>{allowance.name}</td>
                          <td className={styles.td}>{allowance.position}</td>
                          <td className={styles.td}>{allowance.allowance_name}</td>
                          <td className={styles.td}>{formatCurrency(allowance.allowance_amount)}</td>
                          <td className={styles.td}>
                            <div className={styles.actionButtons}>
                              <button
                                className={styles.iconButton}
                                onClick={() => handleEditAllowance(allowance)}
                                title="Edit"
                              >
                                <EditRegular fontSize={18} style={{ color: '#B5316A' }} />
                              </button>
                              <button
                                className={styles.iconButton}
                                onClick={() => handleDeleteAllowance(allowance.id)}
                                title="Delete"
                              >
                                <DeleteRegular fontSize={18} style={{ color: '#D13438' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Modal */}
      {showEmployeeModal && (
        <div className={styles.modal} onClick={() => setShowEmployeeModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button className={styles.closeButton} onClick={() => setShowEmployeeModal(false)}>
                <DismissRegular fontSize={20} />
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Name *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={employeeForm.name}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  placeholder="Enter employee name"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Position *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={employeeForm.position}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
                  placeholder="Enter position"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  className={styles.input}
                  value={employeeForm.date_of_birth}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, date_of_birth: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Salary</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeForm.salary}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, salary: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>D.A (Dearness Allowance)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeForm.da}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, da: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>DPF</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeForm.dpf}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, dpf: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>CPF</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeForm.cpf}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, cpf: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>DFBF</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeForm.dfbf}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, dfbf: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>CSWF</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeForm.cswf}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, cswf: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>DMAF</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeForm.dmaf}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, dmaf: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Sangam</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeForm.sangam}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, sangam: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              {/* Custom deduction fields */}
              {deductionFields.map((field) => (
                <div key={field.id} className={styles.formGroup}>
                  <label className={styles.label}>{field.field_name}</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={employeeForm.custom_deductions[field.field_name] || 0}
                    onChange={(e) => setEmployeeForm({
                      ...employeeForm,
                      custom_deductions: {
                        ...employeeForm.custom_deductions,
                        [field.field_name]: parseFloat(e.target.value) || 0
                      }
                    })}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowEmployeeModal(false)}>
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSaveEmployee}>
                {editingEmployee ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deduction Fields Modal */}
      {showDeductionFieldsModal && (
        <div className={styles.modal} onClick={() => setShowDeductionFieldsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Manage Deduction Fields</h2>
              <button className={styles.closeButton} onClick={() => setShowDeductionFieldsModal(false)}>
                <DismissRegular fontSize={20} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: '#605e5c', marginBottom: '16px' }}>
                Add custom deduction fields that will appear in the employee form.
              </p>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input
                  type="text"
                  className={styles.input}
                  value={newDeductionFieldName}
                  onChange={(e) => setNewDeductionFieldName(e.target.value)}
                  placeholder="Enter field name (e.g., EPF, Insurance)"
                  style={{ flex: 1 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddDeductionField();
                    }
                  }}
                />
                <button className={styles.addButton} onClick={handleAddDeductionField}>
                  <AddRegular fontSize={18} />
                  Add
                </button>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#323130' }}>
                  Current Fields
                </h3>
                {deductionFields.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#605e5c', fontStyle: 'italic' }}>
                    No custom fields added yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {deductionFields.map((field) => (
                      <div
                        key={field.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          backgroundColor: '#f8f8f8',
                          borderRadius: '6px',
                          border: '1px solid #e1dfdd'
                        }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#323130' }}>
                          {field.field_name}
                        </span>
                        <button
                          className={styles.iconButton}
                          onClick={() => handleDeleteDeductionField(field.id)}
                          title="Delete field"
                        >
                          <DeleteRegular fontSize={18} style={{ color: '#D13438' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowDeductionFieldsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Allowance Modal */}
      {showAllowanceModal && (
        <div className={styles.modal} onClick={() => setShowAllowanceModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingAllowance ? 'Edit Allowance' : 'Add New Allowance'}
              </h2>
              <button className={styles.closeButton} onClick={() => setShowAllowanceModal(false)}>
                <DismissRegular fontSize={20} />
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Name *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={allowanceForm.name}
                  onChange={(e) => setAllowanceForm({ ...allowanceForm, name: e.target.value })}
                  placeholder="Enter employee name"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Position *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={allowanceForm.position}
                  onChange={(e) => setAllowanceForm({ ...allowanceForm, position: e.target.value })}
                  placeholder="Enter position"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  className={styles.input}
                  value={allowanceForm.date_of_birth}
                  onChange={(e) => setAllowanceForm({ ...allowanceForm, date_of_birth: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Allowance Name *</label>
                {allowanceFields.length > 0 ? (
                  <select
                    className={styles.select}
                    value={allowanceForm.allowance_name}
                    onChange={(e) => setAllowanceForm({ ...allowanceForm, allowance_name: e.target.value })}
                  >
                    <option value="">Select allowance type</option>
                    {allowanceFields.map((field) => (
                      <option key={field.id} value={field.field_name}>
                        {field.field_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className={styles.input}
                    value={allowanceForm.allowance_name}
                    onChange={(e) => setAllowanceForm({ ...allowanceForm, allowance_name: e.target.value })}
                    placeholder="Enter allowance name"
                  />
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Allowance Amount *</label>
                <input
                  type="number"
                  className={styles.input}
                  value={allowanceForm.allowance_amount}
                  onChange={(e) => setAllowanceForm({ ...allowanceForm, allowance_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowAllowanceModal(false)}>
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSaveAllowance}>
                {editingAllowance ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Allowance Fields Modal */}
      {showAllowanceFieldsModal && (
        <div className={styles.modal} onClick={() => setShowAllowanceFieldsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Manage Allowance Fields</h2>
              <button className={styles.closeButton} onClick={() => setShowAllowanceFieldsModal(false)}>
                <DismissRegular fontSize={20} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: '#605e5c', marginBottom: '16px' }}>
                Add custom allowance types that will appear in the allowance form.
              </p>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input
                  type="text"
                  className={styles.input}
                  value={newAllowanceFieldName}
                  onChange={(e) => setNewAllowanceFieldName(e.target.value)}
                  placeholder="Enter allowance type (e.g., HRA, Travel Allowance)"
                  style={{ flex: 1 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddAllowanceField();
                    }
                  }}
                />
                <button className={styles.addButton} onClick={handleAddAllowanceField}>
                  <AddRegular fontSize={18} />
                  Add
                </button>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#323130' }}>
                  Current Allowance Types
                </h3>
                {allowanceFields.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#605e5c', fontStyle: 'italic' }}>
                    No custom allowance types added yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {allowanceFields.map((field) => (
                      <div
                        key={field.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          backgroundColor: '#f8f8f8',
                          borderRadius: '6px',
                          border: '1px solid #e1dfdd'
                        }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#323130' }}>
                          {field.field_name}
                        </span>
                        <button
                          className={styles.iconButton}
                          onClick={() => handleDeleteAllowanceField(field.id)}
                          title="Delete field"
                        >
                          <DeleteRegular fontSize={18} style={{ color: '#D13438' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowAllowanceFieldsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className={styles.modal}>
          <div className={styles.confirmDialog}>
            <h3 className={styles.confirmTitle}>{confirmDialog.title}</h3>
            <p className={styles.confirmMessage}>{confirmDialog.message}</p>
            <div className={styles.confirmButtons}>
              <button className={styles.cancelButton} onClick={hideConfirm}>
                Cancel
              </button>
              <button className={styles.deleteButton} onClick={confirmDialog.onConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

export default IndentPage;
