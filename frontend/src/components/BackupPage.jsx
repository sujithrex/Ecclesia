import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  CloudSyncRegular,
  CloudArrowUpRegular,
  CloudDismissRegular,
  CheckmarkCircleRegular,
  DismissCircleRegular,
  ArrowClockwiseRegular,
  PlugDisconnectedRegular,
  WarningRegular
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#faf9f8',
  },
  content: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    paddingBottom: '60px',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    }
  },
  statIcon: {
    fontSize: '32px',
    color: '#B5316A',
  },
  statLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#323130',
    textAlign: 'center',
    fontFamily: 'Pavanam, Segoe UI, sans-serif',
    lineHeight: '1.4',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#B5316A',
  },
  statSubtext: {
    fontSize: '14px',
    color: '#605e5c',
    textAlign: 'center',
  },
  statusConnected: {
    color: '#107C10',
  },
  statusDisconnected: {
    color: '#A4262C',
  },
  buttonRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      transform: 'none',
    }
  },
  primaryButton: {
    backgroundColor: '#B5316A',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#0078D4',
    color: 'white',
  },
  dangerButton: {
    backgroundColor: '#A4262C',
    color: 'white',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
  },
  tableTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f3f2f1',
    borderBottom: '2px solid #e1dfdd',
  },
  tableHeaderCell: {
    padding: '12px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
  },
  tableRow: {
    borderBottom: '1px solid #e1dfdd',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    }
  },
  tableCell: {
    padding: '12px',
    fontSize: '14px',
    color: '#323130',
  },
  restoreButton: {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#0078D4',
    color: 'white',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#106EBE',
    }
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
  notificationInfo: {
    backgroundColor: '#F0F6FF',
    color: '#0078D4',
    border: '1px solid #B3D6FC',
  },
  deleteWarning: {
    backgroundColor: '#FFF4CE',
    border: '1px solid #F7B9B9',
    borderRadius: '4px',
    padding: '16px',
    marginBottom: '16px',
    color: '#323130',
    fontSize: '14px',
  },
  deleteWarningButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  confirmDeleteButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#A4262C',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    '&:hover': {
      backgroundColor: '#8A1F24',
    }
  },
  cancelDeleteButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid #8a8886',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
    color: '#323130',
    '&:hover': {
      backgroundColor: '#f3f2f1',
    }
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#605e5c',
    fontSize: '14px',
  }
});

