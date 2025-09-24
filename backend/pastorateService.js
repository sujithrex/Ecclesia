class PastorateService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    async createPastorate(pastorate_name, pastorate_short_name, userId) {
        try {
            // Validate input
            if (!pastorate_name || !pastorate_short_name) {
                return { success: false, error: 'Pastorate name and short name are required' };
            }

            // Check if names are already taken
            const existingPastorates = await this.db.getAllPastorates();
            const nameExists = existingPastorates.some(p => 
                p.pastorate_name.toLowerCase() === pastorate_name.toLowerCase()
            );
            const shortNameExists = existingPastorates.some(p => 
                p.pastorate_short_name.toLowerCase() === pastorate_short_name.toLowerCase()
            );

            if (nameExists) {
                return { success: false, error: 'A pastorate with this name already exists' };
            }

            if (shortNameExists) {
                return { success: false, error: 'A pastorate with this short name already exists' };
            }

            // Create the pastorate
            const result = await this.db.createPastorate(pastorate_name, pastorate_short_name);
            
            if (result.success) {
                // Auto-assign the creator to the new pastorate
                const assignResult = await this.db.assignUserToPastorate(userId, result.id);
                
                if (assignResult.success) {
                    // Set as the selected pastorate
                    await this.db.updateLastSelectedPastorate(userId, result.id);
                    
                    // Return the created pastorate details
                    const pastorate = await this.db.getPastorateById(result.id);
                    return {
                        success: true,
                        message: 'Pastorate created successfully',
                        pastorate: pastorate
                    };
                } else {
                    return { success: false, error: 'Failed to assign user to pastorate' };
                }
            } else {
                return { success: false, error: result.error || 'Failed to create pastorate' };
            }
        } catch (error) {
            console.error('Create pastorate error:', error);
            return { success: false, error: 'Failed to create pastorate' };
        }
    }

    async getUserPastorates(userId) {
        try {
            const pastorates = await this.db.getUserPastorates(userId);
            return {
                success: true,
                pastorates: pastorates
            };
        } catch (error) {
            console.error('Get user pastorates error:', error);
            return { success: false, error: 'Failed to get user pastorates' };
        }
    }

    async getLastSelectedPastorate(userId) {
        try {
            const pastorate = await this.db.getLastSelectedPastorate(userId);
            return {
                success: true,
                pastorate: pastorate || null
            };
        } catch (error) {
            console.error('Get last selected pastorate error:', error);
            return { success: false, error: 'Failed to get last selected pastorate' };
        }
    }

    async selectPastorate(userId, pastorateId) {
        try {
            // Verify user has access to this pastorate
            const userPastorates = await this.db.getUserPastorates(userId);
            const hasAccess = userPastorates.some(p => p.id === pastorateId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this pastorate' };
            }

            // Update the last selected pastorate
            const result = await this.db.updateLastSelectedPastorate(userId, pastorateId);
            
            if (result.success) {
                // Return the selected pastorate details
                const pastorate = await this.db.getPastorateById(pastorateId);
                return {
                    success: true,
                    message: 'Pastorate selected successfully',
                    pastorate: pastorate
                };
            } else {
                return { success: false, error: result.error || 'Failed to select pastorate' };
            }
        } catch (error) {
            console.error('Select pastorate error:', error);
            return { success: false, error: 'Failed to select pastorate' };
        }
    }

    async getAllPastorates() {
        try {
            const pastorates = await this.db.getAllPastorates();
            return {
                success: true,
                pastorates: pastorates
            };
        } catch (error) {
            console.error('Get all pastorates error:', error);
            return { success: false, error: 'Failed to get pastorates' };
        }
    }

    async assignUserToPastorate(userId, pastorateId) {
        try {
            // Verify pastorate exists
            const pastorate = await this.db.getPastorateById(pastorateId);
            if (!pastorate) {
                return { success: false, error: 'Pastorate not found' };
            }

            const result = await this.db.assignUserToPastorate(userId, pastorateId);
            
            if (result.success) {
                return {
                    success: true,
                    message: 'User assigned to pastorate successfully'
                };
            } else {
                return { success: false, error: result.error || 'Failed to assign user to pastorate' };
            }
        } catch (error) {
            console.error('Assign user to pastorate error:', error);
            return { success: false, error: 'Failed to assign user to pastorate' };
        }
    }

    async removeUserFromPastorate(userId, pastorateId) {
        try {
            const result = await this.db.removeUserFromPastorate(userId, pastorateId);
            
            if (result.success) {
                return {
                    success: true,
                    message: 'User removed from pastorate successfully'
                };
            } else {
                return { success: false, error: result.error || 'Failed to remove user from pastorate' };
            }
        } catch (error) {
            console.error('Remove user from pastorate error:', error);
            return { success: false, error: 'Failed to remove user from pastorate' };
        }
    }
}

module.exports = PastorateService;