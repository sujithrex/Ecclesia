import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { tamilRenderer } from './tamilTextRenderer.js';

export class InDesignSabaiJabithaReportPDF {
    constructor() {
        // Page dimensions exactly matching the HTML template
        this.pageWidth = 595.28;
        this.pageHeight = 841.89;
        
        // Coordinates extracted from sabai_jabitha.html template
        this.coordinates = {
            // Border rectangle
            border: {
                x: 36.50,
                y: 36.50,
                width: 522.28,
                height: 768.89
            },
            
            // Header text frames
            header: {
                title: { x: 297.64, y: 769.84, width: 523.28, height: 22.82 }, // சபை அங்கத்தினர் ஜாபிதா
                subtitle: { x: 292.82, y: 756.19, width: 523.28, height: 16.30 }, // Instructions
                church: { x: 42.52, y: 738.47, width: 34.72, height: 12.05 }, // சபை:
                year: { x: 322.44, y: 724.30, width: 236.98, height: 16.30 } // 2025 ஏப்ரலில்...
            },
            
            // Table structure - Main horizontal lines
            lines: {
                top: { y: 738.43 },
                afterHeader: { y: 717.87 },
                afterTableHeader: { y: 631.42 },
                sample: { y: 580.39 } // Sample row line
            },
            
            // Vertical column lines (x positions)
            verticalLines: [
                { x: 60.38 },   // After family number
                { x: 102.05 },  // After family head indicator
                { x: 317.98 },  // After name column
                { x: 341.79 },  // After சங்கம்
                { x: 365.95 },  // After வயது
                { x: 390.11 },  // After 1-15
                { x: 414.27 },  // After 16-35
                { x: 438.44 },  // After 35+
                { x: 462.60 },  // After ஆ.பெ.பி
                { x: 486.76 },  // After வரிசை எண்
                { x: 510.92 },  // After ஞானஸ்நானம்
                { x: 535.08 }   // After இராபோஜனம்
            ],
            
            // Rotated text frames (90°) - Column headers
            rotatedHeaders: {
                // இனமுறை (Layer 6)
                relation: {
                    centerX: 82.24,
                    centerY: 674.89,
                    width: 40.62,
                    height: 86.95,
                    text: 'இனமுறை'
                },
                // சங்கம் 2025-2026 (Layer 7)
                sangam: {
                    centerX: 330.11,
                    centerY: 674.39,
                    width: 23.26,
                    height: 86.95,
                    text: 'சங்கம் 2025-2026'
                },
                // 1-15 (Layer 8)
                age1_15: {
                    centerX: 353.93,
                    centerY: 663.94,
                    width: 23.03,
                    height: 65.06,
                    text: '1-15'
                },
                // 16-35 (Layer 9)
                age16_35: {
                    centerX: 377.97,
                    centerY: 664.44,
                    width: 23.03,
                    height: 65.06,
                    text: '16-35'
                },
                // 35க்கு மேல் (Layer 10)
                age35plus: {
                    centerX: 402.26,
                    centerY: 664.44,
                    width: 23.03,
                    height: 65.06,
                    text: '35க்கு மேல்'
                },
                // ஆ.பெ.பி (Layer 11)
                category: {
                    centerX: 426.10,
                    centerY: 674.65,
                    width: 23.66,
                    height: 85.46,
                    text: 'ஆ.பெ.பி'
                },
                // வரிசை எண் (Layer 12)
                serialNo: {
                    centerX: 450.52,
                    centerY: 674.44,
                    width: 23.66,
                    height: 85.46,
                    text: 'வரிசை எண்'
                },
                // ஞானஸ்நானம் (Layer 13)
                baptism: {
                    centerX: 474.89,
                    centerY: 674.65,
                    width: 23.66,
                    height: 85.46,
                    text: 'ஞானஸ்நானம்'
                },
                // இராபோஜனம் (Layer 14)
                confirmation: {
                    centerX: 499.25,
                    centerY: 673.65,
                    width: 23.66,
                    height: 85.46,
                    text: 'இராபோஜனம்'
                },
                // அயலிடம் (Layer 15)
                neighbor: {
                    centerX: 523.00,
                    centerY: 674.65,
                    width: 23.66,
                    height: 85.46,
                    text: 'அயலிடம்'
                },
                // குறிப்புகள் (Layer 16)
                notes: {
                    centerX: 546.74,
                    centerY: 675.15,
                    width: 23.66,
                    height: 85.46,
                    text: 'குறிப்புகள்'
                },
                // குடும்ப எண் (Layer 35)
                familyNo: {
                    centerX: 48.25,
                    centerY: 675.02,
                    width: 23.26,
                    height: 86.20,
                    text: 'குடும்ப எண்'
                }
            },
            
            // Regular text frames - Non-rotated headers
            regularHeaders: {
                // வயது (Layer 17)
                age: {
                    x: 378.53,
                    y: 705.37,
                    width: 72.48,
                    height: 20.40,
                    text: 'வயது',
                    alignment: 'center'
                },
                // பெயர் மற்றும் ஆதார் எண் (Layer 18)
                nameAadhar: {
                    x: 210.47,
                    y: 706.07,
                    width: 215.02,
                    height: 86.16,
                    text: 'பெயர் மற்றும் ஆதார் எண்\n(பெயர் ஆதார் அட்டையில் உள்ளபடி)',
                    alignment: 'center'
                }
            },
            
            // Sample data row positions (for reference)
            sampleRow: {
                familyNo: { x: 48.19, y: 620.42 },
                familyHead: { x: 81.71, y: 621.42 },
                name: { x: 210.47, y: 619.42 },
                sangam: { x: 329.89, y: 606.11 },
                age: { x: 377.36, y: 606.99 },
                category: { x: 426.53, y: 605.82 }
            },
            
            // Data row starting position
            dataStart: {
                y: 620.42, // First data row Y position
                rowHeight: 25.5 // Approximate row height
            }
        };
        
        // Font setup
        this.fonts = {
            regular: null,
            bold: null,
            tamil: null,
            tamilBold: null
        };
        
        this.colors = {
            black: rgb(0, 0, 0)
        };
        
        // Font sizes from HTML
        this.fontSizes = {
            title: 24,
            subtitle: 12,
            header: 12,
            data: 11,
            smallData: 10
        };
    }

