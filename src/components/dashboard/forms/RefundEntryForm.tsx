import { FormEvent } from 'react';
import { Plus, RotateCcw, Trash2, X, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RefundFormValues, Sale, SaleItem } from '../../../types';
import { formatCurrency } from '../../../utils/currency';

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
  const { t } = useTranslation('sales');

  function saleLabel(sale: Sale) {
    return `#${sale.id} - ${sale.client?.name ?? `${t('client')} ${sale.client_id}`}`;
  }

  function getProductLabel(item: SaleItem, available: number, refundable: number) {
    return `${item.product?.name ?? `${t('product')} ${item.product_id}`} (SKU: ${item.product?.reference || 'N/A'}) - ${t('original_qty')} ${item.quantity}, ${t('already_refunded')} ${item.quantity - available}, ${t('available_to_refund')} ${refundable}`;
  }

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

  // Calculate refund totals
  const refundItems = form.items
    .map((item) => {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity) || 0;
      const saleItem = soldItems.find((si) => si.product_id === productId);
      if (!saleItem) return null;

      const itemTotal = getItemAmount(saleItem);
      const saleTotal = Number(selectedSale?.total ?? 0);
      const effectiveRefundTotal = calculateProportionalRefund(
        quantity,
        Number(saleItem.price),
        saleItem.quantity,
        itemTotal,
        saleTotal,
      );

      return {
        productId,
        quantity,
        saleItem,
        itemTotal,
        effectiveRefundTotal,
        effectivePrice: quantity > 0 ? effectiveRefundTotal / quantity : 0,
      };
    })
    .filter((item) => item !== null);

  const totalRefundAmount = refundItems.reduce((sum, item) => sum + (item?.effectiveRefundTotal ?? 0), 0);

  return (
    <form className="manager-form refund-form fade-in" onSubmit={onSubmit}>
      <label>
        {t('sale')}
        <select
          value={form.sale_id}
          onChange={(event) => onChange({ ...form, sale_id: event.target.value, items: [{ product_id: '', quantity: '1' }] })}
          required
        >
          <option value="">{t('select_sale')}</option>
          {sales.map((sale) => (
            <option key={sale.id} value={sale.id}>
              {saleLabel(sale)}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('reason')}
        <textarea
          value={form.reason}
          onChange={(event) => onChange({ ...form, reason: event.target.value })}
          placeholder={t('optional')}
        />
      </label>

      {selectedSale && soldItems.length === 0 && (
        <p className="helper-note full-field">{t('no_refundable_items')}</p>
      )}

      <div className="refund-items-editor full-field">
        <div className="refund-items-header">
          <h4>{t('refund_items')}</h4>
          <p className="text-muted">{t('refund_items_desc')}</p>
        </div>

        {form.items.map((item, index) => {
          const selectedProductId = Number(item.product_id);
          const selectedAvailable = availableByProduct.get(selectedProductId);
          const selectedSaleItem = soldItems.find((si) => si.product_id === selectedProductId);
          const refundQty = Number(item.quantity) || 0;
          const itemTotal = selectedSaleItem ? getItemAmount(selectedSaleItem) : 0;
          const saleTotal = Number(selectedSale?.total ?? 0);
          const effectiveRefundTotal = calculateProportionalRefund(
            refundQty,
            Number(selectedSaleItem?.price ?? 0),
            selectedSaleItem?.quantity ?? 0,
            itemTotal,
            saleTotal,
          );
          const effectivePrice = refundQty > 0 ? effectiveRefundTotal / refundQty : 0;

          return (
            <div className="refund-item-row" key={`${index}-${item.product_id || 'new'}`}>
              <div className="refund-item-content">
                <label>
                  {t('product')}
                  <select
                    value={item.product_id}
                    onChange={(event) => updateItem(index, 'product_id', event.target.value)}
                    required
                    disabled={!selectedSale}
                  >
                    <option value="">{t('select_product')}</option>
                    {soldItems.map((saleItem) => {
                      const available = availableByProduct.get(saleItem.product_id) ?? 0;
                      const refundable = saleItem.quantity - (saleItem.refund_quantity ?? 0);
                      return (
                        <option key={saleItem.id} value={saleItem.product_id} disabled={available <= 0}>
                          {getProductLabel(saleItem, available, refundable)}
                        </option>
                      );
                    })}
                  </select>
                </label>

                {selectedSaleItem && (
                  <div className="refund-item-details">
                    <div className="detail-row">
                      <span className="detail-label">{t('original_qty')}</span>
                      <span className="detail-value">{selectedSaleItem.quantity} {t('units')}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t('already_refunded')}</span>
                      <span className="detail-value">{selectedSaleItem.refund_quantity ?? 0} {t('units')}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t('available_to_refund')}</span>
                      <span className="detail-value">{selectedAvailable ?? 0} {t('units')}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">{t('original_item_total')}</span>
                      <span className="detail-value">{formatCurrency(itemTotal)}</span>
                    </div>
                  </div>
                )}

                <label>
                  {t('refund_quantity')}
                  <input
                    max={selectedAvailable}
                    min="1"
                    type="number"
                    value={item.quantity}
                    onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                    required
                    disabled={!selectedSale}
                    placeholder="0"
                  />
                </label>

                {selectedSaleItem && refundQty > 0 && saleTotal > 0 && (
                  <div className="refund-calculation">
                    <h5>{t('proportional_pricing')}</h5>
                    <div className="calculation-detail">
                      <span className="calc-label">{t('item_subtotal')}</span>
                      <span className="calc-value">{formatCurrency(itemTotal)}</span>
                    </div>
                    <div className="calculation-detail">
                      <span className="calc-label">{t('sale_total')}</span>
                      <span className="calc-value">{formatCurrency(saleTotal)}</span>
                    </div>
                    <div className="calculation-detail">
                      <span className="calc-label">{t('proportion_ratio')}</span>
                      <span className="calc-value">
                        {((itemTotal / (selectedSale?.subtotal || 1)) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="calculation-detail">
                      <span className="calc-label">{t('refund_percentage')}</span>
                      <span className="calc-value">
                        {((refundQty / selectedSaleItem.quantity) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="calculation-result">
                      <span className="calc-label">{t('effective_refund_total')}</span>
                      <span className="calc-value" style={{ color: '#10b981', fontWeight: 'bold' }}>
                        {formatCurrency(effectiveRefundTotal)}
                      </span>
                    </div>
                    <div className="calculation-result">
                      <span className="calc-label">{t('effective_price_unit')}</span>
                      <span className="calc-value" style={{ color: '#10b981', fontWeight: 'bold' }}>
                        {formatCurrency(effectivePrice)}
                      </span>
                    </div>
                  </div>
                )}

                {selectedAvailable !== undefined && refundQty > selectedAvailable && (
                  <div className="validation-error">
                    <AlertCircle size={16} />
                    {t('cannot_refund_more', { count: selectedAvailable })}
                  </div>
                )}

                <button
                  aria-label={`${t('delete')} ${index + 1}`}
                  className="secondary-action compact-action"
                  disabled={loading || form.items.length === 1}
                  onClick={() => removeItem(index)}
                  type="button"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedSale && form.items.length > 0 && totalRefundAmount > 0 && (
        <div className="refund-summary full-field">
          <h4>{t('refund_summary')}</h4>
          <div className="summary-box">
            <div className="summary-row">
              <span>{t('total_items_to_refund')}</span>
              <strong>{form.items.length}</strong>
            </div>
            <div className="summary-row">
              <span>{t('total_refund_amount')}</span>
              <strong style={{ color: '#10b981', fontSize: '1.1em' }}>
                {formatCurrency(totalRefundAmount)}
              </strong>
            </div>
          </div>
        </div>
      )}

      <div className="form-actions full-field">
        <button className="secondary-action" disabled={loading || !selectedSale} onClick={addItem} type="button">
          <Plus size={17} aria-hidden="true" />
          {t('add_sale')}
        </button>
        <button className="primary-action" disabled={loading || missingRelations || !canSubmit} type="submit">
          <RotateCcw size={17} aria-hidden="true" />
          {t('create_refund')}
        </button>
        <button className="secondary-action" disabled={loading} onClick={onCancelEdit} type="button">
          <X size={17} aria-hidden="true" />
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}

function getItemAmount(item: SaleItem) {
  const total = Number(item.total ?? 0);
  if (Number.isFinite(total) && total > 0) return total;
  const price = Number(item.price ?? 0);
  const quantity = Number(item.quantity ?? 0);
  return price * quantity;
}

function calculateProportionalRefund(
  refundQty: number,
  itemPrice: number,
  itemQty: number,
  itemTotal: number,
  saleTotal: number,
) {
  if (refundQty <= 0 || !saleTotal || itemQty <= 0) return 0;
  
  // Calculate the proportional ratio: item_subtotal / sale.total
  const itemSubtotal = itemPrice * itemQty;
  const ratio = itemSubtotal / saleTotal;
  
  // Calculate the effective refund total: sale.total * ratio * (refund_qty / original_qty)
  const percentageRefunded = refundQty / itemQty;
  const effectiveRefundTotal = saleTotal * ratio * percentageRefunded;
  
  return effectiveRefundTotal;
}
