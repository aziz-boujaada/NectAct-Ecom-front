import { FormEvent, useState } from 'react';
import { AccountCard } from './AccountCard';
import { AdminCatalog } from './AdminCatalog';
import { PasswordForm } from './PasswordForm';
import { ProfileForm } from './ProfileForm';
import { StatusMessage } from '../StatusMessage';
import type { PasswordFormValues, ProfileFormValues, Status, User } from '../../types';

type DashboardProps = {
  user: User;
  status: Status;
  profileForm: ProfileFormValues;
  passwordForm: PasswordFormValues;
  loading: boolean;
  onProfileChange: (form: ProfileFormValues) => void;
  onPasswordChange: (form: PasswordFormValues) => void;
  onProfileSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPasswordSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRefresh: () => void;
  onLogout: () => void;
};

export type TabOption = 'categories' | 'products' | 'purchases' | 'sales' | 'suppliers' | 'clients' | 'profile' | 'security';

export function Dashboard({
  user,
  status,
  profileForm,
  passwordForm,
  loading,
  onProfileChange,
  onPasswordChange,
  onProfileSubmit,
  onPasswordSubmit,
  onRefresh,
  onLogout,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabOption>('products');

  const showCatalog = ['categories', 'products', 'purchases', 'sales', 'suppliers', 'clients'].includes(activeTab);

  return (
    <div className="dashboard-layout">
      <AccountCard
        user={user}
        loading={loading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={onRefresh}
        onLogout={onLogout}
      />

      <div className="main-content-stack">
        <div style={{ position: 'absolute', top: 32, right: 40, zIndex: 50, minWidth: 300 }}>
          <StatusMessage status={status} />
        </div>

        {showCatalog && (
          <div className="fade-in">
            <AdminCatalog activeTab={activeTab as 'categories' | 'products' | 'purchases' | 'sales' | 'suppliers' | 'clients'} />
          </div>
        )}
        {activeTab === 'profile' && (
          <div className="fade-in forms-stack">
            <ProfileForm
              form={profileForm}
              loading={loading}
              onChange={onProfileChange}
              onSubmit={onProfileSubmit}
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
      </div>
    </div>
  );
}
