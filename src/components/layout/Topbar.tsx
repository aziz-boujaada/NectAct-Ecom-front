import React, { useState } from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { HelpCircle, Search, Bell, ChevronRight } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';
import { AlertsPanel } from '../notifications/AlertsPanel';
import { useCompanySettings } from '../../context/CompanySettingsContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface TopbarProps {
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  moduleLabel: string;
  viewLabel: string;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  theme, 
  onThemeToggle, 
  moduleLabel, 
  viewLabel 
}) => {
  const [isAlertsPanelOpen, setIsAlertsPanelOpen] = useState(false);
  const { alerts, unreadCount, refetch } = useAlerts();
  const { companySettings } = useCompanySettings();
  const { t } = useTranslation();

  return (
    <header className="erp-topbar">
      <div className="topbar-left">
        <div className="topbar-brand" style={{ marginRight: '12px', fontWeight: 700, color: 'var(--primary)' }}>
          {companySettings?.company_name || 'NextAct'}
        </div>
        <div className="breadcrumbs">
          <span className="breadcrumb-item">{moduleLabel}</span>
          <ChevronRight size={14} />
          <span className="breadcrumb-item active">{viewLabel}</span>
        </div>
      </div>

      <div className="topbar-right">
       
        <LanguageSwitcher />

        <div style={{ position: 'relative' }}>
          <button 
            className="icon-action-btn" 
            title={t('common.notifications')}
            onClick={() => setIsAlertsPanelOpen(!isAlertsPanelOpen)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>
          
          <AlertsPanel 
            alerts={alerts}
            isOpen={isAlertsPanelOpen}
            onClose={() => setIsAlertsPanelOpen(false)}
            unreadCount={unreadCount}
            onAlertRead={refetch}
          />
        </div>
        
        <button className="icon-action-btn" title={t('common.help')}>
          <HelpCircle size={20} />
        </button>

        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>
    </header>
  );
};
