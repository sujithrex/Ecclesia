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

                // Churches table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS churches (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        pastorate_id INTEGER NOT NULL,
                        church_name TEXT NOT NULL,
                        church_short_name TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (pastorate_id) REFERENCES pastorates (id) ON DELETE CASCADE,
                        UNIQUE(pastorate_id, church_name),
                        UNIQUE(pastorate_id, church_short_name)
                    )
                `);

                // User-Churches junction table (many-to-many relationship)
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS user_churches (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        church_id INTEGER NOT NULL,
                        last_selected_at DATETIME,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                        FOREIGN KEY (church_id) REFERENCES churches (id) ON DELETE CASCADE,
                        UNIQUE(user_id, church_id)
                    )
                `);

                // Areas table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS areas (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        church_id INTEGER NOT NULL,
                        area_name TEXT NOT NULL,
                        area_identity TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (church_id) REFERENCES churches (id) ON DELETE CASCADE,
                        UNIQUE(church_id, area_name),
                        UNIQUE(church_id, area_identity)
                    )
                `);

                // Prayer Cells table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS prayer_cells (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        church_id INTEGER NOT NULL,
                        prayer_cell_name TEXT NOT NULL,
                        prayer_cell_identity TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (church_id) REFERENCES churches (id) ON DELETE CASCADE,
                        UNIQUE(church_id, prayer_cell_name),
                        UNIQUE(church_id, prayer_cell_identity)
                    )
                `);

                // Families table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS families (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        area_id INTEGER NOT NULL,
                        family_number TEXT NOT NULL,
                        respect TEXT NOT NULL CHECK (respect IN ('mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop')),
                        family_name TEXT NOT NULL,
                        family_address TEXT,
                        family_phone TEXT,
                        family_email TEXT,
                        layout_number TEXT NOT NULL,
                        notes TEXT,
                        prayer_points TEXT,
                        prayer_cell_id INTEGER,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (area_id) REFERENCES areas (id) ON DELETE CASCADE,
                        FOREIGN KEY (prayer_cell_id) REFERENCES prayer_cells (id) ON DELETE SET NULL,
                        UNIQUE(area_id, family_number),
                        UNIQUE(area_id, layout_number)
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

    // Church management methods
    async createChurch(pastorateId, church_name, church_short_name) {
        return new Promise((resolve) => {
            this.db.run(`
                INSERT INTO churches (pastorate_id, church_name, church_short_name)
                VALUES (?, ?, ?)
            `, [pastorateId, church_name, church_short_name], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, id: this.lastID });
                }
            });
        });
    }

    async getChurchById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM churches WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getAllChurches() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM churches ORDER BY church_name', (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async getChurchesByPastorate(pastorateId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT * FROM churches
                WHERE pastorate_id = ?
                ORDER BY church_name
            `, [pastorateId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async updateChurch(id, church_name, church_short_name) {
        return new Promise((resolve) => {
            this.db.run(`
                UPDATE churches
                SET church_name = ?, church_short_name = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [church_name, church_short_name, id], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async deleteChurch(id) {
        return new Promise((resolve) => {
            // First check if church exists and get user assignments
            this.db.get(`
                SELECT COUNT(*) as user_count
                FROM user_churches
                WHERE church_id = ?
            `, [id], (err, row) => {
                if (err) {
                    resolve({ success: false, error: err.message });
                    return;
                }

                // Delete the church (CASCADE will handle user_churches cleanup)
                this.db.run('DELETE FROM churches WHERE id = ?', [id], function(err) {
                    if (err) {
                        resolve({ success: false, error: err.message });
                    } else if (this.changes === 0) {
                        resolve({ success: false, error: 'Church not found' });
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

    async getUserChurches(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT c.*, uc.last_selected_at, uc.created_at as assigned_at,
                       p.pastorate_name, p.pastorate_short_name
                FROM churches c
                JOIN user_churches uc ON c.id = uc.church_id
                JOIN pastorates p ON c.pastorate_id = p.id
                WHERE uc.user_id = ?
                ORDER BY uc.last_selected_at DESC NULLS LAST, c.church_name
            `, [userId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async getUserChurchesByPastorate(userId, pastorateId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT c.*, uc.last_selected_at, uc.created_at as assigned_at
                FROM churches c
                JOIN user_churches uc ON c.id = uc.church_id
                WHERE uc.user_id = ? AND c.pastorate_id = ?
                ORDER BY uc.last_selected_at DESC NULLS LAST, c.church_name
            `, [userId, pastorateId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async assignUserToChurch(userId, churchId) {
        return new Promise((resolve) => {
            this.db.run(`
                INSERT OR IGNORE INTO user_churches (user_id, church_id)
                VALUES (?, ?)
            `, [userId, churchId], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async updateLastSelectedChurch(userId, churchId) {
        return new Promise((resolve) => {
            this.db.serialize(() => {
                // Clear previous last_selected_at for this user
                this.db.run(`
                    UPDATE user_churches
                    SET last_selected_at = NULL
                    WHERE user_id = ?
                `, [userId]);

                // If churchId is null, just clear all selections
                if (churchId === null) {
                    resolve({ success: true, changes: 1 });
                    return;
                }

                // Set the new last selected church
                this.db.run(`
                    UPDATE user_churches
                    SET last_selected_at = CURRENT_TIMESTAMP
                    WHERE user_id = ? AND church_id = ?
                `, [userId, churchId], function(err) {
                    if (err) {
                        resolve({ success: false, error: err.message });
                    } else {
                        resolve({ success: true, changes: this.changes });
                    }
                });
            });
        });
    }

    async getLastSelectedChurch(userId, pastorateId = null) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT c.*, uc.last_selected_at, p.pastorate_name, p.pastorate_short_name
                FROM churches c
                JOIN user_churches uc ON c.id = uc.church_id
                JOIN pastorates p ON c.pastorate_id = p.id
                WHERE uc.user_id = ? AND uc.last_selected_at IS NOT NULL
            `;
            let params = [userId];
            
            if (pastorateId) {
                query += ` AND c.pastorate_id = ?`;
                params.push(pastorateId);
            }
            
            query += ` ORDER BY uc.last_selected_at DESC LIMIT 1`;
            
            this.db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async removeUserFromChurch(userId, churchId) {
        return new Promise((resolve) => {
            this.db.run(`
                DELETE FROM user_churches
                WHERE user_id = ? AND church_id = ?
            `, [userId, churchId], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    // Areas management methods
    async createArea(churchId, area_name, area_identity) {
        return new Promise((resolve) => {
            this.db.run(`
                INSERT INTO areas (church_id, area_name, area_identity)
                VALUES (?, ?, ?)
            `, [churchId, area_name, area_identity], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, id: this.lastID });
                }
            });
        });
    }

    async getAreaById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM areas WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getAreasByChurch(churchId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT * FROM areas
                WHERE church_id = ?
                ORDER BY area_name
            `, [churchId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async updateArea(id, area_name, area_identity) {
        return new Promise((resolve) => {
            this.db.run(`
                UPDATE areas
                SET area_name = ?, area_identity = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [area_name, area_identity, id], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async deleteArea(id) {
        return new Promise((resolve) => {
            this.db.run('DELETE FROM areas WHERE id = ?', [id], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else if (this.changes === 0) {
                    resolve({ success: false, error: 'Area not found' });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    // Prayer Cells management methods
    async createPrayerCell(churchId, prayer_cell_name, prayer_cell_identity) {
        return new Promise((resolve) => {
            this.db.run(`
                INSERT INTO prayer_cells (church_id, prayer_cell_name, prayer_cell_identity)
                VALUES (?, ?, ?)
            `, [churchId, prayer_cell_name, prayer_cell_identity], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, id: this.lastID });
                }
            });
        });
    }

    async getPrayerCellById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM prayer_cells WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getPrayerCellsByChurch(churchId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT * FROM prayer_cells
                WHERE church_id = ?
                ORDER BY prayer_cell_name
            `, [churchId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async updatePrayerCell(id, prayer_cell_name, prayer_cell_identity) {
        return new Promise((resolve) => {
            this.db.run(`
                UPDATE prayer_cells
                SET prayer_cell_name = ?, prayer_cell_identity = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [prayer_cell_name, prayer_cell_identity, id], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async deletePrayerCell(id) {
        return new Promise((resolve) => {
            this.db.run('DELETE FROM prayer_cells WHERE id = ?', [id], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else if (this.changes === 0) {
                    resolve({ success: false, error: 'Prayer Cell not found' });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    // Families management methods
    async createFamily(areaId, familyData) {
        return new Promise((resolve) => {
            const { family_number, respect, family_name, family_address, family_phone, family_email, layout_number, notes, prayer_points, prayer_cell_id } = familyData;
            this.db.run(`
                INSERT INTO families (area_id, family_number, respect, family_name, family_address, family_phone, family_email, layout_number, notes, prayer_points, prayer_cell_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [areaId, family_number, respect, family_name, family_address, family_phone, family_email, layout_number, notes, prayer_points, prayer_cell_id], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, id: this.lastID });
                }
            });
        });
    }

    async getFamilyById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM families WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getFamiliesByArea(areaId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT f.*, pc.prayer_cell_name
                FROM families f
                LEFT JOIN prayer_cells pc ON f.prayer_cell_id = pc.id
                WHERE f.area_id = ?
                ORDER BY CAST(f.family_number AS INTEGER)
            `, [areaId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async updateFamily(id, familyData) {
        return new Promise((resolve) => {
            const { family_number, respect, family_name, family_address, family_phone, family_email, layout_number, notes, prayer_points, prayer_cell_id } = familyData;
            this.db.run(`
                UPDATE families
                SET family_number = ?, respect = ?, family_name = ?, family_address = ?, family_phone = ?, family_email = ?, layout_number = ?, notes = ?, prayer_points = ?, prayer_cell_id = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [family_number, respect, family_name, family_address, family_phone, family_email, layout_number, notes, prayer_points, prayer_cell_id, id], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async deleteFamily(id) {
        return new Promise((resolve) => {
            this.db.run('DELETE FROM families WHERE id = ?', [id], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else if (this.changes === 0) {
                    resolve({ success: false, error: 'Family not found' });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async getFamilyByAreaAndNumber(areaId, familyNumber) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM families WHERE area_id = ? AND family_number = ?', [areaId, familyNumber], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getFamilyByAreaAndLayoutNumber(areaId, layoutNumber) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM families WHERE area_id = ? AND layout_number = ?', [areaId, layoutNumber], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getNextFamilyNumber(areaId) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT MAX(CAST(family_number AS INTEGER)) as max_number
                FROM families
                WHERE area_id = ?
            `, [areaId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const nextNumber = (row?.max_number || 0) + 1;
                    const formattedNumber = String(nextNumber).padStart(3, '0');
                    resolve(formattedNumber);
                }
            });
        });
    }

    async getNextLayoutNumber(areaId) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT MAX(CAST(layout_number AS INTEGER)) as max_number
                FROM families
                WHERE area_id = ?
            `, [areaId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const nextNumber = (row?.max_number || 0) + 1;
                    const formattedNumber = String(nextNumber).padStart(3, '0');
                    resolve(formattedNumber);
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