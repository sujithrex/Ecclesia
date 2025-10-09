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
  },

  // Offerings API
  offerings: {
    createTransaction: (data) => ipcRenderer.invoke('offerings-create-transaction', data),
    getTransactions: (data) => ipcRenderer.invoke('offerings-get-transactions', data),
    getTransaction: (data) => ipcRenderer.invoke('offerings-get-transaction', data),
    updateTransaction: (data) => ipcRenderer.invoke('offerings-update-transaction', data),
    deleteTransaction: (data) => ipcRenderer.invoke('offerings-delete-transaction', data),
    getStatistics: (data) => ipcRenderer.invoke('offerings-get-statistics', data)
  },

  // Receipts API
  receipts: {
    createTransaction: (data) => ipcRenderer.invoke('receipts-create-transaction', data),
    getTransactions: (data) => ipcRenderer.invoke('receipts-get-transactions', data),
    getTransaction: (data) => ipcRenderer.invoke('receipts-get-transaction', data),
    updateTransaction: (data) => ipcRenderer.invoke('receipts-update-transaction', data),
    deleteTransaction: (data) => ipcRenderer.invoke('receipts-delete-transaction', data),
    getNextReceiptNumber: (data) => ipcRenderer.invoke('receipts-get-next-receipt-number', data),
    generateTransactionId: () => ipcRenderer.invoke('receipts-generate-transaction-id'),
    searchFamilies: (data) => ipcRenderer.invoke('receipts-search-families', data),
    getStatistics: (data) => ipcRenderer.invoke('receipts-get-statistics', data)
  },

  // Ledger API (Pastorate)
  ledger: {
    createCategory: (data) => ipcRenderer.invoke('ledger-create-category', data),
    getCategories: (data) => ipcRenderer.invoke('ledger-get-categories', data),
    updateCategory: (data) => ipcRenderer.invoke('ledger-update-category', data),
    deleteCategory: (data) => ipcRenderer.invoke('ledger-delete-category', data),
    createSubCategory: (data) => ipcRenderer.invoke('ledger-create-sub-category', data),
    getSubCategories: (data) => ipcRenderer.invoke('ledger-get-sub-categories', data),
    updateSubCategory: (data) => ipcRenderer.invoke('ledger-update-sub-category', data),
    deleteSubCategory: (data) => ipcRenderer.invoke('ledger-delete-sub-category', data),
    getAllCategoriesWithSubcategories: (data) => ipcRenderer.invoke('ledger-get-all-categories-with-subcategories', data)
  },

  // Pastorate Ledger API (alias for ledger)
  pastorateLedger: {
    createCategory: (data) => ipcRenderer.invoke('ledger-create-category', data),
    getCategories: (data) => ipcRenderer.invoke('ledger-get-categories', data),
    updateCategory: (data) => ipcRenderer.invoke('ledger-update-category', data),
    deleteCategory: (data) => ipcRenderer.invoke('ledger-delete-category', data),
    createSubCategory: (data) => ipcRenderer.invoke('ledger-create-sub-category', data),
    getSubCategories: (data) => ipcRenderer.invoke('ledger-get-sub-categories', data),
    updateSubCategory: (data) => ipcRenderer.invoke('ledger-update-sub-category', data),
    deleteSubCategory: (data) => ipcRenderer.invoke('ledger-delete-sub-category', data)
  },

  // Other Credits API
  otherCredits: {
    createTransaction: (data) => ipcRenderer.invoke('other-credits-create-transaction', data),
    getTransactions: (data) => ipcRenderer.invoke('other-credits-get-transactions', data),
    getTransaction: (data) => ipcRenderer.invoke('other-credits-get-transaction', data),
    updateTransaction: (data) => ipcRenderer.invoke('other-credits-update-transaction', data),
    deleteTransaction: (data) => ipcRenderer.invoke('other-credits-delete-transaction', data),
    getNextCreditNumber: (data) => ipcRenderer.invoke('other-credits-get-next-credit-number', data),
    generateTransactionId: () => ipcRenderer.invoke('other-credits-generate-transaction-id'),
    searchFamilies: (data) => ipcRenderer.invoke('other-credits-search-families', data),
    getStatistics: (data) => ipcRenderer.invoke('other-credits-get-statistics', data)
  },

  // Bill Voucher API
  billVoucher: {
    createTransaction: (data) => ipcRenderer.invoke('bill-voucher-create-transaction', data),
    getTransactions: (data) => ipcRenderer.invoke('bill-voucher-get-transactions', data),
    getTransaction: (data) => ipcRenderer.invoke('bill-voucher-get-transaction', data),
    updateTransaction: (data) => ipcRenderer.invoke('bill-voucher-update-transaction', data),
    deleteTransaction: (data) => ipcRenderer.invoke('bill-voucher-delete-transaction', data),
    getNextVoucherNumber: (data) => ipcRenderer.invoke('bill-voucher-get-next-voucher-number', data),
    generateTransactionId: () => ipcRenderer.invoke('bill-voucher-generate-transaction-id'),
    getStatistics: (data) => ipcRenderer.invoke('bill-voucher-get-statistics', data)
  },

  // Acquittance API
  acquittance: {
    createTransaction: (data) => ipcRenderer.invoke('acquittance-create-transaction', data),
    getTransactions: (data) => ipcRenderer.invoke('acquittance-get-transactions', data),
    getTransaction: (data) => ipcRenderer.invoke('acquittance-get-transaction', data),
    updateTransaction: (data) => ipcRenderer.invoke('acquittance-update-transaction', data),
    deleteTransaction: (data) => ipcRenderer.invoke('acquittance-delete-transaction', data),
    getNextVoucherNumber: (data) => ipcRenderer.invoke('acquittance-get-next-voucher-number', data),
    generateTransactionId: () => ipcRenderer.invoke('acquittance-generate-transaction-id'),
    getStatistics: (data) => ipcRenderer.invoke('acquittance-get-statistics', data),
    getPayeesByCategory: (data) => ipcRenderer.invoke('acquittance-get-payees-by-category', data),
    getLastAmountForPayee: (data) => ipcRenderer.invoke('acquittance-get-last-amount-for-payee', data)
  },

  // Contra API
  contra: {
    createTransaction: (data) => ipcRenderer.invoke('contra-create-transaction', data),
    getTransactions: (data) => ipcRenderer.invoke('contra-get-transactions', data),
    getTransaction: (data) => ipcRenderer.invoke('contra-get-transaction', data),
    updateTransaction: (data) => ipcRenderer.invoke('contra-update-transaction', data),
    deleteTransaction: (data) => ipcRenderer.invoke('contra-delete-transaction', data),
    getNextVoucherNumber: (data) => ipcRenderer.invoke('contra-get-next-voucher-number', data),
    generateTransactionId: () => ipcRenderer.invoke('contra-generate-transaction-id'),
    getStatistics: (data) => ipcRenderer.invoke('contra-get-statistics', data)
  },

  // ========== CHURCH ACCOUNTS APIs ==========

  // Church Ledger API
  churchLedger: {
    createCategory: (data) => ipcRenderer.invoke('church-ledger-create-category', data),
    getCategories: (data) => ipcRenderer.invoke('church-ledger-get-categories', data),
    updateCategory: (data) => ipcRenderer.invoke('church-ledger-update-category', data),
    deleteCategory: (data) => ipcRenderer.invoke('church-ledger-delete-category', data),
    createSubCategory: (data) => ipcRenderer.invoke('church-ledger-create-sub-category', data),
    getSubCategories: (data) => ipcRenderer.invoke('church-ledger-get-sub-categories', data),
    updateSubCategory: (data) => ipcRenderer.invoke('church-ledger-update-sub-category', data),
    deleteSubCategory: (data) => ipcRenderer.invoke('church-ledger-delete-sub-category', data),
    getAllCategoriesWithSubcategories: (data) => ipcRenderer.invoke('church-ledger-get-all-categories-with-subcategories', data)
  },

  // Church Receipts API
  churchReceipts: {
    createTransaction: (data) => ipcRenderer.invoke('church-receipts-create-transaction', data),
    getTransactions: (data) => ipcRenderer.invoke('church-receipts-get-transactions', data),
    getTransaction: (data) => ipcRenderer.invoke('church-receipts-get-transaction', data),
    updateTransaction: (data) => ipcRenderer.invoke('church-receipts-update-transaction', data),
    deleteTransaction: (data) => ipcRenderer.invoke('church-receipts-delete-transaction', data),
    getNextReceiptNumber: (data) => ipcRenderer.invoke('church-receipts-get-next-receipt-number', data),
    generateTransactionId: () => ipcRenderer.invoke('church-receipts-generate-transaction-id'),
    searchFamilies: (data) => ipcRenderer.invoke('church-receipts-search-families', data),
    getStatistics: (data) => ipcRenderer.invoke('church-receipts-get-statistics', data)
  },

  // Church Other Credits API
  churchOtherCredits: {
    createTransaction: (data) => ipcRenderer.invoke('church-other-credits-create-transaction', data),
    getTransactions: (data) => ipcRenderer.invoke('church-other-credits-get-transactions', data),
    getTransaction: (data) => ipcRenderer.invoke('church-other-credits-get-transaction', data),
    updateTransaction: (data) => ipcRenderer.invoke('church-other-credits-update-transaction', data),
    deleteTransaction: (data) => ipcRenderer.invoke('church-other-credits-delete-transaction', data),
    getNextCreditNumber: (data) => ipcRenderer.invoke('church-other-credits-get-next-credit-number', data),
    generateTransactionId: () => ipcRenderer.invoke('church-other-credits-generate-transaction-id'),
    searchFamilies: (data) => ipcRenderer.invoke('church-other-credits-search-families', data),
    getStatistics: (data) => ipcRenderer.invoke('church-other-credits-get-statistics', data)
  },

  // Church Bill Voucher API
  churchBillVoucher: {
    createTransaction: (data) => ipcRenderer.invoke('church-bill-vouchers-create-transaction', data),
    getTransactions: (data) => ipcRenderer.invoke('church-bill-vouchers-get-transactions', data),
    getTransaction: (data) => ipcRenderer.invoke('church-bill-vouchers-get-transaction', data),
    updateTransaction: (data) => ipcRenderer.invoke('church-bill-vouchers-update-transaction', data),
    deleteTransaction: (data) => ipcRenderer.invoke('church-bill-vouchers-delete-transaction', data),
    getNextVoucherNumber: (data) => ipcRenderer.invoke('church-bill-vouchers-get-next-voucher-number', data),
    generateTransactionId: () => ipcRenderer.invoke('church-bill-vouchers-generate-transaction-id'),
    getStatistics: (data) => ipcRenderer.invoke('church-bill-vouchers-get-statistics', data)
  },

  // Church Acquittance API
  churchAcquittance: {
    createTransaction: (data) => ipcRenderer.invoke('church-acquittance-create-transaction', data),
    getTransactions: (data) => ipcRenderer.invoke('church-acquittance-get-transactions', data),
    getTransaction: (data) => ipcRenderer.invoke('church-acquittance-get-transaction', data),
    updateTransaction: (data) => ipcRenderer.invoke('church-acquittance-update-transaction', data),
    deleteTransaction: (data) => ipcRenderer.invoke('church-acquittance-delete-transaction', data),
    getNextVoucherNumber: (data) => ipcRenderer.invoke('church-acquittance-get-next-voucher-number', data),
    generateTransactionId: () => ipcRenderer.invoke('church-acquittance-generate-transaction-id'),
    getStatistics: (data) => ipcRenderer.invoke('church-acquittance-get-statistics', data)
  },

  // Church Contra API
  churchContra: {
    createTransaction: (data) => ipcRenderer.invoke('church-contra-create-transaction', data),
    getTransactions: (data) => ipcRenderer.invoke('church-contra-get-transactions', data),
    getTransaction: (data) => ipcRenderer.invoke('church-contra-get-transaction', data),
    updateTransaction: (data) => ipcRenderer.invoke('church-contra-update-transaction', data),
    deleteTransaction: (data) => ipcRenderer.invoke('church-contra-delete-transaction', data),
    getNextVoucherNumber: (data) => ipcRenderer.invoke('church-contra-get-next-voucher-number', data),
    generateTransactionId: () => ipcRenderer.invoke('church-contra-generate-transaction-id'),
    getStatistics: (data) => ipcRenderer.invoke('church-contra-get-statistics', data)
  },

  // Account Balance API (Pastorate)
  accountBalance: {
    getAllBalances: (data) => ipcRenderer.invoke('account-balance-get-all', data),
    getBalanceByBookType: (data) => ipcRenderer.invoke('account-balance-get-by-book-type', data)
  },

  // Church Account Balance API
  churchAccountBalance: {
    getAllBalances: (data) => ipcRenderer.invoke('church-account-balance-get-all', data),
    getBalanceByBookType: (data) => ipcRenderer.invoke('church-account-balance-get-by-book-type', data)
  },

  // Account List API
  accountList: {
    getAllForPastorate: (data) => ipcRenderer.invoke('account-list-get-all-for-pastorate', data),
    getAllForChurch: (data) => ipcRenderer.invoke('account-list-get-all-for-church', data),
    getCategoriesForAccount: (data) => ipcRenderer.invoke('account-list-get-categories-for-account', data)
  },

  // Rough Cash Book API
  roughCashBook: {
    getAvailableMonths: (data) => ipcRenderer.invoke('rough-cash-book-get-available-months', data),
    getReportData: (data) => ipcRenderer.invoke('rough-cash-book-get-report-data', data),
    generatePDF: (data) => ipcRenderer.invoke('rough-cash-book-generate-pdf', data)
  },

  // Indent API (Pastorate Level Only)
  indent: {
    // Deduction Fields
    getDeductionFields: (data) => ipcRenderer.invoke('indent-get-deduction-fields', data),
    createDeductionField: (data) => ipcRenderer.invoke('indent-create-deduction-field', data),
    updateDeductionField: (data) => ipcRenderer.invoke('indent-update-deduction-field', data),
    deleteDeductionField: (data) => ipcRenderer.invoke('indent-delete-deduction-field', data),
    // Employees
    getEmployees: (data) => ipcRenderer.invoke('indent-get-employees', data),
    getEmployee: (data) => ipcRenderer.invoke('indent-get-employee', data),
    createEmployee: (data) => ipcRenderer.invoke('indent-create-employee', data),
    updateEmployee: (data) => ipcRenderer.invoke('indent-update-employee', data),
    deleteEmployee: (data) => ipcRenderer.invoke('indent-delete-employee', data),
    // Allowance Fields
    getAllowanceFields: (data) => ipcRenderer.invoke('indent-get-allowance-fields', data),
    createAllowanceField: (data) => ipcRenderer.invoke('indent-create-allowance-field', data),
    updateAllowanceField: (data) => ipcRenderer.invoke('indent-update-allowance-field', data),
    deleteAllowanceField: (data) => ipcRenderer.invoke('indent-delete-allowance-field', data),
    // Allowances
    getAllowances: (data) => ipcRenderer.invoke('indent-get-allowances', data),
    getAllowance: (data) => ipcRenderer.invoke('indent-get-allowance', data),
    createAllowance: (data) => ipcRenderer.invoke('indent-create-allowance', data),
    updateAllowance: (data) => ipcRenderer.invoke('indent-update-allowance', data),
    deleteAllowance: (data) => ipcRenderer.invoke('indent-delete-allowance', data),
    // Payment Fields
    getPaymentFields: (data) => ipcRenderer.invoke('indent-get-payment-fields', data),
    createPaymentField: (data) => ipcRenderer.invoke('indent-create-payment-field', data),
    updatePaymentField: (data) => ipcRenderer.invoke('indent-update-payment-field', data),
    deletePaymentField: (data) => ipcRenderer.invoke('indent-delete-payment-field', data),
    // Payments
    getPayments: (data) => ipcRenderer.invoke('indent-get-payments', data),
    getPayment: (data) => ipcRenderer.invoke('indent-get-payment', data),
    createPayment: (data) => ipcRenderer.invoke('indent-create-payment', data),
    updatePayment: (data) => ipcRenderer.invoke('indent-update-payment', data),
    deletePayment: (data) => ipcRenderer.invoke('indent-delete-payment', data),
    // Monthly Payouts
    getMonthlyPayouts: (data) => ipcRenderer.invoke('indent-get-monthly-payouts', data),
    getMonthlyPayout: (data) => ipcRenderer.invoke('indent-get-monthly-payout', data),
    createMonthlyPayout: (data) => ipcRenderer.invoke('indent-create-monthly-payout', data),
    updateMonthlyPayout: (data) => ipcRenderer.invoke('indent-update-monthly-payout', data),
    deleteMonthlyPayout: (data) => ipcRenderer.invoke('indent-delete-monthly-payout', data)
  }
});