    async generateReport(congregationData, church, options = {}) {
        const startTime = Date.now();
        let step = 'Initialization';
        
        try {
            console.log('🔄 Starting Sabai Jabitha PDF generation...');
            
            // Validate input
            step = 'Input Validation';
            if (!congregationData || !Array.isArray(congregationData) || congregationData.length === 0) {
                throw new Error('No congregation data provided');
            }
            
            if (!church || !church.church_name) {
                throw new Error('Invalid church data');
            }
            
            // Create PDF document
            step = 'PDF Document Creation';
            const pdfDoc = await PDFDocument.create();
            pdfDoc.registerFontkit(fontkit);
            this.pdfDoc = pdfDoc;
            
            // Load fonts
            step = 'Font Loading';
            await this.loadFonts(pdfDoc);
            
            // Create page
            step = 'Page Creation';
            const page = pdfDoc.addPage([this.pageWidth, this.pageHeight]);
            
            // Draw content
            step = 'Content Rendering';
            await this.drawPageBorder(page);
            await this.drawHeaders(page, church, options);
            await this.drawTableStructure(page);
            await this.drawColumnHeaders(page);
            await this.drawData(page, congregationData);
            
            const endTime = Date.now();
            console.log(`✅ Sabai Jabitha PDF generated in ${endTime - startTime}ms`);
            
            return pdfDoc;
            
        } catch (error) {
            console.error(`❌ PDF generation failed at ${step}:`, error);
            throw new Error(`PDF Generation Failed at ${step}: ${error.message}`);
        }
    }

