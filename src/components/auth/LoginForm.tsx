import { FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import type { LoginFormValues } from '../../types';

type LoginFormProps = {
  form: LoginFormValues;
  loading: boolean;
  onChange: (form: LoginFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginForm({ form, loading, onChange, onSubmit }: LoginFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <label>
        Email
        <input
          autoComplete="email"
          type="email"
          value={form.email}
          onChange={(event) => onChange({ ...form, email: event.target.value })}
          required
        />
      </label>
      <label>
        Password
        <input
          autoComplete="current-password"
          type="password"
          value={form.password}
          onChange={(event) => onChange({ ...form, password: event.target.value })}
          required
        />
      </label>
      <button className="primary-action" disabled={loading} type="submit">
        <KeyRound size={18} aria-hidden="true" />
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
