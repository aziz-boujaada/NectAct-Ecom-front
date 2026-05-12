import { Trash2, X } from 'lucide-react';
import type { Refund, RefundItem, Sale } from '../../types';
import { usePagination } from './hooks/usePagination';
import { PaginationControls } from './PaginationControls';

type RefundDetailsProps = {
  refund: Refund;
  refunds: Refund[];
  sales: Sale[];
  loading: boolean;
  onClose: () => void;
  onDelete: (refund: Refund) => void;
};

function money(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : value;
}

function formatDate(date?: string) {
  if (!date) return 'Not set';

  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RefundDetails({ refund, refunds, sales, loading, onClose, onDelete }: RefundDetailsProps) {
  const relatedSale = sales.find((sale) => sale.id === refund.sale_id);
  const items = refund.items ?? [];
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(items);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Refund #{refund.id}</h2>
            <p className="text-muted">Details and items</p>
          </div>
          <button aria-label="Close details" className="secondary-action" onClick={onClose} type="button">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3>Refund Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Sale</span>
                <span className="value">#{refund.sale_id}</span>
              </div>
              <div className="detail-item">
                <span className="label">Client</span>
                <span className="value">{relatedSale?.client?.name ?? `Client ${relatedSale?.client_id ?? 'unknown'}`}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total</span>
                <span className="value">{money(refund.total)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Items Count</span>
                <span className="value">{items.length}</span>
              </div>
              {refund.reason && (
                <div className="detail-item">
                  <span className="label">Reason</span>
                  <span className="value">{refund.reason}</span>
                </div>
              )}
              {refund.created_at && (
                <div className="detail-item">
                  <span className="label">Created</span>
                  <span className="value">{formatDate(refund.created_at)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="detail-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Refund Items</h3>
              <span>{items.length} items</span>
            </div>
            {items.length === 0 ? (
              <p className="text-muted">No items in this refund.</p>
            ) : (
              <div className="detail-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item: RefundItem) => (
                      <tr key={item.id}>
                        <td>
                          <div>
                            <strong>{item.product?.name ?? `Product ${item.product_id}`}</strong>
                            <span>{item.product?.reference ?? 'No reference'}</span>
                          </div>
                        </td>
                        <td>{money(item.price)}</td>
                        <td>{item.quantity}</td>
                        <td>{money(item.total)}</td>
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
            Close
          </button>
          <button className="danger-action" disabled={loading} onClick={() => onDelete(refund)} type="button">
            <Trash2 size={17} aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}