import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  CalendarDateRegular,
  SearchRegular,
  FilterRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  PersonRegular,
  ArrowClockwiseRegular,
  DocumentPdfRegular,
  PrintRegular
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';
import { generatePuppeteerBirthdayReport } from '../utils/birthdayReportPuppeteer';

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
  topRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px',
  },
  statsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    }
  },
  statIcon: {
    fontSize: '28px',
    color: '#B5316A',
    flexShrink: 0,
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#605e5c',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#B5316A',
  },
  filterColumn: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  filterTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#323130',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dateRangeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  dateInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #8a8886',
    borderRadius: '4px',
    fontSize: '14px',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
      boxShadow: '0 0 0 2px rgba(181, 49, 106, 0.2)',
    },
  },
  dateLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
    minWidth: '40px',
  },
  areaFilter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #8a8886',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
      boxShadow: '0 0 0 2px rgba(181, 49, 106, 0.2)',
    },
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
  },
  filterButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
  },
  refreshButton: {
    backgroundColor: '#ffffff',
    color: '#B5316A',
    border: '1px solid #B5316A',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  tableSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    display: 'flex',
    flexDirection: 'column',
  },
  tableHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e1dfdd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  tableTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#323130',
    margin: '0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderCell: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '14px',
    color: '#323130',
    borderBottom: '2px solid #e1dfdd',
    backgroundColor: '#fafafa',
  },
  tableRow: {
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#f8f8f8',
    },
    '&:nth-child(even)': {
      backgroundColor: '#fafafa',
    },
    cursor: 'pointer',
  },
  tableCell: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#323130',
    borderBottom: '1px solid #e1dfdd',
  },
  pagination: {
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #e1dfdd',
    backgroundColor: '#fafafa',
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
    backgroundColor: 'white',
    border: '1px solid #8a8886',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
    '&:hover:not(:disabled)': {
      backgroundColor: '#f3f2f1',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  noData: {
    padding: '60px 24px',
    textAlign: 'center',
    color: '#605e5c',
    fontSize: '16px',
  },
  contextMenu: {
    position: 'fixed',
    backgroundColor: 'white',
    border: '1px solid #e1dfdd',
    borderRadius: '4px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    padding: '4px 0',
    zIndex: 1000,
    minWidth: '120px',
  },
  contextMenuItem: {
    padding: '8px 16px',
    fontSize: '14px',
    color: '#323130',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  modalHeader: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  modalCloseButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '16px',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
  },
  loadingSpinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#605e5c',
  },
  reportButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  reportButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#A12B5E',
      transform: 'translateY(-1px)',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      '&:hover': {
        transform: 'none',
        backgroundColor: '#B5316A',
      },
    },
  },
  printButton: {
    backgroundColor: '#B5316A',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
    '&:disabled:hover': {
      backgroundColor: '#B5316A',
    },
  },
});

