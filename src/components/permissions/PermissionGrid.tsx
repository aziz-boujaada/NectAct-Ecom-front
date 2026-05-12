import { useEffect, useState } from 'react';
import { getPermissions } from '../../api/permissions/roles';
import type { Permission, PermissionCategory } from '../../types/permissions';

interface PermissionGridProps {
  selectedPermissions?: number[];
  onChange?: (permissionIds: number[]) => void;
  disabled?: boolean;
}

export function PermissionGrid({
  selectedPermissions = [],
  onChange,
  disabled = false,
}: PermissionGridProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPermissions();
  }, []);

  async function loadPermissions() {
    try {
      setLoading(true);
      const data = await getPermissions();
      setPermissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }

  function handleToggle(permId: number) {
    if (disabled) return;
    const newSelected = selectedPermissions.includes(permId)
      ? selectedPermissions.filter((id) => id !== permId)
      : [...selectedPermissions, permId];
    onChange?.(newSelected);
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading permissions...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'var(--error-color)' }}>Error: {error}</div>;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '12px',
    }}>
      {permissions.map((permission) => (
        <label
          key={permission.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--field-bg)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              (e.currentTarget as HTMLElement).style.background = 'var(--panel-bg)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99, 102, 241, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--field-bg)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--glass-border)';
          }}
        >
          <input
            type="checkbox"
            checked={selectedPermissions.includes(permission.id)}
            onChange={() => handleToggle(permission.id)}
            disabled={disabled}
            style={{ marginRight: '8px', cursor: disabled ? 'not-allowed' : 'pointer' }}
          />
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '2px' }}>
              {permission.name}
            </div>
            {permission.description && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {permission.description}
              </div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}
