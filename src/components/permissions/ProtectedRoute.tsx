import { usePermission } from '../../context/PermissionContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string | string[];
  permissionType?: 'any' | 'all';
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute component - renders children only if user has required permissions
 */
export function ProtectedRoute({
  children,
  requiredPermissions,
  permissionType = 'any',
  fallback = <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Access Denied</div>,
}: ProtectedRouteProps) {
  const { hasPermission, loading } = usePermission();

  // Show nothing while permissions are loading
  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;
  }

  let isAuthorized = true;

  if (requiredPermissions) {
    isAuthorized = hasPermission(requiredPermissions, permissionType);
  }
console.log("REQUIRED PERMISSIONS:", requiredPermissions);

  return isAuthorized ? <>{children}</> : <>{fallback}</>;
}

export default ProtectedRoute;
