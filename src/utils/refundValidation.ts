import type { AxiosError } from 'axios';

export type ValidationError = {
  field?: string;
  message: string;
};

export type RefundValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

/**
 * Validates refund quantity against available quantity
 */
export function validateRefundQuantity(refundQty: number, availableQty: number): ValidationError | null {
  if (refundQty <= 0) {
    return { message: 'Refund quantity must be greater than 0' };
  }
  if (refundQty > availableQty) {
    return { message: `Cannot refund more than ${availableQty} unit(s). You requested ${refundQty}.` };
  }
  return null;
}

/**
 * Validates a complete refund form
 */
export function validateRefundForm(
  saleId: string,
  items: Array<{ product_id: string; quantity: string }>,
  availableByProduct: Map<number, number>,
): RefundValidationResult {
  const errors: ValidationError[] = [];

  if (!saleId) {
    errors.push({ field: 'sale_id', message: 'Please select a sale' });
  }

  if (!items || items.length === 0) {
    errors.push({ message: 'Please add at least one item to refund' });
  }

  const seenProducts = new Set<number>();
  items.forEach((item, index) => {
    const productId = Number(item.product_id);
    const quantity = Number(item.quantity);

    if (!productId) {
      errors.push({ field: `items.${index}.product_id`, message: 'Please select a product' });
      return;
    }

    if (seenProducts.has(productId)) {
      errors.push({ field: `items.${index}.product_id`, message: 'This product is already in the refund list' });
    }
    seenProducts.add(productId);

    if (quantity <= 0) {
      errors.push({ field: `items.${index}.quantity`, message: 'Quantity must be greater than 0' });
    }

    const available = availableByProduct.get(productId) ?? 0;
    if (quantity > available) {
      errors.push({
        field: `items.${index}.quantity`,
        message: `Cannot refund more than ${available} unit(s). You requested ${quantity}.`,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Extracts user-friendly error message from API error response
 */
export function getRefundErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check if it's an Axios error with response data
    if ('response' in error && error.response) {
      const response = error.response as { data?: { message?: string; errors?: Record<string, string[]> } };
      if (response.data?.message) {
        return response.data.message;
      }
      if (response.data?.errors) {
        // Flatten error messages from Laravel validation
        const messages = Object.values(response.data.errors).flat();
        return messages.length > 0 ? messages[0] : error.message;
      }
    }
    return error.message;
  }
  return 'An unexpected error occurred while processing the refund';
}

/**
 * Maps specific error scenarios to user-friendly messages
 */
export function getRefundErrorForScenario(errorType: string, context?: Record<string, any>): string {
  const scenarios: Record<string, string | ((ctx: Record<string, any>) => string)> = {
    PRODUCT_NOT_FOUND: 'Product was not found in this sale',
    INSUFFICIENT_QUANTITY: (ctx) => `Cannot refund more than ${ctx.available} unit(s). You requested ${ctx.requested}.`,
    SALE_NOT_FOUND: 'Sale not found',
    INVALID_REFUND_STATUS: 'This item cannot be refunded',
    REFUND_AMOUNT_MISMATCH: 'Refund amount does not match the calculated proportional amount',
    DUPLICATE_PRODUCT_IN_REFUND: 'Duplicate products in refund request',
  };

  const handler = scenarios[errorType];
  if (!handler) {
    return 'An error occurred while processing the refund';
  }

  if (typeof handler === 'string') {
    return handler;
  }

  return handler(context ?? {});
}

/**
 * Formats validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string[] {
  return errors.map((err) => err.message);
}

/**
 * Validation error component helper - returns CSS class for field with error
 */
export function getFieldErrorClass(fieldPath: string, errors: ValidationError[]): string {
  const hasError = errors.some((err) => err.field === fieldPath);
  return hasError ? 'field-error' : '';
}

/**
 * Check if refund can be edited (backend rules)
 */
export function canEditRefund(refund: any): boolean {
  // Refunds can only be edited if they were created within the last 24 hours
  // or if the sale is in 'partial_refund' status
  if (!refund.created_at) return false;

  const createdAt = new Date(refund.created_at).getTime();
  const now = new Date().getTime();
  const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

  return hoursSinceCreation < 24;
}

/**
 * Generate audit trail entry for refund
 */
export function generateRefundAuditEntry(refund: any, action: 'created' | 'updated' | 'deleted'): string {
  const date = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const actionText = {
    created: 'Refund created',
    updated: 'Refund updated',
    deleted: 'Refund deleted',
  };

  return `${actionText[action]} on ${date}`;
}
