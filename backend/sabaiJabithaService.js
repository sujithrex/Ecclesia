class SabaiJabithaService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    async getCongregationData(churchId, userId, areaId = null) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Get the main congregation data with all joins
            let query = `
                SELECT 
                    -- Church Info
                    c.church_name,
                    cs.church_name_tamil,
                    cs.village_name_tamil,
                    
                    -- Area Info
                    a.id as area_id,
                    a.area_name,
                    a.area_identity,
                    
                    -- Family Info
                    f.id as family_id,
                    f.family_number,
                    f.layout_number,
                    f.respect as family_respect,
                    f.family_name,
                    f.family_address,
                    f.family_phone,
                    f.notes as family_notes,
                    
                    -- Member Info
                    m.id as member_id,
                    m.member_number,
                    m.respect as member_respect,
                    m.name as member_name,
                    m.relation,
                    m.sex,
                    m.age,
                    m.aadhar_number,
                    m.is_baptised,
                    m.is_confirmed,
                    m.is_married,
                    m.is_alive,
                    m.mobile,
                    m.occupation
                    
                FROM churches c
                LEFT JOIN church_settings cs ON c.id = cs.church_id
                JOIN areas a ON c.id = a.church_id
                JOIN families f ON a.id = f.area_id
                JOIN members m ON f.id = m.family_id
                WHERE c.id = ? 
                  AND m.is_alive = 'alive'
            `;

            let params = [churchId];

            // Add area filter if specified
            if (areaId) {
                query += ' AND a.id = ?';
                params.push(areaId);
            }

            query += ' ORDER BY a.area_identity, f.family_number, m.member_number';

            const rawData = await new Promise((resolve, reject) => {
                this.db.db.all(query, params, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows || []);
                    }
                });
            });

            // Process the raw data into grouped format
            const processedData = this.processRawData(rawData);

            return {
                success: true,
                data: processedData,
                rawData: rawData // For debugging
            };

        } catch (error) {
            console.error('Get congregation data error:', error);
            return { success: false, error: 'Failed to get congregation data' };
        }
    }

    processRawData(rawData) {
        const familiesMap = new Map();
        let churchInfo = null;
        
        // Counters for serial numbers
        let maleCounter = 0;
        let femaleCounter = 0;
        let childCounter = 0;

        rawData.forEach(row => {
            // Store church info from first row
            if (!churchInfo) {
                churchInfo = {
                    church_name: row.church_name,
                    church_name_tamil: row.church_name_tamil,
                    village_name_tamil: row.village_name_tamil
                };
            }

            const familyKey = `${row.area_id}-${row.family_id}`;
            
            if (!familiesMap.has(familyKey)) {
                familiesMap.set(familyKey, {
                    family: {
                        id: row.family_id,
                        family_number: row.family_number,
                        layout_number: row.layout_number,
                        respect: this.capitalizeRespect(row.family_respect),
                        family_name: row.family_name,
                        family_address: row.family_address,
                        family_phone: row.family_phone,
                        notes: row.family_notes,
                        area_id: row.area_id,
                        // Combined family number = area_identity + family_number
                        combined_family_number: row.area_identity + row.family_number
                    },
                    area: {
                        id: row.area_id,
                        area_name: row.area_name,
                        area_identity: row.area_identity
                    },
                    members: []
                });
            }
            
            // Determine category and serial number
            const age = row.age || 0;
            let category, serialNumber;
            
            if (age <= 15) {
                category = 'பி'; // Child
                serialNumber = ++childCounter;
            } else if (row.sex === 'male') {
                category = 'ஆ'; // Male
                serialNumber = ++maleCounter;
            } else {
                category = 'பெ'; // Female
                serialNumber = ++femaleCounter;
            }
            
            familiesMap.get(familyKey).members.push({
                id: row.member_id,
                member_number: row.member_number,
                respect: this.capitalizeRespect(row.member_respect),
                name: row.member_name,
                relation: row.relation,
                sex: row.sex,
                age: row.age,
                aadhar_number: row.aadhar_number,
                is_baptised: row.is_baptised,
                is_confirmed: row.is_confirmed,
                is_married: row.is_married,
                mobile: row.mobile,
                occupation: row.occupation,
                // New computed fields
                category: category,
                serial_number: serialNumber
            });
        });

        return {
            church_info: churchInfo,
            families: Array.from(familiesMap.values()),
            statistics: {
                total_families: familiesMap.size,
                total_members: rawData.length,
                baptised_members: rawData.filter(r => r.is_baptised === 'yes').length,
                confirmed_members: rawData.filter(r => r.is_confirmed === 'yes').length,
                male_count: maleCounter,
                female_count: femaleCounter,
                child_count: childCounter
            }
        };
    }

    // Helper method to capitalize respect titles
    capitalizeRespect(respect) {
        if (!respect) return '';
        return respect.charAt(0).toUpperCase() + respect.slice(1).toLowerCase();
    }

    async generateSabaiJabithaPDF(churchId, userId, options = {}) {
        try {
            // Get congregation data
            const result = await this.getCongregationData(churchId, userId, options.areaId);
            
            if (!result.success) {
                return result;
            }

            const { church_info, families } = result.data;
            const reportYear = options.year || new Date().getFullYear();

            // TODO: Implement PDF generation using the template system
            // This will use the sabai_jabitha.html template structure
            // but with dynamic data from the database

            console.log('PDF Generation Data:', {
                church: church_info,
                families_count: families.length,
                total_members: families.reduce((sum, f) => sum + f.members.length, 0),
                year: reportYear
            });

            return {
                success: true,
                message: 'PDF generation ready - template system needed',
                data: result.data
            };

        } catch (error) {
            console.error('Generate Sabai Jabitha PDF error:', error);
            return { success: false, error: 'Failed to generate PDF' };
        }
    }
}

module.exports = SabaiJabithaService;