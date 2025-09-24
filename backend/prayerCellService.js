class PrayerCellService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    async createPrayerCell(churchId, prayer_cell_name, prayer_cell_identity, userId) {
        try {
            // Validate input
            if (!prayer_cell_name || !prayer_cell_identity) {
                return { success: false, error: 'Prayer cell name and identity are required' };
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
            const existingPrayerCells = await this.db.getPrayerCellsByChurch(churchId);
            const nameExists = existingPrayerCells.some(p => 
                p.prayer_cell_name.toLowerCase() === prayer_cell_name.toLowerCase()
            );
            const identityExists = existingPrayerCells.some(p => 
                p.prayer_cell_identity.toLowerCase() === prayer_cell_identity.toLowerCase()
            );

            if (nameExists) {
                return { success: false, error: 'A prayer cell with this name already exists in this church' };
            }

            if (identityExists) {
                return { success: false, error: 'A prayer cell with this identity already exists in this church' };
            }

            // Create the prayer cell
            const result = await this.db.createPrayerCell(churchId, prayer_cell_name, prayer_cell_identity);
            
            if (result.success) {
                // Return the created prayer cell details
                const prayerCell = await this.db.getPrayerCellById(result.id);
                return {
                    success: true,
                    message: 'Prayer cell created successfully',
                    prayerCell: prayerCell
                };
            } else {
                return { success: false, error: result.error || 'Failed to create prayer cell' };
            }
        } catch (error) {
            console.error('Create prayer cell error:', error);
            return { success: false, error: 'Failed to create prayer cell' };
        }
    }

    async getPrayerCellsByChurch(churchId, userId) {
        try {
            // Verify user has access to this church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const prayerCells = await this.db.getPrayerCellsByChurch(churchId);
            return {
                success: true,
                prayerCells: prayerCells
            };
        } catch (error) {
            console.error('Get prayer cells by church error:', error);
            return { success: false, error: 'Failed to get prayer cells' };
        }
    }

    async updatePrayerCell(prayerCellId, prayer_cell_name, prayer_cell_identity, userId) {
        try {
            // Validate input
            if (!prayer_cell_name || !prayer_cell_identity) {
                return { success: false, error: 'Prayer cell name and identity are required' };
            }

            // Get the prayer cell to find its church
            const prayerCell = await this.db.getPrayerCellById(prayerCellId);
            if (!prayerCell) {
                return { success: false, error: 'Prayer cell not found' };
            }

            // Verify user has access to this church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === prayerCell.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Check if new names conflict with existing prayer cells in the same church (excluding current one)
            const existingPrayerCells = await this.db.getPrayerCellsByChurch(prayerCell.church_id);
            const nameExists = existingPrayerCells.some(p =>
                p.id !== prayerCellId && p.prayer_cell_name.toLowerCase() === prayer_cell_name.toLowerCase()
            );
            const identityExists = existingPrayerCells.some(p =>
                p.id !== prayerCellId && p.prayer_cell_identity.toLowerCase() === prayer_cell_identity.toLowerCase()
            );

            if (nameExists) {
                return { success: false, error: 'A prayer cell with this name already exists in this church' };
            }

            if (identityExists) {
                return { success: false, error: 'A prayer cell with this identity already exists in this church' };
            }

            // Update the prayer cell
            const result = await this.db.updatePrayerCell(prayerCellId, prayer_cell_name, prayer_cell_identity);
            
            if (result.success) {
                // Return the updated prayer cell details
                const updatedPrayerCell = await this.db.getPrayerCellById(prayerCellId);
                return {
                    success: true,
                    message: 'Prayer cell updated successfully',
                    prayerCell: updatedPrayerCell
                };
            } else {
                return { success: false, error: result.error || 'Failed to update prayer cell' };
            }
        } catch (error) {
            console.error('Update prayer cell error:', error);
            return { success: false, error: 'Failed to update prayer cell' };
        }
    }

    async deletePrayerCell(prayerCellId, userId) {
        try {
            // Get prayer cell info before deletion for verification and confirmation
            const prayerCell = await this.db.getPrayerCellById(prayerCellId);
            if (!prayerCell) {
                return { success: false, error: 'Prayer cell not found' };
            }

            // Verify user has access to this church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === prayerCell.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Delete the prayer cell
            const result = await this.db.deletePrayerCell(prayerCellId);
            
            if (result.success) {
                return {
                    success: true,
                    message: `Prayer cell "${prayerCell.prayer_cell_name}" deleted successfully`
                };
            } else {
                return { success: false, error: result.error || 'Failed to delete prayer cell' };
            }
        } catch (error) {
            console.error('Delete prayer cell error:', error);
            return { success: false, error: 'Failed to delete prayer cell' };
        }
    }
}

module.exports = PrayerCellService;