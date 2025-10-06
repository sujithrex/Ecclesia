// Letterpad Puppeteer PDF Generation Utilities

/**
 * Format date for display (dd-mm-yyyy)
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Format date for input field (yyyy-mm-dd)
 */
export function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate letterpad PDF using Puppeteer service
 */
export async function generatePuppeteerLetterpadPDF(letterpad, pastorate, pastorateSettings, action = 'view') {
  try {
    console.log('🔄 Starting letterpad PDF generation with Puppeteer...');
    console.log(`📊 Letterpad: ${letterpad.letterpad_number}`);
    console.log(`🎯 Action: ${action}`);

    // Validate input
    if (!letterpad) {
      throw new Error('No letterpad data provided');
    }

    if (!pastorate || !pastorate.pastorate_name) {
      throw new Error('Invalid pastorate data provided');
    }

    // Call backend via IPC to generate PDF
    const result = await window.electron.letterpad.generatePDF({
      letterpad: letterpad,
      pastorate: pastorate,
      pastorateSettings: pastorateSettings,
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
      await viewPDF(pdfBuffer, letterpad);
    } else if (action === 'download') {
      await downloadPDF(pdfBuffer, letterpad);
    } else if (action === 'print') {
      await printPDF(pdfBuffer, letterpad);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error in letterpad PDF generation:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate PDF'
    };
  }
}

/**
 * View PDF in a new window
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Object} letterpad - Letterpad data
 */
async function viewPDF(pdfBuffer, letterpad) {
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

    console.log('✅ PDF opened in new window');
  } catch (error) {
    console.error('Error viewing PDF:', error);
    throw error;
  }
}

/**
 * Download PDF file
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Object} letterpad - Letterpad data
 */
async function downloadPDF(pdfBuffer, letterpad) {
  try {
    const fileName = `Letterpad_${letterpad.letterpad_number.replace(/\//g, '_')}_${new Date().getTime()}.pdf`;

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
 * @param {Object} letterpad - Letterpad data
 */
async function printPDF(pdfBuffer, letterpad) {
  try {
    // Just view the PDF - user can print from the PDF viewer
    await viewPDF(pdfBuffer, letterpad);
  } catch (error) {
    console.error('Error printing PDF:', error);
    throw error;
  }
}

/**
 * Generate letterpad number in YYYY/M/NN format
 */
export function generateLetterpadNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const monthLetter = String.fromCharCode(64 + month); // A=Jan, B=Feb, etc.
  
  // This will be replaced by actual database-generated number
  return `${year}/${monthLetter}/01`;
}

/**
 * Validate letterpad form data
 */
export function validateLetterpadData(formData) {
  const errors = {};
  
  if (!formData.letterpad_number?.trim()) {
    errors.letterpad_number = 'Letterpad number is required';
  }
  
  if (!formData.letter_date?.trim()) {
    errors.letter_date = 'Date is required';
  }
  
  if (!formData.content?.trim()) {
    errors.content = 'Content is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Clean HTML content for PDF generation
 */
export function cleanHTMLContent(htmlContent) {
  if (!htmlContent) return '';
  
  // Remove any script tags and clean potentially harmful content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Remove script tags
  const scripts = tempDiv.getElementsByTagName('script');
  for (let i = scripts.length - 1; i >= 0; i--) {
    scripts[i].parentNode.removeChild(scripts[i]);
  }
  
  return tempDiv.innerHTML;
}