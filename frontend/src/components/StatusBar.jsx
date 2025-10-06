import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@fluentui/react-components';
import {
  BuildingRegular,
  ChevronUpRegular,
  CheckmarkCircleRegular,
  EditRegular,
  DeleteRegular,
  WarningRegular,
  HomeRegular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  statusBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#B5316A',
    color: 'white',
    padding: '8px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 1000,
  },
  statusLeft: {
    fontWeight: '500',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
      opacity: 0.9,
    },
  },
  statusCenter: {
    fontWeight: '600',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  statusRight: {
    fontWeight: '400',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '400',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      opacity: 0.9,
    },
  },
  divider: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  pastorateContainer: {
    position: 'relative',
    display: 'inline-block',
  },
  pastorateSelector: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      textDecoration: 'underline',
    },
  },
  pastorateDropdown: {
    position: 'absolute',
    bottom: '100%',
    left: '0',
    backgroundColor: 'white',
    border: '1px solid #e1dfdd',
    borderRadius: '6px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    minWidth: '280px',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 1001,
    marginBottom: '8px',
  },
  dropdownHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f2f1',
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    borderBottom: '1px solid #f3f2f1',
    gap: '12px',
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  dropdownItemSelected: {
    backgroundColor: '#fef9fc',
    borderLeft: '3px solid #B5316A',
  },
  dropdownItemIcon: {
    fontSize: '16px',
    color: '#B5316A',
    flexShrink: 0,
  },
  dropdownItemContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  dropdownItemName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
  },
  dropdownItemShortName: {
    fontSize: '12px',
    color: '#605e5c',
    fontWeight: '500',
  },
  dropdownItemCheck: {
    fontSize: '16px',
    color: '#B5316A',
    flexShrink: 0,
  },
  createPastorateItem: {
    borderTop: '1px solid #f3f2f1',
    color: '#B5316A',
    fontWeight: '600',
    '&:hover': {
      backgroundColor: '#fef9fc',
    },
  },
  loadingDropdown: {
    padding: '20px',
    textAlign: 'center',
    color: '#605e5c',
  },
  contextMenu: {
    position: 'absolute',
    bottom: '100%',
    left: '0',
    backgroundColor: 'white',
    border: '1px solid #e1dfdd',
    borderRadius: '6px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    minWidth: '160px',
    zIndex: 1002,
    marginBottom: '8px',
    userSelect: 'none',
  },
  contextMenuItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    borderBottom: '1px solid #f3f2f1',
    gap: '12px',
    fontSize: '14px',
    color: '#323130',
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  contextMenuItemDanger: {
    color: '#d13438',
    '&:hover': {
      backgroundColor: '#fdf3f4',
    },
  },
  contextMenuIcon: {
    fontSize: '16px',
    flexShrink: 0,
  },
  confirmationOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  confirmationDialog: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    position: 'relative',
  },
  confirmationTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#323130',
    margin: '0 0 12px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  confirmationMessage: {
    fontSize: '14px',
    color: '#605e5c',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  confirmationButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  confirmationButton: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  confirmationButtonCancel: {
    backgroundColor: 'transparent',
    color: '#323130',
    border: '1px solid #8a8886',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    },
  },
  confirmationButtonDelete: {
    backgroundColor: '#d13438',
    color: 'white',
    '&:hover': {
      backgroundColor: '#b92b2b',
    },
    '&:disabled': {
      backgroundColor: '#a19f9d',
      cursor: 'not-allowed',
    },
  },
});

