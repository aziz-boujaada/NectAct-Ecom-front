import React, { FormEvent } from 'react';
import { ProfileForm } from '../../components/dashboard/ProfileForm';
import { PasswordForm } from '../../components/dashboard/PasswordForm';
import { SubViewType } from '../../components/layout/Sidebar';
import { ProfileFormValues, PasswordFormValues, User } from '../../types';

interface ProfileModuleProps {
  activeView: SubViewType;
  user: User;
  profileForm: ProfileFormValues;
  passwordForm: PasswordFormValues;
  loading: boolean;
  onProfileChange: (form: ProfileFormValues) => void;
  onPasswordChange: (form: PasswordFormValues) => void;
  onProfileSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPasswordSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({
  activeView,
  user,
  profileForm,
  passwordForm,
  loading,
  onProfileChange,
  onPasswordChange,
  onProfileSubmit,
  onPasswordSubmit
}) => {
  return (
    <div className="fade-in forms-stack">
      {activeView === 'account' && (
        <ProfileForm
          form={profileForm}
          loading={loading}
          onChange={onProfileChange}
          onSubmit={onProfileSubmit}
          authUser={user}
        />
      )}
      {activeView === 'security' && (
        <PasswordForm
          form={passwordForm}
          loading={loading}
          onChange={onPasswordChange}
          onSubmit={onPasswordSubmit}
        />
      )}
    </div>
  );
};
