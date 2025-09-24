const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class UserService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    async getProfile(userId) {
        try {
            const user = await this.db.getUserById(userId);
            
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            // Return user data without password
            const { password: _, ...userWithoutPassword } = user;
            
            return {
                success: true,
                user: userWithoutPassword
            };
        } catch (error) {
            console.error('Get profile error:', error);
            return { success: false, error: 'Failed to get user profile' };
        }
    }

    async updateProfile(userId, userData) {
        try {
            const result = await this.db.updateUser(userId, userData);
            
            if (result.success) {
                // Get updated user data
                const updatedUser = await this.db.getUserById(userId);
                const { password: _, ...userWithoutPassword } = updatedUser;
                
                return {
                    success: true,
                    message: 'Profile updated successfully',
                    user: userWithoutPassword
                };
            } else {
                return { success: false, error: result.error || 'Failed to update profile' };
            }
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: 'Failed to update profile' };
        }
    }

    async changePassword(userId, oldPassword, newPassword, authService) {
        try {
            const user = await this.db.getUserById(userId);
            
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            const isOldPasswordValid = bcrypt.compareSync(oldPassword, user.password);
            
            if (!isOldPasswordValid) {
                return { success: false, error: 'Current password is incorrect' };
            }

            const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
            const result = await this.db.updatePassword(userId, hashedNewPassword);
            
            if (result.success) {
                // Clear all existing sessions except current one
                await this.db.deleteUserSessions(userId);
                
                // Recreate current session if exists
                const currentSession = authService.getCurrentSession();
                if (currentSession) {
                    const sessionId = uuidv4();
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + 7);
                    
                    await this.db.createSession(sessionId, userId, expiresAt.toISOString());
                    authService.setCurrentSession(sessionId);
                }
                
                return {
                    success: true,
                    message: 'Password changed successfully',
                    newSessionId: authService.getCurrentSession()
                };
            } else {
                return { success: false, error: result.error || 'Failed to change password' };
            }
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, error: 'Failed to change password' };
        }
    }

    async updatePin(userId, newPin) {
        try {
            const result = await this.db.updateResetPin(userId, newPin);
            
            if (result.success) {
                return { success: true, message: 'PIN updated successfully' };
            } else {
                return { success: false, error: result.error || 'Failed to update PIN' };
            }
        } catch (error) {
            console.error('Update PIN error:', error);
            return { success: false, error: 'Failed to update PIN' };
        }
    }
}

module.exports = UserService;