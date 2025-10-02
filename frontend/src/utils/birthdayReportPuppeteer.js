/**
 * Birthday Report PDF Generation using Puppeteer
 * This module handles PDF generation for birthday reports using HTML templates and Puppeteer
 */

/**
 * Generate birthday report PDF using Puppeteer backend service
 * @param {Array} reportData - Array of family data with members and celebrants
 * @param {Object} church - Church information
 * @param {Object} dateRange - Date range with fromDate and toDate
 * @param {string} action - Action to perform: 'view', 'download', or 'print'
 * @returns {Promise<Object>} - Result with success flag and error if any
 */
export async function generatePuppeteerBirthdayReport(reportData, church, dateRange, action = 'view') {
    try {
        console.log('🔄 Starting Puppeteer birthday report generation...');
        console.log(`📊 Report data: ${reportData.length} families`);
        console.log(`🎯 Action: ${action}`);
        
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
        
        // Call backend via IPC to generate PDF
        const result = await window.electron.member.generateBirthdayPDFPuppeteer({
            reportData,
            church,
            dateRange,
            options: {}
        });
        
        if (!result.success) {
            console.error('❌ PDF generation failed:', result.error);
            return { success: false, error: result.error };
        }
        
        console.log('✅ PDF buffer received from backend');
        
        // Convert buffer to Uint8Array (IPC returns plain object, not Buffer)
        const pdfData = new Uint8Array(Object.values(result.pdfBuffer));
        
        // Create blob from PDF data
        const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
        console.log('✅ PDF blob created');
        
        // Handle action (view/download/print)
        if (action === 'download') {
            return await downloadPDF(pdfBlob, church, dateRange);
        } else if (action === 'print') {
            return await printPDF(pdfBlob);
        } else {
            return await viewPDF(pdfBlob);
        }
        
    } catch (error) {
        console.error('❌ Error generating Puppeteer birthday report:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Download PDF file
 * @param {Blob} pdfBlob - PDF blob
 * @param {Object} church - Church information
 * @param {Object} dateRange - Date range
 * @returns {Promise<Object>} - Result with success flag
 */
async function downloadPDF(pdfBlob, church, dateRange) {
    try {
        console.log('💾 Downloading PDF...');
        
        // Format dates for filename
        const fromDate = dateRange.fromDate.replace(/-/g, '');
        const toDate = dateRange.toDate.replace(/-/g, '');
        const fileName = `birthday_report_${church.church_short_name || 'church'}_${fromDate}_to_${toDate}.pdf`;
        
        // Create download link
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        
        // Clean up
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
        
        console.log('✅ PDF downloaded:', fileName);
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error downloading PDF:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Print PDF file
 * @param {Blob} pdfBlob - PDF blob
 * @returns {Promise<Object>} - Result with success flag
 */
async function printPDF(pdfBlob) {
    try {
        console.log('🖨️ Printing PDF...');
        
        // Create object URL
        const url = URL.createObjectURL(pdfBlob);
        
        // Open in new window for printing
        const printWindow = window.open(url, '_blank');
        
        if (!printWindow) {
            URL.revokeObjectURL(url);
            return { success: false, error: 'Popup blocked! Please allow popups and try again.' };
        }
        
        // Wait for window to load, then trigger print
        printWindow.onload = () => {
            printWindow.print();
            
            // Clean up after a delay
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);
        };
        
        console.log('✅ Print dialog opened');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error printing PDF:', error);
        return { success: false, error: error.message };
    }
}

/**
 * View PDF file in new window
 * @param {Blob} pdfBlob - PDF blob
 * @returns {Promise<Object>} - Result with success flag
 */
async function viewPDF(pdfBlob) {
    try {
        console.log('👁️ Viewing PDF...');
        
        // Create object URL
        const url = URL.createObjectURL(pdfBlob);
        
        // Open in new window
        const newWindow = window.open(url, '_blank');
        
        if (!newWindow) {
            URL.revokeObjectURL(url);
            return { success: false, error: 'Popup blocked! Please allow popups and try again.' };
        }
        
        // Clean up after delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 10000);
        
        console.log('✅ PDF opened in new window');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error viewing PDF:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Format date for display
 * @param {string} dateStr - Date string
 * @returns {string} - Formatted date (DD-MM)
 */
function formatDateRange(dateStr) {
    if (!dateStr) return '';
    if (dateStr.match(/^\d{2}-\d{2}$/)) return dateStr;
    
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}`;
}

// Export as default for easier import
export default generatePuppeteerBirthdayReport;

