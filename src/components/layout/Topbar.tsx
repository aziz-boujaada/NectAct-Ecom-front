import React from 'react';
import { ThemeToggle } from '../ThemeToggle';
import { ChevronRight, Bell, Search, HelpCircle } from 'lucide-react';

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
        
        <button className="icon-action-btn" title="Notifications">
          <Bell size={20} />
        </button>
        
        <button className="icon-action-btn" title="Help">
          <HelpCircle size={20} />
        </button>

        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
      </div>
    </header>
  );
};
