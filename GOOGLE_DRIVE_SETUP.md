# Google Drive Backup Setup Instructions

This document provides instructions for setting up Google Drive integration for the Ecclesia application's backup and restore feature.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "Ecclesia Backup")
5. Click "Create"

## Step 2: Enable Google Drive API

1. In the Google Cloud Console, select your project
2. Go to "APIs & Services" > "Library"
3. Search for "Google Drive API"
4. Click on "Google Drive API"
5. Click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Ecclesia Backup
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Search for "Google Drive API" and select the scope:
   - `.../auth/drive.file` (View and manage Google Drive files and folders that you have opened or created with this app)
8. Click "Update" and then "Save and Continue"
9. On the "Test users" page, add your email address as a test user
10. Click "Save and Continue"
11. Review the summary and click "Back to Dashboard"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Desktop app" as the application type
4. Enter a name (e.g., "Ecclesia Desktop Client")
5. Click "Create"
6. A dialog will appear with your **Client ID** and **Client Secret**
7. **IMPORTANT**: Copy both values - you'll need them in the next step

## Step 5: Add Credentials to the Application

1. Open the file `backend/googleDriveService.js` in your code editor
2. Find lines 14-15 where the credentials are defined:
   ```javascript
   this.CLIENT_ID = ''; // TODO: Add your Google OAuth2 Client ID
   this.CLIENT_SECRET = ''; // TODO: Add your Google OAuth2 Client Secret
   ```
3. Replace the empty strings with your credentials:
   ```javascript
   this.CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
   this.CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
   ```
4. Save the file

## Step 6: Rebuild the Application

After adding your credentials, rebuild the application:

```bash
npm run build
```

## Step 7: Test the Integration

1. Launch the Ecclesia application
2. Log in with your credentials
3. Click on "Backup" in the bottom status bar
4. Click "Sign in with Google Drive"
5. A browser window will open asking you to authorize the application
6. Select your Google account and grant the requested permissions
7. After successful authorization, you'll be redirected back to the application
8. The first backup will be created automatically

## Security Notes

### For Development
- The credentials in `googleDriveService.js` are sufficient for development and testing
- Make sure to add `backend/googleDriveService.js` to `.gitignore` if you plan to share your code publicly

### For Production
- **DO NOT** commit your OAuth credentials to version control
- Consider using environment variables to store credentials:
  1. Create a `.env` file in the project root (add it to `.gitignore`)
  2. Add your credentials to the `.env` file:
     ```
     GOOGLE_CLIENT_ID=your_client_id_here
     GOOGLE_CLIENT_SECRET=your_client_secret_here
     ```
  3. Install `dotenv` package: `npm install dotenv`
  4. Modify `backend/googleDriveService.js` to use environment variables:
     ```javascript
     require('dotenv').config();
     
     this.CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
     this.CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
     ```

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Make sure you've enabled the Google Drive API in your Google Cloud project
- Verify that the OAuth consent screen is properly configured
- Check that you've added yourself as a test user

### "redirect_uri_mismatch" error
- The redirect URI in the code is `http://localhost:3000/oauth2callback`
- This should work for desktop applications, but if you encounter issues:
  1. Go to Google Cloud Console > Credentials
  2. Edit your OAuth 2.0 Client ID
  3. Add `http://localhost:3000/oauth2callback` to the "Authorized redirect URIs"

### "Invalid grant" error
- This usually means the refresh token has expired or been revoked
- Click "Disconnect Google Drive" in the Backup page
- Sign in again to generate a new refresh token

### Backup fails with "Quota exceeded"
- Google Drive has storage limits based on your account type
- Free accounts get 15 GB of storage shared across Gmail, Drive, and Photos
- Consider upgrading to Google One for more storage

## Feature Overview

### Automatic Backups
- Backups are created automatically every 24 hours after the last backup
- The first backup is created immediately after signing in with Google Drive
- Backups run in the background and don't interrupt your work

### Manual Backups
- Click "Backup Now" to create a backup at any time
- Useful before making major changes to your data

### Backup Retention
- The application keeps a maximum of 50 backups
- When the limit is reached, the oldest backup is automatically deleted
- This helps manage your Google Drive storage

### Restore Functionality
- Click "Restore" next to any successful backup in the history table
- A confirmation dialog will appear warning you about the consequences
- After confirming, the application will:
  1. Download the backup from Google Drive
  2. Validate the backup file
  3. Replace the current database
  4. Restart the application automatically

### Security
- Refresh tokens are encrypted using AES-256-CBC encryption before being stored in the database
- Only files created by the Ecclesia application are accessible (using the `drive.file` scope)
- The application cannot access other files in your Google Drive

## Support

If you encounter any issues not covered in this guide, please:
1. Check the application logs for error messages
2. Verify your Google Cloud project settings
3. Ensure your Google account has sufficient Drive storage
4. Contact the development team for assistance

