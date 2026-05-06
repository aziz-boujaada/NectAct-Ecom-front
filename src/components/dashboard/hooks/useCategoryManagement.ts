import { FormEvent, useState } from 'react';
import { createCategory, deleteCategory, updateCategory } from '../../../api/catalog';
import type { Category, Product, Status } from '../../../types';
import { emptyCategoryForm, formFromCategory } from '../adminCatalogForms';
import { errorMessage } from './adminCatalogUtils';

type CategoryManagementOptions = {
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  refreshProducts: () => Promise<void>;
};

export function useCategoryManagement({
  setCategories,
  setProducts,
  setLoading,
  setStatus,
  refreshProducts,
}: CategoryManagementOptions) {
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (editingCategory) {
        const category = await updateCategory(editingCategory.id, categoryForm);
        if (category) {
          setCategories((current) => current.map((item) => (item.id === category.id ? category : item)));
        }
        setStatus({ type: 'success', text: 'Category updated successfully' });
      } else {
        const category = await createCategory(categoryForm);
        if (category) {
          setCategories((current) => [category, ...current]);
        }
        setStatus({ type: 'success', text: 'Category created successfully' });
      }

      setEditingCategory(null);
      setCategoryForm(emptyCategoryForm);
      setIsAddingCategory(false);
      await refreshProducts();
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCategory(category: Category) {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    setLoading(true);
    setStatus(null);

    try {
      await deleteCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      setProducts((current) => current.filter((product) => product.category_id !== category.id));
      if (editingCategory?.id === category.id) {
        setEditingCategory(null);
        setCategoryForm(emptyCategoryForm);
      }
      setStatus({ type: 'success', text: 'Category deleted successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  return {
    categoryForm,
    editingCategory,
    isAddingCategory,
    setCategoryForm,
    handleCategorySubmit,
    handleDeleteCategory,
    startAddingCategory: () => setIsAddingCategory(true),
    cancelCategoryEdit: () => {
      setEditingCategory(null);
      setCategoryForm(emptyCategoryForm);
      setIsAddingCategory(false);
    },
    editCategory: (category: Category) => {
      setEditingCategory(category);
      setCategoryForm(formFromCategory(category));
    },
  };
}
