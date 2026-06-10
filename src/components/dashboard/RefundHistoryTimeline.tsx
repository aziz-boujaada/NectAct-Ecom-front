import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Refund, SaleItem } from '../../types';
import { formatCurrency } from '../../utils/currency';

type RefundHistoryTimelineProps = {
  saleItem: SaleItem;
  refunds: Refund[];
};

function formatDate(date?: string) {
  if (!date) return 'Unknown date';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getItemRefunds(saleItem: SaleItem, allRefunds: Refund[]) {
  const itemRefunds: Array<{ refund: Refund; quantity: number; price: string | number; total: string | number }> = [];

  allRefunds.forEach((refund) => {
    const refundItem = refund.items?.find((item) => item.product_id === saleItem.product_id);
    if (refundItem) {
      itemRefunds.push({
        refund,
        quantity: refundItem.quantity,
        price: refundItem.price,
        total: refundItem.total ?? 0,
      });
    }
  });

  return itemRefunds.sort((a, b) => {
    const dateA = new Date(a.refund.created_at || 0).getTime();
    const dateB = new Date(b.refund.created_at || 0).getTime();
    return dateB - dateA;
  });
}

export function RefundHistoryTimeline({ saleItem, refunds }: RefundHistoryTimelineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const itemRefunds = getItemRefunds(saleItem, refunds);

  if (itemRefunds.length === 0) {
    return null;
  }

  return (
    <div className="refund-history-accordion">
      <button
        className="refund-history-toggle"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-expanded={isOpen}
      >
        <div className="refund-history-header">
          <div>
            <strong>Refund History</strong>
            <span className="text-muted">({itemRefunds.length})</span>
          </div>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {isOpen && (
        <div className="refund-history-items">
          {itemRefunds.map((entry, index) => (
            <div key={`${entry.refund.id}-${index}`} className="refund-history-item">
              <div className="refund-history-item-header">
                <div>
                  <strong>Refund #{entry.refund.id}</strong>
                  <span className="text-muted">{formatDate(entry.refund.created_at)}</span>
                </div>
                <div className="refund-history-item-amount">
                  <strong>{formatCurrency(entry.total)}</strong>
                  <span className="text-muted">{entry.quantity} unit(s)</span>
                </div>
              </div>
              {entry.refund.reason && <p className="refund-reason">{entry.refund.reason}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