const BackupPage = ({
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
  
  const [backupStatus, setBackupStatus] = useState({
    isAuthenticated: false,
    googleEmail: null,
    backupCount: 0,
    maxBackups: 50,
    lastBackupTime: null
  });
  
  const [backupHistory, setBackupHistory] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(null);

  useEffect(() => {
    if (user) {
      loadBackupStatus();
      loadBackupHistory();
    }
  }, [user]);

  const loadBackupStatus = async () => {
    try {
      const result = await window.electron.backup.getBackupStatus({ userId: user.id });
      if (result.success) {
        setBackupStatus({
          isAuthenticated: result.isAuthenticated,
          googleEmail: result.googleEmail,
          backupCount: result.backupCount,
          maxBackups: result.maxBackups,
          lastBackupTime: result.lastBackupTime
        });
      }
    } catch (error) {
      console.error('Error loading backup status:', error);
    }
  };

  const loadBackupHistory = async () => {
    try {
      const result = await window.electron.backup.getBackupHistory({ userId: user.id });
      if (result.success) {
        setBackupHistory(result.backups || []);
      }
    } catch (error) {
      console.error('Error loading backup history:', error);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAuthenticate = async () => {
    try {
      setLoading(true);
      const result = await window.electron.backup.authenticate({ userId: user.id });
      
      if (result.success) {
        showNotification('Successfully connected to Google Drive', 'success');
        await loadBackupStatus();
        await loadBackupHistory();
      } else {
        showNotification(result.error || 'Failed to connect to Google Drive', 'error');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      showNotification('Failed to connect to Google Drive', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      const result = await window.electron.backup.disconnect({ userId: user.id });
      
      if (result.success) {
        showNotification('Disconnected from Google Drive', 'success');
        await loadBackupStatus();
        setBackupHistory([]);
      } else {
        showNotification(result.error || 'Failed to disconnect', 'error');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      showNotification('Failed to disconnect', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupNow = async () => {
    try {
      setLoading(true);
      showNotification('Creating backup...', 'info');
      
      const result = await window.electron.backup.triggerManualBackup({ userId: user.id });
      
      if (result.success) {
        showNotification('Backup completed successfully', 'success');
        await loadBackupStatus();
        await loadBackupHistory();
      } else {
        showNotification(result.error || 'Backup failed', 'error');
      }
    } catch (error) {
      console.error('Backup error:', error);
      showNotification('Backup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (backup) => {
    setConfirmRestore(backup);
  };

  const handleConfirmRestore = async () => {
    if (!confirmRestore) return;

    try {
      setLoading(true);
      showNotification('Downloading backup from Google Drive...', 'info');
      
      const result = await window.electron.backup.restoreBackup({
        userId: user.id,
        backupId: confirmRestore.id
      });
      
      if (result.success) {
        // Finalize restore and restart app
        await window.electron.backup.finalizeRestore({
          tempRestorePath: result.tempRestorePath,
          dbPath: result.dbPath
        });
      } else {
        showNotification(result.error || 'Restore failed', 'error');
        setLoading(false);
      }
    } catch (error) {
      console.error('Restore error:', error);
      showNotification('Restore failed', 'error');
      setLoading(false);
    }
  };

  const handleCancelRestore = () => {
    setConfirmRestore(null);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Less than an hour ago';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDateTime(dateString);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckmarkCircleRegular />;
      case 'error':
        return <DismissCircleRegular />;
      case 'info':
      default:
        return <CloudSyncRegular />;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return styles.notificationSuccess;
      case 'error':
        return styles.notificationError;
      case 'info':
      default:
        return styles.notificationInfo;
    }
  };

  return (
    <div className={styles.container}>
      {/* Notification */}
      {notification && (
        <div className={`${styles.notification} ${getNotificationStyle(notification.type)}`}>
          {getNotificationIcon(notification.type)}
          {notification.message}
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle="Backup & Restore"
        breadcrumbs={[
          {
            label: 'Home',
            icon: <HomeRegular />,
            onClick: () => navigate('/pastorate-dashboard')
          },
          {
            label: 'Backup & Restore',
            current: true
          }
        ]}
        onNavigate={(path) => navigate(path)}
      />

      {/* Content */}
      <div className={styles.content}>
        {/* Summary Cards */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              {backupStatus.isAuthenticated ? (
                <CloudSyncRegular className={styles.statusConnected} />
              ) : (
                <CloudDismissRegular className={styles.statusDisconnected} />
              )}
            </div>
            <div className={styles.statLabel}>Connection Status</div>
            <div className={`${styles.statValue} ${backupStatus.isAuthenticated ? styles.statusConnected : styles.statusDisconnected}`}>
              {backupStatus.isAuthenticated ? 'Connected' : 'Not Connected'}
            </div>
            {backupStatus.googleEmail && (
              <div className={styles.statSubtext}>{backupStatus.googleEmail}</div>
            )}
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <CloudArrowUpRegular />
            </div>
            <div className={styles.statLabel}>Backup Count</div>
            <div className={styles.statValue}>
              {backupStatus.backupCount} / {backupStatus.maxBackups}
            </div>
            <div className={styles.statSubtext}>backups available</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <ArrowClockwiseRegular />
            </div>
            <div className={styles.statLabel}>Last Backup</div>
            <div className={styles.statValue} style={{ fontSize: '18px' }}>
              {formatTimeAgo(backupStatus.lastBackupTime)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.buttonRow}>
          {!backupStatus.isAuthenticated ? (
            <button
              className={`${styles.actionButton} ${styles.primaryButton}`}
              onClick={handleAuthenticate}
              disabled={loading}
            >
              <CloudSyncRegular />
              Sign in with Google Drive
            </button>
          ) : (
            <>
              <button
                className={`${styles.actionButton} ${styles.secondaryButton}`}
                onClick={handleBackupNow}
                disabled={loading}
              >
                <CloudArrowUpRegular />
                Backup Now
              </button>
              <button
                className={`${styles.actionButton} ${styles.dangerButton}`}
                onClick={handleDisconnect}
                disabled={loading}
              >
                <PlugDisconnectedRegular />
                Disconnect Google Drive
              </button>
            </>
          )}
        </div>

        {/* Restore Confirmation Warning */}
        {confirmRestore && (
          <div className={styles.deleteWarning}>
            <strong><WarningRegular /> Warning:</strong> Restoring this backup will replace your current database and restart the application. This action cannot be undone. Do you want to continue?
            <div style={{ marginTop: '8px', fontSize: '14px' }}>
              <strong>Backup:</strong> {formatDateTime(confirmRestore.backup_timestamp)}
            </div>
            <div className={styles.deleteWarningButtons}>
              <button className={styles.confirmDeleteButton} onClick={handleConfirmRestore} disabled={loading}>
                Confirm Restore
              </button>
              <button className={styles.cancelDeleteButton} onClick={handleCancelRestore} disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Backup History Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableTitle}>Backup History</div>
          {backupHistory.length === 0 ? (
            <div className={styles.emptyState}>
              {backupStatus.isAuthenticated
                ? 'No backups available yet. Click "Backup Now" to create your first backup.'
                : 'Please sign in with Google Drive to view backup history.'}
            </div>
          ) : (
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>Backup Timestamp</th>
                  <th className={styles.tableHeaderCell}>File Size</th>
                  <th className={styles.tableHeaderCell}>Status</th>
                  <th className={styles.tableHeaderCell}>Type</th>
                  <th className={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backupHistory.map((backup) => (
                  <tr key={backup.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{formatDateTime(backup.backup_timestamp)}</td>
                    <td className={styles.tableCell}>{formatFileSize(backup.file_size)}</td>
                    <td className={styles.tableCell}>
                      <span style={{ color: backup.backup_status === 'success' ? '#107C10' : '#A4262C' }}>
                        {backup.backup_status === 'success' ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className={styles.tableCell}>{backup.backup_type === 'auto' ? 'Automatic' : 'Manual'}</td>
                    <td className={styles.tableCell}>
                      {backup.backup_status === 'success' && (
                        <button
                          className={styles.restoreButton}
                          onClick={() => handleRestoreClick(backup)}
                          disabled={loading}
                        >
                          Restore
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
        currentView="pastorate"
        disableChurchSelector={true}
      />
    </div>
  );
};

export default BackupPage;

