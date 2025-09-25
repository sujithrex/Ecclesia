import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  EyeRegular,
  EditRegular,
  DeleteRegular,
  ChevronLeftRegular,
  ChevronRightRegular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  tableContainer: {
    flex: 1,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  tableHeader: {
    backgroundColor: '#f3f2f1',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  headerCell: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#323130',
    borderBottom: '2px solid #e1dfdd',
    whiteSpace: 'nowrap',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: '#f8f8f8',
    },
    '&:nth-child(even)': {
      backgroundColor: '#fafafa',
    },
  },
  tableCell: {
    padding: '12px 16px',
    borderBottom: '1px solid #e1dfdd',
    color: '#323130',
    verticalAlign: 'middle',
  },
  familyName: {
    fontWeight: '600',
  },
  notes: {
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  prayerPoints: {
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  contextMenu: {
    position: 'absolute',
    backgroundColor: 'white',
    border: '1px solid #e1dfdd',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    padding: '4px 0',
    zIndex: 1000,
    minWidth: '150px',
  },
  contextMenuItem: {
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#323130',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderTop: '1px solid #e1dfdd',
    backgroundColor: '#fafafa',
  },
  paginationInfo: {
    fontSize: '14px',
    color: '#605e5c',
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  paginationButton: {
    border: '1px solid #8a8886',
    borderRadius: '4px',
    padding: '6px 8px',
    backgroundColor: 'white',
    color: '#323130',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    '&:hover:not(:disabled)': {
      backgroundColor: '#f3f2f1',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: '#605e5c',
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: '16px',
    marginTop: '16px',
  },
});

const FamiliesDataGrid = ({ families, onEdit, onDelete, user, currentArea, searchTerm = '' }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, family: null });
  const itemsPerPage = 7;

  // Filter and paginate data
  const filteredFamilies = useMemo(() => {
    return families.filter(family => {
      const fullName = `${family.respect}. ${family.family_name}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return fullName.includes(searchLower) ||
             family.family_number.includes(searchTerm) ||
             family.layout_number.includes(searchTerm) ||
             (family.family_phone && family.family_phone.toLowerCase().includes(searchLower)) ||
             (family.notes && family.notes.toLowerCase().includes(searchLower)) ||
             (family.prayer_points && family.prayer_points.toLowerCase().includes(searchLower));
    });
  }, [families, searchTerm]);

  const totalPages = Math.ceil(filteredFamilies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFamilies = filteredFamilies.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatFamilyName = (family) => {
    const respect = family.respect.charAt(0).toUpperCase() + family.respect.slice(1);
    return `${respect}. ${family.family_name}`;
  };

  const handleDelete = async (family) => {
    if (window.confirm(`Are you sure you want to delete the family "${formatFamilyName(family)}"?`)) {
      try {
        const result = await window.electron.family.delete({
          familyId: family.id,
          userId: user.id
        });
        
        if (result.success) {
          onDelete(family.id);
        } else {
          console.error('Delete family error:', result.error);
        }
      } catch (error) {
        console.error('Error deleting family:', error);
        console.error('Error deleting family');
      }
    }
  };

  const handleRightClick = (e, family) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      family: family
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, family: null });
  };

  const handleContextMenuAction = (action, family) => {
    handleCloseContextMenu();
    switch (action) {
      case 'view':
        navigate(`/area/${currentArea.id}/family/${family.id}`);
        break;
      case 'edit':
        onEdit(family);
        break;
      case 'delete':
        handleDelete(family);
        break;
    }
  };

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        handleCloseContextMenu();
      }
    };
    
    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.visible]);

  if (families.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateText}>
            No families created yet. Click "Create Family" to add your first family.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Table */}
      <div className={styles.tableContainer}>
        {filteredFamilies.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateText}>
              No families match your search criteria.
            </div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.headerCell}>Family Number</th>
                <th className={styles.headerCell}>Name</th>
                <th className={styles.headerCell}>Phone Number</th>
                <th className={styles.headerCell}>Layout Number</th>
                <th className={styles.headerCell}>Notes</th>
                <th className={styles.headerCell}>Prayer Points</th>
              </tr>
            </thead>
            <tbody>
              {currentFamilies.map((family) => (
                <tr
                  key={family.id}
                  className={styles.tableRow}
                  onContextMenu={(e) => handleRightClick(e, family)}
                >
                  <td className={styles.tableCell}>{family.family_number}</td>
                  <td className={`${styles.tableCell} ${styles.familyName}`}>
                    {formatFamilyName(family)}
                  </td>
                  <td className={styles.tableCell}>{family.family_phone || '-'}</td>
                  <td className={styles.tableCell}>{family.layout_number}</td>
                  <td className={`${styles.tableCell} ${styles.notes}`} title={family.notes}>
                    {family.notes || '-'}
                  </td>
                  <td className={`${styles.tableCell} ${styles.prayerPoints}`} title={family.prayer_points}>
                    {family.prayer_points || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredFamilies.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredFamilies.length)} of {filteredFamilies.length} families
          </div>
          <div className={styles.paginationControls}>
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeftRegular />
              Previous
            </button>
            <span style={{ fontSize: '14px', color: '#323130', margin: '0 8px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRightRegular />
            </button>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className={styles.contextMenu}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={styles.contextMenuItem}
            onClick={() => handleContextMenuAction('view', contextMenu.family)}
          >
            <EyeRegular />
            View {contextMenu.family && formatFamilyName(contextMenu.family)}
          </div>
          <div
            className={styles.contextMenuItem}
            onClick={() => handleContextMenuAction('edit', contextMenu.family)}
          >
            <EditRegular />
            Edit
          </div>
          <div
            className={styles.contextMenuItem}
            onClick={() => handleContextMenuAction('delete', contextMenu.family)}
          >
            <DeleteRegular />
            Delete
          </div>
        </div>
      )}
    </div>
  );
};

export default FamiliesDataGrid;