    async loadFonts(pdfDoc) {
        let fontsLoaded = false;
        
        try {
            // Strategy 1: Try importing from assets
            try {
                const timesUrl = (await import('../assets/times.ttf?url')).default;
                const timesBoldUrl = (await import('../assets/timesbd.ttf?url')).default;
                const vijayaUrl = (await import('../assets/vijaya.ttf?url')).default;
                const vijayaBoldUrl = (await import('../assets/vijayab.ttf?url')).default;
                
                const [timesResponse, timesBoldResponse, vijayaResponse, vijayaBoldResponse] = await Promise.all([
                    fetch(timesUrl),
                    fetch(timesBoldUrl),
                    fetch(vijayaUrl),
                    fetch(vijayaBoldUrl)
                ]);
                
                if (timesResponse.ok && timesBoldResponse.ok && vijayaResponse.ok && vijayaBoldResponse.ok) {
                    const [timesBytes, timesBoldBytes, vijayaBytes, vijayaBoldBytes] = await Promise.all([
                        timesResponse.arrayBuffer(),
                        timesBoldResponse.arrayBuffer(),
                        vijayaResponse.arrayBuffer(),
                        vijayaBoldResponse.arrayBuffer()
                    ]);
                    
                    this.fonts.regular = await pdfDoc.embedFont(timesBytes);
                    this.fonts.bold = await pdfDoc.embedFont(timesBoldBytes);
                    this.fonts.tamil = await pdfDoc.embedFont(vijayaBytes);
                    this.fonts.tamilBold = await pdfDoc.embedFont(vijayaBoldBytes);
                    
                    console.log('✅ Fonts loaded from assets');
                    fontsLoaded = true;
                }
            } catch (importError) {
                console.warn('Asset import failed:', importError.message);
            }
            
            // Strategy 2: Try public folder
            if (!fontsLoaded) {
                try {
                    const [timesResponse, timesBoldResponse, vijayaResponse, vijayaBoldResponse] = await Promise.all([
                        fetch('./times.ttf'),
                        fetch('./timesbd.ttf'),
                        fetch('./vijaya.ttf'),
                        fetch('./vijayab.ttf')
                    ]);
                    
                    if (timesResponse.ok && timesBoldResponse.ok && vijayaResponse.ok && vijayaBoldResponse.ok) {
                        const [timesBytes, timesBoldBytes, vijayaBytes, vijayaBoldBytes] = await Promise.all([
                            timesResponse.arrayBuffer(),
                            timesBoldResponse.arrayBuffer(),
                            vijayaResponse.arrayBuffer(),
                            vijayaBoldResponse.arrayBuffer()
                        ]);
                        
                        this.fonts.regular = await pdfDoc.embedFont(timesBytes);
                        this.fonts.bold = await pdfDoc.embedFont(timesBoldBytes);
                        this.fonts.tamil = await pdfDoc.embedFont(vijayaBytes);
                        this.fonts.tamilBold = await pdfDoc.embedFont(vijayaBoldBytes);
                        
                        console.log('✅ Fonts loaded from public folder');
                        fontsLoaded = true;
                    }
                } catch (fetchError) {
                    console.warn('Public folder fetch failed:', fetchError.message);
                }
            }
            
            // Fallback to standard fonts
            if (!fontsLoaded) {
                console.warn('⚠️ Using standard fonts - Tamil will not render correctly');
                this.fonts.regular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
                this.fonts.bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
                this.fonts.tamil = await pdfDoc.embedFont(StandardFonts.TimesRoman);
                this.fonts.tamilBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
            }
            
        } catch (error) {
            console.error('Font loading error:', error);
            throw new Error(`Font loading failed: ${error.message}`);
        }
    }

    async drawPageBorder(page) {
        const border = this.coordinates.border;
        page.drawRectangle({
            x: border.x,
            y: border.y,
            width: border.width,
            height: border.height,
            borderColor: this.colors.black,
            borderWidth: 1.00
        });
    }

