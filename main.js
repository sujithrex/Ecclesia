const { app, BrowserWindow, Menu, nativeTheme, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const DatabaseManager = require('./backend/database.js');
const AuthService = require('./backend/authService.js');
const UserService = require('./backend/userService.js');

let mainWindow;
let db;
let authService;
let userService;

function createWindow() {
  // Force light theme before creating window (if available)
  if (nativeTheme) {
    nativeTheme.themeSource = 'light';
  }
  
  // Remove the menu bar completely
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    icon: path.join(__dirname, 'frontend/src/assets/Church_of_South_India.png'), // CSI logo as app icon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),

    },
    autoHideMenuBar: true, // Hides the menu bar
    frame: false, // Frameless window for custom title bar
    backgroundColor: '#B5316A',
    title: 'Ecclesia',
    show: false // Don't show until ready
  });

  // Always load from built files
  const htmlPath = path.resolve(__dirname, 'frontend', 'dist', 'index.html');
  const fileUrl = `file://${htmlPath.replace(/\\/g, '/')}`;
  console.log('Loading HTML from:', htmlPath);
  console.log('File URL:', fileUrl);
  mainWindow.loadURL(fileUrl);

  // Show window when ready to prevent visual flash and maximize it
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize(); // Maximize the window (not fullscreen)
    mainWindow.show();
    
    
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers for window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// Authentication IPC handlers
ipcMain.handle('auth-login', async (event, { username, password, rememberMe }) => {
  return await authService.login(username, password, rememberMe);
});

ipcMain.handle('auth-logout', async (event) => {
  return await authService.logout();
});

ipcMain.handle('auth-check-session', async (event, sessionId) => {
  return await authService.checkSession(sessionId);
});

ipcMain.handle('auth-forgot-password', async (event, { pin, newPassword }) => {
  return await authService.forgotPassword(pin, newPassword);
});

// User management IPC handlers
ipcMain.handle('user-get-profile', async (event, userId) => {
  return await userService.getProfile(userId);
});

ipcMain.handle('user-update-profile', async (event, { userId, userData }) => {
  return await userService.updateProfile(userId, userData);
});

ipcMain.handle('user-change-password', async (event, { userId, oldPassword, newPassword }) => {
  return await userService.changePassword(userId, oldPassword, newPassword, authService);
});

ipcMain.handle('user-update-pin', async (event, { userId, newPin }) => {
  return await userService.updatePin(userId, newPin);
});

// File management IPC handlers
ipcMain.handle('file-open-image-picker', async (event) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Profile Image',
      filters: [
        {
          name: 'Images',
          extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
        }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      
      // Read the file and convert to base64
      const fileBuffer = await fs.readFile(filePath);
      const base64Data = fileBuffer.toString('base64');
      const fileName = path.basename(filePath);
      const fileExtension = path.extname(filePath).toLowerCase();
      
      return {
        success: true,
        data: {
          fileName,
          fileExtension,
          base64Data,
          mimeType: getMimeType(fileExtension)
        }
      };
    }

    return { success: false, canceled: true };
  } catch (error) {
    console.error('Error opening image picker:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file-save-profile-image', async (event, { userId, imageData }) => {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads', 'profiles');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `profile_${userId}_${timestamp}${imageData.fileExtension}`;
    const filepath = path.join(uploadsDir, filename);
    
    // Save the file
    const buffer = Buffer.from(imageData.base64Data, 'base64');
    await fs.writeFile(filepath, buffer);
    
    return {
      success: true,
      filename,
      path: filepath
    };
  } catch (error) {
    console.error('Error saving profile image:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file-get-image-path', async (event, filename) => {
  try {
    if (!filename) {
      return { success: false, error: 'No filename provided' };
    }
    
    const filepath = path.join(__dirname, 'uploads', 'profiles', filename);
    
    // Check if file exists
    try {
      await fs.access(filepath);
      return {
        success: true,
        path: filepath,
        url: `file://${filepath.replace(/\\/g, '/')}`
      };
    } catch (accessError) {
      return { success: false, error: 'File not found' };
    }
  } catch (error) {
    console.error('Error getting image path:', error);
    return { success: false, error: error.message };
  }
});

// Helper function to get MIME type from file extension
function getMimeType(extension) {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp'
  };
  return mimeTypes[extension] || 'image/jpeg';
}

// Clean up database connection when app quits
app.on('before-quit', () => {
  if (db) {
    db.close();
  }
});

app.on('ready', async () => {
  // Initialize database and services
  db = new DatabaseManager();
  authService = new AuthService(db);
  userService = new UserService(db);
  
  // Wait a moment for database to be ready, then clean expired sessions
  setTimeout(async () => {
    try {
      await db.cleanExpiredSessions();
    } catch (error) {
      console.error('Error cleaning expired sessions:', error);
    }
  }, 1000);
  
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
