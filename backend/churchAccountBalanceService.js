/**
 * Church Account Balance Service
 * Handles calculation of income, expenses, and balances for church accounts
 */

class ChurchAccountBalanceService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get account balances for a specific book type
   * @param {number} churchId - The church ID
   * @param {string} bookType - The book type ('cash', 'bank')
   * @returns {Promise} - Promise resolving to balance data
   */
  async getAccountBalance(churchId, bookType) {
    return new Promise((resolve) => {
      try {
        // Calculate total income from all income sources
        const incomeQuery = `
          SELECT
            COALESCE(SUM(amount), 0) as total_income
          FROM (
            -- Church Receipts
            SELECT amount FROM church_receipt_transactions
            WHERE church_id = ? AND book_type = ?

            UNION ALL

            -- Church Other Credits
            SELECT amount FROM church_other_credit_transactions
            WHERE church_id = ? AND book_type = ?

            UNION ALL

            -- Church Contra IN (transfers TO this account at church level)
            SELECT amount FROM church_contra_transactions
            WHERE church_id = ? AND book_type = ?
            AND to_account_level = 'church' AND to_account_type = ?

            UNION ALL

            -- Pastorate to Church Contra IN (transfers FROM pastorate TO church)
            SELECT ct.amount FROM contra_transactions ct
            INNER JOIN churches c ON ct.to_account_id = c.id
            WHERE c.id = ?
            AND ct.to_account_type IN ('church_cash', 'church_bank')
            AND (
              (? = 'cash' AND ct.to_account_type = 'church_cash')
              OR (? = 'bank' AND ct.to_account_type = 'church_bank')
            )
          ) as income_sources
        `;

        this.db.db.get(
          incomeQuery,
          [churchId, bookType, churchId, bookType, churchId, bookType, bookType, churchId, bookType, bookType],
          (err, incomeResult) => {
            if (err) {
              console.error('Error calculating church income:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            // Calculate total expenses from all expense sources
            const expenseQuery = `
              SELECT
                COALESCE(SUM(amount), 0) as total_expense
              FROM (
                -- Church Bill Vouchers
                SELECT amount FROM church_bill_voucher_transactions
                WHERE church_id = ? AND book_type = ?

                UNION ALL

                -- Church Acquittance
                SELECT amount FROM church_acquittance_transactions
                WHERE church_id = ? AND book_type = ?

                UNION ALL

                -- Church Contra OUT (transfers FROM this account at church level)
                SELECT amount FROM church_contra_transactions
                WHERE church_id = ? AND book_type = ?
                AND from_account_level = 'church' AND from_account_type = ?

                UNION ALL

                -- Church to Pastorate Contra OUT (transfers FROM church TO pastorate)
                SELECT ct.amount FROM contra_transactions ct
                INNER JOIN churches c ON ct.from_account_id = c.id
                WHERE c.id = ?
                AND ct.from_account_type IN ('church_cash', 'church_bank')
                AND (
                  (? = 'cash' AND ct.from_account_type = 'church_cash')
                  OR (? = 'bank' AND ct.from_account_type = 'church_bank')
                )
              ) as expense_sources
            `;

            this.db.db.get(
              expenseQuery,
              [churchId, bookType, churchId, bookType, churchId, bookType, bookType, churchId, bookType, bookType],
              (err, expenseResult) => {
                if (err) {
                  console.error('Error calculating church expenses:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                const totalIncome = parseFloat(incomeResult?.total_income || 0);
                const totalExpense = parseFloat(expenseResult?.total_expense || 0);
                const balance = totalIncome - totalExpense;

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
        console.error('Error getting church account balance:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get all account balances for a church
   * @param {number} churchId - The church ID
   * @returns {Promise} - Promise resolving to all balances
   */
  async getAllAccountBalances(churchId) {
    return new Promise(async (resolve) => {
      try {
        // Get balances for each book type (church only has cash and bank)
        const cashBalance = await this.getAccountBalance(churchId, 'cash');
        const bankBalance = await this.getAccountBalance(churchId, 'bank');

        if (!cashBalance.success || !bankBalance.success) {
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
            total: {
              totalIncome: cashBalance.data.totalIncome + bankBalance.data.totalIncome,
              totalExpense: cashBalance.data.totalExpense + bankBalance.data.totalExpense,
              balance: cashBalance.data.balance + bankBalance.data.balance
            }
          }
        });
      } catch (error) {
        console.error('Error getting all church account balances:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }
}

module.exports = ChurchAccountBalanceService;

