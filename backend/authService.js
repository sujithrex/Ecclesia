const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

let currentSession = null;

class AuthService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    async login(username, password, rememberMe) {
        try {
            const user = await this.db.getUserByUsername(username);
            
            if (!user) {
                return { success: false, error: 'Invalid username or password' };
            }

            const isPasswordValid = bcrypt.compareSync(password, user.password);
            
            if (!isPasswordValid) {
                return { success: false, error: 'Invalid username or password' };
            }

            // Create session if remember me is checked
            if (rememberMe) {
                const sessionId = uuidv4();
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
                
                const sessionResult = await this.db.createSession(sessionId, user.id, expiresAt.toISOString());
                if (sessionResult.success) {
                    currentSession = sessionId;
                }
            }

            // Return user data without password
            const { password: _, ...userWithoutPassword } = user;
            
            return {
                success: true,
                user: userWithoutPassword,
                sessionId: currentSession
            };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    }

    async logout() {
        try {
            if (currentSession) {
                await this.db.deleteSession(currentSession);
                currentSession = null;
            }
            
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: 'Logout failed' };
        }
    }

    async checkSession(sessionId) {
        try {
            if (!sessionId) {
                return { success: false, error: 'No session ID provided' };
            }

            const session = await this.db.getSession(sessionId);
            
            if (!session) {
                return { success: false, error: 'Invalid or expired session' };
            }

            currentSession = sessionId;
            
            // Return user data
            const userData = {
                id: session.user_id,
                username: session.username,
                name: session.name,
                email: session.email,
                phone: session.phone,
                image: session.image
            };

            return {
                success: true,
                user: userData
            };
        } catch (error) {
            console.error('Session check error:', error);
            return { success: false, error: 'Session validation failed' };
        }
    }

    async forgotPassword(pin, newPassword) {
        try {
            const user = await this.db.getUserByResetPin(pin);
            
            if (!user) {
                return { success: false, error: 'Invalid PIN' };
            }

            const hashedPassword = bcrypt.hashSync(newPassword, 10);
            const result = await this.db.updatePassword(user.id, hashedPassword);
            
            if (result.success) {
                // Clear all existing sessions for this user
                await this.db.deleteUserSessions(user.id);
                
                return { success: true, message: 'Password updated successfully' };
            } else {
                return { success: false, error: 'Failed to update password' };
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            return { success: false, error: 'Password reset failed' };
        }
    }

    getCurrentSession() {
        return currentSession;
    }

    setCurrentSession(sessionId) {
        currentSession = sessionId;
    }
}

module.exports = AuthService;