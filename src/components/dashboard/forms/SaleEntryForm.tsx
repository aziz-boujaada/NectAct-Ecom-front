import { FormEvent } from 'react';
import { Edit3, Minus, Plus, X } from 'lucide-react';
import type { Client, Product, Sale, SaleFormValues, SaleItemDraftValues } from '../../../types';

type SaleEntryFormProps = {
  clients: Client[];
  editingSale: Sale | null;
  form: SaleFormValues;
  items: SaleItemDraftValues[];
  products: Product[];
  loading: boolean;
  missingRelations: boolean;
  onAddItem: () => void;
  onCancelEdit: () => void;
  onChange: (form: SaleFormValues) => void;
  onChangeItem: (index: number, field: keyof SaleItemDraftValues, value: string) => void;
  onRemoveItem: (index: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function SaleEntryForm({
  clients,
  editingSale,
  form,
  items,
  products,
  loading,
  missingRelations,
  onAddItem,
  onCancelEdit,
  onChange,
  onChangeItem,
  onRemoveItem,
  onSubmit,
}: SaleEntryFormProps) {
  const saleProducts = products;

  return (
    <form className="manager-form purchase-form fade-in" onSubmit={onSubmit}>
      <label>
        Client
        <select value={form.client_id} onChange={(event) => onChange({ ...form, client_id: event.target.value })} required>
          <option value="">Select client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value as SaleFormValues['status'] })}
          required
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
      </label>
      {editingSale === null && (
        <div className="full-field" style={{ display: 'grid', gap: '14px' }}>
          <div className="section-heading" style={{ margin: 0 }}>
            <div>
              <p className="eyebrow">Sale Items</p>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Items</h3>
            </div>
            <button className="secondary-action compact-action" disabled={loading || !form.client_id} onClick={onAddItem} type="button">
              <Plus size={16} aria-hidden="true" />
              Add item
            </button>
          </div>

          {!form.client_id && <p className="helper-note full-field">Choose a client before adding items.</p>}

          <div style={{ display: 'grid', gap: '12px' }}>
            {items.map((item, index) => (
              <div
                key={`${index}-${item.product_id || 'new'}`}
                style={{
                  display: 'grid',
                  gap: '12px',
                  gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr) auto',
                  alignItems: 'end',
                }}
              >
                <label>
                  Product
                  <select
                    value={item.product_id}
                    onChange={(event) => onChangeItem(index, 'product_id', event.target.value)}
                    disabled={!form.client_id}
                    required
                  >
                    <option value="">Select product</option>
                    {saleProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Quantity
                  <input
                    min="1"
                    type="number"
                    value={item.quantity}
                    onChange={(event) => onChangeItem(index, 'quantity', event.target.value)}
                    required
                    disabled={!form.client_id}
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
          {editingSale ? <Edit3 size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
          {editingSale ? 'Update sale' : 'Create sale'}
        </button>
        <button className="secondary-action" disabled={loading} onClick={onCancelEdit} type="button">
          <X size={17} aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}
