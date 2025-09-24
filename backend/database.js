const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const { app } = require('electron');

class DatabaseManager {
    constructor() {
        // Use app.getPath('userData') for production, or current directory for development
        const dbPath = app.isPackaged
            ? path.join(app.getPath('userData'), 'ecclesia.db')
            : path.join(__dirname, 'ecclesia.db');
            
        this.db = new sqlite3.Database(dbPath);
        this.initializeTables();
    }

    async initializeTables() {
        return new Promise((resolve, reject) => {
            // Users table
            this.db.serialize(() => {
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        name TEXT NOT NULL,
                        email TEXT,
                        phone TEXT,
                        image TEXT,
                        reset_pin TEXT DEFAULT '1919',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // Sessions table for remember me functionality
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS sessions (
                        id TEXT PRIMARY KEY,
                        user_id INTEGER NOT NULL,
                        expires_at DATETIME NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id)
                    )
                `);

                // Pastorates table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS pastorates (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        pastorate_name TEXT UNIQUE NOT NULL,
                        pastorate_short_name TEXT UNIQUE NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // User-Pastorates junction table (many-to-many relationship)
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS user_pastorates (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        pastorate_id INTEGER NOT NULL,
                        last_selected_at DATETIME,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                        FOREIGN KEY (pastorate_id) REFERENCES pastorates (id) ON DELETE CASCADE,
                        UNIQUE(user_id, pastorate_id)
                    )
                `);

                // Settings table for app configurations
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS settings (
                        key TEXT PRIMARY KEY,
                        value TEXT NOT NULL,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating tables:', err);
                        reject(err);
                    } else {
                        console.log('Database tables initialized successfully');
                        this.createDefaultUser();
                        resolve();
                    }
                });
            });
        });
    }

    async createDefaultUser() {
        return new Promise((resolve) => {
            this.db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
                if (err) {
                    console.error('Error checking for admin user:', err);
                    resolve();
                    return;
                }

                if (!row) {
                    const hashedPassword = bcrypt.hashSync('admin123', 10);
                    this.db.run(`
                        INSERT INTO users (username, password, name, email, phone, reset_pin)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, ['admin', hashedPassword, 'Administrator', 'admin@ecclesia.com', '', '1919'], (err) => {
                        if (err) {
                            console.error('Error creating default user:', err);
                        } else {
                            console.log('Default admin user created successfully');
                        }
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    // User management methods
    async getUserByUsername(username) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getUserById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async updateUser(id, userData) {
        return new Promise((resolve) => {
            const allowedFields = ['username', 'name', 'email', 'phone', 'image'];
            const fields = Object.keys(userData).filter(key => allowedFields.includes(key));
            
            if (fields.length === 0) {
                resolve({ success: false, error: 'No valid fields to update' });
                return;
            }

            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const values = fields.map(field => userData[field]);
            values.push(id);

            this.db.run(`
                UPDATE users
                SET ${setClause}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, values, function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async updatePassword(userId, hashedPassword) {
        return new Promise((resolve) => {
            this.db.run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [hashedPassword, userId], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async updateResetPin(userId, pin) {
        return new Promise((resolve) => {
            this.db.run('UPDATE users SET reset_pin = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [pin, userId], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async getUserByResetPin(pin) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE reset_pin = ?', [pin], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Session management for remember me
    async createSession(sessionId, userId, expiresAt) {
        return new Promise((resolve) => {
            this.db.run('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
                [sessionId, userId, expiresAt], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, id: sessionId });
                }
            });
        });
    }

    async getSession(sessionId) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT s.*, u.id as user_id, u.username, u.name, u.email, u.phone, u.image
                FROM sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.id = ? AND s.expires_at > datetime('now')
            `, [sessionId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async deleteSession(sessionId) {
        return new Promise((resolve) => {
            this.db.run('DELETE FROM sessions WHERE id = ?', [sessionId], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async deleteUserSessions(userId) {
        return new Promise((resolve) => {
            this.db.run('DELETE FROM sessions WHERE user_id = ?', [userId], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async cleanExpiredSessions() {
        return new Promise((resolve) => {
            this.db.run('DELETE FROM sessions WHERE expires_at <= datetime("now")', function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    // Settings management
    async getSetting(key) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.value : null);
                }
            });
        });
    }

    async setSetting(key, value) {
        return new Promise((resolve) => {
            this.db.run(`
                INSERT OR REPLACE INTO settings (key, value, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            `, [key, value], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true });
                }
            });
        });
    }

    // Pastorate management methods
    async createPastorate(pastorate_name, pastorate_short_name) {
        return new Promise((resolve) => {
            this.db.run(`
                INSERT INTO pastorates (pastorate_name, pastorate_short_name)
                VALUES (?, ?)
            `, [pastorate_name, pastorate_short_name], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, id: this.lastID });
                }
            });
        });
    }

    async getPastorateById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM pastorates WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getAllPastorates() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM pastorates ORDER BY pastorate_name', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async updatePastorate(id, pastorate_name, pastorate_short_name) {
        return new Promise((resolve) => {
            this.db.run(`
                UPDATE pastorates
                SET pastorate_name = ?, pastorate_short_name = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [pastorate_name, pastorate_short_name, id], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async deletePastorate(id) {
        return new Promise((resolve) => {
            // First check if pastorate exists and get user assignments
            this.db.get(`
                SELECT COUNT(*) as user_count
                FROM user_pastorates
                WHERE pastorate_id = ?
            `, [id], (err, row) => {
                if (err) {
                    resolve({ success: false, error: err.message });
                    return;
                }

                // Delete the pastorate (CASCADE will handle user_pastorates cleanup)
                this.db.run('DELETE FROM pastorates WHERE id = ?', [id], function(err) {
                    if (err) {
                        resolve({ success: false, error: err.message });
                    } else if (this.changes === 0) {
                        resolve({ success: false, error: 'Pastorate not found' });
                    } else {
                        resolve({
                            success: true,
                            changes: this.changes,
                            affectedUsers: row.user_count
                        });
                    }
                });
            });
        });
    }

    async getUserPastorates(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT p.*, up.last_selected_at, up.created_at as assigned_at
                FROM pastorates p
                JOIN user_pastorates up ON p.id = up.pastorate_id
                WHERE up.user_id = ?
                ORDER BY up.last_selected_at DESC NULLS LAST, p.pastorate_name
            `, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async assignUserToPastorate(userId, pastorateId) {
        return new Promise((resolve) => {
            this.db.run(`
                INSERT OR IGNORE INTO user_pastorates (user_id, pastorate_id)
                VALUES (?, ?)
            `, [userId, pastorateId], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async updateLastSelectedPastorate(userId, pastorateId) {
        return new Promise((resolve) => {
            this.db.serialize(() => {
                // Clear previous last_selected_at for this user
                this.db.run(`
                    UPDATE user_pastorates
                    SET last_selected_at = NULL
                    WHERE user_id = ?
                `, [userId]);

                // Set the new last selected pastorate
                this.db.run(`
                    UPDATE user_pastorates
                    SET last_selected_at = CURRENT_TIMESTAMP
                    WHERE user_id = ? AND pastorate_id = ?
                `, [userId, pastorateId], function(err) {
                    if (err) {
                        resolve({ success: false, error: err.message });
                    } else {
                        resolve({ success: true, changes: this.changes });
                    }
                });
            });
        });
    }

    async getLastSelectedPastorate(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT p.*, up.last_selected_at
                FROM pastorates p
                JOIN user_pastorates up ON p.id = up.pastorate_id
                WHERE up.user_id = ? AND up.last_selected_at IS NOT NULL
                ORDER BY up.last_selected_at DESC
                LIMIT 1
            `, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async removeUserFromPastorate(userId, pastorateId) {
        return new Promise((resolve) => {
            this.db.run(`
                DELETE FROM user_pastorates
                WHERE user_id = ? AND pastorate_id = ?
            `, [userId, pastorateId], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = DatabaseManager;