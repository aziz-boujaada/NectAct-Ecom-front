import { AlertTriangle, Banknote, Boxes, CalendarDays, CircleDollarSign, RefreshCw, RotateCcw, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDashboardStats } from '../../api/catalog';
import type { DashboardStats as DashboardStatsType, Status } from '../../types';
import { StatusMessage } from '../StatusMessage';
import { errorMessage } from './hooks/adminCatalogUtils';

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
      <div className="admin-titlebar">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Statistics Overview</h2>
        </div>
        <button className="secondary-action" disabled={loading} onClick={() => void loadStats()} type="button">
          <RefreshCw size={17} aria-hidden="true" />
          Reload
        </button>
      </div>

      <StatusMessage status={status} />

      {loading && !stats ? (
        <p className="empty-state">Loading dashboard statistics...</p>
      ) : stats ? (
        <div className="stats-layout fade-in">
          <section className="stats-card-grid">
            {summaryCards.map(({ key, label, icon: Icon }) => (
              <article className="metric-card" key={key}>
                <div className="metric-icon">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <div>
                  <span>{label}</span>
                  <strong>{money(stats.summary[key])}</strong>
                </div>
              </article>
            ))}
          </section>

          <section className="stats-card-grid compact">
            <article className="metric-card">
              <div className="metric-icon">
                <ShoppingCart size={20} aria-hidden="true" />
              </div>
              <div>
                <span>Sales</span>
                <strong>{stats.counts.sales}</strong>
              </div>
            </article>
            <article className="metric-card">
              <div className="metric-icon">
                <Boxes size={20} aria-hidden="true" />
              </div>
              <div>
                <span>Products</span>
                <strong>{stats.counts.products}</strong>
              </div>
            </article>
            <article className="metric-card">
              <div className="metric-icon">
                <Users size={20} aria-hidden="true" />
              </div>
              <div>
                <span>Clients / Suppliers</span>
                <strong>{stats.counts.clients} / {stats.counts.suppliers}</strong>
              </div>
            </article>
            <article className="metric-card warning">
              <div className="metric-icon">
                <AlertTriangle size={20} aria-hidden="true" />
              </div>
              <div>
                <span>Low stock</span>
                <strong>{stats.counts.low_stock_products}</strong>
              </div>
            </article>
          </section>

          <section className="stats-split">
            <div className="admin-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Today</p>
                  <h2>Daily Movement</h2>
                </div>
                <CalendarDays size={20} aria-hidden="true" />
              </div>
              <div className="period-grid">
                <div>
                  <span>Sales</span>
                  <strong>{stats.today.sales}</strong>
                  <p>{money(stats.today.sales_total)}</p>
                </div>
                <div>
                  <span>Refunds</span>
                  <strong>{stats.today.refunds}</strong>
                  <p>{money(stats.today.refunds_total)}</p>
                </div>
              </div>
            </div>

            <div className="admin-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Current Month</p>
                  <h2>Monthly Totals</h2>
                </div>
              </div>
              <div className="period-grid three">
                <div>
                  <span>Sales</span>
                  <strong>{money(stats.current_month.sales_total)}</strong>
                </div>
                <div>
                  <span>Refunds</span>
                  <strong>{money(stats.current_month.refunds_total)}</strong>
                </div>
                <div>
                  <span>Purchases</span>
                  <strong>{money(stats.current_month.purchases_total)}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="stats-split">
            <StatusBreakdown title="Sales status" values={stats.sales_by_status} />
            <StatusBreakdown title="Purchases status" values={stats.purchases_by_status} />
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
            ) : products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}<span>{product.reference || 'No reference'}</span></td>
                <td>{product.quantity_sold}</td>
                <td>{money(product.sales_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LowStockTable({ products }: { products: DashboardStatsType['low_stock_products'] }) {
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
            ) : products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}<span>{product.reference || 'No reference'}</span></td>
                <td>{product.stock ?? 0}</td>
                <td>{product.min_stock ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecentSalesTable({ sales }: { sales: DashboardStatsType['recent_sales'] }) {
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
            ) : sales.map((sale) => (
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
    </div>
  );
}

function RecentRefundsTable({ refunds }: { refunds: DashboardStatsType['recent_refunds'] }) {
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
            ) : refunds.map((refund) => (
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
    </div>
  );
}
