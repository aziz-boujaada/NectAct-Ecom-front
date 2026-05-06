import { FormEvent } from 'react';
import { Edit3, ImagePlus, Package, Plus, Trash2, X } from 'lucide-react';
import type { Category, Product, ProductFormValues, Supplier } from '../../types';

type ProductManagerProps = {
  categories: Category[];
  editingProduct: Product | null;
  form: ProductFormValues;
  loading: boolean;
  products: Product[];
  suppliers: Supplier[];
  isAdding: boolean;
  onAdd: () => void;
  onCancelEdit: () => void;
  onChange: (form: ProductFormValues) => void;
  onDelete: (product: Product) => void;
  onEdit: (product: Product) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function money(value: string | number) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : value;
}

export function ProductManager({
  categories,
  editingProduct,
  form,
  loading,
  products,
  suppliers,
  isAdding,
  onAdd,
  onCancelEdit,
  onChange,
  onDelete,
  onEdit,
  onSubmit,
}: ProductManagerProps) {
  const missingRelations = categories.length === 0 || suppliers.length === 0;
  const showForm = isAdding || editingProduct !== null;

  return (
    <section className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Products</h2>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>{products.length} total</span>
          {!showForm && (
            <button className="primary-action" onClick={onAdd} type="button">
              <Plus size={17} /> Add product
            </button>
          )}
        </div>
      </div>

      {missingRelations && showForm && (
        <p className="helper-note">Create at least one category and one supplier before saving products.</p>
      )}

      {showForm ? (
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
            <input
              min="0"
              type="number"
              value={form.stock}
              onChange={(event) => onChange({ ...form, stock: event.target.value })}
            />
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
            <select
              value={form.category_id}
              onChange={(event) => onChange({ ...form, category_id: event.target.value })}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Supplier
            <select
              value={form.supplier_id}
              onChange={(event) => onChange({ ...form, supplier_id: event.target.value })}
              required
            >
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </label>
          <label className="full-field">
            Description
            <textarea
              value={form.description}
              onChange={(event) => onChange({ ...form, description: event.target.value })}
              rows={3}
            />
          </label>
          <label>
            Image path
            <input
              value={form.image_path}
              onChange={(event) => onChange({ ...form, image_path: event.target.value })}
              placeholder="products/example.jpg"
            />
          </label>
          <label>
            Upload image
            <span className="file-control">
              <ImagePlus size={17} aria-hidden="true" />
              <input
                accept="image/*"
                type="file"
                onChange={(event) => onChange({ ...form, image: event.target.files?.[0] ?? null })}
              />
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
      ) : (
        <div className="table-wrap fade-in">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>reference</th>
                <th>Product</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Price</th>
                <th>Stock</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6}>No products found.</td>
                </tr>
              ) : (
                [...products].sort((a, b) => b.id - a.id).map((product) => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td>{product.reference.slice(0 ,12)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Package size={18} className="text-muted" aria-hidden="true" />
                        <div>
                          
                          <strong>{product.name}</strong>
                          <span>{product.description || 'No description'}</span>
                        </div>
                      </div>
                    </td>
                    <td>{product.category?.name ?? product.category_id}</td>
                    <td>{product.supplier?.name ?? product.supplier_id}</td>
                    <td>{money(product.price)}</td>
                    <td>
                      {product.stock ?? 0} / min {product.min_stock ?? 0}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          aria-label={`Edit ${product.name}`}
                          disabled={loading}
                          onClick={() => onEdit(product)}
                          type="button"
                        >
                          <Edit3 size={16} aria-hidden="true" />
                        </button>
                        <button
                          aria-label={`Delete ${product.name}`}
                          className="danger-action"
                          disabled={loading}
                          onClick={() => onDelete(product)}
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
