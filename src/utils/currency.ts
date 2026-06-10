import i18n from "../i18n";

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
  
  // Use the current language from i18n, default to 'fr-MA' if not available
  const currentLang = i18n.language || 'fr';
  const locale = currentLang === 'ar' ? 'ar-MA' : (currentLang === 'en' ? 'en-US' : 'fr-MA');
  
  // Format with thousand separators and 2 decimal places
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  // Handle RTL for Arabic
  if (currentLang === 'ar') {
    return `${formatted} د.م.`;
  }
  
  return `${formatted} DH`;
}
