class FamilyService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    async createFamily(areaId, familyData, userId) {
        try {
            // Validate required fields
            const { respect, family_name, family_phone } = familyData;
            
            if (!respect || !family_name || !family_phone) {
                return { success: false, error: 'Respect, family name, and phone number are required' };
            }

            if (!areaId) {
                return { success: false, error: 'Area ID is required' };
            }

            // Validate phone number
            if (!family_phone.trim()) {
                return { success: false, error: 'Phone number is required' };
            }

            // Validate respect field
            const validRespects = ['mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop'];
            if (!validRespects.includes(respect.toLowerCase())) {
                return { success: false, error: 'Invalid respect value' };
            }

            // Get area info and verify user access
            const area = await this.db.getAreaById(areaId);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to the church that owns this area
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this area' };
            }

            // Generate auto-numbers if not provided
            let { family_number, layout_number } = familyData;
            
            if (!family_number) {
                family_number = await this.db.getNextFamilyNumber(areaId);
            } else {
                // Validate 3-digit format if provided
                if (!/^\d{3}$/.test(family_number)) {
                    return { success: false, error: 'Family number must be a 3-digit number' };
                }
                // Check for duplicate family number in the same area
                const existingFamily = await this.db.getFamilyByAreaAndNumber(areaId, family_number);
                if (existingFamily) {
                    return { success: false, error: 'A family with this number already exists in this area' };
                }
            }
            
            if (!layout_number) {
                layout_number = await this.db.getNextLayoutNumber(areaId);
            } else {
                // Validate 3-digit format if provided
                if (!/^\d{3}$/.test(layout_number)) {
                    return { success: false, error: 'Layout number must be a 3-digit number' };
                }
                // Check for duplicate layout number in the same area
                const existingLayout = await this.db.getFamilyByAreaAndLayoutNumber(areaId, layout_number);
                if (existingLayout) {
                    return { success: false, error: 'A family with this layout number already exists in this area' };
                }
            }

            // If prayer_cell_id is provided, validate it exists and belongs to the same church
            if (familyData.prayer_cell_id) {
                const prayerCell = await this.db.getPrayerCellById(familyData.prayer_cell_id);
                if (!prayerCell || prayerCell.church_id !== area.church_id) {
                    return { success: false, error: 'Invalid prayer cell selection' };
                }
            }

            // Create the family
            const result = await this.db.createFamily(areaId, {
                ...familyData,
                family_number,
                layout_number,
                respect: respect.toLowerCase()
            });
            
