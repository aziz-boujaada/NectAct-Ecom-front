import { Loader, Printer, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tokenStore } from '../../api/auth';
import type { Product, Sale, SaleItem } from '../../types';
import { RefundStatusBadge } from '../common/RefundStatusBadge';
import { usePagination } from './hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { formatCurrency } from '../../utils/currency';

type SaleInvoiceProps = {
  sale: Sale;
  saleItems: SaleItem[];
  products: Product[];
  clientName?: string;
  loading?: boolean;
  onDeleteItem?: (item: SaleItem) => void;
};

function getItemAmount(item: SaleItem) {
  const total = Number(item.total ?? 0);
  if (Number.isFinite(total) && total > 0) return total;
  const price = Number(item.price ?? 0);
  const quantity = Number(item.quantity ?? 0);
  return price * quantity;
}

export function SaleInvoice({ sale, saleItems, products, clientName, loading = false, onDeleteItem }: SaleInvoiceProps) {
  const { t, i18n } = useTranslation(['sales', 'common']);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const productById = new Map(products.map((p) => [p.id, p]));
  const relatedItems = saleItems.filter((i) => i.sale_id === sale.id);
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(relatedItems);
  const subtotal = relatedItems.reduce((s, it) => s + getItemAmount(it), 0);
  const total = Number(sale.total ?? subtotal);
  const displayTotal = Number.isFinite(total) ? total : subtotal;
  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

  function formatDate(date?: string) {
    if (!date) return t('not_set');
    return new Date(date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'fr' ? 'fr-FR' : 'en-GB');
  }

  async function exportPdfToFile() {
    if (isExporting) return;
    try {
      setIsExporting(true);
      const token = tokenStore.get();
      const headers: HeadersInit = { Accept: 'application/pdf' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/invoices/${sale.id}/generate`, {
        method: 'POST',
        headers,
      });

      if (!res.ok) throw new Error(res.statusText || 'Failed to generate PDF');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // filename from sale id; backend sets Content-Disposition but anchor download is convenient
      a.download = `invoice-${sale.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      // minimal user-visible error
      // eslint-disable-next-line no-console
      console.error('Invoice export failed', err);
      alert(t('failed pdf'));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="invoice-sheet" aria-label={`${t('invoice title')} #${sale.id}`}>
      <div className="invoice-toolbar">
        <div>
          <p className="eyebrow">{t('invoice title')}</p>
          <h3>{t('invoice title')} #{sale.id}</h3>
          <p className="text-muted">{t('download pdf note')}</p>
        </div>

        <div className="invoice-toolbar-actions">
          <button className="secondary-action invoice-export-button" onClick={exportPdfToFile} disabled={isExporting || loading} type="button">
            {isExporting ? (
              <>
                <Loader size={16} className="animate-spin" /> {t('generating')}
              </>
            ) : (
              <>
                <Printer size={16} /> {t('export pdf')}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="detail-grid invoice-meta-grid">
        <div className="detail-item">
          <span className="label">{t('client')}</span>
          <span className="value">{clientName ?? sale.client?.name ?? `${t('client')} ${sale.client_id}`}</span>
        </div>
        <div className="detail-item">
          <span className="label">{t('common:common.status')}</span>
          <RefundStatusBadge status={t(`status.${sale.status}`)} type="sale-status" />
        </div>
        <div className="detail-item">
          <span className="label">{t('created_at')}</span>
          <span className="value">{formatDate(sale.created_at)}</span>
        </div>
        <div className="detail-item">
          <span className="label">{t('items count')}</span>
          <span className="value">{relatedItems.length}</span>
        </div>
      </div>

      <div className="detail-section">
        {relatedItems.length === 0 ? (
          <p className="text-muted">{t('no items found')}</p>
        ) : (
          <>
            <div className="detail-table-wrap invoice-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th />
                    <th>{t('product')}</th>
                    <th>{t('common:common.id')}</th>
                    <th>{t('price')}</th>
                    <th>{t('quantity')}</th>
                    <th>{t('common:common.total')}</th>
                    <th>{t('refund status')}</th>
                    <th>
                      {t('refunded')}
                      <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 'normal', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {t('qty amount')}
                      </span>
                    </th>
                    {onDeleteItem && <th aria-label={t('common:common.actions')} />}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item) => {
                    const product = productById.get(item.product_id);
                    const refundedQty = item.refund_quantity ?? 0;
                    const refundedTotal = item.refund_total ?? 0;
                    const isExpanded = expandedItemId === item.id;
                    const hasRefunds = refundedQty > 0;

                    return (
                      <>
                        <tr key={item.id}>
                          <td className="expand-cell">
                            {hasRefunds && (
                              <button
                                className="expand-button"
                                onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                                type="button"
                                aria-expanded={isExpanded}
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            )}
                          </td>
                          <td>
                            <strong>{product?.name ?? `${t('product')} ${item.product_id}`}</strong>
                          </td>
                          <td>{product?.reference ?? '—'}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.total ?? getItemAmount(item))}</td>
                          <td>
                            {item.refund_status ? (
                              <RefundStatusBadge status={item.refund_status} type="refund-status" />
                            ) : (
                              <span className="text-muted">{t('not set')}</span>
                            )}
                          </td>
                          <td>
                            {hasRefunds ? (
                              <div style={{ display: 'grid', gap: '4px' }}>
                                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                  {refundedQty} {refundedQty !== 1 ? t('units') : t('unit')}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>
                                  {formatCurrency(refundedTotal)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          {onDeleteItem && (
                            <td>
                              <button aria-label={`${t('common:common.delete')} ${item.id}`} className="danger-action" disabled={loading} onClick={() => onDeleteItem(item)} type="button">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          )}
                        </tr>
                        {isExpanded && hasRefunds && (
                          <tr className="refund-details-row">
                            <td colSpan={onDeleteItem ? 10 : 9}>
                              <div className="refund-tracking-details">
                                <div className="tracking-info">
                                  <div className="info-item">
                                    <span className="info-label">{t('original quantity')}:</span>
                                    <span className="info-value">{item.quantity} {t('units')}</span>
                                  </div>
                                  <div className="info-item">
                                    <span className="info-label">{t('refunded quantity')}:</span>
                                    <span className="info-value">{refundedQty} {t('units')}</span>
                                  </div>
                                  <div className="info-item">
                                    <span className="info-label">{t('available for refund')}:</span>
                                    <span className="info-value">{item.quantity - refundedQty} {t('units')}</span>
                                  </div>
                                  <div className="info-item">
                                    <span className="info-label">{t('refund status')}:</span>
                                    <RefundStatusBadge status={item.refund_status || 'none'} type="refund-status" />
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={prevPage}
          onNext={nextPage}
          onPageChange={goToPage}
        />
      )}

      <div className="invoice-summary">
        <div className="invoice-total-box">
          <div className="invoice-total-row">
            <span>{t('subtotal')}</span>
            <strong>{formatCurrency(sale.subtotal ?? subtotal)}</strong>
          </div>
          <div className="invoice-total-row">
            <span>{t('discount')}</span>
            <strong>{formatCurrency(sale.discount_amount)}</strong>
          </div>
          <div className="invoice-total-row">
            <span>{t('tax')}</span>
            <strong>{formatCurrency(sale.tax_amount)}</strong>
          </div>
          <div className="invoice-total-row">
            <span>{t('invoice total')}</span>
            <strong>{formatCurrency(displayTotal)}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