    async drawHeaders(page, church, options) {
        // Title: சபை அங்கத்தினர் ஜாபிதா
        const titleConfig = this.coordinates.header.title;
        await this.drawCenteredTamilText(page, 'சபை அங்கத்தினர் ஜாபிதா', 
            { x: titleConfig.x, y: titleConfig.y }, this.fontSizes.title);
        
        // Subtitle with instructions
        const subtitleConfig = this.coordinates.header.subtitle;
        await this.drawCenteredTamilText(page, 
            '( ஒவ்வொரு குடும்பத்தினர்க்கும் அடுத்த குடும்பத்திற்கும் இடையில் 4 கோடுகள் விடப்படவும் )',
            { x: subtitleConfig.x, y: subtitleConfig.y }, this.fontSizes.subtitle);
        
        // Church label: சபை:
        const churchConfig = this.coordinates.header.church;
        await this.drawTamilText(page, 'சபை :', 
            { x: churchConfig.x, y: churchConfig.y }, this.fontSizes.header);
        
        // Year information
        const yearConfig = this.coordinates.header.year;
        const year = options.year || new Date().getFullYear();
        await this.drawText(page, `${year} ஏப்ரலில் எழுதப்பட வேண்டியது ${year} -${year + 1}`,
            { x: yearConfig.x, y: yearConfig.y }, this.fontSizes.header);
    }

    async drawTableStructure(page) {
        // Draw horizontal lines
        const lines = this.coordinates.lines;
        const width = this.pageWidth;
        
        // Top line
        page.drawLine({
            start: { x: 36.62, y: lines.top.y },
            end: { x: 558.60, y: lines.top.y },
            thickness: 1.00,
            color: this.colors.black
        });
        
        // After header line
        page.drawLine({
            start: { x: 36.62, y: lines.afterHeader.y },
            end: { x: 558.77, y: lines.afterHeader.y },
            thickness: 1.00,
            color: this.colors.black
        });
        
        // After table header line
        page.drawLine({
            start: { x: 36.62, y: lines.afterTableHeader.y },
            end: { x: 558.82, y: lines.afterTableHeader.y },
            thickness: 1.00,
            color: this.colors.black
        });
        
        // Draw vertical lines
        this.coordinates.verticalLines.forEach(line => {
            page.drawLine({
                start: { x: line.x, y: lines.afterHeader.y },
                end: { x: line.x, y: 36.00 },
                thickness: 1.00,
                color: this.colors.black
            });
        });
    }

    async drawColumnHeaders(page) {
        // Draw all rotated headers (90°)
        const rotated = this.coordinates.rotatedHeaders;
        
        for (const [key, config] of Object.entries(rotated)) {
            await this.drawRotatedTamilText(page, config.text, config, this.fontSizes.header);
        }
        
        // Draw regular (non-rotated) headers
        const regular = this.coordinates.regularHeaders;
        
        // வயது (Age)
        await this.drawCenteredTamilText(page, regular.age.text,
            { x: regular.age.x, y: regular.age.y }, this.fontSizes.header);
        
        // பெயர் மற்றும் ஆதார் எண் (Name and Aadhar)
        await this.drawWrappedTamilText(page, regular.nameAadhar.text,
            { x: regular.nameAadhar.x, y: regular.nameAadhar.y },
            this.fontSizes.header, regular.nameAadhar.width, regular.nameAadhar.height);
    }

    async drawData(page, congregationData) {
        let currentY = this.coordinates.dataStart.y;
        const rowHeight = this.coordinates.dataStart.rowHeight;
        const minY = 100; // Minimum Y before page break needed
        
        congregationData.forEach((familyGroup, familyIndex) => {
            familyGroup.members.forEach((member, memberIndex) => {
                if (currentY < minY) {
                    console.warn('Reached bottom of page - pagination needed');
                    return;
                }
                
                this.drawMemberRow(page, familyGroup, member, currentY);
                currentY -= rowHeight;
            });
        });
    }

