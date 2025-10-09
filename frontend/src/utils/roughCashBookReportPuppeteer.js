/**
 * Helper functions for PDF actions
 */

/**
 * View PDF in a new window
 */
async function viewPDF(pdfBuffer) {
    try {
        const pdfData = new Uint8Array(Object.values(pdfBuffer));
        const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        window.open(pdfUrl, '_blank');
        
        return { success: true };
    } catch (error) {
        console.error('Error viewing PDF:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Download PDF file
 */
async function downloadPDF(pdfBuffer, reportData) {
    try {
        const pdfData = new Uint8Array(Object.values(pdfBuffer));
        const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
        
        // Format month for filename
        const [year, month] = reportData.month.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = monthNames[parseInt(month) - 1];
        
        const pastorateName = reportData.pastorate?.pastorate_name || 'Pastorate';
        const filename = `Rough_Cash_Book_${pastorateName}_${monthName}_${year}.pdf`;
        
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return { success: true };
    } catch (error) {
        console.error('Error downloading PDF:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Print PDF
 */
async function printPDF(pdfBuffer) {
    try {
        const pdfData = new Uint8Array(Object.values(pdfBuffer));
        const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        const printWindow = window.open(pdfUrl, '_blank');
        if (printWindow) {
            printWindow.addEventListener('load', () => {
                printWindow.print();
            });
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error printing PDF:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate rough cash book report PDF using Puppeteer backend service
 * @param {number} pastorateId - The pastorate ID
 * @param {number} userId - The user ID
 * @param {string} month - Month in format 'YYYY-MM'
 * @param {string} action - Action to perform: 'view', 'download', or 'print'
 * @returns {Promise<Object>} - Result with success flag and error if any
 */
export async function generateRoughCashBookReport(pastorateId, userId, month, action = 'view') {
    try {
        console.log('🔄 Starting rough cash book report generation...');
        console.log(`📊 Pastorate ID: ${pastorateId}, Month: ${month}`);
        console.log(`🎯 Action: ${action}`);
        
        // Validate input
        if (!pastorateId) {
            throw new Error('Pastorate ID is required');
        }
        
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        if (!month) {
            throw new Error('Month is required');
        }
        
        // Fetch report data from backend
        console.log('📥 Fetching report data...');
        const reportDataResult = await window.electron.roughCashBook.getReportData({
            pastorateId,
            userId,
            month
        });
        
        if (!reportDataResult.success) {
            console.error('❌ Failed to fetch report data:', reportDataResult.error);
            return { success: false, error: reportDataResult.error };
        }
        
        console.log('✅ Report data fetched successfully');
        
        // Generate PDF using Puppeteer
        console.log('📄 Generating PDF...');
        const pdfResult = await window.electron.roughCashBook.generatePDF({
            reportData: reportDataResult.reportData,
            options: { action }
        });
        
        if (!pdfResult.success) {
            console.error('❌ PDF generation failed:', pdfResult.error);
            return { success: false, error: pdfResult.error };
        }
        
        console.log('✅ PDF generated successfully');
        
        // Handle the PDF buffer based on action
        const pdfBuffer = pdfResult.pdfBuffer;
        
        if (action === 'view') {
            return await viewPDF(pdfBuffer);
        } else if (action === 'download') {
            return await downloadPDF(pdfBuffer, reportDataResult.reportData);
        } else if (action === 'print') {
            return await printPDF(pdfBuffer);
        }
        
        return { success: false, error: 'Invalid action' };
        
    } catch (error) {
        console.error('❌ Error generating rough cash book report:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get available months that have transactions
 * @param {number} pastorateId - The pastorate ID
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} - Result with success flag and months array
 */
export async function getAvailableMonths(pastorateId, userId) {
    try {
        console.log('🔄 Fetching available months...');
        
        const result = await window.electron.roughCashBook.getAvailableMonths({
            pastorateId,
            userId
        });
        
        if (!result.success) {
            console.error('❌ Failed to fetch available months:', result.error);
            return { success: false, error: result.error };
        }
        
        console.log('✅ Available months fetched:', result.months);
        return result;
        
    } catch (error) {
        console.error('❌ Error fetching available months:', error);
        return { success: false, error: error.message };
    }
}

