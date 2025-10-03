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
import { generatePuppeteerAdultBaptismCertificate, formatDate, formatDateForInput } from '../utils/adultBaptismReportPuppeteer';

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
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    padding: '6px 12px',
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#9a2858',
    },
  },
  deleteButton: {
    backgroundColor: '#d13438',
    '&:hover': {
      backgroundColor: '#a72b2e',
    },
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '16px',
  },
  paginationButton: {
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
  paginationInfo: {
    fontSize: '14px',
    color: '#605e5c',
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
    margin: '0 0 24px 0',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '24px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
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
  formButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
  },
  submitButton: {
    padding: '12px 24px',
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
  errorText: {
    color: '#d13438',
    fontSize: '12px',
    marginTop: '4px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#605e5c',
    fontSize: '14px',
  },
  loadingState: {
    textAlign: 'center',
    padding: '40px',
    color: '#605e5c',
    fontSize: '14px',
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
});

const AdultBaptismPage = ({
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

  // State management
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    certificate_number: '',
    when_baptised: '',
    christian_name: '',
    former_name: '',
    sex: 'male',
    age: '',
    abode: '',
    profession: '',
    father_name: '',
    mother_name: '',
    witness_name_1: '',
    witness_name_2: '',
    witness_name_3: '',
    where_baptised: '',
    signature_who_baptised: '',
    certified_rev_name: '',
    holding_office: '',
    certificate_date: '',
    certificate_place: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const itemsPerPage = 8;

  // Load certificates on mount and when page changes
  useEffect(() => {
    if (currentChurch && user) {
      loadCertificates();
      loadNextCertificateNumber();
    }
  }, [currentChurch?.id, user?.id, currentPage]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const result = await window.electron.adultBaptism.getCertificates({
        churchId: currentChurch.id,
        userId: user.id,
        page: currentPage,
        limit: itemsPerPage
      });

      if (result.success) {
        setCertificates(result.certificates || []);
        setTotalPages(result.pagination.totalPages);
      } else {
        console.error('Error loading certificates:', result.error);
        alert(`Error loading certificates: ${result.error}`);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      alert('Error loading certificates');
    } finally {
      setLoading(false);
    }
  };

  const loadNextCertificateNumber = async () => {
    try {
      const result = await window.electron.adultBaptism.getNextCertificateNumber({
        churchId: currentChurch.id,
        userId: user.id
      });

      if (result.success) {
        setFormData(prev => ({ ...prev, certificate_number: result.certificateNumber }));
      }
    } catch (error) {
      console.error('Error loading next certificate number:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRefresh = () => {
    loadCertificates();
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveCertificate = async () => {
    setSubmitting(true);
    try {
      const result = await window.electron.adultBaptism.createCertificate({
        certificateData: {
          ...formData,
          church_id: currentChurch.id
        },
        userId: user.id
      });

      if (result.success) {
        showNotification('Certificate saved successfully!', 'success');
        // Reset form
        setFormData({
          certificate_number: '',
          when_baptised: '',
          christian_name: '',
          former_name: '',
          sex: 'male',
          age: '',
          abode: '',
          profession: '',
          father_name: '',
          mother_name: '',
          witness_name_1: '',
          witness_name_2: '',
          witness_name_3: '',
          where_baptised: '',
          signature_who_baptised: '',
          certified_rev_name: '',
          holding_office: '',
          certificate_date: '',
          certificate_place: ''
        });
        setFormErrors({});
        // Reload certificates and get next number
        loadCertificates();
        loadNextCertificateNumber();
      } else {
        showNotification(`Error saving certificate: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error saving certificate:', error);
      showNotification('Error saving certificate', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGeneratePDF = async () => {
    setSubmitting(true);
    try {
      // First save the certificate
      const saveResult = await window.electron.adultBaptism.createCertificate({
        certificateData: {
          ...formData,
          church_id: currentChurch.id
        },
        userId: user.id
      });

      if (!saveResult.success) {
        showNotification(`Error saving certificate: ${saveResult.error}`, 'error');
        return;
      }

      // Then generate PDF
      const pdfResult = await generatePuppeteerAdultBaptismCertificate(
        { ...formData, church_id: currentChurch.id },
        currentChurch,
        'view'
      );

      if (pdfResult.success) {
        showNotification('Certificate generated successfully!', 'success');
        // Reset form
        setFormData({
          certificate_number: '',
          when_baptised: '',
          christian_name: '',
          former_name: '',
          sex: 'male',
          age: '',
          abode: '',
          profession: '',
          father_name: '',
          mother_name: '',
          witness_name_1: '',
          witness_name_2: '',
          witness_name_3: '',
          where_baptised: '',
          signature_who_baptised: '',
          certified_rev_name: '',
          holding_office: '',
          certificate_date: '',
          certificate_place: ''
        });
        setFormErrors({});
        // Reload certificates and get next number
        loadCertificates();
        loadNextCertificateNumber();
      } else {
        showNotification(`Error generating PDF: ${pdfResult.error}`, 'error');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification('Error generating PDF', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintCertificate = async (certificate) => {
    try {
      const result = await generatePuppeteerAdultBaptismCertificate(
        certificate,
        currentChurch,
        'print'
      );

      if (!result.success) {
        showNotification(`Error printing certificate: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error printing certificate:', error);
      showNotification('Error printing certificate', 'error');
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    try {
      const result = await window.electron.adultBaptism.deleteCertificate({
        certificateId,
        userId: user.id
      });

      if (result.success) {
        showNotification('Certificate deleted successfully', 'success');
        loadCertificates();
      } else {
        showNotification(`Error deleting certificate: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting certificate:', error);
      showNotification('Error deleting certificate', 'error');
    }
  };

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
    <div className={styles.container}>
      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${
          notification.type === 'success'
            ? styles.notificationSuccess
            : styles.notificationError
        }`}>
          {notification.type === 'success' ? (
            <CheckmarkCircleRegular />
          ) : (
            <DismissCircleRegular />
          )}
          {notification.message}
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle="Adult Baptism Certificate"
        breadcrumbs={[
          {
            label: `${currentPastorate?.pastorate_short_name || 'Pastorate'} Dashboard`,
            icon: <HomeRegular />,
            onClick: () => navigate('/pastorate-dashboard')
          },
          {
            label: 'Adult Baptism Certificate',
            current: true
          }
        ]}
        onNavigate={(path) => navigate(path)}
      />

      {/* Content */}
      <div className={styles.content}>

        {/* Previous Records Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Previous Records</h2>
            <button className={styles.refreshButton} onClick={handleRefresh}>
              <ArrowClockwiseRegular fontSize={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className={styles.loadingState}>Loading certificates...</div>
          ) : certificates.length === 0 ? (
            <div className={styles.emptyState}>No certificates found</div>
          ) : (
            <>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.th}>Number</th>
                    <th className={styles.th}>Name</th>
                    <th className={styles.th}>Certified Rev Name</th>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert.id}>
                      <td className={styles.td}>{cert.certificate_number}</td>
                      <td className={styles.td}>{cert.christian_name}</td>
                      <td className={styles.td}>{cert.certified_rev_name}</td>
                      <td className={styles.td}>{formatDate(cert.certificate_date)}</td>
                      <td className={styles.td}>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.actionButton}
                            onClick={() => handlePrintCertificate(cert)}
                          >
                            <PrintRegular fontSize={14} />
                            Print
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDeleteCertificate(cert.id)}
                          >
                            <DeleteRegular fontSize={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftRegular fontSize={16} />
                  Previous
                </button>
                <span className={styles.paginationInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className={styles.paginationButton}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRightRegular fontSize={16} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Generate Certificate Form */}
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Generate Certificate</h2>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Certificate Number *</label>
              <input
                type="text"
                name="certificate_number"
                value={formData.certificate_number}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Certificate Number"
              />
              {formErrors.certificate_number && (
                <span className={styles.errorText}>{formErrors.certificate_number}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>When Baptised *</label>
              <input
                type="date"
                name="when_baptised"
                value={formData.when_baptised}
                onChange={handleInputChange}
                className={styles.input}
              />
              {formErrors.when_baptised && (
                <span className={styles.errorText}>{formErrors.when_baptised}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Christian Name *</label>
              <input
                type="text"
                name="christian_name"
                value={formData.christian_name}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Christian Name"
              />
              {formErrors.christian_name && (
                <span className={styles.errorText}>{formErrors.christian_name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Former Name *</label>
              <input
                type="text"
                name="former_name"
                value={formData.former_name}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Former Name"
              />
              {formErrors.former_name && (
                <span className={styles.errorText}>{formErrors.former_name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Sex *</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {formErrors.sex && (
                <span className={styles.errorText}>{formErrors.sex}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Age *</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Age"
                min="1"
              />
              {formErrors.age && (
                <span className={styles.errorText}>{formErrors.age}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Abode *</label>
              <input
                type="text"
                name="abode"
                value={formData.abode}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Abode"
              />
              {formErrors.abode && (
                <span className={styles.errorText}>{formErrors.abode}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Profession</label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Profession"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Father Name *</label>
              <input
                type="text"
                name="father_name"
                value={formData.father_name}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Father Name"
              />
              {formErrors.father_name && (
                <span className={styles.errorText}>{formErrors.father_name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Mother Name *</label>
              <input
                type="text"
                name="mother_name"
                value={formData.mother_name}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Mother Name"
              />
              {formErrors.mother_name && (
                <span className={styles.errorText}>{formErrors.mother_name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Witness 1 *</label>
              <input
                type="text"
                name="witness_name_1"
                value={formData.witness_name_1}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Witness 1"
              />
              {formErrors.witness_name_1 && (
                <span className={styles.errorText}>{formErrors.witness_name_1}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Witness 2 *</label>
              <input
                type="text"
                name="witness_name_2"
                value={formData.witness_name_2}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Witness 2"
              />
              {formErrors.witness_name_2 && (
                <span className={styles.errorText}>{formErrors.witness_name_2}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Witness 3 *</label>
              <input
                type="text"
                name="witness_name_3"
                value={formData.witness_name_3}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Witness 3"
              />
              {formErrors.witness_name_3 && (
                <span className={styles.errorText}>{formErrors.witness_name_3}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Where Baptised *</label>
              <input
                type="text"
                name="where_baptised"
                value={formData.where_baptised}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Where Baptised"
              />
              {formErrors.where_baptised && (
                <span className={styles.errorText}>{formErrors.where_baptised}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Signature of Who Baptised *</label>
              <input
                type="text"
                name="signature_who_baptised"
                value={formData.signature_who_baptised}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Signature"
              />
              {formErrors.signature_who_baptised && (
                <span className={styles.errorText}>{formErrors.signature_who_baptised}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Certified Rev Name *</label>
              <input
                type="text"
                name="certified_rev_name"
                value={formData.certified_rev_name}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Rev Name"
              />
              {formErrors.certified_rev_name && (
                <span className={styles.errorText}>{formErrors.certified_rev_name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Holding Office *</label>
              <input
                type="text"
                name="holding_office"
                value={formData.holding_office}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Holding Office"
              />
              {formErrors.holding_office && (
                <span className={styles.errorText}>{formErrors.holding_office}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Certificate Date *</label>
              <input
                type="date"
                name="certificate_date"
                value={formData.certificate_date}
                onChange={handleInputChange}
                className={styles.input}
              />
              {formErrors.certificate_date && (
                <span className={styles.errorText}>{formErrors.certificate_date}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Certificate Place *</label>
              <input
                type="text"
                name="certificate_place"
                value={formData.certificate_place}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Place"
              />
              {formErrors.certificate_place && (
                <span className={styles.errorText}>{formErrors.certificate_place}</span>
              )}
            </div>
          </div>

          <div className={styles.formButtons}>
            <button
              className={styles.submitButton}
              onClick={handleSaveCertificate}
              disabled={submitting}
            >
              <SaveRegular fontSize={16} />
              Save Certificate
            </button>
            <button
              className={styles.submitButton}
              onClick={handleGeneratePDF}
              disabled={submitting}
            >
              <PrintRegular fontSize={16} />
              Generate PDF
            </button>
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
        currentView="adult-baptism"
      />
    </div>
  );
};

export default AdultBaptismPage;

