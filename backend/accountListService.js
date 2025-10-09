/**
 * Account List Service
 * Provides a unified list of all accounts within a pastorate for contra transfers
 */

class AccountListService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get all accounts for a pastorate (for contra transfer dropdowns)
   * Returns: Pastorate accounts, Church accounts, Custom books, Church custom books
   */
  async getAllAccountsForPastorate(pastorateId) {
    return new Promise((resolve) => {
      try {
        const accounts = [];

        // Get pastorate info
        this.db.db.get(
          'SELECT pastorate_name FROM pastorates WHERE id = ?',
          [pastorateId],
          (err, pastorate) => {
            if (err) {
              console.error('Error fetching pastorate:', err);
              resolve({ success: false, error: err.message });
              return;
            }

            if (!pastorate) {
              resolve({ success: false, error: 'Pastorate not found' });
              return;
            }

            const pastorateName = pastorate.pastorate_name;

            // Add Pastorate Cash, Bank, Diocese accounts
            accounts.push({
              type: 'pastorate_cash',
              id: pastorateId,
              displayName: `${pastorateName} - Cash`,
              accountType: 'Pastorate Account'
            });

            accounts.push({
              type: 'pastorate_bank',
              id: pastorateId,
              displayName: `${pastorateName} - Bank`,
              accountType: 'Pastorate Account'
            });

            accounts.push({
              type: 'pastorate_diocese',
              id: pastorateId,
              displayName: `${pastorateName} - Diocese`,
              accountType: 'Pastorate Account'
            });

            // Get all churches in the pastorate
            this.db.db.all(
              'SELECT id, church_name FROM churches WHERE pastorate_id = ? ORDER BY church_name',
              [pastorateId],
              (err, churches) => {
                if (err) {
                  console.error('Error fetching churches:', err);
                  resolve({ success: false, error: err.message });
                  return;
                }

                // Add church accounts (Cash, Bank only - churches don't have diocese accounts)
                (churches || []).forEach(church => {
                  accounts.push({
                    type: 'church_cash',
                    id: church.id,
                    displayName: `${church.church_name} - Cash`,
                    accountType: 'Church Account'
                  });

                  accounts.push({
                    type: 'church_bank',
                    id: church.id,
                    displayName: `${church.church_name} - Bank`,
                    accountType: 'Church Account'
                  });
                });

                // Get all custom books for the pastorate
                this.db.db.all(
                  'SELECT id, book_name FROM custom_books WHERE pastorate_id = ? ORDER BY book_name',
                  [pastorateId],
                  (err, customBooks) => {
                    if (err) {
                      console.error('Error fetching custom books:', err);
                      resolve({ success: false, error: err.message });
                      return;
                    }

                    // Add custom books
                    (customBooks || []).forEach(book => {
                      accounts.push({
                        type: 'custom_book',
                        id: book.id,
                        displayName: `${book.book_name}`,
                        accountType: 'Custom Book'
                      });
                    });

                    // Get all church custom books
                    this.db.db.all(
                      `SELECT cb.id, cb.book_name, c.church_name 
                       FROM church_custom_books cb
                       JOIN churches c ON cb.church_id = c.id
                       WHERE c.pastorate_id = ?
                       ORDER BY c.church_name, cb.book_name`,
                      [pastorateId],
                      (err, churchCustomBooks) => {
                        if (err) {
                          console.error('Error fetching church custom books:', err);
                          resolve({ success: false, error: err.message });
                          return;
                        }

                        // Add church custom books
                        (churchCustomBooks || []).forEach(book => {
                          accounts.push({
                            type: 'church_custom_book',
                            id: book.id,
                            displayName: `${book.church_name} - ${book.book_name}`,
                            accountType: 'Church Custom Book'
                          });
                        });

                        resolve({
                          success: true,
                          accounts: accounts
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
        console.error('Error getting all accounts:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get all accounts for a church (for church-level contra transfers)
   */
  async getAllAccountsForChurch(churchId) {
    return new Promise((resolve) => {
      try {
        const accounts = [];

        // Get church and pastorate info
        this.db.db.get(
          `SELECT c.church_name, c.pastorate_id, p.pastorate_name 
           FROM churches c
           JOIN pastorates p ON c.pastorate_id = p.id
           WHERE c.id = ?`,
          [churchId],
          (err, church) => {
            if (err) {
              console.error('Error fetching church:', err);
              resolve({ success: false, error: err.message });
              return;
            }

            if (!church) {
              resolve({ success: false, error: 'Church not found' });
              return;
            }

            const churchName = church.church_name;
            const pastorateId = church.pastorate_id;
            const pastorateName = church.pastorate_name;

            // Add Pastorate Cash, Bank, Diocese accounts
            accounts.push({
              type: 'pastorate_cash',
              id: pastorateId,
              displayName: `${pastorateName} - Cash`,
              accountType: 'Pastorate Account'
            });

            accounts.push({
              type: 'pastorate_bank',
              id: pastorateId,
              displayName: `${pastorateName} - Bank`,
              accountType: 'Pastorate Account'
            });

            accounts.push({
              type: 'pastorate_diocese',
              id: pastorateId,
              displayName: `${pastorateName} - Diocese`,
              accountType: 'Pastorate Account'
            });

            // Add this church's accounts (Cash, Bank only - churches don't have diocese accounts)
            accounts.push({
              type: 'church_cash',
              id: churchId,
              displayName: `${churchName} - Cash`,
              accountType: 'Church Account'
            });

            accounts.push({
              type: 'church_bank',
              id: churchId,
              displayName: `${churchName} - Bank`,
              accountType: 'Church Account'
            });

            // Get all custom books for the pastorate
            this.db.db.all(
              'SELECT id, book_name FROM custom_books WHERE pastorate_id = ? ORDER BY book_name',
              [pastorateId],
              (err, customBooks) => {
                if (err) {
                  console.error('Error fetching custom books:', err);
                  resolve({ success: false, error: err.message });
                  return;
                }

                // Add custom books
                (customBooks || []).forEach(book => {
                  accounts.push({
                    type: 'custom_book',
                    id: book.id,
                    displayName: `${book.book_name}`,
                    accountType: 'Custom Book'
                  });
                });

                // Get all church custom books for this church
                this.db.db.all(
                  'SELECT id, book_name FROM church_custom_books WHERE church_id = ? ORDER BY book_name',
                  [churchId],
                  (err, churchCustomBooks) => {
                    if (err) {
                      console.error('Error fetching church custom books:', err);
                      resolve({ success: false, error: err.message });
                      return;
                    }

                    // Add church custom books
                    (churchCustomBooks || []).forEach(book => {
                      accounts.push({
                        type: 'church_custom_book',
                        id: book.id,
                        displayName: `${churchName} - ${book.book_name}`,
                        accountType: 'Church Custom Book'
                      });
                    });

                    resolve({
                      success: true,
                      accounts: accounts
                    });
                  }
                );
              }
            );
          }
        );
      } catch (error) {
        console.error('Error getting all accounts for church:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get categories with subcategories for a specific account
   * This is used in contra vouchers to show only relevant categories based on selected account
   */
  async getCategoriesForAccount(accountType, accountId) {
    return new Promise((resolve) => {
      try {
        console.log('getCategoriesForAccount called with:', { accountType, accountId });

        // Determine which table and book type to query based on account type
        if (accountType === 'pastorate_cash' || accountType === 'pastorate_bank' || accountType === 'pastorate_diocese') {
          // Pastorate ledger categories - load all categories for the pastorate regardless of book_type
          // This allows contra vouchers to use any category when transferring between different book types
          console.log(`Querying pastorate ledger_categories with pastorate_id=${accountId}`);

          this.db.db.all(
            `SELECT * FROM ledger_categories
             WHERE pastorate_id = ?
             ORDER BY category_type, category_name`,
            [accountId],
            (err, categories) => {
              if (err) {
                console.error('Error getting pastorate categories:', err);
                resolve({ success: false, error: err.message });
                return;
              }

              console.log(`Query returned ${(categories || []).length} categories for pastorate_id=${accountId}`);

              // Get subcategories for each category
              const promises = (categories || []).map(category => {
                return new Promise((resolveSubcat) => {
                  this.db.db.all(
                    `SELECT * FROM ledger_sub_categories
                     WHERE parent_category_id = ?
                     ORDER BY sub_category_name`,
                    [category.id],
                    (err, subcategories) => {
                      if (err) {
                        console.error('Error getting subcategories:', err);
                        resolveSubcat({ ...category, sub_categories: [] });
                      } else {
                        resolveSubcat({ ...category, sub_categories: subcategories || [] });
                      }
                    }
                  );
                });
              });

              Promise.all(promises).then(categoriesWithSubcategories => {
                console.log(`Pastorate categories loaded: ${categoriesWithSubcategories.length} categories for ${accountType}`);
                resolve({
                  success: true,
                  categories: categoriesWithSubcategories
                });
              });
            }
          );
        } else if (accountType === 'church_cash' || accountType === 'church_bank') {
          // Church ledger categories - load all categories for the church regardless of book_type
          // This allows contra vouchers to use any category when transferring between different book types
          console.log(`Querying church_ledger_categories with church_id=${accountId}`);

          this.db.db.all(
            `SELECT * FROM church_ledger_categories
             WHERE church_id = ?
             ORDER BY category_type, category_name`,
            [accountId],
            (err, categories) => {
              if (err) {
                console.error('Error getting church categories:', err);
                resolve({ success: false, error: err.message });
                return;
              }

              console.log(`Query returned ${(categories || []).length} categories for church_id=${accountId}`);

              // Get subcategories for each category
              const promises = (categories || []).map(category => {
                return new Promise((resolveSubcat) => {
                  this.db.db.all(
                    `SELECT * FROM church_ledger_sub_categories
                     WHERE parent_category_id = ?
                     ORDER BY sub_category_name`,
                    [category.id],
                    (err, subcategories) => {
                      if (err) {
                        console.error('Error getting subcategories:', err);
                        resolveSubcat({ ...category, sub_categories: [] });
                      } else {
                        resolveSubcat({ ...category, sub_categories: subcategories || [] });
                      }
                    }
                  );
                });
              });

              Promise.all(promises).then(categoriesWithSubcategories => {
                console.log(`Church categories loaded: ${categoriesWithSubcategories.length} categories for ${accountType}`);
                resolve({
                  success: true,
                  categories: categoriesWithSubcategories
                });
              });
            }
          );
        } else if (accountType === 'custom_book') {
          // Pastorate custom book categories
          this.db.db.all(
            `SELECT * FROM custom_book_categories
             WHERE custom_book_id = ?
             ORDER BY category_type, category_name`,
            [accountId],
            (err, categories) => {
              if (err) {
                console.error('Error getting custom book categories:', err);
                resolve({ success: false, error: err.message });
                return;
              }

              // Get subcategories for each category
              const promises = (categories || []).map(category => {
                return new Promise((resolveSubcat) => {
                  this.db.db.all(
                    `SELECT * FROM custom_book_subcategories
                     WHERE category_id = ?
                     ORDER BY subcategory_name`,
                    [category.id],
                    (err, subcategories) => {
                      if (err) {
                        console.error('Error getting subcategories:', err);
                        resolveSubcat({ ...category, subcategories: [] });
                      } else {
                        resolveSubcat({ ...category, subcategories: subcategories || [] });
                      }
                    }
                  );
                });
              });

              Promise.all(promises).then(categoriesWithSubcategories => {
                resolve({
                  success: true,
                  categories: categoriesWithSubcategories
                });
              });
            }
          );
        } else if (accountType === 'church_custom_book') {
          // Church custom book categories
          this.db.db.all(
            `SELECT * FROM church_custom_book_categories
             WHERE custom_book_id = ?
             ORDER BY category_type, category_name`,
            [accountId],
            (err, categories) => {
              if (err) {
                console.error('Error getting church custom book categories:', err);
                resolve({ success: false, error: err.message });
                return;
              }

              // Get subcategories for each category
              const promises = (categories || []).map(category => {
                return new Promise((resolveSubcat) => {
                  this.db.db.all(
                    `SELECT * FROM church_custom_book_subcategories
                     WHERE category_id = ?
                     ORDER BY subcategory_name`,
                    [category.id],
                    (err, subcategories) => {
                      if (err) {
                        console.error('Error getting subcategories:', err);
                        resolveSubcat({ ...category, subcategories: [] });
                      } else {
                        resolveSubcat({ ...category, subcategories: subcategories || [] });
                      }
                    }
                  );
                });
              });

              Promise.all(promises).then(categoriesWithSubcategories => {
                resolve({
                  success: true,
                  categories: categoriesWithSubcategories
                });
              });
            }
          );
        } else {
          resolve({
            success: false,
            error: 'Invalid account type'
          });
        }
      } catch (error) {
        console.error('Error getting categories for account:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }
}

module.exports = AccountListService;

