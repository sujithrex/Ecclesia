const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;
const { BrowserWindow } = require('electron');

class BirthdayReportPuppeteerService {
    constructor(db) {
        this.db = db;
        this.templatePath = path.join(__dirname, 'templates', 'birthdaylist.ejs');
        this.fontPath = path.join(__dirname, 'assets', 'fonts', 'Vijaya.ttf');

        // Find Chrome executable path
        this.executablePath = this.findChromePath();
    }

    /**
     * Find Chrome/Chromium executable path
     * @returns {string|undefined} - Path to Chrome executable
     */
    findChromePath() {
        const { execSync } = require('child_process');
        const os = require('os');

        try {
            // Try common Chrome paths based on OS
            const platform = os.platform();

            if (platform === 'win32') {
                // Windows paths
                const paths = [
                    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
                    process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
                    process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe'
                ];

                for (const chromePath of paths) {
                    try {
                        if (require('fs').existsSync(chromePath)) {
                            console.log('✅ Found Chrome at:', chromePath);
                            return chromePath;
                        }
                    } catch (e) {
                        // Continue to next path
                    }
                }
            } else if (platform === 'darwin') {
                // macOS
                return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
            } else {
                // Linux
                const paths = [
                    '/usr/bin/google-chrome',
                    '/usr/bin/chromium-browser',
                    '/usr/bin/chromium'
                ];

                for (const chromePath of paths) {
                    try {
                        if (require('fs').existsSync(chromePath)) {
                            return chromePath;
                        }
                    } catch (e) {
                        // Continue to next path
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not find Chrome path:', error.message);
        }

        return undefined;
    }

    /**
     * Generate birthday PDF using Puppeteer
     * @param {Array} reportData - Array of family data with members and celebrants
     * @param {Object} church - Church information
     * @param {Object} dateRange - Date range with fromDate and toDate
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - Result with success flag and pdfBuffer or error
     */
    async generateBirthdayPDF(reportData, church, dateRange, options = {}) {
        let browser = null;
        
        try {
            console.log('🔄 Starting Puppeteer birthday PDF generation...');
            console.log(`📊 Report data: ${reportData.length} families`);
            
            // Validate input
            if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
                throw new Error('No report data provided');
            }
            
            if (!church || !church.church_name) {
                throw new Error('Invalid church data provided');
            }
            
            if (!dateRange || !dateRange.fromDate || !dateRange.toDate) {
                throw new Error('Invalid date range provided');
            }
            
            // Render HTML from template
            const html = await this.renderHTMLTemplate(reportData, church, dateRange);
            console.log('✅ HTML template rendered');

            // Try Electron's built-in PDF generation first (faster and more reliable)
            let pdfBuffer;
            try {
                pdfBuffer = await this.convertHTMLToPDFElectron(html, options);
                console.log('✅ PDF generated successfully using Electron');
            } catch (electronError) {
                console.warn('⚠️ Electron PDF generation failed, falling back to Puppeteer:', electronError.message);
                // Fallback to Puppeteer if Electron method fails
                pdfBuffer = await this.convertHTMLToPDF(html, options);
                console.log('✅ PDF generated successfully using Puppeteer');
            }
            
            return {
                success: true,
                pdfBuffer: pdfBuffer
            };
            
        } catch (error) {
            console.error('❌ Error generating birthday PDF:', error);
            return {
                success: false,
                error: error.message
            };
        } finally {
            if (browser) {
                try {
                    await browser.close();
                    console.log('✅ Browser closed');
                } catch (closeError) {
                    console.error('⚠️ Error closing browser:', closeError);
                }
            }
        }
    }

    /**
     * Render HTML template with data
     * @param {Array} reportData - Report data
     * @param {Object} church - Church information
     * @param {Object} dateRange - Date range
     * @returns {Promise<string>} - Rendered HTML string
     */
    async renderHTMLTemplate(reportData, church, dateRange) {
        try {
            // Read template file
            const templateContent = await fs.readFile(this.templatePath, 'utf-8');
            
            // Prepare font path for template (convert Windows path to file:// URL)
            const fontPath = this.fontPath.replace(/\\/g, '/');
            
            // Render template with EJS
            const html = ejs.render(templateContent, {
                reportData: reportData,
                church: church,
                dateRange: dateRange,
                fontPath: fontPath
            });
            
            return html;
            
        } catch (error) {
            console.error('Error rendering HTML template:', error);
            throw new Error(`Template rendering failed: ${error.message}`);
        }
    }

    /**
     * Convert HTML to PDF using Electron's built-in printToPDF
     * This is faster and more reliable than Puppeteer in Electron environment
     * @param {string} html - HTML content
     * @param {Object} options - PDF generation options
     * @returns {Promise<Buffer>} - PDF buffer
     */
    async convertHTMLToPDFElectron(html, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                console.log('🚀 Creating hidden Electron window for PDF generation...');

                // Create a hidden browser window
                const win = new BrowserWindow({
                    show: false,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true
                    }
                });

                // Load HTML content
                win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

                // Wait for content to load
                win.webContents.on('did-finish-load', async () => {
                    try {
                        console.log('✅ Content loaded, generating PDF...');

                        // Generate PDF
                        const pdfBuffer = await win.webContents.printToPDF({
                            pageSize: 'A4',
                            printBackground: true,
                            margins: {
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0
                            }
                        });

                        console.log('✅ PDF buffer generated');

                        // Close window
                        win.close();

                        resolve(pdfBuffer);
                    } catch (error) {
                        win.close();
                        reject(error);
                    }
                });

                // Handle load errors
                win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
                    win.close();
                    reject(new Error(`Failed to load HTML: ${errorDescription}`));
                });

