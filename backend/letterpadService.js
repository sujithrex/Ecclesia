class LetterpadService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    async createLetterpad(letterpadData, userId) {
        try {
            // Verify user has access to this pastorate
            const userPastorates = await this.db.getUserPastorates(userId);
            const hasAccess = userPastorates.some(p => p.id === letterpadData.pastorate_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this pastorate' };
            }

            // Validate required fields
            const requiredFields = ['pastorate_id', 'letterpad_number', 'letter_date', 'content', 'rev_name', 'rev_designation'];
            for (const field of requiredFields) {
                if (!letterpadData[field] || !letterpadData[field].toString().trim()) {
                    return { 
                        success: false, 
                        error: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required` 
                    };
                }
            }

            // Add created_by to the data
            const dataWithUser = {
                ...letterpadData,
                created_by: userId
            };

            const result = await this.db.createLetterpad(dataWithUser);
            
            return {
                success: true,
                letterpadId: result.id,
                message: 'Letterpad created successfully'
            };
        } catch (error) {
            console.error('Create letterpad error:', error);
            return { success: false, error: 'Failed to create letterpad: ' + error.message };
        }
    }

    async getLetterpadsByPastorate(pastorateId, userId, page = 1, limit = 8) {
        try {
            // Verify user has access to this pastorate
            const userPastorates = await this.db.getUserPastorates(userId);
            const hasAccess = userPastorates.some(p => p.id === pastorateId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this pastorate' };
            }

            const offset = (page - 1) * limit;
            const letterpads = await this.db.getLetterpadsByPastorate(pastorateId, limit, offset);
            const totalCount = await this.db.getLetterpadCount(pastorateId);
            const totalPages = Math.ceil(totalCount / limit);

            return {
                success: true,
                letterpads: letterpads,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalCount: totalCount,
                    hasNext: page < totalPages,
                    hasPrevious: page > 1
                }
            };
        } catch (error) {
            console.error('Get letterpads error:', error);
            return { success: false, error: 'Failed to get letterpads' };
        }
    }

    async getLetterpadById(letterpadId, userId) {
        try {
            const letterpad = await this.db.getLetterpadById(letterpadId);
            
            if (!letterpad) {
                return { success: false, error: 'Letterpad not found' };
            }

            // Verify user has access to the pastorate this letterpad belongs to
            const userPastorates = await this.db.getUserPastorates(userId);
            const hasAccess = userPastorates.some(p => p.id === letterpad.pastorate_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this letterpad' };
            }

            return {
                success: true,
                letterpad: letterpad
            };
        } catch (error) {
            console.error('Get letterpad error:', error);
            return { success: false, error: 'Failed to get letterpad' };
        }
    }

    async updateLetterpad(letterpadId, letterpadData, userId) {
        try {
            // First verify the letterpad exists and user has access
            const existingLetterpad = await this.getLetterpadById(letterpadId, userId);
            if (!existingLetterpad.success) {
                return existingLetterpad;
            }

            // Validate required fields
            const requiredFields = ['letterpad_number', 'letter_date', 'content', 'rev_name', 'rev_designation'];
            for (const field of requiredFields) {
                if (!letterpadData[field] || !letterpadData[field].toString().trim()) {
                    return {
                        success: false,
                        error: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`
                    };
                }
            }

            // Check if letterpad_number is being changed and if new number already exists
            if (letterpadData.letterpad_number !== existingLetterpad.letterpad.letterpad_number) {
                const duplicate = await this.db.getLetterpadByNumber(
                    letterpadData.pastorate_id || existingLetterpad.letterpad.pastorate_id,
                    letterpadData.letterpad_number
                );
                if (duplicate) {
                    return {
                        success: false,
                        error: 'A letterpad with this number already exists in this pastorate'
                    };
                }
            }

            const result = await this.db.updateLetterpad(letterpadId, letterpadData);

            if (result.changes > 0) {
                return {
                    success: true,
                    message: 'Letterpad updated successfully'
                };
            } else {
                return { success: false, error: 'No changes made to letterpad' };
            }
        } catch (error) {
            console.error('Update letterpad error:', error);
            return { success: false, error: 'Failed to update letterpad: ' + error.message };
        }
    }

    async deleteLetterpad(letterpadId, userId) {
        try {
            // First verify the letterpad exists and user has access
            const existingLetterpad = await this.getLetterpadById(letterpadId, userId);
            if (!existingLetterpad.success) {
                return existingLetterpad;
            }

            const result = await this.db.deleteLetterpad(letterpadId);
            
            if (result.changes > 0) {
                return {
                    success: true,
                    message: 'Letterpad deleted successfully'
                };
            } else {
                return { success: false, error: 'Letterpad not found' };
            }
        } catch (error) {
            console.error('Delete letterpad error:', error);
            return { success: false, error: 'Failed to delete letterpad' };
        }
    }

    async getNextLetterpadNumber(pastorateId, userId) {
        try {
            // Verify user has access to this pastorate
            const userPastorates = await this.db.getUserPastorates(userId);
            const hasAccess = userPastorates.some(p => p.id === pastorateId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this pastorate' };
            }

            const letterpadNumber = await this.db.getNextLetterpadNumber(pastorateId);
            
            return {
                success: true,
                letterpadNumber: letterpadNumber
            };
        } catch (error) {
            console.error('Get next letterpad number error:', error);
            return { success: false, error: 'Failed to get next letterpad number' };
        }
    }

    async getLetterpadDataForPDF(letterpadId, userId) {
        try {
            const letterpadResult = await this.getLetterpadById(letterpadId, userId);
            if (!letterpadResult.success) {
                return letterpadResult;
            }

            const letterpad = letterpadResult.letterpad;
            
            // Get pastorate information
            const pastorate = await this.db.getPastorateById(letterpad.pastorate_id);
            if (!pastorate) {
                return { success: false, error: 'Pastorate not found' };
            }

            // Get pastorate settings for additional info
            const pastorateSettings = await this.db.getPastorateSettings(letterpad.pastorate_id);

            return {
                success: true,
                letterpad: letterpad,
                pastorate: pastorate,
                pastorateSettings: pastorateSettings
            };
        } catch (error) {
            console.error('Get letterpad data for PDF error:', error);
            return { success: false, error: 'Failed to get letterpad data for PDF' };
        }
    }

    // Letterpad Settings methods
    async getLetterpadSettings(pastorateId, userId) {
        try {
            // Verify user has access to this pastorate
            const userPastorates = await this.db.getUserPastorates(userId);
            const hasAccess = userPastorates.some(p => p.id === pastorateId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this pastorate' };
            }

            const settings = await this.db.getLetterpadSettings(pastorateId);
            
            return {
                success: true,
                settings: settings
            };
        } catch (error) {
            console.error('Get letterpad settings error:', error);
            return { success: false, error: 'Failed to get letterpad settings' };
        }
    }

    async updateLetterpadSettings(pastorateId, settingsData, userId) {
        try {
            // Verify user has access to this pastorate
            const userPastorates = await this.db.getUserPastorates(userId);
            const hasAccess = userPastorates.some(p => p.id === pastorateId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this pastorate' };
            }

            const result = await this.db.upsertLetterpadSettings(pastorateId, settingsData);
            
            return {
                success: true,
                message: 'Letterpad settings updated successfully'
            };
        } catch (error) {
            console.error('Update letterpad settings error:', error);
            return { success: false, error: 'Failed to update letterpad settings' };
        }
    }
}

module.exports = LetterpadService;