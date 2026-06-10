import { API_BASE_URL, ApiError, request } from './auth';
import { tokenStore } from './auth';
import type { CompanySettings } from '../context/themeTypes';

export type CompanySettingsResponse = {
  status: 'success' | 'error';
  message?: string;
  data?: CompanySettings & {
    id: number;
    primary_color?: string;
    secondary_color?: string;
    created_at?: string;
    updated_at?: string;
    logo_url?: string;
  };
  errors?: Record<string, string[]>;
};

/**
 * Fetch current company settings from backend
 */
export async function getCompanySettings(): Promise<CompanySettingsResponse['data']> {
  try {
    const token = tokenStore.get();
    const response = await fetch(`${API_BASE_URL}/settings/company`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const data = (await response.json()) as CompanySettingsResponse;

    if (!response.ok) {
      throw new ApiError(data.message ?? 'Failed to fetch company settings', response.status, data.errors);
    }

    return data.data || {};
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to fetch company settings', 500);
  }
}

/**
 * Update company settings with form data
 * Supports file upload for logo
 */
export async function updateCompanySettings(formData: FormData): Promise<CompanySettingsResponse['data']> {
  try {
    const token = tokenStore.get();

    const response = await fetch(`${API_BASE_URL}/settings/company`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        // Don't set Content-Type when using FormData - browser will set it with boundary
      },
      body: formData,
    });

    const data = (await response.json()) as CompanySettingsResponse;

    if (!response.ok) {
      throw new ApiError(data.message ?? 'Failed to update company settings', response.status, data.errors);
    }

    return data.data || {};
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to update company settings', 500);
  }
}

/**
 * Delete company logo
 */
export async function deleteCompanyLogo(): Promise<CompanySettingsResponse['data']> {
  try {
    const token = tokenStore.get();

    const response = await fetch(`${API_BASE_URL}/settings/company/logo/delete`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({}),
    });

    const data = (await response.json()) as CompanySettingsResponse;

    if (!response.ok) {
      throw new ApiError(data.message ?? 'Failed to delete logo', response.status, data.errors);
    }

    return data.data || {};
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to delete logo', 500);
  }
}

/**
 * Helper to build FormData from settings object
 */
export function buildCompanySettingsFormData(
  settings: Partial<CompanySettings> & {
    primary_color?: string;
    secondary_color?: string;
    company_logo_file?: File | null; // Actual file from input
  }
): FormData {
  const formData = new FormData();

  // Add text fields
  if (settings.company_name) formData.append('company_name', settings.company_name);
  if (settings.company_email) formData.append('company_email', settings.company_email);
  if (settings.company_phone) formData.append('company_phone', settings.company_phone);
  if (settings.company_address) formData.append('company_address', settings.company_address);
  if (settings.company_website) formData.append('company_website', settings.company_website);
  if (settings.company_tax_number) formData.append('company_tax_number', settings.company_tax_number);

  // Add colors
  if (settings.primary_color) formData.append('primary_color', settings.primary_color);
  if (settings.secondary_color) formData.append('secondary_color', settings.secondary_color);

  // Add logo file if provided
  if (settings.company_logo_file) {
    formData.append('company_logo', settings.company_logo_file);
  }

  return formData;
}

/**
 * Extract validation errors from API response
 */
export function extractValidationErrors(errors?: Record<string, string[]>): Record<string, string> {
  if (!errors) return {};

  const result: Record<string, string> = {};
  Object.entries(errors).forEach(([field, messages]) => {
    result[field] = messages[0] || 'Invalid field';
  });
  return result;
}

/**
 * Convert API response colors to theme format
 */
export function apiResponseToTheme(data: CompanySettingsResponse['data']) {
  return {
    primaryColor: data?.primary_color || '#4f52e8',
    secondaryColor: data?.secondary_color || '#3e40c4',
  };
}
