import React from 'react';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'muted';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'muted', 
  className = '',
  dot = false
}) => {
  return (
    <span className={`erp-badge badge-${variant} ${className}`}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  );
};
