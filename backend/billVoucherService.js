class BillVoucherService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Generate a unique transaction ID in format BV-XXXXX
   */
  async generateTransactionId() {
    return new Promise((resolve) => {
      const generateId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = 'BV-';
        for (let i = 0; i < 5; i++) {
          id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
      };

      const checkAndGenerate = () => {
        const id = generateId();
        this.db.db.get(
          'SELECT id FROM bill_voucher_transactions WHERE transaction_id = ?',
          [id],
          (err, existing) => {
            if (err) {
              console.error('Error checking transaction ID:', err);
              resolve({ success: false, error: err.message });
              return;
            }

            if (existing) {
              // ID exists, try again
              checkAndGenerate();
            } else {
              resolve({ success: true, transactionId: id });
            }
          }
        );
      };

      checkAndGenerate();
    });
  }

  /**
   * Create a new bill voucher transaction
   */
  async createTransaction(transactionData, userId) {
    return new Promise((resolve) => {
      try {
        console.log('=== CREATE BILL VOUCHER TRANSACTION CALLED ===');
        console.log('Transaction Data:', transactionData);
        console.log('User ID:', userId);

        const {
          transaction_id,
          voucher_number,
          payee_name,
          primary_category_id,
          secondary_category_id,
          date,
          amount,
          notes,
          pastorateId,
          bookType
        } = transactionData;

        console.log('Extracted fields:', {
          transaction_id,
          voucher_number,
          payee_name,
          primary_category_id,
          secondary_category_id,
          date,
          amount,
          notes,
          pastorateId,
          bookType
        });

        // Validate required fields
        if (!transaction_id || !voucher_number || !payee_name || !date || !amount || !pastorateId || !bookType) {
          console.log('Validation failed - missing fields');
          resolve({
            success: false,
            error: 'All required fields must be filled'
          });
          return;
        }

        // Validate book_type
        if (!['cash', 'bank', 'diocese'].includes(bookType)) {
          resolve({
            success: false,
            error: 'Invalid book type. Must be cash, bank, or diocese'
          });
          return;
        }

        // Validate transaction_id format (BV-XXXXX)
        if (!transaction_id.match(/^BV-[A-Z0-9]{5}$/)) {
          resolve({
            success: false,
            error: 'Transaction ID must be in format BV-XXXXX (5 alphanumeric characters)'
          });
          return;
        }

        // Check if transaction_id already exists
        this.db.db.get(
          'SELECT id FROM bill_voucher_transactions WHERE transaction_id = ?',
          [transaction_id],
          (err, existing) => {
            if (err) {
              console.error('Error checking transaction ID:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (existing) {
              resolve({
                success: false,
                error: 'Transaction ID already exists'
              });
              return;
            }

            // Check if voucher_number already exists for this pastorate and book type
            this.db.db.get(
              'SELECT id FROM bill_voucher_transactions WHERE pastorate_id = ? AND book_type = ? AND voucher_number = ?',
              [pastorateId, bookType, voucher_number],
              (err, existingVoucher) => {
                if (err) {
                  console.error('Error checking voucher number:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                if (existingVoucher) {
                  resolve({
                    success: false,
                    error: 'Voucher number already exists for this pastorate and book type'
                  });
                  return;
                }

                // Insert the transaction
                const dbInstance = this.db.db;
                dbInstance.run(
                  `INSERT INTO bill_voucher_transactions
                  (transaction_id, voucher_number, pastorate_id, book_type, payee_name, primary_category_id, secondary_category_id, date, amount, notes, created_by, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                  [transaction_id, voucher_number, pastorateId, bookType, payee_name, primary_category_id || null, secondary_category_id || null, date, amount, notes || null, userId],
                  function(err) {
                    if (err) {
                      console.error('Error inserting transaction:', err);
                      resolve({
                        success: false,
                        error: err.message
                      });
                      return;
                    }

                    console.log('Transaction inserted successfully with ID:', this.lastID);
                    resolve({
                      success: true,
                      transaction: {
                        id: this.lastID,
                        transaction_id,
                        voucher_number,
                        payee_name,
                        primary_category_id,
                        secondary_category_id,
                        date,
                        amount,
                        pastorate_id: pastorateId,
                        book_type: bookType
                      }
                    });
                  }
                );
              }
            );
          }
        );
      } catch (error) {
        console.error('Error creating transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get all bill voucher transactions for a pastorate with pagination and filtering
   */
  async getTransactions(pastorateId, userId, bookType, page = 1, limit = 10, filters = {}) {
    return new Promise((resolve) => {
      try {
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE bvt.pastorate_id = ? AND bvt.book_type = ?';
        let queryParams = [pastorateId, bookType];

        // Add month filter if specified
        if (filters.month && filters.month !== 'all') {
          whereClause += ' AND strftime("%Y-%m", bvt.date) = ?';
          queryParams.push(filters.month);
        }

        // Get total count
        this.db.db.get(
          `SELECT COUNT(*) as total FROM bill_voucher_transactions bvt ${whereClause}`,
          queryParams,
          (err, countResult) => {
            if (err) {
              console.error('Error getting transaction count:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            // Get paginated transactions
            this.db.db.all(
              `SELECT 
                bvt.*,
                lc.category_name as primary_category_name,
                lsc.sub_category_name as secondary_category_name
              FROM bill_voucher_transactions bvt
              LEFT JOIN ledger_categories lc ON bvt.primary_category_id = lc.id
              LEFT JOIN ledger_sub_categories lsc ON bvt.secondary_category_id = lsc.id
              ${whereClause}
              ORDER BY bvt.date DESC, bvt.created_at DESC
              LIMIT ? OFFSET ?`,
              [...queryParams, limit, offset],
              (err, transactions) => {
                if (err) {
                  console.error('Error getting transactions:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                resolve({
                  success: true,
                  transactions: transactions || [],
                  pagination: {
                    total: countResult.total,
                    page,
                    limit,
                    totalPages: Math.ceil(countResult.total / limit)
                  }
                });
              }
            );
          }
        );
      } catch (error) {
        console.error('Error getting transactions:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(transactionId) {
    return new Promise((resolve) => {
      try {
        this.db.db.get(
          `SELECT
            bvt.*,
            lc.category_name as primary_category_name,
            lsc.sub_category_name as secondary_category_name
          FROM bill_voucher_transactions bvt
          LEFT JOIN ledger_categories lc ON bvt.primary_category_id = lc.id
          LEFT JOIN ledger_sub_categories lsc ON bvt.secondary_category_id = lsc.id
          WHERE bvt.id = ?`,
          [transactionId],
          (err, transaction) => {
            if (err) {
              console.error('Error getting transaction:', err);
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
        console.error('Error getting transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Update a bill voucher transaction
   */
  async updateTransaction(transactionId, transactionData, userId) {
    return new Promise((resolve) => {
      try {
        const {
          transaction_id,
          voucher_number,
          payee_name,
          primary_category_id,
          secondary_category_id,
          date,
          amount,
          notes,
          pastorateId,
          bookType
        } = transactionData;

        // Validate required fields
        if (!transaction_id || !voucher_number || !payee_name || !date || !amount || !pastorateId || !bookType) {
          resolve({
            success: false,
            error: 'All required fields must be filled'
          });
          return;
        }

        // Validate book_type
        if (!['cash', 'bank', 'diocese'].includes(bookType)) {
          resolve({
            success: false,
            error: 'Invalid book type. Must be cash, bank, or diocese'
          });
          return;
        }

        // Validate transaction_id format (BV-XXXXX)
        if (!transaction_id.match(/^BV-[A-Z0-9]{5}$/)) {
          resolve({
            success: false,
            error: 'Transaction ID must be in format BV-XXXXX (5 alphanumeric characters)'
          });
          return;
        }

        // Check if transaction_id already exists (excluding current transaction)
        this.db.db.get(
          'SELECT id FROM bill_voucher_transactions WHERE transaction_id = ? AND id != ?',
          [transaction_id, transactionId],
          (err, existing) => {
            if (err) {
              console.error('Error checking transaction ID:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (existing) {
              resolve({
                success: false,
                error: 'Transaction ID already exists'
              });
              return;
            }

            // Check if voucher_number already exists for this pastorate and book type (excluding current transaction)
            this.db.db.get(
              'SELECT id FROM bill_voucher_transactions WHERE pastorate_id = ? AND book_type = ? AND voucher_number = ? AND id != ?',
              [pastorateId, bookType, voucher_number, transactionId],
              (err, existingVoucher) => {
                if (err) {
                  console.error('Error checking voucher number:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                if (existingVoucher) {
                  resolve({
                    success: false,
                    error: 'Voucher number already exists for this pastorate and book type'
                  });
                  return;
                }

                // Update the transaction
                this.db.db.run(
                  `UPDATE bill_voucher_transactions
                  SET transaction_id = ?, voucher_number = ?, payee_name = ?, primary_category_id = ?, secondary_category_id = ?, date = ?, amount = ?, notes = ?, updated_at = datetime('now')
                  WHERE id = ?`,
                  [transaction_id, voucher_number, payee_name, primary_category_id || null, secondary_category_id || null, date, amount, notes || null, transactionId],
                  function(err) {
                    if (err) {
                      console.error('Error updating transaction:', err);
                      resolve({
                        success: false,
                        error: err.message
                      });
                      return;
                    }

                    resolve({
                      success: true,
                      transaction: {
                        id: transactionId,
                        transaction_id,
                        voucher_number,
                        payee_name,
                        primary_category_id,
                        secondary_category_id,
                        date,
                        amount
                      }
                    });
                  }
                );
              }
            );
          }
        );
      } catch (error) {
        console.error('Error updating transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Delete a bill voucher transaction
   */
  async deleteTransaction(transactionId, userId) {
    return new Promise((resolve) => {
      try {
        this.db.db.run(
          'DELETE FROM bill_voucher_transactions WHERE id = ?',
          [transactionId],
          function(err) {
            if (err) {
              console.error('Error deleting transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            resolve({
              success: true
            });
          }
        );
      } catch (error) {
        console.error('Error deleting transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get the next available voucher number for a pastorate and book type
   */
  async getNextVoucherNumber(pastorateId, bookType) {
    return new Promise((resolve) => {
      try {
        this.db.db.get(
          'SELECT MAX(voucher_number) as max_number FROM bill_voucher_transactions WHERE pastorate_id = ? AND book_type = ?',
          [pastorateId, bookType],
          (err, result) => {
            if (err) {
              console.error('Error getting next voucher number:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            const nextNumber = (result?.max_number || 0) + 1;
            resolve({
              success: true,
              nextVoucherNumber: nextNumber
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
   * Get statistics for bill vouchers
   */
  async getStatistics(pastorateId, bookType) {
    return new Promise((resolve) => {
      try {
        // Get total amount
        this.db.db.get(
          `SELECT COALESCE(SUM(amount), 0) as total
           FROM bill_voucher_transactions
           WHERE pastorate_id = ? AND book_type = ?`,
          [pastorateId, bookType],
          (err, totalResult) => {
            if (err) {
              console.error('Error getting total:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            // Get totals by category
            this.db.db.all(
              `SELECT
                lc.category_name,
                COALESCE(SUM(bvt.amount), 0) as total
              FROM bill_voucher_transactions bvt
              LEFT JOIN ledger_categories lc ON bvt.primary_category_id = lc.id
              WHERE bvt.pastorate_id = ? AND bvt.book_type = ?
              GROUP BY lc.category_name
              ORDER BY total DESC`,
              [pastorateId, bookType],
              (err, categoryResult) => {
                if (err) {
                  console.error('Error getting category stats:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                resolve({
                  success: true,
                  statistics: {
                    total: parseFloat(totalResult?.total || 0),
                    byCategory: categoryResult || []
                  }
                });
              }
            );
          }
        );
      } catch (error) {
        console.error('Error getting statistics:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }
}

module.exports = BillVoucherService;
