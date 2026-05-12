import { AlertTriangle, Banknote, Boxes, CalendarDays, CircleDollarSign, RefreshCw, RotateCcw, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { getDashboardStats } from '../../api/catalog';
import type { DashboardStats as DashboardStatsType, Status } from '../../types';
import { StatusMessage } from '../StatusMessage';
import { errorMessage } from './hooks/adminCatalogUtils';
import { usePagination } from './hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { Can } from '../../context/PermissionContext';
import { PageHeader } from '../crud/PageHeader';
import { Card } from '../common/Card';

/* Chart.js integration */
import { Line, Pie, Bar } from 'react-chartjs-2';
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
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Title);

// Register filler for area under line charts
ChartJS.register(Filler);

// Theme helpers: read CSS variables and dark-mode flag to style charts appropriately
function getChartTheme() {
  if (typeof window === 'undefined') return {
    text: '#0f172a', muted: '#64748b', grid: 'rgba(15,23,42,0.04)', tooltipBg: '#ffffff', tooltipColor: '#0f172a'
  };

  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const text = (styles.getPropertyValue('--text-main') || '#0f172a').trim();
  const muted = (styles.getPropertyValue('--text-muted') || '#64748b').trim();
  const isDark = (root.getAttribute('data-theme') || '').trim() === 'dark';
  const grid = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)';
  const tooltipBg = isDark ? 'rgba(18,20,36,0.85)' : '#ffffff';
  const tooltipColor = isDark ? '#eef0f6' : '#0f172a';

  return { text, muted, grid, tooltipBg, tooltipColor };
}

function money(value: string | number | null | undefined) {
  return `${Number(value ?? 0).toFixed(2)} DH`;
}

function formatDate(value?: string) {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

const summaryCards = [
  { key: 'gross_sales', label: 'Gross sales', icon: CircleDollarSign },
  { key: 'net_sales', label: 'Net sales', icon: TrendingUp },
  { key: 'total_refunds', label: 'Refunds', icon: RotateCcw },
  { key: 'total_purchases', label: 'Purchases', icon: ShoppingCart },
  { key: 'estimated_profit', label: 'Estimated profit', icon: Banknote },
] as const;

// Helper: Monthly line chart renderer. Note: backend doesn't provide historical series by default.
function renderMonthlyLine(stats: DashboardStatsType) {
  // If backend provides `monthly_series` (array of { month, sales_total, refunds_total, purchases_total }), use it.
  // Otherwise fallback to a single-point chart showing current month totals.
  const monthlySeries = (stats as any).monthly_series as
    | Array<{ month: string; sales_total: string; refunds_total: string; purchases_total: string }>
    | undefined;

  const labels = monthlySeries
    ? monthlySeries.map((m) => m.month)
    : [new Date().toLocaleString('default', { month: 'short', year: 'numeric' })];

  const salesData = monthlySeries ? monthlySeries.map((m) => Number(m.sales_total || 0)) : [Number(stats.current_month.sales_total || 0)];
  const refundsData = monthlySeries ? monthlySeries.map((m) => Number(m.refunds_total || 0)) : [Number(stats.current_month.refunds_total || 0)];
  const purchasesData = monthlySeries ? monthlySeries.map((m) => Number(m.purchases_total || 0)) : [Number(stats.current_month.purchases_total || 0)];

  const data = {
    labels,
    datasets: [
      {
        label: 'Sales',
        data: salesData,
        borderColor: '#10b981',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx as CanvasRenderingContext2D;
          const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
          gradient.addColorStop(0, 'rgba(16,185,129,0.22)');
          gradient.addColorStop(1, 'rgba(16,185,129,0.02)');
          return gradient;
        },
        tension: 0.36,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
      },
      {
        label: 'Refunds',
        data: refundsData,
        borderColor: '#ef4444',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx as CanvasRenderingContext2D;
          const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
          gradient.addColorStop(0, 'rgba(239,68,68,0.18)');
          gradient.addColorStop(1, 'rgba(239,68,68,0.02)');
          return gradient;
        },
        tension: 0.36,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
      },
      {
        label: 'Purchases',
        data: purchasesData,
        borderColor: '#3b82f6',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx as CanvasRenderingContext2D;
          const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
          gradient.addColorStop(0, 'rgba(59,130,246,0.16)');
          gradient.addColorStop(1, 'rgba(59,130,246,0.02)');
          return gradient;
        },
        tension: 0.36,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
      },
    ],
  };

  const maxVal = Math.max(...salesData, ...refundsData, ...purchasesData, 0);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: { boxWidth: 10, usePointStyle: true, padding: 12 },
      },
      tooltip: {
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        titleFont: { weight: 600 as any },
        bodyFont: { weight: 600 as any },
        callbacks: {
          label: (context: any) => `${Number(context.parsed.y ?? 0).toLocaleString()} DH`,
        },
      },
    },
    scales: (() => {
      const theme = getChartTheme();
      return {
        x: { grid: { display: false }, ticks: { color: theme.muted, maxRotation: 0, minRotation: 0 } },
        y: {
          grid: { color: theme.grid },
          ticks: { callback: (v: any) => `${Number(v).toLocaleString()}`, color: theme.muted },
          beginAtZero: true,
          suggestedMax: maxVal > 0 ? Math.ceil(maxVal * 1.12) : undefined,
        },
      };
    })(),
  };

  return <Line data={data} options={options} />;
}

