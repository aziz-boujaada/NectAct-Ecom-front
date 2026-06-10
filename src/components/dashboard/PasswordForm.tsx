import { FormEvent } from 'react';
import { useTranslation } from "react-i18next";
import type { PasswordFormValues } from '../../types';

type PasswordFormProps = {
  form: PasswordFormValues;
  loading: boolean;
  onChange: (form: PasswordFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function PasswordForm({ form, loading, onChange, onSubmit }: PasswordFormProps) {
  const { t } = useTranslation("auth");

  return (
    <form onSubmit={onSubmit}>
      <h2>{t("password_form.title")}</h2>
      <label>
        {t("password_form.current")}
        <input
          autoComplete="current-password"
          type="password"
          value={form.current_password}
          onChange={(event) => onChange({ ...form, current_password: event.target.value })}
          required
        />
      </label>
      <label>
        {t("password_form.new")}
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
        {t("password_form.confirm")}
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
        {t("password_form.update")}
      </button>
    </form>
  );
}
