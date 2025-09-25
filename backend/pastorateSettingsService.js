class PastorateSettingsService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    async getPastorateSettings(pastorateId, userId) {
        try {
            // Verify user has access to this pastorate
            const userPastorates = await this.db.getUserPastorates(userId);
            const hasAccess = userPastorates.some(p => p.id === pastorateId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this pastorate' };
            }

            // Get existing settings or return default values
            let settings = await this.db.getPastorateSettings(pastorateId);
            
            if (!settings) {
                // Return default settings based on pastorate data
                settings = await this.db.getDefaultPastorateSettings(pastorateId);
                if (!settings) {
                    return { success: false, error: 'Pastorate not found' };
                }
            }

            return {
                success: true,
                settings: settings
            };
        } catch (error) {
            console.error('Get pastorate settings error:', error);
            return { success: false, error: 'Failed to get pastorate settings' };
        }
    }

    async savePastorateSettings(pastorateId, settingsData, userId) {
        try {
            // Verify user has access to this pastorate
            const userPastorates = await this.db.getUserPastorates(userId);
            const hasAccess = userPastorates.some(p => p.id === pastorateId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this pastorate' };
            }

            // Validate required fields
            const requiredFields = [
                'pastorate_name_english',
                'diocese_name_english',
                'church_name_english'
            ];

            for (const field of requiredFields) {
                if (!settingsData[field] || !settingsData[field].trim()) {
                    return { 
                        success: false, 
                        error: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required` 
                    };
                }
            }

            // Validate email format if provided
            if (settingsData.email_address && settingsData.email_address.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(settingsData.email_address.trim())) {
                    return { success: false, error: 'Please enter a valid email address' };
                }
            }

            // Validate phone number if provided
            if (settingsData.phone_number && settingsData.phone_number.trim()) {
                const phoneRegex = /^[0-9\s\-\+\(\)]+$/;
                if (!phoneRegex.test(settingsData.phone_number.trim())) {
                    return { success: false, error: 'Please enter a valid phone number' };
                }
            }

            // Check if settings already exist
            const existingSettings = await this.db.getPastorateSettings(pastorateId);
            let result;

            if (existingSettings) {
                // Update existing settings
                result = await this.db.updatePastorateSettings(pastorateId, settingsData);
            } else {
                // Create new settings
                result = await this.db.createPastorateSettings(pastorateId, settingsData);
            }

            if (result.success) {
                // Get the updated settings to return
                const updatedSettings = await this.db.getPastorateSettings(pastorateId);
                return {
                    success: true,
                    message: 'Pastorate settings saved successfully',
                    settings: updatedSettings
                };
            } else {
                return { success: false, error: result.error || 'Failed to save pastorate settings' };
            }
        } catch (error) {
            console.error('Save pastorate settings error:', error);
            return { success: false, error: 'Failed to save pastorate settings' };
        }
    }

    async getDefaultSettings(pastorateId, userId) {
        try {
            // Verify user has access to this pastorate
            const userPastorates = await this.db.getUserPastorates(userId);
            const hasAccess = userPastorates.some(p => p.id === pastorateId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this pastorate' };
            }

            const defaultSettings = await this.db.getDefaultPastorateSettings(pastorateId);
            
            if (!defaultSettings) {
                return { success: false, error: 'Pastorate not found' };
            }

            return {
                success: true,
                settings: defaultSettings
            };
        } catch (error) {
            console.error('Get default pastorate settings error:', error);
            return { success: false, error: 'Failed to get default settings' };
        }
    }
}

module.exports = PastorateSettingsService;