export type Theme = {
  primaryColor: string;
  secondaryColor?: string;
  createdAt?: string;
};

export type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  updatePrimaryColor: (color: string) => void;
  updateSecondaryColor: (color: string) => void;
  resetTheme: () => void;
};

export type CompanySettings = {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  company_website?: string;
  company_tax_number?: string;
  company_logo?: string;
  company_logo_url?: string;
  sale_reference_prefix: string;
  devis_reference_prefix: string;
  payment_reference_prefix: string;
  updated_at?: string;
};

export const DEFAULT_THEME: Theme = {
  primaryColor: '#4f52e8',
  secondaryColor: '#3e40c4',
};

export const THEME_STORAGE_KEY = 'nectact_theme';
export const COMPANY_SETTINGS_STORAGE_KEY = 'nectact_company_settings';
