const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;
const { BrowserWindow } = require('electron');

class BurialRegisterReportPuppeteerService {
    constructor(db) {
        this.db = db;
        this.templatePath = path.join(__dirname, 'templates', 'burial_register.ejs');
        this.fontPath = path.join(__dirname, 'assets', 'fonts', 'Vijaya.ttf');
        this.imagePath = path.join(__dirname, 'assets', 'images', 'burial_reg.png');

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
     * Generate burial register PDF using Puppeteer
     * @param {Object} register - Burial register data
     * @param {Object} church - Church information
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - Result with success flag and pdfBuffer or error
     */
    async generateRegisterPDF(register, church, options = {}) {
        let browser = null;

        try {
            console.log('🔄 Starting Puppeteer burial register generation...');
            console.log('📊 Register:', register.name_of_person_died);
            console.log('🎯 Action:', options.action || 'view');

            // Validate input
            if (!register) {
                throw new Error('No register data provided');
            }

            if (!church || !church.church_name) {
                throw new Error('Invalid church data provided');
            }

            // Get pastorate information
            const pastorate = await this.getPastorateByChurchId(church.id);
            console.log('✅ Pastorate information retrieved:', pastorate?.pastorate_name);

            // Render HTML from template
            const html = await this.renderHTMLTemplate(register, church, pastorate);
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
            console.error('❌ Error generating burial register PDF:', error);
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
     * Get pastorate information by church ID
     * @param {number} churchId - Church ID
     * @returns {Promise<Object|null>} - Pastorate information
     */
    async getPastorateByChurchId(churchId) {
        try {
            const church = await this.db.getChurchById(churchId);
            if (!church || !church.pastorate_id) {
                return null;
            }

            const pastorate = await this.db.getPastorateById(church.pastorate_id);
            return pastorate;
        } catch (error) {
            console.error('Error getting pastorate:', error);
            return null;
        }
    }

    /**
     * Render HTML template with data
     * @param {Object} register - Burial register data
     * @param {Object} church - Church information
     * @param {Object} pastorate - Pastorate information
     * @returns {Promise<string>} - Rendered HTML string
     */
    async renderHTMLTemplate(register, church, pastorate) {
        try {
            // Read template file
            const templateContent = await fs.readFile(this.templatePath, 'utf-8');

            // Prepare font path for template (convert Windows path to file:// URL)
            const fontPath = this.fontPath.replace(/\\/g, '/');

            // Convert image to base64 for reliable embedding
            const imageBuffer = await fs.readFile(this.imagePath);
            const imageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;

            // Render template with EJS
            const html = ejs.render(templateContent, {
                register: register,
                church: church,
                pastorate: pastorate,
                fontPath: fontPath,
                imageBase64: imageBase64
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
                console.log('🔄 Using Electron PDF generation...');

                // Create a hidden browser window
                const win = new BrowserWindow({
                    width: 1200,
                    height: 800,
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
                }, 30000); // 30 seconds timeout

                // Load HTML content
                win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

                // Wait for content to load
                win.webContents.on('did-finish-load', async () => {
                    try {
                        console.log('✅ Content loaded, generating PDF...');

                        // Generate PDF - Landscape orientation for burial register
                        const pdfBuffer = await win.webContents.printToPDF({
                            landscape: true,
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
                    reject(new Error(`Failed to load content: ${errorDescription}`));
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
            console.log('🔄 Launching Puppeteer...');

            // Launch browser with executable path if found
            const launchOptions = {
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            };

            if (this.executablePath) {
                launchOptions.executablePath = this.executablePath;
            }

            browser = await puppeteer.launch(launchOptions);
            console.log('✅ Browser launched');

            const page = await browser.newPage();
            console.log('✅ Page created');

            // Set content
            await page.setContent(html, { waitUntil: 'networkidle0' });
            console.log('✅ Content set');

            // Generate PDF - Landscape orientation
            const pdfBuffer = await page.pdf({
                width: '297.00mm',
                height: '210.00mm',
                landscape: true,
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

module.exports = BurialRegisterReportPuppeteerService;

