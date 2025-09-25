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
  searchInputContainer: {
    position: 'relative',
    width: '200px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px 8px 32px',
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
  searchIcon: {
    position: 'absolute',
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#605e5c',
    fontSize: '16px',
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

const AreasDataGrid = ({ areas, onEdit, onDelete, user, currentChurch, searchTerm = '' }) => {
  const styles = useStyles();
  const [currentPage, setCurrentPage] = useState(1);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, area: null });
  const itemsPerPage = 7;

  // Filter and paginate data
  const filteredAreas = useMemo(() => {
    return areas.filter(area =>
      area.area_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.area_identity.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [areas, searchTerm]);

  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAreas = filteredAreas.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (area) => {
    if (window.confirm(`Are you sure you want to delete the area "${area.area_name}"?`)) {
      try {
        const result = await window.electron.area.delete({
          areaId: area.id,
          userId: user.id
        });
        
        if (result.success) {
          onDelete(area.id);
        } else {
          alert(result.error || 'Failed to delete area');
        }
      } catch (error) {
        console.error('Error deleting area:', error);
        alert('Failed to delete area');
      }
    }
  };

  const handleRightClick = (e, area) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      area: area
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, area: null });
  };

  const handleContextMenuAction = (action, area) => {
    handleCloseContextMenu();
    switch (action) {
      case 'view':
        // TODO: Implement view functionality
        console.log('View area:', area.area_name);
        break;
      case 'edit':
        onEdit(area);
        break;
      case 'delete':
        handleDelete(area);
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

  if (areas.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateText}>
            No areas created yet. Click "Create Area" to add your first area.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Table */}
      <div className={styles.tableContainer}>
        {filteredAreas.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateText}>
              No areas match your search criteria.
            </div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.headerCell}>Area Identity</th>
                <th className={styles.headerCell}>Area Name</th>
              </tr>
            </thead>
            <tbody>
              {currentAreas.map((area) => (
                <tr
                  key={area.id}
                  className={styles.tableRow}
                  onContextMenu={(e) => handleRightClick(e, area)}
                >
                  <td className={styles.tableCell}>{area.area_identity}</td>
                  <td className={styles.tableCell}>{area.area_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredAreas.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAreas.length)} of {filteredAreas.length} areas
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
            onClick={() => handleContextMenuAction('view', contextMenu.area)}
          >
            <EyeRegular />
            View {contextMenu.area?.area_name}
          </div>
          <div
            className={styles.contextMenuItem}
            onClick={() => handleContextMenuAction('edit', contextMenu.area)}
          >
            <EditRegular />
            Edit
          </div>
          <div
            className={styles.contextMenuItem}
            onClick={() => handleContextMenuAction('delete', contextMenu.area)}
          >
            <DeleteRegular />
            Delete
          </div>
        </div>
      )}
    </div>
  );
};

export default AreasDataGrid;