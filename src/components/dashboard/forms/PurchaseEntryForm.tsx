import { FormEvent } from 'react';
import { Edit3, Minus, Plus, X } from 'lucide-react';
import type { Product, Purchase, PurchaseFormValues, PurchaseItemDraftValues, Supplier } from '../../../types';

type PurchaseEntryFormProps = {
  editingPurchase: Purchase | null;
  form: PurchaseFormValues;
  items: PurchaseItemDraftValues[];
  products: Product[];
  loading: boolean;
  missingRelations: boolean;
  suppliers: Supplier[];
  onAddItem: () => void;
  onCancelEdit: () => void;
  onChange: (form: PurchaseFormValues) => void;
  onChangeItem: (index: number, field: keyof PurchaseItemDraftValues, value: string) => void;
  onRemoveItem: (index: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function PurchaseEntryForm({
  editingPurchase,
  form,
  items,
  products,
  loading,
  missingRelations,
  suppliers,
  onAddItem,
  onCancelEdit,
  onChange,
  onChangeItem,
  onRemoveItem,
  onSubmit,
}: PurchaseEntryFormProps) {
  const showItemEditor = editingPurchase === null;
  const supplierProducts = form.supplier_id
    ? products.filter((product) => product.supplier_id === Number(form.supplier_id))
    : [];

  return (
    <form className="manager-form purchase-form fade-in" onSubmit={onSubmit}>
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
      <label>
        Status
        <select
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value as PurchaseFormValues['status'] })}
          required
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
        </select>
      </label>
      {showItemEditor && (
        <div className="full-field" style={{ display: 'grid', gap: '14px' }}>
          <div className="section-heading" style={{ margin: 0 }}>
            <div>
              <p className="eyebrow">Purchase Lines</p>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Items</h3>
            </div>
            <button className="secondary-action compact-action" disabled={loading || !form.supplier_id} onClick={onAddItem} type="button">
              <Plus size={16} aria-hidden="true" />
              Add item
            </button>
          </div>

          {!form.supplier_id && <p className="helper-note full-field">Choose a supplier before adding items.</p>}

          {form.supplier_id && supplierProducts.length === 0 && (
            <p className="helper-note full-field">No products found for this supplier yet.</p>
          )}

          <div style={{ display: 'grid', gap: '12px' }}>
            {items.map((item, index) => (
              <div
                key={`${index}-${item.product_id || 'new'}`}
                style={{
                  display: 'grid',
                  gap: '12px',
                  gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) auto',
                  alignItems: 'end',
                }}
              >
                <label>
                  Product
                  <select
                    value={item.product_id}
                    onChange={(event) => onChangeItem(index, 'product_id', event.target.value)}
                    disabled={!form.supplier_id || supplierProducts.length === 0}
                    required
                  >
                    <option value="">Select product</option>
                    {supplierProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Price
                  <input
                    min="0"
                    step="0.01"
                    type="number"
                    value={item.price}
                    onChange={(event) => onChangeItem(index, 'price', event.target.value)}
                    required
                    disabled={!form.supplier_id}
                  />
                </label>
                <label>
                  Quantity
                  <input
                    min="1"
                    type="number"
                    value={item.quantity}
                    onChange={(event) => onChangeItem(index, 'quantity', event.target.value)}
                    required
                    disabled={!form.supplier_id}
                  />
                </label>
                <button
                  aria-label={`Remove item ${index + 1}`}
                  className="secondary-action compact-action"
                  disabled={loading || items.length === 1}
                  onClick={() => onRemoveItem(index)}
                  type="button"
                >
                  <Minus size={16} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="form-actions full-field">
        <button className="primary-action" disabled={loading || missingRelations} type="submit">
          {editingPurchase ? <Edit3 size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
          {editingPurchase ? 'Update purchase' : 'Create purchase'}
        </button>
        <button className="secondary-action" disabled={loading} onClick={onCancelEdit} type="button">
          <X size={17} aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}