const BirthdayListPage = ({
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
  const contextMenuRef = useRef(null);

  // State management
  const [birthdays, setBirthdays] = useState([]);
  const [areas, setAreas] = useState([]);
  const [statistics, setStatistics] = useState({ todayCount: 0, thisWeekCount: 0 });
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalFamily, setModalFamily] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const itemsPerPage = 8;

  // Load initial data
  useEffect(() => {
    if (currentChurch && user) {
      loadAreas();
      loadStatistics();
      setDefaultDateRange();
    }
  }, [currentChurch?.id, user?.id]);

  // Load birthdays when filters change
  useEffect(() => {
    if (currentChurch && user && fromDate && toDate) {
      loadBirthdays();
    }
  }, [currentChurch?.id, user?.id, fromDate, toDate, selectedArea]);

  const setDefaultDateRange = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    setFromDate(formatDateForInput(today));
    setToDate(formatDateForInput(nextWeek));
  };

  const formatDateForInput = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}`;
  };

  const loadAreas = async () => {
    try {
      const result = await window.electron.area.getByChurch({
        churchId: currentChurch.id,
        userId: user.id
      });
      if (result.success) {
        setAreas(result.areas || []);
      }
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const result = await window.electron.member.getBirthdayStatistics({
        churchId: currentChurch.id,
        userId: user.id,
        areaId: selectedArea || null
      });
      if (result.success) {
        setStatistics(result.statistics);
      }
    } catch (error) {
      console.error('Error loading birthday statistics:', error);
    }
  };

  const loadBirthdays = async () => {
    setLoading(true);
    try {
      const result = await window.electron.member.getBirthdaysByDateRange({
        churchId: currentChurch.id,
        fromDate,
        toDate,
        userId: user.id,
        areaId: selectedArea || null
      });
      if (result.success) {
        setBirthdays(result.birthdays || []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error loading birthdays:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadStatistics();
    loadBirthdays();
  };

  const handleRightClick = (event, member) => {
    event.preventDefault();
    setSelectedMember(member);
    setContextMenu({
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
    setSelectedMember(null);
  };

  const handleViewFamily = async () => {
    if (selectedMember) {
      try {
        const familyResult = await window.electron.family.getById({
          familyId: selectedMember.family_id,
          userId: user.id
        });
        if (familyResult.success) {
          setModalFamily(familyResult.family);
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error loading family details:', error);
      }
    }
    handleContextMenuClose();
  };

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu && !contextMenuRef.current?.contains(event.target)) {
        handleContextMenuClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu]);

  // Pagination calculations
  const totalPages = Math.ceil(birthdays.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBirthdays = birthdays.slice(startIndex, endIndex);

  const formatBirthdayDate = (dob) => {
    if (!dob) return 'N/A';
    const date = new Date(dob);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    return `${day}-${month}`;
  };

  // Report generation functions
  const handleGenerateReport = async (action = 'download') => {
    if (!fromDate || !toDate) {
      alert('Please select date range first');
      return;
    }

    if (birthdays.length === 0) {
      alert('No birthday data to generate report');
      return;
    }

    setReportLoading(true);
    try {
      // Get detailed report data from backend
      const result = await window.electron.member.getBirthdayReportData({
        churchId: currentChurch.id,
        fromDate,
        toDate,
        userId: user.id,
        areaId: selectedArea || null
      });

      if (result.success) {
        const { church, reportData, dateRange } = result;

        // Generate PDF report using Puppeteer
        const reportResult = await generatePuppeteerBirthdayReport(reportData, church, dateRange, action);

        if (!reportResult.success) {
          alert(`Error ${action === 'download' ? 'saving' : 'printing'} report: ${reportResult.error}`);
        }
      } else {
        alert(`Error generating report data: ${result.error}`);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      alert(`Error generating report: ${error.message}`);
    } finally {
      setReportLoading(false);
    }
  };

  const handleSaveReport = () => handleGenerateReport('download');
  const handlePrintReport = () => handleGenerateReport('print');

  if (!currentChurch || !currentPastorate) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={`Birthday List - ${currentChurch.church_name}`}
        breadcrumbs={[
          {
            label: `${currentPastorate.pastorate_short_name} Dashboard`,
            icon: <HomeRegular />,
            onClick: () => navigate('/pastorate-dashboard')
          },
          {
            label: `${currentChurch.church_name}`,
            onClick: () => navigate('/church-dashboard')
          },
          {
            label: 'Birthday List',
            current: true
          }
        ]}
        onNavigate={(path) => navigate(path)}
      />

      {/* Content */}
      <div className={styles.content}>
        {/* Top Row - Stats and Filters */}
        <div className={styles.topRow}>
          {/* Statistics Column */}
          <div className={styles.statsColumn}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CalendarDateRegular />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>Today's Birthdays</div>
                <div className={styles.statValue}>{statistics.todayCount}</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <CalendarDateRegular />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>This Week Birthdays</div>
                <div className={styles.statValue}>{statistics.thisWeekCount}</div>
              </div>
            </div>
            
            {/* Report Buttons */}
            <div className={styles.reportButtons}>
              <button
                type="button"
                className={`${styles.reportButton}`}
                onClick={handleSaveReport}
                disabled={reportLoading || loading || birthdays.length === 0}
              >
                <DocumentPdfRegular />
                {reportLoading ? 'Generating...' : 'Save Report'}
              </button>
              <button
                type="button"
                className={`${styles.reportButton} ${styles.printButton}`}
                onClick={handlePrintReport}
                disabled={reportLoading || loading || birthdays.length === 0}
              >
                <PrintRegular />
                {reportLoading ? 'Generating...' : 'Print Report'}
              </button>
            </div>
          </div>

          {/* Filter Column */}
          <div className={styles.filterColumn}>
            <h3 className={styles.filterTitle}>
              <FilterRegular />
              Filter Birthdays
            </h3>
            
            <div className={styles.dateRangeContainer}>
              <div className={styles.dateRow}>
                <span className={styles.dateLabel}>From:</span>
                <input
                  type="text"
                  placeholder="DD-MM"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
              <div className={styles.dateRow}>
                <span className={styles.dateLabel}>To:</span>
                <input
                  type="text"
                  placeholder="DD-MM"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
            </div>


            <div className={styles.actionButtons}>
              <button
                type="button"
                className={styles.filterButton}
                onClick={loadBirthdays}
                disabled={loading}
              >
                <SearchRegular />
                Search
              </button>
              <button
                type="button"
                className={styles.refreshButton}
                onClick={handleRefresh}
                disabled={loading}
              >
                <ArrowClockwiseRegular />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Birthday List Table */}
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Birthday List</h2>
            <div className={styles.areaFilter}>
              <label className={styles.filterLabel}>Area:</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className={styles.select}
              >
                <option value="">All Areas</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>
                    {area.area_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className={styles.loadingSpinner}>Loading birthdays...</div>
          ) : currentBirthdays.length > 0 ? (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>Date</th>
                    <th className={styles.tableHeaderCell}>Name</th>
                    <th className={styles.tableHeaderCell}>Age</th>
                    <th className={styles.tableHeaderCell}>Family Head</th>
                    <th className={styles.tableHeaderCell}>Area</th>
                    <th className={styles.tableHeaderCell}>Phone Number</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBirthdays.map((member) => (
                    <tr
                      key={member.id}
                      className={styles.tableRow}
                      onContextMenu={(e) => handleRightClick(e, member)}
                    >
                      <td className={styles.tableCell}>
                        {formatBirthdayDate(member.dob)}
                      </td>
                      <td className={styles.tableCell}>
                        {member.formatted_respect || member.respect}. {member.name}
                      </td>
                      <td className={styles.tableCell}>
                        {member.age || 'N/A'}
                      </td>
                      <td className={styles.tableCell}>
                        {member.family_head}
                      </td>
                      <td className={styles.tableCell}>
                        {member.area_name}
                      </td>
                      <td className={styles.tableCell}>
                        {member.mobile || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {birthdays.length > 0 && (
                <div className={styles.pagination}>
                  <div className={styles.paginationInfo}>
                    Showing {startIndex + 1}-{Math.min(endIndex, birthdays.length)} of {birthdays.length} birthdays
                  </div>
                  {birthdays.length > itemsPerPage && (
                    <div className={styles.paginationButtons}>
                      <button
                        className={styles.paginationButton}
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeftRegular />
                        Previous
                      </button>
                      <span style={{ padding: '6px 12px', fontSize: '14px', color: '#605e5c' }}>
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className={styles.paginationButton}
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRightRegular />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className={styles.noData}>
              No birthdays found for the selected date range and area.
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className={styles.contextMenu}
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className={styles.contextMenuItem} onClick={handleViewFamily}>
            <PersonRegular />
            View Family
          </div>
        </div>
      )}

      {/* Family Details Modal */}
      {showModal && modalFamily && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalHeader}>
              <PersonRegular />
              Family Details
            </h3>
            <div>
              <strong>Family:</strong> {modalFamily.respect}. {modalFamily.family_name}
            </div>
            <div>
              <strong>Family Number:</strong> {modalFamily.family_number}
            </div>
            <div>
              <strong>Address:</strong> {modalFamily.family_address || 'N/A'}
            </div>
            <div>
              <strong>Phone:</strong> {modalFamily.family_phone || 'N/A'}
            </div>
            <div>
              <strong>Email:</strong> {modalFamily.family_email || 'N/A'}
            </div>
            <button
              className={styles.modalCloseButton}
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

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
        currentView="church"
      />
    </div>
  );
};

export default BirthdayListPage;