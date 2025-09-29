/**
 * Tamil Text to Image Renderer
 * 
 * This utility converts Tamil text to images using HTML Canvas,
 * which properly handles Tamil font shaping in the browser.
 * The generated images can then be embedded in PDF documents.
 */

export class TamilTextRenderer {
    constructor() {
        this.canvas = null;
        this.context = null;
        this.vijayaFontLoaded = false;
        this.defaultFontSize = 12;
        this.defaultFontFamily = 'Vijaya, Tamil Sangam MN, Arial Unicode MS, sans-serif';
        
        // High-quality rendering settings for 300 DPI equivalent
        this.highDPIScale = 4.17; // 300 DPI / 72 DPI = 4.17x for print quality
        this.useHighQuality = true;
        
        // Cache for rendered text images to improve performance
        this.imageCache = new Map();
        
        // Initialize canvas
        this.initializeCanvas();
        
        // Preload Vijaya font
        this.preloadVijayaFont();
    }

    initializeCanvas() {
        try {
            this.canvas = document.createElement('canvas');
            this.context = this.canvas.getContext('2d');
            
            // Set very high DPI for 300 DPI equivalent quality
            const pixelRatio = this.useHighQuality ? this.highDPIScale : (window.devicePixelRatio || 1);
            this.currentPixelRatio = pixelRatio;
            
            this.canvas.style.width = '100px';
            this.canvas.style.height = '50px';
            this.canvas.width = 100 * pixelRatio;
            this.canvas.height = 50 * pixelRatio;
            this.context.scale(pixelRatio, pixelRatio);
            
            console.log(`✅ Tamil text renderer canvas initialized with ${pixelRatio.toFixed(2)}x quality (${this.useHighQuality ? '300 DPI equivalent' : 'standard'})`);
        } catch (error) {
            console.error('❌ Failed to initialize canvas for Tamil text rendering:', error);
        }
    }

    async preloadVijayaFont() {
        try {
            // Try to load Vijaya font from assets or public folder
            const fontFace = new FontFace('Vijaya', 'url(./vijaya.ttf)');
            await fontFace.load();
            document.fonts.add(fontFace);
            
            this.vijayaFontLoaded = true;
            console.log('✅ Vijaya font loaded for Tamil text rendering');
        } catch (error) {
            console.warn('⚠️ Could not preload Vijaya font, using fallback:', error.message);
            // Fallback fonts will still work for Tamil
        }
    }

    /**
     * Check if text contains Tamil characters
     */
    isTamilText(text) {
        if (!text || typeof text !== 'string') return false;
        const tamilRange = /[\u0B80-\u0BFF]/;
        return tamilRange.test(text);
    }

    /**
     * Measure text dimensions
     */
    measureText(text, fontSize = this.defaultFontSize, fontFamily = this.defaultFontFamily) {
        if (!this.context) return { width: 0, height: fontSize };
        
        this.context.font = `${fontSize}px ${fontFamily}`;
        const metrics = this.context.measureText(text);
        
        return {
            width: Math.ceil(metrics.width),
            height: Math.ceil(fontSize * 1.2), // Line height approximation
            actualBoundingBoxAscent: metrics.actualBoundingBoxAscent || fontSize * 0.8,
            actualBoundingBoxDescent: metrics.actualBoundingBoxDescent || fontSize * 0.2
        };
    }

