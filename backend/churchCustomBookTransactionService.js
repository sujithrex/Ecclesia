/**
 * Custom Book Transaction Service
 * Handles Credit, Debit, and Contra transactions for custom books
 */

const crypto = require('crypto');

class CustomBookTransactionService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Generate a unique transaction ID
   */
  async generateTransactionId() {
    const randomString = crypto.randomBytes(3).toString('hex').toUpperCase().substring(0, 5);
    return {
      success: true,
      transactionId: randomString
    };
  }

  /**
   * Get next voucher number for a custom book
   */
  async getNextVoucherNumber(customBookId, transactionType) {
    return new Promise((resolve) => {
      try {
        let tableName;
        if (transactionType === 'credit') {
          tableName = 'custom_book_credit_transactions';
        } else if (transactionType === 'debit') {
          tableName = 'custom_book_debit_transactions';
        } else if (transactionType === 'contra') {
          tableName = 'custom_book_contra_transactions';
        } else {
          resolve({ success: false, error: 'Invalid transaction type' });
          return;
        }

        this.db.db.get(
          `SELECT MAX(voucher_number) as max_number FROM ${tableName} WHERE custom_book_id = ?`,
          [customBookId],
          (err, row) => {
            if (err) {
              console.error('Error getting next voucher number:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            const nextNumber = (row?.max_number || 0) + 1;
            resolve({
              success: true,
              voucherNumber: nextNumber
            });
          }
        );
      } catch (error) {
        console.error('Error getting next voucher number:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Create a credit transaction
   */
  async createCreditTransaction(transactionData, userId) {
    const { transactionId, voucherNumber, customBookId, pastorateId, name, date, amount, notes } = transactionData;

    return new Promise((resolve) => {
      try {
        this.db.db.run(
          `INSERT INTO custom_book_credit_transactions
           (transaction_id, voucher_number, custom_book_id, pastorate_id, name, date, amount, notes, created_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [transactionId, voucherNumber, customBookId, pastorateId, name, date, amount, notes || null, userId],
          function(err) {
            if (err) {
              console.error('Error creating credit transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            resolve({
              success: true,
              transactionId: this.lastID,
              message: 'Credit transaction created successfully'
            });
          }
        );
      } catch (error) {
        console.error('Error creating credit transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Create a debit transaction
   */
  async createDebitTransaction(transactionData, userId) {
    const { transactionId, voucherNumber, customBookId, pastorateId, name, date, amount, notes } = transactionData;

    return new Promise((resolve) => {
      try {
        this.db.db.run(
          `INSERT INTO custom_book_debit_transactions
           (transaction_id, voucher_number, custom_book_id, pastorate_id, name, date, amount, notes, created_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [transactionId, voucherNumber, customBookId, pastorateId, name, date, amount, notes || null, userId],
          function(err) {
            if (err) {
              console.error('Error creating debit transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            resolve({
              success: true,
              transactionId: this.lastID,
              message: 'Debit transaction created successfully'
            });
          }
        );
      } catch (error) {
        console.error('Error creating debit transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Create a contra transaction
   */
  async createContraTransaction(transactionData, userId) {
    const { transactionId, voucherNumber, customBookId, pastorateId, fromName, toName, date, amount, notes } = transactionData;

    return new Promise((resolve) => {
      try {
        this.db.db.run(
          `INSERT INTO custom_book_contra_transactions
           (transaction_id, voucher_number, custom_book_id, pastorate_id, from_name, to_name, date, amount, notes, created_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [transactionId, voucherNumber, customBookId, pastorateId, fromName, toName, date, amount, notes || null, userId],
          function(err) {
            if (err) {
              console.error('Error creating contra transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            resolve({
              success: true,
              transactionId: this.lastID,
              message: 'Contra transaction created successfully'
            });
          }
        );
      } catch (error) {
        console.error('Error creating contra transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get transactions for a custom book
   */
  async getTransactions(customBookId, transactionType, page = 1, limit = 10, filters = {}) {
    return new Promise((resolve) => {
      try {
        let tableName;
        if (transactionType === 'credit') {
          tableName = 'custom_book_credit_transactions';
        } else if (transactionType === 'debit') {
          tableName = 'custom_book_debit_transactions';
        } else if (transactionType === 'contra') {
          tableName = 'custom_book_contra_transactions';
        } else {
          resolve({ success: false, error: 'Invalid transaction type' });
          return;
        }

        const offset = (page - 1) * limit;
        let whereClause = 'WHERE custom_book_id = ?';
        const params = [customBookId];

        // Add month filter if provided
        if (filters.month) {
          whereClause += ` AND strftime('%Y-%m', date) = ?`;
          params.push(filters.month);
        }

        // Get total count
        this.db.db.get(
          `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`,
          params,
          (err, countResult) => {
            if (err) {
              console.error('Error counting transactions:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            // Get transactions
            this.db.db.all(
              `SELECT * FROM ${tableName} ${whereClause}
               ORDER BY date DESC, created_at DESC
               LIMIT ? OFFSET ?`,
              [...params, limit, offset],
              (err, rows) => {
                if (err) {
                  console.error('Error fetching transactions:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                const totalPages = Math.ceil((countResult?.total || 0) / limit);

                resolve({
                  success: true,
                  transactions: rows || [],
                  pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: countResult?.total || 0,
                    itemsPerPage: limit
                  }
                });
              }
            );
          }
        );
      } catch (error) {
        console.error('Error fetching transactions:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }
}

module.exports = CustomBookTransactionService;

