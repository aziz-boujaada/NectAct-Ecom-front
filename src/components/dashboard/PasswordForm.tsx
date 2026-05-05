import { FormEvent } from 'react';
import type { PasswordFormValues } from '../../types';

type PasswordFormProps = {
  form: PasswordFormValues;
  loading: boolean;
  onChange: (form: PasswordFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function PasswordForm({ form, loading, onChange, onSubmit }: PasswordFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <h2>Password</h2>
      <label>
        Current password
        <input
          autoComplete="current-password"
          type="password"
          value={form.current_password}
          onChange={(event) => onChange({ ...form, current_password: event.target.value })}
          required
        />
      </label>
      <label>
        New password
        <input
          autoComplete="new-password"
          type="password"
          value={form.password}
          onChange={(event) => onChange({ ...form, password: event.target.value })}
          minLength={8}
          required
        />
      </label>
      <label>
        Confirm new password
        <input
          autoComplete="new-password"
          type="password"
          value={form.password_confirmation}
          onChange={(event) => onChange({ ...form, password_confirmation: event.target.value })}
          minLength={8}
          required
        />
      </label>
      <button className="primary-action" disabled={loading} type="submit">
        Update password
      </button>
    </form>
  );
}
