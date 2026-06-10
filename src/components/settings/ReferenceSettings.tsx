import { AlertCircle, Loader, Play, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generateReference, type ReferenceDateFormat } from '../../api/references';
import { useCompanySettings } from '../../context/CompanySettingsContext';
import {
  normalizeReferencePrefix,
  referenceSettingsFromCompanySettings,
  validReferencePrefix,
  type ReferenceSettings as ReferenceSettingsValues,
} from '../../utils/referenceSettings';

type ReferenceKey = keyof ReferenceSettingsValues;

const FIELD_CONFIG: Array<{
  key: ReferenceKey;
  labelKey: string;
  previewKey: 'sale' | 'devis';
  dateFormat: ReferenceDateFormat;
}> = [
  {
    key: 'sale_reference_prefix',
    labelKey: 'referenceSettings.sale Prefix',
    previewKey: 'sale',
    dateFormat: 'YYYY',
  },
  {
    key: 'devis_reference_prefix',
    labelKey: 'referenceSettings.devis Prefix',
    previewKey: 'devis',
    dateFormat: 'YYYY',
  },

];

type PreviewState = Partial<Record<'sale' | 'devis', string>>;

export function ReferenceSettings() {
  const { t } = useTranslation('settings');
  const { companySettings, updateSetting } = useCompanySettings();
  const savedSettings = useMemo(
    () => referenceSettingsFromCompanySettings(companySettings),
    [companySettings],
  );
  const [formData, setFormData] = useState<ReferenceSettingsValues>(savedSettings);
  const [errors, setErrors] = useState<Partial<Record<ReferenceKey, string>>>({});
  const [previewReferences, setPreviewReferences] = useState<PreviewState>({});
  const [previewErrors, setPreviewErrors] = useState<Partial<Record<'sale' | 'devis' , string>>>({});
  const [previewLoading, setPreviewLoading] = useState<'sale' | 'devis' | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData(savedSettings);
  }, [savedSettings]);

  function validateField(value: string) {
    const normalized = normalizeReferencePrefix(value);
    if (!normalized) return t('referenceSettings.errors.required');
    if (!/^[A-Z0-9]+$/.test(normalized)) return t('referenceSettings.errors.alphanumeric');
    if (normalized.length > 8) return t('referenceSettings.errors.maxLength');
    return '';
  }

  function validateForm(nextData = formData) {
    const nextErrors: Partial<Record<ReferenceKey, string>> = {};

    FIELD_CONFIG.forEach(({ key }) => {
      const error = validateField(nextData[key]);
      if (error) {
        nextErrors[key] = error;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleChange(key: ReferenceKey, value: string) {
    const nextData = {
      ...formData,
      [key]: normalizeReferencePrefix(value),
    };
    setFormData(nextData);

    const error = validateField(value);
    setErrors((current) => {
      const nextErrors = { ...current };
      if (error) {
        nextErrors[key] = error;
      } else {
        delete nextErrors[key];
      }
      return nextErrors;
    });
    setSuccess(false);
  }

  function handleSave() {
    const normalized: ReferenceSettingsValues = {
      sale_reference_prefix: normalizeReferencePrefix(formData.sale_reference_prefix),
      devis_reference_prefix: normalizeReferencePrefix(formData.devis_reference_prefix),
      payment_reference_prefix: normalizeReferencePrefix(formData.payment_reference_prefix),
    };

    if (!validateForm(normalized)) return;

    updateSetting('sale_reference_prefix', normalized.sale_reference_prefix);
    updateSetting('devis_reference_prefix', normalized.devis_reference_prefix);
    updateSetting('payment_reference_prefix', normalized.payment_reference_prefix);
    setFormData(normalized);
    setSuccess(true);
    window.setTimeout(() => setSuccess(false), 3000);
  }

  async function handleGenerateTestReference(config: (typeof FIELD_CONFIG)[number]) {
    const prefix = normalizeReferencePrefix(formData[config.key]);
    const error = validateField(prefix);

    if (error) {
      setErrors((current) => ({ ...current, [config.key]: error }));
      return;
    }

    setPreviewLoading(config.previewKey);
    setPreviewErrors((current) => ({ ...current, [config.previewKey]: undefined }));

    try {
      const data = await generateReference({
        prefix,
        date_format: config.dateFormat,
      });
      setPreviewReferences((current) => ({
        ...current,
        [config.previewKey]: data?.reference || '',
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : t('referenceSettings.previewFailed');
      setPreviewErrors((current) => ({
        ...current,
        [config.previewKey]: message,
      }));
    } finally {
      setPreviewLoading(null);
    }
  }

  const hasChanges = FIELD_CONFIG.some(({ key }) => formData[key] !== savedSettings[key]);
  const hasErrors = FIELD_CONFIG.some(({ key }) => !validReferencePrefix(formData[key]) || errors[key]);

  return (
    <div className="reference-settings">
      <div className="validation-message warning-message">
        <AlertCircle size={18} />
        <span>{t('referenceSettings.Warning')}</span>
      </div>

      <div className="form-grid">
        {FIELD_CONFIG.map((config) => (
          <div className="form-section reference-prefix-field" key={config.key}>
            <label>
              {t(config.labelKey)}
              <span className="required-indicator">*</span>
            </label>
            <input
              type="text"
              value={formData[config.key]}
              onChange={(event) => handleChange(config.key, event.target.value)}
              maxLength={20}
              className={errors[config.key] ? 'field-error' : ''}
              aria-invalid={Boolean(errors[config.key])}
            />
            {errors[config.key] && <span className="field-error-text">{errors[config.key]}</span>}         
          </div>
        ))}
      </div>

      {success && (
        <div className="validation-message success-message">
          <span>{t('referenceSettings.success')}</span>
        </div>
      )}

      <div className="reference-settings-actions" style={{marginTop:"3rem"}}>
        <button
          
          type="button"
          className="primary-action"
          onClick={handleSave}
          disabled={!hasChanges || hasErrors}
        >
          <Save size={17} />
          {t('referenceSettings.save')}
        </button>
      </div>
    </div>
  );
}
