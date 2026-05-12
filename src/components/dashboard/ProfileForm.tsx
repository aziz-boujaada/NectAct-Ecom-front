import { FormEvent } from "react";
import type { ProfileFormValues, UserRole } from "../../types";
import type { User } from "../../types";


type ProfileFormProps = {
  form: ProfileFormValues;
  onChange: (form: ProfileFormValues) => void;
  loading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  authUser: User;
};

export function ProfileForm({
  form,
  loading,
  onChange,
  onSubmit,
  authUser,
}: ProfileFormProps) {
console.log(typeof(authUser))
  return (
    <form onSubmit={onSubmit}>
      <h2>Profile</h2>
      <label>
        Name
        <input
          value={form.name}
          onChange={(event) => onChange({ ...form, name: event.target.value })}
          required
        />
      </label>
      <label>
        Email
        <input
          type="email"
          value={form.email}
          onChange={(event) => onChange({ ...form, email: event.target.value })}
          required
        />
      </label>

      {authUser?.role === 'admin' && (
        <label>
          Role
          <select
            value={form.role}
            onChange={(event) =>
              onChange({
                ...form,
                role: event.target.value as ProfileFormValues["role"],
              })
            }
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      )}

      <button className="primary-action" disabled={loading} type="submit">
        Save profile
      </button>
    </form>
  );
}
