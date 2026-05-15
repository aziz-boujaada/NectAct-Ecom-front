import React, { useEffect, useState } from 'react';
import { fetchSalesReport } from '../../api/catalog';
import { formatCurrency } from '../../utils/currency';
import { PageHeader } from '../crud/PageHeader';
import { DataTable } from '../crud/DataTable';
import { Card } from '../common/Card';
import { ReportFilters } from './ReportFilters';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { getDefaultReportRange } from './reportUtils';
import type { SalesReport as SalesReportResponse } from '../../types/reports';

type SalesReportData = SalesReportResponse['data'] | null;

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
  const selectedRange = currentData ? `${currentData.period.from} to ${currentData.period.to}` : 'all dates';

  return (
    <section className="admin-section">
      <PageHeader title="Sales Reports" eyebrow="Reporting" />
      <ReportFilters onApply={loadReport} onReset={() => { const { from, to } = getDefaultReportRange(); loadReport(from, to); }} loading={loading} />

      {currentData && (
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '4px', height: '20px', background: 'var(--primary)', borderRadius: '2px' }} />
          <p className="text-muted" style={{ margin: 0, fontWeight: 500 }}>
            Sales performance for <span className="text-mono" style={{ color: 'var(--text-main)', background: 'var(--field-bg)', padding: '2px 6px', borderRadius: '4px' }}>{selectedRange}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="erp-card shadow-sm fade-in" style={{ borderLeft: '4px solid var(--danger)', marginBottom: '24px', background: 'var(--error-bg)' }}>
          <div className="erp-card-body"><p style={{ color: 'var(--error-text)', margin: 0, fontWeight: 500 }}>{error}</p></div>
        </div>
      )}

      {loading && (
        <div className="erp-card fade-in" style={{ textAlign: 'center', padding: '60px', marginBottom: '24px' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px', width: '32px', height: '32px', borderColor: 'var(--primary)', borderRightColor: 'transparent' }} />
          <p className="text-muted" style={{ fontWeight: 500 }}>Compiling sales metrics...</p>
        </div>
      )}

      {!loading && currentData && (
        <div className="admin-grid" style={{ gap: '24px' }}>
          <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="kpi-card" style={{ background: 'var(--info-bg)', borderLeft: '3px solid var(--primary)' }}>
              <span className="kpi-label" style={{ color: 'var(--primary)' }}>Market Reach</span>
              <div className="kpi-value blue">{currentData.sales_volume_by_region.length} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Regions</span></div>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Active Portfolio</span>
              <div className="kpi-value">{currentData.product_performance.length} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Products</span></div>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Data Points</span>
              <div className="kpi-value">{currentData.sales_trends.length} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Days</span></div>
            </div>
            <div className="kpi-card" style={{ background: 'var(--success-bg)', borderLeft: '3px solid var(--success-text)' }}>
              <span className="kpi-label" style={{ color: 'var(--success-text)' }}>Gross Volume</span>
              <div className="kpi-value green">{formatCurrency(currentData.product_performance.reduce((acc, p) => acc + Number(p.sales_total), 0))}</div>
            </div>
          </div>

          <Card title="Sales Volume by Region" className="fade-in shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            {currentData.sales_volume_by_region.length > 0 ? (
              <div style={{ padding: '8px' }}>
                <DataTable headers={['Region', 'Orders', 'Sales Total']} loading={false}>
                  {currentData.sales_volume_by_region.map((region) => (
                    <tr key={region.region}>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{region.region}</td>
                      <td>{region.order_count}</td>
                      <td className="text-right"><span className="price-tag" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}>{formatCurrency(region.sales_total)}</span></td>
                    </tr>
                  ))}
                </DataTable>
              </div>
            ) : (
              <div className="erp-card-body text-muted" style={{ textAlign: 'center', padding: '40px' }}>No regional sales breakdown was returned.</div>
            )}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--glass-border)', background: 'var(--panel-bg)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={14} /> Region is derived from client address in the backend schema.
              </p>
            </div>
          </Card>

          <Card title="Product Performance" className="fade-in shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            {currentData.product_performance.length > 0 ? (
              <div style={{ padding: '8px' }}>
                <DataTable headers={['Reference', 'Product', 'Qty Sold', 'Sales Total']} loading={false}>
                  {currentData.product_performance.map((product) => (
                    <tr key={product.id}>
                      <td><code className="ref-tag" style={{ background: 'var(--field-bg)', border: '1px solid var(--glass-border)' }}>{product.reference}</code></td>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{product.name}</td>
                      <td>{product.quantity_sold}</td>
                      <td className="text-right"><span className="price-tag" style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}>{formatCurrency(product.sales_total)}</span></td>
                    </tr>
                  ))}
                </DataTable>
              </div>
            ) : (
              <div className="erp-card-body text-muted" style={{ textAlign: 'center', padding: '40px' }}>No product performance rows were returned.</div>
            )}
          </Card>

          <Card title="Sales Trends" className="fade-in shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            {currentData.sales_trends.length > 0 ? (
              <div style={{ padding: '8px' }}>
                <DataTable headers={['Date', 'Orders', 'Sales Total']} loading={false}>
                  {currentData.sales_trends.map((trend) => (
                    <tr key={trend.date}>
                      <td className="text-mono" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{trend.date}</td>
                      <td style={{ fontWeight: 500 }}>{trend.order_count}</td>
                      <td className="text-right" style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatCurrency(trend.sales_total)}</td>
                    </tr>
                  ))}
                </DataTable>
              </div>
            ) : (
              <div className="erp-card-body text-muted" style={{ textAlign: 'center', padding: '40px' }}>No sales trend rows were returned.</div>
            )}
          </Card>

          {currentData.sales_volume_by_region.length === 0 && currentData.product_performance.length === 0 && (
            <div className="erp-card fade-in" style={{ textAlign: 'center', padding: '60px', borderRadius: 'var(--radius-lg)' }}>
              <TrendingUp size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.3 }} />
              <p className="text-muted" style={{ fontSize: '1.1rem' }}>No sales records found for <span className="text-mono">{selectedRange}</span>.</p>
            </div>
          )}
        </div>
      )}

      {!loading && !error && !currentData && (
        <div className="erp-card fade-in shadow-sm" style={{ textAlign: 'center', padding: '80px', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--glass-border)' }}>
          <BarChart3 size={64} style={{ color: 'var(--primary)', marginBottom: '20px', opacity: 0.2 }} />
          <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Revenue Insights</h3>
          <p className="text-muted">Discover trends and performance metrics by selecting a date range.</p>
        </div>
      )}
    </section>
  );
};
