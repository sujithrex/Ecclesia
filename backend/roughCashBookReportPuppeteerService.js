const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;
const { BrowserWindow } = require('electron');

class RoughCashBookReportPuppeteerService {
    constructor(db) {
        this.db = db;
        this.templatePath = path.join(__dirname, 'templates', 'rough_cash_book.ejs');
        this.fontPath = path.join(__dirname, 'assets', 'fonts', 'Vijaya.ttf');

        // Find Chrome executable path
        this.executablePath = this.findChromePath();
    }

    findChromePath() {
        const possiblePaths = [
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
            process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
        ];

        for (const chromePath of possiblePaths) {
            try {
                if (require('fs').existsSync(chromePath)) {
                    console.log('✅ Found Chrome at:', chromePath);
                    return chromePath;
                }
            } catch (e) {
                // Continue to next path
            }
        }

        console.warn('⚠️ Chrome not found in standard locations, will use system default');
        return null;
    }

    /**
     * Generate rough cash book PDF using Puppeteer
     * @param {Object} reportData - Report data from roughCashBookService
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - Result with success flag and pdfBuffer or error
     */
    async generateRoughCashBookPDF(reportData, options = {}) {
        let browser = null;

        try {
            console.log('🔄 Starting Puppeteer rough cash book report generation...');
            console.log('📊 Report data for month:', reportData.month);
            console.log('🎯 Action:', options.action || 'view');

            // Validate input
            if (!reportData) {
                throw new Error('No report data provided');
            }

            if (!reportData.pastorate) {
                throw new Error('Invalid pastorate data provided');
            }

            // Render HTML from template
            const html = await this.renderHTMLTemplate(reportData);
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
            console.error('❌ Error generating rough cash book PDF:', error);
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
     * Render HTML template using EJS
     */
    async renderHTMLTemplate(reportData) {
        try {
            const templateContent = await fs.readFile(this.templatePath, 'utf-8');
            const fontPath = this.fontPath.replace(/\\/g, '/');

            // Helper function to format date
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = String(date.getFullYear()).slice(-2);
                return `${day}-${month}-${year}`;
            };

            // Helper function to format month display
            const formatMonthDisplay = (monthStr) => {
                const [year, month] = monthStr.split('-');
                const date = new Date(year, parseInt(month) - 1);
                return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            };

            // Helper function to format currency
            const formatCurrency = (amount) => {
                return parseFloat(amount || 0).toFixed(2);
            };

            // Render template with EJS
            const html = ejs.render(templateContent, {
                reportData,
                fontPath,
                formatDate,
                formatMonthDisplay,
                formatCurrency
            });

            return html;
        } catch (error) {
            console.error('❌ Error rendering HTML template:', error);
            throw error;
        }
    }

    /**
     * Convert HTML to PDF using Electron's built-in PDF generation
     */
    async convertHTMLToPDFElectron(html, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                // Create a hidden browser window
                const win = new BrowserWindow({
                    show: false,
                    webPreferences: {
                        offscreen: true
                    }
                });

                // Load the HTML content
                win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

                // Wait for content to load
                win.webContents.on('did-finish-load', async () => {
                    try {
                        // Generate PDF
                        const pdfBuffer = await win.webContents.printToPDF({
                            pageSize: 'A4',
                            landscape: true,
                            printBackground: true,
                            margins: {
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0
                            }
                        });

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

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Convert HTML to PDF using Puppeteer (fallback method)
     */
    async convertHTMLToPDF(html, options = {}) {
        let browser = null;

        try {
            console.log('🔄 Launching Puppeteer browser...');

            const launchOptions = {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            };

            if (this.executablePath) {
                launchOptions.executablePath = this.executablePath;
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
                width: '297.00mm',
                height: '210.00mm',
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

            await browser.close();
            browser = null;

            return pdfBuffer;

        } catch (error) {
            console.error('❌ Error in convertHTMLToPDF:', error);
            if (browser) {
                await browser.close();
            }
            throw error;
        }
    }
}

module.exports = RoughCashBookReportPuppeteerService;

