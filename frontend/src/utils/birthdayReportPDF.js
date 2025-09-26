import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Set up fonts for pdfmake
if (typeof pdfFonts !== 'undefined' && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
}

export class BirthdayReportPDF {
    constructor() {
        // Define custom styles
        this.styles = {
            header: {
                fontSize: 12,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 10]
            },
            subheader: {
                fontSize: 10,
                alignment: 'center',
                margin: [0, 0, 0, 20]
            },
            familyInfo: {
                fontSize: 12,
                margin: [0, 10, 0, 5]
            },
            tableHeader: {
                fontSize: 12,
                bold: true,
                fillColor: '#f0f0f0'
            },
            celebrant: {
                fontSize: 12,
                bold: true,
                color: '#b22222' // Dark red for celebrants
            },
            normal: {
                fontSize: 12
            },
            separator: {
                margin: [0, 15, 0, 15]
            }
        };
    }

    async generateReport(reportData, church, dateRange) {
        // Build document definition
        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [30, 30, 30, 30],
            defaultStyle: {
                fontSize: 12
            },
            styles: this.styles,
            content: [
                // Header
                {
                    text: `${church.church_name} - BIRTHDAY CELEBRATION REPORT`,
                    style: 'header'
                },
                {
                    text: `Date Range: ${this.formatDateForDisplay(dateRange.fromDate)} to ${this.formatDateForDisplay(dateRange.toDate)}`,
                    style: 'subheader'
                },
                
                // Content for each family
                ...this.buildFamilySections(reportData)
            ]
        };

        return pdfMake.createPdf(docDefinition);
    }

    buildFamilySections(reportData) {
        const sections = [];

        reportData.forEach((familyData, index) => {
            const { family, members, celebrants } = familyData;
            
            // Add page break before each family except the first
            if (index > 0) {
                sections.push({ text: '', pageBreak: 'before' });
            }

            // Separator line
            sections.push({
                canvas: [
                    {
                        type: 'line',
                        x1: 0,
                        y1: 0,
                        x2: 535,
                        y2: 0,
                        lineWidth: 1
                    }
                ],
                style: 'separator'
            });

            // Family information
            sections.push({
                columns: [
                    { text: `Family No: ${family.family_number || family.id}`, width: '25%' },
                    { text: `Area: ${family.area_name || 'N/A'}`, width: '25%' },
                    { text: `Fellowship: ${family.fellowship_name || 'N/A'}`, width: '25%' },
                    { text: `Mobile: ${family.mobile || 'N/A'}`, width: '25%' }
                ],
                style: 'familyInfo'
            });

            // Address and prayer points
            let addressText = `Address: ${family.address || 'N/A'}`;
            if (family.prayer_points) {
                addressText += ` | Prayer Points: ${family.prayer_points}`;
            }

            sections.push({
                text: addressText,
                style: 'familyInfo',
                margin: [0, 5, 0, 15]
            });

            // Members table
            sections.push(this.buildMembersTable(members, celebrants));
        });

        return sections;
    }

    buildMembersTable(members, celebrants) {
        // Table headers
        const headers = [
            { text: 'M.NO', style: 'tableHeader' },
            { text: 'Names', style: 'tableHeader' },
            { text: 'Age', style: 'tableHeader' },
            { text: 'Relationship', style: 'tableHeader' },
            { text: 'Occupation', style: 'tableHeader' },
            { text: 'Working place', style: 'tableHeader' },
            { text: 'Birthday', style: 'tableHeader' }
        ];

        // Table rows
        const rows = [headers];
        
        members.forEach(member => {
            const isCelebrant = celebrants.some(c => c.id === member.id);
            
            // Format respect properly
            let respect = '';
            if (member.respect) {
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
                respect = respectMap[member.respect.toLowerCase()] || member.respect;
            }

            const memberNumber = member.member_number || member.member_id?.split('-').pop() || '';
            const celebrantIndicator = isCelebrant ? '★ ' : '';
            const memberName = `${celebrantIndicator}${respect} ${member.name || ''}`.trim();
            const age = member.age || '';
            const relation = member.relation || '';
            const occupation = member.occupation || member.working || '';
            const workingPlace = member.working_place || member.working || '';
            const birthday = member.dob ? this.formatBirthdayDate(member.dob) : '';

            // Apply celebrant styling if needed
            const textStyle = isCelebrant ? 'celebrant' : 'normal';

            const row = [
                { text: memberNumber, style: textStyle },
                { text: memberName.length > 20 ? memberName.substring(0, 20) + '...' : memberName, style: textStyle },
                { text: age, style: textStyle },
                { text: relation.length > 12 ? relation.substring(0, 12) + '...' : relation, style: textStyle },
                { text: occupation.length > 12 ? occupation.substring(0, 12) + '...' : occupation, style: textStyle },
                { text: workingPlace.length > 12 ? workingPlace.substring(0, 12) + '...' : workingPlace, style: textStyle },
                { text: birthday, style: textStyle }
            ];

            rows.push(row);
        });

        return {
            table: {
                headerRows: 1,
                widths: [50, 120, 35, 80, 80, 80, 100],
                body: rows
            },
            layout: {
                fillColor: function (rowIndex) {
                    return (rowIndex === 0) ? '#f0f0f0' : null;
                },
                hLineWidth: function () {
                    return 1;
                },
                vLineWidth: function () {
                    return 1;
                },
                hLineColor: function () {
                    return '#000';
                },
                vLineColor: function () {
                    return '#000';
                }
            },
            margin: [0, 0, 0, 20]
        };
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
            pdfDoc.download(fileName);
            return { success: true };
        } catch (error) {
            console.error('Error saving PDF:', error);
            return { success: false, error: error.message };
        }
    }

    async printReport(pdfDoc) {
        try {
            pdfDoc.print();
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