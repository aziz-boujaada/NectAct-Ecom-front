import { RotateCcw, Save, Loader } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useCompanySettings } from '../../context/CompanySettingsContext';
import { DEFAULT_THEME } from '../../context/themeTypes';
import { getCompanySettings, updateCompanySettings, buildCompanySettingsFormData } from '../../api/companySettings';
import { ApiError } from '../../api/auth';

export function AppearanceSettings() {
  const { theme, updatePrimaryColor, updateSecondaryColor, resetTheme } = useTheme();
  const { companySettings, setCompanySettings } = useCompanySettings();
  const [primaryColor, setPrimaryColor] = useState(theme.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(theme.secondaryColor || theme.primaryColor);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false); // Set to false since we use context
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const secondaryInputRef = useRef<HTMLInputElement>(null);

  // Sync with context colors if they exist
  useEffect(() => {
    if ((companySettings as any).primary_color) {
      setPrimaryColor((companySettings as any).primary_color);
    }
    if ((companySettings as any).secondary_color) {
      setSecondaryColor((companySettings as any).secondary_color);
    }
  }, [companySettings]);

  const hasChanges =
    primaryColor !== (companySettings as any).primary_color || 
    secondaryColor !== ((companySettings as any).secondary_color || (companySettings as any).primary_color);

  const handlePrimaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setPrimaryColor(color);
    // Real-time preview
    updatePrimaryColor(color);
  };

  const handleSecondaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setSecondaryColor(color);
    updateSecondaryColor(color);
  };

  const handleSave = async () => {
    setLoading(true);
    setApiError(null);
    try {
      // Build FormData with colors and CURRENT company settings
      // We need to pass current company info because PUT might require them
      const formData = buildCompanySettingsFormData({
        ...companySettings,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });

      // Submit to API
      await updateCompanySettings(formData);
      
      // Refetch fresh settings
      const freshData = await getCompanySettings();
      if (freshData) {
        setCompanySettings(freshData as any);
        if (freshData.primary_color) updatePrimaryColor(freshData.primary_color);
        if (freshData.secondary_color) updateSecondaryColor(freshData.secondary_color);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError('Failed to save theme');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrimaryColor(DEFAULT_THEME.primaryColor);
    setSecondaryColor(DEFAULT_THEME.secondaryColor || DEFAULT_THEME.primaryColor);
    resetTheme();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="appearance-settings">
      {initialLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader size={24} className="animate-spin" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading theme settings...</p>
        </div>
      ) : (
        <>
          {/* API Error Alert */}
          {apiError && (
            <div className="validation-error" style={{ marginBottom: '16px' }}>
              {apiError}
            </div>
          )}

          {/* Color Picker Section */}
          <div className="color-picker-section">
        <div className="color-picker-grid">
          {/* Primary Color */}
          <div className="color-picker-item">
            <label className="color-picker-label">
              Primary Color
              <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>
            </label>
            <div className="color-picker-wrapper">
              <input
                ref={primaryInputRef}
                type="color"
                value={primaryColor}
                onChange={handlePrimaryColorChange}
                disabled={loading}
                className="color-input"
                aria-label="Choose primary color"
              />
              <div className="color-display">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => primaryInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      primaryInputRef.current?.click();
                    }
                  }}
                  title="Click to open color picker"
                />
                <div className="color-info">
                  <p className="color-name">Primary Color</p>
                  <p className="color-value">{primaryColor.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Color */}
          <div className="color-picker-item">
            <label className="color-picker-label">Secondary Color (Optional)</label>
            <div className="color-picker-wrapper">
              <input
                ref={secondaryInputRef}
                type="color"
                value={secondaryColor}
                onChange={handleSecondaryColorChange}
                disabled={loading}
                className="color-input"
                aria-label="Choose secondary color"
              />
              <div className="color-display">
                <div
                  className="color-swatch"
                  style={{ backgroundColor: secondaryColor }}
                  onClick={() => secondaryInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      secondaryInputRef.current?.click();
                    }
                  }}
                  title="Click to open color picker"
                />
                <div className="color-info">
                  <p className="color-name">Secondary Color</p>
                  <p className="color-value">{secondaryColor.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="theme-preview-section">
        <h4>Theme Preview</h4>
        <div className="theme-preview-grid">
          {/* Button Examples */}
          <div className="preview-card">
            <h5>Buttons</h5>
            <div style={{ display: 'grid', gap: '8px' }}>
              <button className="primary-action" disabled>
                Primary Button
              </button>
              <button className="secondary-action" disabled>
                Secondary Button
              </button>
            </div>
          </div>

          {/* Status Pills */}
          <div className="preview-card">
            <h5>Status Indicators</h5>
            <div style={{ display: 'grid', gap: '8px' }}>
              <span className="status-pill" style={{ width: 'fit-content' }}>
                Active Status
              </span>
              <span className="status-pill paid" style={{ width: 'fit-content' }}>
                Success
              </span>
            </div>
          </div>

          {/* Input Fields */}
          <div className="preview-card">
            <h5>Form Elements</h5>
            <input type="text" placeholder="Text input" disabled />
          </div>

          {/* Card Accent */}
          <div className="preview-card" style={{ borderLeft: `3px solid var(--primary)` }}>
            <h5>Card Accent</h5>
            <p className="text-muted">Left border uses primary color</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="validation-message success-message" style={{ marginTop: '16px' }}>
          <span>✓ Theme updated successfully</span>
        </div>
      )}

      {/* Actions */}
      <div className="appearance-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
        <button
          className="primary-action"
          onClick={handleSave}
          disabled={loading || !hasChanges}
          aria-label="Save theme settings"
        >
          {loading ? (
            <>
              <Loader size={17} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={17} />
              Save Theme
            </>
          )}
        </button>
        <button
          className="secondary-action"
          onClick={handleReset}
          disabled={loading}
          aria-label="Reset to default theme"
        >
          <RotateCcw size={17} />
          Reset to Default
        </button>
      </div>

      <p className="theme-note" style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Theme changes are applied in real-time to the entire application and saved automatically.
      </p>
        </>
      )}
    </div>
  );
}