const StatusBar = ({
  user,
  onLogout,
  onProfileClick,
  currentPastorate,
  userPastorates = [],
  onPastorateChange,
  onCreatePastorate,
  onEditPastorate,
  onDeletePastorate,
  currentChurch,
  userChurches = [],
  onChurchChange,
  onCreateChurch,
  onEditChurch,
  onDeleteChurch,
  disablePastorateChurchChange = false,
  currentView = "church",
  onPastorateDashboard,
  disableChurchSelector = false
}) => {
  const styles = useStyles();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPastorateDropdown, setShowPastorateDropdown] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showChurchDropdown, setShowChurchDropdown] = useState(false);
  const [showChurchContextMenu, setShowChurchContextMenu] = useState(false);
  const [showChurchDeleteConfirmation, setShowChurchDeleteConfirmation] = useState(false);
  const [isDeletingChurch, setIsDeletingChurch] = useState(false);
  const dropdownRef = useRef(null);
  const pastorateButtonRef = useRef(null);
  const contextMenuRef = useRef(null);
  const churchDropdownRef = useRef(null);
  const churchButtonRef = useRef(null);
  const churchContextMenuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle clicking outside dropdown and context menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showPastorateDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        pastorateButtonRef.current &&
        !pastorateButtonRef.current.contains(event.target)
      ) {
        setShowPastorateDropdown(false);
      }

      if (
        showContextMenu &&
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target) &&
        pastorateButtonRef.current &&
        !pastorateButtonRef.current.contains(event.target)
      ) {
        setShowContextMenu(false);
      }

      if (
        showChurchDropdown &&
        churchDropdownRef.current &&
        !churchDropdownRef.current.contains(event.target) &&
        churchButtonRef.current &&
        !churchButtonRef.current.contains(event.target)
      ) {
        setShowChurchDropdown(false);
      }

      if (
        showChurchContextMenu &&
        churchContextMenuRef.current &&
        !churchContextMenuRef.current.contains(event.target) &&
        churchButtonRef.current &&
        !churchButtonRef.current.contains(event.target)
      ) {
        setShowChurchContextMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPastorateDropdown, showContextMenu, showChurchDropdown, showChurchContextMenu]);


  const handlePastorateClick = (e) => {
    if (currentPastorate && !disablePastorateChurchChange) {
      setShowContextMenu(false);
      setShowPastorateDropdown(!showPastorateDropdown);
    }
  };

  const handlePastorateRightClick = (e) => {
    if (currentPastorate && !disablePastorateChurchChange) {
      e.preventDefault();
      e.stopPropagation();
      setShowPastorateDropdown(false);
      setShowContextMenu(true);
    }
  };

  const handleEditPastorate = () => {
    setShowContextMenu(false);
    if (onEditPastorate && currentPastorate) {
      onEditPastorate(currentPastorate);
    }
  };

  const handleDeletePastorate = () => {
    setShowContextMenu(false);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!currentPastorate || isDeleting) return;

    setIsDeleting(true);
    try {
      const result = await window.electron.pastorate.delete({
        pastorateId: currentPastorate.id,
        userId: user.id
      });

      if (result.success) {
        setShowDeleteConfirmation(false);
        if (onDeletePastorate) {
          onDeletePastorate();
        }
      } else {
        // Handle error - you might want to show a notification
        console.error('Delete error:', result.error);
      }
    } catch (error) {
      console.error('Delete pastorate error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handlePastorateSelect = async (pastorate) => {
    if (pastorate.id !== currentPastorate?.id && onPastorateChange) {
      try {
        const result = await window.electron.pastorate.select({
          userId: user.id,
          pastorateId: pastorate.id
        });

        if (result.success) {
          onPastorateChange(result.pastorate);
          setShowPastorateDropdown(false);
        }
      } catch (error) {
        console.error('Switch pastorate error:', error);
      }
    }
  };

  const handleCreatePastorate = () => {
    setShowPastorateDropdown(false);
    if (onCreatePastorate) {
      onCreatePastorate();
    }
  };

  // Church handlers
  const handleChurchClick = (e) => {
    if (currentChurch && !disablePastorateChurchChange) {
      setShowChurchContextMenu(false);
      setShowChurchDropdown(!showChurchDropdown);
    }
  };

  const handleChurchRightClick = (e) => {
    if (currentChurch && !disablePastorateChurchChange) {
      e.preventDefault();
      e.stopPropagation();
      setShowChurchDropdown(false);
      setShowChurchContextMenu(true);
    }
  };

  const handleEditChurch = () => {
    setShowChurchContextMenu(false);
    if (onEditChurch && currentChurch) {
      onEditChurch(currentChurch);
    }
  };

  const handleDeleteChurch = () => {
    setShowChurchContextMenu(false);
    setShowChurchDeleteConfirmation(true);
  };

  const handleConfirmDeleteChurch = async () => {
    if (!currentChurch || isDeletingChurch) return;

    setIsDeletingChurch(true);
    try {
      const result = await window.electron.church.delete({
        churchId: currentChurch.id,
        userId: user.id
      });

      if (result.success) {
        setShowChurchDeleteConfirmation(false);
        if (onDeleteChurch) {
          onDeleteChurch();
        }
      } else {
        // Handle error - you might want to show a notification
        console.error('Delete church error:', result.error);
      }
    } catch (error) {
      console.error('Delete church error:', error);
    } finally {
      setIsDeletingChurch(false);
    }
  };

  const handleCancelDeleteChurch = () => {
    setShowChurchDeleteConfirmation(false);
  };

  const handleChurchSelect = async (church) => {
    // Switch church if it's different OR if we're currently in pastorate view
    if ((church.id !== currentChurch?.id || currentView === "pastorate") && onChurchChange) {
      try {
        const result = await window.electron.church.select({
          userId: user.id,
          churchId: church.id
        });

        if (result.success) {
          onChurchChange(result.church);
          setShowChurchDropdown(false);
        }
      } catch (error) {
        console.error('Switch church error:', error);
      }
    } else {
      // Just close dropdown if same church is selected and we're already in church view
      setShowChurchDropdown(false);
    }
  };

  const handleCreateChurch = () => {
    setShowChurchDropdown(false);
    if (onCreateChurch) {
      onCreateChurch();
    }
  };

  const handlePastorateDashboard = () => {
    setShowChurchDropdown(false);
    if (onPastorateDashboard) {
      onPastorateDashboard();
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick && user) {
      onProfileClick();
    }
  };

  return (
    <div className={styles.statusBar}>
      <span
        className={styles.statusLeft}
        onClick={handleProfileClick}
        style={{ cursor: (user && onProfileClick) ? 'pointer' : 'default' }}
        title={user && onProfileClick ? 'Click to view profile' : (user ? 'Profile' : '')}
      >
        {user ? user.name || user.username : 'Ready'}
      </span>
      
      {/* Center section with pastorate and church info */}
      <div className={styles.statusCenter}>
        {currentPastorate ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Pastorate Selector */}
            <div className={styles.pastorateContainer}>
              <button
                ref={pastorateButtonRef}
                className={styles.pastorateSelector}
                onClick={handlePastorateClick}
                onContextMenu={handlePastorateRightClick}
                title={disablePastorateChurchChange ? currentPastorate.pastorate_name : "Click to switch pastorate or right-click for options"}
                style={{
                  cursor: disablePastorateChurchChange ? 'default' : 'pointer',
                  opacity: disablePastorateChurchChange ? 0.7 : 1
                }}
              >
                <BuildingRegular />
                Pastorate: {currentPastorate.pastorate_name}
                {!disablePastorateChurchChange && <ChevronUpRegular />}
              </button>
            
            {showPastorateDropdown && (
              <div ref={dropdownRef} className={styles.pastorateDropdown}>
                <div className={styles.dropdownHeader}>
                  <BuildingRegular />
                  Switch Pastorate
                </div>
                
                {userPastorates.length === 0 ? (
                  <div className={styles.loadingDropdown}>
                    No pastorates available
                  </div>
                ) : (
                  <>
                    {userPastorates.map((pastorate) => (
                      <div
                        key={pastorate.id}
                        className={`${styles.dropdownItem} ${
                          currentPastorate.id === pastorate.id ? styles.dropdownItemSelected : ''
                        }`}
                        onClick={() => handlePastorateSelect(pastorate)}
                      >
                        <div className={styles.dropdownItemIcon}>
                          <BuildingRegular />
                        </div>
                        <div className={styles.dropdownItemContent}>
                          <div className={styles.dropdownItemName}>
                            {pastorate.pastorate_name}
                          </div>
                        </div>
                        {currentPastorate.id === pastorate.id && (
                          <div className={styles.dropdownItemCheck}>
                            <CheckmarkCircleRegular />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <div
                      className={`${styles.dropdownItem} ${styles.createPastorateItem}`}
                      onClick={handleCreatePastorate}
                    >
                      <div className={styles.dropdownItemIcon}>
                        <BuildingRegular />
                      </div>
                      <div className={styles.dropdownItemContent}>
                        <div className={styles.dropdownItemName}>
                          Create New Pastorate
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {showContextMenu && (
              <div ref={contextMenuRef} className={styles.contextMenu}>
                <div className={styles.contextMenuItem} onClick={handleEditPastorate}>
                  <EditRegular className={styles.contextMenuIcon} />
                  Edit Pastorate
                </div>
                <div
                  className={`${styles.contextMenuItem} ${styles.contextMenuItemDanger}`}
                  onClick={handleDeletePastorate}
                >
                  <DeleteRegular className={styles.contextMenuIcon} />
                  Delete Pastorate
                </div>
              </div>
            )}
            </div>

            {/* Church Selector */}
            {currentChurch ? (
              <div className={styles.pastorateContainer}>
                <button
                  ref={churchButtonRef}
                  className={styles.pastorateSelector}
                  onClick={disableChurchSelector ? undefined : handleChurchClick}
                  onContextMenu={disableChurchSelector ? undefined : handleChurchRightClick}
                  title={disableChurchSelector ? "Pastorate Dashboard" : (disablePastorateChurchChange ? currentChurch.church_name : "Click to switch church or right-click for options")}
                  style={{
                    cursor: disableChurchSelector ? 'default' : (disablePastorateChurchChange ? 'default' : 'pointer'),
                    opacity: disableChurchSelector ? 0.5 : (disablePastorateChurchChange ? 0.7 : 1)
                  }}
                >
                  <BuildingRegular />
                  {currentView === "pastorate" ? "Pastorate Dashboard" : `Church: ${currentChurch.church_name}`}
                  {!disablePastorateChurchChange && !disableChurchSelector && <ChevronUpRegular />}
                </button>

                {showChurchDropdown && !disableChurchSelector && (
                  <div ref={churchDropdownRef} className={styles.pastorateDropdown}>
                    <div className={styles.dropdownHeader}>
                      <BuildingRegular />
                      Switch View
                    </div>
                    
                    {userChurches.length === 0 ? (
                      <div className={styles.loadingDropdown}>
                        No churches available
                      </div>
                    ) : (
                      <>
                        {/* Pastorate Dashboard Option */}
                        <div
                          className={`${styles.dropdownItem} ${
                            currentView === "pastorate" ? styles.dropdownItemSelected : ''
                          }`}
                          onClick={handlePastorateDashboard}
                        >
                          <div className={styles.dropdownItemIcon}>
                            <HomeRegular />
                          </div>
                          <div className={styles.dropdownItemContent}>
                            <div className={styles.dropdownItemName}>
                              Pastorate Dashboard
                            </div>
                          </div>
                          {currentView === "pastorate" && (
                            <div className={styles.dropdownItemCheck}>
                              <CheckmarkCircleRegular />
                            </div>
                          )}
                        </div>

                        {/* Church Options */}
                        {userChurches.map((church) => (
                          <div
                            key={church.id}
                            className={`${styles.dropdownItem} ${
                              currentChurch.id === church.id && currentView === "church" ? styles.dropdownItemSelected : ''
                            }`}
                            onClick={() => handleChurchSelect(church)}
                          >
                            <div className={styles.dropdownItemIcon}>
                              <BuildingRegular />
                            </div>
                            <div className={styles.dropdownItemContent}>
                              <div className={styles.dropdownItemName}>
                                {church.church_name}
                              </div>
                            </div>
                            {currentChurch.id === church.id && currentView === "church" && (
                              <div className={styles.dropdownItemCheck}>
                                <CheckmarkCircleRegular />
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <div
                          className={`${styles.dropdownItem} ${styles.createPastorateItem}`}
                          onClick={handleCreateChurch}
                        >
                          <div className={styles.dropdownItemIcon}>
                            <BuildingRegular />
                          </div>
                          <div className={styles.dropdownItemContent}>
                            <div className={styles.dropdownItemName}>
                              Create New Church
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {showChurchContextMenu && (
                  <div ref={churchContextMenuRef} className={styles.contextMenu}>
                    <div className={styles.contextMenuItem} onClick={handleEditChurch}>
                      <EditRegular className={styles.contextMenuIcon} />
                      Edit Church
                    </div>
                    <div
                      className={`${styles.contextMenuItem} ${styles.contextMenuItemDanger}`}
                      onClick={handleDeleteChurch}
                    >
                      <DeleteRegular className={styles.contextMenuIcon} />
                      Delete Church
                    </div>
                  </div>
                )}
              </div>
            ) : currentPastorate ? (
              <div className={styles.pastorateContainer}>
                <button
                  ref={churchButtonRef}
                  className={styles.pastorateSelector}
                  onClick={handleCreateChurch}
                  title="Click to create your first church"
                >
                  <BuildingRegular />
                  No Church - Click to Create
                </button>
              </div>
            ) : null}
          </div>
        ) : user ? (
          <div className={styles.pastorateContainer}>
            <button
              ref={pastorateButtonRef}
              className={styles.pastorateSelector}
              onClick={handleCreatePastorate}
              title="Click to create your first pastorate"
            >
              <BuildingRegular />
              No Pastorate - Click to Create
            </button>
          </div>
        ) : (
          'rexmi.in'
        )}
      </div>
      
      <div className={styles.statusRight}>
        {user && (
          <>
            <button
              className={styles.logoutButton}
              onClick={handleLogout}
              title="Click to logout"
            >
              Logout
            </button>
            <span className={styles.divider}>|</span>
          </>
        )}
        <span>{formatDateTime(currentTime)}</span>
      </div>

      {showDeleteConfirmation && (
        <div className={styles.confirmationOverlay}>
          <div className={styles.confirmationDialog}>
            <h3 className={styles.confirmationTitle}>
              <WarningRegular style={{ color: '#d13438' }} />
              Confirm Delete
            </h3>
            <p className={styles.confirmationMessage}>
              Are you sure you want to delete the pastorate "{currentPastorate?.pastorate_name}"?
              This action cannot be undone and will remove all associated data.
            </p>
            <div className={styles.confirmationButtons}>
              <button
                className={`${styles.confirmationButton} ${styles.confirmationButtonCancel}`}
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className={`${styles.confirmationButton} ${styles.confirmationButtonDelete}`}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showChurchDeleteConfirmation && (
        <div className={styles.confirmationOverlay}>
          <div className={styles.confirmationDialog}>
            <h3 className={styles.confirmationTitle}>
              <WarningRegular style={{ color: '#d13438' }} />
              Confirm Delete
            </h3>
            <p className={styles.confirmationMessage}>
              Are you sure you want to delete the church "{currentChurch?.church_name}"?
              This action cannot be undone and will remove all associated data.
            </p>
            <div className={styles.confirmationButtons}>
              <button
                className={`${styles.confirmationButton} ${styles.confirmationButtonCancel}`}
                onClick={handleCancelDeleteChurch}
                disabled={isDeletingChurch}
              >
                Cancel
              </button>
              <button
                className={`${styles.confirmationButton} ${styles.confirmationButtonDelete}`}
                onClick={handleConfirmDeleteChurch}
                disabled={isDeletingChurch}
              >
                {isDeletingChurch ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusBar;