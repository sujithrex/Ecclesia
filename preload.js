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
    delete: (data) => ipcRenderer.invoke('pastorate-delete', data),
    getStatistics: (data) => ipcRenderer.invoke('pastorate-get-statistics', data),
    // Settings
    getSettings: (data) => ipcRenderer.invoke('pastorate-settings-get', data),
    saveSettings: (data) => ipcRenderer.invoke('pastorate-settings-save', data),
    getDefaultSettings: (data) => ipcRenderer.invoke('pastorate-settings-get-default', data)
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
    delete: (data) => ipcRenderer.invoke('church-delete', data),
    getStatistics: (data) => ipcRenderer.invoke('church-get-statistics', data),
    // Settings
    getSettings: (data) => ipcRenderer.invoke('church-settings-get', data),
    saveSettings: (data) => ipcRenderer.invoke('church-settings-save', data),
    getDefaultSettings: (data) => ipcRenderer.invoke('church-settings-get-default', data)
  },

  // Area management API
  area: {
    create: (data) => ipcRenderer.invoke('area-create', data),
    getByChurch: (data) => ipcRenderer.invoke('area-get-by-church', data),
    update: (data) => ipcRenderer.invoke('area-update', data),
    delete: (data) => ipcRenderer.invoke('area-delete', data)
  },

  // Prayer Cell management API
  prayerCell: {
    create: (data) => ipcRenderer.invoke('prayer-cell-create', data),
    getByChurch: (data) => ipcRenderer.invoke('prayer-cell-get-by-church', data),
    update: (data) => ipcRenderer.invoke('prayer-cell-update', data),
    delete: (data) => ipcRenderer.invoke('prayer-cell-delete', data)
  },

  // Family management API
  family: {
    create: (data) => ipcRenderer.invoke('family-create', data),
    getByArea: (data) => ipcRenderer.invoke('family-get-by-area', data),
    getById: (data) => ipcRenderer.invoke('family-get-by-id', data),
    update: (data) => ipcRenderer.invoke('family-update', data),
    delete: (data) => ipcRenderer.invoke('family-delete', data),
    getAutoNumbers: (data) => ipcRenderer.invoke('family-get-auto-numbers', data)
  },

  // Member management API
  member: {
    create: (data) => ipcRenderer.invoke('member-create', data),
    getByFamily: (data) => ipcRenderer.invoke('member-get-by-family', data),
    getById: (data) => ipcRenderer.invoke('member-get-by-id', data),
    update: (data) => ipcRenderer.invoke('member-update', data),
    delete: (data) => ipcRenderer.invoke('member-delete', data),
    getAutoNumbers: (data) => ipcRenderer.invoke('member-get-auto-numbers', data),
    getFamilyMembers: (data) => ipcRenderer.invoke('member-get-family-members', data),
    // Birthday related methods
    getBirthdaysByDateRange: (data) => ipcRenderer.invoke('member-get-birthdays-by-date-range', data),
    getTodaysBirthdays: (data) => ipcRenderer.invoke('member-get-todays-birthdays', data),
    getThisWeekBirthdays: (data) => ipcRenderer.invoke('member-get-this-week-birthdays', data),
    getBirthdayStatistics: (data) => ipcRenderer.invoke('member-get-birthday-statistics', data),
    getBirthdayReportData: (data) => ipcRenderer.invoke('member-get-birthday-report-data', data),
    generateBirthdayPDFPuppeteer: (data) => ipcRenderer.invoke('member-generate-birthday-pdf-puppeteer', data),
    // Wedding Anniversary related methods
    getWeddingsByDateRange: (data) => ipcRenderer.invoke('member-get-weddings-by-date-range', data),
    getTodaysWeddings: (data) => ipcRenderer.invoke('member-get-todays-weddings', data),
    getThisWeekWeddings: (data) => ipcRenderer.invoke('member-get-this-week-weddings', data),
    getWeddingStatistics: (data) => ipcRenderer.invoke('member-get-wedding-statistics', data),
    getWeddingReportData: (data) => ipcRenderer.invoke('member-get-wedding-report-data', data),
    generateWeddingPDFPuppeteer: (data) => ipcRenderer.invoke('member-generate-wedding-pdf-puppeteer', data)
  },

  // Sabai Jabitha API
  sabaiJabitha: {
    getCongregationData: (data) => ipcRenderer.invoke('sabai-jabitha-get-congregation-data', data),
    generatePDF: (data) => ipcRenderer.invoke('sabai-jabitha-generate-pdf', data),
    generatePDFPuppeteer: (data) => ipcRenderer.invoke('sabai-jabitha-generate-pdf-puppeteer', data)
  },

  // Adult Baptism Certificate API
  adultBaptism: {
    createCertificate: (data) => ipcRenderer.invoke('adult-baptism-create-certificate', data),
    getCertificates: (data) => ipcRenderer.invoke('adult-baptism-get-certificates', data),
    getCertificateById: (data) => ipcRenderer.invoke('adult-baptism-get-certificate-by-id', data),
    updateCertificate: (data) => ipcRenderer.invoke('adult-baptism-update-certificate', data),
    deleteCertificate: (data) => ipcRenderer.invoke('adult-baptism-delete-certificate', data),
    getNextCertificateNumber: (data) => ipcRenderer.invoke('adult-baptism-get-next-certificate-number', data),
    getCertificateDataForPDF: (data) => ipcRenderer.invoke('adult-baptism-get-certificate-data-for-pdf', data),
    generatePDFPuppeteer: (data) => ipcRenderer.invoke('adult-baptism-generate-pdf-puppeteer', data)
  },

  // Infant Baptism Certificate API
  infantBaptism: {
    createCertificate: (data) => ipcRenderer.invoke('infant-baptism-create-certificate', data),
    getCertificates: (data) => ipcRenderer.invoke('infant-baptism-get-certificates', data),
    getCertificateById: (data) => ipcRenderer.invoke('infant-baptism-get-certificate-by-id', data),
    updateCertificate: (data) => ipcRenderer.invoke('infant-baptism-update-certificate', data),
    deleteCertificate: (data) => ipcRenderer.invoke('infant-baptism-delete-certificate', data),
    getNextCertificateNumber: (data) => ipcRenderer.invoke('infant-baptism-get-next-certificate-number', data),
    getCertificateDataForPDF: (data) => ipcRenderer.invoke('infant-baptism-get-certificate-data-for-pdf', data),
    generatePDFPuppeteer: (data) => ipcRenderer.invoke('infant-baptism-generate-pdf-puppeteer', data)
  },

  // Letterpad API
  letterpad: {
    create: (data) => ipcRenderer.invoke('letterpad-create', data),
    getByPastorate: (data) => ipcRenderer.invoke('letterpad-get-by-pastorate', data),
    getById: (data) => ipcRenderer.invoke('letterpad-get-by-id', data),
    update: (data) => ipcRenderer.invoke('letterpad-update', data),
    delete: (data) => ipcRenderer.invoke('letterpad-delete', data),
    getNextNumber: (data) => ipcRenderer.invoke('letterpad-get-next-number', data),
    getDataForPDF: (data) => ipcRenderer.invoke('letterpad-get-data-for-pdf', data),
    generatePDF: (data) => ipcRenderer.invoke('letterpad-generate-pdf-puppeteer', data),
    getSettings: (data) => ipcRenderer.invoke('letterpad-get-settings', data),
    updateSettings: (data) => ipcRenderer.invoke('letterpad-update-settings', data)
  }
});