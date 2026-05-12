import React from 'react';
import { UsersManager, PermissionsManager } from '../../components/permissions';
import { SubViewType } from '../../components/layout/Sidebar';

interface AdminModuleProps {
  activeView: SubViewType;
}

export const AdminModule: React.FC<AdminModuleProps> = ({ activeView }) => {
  return (
    <div className="fade-in">
      {activeView === 'users' && <UsersManager />}
      {activeView === 'permissions' && <PermissionsManager />}
    </div>
  );
};
