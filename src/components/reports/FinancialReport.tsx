import React, { useEffect, useState } from 'react';
import { fetchFinancialReport } from '../../api/catalog';
import { formatCurrency } from '../../utils/currency';
import { PageHeader } from '../crud/PageHeader';
import { DataTable } from '../crud/DataTable';
import { Card } from '../common/Card';
import { ReportFilters } from './ReportFilters';
import { TrendingUp } from 'lucide-react';
import { getDefaultReportRange } from './reportUtils';
import type { FinancialReport as FinancialReportResponse } from '../../types/reports';

type FinancialReportData = FinancialReportResponse['data'] | null;

export const FinancialReport: React.FC = () => {
  const [data, setData] = useState<FinancialReportData>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async (from: string, to: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFinancialReport(from, to);
      setData(response.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load financial report');
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
      <PageHeader title="Financial Reports" eyebrow="Reporting" />

      <ReportFilters onApply={loadReport} onReset={() => { const { from, to } = getDefaultReportRange(); loadReport(from, to); }} loading={loading} />

      {currentData && (
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '4px', height: '20px', background: 'var(--primary)', borderRadius: '2px' }} />
          <p className="text-muted" style={{ margin: 0, fontWeight: 500 }}>
            Analysis for <span className="text-mono" style={{ color: 'var(--text-main)', background: 'var(--field-bg)', padding: '2px 6px', borderRadius: '4px' }}>{selectedRange}</span>
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
          <p className="text-muted" style={{ fontWeight: 500 }}>Generating financial report...</p>
        </div>
      )}

      {!loading && currentData && (
        <div className="admin-grid" style={{ gap: '24px' }}>
          <div className="admin-section" style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}>
            <div className="section-heading">
              <span className="eyebrow">P&L</span>
              <h2>Income Statement</h2>
            </div>
            <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="kpi-card">
                <span className="kpi-label">Revenue</span>
                <div className="kpi-value">{formatCurrency(currentData.income_statement.revenue)}</div>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Refunds</span>
                <div className="kpi-value red">{formatCurrency(currentData.income_statement.refunds)}</div>
              </div>
              <div className="kpi-card" style={{ background: 'var(--success-bg)', borderLeft: '3px solid var(--success-text)' }}>
                <span className="kpi-label" style={{ color: 'var(--success-text)' }}>Net Revenue</span>
                <div className="kpi-value" style={{ color: 'var(--success-text)' }}>{formatCurrency(currentData.income_statement.net_revenue)}</div>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">Confirmed Purchases</span>
                <div className="kpi-value">{formatCurrency(currentData.income_statement.confirmed_purchases)}</div>
              </div>
              <div className="kpi-card" style={{ 
                background: Number(currentData.income_statement.estimated_gross_profit) >= 0 ? 'var(--success-bg)' : 'var(--error-bg)',
                borderLeft: `3px solid ${Number(currentData.income_statement.estimated_gross_profit) >= 0 ? 'var(--success-text)' : 'var(--danger)'}`
              }}>
                <span className="kpi-label" style={{ color: Number(currentData.income_statement.estimated_gross_profit) >= 0 ? 'var(--success-text)' : 'var(--error-text)' }}>Estimated Gross Profit</span>
                <div className="kpi-value" style={{ color: Number(currentData.income_statement.estimated_gross_profit) >= 0 ? 'var(--success-text)' : 'var(--error-text)' }}>{formatCurrency(currentData.income_statement.estimated_gross_profit)}</div>
              </div>
            </div>
          </div>

          <div className="admin-section" style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}>
            <div className="section-heading">
              <span className="eyebrow">Assets & Liabilities</span>
              <h2>Balance Sheet</h2>
            </div>
            <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="kpi-card"><span className="kpi-label">Cash</span><div className="kpi-value">{formatCurrency(currentData.balance_sheet.assets.cash)}</div></div>
              <div className="kpi-card"><span className="kpi-label">Accounts Receivable</span><div className="kpi-value">{formatCurrency(currentData.balance_sheet.assets.accounts_receivable)}</div></div>
              <div className="kpi-card"><span className="kpi-label">Inventory</span><div className="kpi-value">{formatCurrency(currentData.balance_sheet.assets.inventory)}</div></div>
              <div className="kpi-card"><span className="kpi-label">Pending Purchase Orders</span><div className="kpi-value red">{formatCurrency(currentData.balance_sheet.liabilities.pending_purchase_orders)}</div></div>
              <div className="kpi-card" style={{ background: 'var(--info-bg)', borderLeft: '3px solid var(--info-text)' }}>
                <span className="kpi-label" style={{ color: 'var(--info-text)' }}>Estimated Retained Earnings</span>
                <div className="kpi-value" style={{ color: 'var(--info-text)' }}>{formatCurrency(currentData.balance_sheet.equity.estimated_retained_earnings)}</div>
              </div>
            </div>
          </div>

          <div className="admin-section" style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}>
            <div className="section-heading">
              <span className="eyebrow">Liquidity</span>
              <h2>Cash Flow Statement</h2>
            </div>
            <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div className="kpi-card"><span className="kpi-label">Customer Payments</span><div className="kpi-value green">{formatCurrency(currentData.cash_flow_statement.cash_inflows.customer_payments)}</div></div>
              <div className="kpi-card"><span className="kpi-label">Refunds Outflow</span><div className="kpi-value red">{formatCurrency(currentData.cash_flow_statement.cash_outflows.refunds)}</div></div>
              <div className="kpi-card"><span className="kpi-label">Confirmed Purchases</span><div className="kpi-value red">{formatCurrency(currentData.cash_flow_statement.cash_outflows.confirmed_purchases)}</div></div>
              <div className="kpi-card" style={{ 
                background: Number(currentData.cash_flow_statement.net_cash_flow) >= 0 ? 'var(--success-bg)' : 'var(--error-bg)',
                borderLeft: `3px solid ${Number(currentData.cash_flow_statement.net_cash_flow) >= 0 ? 'var(--success-text)' : 'var(--danger)'}`
              }}>
                <span className="kpi-label" style={{ color: Number(currentData.cash_flow_statement.net_cash_flow) >= 0 ? 'var(--success-text)' : 'var(--error-text)' }}>Net Cash Flow</span>
                <div className="kpi-value" style={{ color: Number(currentData.cash_flow_statement.net_cash_flow) >= 0 ? 'var(--success-text)' : 'var(--error-text)' }}>{formatCurrency(currentData.cash_flow_statement.net_cash_flow)}</div>
              </div>
            </div>
          </div>

          <Card title="General Ledger" className="fade-in shadow-sm" style={{ borderRadius: 'var(--radius-lg)' }}>
            {currentData.general_ledger.length > 0 ? (
              <div style={{ padding: '8px' }}>
                <DataTable headers={['Account', 'Debit', 'Credit']} loading={false}>
                  {currentData.general_ledger.map((entry, index) => (
                    <tr key={`${entry.account}-${index}`}>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{entry.account}</td>
                      <td className="text-right"><span className="price-tag" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}>{formatCurrency(entry.debit)}</span></td>
                      <td className="text-right"><span className="price-tag" style={{ background: 'var(--success-bg)', color: 'var(--success-text)' }}>{formatCurrency(entry.credit)}</span></td>
                    </tr>
                  ))}
                </DataTable>
              </div>
            ) : (
              <div className="erp-card-body text-muted" style={{ textAlign: 'center', padding: '40px' }}>No general ledger entries returned for this period.</div>
            )}
          </Card>

          {!currentData.general_ledger.length && (
            <div className="erp-card fade-in" style={{ textAlign: 'center', padding: '60px', borderRadius: 'var(--radius-lg)' }}>
              <TrendingUp size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.3 }} />
              <p className="text-muted" style={{ fontSize: '1.1rem' }}>No financial data was returned for <span className="text-mono">{selectedRange}</span>.</p>
            </div>
          )}
        </div>
      )}

      {!loading && !error && !currentData && (
        <div className="erp-card fade-in shadow-sm" style={{ textAlign: 'center', padding: '80px', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--glass-border)' }}>
          <TrendingUp size={64} style={{ color: 'var(--primary)', marginBottom: '20px', opacity: 0.2 }} />
          <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Ready to analyze</h3>
          <p className="text-muted">Use the date filters above to generate your financial insights.</p>
        </div>
      )}
    </section>
  );
};
