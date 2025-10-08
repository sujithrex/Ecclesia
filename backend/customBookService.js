/**
 * Custom Book Service
 * Handles CRUD operations for custom books at pastorate level
 */

class CustomBookService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a new custom book
   */
  async createBook(bookData, userId) {
    const { pastorateId, bookName } = bookData;

    return new Promise((resolve) => {
      try {
        // Validate required fields
        if (!userId) {
          console.error('Error creating custom book: userId is required');
          resolve({
            success: false,
            error: 'User ID is required'
          });
          return;
        }

        if (!pastorateId) {
          console.error('Error creating custom book: pastorateId is required');
          resolve({
            success: false,
            error: 'Pastorate ID is required'
          });
          return;
        }

        if (!bookName || !bookName.trim()) {
          console.error('Error creating custom book: bookName is required');
          resolve({
            success: false,
            error: 'Book name is required'
          });
          return;
        }

        console.log('Creating custom book:', { pastorateId, bookName, userId });

        this.db.db.run(
          `INSERT INTO custom_books (pastorate_id, book_name, created_by, created_at, updated_at)
           VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
          [pastorateId, bookName, userId],
          function(err) {
            if (err) {
              console.error('Error creating custom book:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            console.log('Custom book created successfully with ID:', this.lastID);
            resolve({
              success: true,
              bookId: this.lastID,
              message: 'Custom book created successfully'
            });
          }
        );
      } catch (error) {
        console.error('Error creating custom book:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get all custom books for a pastorate
   */
  async getBooksByPastorate(pastorateId, userId) {
    return new Promise((resolve) => {
      try {
        this.db.db.all(
          `SELECT * FROM custom_books 
           WHERE pastorate_id = ?
           ORDER BY created_at DESC`,
          [pastorateId],
          (err, rows) => {
            if (err) {
              console.error('Error fetching custom books:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            resolve({
              success: true,
              books: rows || []
            });
          }
        );
      } catch (error) {
        console.error('Error fetching custom books:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get a single custom book by ID
   */
  async getBookById(bookId, userId) {
    return new Promise((resolve) => {
      try {
        this.db.db.get(
          `SELECT * FROM custom_books WHERE id = ?`,
          [bookId],
          (err, row) => {
            if (err) {
              console.error('Error fetching custom book:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (!row) {
              resolve({
                success: false,
                error: 'Custom book not found'
              });
              return;
            }

            resolve({
              success: true,
              book: row
            });
          }
        );
      } catch (error) {
        console.error('Error fetching custom book:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Update a custom book
   */
  async updateBook(bookId, bookData, userId) {
    const { bookName } = bookData;

    return new Promise((resolve) => {
      try {
        this.db.db.run(
          `UPDATE custom_books 
           SET book_name = ?, updated_at = datetime('now')
           WHERE id = ?`,
          [bookName, bookId],
          function(err) {
            if (err) {
              console.error('Error updating custom book:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (this.changes === 0) {
              resolve({
                success: false,
                error: 'Custom book not found'
              });
              return;
            }

            resolve({
              success: true,
              message: 'Custom book updated successfully'
            });
          }
        );
      } catch (error) {
        console.error('Error updating custom book:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Delete a custom book
   */
  async deleteBook(bookId, userId) {
    return new Promise((resolve) => {
      try {
        this.db.db.run(
          `DELETE FROM custom_books WHERE id = ?`,
          [bookId],
          function(err) {
            if (err) {
              console.error('Error deleting custom book:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (this.changes === 0) {
              resolve({
                success: false,
                error: 'Custom book not found'
              });
              return;
            }

            resolve({
              success: true,
              message: 'Custom book deleted successfully'
            });
          }
        );
      } catch (error) {
        console.error('Error deleting custom book:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get balance for a custom book
   */
  async getBookBalance(bookId) {
    return new Promise((resolve) => {
      try {
        // Get total credits
        this.db.db.get(
          `SELECT COALESCE(SUM(amount), 0) as total_credit
           FROM custom_book_credit_transactions
           WHERE custom_book_id = ?`,
          [bookId],
          (err, creditResult) => {
            if (err) {
              console.error('Error calculating credits:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            // Get total debits
            this.db.db.get(
              `SELECT COALESCE(SUM(amount), 0) as total_debit
               FROM custom_book_debit_transactions
               WHERE custom_book_id = ?`,
              [bookId],
              (err, debitResult) => {
                if (err) {
                  console.error('Error calculating debits:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                const totalCredit = parseFloat(creditResult?.total_credit || 0);
                const totalDebit = parseFloat(debitResult?.total_debit || 0);
                const balance = totalCredit - totalDebit;

                resolve({
                  success: true,
                  data: {
                    totalCredit,
                    totalDebit,
                    balance
                  }
                });
              }
            );
          }
        );
      } catch (error) {
        console.error('Error getting book balance:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }
}

module.exports = CustomBookService;

