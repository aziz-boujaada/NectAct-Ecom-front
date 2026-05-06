import {
  BarChart3,
  LogOut,
  UserCircle,
  Shield,
  Package,
  ShoppingCart,
  Tags,
  Truck,
  Users,
  ReceiptText,
  RotateCcw,
} from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import type { User } from "../../types";
import type { TabOption } from "./Dashboard";

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
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-logo">NA</div>
        <h2>NectAct Panel</h2>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-label">DASHBOARD</p>
        <button
          className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => onTabChange("overview")}
          type="button"
        >
          <BarChart3 size={20} />
          <span>Overview</span>
        </button>
        <p className="sidebar-label">CATALOG</p>
        <button
          className={`nav-item ${activeTab === "products" ? "active" : ""}`}
          onClick={() => onTabChange("products")}
          type="button"
        >
          <Package size={20} />
          <span>Products</span>
        </button>
        <button
          className={`nav-item ${activeTab === "purchases" ? "active" : ""}`}
          onClick={() => onTabChange("purchases")}
          type="button"
        >
          <ShoppingCart size={20} />
          <span>Purchases</span>
        </button>
        <button
          className={`nav-item ${activeTab === "sales" ? "active" : ""}`}
          onClick={() => onTabChange("sales")}
          type="button"
        >
          <ReceiptText size={20} />
          <span>Sales</span>
        </button>
        <button
          className={`nav-item ${activeTab === "refunds" ? "active" : ""}`}
          onClick={() => onTabChange("refunds")}
          type="button"
        >
          <RotateCcw size={20} />
          <span>Refunds</span>
        </button>
        <button
          className={`nav-item ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => onTabChange("categories")}
          type="button"
        >
          <Tags size={20} />
          <span>Categories</span>
        </button>
        <button
          className={`nav-item ${activeTab === "suppliers" ? "active" : ""}`}
          onClick={() => onTabChange("suppliers")}
          type="button"
        >
          <Truck size={20} />
          <span>Suppliers</span>
        </button>
        <button
          className={`nav-item ${activeTab === "clients" ? "active" : ""}`}
          onClick={() => onTabChange("clients")}
          type="button"
        >
          <Users size={20} />
          <span>Clients</span>
        </button>
        <button
          className={`nav-item ${activeTab === "stock" ? "active" : ""}`}
          onClick={() => onTabChange("stock")}
          type="button"
        >
          <Package size={20} />
          <span>Stock Movements</span>
        </button>
        <p className="sidebar-label" style={{ marginTop: "16px" }}>
          SETTINGS
        </p>
        <button
          className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => onTabChange("profile")}
          type="button"
        >
          <UserCircle size={20} />
          <span>Profile</span>
        </button>
        <button
          className={`nav-item ${activeTab === "security" ? "active" : ""}`}
          onClick={() => onTabChange("security")}
          type="button"
        >
          <Shield size={20} />
          <span>Security</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        <div className="user-profile">
          <div className="avatar">{getInitials(user.name)}</div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role || "Admin"}</span>
          </div>
        </div>
        <div className="account-actions">
          <button
            onClick={onLogout}
            disabled={loading}
            type="button"
            className="action-btn danger-action"
            title="Logout"
          >
            <LogOut size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
