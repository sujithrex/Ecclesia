/**
 * Utility functions for viewing, downloading, and printing PDFs
 */

/**
 * View PDF in browser
 */
async function viewPDF(pdfBuffer) {
    try {
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Clean up the URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
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
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Create filename
        const month = reportData.month || 'report';
        const churchName = reportData.church ? reportData.church.church_name : 'All_Churches';
        const sanitizedChurchName = churchName.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `Offertory_Book_${sanitizedChurchName}_${month}.pdf`;
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
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
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Open in new window for printing
        const printWindow = window.open(url, '_blank');
        
        if (printWindow) {
            printWindow.addEventListener('load', () => {
                printWindow.print();
            });
        }
        
        // Clean up after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        return { success: true };
    } catch (error) {
        console.error('Error printing PDF:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate offertory book report PDF using Puppeteer backend service
 * @param {number} pastorateId - The pastorate ID
 * @param {number} userId - The user ID
 * @param {string} month - Month in format 'YYYY-MM'
 * @param {number|null} churchId - Church ID or null for all churches
 * @param {string} action - Action to perform: 'view', 'download', or 'print'
 * @returns {Promise<Object>} - Result with success flag and error if any
 */
export async function generateOfferingsReport(pastorateId, userId, month, churchId, action = 'view') {
    try {
        console.log('🔄 Starting offertory book report generation...');
        console.log(`📊 Pastorate ID: ${pastorateId}, Month: ${month}, Church ID: ${churchId || 'All'}`);
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
        const reportDataResult = await window.electron.offeringsReport.getReportData({
            pastorateId,
            userId,
            month,
            churchId
        });
        
        if (!reportDataResult.success) {
            console.error('❌ Failed to fetch report data:', reportDataResult.error);
            return { success: false, error: reportDataResult.error };
        }
        
        console.log('✅ Report data fetched successfully');
        
        // Generate PDF using Puppeteer
        console.log('📄 Generating PDF...');
        const pdfResult = await window.electron.offeringsReport.generatePDF({
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
        console.error('❌ Error generating offertory book report:', error);
        return { success: false, error: error.message };
    }
}

