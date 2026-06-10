import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Banknote,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  RefreshCw,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { getDashboardStats } from "../../api/catalog";
import type { DashboardStats as DashboardStatsType, Status } from "../../types";
import { StatusMessage } from "../StatusMessage";
import { errorMessage } from "./hooks/adminCatalogUtils";
import { usePagination } from "./hooks/usePagination";
import { PaginationControls } from "./PaginationControls";
import { Can } from "../../context/PermissionContext";
import { PageHeader } from "../crud/PageHeader";
import { Card } from "../common/Card";
import { formatCurrency } from "../../utils/currency";
import i18n from "../../i18n";

/* Chart.js integration */
import {
  Line,
  Pie,
  Bar,
  Doughnut,
  Radar,
  Bubble,
  Scatter,
  PolarArea,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
);

// Register filler for area under line charts
ChartJS.register(Filler);

// Theme helpers: read CSS variables and dark-mode flag to style charts appropriately
function getChartTheme() {
  if (typeof window === "undefined")
    return {
      text: "#0f172a",
      muted: "#64748b",
      grid: "rgba(15,23,42,0.04)",
      tooltipBg: "#ffffff",
      tooltipColor: "#0f172a",
    };

  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const text = (styles.getPropertyValue("--text-main") || "#0f172a").trim();
  const muted = (styles.getPropertyValue("--text-muted") || "#64748b").trim();
  const isDark = (root.getAttribute("data-theme") || "").trim() === "dark";
  const grid = isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)";
  const tooltipBg = isDark ? "rgba(18,20,36,0.85)" : "#ffffff";
  const tooltipColor = isDark ? "#eef0f6" : "#0f172a";

  return { text, muted, grid, tooltipBg, tooltipColor };
}

function formatDate(value?: string) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

const summaryCards = [
  { key: "net_sales", label: "Net sales", icon: TrendingUp },
  { key: "total_refunds", label: "Refunds", icon: RotateCcw },
  { key: "total_purchases", label: "Purchases", icon: ShoppingCart },
  { key: "estimated_profit", label: "Estimated profit", icon: Banknote },
] as const;

// Helper: Monthly line chart renderer. Note: backend doesn't provide historical series by default.
function renderMonthlyLine(stats: DashboardStatsType) {
  // If backend provides `monthly_series` (array of { month, sales_total, refunds_total, purchases_total }), use it.
  // Otherwise fallback to a single-point chart showing current month totals.
  const monthlySeries = (stats as any).monthly_series as
    | Array<{
        month: string;
        sales_total: string;
        refunds_total: string;
        purchases_total: string;
      }>
    | undefined;

  const labels = monthlySeries
    ? monthlySeries.map((m) => m.month)
    : [
        new Date().toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
      ];

  const salesData = monthlySeries
    ? monthlySeries.map((m) => Number(m.sales_total || 0))
    : [Number(stats.current_month.sales_total || 0)];
  const refundsData = monthlySeries
    ? monthlySeries.map((m) => Number(m.refunds_total || 0))
    : [Number(stats.current_month.refunds_total || 0)];
  const purchasesData = monthlySeries
    ? monthlySeries.map((m) => Number(m.purchases_total || 0))
    : [Number(stats.current_month.purchases_total || 0)];

  const data = {
    labels,
    datasets: [
      {
        label: "Sales",
        data: salesData,
        borderColor: "#10b981",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx as CanvasRenderingContext2D;
          const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
          gradient.addColorStop(0, "rgb(16,185,129)");
          gradient.addColorStop(1, "rgb(16,185,129)");
          return gradient;
        },
        tension: 0.36,
        hoverOffset: 12,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 36,
        fill: true,
      },
      {
        label: "Refunds",
        data: refundsData,
        borderColor: "#ef4444",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx as CanvasRenderingContext2D;
          const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
          gradient.addColorStop(0, "rgb(239,68,68)");
          gradient.addColorStop(1, "rgb(239,68,68)");
          return gradient;
        },
        tension: 0.36,
        hoverOffset: 12,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 36,
        fill: true,
      },
      {
        label: "Purchases",
        data: purchasesData,
        borderColor: "#3b82f6",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx as CanvasRenderingContext2D;
          const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
          gradient.addColorStop(0, "rgb(59,130,246)");
          gradient.addColorStop(1, "rgb(59,130,246)");
          return gradient;
        },
        tension: 0.36,
        hoverOffset: 12,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 36,
        fill: true,
      },
    ],
  };

  const maxVal = Math.max(...salesData, ...refundsData, ...purchasesData, 0);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: "index" as const },
    plugins: {
      legend: {
        position: "top" as const,
        align: "end" as const,
        labels: { boxWidth: 10, usePointStyle: true, padding: 10, margin: 12 },
      },
      tooltip: {
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        titleFont: { weight: 600 as any },
        bodyFont: { weight: 600 as any },
        callbacks: {
          label: (context: any) =>
            `${Number(context.parsed.y ?? 0).toLocaleString()} DH`,
        },
      },
    },
    scales: (() => {
      const theme = getChartTheme();
      return {
        x: {
          grid: { display: false },
          ticks: { color: theme.muted, maxRotation: 0, minRotation: 0 },
        },
        y: {
          grid: { color: theme.grid },
          ticks: {
            callback: (v: any) => `${Number(v).toLocaleString()}`,
            color: theme.muted,
          },
          beginAtZero: true,
          suggestedMax: maxVal > 0 ? Math.ceil(maxVal * 1.12) : undefined,
        },
      };
    })(),
  };

  return <Bar data={data} options={options} />;
}

