import React, { useState, useMemo } from 'react';
import { makeStyles } from '@fluentui/react-components';
import {
  EyeRegular,
  EditRegular,
  DeleteRegular,
  SearchRegular,
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
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  actionButton: {
    border: 'none',
    borderRadius: '4px',
    padding: '6px 8px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'background-color 0.2s ease',
  },
  viewButton: {
    backgroundColor: 'transparent',
    color: '#B5316A',
    border: '1px solid #B5316A',
    '&:hover': {
      backgroundColor: 'rgba(181, 49, 106, 0.1)',
    },
  },
  editButton: {
    backgroundColor: 'transparent',
    color: '#B5316A',
    border: '1px solid #B5316A',
    '&:hover': {
      backgroundColor: 'rgba(181, 49, 106, 0.1)',
    },
  },
  deleteButton: {
    backgroundColor: 'transparent',
    color: '#B5316A',
    border: '1px solid #B5316A',
    '&:hover': {
      backgroundColor: 'rgba(181, 49, 106, 0.1)',
    },
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

const PrayerCellsDataGrid = ({ prayerCells, onEdit, onDelete, user, currentChurch, searchTerm = '' }) => {
  const styles = useStyles();
  const [currentPage, setCurrentPage] = useState(1);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, prayerCell: null });
  const itemsPerPage = 7;

  // Filter and paginate data
  const filteredPrayerCells = useMemo(() => {
    return prayerCells.filter(prayerCell =>
      prayerCell.prayer_cell_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prayerCell.prayer_cell_identity.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [prayerCells, searchTerm]);

  const totalPages = Math.ceil(filteredPrayerCells.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPrayerCells = filteredPrayerCells.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (prayerCell) => {
    if (window.confirm(`Are you sure you want to delete the prayer cell "${prayerCell.prayer_cell_name}"?`)) {
      try {
        const result = await window.electron.prayerCell.delete({
          prayerCellId: prayerCell.id,
          userId: user.id
        });
        
        if (result.success) {
          onDelete(prayerCell.id);
        } else {
          console.error('Delete prayer cell error:', result.error);
        }
      } catch (error) {
        console.error('Error deleting prayer cell:', error);
        console.error('Error deleting prayer cell');
      }
    }
  };

  const handleRightClick = (e, prayerCell) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      prayerCell: prayerCell
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, prayerCell: null });
  };

  const handleContextMenuAction = (action, prayerCell) => {
    handleCloseContextMenu();
    switch (action) {
      case 'view':
        // TODO: Implement view functionality
        console.log('View prayer cell:', prayerCell.prayer_cell_name);
        break;
      case 'edit':
        onEdit(prayerCell);
        break;
      case 'delete':
        handleDelete(prayerCell);
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

  if (prayerCells.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateText}>
            No prayer cells created yet. Click "Create Prayer Cell" to add your first prayer cell.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Table */}
      <div className={styles.tableContainer}>
        {filteredPrayerCells.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateText}>
              No prayer cells match your search criteria.
            </div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.headerCell}>Prayer Cell Identity</th>
                <th className={styles.headerCell}>Prayer Cell Name</th>
              </tr>
            </thead>
            <tbody>
              {currentPrayerCells.map((prayerCell) => (
                <tr
                  key={prayerCell.id}
                  className={styles.tableRow}
                  onContextMenu={(e) => handleRightClick(e, prayerCell)}
                >
                  <td className={styles.tableCell}>{prayerCell.prayer_cell_identity}</td>
                  <td className={styles.tableCell}>{prayerCell.prayer_cell_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredPrayerCells.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPrayerCells.length)} of {filteredPrayerCells.length} prayer cells
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
            onClick={() => handleContextMenuAction('view', contextMenu.prayerCell)}
          >
            <EyeRegular />
            View {contextMenu.prayerCell?.prayer_cell_name}
          </div>
          <div
            className={styles.contextMenuItem}
            onClick={() => handleContextMenuAction('edit', contextMenu.prayerCell)}
          >
            <EditRegular />
            Edit
          </div>
          <div
            className={styles.contextMenuItem}
            onClick={() => handleContextMenuAction('delete', contextMenu.prayerCell)}
          >
            <DeleteRegular />
            Delete
          </div>
        </div>
      )}
    </div>
  );
};

export default PrayerCellsDataGrid;