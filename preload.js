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
  },

  // File management API
  file: {
    openImagePicker: () => ipcRenderer.invoke('file-open-image-picker'),
    saveProfileImage: (data) => ipcRenderer.invoke('file-save-profile-image', data),
    getImagePath: (filename) => ipcRenderer.invoke('file-get-image-path', filename)
  },

  // Pastorate management API
  pastorate: {
    create: (data) => ipcRenderer.invoke('pastorate-create', data),
    getUserPastorates: (userId) => ipcRenderer.invoke('pastorate-get-user-pastorates', userId),
    getLastSelected: (userId) => ipcRenderer.invoke('pastorate-get-last-selected', userId),
    select: (data) => ipcRenderer.invoke('pastorate-select', data),
    getAll: () => ipcRenderer.invoke('pastorate-get-all'),
    assignUser: (data) => ipcRenderer.invoke('pastorate-assign-user', data),
    removeUser: (data) => ipcRenderer.invoke('pastorate-remove-user', data),
    update: (data) => ipcRenderer.invoke('pastorate-update', data),
    delete: (data) => ipcRenderer.invoke('pastorate-delete', data)
  },

  // Church management API
  church: {
    create: (data) => ipcRenderer.invoke('church-create', data),
    getUserChurches: (userId) => ipcRenderer.invoke('church-get-user-churches', userId),
    getUserChurchesByPastorate: (data) => ipcRenderer.invoke('church-get-user-churches-by-pastorate', data),
    getLastSelected: (userId) => ipcRenderer.invoke('church-get-last-selected', userId),
    select: (data) => ipcRenderer.invoke('church-select', data),
    getAll: () => ipcRenderer.invoke('church-get-all'),
    getByPastorate: (pastorateId) => ipcRenderer.invoke('church-get-by-pastorate', pastorateId),
    assignUser: (data) => ipcRenderer.invoke('church-assign-user', data),
    removeUser: (data) => ipcRenderer.invoke('church-remove-user', data),
    update: (data) => ipcRenderer.invoke('church-update', data),
    delete: (data) => ipcRenderer.invoke('church-delete', data)
  }
});