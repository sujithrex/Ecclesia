class ChurchLedgerService {
  constructor(dbManager) {
    this.db = dbManager;
  }

  /**
   * Create a new ledger category
   */
  async createCategory(categoryData, userId) {
    return new Promise((resolve) => {
      try {
        const {
          category_type,
          category_name,
          churchId,
          bookType
        } = categoryData;

        // Validate required fields
        if (!category_type || !category_name || !churchId || !bookType) {
          resolve({
            success: false,
            error: 'All fields are required'
          });
          return;
        }

        // Check if category name already exists for this church and book type
        this.db.db.get(
          'SELECT id FROM church_ledger_categories WHERE church_id = ? AND book_type = ? AND category_name = ?',
          [churchId, bookType, category_name],
          (err, existing) => {
            if (err) {
              console.error('Error checking category:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (existing) {
              resolve({
                success: false,
                error: 'Category name already exists for this church and book type'
              });
              return;
            }

            // Insert the category
            const dbInstance = this.db.db;
            dbInstance.run(
              `INSERT INTO church_ledger_categories
              (church_id, book_type, category_type, category_name, created_at, updated_at)
              VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
              [churchId, bookType, category_type, category_name],
              function(err) {
                if (err) {
                  console.error('Error inserting category:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                resolve({
                  success: true,
                  category: {
                    id: this.lastID,
                    church_id: churchId,
                    book_type: bookType,
                    category_type,
                    category_name
                  }
                });
              }
            );
          }
        );
      } catch (error) {
        console.error('Error creating category:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get all categories for a church and book type
   */
  async getCategories(churchId, bookType) {
    return new Promise((resolve) => {
      try {
        this.db.db.all(
          `SELECT * FROM church_ledger_categories 
           WHERE church_id = ? AND book_type = ?
           ORDER BY category_type, category_name`,
          [churchId, bookType],
          (err, categories) => {
            if (err) {
              console.error('Error getting categories:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            resolve({
              success: true,
              categories: categories || []
            });
          }
        );
      } catch (error) {
        console.error('Error getting categories:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Update a category
   */
  async updateCategory(categoryId, categoryData, userId) {
    return new Promise((resolve) => {
      try {
        const {
          category_type,
          category_name,
          churchId,
          bookType
        } = categoryData;

        // Validate required fields
        if (!category_type || !category_name) {
          resolve({
            success: false,
            error: 'All fields are required'
          });
          return;
        }

        // Check if category name already exists (excluding current category)
        this.db.db.get(
          'SELECT id FROM church_ledger_categories WHERE church_id = ? AND book_type = ? AND category_name = ? AND id != ?',
          [churchId, bookType, category_name, categoryId],
          (err, existing) => {
            if (err) {
              console.error('Error checking category:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (existing) {
              resolve({
                success: false,
                error: 'Category name already exists for this church and book type'
              });
              return;
            }

            // Update the category
            this.db.db.run(
              `UPDATE church_ledger_categories 
               SET category_type = ?, category_name = ?, updated_at = datetime('now')
               WHERE id = ?`,
              [category_type, category_name, categoryId],
              function(err) {
                if (err) {
                  console.error('Error updating category:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                resolve({
                  success: true,
                  category: {
                    id: categoryId,
                    category_type,
                    category_name
                  }
                });
              }
            );
          }
        );
      } catch (error) {
        console.error('Error updating category:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId, userId) {
    return new Promise((resolve) => {
      try {
        this.db.db.run(
          'DELETE FROM church_ledger_categories WHERE id = ?',
          [categoryId],
          function(err) {
            if (err) {
              console.error('Error deleting category:', err);
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
        console.error('Error deleting category:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Create a new sub-category
   */
  async createSubCategory(subCategoryData, userId) {
    return new Promise((resolve) => {
      try {
        const {
          parent_category_id,
          sub_category_name
        } = subCategoryData;

        // Validate required fields
        if (!parent_category_id || !sub_category_name) {
          resolve({
            success: false,
            error: 'All fields are required'
          });
          return;
        }

        // Check if sub-category name already exists for this parent
        this.db.db.get(
          'SELECT id FROM church_ledger_sub_categories WHERE parent_category_id = ? AND sub_category_name = ?',
          [parent_category_id, sub_category_name],
          (err, existing) => {
            if (err) {
              console.error('Error checking sub-category:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (existing) {
              resolve({
                success: false,
                error: 'Sub-category name already exists for this category'
              });
              return;
            }

            // Insert the sub-category
            const dbInstance = this.db.db;
            dbInstance.run(
              `INSERT INTO church_ledger_sub_categories
              (parent_category_id, sub_category_name, created_at, updated_at)
              VALUES (?, ?, datetime('now'), datetime('now'))`,
              [parent_category_id, sub_category_name],
              function(err) {
                if (err) {
                  console.error('Error inserting sub-category:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                resolve({
                  success: true,
                  subCategory: {
                    id: this.lastID,
                    parent_category_id,
                    sub_category_name
                  }
                });
              }
            );
          }
        );
      } catch (error) {
        console.error('Error creating sub-category:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get all sub-categories for a parent category
   */
  async getSubCategories(parentCategoryId) {
    return new Promise((resolve) => {
      try {
        this.db.db.all(
          `SELECT * FROM church_ledger_sub_categories
           WHERE parent_category_id = ?
           ORDER BY sub_category_name`,
          [parentCategoryId],
          (err, subCategories) => {
            if (err) {
              console.error('Error getting sub-categories:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            resolve({
              success: true,
              subCategories: subCategories || []
            });
          }
        );
      } catch (error) {
        console.error('Error getting sub-categories:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Update a sub-category
   */
  async updateSubCategory(subCategoryId, subCategoryData, userId) {
    return new Promise((resolve) => {
      try {
        const {
          parent_category_id,
          sub_category_name
        } = subCategoryData;

        // Validate required fields
        if (!sub_category_name) {
          resolve({
            success: false,
            error: 'Sub-category name is required'
          });
          return;
        }

        // Check if sub-category name already exists (excluding current sub-category)
        this.db.db.get(
          'SELECT id FROM church_ledger_sub_categories WHERE parent_category_id = ? AND sub_category_name = ? AND id != ?',
          [parent_category_id, sub_category_name, subCategoryId],
          (err, existing) => {
            if (err) {
              console.error('Error checking sub-category:', err);
              resolve({
                success: false,
                error: err.message
              });
              return;
            }

            if (existing) {
              resolve({
                success: false,
                error: 'Sub-category name already exists for this category'
              });
              return;
            }

            // Update the sub-category
            this.db.db.run(
              `UPDATE church_ledger_sub_categories
               SET sub_category_name = ?, updated_at = datetime('now')
               WHERE id = ?`,
              [sub_category_name, subCategoryId],
              function(err) {
                if (err) {
                  console.error('Error updating sub-category:', err);
                  resolve({
                    success: false,
                    error: err.message
                  });
                  return;
                }

                resolve({
                  success: true,
                  subCategory: {
                    id: subCategoryId,
                    sub_category_name
                  }
                });
              }
            );
          }
        );
      } catch (error) {
        console.error('Error updating sub-category:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Delete a sub-category
   */
  async deleteSubCategory(subCategoryId, userId) {
    return new Promise((resolve) => {
      try {
        this.db.db.run(
          'DELETE FROM church_ledger_sub_categories WHERE id = ?',
          [subCategoryId],
          function(err) {
            if (err) {
              console.error('Error deleting sub-category:', err);
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
        console.error('Error deleting sub-category:', error);
        resolve({
          success: false,
          error: error.message
        });
      }
    });
  }
}

module.exports = ChurchLedgerService;
