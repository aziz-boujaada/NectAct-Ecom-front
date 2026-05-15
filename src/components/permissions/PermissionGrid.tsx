import { useEffect, useMemo, useState } from 'react';
import { getPermissions } from '../../api/permissions/roles';
import type { Permission } from '../../types/permissions';

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
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load permissions'
      );
    } finally {
      setLoading(false);
    }
  }

  // Auto assign all view permissions by default
  useEffect(() => {
    if (!permissions.length || !onChange) return;

    const defaultViewPermissions = permissions
      .filter((permission) =>
        permission.name.startsWith('view_')
      )
      .map((permission) => permission.id);

    const merged = [
      ...new Set([
        ...selectedPermissions,
        ...defaultViewPermissions,
      ]),
    ];

    if (
      merged.length !== selectedPermissions.length
    ) {
      onChange(merged);
    }
  }, [permissions]);

  function formatText(text: string) {
    return text
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function handleToggle(permission: Permission) {
    if (disabled) return;

    const isSelected = selectedPermissions.includes(
      permission.id
    );

    const isViewPermission =
      permission.name.startsWith('view_');

    // Prevent removing default view permissions
    if (isViewPermission && isSelected) {
      return;
    }

    let updatedPermissions: number[] = [];

    // REMOVE
    if (isSelected) {
      updatedPermissions = selectedPermissions.filter(
        (id) => id !== permission.id
      );
    }

    // ADD
    else {
      updatedPermissions = [
        ...selectedPermissions,
        permission.id,
      ];

      // Auto add related view permission
      const parts = permission.name.split('_');

      const entity = parts.slice(1).join('_');

      const viewPermission = permissions.find(
        (p) => p.name === `view_${entity}`
      );

      if (
        viewPermission &&
        !updatedPermissions.includes(viewPermission.id)
      ) {
        updatedPermissions.push(viewPermission.id);
      }
    }

    onChange?.([...new Set(updatedPermissions)]);
  }

  // Group permissions by entity
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, permission) => {
      const parts = permission.name.split('_');

      const entity =
        parts.slice(1).join('_') || 'general';

      if (!acc[entity]) {
        acc[entity] = [];
      }

      acc[entity].push(permission);

      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  if (loading) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
      >
        Loading permissions...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '20px',
          color: 'var(--error-color)',
        }}
      >
        Error: {error}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
      }}
    >
      {Object.entries(groupedPermissions).map(
        ([entity, perms]) => {
          const allSelected = perms.every((p) =>
            selectedPermissions.includes(p.id)
          );

          return (
            <div
              key={entity}
              style={{
                border:
                  '1px solid var(--glass-border)',
                borderRadius: '18px',
                padding: '18px',
                background: 'var(--panel-bg)',
                backdropFilter: 'blur(10px)',
                boxShadow:
                  '0 4px 20px rgba(0,0,0,0.05)',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  marginBottom: '18px',
                  paddingBottom: '12px',
                  borderBottom:
                    '1px solid var(--glass-border)',
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: '700',
                      color:
                        'var(--text-primary)',
                    }}
                  >
                    {formatText(entity)}
                  </h3>

                  <div
                    style={{
                      marginTop: '4px',
                      fontSize: '0.75rem',
                      color:
                        'var(--text-muted)',
                    }}
                  >
                    {perms.length} permissions
                  </div>
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => {
                      const ids = perms.map(
                        (p) => p.id
                      );

                      // UNSELECT ALL
                      if (allSelected) {
                        const remaining =
                          selectedPermissions.filter(
                            (id) => {
                              const permission =
                                permissions.find(
                                  (p) =>
                                    p.id === id
                                );

                              // Keep view permissions
                              if (
                                permission?.name.startsWith(
                                  'view_'
                                )
                              ) {
                                return true;
                              }

                              return !ids.includes(
                                id
                              );
                            }
                          );

                        onChange?.(remaining);

                        return;
                      }

                      // SELECT ALL
                      const merged = [
                        ...new Set([
                          ...selectedPermissions,
                          ...ids,
                        ]),
                      ];

                      perms.forEach(
                        (permission) => {
                          const parts =
                            permission.name.split(
                              '_'
                            );

                          const entity =
                            parts
                              .slice(1)
                              .join('_');

                          const viewPermission =
                            permissions.find(
                              (p) =>
                                p.name ===
                                `view_${entity}`
                            );

                          if (
                            viewPermission &&
                            !merged.includes(
                              viewPermission.id
                            )
                          ) {
                            merged.push(
                              viewPermission.id
                            );
                          }
                        }
                      );

                      onChange?.(merged);
                    }}
                    style={{
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      background:
                        'rgba(99,102,241,0.1)',
                      color: '#6366f1',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    {allSelected
                      ? 'Unselect All'
                      : 'Select All'}
                  </button>
                )}
              </div>

              {/* Permissions Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(2, minmax(0,1fr))',
                  gap: '12px',
                }}
              >
                {perms.map((permission) => {
                  const checked =
                    selectedPermissions.includes(
                      permission.id
                    );

                  const isViewPermission =
                    permission.name.startsWith(
                      'view_'
                    );

                  return (
                    <label
                      key={permission.id}
                      style={{
                        display: 'flex',
                        alignItems:
                          'flex-start',
                        gap: '10px',
                        padding: '14px',
                        border: checked
                          ? '1px solid rgba(99,102,241,0.4)'
                          : '1px solid var(--glass-border)',
                        borderRadius: '14px',
                        background: checked
                          ? 'rgba(99,102,241,0.08)'
                          : 'var(--field-bg)',
                        cursor:
                          disabled ||
                          isViewPermission
                            ? 'not-allowed'
                            : 'pointer',
                        opacity: disabled
                          ? 0.6
                          : 1,
                        transition:
                          'all 0.2s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          handleToggle(
                            permission
                          )
                        }
                        disabled={
                          disabled ||
                          isViewPermission
                        }
                        style={{
                          marginTop: '2px',
                          width: '16px',
                          height: '16px',
                          cursor:
                            disabled ||
                            isViewPermission
                              ? 'not-allowed'
                              : 'pointer',
                        }}
                      />

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: '600',
                            fontSize:
                              '0.85rem',
                            color:
                              'var(--text-primary)',
                            marginBottom:
                              '4px',
                          }}
                        >
                          {formatText(
                            permission.name
                          )}
                        </div>

                        {permission.description && (
                          <div
                            style={{
                              fontSize:
                                '0.72rem',
                              lineHeight: '1.4',
                              color:
                                'var(--text-muted)',
                            }}
                          >
                            {
                              permission.description
                            }
                          </div>
                        )}

                        {isViewPermission && (
                          <div
                            style={{
                              marginTop:
                                '6px',
                              fontSize:
                                '0.68rem',
                              color: '#6366f1',
                              fontWeight:
                                '600',
                            }}
                          >
                            Default Permission
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        }
      )}
    </div>
  );
}