import { FormEvent } from 'react';
import { AccountCard } from './AccountCard';
import { PasswordForm } from './PasswordForm';
import { ProfileForm } from './ProfileForm';
import type { PasswordFormValues, ProfileFormValues, User } from '../../types';

type DashboardProps = {
  user: User;
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

export function Dashboard({
  user,
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
  return (
    <div className="dashboard">
      <AccountCard user={user} loading={loading} onRefresh={onRefresh} onLogout={onLogout} />

      <div className="forms-stack">
        <ProfileForm form={profileForm} loading={loading} onChange={onProfileChange} onSubmit={onProfileSubmit} />
        <PasswordForm
          form={passwordForm}
          loading={loading}
          onChange={onPasswordChange}
          onSubmit={onPasswordSubmit}
        />
      </div>
    </div>
  );
}