            if (result.success) {
                // Return the created family details
                const family = await this.db.getFamilyById(result.id);
                return {
                    success: true,
                    message: 'Family created successfully',
                    family: family
                };
            } else {
                return { success: false, error: result.error || 'Failed to create family' };
            }
        } catch (error) {
            console.error('Create family error:', error);
            return { success: false, error: 'Failed to create family' };
        }
    }

    async getFamiliesByArea(areaId, userId) {
        try {
            // Get area info and verify user access
            const area = await this.db.getAreaById(areaId);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to the church that owns this area
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this area' };
            }

            const families = await this.db.getFamiliesByArea(areaId);
            return {
                success: true,
                families: families
            };
        } catch (error) {
            console.error('Get families by area error:', error);
            return { success: false, error: 'Failed to get families' };
        }
    }

    async updateFamily(familyId, familyData, userId) {
        try {
            // Validate required fields
            const { family_number, respect, family_name, layout_number, family_phone } = familyData;
            
            if (!family_number || !respect || !family_name || !layout_number || !family_phone) {
                return { success: false, error: 'Family number, respect, family name, layout number, and phone number are required' };
            }

            // Validate phone number
            if (!family_phone.trim()) {
                return { success: false, error: 'Phone number is required' };
            }

            // Validate 3-digit number format for family_number and layout_number
            if (!/^\d{3}$/.test(family_number)) {
                return { success: false, error: 'Family number must be a 3-digit number' };
            }

            if (!/^\d{3}$/.test(layout_number)) {
                return { success: false, error: 'Layout number must be a 3-digit number' };
            }

            // Validate respect field
            const validRespects = ['mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop'];
            if (!validRespects.includes(respect.toLowerCase())) {
                return { success: false, error: 'Invalid respect value' };
            }

            // Get the family to find its area
            const family = await this.db.getFamilyById(familyId);
            if (!family) {
                return { success: false, error: 'Family not found' };
            }

            // Get area info and verify user access
            const area = await this.db.getAreaById(family.area_id);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to the church that owns this area
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this family' };
            }

            // Check for duplicate family number in the same area (excluding current family)
            const existingFamily = await this.db.getFamilyByAreaAndNumber(family.area_id, family_number);
            if (existingFamily && existingFamily.id !== familyId) {
                return { success: false, error: 'A family with this number already exists in this area' };
            }

            // Check for duplicate layout number in the same area (excluding current family)
            const existingLayout = await this.db.getFamilyByAreaAndLayoutNumber(family.area_id, layout_number);
            if (existingLayout && existingLayout.id !== familyId) {
                return { success: false, error: 'A family with this layout number already exists in this area' };
            }

            // If prayer_cell_id is provided, validate it exists and belongs to the same church
            if (familyData.prayer_cell_id) {
                const prayerCell = await this.db.getPrayerCellById(familyData.prayer_cell_id);
                if (!prayerCell || prayerCell.church_id !== area.church_id) {
                    return { success: false, error: 'Invalid prayer cell selection' };
                }
            }

            // Update the family
            const result = await this.db.updateFamily(familyId, {
                ...familyData,
                respect: respect.toLowerCase()
            });
            
            if (result.success) {
                // Return the updated family details
                const updatedFamily = await this.db.getFamilyById(familyId);
                return {
                    success: true,
                    message: 'Family updated successfully',
                    family: updatedFamily
                };
            } else {
                return { success: false, error: result.error || 'Failed to update family' };
            }
        } catch (error) {
            console.error('Update family error:', error);
            return { success: false, error: 'Failed to update family' };
        }
    }

    async deleteFamily(familyId, userId) {
        try {
            // Get family info before deletion for verification and confirmation
            const family = await this.db.getFamilyById(familyId);
            if (!family) {
                return { success: false, error: 'Family not found' };
            }

            // Get area info and verify user access
            const area = await this.db.getAreaById(family.area_id);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to the church that owns this area
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this family' };
            }

            // Delete the family
            const result = await this.db.deleteFamily(familyId);
            
            if (result.success) {
                return {
                    success: true,
                    message: `Family "${family.respect}. ${family.family_name}" deleted successfully`
                };
            } else {
                return { success: false, error: result.error || 'Failed to delete family' };
            }
        } catch (error) {
            console.error('Delete family error:', error);
            return { success: false, error: 'Failed to delete family' };
        }
    }

    async getAutoNumbers(areaId, userId) {
        try {
            // Get area info and verify user access
            const area = await this.db.getAreaById(areaId);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to the church that owns this area
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this area' };
            }

            const familyNumber = await this.db.getNextFamilyNumber(areaId);
            const layoutNumber = await this.db.getNextLayoutNumber(areaId);

            return {
                success: true,
                familyNumber,
                layoutNumber
            };
        } catch (error) {
            console.error('Get auto numbers error:', error);
            return { success: false, error: 'Failed to get auto numbers' };
        }
    }

    async getFamilyById(familyId, userId) {
        try {
            // Get the family
            const family = await this.db.getFamilyById(familyId);
            if (!family) {
                return { success: false, error: 'Family not found' };
            }

            // Get area info and verify user access
            const area = await this.db.getAreaById(family.area_id);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to the church that owns this area
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this family' };
            }

            return {
                success: true,
                family: family
            };
        } catch (error) {
            console.error('Get family by ID error:', error);
            return { success: false, error: 'Failed to get family' };
        }
    }
}

module.exports = FamilyService;