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
const LetterpadService = require('./backend/letterpadService.js');
const LetterpadReportPuppeteerService = require('./backend/letterpadReportPuppeteerService.js');

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
let letterpadService;
let letterpadReportPuppeteerService;

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
  letterpadService = new LetterpadService(db);
  letterpadReportPuppeteerService = new LetterpadReportPuppeteerService(db);

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
