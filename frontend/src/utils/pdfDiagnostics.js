import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

/**
 * Comprehensive PDF Generation Diagnostics
 * This utility tests each step of the PDF generation process to identify failure points
 */
export class PDFDiagnostics {
    constructor() {
        this.results = [];
        this.errors = [];
    }

    log(message, status = 'info', data = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            message,
            status, // 'success', 'error', 'warning', 'info'
            data
        };
        this.results.push(entry);
        
        const icon = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: '🔍'
        }[status] || '📋';
        
        console.log(`${icon} PDF Diagnostics: ${message}`, data || '');
        
        if (status === 'error') {
            this.errors.push(entry);
        }
    }

    async runFullDiagnostics() {
        this.log('Starting comprehensive PDF generation diagnostics');
        this.results = [];
        this.errors = [];

        try {
            // Test 1: Basic PDF-lib functionality
            await this.testBasicPDFLib();
            
            // Test 2: Font availability
            await this.testFontAvailability();
            
            // Test 3: Font loading strategies
            await this.testFontLoadingStrategies();
            
            // Test 4: Simple PDF creation
            await this.testSimplePDFCreation();
            
            // Test 5: Tamil text rendering
            await this.testTamilTextRendering();
            
            // Test 6: Complete PDF with fonts
            await this.testCompletePDFWithFonts();
            
            // Test 7: PDF save and blob creation
            await this.testPDFSaveAndBlob();
            
            this.generateReport();
            
        } catch (error) {
            this.log(`Critical error during diagnostics: ${error.message}`, 'error', error);
        }
        
        return this.getResults();
    }

    async testBasicPDFLib() {
        this.log('Testing basic PDF-lib functionality...');
        
        try {
            // Test if PDFDocument is available
            if (typeof PDFDocument === 'undefined') {
                this.log('PDFDocument is not available', 'error');
                return;
            }
            this.log('PDFDocument class is available', 'success');
            
            // Test if fontkit is available
            if (typeof fontkit === 'undefined') {
                this.log('Fontkit is not available', 'error');
                return;
            }
            this.log('Fontkit is available', 'success');
            
            // Test basic PDF creation
            const pdfDoc = await PDFDocument.create();
            this.log('Basic PDFDocument creation successful', 'success');
            
            // Register fontkit
            pdfDoc.registerFontkit(fontkit);
            this.log('Fontkit registration successful', 'success');
            
            // Add a page
            const page = pdfDoc.addPage();
            this.log(`Page created with dimensions: ${page.getWidth()}x${page.getHeight()}`, 'success');
            
        } catch (error) {
            this.log(`Basic PDF-lib test failed: ${error.message}`, 'error', error);
        }
    }

    async testFontAvailability() {
        this.log('Testing font file availability...');
        
        const fontFiles = [
            { name: 'Times', url: './times.ttf' },
            { name: 'Times Bold', url: './timesbd.ttf' },
            { name: 'Vijaya', url: './vijaya.ttf' },
            { name: 'Vijaya Bold', url: './vijayab.ttf' },
            { name: 'Pizza Stars', url: './PIZZADUDESTARS.ttf' }
        ];
        
        for (const font of fontFiles) {
            try {
                const response = await fetch(font.url);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    this.log(`${font.name} font loaded successfully (${arrayBuffer.byteLength} bytes)`, 'success');
                } else {
                    this.log(`${font.name} font fetch failed: HTTP ${response.status}`, 'error');
                }
            } catch (error) {
                this.log(`${font.name} font loading error: ${error.message}`, 'error', error);
            }
        }
    }

    async testFontLoadingStrategies() {
        this.log('Testing different font loading strategies...');
        
        // Strategy 1: Direct fetch from public
        await this.testFontStrategy('Direct Public Fetch', './times.ttf');
        
        // Strategy 2: Absolute URL
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');
        await this.testFontStrategy('Absolute URL', baseUrl + 'times.ttf');
        
        // Strategy 3: Import (if available)
        try {
            const timesUrl = await import('../assets/times.ttf?url');
            await this.testFontStrategy('Asset Import', timesUrl.default);
        } catch (error) {
            this.log('Asset import strategy not available', 'warning', error);
        }
    }

    async testFontStrategy(strategyName, fontUrl) {
        try {
            const response = await fetch(fontUrl);
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                
                // Test embedding in PDF
                const pdfDoc = await PDFDocument.create();
                pdfDoc.registerFontkit(fontkit);
                const font = await pdfDoc.embedFont(arrayBuffer);
                
                this.log(`${strategyName}: Font loaded and embedded successfully`, 'success', {
                    url: fontUrl,
                    size: arrayBuffer.byteLength,
                    fontName: font.name || 'Unknown'
                });
            } else {
                this.log(`${strategyName}: HTTP ${response.status}`, 'error');
            }
        } catch (error) {
            this.log(`${strategyName}: ${error.message}`, 'error', error);
        }
    }

    async testSimplePDFCreation() {
        this.log('Testing simple PDF creation with standard fonts...');
        
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
            
            // Use standard font
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            
            // Draw simple text
            page.drawText('Test PDF Generation', {
                x: 50,
                y: 750,
                size: 16,
                font: font,
                color: rgb(0, 0, 0)
            });
            
            // Try to save
            const pdfBytes = await pdfDoc.save();
            this.log(`Simple PDF created successfully (${pdfBytes.length} bytes)`, 'success');
            
            // Create blob
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            this.log(`PDF blob created (${blob.size} bytes)`, 'success');
            
        } catch (error) {
            this.log(`Simple PDF creation failed: ${error.message}`, 'error', error);
        }
    }

    async testTamilTextRendering() {
        this.log('Testing Tamil text rendering...');
        
        try {
            // Check if canvas is available
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (!context) {
                this.log('Canvas context not available', 'error');
                return;
            }
            
            // Test Tamil text detection
            const tamilText = 'சபை அங்கத்தினர் ஜாபிதா';
            const tamilRange = /[\u0B80-\u0BFF]/;
            const isTamil = tamilRange.test(tamilText);
            
            this.log(`Tamil text detection: "${tamilText}" is Tamil: ${isTamil}`, 'success');
            
            // Test Tamil font rendering on canvas
            context.font = '16px Vijaya, Tamil Sangam MN, Arial Unicode MS, sans-serif';
            const metrics = context.measureText(tamilText);
            
            this.log(`Tamil text measurement successful: ${metrics.width}px width`, 'success');
            
            // Test rendering to image
            canvas.width = Math.ceil(metrics.width) + 20;
            canvas.height = 30;
            context.font = '16px Vijaya, Tamil Sangam MN, Arial Unicode MS, sans-serif';
            context.fillStyle = '#000000';
            context.textBaseline = 'top';
            context.fillText(tamilText, 10, 5);
            
            const imageDataUrl = canvas.toDataURL('image/png');
            this.log('Tamil text to image conversion successful', 'success', {
                imageSize: imageDataUrl.length,
                dimensions: `${canvas.width}x${canvas.height}`
            });
            
        } catch (error) {
            this.log(`Tamil text rendering test failed: ${error.message}`, 'error', error);
        }
    }

    async testCompletePDFWithFonts() {
        this.log('Testing complete PDF creation with custom fonts...');
        
        try {
            const pdfDoc = await PDFDocument.create();
            pdfDoc.registerFontkit(fontkit);
            
            // Load fonts
            const [timesResponse, vijayaResponse] = await Promise.all([
                fetch('./times.ttf'),
                fetch('./vijaya.ttf')
            ]);
            
            if (!timesResponse.ok || !vijayaResponse.ok) {
                this.log('Font loading failed for complete test', 'error');
                return;
            }
            
            const [timesBytes, vijayaBytes] = await Promise.all([
                timesResponse.arrayBuffer(),
                vijayaResponse.arrayBuffer()
            ]);
            
            const timesFont = await pdfDoc.embedFont(timesBytes);
            const vijayaFont = await pdfDoc.embedFont(vijayaBytes);
            
            this.log('Custom fonts loaded successfully for complete test', 'success');
            
            // Create page and add content
            const page = pdfDoc.addPage([595.28, 841.89]);
            
            // English text
            page.drawText('CSI Zion Church', {
                x: 50,
                y: 750,
                size: 18,
                font: timesFont,
                color: rgb(0, 0, 0)
            });
            
            // Tamil text
            page.drawText('சபை அங்கத்தினர் ஜாபிதா', {
                x: 50,
                y: 700,
                size: 16,
                font: vijayaFont,
                color: rgb(0, 0, 0)
            });
            
            // Save PDF
            const pdfBytes = await pdfDoc.save();
            this.log(`Complete PDF with fonts created (${pdfBytes.length} bytes)`, 'success');
            
        } catch (error) {
            this.log(`Complete PDF with fonts test failed: ${error.message}`, 'error', error);
        }
    }

    async testPDFSaveAndBlob() {
        this.log('Testing PDF save and blob operations...');
        
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            
            page.drawText('Blob Test PDF', {
                x: 50,
                y: 750,
                size: 16,
                font: font
            });
            
            // Test save
            const pdfBytes = await pdfDoc.save();
            this.log(`PDF save successful (${pdfBytes.length} bytes)`, 'success');
            
            // Test blob creation
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            this.log(`Blob creation successful (${blob.size} bytes)`, 'success');
            
            // Test URL creation
            const url = URL.createObjectURL(blob);
            this.log('URL.createObjectURL successful', 'success');
            URL.revokeObjectURL(url);
            
            // Test download simulation
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'test.pdf';
            this.log('Download link creation successful', 'success');
            URL.revokeObjectURL(link.href);
            
        } catch (error) {
            this.log(`PDF save/blob test failed: ${error.message}`, 'error', error);
        }
    }

    generateReport() {
        this.log('=== PDF GENERATION DIAGNOSTICS REPORT ===');
        
        const successCount = this.results.filter(r => r.status === 'success').length;
        const errorCount = this.errors.length;
        const warningCount = this.results.filter(r => r.status === 'warning').length;
        
        this.log(`Total tests: ${this.results.length}`);
        this.log(`Successful: ${successCount}`);
        this.log(`Errors: ${errorCount}`);
        this.log(`Warnings: ${warningCount}`);
        
        if (this.errors.length > 0) {
            this.log('=== CRITICAL ERRORS ===');
            this.errors.forEach((error, index) => {
                this.log(`${index + 1}. ${error.message}`, 'error', error.data);
            });
        }
    }

    getResults() {
        return {
            success: this.errors.length === 0,
            results: this.results,
            errors: this.errors,
            summary: {
                total: this.results.length,
                success: this.results.filter(r => r.status === 'success').length,
                errors: this.errors.length,
                warnings: this.results.filter(r => r.status === 'warning').length
            }
        };
    }

    // Quick test function for immediate debugging
    async quickTest() {
        this.log('Running quick PDF generation test...');
        
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            
            page.drawText('Quick Test - PDF Generation Working', {
                x: 50,
                y: 750,
                size: 16,
                font: font,
                color: rgb(0, 0, 0)
            });
            
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            // Open PDF in new window
            window.open(url, '_blank');
            
            this.log('Quick test successful - PDF should have opened', 'success');
            
            // Clean up after delay
            setTimeout(() => URL.revokeObjectURL(url), 10000);
            
            return true;
        } catch (error) {
            this.log(`Quick test failed: ${error.message}`, 'error', error);
            return false;
        }
    }
}

// Create singleton instance
export const pdfDiagnostics = new PDFDiagnostics();

// Helper functions for easy use
export async function runPDFDiagnostics() {
    return await pdfDiagnostics.runFullDiagnostics();
}

export async function quickPDFTest() {
    return await pdfDiagnostics.quickTest();
}

// Add to window for debugging
if (typeof window !== 'undefined') {
    window.pdfDiagnostics = pdfDiagnostics;
    window.quickPDFTest = quickPDFTest;
    window.runPDFDiagnostics = runPDFDiagnostics;
}