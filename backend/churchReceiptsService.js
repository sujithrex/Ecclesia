class ChurchReceiptsService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Generate a unique transaction ID in format RP-XXXXX
   */
  async generateTransactionId() {
    return new Promise((resolve) => {
      const generateId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = 'RP-';
        for (let i = 0; i < 5; i++) {
          id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
      };

      const checkAndGenerate = () => {
        const id = generateId();
        this.db.db.get(
          'SELECT id FROM church_receipt_transactions WHERE transaction_id = ?',
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
   * Create a new receipt transaction
   */
  async createTransaction(transactionData, userId) {
    return new Promise((resolve) => {
      try {
        console.log('=== CREATE RECEIPT TRANSACTION CALLED ===');
        console.log('Transaction Data:', transactionData);
        console.log('User ID:', userId);

        const {
          transaction_id,
          receipt_number,
          family_id,
          giver_name,
          offering_type,
          date,
          amount,
          churchId,
          bookType
        } = transactionData;

        console.log('Extracted fields:', {
          transaction_id,
          receipt_number,
          family_id,
          giver_name,
          offering_type,
          date,
          amount,
          churchId,
          bookType
        });

        // Validate required fields
        if (!transaction_id || !receipt_number || !giver_name || !offering_type || !date || !amount || !churchId || !bookType) {
          console.log('Validation failed - missing fields');
          resolve({
            success: false,
            error: 'All fields are required'
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

        // Validate transaction_id format (RP-XXXXX)
        if (!transaction_id.match(/^RP-[A-Z0-9]{5}$/)) {
          resolve({
            success: false,
            error: 'Transaction ID must be in format RP-XXXXX (5 alphanumeric characters)'
          });
          return;
        }

        // Check if transaction_id already exists
        this.db.db.get(
          'SELECT id FROM church_receipt_transactions WHERE transaction_id = ?',
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

            // Check if receipt_number already exists for this pastorate and book_type
            this.db.db.get(
              'SELECT id FROM church_receipt_transactions WHERE church_id = ? AND book_type = ? AND receipt_number = ?',
              [churchId, bookType, receipt_number],
              (err, existingReceipt) => {
                if (err) {
                  console.error('Error checking receipt_number:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                if (existingReceipt) {
                  resolve({
                    success: false,
                    error: 'Receipt number already exists for this pastorate and book type'
                  });
                  return;
                }

                // Insert the transaction
                const dbInstance = this.db.db;
                dbInstance.run(
                  `INSERT INTO church_receipt_transactions
                  (transaction_id, receipt_number, church_id, book_type, family_id, giver_name, offering_type, date, amount, created_by, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                  [transaction_id, receipt_number, churchId, bookType, family_id || null, giver_name, offering_type, date, amount, userId],
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
                      id: this.lastID,
                      transaction: {
                        id: this.lastID,
                        transaction_id,
                        receipt_number,
                        church_id: churchId,
                        book_type: bookType,
                        family_id: family_id || null,
                        giver_name,
                        offering_type,
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
        console.error('Error creating receipt transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get all receipt transactions for a pastorate with pagination and filtering
   */
  async getTransactions(churchId, userId, page = 1, limit = 10, filters = {}) {
    return new Promise((resolve) => {
      try {
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE rt.church_id = ?';
        let queryParams = [churchId];

        // Add book_type filter if specified
        if (filters.bookType) {
          whereClause += ' AND rt.book_type = ?';
          queryParams.push(filters.bookType);
        }

        // Add month filter if specified
        if (filters.month && filters.month !== 'all') {
          whereClause += ' AND strftime("%Y-%m", rt.date) = ?';
          queryParams.push(filters.month);
        }

        // Get transactions with family names
        const transactionQuery = `
          SELECT
            rt.*,
            f.family_name,
            f.respect as family_respect,
            a.area_name,
            f.family_number
          FROM church_receipt_transactions rt
          LEFT JOIN families f ON rt.family_id = f.id
          LEFT JOIN areas a ON f.area_id = a.id
          ${whereClause}
          ORDER BY rt.date DESC, rt.created_at DESC
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
            const countQuery = `SELECT COUNT(*) as count FROM church_receipt_transactions rt ${whereClause}`;
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
        console.error('Error getting receipt transactions:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get a single receipt transaction by ID
   */
  async getTransaction(transactionId) {
    return new Promise((resolve) => {
      try {
        this.db.db.get(
          `SELECT
            rt.*,
            f.family_name,
            f.respect as family_respect,
            a.area_name,
            f.family_number
          FROM church_receipt_transactions rt
          LEFT JOIN families f ON rt.family_id = f.id
          LEFT JOIN areas a ON f.area_id = a.id
          WHERE rt.id = ?`,
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
        console.error('Error getting receipt transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Update a receipt transaction
   */
  async updateTransaction(transactionId, transactionData, userId) {
    return new Promise((resolve) => {
      try {
        const {
          transaction_id,
          receipt_number,
          family_id,
          giver_name,
          offering_type,
          date,
          amount,
          churchId,
          bookType
        } = transactionData;

        // Validate required fields
        if (!transaction_id || !receipt_number || !giver_name || !offering_type || !date || !amount || !bookType) {
          resolve({
            success: false,
            error: 'All fields are required'
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

        // Validate transaction_id format (RP-XXXXX)
        if (!transaction_id.match(/^RP-[A-Z0-9]{5}$/)) {
          resolve({
            success: false,
            error: 'Transaction ID must be in format RP-XXXXX (5 alphanumeric characters)'
          });
          return;
        }

        // Check if transaction_id already exists (excluding current transaction)
        this.db.db.get(
          'SELECT id FROM church_receipt_transactions WHERE transaction_id = ? AND id != ?',
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

            // Check if receipt_number already exists for this pastorate and book_type (excluding current transaction)
            this.db.db.get(
              'SELECT id FROM church_receipt_transactions WHERE church_id = ? AND book_type = ? AND receipt_number = ? AND id != ?',
              [churchId, bookType, receipt_number, transactionId],
              (err, existingReceipt) => {
                if (err) {
                  console.error('Error checking receipt_number:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                if (existingReceipt) {
                  resolve({
                    success: false,
                    error: 'Receipt number already exists for this pastorate and book type'
                  });
                  return;
                }

                // Update the transaction
                this.db.db.run(
                  `UPDATE church_receipt_transactions
                  SET transaction_id = ?, receipt_number = ?, book_type = ?, family_id = ?, giver_name = ?, offering_type = ?, date = ?, amount = ?, updated_at = datetime('now')
                  WHERE id = ?`,
                  [transaction_id, receipt_number, bookType, family_id || null, giver_name, offering_type, date, amount, transactionId],
                  function(err) {
                    if (err) {
                      console.error('Error updating transaction:', err);
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
                      transaction: {
                        id: transactionId,
                        transaction_id,
                        receipt_number,
                        book_type: bookType,
                        family_id: family_id || null,
                        giver_name,
                        offering_type,
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
        console.error('Error updating receipt transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Delete a receipt transaction
   */
  async deleteTransaction(transactionId, userId) {
    return new Promise((resolve) => {
      try {
        this.db.db.run(
          'DELETE FROM church_receipt_transactions WHERE id = ?',
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
              success: true
            });
          }
        );
      } catch (error) {
        console.error('Error deleting receipt transaction:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get the next available receipt number for a pastorate and book type
   */
  async getNextReceiptNumber(churchId, bookType) {
    return new Promise((resolve) => {
      try {
        this.db.db.get(
          'SELECT MAX(receipt_number) as max_number FROM church_receipt_transactions WHERE church_id = ? AND book_type = ?',
          [churchId, bookType],
          (err, result) => {
            if (err) {
              console.error('Error getting next receipt number:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            const nextNumber = (result?.max_number || 0) + 1;
            resolve({
              success: true,
              nextReceiptNumber: nextNumber
            });
          }
        );
      } catch (error) {
        console.error('Error getting next receipt number:', error);
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
   * Get receipt statistics for a pastorate
   */
  async getStatistics(churchId) {
    return new Promise((resolve) => {
      try {
        // Get total amount
        this.db.db.get(
          `SELECT COALESCE(SUM(amount), 0) as total
          FROM church_receipt_transactions
          WHERE church_id = ?`,
          [churchId],
          (err, totalResult) => {
            if (err) {
              console.error('Error getting total:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            // Get totals by offering type
            this.db.db.all(
              `SELECT
                offering_type,
                COALESCE(SUM(amount), 0) as total
              FROM church_receipt_transactions
              WHERE church_id = ?
              GROUP BY offering_type
              ORDER BY total DESC`,
              [churchId],
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
                  FROM church_receipt_transactions
                  WHERE church_id = ? AND strftime('%Y', date) = strftime('%Y', 'now')
                  GROUP BY strftime('%m', date)
                  ORDER BY month`,
                  [churchId],
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
        console.error('Error getting receipt statistics:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }
}

module.exports = ChurchReceiptsService;
