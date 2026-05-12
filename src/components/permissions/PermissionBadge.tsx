import { Lock } from 'lucide-react';
import type { Permission } from '../../types/permissions';

interface PermissionBadgeProps {
  permission: Permission;
  selected?: boolean;
  onSelect?: (permission: Permission) => void;
  clickable?: boolean;
}

export function PermissionBadge({
  permission,
  selected = false,
  onSelect,
  clickable = false,
}: PermissionBadgeProps) {
  return (
    <div
      onClick={() => clickable && onSelect?.(permission)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '600',
        background: selected
          ? 'rgba(99, 102, 241, 0.15)'
          : 'rgba(99, 102, 241, 0.05)',
        border: `1px solid ${selected
          ? 'rgba(99, 102, 241, 0.3)'
          : 'rgba(99, 102, 241, 0.1)'
        }`,
        color: 'var(--text-main)',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'all var(--transition-fast)',
        whiteSpace: 'nowrap',
      }}
      title={permission.description}
    >
      <Lock size={12} />
      <span>{permission.name}</span>
    </div>
  );
}
