import type { Refund, SaleItem } from '../../types';
import { RefundStatusBadge } from '../common/RefundStatusBadge';
import { formatCurrency } from '../../utils/currency';
import { RefundHistoryTimeline } from './RefundHistoryTimeline';

type SaleItemRefundPanelProps = {
  saleItem: SaleItem;
  refunds: Refund[];
};

export function SaleItemRefundPanel({ saleItem, refunds }: SaleItemRefundPanelProps) {
  const originalQuantity = saleItem.quantity;
  const refundedQuantity = saleItem.refund_quantity ?? 0;
  const availableQuantity = originalQuantity - refundedQuantity;
  const refundStatus = saleItem.refund_status ?? 'none';
  const refundTotal = saleItem.refund_total ? Number(saleItem.refund_total) : 0;

  const refundPercentage = originalQuantity > 0 ? Math.round((refundedQuantity / originalQuantity) * 100) : 0;

  return (
    <div className="refund-tracking-panel">
      <h4>Refund Tracking</h4>

      <div className="refund-tracking-grid">
        <div className="refund-tracking-item">
          <span className="refund-tracking-label">Original Quantity</span>
          <span className="refund-tracking-value">{originalQuantity} unit(s)</span>
        </div>

        <div className="refund-tracking-item">
          <span className="refund-tracking-label">Already Refunded</span>
          <span className="refund-tracking-value">{refundedQuantity} unit(s)</span>
        </div>

        <div className="refund-tracking-item">
          <span className="refund-tracking-label">Available for Refund</span>
          <span className="refund-tracking-value">{availableQuantity} unit(s)</span>
        </div>

        <div className="refund-tracking-item">
          <span className="refund-tracking-label">Refund Status</span>
          <RefundStatusBadge status={refundStatus} type="refund-status" />
        </div>
      </div>

      {refundedQuantity > 0 && (
        <div className="refund-tracking-totals">
          <div className="refund-tracking-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${refundPercentage}%`,
                  backgroundColor:
                    refundStatus === 'refunded'
                      ? '#10b981'
                      : refundStatus === 'partial'
                        ? '#f59e0b'
                        : '#6b7280',
                }}
              />
            </div>
            <span className="text-muted">{refundPercentage}% refunded</span>
          </div>

          <div className="refund-total-display">
            <span className="refund-tracking-label">Total Refunded Amount</span>
            <span className="refund-tracking-value" style={{ color: '#10b981' }}>
              {formatCurrency(refundTotal)}
            </span>
          </div>
        </div>
      )}

      <RefundHistoryTimeline saleItem={saleItem} refunds={refunds} />
    </div>
  );
}
