import React from 'react';
import { usePermission } from '../../context/PermissionContext';

type PermissionButtonProps = {
  permission?: string | string[];
  type?: 'any' | 'all';
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
};

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  permission,
  type = 'any',
  children,
  className,
  onClick,
  disabled,
  style,
}) => {
  const { hasPermission, loading } = usePermission();

  // while loading permissions, hide actionable buttons to avoid flashes
  if (loading) return null;

  if (permission && !hasPermission(permission, type)) return null;

  return (
    <button className={className} onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  );
};

export default PermissionButton;
