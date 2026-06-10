import { Building2, Palette, ReceiptText, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CompanySettingsForm } from './CompanySettingsForm';
import { AppearanceSettings } from './AppearanceSettings';
import { ReferenceSettings } from './ReferenceSettings';

type SettingsTab = 'company' | 'appearance' | 'references';

type SettingsPageProps = {
  activeView?: SettingsTab;
  onClose?: () => void;
};

export function SettingsPage({ activeView = 'company', onClose }: SettingsPageProps) {
  const { t } = useTranslation(['settings' , 'navigation']);
  const [activeTab, setActiveTab] = useState<SettingsTab>(activeView);

  useEffect(() => {
    setActiveTab(activeView);
  }, [activeView]);

  return (
    <div className="settings-workspace">
      <section className="admin-section settings-main-section">
        {/* Header */}
        <div className="settings-header">
          <div>
            <p className="eyebrow">{t('configuration')}</p>
            <h2>{t('title')}</h2>
            <p className="text-muted" style={{ marginTop: '4px' }}>
              {t('manage_settings')}
            </p>
          </div>
          {onClose && (
            <button
              className="secondary-action compact-action"
              onClick={onClose}
              type="button"
              aria-label={t('close')}
              style={{ marginTop: '0' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'company' ? 'active' : ''}`}
            onClick={() => setActiveTab('company')}
            type="button"
            aria-selected={activeTab === 'company'}
          >
            <Building2 size={18} />
            <span>{t('company')}</span>
          </button>
          <button
            className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
            type="button"
            aria-selected={activeTab === 'appearance'}
          >
            <Palette size={18} />
            <span>{t('appearance')}</span>
          </button>
          <button
            className={`settings-tab ${activeTab === 'references' ? 'active' : ''}`}
            onClick={() => setActiveTab('references')}
            type="button"
            aria-selected={activeTab === 'references'}
          >
            <ReceiptText size={18} />
            <span>{t('references')}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-content">
          {activeTab === 'company' && (
            <div className="tab-pane fade-in">
              <div className="settings-content-card">
                <div style={{ marginBottom: '24px' }}>
                  <h3>{t('company')}</h3>
                  <p className="text-muted" style={{ marginTop: '4px' }}>
                    {t('company_description')}
                  </p>
                </div>
                <CompanySettingsForm />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="tab-pane fade-in">
              <div className="settings-content-card">
                <div style={{ marginBottom: '24px' }}>
                  <h3>{t('appearance')}</h3>
                  <p className="text-muted" style={{ marginTop: '4px' }}>
                    {t('appearance_description')}
                  </p>
                </div>
                <AppearanceSettings />
              </div>
            </div>
          )}

          {activeTab === 'references' && (
            <div className="tab-pane fade-in">
              <div className="settings-content-card">
                <div style={{ marginBottom: '24px' }}>
                  <h3>{t('references')}</h3>
                </div>
                <ReferenceSettings />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
