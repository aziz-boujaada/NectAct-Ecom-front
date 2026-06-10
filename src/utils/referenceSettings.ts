import type { CompanySettings } from '../context/themeTypes';

export type ReferenceSettings = Pick<
  CompanySettings,
  'sale_reference_prefix' | 'devis_reference_prefix' | 'payment_reference_prefix'
>;

export const DEFAULT_REFERENCE_SETTINGS: ReferenceSettings = {
  sale_reference_prefix: 'FAC',
  devis_reference_prefix: 'DEV',
  payment_reference_prefix: 'PAY',
};

export function normalizeReferencePrefix(value: string) {
  return value.trim().toUpperCase();
}

export function validReferencePrefix(value: string) {
  return /^[A-Z0-9]{1,20}$/.test(normalizeReferencePrefix(value));
}

export function referenceSettingsFromCompanySettings(settings: CompanySettings): ReferenceSettings {
  return {
    sale_reference_prefix: normalizeReferencePrefix(settings.sale_reference_prefix || DEFAULT_REFERENCE_SETTINGS.sale_reference_prefix),
    devis_reference_prefix: normalizeReferencePrefix(settings.devis_reference_prefix || DEFAULT_REFERENCE_SETTINGS.devis_reference_prefix),
    payment_reference_prefix: normalizeReferencePrefix(settings.payment_reference_prefix || DEFAULT_REFERENCE_SETTINGS.payment_reference_prefix),
  };
}
