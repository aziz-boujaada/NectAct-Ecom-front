import { FormEvent } from 'react';
import { Plus, RotateCcw, Trash2, X } from 'lucide-react';
import type { RefundFormValues, Sale, SaleItem } from '../../../types';

type RefundEntryFormProps = {
  availableByProduct: Map<number, number>;
  canSubmit: boolean;
  form: RefundFormValues;
  loading: boolean;
  missingRelations: boolean;
  sales: Sale[];
  selectedSale: Sale | undefined;
  soldItems: SaleItem[];
  onCancelEdit: () => void;
  onChange: (form: RefundFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function saleLabel(sale: Sale) {
  return `#${sale.id} - ${sale.client?.name ?? `Client ${sale.client_id}`}`;
}

function productLabel(item: SaleItem, available: number) {
  return `${item.product?.name ?? `Product ${item.product_id}`} (${available} refundable)`;
}

export function RefundEntryForm({
  availableByProduct,
  canSubmit,
  form,
  loading,
  missingRelations,
  sales,
  selectedSale,
  soldItems,
  onCancelEdit,
  onChange,
  onSubmit,
}: RefundEntryFormProps) {
  const addItem = () => {
    onChange({ ...form, items: [...form.items, { product_id: '', quantity: '1' }] });
  };

  const updateItem = (index: number, field: 'product_id' | 'quantity', value: string) => {
    onChange({
      ...form,
      items: form.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    });
  };

  const removeItem = (index: number) => {
    const nextItems = form.items.filter((_, itemIndex) => itemIndex !== index);
    onChange({ ...form, items: nextItems.length > 0 ? nextItems : [{ product_id: '', quantity: '1' }] });
  };

  return (
    <form className="manager-form refund-form fade-in" onSubmit={onSubmit}>
      <label>
        Sale
        <select
          value={form.sale_id}
          onChange={(event) => onChange({ ...form, sale_id: event.target.value, items: [{ product_id: '', quantity: '1' }] })}
          required
        >
          <option value="">Select sale</option>
          {sales.map((sale) => (
            <option key={sale.id} value={sale.id}>
              {saleLabel(sale)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Reason
        <textarea
          value={form.reason}
          onChange={(event) => onChange({ ...form, reason: event.target.value })}
          placeholder="Optional"
        />
      </label>

      {selectedSale && soldItems.length === 0 && (
        <p className="helper-note full-field">This sale has no refundable items.</p>
      )}

      <div className="refund-items-editor full-field">
        {form.items.map((item, index) => {
          const selectedProductId = Number(item.product_id);
          const selectedAvailable = availableByProduct.get(selectedProductId);

          return (
            <div className="refund-item-row" key={`${index}-${item.product_id || 'new'}`}>
              <label>
                Product
                <select
                  value={item.product_id}
                  onChange={(event) => updateItem(index, 'product_id', event.target.value)}
                  required
                  disabled={!selectedSale}
                >
                  <option value="">Select product</option>
                  {soldItems.map((saleItem) => {
                    const available = availableByProduct.get(saleItem.product_id) ?? 0;
                    return (
                      <option key={saleItem.id} value={saleItem.product_id} disabled={available <= 0}>
                        {productLabel(saleItem, available)}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label>
                Quantity
                <input
                  max={selectedAvailable}
                  min="1"
                  type="number"
                  value={item.quantity}
                  onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                  required
                  disabled={!selectedSale}
                />
              </label>
              <button
                aria-label={`Remove refund item ${index + 1}`}
                className="secondary-action compact-action"
                disabled={loading || form.items.length === 1}
                onClick={() => removeItem(index)}
                type="button"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="form-actions full-field">
        <button className="secondary-action" disabled={loading || !selectedSale} onClick={addItem} type="button">
          <Plus size={17} aria-hidden="true" />
          Add item
        </button>
        <button className="primary-action" disabled={loading || missingRelations || !canSubmit} type="submit">
          <RotateCcw size={17} aria-hidden="true" />
          Create refund
        </button>
        <button className="secondary-action" disabled={loading} onClick={onCancelEdit} type="button">
          <X size={17} aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}
