class ChurchService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    async createChurch(pastorateId, church_name, church_short_name, userId) {
        try {
            // Validate input
            if (!church_name || !church_short_name) {
                return { success: false, error: 'Church name and short name are required' };
            }

            if (!pastorateId) {
                return { success: false, error: 'Pastorate ID is required' };
            }

            // Verify pastorate exists
            const pastorate = await this.db.getPastorateById(pastorateId);
            if (!pastorate) {
                return { success: false, error: 'Pastorate not found' };
            }

            // Check if names are already taken within the same pastorate
            const existingChurches = await this.db.getChurchesByPastorate(pastorateId);
            const nameExists = existingChurches.some(c => 
                c.church_name.toLowerCase() === church_name.toLowerCase()
            );
            const shortNameExists = existingChurches.some(c => 
                c.church_short_name.toLowerCase() === church_short_name.toLowerCase()
            );

            if (nameExists) {
                return { success: false, error: 'A church with this name already exists in this pastorate' };
            }

            if (shortNameExists) {
                return { success: false, error: 'A church with this short name already exists in this pastorate' };
            }

            // Create the church
            const result = await this.db.createChurch(pastorateId, church_name, church_short_name);
            
            if (result.success) {
                // Auto-assign the creator to the new church
                const assignResult = await this.db.assignUserToChurch(userId, result.id);
                
                if (assignResult.success) {
                    // Set as the selected church
                    await this.db.updateLastSelectedChurch(userId, result.id);
                    
                    // Return the created church details
                    const church = await this.db.getChurchById(result.id);
                    return {
                        success: true,
                        message: 'Church created successfully',
                        church: church
                    };
                } else {
                    return { success: false, error: 'Failed to assign user to church' };
                }
            } else {
                return { success: false, error: result.error || 'Failed to create church' };
            }
        } catch (error) {
            console.error('Create church error:', error);
            return { success: false, error: 'Failed to create church' };
        }
    }

    async getUserChurches(userId) {
        try {
            const churches = await this.db.getUserChurches(userId);
            return {
                success: true,
                churches: churches
            };
        } catch (error) {
            console.error('Get user churches error:', error);
            return { success: false, error: 'Failed to get user churches' };
        }
    }

    async getUserChurchesByPastorate(userId, pastorateId) {
        try {
            const churches = await this.db.getUserChurchesByPastorate(userId, pastorateId);
            return {
                success: true,
                churches: churches
            };
        } catch (error) {
            console.error('Get user churches by pastorate error:', error);
            return { success: false, error: 'Failed to get user churches for pastorate' };
        }
    }

    async getLastSelectedChurch(userId, pastorateId = null) {
        try {
            const church = await this.db.getLastSelectedChurch(userId, pastorateId);
            return {
                success: true,
                church: church || null
            };
        } catch (error) {
            console.error('Get last selected church error:', error);
            return { success: false, error: 'Failed to get last selected church' };
        }
    }

    async selectChurch(userId, churchId) {
        try {
            // Verify user has access to this church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Update the last selected church
            const result = await this.db.updateLastSelectedChurch(userId, churchId);
            
            if (result.success) {
                // Return the selected church details
                const church = await this.db.getChurchById(churchId);
                return {
                    success: true,
                    message: 'Church selected successfully',
                    church: church
                };
            } else {
                return { success: false, error: result.error || 'Failed to select church' };
            }
        } catch (error) {
            console.error('Select church error:', error);
            return { success: false, error: 'Failed to select church' };
        }
    }

    async getAllChurches() {
        try {
            const churches = await this.db.getAllChurches();
            return {
                success: true,
                churches: churches
            };
        } catch (error) {
            console.error('Get all churches error:', error);
            return { success: false, error: 'Failed to get churches' };
        }
    }

    async getChurchesByPastorate(pastorateId) {
        try {
            const churches = await this.db.getChurchesByPastorate(pastorateId);
            return {
                success: true,
                churches: churches
            };
        } catch (error) {
            console.error('Get churches by pastorate error:', error);
            return { success: false, error: 'Failed to get churches for pastorate' };
        }
    }

    async assignUserToChurch(userId, churchId) {
        try {
            // Verify church exists
            const church = await this.db.getChurchById(churchId);
            if (!church) {
                return { success: false, error: 'Church not found' };
            }

            const result = await this.db.assignUserToChurch(userId, churchId);
            
            if (result.success) {
                return {
                    success: true,
                    message: 'User assigned to church successfully'
                };
            } else {
                return { success: false, error: result.error || 'Failed to assign user to church' };
            }
        } catch (error) {
            console.error('Assign user to church error:', error);
            return { success: false, error: 'Failed to assign user to church' };
        }
    }

    async removeUserFromChurch(userId, churchId) {
        try {
            const result = await this.db.removeUserFromChurch(userId, churchId);
            
            if (result.success) {
                return {
                    success: true,
                    message: 'User removed from church successfully'
                };
            } else {
                return { success: false, error: result.error || 'Failed to remove user from church' };
            }
        } catch (error) {
            console.error('Remove user from church error:', error);
            return { success: false, error: 'Failed to remove user from church' };
        }
    }

    async updateChurch(churchId, church_name, church_short_name, userId) {
        try {
            // Validate input
            if (!church_name || !church_short_name) {
                return { success: false, error: 'Church name and short name are required' };
            }

            // Verify user has access to this church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Get the church to find its pastorate
            const church = await this.db.getChurchById(churchId);
            if (!church) {
                return { success: false, error: 'Church not found' };
            }

            // Check if new names conflict with existing churches in the same pastorate (excluding current one)
            const existingChurches = await this.db.getChurchesByPastorate(church.pastorate_id);
            const nameExists = existingChurches.some(c =>
                c.id !== churchId && c.church_name.toLowerCase() === church_name.toLowerCase()
            );
            const shortNameExists = existingChurches.some(c =>
                c.id !== churchId && c.church_short_name.toLowerCase() === church_short_name.toLowerCase()
            );

            if (nameExists) {
                return { success: false, error: 'A church with this name already exists in this pastorate' };
            }

            if (shortNameExists) {
                return { success: false, error: 'A church with this short name already exists in this pastorate' };
            }

            // Update the church
            const result = await this.db.updateChurch(churchId, church_name, church_short_name);
            
            if (result.success) {
                // Return the updated church details
                const updatedChurch = await this.db.getChurchById(churchId);
                return {
                    success: true,
                    message: 'Church updated successfully',
                    church: updatedChurch
                };
            } else {
                return { success: false, error: result.error || 'Failed to update church' };
            }
        } catch (error) {
            console.error('Update church error:', error);
            return { success: false, error: 'Failed to update church' };
        }
    }

    async deleteChurch(churchId, userId) {
        try {
            // Verify user has access to this church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Get church info before deletion for confirmation
            const church = await this.db.getChurchById(churchId);
            if (!church) {
                return { success: false, error: 'Church not found' };
            }

            // Delete the church
            const result = await this.db.deleteChurch(churchId);
            
            if (result.success) {
                // If this was the selected church, clear the selection
                const currentChurch = await this.db.getLastSelectedChurch(userId);
                if (currentChurch && currentChurch.id === churchId) {
                    // Clear all last_selected_at for this user - let the frontend handle selection
                    await this.db.updateLastSelectedChurch(userId, null);
                }

                return {
                    success: true,
                    message: `Church "${church.church_name}" deleted successfully`,
                    affectedUsers: result.affectedUsers
                };
            } else {
                return { success: false, error: result.error || 'Failed to delete church' };
            }
        } catch (error) {
            console.error('Delete church error:', error);
            return { success: false, error: 'Failed to delete church' };
        }
    }
}

module.exports = ChurchService;