import type { RefundStatus, SaleStatus } from '../../types';

type BadgeType = 'refund-status' | 'sale-status';

type RefundStatusBadgeProps = {
  status: RefundStatus | SaleStatus;
  type?: BadgeType;
  title?: string;
};

function getRefundStatusColor(status: RefundStatus): string {
  switch (status) {
    case 'none':
      return 'status-none';
    case 'partial':
      return 'status-partial';
    case 'refunded':
      return 'status-refunded';
    default:
      return '';
  }
}

function getSaleStatusColor(status: SaleStatus): string {
  switch (status) {
    case 'paid':
      return 'status-paid';
    case 'unpaid':
      return 'status-unpaid';
    case 'partial_refund':
      return 'status-partial-refund';
    case 'refunded':
      return 'status-refunded';
    default:
      return '';
  }
}

function getStatusLabel(status: RefundStatus | SaleStatus): string {
  if (status === 'partial_refund') return 'Partial Refund';
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
}

export function RefundStatusBadge({ status, type = 'refund-status', title }: RefundStatusBadgeProps) {
  const colorClass = type === 'sale-status' ? getSaleStatusColor(status as SaleStatus) : getRefundStatusColor(status as RefundStatus);
  const label = getStatusLabel(status);

  return (
    <span className={`status-pill ${colorClass}`} title={title || `Status: ${label}`}>
      {label}
    </span>
  );
}
