import React from 'react';
import { Sidebar, ModuleType, SubViewType } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { User } from '../types';

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

const moduleLabels: Record<ModuleType, string> = {
  dashboard: 'Dashboard',
  inventory: 'Master Data',
  sales: 'Sales & CRM',
  purchasing: 'Purchasing',
  admin: 'Administration',
  profile: 'My Account',
  reports: 'Reports'
};

const viewLabels: Record<SubViewType, string> = {
  overview: 'Overview',
  products: 'Products',
  categories: 'Categories',
  stock: 'Stock History',
  'sales-list': 'Orders',
  clients: 'Clients',
  refunds: 'Refunds',
  'purchases-list': 'Purchase Orders',
  suppliers: 'Suppliers',
  users: 'User Management',
  permissions: 'Roles & Permissions',
  account: 'Profile Settings',
  security: 'Security',
  financials: 'Financial Reports',
  'inventory-report': 'Inventory Reports'
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
          moduleLabel={moduleLabels[activeModule]}
          viewLabel={viewLabels[activeView]}
        />
        
        <div className="erp-content-scroll">
          {children}
        </div>
      </main>
    </div>
  );
};
