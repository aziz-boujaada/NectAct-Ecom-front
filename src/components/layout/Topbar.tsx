import React, { useState } from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { ChevronRight, Bell, Search, HelpCircle } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';
import { AlertsPanel } from '../notifications/AlertsPanel';

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

  return (
    <header className="erp-topbar">
      <div className="topbar-left">
        <div className="breadcrumbs">
          <span className="breadcrumb-item">{moduleLabel}</span>
          <ChevronRight size={14} />
          <span className="breadcrumb-item active">{viewLabel}</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className="search-bar-placeholder">
          <Search size={18} />
          <input type="text" placeholder="Global search..." disabled />
        </div>
        
        <div style={{ position: 'relative' }}>
          <button 
            className="icon-action-btn" 
            title="Notifications"
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
        
        <button className="icon-action-btn" title="Help">
          <HelpCircle size={20} />
        </button>

        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>
    </header>
  );
};
