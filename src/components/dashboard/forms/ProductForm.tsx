import { FormEvent } from 'react';
import { Edit3, ImagePlus, Plus, X } from 'lucide-react';
import type { Category, Product, ProductFormValues, Supplier } from '../../../types';

type ProductFormProps = {
  categories: Category[];
  editingProduct: Product | null;
  form: ProductFormValues;
  loading: boolean;
  missingRelations: boolean;
  suppliers: Supplier[];
  onCancelEdit: () => void;
  onChange: (form: ProductFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCreateCategory?: () => void;
  onCreateSupplier?: () => void;
};

export function ProductForm({
  categories,
  editingProduct,
  form,
  loading,
  missingRelations,
  suppliers,
  onCancelEdit,
  onChange,
  onSubmit,
  onCreateCategory,
  onCreateSupplier,
}: ProductFormProps) {
  return (
    <form className="manager-form product-form fade-in" onSubmit={onSubmit}>
      <label>
        Name
        <input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} required />
      </label>
      <label>
        Price
        <input
          min="0"
          step="0.01"
          type="number"
          value={form.price}
          onChange={(event) => onChange({ ...form, price: event.target.value })}
          required
        />
      </label>
      <label>
        Stock
        <input min="0" type="number" value={form.stock} onChange={(event) => onChange({ ...form, stock: event.target.value })} />
      </label>
      <label>
        Min stock
        <input
          min="0"
          type="number"
          value={form.min_stock}
          onChange={(event) => onChange({ ...form, min_stock: event.target.value })}
        />
      </label>
      <label>
        Category
        <select value={form.category_id} onChange={(event) => onChange({ ...form, category_id: event.target.value })} required>
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      {categories.length === 0 && onCreateCategory && (
        <button
          className="secondary-action"
          disabled={loading}
          onClick={onCreateCategory}
          type="button"
          style={{ marginTop: '-10px' }}
        >
          <Plus size={16} aria-hidden="true" />
          Create category
        </button>
      )}
      <label>
        Supplier
        <select value={form.supplier_id} onChange={(event) => onChange({ ...form, supplier_id: event.target.value })} required>
          <option value="">Select supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </label>
      {suppliers.length === 0 && onCreateSupplier && (
        <button
          className="secondary-action"
          disabled={loading}
          onClick={onCreateSupplier}
          type="button"
          style={{ marginTop: '-10px' }}
        >
          <Plus size={16} aria-hidden="true" />
          Create supplier
        </button>
      )}
      <label className="full-field">
        Description
        <textarea value={form.description} onChange={(event) => onChange({ ...form, description: event.target.value })} rows={3} />
      </label>
      <label>
        Image path
        <input value={form.image_path} onChange={(event) => onChange({ ...form, image_path: event.target.value })} placeholder="products/example.jpg" />
      </label>
      <label>
        Upload image
        <span className="file-control">
          <ImagePlus size={17} aria-hidden="true" />
          <input accept="image/*" type="file" onChange={(event) => onChange({ ...form, image: event.target.files?.[0] ?? null })} />
        </span>
      </label>
      <div className="form-actions full-field">
        <button className="primary-action" disabled={loading || missingRelations} type="submit">
          {editingProduct ? <Edit3 size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
          {editingProduct ? 'Update product' : 'Create product'}
        </button>
        <button className="secondary-action" disabled={loading} onClick={onCancelEdit} type="button">
          <X size={17} aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}
