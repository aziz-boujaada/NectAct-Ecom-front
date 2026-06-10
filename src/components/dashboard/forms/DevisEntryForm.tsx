import { FormEvent } from 'react';
import { Edit3, Minus, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Client, Devis, DevisFormValues, DevisItemDraftValues, Product } from '../../../types';

type DevisEntryFormProps = {
  clients: Client[];
  editingDevis: Devis | null;
  form: DevisFormValues;
  items: DevisItemDraftValues[];
  products: Product[];
  loading: boolean;
  missingRelations: boolean;
  onAddItem: () => void;
  onCancelEdit: () => void;
  onChange: (form: DevisFormValues) => void;
  onChangeItem: (index: number, field: keyof DevisItemDraftValues, value: string) => void;
  onRemoveItem: (index: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCreateClient?: () => void;
  onCreateProduct?: () => void;
};

export function DevisEntryForm({
  clients,
  editingDevis,
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
}: DevisEntryFormProps) {
  const { t } = useTranslation('devis');
  const selectedProducts = products;
  const showItemEditor = editingDevis === null;

  return (
    <form className="manager-form purchase-form fade-in" onSubmit={onSubmit}>
      <label>
        {t('client')}
        <select value={form.client_id} onChange={(event) => onChange({ ...form, client_id: event.target.value })} required>
          <option value="">{t('select_client')}</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>
      {clients.length === 0 && onCreateClient && (
        <button className="secondary-action" disabled={loading} onClick={onCreateClient} type="button" style={{ marginTop: '-10px' }}>
          <Plus size={16} aria-hidden="true" />
          {t('create_client')}
        </button>
      )}
      {products.length === 0 && onCreateProduct && (
        <button className="secondary-action" disabled={loading} onClick={onCreateProduct} type="button" style={{ marginTop: '-10px' }}>
          <Plus size={16} aria-hidden="true" />
          {t('create_product')}
        </button>
      )}
      <label>
        {t('expires_at')}
        <input type="datetime-local" value={form.expires_at} onChange={(event) => onChange({ ...form, expires_at: event.target.value })} />
      </label>
      <label>
        {t('discount')}
        <input min="0" step="0.01" type="number" value={form.discount} onChange={(event) => onChange({ ...form, discount: event.target.value })} placeholder="0.00" />
      </label>
      <label>
        {t('tax_percent')}
        <input min="0" max="100" step="0.01" type="number" value={form.tax} onChange={(event) => onChange({ ...form, tax: event.target.value })} placeholder="0" />
      </label>
      <label className="full-field">
        {t('notes')}
        <textarea value={form.notes} onChange={(event) => onChange({ ...form, notes: event.target.value })} placeholder={t('optional_notes')} />
      </label>

      {showItemEditor && (
        <div className="full-field" style={{ display: 'grid', gap: '14px' }}>
          <div className="section-heading" style={{ margin: 0 }}>
            <div>
              <p className="eyebrow">{t('quotation_items')}</p>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{t('items')}</h3>
            </div>
            <button className="secondary-action compact-action" disabled={loading || !form.client_id} onClick={onAddItem} type="button">
              <Plus size={16} aria-hidden="true" />
              {t('add_item')}
            </button>
          </div>

          {!form.client_id && <p className="helper-note full-field">{t('choose_client_first')}</p>}
          {products.length === 0 && <p className="helper-note full-field">{t('create_products_first')}</p>}

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
                  {t('product')}
                  <select value={item.product_id} onChange={(event) => onChangeItem(index, 'product_id', event.target.value)} disabled={!form.client_id || selectedProducts.length === 0} required>
                    <option value="">{t('select_product')}</option>
                    {selectedProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('price')}
                  <input min="0" step="0.01" type="number" value={item.price} onChange={(event) => onChangeItem(index, 'price', event.target.value)} required disabled={!form.client_id} />
                </label>
                <label>
                  {t('quantity')}
                  <input min="1" type="number" value={item.quantity} onChange={(event) => onChangeItem(index, 'quantity', event.target.value)} required disabled={!form.client_id} />
                </label>
                <button aria-label={`${t('delete')} ${index + 1}`} className="secondary-action compact-action" disabled={loading || items.length === 1} onClick={() => onRemoveItem(index)} type="button">
                  <Minus size={16} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="form-actions full-field">
        <button className="primary-action" disabled={loading || missingRelations} type="submit">
          {editingDevis ? <Edit3 size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
          {editingDevis ? t('update_devis') : t('create_devis')}
        </button>
        <button className="secondary-action" disabled={loading} onClick={onCancelEdit} type="button">
          <X size={17} aria-hidden="true" />
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
