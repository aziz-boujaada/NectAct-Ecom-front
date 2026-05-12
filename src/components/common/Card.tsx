import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  subtitle, 
  actions, 
  className = '', 
  bodyClassName = '',
  noPadding = false 
}) => {
  return (
    <div className={`erp-card ${className}`}>
      {(title || subtitle || actions) && (
        <div className="erp-card-header">
          <div className="card-title-group">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className={`erp-card-body ${noPadding ? 'p-0' : ''} ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};
