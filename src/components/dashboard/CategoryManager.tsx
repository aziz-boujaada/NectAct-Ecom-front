import { FormEvent } from 'react';
import { Edit3, Folder, Plus, Trash2 } from 'lucide-react';
import type { Category, CategoryFormValues } from '../../types';
import { CategoryForm } from './forms/CategoryForm';
import { usePagination } from './hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { Can } from '../../context/PermissionContext';

type CategoryManagerProps = {
  categories: Category[];
  editingCategory: Category | null;
  form: CategoryFormValues;
  loading: boolean;
  isAdding: boolean;
  onAdd: () => void;
  onChange: (form: CategoryFormValues) => void;
  onCancelEdit: () => void;
  onDelete: (category: Category) => void;
  onEdit: (category: Category) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CategoryManager({
  categories,
  editingCategory,
  form,
  loading,
  isAdding,
  onAdd,
  onChange,
  onCancelEdit,
  onDelete,
  onEdit,
  onSubmit,
}: CategoryManagerProps) {
  const showForm = isAdding || editingCategory !== null;
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(categories);

  return (
    <section className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2>Categories</h2>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>{categories.length} total</span>
          {!showForm && (
            <Can permission="create_categories">
              <button className="primary-action" onClick={onAdd} type="button">
                <Plus size={17} /> Add category
              </button>
            </Can>
          )}
        </div>
      </div>

      {showForm ? (
        <CategoryForm
          editingCategory={editingCategory}
          form={form}
          loading={loading}
          onCancelEdit={onCancelEdit}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      ) : (
        <>
          <div className="table-wrap fade-in">
            <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3}>No categories found.</td>
                </tr>
              ) : (
                [...paginatedData].sort((a, b) => b.id - a.id).map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Folder size={18} className="text-muted" aria-hidden="true" />
                        <strong>{category.name}</strong>
                      </div>
                    </td>
                    <td>{category.description || 'No description'}</td>
                    <td>
                      <div className="row-actions">
                        <Can permission="edit_categories">
                          <button aria-label={`Edit ${category.name}`} disabled={loading} onClick={() => onEdit(category)} type="button">
                            <Edit3 size={16} aria-hidden="true" />
                          </button>
                        </Can>
                        <Can permission="delete_categories">
                          <button
                            aria-label={`Delete ${category.name}`}
                            className="danger-action"
                            disabled={loading}
                            onClick={() => onDelete(category)}
                            type="button"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={prevPage}
          onNext={nextPage}
          onPageChange={goToPage}
        />
        </>
      )}
    </section>
  );
}
