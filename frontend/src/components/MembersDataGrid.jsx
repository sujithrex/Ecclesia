import React, { useState, useMemo } from 'react';
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
  memberName: {
    fontWeight: '600',
  },
  relation: {
    maxWidth: '150px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  occupation: {
    maxWidth: '150px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  about: {
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  aboutBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    backgroundColor: '#e1f5fe',
    color: '#0288d1',
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

const MembersDataGrid = ({ members, onView, onEdit, onDelete, user, currentFamily, searchTerm = '' }) => {
  const styles = useStyles();
  const [currentPage, setCurrentPage] = useState(1);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, member: null });
  const itemsPerPage = 7;

  // Helper functions
  const getSpouseName = (member) => {
    if (!member.spouse_id || member.is_married !== 'yes') {
      return null;
    }
    
    const spouse = members.find(m => m.id === member.spouse_id);
    return spouse ? `${spouse.respect.charAt(0).toUpperCase() + spouse.respect.slice(1)}. ${spouse.name}` : null;
  };

  const getMaritalStatus = (member) => {
    if (member.is_married === 'yes') {
      const spouseName = getSpouseName(member);
      return spouseName ? `Married to ${spouseName}` : 'Married';
    }
    return 'Single';
  };

  // Filter and paginate data
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const fullName = `${member.respect}. ${member.name}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const spouseName = getSpouseName(member);
      return fullName.includes(searchLower) ||
             member.member_number.includes(searchTerm) ||
             member.relation.toLowerCase().includes(searchLower) ||
             (member.occupation && member.occupation.toLowerCase().includes(searchLower)) ||
             (member.mobile && member.mobile.toLowerCase().includes(searchLower)) ||
             (spouseName && spouseName.toLowerCase().includes(searchLower));
    });
  }, [members, searchTerm]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatMemberName = (member) => {
    const respect = member.respect.charAt(0).toUpperCase() + member.respect.slice(1);
    return `${respect}. ${member.name}`;
  };

  const getAboutStatus = (member) => {
    const statuses = [];
    if (member.is_baptised === 'yes') {
      statuses.push('Baptised');
    }
    if (member.is_confirmed === 'yes') {
      statuses.push('Confirmed');
    }
    return statuses.length > 0 ? statuses.join(', ') : '-';
  };

  const handleDelete = async (member) => {
    if (window.confirm(`Are you sure you want to delete the member "${formatMemberName(member)}"?`)) {
      try {
        const result = await window.electron.member.delete({
          memberId: member.id,
          userId: user.id
        });
        
        if (result.success) {
          onDelete(member.id);
        } else {
          console.error('Delete member error:', result.error);
        }
      } catch (error) {
        console.error('Error deleting member:', error);
        console.error('Error deleting member');
      }
    }
  };

  const handleRightClick = (e, member) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      member: member
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, member: null });
  };

  const handleContextMenuAction = (action, member) => {
    handleCloseContextMenu();
    switch (action) {
      case 'view':
        onView(member);
        break;
      case 'edit':
        onEdit(member);
        break;
      case 'delete':
        handleDelete(member);
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

  if (members.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateText}>
            No family members added yet. Click "Create Member" to add the first member.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Table */}
      <div className={styles.tableContainer}>
        {filteredMembers.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateText}>
              No members match your search criteria.
            </div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.headerCell}>Member Number</th>
                <th className={styles.headerCell}>Name</th>
                <th className={styles.headerCell}>Age</th>
                <th className={styles.headerCell}>Relation</th>
                <th className={styles.headerCell}>Marital Status</th>
                <th className={styles.headerCell}>Occupation</th>
                <th className={styles.headerCell}>About</th>
              </tr>
            </thead>
            <tbody>
              {currentMembers.map((member) => (
                <tr
                  key={member.id}
                  className={styles.tableRow}
                  onContextMenu={(e) => handleRightClick(e, member)}
                >
                  <td className={styles.tableCell}>{member.member_number}</td>
                  <td className={`${styles.tableCell} ${styles.memberName}`}>
                    {formatMemberName(member)}
                  </td>
                  <td className={styles.tableCell}>{member.age || '-'}</td>
                  <td className={`${styles.tableCell} ${styles.relation}`} title={member.relation}>
                    {member.relation}
                  </td>
                  <td className={`${styles.tableCell} ${styles.relation}`} title={getMaritalStatus(member)}>
                    {getMaritalStatus(member)}
                  </td>
                  <td className={`${styles.tableCell} ${styles.occupation}`} title={member.occupation}>
                    {member.occupation || '-'}
                  </td>
                  <td className={`${styles.tableCell} ${styles.about}`} title={getAboutStatus(member)}>
                    {getAboutStatus(member) !== '-' ? (
                      <span className={styles.aboutBadge}>
                        {getAboutStatus(member)}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredMembers.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
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
            onClick={() => handleContextMenuAction('view', contextMenu.member)}
          >
            <EyeRegular />
            View {contextMenu.member && formatMemberName(contextMenu.member)}
          </div>
          <div
            className={styles.contextMenuItem}
            onClick={() => handleContextMenuAction('edit', contextMenu.member)}
          >
            <EditRegular />
            Edit
          </div>
          <div
            className={styles.contextMenuItem}
            onClick={() => handleContextMenuAction('delete', contextMenu.member)}
          >
            <DeleteRegular />
            Delete
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersDataGrid;