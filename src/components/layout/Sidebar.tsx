import React, { useState } from "react";
import nextGestcoLogo from "../../assets/NextGestCologo1.png";
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
  Gauge,
  ReceiptText,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePermission } from "../../hooks/permissions";
import { useCompanySettings } from "../../context/CompanySettingsContext";

export type ModuleType =
  | "dashboard"
  | "inventory"
  | "sales"
  | "purchasing"
  | "devises"
  | "payments"
  | "admin"
  | "profile"
  | "reports"
  | "settings"
  | "ai";

export type SubViewType =
  | "overview"
  | "products"
  | "categories"
  | "stock"
  | "sales-list"
  | "clients"
  | "refunds"
  | "purchases-list"
  | "suppliers"
  | "devis-list"
  | "payments"
  | "users"
  | "permissions"
  | "account"
  | "security"
  | "company"
  | "appearance"
  | "references"
  | "financials"
  | "inventory-report"
  | "sales-report"
  | "purchasing-report"
  | "devis-report"
  | "chat";

type SidebarView = {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
  permission: string | null;
};

type SidebarItem = {
  id: ModuleType;
  labelKey: string;
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
  userRole,
}) => {
  const { hasPermission } = usePermission();
  const { companySettings } = useCompanySettings();
  const { t } = useTranslation("navigation");

  const menuItems: SidebarItem[] = [
    {
      id: "dashboard",
      labelKey: "dashboard.title",
      icon: <LayoutDashboard size={20} />,
      permission: null,
      views: [
        {
          id: "overview",
          labelKey: "dashboard.overview",
          icon: <LayoutDashboard size={16} />,
          permission: null,
        },
      ],
    },
    {
      id: "inventory",
      labelKey: "inventory.title",
      icon: <Package size={20} />,
      permission: ["view_products", "view_categories"],
      views: [
        {
          id: "products",
          labelKey: "inventory.products",
          icon: <Box size={16} />,
          permission: "view_products",
        },
        {
          id: "categories",
          labelKey: "inventory.categories",
          icon: <Tags size={16} />,
          permission: "view_categories",
        },
        {
          id: "stock",
          labelKey: "inventory.stock",
          icon: <History size={16} />,
          permission: "view_products",
        },
      ],
    },
    {
      id: "sales",
      labelKey: "sales.title",
      icon: <TrendingUp size={20} />,
      permission: ["view_sales", "view_clients", "view_refunds"],
      views: [
        {
          id: "sales-list",
          labelKey: "sales.list",
          icon: <ClipboardList size={16} />,
          permission: "view_sales",
        },
        {
          id: "clients",
          labelKey: "sales.clients",
          icon: <Users size={16} />,
          permission: "view_clients",
        },
        {
          id: "refunds",
          labelKey: "sales.refunds",
          icon: <CreditCard size={16} />,
          permission: "view_refunds",
        },
        {
          id: "devis-list",
          labelKey: "devises.list",
          icon: <ReceiptText size={16} />,
          permission: null,
        },
      ],
    },
    {
      id: "purchasing",
      labelKey: "purchasing.title",
      icon: <Truck size={20} />,
      permission: ["view_purchases", "view_suppliers"],
      views: [
        {
          id: "purchases-list",
          labelKey: "purchasing.list",
          icon: <FileText size={16} />,
          permission: "view_purchases",
        },
        {
          id: "suppliers",
          labelKey: "purchasing.suppliers",
          icon: <Truck size={16} />,
          permission: "view_suppliers",
        },
      ],
    },
    {
      id: "payments",
      labelKey: "payments.title",
      icon: <CreditCard size={20} />,
      permission: null,
      views: [
        {
          id: "payments",
          labelKey: "payments.list",
          icon: <CreditCard size={16} />,
          permission: null,
        },
      ],
    },
    {
      id: "ai",
      labelKey: "ai.title",
      icon: <MessageSquare size={20} />,
      permission: null,
      views: [
        {
          id: "chat",
          labelKey: "ai.chat",
          icon: <MessageSquare size={16} />,
          permission: null,
        },
      ],
    },
    {
      id: "admin",
      labelKey: "admin.title",
      icon: <ShieldCheck size={20} />,
      permission: ["view_users", "manage_permissions"],
      views: [
        {
          id: "users",
          labelKey: "admin.users",
          icon: <Users size={16} />,
          permission: "view_users",
        },
        {
          id: "permissions",
          labelKey: "admin.permissions",
          icon: <ShieldCheck size={16} />,
          permission: "manage_permissions",
        },
      ],
    },
    {
      id: "profile",
      labelKey: "profile.title",
      icon: <UserCircle size={20} />,
      permission: null,
      views: [
        {
          id: "account",
          labelKey: "profile.account",
          icon: <UserCircle size={16} />,
          permission: null,
        },
        {
          id: "security",
          labelKey: "profile.security",
          icon: <Settings size={16} />,
          permission: null,
        },
      ],
    },
    {
      id: "reports",
      labelKey: "reports.title",
      icon: <BarChart3 size={20} />,
      permission: ["view_reports", "view_sales", "view_purchases"],
      views: [
        {
          id: "financials",
          labelKey: "reports.financials",
          icon: <LineChart size={16} />,
          permission: "view_reports",
        },
        {
          id: "inventory-report",
          labelKey: "reports.inventory",
          icon: <Gauge size={16} />,
          permission: "view_reports",
        },
        {
          id: "sales-report",
          labelKey: "reports.sales",
          icon: <TrendingUp size={16} />,
          permission: "view_sales",
        },
        {
          id: "purchasing-report",
          labelKey: "reports.purchasing",
          icon: <BarChart size={16} />,
          permission: "view_purchases",
        },
        {
          id: "devis-report",
          labelKey: "reports.devis",
          icon: <ReceiptText size={16} />,
          permission: "view_reports",
        },
      ],
    },
    {
      id: "settings",
      labelKey: "settings.title",
      icon: <Settings size={20} />,
      permission: null,
      views: [
        {
          id: "company",
          labelKey: "settings.company",
          icon: <Settings size={16} />,
          permission: null,
        },
        {
          id: "appearance",
          labelKey: "settings.appearance",
          icon: <Settings size={16} />,
          permission: null,
        },
        {
          id: "references",
          labelKey: "settings.references",
          icon: <ReceiptText size={16} />,
          permission: null,
        },
      ],
    },
  ];
const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

const closeMobileSidebar = () => {
  if (window.innerWidth <= 768) {
    setIsMobileSidebarOpen(false);
  }
};
return (
  <>
    {/* Mobile Toggle Button */}
    <button
      className="sidebar-toggle"
      onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
    >
      {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
    </button>

    {/* Overlay */}
    {isMobileSidebarOpen && (
      <div
        className="sidebar-overlay"
        onClick={() => setIsMobileSidebarOpen(false)}
      />
    )}

    <aside
      className={`erp-sidebar ${
        isMobileSidebarOpen ? 'mobile-open' : ''
      }`}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <img
          src={companySettings?.logo_url || nextGestcoLogo}
          alt={companySettings?.company_name || 'Next Gestco'}
          className="dashboard-logo"
          style={{ objectFit: 'contain' }}
        />

        <div className="dashboard-brand-text">
          <div
            className="dashboard-brand-name"
            style={{
              color: 'var(--primary)',
              background: 'none',
              WebkitTextFillColor: 'initial',
              WebkitBackgroundClip: 'initial',
              backgroundClip: 'initial'
            }}
          >
            {companySettings?.company_name || 'Next Gestco'}
          </div>

          <div className="dashboard-brand-tagline">
            Enterprise ERP
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          if (
            item.permission &&
            !hasPermission(item.permission)
          )
            return null;

          return (
            <div
              key={item.id}
              className={`nav-group ${
                activeModule === item.id ? 'active' : ''
              }`}
            >
              <div
                className="nav-item main-link"
                onClick={() => {
                  const firstPermittedView =
                    item.views.find(
                      (v) =>
                        !v.permission ||
                        hasPermission(v.permission)
                    );

                  if (firstPermittedView) {
                    onViewChange(
                      item.id as ModuleType,
                      firstPermittedView.id as SubViewType
                    );

                    closeMobileSidebar();
                  }
                }}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">
                  {t(item.labelKey)}
                </span>
              </div>

              {activeModule === item.id &&
                item.views.length > 1 && (
                  <div className="sub-menu">
                    {item.views.map((view) => {
                      if (
                        view.permission &&
                        !hasPermission(view.permission)
                      )
                        return null;

                      return (
                        <div
                          key={view.id}
                          className={`sub-nav-item ${
                            activeView === view.id
                              ? 'active'
                              : ''
                          }`}
                          onClick={() => {
                            onViewChange(
                              item.id as ModuleType,
                              view.id as SubViewType
                            );

                            closeMobileSidebar();
                          }}
                        >
                          <span className="sub-icon">
                            {view.icon}
                          </span>

                          <span className="sub-label">
                            {t(view.labelKey)}
                          </span>
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
          <div className="user-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div className="user-details">
            <span className="user-name">
              {userName}
            </span>

            <span className="user-role">
              {userRole}
            </span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          <LogOut size={18} />
          <span>{t('common:logout')}</span>
        </button>
      </div>
    </aside>
  </>
);
};
