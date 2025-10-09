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
            const acquittance = await this.getAcquittanceTransactions(pastorateId, month);
            const contraTransactions = await this.getContraTransactions(pastorateId, month);

            // Calculate totals
            const totalCredits = this.calculateTotalCredits(receipts, offerings, otherCredits, contraTransactions);
            const totalDebits = this.calculateTotalDebits(billVouchers, acquittance, contraTransactions);
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
                    acquittance,
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
     * Get acquittance transactions for the month
     */
    async getAcquittanceTransactions(pastorateId, month) {
        return new Promise((resolve) => {
            this.db.db.all(`
                SELECT
                    aqt.*,
                    pc.category_name as primary_category_name
                FROM acquittance_transactions aqt
                LEFT JOIN ledger_categories pc ON aqt.primary_category_id = pc.id
                WHERE aqt.pastorate_id = ?
                AND strftime('%Y-%m', aqt.date) = ?
                ORDER BY aqt.date ASC, aqt.id ASC
            `, [pastorateId, month], (err, rows) => {
                if (err) {
                    console.error('Error fetching acquittance transactions:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
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
     */
    calculateTotalDebits(billVouchers, acquittance, contraTransactions) {
        const totals = { cash: 0, bank: 0, diocese: 0 };

        // Add bill vouchers
        billVouchers.forEach(bv => {
            totals[bv.book_type] = (totals[bv.book_type] || 0) + parseFloat(bv.amount);
        });

        // Add acquittance
        acquittance.forEach(aq => {
            totals[aq.book_type] = (totals[aq.book_type] || 0) + parseFloat(aq.amount);
        });

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

