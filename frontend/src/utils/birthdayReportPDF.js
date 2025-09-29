import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export class BirthdayReportPDF {
    constructor() {
        this.pageWidth = 595.28; // A4 width in points
        this.pageHeight = 841.89; // A4 height in points
        this.margins = {
            top: 50,
            bottom: 50,
            left: 30,
            right: 30
        };
        this.contentWidth = this.pageWidth - this.margins.left - this.margins.right;
        this.currentY = this.pageHeight - this.margins.top;
        
        // Colors
        this.colors = {
            black: rgb(0, 0, 0),
            darkRed: rgb(0.7, 0.13, 0.13), // For celebrants
            gray: rgb(0.5, 0.5, 0.5),
            lightGray: rgb(0.94, 0.94, 0.94) // For table headers
        };
        
        // Font sizes
        this.fontSizes = {
            header: 14,
            subheader: 12,
            normal: 10,
            small: 9
        };
    }

    async generateReport(reportData, church, dateRange) {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            let currentPage = null;
            let currentY = 0;
            
            // Process each family
            for (let familyIndex = 0; familyIndex < reportData.length; familyIndex++) {
                const { family, members, celebrants } = reportData[familyIndex];
                
                // Start new page for each family or first page
                currentPage = pdfDoc.addPage([this.pageWidth, this.pageHeight]);
                currentY = this.pageHeight - this.margins.top;
                
                // Draw header on first page or if it's a new family
                if (familyIndex === 0) {
                    currentY = await this.drawHeader(currentPage, boldFont, church, dateRange, currentY);
                }
                
                // Draw separator line
                currentY = await this.drawSeparatorLine(currentPage, currentY);
                
                // Draw family information
                currentY = await this.drawFamilyInfo(currentPage, font, boldFont, family, currentY);
                
                // Draw members table
                currentY = await this.drawMembersTable(currentPage, font, boldFont, members, celebrants, currentY);
            }
            
            return pdfDoc;
        } catch (error) {
            console.error('Error generating PDF with pdf-lib:', error);
            throw error;
        }
    }

    async drawHeader(page, boldFont, church, dateRange, y) {
        const headerText = `${church.church_name} - BIRTHDAY CELEBRATION REPORT`;
        const subHeaderText = `Date Range: ${this.formatDateForDisplay(dateRange.fromDate)} to ${this.formatDateForDisplay(dateRange.toDate)}`;
        
        // Main header
        const headerWidth = boldFont.widthOfTextAtSize(headerText, this.fontSizes.header);
        const headerX = (this.pageWidth - headerWidth) / 2;
        
        page.drawText(headerText, {
            x: headerX,
            y: y - 20,
            size: this.fontSizes.header,
            font: boldFont,
            color: this.colors.black,
        });
        
        // Sub header
        const subHeaderWidth = boldFont.widthOfTextAtSize(subHeaderText, this.fontSizes.subheader);
        const subHeaderX = (this.pageWidth - subHeaderWidth) / 2;
        
        page.drawText(subHeaderText, {
            x: subHeaderX,
            y: y - 40,
            size: this.fontSizes.subheader,
            font: boldFont,
            color: this.colors.black,
        });
        
        return y - 70; // Return new Y position
    }

    async drawSeparatorLine(page, y) {
        page.drawLine({
            start: { x: this.margins.left, y: y - 10 },
            end: { x: this.pageWidth - this.margins.right, y: y - 10 },
            thickness: 1,
            color: this.colors.black,
        });
        
        return y - 25;
    }

    async drawFamilyInfo(page, font, boldFont, family, y) {
        const lineHeight = 15;
        
        // First line: Family No, Area, Fellowship, Mobile
        const line1Parts = [
            `Family No: ${family.family_number || family.id}`,
            `Area: ${family.area_name || 'N/A'}`,
            `Fellowship: ${family.fellowship_name || 'N/A'}`,
            `Mobile: ${family.mobile || 'N/A'}`
        ];
        
        const columnWidth = this.contentWidth / 4;
        
        line1Parts.forEach((text, index) => {
            page.drawText(text, {
                x: this.margins.left + (index * columnWidth),
                y: y,
                size: this.fontSizes.normal,
                font: font,
                color: this.colors.black,
            });
        });
        
        // Second line: Address and prayer points
        let addressText = `Address: ${family.address || 'N/A'}`;
        if (family.prayer_points) {
            addressText += ` | Prayer Points: ${family.prayer_points}`;
        }
        
        // Wrap long text
        const wrappedText = this.wrapText(addressText, font, this.fontSizes.normal, this.contentWidth);
        wrappedText.forEach((line, index) => {
            page.drawText(line, {
                x: this.margins.left,
                y: y - lineHeight - (index * lineHeight),
                size: this.fontSizes.normal,
                font: font,
                color: this.colors.black,
            });
        });
        
        return y - (lineHeight * (2 + wrappedText.length - 1)) - 10;
    }

    async drawMembersTable(page, font, boldFont, members, celebrants, y) {
        const tableHeaders = ['M.NO', 'Names', 'Age', 'Relationship', 'Occupation', 'Working place', 'Birthday'];
        const columnWidths = [50, 120, 35, 80, 80, 80, 100]; // Total: 545
        const rowHeight = 20;
        const headerHeight = 25;
        
        let currentY = y;
        
        // Draw table header background
        page.drawRectangle({
            x: this.margins.left,
            y: currentY - headerHeight,
            width: this.contentWidth,
            height: headerHeight,
            color: this.colors.lightGray,
        });
        
        // Draw table header borders
        this.drawTableBorders(page, this.margins.left, currentY - headerHeight, columnWidths, headerHeight);
        
        // Draw header text
        let currentX = this.margins.left;
        tableHeaders.forEach((header, index) => {
            page.drawText(header, {
                x: currentX + 5,
                y: currentY - 15,
                size: this.fontSizes.normal,
                font: boldFont,
                color: this.colors.black,
            });
            currentX += columnWidths[index];
        });
        
        currentY -= headerHeight;
        
        // Draw member rows
        members.forEach(member => {
            const isCelebrant = celebrants.some(c => c.id === member.id);
            
            // Draw row background (alternating would go here if needed)
            page.drawRectangle({
                x: this.margins.left,
                y: currentY - rowHeight,
                width: this.contentWidth,
                height: rowHeight,
                color: rgb(1, 1, 1), // White background
            });
            
            // Draw row borders
            this.drawTableBorders(page, this.margins.left, currentY - rowHeight, columnWidths, rowHeight);
            
            // Prepare member data
            const respect = this.formatRespect(member.respect);
            const memberNumber = member.member_number || member.member_id?.split('-').pop() || '';
            const celebrantIndicator = isCelebrant ? '* ' : '';
            const memberName = `${celebrantIndicator}${respect} ${member.name || ''}`.trim();
            const age = member.age || '';
            const relation = member.relation || '';
            const occupation = member.occupation || member.working || '';
            const workingPlace = member.working_place || member.working || '';
            const birthday = member.dob ? this.formatBirthdayDate(member.dob) : '';
            
            const rowData = [
                memberNumber,
                this.truncateText(memberName, 18),
                age,
                this.truncateText(relation, 10),
                this.truncateText(occupation, 10),
                this.truncateText(workingPlace, 10),
                birthday
            ];
            
            // Draw row data
            let currentX = this.margins.left;
            rowData.forEach((text, index) => {
                page.drawText(text, {
                    x: currentX + 5,
                    y: currentY - 15,
                    size: this.fontSizes.small,
                    font: isCelebrant ? boldFont : font,
                    color: isCelebrant ? this.colors.darkRed : this.colors.black,
                });
                currentX += columnWidths[index];
            });
            
            currentY -= rowHeight;
        });
        
        return currentY - 20;
    }

    drawTableBorders(page, x, y, columnWidths, height) {
        let currentX = x;
        
        // Vertical lines
        columnWidths.forEach((width, index) => {
            page.drawLine({
                start: { x: currentX, y: y },
                end: { x: currentX, y: y + height },
                thickness: 1,
                color: this.colors.black,
            });
            currentX += width;
        });
        
        // Last vertical line
        page.drawLine({
            start: { x: currentX, y: y },
            end: { x: currentX, y: y + height },
            thickness: 1,
            color: this.colors.black,
        });
        
        // Horizontal lines
        page.drawLine({
            start: { x: x, y: y },
            end: { x: x + this.contentWidth, y: y },
            thickness: 1,
            color: this.colors.black,
        });
        
        page.drawLine({
            start: { x: x, y: y + height },
            end: { x: x + this.contentWidth, y: y + height },
            thickness: 1,
            color: this.colors.black,
        });
    }

    formatRespect(respect) {
        if (!respect) return '';
        const respectMap = {
            'mr': 'Mr.',
            'mrs': 'Mrs.',
            'ms': 'Ms.',
            'master': 'Master',
            'rev': 'Rev.',
            'dr': 'Dr.',
            'er': 'Er.',
            'sis': 'Sis.'
        };
        return respectMap[respect.toLowerCase()] || respect;
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    }

    wrapText(text, font, fontSize, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const lineWidth = font.widthOfTextAtSize(testLine, fontSize);
            
            if (lineWidth <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    lines.push(word); // Word is too long but we have to include it
                }
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }

    formatDateForDisplay(dateStr) {
        if (!dateStr) return 'N/A';
        
        // If it's already in DD-MM format, add current year
        if (dateStr.match(/^\d{2}-\d{2}$/)) {
            const currentYear = new Date().getFullYear();
            return `${dateStr}-${currentYear}`;
        }
        
        // If it's a full date, format it
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr;
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    formatBirthdayDate(dob) {
        if (!dob) return '';
        const date = new Date(dob);
        if (isNaN(date)) return '';
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    async saveReport(pdfDoc, fileName) {
        try {
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
            
            URL.revokeObjectURL(url);
            return { success: true };
        } catch (error) {
            console.error('Error saving PDF:', error);
            return { success: false, error: error.message };
        }
    }

    async printReport(pdfDoc) {
        try {
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const printWindow = window.open(url);
            printWindow.onload = function() {
                printWindow.print();
                printWindow.onafterprint = function() {
                    printWindow.close();
                    URL.revokeObjectURL(url);
                };
            };
            
            return { success: true };
        } catch (error) {
            console.error('Error printing PDF:', error);
            return { success: false, error: error.message };
        }
    }
}

// Convenience function to generate and handle the report
export async function generateBirthdayReport(reportData, church, dateRange, action = 'download') {
    try {
        const pdfGenerator = new BirthdayReportPDF();
        const pdfDoc = await pdfGenerator.generateReport(reportData, church, dateRange);
        
        const fromDate = dateRange.fromDate.replace(/-/g, '');
        const toDate = dateRange.toDate.replace(/-/g, '');
        const fileName = `birthday_report_${church.church_short_name || 'church'}_${fromDate}_to_${toDate}.pdf`;
        
        if (action === 'download') {
            return await pdfGenerator.saveReport(pdfDoc, fileName);
        } else if (action === 'print') {
            return await pdfGenerator.printReport(pdfDoc);
        }
        
        return { success: false, error: 'Invalid action specified' };
    } catch (error) {
        console.error('Error generating birthday report:', error);
        return { success: false, error: error.message };
    }
}