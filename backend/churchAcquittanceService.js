class ChurchAcquittanceService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Generate a unique transaction ID in format AQ-XXXXX
   */
  async generateTransactionId() {
    return new Promise((resolve) => {
      const generateId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = 'AQ-';
        for (let i = 0; i < 5; i++) {
          id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
      };

      const checkAndGenerate = () => {
        const id = generateId();
        this.db.db.get(
          'SELECT id FROM church_acquittance_transactions WHERE transaction_id = ?',
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
   * Get payees by category and subcategory with search term
   */
  async getPayeesByCategory(churchId, bookType, primaryCategoryId, secondaryCategoryId, searchTerm = '') {
    return new Promise((resolve) => {
      try {
        let whereClause = 'WHERE church_id = ? AND book_type = ?';
        let queryParams = [churchId, bookType];

        // Add category filters
        if (primaryCategoryId) {
          whereClause += ' AND primary_category_id = ?';
          queryParams.push(primaryCategoryId);
        }

        if (secondaryCategoryId) {
          whereClause += ' AND secondary_category_id = ?';
          queryParams.push(secondaryCategoryId);
        }

        // Add search term filter
        if (searchTerm && searchTerm.length >= 2) {
          whereClause += ' AND payee_name LIKE ?';
          queryParams.push(`%${searchTerm}%`);
        }

        this.db.db.all(
          `SELECT DISTINCT payee_name
           FROM church_acquittance_transactions
           ${whereClause}
           ORDER BY payee_name ASC
           LIMIT 20`,
          queryParams,
          (err, payees) => {
            if (err) {
              console.error('Error getting payees:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            resolve({
              success: true,
              payees: payees || []
            });
          }
        );
      } catch (error) {
        console.error('Error getting payees:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get last amount for a specific payee in a category/subcategory combination
   */
  async getLastAmountForPayee(churchId, bookType, primaryCategoryId, secondaryCategoryId, payeeName) {
    return new Promise((resolve) => {
      try {
        let whereClause = 'WHERE church_id = ? AND book_type = ? AND payee_name = ?';
        let queryParams = [churchId, bookType, payeeName];

        // Add category filters
        if (primaryCategoryId) {
          whereClause += ' AND primary_category_id = ?';
          queryParams.push(primaryCategoryId);
        }

        if (secondaryCategoryId) {
          whereClause += ' AND secondary_category_id = ?';
          queryParams.push(secondaryCategoryId);
        }

        this.db.db.get(
          `SELECT amount
           FROM church_acquittance_transactions
           ${whereClause}
           ORDER BY date DESC, created_at DESC
           LIMIT 1`,
          queryParams,
          (err, result) => {
            if (err) {
              console.error('Error getting last amount:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            resolve({
              success: true,
              amount: result?.amount || 0
            });
          }
        );
      } catch (error) {
        console.error('Error getting last amount:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Create a new acquittance transaction
   */
  async createTransaction(transactionData, userId) {
    return new Promise((resolve) => {
      try {
        console.log('=== CREATE ACQUITTANCE TRANSACTION CALLED ===');
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
          churchId,
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
          churchId,
          bookType
        });

        // Validate required fields
        if (!transaction_id || !voucher_number || !payee_name || !date || !amount || !churchId || !bookType) {
          console.log('Validation failed - missing fields');
          resolve({
            success: false,
            error: 'All required fields must be filled'
          });
          return;
        }

        // Validate book_type
        if (!['cash', 'bank'].includes(bookType)) {
          resolve({
            success: false,
            error: 'Invalid book type. Must be cash, bank, or diocese'
          });
          return;
        }

        // Validate transaction_id format (AQ-XXXXX)
        if (!transaction_id.match(/^AQ-[A-Z0-9]{5}$/)) {
          resolve({
            success: false,
            error: 'Transaction ID must be in format AQ-XXXXX (5 alphanumeric characters)'
          });
          return;
        }

        // Check if transaction_id already exists
        this.db.db.get(
          'SELECT id FROM church_acquittance_transactions WHERE transaction_id = ?',
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
              'SELECT id FROM church_acquittance_transactions WHERE church_id = ? AND book_type = ? AND voucher_number = ?',
              [churchId, bookType, voucher_number],
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
                  `INSERT INTO church_acquittance_transactions
                  (transaction_id, voucher_number, church_id, book_type, payee_name, primary_category_id, secondary_category_id, date, amount, notes, created_by, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                  [transaction_id, voucher_number, churchId, bookType, payee_name, primary_category_id || null, secondary_category_id || null, date, amount, notes || null, userId],
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
                        church_id: churchId,
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
   * Get all acquittance transactions for a pastorate with pagination and filtering
   */
  async getTransactions(churchId, userId, bookType, page = 1, limit = 10, filters = {}) {
    return new Promise((resolve) => {
      try {
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE aqt.church_id = ? AND aqt.book_type = ?';
        let queryParams = [churchId, bookType];

        // Add month filter if specified
        if (filters.month && filters.month !== 'all') {
          whereClause += ' AND strftime("%Y-%m", aqt.date) = ?';
          queryParams.push(filters.month);
        }

        // Get total count
        this.db.db.get(
          `SELECT COUNT(*) as total FROM church_acquittance_transactions aqt ${whereClause}`,
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
                aqt.*,
                lc.category_name as primary_category_name,
                lsc.sub_category_name as secondary_category_name
              FROM church_acquittance_transactions aqt
              LEFT JOIN church_ledger_categories lc ON aqt.primary_category_id = lc.id
              LEFT JOIN church_ledger_sub_categories lsc ON aqt.secondary_category_id = lsc.id
              ${whereClause}
              ORDER BY aqt.date DESC, aqt.created_at DESC
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
            aqt.*,
            lc.category_name as primary_category_name,
            lsc.sub_category_name as secondary_category_name
          FROM church_acquittance_transactions aqt
          LEFT JOIN church_ledger_categories lc ON aqt.primary_category_id = lc.id
          LEFT JOIN church_ledger_sub_categories lsc ON aqt.secondary_category_id = lsc.id
          WHERE aqt.id = ?`,
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
   * Update an acquittance transaction
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
          churchId,
          bookType
        } = transactionData;

        // Validate required fields
        if (!transaction_id || !voucher_number || !payee_name || !date || !amount || !churchId || !bookType) {
          resolve({
            success: false,
            error: 'All required fields must be filled'
          });
          return;
        }

        // Validate book_type
        if (!['cash', 'bank'].includes(bookType)) {
          resolve({
            success: false,
            error: 'Invalid book type. Must be cash, bank, or diocese'
          });
          return;
        }

        // Validate transaction_id format (AQ-XXXXX)
        if (!transaction_id.match(/^AQ-[A-Z0-9]{5}$/)) {
          resolve({
            success: false,
            error: 'Transaction ID must be in format AQ-XXXXX (5 alphanumeric characters)'
          });
          return;
        }

        // Check if transaction_id already exists (excluding current transaction)
        this.db.db.get(
          'SELECT id FROM church_acquittance_transactions WHERE transaction_id = ? AND id != ?',
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
              'SELECT id FROM church_acquittance_transactions WHERE church_id = ? AND book_type = ? AND voucher_number = ? AND id != ?',
              [churchId, bookType, voucher_number, transactionId],
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
                  `UPDATE church_acquittance_transactions
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
   * Delete an acquittance transaction
   */
  async deleteTransaction(transactionId, userId) {
    return new Promise((resolve) => {
      try {
        this.db.db.run(
          'DELETE FROM church_acquittance_transactions WHERE id = ?',
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
  async getNextVoucherNumber(churchId, bookType) {
    return new Promise((resolve) => {
      try {
        this.db.db.get(
          'SELECT MAX(voucher_number) as max_number FROM church_acquittance_transactions WHERE church_id = ? AND book_type = ?',
          [churchId, bookType],
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
   * Get statistics for acquittances
   */
  async getStatistics(churchId, bookType) {
    return new Promise((resolve) => {
      try {
        // Get total amount
        this.db.db.get(
          `SELECT COALESCE(SUM(amount), 0) as total
           FROM church_acquittance_transactions
           WHERE church_id = ? AND book_type = ?`,
          [churchId, bookType],
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
                COALESCE(SUM(aqt.amount), 0) as total
              FROM church_acquittance_transactions aqt
              LEFT JOIN church_ledger_categories lc ON aqt.primary_category_id = lc.id
              WHERE aqt.church_id = ? AND aqt.book_type = ?
              GROUP BY lc.category_name
              ORDER BY total DESC`,
              [churchId, bookType],
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

module.exports = ChurchAcquittanceService;

