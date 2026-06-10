import { FormEvent } from "react";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ProfileFormValues, UserRole } from "../../types";
import type { User } from "../../types";


type ProfileFormProps = {
  form: ProfileFormValues;
  onChange: (form: ProfileFormValues) => void;
  loading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  authUser: User;
  onShowTutorial?: () => void;
};

export function ProfileForm({
  form,
  loading,
  onChange,
  onSubmit,
  authUser,
  onShowTutorial,
}: ProfileFormProps) {
  const { t } = useTranslation("auth");

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>{t("profile.title")}</h2>
        {onShowTutorial && (
          <button 
            type="button" 
            className="secondary-action" 
            onClick={onShowTutorial}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <HelpCircle size={16} />
            {t("profile.replay_tutorial")}
          </button>
        )}
      </div>
      <label>
        {t("profile.name")}
        <input
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          required
        />
      </label>
      <label>
        {t("profile.email")}
        <input
          type="email"
          value={form.email}
          onChange={(event) => onChange({ ...form, email: event.target.value })}
          required
        />
      </label>

      {authUser?.role === 'admin' && (
        <label>
          {t("profile.role")}
          <select
            value={form.role}
            onChange={(event) =>
              onChange({
                ...form,
                role: event.target.value as ProfileFormValues["role"],
              })
            }
          >
            <option value="employee">{t("profile.roles.employee")}</option>
            <option value="admin">{t("profile.roles.admin")}</option>
          </select>
        </label>
      )}

      <button className="primary-action" disabled={loading} type="submit">
        {t("profile.save")}
      </button>
    </form>
  );
}
