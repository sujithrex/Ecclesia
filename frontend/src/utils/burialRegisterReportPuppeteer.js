/**
 * Burial Register PDF Generation using Puppeteer
 * This utility handles PDF generation, viewing, downloading, and printing
 */

/**
 * Generate burial register PDF using Puppeteer backend service
 * @param {Object} register - Register data
 * @param {Object} church - Church information
 * @param {string} action - Action to perform: 'view', 'download', or 'print'
 * @returns {Promise<Object>} - Result with success flag and error if any
 */
export async function generatePuppeteerBurialRegister(register, church, action = 'view') {
    try {
        console.log('🔄 Starting Puppeteer burial register generation...');
        console.log(`📊 Register: ${register.name_of_person_died}`);
        console.log(`🎯 Action: ${action}`);

        // Validate input
        if (!register) {
            throw new Error('No register data provided');
        }

        if (!church || !church.church_name) {
            throw new Error('Invalid church data provided');
        }

        // Call backend via IPC to generate PDF
        const result = await window.electron.burialRegister.generatePDFPuppeteer({
            register,
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
            await downloadPDF(pdfBuffer, register);
        } else if (action === 'print') {
            await printPDF(pdfBuffer);
        }

        return { success: true };
    } catch (error) {
        console.error('❌ Error generating burial register:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate register'
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
 * @param {Object} register - Register data
 */
async function downloadPDF(pdfBuffer, register) {
    try {
        const fileName = `Burial_Register_${register.name_of_person_died.replace(/\s+/g, '_')}_${register.certificate_number}.pdf`;

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
 * Validate register data before submission
 * @param {Object} registerData - Register data to validate
 * @returns {Object} - Validation result with success flag and errors
 */
export function validateRegisterData(registerData) {
    const errors = {};

    if (!registerData.certificate_number || registerData.certificate_number.trim() === '') {
        errors.certificate_number = 'Certificate number is required';
    }

    if (!registerData.date_of_death) {
        errors.date_of_death = 'Date of death is required';
    }

    if (!registerData.when_buried) {
        errors.when_buried = 'Burial date is required';
    }

    if (!registerData.name_of_person_died || registerData.name_of_person_died.trim() === '') {
        errors.name_of_person_died = 'Name of person died is required';
    }

    if (!registerData.sex) {
        errors.sex = 'Sex is required';
    }

    if (!registerData.age || registerData.age.trim() === '') {
        errors.age = 'Age is required';
    }

    if (!registerData.cause_of_death || registerData.cause_of_death.trim() === '') {
        errors.cause_of_death = 'Cause of death is required';
    }

    if (!registerData.father_name || registerData.father_name.trim() === '') {
        errors.father_name = 'Father name is required';
    }

    if (!registerData.mother_name || registerData.mother_name.trim() === '') {
        errors.mother_name = 'Mother name is required';
    }

    if (!registerData.where_buried || registerData.where_buried.trim() === '') {
        errors.where_buried = 'Place of burial is required';
    }

    if (!registerData.signature_who_buried || registerData.signature_who_buried.trim() === '') {
        errors.signature_who_buried = 'Signature of who buried is required';
    }

    if (!registerData.certified_rev_name || registerData.certified_rev_name.trim() === '') {
        errors.certified_rev_name = 'Certified Rev name is required';
    }

    if (!registerData.holding_office || registerData.holding_office.trim() === '') {
        errors.holding_office = 'Holding office is required';
    }

    if (!registerData.certificate_date) {
        errors.certificate_date = 'Certificate date is required';
    }

    if (!registerData.certificate_place || registerData.certificate_place.trim() === '') {
        errors.certificate_place = 'Certificate place is required';
    }

    return {
        success: Object.keys(errors).length === 0,
        errors
    };
}

