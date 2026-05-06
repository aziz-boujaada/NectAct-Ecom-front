import { FormEvent } from 'react';
import { Edit3, PackageCheck, X } from 'lucide-react';
import type { Product, Sale, SaleItem, SaleItemFormValues } from '../../../types';

type SaleItemEntryFormProps = {
  availableStock: number;
  canSubmitItem: boolean;
  editingSaleItem: SaleItem | null;
  form: SaleItemFormValues;
  loading: boolean;
  products: Product[];
  sales: Sale[];
  selectedProduct: Product | undefined;
  onCancelEdit: () => void;
  onChange: (form: SaleItemFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function saleLabel(sale: Sale) {
  return `#${sale.id} - ${sale.client?.name ?? `Client ${sale.client_id}`}`;
}

function productLabel(product: Product) {
  return `${product.name} (${product.stock ?? 0} in stock)`;
}

export function SaleItemEntryForm({
  availableStock,
  canSubmitItem,
  editingSaleItem,
  form,
  loading,
  products,
  sales,
  selectedProduct,
  onCancelEdit,
  onChange,
  onSubmit,
}: SaleItemEntryFormProps) {
  return (
    <form className="manager-form purchase-item-form fade-in" onSubmit={onSubmit}>
      <label>
        Sale
        <select value={form.sale_id} onChange={(event) => onChange({ ...form, sale_id: event.target.value })} required>
          <option value="">Select sale</option>
          {sales.map((sale) => (
            <option key={sale.id} value={sale.id}>
              {saleLabel(sale)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Product
        <select value={form.product_id} onChange={(event) => onChange({ ...form, product_id: event.target.value })} required>
          <option value="">Select product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {productLabel(product)}
            </option>
          ))}
        </select>
      </label>
      {selectedProduct && <p className="helper-note full-field">Available stock: {availableStock}</p>}
      <label>
        Quantity
        <input
          max={selectedProduct ? availableStock : undefined}
          min="1"
          type="number"
          value={form.quantity}
          onChange={(event) => onChange({ ...form, quantity: event.target.value })}
          required
        />
      </label>
      <div className="form-actions full-field">
        <button className="primary-action" disabled={loading || !canSubmitItem} type="submit">
          {editingSaleItem ? <Edit3 size={17} aria-hidden="true" /> : <PackageCheck size={17} aria-hidden="true" />}
          {editingSaleItem ? 'Update item' : 'Create item'}
        </button>
        <button className="secondary-action" disabled={loading} onClick={onCancelEdit} type="button">
          <X size={17} aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}
