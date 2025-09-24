const { app, BrowserWindow, Menu, nativeTheme, ipcMain } = require('electron');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const DatabaseManager = require('./database');

let mainWindow;
let db;
let currentSession = null;

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
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true, // Hides the menu bar
    frame: false, // Frameless window for custom title bar
    backgroundColor: '#B5316A',
    title: 'Ecclesia',
    show: false // Don't show until ready
  });

  mainWindow.loadFile(path.join(__dirname, 'frontend/dist/index.html'));

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
  try {
    const user = await db.getUserByUsername(username);
    
    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Create session if remember me is checked
    if (rememberMe) {
      const sessionId = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
      
      const sessionResult = await db.createSession(sessionId, user.id, expiresAt.toISOString());
      if (sessionResult.success) {
        currentSession = sessionId;
      }
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      user: userWithoutPassword,
      sessionId: currentSession
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
});

ipcMain.handle('auth-logout', async (event) => {
  try {
    if (currentSession) {
      await db.deleteSession(currentSession);
      currentSession = null;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
});

ipcMain.handle('auth-check-session', async (event, sessionId) => {
  try {
    if (!sessionId) {
      return { success: false, error: 'No session ID provided' };
    }

    const session = await db.getSession(sessionId);
    
    if (!session) {
      return { success: false, error: 'Invalid or expired session' };
    }

    currentSession = sessionId;
    
    // Return user data
    const userData = {
      id: session.user_id,
      username: session.username,
      name: session.name,
      email: session.email,
      phone: session.phone,
      image: session.image
    };

    return {
      success: true,
      user: userData
    };
  } catch (error) {
    console.error('Session check error:', error);
    return { success: false, error: 'Session validation failed' };
  }
});

ipcMain.handle('auth-forgot-password', async (event, { pin, newPassword }) => {
  try {
    const user = await db.getUserByResetPin(pin);
    
    if (!user) {
      return { success: false, error: 'Invalid PIN' };
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const result = await db.updatePassword(user.id, hashedPassword);
    
    if (result.success) {
      // Clear all existing sessions for this user
      await db.deleteUserSessions(user.id);
      
      return { success: true, message: 'Password updated successfully' };
    } else {
      return { success: false, error: 'Failed to update password' };
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return { success: false, error: 'Password reset failed' };
  }
});

// User management IPC handlers
ipcMain.handle('user-get-profile', async (event, userId) => {
  try {
    const user = await db.getUserById(userId);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      user: userWithoutPassword
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, error: 'Failed to get user profile' };
  }
});

ipcMain.handle('user-update-profile', async (event, { userId, userData }) => {
  try {
    const result = await db.updateUser(userId, userData);
    
    if (result.success) {
      // Get updated user data
      const updatedUser = await db.getUserById(userId);
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      return {
        success: true,
        message: 'Profile updated successfully',
        user: userWithoutPassword
      };
    } else {
      return { success: false, error: result.error || 'Failed to update profile' };
    }
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
});

ipcMain.handle('user-change-password', async (event, { userId, oldPassword, newPassword }) => {
  try {
    const user = await db.getUserById(userId);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const isOldPasswordValid = bcrypt.compareSync(oldPassword, user.password);
    
    if (!isOldPasswordValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    const result = await db.updatePassword(userId, hashedNewPassword);
    
    if (result.success) {
      // Clear all existing sessions except current one
      await db.deleteUserSessions(userId);
      
      // Recreate current session if exists
      if (currentSession) {
        const sessionId = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        await db.createSession(sessionId, userId, expiresAt.toISOString());
        currentSession = sessionId;
      }
      
      return {
        success: true,
        message: 'Password changed successfully',
        newSessionId: currentSession
      };
    } else {
      return { success: false, error: result.error || 'Failed to change password' };
    }
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'Failed to change password' };
  }
});

ipcMain.handle('user-update-pin', async (event, { userId, newPin }) => {
  try {
    const result = await db.updateResetPin(userId, newPin);
    
    if (result.success) {
      return { success: true, message: 'PIN updated successfully' };
    } else {
      return { success: false, error: result.error || 'Failed to update PIN' };
    }
  } catch (error) {
    console.error('Update PIN error:', error);
    return { success: false, error: 'Failed to update PIN' };
  }
});

// Clean up database connection when app quits
app.on('before-quit', () => {
  if (db) {
    db.close();
  }
});

app.on('ready', async () => {
  // Initialize database
  db = new DatabaseManager();
  
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
