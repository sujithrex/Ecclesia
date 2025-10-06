const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;
const { BrowserWindow } = require('electron');

class LetterpadReportPuppeteerService {
    constructor(db) {
        this.db = db;
        this.templatePath = path.join(__dirname, 'templates', 'letterpad.ejs');
        this.fontPath = path.join(__dirname, 'assets', 'fonts', 'Vijaya.ttf');
        this.csiLogoPath = path.join(__dirname, '..', 'frontend', 'src', 'assets', 'Church_of_South_India.png');
        this.dioceseLogoPath = path.join(__dirname, '..', 'frontend', 'src', 'assets', 'CSI_Tirunelveli_Diocese_Logo.png');

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
                    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
                ];

                for (const chromePath of paths) {
                    try {
                        require('fs').accessSync(chromePath);
                        return chromePath;
                    } catch (e) {
                        // Continue to next path
                    }
                }
            } else if (platform === 'darwin') {
                // macOS path
                return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
            } else {
                // Linux - try to find using which command
                try {
                    const chromePath = execSync('which google-chrome').toString().trim();
                    if (chromePath) return chromePath;
                } catch (e) {
                    // Try chromium
                    try {
                        const chromiumPath = execSync('which chromium-browser').toString().trim();
                        if (chromiumPath) return chromiumPath;
                    } catch (e2) {
                        // Continue
                    }
                }
            }
        } catch (error) {
            console.warn('Could not find Chrome executable:', error.message);
        }

        return undefined;
    }

    /**
     * Generate letterpad PDF using Puppeteer
     * @param {Object} letterpad - Letterpad data
     * @param {Object} pastorate - Pastorate information
     * @param {Object} pastorateSettings - Pastorate settings
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - Result with success flag and pdfBuffer or error
     */
    async generateLetterpadPDF(letterpad, pastorate, pastorateSettings, options = {}) {
        let browser = null;

        try {
            console.log('🔄 Starting Puppeteer letterpad generation...');
            console.log('📊 Letterpad:', letterpad.letterpad_number);
            console.log('🎯 Action:', options.action || 'view');

            // Validate input
            if (!letterpad) {
                throw new Error('No letterpad data provided');
            }

            if (!pastorate || !pastorate.pastorate_name) {
                throw new Error('Invalid pastorate data provided');
            }

            // Render HTML from template
            const html = await this.renderHTMLTemplate(letterpad, pastorate, pastorateSettings);
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
            console.error('❌ Error generating letterpad PDF:', error);
            return {
                success: false,
                error: error.message || 'Failed to generate PDF'
            };
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    /**
     * Render HTML template with data
     * @param {Object} letterpad - Letterpad data
     * @param {Object} pastorate - Pastorate information
     * @param {Object} pastorateSettings - Pastorate settings
     * @returns {Promise<string>} - Rendered HTML string
     */
    async renderHTMLTemplate(letterpad, pastorate, pastorateSettings) {
        try {
            // Read template file
            const templateContent = await fs.readFile(this.templatePath, 'utf-8');

            // Prepare font path for template (convert Windows path to file:// URL)
            const fontPath = this.fontPath.replace(/\\/g, '/');

            // Convert logos to base64 for reliable embedding
            const csiLogoBuffer = await fs.readFile(this.csiLogoPath);
            const csiLogoBase64 = `data:image/png;base64,${csiLogoBuffer.toString('base64')}`;

            const dioceseLogoBuffer = await fs.readFile(this.dioceseLogoPath);
            const dioceseLogoBase64 = `data:image/png;base64,${dioceseLogoBuffer.toString('base64')}`;

            // Format date helper function
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            };

            // Render template with EJS
            const html = ejs.render(templateContent, {
                letterpad: letterpad,
                pastorate: pastorate,
                pastorateSettings: pastorateSettings,
                fontPath: fontPath,
                csiLogoBase64: csiLogoBase64,
                dioceseLogoBase64: dioceseLogoBase64,
                formatDate: formatDate
            });

            return html;
        } catch (error) {
            console.error('Error rendering HTML template:', error);
            throw new Error('Failed to render HTML template: ' + error.message);
        }
    }

    /**
     * Convert HTML to PDF using Electron's built-in PDF generation
     * @param {string} html - HTML content
     * @param {Object} options - PDF options
     * @returns {Promise<Buffer>} - PDF buffer
     */
    async convertHTMLToPDFElectron(html, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                // Create a hidden browser window
                const win = new BrowserWindow({
                    show: false,
                    webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true
                    }
                });

                // Set timeout for PDF generation
                const timeout = setTimeout(() => {
                    win.close();
                    reject(new Error('PDF generation timeout'));
                }, 30000);

                // Load HTML content
                win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

                // Wait for content to load
                win.webContents.on('did-finish-load', async () => {
                    try {
                        console.log('✅ Content loaded, generating PDF...');

                        // Generate PDF - Portrait orientation for letterpad
                        const pdfBuffer = await win.webContents.printToPDF({
                            landscape: false,
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
                        clearTimeout(timeout);
                        win.close();

                        resolve(pdfBuffer);
                    } catch (error) {
                        clearTimeout(timeout);
                        win.close();
                        reject(error);
                    }
                });

                // Handle load errors
                win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
                    clearTimeout(timeout);
                    win.close();
                    reject(new Error(`Failed to load HTML: ${errorDescription}`));
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Convert HTML to PDF using Puppeteer (fallback method)
     * @param {string} html - HTML content
     * @param {Object} options - PDF options
     * @returns {Promise<Buffer>} - PDF buffer
     */
    async convertHTMLToPDF(html, options = {}) {
        let browser = null;

        try {
            console.log('🔄 Starting Puppeteer PDF conversion...');

            // Launch options
            const launchOptions = {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            };

            // Add executable path if found
            if (this.executablePath) {
                launchOptions.executablePath = this.executablePath;
                console.log('✅ Using Chrome at:', this.executablePath);
            } else {
                console.log('⚠️ Using bundled Chromium');
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

            // Generate PDF - Portrait orientation
            const pdfBuffer = await page.pdf({
                width: '210.00mm',
                height: '297.00mm',
                landscape: false,
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
            throw error;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}

module.exports = LetterpadReportPuppeteerService;