                // Timeout after 30 seconds
                setTimeout(() => {
                    if (!win.isDestroyed()) {
                        win.close();
                        reject(new Error('PDF generation timed out after 30 seconds'));
                    }
                }, 30000);

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Convert HTML to PDF using Puppeteer (fallback method)
     * @param {string} html - HTML content
     * @param {Object} options - PDF generation options
     * @returns {Promise<Buffer>} - PDF buffer
     */
    async convertHTMLToPDF(html, options = {}) {
        let browser = null;
        
        try {
            console.log('🚀 Launching Puppeteer browser...');

            // Launch browser configuration
            const launchOptions = {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-software-rasterizer',
                    '--disable-extensions'
                ],
                timeout: 60000 // Increase timeout to 60 seconds
            };

            // Add executable path if found
            if (this.executablePath) {
                launchOptions.executablePath = this.executablePath;
                console.log('📍 Using Chrome at:', this.executablePath);
            } else {
                console.log('⚠️ Using bundled Chromium (may be slower)');
            }

            // Launch browser
            browser = await puppeteer.launch(launchOptions);

            console.log('✅ Browser launched');
            
            // Create new page
            const page = await browser.newPage();
            console.log('✅ Page created');
            
            // Set content
            await page.setContent(html, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
            console.log('✅ Content set');
            
            // Generate PDF
            const pdfBuffer = await page.pdf({
                width: '210.00mm',
                height: '297.00mm',
                printBackground: true,
                preferCSSPageSize: true,
                margin: {
                    top: '0mm',
                    right: '0mm',
                    bottom: '0mm',
                    left: '0mm'
                }
            });
            
            console.log('✅ PDF buffer generated');
            
            return pdfBuffer;
            
        } catch (error) {
            console.error('Error converting HTML to PDF:', error);
            throw new Error(`PDF conversion failed: ${error.message}`);
        } finally {
            if (browser) {
                try {
                    await browser.close();
                    console.log('✅ Browser closed in convertHTMLToPDF');
                } catch (closeError) {
                    console.error('⚠️ Error closing browser in convertHTMLToPDF:', closeError);
                }
            }
        }
    }

    /**
     * Format date range for display
     * @param {string} dateStr - Date string
     * @returns {string} - Formatted date (DD-MM)
     */
    formatDateRange(dateStr) {
        if (!dateStr) return '';
        if (dateStr.match(/^\d{2}-\d{2}$/)) return dateStr;
        
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr;
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}-${month}`;
    }

    /**
     * Format respect title
     * @param {string} respect - Respect value
     * @returns {string} - Formatted respect
     */
    formatRespect(respect) {
        if (!respect) return '';
        const respectMap = {
            'mr': 'Mr.',
            'mrs': 'Mrs.',
            'ms': 'Ms.',
            'master': 'Master',
            'rev': 'Rev.',
            'dr': 'Dr.',
            'er': 'Er.',
            'sis': 'Sis.',
            'bishop': 'Bishop'
        };
        return respectMap[respect.toLowerCase()] || respect;
    }

    /**
     * Calculate age from date of birth
     * @param {string} dob - Date of birth
     * @returns {number} - Age in years
     */
    calculateAge(dob) {
        if (!dob) return null;
        
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }
}

module.exports = BirthdayReportPuppeteerService;

