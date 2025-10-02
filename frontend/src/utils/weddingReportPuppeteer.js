/**
 * Wedding Anniversary Report PDF Generation using Puppeteer
 * This utility handles PDF generation, viewing, downloading, and printing
 */

/**
 * Generate wedding anniversary PDF report using Puppeteer
 * @param {Array} reportData - Array of family data with members
 * @param {Object} church - Church information
 * @param {Object} dateRange - Date range {fromDate, toDate}
 * @param {string} action - Action to perform: 'view', 'download', or 'print'
 * @returns {Promise<Object>} - Result with success status
 */
export async function generatePuppeteerWeddingReport(reportData, church, dateRange, action = 'view') {
    try {
        console.log('🔄 Starting Puppeteer wedding report generation...');
        console.log('📊 Report data:', reportData.length, 'families');
        console.log('🎯 Action:', action);

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

        // Call backend to generate PDF
        const result = await window.electron.member.generateWeddingPDFPuppeteer({
            reportData,
            church,
            dateRange,
            options: { action }
        });

        if (!result.success) {
            throw new Error(result.error || 'PDF generation failed');
        }

        console.log('✅ PDF generated successfully');

        // Handle the PDF based on action
        const pdfBuffer = result.pdfBuffer;
        
        if (action === 'view') {
            await viewPDF(pdfBuffer);
        } else if (action === 'download') {
            await downloadPDF(pdfBuffer, church, dateRange);
        } else if (action === 'print') {
            await printPDF(pdfBuffer);
        }

        return { success: true };
    } catch (error) {
        console.error('❌ Wedding report generation failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * View PDF in a new window
 * @param {Buffer} pdfBuffer - PDF buffer
 */
async function viewPDF(pdfBuffer) {
    try {
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
            throw new Error('Popup blocked! Please allow popups and try again.');
        }

        // Clean up URL after delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 10000);
    } catch (error) {
        console.error('Error viewing PDF:', error);
        throw error;
    }
}

/**
 * Download PDF file
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Object} church - Church information
 * @param {Object} dateRange - Date range
 */
async function downloadPDF(pdfBuffer, church, dateRange) {
    try {
        const fromDate = dateRange.fromDate.replace(/-/g, '');
        const toDate = dateRange.toDate.replace(/-/g, '');
        const fileName = `wedding_report_${church.church_short_name || 'church'}_${fromDate}_to_${toDate}.pdf`;
        
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error;
    }
}

/**
 * Print PDF - Just view it like birthday list does
 * @param {Buffer} pdfBuffer - PDF buffer
 */
async function printPDF(pdfBuffer) {
    try {
        // Just view the PDF - user can print from the PDF viewer
        await viewPDF(pdfBuffer);
    } catch (error) {
        console.error('Error printing PDF:', error);
        throw error;
    }
}

