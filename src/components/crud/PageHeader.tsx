import React from 'react';

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, eyebrow, actions }) => {
  return (
    <div className="page-header">
      <div className="page-title-group">
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
};
