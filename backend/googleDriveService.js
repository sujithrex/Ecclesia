const { google } = require('googleapis');
const crypto = require('crypto');
const { BrowserWindow } = require('electron');

class GoogleDriveService {
    constructor(db) {
        this.db = db;
        this.oauth2Client = null;
        this.ENCRYPTION_KEY = 'ecclesia-backup-encryption-key-32b'; // 32 bytes for AES-256
        this.ENCRYPTION_IV_LENGTH = 16;
        
        // OAuth2 credentials - These should be obtained from Google Cloud Console
        // For production, these should be stored securely or in environment variables
        this.CLIENT_ID = ''; // TODO: Add your Google OAuth2 Client ID
        this.CLIENT_SECRET = ''; // TODO: Add your Google OAuth2 Client Secret
        this.REDIRECT_URI = 'http://localhost:3000/oauth2callback';
        this.SCOPES = ['https://www.googleapis.com/auth/drive.file'];
    }

    // Initialize OAuth2 client
    initOAuth2Client() {
        if (!this.oauth2Client) {
            this.oauth2Client = new google.auth.OAuth2(
                this.CLIENT_ID,
                this.CLIENT_SECRET,
                this.REDIRECT_URI
            );
        }
        return this.oauth2Client;
    }

    // Encrypt refresh token
    encryptToken(token) {
        const iv = crypto.randomBytes(this.ENCRYPTION_IV_LENGTH);
        const cipher = crypto.createCipheriv(
            'aes-256-cbc',
            Buffer.from(this.ENCRYPTION_KEY),
            iv
        );
        
        let encrypted = cipher.update(token, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return iv.toString('hex') + ':' + encrypted;
    }

    // Decrypt refresh token
    decryptToken(encryptedToken) {
        const parts = encryptedToken.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            Buffer.from(this.ENCRYPTION_KEY),
            iv
        );
        
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    // Start OAuth2 authentication flow
    async authenticate(userId) {
        try {
            const oauth2Client = this.initOAuth2Client();
            
            // Generate auth URL
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: this.SCOPES,
                prompt: 'consent' // Force consent to get refresh token
            });

            // Create a new browser window for authentication
            const authWindow = new BrowserWindow({
                width: 600,
                height: 700,
                show: true,
                webPreferences: {
                    nodeIntegration: false,
                    contextIsolation: true
                }
            });

            authWindow.loadURL(authUrl);

            // Wait for the redirect with the authorization code
            return new Promise((resolve, reject) => {
                const handleCallback = async (url) => {
                    const urlParams = new URL(url);
                    const code = urlParams.searchParams.get('code');
                    
                    if (code) {
                        authWindow.close();
                        
                        try {
                            // Exchange code for tokens
                            const { tokens } = await oauth2Client.getToken(code);
                            oauth2Client.setCredentials(tokens);
                            
                            // Get user's email
                            const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
                            const userInfo = await oauth2.userinfo.get();
                            
                            // Encrypt refresh token
                            const encryptedRefreshToken = this.encryptToken(tokens.refresh_token);
                            
                            // Calculate token expiry
                            const tokenExpiry = new Date(Date.now() + (tokens.expiry_date || 3600000));
                            
                            // Check/create Ecclesia folder
                            const folderId = await this.ensureEcclesiaFolder(oauth2Client);
                            
                            // Save to database
                            await this.db.saveGoogleDriveAuth(userId, {
                                encrypted_refresh_token: encryptedRefreshToken,
                                access_token: tokens.access_token,
                                token_expiry: tokenExpiry.toISOString(),
                                google_email: userInfo.data.email,
                                drive_folder_id: folderId
                            });
                            
                            resolve({
                                success: true,
                                email: userInfo.data.email,
                                folderId: folderId
                            });
                        } catch (error) {
                            reject(error);
                        }
                    }
                };

                authWindow.webContents.on('will-redirect', (event, url) => {
                    if (url.startsWith(this.REDIRECT_URI)) {
                        handleCallback(url);
                    }
                });

                authWindow.on('closed', () => {
                    reject(new Error('Authentication window closed'));
                });
            });
        } catch (error) {
            console.error('Authentication error:', error);
            throw error;
        }
    }

    // Ensure Ecclesia folder exists in Google Drive
    async ensureEcclesiaFolder(oauth2Client) {
        try {
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            // Search for existing Ecclesia folder
            const response = await drive.files.list({
                q: "name='Ecclesia' and mimeType='application/vnd.google-apps.folder' and trashed=false",
                fields: 'files(id, name)',
                spaces: 'drive'
            });
            
            if (response.data.files && response.data.files.length > 0) {
                // Folder exists
                return response.data.files[0].id;
            } else {
                // Create folder
                const folderMetadata = {
                    name: 'Ecclesia',
                    mimeType: 'application/vnd.google-apps.folder'
                };
                
                const folder = await drive.files.create({
                    resource: folderMetadata,
                    fields: 'id'
                });
                
                return folder.data.id;
            }
        } catch (error) {
            console.error('Error ensuring Ecclesia folder:', error);
            throw error;
        }
    }

    // Get authenticated OAuth2 client for a user
    async getAuthenticatedClient(userId) {
        try {
            const authData = await this.db.getGoogleDriveAuth(userId);
            
            if (!authData) {
                throw new Error('User not authenticated with Google Drive');
            }
            
            const oauth2Client = this.initOAuth2Client();
            
            // Decrypt refresh token
            const refreshToken = this.decryptToken(authData.encrypted_refresh_token);
            
            // Set credentials
            oauth2Client.setCredentials({
                refresh_token: refreshToken,
                access_token: authData.access_token
            });
            
            // Check if token needs refresh
            const now = new Date();
            const expiry = new Date(authData.token_expiry);
            
            if (now >= expiry) {
                // Refresh token
                const { credentials } = await oauth2Client.refreshAccessToken();
                oauth2Client.setCredentials(credentials);
                
                // Update database
                const newExpiry = new Date(Date.now() + (credentials.expiry_date || 3600000));
                await this.db.updateGoogleDriveTokens(
                    userId,
                    credentials.access_token,
                    newExpiry.toISOString()
                );
            }
            
            return { oauth2Client, folderId: authData.drive_folder_id };
        } catch (error) {
            console.error('Error getting authenticated client:', error);
            throw error;
        }
    }

    // Upload backup file to Google Drive
    async uploadBackup(userId, filePath, fileName) {
        try {
            const { oauth2Client, folderId } = await this.getAuthenticatedClient(userId);
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            const fs = require('fs');
            
            const fileMetadata = {
                name: fileName,
                parents: [folderId]
            };
            
            const media = {
                mimeType: 'application/x-sqlite3',
                body: fs.createReadStream(filePath)
            };
            
            const response = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id, size'
            });
            
            return {
                fileId: response.data.id,
                fileSize: parseInt(response.data.size || 0)
            };
        } catch (error) {
            console.error('Error uploading backup:', error);
            throw error;
        }
    }

    // Download backup file from Google Drive
    async downloadBackup(userId, fileId, destinationPath) {
        try {
            const { oauth2Client } = await this.getAuthenticatedClient(userId);
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            const fs = require('fs');
            
            const dest = fs.createWriteStream(destinationPath);
            
            const response = await drive.files.get(
                { fileId: fileId, alt: 'media' },
                { responseType: 'stream' }
            );
            
            return new Promise((resolve, reject) => {
                response.data
                    .on('end', () => {
                        resolve({ success: true });
                    })
                    .on('error', (err) => {
                        reject(err);
                    })
                    .pipe(dest);
            });
        } catch (error) {
            console.error('Error downloading backup:', error);
            throw error;
        }
    }

    // Delete backup file from Google Drive
    async deleteBackup(userId, fileId) {
        try {
            const { oauth2Client } = await this.getAuthenticatedClient(userId);
            const drive = google.drive({ version: 'v3', auth: oauth2Client });
            
            await drive.files.delete({ fileId: fileId });
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting backup:', error);
            throw error;
        }
    }

    // Disconnect Google Drive (revoke access)
    async disconnect(userId) {
        try {
            const authData = await this.db.getGoogleDriveAuth(userId);
            
            if (authData) {
                // Revoke token
                const oauth2Client = this.initOAuth2Client();
                const refreshToken = this.decryptToken(authData.encrypted_refresh_token);
                oauth2Client.setCredentials({ refresh_token: refreshToken });
                
                try {
                    await oauth2Client.revokeCredentials();
                } catch (error) {
                    console.error('Error revoking credentials:', error);
                    // Continue even if revoke fails
                }
                
                // Delete from database
                await this.db.deleteGoogleDriveAuth(userId);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error disconnecting:', error);
            throw error;
        }
    }
}

module.exports = GoogleDriveService;

