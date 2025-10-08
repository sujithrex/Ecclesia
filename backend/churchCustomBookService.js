/**
 * Church Custom Book Service
 * Handles CRUD operations for custom books at church level
 */

class ChurchCustomBookService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a new custom book
   */
  async createBook(bookData, userId) {
    const { churchId, bookName } = bookData;

    return new Promise((resolve) => {
      try {
        // Validate required fields
        if (!userId) {
          console.error('Error creating church custom book: userId is required');
          resolve({
            success: false,
            error: 'User ID is required'
          });
          return;
        }

        if (!churchId) {
          console.error('Error creating church custom book: churchId is required');
          resolve({
            success: false,
            error: 'Church ID is required'
          });
          return;
        }

        if (!bookName || !bookName.trim()) {
          console.error('Error creating church custom book: bookName is required');
          resolve({
            success: false,
            error: 'Book name is required'
          });
          return;
        }

        console.log('Creating church custom book:', { churchId, bookName, userId });

        this.db.db.run(
          `INSERT INTO church_custom_books (church_id, book_name, created_by, created_at, updated_at)
           VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
          [churchId, bookName, userId],
          function(err) {
            if (err) {
              console.error('Error creating church custom book:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            console.log('Church custom book created successfully with ID:', this.lastID);
            resolve({
              success: true,
              bookId: this.lastID,
              message: 'Custom book created successfully'
            });
          }
        );
      } catch (error) {
        console.error('Error creating church custom book:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get all custom books for a church
   */
  async getBooksByChurch(churchId, userId) {
    return new Promise((resolve) => {
      try {
        this.db.db.all(
          `SELECT * FROM church_custom_books 
           WHERE church_id = ?
           ORDER BY created_at DESC`,
          [churchId],
          (err, rows) => {
            if (err) {
              console.error('Error fetching church custom books:', err);
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
        console.error('Error fetching church custom books:', error);
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
          `SELECT * FROM church_custom_books WHERE id = ?`,
          [bookId],
          (err, row) => {
            if (err) {
              console.error('Error fetching church custom book:', err);
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
        console.error('Error fetching church custom book:', error);
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
          `UPDATE church_custom_books 
           SET book_name = ?, updated_at = datetime('now')
           WHERE id = ?`,
          [bookName, bookId],
          function(err) {
            if (err) {
              console.error('Error updating church custom book:', err);
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
        console.error('Error updating church custom book:', error);
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
          `DELETE FROM church_custom_books WHERE id = ?`,
          [bookId],
          function(err) {
            if (err) {
              console.error('Error deleting church custom book:', err);
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
        console.error('Error deleting church custom book:', error);
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
           FROM church_custom_book_credit_transactions
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
               FROM church_custom_book_debit_transactions
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

module.exports = ChurchCustomBookService;

