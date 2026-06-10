import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import type { CompanySettings } from './themeTypes';
import { COMPANY_SETTINGS_STORAGE_KEY } from './themeTypes';
import { getCompanySettings } from '../api/companySettings';
import { useTheme } from './ThemeContext';

type CompanySettingsContextType = {
  companySettings: CompanySettings;
  setCompanySettings: (settings: CompanySettings) => void;
  updateSetting: <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => void;
};

const CompanySettingsContext = createContext<CompanySettingsContextType | undefined>(undefined);

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  company_name: 'NectAct',
  company_email: 'info@nectact.com',
  company_phone: '+1 (555) 000-0000',
  company_address: '123 Business Street',
  sale_reference_prefix: 'FAC',
  devis_reference_prefix: 'DEV',
  payment_reference_prefix: 'PAY',
};

function withReferenceDefaults(settings: Partial<CompanySettings>): CompanySettings {
  return {
    ...DEFAULT_COMPANY_SETTINGS,
    ...settings,
    sale_reference_prefix: settings.sale_reference_prefix || DEFAULT_COMPANY_SETTINGS.sale_reference_prefix,
    devis_reference_prefix: settings.devis_reference_prefix || DEFAULT_COMPANY_SETTINGS.devis_reference_prefix,
    payment_reference_prefix: settings.payment_reference_prefix || DEFAULT_COMPANY_SETTINGS.payment_reference_prefix,
  };
}

function loadCompanySettingsFromStorage(): CompanySettings {
  try {
    const stored = localStorage.getItem(COMPANY_SETTINGS_STORAGE_KEY);
    return stored ? withReferenceDefaults(JSON.parse(stored)) : DEFAULT_COMPANY_SETTINGS;
  } catch {
    return DEFAULT_COMPANY_SETTINGS;
  }
}

function saveCompanySettingsToStorage(settings: CompanySettings) {
  try {
    localStorage.setItem(COMPANY_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save company settings to storage:', error);
  }
}

type CompanySettingsProviderProps = {
  children: ReactNode;
};

export function CompanySettingsProvider({ children }: CompanySettingsProviderProps) {
  const [companySettings, setCompanySettingsState] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);
  const { updatePrimaryColor, updateSecondaryColor } = useTheme();

  useEffect(() => {
    const saved = loadCompanySettingsFromStorage();
    setCompanySettingsState(saved);

    // Fetch latest settings from API and apply them globally
    async function fetchAndApply() {
      try {
        const data = await getCompanySettings();
        if (data) {
          const merged = withReferenceDefaults({ ...saved, ...data });
          setCompanySettingsState(merged);
          saveCompanySettingsToStorage(merged);

          // Update document title
          if (data.company_name) {
            document.title = `${data.company_name} - ERP`;
          }

          // Apply theme colors if returned
          if (data.primary_color) {
            updatePrimaryColor(data.primary_color);
          }
          if (data.secondary_color) {
            updateSecondaryColor(data.secondary_color);
          }
        }
      } catch (err) {
        // ignore network/auth errors; keep local storage defaults
      }
    }

    fetchAndApply();
  }, []);

  const setCompanySettings = useCallback((settings: CompanySettings) => {
    const nextSettings = withReferenceDefaults(settings);
    setCompanySettingsState(nextSettings);
    saveCompanySettingsToStorage(nextSettings);
    if (nextSettings.company_name) {
      document.title = `${nextSettings.company_name} - ERP`;
    }
  }, []);

  const updateSetting = useCallback(<K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => {
    setCompanySettingsState(prev => {
      const updated = { ...prev, [key]: value };
      saveCompanySettingsToStorage(updated);
      return updated;
    });
  }, []);

  const value = useMemo(() => ({
    companySettings,
    setCompanySettings,
    updateSetting
  }), [companySettings, setCompanySettings, updateSetting]);

  return (
    <CompanySettingsContext.Provider value={value}>
      {children}
    </CompanySettingsContext.Provider>
  );
}

export function useCompanySettings(): CompanySettingsContextType {
  const context = useContext(CompanySettingsContext);
  if (context === undefined) {
    throw new Error('useCompanySettings must be used within a CompanySettingsProvider');
  }
  return context;
}
