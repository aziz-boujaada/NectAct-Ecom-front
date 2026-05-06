import { FormEvent } from 'react';
import { Edit3, Folder, Plus, Trash2, X } from 'lucide-react';
import type { Category, CategoryFormValues } from '../../types';

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
            <button className="primary-action" onClick={onAdd} type="button">
              <Plus size={17} /> Add category
            </button>
          )}
        </div>
      </div>

      {showForm ? (
        <form className="manager-form fade-in" onSubmit={onSubmit}>
          <label>
            Name
            <input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} required />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => onChange({ ...form, description: event.target.value })}
              rows={3}
            />
          </label>
          <div className="form-actions">
            <button className="primary-action" disabled={loading} type="submit">
              {editingCategory ? <Edit3 size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
              {editingCategory ? 'Update category' : 'Create category'}
            </button>
            <button className="secondary-action" disabled={loading} onClick={onCancelEdit} type="button">
              <X size={17} aria-hidden="true" />
              Cancel
            </button>
          </div>
        </form>
      ) : (
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
                [...categories].sort((a, b) => b.id - a.id).map((category) => (
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
                        <button aria-label={`Edit ${category.name}`} disabled={loading} onClick={() => onEdit(category)} type="button">
                          <Edit3 size={16} aria-hidden="true" />
                        </button>
                        <button
                          aria-label={`Delete ${category.name}`}
                          className="danger-action"
                          disabled={loading}
                          onClick={() => onDelete(category)}
                          type="button"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
