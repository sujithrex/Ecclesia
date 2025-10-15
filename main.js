const { app, BrowserWindow, Menu, nativeTheme, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const DatabaseManager = require('./backend/database.js');
const AuthService = require('./backend/authService.js');
const UserService = require('./backend/userService.js');
const PastorateService = require('./backend/pastorateService.js');
const PastorateSettingsService = require('./backend/pastorateSettingsService.js');
const ChurchService = require('./backend/churchService.js');
const ChurchSettingsService = require('./backend/churchSettingsService.js');
const AreaService = require('./backend/areaService.js');
const PrayerCellService = require('./backend/prayerCellService.js');
const FamilyService = require('./backend/familyService.js');
const MemberService = require('./backend/memberService.js');
const SabaiJabithaService = require('./backend/sabaiJabithaService.js');
const BirthdayReportPuppeteerService = require('./backend/birthdayReportPuppeteerService.js');
const WeddingReportPuppeteerService = require('./backend/weddingReportPuppeteerService.js');
const SabaiJabithaReportPuppeteerService = require('./backend/sabaiJabithaReportPuppeteerService.js');
const AdultBaptismService = require('./backend/adultBaptismService.js');
const AdultBaptismReportPuppeteerService = require('./backend/adultBaptismReportPuppeteerService.js');
const InfantBaptismService = require('./backend/infantBaptismService.js');
const InfantBaptismReportPuppeteerService = require('./backend/infantBaptismReportPuppeteerService.js');
const BurialRegisterService = require('./backend/burialRegisterService.js');
const BurialRegisterReportPuppeteerService = require('./backend/burialRegisterReportPuppeteerService.js');
const LetterpadService = require('./backend/letterpadService.js');
const LetterpadReportPuppeteerService = require('./backend/letterpadReportPuppeteerService.js');
const OfferingsService = require('./backend/offeringsService.js');
const ReceiptsService = require('./backend/receiptsService.js');
const LedgerService = require('./backend/ledgerService.js');
const OtherCreditsService = require('./backend/otherCreditsService.js');
const BillVoucherService = require('./backend/billVoucherService.js');
const AcquittanceService = require('./backend/acquittanceService.js');
const ContraService = require('./backend/contraService.js');
const ChurchLedgerService = require('./backend/churchLedgerService.js');
const ChurchReceiptsService = require('./backend/churchReceiptsService.js');
const ChurchOtherCreditsService = require('./backend/churchOtherCreditsService.js');
const ChurchBillVoucherService = require('./backend/churchBillVoucherService.js');
const ChurchAcquittanceService = require('./backend/churchAcquittanceService.js');
const ChurchContraService = require('./backend/churchContraService.js');
const AccountBalanceService = require('./backend/accountBalanceService.js');
const ChurchAccountBalanceService = require('./backend/churchAccountBalanceService.js');
const AccountListService = require('./backend/accountListService.js');
const IndentService = require('./backend/indentService.js');
const RoughCashBookService = require('./backend/roughCashBookService.js');
const RoughCashBookReportPuppeteerService = require('./backend/roughCashBookReportPuppeteerService.js');
const OfferingsReportService = require('./backend/offeringsReportService.js');
const OfferingsReportPuppeteerService = require('./backend/offeringsReportPuppeteerService.js');

let mainWindow;
let db;
let authService;
let userService;
let pastorateService;
let pastorateSettingsService;
let churchService;
let churchSettingsService;
let areaService;
let prayerCellService;
let familyService;
let memberService;
let sabaiJabithaService;
let birthdayReportPuppeteerService;
let weddingReportPuppeteerService;
let sabaiJabithaReportPuppeteerService;
let adultBaptismService;
let adultBaptismReportPuppeteerService;
let infantBaptismService;
let infantBaptismReportPuppeteerService;
let burialRegisterService;
let burialRegisterReportPuppeteerService;
let letterpadService;
let letterpadReportPuppeteerService;
let offeringsService;
let receiptsService;
let ledgerService;
let otherCreditsService;
let billVoucherService;
let acquittanceService;
let contraService;
let churchLedgerService;
let churchReceiptsService;
let churchOtherCreditsService;
let churchBillVoucherService;
let churchAcquittanceService;
let churchContraService;
let accountBalanceService;
let churchAccountBalanceService;
let accountListService;
let indentService;
let roughCashBookService;
let roughCashBookReportPuppeteerService;
let offeringsReportService;
let offeringsReportPuppeteerService;

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
    
    // Automatically open Developer Tools for debugging
    mainWindow.webContents.openDevTools({  });
    
    console.log('🔧 Developer Tools opened automatically for font debugging');
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

// Pastorate management IPC handlers
ipcMain.handle('pastorate-create', async (event, { pastorate_name, pastorate_short_name, userId }) => {
  return await pastorateService.createPastorate(pastorate_name, pastorate_short_name, userId);
});

ipcMain.handle('pastorate-get-user-pastorates', async (event, userId) => {
  return await pastorateService.getUserPastorates(userId);
});

ipcMain.handle('pastorate-get-last-selected', async (event, userId) => {
  return await pastorateService.getLastSelectedPastorate(userId);
});

ipcMain.handle('pastorate-select', async (event, { userId, pastorateId }) => {
  return await pastorateService.selectPastorate(userId, pastorateId);
});

ipcMain.handle('pastorate-get-all', async (event) => {
  return await pastorateService.getAllPastorates();
});

ipcMain.handle('pastorate-assign-user', async (event, { userId, pastorateId }) => {
  return await pastorateService.assignUserToPastorate(userId, pastorateId);
});

ipcMain.handle('pastorate-remove-user', async (event, { userId, pastorateId }) => {
  return await pastorateService.removeUserFromPastorate(userId, pastorateId);
});

ipcMain.handle('pastorate-update', async (event, { pastorateId, pastorate_name, pastorate_short_name, userId }) => {
  return await pastorateService.updatePastorate(pastorateId, pastorate_name, pastorate_short_name, userId);
});

ipcMain.handle('pastorate-delete', async (event, { pastorateId, userId }) => {
  return await pastorateService.deletePastorate(pastorateId, userId);
});

// Church management IPC handlers
ipcMain.handle('church-create', async (event, { pastorateId, church_name, church_short_name, userId }) => {
  return await churchService.createChurch(pastorateId, church_name, church_short_name, userId);
});

ipcMain.handle('church-get-user-churches', async (event, userId) => {
  return await churchService.getUserChurches(userId);
});

ipcMain.handle('church-get-user-churches-by-pastorate', async (event, { userId, pastorateId }) => {
  return await churchService.getUserChurchesByPastorate(userId, pastorateId);
});

ipcMain.handle('church-get-last-selected', async (event, userId) => {
  return await churchService.getLastSelectedChurch(userId);
});

ipcMain.handle('church-select', async (event, { userId, churchId }) => {
  return await churchService.selectChurch(userId, churchId);
});

ipcMain.handle('church-get-all', async (event) => {
  return await churchService.getAllChurches();
});

ipcMain.handle('church-get-by-pastorate', async (event, pastorateId) => {
  return await churchService.getChurchesByPastorate(pastorateId);
});

ipcMain.handle('church-assign-user', async (event, { userId, churchId }) => {
  return await churchService.assignUserToChurch(userId, churchId);
});

ipcMain.handle('church-remove-user', async (event, { userId, churchId }) => {
  return await churchService.removeUserFromChurch(userId, churchId);
});

ipcMain.handle('church-update', async (event, { churchId, church_name, church_short_name, userId }) => {
  return await churchService.updateChurch(churchId, church_name, church_short_name, userId);
});

ipcMain.handle('church-delete', async (event, { churchId, userId }) => {
  return await churchService.deleteChurch(churchId, userId);
});

// Church statistics IPC handler
ipcMain.handle('church-get-statistics', async (event, { churchId, userId }) => {
  return await churchService.getChurchStatistics(churchId, userId);
});

// Pastorate statistics IPC handler
ipcMain.handle('pastorate-get-statistics', async (event, { pastorateId, userId }) => {
  return await pastorateService.getStatistics(pastorateId, userId);
});

// Pastorate Settings IPC handlers
ipcMain.handle('pastorate-settings-get', async (event, { pastorateId, userId }) => {
  return await pastorateSettingsService.getPastorateSettings(pastorateId, userId);
});

ipcMain.handle('pastorate-settings-save', async (event, { pastorateId, settingsData, userId }) => {
  return await pastorateSettingsService.savePastorateSettings(pastorateId, settingsData, userId);
});

ipcMain.handle('pastorate-settings-get-default', async (event, { pastorateId, userId }) => {
  return await pastorateSettingsService.getDefaultSettings(pastorateId, userId);
});

// Church Settings IPC handlers
ipcMain.handle('church-settings-get', async (event, { churchId, userId }) => {
  return await churchSettingsService.getChurchSettings(churchId, userId);
});

ipcMain.handle('church-settings-save', async (event, { churchId, settingsData, userId }) => {
  return await churchSettingsService.saveChurchSettings(churchId, settingsData, userId);
});

ipcMain.handle('church-settings-get-default', async (event, { churchId, userId }) => {
  return await churchSettingsService.getDefaultSettings(churchId, userId);
});

// Area management IPC handlers
ipcMain.handle('area-create', async (event, { churchId, area_name, area_identity, userId }) => {
  return await areaService.createArea(churchId, area_name, area_identity, userId);
});

ipcMain.handle('area-get-by-church', async (event, { churchId, userId }) => {
  return await areaService.getAreasByChurch(churchId, userId);
});

ipcMain.handle('area-update', async (event, { areaId, area_name, area_identity, userId }) => {
  return await areaService.updateArea(areaId, area_name, area_identity, userId);
});

ipcMain.handle('area-delete', async (event, { areaId, userId }) => {
  return await areaService.deleteArea(areaId, userId);
});

// Prayer Cell management IPC handlers
ipcMain.handle('prayer-cell-create', async (event, { churchId, prayer_cell_name, prayer_cell_identity, userId }) => {
  return await prayerCellService.createPrayerCell(churchId, prayer_cell_name, prayer_cell_identity, userId);
});

ipcMain.handle('prayer-cell-get-by-church', async (event, { churchId, userId }) => {
  return await prayerCellService.getPrayerCellsByChurch(churchId, userId);
});

ipcMain.handle('prayer-cell-update', async (event, { prayerCellId, prayer_cell_name, prayer_cell_identity, userId }) => {
  return await prayerCellService.updatePrayerCell(prayerCellId, prayer_cell_name, prayer_cell_identity, userId);
});

ipcMain.handle('prayer-cell-delete', async (event, { prayerCellId, userId }) => {
  return await prayerCellService.deletePrayerCell(prayerCellId, userId);
});

// Family management IPC handlers
ipcMain.handle('family-create', async (event, { areaId, familyData, userId }) => {
  return await familyService.createFamily(areaId, familyData, userId);
});

ipcMain.handle('family-get-by-area', async (event, { areaId, userId }) => {
  return await familyService.getFamiliesByArea(areaId, userId);
});

ipcMain.handle('family-update', async (event, { familyId, familyData, userId }) => {
  return await familyService.updateFamily(familyId, familyData, userId);
});

ipcMain.handle('family-delete', async (event, { familyId, userId }) => {
  return await familyService.deleteFamily(familyId, userId);
});

ipcMain.handle('family-get-auto-numbers', async (event, { areaId, userId }) => {
  return await familyService.getAutoNumbers(areaId, userId);
});

ipcMain.handle('family-get-by-id', async (event, { familyId, userId }) => {
  return await familyService.getFamilyById(familyId, userId);
});

// Member management IPC handlers
ipcMain.handle('member-create', async (event, { familyId, memberData, userId }) => {
  return await memberService.createMember(familyId, memberData, userId);
});

ipcMain.handle('member-get-by-family', async (event, { familyId, userId }) => {
  return await memberService.getMembersByFamily(familyId, userId);
});

ipcMain.handle('member-get-by-id', async (event, { memberId, userId }) => {
  return await memberService.getMemberById(memberId, userId);
});

ipcMain.handle('member-update', async (event, { memberId, memberData, userId }) => {
  return await memberService.updateMember(memberId, memberData, userId);
});

ipcMain.handle('member-delete', async (event, { memberId, userId }) => {
  return await memberService.deleteMember(memberId, userId);
});

ipcMain.handle('member-get-auto-numbers', async (event, { familyId, userId }) => {
  return await memberService.getAutoNumbers(familyId, userId);
});

ipcMain.handle('member-get-family-members', async (event, { familyId, userId, excludeMemberId }) => {
  return await memberService.getFamilyMembers(familyId, userId, excludeMemberId);
});

// Birthday related IPC handlers
ipcMain.handle('member-get-birthdays-by-date-range', async (event, { churchId, fromDate, toDate, userId, areaId }) => {
  return await memberService.getBirthdaysByDateRange(churchId, fromDate, toDate, userId, areaId);
});

ipcMain.handle('member-get-todays-birthdays', async (event, { churchId, userId, areaId }) => {
  return await memberService.getTodaysBirthdays(churchId, userId, areaId);
});

ipcMain.handle('member-get-this-week-birthdays', async (event, { churchId, userId, areaId }) => {
  return await memberService.getThisWeekBirthdays(churchId, userId, areaId);
});

ipcMain.handle('member-get-birthday-statistics', async (event, { churchId, userId, areaId }) => {
  return await memberService.getBirthdayStatistics(churchId, userId, areaId);
});

// Birthday Report IPC handler
ipcMain.handle('member-get-birthday-report-data', async (event, { churchId, fromDate, toDate, userId, areaId }) => {
  return await memberService.getBirthdayReportData(churchId, fromDate, toDate, userId, areaId);
});

// Birthday Report Puppeteer PDF Generation IPC handler
ipcMain.handle('member-generate-birthday-pdf-puppeteer', async (event, { reportData, church, dateRange, options }) => {
  return await birthdayReportPuppeteerService.generateBirthdayPDF(reportData, church, dateRange, options);
});

// Wedding Report Puppeteer PDF Generation IPC handler
ipcMain.handle('member-generate-wedding-pdf-puppeteer', async (event, { reportData, church, dateRange, options }) => {
  return await weddingReportPuppeteerService.generateWeddingPDF(reportData, church, dateRange, options);
});

// Wedding Anniversary related IPC handlers
ipcMain.handle('member-get-weddings-by-date-range', async (event, { churchId, fromDate, toDate, userId, areaId }) => {
  return await memberService.getWeddingsByDateRange(churchId, fromDate, toDate, userId, areaId);
});

// Wedding Report IPC handler
ipcMain.handle('member-get-wedding-report-data', async (event, { churchId, fromDate, toDate, userId, areaId }) => {
  return await memberService.getWeddingReportData(churchId, fromDate, toDate, userId, areaId);
});

ipcMain.handle('member-get-todays-weddings', async (event, { churchId, userId, areaId }) => {
  return await memberService.getTodaysWeddings(churchId, userId, areaId);
});

ipcMain.handle('member-get-this-week-weddings', async (event, { churchId, userId, areaId }) => {
  return await memberService.getThisWeekWeddings(churchId, userId, areaId);
});

ipcMain.handle('member-get-wedding-statistics', async (event, { churchId, userId, areaId }) => {
  return await memberService.getWeddingStatistics(churchId, userId, areaId);
});

// Sabai Jabitha IPC handlers
ipcMain.handle('sabai-jabitha-get-congregation-data', async (event, { churchId, userId, areaId }) => {
  return await sabaiJabithaService.getCongregationData(churchId, userId, areaId);
});

ipcMain.handle('sabai-jabitha-generate-pdf', async (event, { churchId, userId, options }) => {
  return await sabaiJabithaService.generateSabaiJabithaPDF(churchId, userId, options);
});

// Sabai Jabitha Report Puppeteer PDF Generation IPC handler
ipcMain.handle('sabai-jabitha-generate-pdf-puppeteer', async (event, { congregationData, church, options }) => {
  return await sabaiJabithaReportPuppeteerService.generateSabaiJabithaPDF(congregationData, church, options);
});

// Adult Baptism Certificate IPC handlers
ipcMain.handle('adult-baptism-create-certificate', async (event, { certificateData, userId }) => {
  return await adultBaptismService.createCertificate(certificateData, userId);
});

ipcMain.handle('adult-baptism-get-certificates', async (event, { churchId, userId, page, limit }) => {
  return await adultBaptismService.getCertificatesByChurch(churchId, userId, page, limit);
});

ipcMain.handle('adult-baptism-get-certificate-by-id', async (event, { certificateId, userId }) => {
  return await adultBaptismService.getCertificateById(certificateId, userId);
});

ipcMain.handle('adult-baptism-update-certificate', async (event, { certificateId, certificateData, userId }) => {
  return await adultBaptismService.updateCertificate(certificateId, certificateData, userId);
});

ipcMain.handle('adult-baptism-delete-certificate', async (event, { certificateId, userId }) => {
  return await adultBaptismService.deleteCertificate(certificateId, userId);
});

ipcMain.handle('adult-baptism-get-next-certificate-number', async (event, { churchId, userId }) => {
  return await adultBaptismService.getNextCertificateNumber(churchId, userId);
});

ipcMain.handle('adult-baptism-get-certificate-data-for-pdf', async (event, { certificateId, userId }) => {
  return await adultBaptismService.getCertificateDataForPDF(certificateId, userId);
});

ipcMain.handle('adult-baptism-generate-pdf-puppeteer', async (event, { certificate, church, options }) => {
  return await adultBaptismReportPuppeteerService.generateCertificatePDF(certificate, church, options);
});

// Infant Baptism Certificate IPC handlers
ipcMain.handle('infant-baptism-create-certificate', async (event, { certificateData, userId }) => {
  return await infantBaptismService.createCertificate(certificateData, userId);
});

ipcMain.handle('infant-baptism-get-certificates', async (event, { churchId, userId, page, limit }) => {
  return await infantBaptismService.getCertificatesByChurch(churchId, userId, page, limit);
});

ipcMain.handle('infant-baptism-get-certificate-by-id', async (event, { certificateId, userId }) => {
  return await infantBaptismService.getCertificateById(certificateId, userId);
});

ipcMain.handle('infant-baptism-update-certificate', async (event, { certificateId, certificateData, userId }) => {
  return await infantBaptismService.updateCertificate(certificateId, certificateData, userId);
});

ipcMain.handle('infant-baptism-delete-certificate', async (event, { certificateId, userId }) => {
  return await infantBaptismService.deleteCertificate(certificateId, userId);
});

ipcMain.handle('infant-baptism-get-next-certificate-number', async (event, { churchId, userId }) => {
  return await infantBaptismService.getNextCertificateNumber(churchId, userId);
});

ipcMain.handle('infant-baptism-get-certificate-data-for-pdf', async (event, { certificateId, userId }) => {
  return await infantBaptismService.getCertificateDataForPDF(certificateId, userId);
});

ipcMain.handle('infant-baptism-generate-pdf-puppeteer', async (event, { certificate, church, options }) => {
  return await infantBaptismReportPuppeteerService.generateCertificatePDF(certificate, church, options);
});

// Burial Register IPC handlers
ipcMain.handle('burial-register-create', async (event, { registerData, userId }) => {
  return await burialRegisterService.createRegister(registerData, userId);
});

ipcMain.handle('burial-register-get-registers', async (event, { churchId, userId, page, limit }) => {
  return await burialRegisterService.getRegistersByChurch(churchId, userId, page, limit);
});

ipcMain.handle('burial-register-get-by-id', async (event, { registerId, userId }) => {
  return await burialRegisterService.getRegisterById(registerId, userId);
});

ipcMain.handle('burial-register-update', async (event, { registerId, registerData, userId }) => {
  return await burialRegisterService.updateRegister(registerId, registerData, userId);
});

ipcMain.handle('burial-register-delete', async (event, { registerId, userId }) => {
  return await burialRegisterService.deleteRegister(registerId, userId);
});

ipcMain.handle('burial-register-get-next-number', async (event, { churchId, userId }) => {
  return await burialRegisterService.getNextRegisterNumber(churchId, userId);
});

ipcMain.handle('burial-register-get-data-for-pdf', async (event, { registerId, userId }) => {
  return await burialRegisterService.getRegisterDataForPDF(registerId, userId);
});

ipcMain.handle('burial-register-generate-pdf-puppeteer', async (event, { register, church, options }) => {
  return await burialRegisterReportPuppeteerService.generateRegisterPDF(register, church, options);
});

// Letterpad IPC handlers
ipcMain.handle('letterpad-create', async (event, { letterpadData, userId }) => {
  return await letterpadService.createLetterpad(letterpadData, userId);
});

ipcMain.handle('letterpad-get-by-pastorate', async (event, { pastorateId, userId, page, limit }) => {
  return await letterpadService.getLetterpadsByPastorate(pastorateId, userId, page, limit);
});

ipcMain.handle('letterpad-get-by-id', async (event, { letterpadId, userId }) => {
  return await letterpadService.getLetterpadById(letterpadId, userId);
});

ipcMain.handle('letterpad-update', async (event, { letterpadId, letterpadData, userId }) => {
  return await letterpadService.updateLetterpad(letterpadId, letterpadData, userId);
});

ipcMain.handle('letterpad-delete', async (event, { letterpadId, userId }) => {
  return await letterpadService.deleteLetterpad(letterpadId, userId);
});

ipcMain.handle('letterpad-get-next-number', async (event, { pastorateId, userId }) => {
  return await letterpadService.getNextLetterpadNumber(pastorateId, userId);
});

ipcMain.handle('letterpad-get-data-for-pdf', async (event, { letterpadId, userId }) => {
  return await letterpadService.getLetterpadDataForPDF(letterpadId, userId);
});

ipcMain.handle('letterpad-generate-pdf-puppeteer', async (event, { letterpad, pastorate, pastorateSettings, options }) => {
  return await letterpadReportPuppeteerService.generateLetterpadPDF(letterpad, pastorate, pastorateSettings, options);
});

// Letterpad Settings IPC handlers
ipcMain.handle('letterpad-get-settings', async (event, { pastorateId, userId }) => {
  return await letterpadService.getLetterpadSettings(pastorateId, userId);
});

ipcMain.handle('letterpad-update-settings', async (event, { pastorateId, settingsData, userId }) => {
  return await letterpadService.updateLetterpadSettings(pastorateId, settingsData, userId);
});

// Offerings IPC handlers
ipcMain.handle('offerings-create-transaction', async (event, transactionData) => {
  return await offeringsService.createTransaction(transactionData, transactionData.userId);
});

ipcMain.handle('offerings-get-transactions', async (event, { pastorateId, userId, page, limit, filters }) => {
  return await offeringsService.getTransactions(pastorateId, userId, page, limit, filters);
});

ipcMain.handle('offerings-get-transaction', async (event, { transactionId }) => {
  return await offeringsService.getTransaction(transactionId);
});

ipcMain.handle('offerings-update-transaction', async (event, transactionData) => {
  return await offeringsService.updateTransaction(transactionData.id, transactionData, transactionData.userId);
});

ipcMain.handle('offerings-delete-transaction', async (event, { transactionId, userId }) => {
  return await offeringsService.deleteTransaction(transactionId, userId);
});

ipcMain.handle('offerings-get-statistics', async (event, { pastorateId, userId }) => {
  return await offeringsService.getStatistics(pastorateId, userId);
});

// Receipts IPC handlers
ipcMain.handle('receipts-create-transaction', async (event, transactionData) => {
  return await receiptsService.createTransaction(transactionData, transactionData.userId);
});

ipcMain.handle('receipts-get-transactions', async (event, { pastorateId, userId, page, limit, filters }) => {
  return await receiptsService.getTransactions(pastorateId, userId, page, limit, filters);
});

ipcMain.handle('receipts-get-transaction', async (event, { transactionId }) => {
  return await receiptsService.getTransaction(transactionId);
});

ipcMain.handle('receipts-update-transaction', async (event, transactionData) => {
  return await receiptsService.updateTransaction(transactionData.id, transactionData, transactionData.userId);
});

ipcMain.handle('receipts-delete-transaction', async (event, { transactionId, userId }) => {
  return await receiptsService.deleteTransaction(transactionId, userId);
});

ipcMain.handle('receipts-get-next-receipt-number', async (event, { pastorateId, bookType }) => {
  return await receiptsService.getNextReceiptNumber(pastorateId, bookType);
});

ipcMain.handle('receipts-generate-transaction-id', async (event) => {
  return await receiptsService.generateTransactionId();
});

ipcMain.handle('receipts-search-families', async (event, { pastorateId, searchTerm }) => {
  return await receiptsService.searchFamilies(pastorateId, searchTerm);
});

ipcMain.handle('receipts-get-statistics', async (event, { pastorateId }) => {
  return await receiptsService.getStatistics(pastorateId);
});

// Ledger IPC handlers
ipcMain.handle('ledger-create-category', async (event, categoryData) => {
  return await ledgerService.createCategory(categoryData, categoryData.userId);
});

ipcMain.handle('ledger-get-categories', async (event, { pastorateId, bookType }) => {
  return await ledgerService.getCategories(pastorateId, bookType);
});

ipcMain.handle('ledger-update-category', async (event, categoryData) => {
  return await ledgerService.updateCategory(categoryData.categoryId, categoryData, categoryData.userId);
});

ipcMain.handle('ledger-delete-category', async (event, { categoryId, userId }) => {
  return await ledgerService.deleteCategory(categoryId, userId);
});

ipcMain.handle('ledger-create-sub-category', async (event, subCategoryData) => {
  return await ledgerService.createSubCategory(subCategoryData, subCategoryData.userId);
});

ipcMain.handle('ledger-get-sub-categories', async (event, { parentCategoryId }) => {
  return await ledgerService.getSubCategories(parentCategoryId);
});

ipcMain.handle('ledger-update-sub-category', async (event, subCategoryData) => {
  return await ledgerService.updateSubCategory(subCategoryData.subCategoryId, subCategoryData, subCategoryData.userId);
});

ipcMain.handle('ledger-delete-sub-category', async (event, { subCategoryId, userId }) => {
  return await ledgerService.deleteSubCategory(subCategoryId, userId);
});

ipcMain.handle('ledger-get-all-categories-with-subcategories', async (event, { pastorateId }) => {
  return await ledgerService.getAllCategoriesWithSubcategories(pastorateId);
});

// Other Credits IPC handlers
ipcMain.handle('other-credits-create-transaction', async (event, transactionData) => {
  return await otherCreditsService.createTransaction(transactionData, transactionData.userId);
});

ipcMain.handle('other-credits-get-transactions', async (event, { pastorateId, userId, bookType, page, limit, filters }) => {
  return await otherCreditsService.getTransactions(pastorateId, userId, bookType, page, limit, filters);
});

ipcMain.handle('other-credits-get-transaction', async (event, { transactionId }) => {
  return await otherCreditsService.getTransaction(transactionId);
});

ipcMain.handle('other-credits-update-transaction', async (event, transactionData) => {
  return await otherCreditsService.updateTransaction(transactionData.id, transactionData, transactionData.userId);
});

ipcMain.handle('other-credits-delete-transaction', async (event, { transactionId, userId }) => {
  return await otherCreditsService.deleteTransaction(transactionId, userId);
});

ipcMain.handle('other-credits-get-next-credit-number', async (event, { pastorateId, bookType }) => {
  return await otherCreditsService.getNextCreditNumber(pastorateId, bookType);
});

ipcMain.handle('other-credits-generate-transaction-id', async (event) => {
  return await otherCreditsService.generateTransactionId();
});

ipcMain.handle('other-credits-search-families', async (event, { pastorateId, searchTerm }) => {
  return await otherCreditsService.searchFamilies(pastorateId, searchTerm);
});

ipcMain.handle('other-credits-get-statistics', async (event, { pastorateId, bookType }) => {
  return await otherCreditsService.getStatistics(pastorateId, bookType);
});

// Bill Voucher IPC handlers
ipcMain.handle('bill-voucher-create-transaction', async (event, transactionData) => {
  return await billVoucherService.createTransaction(transactionData, transactionData.userId);
});

ipcMain.handle('bill-voucher-get-transactions', async (event, { pastorateId, userId, bookType, page, limit, filters }) => {
  return await billVoucherService.getTransactions(pastorateId, userId, bookType, page, limit, filters);
});

ipcMain.handle('bill-voucher-get-transaction', async (event, { transactionId }) => {
  return await billVoucherService.getTransaction(transactionId);
});

ipcMain.handle('bill-voucher-update-transaction', async (event, transactionData) => {
  return await billVoucherService.updateTransaction(transactionData.id, transactionData, transactionData.userId);
});

ipcMain.handle('bill-voucher-delete-transaction', async (event, { transactionId, userId }) => {
  return await billVoucherService.deleteTransaction(transactionId, userId);
});

ipcMain.handle('bill-voucher-get-next-voucher-number', async (event, { pastorateId, bookType }) => {
  return await billVoucherService.getNextVoucherNumber(pastorateId, bookType);
});

ipcMain.handle('bill-voucher-generate-transaction-id', async (event) => {
  return await billVoucherService.generateTransactionId();
});

ipcMain.handle('bill-voucher-get-statistics', async (event, { pastorateId, bookType }) => {
  return await billVoucherService.getStatistics(pastorateId, bookType);
});

// Acquittance IPC handlers
ipcMain.handle('acquittance-create-transaction', async (event, transactionData) => {
  return await acquittanceService.createTransaction(transactionData, transactionData.userId);
});

ipcMain.handle('acquittance-get-transactions', async (event, { pastorateId, userId, bookType, page, limit, filters }) => {
  return await acquittanceService.getTransactions(pastorateId, userId, bookType, page, limit, filters);
});

ipcMain.handle('acquittance-get-transaction', async (event, { transactionId }) => {
  return await acquittanceService.getTransaction(transactionId);
});

ipcMain.handle('acquittance-update-transaction', async (event, transactionData) => {
  return await acquittanceService.updateTransaction(transactionData.id, transactionData, transactionData.userId);
});

ipcMain.handle('acquittance-delete-transaction', async (event, { transactionId, userId }) => {
  return await acquittanceService.deleteTransaction(transactionId, userId);
});

ipcMain.handle('acquittance-get-next-voucher-number', async (event, { pastorateId, bookType }) => {
  return await acquittanceService.getNextVoucherNumber(pastorateId, bookType);
});

ipcMain.handle('acquittance-generate-transaction-id', async (event) => {
  return await acquittanceService.generateTransactionId();
});

ipcMain.handle('acquittance-get-statistics', async (event, { pastorateId, bookType }) => {
  return await acquittanceService.getStatistics(pastorateId, bookType);
});

ipcMain.handle('acquittance-get-payees-by-category', async (event, { pastorateId, bookType, primaryCategoryId, secondaryCategoryId, searchTerm }) => {
  return await acquittanceService.getPayeesByCategory(pastorateId, bookType, primaryCategoryId, secondaryCategoryId, searchTerm);
});

ipcMain.handle('acquittance-get-last-amount-for-payee', async (event, { pastorateId, bookType, primaryCategoryId, secondaryCategoryId, payeeName }) => {
  return await acquittanceService.getLastAmountForPayee(pastorateId, bookType, primaryCategoryId, secondaryCategoryId, payeeName);
});

// Contra IPC handlers
ipcMain.handle('contra-create-transaction', async (event, transactionData) => {
  return await contraService.createTransaction(transactionData, transactionData.userId);
});

ipcMain.handle('contra-get-transactions', async (event, { pastorateId, userId, bookType, page, limit, filters }) => {
  return await contraService.getTransactions(pastorateId, userId, bookType, page, limit, filters);
});

ipcMain.handle('contra-get-transaction', async (event, { transactionId }) => {
  return await contraService.getTransaction(transactionId);
});

ipcMain.handle('contra-update-transaction', async (event, transactionData) => {
  return await contraService.updateTransaction(transactionData.id, transactionData, transactionData.userId);
});

ipcMain.handle('contra-delete-transaction', async (event, { transactionId, userId }) => {
  return await contraService.deleteTransaction(transactionId, userId);
});

ipcMain.handle('contra-get-next-voucher-number', async (event, { pastorateId, bookType }) => {
  return await contraService.getNextVoucherNumber(pastorateId, bookType);
});

ipcMain.handle('contra-generate-transaction-id', async (event) => {
  return await contraService.generateTransactionId();
});

ipcMain.handle('contra-get-statistics', async (event, { pastorateId, bookType }) => {
  return await contraService.getStatistics(pastorateId, bookType);
});

// ========== CHURCH ACCOUNTS IPC HANDLERS ==========

// Church Ledger IPC handlers
ipcMain.handle('church-ledger-create-category', async (event, categoryData) => {
  return await churchLedgerService.createCategory(categoryData, categoryData.userId);
});

ipcMain.handle('church-ledger-get-categories', async (event, { churchId, bookType }) => {
  return await churchLedgerService.getCategories(churchId, bookType);
});

ipcMain.handle('church-ledger-update-category', async (event, categoryData) => {
  return await churchLedgerService.updateCategory(categoryData.categoryId, categoryData, categoryData.userId);
});

ipcMain.handle('church-ledger-delete-category', async (event, { categoryId, userId }) => {
  return await churchLedgerService.deleteCategory(categoryId, userId);
});

ipcMain.handle('church-ledger-create-sub-category', async (event, subCategoryData) => {
  return await churchLedgerService.createSubCategory(subCategoryData, subCategoryData.userId);
});

ipcMain.handle('church-ledger-get-sub-categories', async (event, { parentCategoryId }) => {
  return await churchLedgerService.getSubCategories(parentCategoryId);
});

ipcMain.handle('church-ledger-update-sub-category', async (event, subCategoryData) => {
  return await churchLedgerService.updateSubCategory(subCategoryData.subCategoryId, subCategoryData, subCategoryData.userId);
});

ipcMain.handle('church-ledger-delete-sub-category', async (event, { subCategoryId, userId }) => {
  return await churchLedgerService.deleteSubCategory(subCategoryId, userId);
});

ipcMain.handle('church-ledger-get-all-categories-with-subcategories', async (event, { churchId }) => {
  return await churchLedgerService.getAllCategoriesWithSubcategories(churchId);
});

// Church Receipts IPC handlers
ipcMain.handle('church-receipts-create-transaction', async (event, transactionData) => {
  return await churchReceiptsService.createTransaction(transactionData, transactionData.userId);
});

ipcMain.handle('church-receipts-get-transactions', async (event, { churchId, userId, bookType, page, limit, filters }) => {
  return await churchReceiptsService.getTransactions(churchId, userId, page, limit, filters);
});

ipcMain.handle('church-receipts-get-transaction', async (event, { transactionId }) => {
  return await churchReceiptsService.getTransaction(transactionId);
});

ipcMain.handle('church-receipts-update-transaction', async (event, transactionData) => {
  return await churchReceiptsService.updateTransaction(transactionData.id, transactionData, transactionData.userId);
});

ipcMain.handle('church-receipts-delete-transaction', async (event, { transactionId, userId }) => {
  return await churchReceiptsService.deleteTransaction(transactionId, userId);
});

ipcMain.handle('church-receipts-get-next-receipt-number', async (event, { churchId, bookType }) => {
  return await churchReceiptsService.getNextReceiptNumber(churchId, bookType);
});

ipcMain.handle('church-receipts-generate-transaction-id', async (event) => {
  return await churchReceiptsService.generateTransactionId();
});

ipcMain.handle('church-receipts-search-families', async (event, { churchId, searchTerm }) => {
  return await churchReceiptsService.searchFamilies(churchId, searchTerm);
});

ipcMain.handle('church-receipts-get-statistics', async (event, { churchId }) => {
  return await churchReceiptsService.getStatistics(churchId);
});

// Church Other Credits IPC handlers
ipcMain.handle('church-other-credits-create-transaction', async (event, transactionData) => {
  return await churchOtherCreditsService.createTransaction(transactionData, transactionData.userId);
});

ipcMain.handle('church-other-credits-get-transactions', async (event, { churchId, userId, bookType, page, limit, filters }) => {
  return await churchOtherCreditsService.getTransactions(churchId, userId, bookType, page, limit, filters);
});

ipcMain.handle('church-other-credits-get-transaction', async (event, { transactionId }) => {
  return await churchOtherCreditsService.getTransaction(transactionId);
});

ipcMain.handle('church-other-credits-update-transaction', async (event, transactionData) => {
  return await churchOtherCreditsService.updateTransaction(transactionData.id, transactionData, transactionData.userId);
});

ipcMain.handle('church-other-credits-delete-transaction', async (event, { transactionId, userId }) => {
  return await churchOtherCreditsService.deleteTransaction(transactionId, userId);
});

ipcMain.handle('church-other-credits-get-next-credit-number', async (event, { churchId, bookType }) => {
  return await churchOtherCreditsService.getNextCreditNumber(churchId, bookType);
});

ipcMain.handle('church-other-credits-generate-transaction-id', async (event) => {
  return await churchOtherCreditsService.generateTransactionId();
});

ipcMain.handle('church-other-credits-search-families', async (event, { churchId, searchTerm }) => {
  return await churchOtherCreditsService.searchFamilies(churchId, searchTerm);
});

ipcMain.handle('church-other-credits-get-statistics', async (event, { churchId, bookType }) => {
  return await churchOtherCreditsService.getStatistics(churchId, bookType);
});

// Church Bill Voucher IPC handlers
ipcMain.handle('church-bill-vouchers-create-transaction', async (event, transactionData) => {
  return await churchBillVoucherService.createTransaction(transactionData, transactionData.userId);
});

ipcMain.handle('church-bill-vouchers-get-transactions', async (event, { churchId, userId, bookType, page, limit, filters }) => {
  return await churchBillVoucherService.getTransactions(churchId, userId, bookType, page, limit, filters);
});

ipcMain.handle('church-bill-vouchers-get-transaction', async (event, { transactionId }) => {
  return await churchBillVoucherService.getTransaction(transactionId);
});

ipcMain.handle('church-bill-vouchers-update-transaction', async (event, transactionData) => {
  return await churchBillVoucherService.updateTransaction(transactionData.id, transactionData, transactionData.userId);
});

ipcMain.handle('church-bill-vouchers-delete-transaction', async (event, { transactionId, userId }) => {
  return await churchBillVoucherService.deleteTransaction(transactionId, userId);
});

ipcMain.handle('church-bill-vouchers-get-next-voucher-number', async (event, { churchId, bookType }) => {
  return await churchBillVoucherService.getNextVoucherNumber(churchId, bookType);
});

ipcMain.handle('church-bill-vouchers-generate-transaction-id', async (event) => {
  return await churchBillVoucherService.generateTransactionId();
});

ipcMain.handle('church-bill-vouchers-get-statistics', async (event, { churchId, bookType }) => {
  return await churchBillVoucherService.getStatistics(churchId, bookType);
});

// Church Acquittance IPC handlers
ipcMain.handle('church-acquittance-create-transaction', async (event, transactionData) => {
  return await churchAcquittanceService.createTransaction(transactionData, transactionData.userId);
});

ipcMain.handle('church-acquittance-get-transactions', async (event, { churchId, userId, bookType, page, limit, filters }) => {
  return await churchAcquittanceService.getTransactions(churchId, userId, bookType, page, limit, filters);
});

ipcMain.handle('church-acquittance-get-transaction', async (event, { transactionId }) => {
  return await churchAcquittanceService.getTransaction(transactionId);
});

ipcMain.handle('church-acquittance-update-transaction', async (event, transactionData) => {
  return await churchAcquittanceService.updateTransaction(transactionData.id, transactionData, transactionData.userId);
});

ipcMain.handle('church-acquittance-delete-transaction', async (event, { transactionId, userId }) => {
  return await churchAcquittanceService.deleteTransaction(transactionId, userId);
});

ipcMain.handle('church-acquittance-get-next-voucher-number', async (event, { churchId, bookType }) => {
  return await churchAcquittanceService.getNextVoucherNumber(churchId, bookType);
});

ipcMain.handle('church-acquittance-generate-transaction-id', async (event) => {
  return await churchAcquittanceService.generateTransactionId();
});

ipcMain.handle('church-acquittance-get-statistics', async (event, { churchId, bookType }) => {
  return await churchAcquittanceService.getStatistics(churchId, bookType);
});

// Church Contra IPC handlers
ipcMain.handle('church-contra-create-transaction', async (event, transactionData) => {
  return await churchContraService.createTransaction(transactionData, transactionData.userId);
});

ipcMain.handle('church-contra-get-transactions', async (event, { churchId, userId, bookType, page, limit, filters }) => {
  return await churchContraService.getTransactions(churchId, userId, bookType, page, limit, filters);
});

ipcMain.handle('church-contra-get-transaction', async (event, { transactionId }) => {
  return await churchContraService.getTransaction(transactionId);
});

ipcMain.handle('church-contra-update-transaction', async (event, transactionData) => {
  return await churchContraService.updateTransaction(transactionData.id, transactionData, transactionData.userId);
});

ipcMain.handle('church-contra-delete-transaction', async (event, { transactionId, userId }) => {
  return await churchContraService.deleteTransaction(transactionId, userId);
});

ipcMain.handle('church-contra-get-next-voucher-number', async (event, { churchId, bookType }) => {
  return await churchContraService.getNextVoucherNumber(churchId, bookType);
});

ipcMain.handle('church-contra-generate-transaction-id', async (event) => {
  return await churchContraService.generateTransactionId();
});

ipcMain.handle('church-contra-get-statistics', async (event, { churchId, bookType }) => {
  return await churchContraService.getStatistics(churchId, bookType);
});

// Account Balance IPC handlers
ipcMain.handle('account-balance-get-all', async (event, { pastorateId }) => {
  return await accountBalanceService.getAllAccountBalances(pastorateId);
});

ipcMain.handle('account-balance-get-by-book-type', async (event, { pastorateId, bookType }) => {
  return await accountBalanceService.getAccountBalance(pastorateId, bookType);
});

// Church Account Balance IPC handlers
ipcMain.handle('church-account-balance-get-all', async (event, { churchId }) => {
  return await churchAccountBalanceService.getAllAccountBalances(churchId);
});

ipcMain.handle('church-account-balance-get-by-book-type', async (event, { churchId, bookType }) => {
  return await churchAccountBalanceService.getAccountBalance(churchId, bookType);
});

// Account List IPC handlers
ipcMain.handle('account-list-get-all-for-pastorate', async (event, { pastorateId }) => {
  return await accountListService.getAllAccountsForPastorate(pastorateId);
});

ipcMain.handle('account-list-get-all-for-church', async (event, { churchId }) => {
  return await accountListService.getAllAccountsForChurch(churchId);
});

ipcMain.handle('account-list-get-categories-for-account', async (event, { accountType, accountId }) => {
  return await accountListService.getCategoriesForAccount(accountType, accountId);
});

// Rough Cash Book IPC handlers
ipcMain.handle('rough-cash-book-get-available-months', async (event, { pastorateId, userId }) => {
  return await roughCashBookService.getAvailableMonths(pastorateId, userId);
});

ipcMain.handle('rough-cash-book-get-report-data', async (event, { pastorateId, userId, month }) => {
  return await roughCashBookService.getReportData(pastorateId, userId, month);
});

ipcMain.handle('rough-cash-book-generate-pdf', async (event, { reportData, options }) => {
  return await roughCashBookReportPuppeteerService.generateRoughCashBookPDF(reportData, options);
});

// Offerings Report IPC handlers
ipcMain.handle('offerings-report-get-report-data', async (event, { pastorateId, userId, month, churchId }) => {
  return await offeringsReportService.getReportData(pastorateId, userId, month, churchId);
});

ipcMain.handle('offerings-report-generate-pdf', async (event, { reportData, options }) => {
  return await offeringsReportPuppeteerService.generateOffertoryBookPDF(reportData, options);
});

// Indent IPC handlers
// Deduction Fields
ipcMain.handle('indent-get-deduction-fields', async (event, { pastorateId }) => {
  return await indentService.getDeductionFields(pastorateId);
});

ipcMain.handle('indent-create-deduction-field', async (event, { pastorateId, fieldData }) => {
  return await indentService.createDeductionField(pastorateId, fieldData);
});

ipcMain.handle('indent-update-deduction-field', async (event, { fieldId, fieldData }) => {
  return await indentService.updateDeductionField(fieldId, fieldData);
});

ipcMain.handle('indent-delete-deduction-field', async (event, { fieldId }) => {
  return await indentService.deleteDeductionField(fieldId);
});

// Employees
ipcMain.handle('indent-get-employees', async (event, { pastorateId, filters }) => {
  return await indentService.getEmployees(pastorateId, filters);
});

ipcMain.handle('indent-get-employee', async (event, { employeeId }) => {
  return await indentService.getEmployeeById(employeeId);
});

ipcMain.handle('indent-create-employee', async (event, { pastorateId, userId, employeeData }) => {
  return await indentService.createEmployee(pastorateId, userId, employeeData);
});

ipcMain.handle('indent-update-employee', async (event, { employeeId, employeeData }) => {
  return await indentService.updateEmployee(employeeId, employeeData);
});

ipcMain.handle('indent-delete-employee', async (event, { employeeId }) => {
  return await indentService.deleteEmployee(employeeId);
});

// Allowance Fields
ipcMain.handle('indent-get-allowance-fields', async (event, { pastorateId }) => {
  return await indentService.getAllowanceFields(pastorateId);
});

ipcMain.handle('indent-create-allowance-field', async (event, { pastorateId, fieldData }) => {
  return await indentService.createAllowanceField(pastorateId, fieldData);
});

ipcMain.handle('indent-update-allowance-field', async (event, { fieldId, fieldData }) => {
  return await indentService.updateAllowanceField(fieldId, fieldData);
});

ipcMain.handle('indent-delete-allowance-field', async (event, { fieldId }) => {
  return await indentService.deleteAllowanceField(fieldId);
});

// Allowances
ipcMain.handle('indent-get-allowances', async (event, { pastorateId, filters }) => {
  return await indentService.getAllowances(pastorateId, filters);
});

ipcMain.handle('indent-get-allowance', async (event, { allowanceId }) => {
  return await indentService.getAllowanceById(allowanceId);
});

ipcMain.handle('indent-create-allowance', async (event, { pastorateId, userId, allowanceData }) => {
  return await indentService.createAllowance(pastorateId, userId, allowanceData);
});

ipcMain.handle('indent-update-allowance', async (event, { allowanceId, allowanceData }) => {
  return await indentService.updateAllowance(allowanceId, allowanceData);
});

ipcMain.handle('indent-delete-allowance', async (event, { allowanceId }) => {
  return await indentService.deleteAllowance(allowanceId);
});

// Payment Fields
ipcMain.handle('indent-get-payment-fields', async (event, { pastorateId }) => {
  return await indentService.getPaymentFields(pastorateId);
});

ipcMain.handle('indent-create-payment-field', async (event, { pastorateId, fieldData }) => {
  return await indentService.createPaymentField(pastorateId, fieldData);
});

ipcMain.handle('indent-update-payment-field', async (event, { fieldId, fieldData }) => {
  return await indentService.updatePaymentField(fieldId, fieldData);
});

ipcMain.handle('indent-delete-payment-field', async (event, { fieldId }) => {
  return await indentService.deletePaymentField(fieldId);
});

// Payments
ipcMain.handle('indent-get-payments', async (event, { pastorateId, filters }) => {
  return await indentService.getPayments(pastorateId, filters);
});

ipcMain.handle('indent-get-payment', async (event, { paymentId }) => {
  return await indentService.getPaymentById(paymentId);
});

ipcMain.handle('indent-create-payment', async (event, { pastorateId, userId, paymentData }) => {
  return await indentService.createPayment(pastorateId, userId, paymentData);
});

ipcMain.handle('indent-update-payment', async (event, { paymentId, paymentData }) => {
  return await indentService.updatePayment(paymentId, paymentData);
});

ipcMain.handle('indent-delete-payment', async (event, { paymentId }) => {
  return await indentService.deletePayment(paymentId);
});

// Monthly Payouts
ipcMain.handle('indent-get-monthly-payouts', async (event, { pastorateId, filters }) => {
  return await indentService.getMonthlyPayouts(pastorateId, filters);
});

ipcMain.handle('indent-get-monthly-payout', async (event, { payoutId }) => {
  return await indentService.getMonthlyPayoutById(payoutId);
});

ipcMain.handle('indent-create-monthly-payout', async (event, { pastorateId, userId, payoutData }) => {
  return await indentService.createMonthlyPayout(pastorateId, userId, payoutData);
});

ipcMain.handle('indent-update-monthly-payout', async (event, { payoutId, payoutData }) => {
  return await indentService.updateMonthlyPayout(payoutId, payoutData);
});

ipcMain.handle('indent-delete-monthly-payout', async (event, { payoutId }) => {
  return await indentService.deleteMonthlyPayout(payoutId);
});

// Employee Salary IPC handlers
ipcMain.handle('indent-get-employee-salaries', async (event, { pastorateId, filters }) => {
  return await indentService.getEmployeeSalaries(pastorateId, filters);
});

ipcMain.handle('indent-get-employee-salary', async (event, { employeeId }) => {
  return await indentService.getEmployeeSalaryById(employeeId);
});

ipcMain.handle('indent-create-employee-salary', async (event, { pastorateId, userId, employeeData }) => {
  return await indentService.createEmployeeSalary(pastorateId, userId, employeeData);
});

ipcMain.handle('indent-update-employee-salary', async (event, { employeeId, employeeData }) => {
  return await indentService.updateEmployeeSalary(employeeId, employeeData);
});

ipcMain.handle('indent-delete-employee-salary', async (event, { employeeId }) => {
  return await indentService.deleteEmployeeSalary(employeeId);
});

// Employee Allowance IPC handlers
ipcMain.handle('indent-get-employee-allowances', async (event, { pastorateId }) => {
  return await indentService.getEmployeeAllowances(pastorateId);
});

ipcMain.handle('indent-get-employee-allowance', async (event, { employeeId }) => {
  return await indentService.getEmployeeAllowanceByEmployeeId(employeeId);
});

ipcMain.handle('indent-update-employee-allowance', async (event, { employeeId, allowanceData }) => {
  return await indentService.updateEmployeeAllowance(employeeId, allowanceData);
});

ipcMain.handle('indent-get-employee-allowance-fields', async (event, { pastorateId }) => {
  return await indentService.getEmployeeAllowanceFields(pastorateId);
});

ipcMain.handle('indent-create-employee-allowance-field', async (event, { pastorateId, fieldData }) => {
  return await indentService.createEmployeeAllowanceField(pastorateId, fieldData);
});

ipcMain.handle('indent-delete-employee-allowance-field', async (event, { fieldId }) => {
  return await indentService.deleteEmployeeAllowanceField(fieldId);
});

// Employee Deduction IPC handlers
ipcMain.handle('indent-get-employee-deductions', async (event, { pastorateId }) => {
  return await indentService.getEmployeeDeductions(pastorateId);
});

ipcMain.handle('indent-get-employee-deduction', async (event, { employeeId }) => {
  return await indentService.getEmployeeDeductionByEmployeeId(employeeId);
});

ipcMain.handle('indent-update-employee-deduction', async (event, { employeeId, deductionData }) => {
  return await indentService.updateEmployeeDeduction(employeeId, deductionData);
});

ipcMain.handle('indent-get-employee-deduction-fields', async (event, { pastorateId }) => {
  return await indentService.getEmployeeDeductionFields(pastorateId);
});

ipcMain.handle('indent-create-employee-deduction-field', async (event, { pastorateId, fieldData }) => {
  return await indentService.createEmployeeDeductionField(pastorateId, fieldData);
});

ipcMain.handle('indent-delete-employee-deduction-field', async (event, { fieldId }) => {
  return await indentService.deleteEmployeeDeductionField(fieldId);
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
  pastorateService = new PastorateService(db);
  pastorateSettingsService = new PastorateSettingsService(db);
  churchService = new ChurchService(db);
  churchSettingsService = new ChurchSettingsService(db);
  areaService = new AreaService(db);
  prayerCellService = new PrayerCellService(db);
  familyService = new FamilyService(db);
  memberService = new MemberService(db);
  sabaiJabithaService = new SabaiJabithaService(db);
  birthdayReportPuppeteerService = new BirthdayReportPuppeteerService(db);
  weddingReportPuppeteerService = new WeddingReportPuppeteerService(db);
  sabaiJabithaReportPuppeteerService = new SabaiJabithaReportPuppeteerService(db);
  adultBaptismService = new AdultBaptismService(db);
  adultBaptismReportPuppeteerService = new AdultBaptismReportPuppeteerService(db);
  infantBaptismService = new InfantBaptismService(db);
  infantBaptismReportPuppeteerService = new InfantBaptismReportPuppeteerService(db);
  burialRegisterService = new BurialRegisterService(db);
  burialRegisterReportPuppeteerService = new BurialRegisterReportPuppeteerService(db);
  letterpadService = new LetterpadService(db);
  letterpadReportPuppeteerService = new LetterpadReportPuppeteerService(db);
  offeringsService = new OfferingsService(db);
  receiptsService = new ReceiptsService(db);
  ledgerService = new LedgerService(db);
  otherCreditsService = new OtherCreditsService(db);
  billVoucherService = new BillVoucherService(db);
  acquittanceService = new AcquittanceService(db);
  contraService = new ContraService(db);
  churchLedgerService = new ChurchLedgerService(db);
  churchReceiptsService = new ChurchReceiptsService(db);
  churchOtherCreditsService = new ChurchOtherCreditsService(db);
  churchBillVoucherService = new ChurchBillVoucherService(db);
  churchAcquittanceService = new ChurchAcquittanceService(db);
  churchContraService = new ChurchContraService(db);
  accountBalanceService = new AccountBalanceService(db);
  churchAccountBalanceService = new ChurchAccountBalanceService(db);
  accountListService = new AccountListService(db);
  indentService = new IndentService(db);
  roughCashBookService = new RoughCashBookService(db);
  roughCashBookReportPuppeteerService = new RoughCashBookReportPuppeteerService(db);
  offeringsReportService = new OfferingsReportService(db);
  offeringsReportPuppeteerService = new OfferingsReportPuppeteerService(db);

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
