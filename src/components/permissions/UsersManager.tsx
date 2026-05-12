import { useEffect, useState } from "react";
import { Edit3, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useUsers } from "../../hooks/permissions/useUsers";
import { usePermission } from "../../context/PermissionContext";
import { PermissionGrid } from "./PermissionGrid";
import type { User } from "../../types/permissions";
import { ProtectedRoute } from "./ProtectedRoute";
import type { ProfileFormValues } from "../../types";
interface UserFormState {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role? : string
}

const initialFormState: UserFormState = {
  name: "",
  email: "",
  password: "",
  role : "" ,

  
};

export function UsersManager() {
  const {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    editUser,
    removeUser,
    assignPermissions,
  } = useUsers();
  const { hasPermission } = usePermission();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserFormState>(initialFormState);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function handleAddClick() {
    setEditingUser(null);
    setForm(initialFormState);
    setSelectedPermissions([]);
    setShowForm(true);
    setMessage(null);
  }

  function handleEditClick(user: User) {
    setEditingUser(user);
    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      role : user.role
    });
    setSelectedPermissions(user.permissions?.map((p) => p.id) || []);
    setShowForm(true);
    setMessage(null);
  }

  async function handleDeleteClick(userId: number) {
    if (!hasPermission("delete_users")) {
      setMessage({
        type: "error",
        text: "You do not have permission to delete users",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      setSubmitting(true);
      await removeUser(userId);
      setMessage({ type: "success", text: "User deleted successfully" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to delete user",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const userData = {
        name: form.name,
        email: form.email,
        ...(form.password && { password: form.password }),
        role : form.role
      };

      if (editingUser) {
        if (!hasPermission("edit_users")) {
          setMessage({
            type: "error",
            text: "You do not have permission to edit users",
          });
          return;
        }
        await editUser(editingUser.id, userData);

        // Assign permissions if changed
        if (selectedPermissions.length > 0 || editingUser.permissions?.length) {
          await assignPermissions(editingUser.id, selectedPermissions);
        }

        setMessage({ type: "success", text: "User updated successfully" });
      } else {
        if (!hasPermission("create_users")) {
          setMessage({
            type: "error",
            text: "You do not have permission to create users",
          });
          return;
        }
        const newUser = await addUser(userData);

        // Assign permissions if selected
        if (selectedPermissions.length > 0) {
          await assignPermissions(newUser.id, selectedPermissions);
        }

        setMessage({ type: "success", text: "User created successfully" });
      }

      setShowForm(false);
      setForm(initialFormState);
      setSelectedPermissions([]);
      await fetchUsers();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Operation failed",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedRoute requiredPermissions="view_users">
      <section className="admin-section">
        <div className="section-heading">
          <div>
            <h3>Manage Employees</h3>
            <p>Create, edit, and manage employee accounts and permissions</p>
          </div>
          <button
            onClick={handleAddClick}
            className="primary-action"
            style={{ display: "flex", gap: "8px", alignItems: "center" }}
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>

        {message && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-sm)",
              marginBottom: "16px",
              background:
                message.type === "success"
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
              color:
                message.type === "success"
                  ? "var(--success-color)"
                  : "var(--error-color)",
              border: `1px solid ${message.type === "success" ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
            }}
          >
            {message.text}
          </div>
        )}

        {showForm ? (
          <form
            onSubmit={handleSubmit}
            style={{
              background: "var(--panel-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-md)",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h4
              style={{
                marginBottom: "16px",
                fontSize: "1rem",
                fontWeight: "600",
              }}
            >
              {editingUser ? "Edit Employee" : "Create New Employee"}
            </h4>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <label>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    marginBottom: "6px",
                    color: "var(--text-dark)",
                  }}
                >
                  Name
                </div>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., John Doe"
                  required
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--field-bg)",
                    color: "var(--text-main)",
                  }}
                />
              </label>

              <label>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    marginBottom: "6px",
                    color: "var(--text-dark)",
                  }}
                >
                  Email
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="e.g., john@example.com"
                  required
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--field-bg)",
                    color: "var(--text-main)",
                  }}
                />
              </label>
              <label>
                Role
                <select
                  value={form.role}
                  onChange={(e) =>
                   setForm((prev) => ({...prev , role: e.target.value as UserRole}))
                  }
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>

            <label style={{ display: "block", marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginBottom: "6px",
                  color: "var(--text-dark)",
                }}
              >
                Password {editingUser ? "(leave empty to keep current)" : ""}
              </div>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder={
                  editingUser
                    ? "Leave empty to keep current password"
                    : "Enter a strong password"
                }
                required={!editingUser}
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--field-bg)",
                  color: "var(--text-main)",
                }}
              />
            </label>

            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginBottom: "12px",
                  color: "var(--text-dark)",
                }}
              >
                Assign Permissions
              </div>
              <PermissionGrid
                selectedPermissions={selectedPermissions}
                onChange={setSelectedPermissions}
                disabled={submitting}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(initialFormState);
                  setSelectedPermissions([]);
                }}
                disabled={submitting}
                className="secondary-action"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-action"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : editingUser
                    ? "Update Employee"
                    : "Create Employee"}
              </button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "var(--text-muted)",
            }}
          >
            Loading employees...
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No employees found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "4px",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          {user.permissions && user.permissions.length > 0 ? (
                            <>
                              {user.permissions.slice(0, 2).map((perm) => (
                                <span
                                  key={perm.id}
                                  style={{
                                    fontSize: "0.75rem",
                                    padding: "4px 8px",
                                    background: "rgba(99, 102, 241, 0.1)",
                                    border: "1px solid rgba(99, 102, 241, 0.2)",
                                    borderRadius: "4px",
                                    color: "var(--text-main)",
                                  }}
                                >
                                  {perm.name}
                                </span>
                              ))}
                              {user.permissions.length > 2 && (
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  +{user.permissions.length - 2}
                                </span>
                              )}
                            </>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>
                              No permissions
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleEditClick(user)}
                            disabled={submitting}
                            style={{
                              padding: "6px 12px",
                              background: "rgba(99, 102, 241, 0.1)",
                              border: "1px solid rgba(99, 102, 241, 0.2)",
                              borderRadius: "var(--radius-sm)",
                              color: "var(--text-main)",
                              cursor: "pointer",
                              display: "flex",
                              gap: "4px",
                              alignItems: "center",
                              fontSize: "0.875rem",
                              fontWeight: "500",
                            }}
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user.id)}
                            disabled={submitting}
                            style={{
                              padding: "6px 12px",
                              background: "rgba(239, 68, 68, 0.1)",
                              border: "1px solid rgba(239, 68, 68, 0.2)",
                              borderRadius: "var(--radius-sm)",
                              color: "var(--error-color)",
                              cursor: "pointer",
                              display: "flex",
                              gap: "4px",
                              alignItems: "center",
                              fontSize: "0.875rem",
                              fontWeight: "500",
                            }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </ProtectedRoute>
  );
}
