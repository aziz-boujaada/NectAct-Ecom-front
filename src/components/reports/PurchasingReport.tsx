import React, { useEffect, useState } from 'react';
import { fetchPurchasingReport } from '../../api/catalog';
import { formatCurrency } from '../../utils/currency';
import { PageHeader } from '../crud/PageHeader';
import { DataTable } from '../crud/DataTable';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ReportFilters } from './ReportFilters';
import { Truck, AlertCircle, TrendingUp, Package, Clock, BarChart3, ChevronRight, Layers } from 'lucide-react';
import { getDefaultReportRange } from './reportUtils';
import type { PurchasingReport as PurchasingReportResponse } from '../../types/reports';

type PurchasingReportData = PurchasingReportResponse['data'] | null;

/* ─── Inline premium styles ──────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=Instrument+Sans:wght@400;500;600&display=swap');

  .pr-root {
    --pr-bg:          #f4f5f7;
    --pr-surface:     #ffffff;
    --pr-surface2:    #f0f1f4;
    --pr-border:      rgba(0,0,0,0.08);
    --pr-border-hi:   rgba(0,0,0,0.15);
    --pr-accent:      #1a6af5;
    --pr-accent2:     #0aaa82;
    --pr-warn:        #d97706;
    --pr-danger:      #dc2626;
    --pr-text:        #0f1117;
    --pr-muted:       #6b7280;
    --pr-dimmed:      #4b5563;
    --pr-font-head:   'Syne', sans-serif;
    --pr-font-body:   'Instrument Sans', sans-serif;
    --pr-font-mono:   'DM Mono', monospace;
    --pr-radius:      14px;
    --pr-radius-sm:   8px;
    font-family: var(--pr-font-body);
    background: var(--pr-bg);
    color: var(--pr-text);
    min-height: 100vh;
    padding: 32px 40px 80px;
    box-sizing: border-box;
  }

  /* Header */
  .pr-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 36px;
    padding-bottom: 28px;
    border-bottom: 1px solid var(--pr-border);
    position: relative;
  }
  .pr-header::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 0;
    width: 80px; height: 2px;
    background: var(--pr-accent);
    border-radius: 2px;
  }
  .pr-eyebrow {
    font-family: var(--pr-font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--pr-accent);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pr-eyebrow::before {
    content: '';
    display: block;
    width: 14px; height: 1px;
    background: var(--pr-accent);
  }
  .pr-title {
    font-family: var(--pr-font-head);
    font-size: 2.1rem;
    font-weight: 800;
    color: var(--pr-text);
    letter-spacing: -0.03em;
    line-height: 1;
    margin: 0;
  }

  /* Range pill */
  .pr-range-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--pr-surface);
    border: 1px solid var(--pr-border-hi);
    border-radius: 100px;
    padding: 8px 16px 8px 12px;
    font-family: var(--pr-font-mono);
    font-size: 0.78rem;
    color: var(--pr-dimmed);
    animation: pr-fadeup 0.4s ease both;
  }
  .pr-range-dot {
    width: 6px; height: 6px;
    background: var(--pr-accent);
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(26,106,245,0.5);
  }

  /* Filters wrapper */
  .pr-filters {
    margin-bottom: 32px;
  }

  /* KPI grid */
  .pr-kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 14px;
    margin-bottom: 28px;
  }
  .pr-kpi {
    background: var(--pr-surface);
    border: 1px solid var(--pr-border);
    border-radius: var(--pr-radius);
    padding: 22px 24px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    animation: pr-fadeup 0.45s ease both;
  }
  .pr-kpi:hover {
    border-color: var(--pr-border-hi);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }
  .pr-kpi::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 60%);
    pointer-events: none;
  }
  .pr-kpi-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
    background: rgba(255,255,255,0.05);
  }
  .pr-kpi-icon.accent  { background: rgba(26,106,245,0.09);  color: var(--pr-accent);  }
  .pr-kpi-icon.accent2 { background: rgba(10,170,130,0.1);   color: var(--pr-accent2); }
  .pr-kpi-icon.warn    { background: rgba(217,119,6,0.1);    color: var(--pr-warn);    }
  .pr-kpi-icon.muted   { background: rgba(0,0,0,0.05);       color: var(--pr-muted);   }
  .pr-kpi-label {
    font-size: 0.72rem;
    font-family: var(--pr-font-mono);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--pr-muted);
    margin-bottom: 8px;
  }
  .pr-kpi-value {
    font-family: var(--pr-font-head);
    font-size: 1.9rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
    color: var(--pr-text);
  }
  .pr-kpi-value.accent  { color: var(--pr-accent);  }
  .pr-kpi-value.accent2 { color: var(--pr-accent2); }
  .pr-kpi-value.warn    { color: var(--pr-warn);    }
  .pr-kpi-corner {
    position: absolute;
    bottom: 16px; right: 18px;
    font-family: var(--pr-font-mono);
    font-size: 0.68rem;
    color: var(--pr-muted);
    display: flex; align-items: center; gap: 4px;
    opacity: 0.6;
  }

  /* Cards */
  .pr-card {
    background: var(--pr-surface);
    border: 1px solid var(--pr-border);
    border-radius: var(--pr-radius);
    overflow: hidden;
    margin-bottom: 14px;
    animation: pr-fadeup 0.5s ease both;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }
  .pr-card:hover { border-color: var(--pr-border-hi); box-shadow: 0 4px 16px rgba(0,0,0,0.09); }
  .pr-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    border-bottom: 1px solid var(--pr-border);
  }
  .pr-card-title {
    font-family: var(--pr-font-head);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--pr-text);
    letter-spacing: -0.01em;
    display: flex; align-items: center; gap: 10px;
  }
  .pr-card-title-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--pr-accent);
    flex-shrink: 0;
  }
  .pr-card-count {
    font-family: var(--pr-font-mono);
    font-size: 0.72rem;
    color: var(--pr-muted);
    background: var(--pr-surface2);
    border: 1px solid var(--pr-border);
    border-radius: 100px;
    padding: 3px 10px;
  }
  .pr-card-body { padding: 0; }

  /* Table */
  .pr-table-wrap { overflow-x: auto; }
  .pr-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  .pr-table thead tr {
    border-bottom: 1px solid var(--pr-border);
  }
  .pr-table thead th {
    font-family: var(--pr-font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--pr-muted);
    font-weight: 400;
    padding: 12px 20px;
    text-align: left;
    white-space: nowrap;
  }
  .pr-table thead th.right { text-align: right; }
  .pr-table tbody tr {
    border-bottom: 1px solid var(--pr-border);
    transition: background 0.15s;
  }
  .pr-table tbody tr:last-child { border-bottom: none; }
  .pr-table tbody tr:hover { background: var(--pr-surface2); }
  .pr-table td {
    padding: 14px 20px;
    color: var(--pr-dimmed);
    vertical-align: middle;
  }
  .pr-table td.right { text-align: right; }
  .pr-table td strong {
    color: var(--pr-text);
    font-weight: 600;
  }
  .pr-mono { font-family: var(--pr-font-mono); font-size: 0.85em; }
  .pr-amount {
    font-family: var(--pr-font-mono);
    color: var(--pr-text);
    font-size: 0.875rem;
    font-weight: 500;
  }
  .pr-amount-muted {
    font-family: var(--pr-font-mono);
    color: var(--pr-muted);
    font-size: 0.85rem;
  }
  .pr-chip {
    display: inline-flex;
    align-items: center;
    font-family: var(--pr-font-mono);
    font-size: 0.72rem;
    border-radius: 6px;
    padding: 4px 10px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .pr-chip.green  { background: rgba(10,170,130,0.1);   color: #0aaa82; }
  .pr-chip.blue   { background: rgba(26,106,245,0.09);  color: #1a6af5; }
  .pr-chip.warn   { background: rgba(217,119,6,0.1);    color: #d97706; }
  .pr-chip.dot::before {
    content: '';
    width: 5px; height: 5px;
    border-radius: 50%;
    background: currentColor;
    margin-right: 6px;
    flex-shrink: 0;
  }

  /* Two-col row */
  .pr-two-col {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    gap: 14px;
    margin-bottom: 14px;
  }

  /* Empty & loading states */
  .pr-empty {
    padding: 52px 24px;
    text-align: center;
  }
  .pr-empty-icon {
    width: 52px; height: 52px;
    margin: 0 auto 16px;
    opacity: 0.15;
    display: flex; align-items: center; justify-content: center;
  }
  .pr-empty p {
    font-size: 0.875rem;
    color: var(--pr-muted);
    margin: 0;
    font-family: var(--pr-font-mono);
  }

  .pr-loading {
    text-align: center;
    padding: 80px 24px;
    animation: pr-fadeup 0.3s ease both;
  }
  .pr-spinner {
    width: 28px; height: 28px;
    border: 2px solid var(--pr-border);
    border-top-color: var(--pr-accent);
    border-radius: 50%;
    animation: pr-spin 0.7s linear infinite;
    margin: 0 auto 18px;
  }
  .pr-loading p {
    font-family: var(--pr-font-mono);
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    color: var(--pr-muted);
    margin: 0;
  }

  /* Error */
  .pr-error {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    background: rgba(245,66,66,0.06);
    border: 1px solid rgba(245,66,66,0.2);
    border-radius: var(--pr-radius);
    padding: 18px 22px;
    margin-bottom: 24px;
    animation: pr-fadeup 0.3s ease both;
  }
  .pr-error-icon { color: var(--pr-danger); flex-shrink: 0; margin-top: 1px; }
  .pr-error p { color: #991b1b; font-size: 0.875rem; margin: 0; }

  /* Zero-state full page */
  .pr-zero {
    text-align: center;
    padding: 100px 40px;
    animation: pr-fadeup 0.5s ease both;
  }
  .pr-zero-icon {
    width: 80px; height: 80px;
    margin: 0 auto 24px;
    border-radius: 24px;
    background: var(--pr-surface);
    border: 1px solid var(--pr-border);
    display: flex; align-items: center; justify-content: center;
    color: var(--pr-muted);
    opacity: 0.5;
  }
  .pr-zero h3 {
    font-family: var(--pr-font-head);
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--pr-text);
    margin: 0 0 10px;
    letter-spacing: -0.02em;
  }
  .pr-zero p {
    color: var(--pr-muted);
    font-size: 0.875rem;
    margin: 0;
    max-width: 340px;
    margin-inline: auto;
    line-height: 1.6;
  }

  /* Section spacer */
  .pr-section { margin-bottom: 14px; }

  /* Animations */
  @keyframes pr-fadeup {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pr-spin {
    to { transform: rotate(360deg); }
  }
  .pr-kpi:nth-child(1) { animation-delay: 0.05s; }
  .pr-kpi:nth-child(2) { animation-delay: 0.10s; }
  .pr-kpi:nth-child(3) { animation-delay: 0.15s; }
  .pr-kpi:nth-child(4) { animation-delay: 0.20s; }
`;

/* ─── Tiny sub-components ────────────────────────────────────────────────── */
const PrCard: React.FC<{
  title: string;
  icon?: React.ReactNode;
  count?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ title, icon, count, children, style }) => (
  <div className="pr-card" style={style}>
    <div className="pr-card-head">
      <div className="pr-card-title">
        <span className="pr-card-title-dot" />
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {count !== undefined && <span className="pr-card-count">{count}</span>}
      </div>
    </div>
    <div className="pr-card-body">{children}</div>
  </div>
);

const EmptyRow: React.FC<{ message: string }> = ({ message }) => (
  <div className="pr-empty">
    <div className="pr-empty-icon">
      <Layers size={36} />
    </div>
    <p>{message}</p>
  </div>
);

/* ─── Main component ─────────────────────────────────────────────────────── */
export const PurchasingReport: React.FC = () => {
  const [data, setData] = useState<PurchasingReportData>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async (from: string, to: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPurchasingReport(from, to);
      setData(response.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load purchasing report');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { from, to } = getDefaultReportRange();
    loadReport(from, to);
  }, []);

  const currentData = data;
  const selectedRange = currentData
    ? `${currentData.period.from} → ${currentData.period.to}`
    : 'all dates';

  return (
    <section className="pr-root">
      <style>{css}</style>

      {/* ── Header ── */}
      <div className="pr-header">
        <div>
          <div className="pr-eyebrow">Reporting</div>
          <h1 className="pr-title">Purchasing Reports</h1>
        </div>
        {currentData && (
          <div className="pr-range-pill">
            <span className="pr-range-dot" />
            {selectedRange}
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="pr-filters">
        <ReportFilters
          onApply={loadReport}
          onReset={() => {
            const { from, to } = getDefaultReportRange();
            loadReport(from, to);
          }}
          loading={loading}
        />
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="pr-error">
          <div className="pr-error-icon"><AlertCircle size={18} /></div>
          <p>{error}</p>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="pr-loading">
          <div className="pr-spinner" />
          <p>Analyzing procurement data...</p>
        </div>
      )}

      {/* ── Data ── */}
      {!loading && currentData && (
        <div>

          {/* KPI row */}
          <div className="pr-kpi-grid">
            <div className="pr-kpi">
              <div className="pr-kpi-icon accent"><TrendingUp size={17} /></div>
              <div className="pr-kpi-label">Total Spend</div>
              <div className="pr-kpi-value accent">{formatCurrency(currentData.expenditure_analysis.total_spend)}</div>
              <div className="pr-kpi-corner"><ChevronRight size={11} /> period total</div>
            </div>

            <div className="pr-kpi">
              <div className="pr-kpi-icon accent2"><Truck size={17} /></div>
              <div className="pr-kpi-label">Active Suppliers</div>
              <div className="pr-kpi-value accent2">{currentData.supplier_performance.length}</div>
              <div className="pr-kpi-corner"><ChevronRight size={11} /> vendors</div>
            </div>

            <div className="pr-kpi">
              <div className="pr-kpi-icon warn"><Clock size={17} /></div>
              <div className="pr-kpi-label">Pending Orders</div>
              <div className="pr-kpi-value warn">{currentData.pending_purchase_orders.length}</div>
              <div className="pr-kpi-corner"><ChevronRight size={11} /> awaiting</div>
            </div>

            <div className="pr-kpi">
              <div className="pr-kpi-icon muted"><BarChart3 size={17} /></div>
              <div className="pr-kpi-label">Categories</div>
              <div className="pr-kpi-value">{currentData.expenditure_analysis.by_category.length}</div>
              <div className="pr-kpi-corner"><ChevronRight size={11} /> involved</div>
            </div>
          </div>

          {/* Supplier Performance */}
          <div className="pr-section">
            <PrCard
              title="Supplier Performance"
              count={currentData.supplier_performance.length}
            >
              {currentData.supplier_performance.length > 0 ? (
                <div className="pr-table-wrap">
                  <table className="pr-table">
                    <thead>
                      <tr>
                        <th>Supplier</th>
                        <th>Orders</th>
                        <th className="right">Confirmed Spend</th>
                        <th className="right">Pending Spend</th>
                        <th className="right">Avg Order Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.supplier_performance.map((supplier) => (
                        <tr key={supplier.id}>
                          <td><strong>{supplier.name}</strong></td>
                          <td><span className="pr-mono">{supplier.purchase_count}</span></td>
                          <td className="right"><span className="pr-amount">{formatCurrency(supplier.confirmed_spend)}</span></td>
                          <td className="right"><span className="pr-amount-muted">{formatCurrency(supplier.pending_spend)}</span></td>
                          <td className="right"><span className="pr-chip blue">{formatCurrency(supplier.average_order_value)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyRow message="No supplier performance rows for this period." />
              )}
            </PrCard>
          </div>

          {/* Pending Purchase Orders */}
          <div className="pr-section">
            <PrCard
              title="Pending Purchase Orders"
              count={currentData.pending_purchase_orders.length}
            >
              {currentData.pending_purchase_orders.length > 0 ? (
                <div className="pr-table-wrap">
                  <table className="pr-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Supplier</th>
                        <th className="right">Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.pending_purchase_orders.map((order) => (
                        <tr key={order.id}>
                          <td><span className="pr-mono">{order.created_at}</span></td>
                          <td><strong>{order.supplier || '—'}</strong></td>
                          <td className="right"><span className="pr-amount">{formatCurrency(order.total)}</span></td>
                          <td><span className="pr-chip warn dot">pending</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyRow message="No pending purchase orders." />
              )}
            </PrCard>
          </div>

          {/* Two-col: Category + Products */}
          <div className="pr-two-col">
            <PrCard
              title="Expenditure by Category"
              count={currentData.expenditure_analysis.by_category.length}
            >
              {currentData.expenditure_analysis.by_category.length > 0 ? (
                <div className="pr-table-wrap">
                  <table className="pr-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th className="right">Total Spend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.expenditure_analysis.by_category.map((item) => (
                        <tr key={item.category}>
                          <td><strong>{item.category}</strong></td>
                          <td className="right"><span className="pr-chip green">{formatCurrency(item.total_spend)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyRow message="No category expenditure rows." />
              )}
            </PrCard>

            <PrCard
              title="Top Procured Products"
              count={currentData.expenditure_analysis.top_products.length}
            >
              {currentData.expenditure_analysis.top_products.length > 0 ? (
                <div className="pr-table-wrap">
                  <table className="pr-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th className="right">Total Spend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.expenditure_analysis.top_products.map((product) => (
                        <tr key={product.id}>
                          <td><strong>{product.name}</strong></td>
                          <td><span className="pr-mono">{product.quantity}</span></td>
                          <td className="right"><span className="pr-amount">{formatCurrency(product.total_spend)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyRow message="No product expenditure rows." />
              )}
            </PrCard>
          </div>

          {/* All-empty fallback */}
          {currentData.supplier_performance.length === 0 &&
           currentData.pending_purchase_orders.length === 0 && (
            <div className="pr-zero" style={{ marginTop: '24px' }}>
              <div className="pr-zero-icon"><Truck size={32} /></div>
              <h3>No Purchasing Data</h3>
              <p>No procurement activity found for <span className="pr-mono">{selectedRange}</span>. Try adjusting the date range above.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Zero state ── */}
      {!loading && !error && !currentData && (
        <div className="pr-zero">
          <div className="pr-zero-icon"><Truck size={32} /></div>
          <h3>Purchasing Analytics</h3>
          <p>Monitor your spending and supplier relationships by selecting a date range above.</p>
        </div>
      )}
    </section>
  );
};