import React, { createContext, useContext, useEffect, useState } from 'react';
import { getPermissions } from '../api/permissions/roles';
import type { Permission } from '../types/permissions';
import type { User } from '../types';

interface PermissionContextType {
  permissions: Permission[];
  userPermissions: string[];
  loading: boolean;
  error: string | null;
  hasPermission: (permission: string | string[], type?: 'any' | 'all') => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: React.ReactNode;
  user?: User | null;
}

export function PermissionProvider({ children, user }: PermissionProviderProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load permissions when user changes
  useEffect(() => {
    if (!user) {
      setUserPermissions([]);
      return;
    }

    if (user.permissions) {
      const permKeys = normalizePermissions(user.permissions);
      setUserPermissions(permKeys);
    } else {
      loadPermissions();
    }
  }, [user]);

  function normalizePermissions(perms: Permission[]): string[] {
    return [
      ...new Set(
        perms.flatMap((p) =>
          [p.name, p.slug]
            .filter(Boolean)
            .map((v) =>
              v.toLowerCase().trim().replace(/\s+/g, '_').replace(/-/g, '_')
            )
        )
      ),
    ];
  }

  async function loadPermissions() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // If user.permissions was not provided, try fetching (fallback)
      const permsData = await getPermissions();
      setPermissions(permsData);

      // If we are an employee, we shouldn't necessarily have ALL permissions from /permissions
      // but if the backend returns only OUR permissions there, it works.
      // If it returns ALL, then this logic might be too permissive for employees.
      // However, keeping existing behavior for fetch but prioritizing user.permissions.
      setUserPermissions(normalizePermissions(permsData));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
      setUserPermissions(['view_products', 'view_clients', 'view_suppliers']);
    } finally {
      setLoading(false);
    }
  }

  function hasPermission(
    permission: string | string[],
    type: 'any' | 'all' = 'any'
  ): boolean {
    if (!user) return false;

    if (user.role === 'admin') {
      return true;
    }

    if (!userPermissions.length) return false;

    const perms = Array.isArray(permission) ? permission : [permission];
    const normalizedUserPerms = userPermissions.map(p => p.toLowerCase().trim());
    const normalizedReq = perms.map(p => p.toLowerCase().trim().replace(/\s+/g, '_').replace(/-/g, '_'));

    if (type === 'all') {
      return normalizedReq.every(p => normalizedUserPerms.includes(p));
    }

    return normalizedReq.some(p => normalizedUserPerms.includes(p));
  }

  const value: PermissionContextType = {
    permissions,
    userPermissions,
    loading,
    error,
    hasPermission,
    refreshPermissions: loadPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

/**
 * Helper component for conditional rendering based on permissions
 */
export function Can({
  permission,
  children,
  fallback = null,
  type = 'any'
}: {
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  type?: 'any' | 'all';
}) {
  const { hasPermission, loading } = usePermission();
  
  if (loading) return null;
  
  return hasPermission(permission, type) ? <>{children}</> : <>{fallback}</>;
}

export function usePermission() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
}