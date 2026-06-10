import i18n from "../i18n";
import { formatCurrency } from "./currency";
import type { Payment, PaymentStatus, PaymentMethod, CashLog, CashLogAction } from "../types";

/**
 * Format payment status for display
 */
export function formatPaymentStatus(status: PaymentStatus): string {
  const statusMap: Record<PaymentStatus, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  return statusMap[status] || status;
}

/**
 * Get CSS class for payment status badge
 */
export function getPaymentStatusClass(status: PaymentStatus): string {
  const classMap: Record<PaymentStatus, string> = {
    pending: "status-pending",
    approved: "status-approved",
    rejected: "status-rejected",
  };
  return classMap[status] || "status-default";
}

/**
 * Get status badge icon
 */
export function getPaymentStatusIcon(status: PaymentStatus): string {
  const iconMap: Record<PaymentStatus, string> = {
    pending: "⏳",
    approved: "✅",
    rejected: "❌",
  };
  return iconMap[status] || "•";
}

/**
 * Format payment method for display
 */
export function formatPaymentMethod(method: PaymentMethod): string {
  const methodMap: Record<PaymentMethod, string> = {
    cash: "Cash",
    stripe: "Stripe",
  };
  return methodMap[method] || method;
}

/**
 * Get CSS class for payment method badge
 */
export function getPaymentMethodClass(method: PaymentMethod): string {
  const classMap: Record<PaymentMethod, string> = {
    cash: "method-cash",
    stripe: "method-stripe",
  };
  return classMap[method] || "method-default";
}

/**
 * Get payment method icon
 */
export function getPaymentMethodIcon(method: PaymentMethod): string {
  const iconMap: Record<PaymentMethod, string> = {
    cash: "💵",
    stripe: "💳",
  };
  return iconMap[method] || "💰";
}

/**
 * Format date to readable format
 */
export function formatPaymentDate(dateString: string | undefined): string {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const currentLang = i18n.language || 'fr';
  return date.toLocaleString(currentLang, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: currentLang === 'en',
  });
}

/**
 * Format simple date (without time)
 */
export function formatPaymentDateOnly(dateString: string | undefined): string {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  const currentLang = i18n.language || 'fr';
  return date.toLocaleDateString(currentLang, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Calculate remaining balance for a payment
 */
export function calculateRemainingBalance(
  paymentAmount: number | string,
  totalAllocated: number | string
): number {
  const amount = typeof paymentAmount === "string" ? parseFloat(paymentAmount) : paymentAmount;
  const allocated = typeof totalAllocated === "string" ? parseFloat(totalAllocated) : totalAllocated;
  return Math.max(0, amount - allocated);
}

/**
 * Check if payment can be allocated (must be approved first)
 */
export function canAllocatePayment(payment: Payment): boolean {
  return payment.status === "approved";
}

/**
 * Check if payment can be approved (must be pending)
 */
export function canApprovePayment(payment: Payment): boolean {
  return payment.status === "pending";
}

/**
 * Format cash log action for display
 */
export function formatCashLogAction(action: CashLogAction): string {
  const actionMap: Record<CashLogAction, string> = {
    created: "Created",
    approved: "Approved",
    updated: "Updated",
    deleted: "Deleted",
    status_changed: "Status Changed",
  };
  return actionMap[action] || action;
}

/**
 * Get CSS class for cash log action badge
 */
export function getCashLogActionClass(action: CashLogAction): string {
  const classMap: Record<CashLogAction, string> = {
    created: "action-created",
    approved: "action-approved",
    updated: "action-updated",
    deleted: "action-deleted",
    status_changed: "action-status-changed",
  };
  return classMap[action] || "action-default";
}

/**
 * Get action icon for display
 */
export function getCashLogActionIcon(action: CashLogAction): string {
  const iconMap: Record<CashLogAction, string> = {
    created: "✨",
    approved: "👍",
    updated: "✏️",
    deleted: "🗑️",
    status_changed: "🔄",
  };
  return iconMap[action] || "•";
}

/**
 * Format a log entry description with old/new values
 */
export function formatLogChanges(
  oldValue: Record<string, any> | null | undefined,
  newValue: Record<string, any> | null | undefined
): string {
  if (!oldValue && !newValue) return "No changes recorded";

  const changes: string[] = [];

  if (newValue) {
    Object.entries(newValue).forEach(([key, value]) => {
      const oldVal = oldValue?.[key];
      if (oldVal !== value) {
        changes.push(`${key}: ${oldVal || "N/A"} → ${value || "N/A"}`);
      }
    });
  }

  return changes.length > 0 ? changes.join(", ") : "No changes recorded";
}

/**
 * Validate allocation amount
 */
export function validateAllocationAmount(
  allocationAmount: number | string,
  paymentAmount: number | string,
  totalAllocated: number | string
): { valid: boolean; error?: string } {
  const allocation = typeof allocationAmount === "string" ? parseFloat(allocationAmount) : allocationAmount;
  const payment = typeof paymentAmount === "string" ? parseFloat(paymentAmount) : paymentAmount;
  const allocated = typeof totalAllocated === "string" ? parseFloat(totalAllocated) : totalAllocated;

  if (isNaN(allocation)) {
    return { valid: false, error: "Invalid allocation amount" };
  }

  if (allocation <= 0) {
    return { valid: false, error: "Allocation amount must be greater than 0" };
  }

  if (allocation + allocated > payment) {
    return {
      valid: false,
      error: `Total allocation (${formatCurrency(allocation + allocated)}) exceeds payment amount (${formatCurrency(payment)})`,
    };
  }

  return { valid: true };
}

/**
 * Format payable type for display
 */
export function formatPayableType(type: string): string {
  const typeMap: Record<string, string> = {
    Sale: "Sale",
    Invoice: "Invoice",
    Purchase: "Purchase",
    PurchaseInvoice: "Purchase Invoice",
    "App\\Models\\Sale": "Sale",
    "App\\Models\\Invoice": "Invoice",
    "App\\Models\\Purchase": "Purchase",
    "App\\Models\\PurchaseInvoice": "Purchase Invoice",
  };
  return typeMap[type] || type;
}

/**
 * Get percentage of payment allocated
 */
export function getAllocationPercentage(
  totalAllocated: number | string,
  paymentAmount: number | string
): number {
  const allocated = typeof totalAllocated === "string" ? parseFloat(totalAllocated) : totalAllocated;
  const payment = typeof paymentAmount === "string" ? parseFloat(paymentAmount) : paymentAmount;

  if (payment === 0) return 0;
  return Math.min(100, (allocated / payment) * 100);
}

/**
 * Format allocation status text
 */
export function formatAllocationStatus(
  totalAllocated: number | string,
  paymentAmount: number | string
): string {
  const allocated = typeof totalAllocated === "string" ? parseFloat(totalAllocated) : totalAllocated;
  const payment = typeof paymentAmount === "string" ? parseFloat(paymentAmount) : paymentAmount;

  if (allocated === 0) return "No allocations";
  if (allocated >= payment) return "Fully allocated";
  return `Partially allocated (${formatCurrency(payment - allocated)} remaining)`;
}
