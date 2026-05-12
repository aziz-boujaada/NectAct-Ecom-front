import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  ShieldCheck, 
  UserCircle, 
  LogOut, 
  Box, 
  ClipboardList,
  Tags,
  Truck,
  History,
  TrendingUp,
  CreditCard,
  FileText
} from 'lucide-react';

export type ModuleType = 
  | 'dashboard' 
  | 'inventory' 
  | 'sales' 
  | 'purchasing' 
  | 'admin' 
  | 'profile'
  | 'reports';

export type SubViewType = 
  | 'overview' 
  | 'products' | 'categories' | 'stock'
  | 'sales-list' | 'clients' | 'refunds'
  | 'purchases-list' | 'suppliers'
  | 'users' | 'permissions'
  | 'account' | 'security'
  | 'financials' | 'inventory-report';

interface SidebarProps {
  activeModule: ModuleType;
  activeView: SubViewType;
  onViewChange: (module: ModuleType, view: SubViewType) => void;
  onLogout: () => void;
  userName: string;
  userRole: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeModule, 
  activeView, 
  onViewChange, 
  onLogout,
  userName,
  userRole
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      views: [{ id: 'overview', label: 'Overview' }]
    },
    {
      id: 'inventory',
      label: 'Master Data',
      icon: <Package size={20} />,
      views: [
        { id: 'products', label: 'Products', icon: <Box size={16} /> },
        { id: 'categories', label: 'Categories', icon: <Tags size={16} /> },
        { id: 'stock', label: 'Stock History', icon: <History size={16} /> },
      ]
    },
    {
      id: 'sales',
      label: 'Sales & CRM',
      icon: <TrendingUp size={20} />,
      views: [
        { id: 'sales-list', label: 'Orders', icon: <ClipboardList size={16} /> },
        { id: 'clients', label: 'Clients', icon: <Users size={16} /> },
        { id: 'refunds', label: 'Refunds', icon: <CreditCard size={16} /> },
      ]
    },
    {
      id: 'purchasing',
      label: 'Purchasing',
      icon: <Truck size={20} />,
      views: [
        { id: 'purchases-list', label: 'Purchase Orders', icon: <FileText size={16} /> },
        { id: 'suppliers', label: 'Suppliers', icon: <Truck size={16} /> },
      ]
    },
    {
      id: 'admin',
      label: 'Administration',
      icon: <ShieldCheck size={20} />,
      views: [
        { id: 'users', label: 'Users', icon: <Users size={16} /> },
        { id: 'permissions', label: 'Roles & Permissions', icon: <ShieldCheck size={16} /> },
      ]
    },
    {
      id: 'profile',
      label: 'My Account',
      icon: <UserCircle size={20} />,
      views: [
        { id: 'account', label: 'Profile', icon: <UserCircle size={16} /> },
        { id: 'security', label: 'Security', icon: <Settings size={16} /> },
      ]
    }
  ];

  return (
    <aside className="erp-sidebar">
      <div className="sidebar-header">
        <div className="logo-placeholder">NA</div>
        <div className="brand-info">
          <h1>NectAct</h1>
          <span>Enterprise ERP</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className={`nav-group ${activeModule === item.id ? 'active' : ''}`}>
            <div 
              className="nav-item main-link"
              onClick={() => onViewChange(item.id as ModuleType, item.views[0].id as SubViewType)}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </div>
            
            {activeModule === item.id && item.views.length > 1 && (
              <div className="sub-menu">
                {item.views.map((view) => (
                  <div 
                    key={view.id} 
                    className={`sub-nav-item ${activeView === view.id ? 'active' : ''}`}
                    onClick={() => onViewChange(item.id as ModuleType, view.id as SubViewType)}
                  >
                    <span className="sub-icon">{view.icon}</span>
                    <span className="sub-label">{view.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-brief">
          <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <span className="user-name">{userName}</span>
            <span className="user-role">{userRole}</span>
          </div>
        </div>
        <button className="logout-button" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
