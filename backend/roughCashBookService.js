class RoughCashBookService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    /**
     * Get rough cash book report data for a specific month
     * @param {number} pastorateId - The pastorate ID
     * @param {number} userId - The user ID
     * @param {string} month - Month in format 'YYYY-MM'
     * @returns {Promise} - Promise resolving to report data
     */
    async getReportData(pastorateId, userId, month) {
        try {
            console.log('🔄 Fetching rough cash book data for pastorate:', pastorateId, 'month:', month);

            // Verify user has access to this pastorate
            const userPastorates = await this.db.getUserPastorates(userId);
            const hasAccess = userPastorates.some(p => p.id === pastorateId);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this pastorate' };
            }

            // Get pastorate settings
            const pastorateSettings = await this.db.getPastorateSettings(pastorateId);
            const pastorate = userPastorates.find(p => p.id === pastorateId);

            // Calculate date range for the selected month
            const [year, monthNum] = month.split('-');
            const startDate = `${year}-${monthNum}-01`;
            const endDate = new Date(year, parseInt(monthNum), 0).toISOString().split('T')[0]; // Last day of month

            // Calculate opening balance (balance at end of previous month)
            const openingBalance = await this.calculateOpeningBalance(pastorateId, month);

            // Fetch all transactions for the month
            const receipts = await this.getReceiptTransactions(pastorateId, month);
            const offerings = await this.getChurchOfferings(pastorateId, month);
            const otherCredits = await this.getOtherCreditTransactions(pastorateId, month);
            const billVouchers = await this.getBillVoucherTransactions(pastorateId, month);
            const contraTransactions = await this.getContraTransactions(pastorateId, month);

            // NEW: Fetch monthly payout snapshot data for Acquittance and Indent sections
            const monthlyPayoutData = await this.getMonthlyPayoutSnapshot(pastorateId, month);

            // Calculate totals (now using snapshot data instead of acquittance transactions)
            const totalCredits = this.calculateTotalCredits(receipts, offerings, otherCredits, contraTransactions);
            const totalDebits = this.calculateTotalDebits(billVouchers, monthlyPayoutData, contraTransactions);
            const closingBalance = {
                cash: openingBalance.cash + totalCredits.cash - totalDebits.cash,
                bank: openingBalance.bank + totalCredits.bank - totalDebits.bank,
                diocese: openingBalance.diocese + totalCredits.diocese - totalDebits.diocese
            };

            return {
                success: true,
                reportData: {
                    pastorate,
                    pastorateSettings,
                    month,
                    openingBalance,
                    receipts,
                    offerings,
                    otherCredits,
                    billVouchers,
                    monthlyPayoutData, // NEW: Contains acquittance and indent data from snapshot
                    contraTransactions,
                    totalCredits,
                    totalDebits,
                    closingBalance
                }
            };
        } catch (error) {
            console.error('❌ Error fetching rough cash book data:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate opening balance (balance at end of previous month)
     */
    async calculateOpeningBalance(pastorateId, month) {
        return new Promise((resolve) => {
            const [year, monthNum] = month.split('-');
            const prevMonth = new Date(year, parseInt(monthNum) - 1, 0);
            const prevMonthEnd = prevMonth.toISOString().split('T')[0];

            // Calculate balance for each account type up to the end of previous month
            const queries = ['cash', 'bank', 'diocese'].map(bookType => {
                return new Promise((resolveBook) => {
                    this.db.db.get(`
                        SELECT 
                            -- Income from receipts
                            COALESCE((SELECT SUM(amount) FROM receipt_transactions 
                                WHERE pastorate_id = ? AND book_type = ? AND date <= ?), 0) +
                            -- Income from offerings (only for cash book)
                            COALESCE((SELECT SUM(amount) FROM offering_transactions 
                                WHERE pastorate_id = ? AND date <= ?), 0) * (CASE WHEN ? = 'cash' THEN 1 ELSE 0 END) +
                            -- Income from other credits
                            COALESCE((SELECT SUM(amount) FROM other_credit_transactions 
                                WHERE pastorate_id = ? AND book_type = ? AND date <= ?), 0) +
                            -- Income from contra (transfers TO this account)
                            COALESCE((SELECT SUM(amount) FROM contra_transactions
                                WHERE pastorate_id = ? AND to_account_type = ? AND date <= ?
                                AND from_account_type IN ('cash', 'bank', 'diocese')), 0) -
                            -- Expense from bill vouchers
                            COALESCE((SELECT SUM(amount) FROM bill_voucher_transactions 
                                WHERE pastorate_id = ? AND book_type = ? AND date <= ?), 0) -
                            -- Expense from acquittance
                            COALESCE((SELECT SUM(amount) FROM acquittance_transactions 
                                WHERE pastorate_id = ? AND book_type = ? AND date <= ?), 0) -
                            -- Expense from contra (transfers FROM this account)
                            COALESCE((SELECT SUM(amount) FROM contra_transactions
                                WHERE pastorate_id = ? AND from_account_type = ? AND date <= ?), 0)
                        AS balance
                    `, [
                        pastorateId, bookType, prevMonthEnd,
                        pastorateId, prevMonthEnd, bookType,
                        pastorateId, bookType, prevMonthEnd,
                        pastorateId, bookType, prevMonthEnd,
                        pastorateId, bookType, prevMonthEnd,
                        pastorateId, bookType, prevMonthEnd,
                        pastorateId, bookType, prevMonthEnd
                    ], (err, row) => {
                        if (err) {
                            console.error(`Error calculating opening balance for ${bookType}:`, err);
                            resolveBook({ bookType, balance: 0 });
                        } else {
                            resolveBook({ bookType, balance: parseFloat(row?.balance || 0) });
                        }
                    });
                });
            });

            Promise.all(queries).then(results => {
                const balances = {
                    cash: results.find(r => r.bookType === 'cash')?.balance || 0,
                    bank: results.find(r => r.bookType === 'bank')?.balance || 0,
                    diocese: results.find(r => r.bookType === 'diocese')?.balance || 0
                };
                resolve(balances);
            });
        });
    }

    /**
     * Get receipt transactions for the month
     */
    async getReceiptTransactions(pastorateId, month) {
        return new Promise((resolve) => {
            this.db.db.all(`
                SELECT
                    rt.*,
                    COALESCE(f.family_name, '') as family_name,
                    COALESCE(f.respect, '') as respect,
                    COALESCE(f.family_number, '') as family_number,
                    COALESCE(a.area_identity, '') as area_identity
                FROM receipt_transactions rt
                LEFT JOIN families f ON rt.family_id = f.id
                LEFT JOIN areas a ON f.area_id = a.id
                WHERE rt.pastorate_id = ?
                AND strftime('%Y-%m', rt.date) = ?
                ORDER BY rt.date ASC, rt.id ASC
            `, [pastorateId, month], (err, rows) => {
                if (err) {
                    console.error('Error fetching receipt transactions:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    /**
     * Get church offerings (filtered by "Church offertory" category)
     */
    async getChurchOfferings(pastorateId, month) {
        return new Promise((resolve) => {
            this.db.db.all(`
                SELECT 
                    ot.*,
                    c.church_name
                FROM offering_transactions ot
                LEFT JOIN churches c ON ot.church_id = c.id
                WHERE ot.pastorate_id = ? 
                AND strftime('%Y-%m', ot.date) = ?
                AND LOWER(ot.offering_type) LIKE '%church%offert%'
                ORDER BY ot.date ASC, ot.id ASC
            `, [pastorateId, month], (err, rows) => {
                if (err) {
                    console.error('Error fetching church offerings:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    /**
     * Get other credit transactions for the month
     */
    async getOtherCreditTransactions(pastorateId, month) {
        return new Promise((resolve) => {
            this.db.db.all(`
                SELECT
                    oct.*,
                    pc.category_name as primary_category_name
                FROM other_credit_transactions oct
                LEFT JOIN ledger_categories pc ON oct.primary_category_id = pc.id
                WHERE oct.pastorate_id = ?
                AND strftime('%Y-%m', oct.date) = ?
                ORDER BY oct.date ASC, oct.id ASC
            `, [pastorateId, month], (err, rows) => {
                if (err) {
                    console.error('Error fetching other credit transactions:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    /**
     * Get bill voucher transactions for the month
     */
    async getBillVoucherTransactions(pastorateId, month) {
        return new Promise((resolve) => {
            this.db.db.all(`
                SELECT
                    bvt.*,
                    pc.category_name as primary_category_name
                FROM bill_voucher_transactions bvt
                LEFT JOIN ledger_categories pc ON bvt.primary_category_id = pc.id
                WHERE bvt.pastorate_id = ?
                AND strftime('%Y-%m', bvt.date) = ?
                ORDER BY bvt.date ASC, bvt.id ASC
            `, [pastorateId, month], (err, rows) => {
                if (err) {
                    console.error('Error fetching bill voucher transactions:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    /**
     * Get monthly payout snapshot data for the selected month
     * Returns processed data for Acquittance and Indent sections
     */
    async getMonthlyPayoutSnapshot(pastorateId, month) {
        return new Promise((resolve) => {
            const [year, monthNum] = month.split('-');

            this.db.db.get(`
                SELECT snapshot_data
                FROM indent_monthly_payouts
                WHERE pastorate_id = ?
                AND year = ?
                AND month = ?
            `, [pastorateId, parseInt(year), parseInt(monthNum)], (err, row) => {
                if (err) {
                    console.error('Error fetching monthly payout snapshot:', err);
                    resolve(this.getEmptySnapshotData());
                    return;
                }

                if (!row || !row.snapshot_data) {
                    console.log('No monthly payout snapshot found for month:', month);
                    resolve(this.getEmptySnapshotData());
                    return;
                }

                try {
                    const snapshotData = JSON.parse(row.snapshot_data);
                    const processedData = this.processSnapshotData(snapshotData);
                    resolve(processedData);
                } catch (parseError) {
                    console.error('Error parsing snapshot data:', parseError);
                    resolve(this.getEmptySnapshotData());
                }
            });
        });
    }

    /**
     * Process snapshot data to extract Acquittance and Indent items
     * Also extracts Deductions and Indent items for Receipts side
     */
    processSnapshotData(snapshotData) {
        console.log('🔍 DEBUG: processSnapshotData called');
        console.log('🔍 DEBUG: Snapshot data keys:', Object.keys(snapshotData));
        console.log('🔍 DEBUG: Full snapshot data:', JSON.stringify(snapshotData, null, 2));

        // PAYMENTS SIDE (Debits)
        const acquittanceItems = [];
        const indentItems = [];

        // RECEIPTS SIDE (Credits)
        const deductionItems = [];
        const indentReceiptItems = [];

        let totalCash = 0;

        // SECTION 1: ACQUITTANCE

        // 1. Salary (sum of all employee base salaries)
        if (snapshotData.employeeSalaries && snapshotData.employeeSalaries.length > 0) {
            const salaryTotal = snapshotData.employeeSalaries.reduce((sum, emp) => {
                return sum + (parseFloat(emp.salary) || 0);
            }, 0);

            if (salaryTotal > 0) {
                acquittanceItems.push({
                    particulars: 'Salary',
                    amount: salaryTotal
                });
                totalCash += salaryTotal;
            }
        }

        // 2. DA (Dearness Allowance - sum from all employees)
        if (snapshotData.employeeAllowances && snapshotData.employeeAllowances.length > 0) {
            const daTotal = snapshotData.employeeAllowances.reduce((sum, allowance) => {
                return sum + (parseFloat(allowance.dearness_allowance) || 0);
            }, 0);

            if (daTotal > 0) {
                acquittanceItems.push({
                    particulars: 'DA',
                    amount: daTotal
                });
                totalCash += daTotal;
            }
        }

        // 3. Custom Allowances from Employee Allowances (each field as separate line)
        if (snapshotData.employeeAllowances && snapshotData.employeeAllowances.length > 0) {
            const customAllowanceTotals = {};

            snapshotData.employeeAllowances.forEach(allowance => {
                let customAllowances = {};

                if (allowance.custom_allowances) {
                    if (typeof allowance.custom_allowances === 'string') {
                        try {
                            customAllowances = JSON.parse(allowance.custom_allowances);
                        } catch (e) {
                            console.error('Error parsing custom_allowances:', e);
                        }
                    } else if (typeof allowance.custom_allowances === 'object') {
                        customAllowances = allowance.custom_allowances;
                    }
                }

                // Sum up each custom allowance field
                Object.entries(customAllowances).forEach(([fieldName, amount]) => {
                    if (!customAllowanceTotals[fieldName]) {
                        customAllowanceTotals[fieldName] = 0;
                    }
                    customAllowanceTotals[fieldName] += parseFloat(amount) || 0;
                });
            });

            // Add each custom allowance as a separate line item
            Object.entries(customAllowanceTotals).forEach(([fieldName, total]) => {
                if (total > 0) {
                    acquittanceItems.push({
                        particulars: fieldName,
                        amount: total
                    });
                    totalCash += total;
                }
            });
        }

        // 4. Pastorate Workers Allowances (from indent_allowances - group by allowance_name)
        if (snapshotData.pastorateAllowances && snapshotData.pastorateAllowances.length > 0) {
            const allowanceNameTotals = {};

            snapshotData.pastorateAllowances.forEach(allowance => {
                const name = allowance.allowance_name || 'Allowance';
                const amount = parseFloat(allowance.allowance_amount) || 0;

                if (!allowanceNameTotals[name]) {
                    allowanceNameTotals[name] = 0;
                }
                allowanceNameTotals[name] += amount;
            });

            // Add each allowance name as a separate line item
            Object.entries(allowanceNameTotals).forEach(([name, total]) => {
                if (total > 0) {
                    acquittanceItems.push({
                        particulars: name,
                        amount: total
                    });
                    totalCash += total;
                }
            });
        }

        // SECTION 2: INDENT

        // 1. Indent Payments (from indent_payments table)
        if (snapshotData.payments && snapshotData.payments.length > 0) {
            snapshotData.payments.forEach(payment => {
                const amount = parseFloat(payment.payment_amount) || 0;
                if (amount > 0) {
                    indentItems.push({
                        particulars: payment.payment_name || 'Payment',
                        amount: amount
                    });
                    totalCash += amount;
                }
            });
        }

        // 2. Employee Deductions (DPF, CPF, DFBF, CSWF, DMAF - sum across all employees)
        if (snapshotData.employeeDeductions && snapshotData.employeeDeductions.length > 0) {
            const deductionTotals = {
                DPF: 0,
                CPF: 0,
                DFBF: 0,
                CSWF: 0,
                DMAF: 0
            };

            snapshotData.employeeDeductions.forEach(deduction => {
                deductionTotals.DPF += parseFloat(deduction.dpf) || 0;
                deductionTotals.CPF += parseFloat(deduction.cpf) || 0;
                deductionTotals.DFBF += parseFloat(deduction.dfbf) || 0;
                deductionTotals.CSWF += parseFloat(deduction.cswf) || 0;
                deductionTotals.DMAF += parseFloat(deduction.dmaf) || 0;
            });

            // Add each deduction type as a separate line item
            Object.entries(deductionTotals).forEach(([name, total]) => {
                if (total > 0) {
                    indentItems.push({
                        particulars: name,
                        amount: total
                    });
                    totalCash += total;
                }
            });
        }

        // 3. Custom Deductions from Employee Deductions (each field as separate line)
        if (snapshotData.employeeDeductions && snapshotData.employeeDeductions.length > 0) {
            const customDeductionTotals = {};

            snapshotData.employeeDeductions.forEach(deduction => {
                let customDeductions = {};

                if (deduction.custom_deductions) {
                    if (typeof deduction.custom_deductions === 'string') {
                        try {
                            customDeductions = JSON.parse(deduction.custom_deductions);
                        } catch (e) {
                            console.error('Error parsing custom_deductions:', e);
                        }
                    } else if (typeof deduction.custom_deductions === 'object') {
                        customDeductions = deduction.custom_deductions;
                    }
                }

                // Sum up each custom deduction field
                Object.entries(customDeductions).forEach(([fieldName, amount]) => {
                    if (!customDeductionTotals[fieldName]) {
                        customDeductionTotals[fieldName] = 0;
                    }
                    customDeductionTotals[fieldName] += parseFloat(amount) || 0;
                });
            });

            // Add each custom deduction as a separate line item
            Object.entries(customDeductionTotals).forEach(([fieldName, total]) => {
                if (total > 0) {
                    indentItems.push({
                        particulars: fieldName,
                        amount: total
                    });
                    totalCash += total;
                }
            });
        }

        // ========================================
        // RECEIPTS SIDE (CREDITS) - NEW SECTIONS
        // ========================================

        // RECEIPTS SECTION 1: DEDUCTIONS
        // Fixed Deductions: Sangam, DPF, CPF, DFBF, CSWF, DMAF + Custom Deductions

        if (snapshotData.employeeDeductions && snapshotData.employeeDeductions.length > 0) {
            const deductionTotals = {
                Sangam: 0,
                DPF: 0,
                CPF: 0,
                DFBF: 0,
                CSWF: 0,
                DMAF: 0
            };

            // Sum fixed deductions across all employees
            snapshotData.employeeDeductions.forEach(deduction => {
                deductionTotals.Sangam += parseFloat(deduction.sangam) || 0;
                deductionTotals.DPF += parseFloat(deduction.dpf) || 0;
                deductionTotals.CPF += parseFloat(deduction.cpf) || 0;
                deductionTotals.DFBF += parseFloat(deduction.dfbf) || 0;
                deductionTotals.CSWF += parseFloat(deduction.cswf) || 0;
                deductionTotals.DMAF += parseFloat(deduction.dmaf) || 0;
            });

            // Add each fixed deduction as a separate line item
            Object.entries(deductionTotals).forEach(([name, total]) => {
                if (total > 0) {
                    deductionItems.push({
                        particulars: name,
                        amount: total
                    });
                }
            });

            // Custom Deductions from Employee Deductions
            const customDeductionTotals = {};

            snapshotData.employeeDeductions.forEach(deduction => {
                let customDeductions = {};

                if (deduction.custom_deductions) {
                    if (typeof deduction.custom_deductions === 'string') {
                        try {
                            customDeductions = JSON.parse(deduction.custom_deductions);
                        } catch (e) {
                            console.error('Error parsing custom_deductions:', e);
                        }
                    } else if (typeof deduction.custom_deductions === 'object') {
                        customDeductions = deduction.custom_deductions;
                    }
                }

                // Sum up each custom deduction field
                Object.entries(customDeductions).forEach(([fieldName, amount]) => {
                    if (!customDeductionTotals[fieldName]) {
                        customDeductionTotals[fieldName] = 0;
                    }
                    customDeductionTotals[fieldName] += parseFloat(amount) || 0;
                });
            });

            // Add each custom deduction as a separate line item
            Object.entries(customDeductionTotals).forEach(([fieldName, total]) => {
                if (total > 0) {
                    deductionItems.push({
                        particulars: fieldName,
                        amount: total
                    });
                }
            });
        }

        // RECEIPTS SECTION 2: INDENT
        // Salary, DA, Custom Employee Allowances, Wife Allowance ONLY

        // 1. Salary (sum of all employee base salaries)
        if (snapshotData.employeeSalaries && snapshotData.employeeSalaries.length > 0) {
            const salaryTotal = snapshotData.employeeSalaries.reduce((sum, emp) => {
                return sum + (parseFloat(emp.salary) || 0);
            }, 0);

            if (salaryTotal > 0) {
                indentReceiptItems.push({
                    particulars: 'Salary',
                    amount: salaryTotal
                });
            }
        }

        // 2. DA (Dearness Allowance - sum from all employees)
        if (snapshotData.employeeAllowances && snapshotData.employeeAllowances.length > 0) {
            const daTotal = snapshotData.employeeAllowances.reduce((sum, allowance) => {
                return sum + (parseFloat(allowance.dearness_allowance) || 0);
            }, 0);

            if (daTotal > 0) {
                indentReceiptItems.push({
                    particulars: 'DA',
                    amount: daTotal
                });
            }
        }

        // 3. Custom Allowances from Employee Allowances (each field as separate line)
        if (snapshotData.employeeAllowances && snapshotData.employeeAllowances.length > 0) {
            const customAllowanceTotals = {};

            snapshotData.employeeAllowances.forEach(allowance => {
                let customAllowances = {};

                if (allowance.custom_allowances) {
                    if (typeof allowance.custom_allowances === 'string') {
                        try {
                            customAllowances = JSON.parse(allowance.custom_allowances);
                        } catch (e) {
                            console.error('Error parsing custom_allowances:', e);
                        }
                    } else if (typeof allowance.custom_allowances === 'object') {
                        customAllowances = allowance.custom_allowances;
                    }
                }

                // Sum up each custom allowance field
                Object.entries(customAllowances).forEach(([fieldName, amount]) => {
                    if (!customAllowanceTotals[fieldName]) {
                        customAllowanceTotals[fieldName] = 0;
                    }
                    customAllowanceTotals[fieldName] += parseFloat(amount) || 0;
                });
            });

            // Add each custom allowance as a separate line item
            Object.entries(customAllowanceTotals).forEach(([fieldName, total]) => {
                if (total > 0) {
                    indentReceiptItems.push({
                        particulars: fieldName,
                        amount: total
                    });
                }
            });
        }

        // 4. Wife Allowance ONLY (from pastorate allowances)
        if (snapshotData.pastorateAllowances && snapshotData.pastorateAllowances.length > 0) {
            console.log('📊 DEBUG: Processing pastorateAllowances for Wife Allowance');
            console.log('📊 DEBUG: Total pastorateAllowances count:', snapshotData.pastorateAllowances.length);
            console.log('📊 DEBUG: pastorateAllowances data:', JSON.stringify(snapshotData.pastorateAllowances, null, 2));

            const wifeAllowanceTotal = snapshotData.pastorateAllowances
                .filter(allowance => {
                    const allowanceName = (allowance.allowance_name || '').toString().trim().toLowerCase();
                    // Handle both "allowance" and "allowence" spellings, and variations
                    const isWifeAllowance = allowanceName.includes('wife') &&
                                          (allowanceName.includes('allowance') || allowanceName.includes('allowence'));
                    console.log(`📊 DEBUG: Checking allowance: "${allowance.allowance_name}" -> normalized: "${allowanceName}" -> isWifeAllowance: ${isWifeAllowance}`);
                    return isWifeAllowance;
                })
                .reduce((sum, allowance) => {
                    const amount = parseFloat(allowance.allowance_amount) || 0;
                    console.log(`📊 DEBUG: Adding Wife Allowance amount: ${amount}`);
                    return sum + amount;
                }, 0);

            console.log('📊 DEBUG: Total Wife Allowance amount:', wifeAllowanceTotal);

            if (wifeAllowanceTotal > 0) {
                indentReceiptItems.push({
                    particulars: 'Wife Allowance',
                    amount: wifeAllowanceTotal
                });
                console.log('📊 DEBUG: Wife Allowance added to indentReceiptItems');
            } else {
                console.log('📊 DEBUG: Wife Allowance total is 0, not adding to indentReceiptItems');
            }
        } else {
            console.log('📊 DEBUG: No pastorateAllowances found in snapshot data');
            console.log('📊 DEBUG: snapshotData keys:', Object.keys(snapshotData));
        }

        return {
            // Payments side (Debits)
            acquittanceItems,
            indentItems,
            totalCash,
            // Receipts side (Credits)
            deductionItems,
            indentReceiptItems
        };
    }

    /**
     * Return empty snapshot data structure
     */
    getEmptySnapshotData() {
        return {
            // Payments side (Debits)
            acquittanceItems: [],
            indentItems: [],
            totalCash: 0,
            // Receipts side (Credits)
            deductionItems: [],
            indentReceiptItems: []
        };
    }

    /**
     * Get contra transactions for the month
     * Includes:
     * - Transfers between pastorate accounts (cash, bank, diocese)
     * - Transfers from pastorate to church (shows as debit)
     * - Transfers from church to pastorate (shows as credit)
     * Excludes:
     * - Transfers between church accounts
     */
    async getContraTransactions(pastorateId, month) {
        return new Promise((resolve) => {
            this.db.db.all(`
                SELECT
                    ct.*,
                    fc.category_name as from_category_name,
                    tc.category_name as to_category_name,
                    p.pastorate_short_name,
                    from_church.church_short_name as from_church_short_name,
                    to_church.church_short_name as to_church_short_name
                FROM contra_transactions ct
                LEFT JOIN ledger_categories fc ON ct.from_category_id = fc.id
                LEFT JOIN ledger_categories tc ON ct.to_category_id = tc.id
                LEFT JOIN pastorates p ON ct.pastorate_id = p.id
                LEFT JOIN churches from_church ON ct.from_account_id = CAST(from_church.id AS TEXT)
                LEFT JOIN churches to_church ON ct.to_account_id = CAST(to_church.id AS TEXT)
                WHERE ct.pastorate_id = ?
                AND strftime('%Y-%m', ct.date) = ?
                AND (ct.from_account_type IN ('cash', 'bank', 'diocese')
                     OR ct.from_account_type IN ('pastorate_cash', 'pastorate_bank', 'pastorate_diocese'))
                ORDER BY ct.date ASC, ct.id ASC
            `, [pastorateId, month], (err, rows) => {
                if (err) {
                    console.error('Error fetching contra transactions:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    /**
     * Calculate total credits by account type
     */
    calculateTotalCredits(receipts, offerings, otherCredits, contraTransactions) {
        const totals = { cash: 0, bank: 0, diocese: 0 };

        // Add receipts
        receipts.forEach(r => {
            totals[r.book_type] = (totals[r.book_type] || 0) + parseFloat(r.amount);
        });

        // Add offerings (only to cash)
        offerings.forEach(o => {
            totals.cash += parseFloat(o.amount);
        });

        // Add other credits
        otherCredits.forEach(oc => {
            totals[oc.book_type] = (totals[oc.book_type] || 0) + parseFloat(oc.amount);
        });

        // Add contra transfers TO pastorate accounts only
        contraTransactions.forEach(ct => {
            // Extract base account type (cash, bank, diocese) from to_account_type
            const toAccountType = this.getBaseAccountType(ct.to_account_type);
            const toLocation = this.getAccountLocation(ct.to_account_type);

            // Only add if transferring TO a pastorate account
            if (toLocation === 'pastorate' && (toAccountType === 'cash' || toAccountType === 'bank' || toAccountType === 'diocese')) {
                totals[toAccountType] = (totals[toAccountType] || 0) + parseFloat(ct.amount);
            }
        });

        return totals;
    }

    /**
     * Get base account type from account type string
     * Examples: 'cash' -> 'cash', 'pastorate_cash' -> 'cash', 'church_bank' -> 'bank'
     */
    getBaseAccountType(accountType) {
        if (!accountType) return null;
        if (accountType.includes('_')) {
            return accountType.split('_')[1]; // Returns 'cash', 'bank', 'diocese'
        }
        return accountType; // Already in base format
    }

    /**
     * Get account location from account type string
     * Examples: 'cash' -> 'pastorate', 'pastorate_cash' -> 'pastorate', 'church_bank' -> 'church'
     */
    getAccountLocation(accountType) {
        if (!accountType) return null;
        if (accountType.includes('_')) {
            return accountType.split('_')[0]; // Returns 'pastorate' or 'church'
        }
        return 'pastorate'; // Old format defaults to pastorate
    }

    /**
     * Calculate total debits by account type
     * Now uses monthlyPayoutData instead of acquittance transactions
     */
    calculateTotalDebits(billVouchers, monthlyPayoutData, contraTransactions) {
        const totals = { cash: 0, bank: 0, diocese: 0 };

        // Add bill vouchers
        billVouchers.forEach(bv => {
            totals[bv.book_type] = (totals[bv.book_type] || 0) + parseFloat(bv.amount);
        });

        // Add monthly payout data (acquittance + indent) - all goes to cash
        if (monthlyPayoutData && monthlyPayoutData.totalCash) {
            totals.cash += parseFloat(monthlyPayoutData.totalCash);
        }

        // Add contra transfers FROM pastorate accounts only
        contraTransactions.forEach(ct => {
            // Extract base account type (cash, bank, diocese) from from_account_type
            const fromAccountType = this.getBaseAccountType(ct.from_account_type);
            const fromLocation = this.getAccountLocation(ct.from_account_type);

            // Only add if transferring FROM a pastorate account
            if (fromLocation === 'pastorate' && (fromAccountType === 'cash' || fromAccountType === 'bank' || fromAccountType === 'diocese')) {
                totals[fromAccountType] = (totals[fromAccountType] || 0) + parseFloat(ct.amount);
            }
        });

        return totals;
    }

    /**
     * Get available months that have transactions
     */
    async getAvailableMonths(pastorateId, userId) {
        try {
            // Verify user has access
            const userPastorates = await this.db.getUserPastorates(userId);
            const hasAccess = userPastorates.some(p => p.id === pastorateId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this pastorate' };
            }

            return new Promise((resolve) => {
                this.db.db.all(`
                    SELECT DISTINCT strftime('%Y-%m', date) as month
                    FROM (
                        SELECT date FROM receipt_transactions WHERE pastorate_id = ?
                        UNION
                        SELECT date FROM offering_transactions WHERE pastorate_id = ?
                        UNION
                        SELECT date FROM other_credit_transactions WHERE pastorate_id = ?
                        UNION
                        SELECT date FROM bill_voucher_transactions WHERE pastorate_id = ?
                        UNION
                        SELECT date FROM acquittance_transactions WHERE pastorate_id = ?
                        UNION
                        SELECT date FROM contra_transactions WHERE pastorate_id = ?
                    )
                    WHERE month IS NOT NULL
                    ORDER BY month DESC
                `, [pastorateId, pastorateId, pastorateId, pastorateId, pastorateId, pastorateId], (err, rows) => {
                    if (err) {
                        console.error('Error fetching available months:', err);
                        resolve({ success: false, error: err.message });
                    } else {
                        const months = rows.map(r => r.month);
                        resolve({ success: true, months });
                    }
                });
            });
        } catch (error) {
            console.error('Error getting available months:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = RoughCashBookService;

