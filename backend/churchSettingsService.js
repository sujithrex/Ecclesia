class ChurchSettingsService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    async getChurchSettings(churchId, userId) {
        try {
            // Verify user has access to this church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Get existing settings or return default values
            let settings = await this.db.getChurchSettings(churchId);
            
            if (!settings) {
                // Return default settings based on church data
                settings = await this.db.getDefaultChurchSettings(churchId);
                if (!settings) {
                    return { success: false, error: 'Church not found' };
                }
            }

            return {
                success: true,
                settings: settings
            };
        } catch (error) {
            console.error('Get church settings error:', error);
            return { success: false, error: 'Failed to get church settings' };
        }
    }

    async saveChurchSettings(churchId, settingsData, userId) {
        try {
            // Verify user has access to this church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Validate required fields
            const requiredFields = [
                'church_name_english',
                'village_name_english'
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
            const existingSettings = await this.db.getChurchSettings(churchId);
            let result;

            if (existingSettings) {
                // Update existing settings
                result = await this.db.updateChurchSettings(churchId, settingsData);
            } else {
                // Create new settings
                result = await this.db.createChurchSettings(churchId, settingsData);
            }

            if (result.success) {
                // Get the updated settings to return
                const updatedSettings = await this.db.getChurchSettings(churchId);
                return {
                    success: true,
                    message: 'Church settings saved successfully',
                    settings: updatedSettings
                };
            } else {
                return { success: false, error: result.error || 'Failed to save church settings' };
            }
        } catch (error) {
            console.error('Save church settings error:', error);
            return { success: false, error: 'Failed to save church settings' };
        }
    }

    async getDefaultSettings(churchId, userId) {
        try {
            // Verify user has access to this church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const defaultSettings = await this.db.getDefaultChurchSettings(churchId);
            
            if (!defaultSettings) {
                return { success: false, error: 'Church not found' };
            }

            return {
                success: true,
                settings: defaultSettings
            };
        } catch (error) {
            console.error('Get default church settings error:', error);
            return { success: false, error: 'Failed to get default settings' };
        }
    }
}

module.exports = ChurchSettingsService;