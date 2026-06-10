import { Save, Loader, AlertCircle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { CompanySettings } from '../../context/themeTypes';
import { useCompanySettings } from '../../context/CompanySettingsContext';
import { LogoUpload } from './LogoUpload';
import {
  getCompanySettings,
  updateCompanySettings,
  deleteCompanyLogo,
  buildCompanySettingsFormData,
  extractValidationErrors,
  type CompanySettingsResponse,
} from '../../api/companySettings';
import { ApiError } from '../../api/auth';

type CompanySettingsFormProps = {
  onSave?: (settings: CompanySettings) => void;
};

export function CompanySettingsForm({ onSave }: CompanySettingsFormProps) {
  const { companySettings, setCompanySettings } = useCompanySettings();
  const [formData, setFormData] = useState<
    CompanySettings & {
      primary_color?: string;
      secondary_color?: string;
      logo_url?: string;
    }
  >(companySettings as any);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load settings on mount - but only once
  useEffect(() => {
    // If context already has data, use it
    if (companySettings.company_name) {
      setFormData(companySettings as any);
      setInitialLoading(false);
      return;
    }

    async function loadSettings() {
      try {
        setInitialLoading(true);
        const data = await getCompanySettings();
        if (data) {
          setFormData(data as any);
          setCompanySettings(data as any);
          setApiError(null);
        }
      } catch (error) {
        if (error instanceof ApiError) {
          setApiError(error.message);
        } else {
          setApiError('Failed to load settings');
        }
      } finally {
        setInitialLoading(false);
      }
    }

    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run ONCE on mount

  // Keep form data in sync with context when context updates from outside (like provider initial fetch)
  useEffect(() => {
    if (companySettings.company_name && !loading) {
       setFormData(prev => ({ ...prev, ...companySettings }));
    }
  }, [companySettings, loading]);

  const handleInputChange = (field: keyof CompanySettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLogoChange = (base64: string | null) => {
    setFormData((prev) => ({ ...prev, company_logo: base64 || undefined }));
  };

  const handleLogoFileChange = (file: File | null) => {
    if (file) {
      setLogoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm('Are you sure you want to delete the company logo?')) return;

    setLoading(true);
    try {
      const updatedData = await deleteCompanyLogo();
      if (updatedData) {
        setFormData((prev) => ({ ...prev, company_logo: undefined, logo_url: undefined }));
        setLogoPreview(null);
        setCompanySettings(updatedData as any);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError('Failed to delete logo');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name?.trim()) {
      newErrors.company_name = 'Company name is required';
    }
    if (!formData.company_email?.trim()) {
      newErrors.company_email = 'Company email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company_email)) {
      newErrors.company_email = 'Please enter a valid email';
    }
    if (!formData.company_phone?.trim()) {
      newErrors.company_phone = 'Company phone is required';
    }
    if (!formData.company_address?.trim()) {
      newErrors.company_address = 'Company address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);
    setApiError(null);

    try {
      // Build FormData with all fields
      const submissionData = buildCompanySettingsFormData({
        ...formData,
        company_logo_file: logoFile, // Include file if selected
      });

      // Submit to API
      await updateCompanySettings(submissionData);

      // Refetch fresh settings after successful update (ensures consistency)
      const freshData = await getCompanySettings();

      if (freshData) {
        // Update context and form with fresh data
        setFormData(freshData as any);
        setCompanySettings(freshData as any);
        setLogoFile(null);
        setLogoPreview(null);
        setErrors({});
        setSuccess(true);
        setApiError(null);
        onSave?.(freshData as any);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errors) {
          // Display field-level validation errors
          const validationErrors = extractValidationErrors(error.errors);
          setErrors(validationErrors);
        } else {
          // Generic API error
          setApiError(error.message);
        }
      } else {
        setApiError('Failed to save settings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(companySettings);

  if (initialLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Loader size={24} className="animate-spin" style={{ margin: '0 auto' }} />
        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <form className="company-settings-form" onSubmit={handleSubmit}>
      {/* API Error Alert */}
      {apiError && (
        <div className="validation-error" style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{apiError}</span>
        </div>
      )}

      <div className="form-grid">
        {/* Company Name */}
        <div className="form-section">
          <label>
            Company Name
            <span className="required-indicator">*</span>
          </label>
          <input
            type="text"
            value={formData.company_name || ''}
            onChange={(e) => handleInputChange('company_name', e.target.value)}
            placeholder="Enter company name"
            disabled={loading}
            className={errors.company_name ? 'field-error' : ''}
          />
          {errors.company_name && <span className="field-error-text">{errors.company_name}</span>}
        </div>

        {/* Company Email */}
        <div className="form-section">
          <label>
            Company Email
            <span className="required-indicator">*</span>
          </label>
          <input
            type="email"
            value={formData.company_email || ''}
            onChange={(e) => handleInputChange('company_email', e.target.value)}
            placeholder="info@company.com"
            disabled={loading}
            className={errors.company_email ? 'field-error' : ''}
          />
          {errors.company_email && <span className="field-error-text">{errors.company_email}</span>}
        </div>

        {/* Company Phone */}
        <div className="form-section">
          <label>
            Company Phone
            <span className="required-indicator">*</span>
          </label>
          <input
            type="tel"
            value={formData.company_phone || ''}
            onChange={(e) => handleInputChange('company_phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
            disabled={loading}
            className={errors.company_phone ? 'field-error' : ''}
          />
          {errors.company_phone && <span className="field-error-text">{errors.company_phone}</span>}
        </div>

        {/* Company Address */}
        <div className="form-section">
          <label>
            Company Address
            <span className="required-indicator">*</span>
          </label>
          <input
            type="text"
            value={formData.company_address || ''}
            onChange={(e) => handleInputChange('company_address', e.target.value)}
            placeholder="123 Business Street"
            disabled={loading}
            className={errors.company_address ? 'field-error' : ''}
          />
          {errors.company_address && <span className="field-error-text">{errors.company_address}</span>}
        </div>

        {/* Company Website */}
        <div className="form-section">
          <label>Company Website (Optional)</label>
          <input
            type="url"
            value={formData.company_website || ''}
            onChange={(e) => handleInputChange('company_website', e.target.value)}
            placeholder="https://www.company.com"
            disabled={loading}
          />
        </div>

        {/* Company Tax Number */}
        <div className="form-section">
          <label>Tax Number (Optional)</label>
          <input
            type="text"
            value={formData.company_tax_number || ''}
            onChange={(e) => handleInputChange('company_tax_number', e.target.value)}
            placeholder="Enter tax number"
            disabled={loading}
          />
        </div>
      </div>

      {/* Logo Section */}
      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ marginBottom: '16px' }}>
          <label className="logo-upload-label">
            Company Logo
            <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>
          </label>
          
          <div style={{ marginTop: '12px' }}>
            {/* Show new preview if selected, otherwise show current logo from URL */}
            {logoPreview ? (
              <div className="logo-preview-container">
                <div className="logo-preview">
                  <img src={logoPreview} alt="Logo preview" className="logo-preview-image" />
                </div>
                <button
                  type="button"
                  className="secondary-action compact-action"
                  onClick={() => handleLogoFileChange(null)}
                  disabled={loading}
                >
                  <Trash2 size={16} />
                  Cancel Upload
                </button>
              </div>
            ) : formData.logo_url ? (
              <div className="logo-preview-container">
                <div className="logo-preview">
                  <img src={formData.logo_url} alt="Company logo" className="logo-preview-image" />
                </div>
                <button
                  type="button"
                  className="secondary-action compact-action"
                  onClick={handleDeleteLogo}
                  disabled={loading}
                >
                  <Trash2 size={16} />
                  Delete Current Logo
                </button>
              </div>
            ) : (
              <LogoUpload
                currentLogo={undefined}
                onLogoChange={handleLogoFileChange}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Color Fields (Hidden but included in FormData) */}
      <input type="hidden" name="primary_color" value={formData.primary_color || ''} />
      <input type="hidden" name="secondary_color" value={formData.secondary_color || ''} />

      {/* Success Message */}
      {success && (
        <div className="validation-message success-message" style={{ marginTop: '16px' }}>
          <span>✓ Company settings saved successfully</span>
        </div>
      )}

      {/* Form Actions */}
      <div className="form-actions" style={{ marginTop: '24px' }}>
        <button
          type="submit"
          className="primary-action"
          disabled={loading}
          aria-label="Save company settings"
        >
          {loading ? (
            <>
              <Loader size={17} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={17} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
