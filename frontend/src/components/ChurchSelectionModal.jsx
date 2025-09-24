import React, { useState, useEffect } from 'react';
import { makeStyles } from '@fluentui/react-components';
import {
  BuildingRegular,
  CheckmarkCircleRegular,
  DismissCircleRegular,
  DismissRegular,
  PersonRegular
} from '@fluentui/react-icons';
import LoadingSpinner from './LoadingSpinner';

const useStyles = makeStyles({
  overlay: {
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
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '32px',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#323130',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#605e5c',
    padding: '4px',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#f3f2f1',
      color: '#323130',
    },
  },
  description: {
    fontSize: '14px',
    color: '#605e5c',
    marginBottom: '32px',
    lineHeight: '1.5',
  },
  pastorateInfo: {
    backgroundColor: '#f3f2f1',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#323130',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  churchList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },
  churchItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    border: '2px solid #e1dfdd',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
    '&:hover': {
      borderColor: '#B5316A',
      backgroundColor: '#fef9fc',
    },
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
      backgroundColor: '#fef9fc',
    },
  },
  churchItemSelected: {
    borderColor: '#B5316A',
    backgroundColor: '#fef9fc',
    boxShadow: '0 2px 8px rgba(181, 49, 106, 0.2)',
  },
  churchIcon: {
    fontSize: '20px',
    color: '#B5316A',
    marginRight: '16px',
  },
  churchInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  churchName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#323130',
    margin: 0,
  },
  churchShortName: {
    fontSize: '13px',
    color: '#605e5c',
    fontWeight: '500',
  },
  churchMetadata: {
    fontSize: '12px',
    color: '#8a8886',
    marginTop: '2px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#605e5c',
  },
  emptyStateIcon: {
    fontSize: '48px',
    color: '#c8c6c4',
    marginBottom: '16px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'Segoe UI, sans-serif',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
    '&:disabled': {
      backgroundColor: '#a19f9d',
      cursor: 'not-allowed',
    },
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#323130',
    border: '1px solid #8a8886',
    borderRadius: '4px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'Segoe UI, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f3f2f1',
      borderColor: '#605e5c',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  notification: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
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
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
});

const ChurchSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  user, 
  currentPastorate,
  churches: initialChurches, 
  selectedChurchId, 
  onCreateChurch 
}) => {
  const styles = useStyles();
  const [churches, setChurches] = useState(initialChurches || []);
  const [selectedId, setSelectedId] = useState(selectedChurchId || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChurches, setIsLoadingChurches] = useState(!initialChurches);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (isOpen && !initialChurches && user && currentPastorate) {
      loadUserChurches();
    }
  }, [isOpen, user, currentPastorate, initialChurches]);

  useEffect(() => {
    if (selectedChurchId) {
      setSelectedId(selectedChurchId);
    }
  }, [selectedChurchId]);

  const loadUserChurches = async () => {
    if (!user || !currentPastorate) return;
    
    setIsLoadingChurches(true);
    try {
      const result = await window.electron.church.getUserChurchesByPastorate({
        userId: user.id,
        pastorateId: currentPastorate.id
      });
      
      if (result.success) {
        setChurches(result.churches);
        
        // If no churches exist, close this modal and trigger create modal
        if (result.churches.length === 0) {
          onClose();
          if (onCreateChurch) {
            onCreateChurch();
          }
          return;
        }
        
        // Auto-select the first church and immediately proceed
        if (result.churches.length > 0) {
          const churchToSelect = result.churches[0];
          setSelectedId(churchToSelect.id);
          
          // Auto-select immediately without waiting for user interaction
          setTimeout(async () => {
            try {
              const selectResult = await window.electron.church.select({
                userId: user.id,
                churchId: churchToSelect.id
              });
              
              if (selectResult.success) {
                onSelect(selectResult.church);
              }
            } catch (error) {
              console.error('Auto-select church error:', error);
              // If auto-select fails, let user manually select
            }
          }, 500);
        }
      } else {
        showNotification(result.error || 'Failed to load churches', 'error');
      }
    } catch (error) {
      console.error('Load churches error:', error);
      showNotification('Failed to load churches', 'error');
    } finally {
      setIsLoadingChurches(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleChurchClick = (churchId) => {
    if (!isLoading) {
      setSelectedId(churchId);
    }
  };

  const handleSelect = async () => {
    if (!selectedId || !user) {
      showNotification('Please select a church', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await window.electron.church.select({
        userId: user.id,
        churchId: selectedId
      });

      if (result.success) {
        showNotification('Church selected successfully!', 'success');
        setTimeout(() => {
          onSelect(result.church);
        }, 1000);
      } else {
        showNotification(result.error || 'Failed to select church', 'error');
      }
    } catch (error) {
      console.error('Select church error:', error);
      showNotification('Connection error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <BuildingRegular />
            Select Church
          </h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isLoading}
            type="button"
          >
            <DismissRegular />
          </button>
        </div>

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

        {currentPastorate && (
          <div className={styles.pastorateInfo}>
            <BuildingRegular />
            Churches in: <strong>{currentPastorate.pastorate_name}</strong>
          </div>
        )}

        <p className={styles.description}>
          Choose which church you'd like to work with within this pastorate. You can switch between churches anytime from the bottom status bar.
        </p>

        {isLoadingChurches ? (
          <div className={styles.loadingContainer}>
            <LoadingSpinner type="overlay" spinner="clip" text="Loading churches..." />
          </div>
        ) : churches.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <BuildingRegular />
            </div>
            <p>You don't have any churches assigned in this pastorate yet.</p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => {
                onClose();
                if (onCreateChurch) {
                  onCreateChurch();
                }
              }}
              style={{ marginTop: '16px' }}
            >
              Create Your First Church
            </button>
          </div>
        ) : (
          <div className={styles.churchList}>
            {churches.map((church) => (
              <div
                key={church.id}
                className={`${styles.churchItem} ${
                  selectedId === church.id ? styles.churchItemSelected : ''
                }`}
                onClick={() => handleChurchClick(church.id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleChurchClick(church.id);
                  }
                }}
              >
                <div className={styles.churchIcon}>
                  <BuildingRegular />
                </div>
                <div className={styles.churchInfo}>
                  <h3 className={styles.churchName}>
                    {church.church_name}
                  </h3>
                  <div className={styles.churchShortName}>
                    {church.church_short_name}
                  </div>
                  <div className={styles.churchMetadata}>
                    Last selected: {formatDate(church.last_selected_at)}
                    {' • '}
                    Joined: {formatDate(church.assigned_at)}
                  </div>
                </div>
                {selectedId === church.id && (
                  <CheckmarkCircleRegular style={{ color: '#B5316A', fontSize: '20px' }} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleSelect}
            disabled={isLoading || !selectedId || churches.length === 0}
          >
            {isLoading ? (
              <>
                <LoadingSpinner type="button" spinner="beat" size={12} />
                Selecting...
              </>
            ) : (
              'Continue with Selected Church'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChurchSelectionModal;