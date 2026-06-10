import React, { useEffect, useState } from 'react';
import { fetchSalesReport } from '../../api/catalog';
import { formatCurrency } from '../../utils/currency';
import { ReportFilters } from './ReportFilters';
import {
  TrendingUp,
  BarChart3,
  AlertCircle,
  ChevronRight,
  Globe2,
  Package,
  CalendarDays,
  Layers,
} from 'lucide-react';
import { getDefaultReportRange } from './reportUtils';
import type { SalesReport as SalesReportResponse } from '../../types/reports';

type SalesReportData = SalesReportResponse['data'] | null;

/* ───────────────── Premium Styles ───────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=Instrument+Sans:wght@400;500;600&display=swap');

  .pr-root {
    --pr-bg: #f4f5f7;
    --pr-surface: #ffffff;
    --pr-surface2: #f0f1f4;
    --pr-border: rgba(0,0,0,0.08);
    --pr-border-hi: rgba(0,0,0,0.14);

    --pr-accent: #1a6af5;
    --pr-accent2: #0aaa82;
    --pr-warn: #d97706;
    --pr-danger: #dc2626;

    --pr-text: #0f1117;
    --pr-muted: #6b7280;
    --pr-dimmed: #4b5563;

    --pr-font-head: 'Syne', sans-serif;
    --pr-font-body: 'Instrument Sans', sans-serif;
    --pr-font-mono: 'DM Mono', monospace;

    --pr-radius: 14px;

    background: var(--pr-bg);
    color: var(--pr-text);
    min-height: 100vh;
    padding: 32px 40px 80px;
    box-sizing: border-box;
    font-family: var(--pr-font-body);
  }

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
    left: 0;
    bottom: -1px;
    width: 80px;
    height: 2px;
    background: var(--pr-accent);
    border-radius: 999px;
  }

  .pr-eyebrow {
    font-family: var(--pr-font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--pr-accent);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pr-eyebrow::before {
    content: '';
    width: 14px;
    height: 1px;
    background: var(--pr-accent);
    display: block;
  }

  .pr-title {
    font-family: var(--pr-font-head);
    font-size: 2.1rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    margin: 0;
    line-height: 1;
  }

  .pr-range-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 16px 8px 12px;
    border-radius: 999px;
    background: var(--pr-surface);
    border: 1px solid var(--pr-border-hi);
    font-family: var(--pr-font-mono);
    font-size: 0.76rem;
    color: var(--pr-dimmed);
  }

  .pr-range-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: var(--pr-accent);
    box-shadow: 0 0 10px rgba(26,106,245,.5);
  }

  .pr-filters {
    margin-bottom: 30px;
  }

  .pr-kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
    transition: .2s ease;
    box-shadow: 0 1px 4px rgba(0,0,0,.05);
  }

  .pr-kpi:hover {
    transform: translateY(-2px);
    border-color: var(--pr-border-hi);
    box-shadow: 0 10px 24px rgba(0,0,0,.08);
  }

  .pr-kpi-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .pr-kpi-icon.blue {
    background: rgba(26,106,245,.1);
    color: var(--pr-accent);
  }

  .pr-kpi-icon.green {
    background: rgba(10,170,130,.1);
    color: var(--pr-accent2);
  }

  .pr-kpi-icon.warn {
    background: rgba(217,119,6,.1);
    color: var(--pr-warn);
  }

  .pr-kpi-icon.gray {
    background: rgba(0,0,0,.05);
    color: var(--pr-muted);
  }

  .pr-kpi-label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: var(--pr-muted);
    font-family: var(--pr-font-mono);
    margin-bottom: 8px;
  }

  .pr-kpi-value {
    font-family: var(--pr-font-head);
    font-size: 1.9rem;
    line-height: 1;
    letter-spacing: -.03em;
    font-weight: 700;
  }

  .pr-kpi-value.blue { color: var(--pr-accent); }
  .pr-kpi-value.green { color: var(--pr-accent2); }
  .pr-kpi-value.warn { color: var(--pr-warn); }

  .pr-kpi-corner {
    position: absolute;
    right: 18px;
    bottom: 16px;
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: .6;
    color: var(--pr-muted);
    font-size: .68rem;
    font-family: var(--pr-font-mono);
  }

  .pr-card {
    background: var(--pr-surface);
    border: 1px solid var(--pr-border);
    border-radius: var(--pr-radius);
    overflow: hidden;
    margin-bottom: 14px;
    box-shadow: 0 1px 4px rgba(0,0,0,.05);
  }

  .pr-card-head {
    padding: 18px 24px;
    border-bottom: 1px solid var(--pr-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pr-card-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--pr-font-head);
    font-weight: 700;
    font-size: .96rem;
  }

  .pr-card-title-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--pr-accent);
  }

  .pr-card-count {
    font-family: var(--pr-font-mono);
    font-size: .72rem;
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid var(--pr-border);
    background: var(--pr-surface2);
    color: var(--pr-muted);
  }

  .pr-table-wrap {
    overflow-x: auto;
  }

  .pr-table {
    width: 100%;
    border-collapse: collapse;
  }

  .pr-table thead tr {
    border-bottom: 1px solid var(--pr-border);
  }

  .pr-table th {
    text-align: left;
    padding: 12px 20px;
    font-size: .68rem;
    letter-spacing: .1em;
    text-transform: uppercase;
    font-family: var(--pr-font-mono);
    color: var(--pr-muted);
    font-weight: 400;
    white-space: nowrap;
  }

  .pr-table td {
    padding: 14px 20px;
    border-bottom: 1px solid var(--pr-border);
    color: var(--pr-dimmed);
  }

  .pr-table tbody tr:last-child td {
    border-bottom: none;
  }

  .pr-table tbody tr:hover {
    background: var(--pr-surface2);
  }

  .pr-right {
    text-align: right;
  }

  .pr-amount {
    font-family: var(--pr-font-mono);
    font-weight: 500;
    color: var(--pr-text);
  }

  .pr-chip {
    display: inline-flex;
    align-items: center;
    border-radius: 6px;
    padding: 4px 10px;
    font-size: .72rem;
    font-family: var(--pr-font-mono);
    font-weight: 500;
  }

  .pr-chip.green {
    background: rgba(10,170,130,.1);
    color: var(--pr-accent2);
  }

  .pr-chip.blue {
    background: rgba(26,106,245,.1);
    color: var(--pr-accent);
  }

  .pr-mono {
    font-family: var(--pr-font-mono);
  }

  .pr-loading,
  .pr-empty-main {
    text-align: center;
    padding: 80px 24px;
  }

  .pr-spinner {
    width: 28px;
    height: 28px;
    border-radius: 999px;
    border: 2px solid var(--pr-border);
    border-top-color: var(--pr-accent);
    margin: 0 auto 16px;
    animation: spin .7s linear infinite;
  }

  .pr-error {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 18px 22px;
    border-radius: var(--pr-radius);
    background: rgba(220,38,38,.06);
    border: 1px solid rgba(220,38,38,.18);
    margin-bottom: 24px;
  }

  .pr-error p {
    margin: 0;
    color: #991b1b;
    font-size: .875rem;
  }

  .pr-empty {
    text-align: center;
    padding: 42px 24px;
    color: var(--pr-muted);
    font-family: var(--pr-font-mono);
  }

  .pr-note {
    padding: 12px 20px;
    border-top: 1px solid var(--pr-border);
    background: var(--pr-surface2);
    font-size: .75rem;
    color: var(--pr-muted);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

/* ───────────────── Components ───────────────── */

