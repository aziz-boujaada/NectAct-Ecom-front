import { FormEvent } from 'react';
import { Edit3, Plus, X } from 'lucide-react';
import type { Category, CategoryFormValues } from '../../../types';

type CategoryFormProps = {
  editingCategory: Category | null;
  form: CategoryFormValues;
  loading: boolean;
  onCancelEdit: () => void;
  onChange: (form: CategoryFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CategoryForm({
  editingCategory,
  form,
  loading,
  onCancelEdit,
  onChange,
  onSubmit,
}: CategoryFormProps) {
  return (
    <form className="manager-form fade-in" onSubmit={onSubmit}>
      <label>
        Name
        <input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} required />
      </label>
      <label>
        Description
        <textarea value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} rows={3} />
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
  );
}
