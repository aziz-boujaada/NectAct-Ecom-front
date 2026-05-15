import React from 'react';
import nextGestcoLogo from '../../assets/NextGestCologo1.png';
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
  FileText,
  BarChart3,
  LineChart,
  BarChart,
  Gauge
} from 'lucide-react';
import { usePermission } from '../../hooks/permissions'; // Assuming path or use local context

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
  | 'financials' | 'inventory-report' | 'sales-report' | 'purchasing-report';

type SidebarView = {
  id: string;
  label: string;
  icon: React.ReactNode;
  permission: string | null;
};

type SidebarItem = {
  id: ModuleType;
  label: string;
  icon: React.ReactNode;
  permission: string | string[] | null;
  views: SidebarView[];
};

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
  const { hasPermission } = usePermission();

  const menuItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      permission: null, // Always visible
      views: [{ id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} />, permission: null }]
    },
    {
      id: 'inventory',
      label: 'Master Data',
      icon: <Package size={20} />,
      permission: ['view_products', 'view_categories'],
      views: [
        { id: 'products', label: 'Products', icon: <Box size={16} />, permission: 'view_products' },
        { id: 'categories', label: 'Categories', icon: <Tags size={16} />, permission: 'view_categories' },
        { id: 'stock', label: 'Stock History', icon: <History size={16} />, permission: 'view_products' },
      ]
    },
    {
      id: 'sales',
      label: 'Sales & CRM',
      icon: <TrendingUp size={20} />,
      permission: ['view_sales', 'view_clients', 'view_refunds'],
      views: [
        { id: 'sales-list', label: 'Orders', icon: <ClipboardList size={16} />, permission: 'view_sales' },
        { id: 'clients', label: 'Clients', icon: <Users size={16} />, permission: 'view_clients' },
        { id: 'refunds', label: 'Refunds', icon: <CreditCard size={16} />, permission: 'view_refunds' },
      ]
    },
    {
      id: 'purchasing',
      label: 'Purchasing',
      icon: <Truck size={20} />,
      permission: ['view_purchases', 'view_suppliers'],
      views: [
        { id: 'purchases-list', label: 'Purchase Orders', icon: <FileText size={16} />, permission: 'view_purchases' },
        { id: 'suppliers', label: 'Suppliers', icon: <Truck size={16} />, permission: 'view_suppliers' },
      ]
    },
    {
      id: 'admin',
      label: 'Administration',
      icon: <ShieldCheck size={20} />,
      permission: ['view_users', 'manage_permissions'],
      views: [
        { id: 'users', label: 'Users', icon: <Users size={16} />, permission: 'view_users' },
        { id: 'permissions', label: 'Roles & Permissions', icon: <ShieldCheck size={16} />, permission: 'manage_permissions' },
      ]
    },
    {
      id: 'profile',
      label: 'My Account',
      icon: <UserCircle size={20} />,
      permission: null,
      views: [
        { id: 'account', label: 'Profile', icon: <UserCircle size={16} />, permission: null },
        { id: 'security', label: 'Security', icon: <Settings size={16} />, permission: null },
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 size={20} />,
      permission: ['view_reports', 'view_sales', 'view_purchases'],
      views: [
        { id: 'financials', label: 'Financial Reports', icon: <LineChart size={16} />, permission: 'view_reports' },
        { id: 'inventory-report', label: 'Inventory Reports', icon: <Gauge size={16} />, permission: 'view_reports' },
        { id: 'sales-report', label: 'Sales Reports', icon: <TrendingUp size={16} />, permission: 'view_sales' },
        { id: 'purchasing-report', label: 'Purchasing Reports', icon: <BarChart size={16} />, permission: 'view_purchases' },
      ]
    }
  ];

  return (
    <aside className="erp-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={nextGestcoLogo} alt="Next Gestco" className="dashboard-logo" />
                  <div className="dashboard-brand-text">
                    <div className="dashboard-brand-name">Next Gestco</div>
                    <div className="dashboard-brand-tagline">Enterprise ERP</div>
                  </div>
                </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          if (item.permission && !hasPermission(item.permission)) return null;

          return (
            <div key={item.id} className={`nav-group ${activeModule === item.id ? 'active' : ''}`}>
              <div 
                className="nav-item main-link"
                onClick={() => {
                  const firstPermittedView = item.views.find(v => !v.permission || hasPermission(v.permission));
                  if (firstPermittedView) {
                    onViewChange(item.id as ModuleType, firstPermittedView.id as SubViewType);
                  }
                }}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </div>
              
              {activeModule === item.id && item.views.length > 1 && (
                <div className="sub-menu">
                  {item.views.map((view) => {
                    if (view.permission && !hasPermission(view.permission)) return null;
                    
                    return (
                      <div 
                        key={view.id} 
                        className={`sub-nav-item ${activeView === view.id ? 'active' : ''}`}
                        onClick={() => onViewChange(item.id as ModuleType, view.id as SubViewType)}
                      >
                        <span className="sub-icon">{view.icon}</span>
                        <span className="sub-label">{view.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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