    /**
     * Render Tamil text to image
     */
    async renderTamilTextToImage(text, options = {}) {
        const {
            fontSize = this.defaultFontSize,
            fontFamily = this.defaultFontFamily,
            fontWeight = 'normal',
            color = '#000000',
            backgroundColor = 'transparent',
            padding = 2,
            maxWidth = null,
            maxHeight = null,
            isCelebrant = false
        } = options;

        // Generate cache key including maxHeight for proper caching
        const cacheKey = `${text}-${fontSize}-${fontFamily}-${fontWeight}-${color}-${backgroundColor}-${maxWidth}-${maxHeight}-${isCelebrant}`;
        if (this.imageCache.has(cacheKey)) {
            console.log(`📦 Using cached Tamil text image: "${text}"`);
            return this.imageCache.get(cacheKey);
        }

        try {
            if (!this.context) {
                throw new Error('Canvas context not available');
            }

            console.log(`🎨 Rendering Tamil text to high-quality image: "${text}"`);

            // Use celebrant font for birthday celebrants
            let finalFontFamily = fontFamily;
            if (isCelebrant) {
                console.log(`🎯 Rendering celebrant text: "${text}"`);
                fontWeight = 'bold';
            }

            // Calculate high-quality dimensions
            const scaleFactor = this.useHighQuality ? this.highDPIScale : (window.devicePixelRatio || 1);
            const scaledFontSize = fontSize * scaleFactor;
            const scaledPadding = padding * scaleFactor;

            // Measure text with scaled font size for accurate dimensions
            this.context.font = `${fontWeight} ${scaledFontSize}px ${finalFontFamily}`;
            const scaledMetrics = this.context.measureText(text);
            
            // Calculate canvas dimensions (scaled up for high quality)
            const scaledWidth = Math.max(Math.ceil(scaledMetrics.width) + (scaledPadding * 2), 10);
            let scaledHeight = Math.max(Math.ceil(scaledFontSize * 1.2) + (scaledPadding * 2), 10);
            
            // Set actual canvas size (high resolution)
            this.canvas.width = scaledWidth;
            this.canvas.height = scaledHeight;
            
            // Set display size (normal size)
            const displayWidth = Math.ceil(scaledWidth / scaleFactor);
            const displayHeight = Math.ceil(scaledHeight / scaleFactor);
            this.canvas.style.width = `${displayWidth}px`;
            this.canvas.style.height = `${displayHeight}px`;

            // Clear canvas with high quality settings
            this.context.clearRect(0, 0, scaledWidth, scaledHeight);

            // Set background if specified
            if (backgroundColor && backgroundColor !== 'transparent') {
                this.context.fillStyle = backgroundColor;
                this.context.fillRect(0, 0, scaledWidth, scaledHeight);
            }

            // Configure high-quality text rendering
            this.context.font = `${fontWeight} ${scaledFontSize}px ${finalFontFamily}`;
            this.context.fillStyle = color;
            this.context.textBaseline = 'top';
            this.context.textAlign = 'left';
            
            // Enable highest quality rendering
            this.context.textRenderingOptimization = 'optimizeQuality';
            this.context.imageSmoothingEnabled = true;
            this.context.imageSmoothingQuality = 'high';

            // Handle text wrapping if maxWidth is specified
            if (maxWidth && (scaledMetrics.width / scaleFactor) > maxWidth) {
                console.log(`📏 Text needs wrapping: "${text}" (${Math.ceil(scaledMetrics.width / scaleFactor)}px > ${maxWidth}px)`);
                
                // Calculate proper canvas height for wrapped text
                const wrappedDimensions = this.calculateWrappedTextDimensions(text, scaledFontSize, maxWidth * scaleFactor);
                let requiredHeight = wrappedDimensions.height + (scaledPadding * 2);
                
                // Apply maxHeight constraint if specified (like HTML model frame constraints)
                if (maxHeight) {
                    const maxScaledHeight = maxHeight * scaleFactor;
                    requiredHeight = Math.min(requiredHeight, maxScaledHeight + (scaledPadding * 2));
                    console.log(`📐 Frame height constraint applied: ${maxHeight}pt (${maxScaledHeight}px scaled)`);
                }
                
                // Set canvas to exact required size
                this.canvas.width = scaledWidth;
                this.canvas.height = requiredHeight;
                
                const newDisplayWidth = Math.ceil(scaledWidth / scaleFactor);
                const newDisplayHeight = Math.ceil(requiredHeight / scaleFactor);
                this.canvas.style.width = `${newDisplayWidth}px`;
                this.canvas.style.height = `${newDisplayHeight}px`;
                
                // Re-clear and reconfigure after resize
                this.context.clearRect(0, 0, scaledWidth, requiredHeight);
                
                if (backgroundColor && backgroundColor !== 'transparent') {
                    this.context.fillStyle = backgroundColor;
                    this.context.fillRect(0, 0, scaledWidth, requiredHeight);
                }
                
                // Reconfigure text rendering after resize
                this.context.font = `${fontWeight} ${scaledFontSize}px ${finalFontFamily}`;
                this.context.fillStyle = color;
                this.context.textBaseline = 'top';
                this.context.textAlign = 'left';
                this.context.textRenderingOptimization = 'optimizeQuality';
                this.context.imageSmoothingEnabled = true;
                this.context.imageSmoothingQuality = 'high';
                
                // Calculate available height for text (excluding padding)
                const availableHeight = requiredHeight - (scaledPadding * 2);
                
                this.drawWrappedText(text, scaledPadding, scaledPadding, scaledFontSize, maxWidth * scaleFactor, availableHeight);
                
                // Update scaledHeight for result calculation
                scaledHeight = requiredHeight;
            } else {
                // Draw single line text at high resolution
                console.log(`📝 Single line Tamil text: "${text}"`);
                this.context.fillText(text, scaledPadding, scaledPadding);
            }

            // Convert canvas to high-quality PNG
            const imageDataUrl = this.canvas.toDataURL('image/png', 1.0); // Maximum quality
            
            // Create result object with logical (not scaled) dimensions
            const finalDisplayWidth = Math.ceil(scaledWidth / scaleFactor);
            const finalDisplayHeight = Math.ceil(scaledHeight / scaleFactor);
            
            const result = {
                dataUrl: imageDataUrl,
                width: finalDisplayWidth,
                height: finalDisplayHeight,
                originalText: text,
                fontSize: fontSize,
                textWidth: Math.ceil(scaledMetrics.width / scaleFactor),
                textHeight: Math.ceil(scaledFontSize / scaleFactor),
                scaleFactor: scaleFactor,
                actualWidth: scaledWidth,
                actualHeight: scaledHeight
            };

            // Cache the result
            this.imageCache.set(cacheKey, result);
            
            console.log(`✅ High-quality Tamil text rendered: "${text}" (${displayWidth}x${displayHeight}px @ ${scaleFactor.toFixed(1)}x scale = ${scaledWidth}x${scaledHeight}px actual)`);
            return result;

        } catch (error) {
            console.error(`❌ Failed to render Tamil text "${text}":`, error);
            
            // Return a fallback result
            return {
                dataUrl: null,
                width: 100,
                height: 20,
                originalText: text,
                fontSize: fontSize,
                textWidth: 100,
                textHeight: 20,
                error: error.message
            };
        }
    }

