import React, { useEffect, useState } from 'react';
import { fetchPurchasingReport } from '../../api/catalog';
import { formatCurrency } from '../../utils/currency';
import { PageHeader } from '../crud/PageHeader';
import { DataTable } from '../crud/DataTable';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ReportFilters } from './ReportFilters';
import { Truck, AlertCircle } from 'lucide-react';
import { getDefaultReportRange } from './reportUtils';
import type { PurchasingReport as PurchasingReportResponse } from '../../types/reports';

type PurchasingReportData = PurchasingReportResponse['data'] | null;

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
  const selectedRange = currentData ? `${currentData.period.from} to ${currentData.period.to}` : 'all dates';

  return (
    <section className="admin-section">
      <PageHeader title="Purchasing Reports" eyebrow="Reporting" />
      <ReportFilters onApply={loadReport} onReset={() => { const { from, to } = getDefaultReportRange(); loadReport(from, to); }} loading={loading} />

      {currentData && (
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '4px', height: '20px', background: 'var(--primary)', borderRadius: '2px' }} />
          <p className="text-muted" style={{ margin: 0, fontWeight: 500 }}>
            Procurement insights for <span className="text-mono" style={{ color: 'var(--text-main)', background: 'var(--field-bg)', padding: '2px 6px', borderRadius: '4px' }}>{selectedRange}</span>
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
          <p className="text-muted" style={{ fontWeight: 500 }}>Analyzing procurement data...</p>
        </div>
      )}

      {!loading && currentData && (
        <div className="admin-grid" style={{ gap: '24px' }}>
          <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="kpi-card" style={{ background: 'var(--success-bg)', borderLeft: '3px solid var(--success-text)' }}>
              <span className="kpi-label" style={{ color: 'var(--success-text)' }}>Total Spend</span>
              <div className="kpi-value green">{formatCurrency(currentData.expenditure_analysis.total_spend)}</div>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Active Suppliers</span>
              <div className="kpi-value">{currentData.supplier_performance.length}</div>
            </div>
            <div className="kpi-card" style={{ background: 'var(--warning-bg)', borderLeft: '3px solid var(--warning-text)' }}>
              <span className="kpi-label" style={{ color: 'var(--warning-text)' }}>Pending Orders</span>
              <div className="kpi-value" style={{ color: 'var(--warning-text)' }}>{currentData.pending_purchase_orders.length}</div>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Categories Involved</span>
              <div className="kpi-value">{currentData.expenditure_analysis.by_category.length}</div>
            </div>
          </div>

          <Card title="Supplier Performance" className="fade-in shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            {currentData.supplier_performance.length > 0 ? (
              <div style={{ padding: '8px' }}>
                <DataTable headers={['Supplier', 'Orders', 'Confirmed Spend', 'Pending Spend', 'Avg Order Value']} loading={false}>
                  {currentData.supplier_performance.map((supplier) => (
                    <tr key={supplier.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{supplier.name}</td>
                      <td>{supplier.purchase_count}</td>
                      <td className="text-right" style={{ fontWeight: 500 }}>{formatCurrency(supplier.confirmed_spend)}</td>
                      <td className="text-right text-muted">{formatCurrency(supplier.pending_spend)}</td>
                      <td className="text-right"><span className="price-tag" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}>{formatCurrency(supplier.average_order_value)}</span></td>
                    </tr>
                  ))}
                </DataTable>
              </div>
            ) : (
              <div className="erp-card-body text-muted" style={{ textAlign: 'center', padding: '40px' }}>No supplier performance rows were returned for this period.</div>
            )}
          </Card>

          <Card title="Pending Purchase Orders" className="fade-in shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            {currentData.pending_purchase_orders.length > 0 ? (
              <div style={{ padding: '8px' }}>
                <DataTable headers={['Date', 'Supplier', 'Total', 'Status']} loading={false}>
                  {currentData.pending_purchase_orders.map((order) => (
                    <tr key={order.id}>
                      <td className="text-mono text-muted" style={{ fontSize: '0.85rem' }}>{order.created_at}</td>
                      <td style={{ fontWeight: 500 }}>{order.supplier || '—'}</td>
                      <td className="text-right" style={{ fontWeight: 600 }}>{formatCurrency(order.total)}</td>
                      <td><Badge variant="warning" dot>pending</Badge></td>
                    </tr>
                  ))}
                </DataTable>
              </div>
            ) : (
              <div className="erp-card-body text-muted" style={{ textAlign: 'center', padding: '40px' }}>No pending purchase orders were returned.</div>
            )}
          </Card>

          <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            <Card title="Expenditure by Category" className="fade-in shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
              {currentData.expenditure_analysis.by_category.length > 0 ? (
                <div style={{ padding: '8px' }}>
                  <DataTable headers={['Category', 'Total Spend']} loading={false}>
                    {currentData.expenditure_analysis.by_category.map((item) => (
                      <tr key={item.category}>
                        <td style={{ fontWeight: 500 }}>{item.category}</td>
                        <td className="text-right"><span className="price-tag" style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}>{formatCurrency(item.total_spend)}</span></td>
                      </tr>
                    ))}
                  </DataTable>
                </div>
              ) : (
                <div className="erp-card-body text-muted" style={{ textAlign: 'center', padding: '40px' }}>No category expenditure rows were returned.</div>
              )}
            </Card>

            <Card title="Top Procured Products" className="fade-in shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
              {currentData.expenditure_analysis.top_products.length > 0 ? (
                <div style={{ padding: '8px' }}>
                  <DataTable headers={['Product', 'Qty', 'Total Spend']} loading={false}>
                    {currentData.expenditure_analysis.top_products.map((product) => (
                      <tr key={product.id}>
                        <td style={{ fontWeight: 500 }}>{product.name}</td>
                        <td>{product.quantity}</td>
                        <td className="text-right" style={{ fontWeight: 600 }}>{formatCurrency(product.total_spend)}</td>
                      </tr>
                    ))}
                  </DataTable>
                </div>
              ) : (
                <div className="erp-card-body text-muted" style={{ textAlign: 'center', padding: '40px' }}>No product expenditure rows were returned.</div>
              )}
            </Card>
          </div>

          {currentData.supplier_performance.length === 0 && currentData.pending_purchase_orders.length === 0 && (
            <div className="erp-card fade-in" style={{ textAlign: 'center', padding: '60px', borderRadius: 'var(--radius-lg)' }}>
              <Truck size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.3 }} />
              <p className="text-muted" style={{ fontSize: '1.1rem' }}>No purchasing data available for <span className="text-mono">{selectedRange}</span>.</p>
            </div>
          )}
        </div>
      )}

      {!loading && !error && !currentData && (
        <div className="erp-card fade-in shadow-sm" style={{ textAlign: 'center', padding: '80px', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--glass-border)' }}>
          <Truck size={64} style={{ color: 'var(--primary)', marginBottom: '20px', opacity: 0.2 }} />
          <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Purchasing Analytics</h3>
          <p className="text-muted">Monitor your spending and supplier relationships by selecting a date range above.</p>
        </div>
      )}
    </section>
  );
};
