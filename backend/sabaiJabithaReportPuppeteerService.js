const ejs = require('ejs');
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');
const { BrowserWindow } = require('electron');

class SabaiJabithaReportPuppeteerService {
    constructor(db) {
        this.db = db;
        this.templatePath = path.join(__dirname, 'templates', 'sabai_jabitha.ejs');
        this.fontPath = path.join(__dirname, 'assets', 'fonts', 'Vijaya.ttf');
    }

    /**
     * Generate Sabai Jabitha PDF using Puppeteer
     * @param {Array} congregationData - Array of family data with members
     * @param {Object} church - Church information
     * @param {Object} options - Additional options (year, areaId)
     * @returns {Promise<Object>} - Result with success status and PDF buffer
     */
    async generateSabaiJabithaPDF(congregationData, church, options = {}) {
        try {
            console.log('🔄 Starting Puppeteer Sabai Jabitha report generation...');
            console.log('📊 Report data:', congregationData.length, 'families');
            console.log('🎯 Action:', options.action || 'view');
            
            // Validate input
            if (!congregationData || !Array.isArray(congregationData) || congregationData.length === 0) {
                throw new Error('No congregation data provided');
            }
            
            if (!church || !church.church_name) {
                throw new Error('Invalid church data provided');
            }
            
            // Render HTML from template
            const html = await this.renderHTMLTemplate(congregationData, church, options);
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
            console.error('❌ PDF generation failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Render HTML template with data
     * @param {Array} congregationData - Congregation data
     * @param {Object} church - Church information
     * @param {Object} options - Options (year, areaId)
     * @returns {Promise<string>} - Rendered HTML string
     */
    async renderHTMLTemplate(congregationData, church, options = {}) {
        try {
            // Read template file
            const templateContent = await fs.readFile(this.templatePath, 'utf-8');
            
            // Prepare font path for template (convert Windows path to file:// URL)
            const fontPath = this.fontPath.replace(/\\/g, '/');
            
            // Render template with EJS
            const html = ejs.render(templateContent, {
                congregationData: congregationData,
                church: church,
                options: options,
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
     * @param {string} html - HTML content
     * @param {Object} options - PDF options
     * @returns {Promise<Buffer>} - PDF buffer
     */
    async convertHTMLToPDFElectron(html, options = {}) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Electron PDF generation timeout after 30 seconds'));
            }, 30000);

            try {
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

                        clearTimeout(timeout);
                        win.close();
                        resolve(pdfBuffer);
                    } catch (error) {
                        clearTimeout(timeout);
                        win.close();
                        reject(error);
                    }
                });

                win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
                    clearTimeout(timeout);
                    win.close();
                    reject(new Error(`Failed to load HTML: ${errorDescription}`));
                });
            } catch (error) {
                clearTimeout(timeout);
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
            // Find Chrome executable
            const chromePath = this.findChromePath();
            
            // Launch Puppeteer with increased timeout
            browser = await puppeteer.launch({
                headless: true,
                executablePath: chromePath,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                timeout: 60000 // 60 second timeout
            });

            const page = await browser.newPage();
            
            // Set content with increased timeout
            await page.setContent(html, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0
                }
            });

            await browser.close();
            return pdfBuffer;
        } catch (error) {
            if (browser) {
                await browser.close();
            }
            throw new Error(`PDF conversion failed: ${error.message}`);
        }
    }

    /**
     * Find Chrome executable path
     * @returns {string|undefined} - Chrome path or undefined to use default
     */
    findChromePath() {
        const { execSync } = require('child_process');
        
        try {
            // Try to find Chrome on Windows
            const chromePath = execSync('where chrome', { encoding: 'utf-8' }).trim().split('\n')[0];
            if (chromePath) {
                console.log('✅ Found Chrome at:', chromePath);
                return chromePath;
            }
        } catch (error) {
            console.log('⚠️ Chrome not found in PATH, using default');
        }
        
        // Return undefined to use Puppeteer's bundled Chromium
        return undefined;
    }
}

module.exports = SabaiJabithaReportPuppeteerService;