    drawMemberRow(page, familyGroup, member, y) {
        const fontSize = this.fontSizes.data;
        
        // Family Number (left-aligned)
        const familyNumber = familyGroup.family.combined_family_number || 
            `${familyGroup.area?.area_identity}${familyGroup.family.family_number}`;
        page.drawText(familyNumber, {
            x: 48,
            y: y,
            size: fontSize,
            font: this.fonts.regular,
            color: this.colors.black
        });
        
        // Family Head indicator (if first member)
        // Skip or handle based on your logic
        
        // Member Name and Aadhar (center-aligned in column)
        const memberName = `${this.formatRespect(member.respect)}. ${member.name}`;
        page.drawText(memberName, {
            x: 110,
            y: y,
            size: fontSize,
            font: this.fonts.regular,
            color: this.colors.black
        });
        
        // Age marks (X for applicable range)
        if (member.age) {
            // வயது column
            page.drawText(member.age.toString(), {
                x: 370,
                y: y,
                size: fontSize,
                font: this.fonts.regular,
                color: this.colors.black
            });
            
            // Age category marks
            if (member.age >= 1 && member.age <= 15) {
                page.drawText('X', { x: 353, y: y, size: fontSize, font: this.fonts.bold, color: this.colors.black });
            } else if (member.age >= 16 && member.age <= 35) {
                page.drawText('X', { x: 377, y: y, size: fontSize, font: this.fonts.bold, color: this.colors.black });
            } else if (member.age > 35) {
                page.drawText('X', { x: 402, y: y, size: fontSize, font: this.fonts.bold, color: this.colors.black });
            }
        }
        
        // Category (ஆ/பெ/பி)
        const category = this.getCategoryMark(member);
        page.drawText(category, {
            x: 420,
            y: y,
            size: fontSize,
            font: this.fonts.tamil || this.fonts.regular,
            color: this.colors.black
        });
        
        // Serial Number
        if (member.serial_number) {
            page.drawText(member.serial_number.toString(), {
                x: 445,
                y: y,
                size: fontSize,
                font: this.fonts.regular,
                color: this.colors.black
            });
        }
        
        // Baptism (X if yes)
        if (member.is_baptised === 'yes') {
            page.drawText('X', { x: 470, y: y, size: fontSize, font: this.fonts.bold, color: this.colors.black });
        }
        
        // Confirmation (X if yes)
        if (member.is_confirmed === 'yes') {
            page.drawText('X', { x: 495, y: y, size: fontSize, font: this.fonts.bold, color: this.colors.black });
        }
        
        // Notes
        if (member.notes) {
            page.drawText(member.notes.substring(0, 20), {
                x: 540,
                y: y,
                size: this.fontSizes.smallData,
                font: this.fonts.regular,
                color: this.colors.black
            });
        }
    }

    // Helper methods for Tamil text rendering
    isTamilText(text) {
        if (!text || typeof text !== 'string') return false;
        return /[\u0B80-\u0BFF]/.test(text);
    }

    async drawTamilText(page, text, position, fontSize) {
        if (this.isTamilText(text)) {
            return await this.drawTamilTextAsImage(page, text, position, fontSize);
        }
        
        page.drawText(text, {
            x: position.x,
            y: position.y,
            size: fontSize,
            font: this.fonts.regular,
            color: this.colors.black
        });
    }

    async drawCenteredTamilText(page, text, position, fontSize) {
        if (this.isTamilText(text)) {
            const imageData = await tamilRenderer.renderTamilTextToImage(text, {
                fontSize: fontSize,
                fontWeight: 'bold',
                color: '#000000',
                padding: 1
            });
            
            if (imageData && imageData.dataUrl) {
                const imageBytes = this.dataUrlToArrayBuffer(imageData.dataUrl);
                const image = await this.pdfDoc.embedPng(imageBytes);
                const centeredX = position.x - (imageData.width / 2);
                const adjustedY = position.y - imageData.height + fontSize * 0.8;
                
                page.drawImage(image, {
                    x: centeredX,
                    y: adjustedY,
                    width: imageData.width,
                    height: imageData.height
                });
                return;
            }
        }
        
        const textWidth = this.fonts.bold.widthOfTextAtSize(text, fontSize);
        const centeredX = position.x - (textWidth / 2);
        
        page.drawText(text, {
            x: centeredX,
            y: position.y,
            size: fontSize,
            font: this.fonts.bold,
            color: this.colors.black
        });
    }

