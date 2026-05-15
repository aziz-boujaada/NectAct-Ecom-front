import React, { createContext, useContext, useEffect, useState } from 'react';
import { getPermissions } from '../api/permissions/roles';
import type { Permission } from '../types/permissions';
import type { User } from '../types';

type PermissionLike =
  | Permission
  | string
  | {
      id?: number;
      name?: string;
      slug?: string;
      permission?: PermissionLike;
      permission_name?: string;
      permission_slug?: string;
    };

type UserWithPermissions = User & {
  permissions?: PermissionLike[];
  user_permissions?: PermissionLike[];
  role?: string;
};

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
  user?: UserWithPermissions | null;
}

export function PermissionProvider({ children, user }: PermissionProviderProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function normalizeKey(value: string): string {
    return value.toLowerCase().trim().replace(/\s+/g, '_').replace(/-/g, '_');
  }

  function extractPermissionKeys(rawPerms: PermissionLike[] | undefined): string[] {
    if (!rawPerms?.length) return [];

    const collected: string[] = [];

    for (const p of rawPerms) {
      if (!p) continue;

      if (typeof p === 'string') {
        collected.push(normalizeKey(p));
        continue;
      }

      const nested = (p as { permission?: PermissionLike }).permission;
      if (nested) {
        if (typeof nested === 'string') {
          collected.push(normalizeKey(nested));
        } else {
          if (nested.name) collected.push(normalizeKey(nested.name));
          if (nested.slug) collected.push(normalizeKey(nested.slug));
        }
      }

      if (p.name) collected.push(normalizeKey(p.name));
      if (p.slug) collected.push(normalizeKey(p.slug));

      const meta = p as { permission_name?: string; permission_slug?: string };
      if (meta.permission_name) collected.push(normalizeKey(meta.permission_name));
      if (meta.permission_slug) collected.push(normalizeKey(meta.permission_slug));
    }

    return [...new Set(collected)];
  }

  // Load permissions when user changes
  useEffect(() => {
    if (!user) {
      setPermissions([]);
      setUserPermissions([]);
      setError(null);
      return;
    }

    const directPerms = user.permissions ?? user.user_permissions;
    const permKeys = extractPermissionKeys(directPerms);

    if (permKeys.length > 0) {
      setUserPermissions(permKeys);
      setError(null);
    } else {
      // Fallback: fetch only the catalog for admin screens; do not grant permissions from it.
      loadPermissions();
    }
  }, [user]);

  async function loadPermissions() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // If user.permissions was not provided, try fetching (fallback)
      const permsData = await getPermissions();
      setPermissions(permsData);

      // Never infer current-user permissions from the global permissions catalog.
      setUserPermissions([]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
      setUserPermissions([]);
    } finally {
      setLoading(false);
    }
  }

  function hasPermission(
    permission: string | string[],
    type: 'any' | 'all' = 'any'
  ): boolean {
    if (!user) return false;

    if ((user.role ?? '').toLowerCase() === 'admin') {
      return true;
    }

    if (!userPermissions.length) return false;

    const perms = Array.isArray(permission) ? permission : [permission];
    const normalizedUserPerms = userPermissions.map((p) => normalizeKey(p));
    const normalizedReq = perms.map((p) => normalizeKey(p));

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