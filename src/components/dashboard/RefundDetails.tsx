import { Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Refund, RefundItem, Sale } from '../../types';
import { usePagination } from './hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { formatCurrency } from '../../utils/currency';

type RefundDetailsProps = {
  refund: Refund;
  refunds: Refund[];
  sales: Sale[];
  loading: boolean;
  onClose: () => void;
  onDelete: (refund: Refund) => void;
};

export function RefundDetails({ refund, refunds, sales, loading, onClose, onDelete }: RefundDetailsProps) {
  const { t, i18n } = useTranslation('sales');

  function formatDate(date?: string) {
    if (!date) return t('not_set');

    return new Date(date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'fr' ? 'fr-FR' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const relatedSale = sales.find((sale) => sale.id === refund.sale_id);
  const items = refund.items ?? [];
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(items);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{t('refund_details', { id: refund.id })}</h2>
            <p className="text-muted">{t('details_and_items')}</p>
          </div>
          <button aria-label={t('close_details')} className="secondary-action" onClick={onClose} type="button">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3>{t('refund_information')}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">{t('sale')}</span>
                <span className="value">#{refund.sale_id}</span>
              </div>
              <div className="detail-item">
                <span className="label">{t('client')}</span>
                <span className="value">{relatedSale?.client?.name ?? `${t('client')} ${relatedSale?.client_id ?? t('not_set')}`}</span>
              </div>
              <div className="detail-item">
                <span className="label">{t('total')}</span>
                <span className="value">{formatCurrency(refund.total)}</span>
              </div>
              <div className="detail-item">
                <span className="label">{t('items_count_label')}</span>
                <span className="value">{items.length}</span>
              </div>
              {refund.reason && (
                <div className="detail-item">
                  <span className="label">{t('reason')}</span>
                  <span className="value">{refund.reason}</span>
                </div>
              )}
              {refund.created_at && (
                <div className="detail-item">
                  <span className="label">{t('created')}</span>
                  <span className="value">{formatDate(refund.created_at)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="detail-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{t('refund_items')}</h3>
              <span>{items.length} {t('items_count')}</span>
            </div>
            {items.length === 0 ? (
              <p className="text-muted">{t('no_items_in_refund')}</p>
            ) : (
              <div className="detail-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t('product')}</th>
                      <th>{t('price')}</th>
                      <th>{t('quantity')}</th>
                      <th>{t('total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item: RefundItem) => (
                      <tr key={item.id}>
                        <td>
                          <div>
                            <strong>{item.product?.name ?? `${t('product')} ${item.product_id}`}</strong>
                            <span>{item.product?.reference ?? t('not_set')}</span>
                          </div>
                        </td>
                          <td>{formatCurrency(item.price)}</td>
                        <td>{item.quantity}</td>
                          <td>{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {items.length > 0 && totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={prevPage}
                onNext={nextPage}
                onPageChange={goToPage}
              />
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-action" disabled={loading} onClick={onClose} type="button">
            {t('close')}
          </button>
          <button className="danger-action" disabled={loading} onClick={() => onDelete(refund)} type="button">
            <Trash2 size={17} aria-hidden="true" />
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}