    async drawRotatedTamilText(page, text, config, fontSize) {
        try {
            // For rotated Tamil text, we'll use image rendering
            if (this.isTamilText(text)) {
                const imageData = await tamilRenderer.renderTamilTextToImage(text, {
                    fontSize: fontSize,
                    fontWeight: 'normal',
                    color: '#000000',
                    padding: 1
                });
                
                if (imageData && imageData.dataUrl) {
                    const imageBytes = this.dataUrlToArrayBuffer(imageData.dataUrl);
                    const image = await this.pdfDoc.embedPng(imageBytes);
                    
                    // Calculate position for rotated image
                    const rotationAngle = 90.0;
                    const radians = rotationAngle * Math.PI / 180;
                    const cosAngle = Math.cos(radians);
                    const sinAngle = Math.sin(radians);
                    
                    // Use effective dimensions (swapped for 90° rotation)
                    const effectiveFrameWidth = config.height;
                    const effectiveFrameHeight = config.width;
                    
                    // Center the image in the rotated frame
                    const localX = (effectiveFrameWidth - imageData.width) / 2;
                    const localY = (effectiveFrameHeight - imageData.height) / 2;
                    
                    // Transform to world coordinates
                    const localOffsetX = localX - (effectiveFrameWidth / 2);
                    const localOffsetY = localY - (effectiveFrameHeight / 2);
                    
                    const worldX = config.centerX + (localOffsetX * cosAngle - localOffsetY * sinAngle);
                    const worldY = config.centerY + (localOffsetX * sinAngle + localOffsetY * cosAngle);
                    
                    // For 90° rotation, we need to adjust the image drawing
                    // pdf-lib doesn't support image rotation directly, so we'll position text instead
                    page.drawText(text, {
                        x: worldX,
                        y: worldY,
                        size: fontSize,
                        font: this.fonts.tamil || this.fonts.regular,
                        color: this.colors.black,
                        rotate: degrees(rotationAngle)
                    });
                    return;
                }
            }
            
            // Fallback to regular rotated text
            const rotationAngle = 90.0;
            const radians = rotationAngle * Math.PI / 180;
            const cosAngle = Math.cos(radians);
            const sinAngle = Math.sin(radians);
            
            const effectiveFrameWidth = config.height;
            const effectiveFrameHeight = config.width;
            
            const localY = effectiveFrameHeight / 2;
            const localX = effectiveFrameWidth / 2;
            
            const localOffsetX = localX - (effectiveFrameWidth / 2);
            const localOffsetY = localY - (effectiveFrameHeight / 2);
            
            const worldX = config.centerX + (localOffsetX * cosAngle - localOffsetY * sinAngle);
            const worldY = config.centerY + (localOffsetX * sinAngle + localOffsetY * cosAngle);
            
            page.drawText(text, {
                x: worldX,
                y: worldY,
                size: fontSize,
                font: this.fonts.tamil || this.fonts.regular,
                color: this.colors.black,
                rotate: degrees(rotationAngle)
            });
        } catch (error) {
            console.warn(`Failed to draw rotated Tamil text "${text}":`, error);
        }
    }

    async drawWrappedTamilText(page, text, position, fontSize, maxWidth, maxHeight) {
        try {
            if (this.isTamilText(text)) {
                // Render Tamil text as image with wrapping
                const imageData = await tamilRenderer.renderTamilTextToImage(text, {
                    fontSize: fontSize,
                    fontWeight: 'normal',
                    color: '#000000',
                    padding: 1,
                    maxWidth: maxWidth
                });
                
                if (imageData && imageData.dataUrl) {
                    const imageBytes = this.dataUrlToArrayBuffer(imageData.dataUrl);
                    const image = await this.pdfDoc.embedPng(imageBytes);
                    const centeredX = position.x - (imageData.width / 2);
                    const adjustedY = position.y - imageData.height + fontSize * 0.8;
                    
                    page.drawImage(image, {
                        x: centeredX,
                        y: adjustedY,
                        width: Math.min(imageData.width, maxWidth),
                        height: Math.min(imageData.height, maxHeight)
                    });
                    return;
                }
            }
            
            // Fallback: Simple wrapped text
            const lines = text.split('\n');
            const lineHeight = fontSize * 1.2;
            
            for (let i = 0; i < lines.length; i++) {
                const currentY = position.y - (i * lineHeight);
                if (currentY < position.y - maxHeight) break;
                
                await this.drawCenteredTamilText(page, lines[i], { x: position.x, y: currentY }, fontSize);
            }
        } catch (error) {
            console.warn(`Failed to draw wrapped Tamil text "${text}":`, error);
        }
    }

