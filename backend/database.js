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

                // Members table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS members (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        member_id TEXT UNIQUE NOT NULL,
                        member_number TEXT NOT NULL,
                        family_id INTEGER NOT NULL,
                        respect TEXT NOT NULL CHECK (respect IN ('mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop')),
                        name TEXT NOT NULL,
                        relation TEXT NOT NULL,
                        sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
                        mobile TEXT,
                        dob DATE,
                        age INTEGER,
                        is_married TEXT CHECK (is_married IN ('yes', 'no')) DEFAULT 'no',
                        date_of_marriage DATE,
                        spouse_id INTEGER,
                        occupation TEXT,
                        working_place TEXT,
                        is_baptised TEXT CHECK (is_baptised IN ('yes', 'no')) DEFAULT 'no',
                        date_of_baptism DATE,
                        is_confirmed TEXT CHECK (is_confirmed IN ('yes', 'no')) DEFAULT 'no',
                        date_of_confirmation DATE,
                        is_alive TEXT CHECK (is_alive IN ('alive', 'death')) DEFAULT 'alive',
                        image TEXT,
                        aadhar_number TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE CASCADE,
                        FOREIGN KEY (spouse_id) REFERENCES members (id) ON DELETE SET NULL,
                        UNIQUE(family_id, member_number)
                    )
                `);

                // Settings table for app configurations
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS settings (
                        key TEXT PRIMARY KEY,
                        value TEXT NOT NULL,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // Pastorate settings table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS pastorate_settings (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        pastorate_id INTEGER NOT NULL,
                        pastorate_name_tamil TEXT,
                        pastorate_name_english TEXT,
                        diocese_name_tamil TEXT DEFAULT 'திருநெல்வேலி திருமண்டலம்',
                        diocese_name_english TEXT DEFAULT 'Tirunelveli Diocese',
                        church_name_tamil TEXT DEFAULT 'தென்னிந்திய திருச்சபை',
                        church_name_english TEXT DEFAULT 'Church of South India',
                        chairman_name_tamil TEXT,
                        chairman_name_english TEXT,
                        presbyter_name_tamil TEXT,
                        presbyter_name_english TEXT,
                        office_address_tamil TEXT,
                        office_address_english TEXT,
                        phone_number TEXT,
                        email_address TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (pastorate_id) REFERENCES pastorates (id) ON DELETE CASCADE,
                        UNIQUE(pastorate_id)
                    )
                `);

                // Church settings table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS church_settings (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        church_id INTEGER NOT NULL,
                        church_name_tamil TEXT,
                        church_name_english TEXT,
                        village_name_tamil TEXT,
                        village_name_english TEXT,
                        catechist_name_tamil TEXT,
                        catechist_name_english TEXT,
                        church_address_tamil TEXT,
                        church_address_english TEXT,
                        phone_number TEXT,
                        email_address TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (church_id) REFERENCES churches (id) ON DELETE CASCADE,
                        UNIQUE(church_id)
                    )
                `);

                // Adult Baptism Certificates table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS adult_baptism_certificates (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        church_id INTEGER NOT NULL,
                        certificate_number TEXT NOT NULL,
                        when_baptised DATE NOT NULL,
                        christian_name TEXT NOT NULL,
                        former_name TEXT NOT NULL,
                        sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
                        age INTEGER NOT NULL,
                        abode TEXT NOT NULL,
                        profession TEXT,
                        father_name TEXT NOT NULL,
                        mother_name TEXT NOT NULL,
                        witness_name_1 TEXT NOT NULL,
                        witness_name_2 TEXT NOT NULL,
                        witness_name_3 TEXT NOT NULL,
                        where_baptised TEXT NOT NULL,
                        signature_who_baptised TEXT NOT NULL,
                        certified_rev_name TEXT NOT NULL,
                        holding_office TEXT NOT NULL,
                        certificate_date DATE NOT NULL,
                        certificate_place TEXT NOT NULL,
                        created_by INTEGER NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (church_id) REFERENCES churches (id) ON DELETE CASCADE,
                        FOREIGN KEY (created_by) REFERENCES users (id),
                        UNIQUE(church_id, certificate_number)
                    )
                `);

                // Infant Baptism Certificates table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS infant_baptism_certificates (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        church_id INTEGER NOT NULL,
                        certificate_number TEXT NOT NULL,
                        when_baptised DATE NOT NULL,
                        christian_name TEXT NOT NULL,
                        date_of_birth DATE NOT NULL,
                        sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
                        abode TEXT NOT NULL,
                        profession TEXT,
                        father_name TEXT NOT NULL,
                        mother_name TEXT NOT NULL,
                        witness_name_1 TEXT NOT NULL,
                        witness_name_2 TEXT NOT NULL,
                        witness_name_3 TEXT NOT NULL,
                        where_baptised TEXT NOT NULL,
                        signature_who_baptised TEXT NOT NULL,
                        certified_rev_name TEXT NOT NULL,
                        holding_office TEXT NOT NULL,
                        certificate_date DATE NOT NULL,
                        certificate_place TEXT NOT NULL,
                        created_by INTEGER NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (church_id) REFERENCES churches (id) ON DELETE CASCADE,
                        FOREIGN KEY (created_by) REFERENCES users (id),
                        UNIQUE(church_id, certificate_number)
                    )
                `);

                // Letterpad table
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS letterpads (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        pastorate_id INTEGER NOT NULL,
                        letterpad_number TEXT NOT NULL,
                        letter_date DATE NOT NULL,
                        subject TEXT,
                        content TEXT NOT NULL,
                        rev_name TEXT NOT NULL,
                        rev_designation TEXT NOT NULL,
                        chairman_details TEXT,
                        parsonage_address TEXT,
                        created_by INTEGER NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (pastorate_id) REFERENCES pastorates (id) ON DELETE CASCADE,
                        FOREIGN KEY (created_by) REFERENCES users (id),
                        UNIQUE(pastorate_id, letterpad_number)
                    )
                `);

                // Letterpad settings table for storing default chairman and address info
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS letterpad_settings (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        pastorate_id INTEGER NOT NULL,
                        default_chairman_details TEXT,
                        default_parsonage_address TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (pastorate_id) REFERENCES pastorates (id) ON DELETE CASCADE,
                        UNIQUE(pastorate_id)
                    )
                `, (err) => {
                    if (err) {
                        console.error('Error creating tables:', err);
                        reject(err);
                    } else {
                        console.log('Database tables initialized successfully');
                        this.runMigrations();
                        this.createDefaultUser();
                        resolve();
                    }
                });
            });
        });
    }

    async runMigrations() {
        try {
            // Migration 1: Add spouse_id column to members table if it doesn't exist
            await this.migrateSpouseId();

            // Migration 2: Update adult_baptism_certificates table structure
            await this.migrateAdultBaptismCertificates();

            // Migration 3: Update letterpad_settings table structure
            await this.migrateLetterpadSettings();

            // Migration 4: Update letterpads table structure
            await this.migrateLetterpadTable();
        } catch (error) {
            console.error('Migration error:', error);
        }
    }

    async migrateSpouseId() {
        return new Promise((resolve) => {
            this.db.get("PRAGMA table_info(members)", (err, rows) => {
                if (err) {
                    console.error('Error checking table info:', err);
                    resolve();
                    return;
                }

                // Check if spouse_id column exists by getting all columns
                this.db.all("PRAGMA table_info(members)", (err, columns) => {
                    if (err) {
                        console.error('Error checking columns:', err);
                        resolve();
                        return;
                    }

                    const hasSpouseId = columns.some(col => col.name === 'spouse_id');

                    if (!hasSpouseId) {
                        console.log('Adding spouse_id column to members table...');
                        this.db.run(`
                            ALTER TABLE members
                            ADD COLUMN spouse_id INTEGER REFERENCES members(id) ON DELETE SET NULL
                        `, (alterErr) => {
                            if (alterErr) {
                                console.error('Error adding spouse_id column:', alterErr);
                            } else {
                                console.log('spouse_id column added successfully');
                            }
                            resolve();
                        });
                    } else {
                        console.log('spouse_id column already exists');
                        resolve();
                    }
                });
            });
        });
    }

    async migrateAdultBaptismCertificates() {
        return new Promise((resolve) => {
            // Check if table exists and has old structure
            this.db.all("PRAGMA table_info(adult_baptism_certificates)", (err, columns) => {
                if (err) {
                    console.error('Error checking adult_baptism_certificates table:', err);
                    resolve();
                    return;
                }

                if (!columns || columns.length === 0) {
                    console.log('adult_baptism_certificates table does not exist yet');
                    resolve();
                    return;
                }

                // Check if we need to migrate (check for old column names)
                const hasOldStructure = columns.some(col => col.name === 'parents_name' || col.name === 'witness_name');
                const hasNewStructure = columns.some(col => col.name === 'former_name');

                if (hasOldStructure && !hasNewStructure) {
                    console.log('Migrating adult_baptism_certificates table to new structure...');

                    // Create new table with correct structure
                    this.db.run(`
                        CREATE TABLE adult_baptism_certificates_new (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            church_id INTEGER NOT NULL,
                            certificate_number TEXT NOT NULL,
                            when_baptised DATE NOT NULL,
                            christian_name TEXT NOT NULL,
                            former_name TEXT NOT NULL,
                            sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
                            age INTEGER NOT NULL,
                            abode TEXT NOT NULL,
                            profession TEXT,
                            father_name TEXT NOT NULL,
                            mother_name TEXT NOT NULL,
                            witness_name_1 TEXT NOT NULL,
                            witness_name_2 TEXT NOT NULL,
                            witness_name_3 TEXT NOT NULL,
                            where_baptised TEXT NOT NULL,
                            signature_who_baptised TEXT NOT NULL,
                            certified_rev_name TEXT NOT NULL,
                            holding_office TEXT NOT NULL,
                            certificate_date DATE NOT NULL,
                            certificate_place TEXT NOT NULL,
                            created_by INTEGER NOT NULL,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (church_id) REFERENCES churches (id) ON DELETE CASCADE,
                            FOREIGN KEY (created_by) REFERENCES users (id),
                            UNIQUE(church_id, certificate_number)
                        )
                    `, (createErr) => {
                        if (createErr) {
                            console.error('Error creating new adult_baptism_certificates table:', createErr);
                            resolve();
                            return;
                        }

                        // Copy data from old table to new table (if any data exists)
                        this.db.run(`
                            INSERT INTO adult_baptism_certificates_new
                            (id, church_id, certificate_number, when_baptised, christian_name,
                             former_name, sex, age, abode, profession, father_name, mother_name,
                             witness_name_1, witness_name_2, witness_name_3, where_baptised,
                             signature_who_baptised, certified_rev_name, holding_office,
                             certificate_date, certificate_place, created_by, created_at, updated_at)
                            SELECT
                                id, church_id, certificate_number, when_baptised, christian_name,
                                father_name as former_name, sex, age, abode, profession,
                                parents_name as father_name, '' as mother_name,
                                witness_name as witness_name_1, '' as witness_name_2, '' as witness_name_3,
                                where_baptised, signature_who_baptised, certified_rev_name, holding_office,
                                certificate_date, certificate_place, created_by, created_at, updated_at
                            FROM adult_baptism_certificates
                        `, (copyErr) => {
                            if (copyErr) {
                                console.log('No data to copy or copy error (this is OK for new tables):', copyErr.message);
                            }

                            // Drop old table
                            this.db.run(`DROP TABLE IF EXISTS adult_baptism_certificates`, (dropErr) => {
                                if (dropErr) {
                                    console.error('Error dropping old table:', dropErr);
                                    resolve();
                                    return;
                                }

                                // Rename new table
                                this.db.run(`ALTER TABLE adult_baptism_certificates_new RENAME TO adult_baptism_certificates`, (renameErr) => {
                                    if (renameErr) {
                                        console.error('Error renaming table:', renameErr);
                                    } else {
                                        console.log('adult_baptism_certificates table migrated successfully');
                                    }
                                    resolve();
                                });
                            });
                        });
                    });
                } else if (hasNewStructure) {
                    console.log('adult_baptism_certificates table already has new structure');
                    resolve();
                } else {
                    console.log('adult_baptism_certificates table structure is unknown, skipping migration');
                    resolve();
                }
            });
        });
    }

    async migrateLetterpadSettings() {
        return new Promise((resolve) => {
            // Check if letterpad_settings table exists and has old structure
            this.db.all("PRAGMA table_info(letterpad_settings)", (err, columns) => {
                if (err) {
                    console.error('Error checking letterpad_settings table:', err);
                    resolve();
                    return;
                }

                if (!columns || columns.length === 0) {
                    console.log('letterpad_settings table does not exist yet');
                    resolve();
                    return;
                }

                // Check if we need to migrate (check for old column names)
                const hasOldStructure = columns.some(col => col.name === 'default_chairman_details');
                const hasNewStructure = columns.some(col => col.name === 'default_rev_name');

                if (hasOldStructure && !hasNewStructure) {
                    console.log('Migrating letterpad_settings table to new structure...');

                    // Add new columns
                    this.db.run(`ALTER TABLE letterpad_settings ADD COLUMN default_rev_name TEXT`, (err1) => {
                        if (err1 && !err1.message.includes('duplicate column')) {
                            console.error('Error adding default_rev_name column:', err1);
                        }

                        this.db.run(`ALTER TABLE letterpad_settings ADD COLUMN default_rev_designation TEXT`, (err2) => {
                            if (err2 && !err2.message.includes('duplicate column')) {
                                console.error('Error adding default_rev_designation column:', err2);
                            }

                            console.log('letterpad_settings table migrated successfully');
                            resolve();
                        });
                    });
                } else if (hasNewStructure) {
                    console.log('letterpad_settings table already has new structure');
                    resolve();
                } else {
                    console.log('letterpad_settings table structure is unknown, skipping migration');
                    resolve();
                }
            });
        });
    }

    async migrateLetterpadTable() {
        return new Promise((resolve) => {
            // Check if letterpads table exists
            this.db.all("PRAGMA table_info(letterpads)", (err, columns) => {
                if (err) {
                    console.error('Error checking letterpads table:', err);
                    resolve();
                    return;
                }

                if (!columns || columns.length === 0) {
                    console.log('letterpads table does not exist yet');
                    resolve();
                    return;
                }

                // Check if columns already exist
                const hasRevName = columns.some(col => col.name === 'rev_name');
                const hasRevDesignation = columns.some(col => col.name === 'rev_designation');
                const hasParsonageAddress = columns.some(col => col.name === 'parsonage_address');

                if (!hasRevName || !hasRevDesignation || !hasParsonageAddress) {
                    console.log('Migrating letterpads table to add rev_name, rev_designation, parsonage_address columns...');

                    // Add columns one by one
                    const addColumn = (columnName, columnDef, callback) => {
                        this.db.run(`ALTER TABLE letterpads ADD COLUMN ${columnName} ${columnDef}`, (err) => {
                            if (err && !err.message.includes('duplicate column')) {
                                console.error(`Error adding ${columnName} column:`, err);
                            }
                            callback();
                        });
                    };

                    addColumn('rev_name', 'TEXT', () => {
                        addColumn('rev_designation', 'TEXT', () => {
                            addColumn('parsonage_address', 'TEXT', () => {
                                console.log('letterpads table migrated successfully');
                                resolve();
                            });
                        });
                    });
                } else {
                    console.log('letterpads table already has new columns');
                    resolve();
                }
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

    async getPastorateByChurchId(churchId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT p.*
                FROM pastorates p
                INNER JOIN churches c ON c.pastorate_id = p.id
                WHERE c.id = ?
            `;
            this.db.get(query, [churchId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row || null);
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

    // Members management methods
    async createMember(familyId, memberData) {
        return new Promise((resolve) => {
            const { member_id, member_number, respect, name, relation, sex, mobile, dob, age, is_married, date_of_marriage, spouse_id, occupation, working_place, is_baptised, date_of_baptism, is_confirmed, date_of_confirmation, is_alive, image, aadhar_number } = memberData;
            this.db.run(`
                INSERT INTO members (member_id, member_number, family_id, respect, name, relation, sex, mobile, dob, age, is_married, date_of_marriage, spouse_id, occupation, working_place, is_baptised, date_of_baptism, is_confirmed, date_of_confirmation, is_alive, image, aadhar_number)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [member_id, member_number, familyId, respect, name, relation, sex, mobile, dob, age, is_married, date_of_marriage, spouse_id, occupation, working_place, is_baptised, date_of_baptism, is_confirmed, date_of_confirmation, is_alive, image, aadhar_number], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, id: this.lastID });
                }
            });
        });
    }

    async getMemberById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM members WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getMembersByFamily(familyId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT * FROM members
                WHERE family_id = ?
                ORDER BY CAST(member_number AS INTEGER)
            `, [familyId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async updateMember(id, memberData) {
        return new Promise((resolve) => {
            const { member_number, respect, name, relation, sex, mobile, dob, age, is_married, date_of_marriage, spouse_id, occupation, working_place, is_baptised, date_of_baptism, is_confirmed, date_of_confirmation, is_alive, image, aadhar_number } = memberData;
            this.db.run(`
                UPDATE members
                SET member_number = ?, respect = ?, name = ?, relation = ?, sex = ?, mobile = ?, dob = ?, age = ?, is_married = ?, date_of_marriage = ?, spouse_id = ?, occupation = ?, working_place = ?, is_baptised = ?, date_of_baptism = ?, is_confirmed = ?, date_of_confirmation = ?, is_alive = ?, image = ?, aadhar_number = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [member_number, respect, name, relation, sex, mobile, dob, age, is_married, date_of_marriage, spouse_id, occupation, working_place, is_baptised, date_of_baptism, is_confirmed, date_of_confirmation, is_alive, image, aadhar_number, id], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async deleteMember(id) {
        return new Promise((resolve) => {
            this.db.run('DELETE FROM members WHERE id = ?', [id], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else if (this.changes === 0) {
                    resolve({ success: false, error: 'Member not found' });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async getMemberByFamilyAndNumber(familyId, memberNumber) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM members WHERE family_id = ? AND member_number = ?', [familyId, memberNumber], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getNextMemberNumber(familyId) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT MAX(CAST(member_number AS INTEGER)) as max_number
                FROM members
                WHERE family_id = ?
            `, [familyId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const nextNumber = (row?.max_number || 0) + 1;
                    const formattedNumber = String(nextNumber).padStart(2, '0');
                    resolve(formattedNumber);
                }
            });
        });
    }

    async getNextMemberId() {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT COUNT(*) + 1 as next_id FROM members
            `, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const nextId = row?.next_id || 1;
                    const formattedId = `M${String(nextId).padStart(3, '0')}`;
                    resolve(formattedId);
                }
            });
        });
    }

    // Pastorate Settings management methods
    async getPastorateSettings(pastorateId) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT ps.*, p.pastorate_name, p.pastorate_short_name
                FROM pastorate_settings ps
                JOIN pastorates p ON ps.pastorate_id = p.id
                WHERE ps.pastorate_id = ?
            `, [pastorateId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async createPastorateSettings(pastorateId, settingsData) {
        return new Promise((resolve) => {
            const {
                pastorate_name_tamil,
                pastorate_name_english,
                diocese_name_tamil,
                diocese_name_english,
                church_name_tamil,
                church_name_english,
                chairman_name_tamil,
                chairman_name_english,
                presbyter_name_tamil,
                presbyter_name_english,
                office_address_tamil,
                office_address_english,
                phone_number,
                email_address
            } = settingsData;

            this.db.run(`
                INSERT INTO pastorate_settings (
                    pastorate_id, pastorate_name_tamil, pastorate_name_english,
                    diocese_name_tamil, diocese_name_english,
                    church_name_tamil, church_name_english,
                    chairman_name_tamil, chairman_name_english,
                    presbyter_name_tamil, presbyter_name_english,
                    office_address_tamil, office_address_english,
                    phone_number, email_address
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                pastorateId, pastorate_name_tamil, pastorate_name_english,
                diocese_name_tamil, diocese_name_english,
                church_name_tamil, church_name_english,
                chairman_name_tamil, chairman_name_english,
                presbyter_name_tamil, presbyter_name_english,
                office_address_tamil, office_address_english,
                phone_number, email_address
            ], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, id: this.lastID });
                }
            });
        });
    }

    async updatePastorateSettings(pastorateId, settingsData) {
        return new Promise((resolve) => {
            const {
                pastorate_name_tamil,
                pastorate_name_english,
                diocese_name_tamil,
                diocese_name_english,
                church_name_tamil,
                church_name_english,
                chairman_name_tamil,
                chairman_name_english,
                presbyter_name_tamil,
                presbyter_name_english,
                office_address_tamil,
                office_address_english,
                phone_number,
                email_address
            } = settingsData;

            this.db.run(`
                UPDATE pastorate_settings
                SET pastorate_name_tamil = ?, pastorate_name_english = ?,
                    diocese_name_tamil = ?, diocese_name_english = ?,
                    church_name_tamil = ?, church_name_english = ?,
                    chairman_name_tamil = ?, chairman_name_english = ?,
                    presbyter_name_tamil = ?, presbyter_name_english = ?,
                    office_address_tamil = ?, office_address_english = ?,
                    phone_number = ?, email_address = ?, updated_at = CURRENT_TIMESTAMP
                WHERE pastorate_id = ?
            `, [
                pastorate_name_tamil, pastorate_name_english,
                diocese_name_tamil, diocese_name_english,
                church_name_tamil, church_name_english,
                chairman_name_tamil, chairman_name_english,
                presbyter_name_tamil, presbyter_name_english,
                office_address_tamil, office_address_english,
                phone_number, email_address, pastorateId
            ], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async getDefaultPastorateSettings(pastorateId) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT pastorate_name, pastorate_short_name
                FROM pastorates
                WHERE id = ?
            `, [pastorateId], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve(null);
                } else {
                    resolve({
                        pastorate_name_tamil: row.pastorate_name,
                        pastorate_name_english: row.pastorate_name,
                        diocese_name_tamil: 'திருநெல்வேலி திருமண்டலம்',
                        diocese_name_english: 'Tirunelveli Diocese',
                        church_name_tamil: 'தென்னிந்திய திருச்சபை',
                        church_name_english: 'Church of South India',
                        chairman_name_tamil: '',
                        chairman_name_english: '',
                        presbyter_name_tamil: '',
                        presbyter_name_english: '',
                        office_address_tamil: '',
                        office_address_english: '',
                        phone_number: '',
                        email_address: ''
                    });
                }
            });
        });
    }

    // Church Settings management methods
    async getChurchSettings(churchId) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT cs.*, c.church_name, c.church_short_name
                FROM church_settings cs
                JOIN churches c ON cs.church_id = c.id
                WHERE cs.church_id = ?
            `, [churchId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async createChurchSettings(churchId, settingsData) {
        return new Promise((resolve) => {
            const {
                church_name_tamil,
                church_name_english,
                village_name_tamil,
                village_name_english,
                catechist_name_tamil,
                catechist_name_english,
                church_address_tamil,
                church_address_english,
                phone_number,
                email_address
            } = settingsData;

            this.db.run(`
                INSERT INTO church_settings (
                    church_id, church_name_tamil, church_name_english,
                    village_name_tamil, village_name_english,
                    catechist_name_tamil, catechist_name_english,
                    church_address_tamil, church_address_english,
                    phone_number, email_address
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                churchId, church_name_tamil, church_name_english,
                village_name_tamil, village_name_english,
                catechist_name_tamil, catechist_name_english,
                church_address_tamil, church_address_english,
                phone_number, email_address
            ], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, id: this.lastID });
                }
            });
        });
    }

    async updateChurchSettings(churchId, settingsData) {
        return new Promise((resolve) => {
            const {
                church_name_tamil,
                church_name_english,
                village_name_tamil,
                village_name_english,
                catechist_name_tamil,
                catechist_name_english,
                church_address_tamil,
                church_address_english,
                phone_number,
                email_address
            } = settingsData;

            this.db.run(`
                UPDATE church_settings
                SET church_name_tamil = ?, church_name_english = ?,
                    village_name_tamil = ?, village_name_english = ?,
                    catechist_name_tamil = ?, catechist_name_english = ?,
                    church_address_tamil = ?, church_address_english = ?,
                    phone_number = ?, email_address = ?, updated_at = CURRENT_TIMESTAMP
                WHERE church_id = ?
            `, [
                church_name_tamil, church_name_english,
                village_name_tamil, village_name_english,
                catechist_name_tamil, catechist_name_english,
                church_address_tamil, church_address_english,
                phone_number, email_address, churchId
            ], function(err) {
                if (err) {
                    resolve({ success: false, error: err.message });
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    async getDefaultChurchSettings(churchId) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT church_name, church_short_name
                FROM churches
                WHERE id = ?
            `, [churchId], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve(null);
                } else {
                    resolve({
                        church_name_tamil: row.church_name,
                        church_name_english: row.church_name,
                        village_name_tamil: '',
                        village_name_english: '',
                        catechist_name_tamil: '',
                        catechist_name_english: '',
                        church_address_tamil: '',
                        church_address_english: '',
                        phone_number: '',
                        email_address: ''
                    });
                }
            });
        });
    }

    // Birthday related methods
    async getBirthdaysByDateRange(churchId, fromDate, toDate, areaId = null) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT m.*, f.respect as family_respect, f.family_name, a.area_name,
                       CASE
                           WHEN f.respect IN ('mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop')
                           THEN UPPER(SUBSTR(f.respect, 1, 1)) || SUBSTR(f.respect, 2) || '. ' || f.family_name
                           ELSE f.family_name
                       END as family_head,
                       CASE
                           WHEN m.respect IN ('mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop')
                           THEN UPPER(SUBSTR(m.respect, 1, 1)) || SUBSTR(m.respect, 2)
                           ELSE m.respect
                       END as formatted_respect,
                       strftime('%d-%m', m.dob) as birthday_date
                FROM members m
                JOIN families f ON m.family_id = f.id
                JOIN areas a ON f.area_id = a.id
                WHERE a.church_id = ? AND m.dob IS NOT NULL AND m.is_alive = 'alive'
            `;
            
            let params = [churchId];
            
            // Add area filter if specified
            if (areaId) {
                query += ' AND a.id = ?';
                params.push(areaId);
            }
            
            // Add date range filter - handle year crossing
            if (fromDate && toDate) {
                const fromParts = fromDate.split('-');
                const toParts = toDate.split('-');
                const fromDay = parseInt(fromParts[0]);
                const fromMonth = parseInt(fromParts[1]);
                const toDay = parseInt(toParts[0]);
                const toMonth = parseInt(toParts[1]);
                
                if (fromMonth <= toMonth) {
                    // Same year range
                    query += ` AND (
                        (CAST(strftime('%m', m.dob) AS INTEGER) > ? OR
                         (CAST(strftime('%m', m.dob) AS INTEGER) = ? AND CAST(strftime('%d', m.dob) AS INTEGER) >= ?)) AND
                        (CAST(strftime('%m', m.dob) AS INTEGER) < ? OR
                         (CAST(strftime('%m', m.dob) AS INTEGER) = ? AND CAST(strftime('%d', m.dob) AS INTEGER) <= ?))
                    )`;
                    params.push(fromMonth, fromMonth, fromDay, toMonth, toMonth, toDay);
                } else {
                    // Cross year range (e.g., Dec to Jan)
                    query += ` AND (
                        (CAST(strftime('%m', m.dob) AS INTEGER) > ? OR
                         (CAST(strftime('%m', m.dob) AS INTEGER) = ? AND CAST(strftime('%d', m.dob) AS INTEGER) >= ?)) OR
                        (CAST(strftime('%m', m.dob) AS INTEGER) < ? OR
                         (CAST(strftime('%m', m.dob) AS INTEGER) = ? AND CAST(strftime('%d', m.dob) AS INTEGER) <= ?))
                    )`;
                    params.push(fromMonth, fromMonth, fromDay, toMonth, toMonth, toDay);
                }
            }
            
            query += ' ORDER BY strftime("%m-%d", m.dob), m.name';
            
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async getTodaysBirthdays(churchId, areaId = null) {
        return new Promise((resolve, reject) => {
            const today = new Date();
            const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
            const todayDay = String(today.getDate()).padStart(2, '0');
            
            let query = `
                SELECT m.*, f.respect as family_respect, f.family_name, a.area_name,
                       CASE
                           WHEN f.respect IN ('mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop')
                           THEN UPPER(SUBSTR(f.respect, 1, 1)) || SUBSTR(f.respect, 2) || '. ' || f.family_name
                           ELSE f.family_name
                       END as family_head,
                       CASE
                           WHEN m.respect IN ('mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop')
                           THEN UPPER(SUBSTR(m.respect, 1, 1)) || SUBSTR(m.respect, 2)
                           ELSE m.respect
                       END as formatted_respect
                FROM members m
                JOIN families f ON m.family_id = f.id
                JOIN areas a ON f.area_id = a.id
                WHERE a.church_id = ? AND m.dob IS NOT NULL AND m.is_alive = 'alive'
                AND strftime('%m', m.dob) = ? AND strftime('%d', m.dob) = ?
            `;
            
            let params = [churchId, todayMonth, todayDay];
            
            if (areaId) {
                query += ' AND a.id = ?';
                params.push(areaId);
            }
            
            query += ' ORDER BY m.name';
            
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async getThisWeekBirthdays(churchId, areaId = null) {
        return new Promise((resolve, reject) => {
            const today = new Date();
            const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
            
            // Calculate Sunday of current week
            const sunday = new Date(today);
            sunday.setDate(today.getDate() - currentDay);
            
            // Calculate Saturday of current week
            const saturday = new Date(sunday);
            saturday.setDate(sunday.getDate() + 6);
            
            const sundayMonth = String(sunday.getMonth() + 1).padStart(2, '0');
            const sundayDay = String(sunday.getDate()).padStart(2, '0');
            const saturdayMonth = String(saturday.getMonth() + 1).padStart(2, '0');
            const saturdayDay = String(saturday.getDate()).padStart(2, '0');
            
            let query = `
                SELECT m.*, f.respect as family_respect, f.family_name, a.area_name,
                       CASE
                           WHEN f.respect IN ('mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop')
                           THEN UPPER(SUBSTR(f.respect, 1, 1)) || SUBSTR(f.respect, 2) || '. ' || f.family_name
                           ELSE f.family_name
                       END as family_head,
                       CASE
                           WHEN m.respect IN ('mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop')
                           THEN UPPER(SUBSTR(m.respect, 1, 1)) || SUBSTR(m.respect, 2)
                           ELSE m.respect
                       END as formatted_respect
                FROM members m
                JOIN families f ON m.family_id = f.id
                JOIN areas a ON f.area_id = a.id
                WHERE a.church_id = ? AND m.dob IS NOT NULL AND m.is_alive = 'alive'
            `;
            
            let params = [churchId];
            
            if (areaId) {
                query += ' AND a.id = ?';
                params.push(areaId);
            }
            
            // Handle week crossing month/year boundary
            if (sunday.getMonth() === saturday.getMonth()) {
                // Same month
                query += ` AND strftime('%m', m.dob) = ?
                          AND CAST(strftime('%d', m.dob) AS INTEGER) BETWEEN ? AND ?`;
                params.push(sundayMonth, parseInt(sundayDay), parseInt(saturdayDay));
            } else {
                // Cross month boundary
                query += ` AND (
                    (strftime('%m', m.dob) = ? AND CAST(strftime('%d', m.dob) AS INTEGER) >= ?) OR
                    (strftime('%m', m.dob) = ? AND CAST(strftime('%d', m.dob) AS INTEGER) <= ?)
                )`;
                params.push(sundayMonth, parseInt(sundayDay), saturdayMonth, parseInt(saturdayDay));
            }
            
            query += ' ORDER BY strftime("%m-%d", m.dob), m.name';
            
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async getBirthdayStatistics(churchId, areaId = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const todaysBirthdays = await this.getTodaysBirthdays(churchId, areaId);
                const thisWeekBirthdays = await this.getThisWeekBirthdays(churchId, areaId);
                
                resolve({
                    todayCount: todaysBirthdays.length,
                    thisWeekCount: thisWeekBirthdays.length
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Wedding Anniversary related methods
    async getWeddingsByDateRange(churchId, fromDate, toDate, areaId = null) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT m.*, f.respect as family_respect, f.family_name, f.family_address, f.family_phone, f.prayer_points,
                       a.area_name, a.area_identity,
                       spouse.name as spouse_name, spouse.respect as spouse_respect,
                       CASE
                           WHEN f.respect IN ('mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop')
                           THEN UPPER(SUBSTR(f.respect, 1, 1)) || SUBSTR(f.respect, 2) || '. ' || f.family_name
                           ELSE f.family_name
                       END as family_head,
                       CASE
                           WHEN m.respect IN ('mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop')
                           THEN UPPER(SUBSTR(m.respect, 1, 1)) || SUBSTR(m.respect, 2)
                           ELSE m.respect
                       END as formatted_respect,
                       strftime('%d-%m', m.date_of_marriage) as wedding_date,
                       f.family_number
                FROM members m
                JOIN families f ON m.family_id = f.id
                JOIN areas a ON f.area_id = a.id
                LEFT JOIN members spouse ON m.spouse_id = spouse.id
                WHERE a.church_id = ? AND m.date_of_marriage IS NOT NULL AND m.is_married = 'yes' AND m.is_alive = 'alive'
                AND m.sex = 'male'
            `;
            
            let params = [churchId];
            
            // Add area filter if specified
            if (areaId) {
                query += ' AND a.id = ?';
                params.push(areaId);
            }
            
            // Add date range filter - handle year crossing
            if (fromDate && toDate) {
                const fromParts = fromDate.split('-');
                const toParts = toDate.split('-');
                const fromDay = parseInt(fromParts[0]);
                const fromMonth = parseInt(fromParts[1]);
                const toDay = parseInt(toParts[0]);
                const toMonth = parseInt(toParts[1]);
                
                if (fromMonth <= toMonth) {
                    // Same year range
                    query += ` AND (
                        (CAST(strftime('%m', m.date_of_marriage) AS INTEGER) > ? OR
                         (CAST(strftime('%m', m.date_of_marriage) AS INTEGER) = ? AND CAST(strftime('%d', m.date_of_marriage) AS INTEGER) >= ?)) AND
                        (CAST(strftime('%m', m.date_of_marriage) AS INTEGER) < ? OR
                         (CAST(strftime('%m', m.date_of_marriage) AS INTEGER) = ? AND CAST(strftime('%d', m.date_of_marriage) AS INTEGER) <= ?))
                    )`;
                    params.push(fromMonth, fromMonth, fromDay, toMonth, toMonth, toDay);
                } else {
                    // Cross year range (e.g., Dec to Jan)
                    query += ` AND (
                        (CAST(strftime('%m', m.date_of_marriage) AS INTEGER) > ? OR
                         (CAST(strftime('%m', m.date_of_marriage) AS INTEGER) = ? AND CAST(strftime('%d', m.date_of_marriage) AS INTEGER) >= ?)) OR
                        (CAST(strftime('%m', m.date_of_marriage) AS INTEGER) < ? OR
                         (CAST(strftime('%m', m.date_of_marriage) AS INTEGER) = ? AND CAST(strftime('%d', m.date_of_marriage) AS INTEGER) <= ?))
                    )`;
                    params.push(fromMonth, fromMonth, fromDay, toMonth, toMonth, toDay);
                }
            }
            
            query += ' ORDER BY strftime("%m-%d", m.date_of_marriage), m.name';
            
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async getTodaysWeddings(churchId, areaId = null) {
        return new Promise((resolve, reject) => {
            const today = new Date();
            const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
            const todayDay = String(today.getDate()).padStart(2, '0');
            
            let query = `
                SELECT m.*, f.respect as family_respect, f.family_name, a.area_name,
                       spouse.name as spouse_name, spouse.respect as spouse_respect,
                       CASE
                           WHEN f.respect IN ('mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop')
                           THEN UPPER(SUBSTR(f.respect, 1, 1)) || SUBSTR(f.respect, 2) || '. ' || f.family_name
                           ELSE f.family_name
                       END as family_head,
                       CASE
                           WHEN m.respect IN ('mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop')
                           THEN UPPER(SUBSTR(m.respect, 1, 1)) || SUBSTR(m.respect, 2)
                           ELSE m.respect
                       END as formatted_respect
                FROM members m
                JOIN families f ON m.family_id = f.id
                JOIN areas a ON f.area_id = a.id
                LEFT JOIN members spouse ON m.spouse_id = spouse.id
                WHERE a.church_id = ? AND m.date_of_marriage IS NOT NULL AND m.is_married = 'yes' AND m.is_alive = 'alive'
                AND m.sex = 'male'
                AND strftime('%m', m.date_of_marriage) = ? AND strftime('%d', m.date_of_marriage) = ?
            `;
            
            let params = [churchId, todayMonth, todayDay];
            
            if (areaId) {
                query += ' AND a.id = ?';
                params.push(areaId);
            }
            
            query += ' ORDER BY m.name';
            
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async getThisWeekWeddings(churchId, areaId = null) {
        return new Promise((resolve, reject) => {
            const today = new Date();
            const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
            
            // Calculate Sunday of current week
            const sunday = new Date(today);
            sunday.setDate(today.getDate() - currentDay);
            
            // Calculate Saturday of current week
            const saturday = new Date(sunday);
            saturday.setDate(sunday.getDate() + 6);
            
            const sundayMonth = String(sunday.getMonth() + 1).padStart(2, '0');
            const sundayDay = String(sunday.getDate()).padStart(2, '0');
            const saturdayMonth = String(saturday.getMonth() + 1).padStart(2, '0');
            const saturdayDay = String(saturday.getDate()).padStart(2, '0');
            
            let query = `
                SELECT m.*, f.respect as family_respect, f.family_name, a.area_name,
                       spouse.name as spouse_name, spouse.respect as spouse_respect,
                       CASE
                           WHEN f.respect IN ('mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop')
                           THEN UPPER(SUBSTR(f.respect, 1, 1)) || SUBSTR(f.respect, 2) || '. ' || f.family_name
                           ELSE f.family_name
                       END as family_head,
                       CASE
                           WHEN m.respect IN ('mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop')
                           THEN UPPER(SUBSTR(m.respect, 1, 1)) || SUBSTR(m.respect, 2)
                           ELSE m.respect
                       END as formatted_respect
                FROM members m
                JOIN families f ON m.family_id = f.id
                JOIN areas a ON f.area_id = a.id
                LEFT JOIN members spouse ON m.spouse_id = spouse.id
                WHERE a.church_id = ? AND m.date_of_marriage IS NOT NULL AND m.is_married = 'yes' AND m.is_alive = 'alive'
                AND m.sex = 'male'
            `;
            
            let params = [churchId];
            
            if (areaId) {
                query += ' AND a.id = ?';
                params.push(areaId);
            }
            
            // Handle week crossing month/year boundary
            if (sunday.getMonth() === saturday.getMonth()) {
                // Same month
                query += ` AND strftime('%m', m.date_of_marriage) = ?
                          AND CAST(strftime('%d', m.date_of_marriage) AS INTEGER) BETWEEN ? AND ?`;
                params.push(sundayMonth, parseInt(sundayDay), parseInt(saturdayDay));
            } else {
                // Cross month boundary
                query += ` AND (
                    (strftime('%m', m.date_of_marriage) = ? AND CAST(strftime('%d', m.date_of_marriage) AS INTEGER) >= ?) OR
                    (strftime('%m', m.date_of_marriage) = ? AND CAST(strftime('%d', m.date_of_marriage) AS INTEGER) <= ?)
                )`;
                params.push(sundayMonth, parseInt(sundayDay), saturdayMonth, parseInt(saturdayDay));
            }
            
            query += ' ORDER BY strftime("%m-%d", m.date_of_marriage), m.name';
            
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async getWeddingStatistics(churchId, areaId = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const todaysWeddings = await this.getTodaysWeddings(churchId, areaId);
                const thisWeekWeddings = await this.getThisWeekWeddings(churchId, areaId);

                resolve({
                    todayCount: todaysWeddings.length,
                    thisWeekCount: thisWeekWeddings.length
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Adult Baptism Certificate methods
    async createAdultBaptismCertificate(certificateData) {
        return new Promise((resolve, reject) => {
            const {
                church_id, certificate_number, when_baptised, christian_name, former_name,
                sex, age, abode, profession, father_name, mother_name,
                witness_name_1, witness_name_2, witness_name_3,
                where_baptised, signature_who_baptised, certified_rev_name, holding_office,
                certificate_date, certificate_place, created_by
            } = certificateData;

            const query = `
                INSERT INTO adult_baptism_certificates (
                    church_id, certificate_number, when_baptised, christian_name, former_name,
                    sex, age, abode, profession, father_name, mother_name,
                    witness_name_1, witness_name_2, witness_name_3,
                    where_baptised, signature_who_baptised, certified_rev_name, holding_office,
                    certificate_date, certificate_place, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            this.db.run(query, [
                church_id, certificate_number, when_baptised, christian_name, former_name,
                sex, age, abode, profession, father_name, mother_name,
                witness_name_1, witness_name_2, witness_name_3,
                where_baptised, signature_who_baptised, certified_rev_name, holding_office,
                certificate_date, certificate_place, created_by
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    async getAdultBaptismCertificatesByChurch(churchId, limit = 8, offset = 0) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT abc.*, u.name as created_by_name
                FROM adult_baptism_certificates abc
                LEFT JOIN users u ON abc.created_by = u.id
                WHERE abc.church_id = ?
                ORDER BY abc.created_at DESC
                LIMIT ? OFFSET ?
            `;

            this.db.all(query, [churchId, limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async getAdultBaptismCertificateById(certificateId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT abc.*, u.name as created_by_name
                FROM adult_baptism_certificates abc
                LEFT JOIN users u ON abc.created_by = u.id
                WHERE abc.id = ?
            `;

            this.db.get(query, [certificateId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getAdultBaptismCertificatesCount(churchId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT COUNT(*) as count
                FROM adult_baptism_certificates
                WHERE church_id = ?
            `;

            this.db.get(query, [churchId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.count : 0);
                }
            });
        });
    }

    async updateAdultBaptismCertificate(certificateId, certificateData) {
        return new Promise((resolve, reject) => {
            const {
                certificate_number, when_baptised, christian_name, former_name,
                sex, age, abode, profession, father_name, mother_name,
                witness_name_1, witness_name_2, witness_name_3, where_baptised,
                signature_who_baptised, certified_rev_name, holding_office, certificate_date,
                certificate_place
            } = certificateData;

            const query = `
                UPDATE adult_baptism_certificates
                SET certificate_number = ?, when_baptised = ?, christian_name = ?, former_name = ?,
                    sex = ?, age = ?, abode = ?, profession = ?, father_name = ?, mother_name = ?,
                    witness_name_1 = ?, witness_name_2 = ?, witness_name_3 = ?, where_baptised = ?,
                    signature_who_baptised = ?, certified_rev_name = ?, holding_office = ?,
                    certificate_date = ?, certificate_place = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            this.db.run(query, [
                certificate_number, when_baptised, christian_name, former_name,
                sex, age, abode, profession, father_name, mother_name,
                witness_name_1, witness_name_2, witness_name_3, where_baptised,
                signature_who_baptised, certified_rev_name, holding_office, certificate_date,
                certificate_place, certificateId
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    async deleteAdultBaptismCertificate(certificateId) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM adult_baptism_certificates WHERE id = ?';

            this.db.run(query, [certificateId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    async getNextCertificateNumber(churchId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT certificate_number
                FROM adult_baptism_certificates
                WHERE church_id = ?
                ORDER BY CAST(certificate_number AS INTEGER) DESC
                LIMIT 1
            `;

            this.db.get(query, [churchId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row && row.certificate_number) {
                        const nextNumber = parseInt(row.certificate_number) + 1;
                        resolve(String(nextNumber));
                    } else {
                        resolve('1');
                    }
                }
            });
        });
    }

    // Infant Baptism Certificate methods
    async createInfantBaptismCertificate(certificateData) {
        return new Promise((resolve, reject) => {
            const {
                church_id, certificate_number, when_baptised, christian_name, date_of_birth,
                sex, abode, profession, father_name, mother_name,
                witness_name_1, witness_name_2, witness_name_3,
                where_baptised, signature_who_baptised, certified_rev_name, holding_office,
                certificate_date, certificate_place, created_by
            } = certificateData;

            const query = `
                INSERT INTO infant_baptism_certificates (
                    church_id, certificate_number, when_baptised, christian_name, date_of_birth,
                    sex, abode, profession, father_name, mother_name,
                    witness_name_1, witness_name_2, witness_name_3,
                    where_baptised, signature_who_baptised, certified_rev_name, holding_office,
                    certificate_date, certificate_place, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            this.db.run(query, [
                church_id, certificate_number, when_baptised, christian_name, date_of_birth,
                sex, abode, profession, father_name, mother_name,
                witness_name_1, witness_name_2, witness_name_3,
                where_baptised, signature_who_baptised, certified_rev_name, holding_office,
                certificate_date, certificate_place, created_by
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    async getInfantBaptismCertificatesByChurch(churchId, limit = 8, offset = 0) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT ibc.*, u.name as created_by_name
                FROM infant_baptism_certificates ibc
                LEFT JOIN users u ON ibc.created_by = u.id
                WHERE ibc.church_id = ?
                ORDER BY ibc.created_at DESC
                LIMIT ? OFFSET ?
            `;

            this.db.all(query, [churchId, limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async getInfantBaptismCertificateById(certificateId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT ibc.*, u.name as created_by_name
                FROM infant_baptism_certificates ibc
                LEFT JOIN users u ON ibc.created_by = u.id
                WHERE ibc.id = ?
            `;

            this.db.get(query, [certificateId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getInfantBaptismCertificatesCount(churchId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT COUNT(*) as count
                FROM infant_baptism_certificates
                WHERE church_id = ?
            `;

            this.db.get(query, [churchId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.count : 0);
                }
            });
        });
    }

    async updateInfantBaptismCertificate(certificateId, certificateData) {
        return new Promise((resolve, reject) => {
            const {
                certificate_number, when_baptised, christian_name, date_of_birth,
                sex, abode, profession, father_name, mother_name,
                witness_name_1, witness_name_2, witness_name_3, where_baptised,
                signature_who_baptised, certified_rev_name, holding_office, certificate_date,
                certificate_place
            } = certificateData;

            const query = `
                UPDATE infant_baptism_certificates
                SET certificate_number = ?, when_baptised = ?, christian_name = ?, date_of_birth = ?,
                    sex = ?, abode = ?, profession = ?, father_name = ?, mother_name = ?,
                    witness_name_1 = ?, witness_name_2 = ?, witness_name_3 = ?, where_baptised = ?,
                    signature_who_baptised = ?, certified_rev_name = ?, holding_office = ?,
                    certificate_date = ?, certificate_place = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            this.db.run(query, [
                certificate_number, when_baptised, christian_name, date_of_birth,
                sex, abode, profession, father_name, mother_name,
                witness_name_1, witness_name_2, witness_name_3, where_baptised,
                signature_who_baptised, certified_rev_name, holding_office, certificate_date,
                certificate_place, certificateId
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    async deleteInfantBaptismCertificate(certificateId) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM infant_baptism_certificates WHERE id = ?';

            this.db.run(query, [certificateId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    async getNextInfantCertificateNumber(churchId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT certificate_number
                FROM infant_baptism_certificates
                WHERE church_id = ?
                ORDER BY CAST(certificate_number AS INTEGER) DESC
                LIMIT 1
            `;

            this.db.get(query, [churchId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row && row.certificate_number) {
                        const nextNumber = parseInt(row.certificate_number) + 1;
                        resolve(String(nextNumber));
                    } else {
                        resolve('1');
                    }
                }
            });
        });
    }

    // Letterpad methods
    async createLetterpad(letterpadData) {
        return new Promise((resolve, reject) => {
            const {
                pastorate_id, letterpad_number, letter_date, subject, content,
                rev_name, rev_designation, parsonage_address, created_by
            } = letterpadData;

            const query = `
                INSERT INTO letterpads (
                    pastorate_id, letterpad_number, letter_date, subject, content,
                    rev_name, rev_designation, parsonage_address, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            this.db.run(query, [
                pastorate_id, letterpad_number, letter_date, subject, content,
                rev_name, rev_designation, parsonage_address, created_by
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    async getLetterpadsByPastorate(pastorateId, limit = 8, offset = 0) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT l.*, u.name as created_by_name
                FROM letterpads l
                LEFT JOIN users u ON l.created_by = u.id
                WHERE l.pastorate_id = ?
                ORDER BY l.created_at DESC
                LIMIT ? OFFSET ?
            `;

            this.db.all(query, [pastorateId, limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    async getLetterpadByNumber(pastorateId, letterpadNumber) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT l.*, u.name as created_by_name
                FROM letterpads l
                LEFT JOIN users u ON l.created_by = u.id
                WHERE l.pastorate_id = ? AND l.letterpad_number = ?
            `;

            this.db.get(query, [pastorateId, letterpadNumber], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row || null);
                }
            });
        });
    }

    async getLetterpadById(letterpadId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT l.*, u.name as created_by_name
                FROM letterpads l
                LEFT JOIN users u ON l.created_by = u.id
                WHERE l.id = ?
            `;

            this.db.get(query, [letterpadId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getLetterpadCount(pastorateId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT COUNT(*) as count
                FROM letterpads
                WHERE pastorate_id = ?
            `;

            this.db.get(query, [pastorateId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.count : 0);
                }
            });
        });
    }

    async updateLetterpad(letterpadId, letterpadData) {
        return new Promise((resolve, reject) => {
            const {
                letterpad_number, letter_date, subject, content, rev_name, rev_designation, parsonage_address
            } = letterpadData;

            const query = `
                UPDATE letterpads
                SET letterpad_number = ?, letter_date = ?, subject = ?, content = ?, rev_name = ?, rev_designation = ?, parsonage_address = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            this.db.run(query, [
                letterpad_number, letter_date, subject, content, rev_name, rev_designation, parsonage_address, letterpadId
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    async deleteLetterpad(letterpadId) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM letterpads WHERE id = ?';

            this.db.run(query, [letterpadId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    async getNextLetterpadNumber(pastorateId) {
        return new Promise((resolve, reject) => {
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1; // 1-12
            const monthLetter = String.fromCharCode(64 + currentMonth); // A=Jan, B=Feb, etc.

            const query = `
                SELECT letterpad_number
                FROM letterpads
                WHERE pastorate_id = ? AND letterpad_number LIKE ?
                ORDER BY CAST(SUBSTR(letterpad_number, -2) AS INTEGER) DESC
                LIMIT 1
            `;

            const yearPrefix = `${currentYear}/${monthLetter}/%`;

            this.db.get(query, [pastorateId, yearPrefix], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    let nextNumber = 1;
                    if (row && row.letterpad_number) {
                        const parts = row.letterpad_number.split('/');
                        if (parts.length === 3) {
                            const lastNumber = parseInt(parts[2]);
                            nextNumber = lastNumber + 1;
                        }
                    }
                    const formattedNumber = String(nextNumber).padStart(2, '0');
                    resolve(`${currentYear}/${monthLetter}/${formattedNumber}`);
                }
            });
        });
    }

    // Letterpad Settings methods
    async getLetterpadSettings(pastorateId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM letterpad_settings
                WHERE pastorate_id = ?
            `;

            this.db.get(query, [pastorateId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async createLetterpadSettings(pastorateId, settingsData) {
        return new Promise((resolve, reject) => {
            const { default_chairman_details, default_parsonage_address } = settingsData;

            const query = `
                INSERT INTO letterpad_settings (
                    pastorate_id, default_chairman_details, default_parsonage_address
                ) VALUES (?, ?, ?)
            `;

            this.db.run(query, [
                pastorateId, default_chairman_details, default_parsonage_address
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    async updateLetterpadSettings(pastorateId, settingsData) {
        return new Promise((resolve, reject) => {
            const { default_chairman_details, default_parsonage_address } = settingsData;

            const query = `
                UPDATE letterpad_settings
                SET default_chairman_details = ?, default_parsonage_address = ?, updated_at = CURRENT_TIMESTAMP
                WHERE pastorate_id = ?
            `;

            this.db.run(query, [
                default_chairman_details, default_parsonage_address, pastorateId
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    async upsertLetterpadSettings(pastorateId, settingsData) {
        return new Promise((resolve, reject) => {
            const {
                default_rev_name,
                default_rev_designation,
                default_parsonage_address,
                // Legacy fields for backward compatibility
                default_chairman_details
            } = settingsData;

            const query = `
                INSERT INTO letterpad_settings (
                    pastorate_id, default_rev_name, default_rev_designation, default_parsonage_address
                ) VALUES (?, ?, ?, ?)
                ON CONFLICT(pastorate_id) DO UPDATE SET
                    default_rev_name = excluded.default_rev_name,
                    default_rev_designation = excluded.default_rev_designation,
                    default_parsonage_address = excluded.default_parsonage_address,
                    updated_at = CURRENT_TIMESTAMP
            `;

            this.db.run(query, [
                pastorateId, default_rev_name, default_rev_designation, default_parsonage_address
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
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