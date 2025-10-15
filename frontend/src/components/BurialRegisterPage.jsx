import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  DocumentRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  SaveRegular,
  PrintRegular,
  DeleteRegular,
  ArrowClockwiseRegular,
  CheckmarkCircleRegular,
  DismissCircleRegular
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';
import { generatePuppeteerBurialRegister, formatDate, formatDateForInput } from '../utils/burialRegisterReportPuppeteer';

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
    padding: '32px 40px 40px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: '0',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#323130',
    margin: '0 0 24px 0',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    marginBottom: '24px',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  tableTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#323130',
    margin: '0',
  },
  refreshButton: {
    padding: '8px 16px',
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#9a2858',
    },
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '16px',
  },
  tableHead: {
    backgroundColor: '#f3f2f1',
  },
  th: {
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
  actionButton: {
    padding: '6px 12px',
    marginRight: '8px',
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#9a2858',
    },
  },
  deleteButton: {
    backgroundColor: '#d13438',
    '&:hover': {
      backgroundColor: '#a52a2d',
    },
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#605e5c',
  },
  paginationButtons: {
    display: 'flex',
    gap: '8px',
  },
  paginationButton: {
    padding: '8px 16px',
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#9a2858',
    },
    '&:disabled': {
      backgroundColor: '#c8c6c4',
      cursor: 'not-allowed',
    },
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formGroupFull: {
    gridColumn: '1 / -1',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
  },
  requiredStar: {
    color: '#d13438',
    marginLeft: '4px',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #c8c6c4',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      borderColor: '#B5316A',
    },
  },
  inputError: {
    borderColor: '#d13438',
  },
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #c8c6c4',
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    '&:focus': {
      borderColor: '#B5316A',
    },
  },
  errorText: {
    fontSize: '12px',
    color: '#d13438',
    marginTop: '4px',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-start',
    marginTop: '24px',
  },
  saveButton: {
    padding: '10px 24px',
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#9a2858',
    },
    '&:disabled': {
      backgroundColor: '#c8c6c4',
      cursor: 'not-allowed',
    },
  },
  printButton: {
    padding: '10px 24px',
    backgroundColor: '#0078d4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#106ebe',
    },
    '&:disabled': {
      backgroundColor: '#c8c6c4',
      cursor: 'not-allowed',
    },
  },
  notification: {
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
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
  deleteWarning: {
    backgroundColor: '#fff4ce',
    color: '#8a6d3b',
    border: '1px solid #f0ad4e',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  deleteWarningButtons: {
    display: 'flex',
    gap: '8px',
    marginTop: '12px',
  },
  confirmDeleteButton: {
    padding: '8px 16px',
    backgroundColor: '#d13438',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    '&:hover': {
      backgroundColor: '#a52a2d',
    },
  },
  cancelDeleteButton: {
    padding: '8px 16px',
    backgroundColor: '#c8c6c4',
    color: '#323130',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    '&:hover': {
      backgroundColor: '#a19f9d',
    },
  },
});

