const { app, BrowserWindow, Menu, nativeTheme } = require('electron');
const path = require('path');

// Force light theme
nativeTheme.themeSource = 'light';

let mainWindow;

function createWindow() {
  // Force light theme before creating window
  nativeTheme.themeSource = 'light';
  
  // Remove the menu bar completely
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    },
    autoHideMenuBar: true, // Hides the menu bar
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#ffffff',
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

app.on('ready', createWindow);

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
