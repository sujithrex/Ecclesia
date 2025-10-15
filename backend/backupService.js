const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class BackupService {
    constructor(db, googleDriveService) {
        this.db = db;
        this.googleDriveService = googleDriveService;
        this.MAX_BACKUPS = 50;
    }

    // Create a backup of the database
    async createBackup(userId, backupType = 'auto') {
        try {
            // Get database path
            const dbPath = this.db.getDbPath();
            
            // Generate backup filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
            const dateStr = timestamp[0].replace(/-/g, '');
            const timeStr = timestamp[1].split('-')[0].replace(/-/g, '');
            const backupFileName = `ecclesia_backup_${dateStr}_${timeStr}.db`;
            
            // Create temporary backup file
            const tempBackupPath = path.join(path.dirname(dbPath), `temp_${backupFileName}`);
            
            // Use SQLite backup API for safe backup
            await this.performSQLiteBackup(dbPath, tempBackupPath);
            
            // Get file size
            const stats = await fs.stat(tempBackupPath);
            const fileSize = stats.size;
            
            // Upload to Google Drive
            const uploadResult = await this.googleDriveService.uploadBackup(
                userId,
                tempBackupPath,
                backupFileName
            );
            
            // Save backup history
            await this.db.createBackupHistory(userId, {
                drive_file_id: uploadResult.fileId,
                file_size: fileSize,
                backup_status: 'success',
                backup_type: backupType
            });
            
            // Clean up temporary file
            await fs.unlink(tempBackupPath);
            
            // Enforce backup limit
            await this.enforceBackupLimit(userId);
            
            return {
                success: true,
                fileName: backupFileName,
                fileSize: fileSize,
                fileId: uploadResult.fileId
            };
        } catch (error) {
            console.error('Backup creation error:', error);
            
            // Log failed backup
            try {
                await this.db.createBackupHistory(userId, {
                    drive_file_id: '',
                    file_size: 0,
                    backup_status: 'failed',
                    backup_type: backupType,
                    error_message: error.message
                });
            } catch (logError) {
                console.error('Error logging failed backup:', logError);
            }
            
            throw error;
        }
    }

    // Perform SQLite backup using file copy
    async performSQLiteBackup(sourcePath, destPath) {
        try {
            // Simply copy the database file
            // SQLite databases are single files, so this is safe when no writes are happening
            await fs.copyFile(sourcePath, destPath);
        } catch (error) {
            console.error('Error copying database file:', error);
            throw error;
        }
    }

    // Enforce maximum backup limit
    async enforceBackupLimit(userId) {
        try {
            const backupCount = await this.db.getBackupCount(userId);
            
            if (backupCount > this.MAX_BACKUPS) {
                const excessCount = backupCount - this.MAX_BACKUPS;
                
                for (let i = 0; i < excessCount; i++) {
                    // Get oldest backup
                    const oldestBackup = await this.db.getOldestBackup(userId);
                    
                    if (oldestBackup) {
                        // Delete from Google Drive
                        try {
                            await this.googleDriveService.deleteBackup(userId, oldestBackup.drive_file_id);
                        } catch (error) {
                            console.error('Error deleting old backup from Drive:', error);
                        }
                        
                        // Delete from database
                        await this.db.deleteBackupHistory(oldestBackup.id);
                    }
                }
            }
        } catch (error) {
            console.error('Error enforcing backup limit:', error);
            // Don't throw - this is cleanup, not critical
        }
    }

    // Restore database from backup
    async restoreBackup(userId, backupId) {
        try {
            // Get backup info
            const backups = await this.db.getBackupHistory(userId, 1000);
            const backup = backups.find(b => b.id === backupId);
            
            if (!backup) {
                throw new Error('Backup not found');
            }
            
            // Get database path
            const dbPath = this.db.getDbPath();
            const tempRestorePath = path.join(path.dirname(dbPath), 'temp_restore.db');
            const backupCurrentPath = path.join(path.dirname(dbPath), 'ecclesia_backup_current.db');
            
            // Download backup from Google Drive
            await this.googleDriveService.downloadBackup(
                userId,
                backup.drive_file_id,
                tempRestorePath
            );
            
            // Validate the downloaded file
            const isValid = await this.validateBackupFile(tempRestorePath);
            
            if (!isValid) {
                await fs.unlink(tempRestorePath);
                throw new Error('Downloaded backup file is corrupted or invalid');
            }
            
            // Create backup of current database
            await fs.copyFile(dbPath, backupCurrentPath);
            
            return {
                success: true,
                tempRestorePath: tempRestorePath,
                backupCurrentPath: backupCurrentPath,
                dbPath: dbPath
            };
        } catch (error) {
            console.error('Restore backup error:', error);
            throw error;
        }
    }

    // Validate backup file
    async validateBackupFile(filePath) {
        return new Promise((resolve) => {
            const db = new sqlite3.Database(filePath, sqlite3.OPEN_READONLY, (err) => {
                if (err) {
                    resolve(false);
                    return;
                }
                
                // Try to query a table to ensure it's a valid database
                db.get("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1", (err, row) => {
                    db.close();
                    
                    if (err) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        });
    }

    // Get backup status
    async getBackupStatus(userId) {
        try {
            const authData = await this.db.getGoogleDriveAuth(userId);
            const backupCount = await this.db.getBackupCount(userId);
            const lastBackupTime = await this.db.getLastBackupTime(userId);
            
            return {
                isAuthenticated: !!authData,
                googleEmail: authData ? authData.google_email : null,
                backupCount: backupCount,
                maxBackups: this.MAX_BACKUPS,
                lastBackupTime: lastBackupTime
            };
        } catch (error) {
            console.error('Error getting backup status:', error);
            throw error;
        }
    }

    // Check if backup is needed (24 hours since last backup)
    async isBackupNeeded(userId) {
        try {
            const lastBackupTime = await this.db.getLastBackupTime(userId);
            
            if (!lastBackupTime) {
                return true; // No backup yet
            }
            
            const lastBackup = new Date(lastBackupTime);
            const now = new Date();
            const hoursSinceLastBackup = (now - lastBackup) / (1000 * 60 * 60);
            
            return hoursSinceLastBackup >= 24;
        } catch (error) {
            console.error('Error checking if backup is needed:', error);
            return false;
        }
    }
}

module.exports = BackupService;

