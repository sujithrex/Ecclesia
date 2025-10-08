class CustomBookCategoryService {
    constructor(db) {
        this.db = db.db; // Access the underlying SQLite database
    }

    // ========== CATEGORY METHODS ==========

    async createCategory(customBookId, pastorateId, categoryData) {
        return new Promise((resolve, reject) => {
            const { category_name, category_type } = categoryData;

            const query = `
                INSERT INTO custom_book_categories (
                    custom_book_id, pastorate_id, category_name, category_type
                ) VALUES (?, ?, ?, ?)
            `;

            this.db.run(query, [
                customBookId, pastorateId, category_name, category_type
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    async getCategories(customBookId, pastorateId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM custom_book_categories
                WHERE custom_book_id = ? AND pastorate_id = ?
                ORDER BY category_name ASC
            `;

            this.db.all(query, [customBookId, pastorateId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getCategoriesByType(customBookId, pastorateId, categoryType) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM custom_book_categories
                WHERE custom_book_id = ? AND pastorate_id = ? AND category_type = ?
                ORDER BY category_name ASC
            `;

            this.db.all(query, [customBookId, pastorateId, categoryType], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getCategoryById(categoryId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM custom_book_categories
                WHERE id = ?
            `;

            this.db.get(query, [categoryId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async updateCategory(categoryId, categoryData) {
        return new Promise((resolve, reject) => {
            const { category_name, category_type } = categoryData;

            const query = `
                UPDATE custom_book_categories
                SET category_name = ?, category_type = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            this.db.run(query, [category_name, category_type, categoryId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    async deleteCategory(categoryId) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM custom_book_categories WHERE id = ?`;

            this.db.run(query, [categoryId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    // ========== SUBCATEGORY METHODS ==========

    async createSubcategory(categoryId, subcategoryData) {
        return new Promise((resolve, reject) => {
            const { subcategory_name } = subcategoryData;

            const query = `
                INSERT INTO custom_book_subcategories (
                    category_id, subcategory_name
                ) VALUES (?, ?)
            `;

            this.db.run(query, [categoryId, subcategory_name], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    async getSubcategories(categoryId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM custom_book_subcategories
                WHERE category_id = ?
                ORDER BY subcategory_name ASC
            `;

            this.db.all(query, [categoryId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getSubcategoryById(subcategoryId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM custom_book_subcategories
                WHERE id = ?
            `;

            this.db.get(query, [subcategoryId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async updateSubcategory(subcategoryId, subcategoryData) {
        return new Promise((resolve, reject) => {
            const { subcategory_name } = subcategoryData;

            const query = `
                UPDATE custom_book_subcategories
                SET subcategory_name = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            this.db.run(query, [subcategory_name, subcategoryId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    async deleteSubcategory(subcategoryId) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM custom_book_subcategories WHERE id = ?`;

            this.db.run(query, [subcategoryId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    // ========== COMBINED METHODS ==========

    async getCategoriesWithSubcategories(customBookId, pastorateId) {
        return new Promise(async (resolve, reject) => {
            try {
                const categories = await this.getCategories(customBookId, pastorateId);
                
                const categoriesWithSubcategories = await Promise.all(
                    categories.map(async (category) => {
                        const subcategories = await this.getSubcategories(category.id);
                        return {
                            ...category,
                            subcategories
                        };
                    })
                );

                resolve(categoriesWithSubcategories);
            } catch (error) {
                reject(error);
            }
        });
    }

    async getCategoriesWithSubcategoriesByType(customBookId, pastorateId, categoryType) {
        return new Promise(async (resolve, reject) => {
            try {
                const categories = await this.getCategoriesByType(customBookId, pastorateId, categoryType);
                
                const categoriesWithSubcategories = await Promise.all(
                    categories.map(async (category) => {
                        const subcategories = await this.getSubcategories(category.id);
                        return {
                            ...category,
                            subcategories
                        };
                    })
                );

                resolve(categoriesWithSubcategories);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = CustomBookCategoryService;

