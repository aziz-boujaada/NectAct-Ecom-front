import { FormEvent } from 'react';
import { Edit3, Minus, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  onCreateClient?: () => void;
  onCreateProduct?: () => void;
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
  onCreateClient,
  onCreateProduct,
}: SaleEntryFormProps) {
  const { t } = useTranslation('sales');

  const saleProducts = products;

  return (
    <form className="manager-form purchase-form fade-in" onSubmit={onSubmit}>
      <label>
        {t('client')}
        <select
          value={form.client_id}
          onChange={(event) => onChange({ ...form, client_id: event.target.value })}
          required
        >
          <option value="">{t('select client')}</option>

          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>

      {clients.length === 0 && onCreateClient && (
        <button
          className="secondary-action"
          disabled={loading}
          onClick={onCreateClient}
          type="button"
        >
          <Plus size={16} aria-hidden="true" />
          {t('add client')}
        </button>
      )}

      {products.length === 0 && onCreateProduct && (
        <button
          className="secondary-action"
          disabled={loading}
          onClick={onCreateProduct}
          type="button"
        >
          <Plus size={16} aria-hidden="true" />
          {t('add sale')} {/* fallback since no "add product" in your JSON */}
        </button>
      )}

      <label>
        {t('status')}
        <select
          value={form.status}
          onChange={(event) =>
            onChange({
              ...form,
              status: event.target.value as SaleFormValues['status'],
            })
          }
          required
        >
          <option value="unpaid">{t('unpaid')}</option>
          <option value="paid">{t('status.paid')}</option>
        </select>
      </label>

      <label>
        {t('discount')}
        <input
          min="0"
          step="0.01"
          type="number"
          value={form.discount}
          onChange={(event) =>
            onChange({ ...form, discount: event.target.value })
          }
          placeholder="0"
        />
      </label>

      <label>
        {t('tax')}
        <input
          min="0"
          max="100"
          step="0.01"
          type="number"
          value={form.tax}
          onChange={(event) =>
            onChange({ ...form, tax: event.target.value })
          }
          placeholder="0"
        />
      </label>

      {editingSale === null && (
        <div className="full-field" style={{ display: 'grid', gap: '14px' }}>
          <div className="section-heading" style={{ margin: 0 }}>
            <div>
              <p className="eyebrow">{t('sale items')}</p>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('items')}</h3>
            </div>

            <button
              className="secondary-action compact-action"
              disabled={loading || !form.client_id}
              onClick={onAddItem}
              type="button"
            >
              <Plus size={16} aria-hidden="true" />
              {t('add item')}
            </button>
          </div>

          {!form.client_id && (
            <p className="helper-note full-field">
              {t('helper create client')}
            </p>
          )}

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
                  {t('product')}
                  <select
                    value={item.product_id}
                    onChange={(event) =>
                      onChangeItem(index, 'product_id', event.target.value)
                    }
                    disabled={!form.client_id}
                    required
                  >
                    <option value="">{t('select product')}</option>

                    {saleProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  {t('quantity')}
                  <input
                    min="1"
                    type="number"
                    value={item.quantity}
                    onChange={(event) =>
                      onChangeItem(index, 'quantity', event.target.value)
                    }
                    required
                    disabled={!form.client_id}
                  />
                </label>

                <button
                  aria-label={t('delete')}
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
        <button
          className="primary-action"
          disabled={loading || missingRelations}
          type="submit"
        >
          {editingSale ? <Edit3 size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}

          {editingSale ? t('edit sale') : t('add sale')}
        </button>

        <button
          className="secondary-action"
          disabled={loading}
          onClick={onCancelEdit}
          type="button"
        >
          <X size={17} aria-hidden="true" />
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}