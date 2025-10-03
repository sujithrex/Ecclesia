/**
 * Adult Baptism Certificate PDF Generation using Puppeteer
 * This utility handles PDF generation, viewing, downloading, and printing
 */

/**
 * Generate adult baptism certificate PDF using Puppeteer backend service
 * @param {Object} certificate - Certificate data
 * @param {Object} church - Church information
 * @param {string} action - Action to perform: 'view', 'download', or 'print'
 * @returns {Promise<Object>} - Result with success flag and error if any
 */
export async function generatePuppeteerAdultBaptismCertificate(certificate, church, action = 'view') {
    try {
        console.log('🔄 Starting Puppeteer adult baptism certificate generation...');
        console.log(`📊 Certificate: ${certificate.christian_name}`);
        console.log(`🎯 Action: ${action}`);

        // Validate input
        if (!certificate) {
            throw new Error('No certificate data provided');
        }

        if (!church || !church.church_name) {
            throw new Error('Invalid church data provided');
        }

        // Call backend via IPC to generate PDF
        const result = await window.electron.adultBaptism.generatePDFPuppeteer({
            certificate,
            church,
            options: { action }
        });

        if (!result.success) {
            console.error('❌ PDF generation failed:', result.error);
            return { success: false, error: result.error };
        }

        console.log('✅ PDF generated successfully');

        // Handle the PDF buffer based on action
        const pdfBuffer = result.pdfBuffer;

        if (action === 'view') {
            await viewPDF(pdfBuffer);
        } else if (action === 'download') {
            await downloadPDF(pdfBuffer, certificate);
        } else if (action === 'print') {
            await printPDF(pdfBuffer);
        }

        return { success: true };
    } catch (error) {
        console.error('❌ Error generating adult baptism certificate:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate certificate'
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
        }, 10000);
    } catch (error) {
        console.error('Error viewing PDF:', error);
        throw error;
    }
}

/**
 * Download PDF file
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Object} certificate - Certificate data
 */
async function downloadPDF(pdfBuffer, certificate) {
    try {
        const fileName = `Adult_Baptism_Certificate_${certificate.christian_name.replace(/\s+/g, '_')}_${certificate.certificate_number}.pdf`;

        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();

        // Clean up
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);

        console.log('✅ PDF downloaded:', fileName);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        throw error;
    }
}

/**
 * Print PDF - Just view it so user can print from the PDF viewer
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

/**
 * Helper function to format date for display
 * @param {string} dateStr - Date string
 * @returns {string} - Formatted date
 */
export function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

/**
 * Helper function to format date for input field (YYYY-MM-DD)
 * @param {string} dateStr - Date string
 * @returns {string} - Formatted date for input
 */
export function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Validate certificate data before submission
 * @param {Object} certificateData - Certificate data to validate
 * @returns {Object} - Validation result with success flag and errors
 */
export function validateCertificateData(certificateData) {
    const errors = {};

    if (!certificateData.certificate_number || certificateData.certificate_number.trim() === '') {
        errors.certificate_number = 'Certificate number is required';
    }

    if (!certificateData.when_baptised) {
        errors.when_baptised = 'Baptism date is required';
    }

    if (!certificateData.christian_name || certificateData.christian_name.trim() === '') {
        errors.christian_name = 'Christian name is required';
    }

    if (!certificateData.former_name || certificateData.former_name.trim() === '') {
        errors.former_name = 'Former name is required';
    }

    if (!certificateData.sex) {
        errors.sex = 'Sex is required';
    }

    if (!certificateData.age || certificateData.age <= 0) {
        errors.age = 'Valid age is required';
    }

    if (!certificateData.abode || certificateData.abode.trim() === '') {
        errors.abode = 'Abode is required';
    }

    if (!certificateData.father_name || certificateData.father_name.trim() === '') {
        errors.father_name = 'Father name is required';
    }

    if (!certificateData.mother_name || certificateData.mother_name.trim() === '') {
        errors.mother_name = 'Mother name is required';
    }

    if (!certificateData.witness_name_1 || certificateData.witness_name_1.trim() === '') {
        errors.witness_name_1 = 'Witness 1 is required';
    }

    if (!certificateData.witness_name_2 || certificateData.witness_name_2.trim() === '') {
        errors.witness_name_2 = 'Witness 2 is required';
    }

    if (!certificateData.witness_name_3 || certificateData.witness_name_3.trim() === '') {
        errors.witness_name_3 = 'Witness 3 is required';
    }

    if (!certificateData.where_baptised || certificateData.where_baptised.trim() === '') {
        errors.where_baptised = 'Place of baptism is required';
    }

    if (!certificateData.signature_who_baptised || certificateData.signature_who_baptised.trim() === '') {
        errors.signature_who_baptised = 'Signature of who baptised is required';
    }

    if (!certificateData.certified_rev_name || certificateData.certified_rev_name.trim() === '') {
        errors.certified_rev_name = 'Certified Rev name is required';
    }

    if (!certificateData.holding_office || certificateData.holding_office.trim() === '') {
        errors.holding_office = 'Holding office is required';
    }

    if (!certificateData.certificate_date) {
        errors.certificate_date = 'Certificate date is required';
    }

    if (!certificateData.certificate_place || certificateData.certificate_place.trim() === '') {
        errors.certificate_place = 'Certificate place is required';
    }

    return {
        success: Object.keys(errors).length === 0,
        errors
    };
}

