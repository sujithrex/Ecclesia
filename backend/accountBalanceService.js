/**
 * Account Balance Service
 * Handles calculation of income, expenses, and balances for pastorate accounts
 */

class AccountBalanceService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get account balances for a specific book type
   * @param {number} pastorateId - The pastorate ID
   * @param {string} bookType - The book type ('cash', 'bank', 'diocese')
   * @returns {Promise} - Promise resolving to balance data
   */
  async getAccountBalance(pastorateId, bookType) {
    return new Promise((resolve) => {
      try {
        console.log(`=== Calculating balance for pastorate ${pastorateId}, bookType: ${bookType} ===`);

        // Debug: Check what's in contra_transactions
        this.db.db.all(
          'SELECT id, from_account_type, to_account_type, amount, book_type FROM contra_transactions WHERE pastorate_id = ?',
          [pastorateId],
          (err, rows) => {
            if (!err) {
              console.log('Contra transactions in DB:', rows);
            }
          }
        );

        // Calculate total income from all income sources
        const incomeQuery = `
          SELECT
            COALESCE(SUM(amount), 0) as total_income
          FROM (
            -- Receipts
            SELECT amount FROM receipt_transactions
            WHERE pastorate_id = ? AND book_type = ?

            UNION ALL

            -- Other Credits
            SELECT amount FROM other_credit_transactions
            WHERE pastorate_id = ? AND book_type = ?

            UNION ALL

            -- Offerings (only for cash book)
            SELECT amount FROM offering_transactions
            WHERE pastorate_id = ? AND ? = 'cash'

            UNION ALL

            -- Contra IN (transfers TO this account)
            -- Match account types: 'cash'/'bank'/'diocese' OR 'pastorate_cash'/'pastorate_bank'/'pastorate_diocese'
            SELECT amount FROM contra_transactions
            WHERE pastorate_id = ?
            AND (
              to_account_type = ?
              OR to_account_type = 'pastorate_' || ?
            )
          ) as income_sources
        `;

        console.log('Income query params:', [pastorateId, bookType, pastorateId, bookType, pastorateId, bookType, pastorateId, bookType, bookType]);

        this.db.db.get(
          incomeQuery,
          [pastorateId, bookType, pastorateId, bookType, pastorateId, bookType, pastorateId, bookType, bookType],
          (err, incomeResult) => {
            if (err) {
              console.error('Error calculating income:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            console.log(`Income result for ${bookType}:`, incomeResult);

            // Calculate total expenses from all expense sources
            const expenseQuery = `
              SELECT
                COALESCE(SUM(amount), 0) as total_expense
              FROM (
                -- Bill Vouchers
                SELECT amount FROM bill_voucher_transactions
                WHERE pastorate_id = ? AND book_type = ?

                UNION ALL

                -- Acquittance
                SELECT amount FROM acquittance_transactions
                WHERE pastorate_id = ? AND book_type = ?

                UNION ALL

                -- Contra OUT (transfers FROM this account)
                -- Match account types: 'cash'/'bank'/'diocese' OR 'pastorate_cash'/'pastorate_bank'/'pastorate_diocese'
                SELECT amount FROM contra_transactions
                WHERE pastorate_id = ?
                AND (
                  from_account_type = ?
                  OR from_account_type = 'pastorate_' || ?
                )
              ) as expense_sources
            `;

            console.log('Expense query params:', [pastorateId, bookType, pastorateId, bookType, pastorateId, bookType, bookType]);

            this.db.db.get(
              expenseQuery,
              [pastorateId, bookType, pastorateId, bookType, pastorateId, bookType, bookType],
              (err, expenseResult) => {
                if (err) {
                  console.error('Error calculating expenses:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                console.log(`Expense result for ${bookType}:`, expenseResult);

                const totalIncome = parseFloat(incomeResult?.total_income || 0);
                const totalExpense = parseFloat(expenseResult?.total_expense || 0);
                const balance = totalIncome - totalExpense;

                console.log(`Balance for ${bookType}: Income=${totalIncome}, Expense=${totalExpense}, Balance=${balance}`);

                resolve({
                  success: true,
                  data: {
                    totalIncome,
                    totalExpense,
                    balance
                  }
                });
              }
            );
          }
        );
      } catch (error) {
        console.error('Error getting account balance:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get all account balances for a pastorate
   * @param {number} pastorateId - The pastorate ID
   * @returns {Promise} - Promise resolving to all balances
   */
  async getAllAccountBalances(pastorateId) {
    return new Promise(async (resolve) => {
      try {
        // Get balances for each book type
        const cashBalance = await this.getAccountBalance(pastorateId, 'cash');
        const bankBalance = await this.getAccountBalance(pastorateId, 'bank');
        const dioceseBalance = await this.getAccountBalance(pastorateId, 'diocese');

        if (!cashBalance.success || !bankBalance.success || !dioceseBalance.success) {
          resolve({
            success: false,
            error: 'Failed to calculate one or more account balances'
          });
          return;
        }

        resolve({
          success: true,
          balances: {
            cash: cashBalance.data,
            bank: bankBalance.data,
            diocese: dioceseBalance.data,
            total: {
              totalIncome: cashBalance.data.totalIncome + bankBalance.data.totalIncome + dioceseBalance.data.totalIncome,
              totalExpense: cashBalance.data.totalExpense + bankBalance.data.totalExpense + dioceseBalance.data.totalExpense,
              balance: cashBalance.data.balance + bankBalance.data.balance + dioceseBalance.data.balance
            }
          }
        });
      } catch (error) {
        console.error('Error getting all account balances:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }
}

module.exports = AccountBalanceService;

