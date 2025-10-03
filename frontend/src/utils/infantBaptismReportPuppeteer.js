/**
 * Generate infant baptism certificate PDF using Puppeteer backend service
 * @param {Object} certificate - Certificate data
 * @param {Object} church - Church information
 * @param {string} action - Action to perform: 'view', 'download', or 'print'
 * @returns {Promise<Object>} - Result with success flag and error if any
 */
export async function generatePuppeteerInfantBaptismCertificate(certificate, church, action = 'view') {
    try {
        console.log('🔄 Starting Puppeteer infant baptism certificate generation...');
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
        const result = await window.electron.infantBaptism.generatePDFPuppeteer({
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
        console.error('❌ Error generating infant baptism certificate:', error);
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
        const fileName = `Infant_Baptism_Certificate_${certificate.christian_name.replace(/\s+/g, '_')}_${certificate.certificate_number}.pdf`;

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
 * Format date from YYYY-MM-DD to DD-MM-YYYY
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} - Date in DD-MM-YYYY format
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

/**
 * Format date for input field (YYYY-MM-DD)
 * @param {string} dateString - Date string
 * @returns {string} - Date in YYYY-MM-DD format
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date)) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Validate infant baptism certificate data
 * @param {Object} data - Certificate data to validate
 * @returns {Object} - Validation result with errors object
 */
export const validateInfantBaptismData = (data) => {
  const errors = {};

  if (!data.certificate_number?.trim()) {
    errors.certificate_number = 'Certificate number is required';
  }

  if (!data.when_baptised) {
    errors.when_baptised = 'Baptism date is required';
  }

  if (!data.christian_name?.trim()) {
    errors.christian_name = 'Christian name is required';
  }

  if (!data.date_of_birth) {
    errors.date_of_birth = 'Date of birth is required';
  }

  if (!data.sex) {
    errors.sex = 'Sex is required';
  }

  if (!data.abode?.trim()) {
    errors.abode = 'Abode is required';
  }

  if (!data.father_name?.trim()) {
    errors.father_name = 'Father name is required';
  }

  if (!data.mother_name?.trim()) {
    errors.mother_name = 'Mother name is required';
  }

  if (!data.witness_name_1?.trim()) {
    errors.witness_name_1 = 'Witness 1 is required';
  }

  if (!data.witness_name_2?.trim()) {
    errors.witness_name_2 = 'Witness 2 is required';
  }

  if (!data.witness_name_3?.trim()) {
    errors.witness_name_3 = 'Witness 3 is required';
  }

  if (!data.where_baptised?.trim()) {
    errors.where_baptised = 'Where baptised is required';
  }

  if (!data.signature_who_baptised?.trim()) {
    errors.signature_who_baptised = 'Signature of who baptised is required';
  }

  if (!data.certified_rev_name?.trim()) {
    errors.certified_rev_name = 'Certified Rev name is required';
  }

  if (!data.holding_office?.trim()) {
    errors.holding_office = 'Holding office is required';
  }

  if (!data.certificate_date) {
    errors.certificate_date = 'Certificate date is required';
  }

  if (!data.certificate_place?.trim()) {
    errors.certificate_place = 'Certificate place is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Calculate age from birth date to baptism date
 * @param {string} birthDate - Birth date
 * @param {string} baptismDate - Baptism date
 * @returns {string} - Age description for infants
 */
export const calculateInfantAge = (birthDate, baptismDate) => {
  if (!birthDate || !baptismDate) return '';
  
  const birth = new Date(birthDate);
  const baptism = new Date(baptismDate);
  
  if (isNaN(birth) || isNaN(baptism)) return '';
  
  const diffTime = Math.abs(baptism - birth);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    if (remainingDays === 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${months} month${months > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingDays = diffDays % 365;
    const months = Math.floor(remainingDays / 30);
    
    if (months === 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
    }
  }
};