function renderStatusDoughnut(values: Record<string, number>, purchases = false) {
  const labels = Object.keys(values);
  const data = {
    labels,
    datasets: [
      {
        data: Object.values(values),
        backgroundColor: labels.map((l) => {
          if (purchases) return l === 'pending' ? '#f59e0b' : '#10b981';
          // sales statuses
          if (l === 'paid') return '#10b981';
          if (l === 'unpaid') return '#f59e0b';
          if (l === 'refunded') return '#ef4444';
          return '#94a3b8';
        }),
        borderWidth: 0,
        hoverOffset: 12,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: (() => {
      const theme = getChartTheme();
      return {
        legend: { display: true, position: 'bottom' as const, labels: { boxWidth: 10, padding: 8, color: theme.muted } },
        tooltip: { padding: 8, cornerRadius: 8, backgroundColor: theme.tooltipBg, titleColor: theme.tooltipColor, bodyColor: theme.tooltipColor },
      };
    })(),
  };

  return <Pie data={data} options={options} />;
}

function renderTopProductsBar(products: DashboardStatsType['top_selling_products']) {
  // show only top N products to keep chart compact
  const top = products.slice(0, 6);
  const labels = top.map((p) => p.name);
  const data = {
    labels,
    datasets: [
      {
        label: 'Quantity Sold',
        data: top.map((p) => p.quantity_sold),
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx as CanvasRenderingContext2D;
          const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
          gradient.addColorStop(0, 'rgba(59,130,246,0.95)');
          gradient.addColorStop(1, 'rgba(99,102,241,0.85)');
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 36,
      },
    ],
  };

  const options = {
    indexAxis: 'x' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: (() => {
      const theme = getChartTheme();
      return { legend: { display: false }, tooltip: { padding: 8, cornerRadius: 8, backgroundColor: theme.tooltipBg, titleColor: theme.tooltipColor, bodyColor: theme.tooltipColor } };
    })(),
    scales: (() => {
      const theme = getChartTheme();
      return {
        x: { grid: { display: false }, ticks: { color: theme.muted, maxRotation: 0 } },
        y: { grid: { color: theme.grid }, ticks: { precision: 0, color: theme.muted } },
      };
    })(),
  };

  return <Bar data={data} options={options} />;
}

function renderLowStockHorizontal(products: DashboardStatsType['low_stock_products']) {
  const sorted = [...products].sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0)).slice(0, 6);
  const labels = sorted.map((p) => p.name);
  const data = {
    labels,
    datasets: [
      {
        label: 'Stock',
        data: sorted.map((p) => p.stock ?? 0),
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx as CanvasRenderingContext2D;
          const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
          gradient.addColorStop(0, 'rgba(239,68,68,0.95)');
          gradient.addColorStop(1, 'rgba(245,158,11,0.85)');
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: (() => {
      const theme = getChartTheme();
      return { legend: { display: false }, tooltip: { padding: 8, cornerRadius: 8, backgroundColor: theme.tooltipBg, titleColor: theme.tooltipColor, bodyColor: theme.tooltipColor } };
    })(),
    scales: (() => {
      const theme = getChartTheme();
      return { x: { grid: { color: theme.grid }, ticks: { color: theme.muted, stepSize: 1, precision: 0 }, min: 0, max: 5 }, y: { grid: { display: false }, ticks: { color: theme.muted } } };
    })(),
  };

  return <Bar data={data} options={options} />;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsType | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    setLoading(true);
    setStatus(null);

    try {
      setStats(await getDashboardStats());
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
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
        setStatus({ type: 'error', text: errorMessage(error) });
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
        title="Statistics Overview" 
        eyebrow="Dashboard"
        actions={
          <button className="secondary-action" disabled={loading} onClick={() => void loadStats()} type="button">
            <RefreshCw size={17} aria-hidden="true" />
            Reload
          </button>
        }
      />

      <StatusMessage status={status} />

      {loading && !stats ? (
        <p className="empty-state">Loading dashboard statistics...</p>
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
                    <span>{label}</span>
                    <strong>{money(stats.summary[key])}</strong>
                  </div>
                </article>
              </Card>
            ))}
          </section>

          <section className="kpi-row">
            <Card title="Daily Movement" subtitle="Today" className="kpi-card-wrapper">
              <div className="kpi-values">
                <div className="kpi-item sales">
                  <span className="kpi-label">Sales</span>
                  <strong className="kpi-value green">{stats.today.sales} ({money(stats.today.sales_total)})</strong>
                </div>
                <div className="kpi-item refunds">
                  <span className="kpi-label">Refunds</span>
                  <strong className="kpi-value red">{stats.today.refunds} ({money(stats.today.refunds_total)})</strong>
                </div>
              </div>
            </Card>

            <Card title="Monthly Totals" subtitle="Current Month" className="kpi-card-wrapper">
              <div className="kpi-values">
                <div className="kpi-item sales">
                  <span className="kpi-label">Sales</span>
                  <strong className="kpi-value green">{money(stats.current_month.sales_total)}</strong>
                </div>
                <div className="kpi-item refunds">
                  <span className="kpi-label">Refunds</span>
                  <strong className="kpi-value red">{money(stats.current_month.refunds_total)}</strong>
                </div>
                <div className="kpi-item purchases">
                  <span className="kpi-label">Purchases</span>
                  <strong className="kpi-value blue">{money(stats.current_month.purchases_total)}</strong>
                </div>
              </div>
            </Card>
          </section>

          <section className="charts-grid">
            <div className="admin-section chart-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Trend</p>
                  <h2>Monthly Totals</h2>
                </div>
              </div>
              <div className="chart-wrap">{renderMonthlyLine(stats)}</div>
            </div>

            <div className="admin-section chart-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Status</p>
                  <h2>Sales Status</h2>
                </div>
                <span>{Object.values(stats.sales_by_status).reduce((a,b)=>a+b,0)}</span>
              </div>
              <div className="chart-wrap">{renderStatusDoughnut(stats.sales_by_status)}</div>
            </div>

            <div className="admin-section chart-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Status</p>
                  <h2>Purchases Status</h2>
                </div>
                <span>{Object.values(stats.purchases_by_status).reduce((a,b)=>a+b,0)}</span>
              </div>
              <div className="chart-wrap">{renderStatusDoughnut(stats.purchases_by_status, true)}</div>
            </div>

            <div className="chart-pair">
              <div className="admin-section chart-card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Products</p>
                    <h2>Top Selling Products</h2>
                  </div>
                </div>
                <div className="chart-wrap">{renderTopProductsBar(stats.top_selling_products)}</div>
              </div>

              <div className="admin-section chart-card">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Inventory</p>
                    <h2>Low Stock Products</h2>
                  </div>
                </div>
                <div className="chart-wrap">{renderLowStockHorizontal(stats.low_stock_products)}</div>
              </div>
            </div>
          </section>

          <section className="stats-split">
            <ProductsTable title="Top Selling Products" products={stats.top_selling_products} />
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

function StatusBreakdown({ title, values }: { title: string; values: Record<string, number> }) {
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

function ProductsTable({ title, products }: { title: string; products: DashboardStatsType['top_selling_products'] }) {
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(products);
  return (
    <div className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Products</p>
          <h2>{title}</h2>
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
              <tr><td colSpan={3}>No sales yet.</td></tr>
            ) : paginatedData.map((product) => (
              <tr key={product.id}>
                <td>{product.name}<span>{product.reference || 'No reference'}</span></td>
                <td>{product.quantity_sold}</td>
                <td>{money(product.sales_total)}</td>
              </tr>
            ))}
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

function LowStockTable({ products }: { products: DashboardStatsType['low_stock_products'] }) {
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(products);
  return (
    <div className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2>Low Stock Products</h2>
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
              <tr><td colSpan={3}>No low stock products.</td></tr>
            ) : paginatedData.map((product) => (
              <tr key={product.id}>
                <td>{product.name}<span>{product.reference || 'No reference'}</span></td>
                <td>{product.stock ?? 0}</td>
                <td>{product.min_stock ?? 0}</td>
              </tr>
            ))}
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

function RecentSalesTable({ sales }: { sales: DashboardStatsType['recent_sales'] }) {
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(sales);
  return (
    <div className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Sales</p>
          <h2>Recent Sales</h2>
        </div>
      </div>
      <div className="table-wrap compact-table">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Client</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr><td colSpan={4}>No recent sales.</td></tr>
            ) : paginatedData.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.reference || `Sale #${sale.id}`}<span>{formatDate(sale.created_at)}</span></td>
                <td>{sale.client?.name ?? 'Unknown client'}</td>
                <td>{money(sale.total)}</td>
                <td><span className={`status-pill ${sale.status}`}>{sale.status}</span></td>
              </tr>
            ))}
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

function RecentRefundsTable({ refunds }: { refunds: DashboardStatsType['recent_refunds'] }) {
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(refunds);
  return (
    <div className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Refunds</p>
          <h2>Recent Refunds</h2>
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
              <tr><td colSpan={4}>No recent refunds.</td></tr>
            ) : paginatedData.map((refund) => (
              <tr key={refund.id}>
                <td>{refund.sale?.reference || `Sale #${refund.sale_id}`}<span>{formatDate(refund.created_at)}</span></td>
                <td>{refund.sale?.client?.name ?? 'Unknown client'}</td>
                <td>{money(refund.total)}</td>
                <td>{refund.reason || 'No reason'}</td>
              </tr>
            ))}
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

