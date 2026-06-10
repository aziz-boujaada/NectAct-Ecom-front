import { request, tokenStore } from "./auth";
import type {
  Payment,
  PaymentAllocation,
  CashLog,
  CashLogStatistics,
  PaymentFormValues,
  PaymentAllocationUpdateValues,
} from "../types";
import { normalizeReferencePrefix } from "../utils/referenceSettings";

// Response types
type PaymentResponse = {
  message: string;
  payment?: Payment;
  payments?: {
    data: Payment[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
};

type PaymentAllocationResponse = {
  message: string;
  allocation?: PaymentAllocation;
  allocations?: {
    data: PaymentAllocation[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  payment_id?: number;
};

type CashLogResponse = {
  message: string;
  log?: CashLog;
  logs?: {
    data: CashLog[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  payment_id?: number;
};

type CashLogStatisticsResponse = {
  message: string;
  statistics: CashLogStatistics;
};

const authToken = () => tokenStore.get() || undefined;

// Payment Management Endpoints

/**
 * Create a payment from signed URL (no auth required)
 */
export async function createPaymentFromSignedUrl(
  sale: number,
  type: "cash" | "stripe",
  referencePrefix = "PAY"
): Promise<PaymentResponse> {
  return request(`/sales/${sale}/payments/${type}`, {
    method: "POST",
    body: {
      reference_prefix: normalizeReferencePrefix(referencePrefix),
    },
  });
}

/**
 * List all payments with pagination
 */
export async function listPayments(page: number = 1, perPage: number = 15): Promise<PaymentResponse> {
  return request(`/payments?page=${page}&per_page=${perPage}`, {
    token: authToken(),
  });
}

/**
 * Approve a pending payment
 */
export async function approvePayment(paymentId: number): Promise<PaymentResponse> {
  return request(`/payments/${paymentId}/approve`, {
    method: "POST",
    body: {},
    token: authToken(),
  });
}
export async function updateNotes(paymentId: number): Promise<PaymentResponse> {
  return request(`/payments/${paymentId}/notes`, {
    method: "PUT",
    body: {notes : notes},
    token: authToken(),

  });
}
// Payment Allocation Endpoints

/**
 * List allocations for a specific payment
 */
export async function listPaymentAllocations(
  paymentId: number,
  page: number = 1,
  perPage: number = 15
): Promise<PaymentAllocationResponse> {
  return request(`/payments/${paymentId}/allocations?page=${page}&per_page=${perPage}`, {
    token: authToken(),
  });
}

/**
 * Create a new allocation for a payment
 */
export async function createPaymentAllocation(
  paymentId: number,
  data: PaymentFormValues
): Promise<PaymentAllocationResponse> {
  return request(`/payments/${paymentId}/allocations`, {
    method: "POST",
    body: {
      payable_type: data.payable_type,
      payable_id: parseInt(data.payable_id),
      amount_applied: parseFloat(data.amount_applied),
    },
    token: authToken(),
  });
}

/**
 * Get a specific allocation
 */
export async function getPaymentAllocation(
  paymentId: number,
  allocationId: number
): Promise<PaymentAllocationResponse> {
  return request(`/payments/${paymentId}/allocations/${allocationId}`, {
    token: authToken(),
  });
}

/**
 * Update an allocation amount
 */
export async function updatePaymentAllocation(
  paymentId: number,
  allocationId: number,
  data: PaymentAllocationUpdateValues
): Promise<PaymentAllocationResponse> {
  return request(`/payments/${paymentId}/allocations/${allocationId}`, {
    method: "PUT",
    body: {
      amount_applied: parseFloat(data.amount_applied),
    },
    token: authToken(),
  });
}

/**
 * Delete an allocation
 */
export async function deletePaymentAllocation(
  paymentId: number,
  allocationId: number
): Promise<{ message: string }> {
  return request(`/payments/${paymentId}/allocations/${allocationId}`, {
    method: "DELETE",
    token: authToken(),
  });
}

// Cash Logs & Audit Trail Endpoints

/**
 * List all cash logs with optional filtering
 */
export async function listCashLogs(
  page: number = 1,
  perPage: number = 20,
  filters?: {
    payment_id?: number;
    action?: string;
    user_id?: number;
    from_date?: string;
    to_date?: string;
  }
): Promise<CashLogResponse> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("per_page", perPage.toString());

  if (filters?.payment_id) params.append("payment_id", filters.payment_id.toString());
  if (filters?.action) params.append("action", filters.action);
  if (filters?.user_id) params.append("user_id", filters.user_id.toString());
  if (filters?.from_date) params.append("from_date", filters.from_date);
  if (filters?.to_date) params.append("to_date", filters.to_date);

  return request(`/cash-logs?${params.toString()}`, {
    token: authToken(),
  });
}

/**
 * Get logs for a specific payment
 */
export async function getPaymentLogs(
  paymentId: number,
  page: number = 1,
  perPage: number = 20
): Promise<CashLogResponse> {
  return request(`/payments/${paymentId}/logs?page=${page}&per_page=${perPage}`, {
    token: authToken(),
  });
}

/**
 * Get a specific log entry
 */
export async function getCashLogEntry(logId: number): Promise<CashLogResponse> {
  return request(`/cash-logs/${logId}`, {
    token: authToken(),
  });
}

/**
 * Get cash logs statistics
 */
export async function getCashLogsStatistics(
  fromDate?: string,
  toDate?: string
): Promise<CashLogStatisticsResponse> {
  const params = new URLSearchParams();
  if (fromDate) params.append("from_date", fromDate);
  if (toDate) params.append("to_date", toDate);

  return request(`/cash-logs/statistics?${params.toString()}`, {
    token: authToken(),
  });
}
