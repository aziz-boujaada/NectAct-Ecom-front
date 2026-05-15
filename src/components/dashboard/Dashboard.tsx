import { FormEvent, useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { ModuleType, SubViewType } from '../layout/Sidebar';
import { DashboardStats } from './DashboardStats';
import { StatusMessage } from '../StatusMessage';
import { useAdminCatalog } from './useAdminCatalog';

// Module Imports
import { InventoryModule } from '../../modules/inventory/InventoryModule';
import { SalesModule } from '../../modules/sales/SalesModule';
import { PurchasingModule } from '../../modules/purchasing/PurchasingModule';
import { AdminModule } from '../../modules/admin/AdminModule';
import { ProfileModule } from '../../modules/profile/ProfileModule';
import { ReportsModule } from '../../modules/reports/ReportsModule';

import type { PasswordFormValues, ProfileFormValues, Status, User } from '../../types';

type DashboardProps = {
  user: User;
  status: Status;
  profileForm: ProfileFormValues;
  passwordForm: PasswordFormValues;
  loading: boolean;
  theme: 'dark' | 'light';
  onProfileChange: (form: ProfileFormValues) => void;
  onPasswordChange: (form: PasswordFormValues) => void;
  onProfileSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPasswordSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onLogout: () => void;
  onThemeToggle: () => void;
};

export function Dashboard({
  user,
  status,
  profileForm,
  passwordForm,
  loading: authLoading,
  theme,
  onProfileChange,
  onPasswordChange,
  onProfileSubmit,
  onPasswordSubmit,
  onLogout,
  onThemeToggle,
}: DashboardProps) {
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');
  const [activeView, setActiveView] = useState<SubViewType>('overview');
  
  const catalog = useAdminCatalog();

  const handleViewChange = (module: ModuleType, view: SubViewType) => {
    setActiveModule(module);
    setActiveView(view);
  };

  // Compatibility handler for components that call onTabChange
  const handleLegacyTabChange = (tab: string) => {
    const mapping: Record<string, { module: ModuleType; view: SubViewType }> = {
      overview: { module: 'dashboard', view: 'overview' },
      products: { module: 'inventory', view: 'products' },
      categories: { module: 'inventory', view: 'categories' },
      stock: { module: 'inventory', view: 'stock' },
      sales: { module: 'sales', view: 'sales-list' },
      clients: { module: 'sales', view: 'clients' },
      refunds: { module: 'sales', view: 'refunds' },
      purchases: { module: 'purchasing', view: 'purchases-list' },
      suppliers: { module: 'purchasing', view: 'suppliers' },
      users: { module: 'admin', view: 'users' },
      permissions: { module: 'admin', view: 'permissions' },
      profile: { module: 'profile', view: 'account' },
      security: { module: 'profile', view: 'security' },
      financials: { module: 'reports', view: 'financials' },
      'inventory-report': { module: 'reports', view: 'inventory-report' },
      'sales-report': { module: 'reports', view: 'sales-report' },
      'purchasing-report': { module: 'reports', view: 'purchasing-report' },
    };

    const target = mapping[tab];
    if (target) {
      setActiveModule(target.module);
      setActiveView(target.view);
    }
  };

  return (
    <MainLayout
      user={user}
      activeModule={activeModule}
      activeView={activeView}
      onViewChange={handleViewChange}
      onLogout={onLogout}
      theme={theme}
      onThemeToggle={onThemeToggle}
    >
      <div style={{ position: 'fixed', top: 32, right: 40, zIndex: 1000, minWidth: 300 }}>
        <StatusMessage status={status || catalog.status} />
      </div>

      {activeModule === 'dashboard' && activeView === 'overview' && (
        <div className="fade-in">
          <DashboardStats />
        </div>
      )}

      {activeModule === 'inventory' && (
        <InventoryModule 
          activeView={activeView} 
          catalog={catalog} 
          onTabChange={handleLegacyTabChange} 
        />
      )}

      {activeModule === 'sales' && (
        <SalesModule 
          activeView={activeView} 
          catalog={catalog} 
          onTabChange={handleLegacyTabChange} 
        />
      )}

      {activeModule === 'purchasing' && (
        <PurchasingModule 
          activeView={activeView} 
          catalog={catalog} 
          onTabChange={handleLegacyTabChange} 
        />
      )}

      {activeModule === 'admin' && (
        <AdminModule activeView={activeView} />
      )}

      {activeModule === 'profile' && (
        <ProfileModule
          activeView={activeView}
          user={user}
          profileForm={profileForm}
          passwordForm={passwordForm}
          loading={authLoading}
          onProfileChange={onProfileChange}
          onPasswordChange={onPasswordChange}
          onProfileSubmit={onProfileSubmit}
          onPasswordSubmit={onPasswordSubmit}
        />
      )}

      {activeModule === 'reports' && (
        <ReportsModule activeView={activeView} />
      )}
    </MainLayout>
  );
}