    /**
     * Calculate dimensions needed for wrapped text
     */
    calculateWrappedTextDimensions(text, fontSize, maxWidth) {
        const words = text.split(/\s+/);
        const lineHeight = fontSize * 1.2;
        let lines = [];
        let currentLine = '';
        let maxLineWidth = 0;

        // Save current font settings
        const currentFont = this.context.font;
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = this.context.measureText(testLine);

            if (metrics.width <= maxWidth || currentLine === '') {
                currentLine = testLine;
                maxLineWidth = Math.max(maxLineWidth, metrics.width);
            } else {
                // Save current line and start new one
                if (currentLine) {
                    lines.push(currentLine);
                }
                currentLine = word;
                const wordMetrics = this.context.measureText(word);
                maxLineWidth = Math.max(maxLineWidth, wordMetrics.width);
            }
        }

        // Add final line
        if (currentLine) {
            lines.push(currentLine);
        }

        return {
            lines: lines,
            width: maxLineWidth,
            height: lines.length * lineHeight,
            lineCount: lines.length,
            lineHeight: lineHeight
        };
    }

    /**
     * Draw wrapped text on canvas with proper line handling
     */
    drawWrappedText(text, x, y, fontSize, maxWidth, maxHeight) {
        const dimensions = this.calculateWrappedTextDimensions(text, fontSize, maxWidth);
        const { lines, lineHeight } = dimensions;
        let currentY = y;

        console.log(`📝 Drawing ${lines.length} lines of wrapped text: "${text}"`);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check if line fits within available height
            if (currentY + lineHeight <= y + maxHeight) {
                this.context.fillText(line, x, currentY);
                console.log(`✅ Drew line ${i + 1}: "${line}" at Y: ${currentY}`);
                currentY += lineHeight;
            } else {
                console.warn(`⚠️ Line ${i + 1} clipped due to height constraint: "${line}"`);
                break;
            }
        }
    }

    /**
     * Render multiple Tamil text elements for batch processing
     */
    async renderMultipleTamilTexts(textItems) {
        const results = [];
        
        for (const item of textItems) {
            const { text, ...options } = item;
            if (this.isTamilText(text)) {
                const result = await this.renderTamilTextToImage(text, options);
                results.push({ ...item, imageData: result });
            } else {
                // Non-Tamil text - return as is for normal font rendering
                results.push({ ...item, imageData: null, useNormalFont: true });
            }
        }
        
        return results;
    }

    /**
     * Clear the image cache
     */
    clearCache() {
        this.imageCache.clear();
        console.log('🗑️ Tamil text image cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.imageCache.size,
            keys: Array.from(this.imageCache.keys())
        };
    }

    /**
     * Test the Tamil text renderer
     */
    async testRenderer() {
        console.log('🧪 Testing Tamil text renderer...');
        
        const testTexts = [
            { text: 'சஜித்', fontSize: 16 },
            { text: 'அன்பு சந்தோஷம்', fontSize: 14 },
            { text: 'திருநெல்வேலி', fontSize: 12 },
            { text: 'Mr. சஜித்', fontSize: 16, isCelebrant: true }
        ];

        const results = [];
        for (const testText of testTexts) {
            const result = await this.renderTamilTextToImage(testText.text, testText);
            results.push(result);
            console.log(`✅ Test "${testText.text}": ${result.width}x${result.height}px`);
        }

        console.log('📊 Tamil text renderer test completed');
        return results;
    }

    /**
     * Set quality mode for rendering
     */
    setQualityMode(useHighQuality = true) {
        this.useHighQuality = useHighQuality;
        console.log(`📐 Tamil renderer quality mode: ${useHighQuality ? '300 DPI equivalent (4.17x)' : 'Standard'}`);
        // Clear cache when changing quality modes
        this.clearCache();
        this.initializeCanvas(); // Reinitialize with new quality settings
    }

    /**
     * Get current quality information
     */
    getQualityInfo() {
        return {
            useHighQuality: this.useHighQuality,
            scaleFactor: this.useHighQuality ? this.highDPIScale : (window.devicePixelRatio || 1),
            equivalentDPI: this.useHighQuality ? 300 : 72,
            description: this.useHighQuality ? '300 DPI Print Quality' : 'Standard Screen Quality'
        };
    }

    /**
     * Test quality modes with sample text
     */
    async testQualityModes() {
        console.log('🧪 Testing quality modes...');
        
        const testText = 'சஜித்';
        
        // Test standard quality
        this.setQualityMode(false);
        const standardResult = await this.renderTamilTextToImage(testText, { fontSize: 16 });
        console.log(`📊 Standard quality: ${standardResult.width}x${standardResult.height}px (actual: ${standardResult.actualWidth || 'N/A'}x${standardResult.actualHeight || 'N/A'}px)`);
        
        // Test high quality
        this.setQualityMode(true);
        const hqResult = await this.renderTamilTextToImage(testText, { fontSize: 16 });
        console.log(`📊 High quality: ${hqResult.width}x${hqResult.height}px (actual: ${hqResult.actualWidth}x${hqResult.actualHeight}px)`);
        
        return { standard: standardResult, highQuality: hqResult };
    }
}

// Create a singleton instance for use across the application
export const tamilRenderer = new TamilTextRenderer();

// Helper function for easy use
export async function renderTamilText(text, options = {}) {
    if (!tamilRenderer.isTamilText(text)) {
        return null; // Not Tamil text, use normal font rendering
    }
    
    return await tamilRenderer.renderTamilTextToImage(text, options);
}

// Export utility functions
export { TamilTextRenderer as default };