    async drawRotatedTamilText(page, text, config, fontSize) {
        const rotationAngle = 90.0;
        const radians = rotationAngle * Math.PI / 180;
        const cosAngle = Math.cos(radians);
        const sinAngle = Math.sin(radians);
        
        // Use effective dimensions (swapped for 90° rotation)
        const effectiveFrameWidth = config.height;
        const effectiveFrameHeight = config.width;
        
        // Calculate local Y position (centered vertically)
        const localY = effectiveFrameHeight - fontSize - (effectiveFrameHeight - fontSize) / 2;
        
        // Center horizontally in effective frame
        const lineWidth = fontSize * text.length * 0.5; // Approximate
        const localX = (effectiveFrameWidth / 2) - (lineWidth / 2);
        
        // Transform to world coordinates
        const localOffsetX = localX - (effectiveFrameWidth / 2);
        const localOffsetY = localY - (effectiveFrameHeight / 2);
        
        const worldX = config.centerX + (localOffsetX * cosAngle - localOffsetY * sinAngle);
        const worldY = config.centerY + (localOffsetX * sinAngle + localOffsetY * cosAngle);
        
        page.drawText(text, {
            x: worldX,
            y: worldY,
            size: fontSize,
            font: this.fonts.tamil || this.fonts.regular,
            color: this.colors.black,
            rotate: { angle: rotationAngle, type: 'degrees' }
        });
    }

    async drawTamilTextAsImage(page, text, position, fontSize) {
        try {
            const imageData = await tamilRenderer.renderTamilTextToImage(text, {
                fontSize: fontSize,
                fontWeight: 'normal',
                color: '#000000',
                padding: 1
            });

            if (imageData && imageData.dataUrl) {
                const imageBytes = this.dataUrlToArrayBuffer(imageData.dataUrl);
                const image = await this.pdfDoc.embedPng(imageBytes);
                const adjustedY = position.y - imageData.height + fontSize * 0.8;
                
                page.drawImage(image, {
                    x: position.x,
                    y: adjustedY,
                    width: imageData.width,
                    height: imageData.height
                });
            }
        } catch (error) {
            console.warn('Tamil text image rendering failed:', error);
            page.drawText(text, {
                x: position.x,
                y: position.y,
                size: fontSize,
                font: this.fonts.regular,
                color: this.colors.black
            });
        }
    }

    async drawText(page, text, position, fontSize) {
        page.drawText(text, {
            x: position.x,
            y: position.y,
            size: fontSize,
            font: this.fonts.regular,
            color: this.colors.black
        });
    }

    formatRespect(respect) {
        if (!respect) return '';
        const respectMap = {
            'mr': 'Mr', 'mrs': 'Mrs', 'ms': 'Ms',
            'master': 'Master', 'rev': 'Rev', 'dr': 'Dr'
        };
        return respectMap[respect.toLowerCase()] || respect;
    }

    getCategoryMark(member) {
        if (member.age <= 15) return 'பி';
        return member.sex === 'male' ? 'ஆ' : 'பெ';
    }

    dataUrlToArrayBuffer(dataUrl) {
        const base64 = dataUrl.split(',')[1];
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
}

// Export functions
export async function generateInDesignSabaiJabithaReport(congregationData, church, options = {}, action = 'view') {
    try {
        const pdfGenerator = new InDesignSabaiJabithaReportPDF();
        const pdfDoc = await pdfGenerator.generateReport(congregationData, church, options);
        
        if (action === 'download') {
            return await saveReportPDF(pdfDoc, church, options);
        } else if (action === 'print') {
            return await printReportPDF(pdfDoc);
        } else if (action === 'view') {
            return await viewReportPDF(pdfDoc);
        }
        
        return { success: false, error: 'Invalid action' };
    } catch (error) {
        console.error('Error generating Sabai Jabitha report:', error);
        return { success: false, error: error.message };
    }
}

async function saveReportPDF(pdfDoc, church, options) {
    try {
        const pdfBytes = await pdfDoc.save();
        const year = options.year || new Date().getFullYear();
        const fileName = `sabai_jabitha_${church.church_short_name || 'church'}_${year}.pdf`;
        
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
        
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}