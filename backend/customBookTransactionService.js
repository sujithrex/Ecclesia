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
   * Get next voucher number for a custom book (separate series per transaction type)
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
   * Search families by name for dropdown
   */
  async searchFamilies(pastorateId, searchTerm) {
    return new Promise((resolve) => {
      try {
        // Get all churches in the pastorate
        this.db.db.all(
          `SELECT
            f.id,
            f.respect,
            f.family_name,
            f.family_number,
            a.area_name,
            c.church_name
          FROM families f
          JOIN areas a ON f.area_id = a.id
          JOIN churches c ON a.church_id = c.id
          WHERE c.pastorate_id = ?
            AND (
              f.family_name LIKE ? OR
              a.area_name LIKE ? OR
              f.family_number LIKE ?
            )
          ORDER BY f.family_name
          LIMIT 50`,
          [pastorateId, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`],
          (err, families) => {
            if (err) {
              console.error('Error searching families:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            // Format families for dropdown
            const formattedFamilies = (families || []).map(f => {
              const respect = f.respect.charAt(0).toUpperCase() + f.respect.slice(1);
              return {
                id: f.id,
                displayName: `${respect}. ${f.family_name} - ${f.area_name} - ${f.family_number}`,
                family_name: f.family_name,
                respect: f.respect,
                area_name: f.area_name,
                family_number: f.family_number,
                church_name: f.church_name
              };
            });

            resolve({
              success: true,
              families: formattedFamilies
            });
          }
        );
      } catch (error) {
        console.error('Error searching families:', error);
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
        let whereClause = 'WHERE t.custom_book_id = ?';
        const params = [customBookId];

        // Add month filter if provided
        if (filters.month) {
          whereClause += ` AND strftime('%Y-%m', t.date) = ?`;
          params.push(filters.month);
        }

        // Get total count
        this.db.db.get(
          `SELECT COUNT(*) as total FROM ${tableName} t ${whereClause}`,
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

            // Get transactions with category names
            this.db.db.all(
              `SELECT t.*,
                      c.category_name,
                      c.category_type,
                      s.subcategory_name
               FROM ${tableName} t
               LEFT JOIN custom_book_categories c ON t.category_id = c.id
               LEFT JOIN custom_book_subcategories s ON t.subcategory_id = s.id
               ${whereClause}
               ORDER BY t.date DESC, t.created_at DESC
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

  /**
   * Get a single contra transaction by ID
   */
  async getContraTransaction(transactionId) {
    return new Promise((resolve) => {
      try {
        this.db.db.get(
          `SELECT * FROM custom_book_contra_transactions WHERE id = ?`,
          [transactionId],
          (err, transaction) => {
            if (err) {
              console.error('Error getting contra transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (!transaction) {
              resolve({
                success: false,
                error: 'Transaction not found'
              });
              return;
            }

            resolve({
              success: true,
              transaction
            });
          }
        );
      } catch (error) {
        console.error('Error getting contra transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Update a contra transaction
   */
  async updateContraTransaction(transactionId, transactionData, userId) {
    return new Promise((resolve) => {
      try {
        const { transactionId: txId, voucherNumber, fromName, toName, date, amount, notes } = transactionData;

        // Validate required fields
        if (!txId || !voucherNumber || !fromName || !toName || !date || !amount) {
          resolve({
            success: false,
            error: 'All required fields must be filled'
          });
          return;
        }

        this.db.db.run(
          `UPDATE custom_book_contra_transactions
           SET transaction_id = ?, voucher_number = ?, from_name = ?, to_name = ?, date = ?, amount = ?, notes = ?, updated_at = datetime('now')
           WHERE id = ?`,
          [txId, voucherNumber, fromName, toName, date, amount, notes || null, transactionId],
          function(err) {
            if (err) {
              console.error('Error updating contra transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (this.changes === 0) {
              resolve({
                success: false,
                error: 'Transaction not found'
              });
              return;
            }

            resolve({
              success: true,
              message: 'Transaction updated successfully'
            });
          }
        );
      } catch (error) {
        console.error('Error updating contra transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Delete a contra transaction
   */
  async deleteContraTransaction(transactionId, userId) {
    return new Promise((resolve) => {
      try {
        this.db.db.run(
          'DELETE FROM custom_book_contra_transactions WHERE id = ?',
          [transactionId],
          function(err) {
            if (err) {
              console.error('Error deleting contra transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (this.changes === 0) {
              resolve({
                success: false,
                error: 'Transaction not found'
              });
              return;
            }

            resolve({
              success: true,
              message: 'Transaction deleted successfully'
            });
          }
        );
      } catch (error) {
        console.error('Error deleting contra transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get a single credit transaction by ID
   */
  async getCreditTransaction(transactionId) {
    return new Promise((resolve) => {
      try {
        this.db.db.get(
          `SELECT * FROM custom_book_credit_transactions WHERE id = ?`,
          [transactionId],
          (err, transaction) => {
            if (err) {
              console.error('Error getting credit transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (!transaction) {
              resolve({
                success: false,
                error: 'Transaction not found'
              });
              return;
            }

            resolve({
              success: true,
              transaction
            });
          }
        );
      } catch (error) {
        console.error('Error getting credit transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Update a credit transaction
   */
  async updateCreditTransaction(transactionId, transactionData, userId) {
    return new Promise((resolve) => {
      try {
        const { transactionId: txId, voucherNumber, name, date, amount, notes } = transactionData;

        // Validate required fields
        if (!txId || !voucherNumber || !name || !date || !amount) {
          resolve({
            success: false,
            error: 'All required fields must be filled'
          });
          return;
        }

        this.db.db.run(
          `UPDATE custom_book_credit_transactions
           SET transaction_id = ?, voucher_number = ?, name = ?, date = ?, amount = ?, notes = ?, updated_at = datetime('now')
           WHERE id = ?`,
          [txId, voucherNumber, name, date, amount, notes || null, transactionId],
          function(err) {
            if (err) {
              console.error('Error updating credit transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (this.changes === 0) {
              resolve({
                success: false,
                error: 'Transaction not found'
              });
              return;
            }

            resolve({
              success: true,
              message: 'Transaction updated successfully'
            });
          }
        );
      } catch (error) {
        console.error('Error updating credit transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Delete a credit transaction
   */
  async deleteCreditTransaction(transactionId, userId) {
    return new Promise((resolve) => {
      try {
        this.db.db.run(
          'DELETE FROM custom_book_credit_transactions WHERE id = ?',
          [transactionId],
          function(err) {
            if (err) {
              console.error('Error deleting credit transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (this.changes === 0) {
              resolve({
                success: false,
                error: 'Transaction not found'
              });
              return;
            }

            resolve({
              success: true,
              message: 'Transaction deleted successfully'
            });
          }
        );
      } catch (error) {
        console.error('Error deleting credit transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get a single debit transaction by ID
   */
  async getDebitTransaction(transactionId) {
    return new Promise((resolve) => {
      try {
        this.db.db.get(
          `SELECT * FROM custom_book_debit_transactions WHERE id = ?`,
          [transactionId],
          (err, transaction) => {
            if (err) {
              console.error('Error getting debit transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (!transaction) {
              resolve({
                success: false,
                error: 'Transaction not found'
              });
              return;
            }

            resolve({
              success: true,
              transaction
            });
          }
        );
      } catch (error) {
        console.error('Error getting debit transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Update a debit transaction
   */
  async updateDebitTransaction(transactionId, transactionData, userId) {
    return new Promise((resolve) => {
      try {
        const { transactionId: txId, voucherNumber, name, date, amount, notes } = transactionData;

        // Validate required fields
        if (!txId || !voucherNumber || !name || !date || !amount) {
          resolve({
            success: false,
            error: 'All required fields must be filled'
          });
          return;
        }

        this.db.db.run(
          `UPDATE custom_book_debit_transactions
           SET transaction_id = ?, voucher_number = ?, name = ?, date = ?, amount = ?, notes = ?, updated_at = datetime('now')
           WHERE id = ?`,
          [txId, voucherNumber, name, date, amount, notes || null, transactionId],
          function(err) {
            if (err) {
              console.error('Error updating debit transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (this.changes === 0) {
              resolve({
                success: false,
                error: 'Transaction not found'
              });
              return;
            }

            resolve({
              success: true,
              message: 'Transaction updated successfully'
            });
          }
        );
      } catch (error) {
        console.error('Error updating debit transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Delete a debit transaction
   */
  async deleteDebitTransaction(transactionId, userId) {
    return new Promise((resolve) => {
      try {
        this.db.db.run(
          'DELETE FROM custom_book_debit_transactions WHERE id = ?',
          [transactionId],
          function(err) {
            if (err) {
              console.error('Error deleting debit transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (this.changes === 0) {
              resolve({
                success: false,
                error: 'Transaction not found'
              });
              return;
            }

            resolve({
              success: true,
              message: 'Transaction deleted successfully'
            });
          }
        );
      } catch (error) {
        console.error('Error deleting debit transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }
}

module.exports = CustomBookTransactionService;

