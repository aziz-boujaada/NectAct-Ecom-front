import React, { useEffect, useState } from 'react';
import { fetchInventoryReport } from '../../api/catalog';
import { formatCurrency } from '../../utils/currency';
import { PageHeader } from '../crud/PageHeader';
import { DataTable } from '../crud/DataTable';
import { Card } from '../common/Card';
import { ReportFilters } from './ReportFilters';
import { Box } from 'lucide-react';
import { getDefaultReportRange } from './reportUtils';
import type { InventoryReport as InventoryReportResponse } from '../../types/reports';

type InventoryReportData = InventoryReportResponse['data'] | null;

export const InventoryReport: React.FC = () => {
  const [data, setData] = useState<InventoryReportData>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async (from: string, to: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchInventoryReport(from, to);
      setData(response.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load inventory report');
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
      <PageHeader title="Inventory Reports" eyebrow="Reporting" />
      <ReportFilters onApply={loadReport} onReset={() => { const { from, to } = getDefaultReportRange(); loadReport(from, to); }} loading={loading} />

      {currentData && (
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '4px', height: '20px', background: 'var(--primary)', borderRadius: '2px' }} />
          <p className="text-muted" style={{ margin: 0, fontWeight: 500 }}>
            Inventory status for <span className="text-mono" style={{ color: 'var(--text-main)', background: 'var(--field-bg)', padding: '2px 6px', borderRadius: '4px' }}>{selectedRange}</span>
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
          <p className="text-muted" style={{ fontWeight: 500 }}>Fetching inventory data...</p>
        </div>
      )}

      {!loading && currentData && (
        <div className="admin-grid" style={{ gap: '24px' }}>
          <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="kpi-card">
              <span className="kpi-label">Total Products</span>
              <div className="kpi-value">{currentData.stock_levels.total_products}</div>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Total Units</span>
              <div className="kpi-value">{currentData.stock_levels.total_units}</div>
            </div>
            <div className="kpi-card" style={{ background: 'var(--error-bg)', borderLeft: '3px solid var(--danger)' }}>
              <span className="kpi-label" style={{ color: 'var(--danger)' }}>Out of Stock</span>
              <div className="kpi-value red">{currentData.stock_levels.out_of_stock_products}</div>
            </div>
            <div className="kpi-card" style={{ background: 'var(--warning-bg)', borderLeft: '3px solid var(--warning-text)' }}>
              <span className="kpi-label" style={{ color: 'var(--warning-text)' }}>Low Stock</span>
              <div className="kpi-value" style={{ color: 'var(--warning-text)' }}>{currentData.stock_levels.low_stock_products}</div>
            </div>
          </div>

          <Card title="Stock Levels" className="fade-in shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            {currentData.stock_levels.items.length > 0 ? (
              <div style={{ padding: '8px' }}>
                <DataTable headers={['Reference', 'Product', 'Stock', 'Min Stock', 'Alert Stock']} loading={false}>
                  {currentData.stock_levels.items.map((item) => (
                    <tr key={item.id}>
                      <td><code className="ref-tag" style={{ background: 'var(--field-bg)', border: '1px solid var(--glass-border)' }}>{item.reference}</code></td>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</td>
                      <td>
                        <span style={{ 
                          color: item.stock <= item.min_stock ? 'var(--danger)' : item.stock <= item.alert_stock ? 'var(--warning-text)' : 'inherit',
                          fontWeight: item.stock <= item.alert_stock ? 700 : 400
                        }}>
                          {item.stock}
                        </span>
                      </td>
                      <td className="text-muted">{item.min_stock}</td>
                      <td className="text-muted">{item.alert_stock}</td>
                    </tr>
                  ))}
                </DataTable>
              </div>
            ) : (
              <div className="erp-card-body text-muted" style={{ textAlign: 'center', padding: '40px' }}>No stock level items returned for this period.</div>
            )}
          </Card>

          <Card title="Inventory Valuation" className="fade-in shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', background: 'var(--success-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
              <span className="kpi-label" style={{ color: 'var(--success-text)', margin: 0 }}>Total Inventory Value</span>
              <div className="kpi-value green" style={{ fontSize: '1.4rem' }}>{formatCurrency(currentData.inventory_valuation.total_value)}</div>
            </div>
            {currentData.inventory_valuation.items.length > 0 ? (
              <div style={{ padding: '8px' }}>
                <DataTable headers={['Reference', 'Product', 'Stock', 'Average Cost', 'Inventory Value']} loading={false}>
                  {currentData.inventory_valuation.items.map((item) => (
                    <tr key={item.id}>
                      <td><code className="ref-tag">{item.reference}</code></td>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>{item.stock}</td>
                      <td className="text-right text-muted">{formatCurrency(item.average_cost)}</td>
                      <td className="text-right"><span className="price-tag" style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}>{formatCurrency(item.inventory_value)}</span></td>
                    </tr>
                  ))}
                </DataTable>
              </div>
            ) : (
              <div className="erp-card-body text-muted" style={{ textAlign: 'center', padding: '40px' }}>No inventory valuation items returned for this period.</div>
            )}
          </Card>

          <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <Card title="Turnover Rates" className="fade-in shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
              {currentData.turnover_rates.length > 0 ? (
                <div style={{ padding: '8px' }}>
                  <DataTable headers={['Product', 'Sold', 'Turnover', 'Sales']} loading={false}>
                    {currentData.turnover_rates.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                        <td>{item.sold_quantity}</td>
                        <td className="text-right"><span className="price-tag" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}>{item.turnover_rate}</span></td>
                        <td className="text-right" style={{ fontWeight: 600 }}>{formatCurrency(item.sales_total)}</td>
                      </tr>
                    ))}
                  </DataTable>
                </div>
              ) : (
                <div className="erp-card-body text-muted" style={{ textAlign: 'center', padding: '40px' }}>No turnover records returned.</div>
              )}
            </Card>

            <Card title="Warehouse Efficiency" className="fade-in shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
              <div className="kpi-values" style={{ padding: '20px', display: 'grid', gap: '16px' }}>
                <div className="kpi-item" style={{ padding: '16px', background: 'var(--field-bg)', borderRadius: 'var(--radius-md)' }}>
                  <span className="kpi-label">Movement Throughput</span>
                  <div className="kpi-value blue">{currentData.warehouse_efficiency.movement_throughput}</div>
                </div>
                <div className="kpi-item" style={{ padding: '16px', background: 'var(--field-bg)', borderRadius: 'var(--radius-md)' }}>
                  <span className="kpi-label">Active SKU Ratio</span>
                  <div className="kpi-value">{currentData.warehouse_efficiency.active_sku_ratio}</div>
                </div>
                <div className="kpi-item" style={{ padding: '16px', background: 'var(--field-bg)', borderRadius: 'var(--radius-md)' }}>
                  <span className="kpi-label">Low Stock Ratio</span>
                  <div className="kpi-value red">{currentData.warehouse_efficiency.low_stock_ratio}</div>
                </div>
              </div>
            </Card>
          </div>

          {currentData.stock_levels.items.length === 0 && currentData.inventory_valuation.items.length === 0 && (
            <div className="erp-card fade-in" style={{ textAlign: 'center', padding: '60px', borderRadius: 'var(--radius-lg)' }}>
              <Box size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.3 }} />
              <p className="text-muted" style={{ fontSize: '1.1rem' }}>No inventory data available for <span className="text-mono">{selectedRange}</span>.</p>
            </div>
          )}
        </div>
      )}

      {!loading && !error && !currentData && (
        <div className="erp-card fade-in shadow-sm" style={{ textAlign: 'center', padding: '80px', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--glass-border)' }}>
          <Box size={64} style={{ color: 'var(--primary)', marginBottom: '20px', opacity: 0.2 }} />
          <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Inventory Intelligence</h3>
          <p className="text-muted">Analyze your stock levels and warehouse performance by selecting a date range.</p>
        </div>
      )}
    </section>
  );
};
