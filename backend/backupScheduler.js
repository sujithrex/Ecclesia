const cron = require('node-cron');

class BackupScheduler {
    constructor(db, backupService) {
        this.db = db;
        this.backupService = backupService;
        this.scheduledTask = null;
        this.isRunning = false;
    }

    // Start the backup scheduler
    start() {
        if (this.scheduledTask) {
            console.log('Backup scheduler already running');
            return;
        }

        // Run every hour to check if backup is needed
        // This allows for 24-hour intervals from the last backup
        this.scheduledTask = cron.schedule('0 * * * *', async () => {
            await this.checkAndPerformBackup();
        });

        console.log('Backup scheduler started - checking every hour');
        
        // Also check immediately on startup (after a delay)
        setTimeout(() => {
            this.checkAndPerformBackup();
        }, 60000); // Wait 1 minute after app start
    }

    // Stop the backup scheduler
    stop() {
        if (this.scheduledTask) {
            this.scheduledTask.stop();
            this.scheduledTask = null;
            console.log('Backup scheduler stopped');
        }
    }

    // Check if backup is needed and perform it
    async checkAndPerformBackup() {
        if (this.isRunning) {
            console.log('Backup already in progress, skipping...');
            return;
        }

        try {
            this.isRunning = true;

            // Get all users (in this app, typically just one admin user)
            const users = await this.getAllAuthenticatedUsers();

            for (const user of users) {
                try {
                    // Check if user is authenticated with Google Drive
                    const authData = await this.db.getGoogleDriveAuth(user.id);
                    
                    if (!authData) {
                        console.log(`User ${user.id} not authenticated with Google Drive, skipping backup`);
                        continue;
                    }

                    // Check if backup is needed (24 hours since last backup)
                    const isNeeded = await this.backupService.isBackupNeeded(user.id);
                    
                    if (isNeeded) {
                        console.log(`Performing automatic backup for user ${user.id}...`);
                        
                        const result = await this.backupService.createBackup(user.id, 'auto');
                        
                        console.log(`Automatic backup completed successfully for user ${user.id}:`, result.fileName);
                    } else {
                        console.log(`Backup not needed yet for user ${user.id}`);
                    }
                } catch (error) {
                    console.error(`Error performing backup for user ${user.id}:`, error);
                    // Continue with next user
                }
            }
        } catch (error) {
            console.error('Error in backup scheduler:', error);
        } finally {
            this.isRunning = false;
        }
    }

    // Get all users who have authenticated with Google Drive
    async getAllAuthenticatedUsers() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT DISTINCT u.id, u.username, u.name
                FROM users u
                INNER JOIN google_drive_auth gda ON u.id = gda.user_id
            `;
            
            this.db.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    // Manually trigger backup for a user
    async triggerManualBackup(userId) {
        try {
            console.log(`Triggering manual backup for user ${userId}...`);
            
            const result = await this.backupService.createBackup(userId, 'manual');
            
            console.log(`Manual backup completed successfully for user ${userId}:`, result.fileName);
            
            return result;
        } catch (error) {
            console.error(`Error performing manual backup for user ${userId}:`, error);
            throw error;
        }
    }
}

module.exports = BackupScheduler;

