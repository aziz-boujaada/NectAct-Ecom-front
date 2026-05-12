import { FormEvent, useState } from 'react';
import { AccountCard } from './AccountCard';
import { AdminCatalog } from './AdminCatalog';
import { DashboardStats } from './DashboardStats';
import { PasswordForm } from './PasswordForm';
import { ProfileForm } from './ProfileForm';
import { StatusMessage } from '../StatusMessage';
import { UsersManager, PermissionsManager } from '../permissions';
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

export type TabOption =
  | 'overview'
  | 'categories'
  | 'products'
  | 'purchases'
  | 'sales'
  | 'refunds'
  | 'suppliers'
  | 'clients'
  | 'stock'
  | 'profile'
  | 'security'
  | 'users'
  | 'permissions';

export function Dashboard({
  user,
  status,
  profileForm,
  passwordForm,
  loading,
  theme,
  onProfileChange,
  onPasswordChange,
  onProfileSubmit,
  onPasswordSubmit,

  onLogout,
  onThemeToggle,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabOption>('overview');

  const showCatalog = ['categories', 'products', 'purchases', 'sales', 'refunds', 'suppliers', 'clients', 'stock'].includes(activeTab);
  const showAdmin = ['users', 'permissions'].includes(activeTab);

  return (
    <div className="dashboard-layout">
      <AccountCard
        user={user}
        loading={loading}
        activeTab={activeTab}
        theme={theme}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        onThemeToggle={onThemeToggle}
      />

      <div className="main-content-stack">
        <div style={{ position: 'absolute', top: 32, right: 40, zIndex: 50, minWidth: 300 }}>
          <StatusMessage status={status} />
        </div>

        {activeTab === 'overview' && (
          <div className="fade-in">
            <DashboardStats />
          </div>
        )}

        {showCatalog && (
          <div className="fade-in">
            <AdminCatalog activeTab={activeTab as 'categories' | 'products' | 'purchases' | 'sales' | 'refunds' | 'suppliers' | 'clients' | 'stock'} onTabChange={setActiveTab} />
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="fade-in forms-stack">
            <ProfileForm
              form={profileForm}
              loading={loading}
              onChange={onProfileChange}
              onSubmit={onProfileSubmit}
              authUser={user}
            />
          </div>
        )}
        {activeTab === 'security' && (
          <div className="fade-in forms-stack">
            <PasswordForm
              form={passwordForm}
              loading={loading}
              onChange={onPasswordChange}
              onSubmit={onPasswordSubmit}
            />
          </div>
        )}
        {showAdmin && (
          <div className="fade-in">
            {activeTab === 'users' && <UsersManager />}
            {activeTab === 'permissions' && <PermissionsManager />}
          </div>
        )}
      </div>
    </div>
  );
}
