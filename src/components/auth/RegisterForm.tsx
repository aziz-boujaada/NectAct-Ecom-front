import { FormEvent } from 'react';
import { UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RegisterFormValues } from '../../types';

type RegisterFormProps = {
  form: RegisterFormValues;
  loading: boolean;
  onChange: (form: RegisterFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function RegisterForm({ form, loading, onChange, onSubmit }: RegisterFormProps) {
  const { t } = useTranslation('auth');

  return (
    <form onSubmit={onSubmit}>
      <label>
        {t('name')}
        <input
          autoComplete="name"
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          minLength={3}
          required
        />
      </label>
      <label>
        {t('email')}
        <input
          autoComplete="email"
          type="email"
          value={form.email}
          onChange={(event) => onChange({ ...form, email: event.target.value })}
          required
        />
      </label>
      <label>
        {t('password')}
        <input
          autoComplete="new-password"
          type="password"
          value={form.password}
          onChange={(event) => onChange({ ...form, password: event.target.value })}
          minLength={8}
          required
        />
      </label>
      <button className="primary-action" disabled={loading} type="submit">
        <UserPlus size={18} aria-hidden="true" />
        {loading ? t('common:loading') : t('sign_up')}
      </button>
    </form>
  );
}
