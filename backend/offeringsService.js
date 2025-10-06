class OfferingsService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a new offering transaction
   */
  async createTransaction(transactionData, userId) {
    return new Promise((resolve) => {
      try {
        console.log('=== CREATE TRANSACTION CALLED ===');
        console.log('Transaction Data:', transactionData);
        console.log('User ID:', userId);

        const {
          transaction_id,
          church_id,
          offering_type,
          date,
          amount,
          pastorateId
        } = transactionData;

        console.log('Extracted fields:', {
          transaction_id,
          church_id,
          offering_type,
          date,
          amount,
          pastorateId
        });

        // Validate required fields
        if (!transaction_id || !church_id || !offering_type || !date || !amount || !pastorateId) {
          console.log('Validation failed - missing fields');
          resolve({
            success: false,
            error: 'All fields are required'
          });
          return;
        }

        console.log('Validation passed, checking for existing transaction...');

        // Check if transaction_id already exists
        this.db.db.get(
          'SELECT id FROM offering_transactions WHERE transaction_id = ?',
          [transaction_id],
          (err, existingTransaction) => {
            if (err) {
              console.error('Error checking transaction ID:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (existingTransaction) {
              resolve({
                success: false,
                error: 'Transaction ID already exists. Please use a different ID.'
              });
              return;
            }

            // Insert the transaction
            const dbInstance = this.db.db;
            dbInstance.run(
              `INSERT INTO offering_transactions
              (transaction_id, pastorate_id, church_id, offering_type, date, amount, created_by, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
              [transaction_id, pastorateId, church_id, offering_type, date, amount, userId],
              function(err) {
                if (err) {
                  console.error('Error inserting transaction:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                const insertedId = this.lastID;
                console.log('Transaction inserted with ID:', insertedId);

                // Get the inserted transaction
                dbInstance.get(
                  'SELECT * FROM offering_transactions WHERE id = ?',
                  [insertedId],
                  (err, transaction) => {
                    if (err) {
                      console.error('Error fetching inserted transaction:', err);
                      resolve({
                        success: false,
                        error: err.message
                      });
                      return;
                    }

                    console.log('Transaction fetched:', transaction);
                    resolve({
                      success: true,
                      transaction
                    });
                  }
                );
              }
            );
          }
        );
      } catch (error) {
        console.error('Error creating offering transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get all offering transactions for a pastorate with pagination and filtering
   */
  async getTransactions(pastorateId, userId, page = 1, limit = 10, filters = {}) {
    return new Promise((resolve) => {
      try {
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE ot.pastorate_id = ?';
        let queryParams = [pastorateId];

        // Add month filter if specified
        if (filters.month && filters.month !== 'all') {
          whereClause += ' AND strftime("%Y-%m", ot.date) = ?';
          queryParams.push(filters.month);
        }

        // Get transactions with church names
        const transactionQuery = `
          SELECT
            ot.*,
            c.church_name
          FROM offering_transactions ot
          LEFT JOIN churches c ON ot.church_id = c.id
          ${whereClause}
          ORDER BY ot.date DESC, ot.created_at DESC
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
            const countQuery = `SELECT COUNT(*) as count FROM offering_transactions ot ${whereClause}`;
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
        console.error('Error getting offering transactions:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get a single offering transaction by ID
   */
  async getTransaction(transactionId) {
    return new Promise((resolve) => {
      try {
        this.db.db.get(
          `SELECT
            ot.*,
            c.church_name
          FROM offering_transactions ot
          LEFT JOIN churches c ON ot.church_id = c.id
          WHERE ot.id = ?`,
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
        console.error('Error getting offering transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Update an offering transaction
   */
  async updateTransaction(transactionId, transactionData, userId) {
    return new Promise((resolve) => {
      try {
        const {
          transaction_id,
          church_id,
          offering_type,
          date,
          amount
        } = transactionData;

        // Validate required fields
        if (!transaction_id || !church_id || !offering_type || !date || !amount) {
          resolve({
            success: false,
            error: 'All fields are required'
          });
          return;
        }

        // Check if transaction exists
        this.db.db.get(
          'SELECT id FROM offering_transactions WHERE id = ?',
          [transactionId],
          (err, existingTransaction) => {
            if (err) {
              console.error('Error checking transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (!existingTransaction) {
              resolve({
                success: false,
                error: 'Transaction not found'
              });
              return;
            }

            // Check if new transaction_id conflicts with another record
            this.db.db.get(
              'SELECT id FROM offering_transactions WHERE transaction_id = ? AND id != ?',
              [transaction_id, transactionId],
              (err, conflictCheck) => {
                if (err) {
                  console.error('Error checking conflict:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                if (conflictCheck) {
                  resolve({
                    success: false,
                    error: 'Transaction ID already exists. Please use a different ID.'
                  });
                  return;
                }

                // Update the transaction
                this.db.db.run(
                  `UPDATE offering_transactions
                  SET transaction_id = ?, church_id = ?, offering_type = ?, date = ?, amount = ?, updated_at = datetime('now')
                  WHERE id = ?`,
                  [transaction_id, church_id, offering_type, date, amount, transactionId],
                  (err) => {
                    if (err) {
                      console.error('Error updating transaction:', err);
                      resolve({
                        success: false,
                        error: err.message
                      });
                      return;
                    }

                    // Get the updated transaction
                    this.db.db.get(
                      'SELECT * FROM offering_transactions WHERE id = ?',
                      [transactionId],
                      (err, transaction) => {
                        if (err) {
                          console.error('Error fetching updated transaction:', err);
                          resolve({
                            success: false,
                            error: err.message
                          });
                          return;
                        }

                        resolve({
                          success: true,
                          transaction
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      } catch (error) {
        console.error('Error updating offering transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Delete an offering transaction
   */
  async deleteTransaction(transactionId, userId) {
    return new Promise((resolve) => {
      try {
        // Check if transaction exists
        this.db.db.get(
          'SELECT id FROM offering_transactions WHERE id = ?',
          [transactionId],
          (err, existingTransaction) => {
            if (err) {
              console.error('Error checking transaction:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (!existingTransaction) {
              resolve({
                success: false,
                error: 'Transaction not found'
              });
              return;
            }

            // Delete the transaction
            this.db.db.run(
              'DELETE FROM offering_transactions WHERE id = ?',
              [transactionId],
              (err) => {
                if (err) {
                  console.error('Error deleting transaction:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                resolve({
                  success: true,
                  message: 'Transaction deleted successfully'
                });
              }
            );
          }
        );
      } catch (error) {
        console.error('Error deleting offering transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get offering statistics for a pastorate
   */
  async getStatistics(pastorateId, userId) {
    return new Promise((resolve) => {
      try {
        // Get total amount
        this.db.db.get(
          'SELECT COALESCE(SUM(amount), 0) as total FROM offering_transactions WHERE pastorate_id = ?',
          [pastorateId],
          (err, totalResult) => {
            if (err) {
              console.error('Error getting total:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            // Get count by offering type
            this.db.db.all(
              `SELECT offering_type, COUNT(*) as count, COALESCE(SUM(amount), 0) as total
              FROM offering_transactions
              WHERE pastorate_id = ?
              GROUP BY offering_type
              ORDER BY total DESC`,
              [pastorateId],
              (err, typeResult) => {
                if (err) {
                  console.error('Error getting type stats:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                // Get monthly totals for current year
                this.db.db.all(
                  `SELECT
                    CAST(strftime('%m', date) AS INTEGER) as month,
                    COALESCE(SUM(amount), 0) as total
                  FROM offering_transactions
                  WHERE pastorate_id = ? AND strftime('%Y', date) = strftime('%Y', 'now')
                  GROUP BY strftime('%m', date)
                  ORDER BY month`,
                  [pastorateId],
                  (err, monthlyResult) => {
                    if (err) {
                      console.error('Error getting monthly stats:', err);
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
                        byType: typeResult || [],
                        monthly: monthlyResult || []
                      }
                    });
                  }
                );
              }
            );
          }
        );
      } catch (error) {
        console.error('Error getting offering statistics:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }
}

module.exports = OfferingsService;

module.exports = OfferingsService;

