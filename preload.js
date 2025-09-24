const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // Authentication API
  auth: {
    login: (credentials) => ipcRenderer.invoke('auth-login', credentials),
    logout: () => ipcRenderer.invoke('auth-logout'),
    checkSession: (sessionId) => ipcRenderer.invoke('auth-check-session', sessionId),
    forgotPassword: (data) => ipcRenderer.invoke('auth-forgot-password', data)
  },
  
  // User management API
  user: {
    getProfile: (userId) => ipcRenderer.invoke('user-get-profile', userId),
    updateProfile: (data) => ipcRenderer.invoke('user-update-profile', data),
    changePassword: (data) => ipcRenderer.invoke('user-change-password', data),
    updatePin: (data) => ipcRenderer.invoke('user-update-pin', data)
  }
});