function renderStatusDoughnut(
  values: Record<string, number>,
  purchases = false,
) {
  const labels = Object.keys(values);
  const data = {
    labels,
    datasets: [
      {
        data: Object.values(values),
        backgroundColor: labels.map((l) => {
          if (purchases) return l === "pending" ? "#f59e0b" : "#10b981";
          // sales statuses
          if (l === "paid") return "#10b981";
          if (l === "unpaid") return "#f59e0b";
          if (l === "refunded") return "#ef4444";
          if (l === "partially_paid") return "#5e44ef";
          if (l === "partial_refunded") return "#074391";
          return "#94a3b8";
        }),
        tension: 0.36,
        hoverOffset: 12,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 36,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "40%",
    plugins: (() => {
      const theme = getChartTheme();
      return {
        legend: {
          display: true,
          position: "bottom" as const,
          labels: {
            cornerRadius: 10,
            boxWidth: 10,
            padding: 8,
            margin: 8,
            color: theme.muted,
          },
        },
        tooltip: {
          padding: 8,
          cornerRadius: 10,
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipColor,
          bodyColor: theme.tooltipColor,
        },
      };
    })(),
  };

  return <Doughnut data={data} options={options} />;
}

function renderTopProductsBar(
  products: DashboardStatsType["top_selling_products"],
) {
  // show only top N products to keep chart compact
  const top = products.slice(0, 6);
  const labels = top.map((p) => p.name);
  const data = {
    labels,
    datasets: [
      {
        label: "Quantity Sold",
        data: top.map((p) => p.quantity_sold),
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx as CanvasRenderingContext2D;
          const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
          gradient.addColorStop(0, "rgba(59,130,246,0.95)");
          gradient.addColorStop(1, "rgba(99,102,241,0.85)");
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 36,
      },
    ],
  };

  const options = {
    indexAxis: "x" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: (() => {
      const theme = getChartTheme();
      return {
        legend: { display: false },
        tooltip: {
          padding: 8,
          cornerRadius: 8,
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipColor,
          bodyColor: theme.tooltipColor,
        },
      };
    })(),
    scales: (() => {
      const theme = getChartTheme();
      return {
        x: {
          grid: { display: false },
          ticks: { color: theme.muted, maxRotation: 0 },
        },
        y: {
          grid: { color: theme.grid },
          ticks: { precision: 0, color: theme.muted },
        },
      };
    })(),
  };

  return <Bar data={data} options={options} />;
}

function renderLowStockHorizontal(
  products: DashboardStatsType["low_stock_products"],
) {
  const sorted = [...products]
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
    .slice(0, 6);
  const labels = sorted.map((p) => p.name);
  const data = {
    labels,
    datasets: [
      {
        label: "Stock",
        data: sorted.map((p) => p.stock ?? 0),
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx as CanvasRenderingContext2D;
          const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
          gradient.addColorStop(0, "rgba(239,68,68,0.95)");
          gradient.addColorStop(1, "rgba(245,158,11,0.85)");
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: (() => {
      const theme = getChartTheme();
      return {
        legend: { display: false },
        tooltip: {
          padding: 8,
          cornerRadius: 8,
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipColor,
          bodyColor: theme.tooltipColor,
        },
      };
    })(),
    scales: (() => {
      const theme = getChartTheme();
      return {
        x: {
          grid: { color: theme.grid },
          ticks: { color: theme.muted, stepSize: 1, precision: 0 },
          min: 0,
          max: 5,
        },
        y: { grid: { display: false }, ticks: { color: theme.muted } },
      };
    })(),
  };

  return <Bar data={data} options={options} />;
}

function renderDevisStatusBar(values: Record<string, number>) {
  const order = ["draft", "sent", "accepted", "rejected", "expired"];
  const labels = order.filter((label) => label in values);
  const data = {
    labels,
    datasets: [
      {
        label: "Devis",
        data: labels.map((label) => values[label] ?? 0),
        backgroundColor: labels.map((label) => {
          if (label === "draft") return "#6366f1";
          if (label === "sent") return "#3b82f6";
          if (label === "accepted") return "#10b981";
          if (label === "rejected") return "#ef4444";
          if (label === "expired") return "#f59e0b";
          return "#94a3b8";
        }),
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 40,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: (() => {
      const theme = getChartTheme();
      return {
        legend: { display: false },
        tooltip: {
          padding: 8,
          cornerRadius: 8,
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipColor,
          bodyColor: theme.tooltipColor,
        },
      };
    })(),
    scales: (() => {
      const theme = getChartTheme();
      return {
        x: {
          beginAtZero: true,
          grid: { color: theme.grid },
          ticks: { precision: 0, color: theme.muted },
        },
        y: {
          grid: { display: false },
          ticks: { color: theme.muted },
        },
      };
    })(),
  };

  return <Bar data={data} options={options} />;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation("dashboard");

  async function loadStats() {
    setLoading(true);
    setStatus(null);

    try {
      setStats(await getDashboardStats());
    } catch (error) {
      setStatus({ type: "error", text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    getDashboardStats()
      .then((nextStats) => {
        if (!active) return;
        setStats(nextStats);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setStatus({ type: "error", text: errorMessage(error) });
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="admin-dashboard dashboard-stats">
      <PageHeader
        title={t("statistics_overview")}
        eyebrow={t("title")}
        actions={
          <button
            className="secondary-action"
            disabled={loading}
            onClick={() => void loadStats()}
            type="button"
          >
            <RefreshCw size={17} aria-hidden="true" />
            {t("reload")}
          </button>
        }
      />

      <StatusMessage status={status} />

      {loading && !stats ? (
        <p className="empty-state">{t("loading_stats")}</p>
      ) : stats ? (
        <div className="stats-layout fade-in">
          <section className="stats-card-grid">
            {summaryCards.map(({ key, label, icon: Icon }) => (
              <Card className="metric-card-wrapper" key={key} noPadding>
                <article className="metric-card">
                  <div className="metric-icon">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <span>{t(label)}</span>
                    <strong>{formatCurrency(stats.summary[key])}</strong>
                  </div>
                </article>
              </Card>
            ))}
          </section>

          <section className="kpi-row">
            <Card
              title={t("kpi.daily_movement")}
              subtitle={t("kpi.today")}
              className="kpi-card-wrapper"
            >
              <div className="kpi-values">
                <div className="kpi-item sales">
                  <span className="kpi-label">{t("kpi.sales")}</span>
                  <strong className="kpi-value green">
                    {stats.today.sales} (
                    {formatCurrency(stats.today.sales_total)})
                  </strong>
                </div>
                <div className="kpi-item refunds">
                  <span className="kpi-label">{t("kpi.refunds")}</span>
                  <strong className="kpi-value red">
                    {stats.today.refunds} (
                    {formatCurrency(stats.today.refunds_total)})
                  </strong>
                </div>
              </div>
            </Card>

            <Card
              title={t("kpi.monthly_totals")}
              subtitle={t("kpi.current_month")}
              className="kpi-card-wrapper"
            >
              <div className="kpi-values">
                <div className="kpi-item sales">
                  <span className="kpi-label">{t("kpi.sales")}</span>
                  <strong className="kpi-value green">
                    {formatCurrency(stats.current_month.sales_total)}
                  </strong>
                </div>
                <div className="kpi-item refunds">
                  <span className="kpi-label">{t("kpi.refunds")}</span>
                  <strong className="kpi-value red">
                    {formatCurrency(stats.current_month.refunds_total)}
                  </strong>
                </div>
                <div className="kpi-item purchases">
                  <span className="kpi-label">{t("kpi.purchases")}</span>
                  <strong className="kpi-value blue">
                    {formatCurrency(stats.current_month.purchases_total)}
                  </strong>
                </div>
              </div>
            </Card>
          </section>

          <section className="charts-grid">
            <div className="admin-section chart-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{t("charts.trend")}</p>
                  <h2>{t("charts.monthly_totals")}</h2>
                </div>
              </div>
              <div className="chart-wrap">{renderMonthlyLine(stats)}</div>
            </div>

            <div className="admin-section chart-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{t("charts.status")}</p>
                  <h2>{t("charts.sales_status")}</h2>
                </div>
                <span>
                  {Object.values(stats.sales_by_status).reduce(
                    (a, b) => a + b,
                    0,
                  )}
                </span>
              </div>
              <div className="chart-wrap">
                {renderStatusDoughnut(stats.sales_by_status)}
              </div>
            </div>

            <div className="admin-section chart-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">{t("charts.status")}</p>
                  <h2>{t("charts.purchases_status")}</h2>
                </div>
                <span>
                  {Object.values(stats.purchases_by_status).reduce(
                    (a, b) => a + b,
                    0,
                  )}
                </span>
              </div>
              <div className="chart-wrap">
                {renderStatusDoughnut(stats.purchases_by_status, true)}
              </div>
            </div>

            {stats.devis_by_status && (
              <div className="admin-section chart-card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{t("charts.status")}</p>
                    <h2>{t("charts.devis_status")}</h2>
                  </div>
                  <span>
                    {Object.values(stats.devis_by_status).reduce(
                      (a, b) => a + b,
                      0,
                    )}
                  </span>
                </div>
                <div className="chart-wrap">
                  {renderDevisStatusBar(stats.devis_by_status)}
                </div>
              </div>
            )}

            <div className="chart-pair">
              <div className="admin-section chart-card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">
                      {t("charts.top_selling_products")}
                    </p>
                    <h2>{t("charts.top_selling_products")}</h2>
                  </div>
                </div>
                <div className="chart-wrap">
                  {renderTopProductsBar(stats.top_selling_products)}
                </div>
              </div>

              <div className="admin-section chart-card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">{t("charts.low_stock_products")}</p>
                    <h2>{t("charts.low_stock_products")}</h2>
                  </div>
                </div>
                <div className="chart-wrap">
                  {renderLowStockHorizontal(stats.low_stock_products)}
                </div>
              </div>
            </div>
          </section>

          <section className="stats-split">
            <ProductsTable
              title="Top Selling Products"
              products={stats.top_selling_products}
            />
            <LowStockTable products={stats.low_stock_products} />
          </section>

          <section className="stats-split">
            <RecentSalesTable sales={stats.recent_sales} />
            <RecentRefundsTable refunds={stats.recent_refunds} />
          </section>
        </div>
      ) : null}
    </div>
  );
}

function StatusBreakdown({
  title,
  values,
}: {
  title: string;
  values: Record<string, number>;
}) {
  const total = Object.values(values).reduce((sum, value) => sum + value, 0);

  return (
    <div className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Status</p>
          <h2>{title}</h2>
        </div>
        <span>{total}</span>
      </div>
      <div className="status-breakdown">
        {Object.entries(values).map(([label, value]) => (
          <div className="status-breakdown-row" key={label}>
            <span className={`status-pill ${label}`}>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductsTable({
  title,
  products,
}: {
  title: string;
  products: DashboardStatsType["top_selling_products"];
}) {
  const {
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(products);
  const { t } = useTranslation("dashboard");
  return (
    <div className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Products</p>
          <h2>{t("charts.top_selling_products")}</h2>
        </div>
      </div>
      <div className="table-wrap compact-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Sold</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={3}>No sales yet.</td>
              </tr>
            ) : (
              paginatedData.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.name}
                    <span>{product.reference || "No reference"}</span>
                  </td>
                  <td>{product.quantity_sold}</td>
                  <td>{formatCurrency(product.sales_total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {products.length > 0 && totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={prevPage}
          onNext={nextPage}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
}

function LowStockTable({
  products,
}: {
  products: DashboardStatsType["low_stock_products"];
}) {
  const { t } = useTranslation("dashboard");
  const {
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(products);
  return (
    <div className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>{t("charts.low_stock_products")}</h2>
        </div>
      </div>
      <div className="table-wrap compact-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
              <th>Minimum</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={3}>No low stock products.</td>
              </tr>
            ) : (
              paginatedData.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.name}
                    <span>{product.reference || "No reference"}</span>
                  </td>
                  <td>{product.stock ?? 0}</td>
                  <td>{product.min_stock ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {products.length > 0 && totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={prevPage}
          onNext={nextPage}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
}

function RecentSalesTable({
  sales,
}: {
  sales: DashboardStatsType["recent_sales"];
}) {
  const {
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(sales);
  const { t } = useTranslation("dashboard");
  return (
    <div className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t("tables.recent_sales")}</p>
          <h2>{t("tables.recent_sales")}</h2>
        </div>
      </div>
      <div className="table-wrap compact-table">
        <table>
          <thead>
            <tr>
              <th>{t("tables.reference")}</th>
              <th>{t("tables.client")}</th>
              <th>{t("tables.total")}</th>
              <th>{t("tables.status")}</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={4}>{t("no_recent_sales")}</td>
              </tr>
            ) : (
              paginatedData.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    {sale.reference || `Sale #${sale.id}`}
                    <span>{formatDate(sale.created_at)}</span>
                  </td>
                  <td>{sale.client?.name ?? t("tables.unknown_client")}</td>
                  <td>{formatCurrency(sale.total)}</td>
                  <td>
                    <span className={`status-pill ${sale.status}`}>
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {sales.length > 0 && totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={prevPage}
          onNext={nextPage}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
}

function RecentRefundsTable({
  refunds,
}: {
  refunds: DashboardStatsType["recent_refunds"];
}) {
  const {
    paginatedData,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination(refunds);
  const { t } = useTranslation("dashboard");
  return (
    <div className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t("stats.refunds")}</p>
          <h2>{t("tables.recent_refunds")}</h2>
        </div>
      </div>
      <div className="table-wrap compact-table">
        <table>
          <thead>
            <tr>
              <th>Sale</th>
              <th>Client</th>
              <th>Total</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {refunds.length === 0 ? (
              <tr>
                <td colSpan={4}>No recent refunds.</td>
              </tr>
            ) : (
              paginatedData.map((refund) => (
                <tr key={refund.id}>
                  <td>
                    {refund.sale?.reference || `Sale #${refund.sale_id}`}
                    <span>{formatDate(refund.created_at)}</span>
                  </td>
                  <td>{refund.sale?.client?.name ?? "Unknown client"}</td>
                  <td>{formatCurrency(refund.total)}</td>
                  <td>{refund.reason || "No reason"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {refunds.length > 0 && totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={prevPage}
          onNext={nextPage}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
}
