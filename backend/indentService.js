class IndentService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    // ========== DEDUCTION FIELDS MANAGEMENT ==========

    /**
     * Get all deduction fields for a pastorate
     */
    async getDeductionFields(pastorateId) {
        return new Promise((resolve, reject) => {
            this.db.db.all(`
                SELECT * FROM indent_deduction_fields
                WHERE pastorate_id = ?
                ORDER BY field_order ASC, id ASC
            `, [pastorateId], (err, rows) => {
                if (err) {
                    console.error('Error fetching deduction fields:', err);
                    reject(err);
                } else {
                    resolve({ success: true, fields: rows || [] });
                }
            });
        });
    }

    /**
     * Create a new deduction field
     */
    async createDeductionField(pastorateId, fieldData) {
        return new Promise((resolve, reject) => {
            const { field_name } = fieldData;

            // Get the next order number
            this.db.db.get(`
                SELECT MAX(field_order) as max_order
                FROM indent_deduction_fields
                WHERE pastorate_id = ?
            `, [pastorateId], (err, row) => {
                if (err) {
                    console.error('Error getting max order:', err);
                    reject(err);
                    return;
                }

                const nextOrder = (row?.max_order || 0) + 1;

                this.db.db.run(`
                    INSERT INTO indent_deduction_fields (
                        pastorate_id, field_name, field_order
                    ) VALUES (?, ?, ?)
                `, [pastorateId, field_name, nextOrder], function(err) {
                    if (err) {
                        console.error('Error creating deduction field:', err);
                        reject(err);
                    } else {
                        resolve({ success: true, id: this.lastID });
                    }
                });
            });
        });
    }

    /**
     * Update a deduction field
     */
    async updateDeductionField(fieldId, fieldData) {
        return new Promise((resolve, reject) => {
            const { field_name } = fieldData;

            this.db.db.run(`
                UPDATE indent_deduction_fields
                SET field_name = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [field_name, fieldId], function(err) {
                if (err) {
                    console.error('Error updating deduction field:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    /**
     * Delete a deduction field
     */
    async deleteDeductionField(fieldId) {
        return new Promise((resolve, reject) => {
            this.db.db.run(`
                DELETE FROM indent_deduction_fields WHERE id = ?
            `, [fieldId], function(err) {
                if (err) {
                    console.error('Error deleting deduction field:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    // ========== EMPLOYEE MANAGEMENT ==========

    /**
     * Get all employees for a pastorate
     */
    async getEmployees(pastorateId, filters = {}) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT * FROM indent_employees
                WHERE pastorate_id = ?
            `;
            const params = [pastorateId];

            // Add filters if needed
            if (filters.search) {
                query += ` AND (name LIKE ? OR position LIKE ?)`;
                params.push(`%${filters.search}%`, `%${filters.search}%`);
            }

            query += ` ORDER BY created_at DESC`;

            this.db.db.all(query, params, (err, rows) => {
                if (err) {
                    console.error('Error fetching employees:', err);
                    reject(err);
                } else {
                    // Parse custom_deductions JSON for each employee
                    const employees = rows.map(emp => ({
                        ...emp,
                        custom_deductions: emp.custom_deductions ? JSON.parse(emp.custom_deductions) : {}
                    }));
                    resolve({ success: true, employees });
                }
            });
        });
    }

    /**
     * Get a single employee by ID
     */
    async getEmployeeById(employeeId) {
        return new Promise((resolve, reject) => {
            this.db.db.get(`
                SELECT * FROM indent_employees WHERE id = ?
            `, [employeeId], (err, row) => {
                if (err) {
                    console.error('Error fetching employee:', err);
                    reject(err);
                } else if (!row) {
                    resolve({ success: false, error: 'Employee not found' });
                } else {
                    const employee = {
                        ...row,
                        custom_deductions: row.custom_deductions ? JSON.parse(row.custom_deductions) : {}
                    };
                    resolve({ success: true, employee });
                }
            });
        });
    }

    /**
     * Create a new employee
     */
    async createEmployee(pastorateId, userId, employeeData) {
        return new Promise((resolve, reject) => {
            const {
                name,
                position,
                date_of_birth,
                salary,
                da,
                dpf,
                cpf,
                dfbf,
                cswf,
                dmaf,
                sangam,
                custom_deductions
            } = employeeData;

            const customDeductionsJson = JSON.stringify(custom_deductions || {});

            this.db.db.run(`
                INSERT INTO indent_employees (
                    pastorate_id, name, position, date_of_birth,
                    salary, da, dpf, cpf, dfbf, cswf, dmaf, sangam,
                    custom_deductions, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                pastorateId, name, position, date_of_birth,
                salary || 0, da || 0, dpf || 0, cpf || 0,
                dfbf || 0, cswf || 0, dmaf || 0, sangam || 0,
                customDeductionsJson, userId
            ], function(err) {
                if (err) {
                    console.error('Error creating employee:', err);
                    reject(err);
                } else {
                    resolve({ success: true, id: this.lastID });
                }
            });
        });
    }

    /**
     * Update an employee
     */
    async updateEmployee(employeeId, employeeData) {
        return new Promise((resolve, reject) => {
            const {
                name,
                position,
                date_of_birth,
                salary,
                da,
                dpf,
                cpf,
                dfbf,
                cswf,
                dmaf,
                sangam,
                custom_deductions
            } = employeeData;

            const customDeductionsJson = JSON.stringify(custom_deductions || {});

            this.db.db.run(`
                UPDATE indent_employees
                SET name = ?, position = ?, date_of_birth = ?,
                    salary = ?, da = ?, dpf = ?, cpf = ?,
                    dfbf = ?, cswf = ?, dmaf = ?, sangam = ?,
                    custom_deductions = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                name, position, date_of_birth,
                salary || 0, da || 0, dpf || 0, cpf || 0,
                dfbf || 0, cswf || 0, dmaf || 0, sangam || 0,
                customDeductionsJson, employeeId
            ], function(err) {
                if (err) {
                    console.error('Error updating employee:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    /**
     * Delete an employee
     */
    async deleteEmployee(employeeId) {
        return new Promise((resolve, reject) => {
            this.db.db.run(`
                DELETE FROM indent_employees WHERE id = ?
            `, [employeeId], function(err) {
                if (err) {
                    console.error('Error deleting employee:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    // ========== ALLOWANCE FIELDS MANAGEMENT ==========

    /**
     * Get all allowance fields for a pastorate
     */
    async getAllowanceFields(pastorateId) {
        return new Promise((resolve, reject) => {
            this.db.db.all(`
                SELECT * FROM indent_allowance_fields
                WHERE pastorate_id = ?
                ORDER BY field_order ASC, id ASC
            `, [pastorateId], (err, rows) => {
                if (err) {
                    console.error('Error fetching allowance fields:', err);
                    reject(err);
                } else {
                    resolve({ success: true, fields: rows || [] });
                }
            });
        });
    }

    /**
     * Create a new allowance field
     */
    async createAllowanceField(pastorateId, fieldData) {
        return new Promise((resolve, reject) => {
            const { field_name } = fieldData;

            // Get the next order number
            this.db.db.get(`
                SELECT MAX(field_order) as max_order
                FROM indent_allowance_fields
                WHERE pastorate_id = ?
            `, [pastorateId], (err, row) => {
                if (err) {
                    console.error('Error getting max order:', err);
                    reject(err);
                    return;
                }

                const nextOrder = (row?.max_order || 0) + 1;

                this.db.db.run(`
                    INSERT INTO indent_allowance_fields (
                        pastorate_id, field_name, field_order
                    ) VALUES (?, ?, ?)
                `, [pastorateId, field_name, nextOrder], function(err) {
                    if (err) {
                        console.error('Error creating allowance field:', err);
                        reject(err);
                    } else {
                        resolve({ success: true, id: this.lastID });
                    }
                });
            });
        });
    }

    /**
     * Update an allowance field
     */
    async updateAllowanceField(fieldId, fieldData) {
        return new Promise((resolve, reject) => {
            const { field_name } = fieldData;

            this.db.db.run(`
                UPDATE indent_allowance_fields
                SET field_name = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [field_name, fieldId], function(err) {
                if (err) {
                    console.error('Error updating allowance field:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    /**
     * Delete an allowance field
     */
    async deleteAllowanceField(fieldId) {
        return new Promise((resolve, reject) => {
            this.db.db.run(`
                DELETE FROM indent_allowance_fields WHERE id = ?
            `, [fieldId], function(err) {
                if (err) {
                    console.error('Error deleting allowance field:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    // ========== ALLOWANCE MANAGEMENT ==========

    /**
     * Get all allowances for a pastorate
     */
    async getAllowances(pastorateId, filters = {}) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT * FROM indent_allowances
                WHERE pastorate_id = ?
            `;
            const params = [pastorateId];

            // Add filters if needed
            if (filters.search) {
                query += ` AND (name LIKE ? OR position LIKE ? OR allowance_name LIKE ?)`;
                params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
            }

            query += ` ORDER BY created_at DESC`;

            this.db.db.all(query, params, (err, rows) => {
                if (err) {
                    console.error('Error fetching allowances:', err);
                    reject(err);
                } else {
                    resolve({ success: true, allowances: rows || [] });
                }
            });
        });
    }

    /**
     * Get a single allowance by ID
     */
    async getAllowanceById(allowanceId) {
        return new Promise((resolve, reject) => {
            this.db.db.get(`
                SELECT * FROM indent_allowances WHERE id = ?
            `, [allowanceId], (err, row) => {
                if (err) {
                    console.error('Error fetching allowance:', err);
                    reject(err);
                } else if (!row) {
                    resolve({ success: false, error: 'Allowance not found' });
                } else {
                    resolve({ success: true, allowance: row });
                }
            });
        });
    }

    /**
     * Create a new allowance
     */
    async createAllowance(pastorateId, userId, allowanceData) {
        return new Promise((resolve, reject) => {
            const {
                name,
                position,
                date_of_birth,
                allowance_name,
                allowance_amount
            } = allowanceData;

            this.db.db.run(`
                INSERT INTO indent_allowances (
                    pastorate_id, name, position, date_of_birth,
                    allowance_name, allowance_amount, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                pastorateId, name, position, date_of_birth,
                allowance_name, allowance_amount || 0, userId
            ], function(err) {
                if (err) {
                    console.error('Error creating allowance:', err);
                    reject(err);
                } else {
                    resolve({ success: true, id: this.lastID });
                }
            });
        });
    }

    /**
     * Update an allowance
     */
    async updateAllowance(allowanceId, allowanceData) {
        return new Promise((resolve, reject) => {
            const {
                name,
                position,
                date_of_birth,
                allowance_name,
                allowance_amount
            } = allowanceData;

            this.db.db.run(`
                UPDATE indent_allowances
                SET name = ?, position = ?, date_of_birth = ?,
                    allowance_name = ?, allowance_amount = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                name, position, date_of_birth,
                allowance_name, allowance_amount || 0, allowanceId
            ], function(err) {
                if (err) {
                    console.error('Error updating allowance:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    /**
     * Delete an allowance
     */
    async deleteAllowance(allowanceId) {
        return new Promise((resolve, reject) => {
            this.db.db.run(`
                DELETE FROM indent_allowances WHERE id = ?
            `, [allowanceId], function(err) {
                if (err) {
                    console.error('Error deleting allowance:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    // ========== PAYMENT FIELDS MANAGEMENT ==========

    /**
     * Get all payment fields for a pastorate
     */
    async getPaymentFields(pastorateId) {
        return new Promise((resolve, reject) => {
            this.db.db.all(`
                SELECT * FROM indent_payment_fields
                WHERE pastorate_id = ?
                ORDER BY field_order ASC, id ASC
            `, [pastorateId], (err, rows) => {
                if (err) {
                    console.error('Error fetching payment fields:', err);
                    reject(err);
                } else {
                    resolve({ success: true, fields: rows || [] });
                }
            });
        });
    }

    /**
     * Create a new payment field
     */
    async createPaymentField(pastorateId, fieldData) {
        return new Promise((resolve, reject) => {
            const { field_name } = fieldData;

            this.db.db.get(`
                SELECT MAX(field_order) as max_order
                FROM indent_payment_fields
                WHERE pastorate_id = ?
            `, [pastorateId], (err, row) => {
                if (err) {
                    console.error('Error getting max order:', err);
                    reject(err);
                    return;
                }

                const nextOrder = (row?.max_order || 0) + 1;

                this.db.db.run(`
                    INSERT INTO indent_payment_fields (
                        pastorate_id, field_name, field_order
                    ) VALUES (?, ?, ?)
                `, [pastorateId, field_name, nextOrder], function(err) {
                    if (err) {
                        console.error('Error creating payment field:', err);
                        reject(err);
                    } else {
                        resolve({ success: true, id: this.lastID });
                    }
                });
            });
        });
    }

    /**
     * Update a payment field
     */
    async updatePaymentField(fieldId, fieldData) {
        return new Promise((resolve, reject) => {
            const { field_name } = fieldData;

            this.db.db.run(`
                UPDATE indent_payment_fields
                SET field_name = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [field_name, fieldId], function(err) {
                if (err) {
                    console.error('Error updating payment field:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    /**
     * Delete a payment field
     */
    async deletePaymentField(fieldId) {
        return new Promise((resolve, reject) => {
            this.db.db.run(`
                DELETE FROM indent_payment_fields WHERE id = ?
            `, [fieldId], function(err) {
                if (err) {
                    console.error('Error deleting payment field:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    // ========== PAYMENTS MANAGEMENT ==========

    /**
     * Get all payments for a pastorate
     */
    async getPayments(pastorateId, filters = {}) {
        return new Promise((resolve, reject) => {
            this.db.db.all(`
                SELECT * FROM indent_payments
                WHERE pastorate_id = ?
                ORDER BY created_at DESC
            `, [pastorateId], (err, rows) => {
                if (err) {
                    console.error('Error fetching payments:', err);
                    reject(err);
                } else {
                    resolve({ success: true, payments: rows || [] });
                }
            });
        });
    }

    /**
     * Get a single payment by ID
     */
    async getPaymentById(paymentId) {
        return new Promise((resolve, reject) => {
            this.db.db.get(`
                SELECT * FROM indent_payments WHERE id = ?
            `, [paymentId], (err, row) => {
                if (err) {
                    console.error('Error fetching payment:', err);
                    reject(err);
                } else {
                    resolve({ success: true, payment: row });
                }
            });
        });
    }

    /**
     * Create a new payment
     */
    async createPayment(pastorateId, userId, paymentData) {
        return new Promise((resolve, reject) => {
            const { payment_name, payment_amount } = paymentData;

            this.db.db.run(`
                INSERT INTO indent_payments (
                    pastorate_id, payment_name, payment_amount, created_by
                ) VALUES (?, ?, ?, ?)
            `, [pastorateId, payment_name, payment_amount, userId], function(err) {
                if (err) {
                    console.error('Error creating payment:', err);
                    reject(err);
                } else {
                    resolve({ success: true, id: this.lastID });
                }
            });
        });
    }

    /**
     * Update a payment
     */
    async updatePayment(paymentId, paymentData) {
        return new Promise((resolve, reject) => {
            const { payment_name, payment_amount } = paymentData;

            this.db.db.run(`
                UPDATE indent_payments
                SET payment_name = ?, payment_amount = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [payment_name, payment_amount, paymentId], function(err) {
                if (err) {
                    console.error('Error updating payment:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    /**
     * Delete a payment
     */
    async deletePayment(paymentId) {
        return new Promise((resolve, reject) => {
            this.db.db.run(`
                DELETE FROM indent_payments WHERE id = ?
            `, [paymentId], function(err) {
                if (err) {
                    console.error('Error deleting payment:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    // ========== MONTHLY PAYOUTS MANAGEMENT ==========

    /**
     * Get all monthly payouts for a pastorate
     */
    async getMonthlyPayouts(pastorateId, filters = {}) {
        return new Promise((resolve, reject) => {
            this.db.db.all(`
                SELECT * FROM indent_monthly_payouts
                WHERE pastorate_id = ?
                ORDER BY year DESC, month DESC
            `, [pastorateId], (err, rows) => {
                if (err) {
                    console.error('Error fetching monthly payouts:', err);
                    reject(err);
                } else {
                    resolve({ success: true, payouts: rows || [] });
                }
            });
        });
    }

    /**
     * Get a single monthly payout by ID
     */
    async getMonthlyPayoutById(payoutId) {
        return new Promise((resolve, reject) => {
            this.db.db.get(`
                SELECT * FROM indent_monthly_payouts WHERE id = ?
            `, [payoutId], (err, row) => {
                if (err) {
                    console.error('Error fetching monthly payout:', err);
                    reject(err);
                } else {
                    resolve({ success: true, payout: row });
                }
            });
        });
    }

    /**
     * Create a new monthly payout
     */
    async createMonthlyPayout(pastorateId, userId, payoutData) {
        return new Promise((resolve, reject) => {
            const { month, year, total_amount, snapshot_data } = payoutData;

            this.db.db.run(`
                INSERT INTO indent_monthly_payouts (
                    pastorate_id, month, year, total_amount, snapshot_data, created_by
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [pastorateId, month, year, total_amount, snapshot_data, userId], function(err) {
                if (err) {
                    console.error('Error creating monthly payout:', err);
                    reject(err);
                } else {
                    resolve({ success: true, id: this.lastID });
                }
            });
        });
    }

    /**
     * Update a monthly payout
     */
    async updateMonthlyPayout(payoutId, payoutData) {
        return new Promise((resolve, reject) => {
            const { month, year, total_amount, snapshot_data } = payoutData;

            this.db.db.run(`
                UPDATE indent_monthly_payouts
                SET month = ?, year = ?, total_amount = ?, snapshot_data = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [month, year, total_amount, snapshot_data, payoutId], function(err) {
                if (err) {
                    console.error('Error updating monthly payout:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    /**
     * Delete a monthly payout
     */
    async deleteMonthlyPayout(payoutId) {
        return new Promise((resolve, reject) => {
            this.db.db.run(`
                DELETE FROM indent_monthly_payouts WHERE id = ?
            `, [payoutId], function(err) {
                if (err) {
                    console.error('Error deleting monthly payout:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    // ========== EMPLOYEE SALARY MANAGEMENT ==========

    /**
     * Get all employees from salary table
     */
    async getEmployeeSalaries(pastorateId, filters = {}) {
        return new Promise((resolve, reject) => {
            this.db.db.all(`
                SELECT * FROM indent_employee_salary
                WHERE pastorate_id = ?
                ORDER BY created_at DESC
            `, [pastorateId], (err, rows) => {
                if (err) {
                    console.error('Error fetching employee salaries:', err);
                    reject(err);
                } else {
                    resolve({ success: true, employees: rows || [] });
                }
            });
        });
    }

    /**
     * Get employee salary by ID
     */
    async getEmployeeSalaryById(employeeId) {
        return new Promise((resolve, reject) => {
            this.db.db.get(`
                SELECT * FROM indent_employee_salary WHERE id = ?
            `, [employeeId], (err, row) => {
                if (err) {
                    console.error('Error fetching employee salary:', err);
                    reject(err);
                } else {
                    resolve({ success: true, employee: row });
                }
            });
        });
    }

    /**
     * Create a new employee (salary + auto-create allowance and deduction entries)
     */
    async createEmployeeSalary(pastorateId, userId, employeeData) {
        return new Promise((resolve, reject) => {
            const { name, position, date_of_birth, salary } = employeeData;
            const db = this.db.db; // Capture db reference before callback

            db.run(`
                INSERT INTO indent_employee_salary (
                    pastorate_id, name, position, date_of_birth, salary, created_by
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [pastorateId, name, position, date_of_birth, salary, userId], function(err) {
                if (err) {
                    console.error('Error creating employee salary:', err);
                    reject(err);
                    return;
                }

                const employeeId = this.lastID;

                // Auto-create allowance entry
                db.run(`
                    INSERT INTO indent_employee_allowances (
                        employee_id, pastorate_id, dearness_allowance, total_allowance
                    ) VALUES (?, ?, 0, 0)
                `, [employeeId, pastorateId], (err2) => {
                    if (err2) {
                        console.error('Error creating employee allowance:', err2);
                        reject(err2);
                        return;
                    }

                    // Auto-create deduction entry
                    db.run(`
                        INSERT INTO indent_employee_deductions (
                            employee_id, pastorate_id, sangam, dpf, cpf, dfbf, cswf, dmaf, total_deduction
                        ) VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0)
                    `, [employeeId, pastorateId], (err3) => {
                        if (err3) {
                            console.error('Error creating employee deduction:', err3);
                            reject(err3);
                        } else {
                            resolve({ success: true, employeeId: employeeId });
                        }
                    });
                });
            });
        });
    }

    /**
     * Update employee salary
     */
    async updateEmployeeSalary(employeeId, employeeData) {
        return new Promise((resolve, reject) => {
            const { name, position, date_of_birth, salary } = employeeData;

            this.db.db.run(`
                UPDATE indent_employee_salary
                SET name = ?, position = ?, date_of_birth = ?, salary = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [name, position, date_of_birth, salary, employeeId], function(err) {
                if (err) {
                    console.error('Error updating employee salary:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    /**
     * Delete employee (cascades to allowance and deduction tables)
     */
    async deleteEmployeeSalary(employeeId) {
        return new Promise((resolve, reject) => {
            this.db.db.run(`
                DELETE FROM indent_employee_salary WHERE id = ?
            `, [employeeId], function(err) {
                if (err) {
                    console.error('Error deleting employee salary:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    // ========== EMPLOYEE ALLOWANCE MANAGEMENT ==========

    /**
     * Get all employee allowances with employee info
     */
    async getEmployeeAllowances(pastorateId) {
        return new Promise((resolve, reject) => {
            this.db.db.all(`
                SELECT
                    ea.*,
                    es.name,
                    es.position
                FROM indent_employee_allowances ea
                JOIN indent_employee_salary es ON ea.employee_id = es.id
                WHERE ea.pastorate_id = ?
                ORDER BY es.name ASC
            `, [pastorateId], (err, rows) => {
                if (err) {
                    console.error('Error fetching employee allowances:', err);
                    reject(err);
                } else {
                    resolve({ success: true, allowances: rows || [] });
                }
            });
        });
    }

    /**
     * Get employee allowance by employee ID
     */
    async getEmployeeAllowanceByEmployeeId(employeeId) {
        return new Promise((resolve, reject) => {
            this.db.db.get(`
                SELECT
                    ea.*,
                    es.name,
                    es.position
                FROM indent_employee_allowances ea
                JOIN indent_employee_salary es ON ea.employee_id = es.id
                WHERE ea.employee_id = ?
            `, [employeeId], (err, row) => {
                if (err) {
                    console.error('Error fetching employee allowance:', err);
                    reject(err);
                } else {
                    resolve({ success: true, allowance: row });
                }
            });
        });
    }

    /**
     * Update employee allowance
     */
    async updateEmployeeAllowance(employeeId, allowanceData) {
        return new Promise((resolve, reject) => {
            const { dearness_allowance, custom_allowances, total_allowance } = allowanceData;

            this.db.db.run(`
                UPDATE indent_employee_allowances
                SET dearness_allowance = ?, custom_allowances = ?, total_allowance = ?, updated_at = CURRENT_TIMESTAMP
                WHERE employee_id = ?
            `, [dearness_allowance, custom_allowances, total_allowance, employeeId], function(err) {
                if (err) {
                    console.error('Error updating employee allowance:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    /**
     * Get employee allowance fields
     */
    async getEmployeeAllowanceFields(pastorateId) {
        return new Promise((resolve, reject) => {
            this.db.db.all(`
                SELECT * FROM indent_employee_allowance_fields
                WHERE pastorate_id = ?
                ORDER BY field_order ASC, id ASC
            `, [pastorateId], (err, rows) => {
                if (err) {
                    console.error('Error fetching employee allowance fields:', err);
                    reject(err);
                } else {
                    resolve({ success: true, fields: rows || [] });
                }
            });
        });
    }

    /**
     * Create employee allowance field
     */
    async createEmployeeAllowanceField(pastorateId, fieldData) {
        return new Promise((resolve, reject) => {
            const { field_name } = fieldData;

            this.db.db.get(`
                SELECT MAX(field_order) as max_order
                FROM indent_employee_allowance_fields
                WHERE pastorate_id = ?
            `, [pastorateId], (err, row) => {
                if (err) {
                    console.error('Error getting max order:', err);
                    reject(err);
                    return;
                }

                const nextOrder = (row?.max_order || 0) + 1;

                this.db.db.run(`
                    INSERT INTO indent_employee_allowance_fields (
                        pastorate_id, field_name, field_order
                    ) VALUES (?, ?, ?)
                `, [pastorateId, field_name, nextOrder], function(err) {
                    if (err) {
                        console.error('Error creating employee allowance field:', err);
                        reject(err);
                    } else {
                        resolve({ success: true, fieldId: this.lastID });
                    }
                });
            });
        });
    }

    /**
     * Delete employee allowance field
     */
    async deleteEmployeeAllowanceField(fieldId) {
        return new Promise((resolve, reject) => {
            this.db.db.run(`
                DELETE FROM indent_employee_allowance_fields WHERE id = ?
            `, [fieldId], function(err) {
                if (err) {
                    console.error('Error deleting employee allowance field:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    // ========== EMPLOYEE DEDUCTION MANAGEMENT ==========

    /**
     * Get all employee deductions with employee info
     */
    async getEmployeeDeductions(pastorateId) {
        return new Promise((resolve, reject) => {
            this.db.db.all(`
                SELECT
                    ed.*,
                    es.name,
                    es.position
                FROM indent_employee_deductions ed
                JOIN indent_employee_salary es ON ed.employee_id = es.id
                WHERE ed.pastorate_id = ?
                ORDER BY es.name ASC
            `, [pastorateId], (err, rows) => {
                if (err) {
                    console.error('Error fetching employee deductions:', err);
                    reject(err);
                } else {
                    resolve({ success: true, deductions: rows || [] });
                }
            });
        });
    }

    /**
     * Get employee deduction by employee ID
     */
    async getEmployeeDeductionByEmployeeId(employeeId) {
        return new Promise((resolve, reject) => {
            this.db.db.get(`
                SELECT
                    ed.*,
                    es.name,
                    es.position
                FROM indent_employee_deductions ed
                JOIN indent_employee_salary es ON ed.employee_id = es.id
                WHERE ed.employee_id = ?
            `, [employeeId], (err, row) => {
                if (err) {
                    console.error('Error fetching employee deduction:', err);
                    reject(err);
                } else {
                    resolve({ success: true, deduction: row });
                }
            });
        });
    }

    /**
     * Update employee deduction
     */
    async updateEmployeeDeduction(employeeId, deductionData) {
        return new Promise((resolve, reject) => {
            const { sangam, dpf, cpf, dfbf, cswf, dmaf, custom_deductions, total_deduction } = deductionData;

            this.db.db.run(`
                UPDATE indent_employee_deductions
                SET sangam = ?, dpf = ?, cpf = ?, dfbf = ?, cswf = ?, dmaf = ?,
                    custom_deductions = ?, total_deduction = ?, updated_at = CURRENT_TIMESTAMP
                WHERE employee_id = ?
            `, [sangam, dpf, cpf, dfbf, cswf, dmaf, custom_deductions, total_deduction, employeeId], function(err) {
                if (err) {
                    console.error('Error updating employee deduction:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }

    /**
     * Get employee deduction fields
     */
    async getEmployeeDeductionFields(pastorateId) {
        return new Promise((resolve, reject) => {
            this.db.db.all(`
                SELECT * FROM indent_employee_deduction_fields
                WHERE pastorate_id = ?
                ORDER BY field_order ASC, id ASC
            `, [pastorateId], (err, rows) => {
                if (err) {
                    console.error('Error fetching employee deduction fields:', err);
                    reject(err);
                } else {
                    resolve({ success: true, fields: rows || [] });
                }
            });
        });
    }

    /**
     * Create employee deduction field
     */
    async createEmployeeDeductionField(pastorateId, fieldData) {
        return new Promise((resolve, reject) => {
            const { field_name } = fieldData;

            this.db.db.get(`
                SELECT MAX(field_order) as max_order
                FROM indent_employee_deduction_fields
                WHERE pastorate_id = ?
            `, [pastorateId], (err, row) => {
                if (err) {
                    console.error('Error getting max order:', err);
                    reject(err);
                    return;
                }

                const nextOrder = (row?.max_order || 0) + 1;

                this.db.db.run(`
                    INSERT INTO indent_employee_deduction_fields (
                        pastorate_id, field_name, field_order
                    ) VALUES (?, ?, ?)
                `, [pastorateId, field_name, nextOrder], function(err) {
                    if (err) {
                        console.error('Error creating employee deduction field:', err);
                        reject(err);
                    } else {
                        resolve({ success: true, fieldId: this.lastID });
                    }
                });
            });
        });
    }

    /**
     * Delete employee deduction field
     */
    async deleteEmployeeDeductionField(fieldId) {
        return new Promise((resolve, reject) => {
            this.db.db.run(`
                DELETE FROM indent_employee_deduction_fields WHERE id = ?
            `, [fieldId], function(err) {
                if (err) {
                    console.error('Error deleting employee deduction field:', err);
                    reject(err);
                } else {
                    resolve({ success: true, changes: this.changes });
                }
            });
        });
    }
}

module.exports = IndentService;

