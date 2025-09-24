class AreaService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    async createArea(churchId, area_name, area_identity, userId) {
        try {
            // Validate input
            if (!area_name || !area_identity) {
                return { success: false, error: 'Area name and identity are required' };
            }

            if (!churchId) {
                return { success: false, error: 'Church ID is required' };
            }

            // Verify church exists and user has access
            const church = await this.db.getChurchById(churchId);
            if (!church) {
                return { success: false, error: 'Church not found' };
            }

            // Verify user has access to this church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Check if names are already taken within the same church
            const existingAreas = await this.db.getAreasByChurch(churchId);
            const nameExists = existingAreas.some(a => 
                a.area_name.toLowerCase() === area_name.toLowerCase()
            );
            const identityExists = existingAreas.some(a => 
                a.area_identity.toLowerCase() === area_identity.toLowerCase()
            );

            if (nameExists) {
                return { success: false, error: 'An area with this name already exists in this church' };
            }

            if (identityExists) {
                return { success: false, error: 'An area with this identity already exists in this church' };
            }

            // Create the area
            const result = await this.db.createArea(churchId, area_name, area_identity);
            
            if (result.success) {
                // Return the created area details
                const area = await this.db.getAreaById(result.id);
                return {
                    success: true,
                    message: 'Area created successfully',
                    area: area
                };
            } else {
                return { success: false, error: result.error || 'Failed to create area' };
            }
        } catch (error) {
            console.error('Create area error:', error);
            return { success: false, error: 'Failed to create area' };
        }
    }

    async getAreasByChurch(churchId, userId) {
        try {
            // Verify user has access to this church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const areas = await this.db.getAreasByChurch(churchId);
            return {
                success: true,
                areas: areas
            };
        } catch (error) {
            console.error('Get areas by church error:', error);
            return { success: false, error: 'Failed to get areas' };
        }
    }

    async updateArea(areaId, area_name, area_identity, userId) {
        try {
            // Validate input
            if (!area_name || !area_identity) {
                return { success: false, error: 'Area name and identity are required' };
            }

            // Get the area to find its church
            const area = await this.db.getAreaById(areaId);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to this church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Check if new names conflict with existing areas in the same church (excluding current one)
            const existingAreas = await this.db.getAreasByChurch(area.church_id);
            const nameExists = existingAreas.some(a =>
                a.id !== areaId && a.area_name.toLowerCase() === area_name.toLowerCase()
            );
            const identityExists = existingAreas.some(a =>
                a.id !== areaId && a.area_identity.toLowerCase() === area_identity.toLowerCase()
            );

            if (nameExists) {
                return { success: false, error: 'An area with this name already exists in this church' };
            }

            if (identityExists) {
                return { success: false, error: 'An area with this identity already exists in this church' };
            }

            // Update the area
            const result = await this.db.updateArea(areaId, area_name, area_identity);
            
            if (result.success) {
                // Return the updated area details
                const updatedArea = await this.db.getAreaById(areaId);
                return {
                    success: true,
                    message: 'Area updated successfully',
                    area: updatedArea
                };
            } else {
                return { success: false, error: result.error || 'Failed to update area' };
            }
        } catch (error) {
            console.error('Update area error:', error);
            return { success: false, error: 'Failed to update area' };
        }
    }

    async deleteArea(areaId, userId) {
        try {
            // Get area info before deletion for verification and confirmation
            const area = await this.db.getAreaById(areaId);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to this church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Delete the area
            const result = await this.db.deleteArea(areaId);
            
            if (result.success) {
                return {
                    success: true,
                    message: `Area "${area.area_name}" deleted successfully`
                };
            } else {
                return { success: false, error: result.error || 'Failed to delete area' };
            }
        } catch (error) {
            console.error('Delete area error:', error);
            return { success: false, error: 'Failed to delete area' };
        }
    }
}

module.exports = AreaService;