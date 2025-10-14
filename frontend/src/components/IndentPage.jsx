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

  // NEW: Employee Salary state (replaces old employees state)
  const [employeeSalaries, setEmployeeSalaries] = useState([]);
  const [showEmployeeSalaryModal, setShowEmployeeSalaryModal] = useState(false);
  const [editingEmployeeSalary, setEditingEmployeeSalary] = useState(null);

  // NEW: Employee Allowances state
  const [employeeAllowances, setEmployeeAllowances] = useState([]);
  const [employeeAllowanceFields, setEmployeeAllowanceFields] = useState([]);
  const [showEmployeeAllowanceModal, setShowEmployeeAllowanceModal] = useState(false);
  const [showEmployeeAllowanceFieldsModal, setShowEmployeeAllowanceFieldsModal] = useState(false);
  const [editingEmployeeAllowance, setEditingEmployeeAllowance] = useState(null);
  const [newEmployeeAllowanceFieldName, setNewEmployeeAllowanceFieldName] = useState('');

  // NEW: Employee Deductions state
  const [employeeDeductions, setEmployeeDeductions] = useState([]);
  const [employeeDeductionFields, setEmployeeDeductionFields] = useState([]);
  const [showEmployeeDeductionModal, setShowEmployeeDeductionModal] = useState(false);
  const [showEmployeeDeductionFieldsModal, setShowEmployeeDeductionFieldsModal] = useState(false);
  const [editingEmployeeDeduction, setEditingEmployeeDeduction] = useState(null);
  const [newEmployeeDeductionFieldName, setNewEmployeeDeductionFieldName] = useState('');

  // OLD: Pastorate Workers Allowances state (keep as is - different from employee allowances)
  const [allowances, setAllowances] = useState([]);
  const [allowanceFields, setAllowanceFields] = useState([]);
  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const [showAllowanceFieldsModal, setShowAllowanceFieldsModal] = useState(false);
  const [editingAllowance, setEditingAllowance] = useState(null);
  const [newAllowanceFieldName, setNewAllowanceFieldName] = useState('');

  // Payments state
  const [payments, setPayments] = useState([]);
  const [paymentFields, setPaymentFields] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentFieldsModal, setShowPaymentFieldsModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [newPaymentFieldName, setNewPaymentFieldName] = useState('');

  // Monthly Payouts state
  const [monthlyPayouts, setMonthlyPayouts] = useState([]);
  const [showMonthlyPayoutModal, setShowMonthlyPayoutModal] = useState(false);
  const [editingMonthlyPayout, setEditingMonthlyPayout] = useState(null);

  // Common state
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // NEW: Employee Salary form state (only basic info + salary)
  const [employeeSalaryForm, setEmployeeSalaryForm] = useState({
    name: '',
    position: '',
    date_of_birth: '',
    salary: 0
  });

  // NEW: Employee Allowance form state
  const [employeeAllowanceForm, setEmployeeAllowanceForm] = useState({
    employee_id: '',
    dearness_allowance: 0,
    custom_allowances: {},
    total_allowance: 0
  });

  // NEW: Employee Deduction form state
  const [employeeDeductionForm, setEmployeeDeductionForm] = useState({
    employee_id: '',
    sangam: 0,
    dpf: 0,
    cpf: 0,
    dfbf: 0,
    cswf: 0,
    dmaf: 0,
    custom_deductions: {},
    total_deduction: 0
  });

  // OLD: Allowance form state (for pastorate workers)
  const [allowanceForm, setAllowanceForm] = useState({
    name: '',
    position: '',
    date_of_birth: '',
    allowance_name: '',
    allowance_amount: 0
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    payment_name: '',
    payment_amount: 0
  });

  // Monthly payout form state
  const [monthlyPayoutForm, setMonthlyPayoutForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
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
      loadEmployeeSalaries(),
      loadEmployeeAllowances(),
      loadEmployeeAllowanceFields(),
      loadEmployeeDeductions(),
      loadEmployeeDeductionFields(),
      loadAllowances(),
      loadAllowanceFields(),
      loadPayments(),
      loadPaymentFields(),
      loadMonthlyPayouts()
    ]);
    setLoading(false);
  };

  // NEW: Load functions for three-table employee structure
  const loadEmployeeSalaries = async () => {
    try {
      const result = await window.electron.indent.getEmployeeSalaries({
        pastorateId: currentPastorate.id,
        filters: {}
      });
      if (result.success) {
        setEmployeeSalaries(result.employees || []);
      }
    } catch (error) {
      console.error('Failed to load employee salaries:', error);
    }
  };

  const loadEmployeeAllowances = async () => {
    try {
      const result = await window.electron.indent.getEmployeeAllowances({
        pastorateId: currentPastorate.id
      });
      if (result.success) {
        setEmployeeAllowances(result.allowances || []);
      }
    } catch (error) {
      console.error('Failed to load employee allowances:', error);
    }
  };

  const loadEmployeeAllowanceFields = async () => {
    try {
      const result = await window.electron.indent.getEmployeeAllowanceFields({
        pastorateId: currentPastorate.id
      });
      if (result.success) {
        setEmployeeAllowanceFields(result.fields || []);
      }
    } catch (error) {
      console.error('Failed to load employee allowance fields:', error);
    }
  };

  const loadEmployeeDeductions = async () => {
    try {
      const result = await window.electron.indent.getEmployeeDeductions({
        pastorateId: currentPastorate.id
      });
      if (result.success) {
        setEmployeeDeductions(result.deductions || []);
      }
    } catch (error) {
      console.error('Failed to load employee deductions:', error);
    }
  };

  const loadEmployeeDeductionFields = async () => {
    try {
      const result = await window.electron.indent.getEmployeeDeductionFields({
        pastorateId: currentPastorate.id
      });
      if (result.success) {
        setEmployeeDeductionFields(result.fields || []);
      }
    } catch (error) {
      console.error('Failed to load employee deduction fields:', error);
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

  const loadPayments = async () => {
    try {
      const result = await window.electron.indent.getPayments({
        pastorateId: currentPastorate.id,
        filters: {}
      });
      if (result.success) {
        setPayments(result.payments || []);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  };

  const loadPaymentFields = async () => {
    try {
      const result = await window.electron.indent.getPaymentFields({
        pastorateId: currentPastorate.id
      });
      if (result.success) {
        setPaymentFields(result.fields || []);
      }
    } catch (error) {
      console.error('Failed to load payment fields:', error);
    }
  };

  const loadMonthlyPayouts = async () => {
    try {
      const result = await window.electron.indent.getMonthlyPayouts({
        pastorateId: currentPastorate.id,
        filters: {}
      });
      if (result.success) {
        setMonthlyPayouts(result.payouts || []);
      }
    } catch (error) {
      console.error('Failed to load monthly payouts:', error);
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

  // NEW: Employee Salary handlers
  const handleAddEmployeeSalary = () => {
    setEditingEmployeeSalary(null);
    setEmployeeSalaryForm({
      name: '',
      position: '',
      date_of_birth: '',
      salary: 0
    });
    setShowEmployeeSalaryModal(true);
  };

  const handleEditEmployeeSalary = (employee) => {
    setEditingEmployeeSalary(employee);
    setEmployeeSalaryForm({
      name: employee.name,
      position: employee.position,
      date_of_birth: employee.date_of_birth || '',
      salary: employee.salary || 0
    });
    setShowEmployeeSalaryModal(true);
  };

  const handleSaveEmployeeSalary = async () => {
    if (!employeeSalaryForm.name || !employeeSalaryForm.position || !employeeSalaryForm.date_of_birth) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (editingEmployeeSalary) {
        const result = await window.electron.indent.updateEmployeeSalary({
          employeeId: editingEmployeeSalary.id,
          employeeData: employeeSalaryForm
        });
        if (result.success) {
          showNotification('Employee salary updated successfully');
          loadEmployeeSalaries();
          setShowEmployeeSalaryModal(false);
        } else {
          showNotification('Failed to update employee salary', 'error');
        }
      } else {
        const result = await window.electron.indent.createEmployeeSalary({
          pastorateId: currentPastorate.id,
          userId: user.id,
          employeeData: employeeSalaryForm
        });
        if (result.success) {
          showNotification('Employee added successfully (allowance & deduction records auto-created)');
          loadEmployeeSalaries();
          loadEmployeeAllowances();
          loadEmployeeDeductions();
          setShowEmployeeSalaryModal(false);
        } else {
          showNotification('Failed to add employee', 'error');
        }
      }
    } catch (error) {
      console.error('Failed to save employee salary:', error);
      showNotification('Failed to save employee salary', 'error');
    }
  };

  const handleDeleteEmployeeSalary = (employeeId) => {
    showConfirm(
      'Delete Employee',
      'Are you sure you want to delete this employee? This will also delete their allowance and deduction records. This action cannot be undone.',
      async () => {
        try {
          const result = await window.electron.indent.deleteEmployeeSalary({ employeeId });
          if (result.success) {
            showNotification('Employee deleted successfully');
            loadEmployeeSalaries();
            loadEmployeeAllowances();
            loadEmployeeDeductions();
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

  // NEW: Employee Allowance handlers
  const handleEditEmployeeAllowance = (allowance) => {
    setEditingEmployeeAllowance(allowance);

    // Parse custom_allowances safely
    let customAllowances = {};
    if (allowance.custom_allowances) {
      if (typeof allowance.custom_allowances === 'string') {
        try {
          customAllowances = JSON.parse(allowance.custom_allowances);
        } catch (e) {
          console.error('Error parsing custom_allowances:', e);
          customAllowances = {};
        }
      } else if (typeof allowance.custom_allowances === 'object') {
        customAllowances = allowance.custom_allowances;
      }
    }

    setEmployeeAllowanceForm({
      employee_id: allowance.employee_id,
      dearness_allowance: allowance.dearness_allowance || 0,
      custom_allowances: customAllowances,
      total_allowance: allowance.total_allowance || 0
    });
    setShowEmployeeAllowanceModal(true);
  };

  const handleSaveEmployeeAllowance = async () => {
    if (!employeeAllowanceForm.employee_id) {
      showNotification('Invalid employee selection', 'error');
      return;
    }

    // Calculate total allowance
    const customTotal = Object.values(employeeAllowanceForm.custom_allowances || {})
      .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const totalAllowance = (parseFloat(employeeAllowanceForm.dearness_allowance) || 0) + customTotal;

    try {
      const result = await window.electron.indent.updateEmployeeAllowance({
        employeeId: employeeAllowanceForm.employee_id,
        allowanceData: {
          dearness_allowance: employeeAllowanceForm.dearness_allowance,
          custom_allowances: JSON.stringify(employeeAllowanceForm.custom_allowances || {}),
          total_allowance: totalAllowance
        }
      });
      if (result.success) {
        showNotification('Employee allowance updated successfully');
        loadEmployeeAllowances();
        setShowEmployeeAllowanceModal(false);
      } else {
        showNotification('Failed to update employee allowance', 'error');
      }
    } catch (error) {
      console.error('Failed to save employee allowance:', error);
      showNotification('Failed to save employee allowance', 'error');
    }
  };

  // NEW: Employee Allowance Field handlers
  const handleAddEmployeeAllowanceField = async () => {
    if (!newEmployeeAllowanceFieldName.trim()) return;

    try {
      const result = await window.electron.indent.createEmployeeAllowanceField({
        pastorateId: currentPastorate.id,
        fieldData: { field_name: newEmployeeAllowanceFieldName.trim() }
      });
      if (result.success) {
        showNotification('Employee allowance field added successfully');
        loadEmployeeAllowanceFields();
        setNewEmployeeAllowanceFieldName('');
      } else {
        showNotification('Failed to add employee allowance field', 'error');
      }
    } catch (error) {
      console.error('Failed to add employee allowance field:', error);
      showNotification('Failed to add employee allowance field', 'error');
    }
  };

  const handleDeleteEmployeeAllowanceField = (fieldId) => {
    showConfirm(
      'Delete Employee Allowance Field',
      'Are you sure you want to delete this field? This action cannot be undone.',
      async () => {
        try {
          const result = await window.electron.indent.deleteEmployeeAllowanceField({ fieldId });
          if (result.success) {
            showNotification('Employee allowance field deleted successfully');
            loadEmployeeAllowanceFields();
          } else {
            showNotification('Failed to delete employee allowance field', 'error');
          }
        } catch (error) {
          console.error('Failed to delete employee allowance field:', error);
          showNotification('Failed to delete employee allowance field', 'error');
        }
        hideConfirm();
      }
    );
  };

  // NEW: Employee Deduction handlers
  const handleEditEmployeeDeduction = (deduction) => {
    setEditingEmployeeDeduction(deduction);

    // Parse custom_deductions safely
    let customDeductions = {};
    if (deduction.custom_deductions) {
      if (typeof deduction.custom_deductions === 'string') {
        try {
          customDeductions = JSON.parse(deduction.custom_deductions);
        } catch (e) {
          console.error('Error parsing custom_deductions:', e);
          customDeductions = {};
        }
      } else if (typeof deduction.custom_deductions === 'object') {
        customDeductions = deduction.custom_deductions;
      }
    }

    setEmployeeDeductionForm({
      employee_id: deduction.employee_id,
      sangam: deduction.sangam || 0,
      dpf: deduction.dpf || 0,
      cpf: deduction.cpf || 0,
      dfbf: deduction.dfbf || 0,
      cswf: deduction.cswf || 0,
      dmaf: deduction.dmaf || 0,
      custom_deductions: customDeductions,
      total_deduction: deduction.total_deduction || 0
    });
    setShowEmployeeDeductionModal(true);
  };

  const handleSaveEmployeeDeduction = async () => {
    if (!employeeDeductionForm.employee_id) {
      showNotification('Invalid employee selection', 'error');
      return;
    }

    // Calculate total deduction
    const fixedTotal = (parseFloat(employeeDeductionForm.sangam) || 0) +
                       (parseFloat(employeeDeductionForm.dpf) || 0) +
                       (parseFloat(employeeDeductionForm.cpf) || 0) +
                       (parseFloat(employeeDeductionForm.dfbf) || 0) +
                       (parseFloat(employeeDeductionForm.cswf) || 0) +
                       (parseFloat(employeeDeductionForm.dmaf) || 0);
    const customTotal = Object.values(employeeDeductionForm.custom_deductions || {})
      .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const totalDeduction = fixedTotal + customTotal;

    try {
      const result = await window.electron.indent.updateEmployeeDeduction({
        employeeId: employeeDeductionForm.employee_id,
        deductionData: {
          sangam: employeeDeductionForm.sangam,
          dpf: employeeDeductionForm.dpf,
          cpf: employeeDeductionForm.cpf,
          dfbf: employeeDeductionForm.dfbf,
          cswf: employeeDeductionForm.cswf,
          dmaf: employeeDeductionForm.dmaf,
          custom_deductions: JSON.stringify(employeeDeductionForm.custom_deductions || {}),
          total_deduction: totalDeduction
        }
      });
      if (result.success) {
        showNotification('Employee deduction updated successfully');
        loadEmployeeDeductions();
        setShowEmployeeDeductionModal(false);
      } else {
        showNotification('Failed to update employee deduction', 'error');
      }
    } catch (error) {
      console.error('Failed to save employee deduction:', error);
      showNotification('Failed to save employee deduction', 'error');
    }
  };

  // NEW: Employee Deduction Field handlers
  const handleAddEmployeeDeductionField = async () => {
    if (!newEmployeeDeductionFieldName.trim()) return;

    try {
      const result = await window.electron.indent.createEmployeeDeductionField({
        pastorateId: currentPastorate.id,
        fieldData: { field_name: newEmployeeDeductionFieldName.trim() }
      });
      if (result.success) {
        showNotification('Employee deduction field added successfully');
        loadEmployeeDeductionFields();
        setNewEmployeeDeductionFieldName('');
      } else {
        showNotification('Failed to add employee deduction field', 'error');
      }
    } catch (error) {
      console.error('Failed to add employee deduction field:', error);
      showNotification('Failed to add employee deduction field', 'error');
    }
  };

  const handleDeleteEmployeeDeductionField = (fieldId) => {
    showConfirm(
      'Delete Employee Deduction Field',
      'Are you sure you want to delete this field? This action cannot be undone.',
      async () => {
        try {
          const result = await window.electron.indent.deleteEmployeeDeductionField({ fieldId });
          if (result.success) {
            showNotification('Employee deduction field deleted successfully');
            loadEmployeeDeductionFields();
          } else {
            showNotification('Failed to delete employee deduction field', 'error');
          }
        } catch (error) {
          console.error('Failed to delete employee deduction field:', error);
          showNotification('Failed to delete employee deduction field', 'error');
        }
        hideConfirm();
      }
    );
  };

  // OLD: Pastorate Workers Allowance handlers (keep as is - different from employee allowances)
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

  // Payment handlers
  const handleAddPayment = () => {
    setEditingPayment(null);
    setPaymentForm({
      payment_name: '',
      payment_amount: 0
    });
    setShowPaymentModal(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      payment_name: payment.payment_name,
      payment_amount: payment.payment_amount
    });
    setShowPaymentModal(true);
  };

  const handleSavePayment = async () => {
    if (!paymentForm.payment_name) {
      showNotification('Please fill in required fields', 'error');
      return;
    }

    try {
      if (editingPayment) {
        const result = await window.electron.indent.updatePayment({
          paymentId: editingPayment.id,
          paymentData: paymentForm
        });
        if (result.success) {
          showNotification('Payment updated successfully');
          loadPayments();
          setShowPaymentModal(false);
        } else {
          showNotification('Failed to update payment', 'error');
        }
      } else {
        const result = await window.electron.indent.createPayment({
          pastorateId: currentPastorate.id,
          userId: user.id,
          paymentData: paymentForm
        });
        if (result.success) {
          showNotification('Payment added successfully');
          loadPayments();
          setShowPaymentModal(false);
        } else {
          showNotification('Failed to add payment', 'error');
        }
      }
    } catch (error) {
      console.error('Failed to save payment:', error);
      showNotification('Failed to save payment', 'error');
    }
  };

  const handleDeletePayment = (paymentId) => {
    showConfirm(
      'Delete Payment',
      'Are you sure you want to delete this payment? This action cannot be undone.',
      async () => {
        try {
          const result = await window.electron.indent.deletePayment({ paymentId });
          if (result.success) {
            showNotification('Payment deleted successfully');
            loadPayments();
          } else {
            showNotification('Failed to delete payment', 'error');
          }
        } catch (error) {
          console.error('Failed to delete payment:', error);
          showNotification('Failed to delete payment', 'error');
        }
        hideConfirm();
      }
    );
  };

  // Payment field handlers
  const handleAddPaymentField = async () => {
    if (!newPaymentFieldName.trim()) return;

    try {
      const result = await window.electron.indent.createPaymentField({
        pastorateId: currentPastorate.id,
        fieldData: { field_name: newPaymentFieldName.trim() }
      });
      if (result.success) {
        showNotification('Payment field added successfully');
        loadPaymentFields();
        setNewPaymentFieldName('');
      } else {
        showNotification('Failed to add payment field', 'error');
      }
    } catch (error) {
      console.error('Failed to add payment field:', error);
      showNotification('Failed to add payment field', 'error');
    }
  };

  const handleDeletePaymentField = (fieldId) => {
    showConfirm(
      'Delete Payment Field',
      'Are you sure you want to delete this field? This action cannot be undone.',
      async () => {
        try {
          const result = await window.electron.indent.deletePaymentField({ fieldId });
          if (result.success) {
            showNotification('Payment field deleted successfully');
            loadPaymentFields();
          } else {
            showNotification('Failed to delete payment field', 'error');
          }
        } catch (error) {
          console.error('Failed to delete payment field:', error);
          showNotification('Failed to delete payment field', 'error');
        }
        hideConfirm();
      }
    );
  };

  // Monthly payout handlers
  const handleAddMonthlyPayout = () => {
    setEditingMonthlyPayout(null);
    setMonthlyPayoutForm({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
    setShowMonthlyPayoutModal(true);
  };

  const handleSaveMonthlyPayout = async () => {
    try {
      // NEW: Calculate total amounts from NEW three-table structure
      // Combine salary + allowances + deductions for each employee
      const employeeData = employeeSalaries.map(salary => {
        const allowance = employeeAllowances.find(a => a.employee_id === salary.id);
        const deduction = employeeDeductions.find(d => d.employee_id === salary.id);

        const salaryAmount = parseFloat(salary.salary) || 0;
        const allowanceAmount = parseFloat(allowance?.total_allowance) || 0;
        const deductionAmount = parseFloat(deduction?.total_deduction) || 0;

        return {
          id: salary.id,
          name: salary.name,
          position: salary.position,
          salary: salaryAmount,
          allowance: allowanceAmount,
          deduction: deductionAmount,
          total: salaryAmount + allowanceAmount + deductionAmount
        };
      });

      const employeeTotal = employeeData.reduce((sum, emp) => sum + emp.total, 0);
      const pastorateAllowanceTotal = allowances.reduce((sum, allow) => sum + (allow.allowance_amount || 0), 0);
      const paymentTotal = payments.reduce((sum, pay) => sum + (pay.payment_amount || 0), 0);
      const totalAmount = employeeTotal + pastorateAllowanceTotal + paymentTotal;

      // Create snapshot data with NEW structure
      const snapshotData = {
        employees: employeeData,
        employeeSalaries: employeeSalaries.map(s => ({
          id: s.id,
          name: s.name,
          position: s.position,
          date_of_birth: s.date_of_birth,
          salary: s.salary
        })),
        employeeAllowances: employeeAllowances.map(a => ({
          id: a.id,
          employee_id: a.employee_id,
          name: a.name,
          position: a.position,
          dearness_allowance: a.dearness_allowance,
          custom_allowances: a.custom_allowances,
          total_allowance: a.total_allowance
        })),
        employeeDeductions: employeeDeductions.map(d => ({
          id: d.id,
          employee_id: d.employee_id,
          name: d.name,
          position: d.position,
          sangam: d.sangam,
          dpf: d.dpf,
          cpf: d.cpf,
          dfbf: d.dfbf,
          cswf: d.cswf,
          dmaf: d.dmaf,
          custom_deductions: d.custom_deductions,
          total_deduction: d.total_deduction
        })),
        pastorateAllowances: allowances.map(allow => ({
          id: allow.id,
          name: allow.name,
          position: allow.position,
          allowance_name: allow.allowance_name,
          allowance_amount: allow.allowance_amount
        })),
        payments: payments.map(pay => ({
          id: pay.id,
          payment_name: pay.payment_name,
          payment_amount: pay.payment_amount
        }))
      };

      const result = await window.electron.indent.createMonthlyPayout({
        pastorateId: currentPastorate.id,
        userId: user.id,
        payoutData: {
          month: monthlyPayoutForm.month,
          year: monthlyPayoutForm.year,
          total_amount: totalAmount,
          snapshot_data: JSON.stringify(snapshotData)
        }
      });

      if (result.success) {
        showNotification('Monthly payout created successfully');
        loadMonthlyPayouts();
        setShowMonthlyPayoutModal(false);
      } else {
        showNotification('Failed to create monthly payout', 'error');
      }
    } catch (error) {
      console.error('Failed to save monthly payout:', error);
      showNotification('Failed to save monthly payout', 'error');
    }
  };

  const handleDeleteMonthlyPayout = (payoutId) => {
    showConfirm(
      'Delete Monthly Payout',
      'Are you sure you want to delete this monthly payout? This action cannot be undone.',
      async () => {
        try {
          const result = await window.electron.indent.deleteMonthlyPayout({ payoutId });
          if (result.success) {
            showNotification('Monthly payout deleted successfully');
            loadMonthlyPayouts();
          } else {
            showNotification('Failed to delete monthly payout', 'error');
          }
        } catch (error) {
          console.error('Failed to delete monthly payout:', error);
          showNotification('Failed to delete monthly payout', 'error');
        }
        hideConfirm();
      }
    );
  };

  const handleEditMonthlyPayout = (payout) => {
    // Navigate to edit page
    navigate(`/indent/monthly-payout/edit/${payout.id}`);
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

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || '';
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle="Indent Book - Employee Salary & Deductions"
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

        {/* ROW 1: Employee Salary & Employee Allowances */}
        <div className={styles.twoColumnLayout}>
          {/* Left: Employee Salary Table */}
          <div className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Employee Salary</h2>
              <div className={styles.buttonGroup}>
                <button className={styles.addButton} onClick={handleAddEmployeeSalary}>
                  <AddRegular fontSize={18} />
                  Add Employee
                </button>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Position</th>
                      <th className={styles.th}>Base Salary</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className={styles.emptyState}>
                          Loading...
                        </td>
                      </tr>
                    ) : employeeSalaries.length === 0 ? (
                      <tr>
                        <td colSpan="4" className={styles.emptyState}>
                          <PersonRegular fontSize={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                          <p>No employees found. Click "Add Employee" to add your first employee.</p>
                        </td>
                      </tr>
                    ) : (
                      employeeSalaries.map((employee) => (
                        <tr key={employee.id}>
                          <td className={styles.td}>{employee.name}</td>
                          <td className={styles.td}>{employee.position}</td>
                          <td className={styles.td}>{formatCurrency(employee.salary)}</td>
                          <td className={styles.td}>
                            <div className={styles.actionButtons}>
                              <button
                                className={styles.iconButton}
                                onClick={() => handleEditEmployeeSalary(employee)}
                                title="Edit"
                              >
                                <EditRegular fontSize={18} style={{ color: '#B5316A' }} />
                              </button>
                              <button
                                className={styles.iconButton}
                                onClick={() => handleDeleteEmployeeSalary(employee.id)}
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

          {/* Right: Employee Allowances Table */}
          <div className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Employee Allowances</h2>
              <div className={styles.buttonGroup}>
                <button className={styles.addButton} onClick={() => setShowEmployeeAllowanceFieldsModal(true)}>
                  <SettingsRegular fontSize={18} />
                  Manage Fields
                </button>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Position</th>
                      <th className={styles.th}>DA</th>
                      <th className={styles.th}>Total</th>
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
                    ) : employeeAllowances.length === 0 ? (
                      <tr>
                        <td colSpan="5" className={styles.emptyState}>
                          <MoneyRegular fontSize={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                          <p>No employee allowances found. Add employees first to manage their allowances.</p>
                        </td>
                      </tr>
                    ) : (
                      employeeAllowances.map((allowance) => (
                        <tr key={allowance.id}>
                          <td className={styles.td}>{allowance.name}</td>
                          <td className={styles.td}>{allowance.position}</td>
                          <td className={styles.td}>{formatCurrency(allowance.dearness_allowance)}</td>
                          <td className={styles.td}>{formatCurrency(allowance.total_allowance)}</td>
                          <td className={styles.td}>
                            <div className={styles.actionButtons}>
                              <button
                                className={styles.iconButton}
                                onClick={() => handleEditEmployeeAllowance(allowance)}
                                title="Edit"
                              >
                                <EditRegular fontSize={18} style={{ color: '#B5316A' }} />
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

        {/* ROW 2: Employee Deductions & Pastorate Workers Allowance */}
        <div className={styles.twoColumnLayout}>
          {/* Left: Employee Deductions Table */}
          <div className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Employee Deductions</h2>
              <div className={styles.buttonGroup}>
                <button className={styles.addButton} onClick={() => setShowEmployeeDeductionFieldsModal(true)}>
                  <SettingsRegular fontSize={18} />
                  Manage Fields
                </button>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Position</th>
                      <th className={styles.th}>Sangam</th>
                      <th className={styles.th}>Total</th>
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
                    ) : employeeDeductions.length === 0 ? (
                      <tr>
                        <td colSpan="5" className={styles.emptyState}>
                          <PersonRegular fontSize={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                          <p>No employee deductions found. Add employees first to manage their deductions.</p>
                        </td>
                      </tr>
                    ) : (
                      employeeDeductions.map((deduction) => (
                        <tr key={deduction.id}>
                          <td className={styles.td}>{deduction.name}</td>
                          <td className={styles.td}>{deduction.position}</td>
                          <td className={styles.td}>{formatCurrency(deduction.sangam)}</td>
                          <td className={styles.td}>{formatCurrency(deduction.total_deduction)}</td>
                          <td className={styles.td}>
                            <div className={styles.actionButtons}>
                              <button
                                className={styles.iconButton}
                                onClick={() => handleEditEmployeeDeduction(deduction)}
                                title="Edit"
                              >
                                <EditRegular fontSize={18} style={{ color: '#B5316A' }} />
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

          {/* Right: Pastorate Workers Allowance Table */}
          <div className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Pastorate Workers Allowance</h2>
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

        {/* ROW 3: Indent Payments & Monthly Payouts */}
        <div className={styles.twoColumnLayout}>
          {/* Left: Indent Payments Table */}
          <div className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Indent Payments</h2>
              <div className={styles.buttonGroup}>
                <button className={styles.addButton} onClick={() => setShowPaymentFieldsModal(true)}>
                  <SettingsRegular fontSize={18} />
                  Add Fields
                </button>
                <button className={styles.addButton} onClick={handleAddPayment}>
                  <AddRegular fontSize={18} />
                  Add Entry
                </button>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={styles.th}>Name of the Payment</th>
                      <th className={styles.th}>Amount</th>
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
                    ) : payments.length === 0 ? (
                      <tr>
                        <td colSpan="3" className={styles.emptyState}>
                          <MoneyRegular fontSize={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                          <p>No payments found. Click "Add Entry" to add your first payment.</p>
                        </td>
                      </tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className={styles.td}>{payment.payment_name}</td>
                          <td className={styles.td}>{formatCurrency(payment.payment_amount)}</td>
                          <td className={styles.td}>
                            <div className={styles.actionButtons}>
                              <button
                                className={styles.iconButton}
                                onClick={() => handleEditPayment(payment)}
                                title="Edit"
                              >
                                <EditRegular fontSize={18} style={{ color: '#B5316A' }} />
                              </button>
                              <button
                                className={styles.iconButton}
                                onClick={() => handleDeletePayment(payment.id)}
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

          {/* Right: Monthly Payouts Table */}
          <div className={styles.tableSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Monthly Payouts</h2>
              <div className={styles.buttonGroup}>
                <button className={styles.addButton} onClick={handleAddMonthlyPayout}>
                  <AddRegular fontSize={18} />
                  Add Entry
                </button>
              </div>
            </div>

            <div className={styles.tableContainer}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={styles.th}>Month & Year</th>
                      <th className={styles.th}>Total Amount</th>
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
                    ) : monthlyPayouts.length === 0 ? (
                      <tr>
                        <td colSpan="3" className={styles.emptyState}>
                          <MoneyRegular fontSize={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                          <p>No monthly payouts found. Click "Add Entry" to create your first snapshot.</p>
                        </td>
                      </tr>
                    ) : (
                      monthlyPayouts.map((payout) => (
                        <tr key={payout.id}>
                          <td className={styles.td}>{getMonthName(payout.month)} {payout.year}</td>
                          <td className={styles.td}>{formatCurrency(payout.total_amount)}</td>
                          <td className={styles.td}>
                            <div className={styles.actionButtons}>
                              <button
                                className={styles.iconButton}
                                onClick={() => handleEditMonthlyPayout(payout)}
                                title="Edit"
                              >
                                <EditRegular fontSize={18} style={{ color: '#B5316A' }} />
                              </button>
                              <button
                                className={styles.iconButton}
                                onClick={() => handleDeleteMonthlyPayout(payout.id)}
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

      {/* NEW: Employee Salary Modal */}
      {showEmployeeSalaryModal && (
        <div className={styles.modal} onClick={() => setShowEmployeeSalaryModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingEmployeeSalary ? 'Edit Employee Salary' : 'Add New Employee'}
              </h2>
              <button className={styles.closeButton} onClick={() => setShowEmployeeSalaryModal(false)}>
                <DismissRegular fontSize={20} />
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Name *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={employeeSalaryForm.name}
                  onChange={(e) => setEmployeeSalaryForm({ ...employeeSalaryForm, name: e.target.value })}
                  placeholder="Enter employee name"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Position *</label>
                <input
                  type="text"
                  className={styles.input}
                  value={employeeSalaryForm.position}
                  onChange={(e) => setEmployeeSalaryForm({ ...employeeSalaryForm, position: e.target.value })}
                  placeholder="Enter position"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  className={styles.input}
                  value={employeeSalaryForm.date_of_birth}
                  onChange={(e) => setEmployeeSalaryForm({ ...employeeSalaryForm, date_of_birth: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Base Salary *</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeSalaryForm.salary}
                  onChange={(e) => setEmployeeSalaryForm({ ...employeeSalaryForm, salary: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowEmployeeSalaryModal(false)}>
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSaveEmployeeSalary}>
                {editingEmployeeSalary ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Employee Allowance Modal */}
      {showEmployeeAllowanceModal && (
        <div className={styles.modal} onClick={() => setShowEmployeeAllowanceModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Employee Allowance</h2>
              <button className={styles.closeButton} onClick={() => setShowEmployeeAllowanceModal(false)}>
                <DismissRegular fontSize={20} />
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Employee</label>
                <select
                  className={styles.input}
                  value={employeeAllowanceForm.employee_id}
                  onChange={(e) => setEmployeeAllowanceForm({ ...employeeAllowanceForm, employee_id: e.target.value })}
                  disabled={editingEmployeeAllowance}
                >
                  <option value="">Select Employee</option>
                  {employeeSalaries.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Dearness Allowance (DA)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeAllowanceForm.dearness_allowance}
                  onChange={(e) => setEmployeeAllowanceForm({ ...employeeAllowanceForm, dearness_allowance: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              {/* Custom allowance fields */}
              {employeeAllowanceFields.map((field) => (
                <div key={field.id} className={styles.formGroup}>
                  <label className={styles.label}>{field.field_name}</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={employeeAllowanceForm.custom_allowances[field.field_name] || 0}
                    onChange={(e) => setEmployeeAllowanceForm({
                      ...employeeAllowanceForm,
                      custom_allowances: {
                        ...employeeAllowanceForm.custom_allowances,
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
              <button className={styles.cancelButton} onClick={() => setShowEmployeeAllowanceModal(false)}>
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSaveEmployeeAllowance}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Employee Deduction Modal */}
      {showEmployeeDeductionModal && (
        <div className={styles.modal} onClick={() => setShowEmployeeDeductionModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Employee Deduction</h2>
              <button className={styles.closeButton} onClick={() => setShowEmployeeDeductionModal(false)}>
                <DismissRegular fontSize={20} />
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Employee</label>
                <select
                  className={styles.input}
                  value={employeeDeductionForm.employee_id}
                  onChange={(e) => setEmployeeDeductionForm({ ...employeeDeductionForm, employee_id: e.target.value })}
                  disabled={editingEmployeeDeduction}
                >
                  <option value="">Select Employee</option>
                  {employeeSalaries.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Sangam</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeDeductionForm.sangam}
                  onChange={(e) => setEmployeeDeductionForm({ ...employeeDeductionForm, sangam: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>DPF</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeDeductionForm.dpf}
                  onChange={(e) => setEmployeeDeductionForm({ ...employeeDeductionForm, dpf: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>CPF</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeDeductionForm.cpf}
                  onChange={(e) => setEmployeeDeductionForm({ ...employeeDeductionForm, cpf: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>DFBF</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeDeductionForm.dfbf}
                  onChange={(e) => setEmployeeDeductionForm({ ...employeeDeductionForm, dfbf: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>CSWF</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeDeductionForm.cswf}
                  onChange={(e) => setEmployeeDeductionForm({ ...employeeDeductionForm, cswf: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>DMAF</label>
                <input
                  type="number"
                  className={styles.input}
                  value={employeeDeductionForm.dmaf}
                  onChange={(e) => setEmployeeDeductionForm({ ...employeeDeductionForm, dmaf: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              {/* Custom deduction fields */}
              {employeeDeductionFields.map((field) => (
                <div key={field.id} className={styles.formGroup}>
                  <label className={styles.label}>{field.field_name}</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={employeeDeductionForm.custom_deductions[field.field_name] || 0}
                    onChange={(e) => setEmployeeDeductionForm({
                      ...employeeDeductionForm,
                      custom_deductions: {
                        ...employeeDeductionForm.custom_deductions,
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
              <button className={styles.cancelButton} onClick={() => setShowEmployeeDeductionModal(false)}>
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSaveEmployeeDeduction}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Employee Allowance Fields Modal */}
      {showEmployeeAllowanceFieldsModal && (
        <div className={styles.modal} onClick={() => setShowEmployeeAllowanceFieldsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Manage Employee Allowance Fields</h2>
              <button className={styles.closeButton} onClick={() => setShowEmployeeAllowanceFieldsModal(false)}>
                <DismissRegular fontSize={20} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: '#605e5c', marginBottom: '16px' }}>
                Add custom allowance fields for employees (e.g., HRA, Transport Allowance).
              </p>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input
                  type="text"
                  className={styles.input}
                  value={newEmployeeAllowanceFieldName}
                  onChange={(e) => setNewEmployeeAllowanceFieldName(e.target.value)}
                  placeholder="Enter field name"
                  style={{ flex: 1 }}
                />
                <button className={styles.saveButton} onClick={handleAddEmployeeAllowanceField}>
                  Add Field
                </button>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {employeeAllowanceFields.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#8a8886', padding: '20px' }}>
                    No custom fields added yet.
                  </p>
                ) : (
                  <table className={styles.table}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        <th className={styles.th}>Field Name</th>
                        <th className={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeAllowanceFields.map((field) => (
                        <tr key={field.id}>
                          <td className={styles.td}>{field.field_name}</td>
                          <td className={styles.td}>
                            <button
                              className={styles.iconButton}
                              onClick={() => handleDeleteEmployeeAllowanceField(field.id)}
                              title="Delete"
                            >
                              <DeleteRegular fontSize={18} style={{ color: '#D13438' }} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowEmployeeAllowanceFieldsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Employee Deduction Fields Modal */}
      {showEmployeeDeductionFieldsModal && (
        <div className={styles.modal} onClick={() => setShowEmployeeDeductionFieldsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Manage Employee Deduction Fields</h2>
              <button className={styles.closeButton} onClick={() => setShowEmployeeDeductionFieldsModal(false)}>
                <DismissRegular fontSize={20} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: '#605e5c', marginBottom: '16px' }}>
                Add custom deduction fields for employees (e.g., EPF, Insurance).
              </p>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input
                  type="text"
                  className={styles.input}
                  value={newEmployeeDeductionFieldName}
                  onChange={(e) => setNewEmployeeDeductionFieldName(e.target.value)}
                  placeholder="Enter field name"
                  style={{ flex: 1 }}
                />
                <button className={styles.saveButton} onClick={handleAddEmployeeDeductionField}>
                  Add Field
                </button>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {employeeDeductionFields.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#8a8886', padding: '20px' }}>
                    No custom fields added yet.
                  </p>
                ) : (
                  <table className={styles.table}>
                    <thead className={styles.tableHeader}>
                      <tr>
                        <th className={styles.th}>Field Name</th>
                        <th className={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeDeductionFields.map((field) => (
                        <tr key={field.id}>
                          <td className={styles.td}>{field.field_name}</td>
                          <td className={styles.td}>
                            <button
                              className={styles.iconButton}
                              onClick={() => handleDeleteEmployeeDeductionField(field.id)}
                              title="Delete"
                            >
                              <DeleteRegular fontSize={18} style={{ color: '#D13438' }} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowEmployeeDeductionFieldsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pastorate Workers Allowance Modal (keep as is - different from employee allowances) */}
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

      {/* Payment Fields Modal */}
      {showPaymentFieldsModal && (
        <div className={styles.modal} onClick={() => setShowPaymentFieldsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Manage Payment Fields</h2>
              <button className={styles.closeButton} onClick={() => setShowPaymentFieldsModal(false)}>
                <DismissRegular fontSize={20} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: '#605e5c', marginBottom: '16px' }}>
                Add custom payment types that will appear in the payment form.
              </p>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <input
                  type="text"
                  className={styles.input}
                  value={newPaymentFieldName}
                  onChange={(e) => setNewPaymentFieldName(e.target.value)}
                  placeholder="Enter payment type (e.g., Bonus, Incentive)"
                  style={{ flex: 1 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddPaymentField();
                    }
                  }}
                />
                <button className={styles.addButton} onClick={handleAddPaymentField}>
                  <AddRegular fontSize={18} />
                  Add
                </button>
              </div>

              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#323130' }}>
                  Current Payment Types
                </h3>
                {paymentFields.length === 0 ? (
                  <p style={{ fontSize: '14px', color: '#605e5c', fontStyle: 'italic' }}>
                    No custom payment types added yet.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {paymentFields.map((field) => (
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
                          onClick={() => handleDeletePaymentField(field.id)}
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
              <button className={styles.cancelButton} onClick={() => setShowPaymentFieldsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className={styles.modal} onClick={() => setShowPaymentModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingPayment ? 'Edit Payment' : 'Add New Payment'}
              </h2>
              <button className={styles.closeButton} onClick={() => setShowPaymentModal(false)}>
                <DismissRegular fontSize={20} />
              </button>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.label}>Name of the Payment *</label>
                {paymentFields.length > 0 ? (
                  <select
                    className={styles.select}
                    value={paymentForm.payment_name}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_name: e.target.value })}
                  >
                    <option value="">Select payment type</option>
                    {paymentFields.map((field) => (
                      <option key={field.id} value={field.field_name}>
                        {field.field_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className={styles.input}
                    value={paymentForm.payment_name}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_name: e.target.value })}
                    placeholder="Enter payment name"
                  />
                )}
              </div>

              <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.label}>Amount *</label>
                <input
                  type="number"
                  className={styles.input}
                  value={paymentForm.payment_amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowPaymentModal(false)}>
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSavePayment}>
                {editingPayment ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Payout Modal */}
      {showMonthlyPayoutModal && (
        <div className={styles.modal} onClick={() => setShowMonthlyPayoutModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Create Monthly Payout Snapshot</h2>
              <button className={styles.closeButton} onClick={() => setShowMonthlyPayoutModal(false)}>
                <DismissRegular fontSize={20} />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: '#605e5c', marginBottom: '16px' }}>
                This will create a snapshot of all current amounts from Employee Deductions, Allowances, and Indent Payments tables.
              </p>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Month *</label>
                  <select
                    className={styles.select}
                    value={monthlyPayoutForm.month}
                    onChange={(e) => setMonthlyPayoutForm({ ...monthlyPayoutForm, month: parseInt(e.target.value) })}
                  >
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Year *</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={monthlyPayoutForm.year}
                    onChange={(e) => setMonthlyPayoutForm({ ...monthlyPayoutForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    placeholder="2025"
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowMonthlyPayoutModal(false)}>
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSaveMonthlyPayout}>
                Create Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

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

export default IndentPage;
