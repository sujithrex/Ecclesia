class OfferingsReportService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    /**
     * Get offertory book report data for a specific month and church
     * @param {number} pastorateId - The pastorate ID
     * @param {number} userId - The user ID
     * @param {string} month - Month in format 'YYYY-MM'
     * @param {number|null} churchId - Church ID or null for all churches
     * @returns {Promise} - Promise resolving to report data
     */
    async getReportData(pastorateId, userId, month, churchId = null) {
        try {
            console.log('🔄 Fetching offertory book data for pastorate:', pastorateId, 'month:', month, 'church:', churchId || 'All');

            // Verify user has access to this pastorate
            const userPastorates = await this.db.getUserPastorates(userId);
            const hasAccess = userPastorates.some(p => p.id === pastorateId);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this pastorate' };
            }

            // Get pastorate details
            const pastorate = await this.db.getPastorateById(pastorateId);
            if (!pastorate) {
                return { success: false, error: 'Pastorate not found' };
            }

            // Get church details if specific church is selected
            let church = null;
            if (churchId) {
                church = await this.getChurchById(churchId);
            }

            // Get all offering transactions for the month
            const offerings = await this.getOfferingTransactions(pastorateId, month, churchId);

            // Process offerings data
            const processedData = this.processOfferingsData(offerings);

            return {
                success: true,
                reportData: {
                    pastorate,
                    church,
                    month,
                    offerings: processedData.offerings,
                    offeringsByDate: processedData.offeringsByDate,
                    categoryTotals: processedData.categoryTotals,
                    grandTotal: processedData.grandTotal,
                    allCategories: processedData.allCategories
                }
            };
        } catch (error) {
            console.error('❌ Error fetching offertory book data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get church by ID
     */
    async getChurchById(churchId) {
        return new Promise((resolve) => {
            this.db.db.get(`
                SELECT * FROM churches WHERE id = ?
            `, [churchId], (err, row) => {
                if (err) {
                    console.error('Error fetching church:', err);
                    resolve(null);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Get offering transactions for a specific month and optional church
     */
    async getOfferingTransactions(pastorateId, month, churchId = null) {
        return new Promise((resolve) => {
            let query = `
                SELECT 
                    ot.*,
                    c.church_name
                FROM offering_transactions ot
                LEFT JOIN churches c ON ot.church_id = c.id
                WHERE ot.pastorate_id = ? 
                AND strftime('%Y-%m', ot.date) = ?
            `;
            
            const params = [pastorateId, month];
            
            if (churchId) {
                query += ' AND ot.church_id = ?';
                params.push(churchId);
            }
            
            query += ' ORDER BY ot.date ASC, c.church_name ASC, ot.id ASC';

            this.db.db.all(query, params, (err, rows) => {
                if (err) {
                    console.error('Error fetching offering transactions:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    /**
     * Process offerings data - group by date and aggregate by category
     */
    processOfferingsData(offerings) {
        // Define ALL 16 static offering categories with Tamil translations
        // These will ALWAYS be displayed in the PDF, regardless of data
        const allCategories = [
            { key: 'Rent', tamil: 'வாடகை' },
            { key: 'Church offertory', tamil: 'கோயில் காணிக்கை' },
            { key: 'Holy Communion offertory', tamil: 'பரி. நற்கருணை' },
            { key: 'Thanks offertory', tamil: 'ஸ்தோத்திர காணிக்கை' },
            { key: 'Miscellaneous offertory', tamil: 'பலவித காணிக்கை' },
            { key: 'Sangam - Sabai', tamil: 'சங்கம் - சபை' },
            { key: 'Sangam (CW/DW)', tamil: 'சங்கம் - ஊழியர்' },
            { key: 'Harvest Festival offertory', tamil: 'அறுப்பின் பண்டிகை' },
            { key: 'Marriage & Fees', tamil: 'கல்யாணம் மற்றும் பீஸ்' },
            { key: 'Baptism offertory', tamil: 'ஞானஸ்நானம்' },
            { key: 'TDCM', tamil: 'பாலியர் சங்கம்' },
            { key: 'IMS', tamil: 'இந்திய மிசனரி சங்கம்' },
            { key: 'House Visit offertory', tamil: 'வீட்டு வருகை காணிக்கை' },
            { key: 'Tithe offertory', tamil: 'தசமபாகம் காணிக்கை' },
            { key: 'Miscellaneous Collections', tamil: 'பலவித சேகரிப்பு' },
            { key: 'Trumphat Festival', tamil: 'ட்ரம்பட் பண்டிகை' }
        ];

        // Group offerings by date
        const offeringsByDate = {};
        const categoryTotals = {};

        // Initialize category totals for ALL categories
        allCategories.forEach(cat => {
            categoryTotals[cat.key] = 0;
        });

        offerings.forEach(offering => {
            const date = offering.date;
            const offeringType = offering.offering_type;
            const amount = parseFloat(offering.amount) || 0;

            // Initialize date entry if not exists
            if (!offeringsByDate[date]) {
                offeringsByDate[date] = {
                    date: date,
                    categories: {}
                };

                // Initialize ALL categories for this date with 0
                allCategories.forEach(cat => {
                    offeringsByDate[date].categories[cat.key] = 0;
                });
            }

            // Add amount to the appropriate category if it exists in our static list
            if (offeringsByDate[date].categories.hasOwnProperty(offeringType)) {
                offeringsByDate[date].categories[offeringType] += amount;
            }

            // Add to category totals if it exists in our static list
            if (categoryTotals.hasOwnProperty(offeringType)) {
                categoryTotals[offeringType] += amount;
            }
        });

        // Calculate grand total
        const grandTotal = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

        // Convert offeringsByDate to array and sort by date
        const offeringsByDateArray = Object.values(offeringsByDate).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        return {
            offerings: offerings,
            offeringsByDate: offeringsByDateArray,
            categoryTotals: categoryTotals,
            grandTotal: grandTotal,
            allCategories: allCategories
        };
    }

    /**
     * Get Tamil translation for offering type
     */
    getTamilTranslation(offeringType) {
        const translations = {
            'House Visit offertory': 'வீட்டு வருகை காணிக்கை',
            'Marriage offertory': 'திருமண காணிக்கை',
            'Miscellaneous Collections': 'பலவித சேகரிப்பு',
            'Miscellaneous Income': 'பலவித வருமானம்',
            'Receipts': 'ரசீதுகள்',
            'Tithe offertory': 'தசமபாகம் காணிக்கை',
            'Trumphat Festival': 'ட்ரம்பட் பண்டிகை'
        };

        return translations[offeringType] || offeringType;
    }
}

module.exports = OfferingsReportService;

