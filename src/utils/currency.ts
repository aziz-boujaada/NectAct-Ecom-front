/**
 * Format a number as Moroccan Dirham currency with thousand separators
 * @param value - The numeric value to format
 * @returns Formatted string like "3,600,675 DH"
 */
export function formatCurrency(value: string | number | null | undefined): string {
  const amount = Number(value ?? 0);
  
  if (!Number.isFinite(amount)) {
    return String(value ?? '');
  }
  
  // Format with thousand separators and 2 decimal places
  const formatted = amount.toLocaleString('fr-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return `${formatted} DH`;
}