function BurialRegisterPage({
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
}) {
  const classes = useStyles();
  const navigate = useNavigate();

  // State management
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    certificate_number: '',
    date_of_death: '',
    when_buried: '',
    name_of_person_died: '',
    sex: 'male',
    age: '',
    profession: '',
    cause_of_death: '',
    father_name: '',
    mother_name: '',
    where_buried: '',
    signature_who_buried: '',
    certified_rev_name: '',
    holding_office: '',
    certificate_date: '',
    certificate_place: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Load registers on mount and when church/page changes
  useEffect(() => {
    if (currentChurch) {
      loadRegisters();
      loadNextRegisterNumber();
    }
  }, [currentChurch, currentPage]);

  // Load registers from database
  const loadRegisters = async () => {
    if (!currentChurch) return;

    setLoading(true);
    try {
      const result = await window.electron.burialRegister.getRegisters({
        churchId: currentChurch.id,
        userId: user.id,
        page: currentPage,
        limit: 10
      });

      if (result.success) {
        setRegisters(result.registers);
        setTotalPages(result.totalPages);
      } else {
        showNotification('error', result.error || 'Failed to load registers');
      }
    } catch (error) {
      console.error('Error loading registers:', error);
      showNotification('error', 'Failed to load registers');
    } finally {
      setLoading(false);
    }
  };

  // Load next register number
  const loadNextRegisterNumber = async () => {
    if (!currentChurch || editingId) return;

    try {
      const result = await window.electron.burialRegister.getNextRegisterNumber({
        churchId: currentChurch.id,
        userId: user.id
      });

      if (result.success) {
        setFormData(prev => ({ ...prev, certificate_number: result.nextNumber }));
      }
    } catch (error) {
      console.error('Error loading next register number:', error);
    }
  };

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.certificate_number.trim()) errors.certificate_number = 'Certificate number is required';
    if (!formData.date_of_death) errors.date_of_death = 'Date of death is required';
    if (!formData.when_buried) errors.when_buried = 'Burial date is required';
    if (!formData.name_of_person_died.trim()) errors.name_of_person_died = 'Name is required';
    if (!formData.sex) errors.sex = 'Sex is required';
    if (!formData.age.trim()) errors.age = 'Age is required';
    if (!formData.cause_of_death.trim()) errors.cause_of_death = 'Cause of death is required';
    if (!formData.father_name.trim()) errors.father_name = 'Father name is required';
    if (!formData.mother_name.trim()) errors.mother_name = 'Mother name is required';
    if (!formData.where_buried.trim()) errors.where_buried = 'Place of burial is required';
    if (!formData.signature_who_buried.trim()) errors.signature_who_buried = 'Signature is required';
    if (!formData.certified_rev_name.trim()) errors.certified_rev_name = 'Rev name is required';
    if (!formData.holding_office.trim()) errors.holding_office = 'Holding office is required';
    if (!formData.certificate_date) errors.certificate_date = 'Certificate date is required';
    if (!formData.certificate_place.trim()) errors.certificate_place = 'Certificate place is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save (create or update)
  const handleSave = async () => {
    if (!validateForm()) {
      showNotification('error', 'Please fill in all required fields');
      return;
    }

    if (!currentChurch) {
      showNotification('error', 'No church selected');
      return;
    }

    setLoading(true);
    try {
      const registerData = {
        ...formData,
        church_id: currentChurch.id
      };

      let result;
      if (editingId) {
        result = await window.electron.burialRegister.updateRegister({
          registerId: editingId,
          registerData,
          userId: user.id
        });
      } else {
        result = await window.electron.burialRegister.createRegister({
          registerData,
          userId: user.id
        });
      }

      if (result.success) {
        showNotification('success', editingId ? 'Register updated successfully' : 'Register created successfully');
        resetForm();
        loadRegisters();
      } else {
        showNotification('error', result.error || 'Failed to save register');
      }
    } catch (error) {
      console.error('Error saving register:', error);
      showNotification('error', 'Failed to save register');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = async (registerId) => {
    setLoading(true);
    try {
      const result = await window.electron.burialRegister.getRegisterById({
        registerId,
        userId: user.id
      });

      if (result.success) {
        const register = result.register;
        setFormData({
          certificate_number: register.certificate_number || '',
          date_of_death: formatDateForInput(register.date_of_death) || '',
          when_buried: formatDateForInput(register.when_buried) || '',
          name_of_person_died: register.name_of_person_died || '',
          sex: register.sex || 'male',
          age: register.age || '',
          profession: register.profession || '',
          cause_of_death: register.cause_of_death || '',
          father_name: register.father_name || '',
          mother_name: register.mother_name || '',
          where_buried: register.where_buried || '',
          signature_who_buried: register.signature_who_buried || '',
          certified_rev_name: register.certified_rev_name || '',
          holding_office: register.holding_office || '',
          certificate_date: formatDateForInput(register.certificate_date) || '',
          certificate_place: register.certificate_place || '',
        });
        setEditingId(registerId);
        setFormErrors({});
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showNotification('error', result.error || 'Failed to load register');
      }
    } catch (error) {
      console.error('Error loading register:', error);
      showNotification('error', 'Failed to load register');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = (registerId) => {
    setConfirmDelete(registerId);
    // Scroll to top to show the warning
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Confirm delete
  const confirmDeleteRegister = async () => {
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const result = await window.electron.burialRegister.deleteRegister({
        registerId: confirmDelete,
        userId: user.id
      });

      if (result.success) {
        showNotification('success', 'Register deleted successfully');
        setConfirmDelete(null);
        loadRegisters();
        if (editingId === confirmDelete) {
          resetForm();
        }
      } else {
        showNotification('error', result.error || 'Failed to delete register');
      }
    } catch (error) {
      console.error('Error deleting register:', error);
      showNotification('error', 'Failed to delete register');
    } finally {
      setLoading(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      certificate_number: '',
      date_of_death: '',
      when_buried: '',
      name_of_person_died: '',
      sex: 'male',
      age: '',
      profession: '',
      cause_of_death: '',
      father_name: '',
      mother_name: '',
      where_buried: '',
      signature_who_buried: '',
      certified_rev_name: '',
      holding_office: '',
      certificate_date: '',
      certificate_place: '',
    });
    setFormErrors({});
    setEditingId(null);
    loadNextRegisterNumber();
  };

  // Handle generate PDF
  const handleGeneratePDF = async (registerId) => {
    setLoading(true);
    try {
      const result = await window.electron.burialRegister.getRegisterDataForPDF({
        registerId,
        userId: user.id
      });

      if (result.success) {
        const pdfResult = await generatePuppeteerBurialRegister(
          result.register,
          result.church,
          'view'
        );

        if (!pdfResult.success) {
          showNotification('error', pdfResult.error || 'Failed to generate PDF');
        }
      } else {
        showNotification('error', result.error || 'Failed to load register data');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification('error', 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className={classes.container}>
      {/* Notification */}
      {notification && (
        <div className={`${classes.notification} ${notification.type === 'success' ? classes.notificationSuccess : classes.notificationError}`}>
          {notification.type === 'success' ? <CheckmarkCircleRegular /> : <DismissCircleRegular />}
          {notification.message}
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle="Burial Register"
        breadcrumbs={[
          {
            label: `${currentPastorate?.pastorate_short_name || 'Pastorate'} Dashboard`,
            icon: <HomeRegular />,
            onClick: () => navigate('/pastorate-dashboard')
          },
          {
            label: 'Burial Register',
            current: true
          }
        ]}
        onNavigate={(path) => navigate(path)}
      />

      {/* Content */}
      <div className={classes.content}>

        {/* Delete Warning */}
        {confirmDelete && (
          <div className={classes.deleteWarning}>
            <strong>⚠️ Warning:</strong> Are you sure you want to delete this burial register? This action cannot be undone.
            {registers.find(r => r.id === confirmDelete) && (
              <div style={{ marginTop: '8px', fontSize: '14px' }}>
                <strong>Register:</strong> {registers.find(r => r.id === confirmDelete).certificate_number} - {registers.find(r => r.id === confirmDelete).name_of_person_died}
              </div>
            )}
            <div className={classes.deleteWarningButtons}>
              <button className={classes.confirmDeleteButton} onClick={confirmDeleteRegister}>
                <DeleteRegular /> Yes, Delete
              </button>
              <button className={classes.cancelDeleteButton} onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Registers Table */}
        <div className={classes.tableContainer}>
          <div className={classes.tableHeader}>
            <h2 className={classes.tableTitle}>Previous Records</h2>
            <button className={classes.refreshButton} onClick={loadRegisters} disabled={loading}>
              <ArrowClockwiseRegular />
              Refresh
            </button>
          </div>

          <table className={classes.table}>
            <thead className={classes.tableHead}>
              <tr>
                <th className={classes.th}>Cert. No.</th>
                <th className={classes.th}>Name</th>
                <th className={classes.th}>Date of Death</th>
                <th className={classes.th}>When Buried</th>
                <th className={classes.th}>Age</th>
                <th className={classes.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registers.length === 0 ? (
                <tr>
                  <td colSpan="6" className={classes.td} style={{ textAlign: 'center', padding: '24px' }}>
                    {loading ? 'Loading...' : 'No registers found'}
                  </td>
                </tr>
              ) : (
                registers.map((register) => (
                  <tr key={register.id}>
                    <td className={classes.td}>{register.certificate_number}</td>
                    <td className={classes.td}>{register.name_of_person_died}</td>
                    <td className={classes.td}>{new Date(register.date_of_death).toLocaleDateString()}</td>
                    <td className={classes.td}>{new Date(register.when_buried).toLocaleDateString()}</td>
                    <td className={classes.td}>{register.age}</td>
                    <td className={classes.td}>
                      <button className={classes.actionButton} onClick={() => handleGeneratePDF(register.id)}>
                        <PrintRegular /> View PDF
                      </button>
                      <button className={classes.actionButton} onClick={() => handleEdit(register.id)}>
                        Edit
                      </button>
                      <button className={`${classes.actionButton} ${classes.deleteButton}`} onClick={() => handleDelete(register.id)}>
                        <DeleteRegular /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={classes.pagination}>
              <div className={classes.paginationInfo}>
                Page {currentPage} of {totalPages}
              </div>
              <div className={classes.paginationButtons}>
                <button
                  className={classes.paginationButton}
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeftRegular /> Previous
                </button>
                <button
                  className={classes.paginationButton}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                >
                  Next <ChevronRightRegular />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Entry Form */}
        <div className={classes.formContainer}>
          <h2 className={classes.formTitle}>{editingId ? 'Edit Register' : 'New Register'}</h2>

          <div className={classes.formGrid}>
            {/* Certificate Number */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                Certificate Number<span className={classes.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="certificate_number"
                value={formData.certificate_number}
                onChange={handleInputChange}
                className={`${classes.input} ${formErrors.certificate_number ? classes.inputError : ''}`}
                disabled={loading}
              />
              {formErrors.certificate_number && <span className={classes.errorText}>{formErrors.certificate_number}</span>}
            </div>

            {/* Date of Death */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                Date of Death<span className={classes.requiredStar}>*</span>
              </label>
              <input
                type="date"
                name="date_of_death"
                value={formData.date_of_death}
                onChange={handleInputChange}
                className={`${classes.input} ${formErrors.date_of_death ? classes.inputError : ''}`}
                disabled={loading}
              />
              {formErrors.date_of_death && <span className={classes.errorText}>{formErrors.date_of_death}</span>}
            </div>

            {/* When Buried */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                When Buried<span className={classes.requiredStar}>*</span>
              </label>
              <input
                type="date"
                name="when_buried"
                value={formData.when_buried}
                onChange={handleInputChange}
                className={`${classes.input} ${formErrors.when_buried ? classes.inputError : ''}`}
                disabled={loading}
              />
              {formErrors.when_buried && <span className={classes.errorText}>{formErrors.when_buried}</span>}
            </div>

            {/* Name of Person Died */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                Name of Person Died<span className={classes.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="name_of_person_died"
                value={formData.name_of_person_died}
                onChange={handleInputChange}
                className={`${classes.input} ${formErrors.name_of_person_died ? classes.inputError : ''}`}
                disabled={loading}
              />
              {formErrors.name_of_person_died && <span className={classes.errorText}>{formErrors.name_of_person_died}</span>}
            </div>

            {/* Sex */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                Sex<span className={classes.requiredStar}>*</span>
              </label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
                className={classes.select}
                disabled={loading}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {formErrors.sex && <span className={classes.errorText}>{formErrors.sex}</span>}
            </div>

            {/* Age */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                Age<span className={classes.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={`${classes.input} ${formErrors.age ? classes.inputError : ''}`}
                disabled={loading}
              />
              {formErrors.age && <span className={classes.errorText}>{formErrors.age}</span>}
            </div>

            {/* Profession */}
            <div className={classes.formGroup}>
              <label className={classes.label}>Profession</label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                className={classes.input}
                disabled={loading}
              />
            </div>

            {/* Cause of Death */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                Cause of Death<span className={classes.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="cause_of_death"
                value={formData.cause_of_death}
                onChange={handleInputChange}
                className={`${classes.input} ${formErrors.cause_of_death ? classes.inputError : ''}`}
                disabled={loading}
              />
              {formErrors.cause_of_death && <span className={classes.errorText}>{formErrors.cause_of_death}</span>}
            </div>
          </div>

          <div className={classes.formGrid}>
            {/* Father Name */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                Father Name<span className={classes.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="father_name"
                value={formData.father_name}
                onChange={handleInputChange}
                className={`${classes.input} ${formErrors.father_name ? classes.inputError : ''}`}
                disabled={loading}
              />
              {formErrors.father_name && <span className={classes.errorText}>{formErrors.father_name}</span>}
            </div>

            {/* Mother Name */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                Mother Name<span className={classes.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleInputChange}
                className={`${classes.input} ${formErrors.mother_name ? classes.inputError : ''}`}
                disabled={loading}
              />
              {formErrors.mother_name && <span className={classes.errorText}>{formErrors.mother_name}</span>}
            </div>
          </div>

          <div className={classes.formGrid}>
            {/* Where Buried */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                Where Buried<span className={classes.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="where_buried"
                value={formData.where_buried}
                onChange={handleInputChange}
                className={`${classes.input} ${formErrors.where_buried ? classes.inputError : ''}`}
                disabled={loading}
              />
              {formErrors.where_buried && <span className={classes.errorText}>{formErrors.where_buried}</span>}
            </div>

            {/* Signature Who Buried */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                Signature of Who Buried<span className={classes.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="signature_who_buried"
                value={formData.signature_who_buried}
                onChange={handleInputChange}
                className={`${classes.input} ${formErrors.signature_who_buried ? classes.inputError : ''}`}
                disabled={loading}
              />
              {formErrors.signature_who_buried && <span className={classes.errorText}>{formErrors.signature_who_buried}</span>}
            </div>
          </div>

          <div className={classes.formGrid}>
            {/* Certified Rev Name */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                Certified Rev Name<span className={classes.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="certified_rev_name"
                value={formData.certified_rev_name}
                onChange={handleInputChange}
                className={`${classes.input} ${formErrors.certified_rev_name ? classes.inputError : ''}`}
                disabled={loading}
              />
              {formErrors.certified_rev_name && <span className={classes.errorText}>{formErrors.certified_rev_name}</span>}
            </div>

            {/* Holding Office */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                Holding Office<span className={classes.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="holding_office"
                value={formData.holding_office}
                onChange={handleInputChange}
                className={`${classes.input} ${formErrors.holding_office ? classes.inputError : ''}`}
                disabled={loading}
              />
              {formErrors.holding_office && <span className={classes.errorText}>{formErrors.holding_office}</span>}
            </div>
          </div>

          <div className={classes.formGrid}>
            {/* Certificate Date */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                Certificate Date<span className={classes.requiredStar}>*</span>
              </label>
              <input
                type="date"
                name="certificate_date"
                value={formData.certificate_date}
                onChange={handleInputChange}
                className={`${classes.input} ${formErrors.certificate_date ? classes.inputError : ''}`}
                disabled={loading}
              />
              {formErrors.certificate_date && <span className={classes.errorText}>{formErrors.certificate_date}</span>}
            </div>

            {/* Certificate Place */}
            <div className={classes.formGroup}>
              <label className={classes.label}>
                Certificate Place<span className={classes.requiredStar}>*</span>
              </label>
              <input
                type="text"
                name="certificate_place"
                value={formData.certificate_place}
                onChange={handleInputChange}
                className={`${classes.input} ${formErrors.certificate_place ? classes.inputError : ''}`}
                disabled={loading}
              />
              {formErrors.certificate_place && <span className={classes.errorText}>{formErrors.certificate_place}</span>}
            </div>
          </div>

          {/* Buttons */}
          <div className={classes.buttonRow}>
            <button className={classes.saveButton} onClick={handleSave} disabled={loading}>
              <SaveRegular />
              {editingId ? 'Update Register' : 'Save Register'}
            </button>
            {editingId && (
              <button className={classes.printButton} onClick={resetForm} disabled={loading}>
                Cancel Edit
              </button>
            )}
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
        currentView="burial-register"
      />
    </div>
  );
}

export default BurialRegisterPage;

