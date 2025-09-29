import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export class InDesignBirthdayReportPDF {
    constructor() {
        // Page dimensions exactly matching the HTML template
        this.pageWidth = 595.28;
        this.pageHeight = 841.89;
        
        // Single family template with dynamic positioning
        this.coordinates = {
            // Header elements (only on first page)
            header: {
                diocese: { x: 297.13, y: 788.83 },
                reportTitle: { x: 301.34, y: 770.50 }
            },
            
            // Base family template (first family positions)
            familyTemplate: {
                baseY: 744.00, // First family baseline Y coordinate
                familyNumber: {
                    label: { x: 39.69, yOffset: 0 },
                    value: { x: 138.90, yOffset: 0 }
                },
                mobileNumber: {
                    label: { x: 297.85, yOffset: -0.71 },
                    value: { x: 396.35, yOffset: -0.71 }
                },
                familyHead: {
                    label: { x: 39.69, yOffset: -18.78 },
                    value: { x: 138.90, yOffset: -18.78 }
                },
                area: {
                    label: { x: 297.85, yOffset: -19.48 },
                    value: { x: 396.35, yOffset: -19.48 }
                },
                address: {
                    label: { x: 39.69, yOffset: -37.55 },
                    value: { x: 138.90, yOffset: -36.55, width: 144.57, frameHeight: 40.97 }
                },
                prayerPoints: {
                    label: { x: 297.13, yOffset: -38.26 },
                    value: { x: 396.35, yOffset: -36.26, width: 158.74, frameHeight: 40.26 }
                },
                
                // Table headers
                tableHeaders: {
                    name: { x: 42.52, yOffset: -81.22 },
                    age: { x: 188.36, yOffset: -81.08 },
                    relationship: { x: 266.03, yOffset: -81.08 },
                    occupation: { x: 392.88, yOffset: -81.22 },
                    workingPlace: { x: 511.33, yOffset: -81.40 }
                },
                
                // Member data starting position offset
                firstMemberYOffset: -109.52,
                
                // Lines offsets from baseY
                lines: {
                    afterFamily: { start: { x: 36.91, yOffset: -68.58 }, end: { x: 558.77, yOffset: -68.58 } },
                    beforeTable: { start: { x: 36.96, yOffset: -91.40 }, end: { x: 558.77, yOffset: -91.40 } },
                    afterMembers: { start: { x: 36.50, yOffset: -136.89 }, end: { x: 558.77, yOffset: -136.89 } }
                }
            },
            
            // Vertical table lines (same for all families)
            verticalLines: [
                { x: 165.54 },
                { x: 211.18 },
                { x: 321.38 },
                { x: 464.38 }
            ],
            
            // Member column positions (average of first/second family)
            memberColumns: {
                name: { x: 43.77 },
                age: { x: 188.34 },
                relationship: { x: 265.75 },
                occupation: { x: 392.36 },
                workingPlace: { x: 511.30 }
            }
        };
        
        // Family spacing pattern
        this.familySpacing = {
            yOffset: 158.74, // Distance between family blocks (744.00 - 585.26)
            familiesPerPage: 2
        };
        
        // Layout measurements from HTML analysis
        this.layout = {
            memberRowHeight: 21.4, // Distance between member rows (634.48 to 613.08)
            pageBottomMargin: 50,
            maxMembersPerFamily: 10 // Safe limit based on available space
        };
        
        // Text properties matching HTML
        this.fonts = {
            regular: null,
            bold: null,
            celebrant: null, // PIZZADUDESTARS font for birthday celebrants
            tamil: null,     // Vijaya font for Tamil text
            tamilBold: null  // Vijaya Bold font for Tamil text
        };
        
        this.colors = {
            black: rgb(0, 0, 0)
        };
        
        // Font sizes exactly from HTML
        this.fontSizes = {
            header: 12,
            label: 12,
            value: 12,
            member: 12,
            address: 11,
            prayerPoints: 10
        };
    }

    async generateReport(reportData, church, dateRange) {
        try {
            // Validate input data
            if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
                throw new Error('No report data provided');
            }
            
            if (!church || !church.church_name) {
                throw new Error('Invalid church data provided');
            }
            
            if (!dateRange || !dateRange.fromDate || !dateRange.toDate) {
                throw new Error('Invalid date range provided');
            }

            const pdfDoc = await PDFDocument.create();
            
            // Embed fonts with multiple fallback strategies
            try {
                // Strategy 1: Try importing as modules (for dev mode)
                try {
                    const timesUrl = (await import('../assets/times.ttf?url')).default;
                    const timesBoldUrl = (await import('../assets/timesbd.ttf?url')).default;
                    const pizzaStarsUrl = (await import('../assets/PIZZADUDESTARS.ttf?url')).default;
                    const vijayaUrl = (await import('../assets/vijaya.ttf?url')).default;
                    const vijayaBoldUrl = (await import('../assets/vijayab.ttf?url')).default;
                    
                    const [timesResponse, timesBoldResponse, celebrantResponse, vijayaResponse, vijayaBoldResponse] = await Promise.all([
                        fetch(timesUrl),
                        fetch(timesBoldUrl),
                        fetch(pizzaStarsUrl),
                        fetch(vijayaUrl),
                        fetch(vijayaBoldUrl)
                    ]);
                    
                    if (timesResponse.ok && timesBoldResponse.ok && celebrantResponse.ok && vijayaResponse.ok && vijayaBoldResponse.ok) {
                        const [timesBytes, timesBoldBytes, celebrantBytes, vijayaBytes, vijayaBoldBytes] = await Promise.all([
                            timesResponse.arrayBuffer(),
                            timesBoldResponse.arrayBuffer(),
                            celebrantResponse.arrayBuffer(),
                            vijayaResponse.arrayBuffer(),
                            vijayaBoldResponse.arrayBuffer()
                        ]);
                        
                        this.fonts.regular = await pdfDoc.embedFont(timesBytes);
                        this.fonts.bold = await pdfDoc.embedFont(timesBoldBytes);
                        this.fonts.celebrant = await pdfDoc.embedFont(celebrantBytes);
                        this.fonts.tamil = await pdfDoc.embedFont(vijayaBytes);
                        this.fonts.tamilBold = await pdfDoc.embedFont(vijayaBoldBytes);
                        console.log('✅ All custom fonts (including Tamil) loaded successfully via import');
                        return;
                    }
                } catch (importError) {
                    console.log('Import strategy failed, trying direct fetch...');
                }
                
                // Strategy 2: Try direct fetch from public folder (for production)
                try {
                    const [timesResponse, timesBoldResponse, celebrantResponse, vijayaResponse, vijayaBoldResponse] = await Promise.all([
                        fetch('./times.ttf'),
                        fetch('./timesbd.ttf'),
                        fetch('./PIZZADUDESTARS.ttf'),
                        fetch('./vijaya.ttf'),
                        fetch('./vijayab.ttf')
                    ]);
                    
                    if (timesResponse.ok && timesBoldResponse.ok && celebrantResponse.ok && vijayaResponse.ok && vijayaBoldResponse.ok) {
                        const [timesBytes, timesBoldBytes, celebrantBytes, vijayaBytes, vijayaBoldBytes] = await Promise.all([
                            timesResponse.arrayBuffer(),
                            timesBoldResponse.arrayBuffer(),
                            celebrantResponse.arrayBuffer(),
                            vijayaResponse.arrayBuffer(),
                            vijayaBoldResponse.arrayBuffer()
                        ]);
                        
                        this.fonts.regular = await pdfDoc.embedFont(timesBytes);
                        this.fonts.bold = await pdfDoc.embedFont(timesBoldBytes);
                        this.fonts.celebrant = await pdfDoc.embedFont(celebrantBytes);
                        this.fonts.tamil = await pdfDoc.embedFont(vijayaBytes);
                        this.fonts.tamilBold = await pdfDoc.embedFont(vijayaBoldBytes);
                        console.log('✅ All custom fonts (including Tamil) loaded successfully via public fetch');
                        return;
                    }
                } catch (fetchError) {
                    console.log('Public fetch strategy failed, using fallback...');
                }
                
                // Strategy 3: Fallback to standard fonts
                throw new Error('All font loading strategies failed');
                
            } catch (error) {
                console.warn('All custom font loading strategies failed, using standard fonts:', error);
                this.fonts.regular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
                this.fonts.bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
                this.fonts.celebrant = this.fonts.regular;
                this.fonts.tamil = this.fonts.regular;
                this.fonts.tamilBold = this.fonts.bold;
            }
            
            // Store church data for use in family generation
            this.currentChurch = church;
            
            let familyIndex = 0;
            let isFirstPage = true;
            
            // Process families in groups (2 families per page like HTML template)
            while (familyIndex < reportData.length) {
                const currentPage = pdfDoc.addPage([this.pageWidth, this.pageHeight]);
                
                // Draw headers only on first page
                if (isFirstPage) {
                    await this.drawHeaders(currentPage, church, dateRange);
                    await this.drawTopLine(currentPage);
                    isFirstPage = false;
                }
                
                // Draw up to 2 families per page
                const familiesOnThisPage = reportData.slice(familyIndex, familyIndex + 2);
                await this.drawFamiliesOnPage(currentPage, familiesOnThisPage);
                
                familyIndex += familiesOnThisPage.length;
            }
            
            // Draw page border on all pages
            for (let pageIndex = 0; pageIndex < pdfDoc.getPageCount(); pageIndex++) {
                const page = pdfDoc.getPages()[pageIndex];
                await this.drawPageBorder(page);
            }
            
            return pdfDoc;
        } catch (error) {
            console.error('Error generating InDesign-style birthday report:', error);
            throw error;
        }
    }

    async drawHeaders(page, church, dateRange) {
        // Dynamic Diocese/Pastorate name - centered and bold
        const dioceseName = church.diocese_name || 'Tirunelveli Diocese';
        const pastorateShortName = church.pastorate_short_name || 'Pastorate';
        const churchName = church.church_display_name || church.church_name || 'Church';
        
        const dioceseText = `${dioceseName} - ${pastorateShortName} ${churchName}`;
        const headerFont = this.chooseFontForText(dioceseText, true);
        await this.drawCenteredText(page, dioceseText, this.coordinates.header.diocese, this.fontSizes.header, headerFont);
        
        // Report title with date range - centered and bold
        const fromDate = this.formatDateRange(dateRange.fromDate);
        const toDate = this.formatDateRange(dateRange.toDate);
        const titleText = `Birthday List - From ${fromDate} to ${toDate}`;
        const titleFont = this.chooseFontForText(titleText, true);
        await this.drawCenteredText(page, titleText, this.coordinates.header.reportTitle, this.fontSizes.header, titleFont);
    }

    async drawTopLine(page) {
        // Draw the top separator line
        this.drawLine(page, {
            start: { x: 36.62, y: 762.52 },
            end: { x: 558.78, y: 762.52 }
        });
    }

    async drawFamiliesOnPage(page, familiesData) {
        for (let i = 0; i < familiesData.length && i < this.familySpacing.familiesPerPage; i++) {
            const { family, members, celebrants } = familiesData[i];
            
            // Calculate dynamic family position
            const familyConfig = this.calculateFamilyPosition(i);
            
            // Draw family block at calculated position
            await this.drawFamilyBlock(page, family, members, celebrants, familyConfig, i);
        }
    }

    async drawFamilyBlock(page, family, members, celebrants, familyConfig, familyIndex) {
        try {
            // Validate family data
            if (!family || !family.family_name) {
                console.warn('Invalid family data, skipping family');
                return;
            }
            
            // Ensure members array exists
            const validMembers = Array.isArray(members) ? members : [];
            const validCelebrants = Array.isArray(celebrants) ? celebrants : [];
            
            // Draw family information
            await this.drawFamilyInfo(page, family, familyConfig, this.currentChurch);
            
            // Draw family separator line
            this.drawLine(page, familyConfig.lines.afterFamily);
            
            // Draw table headers
            await this.drawTableHeaders(page, familyConfig.tableHeaders);
            
            // Draw before-table line
            this.drawLine(page, familyConfig.lines.beforeTable);
            
            // Draw members
            const memberEndY = await this.drawMembers(page, validMembers, validCelebrants, familyConfig.firstMemberY);
            
            // Draw after-members line (dynamic position based on actual member count)
            const afterMembersY = familyConfig.firstMemberY - (validMembers.length * this.layout.memberRowHeight);
            this.drawLine(page, {
                start: { x: familyConfig.lines.afterMembers.start.x, y: afterMembersY },
                end: { x: familyConfig.lines.afterMembers.end.x, y: afterMembersY }
            });
            
            // Draw vertical table lines (dynamic height based on member count)
            await this.drawVerticalTableLines(page, familyConfig.lines.afterFamily.start.y, afterMembersY);
        } catch (error) {
            console.error(`Error drawing family block for family ${family?.family_name}:`, error);
            // Continue with next family instead of failing completely
        }
    }

    async drawFamilyInfo(page, family, familyConfig, church) {
        // Family Number and Mobile Number (top row)
        await this.drawText(page, "Family Number :", familyConfig.familyNumber.label, this.fontSizes.label);
        const familyNumber = this.generateFamilyNumber(family, church);
        const familyNumberFont = this.chooseFontForText(familyNumber, true);
        await this.drawText(page, familyNumber, familyConfig.familyNumber.value, this.fontSizes.value, familyNumberFont);
        
        await this.drawText(page, "Mobile Number :", familyConfig.mobileNumber.label, this.fontSizes.label);
        await this.drawText(page, family.family_phone || 'N/A', familyConfig.mobileNumber.value, this.fontSizes.value, this.fonts.bold);
        
        // Family Head and Area (second row)
        await this.drawText(page, "Family Head :", familyConfig.familyHead.label, this.fontSizes.label);
        const familyHead = `${this.formatRespect(family.respect)} ${family.family_name}`;
        const familyHeadFont = this.chooseFontForText(familyHead, true);
        await this.drawText(page, familyHead, familyConfig.familyHead.value, this.fontSizes.value, familyHeadFont);
        
        await this.drawText(page, "Area :", familyConfig.area.label, this.fontSizes.label);
        const areaName = family.area_name || 'SAKTHI NAGAR';
        const areaFont = this.chooseFontForText(areaName, true);
        await this.drawText(page, areaName, familyConfig.area.value, this.fontSizes.value, areaFont);
        
        // Address and Prayer Points (third row with wrapping)
        await this.drawText(page, "Address :", familyConfig.address.label, this.fontSizes.label);
        // Only render address if data exists, otherwise leave empty space
        if (family.family_address && family.family_address.trim()) {
            const addressFont = this.chooseFontForText(family.family_address);
            await this.drawWrappedTextWithFrameConstraints(page, family.family_address, familyConfig.address.value, this.fontSizes.address, familyConfig.address.value.width, familyConfig.address.value.frameHeight, addressFont);
        }
        
        await this.drawText(page, "Prayer Points :", familyConfig.prayerPoints.label, this.fontSizes.label);
        // Only render prayer points if data exists, otherwise leave empty space
        if (family.prayer_points && family.prayer_points.trim()) {
            const prayerPointsFont = this.chooseFontForText(family.prayer_points);
            await this.drawWrappedTextWithFrameConstraints(page, family.prayer_points, familyConfig.prayerPoints.value, this.fontSizes.prayerPoints, familyConfig.prayerPoints.value.width, familyConfig.prayerPoints.value.frameHeight, prayerPointsFont);
        }
    }

    async drawTableHeaders(page, headerConfig) {
        // Draw headers in bold - Name is left aligned, others are centered
        await this.drawText(page, "Name", headerConfig.name, this.fontSizes.header, this.fonts.bold);
        await this.drawCenteredText(page, "Age", headerConfig.age, this.fontSizes.header, this.fonts.bold);
        await this.drawCenteredText(page, "Relationship", headerConfig.relationship, this.fontSizes.header, this.fonts.bold);
        await this.drawCenteredText(page, "Occupation", headerConfig.occupation, this.fontSizes.header, this.fonts.bold);
        await this.drawCenteredText(page, "Working Place", headerConfig.workingPlace, this.fontSizes.header, this.fonts.bold);
    }

    async drawMembers(page, members, celebrants, startY) {
        let currentY = startY;
        
        // Limit members to prevent overflow (max members that fit in allocated space)
        const maxMembers = Math.min(members.length, this.layout.maxMembersPerFamily);
        
        for (let i = 0; i < maxMembers; i++) {
            const member = members[i];
            if (!member || !member.name) {
                console.warn(`Invalid member data at index ${i}, skipping`);
                continue;
            }
            
            const isCelebrant = celebrants.some(c => c.id === member.id);
            
            try {
                // Member name - left aligned (use celebrant font for celebrants, otherwise choose based on text)
                const memberName = `${this.formatRespect(member.respect)} ${member.name}`;
                const nameFont = isCelebrant ? this.fonts.celebrant : this.chooseFontForText(memberName);
                await this.drawText(page, memberName, { x: this.coordinates.memberColumns.name.x, y: currentY }, this.fontSizes.member, nameFont);
                
                // Age - centered (use special font for celebrants)
                const age = member.age ? member.age.toString() : '';
                const ageFont = isCelebrant ? this.fonts.celebrant : this.chooseFontForText(age);
                await this.drawCenteredText(page, age, { x: this.coordinates.memberColumns.age.x, y: currentY }, this.fontSizes.member, ageFont);
                
                // Relationship - centered (use special font for celebrants, otherwise choose based on text)
                const relationship = member.relation || '';
                const relationFont = isCelebrant ? this.fonts.celebrant : this.chooseFontForText(relationship);
                await this.drawCenteredText(page, relationship, { x: this.coordinates.memberColumns.relationship.x, y: currentY }, this.fontSizes.member, relationFont);
                
                // Occupation - centered (use special font for celebrants, otherwise choose based on text)
                const occupation = member.occupation || '';
                const occupationFont = isCelebrant ? this.fonts.celebrant : this.chooseFontForText(occupation);
                await this.drawCenteredText(page, occupation, { x: this.coordinates.memberColumns.occupation.x, y: currentY }, this.fontSizes.member, occupationFont);
                
                // Working Place - centered with text wrapping (use special font for celebrants, otherwise choose based on text)
                const workingPlace = member.working_place || '';
                const workingPlaceFont = isCelebrant ? this.fonts.celebrant : this.chooseFontForText(workingPlace);
                if (workingPlace.length > 10) {
                    // For longer text, use wrapped text with reduced font size
                    await this.drawWrappedTextWithFrameConstraints(
                        page,
                        workingPlace,
                        { x: this.coordinates.memberColumns.workingPlace.x - 47, y: currentY },
                        10, // Smaller font size
                        94.89, // Column width constraint
                        15, // Frame height
                        workingPlaceFont
                    );
                } else {
                    await this.drawCenteredText(page, workingPlace, { x: this.coordinates.memberColumns.workingPlace.x, y: currentY }, this.fontSizes.member, workingPlaceFont);
                }
                
                currentY -= this.layout.memberRowHeight;
            } catch (error) {
                console.error(`Error drawing member ${member.name}:`, error);
                // Continue with next member
                currentY -= this.layout.memberRowHeight;
            }
        }
        
        // Log warning if members were truncated
        if (members.length > maxMembers) {
            console.warn(`Family has ${members.length} members, but only ${maxMembers} were rendered due to space constraints`);
        }
        
        return currentY;
    }

    async drawVerticalTableLines(page, topY, bottomY) {
        this.coordinates.verticalLines.forEach(line => {
            this.drawLine(page, {
                start: { x: line.x, y: topY },
                end: { x: line.x, y: bottomY }
            });
        });
    }

    async drawPageBorder(page) {
        // Draw the outer border rectangle exactly as in HTML
        page.drawRectangle({
            x: 37.00,
            y: 36.50,
            width: 522.28,
            height: 768.89,
            borderColor: this.colors.black,
            borderWidth: 1.00
        });
    }

    // Calculate dynamic family position based on index
    calculateFamilyPosition(familyIndex) {
        const template = this.coordinates.familyTemplate;
        const baseY = template.baseY - (familyIndex * this.familySpacing.yOffset);
        
        return {
            baseY: baseY,
            familyNumber: {
                label: { x: template.familyNumber.label.x, y: baseY + template.familyNumber.label.yOffset },
                value: { x: template.familyNumber.value.x, y: baseY + template.familyNumber.value.yOffset }
            },
            mobileNumber: {
                label: { x: template.mobileNumber.label.x, y: baseY + template.mobileNumber.label.yOffset },
                value: { x: template.mobileNumber.value.x, y: baseY + template.mobileNumber.value.yOffset }
            },
            familyHead: {
                label: { x: template.familyHead.label.x, y: baseY + template.familyHead.label.yOffset },
                value: { x: template.familyHead.value.x, y: baseY + template.familyHead.value.yOffset }
            },
            area: {
                label: { x: template.area.label.x, y: baseY + template.area.label.yOffset },
                value: { x: template.area.value.x, y: baseY + template.area.value.yOffset }
            },
            address: {
                label: { x: template.address.label.x, y: baseY + template.address.label.yOffset },
                value: {
                    x: template.address.value.x,
                    y: baseY + template.address.value.yOffset,
                    width: template.address.value.width,
                    frameHeight: template.address.value.frameHeight
                }
            },
            prayerPoints: {
                label: { x: template.prayerPoints.label.x, y: baseY + template.prayerPoints.label.yOffset },
                value: {
                    x: template.prayerPoints.value.x,
                    y: baseY + template.prayerPoints.value.yOffset,
                    width: template.prayerPoints.value.width,
                    frameHeight: template.prayerPoints.value.frameHeight
                }
            },
            tableHeaders: {
                name: { x: template.tableHeaders.name.x, y: baseY + template.tableHeaders.name.yOffset },
                age: { x: template.tableHeaders.age.x, y: baseY + template.tableHeaders.age.yOffset },
                relationship: { x: template.tableHeaders.relationship.x, y: baseY + template.tableHeaders.relationship.yOffset },
                occupation: { x: template.tableHeaders.occupation.x, y: baseY + template.tableHeaders.occupation.yOffset },
                workingPlace: { x: template.tableHeaders.workingPlace.x, y: baseY + template.tableHeaders.workingPlace.yOffset }
            },
            firstMemberY: baseY + template.firstMemberYOffset,
            lines: {
                afterFamily: {
                    start: { x: template.lines.afterFamily.start.x, y: baseY + template.lines.afterFamily.start.yOffset },
                    end: { x: template.lines.afterFamily.end.x, y: baseY + template.lines.afterFamily.end.yOffset }
                },
                beforeTable: {
                    start: { x: template.lines.beforeTable.start.x, y: baseY + template.lines.beforeTable.start.yOffset },
                    end: { x: template.lines.beforeTable.end.x, y: baseY + template.lines.beforeTable.end.yOffset }
                },
                afterMembers: {
                    start: { x: template.lines.afterMembers.start.x, y: baseY + template.lines.afterMembers.start.yOffset },
                    end: { x: template.lines.afterMembers.end.x, y: baseY + template.lines.afterMembers.end.yOffset }
                }
            }
        };
    }

    // Helper methods
    generateFamilyNumber(family, church) {
        // Generate dynamic family number like "TNZN-A1-222"
        // Format: {church_short_name}-{area_identity}-{family_number}
        const pastorateCode = church?.church_short_name || 'TNZN';
        const areaCode = family.area_identity || 'A1';
        const familyNum = family.family_number || '001';
        return `${pastorateCode}-${areaCode}-${familyNum}`;
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
            'sis': 'Sis.',
            'bishop': 'Bishop'
        };
        return respectMap[respect.toLowerCase()] || respect;
    }

    // Function to detect if text contains Tamil characters
    isTamilText(text) {
        if (!text) return false;
        // Tamil Unicode range: U+0B80 to U+0BFF
        const tamilRange = /[\u0B80-\u0BFF]/;
        return tamilRange.test(text);
    }

    // Function to choose appropriate font based on text content
    chooseFontForText(text, isBold = false, isCelebrant = false) {
        if (isCelebrant && this.fonts.celebrant) {
            return this.fonts.celebrant;
        }
        
        if (this.isTamilText(text)) {
            return isBold ? (this.fonts.tamilBold || this.fonts.tamil || this.fonts.bold)
                          : (this.fonts.tamil || this.fonts.regular);
        }
        
        return isBold ? this.fonts.bold : this.fonts.regular;
    }

    formatDateRange(dateStr) {
        // Convert date to DD-MM format or handle DD-MM input format
        if (!dateStr) return '';
        
        // If it's already in DD-MM format, return as is
        if (dateStr.match(/^\d{2}-\d{2}$/)) {
            return dateStr;
        }
        
        // If it's a full date, format to DD-MM
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr;
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}-${month}`;
    }

    drawLine(page, line) {
        page.drawLine({
            start: line.start,
            end: line.end,
            thickness: 1.00,
            color: this.colors.black
        });
    }

    async drawText(page, text, position, fontSize, font = null) {
        try {
            if (!text || !position || typeof position.x !== 'number' || typeof position.y !== 'number') {
                return;
            }
            
            // Ensure fontSize is a valid number
            const validFontSize = (typeof fontSize === 'number' && fontSize > 0) ? fontSize : this.fontSizes.value;
            
            // Use provided font or choose appropriate font based on text content
            const selectedFont = font || this.chooseFontForText(text);
            
            page.drawText(String(text), {
                x: position.x,
                y: position.y,
                size: validFontSize,
                font: selectedFont,
                color: this.colors.black
            });
        } catch (error) {
            console.error('Error drawing text:', error);
        }
    }

    async drawCenteredText(page, text, position, fontSize, font = null) {
        try {
            if (!text || !position || typeof position.x !== 'number' || typeof position.y !== 'number') {
                return;
            }
            
            // Ensure fontSize is a valid number
            const validFontSize = (typeof fontSize === 'number' && fontSize > 0) ? fontSize : this.fontSizes.value;
            
            // Use provided font or choose appropriate font based on text content
            const textFont = font || this.chooseFontForText(text);
            const textWidth = textFont.widthOfTextAtSize(String(text), validFontSize);
            const centeredX = position.x - (textWidth / 2);
            
            page.drawText(String(text), {
                x: centeredX,
                y: position.y,
                size: validFontSize,
                font: textFont,
                color: this.colors.black
            });
        } catch (error) {
            console.error('Error drawing centered text:', error);
        }
    }

    async drawWrappedText(page, text, position, fontSize, maxWidth, font = null) {
        try {
            if (!text || !position || typeof position.x !== 'number' || typeof position.y !== 'number') {
                return;
            }
            
            // Ensure fontSize is a valid number
            const validFontSize = (typeof fontSize === 'number' && fontSize > 0) ? fontSize : this.fontSizes.value;
            const textFont = font || this.fonts.regular;
            const lines = this.wrapText(String(text), textFont, validFontSize, maxWidth);
            const lineHeight = this.getLineHeight(validFontSize);
            
            for (let i = 0; i < lines.length; i++) {
                await this.drawText(page, lines[i],
                    { x: position.x, y: position.y - (i * lineHeight) },
                    validFontSize, textFont);
            }
        } catch (error) {
            console.error('Error drawing wrapped text:', error);
        }
    }

    wrapText(text, font, fontSize, maxWidth) {
        if (!text || text.trim() === "") return [];
        
        const words = text.split(/\s+/);
        const lines = [];
        let currentLine = "";
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + (currentLine ? " " : "") + word;
            const testWidth = font.widthOfTextAtSize(testLine, fontSize);
            
            if (testWidth <= maxWidth || currentLine === "") {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                }
                currentLine = word;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }

    // New method for text wrapping with frame height constraints (like HTML template)
    async drawWrappedTextWithFrameConstraints(page, text, position, fontSize, maxWidth, maxHeight, font = null) {
        try {
            if (!text || !position || typeof position.x !== 'number' || typeof position.y !== 'number') {
                return;
            }
            
            // Ensure fontSize is a valid number
            const validFontSize = (typeof fontSize === 'number' && fontSize > 0) ? fontSize : this.fontSizes.value;
            
            // Use provided font or choose appropriate font based on text content
            const textFont = font || this.chooseFontForText(text);
            const lines = this.wrapText(String(text), textFont, validFontSize, maxWidth);
            const lineHeight = this.getLineHeight(validFontSize);
            
            // Calculate maximum lines that fit in the frame height
            const maxLines = Math.floor(maxHeight / lineHeight);
            const linesToRender = lines.slice(0, maxLines);
            
            // Render only the lines that fit within frame constraints
            for (let i = 0; i < linesToRender.length; i++) {
                const currentY = position.y - (i * lineHeight);
                
                // Skip lines that would fall below the frame bottom
                if (currentY < (position.y - maxHeight)) {
                    console.log(`Line ${i + 1} clipped: "${linesToRender[i]}" (Y: ${currentY})`);
                    continue;
                }
                
                await this.drawText(page, linesToRender[i],
                    { x: position.x, y: currentY },
                    validFontSize, textFont);
            }
            
            // Log warning if text was clipped
            if (lines.length > linesToRender.length) {
                console.log(`Text frame clipped: ${lines.length - linesToRender.length} lines not rendered due to frame height constraint`);
            }
        } catch (error) {
            console.error('Error drawing wrapped text with frame constraints:', error);
        }
    }

    getLineHeight(fontSize) {
        return fontSize * 1.2; // Standard line spacing factor like in HTML
    }
}

// Export function for easy integration with existing birthday report functionality
export async function generateInDesignBirthdayReport(reportData, church, dateRange, action = 'view') {
    try {
        const pdfGenerator = new InDesignBirthdayReportPDF();
        const pdfDoc = await pdfGenerator.generateReport(reportData, church, dateRange);
        
        if (action === 'download') {
            return await saveReportPDF(pdfDoc, church, dateRange);
        } else if (action === 'print') {
            return await printReportPDF(pdfDoc);
        } else if (action === 'view') {
            return await viewReportPDF(pdfDoc);
        }
        
        return { success: false, error: 'Invalid action specified' };
    } catch (error) {
        console.error('Error generating InDesign birthday report:', error);
        return { success: false, error: error.message };
    }
}

async function saveReportPDF(pdfDoc, church, dateRange) {
    try {
        const pdfBytes = await pdfDoc.save();
        const fromDate = dateRange.fromDate.replace(/-/g, '');
        const toDate = dateRange.toDate.replace(/-/g, '');
        const fileName = `birthday_report_indesign_${church.church_short_name || 'church'}_${fromDate}_to_${toDate}.pdf`;
        
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        
        URL.revokeObjectURL(url);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function printReportPDF(pdfDoc) {
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
        return { success: false, error: error.message };
    }
}

async function viewReportPDF(pdfDoc) {
    try {
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
            alert('Popup blocked! Please allow popups and try again.');
            return { success: false, error: 'Popup blocked' };
        }
        
        // Clean up URL after delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 10000);
        
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}