const PrCard: React.FC<{
  title: string;
  count?: number;
  children: React.ReactNode;
}> = ({ title, count, children }) => (
  <div className="pr-card">
    <div className="pr-card-head">
      <div className="pr-card-title">
        <span className="pr-card-title-dot" />
        {title}
      </div>

      {count !== undefined && (
        <span className="pr-card-count">{count}</span>
      )}
    </div>

    {children}
  </div>
);

const EmptyRow = ({ message }: { message: string }) => (
  <div className="pr-empty">
    <Layers size={34} style={{ opacity: 0.2, marginBottom: 12 }} />
    <div>{message}</div>
  </div>
);

/* ───────────────── Main ───────────────── */

export const SalesReport: React.FC = () => {
  const [data, setData] = useState<SalesReportData>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async (from: string, to: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchSalesReport(from, to);
      setData(response.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load sales report');
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

      {/* Header */}
      <div className="pr-header">
        <div>
          <div className="pr-eyebrow">Reporting</div>
          <h1 className="pr-title">Sales Reports</h1>
        </div>

        {currentData && (
          <div className="pr-range-pill">
            <span className="pr-range-dot" />
            {selectedRange}
          </div>
        )}
      </div>

      {/* Filters */}
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

      {/* Error */}
      {error && (
        <div className="pr-error">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="pr-loading">
          <div className="pr-spinner" />
          <p className="pr-mono">Compiling sales metrics...</p>
        </div>
      )}

      {/* Data */}
      {!loading && currentData && (
        <>
          {/* KPI */}
          <div className="pr-kpi-grid">
            <div className="pr-kpi">
              <div className="pr-kpi-icon blue">
                <Globe2 size={17} />
              </div>

              <div className="pr-kpi-label">Market Reach</div>

              <div className="pr-kpi-value blue">
                {currentData.sales_volume_by_region.length}
              </div>

              <div className="pr-kpi-corner">
                <ChevronRight size={11} />
                regions
              </div>
            </div>

            <div className="pr-kpi">
              <div className="pr-kpi-icon green">
                <Package size={17} />
              </div>

              <div className="pr-kpi-label">Active Portfolio</div>

              <div className="pr-kpi-value green">
                {currentData.product_performance.length}
              </div>

              <div className="pr-kpi-corner">
                <ChevronRight size={11} />
                products
              </div>
            </div>

            <div className="pr-kpi">
              <div className="pr-kpi-icon warn">
                <CalendarDays size={17} />
              </div>

              <div className="pr-kpi-label">Data Points</div>

              <div className="pr-kpi-value warn">
                {currentData.sales_trends.length}
              </div>

              <div className="pr-kpi-corner">
                <ChevronRight size={11} />
                days
              </div>
            </div>

            <div className="pr-kpi">
              <div className="pr-kpi-icon gray">
                <TrendingUp size={17} />
              </div>

              <div className="pr-kpi-label">Gross Volume</div>

              <div className="pr-kpi-value">
                {formatCurrency(
                  currentData.product_performance.reduce(
                    (acc, p) => acc + Number(p.sales_total),
                    0
                  )
                )}
              </div>

              <div className="pr-kpi-corner">
                <ChevronRight size={11} />
                total sales
              </div>
            </div>
          </div>

          {/* Region */}
          <PrCard
            title="Sales Volume by Region"
            count={currentData.sales_volume_by_region.length}
          >
            {currentData.sales_volume_by_region.length > 0 ? (
              <>
                <div className="pr-table-wrap">
                  <table className="pr-table">
                    <thead>
                      <tr>
                        <th>Region</th>
                        <th>Orders</th>
                        <th className="pr-right">Sales Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentData.sales_volume_by_region.map((region) => (
                        <tr key={region.region}>
                          <td>
                            <strong>{region.region}</strong>
                          </td>

                          <td>
                            <span className="pr-mono">
                              {region.order_count}
                            </span>
                          </td>

                          <td className="pr-right">
                            <span className="pr-chip blue">
                              {formatCurrency(region.sales_total)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pr-note">
                  <BarChart3 size={14} />
                  Region is derived from client address in backend schema.
                </div>
              </>
            ) : (
              <EmptyRow message="No regional sales breakdown was returned." />
            )}
          </PrCard>

          {/* Product Performance */}
          <PrCard
            title="Product Performance"
            count={currentData.product_performance.length}
          >
            {currentData.product_performance.length > 0 ? (
              <div className="pr-table-wrap">
                <table className="pr-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Product</th>
                      <th>Qty Sold</th>
                      <th className="pr-right">Sales Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.product_performance.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <span className="pr-chip blue">
                            {product.reference}
                          </span>
                        </td>

                        <td>
                          <strong>{product.name}</strong>
                        </td>

                        <td>
                          <span className="pr-mono">
                            {product.quantity_sold}
                          </span>
                        </td>

                        <td className="pr-right">
                          <span className="pr-amount">
                            {formatCurrency(product.sales_total)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyRow message="No product performance rows were returned." />
            )}
          </PrCard>

          {/* Trends */}
          <PrCard
            title="Sales Trends"
            count={currentData.sales_trends.length}
          >
            {currentData.sales_trends.length > 0 ? (
              <div className="pr-table-wrap">
                <table className="pr-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Orders</th>
                      <th className="pr-right">Sales Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.sales_trends.map((trend) => (
                      <tr key={trend.date}>
                        <td>
                          <span className="pr-mono">
                            {trend.date}
                          </span>
                        </td>

                        <td>
                          <strong>{trend.order_count}</strong>
                        </td>

                        <td className="pr-right">
                          <span className="pr-amount">
                            {formatCurrency(trend.sales_total)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyRow message="No sales trend rows were returned." />
            )}
          </PrCard>

          {/* Empty */}
          {currentData.sales_volume_by_region.length === 0 &&
            currentData.product_performance.length === 0 && (
              <div className="pr-empty-main">
                <TrendingUp
                  size={52}
                  style={{ opacity: 0.2, marginBottom: 18 }}
                />

                <h3
                  style={{
                    fontFamily: 'var(--pr-font-head)',
                    marginBottom: 10,
                  }}
                >
                  No Sales Records
                </h3>

                <p
                  style={{
                    color: 'var(--pr-muted)',
                  }}
                >
                  No sales records found for{' '}
                  <span className="pr-mono">{selectedRange}</span>.
                </p>
              </div>
            )}
        </>
      )}

      {/* Initial Empty */}
      {!loading && !error && !currentData && (
        <div className="pr-empty-main">
          <BarChart3
            size={64}
            style={{
              opacity: 0.15,
              marginBottom: 20,
            }}
          />

          <h3
            style={{
              fontFamily: 'var(--pr-font-head)',
              marginBottom: 8,
            }}
          >
            Revenue Insights
          </h3>

          <p style={{ color: 'var(--pr-muted)' }}>
            Discover trends and performance metrics by selecting a date range.
          </p>
        </div>
      )}
    </section>
  );
};