import { FormEvent } from 'react';
import { AuthTabs } from './AuthTabs';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import type { AuthMode, LoginFormValues, RegisterFormValues } from '../../types';

type AuthPanelProps = {
  mode: AuthMode;
  loginForm: LoginFormValues;
  registerForm: RegisterFormValues;
  loading: boolean;
  onModeChange: (mode: AuthMode) => void;
  onLoginChange: (form: LoginFormValues) => void;
  onRegisterChange: (form: RegisterFormValues) => void;
  onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRegisterSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AuthPanel({
  mode,
  loginForm,
  registerForm,
  loading,
  onModeChange,
  onLoginChange,
  onRegisterChange,
  onLoginSubmit,
  onRegisterSubmit,
}: AuthPanelProps) {
  return (
    <div className="auth-grid">
      <AuthTabs mode={mode} onChange={onModeChange} />

      {mode === 'login' ? (
        <LoginForm form={loginForm} loading={loading} onChange={onLoginChange} onSubmit={onLoginSubmit} />
      ) : (
        <RegisterForm
          form={registerForm}
          loading={loading}
          onChange={onRegisterChange}
          onSubmit={onRegisterSubmit}
        />
      )}
    </div>
  );
}
