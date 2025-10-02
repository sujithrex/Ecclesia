/**
 * Generate Sabai Jabitha report PDF using Puppeteer backend service
 * @param {Array} congregationData - Array of family data with members
 * @param {Object} church - Church information
 * @param {Object} options - Options (year, areaId)
 * @param {string} action - Action to perform: 'view', 'download', or 'print'
 * @returns {Promise<Object>} - Result with success flag and error if any
 */
export async function generatePuppeteerSabaiJabithaReport(congregationData, church, options = {}, action = 'view') {
    try {
        console.log('🔄 Starting Puppeteer Sabai Jabitha report generation...');
        console.log(`📊 Congregation data: ${congregationData.length} families`);
        console.log(`🎯 Action: ${action}`);

        // Validate input
        if (!congregationData || !Array.isArray(congregationData) || congregationData.length === 0) {
            throw new Error('No congregation data provided');
        }

        if (!church || !church.church_name) {
            throw new Error('Invalid church data provided');
        }

        // Call backend to generate PDF
        const result = await window.electron.sabaiJabitha.generatePDFPuppeteer({
            congregationData,
            church,
            options: { ...options, action }
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
            await downloadPDF(pdfBuffer, church, options);
        } else if (action === 'print') {
            await printPDF(pdfBuffer);
        }

        return { success: true };
    } catch (error) {
        console.error('❌ Error generating Sabai Jabitha report:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate Sabai Jabitha report'
        };
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
        }, 1000);

        console.log('✅ PDF opened in new window');
    } catch (error) {
        console.error('❌ Error viewing PDF:', error);
        throw error;
    }
}

/**
 * Download PDF file
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Object} church - Church information
 * @param {Object} options - Options with year
 */
async function downloadPDF(pdfBuffer, church, options) {
    try {
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `Sabai_Jabitha_${church.church_short_name || 'Report'}_${options.year || new Date().getFullYear()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up URL after delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);

        console.log('✅ PDF downloaded');
    } catch (error) {
        console.error('❌ Error downloading PDF:', error);
        throw error;
    }
}

/**
 * Print PDF
 * @param {Buffer} pdfBuffer - PDF buffer
 */
async function printPDF(pdfBuffer) {
    try {
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const printWindow = window.open(url, '_blank');
        if (!printWindow) {
            throw new Error('Popup blocked! Please allow popups and try again.');
        }

        // Wait for PDF to load, then print
        printWindow.onload = () => {
            printWindow.print();
        };

        // Clean up URL after delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 5000);

        console.log('✅ Print dialog opened');
    } catch (error) {
        console.error('❌ Error printing PDF:', error);
        throw error;
    }
}

