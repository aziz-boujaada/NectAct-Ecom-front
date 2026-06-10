import {
  BarChart3,
  LogOut,
  UserCircle,
  Shield,
  Lock,
  Package,
  ShoppingCart,
  Tags,
  Truck,
  Users,
  ReceiptText,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { ThemeToggle } from "../ThemeToggle";
import { ProtectedRoute } from "../permissions";
import { Can } from "../../context/PermissionContext";

import type { User } from "../../types";
import type { TabOption } from "./Dashboard";

import logoUrl from "src/assets/NextGestCologo1.png";

type AccountCardProps = {
  user: User;
  loading: boolean;
  activeTab: TabOption;
  theme: "dark" | "light";
  onTabChange: (tab: TabOption) => void;
  onLogout: () => void;
  onThemeToggle: () => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AccountCard({
  user,
  loading,
  activeTab,
  theme,
  onTabChange,
  onLogout,
  onThemeToggle,
}: AccountCardProps) {
  const { t } = useTranslation("auth");

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">
          <img src={logoUrl} alt="NectAct logo" />
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* DASHBOARD */}
        <p className="sidebar-label">{t("sidebar.dashboard")}</p>

        <Can permission="view_dashboard">
          <button
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => onTabChange("overview")}
            type="button"
          >
            <BarChart3 size={20} />
            <span>{t("sidebar.overview")}</span>
          </button>
        </Can>

        {/* CATALOG */}
        <p className="sidebar-label">{t("sidebar.catalog")}</p>

        <Can permission="view_products">
          <button
            className={`nav-item ${activeTab === "products" ? "active" : ""}`}
            onClick={() => onTabChange("products")}
            type="button"
          >
            <Package size={20} />
            <span>{t("sidebar.products")}</span>
          </button>
        </Can>

        <Can permission="view_purchases">
          <button
            className={`nav-item ${activeTab === "purchases" ? "active" : ""}`}
            onClick={() => onTabChange("purchases")}
            type="button"
          >
            <ShoppingCart size={20} />
            <span>{t("sidebar.purchases")}</span>
          </button>
        </Can>

        <Can permission="view_sales">
          <button
            className={`nav-item ${activeTab === "sales" ? "active" : ""}`}
            onClick={() => onTabChange("sales")}
            type="button"
          >
            <ReceiptText size={20} />
            <span>{t("sidebar.sales")}</span>
          </button>
        </Can>

        <Can permission="view_refunds">
          <button
            className={`nav-item ${activeTab === "refunds" ? "active" : ""}`}
            onClick={() => onTabChange("refunds")}
            type="button"
          >
            <RotateCcw size={20} />
            <span>{t("sidebar.refunds")}</span>
          </button>
        </Can>

        <Can permission="view_categories">
          <button
            className={`nav-item ${
              activeTab === "categories" ? "active" : ""
            }`}
            onClick={() => onTabChange("categories")}
            type="button"
          >
            <Tags size={20} />
            <span>{t("sidebar.categories")}</span>
          </button>
        </Can>

        <Can permission="view_suppliers">
          <button
            className={`nav-item ${
              activeTab === "suppliers" ? "active" : ""
            }`}
            onClick={() => onTabChange("suppliers")}
            type="button"
          >
            <Truck size={20} />
            <span>{t("sidebar.suppliers")}</span>
          </button>
        </Can>

        <Can permission="view_clients">
          <button
            className={`nav-item ${activeTab === "clients" ? "active" : ""}`}
            onClick={() => onTabChange("clients")}
            type="button"
          >
            <Users size={20} />
            <span>{t("sidebar.clients")}</span>
          </button>
        </Can>

        <Can permission="view_stock_movements">
          <button
            className={`nav-item ${activeTab === "stock" ? "active" : ""}`}
            onClick={() => onTabChange("stock")}
            type="button"
          >
            <Package size={20} />
            <span>{t("sidebar.stock_movements")}</span>
          </button>
        </Can>

        {/* SETTINGS */}
        <p className="sidebar-label" style={{ marginTop: "16px" }}>
          {t("sidebar.settings")}
        </p>

        <button
          className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => onTabChange("profile")}
          type="button"
        >
          <UserCircle size={20} />
          <span>{t("sidebar.profile")}</span>
        </button>

        <button
          className={`nav-item ${activeTab === "security" ? "active" : ""}`}
          onClick={() => onTabChange("security")}
          type="button"
        >
          <Shield size={20} />
          <span>{t("sidebar.security")}</span>
        </button>

        <Can permission={["view_users", "manage_users"]}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--text-muted)', marginTop: '16px', marginBottom: '8px', paddingLeft: '16px', textTransform: 'uppercase' }}>
            {t("sidebar.administration")}
          </p>

          <button
            className={`nav-item ${activeTab === "users" ? "active" : ""}`}
            onClick={() => onTabChange("users")}
            type="button"
          >
            <UserCircle size={20} />
            <span>{t("sidebar.employees")}</span>
          </button>
        </Can>

        <Can permission="manage_permissions">
          <button
            className={`nav-item ${activeTab === "permissions" ? "active" : ""}`}
            onClick={() => onTabChange("permissions")}
            type="button"
          >
            <Lock size={20} />
            <span>{t("sidebar.permissions")}</span>
          </button>
        </Can>
      </nav>

      <div className="sidebar-footer">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />

        <div className="user-profile">
          <div className="avatar">{getInitials(user.name)}</div>

          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role ? (user.role === 'admin' ? t("profile.roles.admin") : t("profile.roles.employee")) : t("profile.roles.admin")}</span>
          </div>
        </div>

        <div className="account-actions">
          <button
            onClick={onLogout}
            disabled={loading}
            type="button"
            className="action-btn danger-action"
            title={t("logout")}
          >
            <LogOut size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}