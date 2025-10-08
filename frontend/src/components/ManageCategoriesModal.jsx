import React, { useState, useEffect } from 'react';
import { makeStyles, shorthands } from '@fluentui/react-components';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Input,
  Label,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHeaderCell,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner
} from '@fluentui/react-components';
import {
  AddRegular,
  DeleteRegular,
  EditRegular,
  DismissRegular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  dialogSurface: {
    maxWidth: '800px',
    width: '90vw'
  },
  section: {
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#323130'
  },
  formRow: {
    display: 'flex',
    ...shorthands.gap('12px'),
    marginBottom: '12px',
    alignItems: 'flex-end'
  },
  formField: {
    flex: 1
  },
  table: {
    width: '100%',
    marginTop: '12px'
  },
  badge: {
    display: 'inline-block',
    ...shorthands.padding('4px', '8px'),
    ...shorthands.borderRadius('4px'),
    fontSize: '12px',
    fontWeight: '600'
  },
  incomeBadge: {
    backgroundColor: '#DFF6DD',
    color: '#107C10'
  },
  expenseBadge: {
    backgroundColor: '#FDE7E9',
    color: '#D13438'
  },
  actionButtons: {
    display: 'flex',
    ...shorthands.gap('8px')
  },
  subcategoryList: {
    marginLeft: '20px',
    marginTop: '8px',
    fontSize: '13px',
    color: '#605E5C'
  },
  emptyState: {
    textAlign: 'center',
    ...shorthands.padding('40px', '20px'),
    color: '#605E5C'
  }
});

const ManageCategoriesModal = ({ isOpen, onClose, customBookId, pastorateId, churchId, isChurchLevel }) => {
  const styles = useStyles();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState('income');
  const [editingCategory, setEditingCategory] = useState(null);

  // Subcategory form states
  const [subcategoryName, setSubcategoryName] = useState('');
  const [selectedCategoryForSubcategory, setSelectedCategoryForSubcategory] = useState(null);

  const categoryAPI = isChurchLevel ? window.electron.churchCustomBookCategory : window.electron.customBookCategory;

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const params = isChurchLevel
        ? { customBookId, churchId }
        : { customBookId, pastorateId };
      
      const data = await categoryAPI.getWithSubcategories(params);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      showNotification('error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      showNotification('error', 'Please enter a category name');
      return;
    }

    try {
      const params = isChurchLevel
        ? { customBookId, churchId, categoryData: { category_name: categoryName, category_type: categoryType } }
        : { customBookId, pastorateId, categoryData: { category_name: categoryName, category_type: categoryType } };

      if (editingCategory) {
        await categoryAPI.update({ categoryId: editingCategory.id, categoryData: { category_name: categoryName, category_type: categoryType } });
        showNotification('success', 'Category updated successfully');
      } else {
        await categoryAPI.create(params);
        showNotification('success', 'Category created successfully');
      }

      setCategoryName('');
      setCategoryType('income');
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      showNotification('error', 'Failed to save category');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryName(category.category_name);
    setCategoryType(category.category_type);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryType('income');
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? All subcategories will also be deleted.')) {
      return;
    }

    try {
      await categoryAPI.delete({ categoryId });
      showNotification('success', 'Category deleted successfully');
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showNotification('error', 'Failed to delete category');
    }
  };

  const handleCreateSubcategory = async (categoryId) => {
    if (!subcategoryName.trim()) {
      showNotification('error', 'Please enter a subcategory name');
      return;
    }

    try {
      await categoryAPI.createSubcategory({ categoryId, subcategoryData: { subcategory_name: subcategoryName } });
      showNotification('success', 'Subcategory created successfully');
      setSubcategoryName('');
      setSelectedCategoryForSubcategory(null);
      loadCategories();
    } catch (error) {
      console.error('Error creating subcategory:', error);
      showNotification('error', 'Failed to create subcategory');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }

    try {
      await categoryAPI.deleteSubcategory({ subcategoryId });
      showNotification('success', 'Subcategory deleted successfully');
      loadCategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      showNotification('error', 'Failed to delete subcategory');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(event, data) => !data.open && onClose()}>
      <DialogSurface className={styles.dialogSurface}>
        <DialogBody>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogContent>
            {notification && (
              <MessageBar intent={notification.type} style={{ marginBottom: '16px' }}>
                <MessageBarBody>
                  <MessageBarTitle>{notification.type === 'success' ? 'Success' : 'Error'}</MessageBarTitle>
                  {notification.message}
                </MessageBarBody>
              </MessageBar>
            )}

            {/* Add/Edit Category Form */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </div>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <Label>Category Name</Label>
                  <Input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name"
                  />
                </div>
                <div className={styles.formField}>
                  <Label>Type</Label>
                  <RadioGroup value={categoryType} onChange={(e, data) => setCategoryType(data.value)}>
                    <Radio value="income" label="Income" />
                    <Radio value="expense" label="Expense" />
                  </RadioGroup>
                </div>
                <div>
                  <Button appearance="primary" icon={<AddRegular />} onClick={handleCreateCategory}>
                    {editingCategory ? 'Update' : 'Add'}
                  </Button>
                  {editingCategory && (
                    <Button style={{ marginLeft: '8px' }} onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Categories List */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Categories</div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spinner label="Loading categories..." />
                </div>
              ) : categories.length === 0 ? (
                <div className={styles.emptyState}>
                  No categories yet. Create your first category above.
                </div>
              ) : (
                <Table className={styles.table}>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Category Name</TableHeaderCell>
                      <TableHeaderCell>Type</TableHeaderCell>
                      <TableHeaderCell>Subcategories</TableHeaderCell>
                      <TableHeaderCell>Actions</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.category_name}</TableCell>
                        <TableCell>
                          <span className={`${styles.badge} ${category.category_type === 'income' ? styles.incomeBadge : styles.expenseBadge}`}>
                            {category.category_type === 'income' ? 'Income' : 'Expense'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {category.subcategories && category.subcategories.length > 0 ? (
                            <div>
                              {category.subcategories.map((sub) => (
                                <div key={sub.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                  <span style={{ flex: 1 }}>{sub.subcategory_name}</span>
                                  <Button
                                    size="small"
                                    appearance="subtle"
                                    icon={<DeleteRegular />}
                                    onClick={() => handleDeleteSubcategory(sub.id)}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#999' }}>No subcategories</span>
                          )}
                          {selectedCategoryForSubcategory === category.id ? (
                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                              <Input
                                size="small"
                                value={subcategoryName}
                                onChange={(e) => setSubcategoryName(e.target.value)}
                                placeholder="Subcategory name"
                              />
                              <Button size="small" onClick={() => handleCreateSubcategory(category.id)}>Add</Button>
                              <Button size="small" onClick={() => { setSelectedCategoryForSubcategory(null); setSubcategoryName(''); }}>Cancel</Button>
                            </div>
                          ) : (
                            <Button
                              size="small"
                              appearance="subtle"
                              icon={<AddRegular />}
                              onClick={() => setSelectedCategoryForSubcategory(category.id)}
                              style={{ marginTop: '8px' }}
                            >
                              Add Subcategory
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className={styles.actionButtons}>
                            <Button size="small" appearance="subtle" icon={<EditRegular />} onClick={() => handleEditCategory(category)} />
                            <Button size="small" appearance="subtle" icon={<DeleteRegular />} onClick={() => handleDeleteCategory(category.id)} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>Close</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ManageCategoriesModal;

