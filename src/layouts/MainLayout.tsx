import React from 'react';
import { Sidebar, ModuleType, SubViewType } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { ChatApp } from '../components/chat/ChatApp';
import { User } from '../types';

import { useTranslation } from 'react-i18next';

interface MainLayoutProps {
  children: React.ReactNode;
  user: User;
  activeModule: ModuleType;
  activeView: SubViewType;
  onViewChange: (module: ModuleType, view: SubViewType) => void;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
}

const moduleLabelKeys: Record<ModuleType, string> = {
  dashboard: 'dashboard.title',
  inventory: 'inventory.title',
  sales: 'sales.title',
  purchasing: 'purchasing.title',
  devises: 'devises.title',
  payments: 'payments.title',
  admin: 'admin.title',
  profile: 'profile.title',
  reports: 'reports.title',
  ai: 'ai.title',
  settings: 'settings.title'
};

const viewLabelKeys: Record<SubViewType, string> = {
  overview: 'dashboard.overview',
  products: 'inventory.products',
  categories: 'inventory.categories',
  stock: 'inventory.stock',
  'sales-list': 'sales.list',
  clients: 'sales.clients',
  refunds: 'sales.refunds',
  'purchases-list': 'purchasing.list',
  suppliers: 'purchasing.suppliers',
  'devis-list': 'devises.list',
  payments: 'payments.list',
  users: 'admin.users',
  permissions: 'admin.permissions',
  account: 'profile.account',
  security: 'profile.security',
  financials: 'reports.financials',
  'inventory-report': 'reports.inventory',
  'sales-report': 'reports.sales',
  'purchasing-report': 'reports.purchasing',
  'devis-report': 'reports.devis',
  company: 'settings.company',
  appearance: 'settings.appearance',
  references: 'settings.references',
  chat: 'ai.chat'
};

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  user,
  activeModule,
  activeView,
  onViewChange,
  onLogout,
  theme,
  onThemeToggle
}) => {
  const { t } = useTranslation('navigation');

  return (
    <div className="erp-container">
      <Sidebar 
        activeModule={activeModule}
        activeView={activeView}
        onViewChange={onViewChange}
        onLogout={onLogout}
        userName={user.name}
        userRole={user.role || 'Employee'}
      />
      
      <main className="erp-main">
        <Topbar 
          theme={theme}
          onThemeToggle={onThemeToggle}
          moduleLabel={t(moduleLabelKeys[activeModule])}
          viewLabel={t(viewLabelKeys[activeView])}
        />
        
        <div className="erp-content-scroll">
          {children}
        </div>
      </main>
      <ChatApp />
    </div>
  );
};
