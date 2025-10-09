class ContraService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Generate a unique transaction ID in format CT-XXXXX
   */
  async generateTransactionId() {
    return new Promise((resolve) => {
      const generateId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = 'CT-';
        for (let i = 0; i < 5; i++) {
          id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
      };

      const checkAndGenerate = () => {
        const id = generateId();
        this.db.db.get(
          'SELECT id FROM contra_transactions WHERE transaction_id = ?',
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
   * Get the next available voucher number for a pastorate and book type
   */
  async getNextVoucherNumber(pastorateId, bookType) {
    return new Promise((resolve) => {
      try {
        this.db.db.get(
          'SELECT MAX(voucher_number) as max_number FROM contra_transactions WHERE pastorate_id = ? AND book_type = ?',
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
   * Create a new contra transaction
   */
  async createTransaction(transactionData, userId) {
    return new Promise((resolve) => {
      try {
        console.log('=== CREATE CONTRA TRANSACTION CALLED ===');
        console.log('Transaction Data:', transactionData);
        console.log('User ID:', userId);

        const {
          transaction_id,
          voucher_number,
          from_account_type,
          from_account_id,
          from_category_id,
          from_subcategory_id,
          to_account_type,
          to_account_id,
          to_category_id,
          to_subcategory_id,
          date,
          amount,
          notes,
          pastorateId,
          bookType
        } = transactionData;

        console.log('Extracted fields:', {
          transaction_id,
          voucher_number,
          from_account_type,
          from_account_id,
          from_category_id,
          from_subcategory_id,
          to_account_type,
          to_account_id,
          to_category_id,
          to_subcategory_id,
          date,
          amount,
          notes,
          pastorateId,
          bookType
        });

        // Validate required fields
        if (!transaction_id || !voucher_number || !from_account_type || !from_account_id || !to_account_type || !to_account_id || !date || !amount || !pastorateId || !bookType) {
          console.log('Validation failed - missing fields');
          resolve({
            success: false,
            error: 'All required fields must be filled'
          });
          return;
        }

        // Validate book_type
        if (!['cash', 'bank', 'diocese', 'all'].includes(bookType)) {
          resolve({
            success: false,
            error: 'Invalid book type. Must be cash, bank, diocese, or all'
          });
          return;
        }

        // Validate transaction_id format (CT-XXXXX)
        if (!transaction_id.match(/^CT-[A-Z0-9]{5}$/)) {
          resolve({
            success: false,
            error: 'Transaction ID must be in format CT-XXXXX (5 alphanumeric characters)'
          });
          return;
        }

        // Check if transaction_id already exists
        this.db.db.get(
          'SELECT id FROM contra_transactions WHERE transaction_id = ?',
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
              'SELECT id FROM contra_transactions WHERE pastorate_id = ? AND book_type = ? AND voucher_number = ?',
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
                    error: 'Voucher number already exists for this book type'
                  });
                  return;
                }

                // Insert the transaction
                const dbInstance = this.db.db;
                dbInstance.run(
                  `INSERT INTO contra_transactions
                  (transaction_id, voucher_number, pastorate_id, book_type, from_account_type, from_account_id, from_category_id, from_subcategory_id, to_account_type, to_account_id, to_category_id, to_subcategory_id, date, amount, notes, created_by, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                  [transaction_id, voucher_number, pastorateId, bookType, from_account_type || null, from_account_id || null, from_category_id || null, from_subcategory_id || null, to_account_type || null, to_account_id || null, to_category_id || null, to_subcategory_id || null, date, amount, notes || null, userId],
                  function(err) {
                    if (err) {
                      console.error('Error inserting transaction:', err);
                      resolve({
                        success: false,
                        error: err.message
                      });
                      return;
                    }

                    console.log('Transaction created successfully with ID:', this.lastID);
                    resolve({
                      success: true,
                      transaction: {
                        id: this.lastID,
                        transaction_id,
                        voucher_number,
                        from_account_type,
                        from_account_id,
                        from_category_id,
                        from_subcategory_id,
                        to_account_type,
                        to_account_id,
                        to_category_id,
                        to_subcategory_id,
                        date,
                        amount,
                        notes
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
   * Get all contra transactions for a pastorate with pagination and filtering
   */
  async getTransactions(pastorateId, userId, bookType, page = 1, limit = 10, filters = {}) {
    return new Promise((resolve) => {
      try {
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE ct.pastorate_id = ?';
        let queryParams = [pastorateId];

        // Add book type filter if not 'all'
        if (bookType && bookType !== 'all') {
          whereClause += ' AND ct.book_type = ?';
          queryParams.push(bookType);
        }

        // Add month filter if specified
        if (filters.month && filters.month !== 'all') {
          whereClause += ' AND strftime("%Y-%m", ct.date) = ?';
          queryParams.push(filters.month);
        }

        this.db.db.all(
          `SELECT 
            ct.*,
            fc.category_name as from_category_name,
            tc.category_name as to_category_name
          FROM contra_transactions ct
          LEFT JOIN ledger_categories fc ON ct.from_category_id = fc.id
          LEFT JOIN ledger_categories tc ON ct.to_category_id = tc.id
          ${whereClause}
          ORDER BY ct.date DESC, ct.id DESC
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

            // Get total count
            this.db.db.get(
              `SELECT COUNT(*) as total FROM contra_transactions ct ${whereClause}`,
              queryParams,
              (err, countResult) => {
                if (err) {
                  console.error('Error getting count:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                resolve({
                  success: true,
                  transactions: transactions || [],
                  total: countResult?.total || 0,
                  page,
                  limit
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
   * Get a single contra transaction by ID
   */
  async getTransaction(transactionId) {
    return new Promise((resolve) => {
      try {
        this.db.db.get(
          `SELECT
            ct.*,
            fc.category_name as from_category_name,
            tc.category_name as to_category_name
          FROM contra_transactions ct
          LEFT JOIN ledger_categories fc ON ct.from_category_id = fc.id
          LEFT JOIN ledger_categories tc ON ct.to_category_id = tc.id
          WHERE ct.id = ?`,
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
   * Update a contra transaction
   */
  async updateTransaction(transactionId, transactionData, userId) {
    return new Promise((resolve) => {
      try {
        const {
          transaction_id,
          voucher_number,
          from_account_type,
          from_account_id,
          from_category_id,
          from_subcategory_id,
          to_account_type,
          to_account_id,
          to_category_id,
          to_subcategory_id,
          date,
          amount,
          notes,
          pastorateId,
          bookType
        } = transactionData;

        // Validate required fields
        if (!transaction_id || !voucher_number || !from_account_type || !from_account_id || !to_account_type || !to_account_id || !date || !amount || !pastorateId || !bookType) {
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

        // Validate transaction_id format (CT-XXXXX)
        if (!transaction_id.match(/^CT-[A-Z0-9]{5}$/)) {
          resolve({
            success: false,
            error: 'Transaction ID must be in format CT-XXXXX (5 alphanumeric characters)'
          });
          return;
        }

        // Check if transaction_id already exists (excluding current transaction)
        this.db.db.get(
          'SELECT id FROM contra_transactions WHERE transaction_id = ? AND id != ?',
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

            // Check if voucher_number already exists (excluding current transaction)
            this.db.db.get(
              'SELECT id FROM contra_transactions WHERE pastorate_id = ? AND book_type = ? AND voucher_number = ? AND id != ?',
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
                    error: 'Voucher number already exists for this book type'
                  });
                  return;
                }

                // Update the transaction
                this.db.db.run(
                  `UPDATE contra_transactions
                  SET transaction_id = ?, voucher_number = ?, from_account_type = ?, from_account_id = ?, from_category_id = ?, from_subcategory_id = ?, to_account_type = ?, to_account_id = ?, to_category_id = ?, to_subcategory_id = ?, date = ?, amount = ?, notes = ?, updated_at = datetime('now')
                  WHERE id = ?`,
                  [transaction_id, voucher_number, from_account_type || null, from_account_id || null, from_category_id || null, from_subcategory_id || null, to_account_type || null, to_account_id || null, to_category_id || null, to_subcategory_id || null, date, amount, notes || null, transactionId],
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
                        from_account_type,
                        from_category_id,
                        to_account_type,
                        to_category_id,
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
   * Delete a contra transaction
   */
  async deleteTransaction(transactionId, userId) {
    return new Promise((resolve) => {
      try {
        this.db.db.run(
          'DELETE FROM contra_transactions WHERE id = ?',
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
        console.error('Error deleting transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get statistics for contra transactions
   */
  async getStatistics(pastorateId, bookType) {
    return new Promise((resolve) => {
      try {
        // Get total amount
        this.db.db.get(
          `SELECT COALESCE(SUM(amount), 0) as total
          FROM contra_transactions
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

            // Get totals by account transfer type
            this.db.db.all(
              `SELECT
                from_account_type,
                to_account_type,
                COALESCE(SUM(amount), 0) as total
              FROM contra_transactions
              WHERE pastorate_id = ? AND book_type = ?
              GROUP BY from_account_type, to_account_type
              ORDER BY total DESC`,
              [pastorateId, bookType],
              (err, transferResult) => {
                if (err) {
                  console.error('Error getting transfer stats:', err);
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
                    byTransferType: transferResult || []
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

module.exports = ContraService;
