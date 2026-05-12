import { useEffect, useState } from 'react';
import { Lock, RefreshCw } from 'lucide-react';
import { getPermissions } from '../../api/permissions/roles';
import type { Permission } from '../../types/permissions';
import { ProtectedRoute } from './ProtectedRoute';

export function PermissionsManager() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  async function loadPermissions() {
    try {
      setLoading(true);
      setError(null);
      const data = await getPermissions();
      setPermissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute requiredPermissions="view_permissions">
      <section className="admin-section">
        <div className="section-heading">
          <div>
            <h3>Available Permissions</h3>
            <p>View all system permissions that can be assigned to employees</p>
          </div>
          <button onClick={loadPermissions} disabled={loading} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px', background: 'var(--panel-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-main)' }}>
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--error-color)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading permissions...
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {permissions.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                      No permissions found
                    </td>
                  </tr>
                ) : (
                  permissions.map((permission) => (
                    <tr key={permission.id}>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                          <strong>{permission.name}</strong>
                        </div>
                      </td>
                      <td>
                        <code style={{ background: 'var(--field-bg)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          {permission.slug}
                        </code>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {permission.description || '—'}
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
