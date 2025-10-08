class ChurchOtherCreditsService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Generate a unique transaction ID in format OC-XXXXX
   */
  async generateTransactionId() {
    return new Promise((resolve) => {
      const generateId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = 'OC-';
        for (let i = 0; i < 5; i++) {
          id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
      };

      const checkAndGenerate = () => {
        const id = generateId();
        this.db.db.get(
          'SELECT id FROM church_other_credit_transactions WHERE transaction_id = ?',
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
   * Create a new other credit transaction
   */
  async createTransaction(transactionData, userId) {
    return new Promise((resolve) => {
      try {
        console.log('=== CREATE OTHER CREDIT TRANSACTION CALLED ===');
        console.log('Transaction Data:', transactionData);
        console.log('User ID:', userId);

        const {
          transaction_id,
          credit_number,
          family_id,
          giver_name,
          primary_category_id,
          secondary_category_id,
          date,
          amount,
          churchId,
          bookType
        } = transactionData;

        console.log('Extracted fields:', {
          transaction_id,
          credit_number,
          family_id,
          giver_name,
          primary_category_id,
          secondary_category_id,
          date,
          amount,
          churchId,
          bookType
        });

        // Validate required fields
        if (!transaction_id || !credit_number || !giver_name || !date || !amount || !churchId || !bookType) {
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

        // Validate transaction_id format (OC-XXXXX)
        if (!transaction_id.match(/^OC-[A-Z0-9]{5}$/)) {
          resolve({
            success: false,
            error: 'Transaction ID must be in format OC-XXXXX (5 alphanumeric characters)'
          });
          return;
        }

        // Check if transaction_id already exists
        this.db.db.get(
          'SELECT id FROM church_other_credit_transactions WHERE transaction_id = ?',
          [transaction_id],
          (err, existingTransaction) => {
            if (err) {
              console.error('Error checking transaction_id:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (existingTransaction) {
              resolve({
                success: false,
                error: 'Transaction ID already exists'
              });
              return;
            }

            // Check if credit_number already exists for this pastorate and book_type
            this.db.db.get(
              'SELECT id FROM church_other_credit_transactions WHERE church_id = ? AND book_type = ? AND credit_number = ?',
              [churchId, bookType, credit_number],
              (err, existingCredit) => {
                if (err) {
                  console.error('Error checking credit_number:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                if (existingCredit) {
                  resolve({
                    success: false,
                    error: 'Credit number already exists for this pastorate and book type'
                  });
                  return;
                }

                // Insert the transaction
                const dbInstance = this.db.db;
                dbInstance.run(
                  `INSERT INTO church_other_credit_transactions
                  (transaction_id, credit_number, church_id, book_type, family_id, giver_name, primary_category_id, secondary_category_id, date, amount, created_by, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                  [transaction_id, credit_number, churchId, bookType, family_id || null, giver_name, primary_category_id || null, secondary_category_id || null, date, amount, userId],
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
                      transactionId: this.lastID
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
   * Get all other credit transactions for a pastorate with pagination and filtering
   */
  async getTransactions(churchId, userId, bookType, page = 1, limit = 10, filters = {}) {
    return new Promise((resolve) => {
      try {
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE oct.church_id = ? AND oct.book_type = ?';
        let queryParams = [churchId, bookType];

        // Add month filter if specified
        if (filters.month && filters.month !== 'all') {
          whereClause += ' AND strftime("%Y-%m", oct.date) = ?';
          queryParams.push(filters.month);
        }

        // Get transactions with category names
        const transactionQuery = `
          SELECT
            oct.*,
            lc.category_name as primary_category_name,
            lsc.sub_category_name as secondary_category_name
          FROM church_other_credit_transactions oct
          LEFT JOIN church_ledger_categories lc ON oct.primary_category_id = lc.id
          LEFT JOIN church_ledger_sub_categories lsc ON oct.secondary_category_id = lsc.id
          ${whereClause}
          ORDER BY oct.date DESC, oct.created_at DESC
          LIMIT ? OFFSET ?`;

        this.db.db.all(
          transactionQuery,
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

            // Get total count with same filters
            const countQuery = `SELECT COUNT(*) as count FROM church_other_credit_transactions oct ${whereClause}`;
            this.db.db.get(
              countQuery,
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
                  total: parseInt(countResult?.count || 0),
                  page: parseInt(page),
                  limit: parseInt(limit),
                  totalPages: Math.ceil(parseInt(countResult?.count || 0) / limit)
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
          `SELECT oct.*, 
                  lc.category_name as primary_category_name,
                  lsc.sub_category_name as secondary_category_name
           FROM church_other_credit_transactions oct
           LEFT JOIN church_ledger_categories lc ON oct.primary_category_id = lc.id
           LEFT JOIN church_ledger_sub_categories lsc ON oct.secondary_category_id = lsc.id
           WHERE oct.id = ?`,
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
   * Update a transaction
   */
  async updateTransaction(transactionId, transactionData, userId) {
    return new Promise((resolve) => {
      try {
        const {
          transaction_id,
          credit_number,
          family_id,
          giver_name,
          primary_category_id,
          secondary_category_id,
          date,
          amount,
          churchId,
          bookType
        } = transactionData;

        // Validate required fields
        if (!transaction_id || !credit_number || !giver_name || !date || !amount || !churchId || !bookType) {
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

        // Validate transaction_id format (OC-XXXXX)
        if (!transaction_id.match(/^OC-[A-Z0-9]{5}$/)) {
          resolve({
            success: false,
            error: 'Transaction ID must be in format OC-XXXXX (5 alphanumeric characters)'
          });
          return;
        }

        // Check if transaction_id already exists (excluding current transaction)
        this.db.db.get(
          'SELECT id FROM church_other_credit_transactions WHERE transaction_id = ? AND id != ?',
          [transaction_id, transactionId],
          (err, existingTransaction) => {
            if (err) {
              console.error('Error checking transaction_id:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (existingTransaction) {
              resolve({
                success: false,
                error: 'Transaction ID already exists'
              });
              return;
            }

            // Check if credit_number already exists for this pastorate and book_type (excluding current transaction)
            this.db.db.get(
              'SELECT id FROM church_other_credit_transactions WHERE church_id = ? AND book_type = ? AND credit_number = ? AND id != ?',
              [churchId, bookType, credit_number, transactionId],
              (err, existingCredit) => {
                if (err) {
                  console.error('Error checking credit_number:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                if (existingCredit) {
                  resolve({
                    success: false,
                    error: 'Credit number already exists for this pastorate and book type'
                  });
                  return;
                }

                // Update the transaction
                this.db.db.run(
                  `UPDATE church_other_credit_transactions
                   SET transaction_id = ?, credit_number = ?, family_id = ?, giver_name = ?,
                       primary_category_id = ?, secondary_category_id = ?, date = ?, amount = ?, updated_at = datetime('now')
                   WHERE id = ?`,
                  [transaction_id, credit_number, family_id || null, giver_name, primary_category_id || null, secondary_category_id || null, date, amount, transactionId],
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
                      transactionId
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
   * Delete a transaction
   */
  async deleteTransaction(transactionId, userId) {
    return new Promise((resolve) => {
      try {
        this.db.db.run(
          'DELETE FROM church_other_credit_transactions WHERE id = ?',
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
   * Get the next available credit number for a pastorate and book type
   */
  async getNextCreditNumber(churchId, bookType) {
    return new Promise((resolve) => {
      try {
        this.db.db.get(
          'SELECT MAX(credit_number) as max_number FROM church_other_credit_transactions WHERE church_id = ? AND book_type = ?',
          [churchId, bookType],
          (err, result) => {
            if (err) {
              console.error('Error getting next credit number:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            const nextNumber = (result?.max_number || 0) + 1;
            resolve({
              success: true,
              nextCreditNumber: nextNumber
            });
          }
        );
      } catch (error) {
        console.error('Error getting next credit number:', error);
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
  async searchFamilies(churchId, searchTerm) {
    return new Promise((resolve) => {
      try {
        // Get families from the specific church only
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
          WHERE c.id = ?
            AND (
              f.family_name LIKE ? OR
              a.area_name LIKE ? OR
              f.family_number LIKE ?
            )
          ORDER BY f.family_name
          LIMIT 50`,
          [churchId, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`],
          (err, families) => {
            if (err) {
              console.error('Error searching families:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            // Format families for display
            const formattedFamilies = (families || []).map(f => ({
              id: f.id,
              displayName: `${f.family_name} - ${f.area_name} - ${f.family_number}`
            }));

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
   * Get statistics for other credits
   */
  async getStatistics(churchId, bookType) {
    return new Promise((resolve) => {
      try {
        // Get total amount
        this.db.db.get(
          `SELECT COALESCE(SUM(amount), 0) as total
           FROM church_other_credit_transactions
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
                COALESCE(SUM(oct.amount), 0) as total
              FROM church_other_credit_transactions oct
              LEFT JOIN church_ledger_categories lc ON oct.primary_category_id = lc.id
              WHERE oct.church_id = ? AND oct.book_type = ?
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

module.exports = ChurchOtherCreditsService;

