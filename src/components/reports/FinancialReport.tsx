import React, { useEffect, useMemo, useState } from 'react';
import { fetchFinancialReport } from '../../api/catalog';
import { formatCurrency } from '../../utils/currency';
import { ReportFilters } from './ReportFilters';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Landmark,
  Wallet,
  Receipt,
  Activity,
  Layers,
  BarChart3,
} from 'lucide-react';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  CategoryScale,
  LinearScale,
  Legend,
  Title,
  Tooltip,
} from 'chart.js';
import { getDefaultReportRange } from './reportUtils';
import type { FinancialReport as FinancialReportResponse } from '../../types/reports';

type FinancialReportData = FinancialReportResponse['data'] | null;
type ReportViewMode = 'normal' | 'charts';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title,
);

function toNumber(value: string | number | undefined) {
  return Number(value ?? 0);
}

function buildBarOptions(horizontal = false) {
  return {
    indexAxis: horizontal ? ('y' as const) : ('x' as const),
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle' as const,
          boxWidth: 10,
          color: '#4b5563',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const rawValue = context.parsed?.y ?? context.parsed?.x ?? context.raw ?? 0;
            return `${context.dataset.label}: ${formatCurrency(Number(rawValue))}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: { color: 'rgba(15, 23, 42, 0.06)' },
        ticks: {
          color: '#6b7280',
          callback: (value: any) => formatCurrency(Number(value)).replace(/\.00(?=\s|$)/, ''),
        },
      },
      y: {
        stacked: false,
        grid: { color: 'rgba(15, 23, 42, 0.06)' },
        ticks: {
          color: '#6b7280',
        },
      },
    },
  };
}

function buildLineOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#4b5563' },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const rawValue = context.parsed?.y ?? context.parsed?.x ?? context.raw ?? 0;
            return `${context.dataset.label}: ${formatCurrency(Number(rawValue))}`;
          },
        },
      },
    },
    scales: {
      x: { grid: { color: 'rgba(15, 23, 42, 0.06)' }, ticks: { color: '#6b7280' } },
      y: {
        grid: { color: 'rgba(15, 23, 42, 0.06)' },
        ticks: {
          color: '#6b7280',
          callback: (value: any) => formatCurrency(Number(value)).replace(/\.00(?=\s|$)/, ''),
        },
      },
    },
  };
}

function buildRadarOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        ticks: { color: '#6b7280' },
        grid: { color: 'rgba(15, 23, 42, 0.06)' },
      },
    },
    plugins: { legend: { position: 'bottom' as const, labels: { color: '#4b5563' } } },
  };
}

/* ───────────────────────────────────────────────────────────── */
/* Premium styles */
/* ───────────────────────────────────────────────────────────── */


const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=Instrument+Sans:wght@400;500;600&display=swap');

  .fr-root{
    --fr-bg:#f4f5f7;
    --fr-surface:#ffffff;
    --fr-surface2:#f0f1f4;
    --fr-border:rgba(0,0,0,0.08);
    --fr-border-hi:rgba(0,0,0,0.14);

    --fr-text:#0f1117;
    --fr-muted:#6b7280;
    --fr-dim:#4b5563;

    --fr-accent:#1a6af5;
    --fr-green:#0aaa82;
    --fr-red:#dc2626;
    --fr-warn:#d97706;

    --fr-radius:14px;

    background:var(--fr-bg);
    color:var(--fr-text);
    min-height:100vh;
    padding:32px 40px 80px;
    font-family:'Instrument Sans',sans-serif;
    box-sizing:border-box;
  }

  .fr-header{
    display:flex;
    align-items:flex-end;
    justify-content:space-between;
    margin-bottom:34px;
    padding-bottom:28px;
    border-bottom:1px solid var(--fr-border);
    position:relative;
  }

  .fr-header::after{
    content:'';
    position:absolute;
    left:0;
    bottom:-1px;
    width:78px;
    height:2px;
    border-radius:2px;
    background:var(--fr-accent);
  }

  .fr-eyebrow{
    font-family:'DM Mono',monospace;
    font-size:.65rem;
    letter-spacing:.12em;
    text-transform:uppercase;
    color:var(--fr-accent);
    display:flex;
    align-items:center;
    gap:6px;
    margin-bottom:6px;
  }

  .fr-eyebrow::before{
    content:'';
    width:12px;
    height:1px;
    display:block;
    background:var(--fr-accent);
  }

  .fr-title{
    margin:0;
    font-size:1.6rem;
    font-weight:800;
    line-height:1;
    letter-spacing:-0.03em;
    font-family:'Syne',sans-serif;
  }

  .fr-range{
    display:flex;
    align-items:center;
    gap:10px;
    padding:8px 14px;
    border-radius:100px;
    background:var(--fr-surface);
    border:1px solid var(--fr-border-hi);
    font-family:'DM Mono',monospace;
    font-size:.76rem;
    color:var(--fr-dim);
  }

  .fr-range-dot{
    width:6px;
    height:6px;
    border-radius:50%;
    background:var(--fr-accent);
    box-shadow:0 0 10px rgba(26,106,245,.4);
  }

  .fr-filters{
    margin-bottom:30px;
  }

  .fr-filters-top{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:16px;
    margin-bottom:16px;
    flex-wrap:wrap;
  }

  .fr-view-copy{
    min-width:220px;
  }

  .fr-view-label{
    font-family:'DM Mono',monospace;
    font-size:.7rem;
    text-transform:uppercase;
    letter-spacing:.15em;
    color:var(--fr-accent);
    margin-bottom:8px;
  }

  .fr-view-hint{
    margin:0;
    color:var(--fr-muted);
    font-size:.88rem;
    line-height:1.5;
  }

  .fr-view-toggle{
    display:inline-flex;
    align-items:center;
    gap:6px;
    padding:6px;
    border-radius:999px;
    background:var(--fr-surface);
    border:1px solid var(--fr-border);
    box-shadow:0 1px 4px rgba(0,0,0,.04);
  }

  .fr-view-toggle button{
    appearance:none;
    border:none;
    background:transparent;
    color:var(--fr-muted);
    font-family:'DM Mono',monospace;
    font-size:.74rem;
    letter-spacing:.06em;
    text-transform:uppercase;
    padding:10px 14px;
    border-radius:999px;
    cursor:pointer;
    transition:.2s ease;
  }

  .fr-view-toggle button:hover{
    color:var(--fr-text);
    background:var(--fr-surface2);
  }

  .fr-view-toggle button.active{
    background:var(--fr-accent);
    color:#fff;
    box-shadow:0 8px 18px rgba(26,106,245,.18);
  }

  .fr-charts-grid{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
    gap:14px;
    margin-bottom:28px;
  }

  .fr-chart-body{
    height:320px;
    padding:18px 20px 22px;
  }

  .fr-chart-body.tall{
    height:340px;
  }

  .fr-chart-body.short{
    height:290px;
  }

  .fr-chart-caption{
    margin:0 20px 18px;
    color:var(--fr-muted);
    font-size:.82rem;
    line-height:1.5;
  }

  .fr-error{
    display:flex;
    align-items:flex-start;
    gap:14px;
    padding:18px 22px;
    border-radius:var(--fr-radius);
    border:1px solid rgba(220,38,38,.18);
    background:rgba(220,38,38,.05);
    margin-bottom:24px;
    animation:fr-fade .3s ease;
  }

  .fr-error p{
    margin:0;
    color:#991b1b;
    font-size:.88rem;
  }

  .fr-loading{
    text-align:center;
    padding:80px 20px;
    animation:fr-fade .3s ease;
  }

  .fr-spinner{
    width:28px;
    height:28px;
    border-radius:50%;
    border:2px solid var(--fr-border);
    border-top-color:var(--fr-accent);
    animation:fr-spin .7s linear infinite;
    margin:0 auto 16px;
  }

  .fr-loading p{
    margin:0;
    font-family:'DM Mono',monospace;
    color:var(--fr-muted);
    font-size:.78rem;
    letter-spacing:.08em;
  }

  .fr-section{
    margin-bottom:28px;
  }

  .fr-section-head{
    margin-bottom:16px;
  }

  .fr-section-label{
    font-family:'DM Mono',monospace;
    font-size:.65rem;
    text-transform:uppercase;
    letter-spacing:.12em;
    color:var(--fr-accent);
    margin-bottom:4px;
  }

  .fr-section-title{
    font-family:'Syne',sans-serif;
    font-size:1.15rem;
    font-weight:800;
    letter-spacing:-0.02em;
    margin:0;
    color:var(--fr-text);
  }

  .fr-kpis{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(210px,1fr));
    gap:14px;
    margin-bottom: 28px;
  }

  .fr-kpi{
    background: var(--fr-surface);
    border: 1px solid var(--fr-border);
    border-radius: var(--fr-radius);
    padding: 22px 24px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    animation: fr-fadeup 0.45s ease both;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .fr-kpi:hover {
    border-color: var(--fr-border-hi);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }

  .fr-kpi::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 60%);
    pointer-events: none;
  }

  .fr-kpi-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
    background: rgba(255,255,255,0.05);
  }

  .fr-kpi-icon.blue  { background: rgba(26,106,245,0.09);  color: var(--fr-accent);  }
  .fr-kpi-icon.green { background: rgba(10,170,130,0.1);   color: var(--fr-green); }
  .fr-kpi-icon.red    { background: rgba(220,38,38,0.1);    color: var(--fr-red);    }
  .fr-kpi-icon.warn   { background: rgba(217,119,6,0.1);    color: var(--fr-warn);    }

  .fr-kpi-label {
    font-size: 0.72rem;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--fr-muted);
    margin-bottom: 8px;
  }

  .fr-kpi-value {
    font-family: 'Syne', sans-serif;
    font-size: 1.45rem;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
    color: var(--fr-text);
  }

  .fr-kpi-value.blue  { color: var(--fr-accent);  }
  .fr-kpi-value.green { color: var(--fr-green); }
  .fr-kpi-value.red   { color: var(--fr-red);    }
  .fr-kpi-value.warn  { color: var(--fr-warn);    }

  .fr-kpi-corner {
    position: absolute;
    bottom: 16px; right: 18px;
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem;
    color: var(--fr-muted);
    display: flex; align-items: center; gap: 4px;
    opacity: 0.6;
  }

  .fr-card {
    background: var(--fr-surface);
    border: 1px solid var(--fr-border);
    border-radius: var(--fr-radius);
    overflow: hidden;
    margin-bottom: 14px;
    animation: fr-fadeup 0.5s ease both;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  }

  .fr-card:hover { border-color: var(--fr-border-hi); box-shadow: 0 4px 16px rgba(0,0,0,0.09); }

  .fr-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    border-bottom: 1px solid var(--fr-border);
  }

  .fr-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--fr-text);
    letter-spacing: -0.01em;
    display: flex; align-items: center; gap: 10px;
  }

  .fr-card-title-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--fr-accent);
    flex-shrink: 0;
  }

  .fr-card-count {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    color: var(--fr-muted);
    background: var(--fr-surface2);
    border: 1px solid var(--fr-border);
    border-radius: 100px;
    padding: 3px 10px;
  }

  .fr-table-wrap{
    overflow-x:auto;
  }

  .fr-table{
    width:100%;
    border-collapse:collapse;
    font-size:.8rem;
  }

.fr-table th{
  padding:10px 16px;
  text-align:left;
  white-space:nowrap;
  font-family:'DM Mono',monospace;
  font-size:.62rem;
  letter-spacing:.08em;
  text-transform:uppercase;
  color:var(--fr-muted);
  font-weight:400;
}

.fr-table td{
  padding:10px 16px;
  border-bottom:1px solid var(--fr-border);
  color:var(--fr-dim);
}

  .fr-table tbody tr:last-child td{
    border-bottom:none;
  }

  .fr-table tbody tr:hover{
    background:var(--fr-surface2);
  }

  .fr-table .right{
    text-align:right;
  }

  .fr-strong{
    font-weight:600;
    color:var(--fr-text);
  }

  .fr-chip{
    display:inline-flex;
    align-items:center;
    padding:4px 10px;
    border-radius:7px;
    font-size:.72rem;
    font-family:'DM Mono',monospace;
    font-weight:500;
  }

  .fr-chip.blue{
    background:rgba(26,106,245,.08);
    color:var(--fr-accent);
  }

  .fr-chip.green{
    background:rgba(10,170,130,.1);
    color:var(--fr-green);
  }

  .fr-chip.red{
    background:rgba(220,38,38,.08);
    color:var(--fr-red);
  }

  .fr-empty{
    text-align:center;
    padding:52px 24px;
  }

  .fr-empty-icon{
    width:52px;
    height:52px;
    margin:0 auto 16px;
    opacity:.15;
    display:flex;
    align-items:center;
    justify-content:center;
  }

  .fr-empty p{
    margin:0;
    color:var(--fr-muted);
    font-size:.82rem;
    font-family:'DM Mono',monospace;
  }

  .fr-zero{
    text-align:center;
    padding:100px 40px;
  }

  .fr-zero-icon{
    width:82px;
    height:82px;
    margin:0 auto 24px;
    border-radius:24px;
    background:var(--fr-surface);
    border:1px solid var(--fr-border);
    display:flex;
    align-items:center;
    justify-content:center;
    color:var(--fr-muted);
    opacity:.5;
  }

  .fr-zero h3{
    margin:0 0 10px;
    font-family:'Syne',sans-serif;
    font-size:1.45rem;
    letter-spacing:-0.02em;
  }

  .fr-zero p{
    margin:0;
    max-width:360px;
    margin-inline:auto;
    line-height:1.6;
    color:var(--fr-muted);
  }

  @keyframes fr-spin{
    to{transform:rotate(360deg)}
  }

  @keyframes fr-fade{
    from{opacity:0}
    to{opacity:1}
  }

  @keyframes fr-fadeup{
    from{
      opacity:0;
      transform:translateY(10px);
    }
    to{
      opacity:1;
      transform:translateY(0);
    }
  }
`;

/* ───────────────────────────────────────────────────────────── */
/* Tiny components */
/* ───────────────────────────────────────────────────────────── */

const FrCard: React.FC<{
  title: string;
  count?: number;
  children: React.ReactNode;
}> = ({ title, count, children }) => (
  <div className="fr-card">
    <div className="fr-card-head">
      <div className="fr-card-title">
        <span className="fr-card-dot" />
        {title}
      </div>

      {count !== undefined && (
        <div className="fr-card-count">
          {count}
        </div>
      )}
    </div>

    {children}
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="fr-empty">
    <div className="fr-empty-icon">
      <Layers size={36} />
    </div>

    <p>{message}</p>
  </div>
);

/* ───────────────────────────────────────────────────────────── */
/* Main component */
/* ───────────────────────────────────────────────────────────── */

export const FinancialReport: React.FC = () => {
  const [data, setData] = useState<FinancialReportData>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ReportViewMode>('normal');

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

  const selectedRange = currentData
    ? `${currentData.period.from} → ${currentData.period.to}`
    : 'all dates';

  const chartData = useMemo(() => {
    if (!currentData) return null;

    const incomeValues = [
      toNumber(currentData.income_statement.revenue),
      toNumber(currentData.income_statement.refunds),
      toNumber(currentData.income_statement.net_revenue),
      toNumber(currentData.income_statement.confirmed_purchases),
      toNumber(currentData.income_statement.estimated_gross_profit),
      toNumber(currentData.income_statement.net_profit),
    ];

    const balanceValues = [
      toNumber(currentData.balance_sheet.assets.cash),
      toNumber(currentData.balance_sheet.assets.accounts_receivable),
      toNumber(currentData.balance_sheet.assets.inventory),
      toNumber(currentData.balance_sheet.liabilities.pending_purchase_orders),
      toNumber(currentData.balance_sheet.equity.estimated_retained_earnings),
    ];

    const cashFlowValues = [
      toNumber(currentData.cash_flow_statement.cash_inflows.customer_payments),
      toNumber(currentData.cash_flow_statement.cash_outflows.refunds),
      toNumber(currentData.cash_flow_statement.cash_outflows.confirmed_purchases),
      toNumber(currentData.cash_flow_statement.net_cash_flow),
    ];

    const ledgerEntries = [...currentData.general_ledger]
      .map((entry) => ({
        account: entry.account,
        debit: toNumber(entry.debit),
        credit: toNumber(entry.credit),
        activity: toNumber(entry.debit) + toNumber(entry.credit),
      }))
      .sort((left, right) => right.activity - left.activity)
      .slice(0, 8);

    return {
      incomeStatement: {
        labels: ['Revenue', 'Refunds', 'Net Revenue', 'Confirmed Purchases', 'Gross Profit', 'Net Profit'],
        data: {
          labels: ['Revenue', 'Refunds', 'Net Revenue', 'Confirmed Purchases', 'Gross Profit', 'Net Profit'],
          datasets: [
            {
              label: 'Amount',
              data: incomeValues,
              backgroundColor: ['#1a6af5', '#dc2626', '#0aaa82', '#f59e0b', '#7c3aed', '#10b981'],
              borderRadius: 10,
              borderSkipped: false,
            },
          ],
        },
      },
      balanceSheet: {
        labels: ['Cash', 'Receivables', 'Inventory', 'Pending Orders', 'Retained Earnings'],
        data: {
          labels: ['Cash', 'Receivables', 'Inventory', 'Pending Orders', 'Retained Earnings'],
          datasets: [
            {
              label: 'Amount',
              data: balanceValues,
              backgroundColor: ['#1a6af5', '#5b8def', '#0aaa82', '#dc2626', '#f59e0b'],
              borderRadius: 10,
              borderSkipped: false,
            },
          ],
        },
      },
      cashFlow: {
        labels: ['Customer Payments', 'Refunds', 'Purchases', 'Net Cash Flow'],
        data: {
          labels: ['Customer Payments', 'Refunds', 'Purchases', 'Net Cash Flow'],
          datasets: [
            {
              label: 'Amount',
              data: cashFlowValues,
              backgroundColor: ['#0aaa82', '#dc2626', '#f59e0b', '#1a6af5'],
              borderRadius: 10,
              borderSkipped: false,
            },
          ],
        },
      },
      ledger: {
        labels: ledgerEntries.map((entry) => entry.account),
        data: {
          labels: ledgerEntries.map((entry) => entry.account),
          datasets: [
            {
              label: 'Debit',
              data: ledgerEntries.map((entry) => entry.debit),
              backgroundColor: '#1a6af5',
              borderRadius: 8,
              borderSkipped: false,
            },
            {
              label: 'Credit',
              data: ledgerEntries.map((entry) => entry.credit),
              backgroundColor: '#0aaa82',
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        count: ledgerEntries.length,
      },
    };
  }, [currentData]);

  const balanceLedgerData = useMemo(() => {
    if (!currentData) return null;

    const buckets = [
      'Cash',
      'Accounts Receivable',
      'Inventory',
      'Pending Purchase Orders',
      'Estimated Retained Earnings',
    ];

    const debitSums = new Array(buckets.length).fill(0);
    const creditSums = new Array(buckets.length).fill(0);

    const matchIndex = (account: string) => {
      const a = account.toLowerCase();
      if (a.includes('cash')) return 0;
      if (a.includes('receiv')) return 1;
      if (a.includes('invent')) return 2;
      if (a.includes('purchase') || a.includes('purchase order') || a.includes('pending')) return 3;
      if (a.includes('retained') || a.includes('earning')) return 4;
      return -1;
    };

    for (const entry of currentData.general_ledger) {
      const idx = matchIndex(String(entry.account || ''));
      if (idx === -1) continue;
      debitSums[idx] += toNumber(entry.debit);
      creditSums[idx] += toNumber(entry.credit);
    }

    return {
      labels: buckets,
      datasets: [
        { label: 'Debit', data: debitSums, backgroundColor: '#1a6af5', stack: 'stack1' },
        { label: 'Credit', data: creditSums, backgroundColor: '#0aaa82', stack: 'stack1' },
      ],
    };
  }, [currentData]);

  return (
    <section className="fr-root">
      <style>{css}</style>

      {/* Header */}
      <div className="fr-header">
        <div>
          <div className="fr-eyebrow">Reporting</div>
          <h1 className="fr-title">Financial Reports</h1>
        </div>

        {currentData && (
          <div className="fr-range">
            <span className="fr-range-dot" />
            {selectedRange}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="fr-filters">
        <div className="fr-filters-top">
          <div className="fr-view-copy">
            <div className="fr-view-label">View mode</div>
            <p className="fr-view-hint">
              Switch between the detailed report and a visual summary of the same financial data.
            </p>
          </div>

          <div className="fr-view-toggle" role="tablist" aria-label="Report view mode">
            <button
              type="button"
              className={viewMode === 'normal' ? 'active' : ''}
              onClick={() => setViewMode('normal')}
              aria-pressed={viewMode === 'normal'}
            >
              Normal
            </button>

            <button
              type="button"
              className={viewMode === 'charts' ? 'active' : ''}
              onClick={() => setViewMode('charts')}
              aria-pressed={viewMode === 'charts'}
            >
              Charts
            </button>
          </div>
        </div>

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
        <div className="fr-error">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="fr-loading">
          <div className="fr-spinner" />
          <p>Generating financial analytics...</p>
        </div>
      )}

      {/* Content */}
      {!loading && currentData && (
        <div>

          {viewMode === 'charts' ? (
            <>
              <div className="fr-section">
                <div className="fr-section-head">
                  <div className="fr-section-label">Charts</div>
                  <h2 className="fr-section-title">Visual Summary</h2>
                </div>

                <div className="fr-charts-grid">
                  <FrCard title="Income Statement" count={chartData?.incomeStatement.labels.length ?? 0}>
                    <div className="fr-chart-body">
                      <Line
                        data={{
                          labels: chartData?.incomeStatement.labels ?? [],
                          datasets: (chartData?.incomeStatement.data.datasets ?? []).map((ds: any) => ({
                            ...ds,
                            // color each point according to the original palette
                            backgroundColor: ['rgba(26,106,245,0.12)', 'rgba(220,38,38,0.12)', 'rgba(10,170,130,0.12)', 'rgba(245,158,11,0.12)', 'rgba(124,58,237,0.12)', 'rgba(16,185,129,0.12)'],
                            pointBackgroundColor: ['#1a6af5', '#dc2626', '#0aaa82', '#f59e0b', '#7c3aed', '#10b981'],
                            borderColor: '#1a6af5',
                            fill: true,
                            tension: 0.35,
                          })),
                        }}
                        options={buildLineOptions()}
                      />
                    </div>
                  </FrCard>

                  <FrCard title="Balance Sheet" count={chartData?.balanceSheet.labels.length ?? 0}>
                    <div className="fr-chart-body">
                      <Doughnut
                        data={chartData?.balanceSheet.data ?? { labels: [], datasets: [] }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'bottom' as const, labels: { color: '#4b5563' } },
                          },
                        }}
                      />
                    </div>
                  </FrCard>

                  <FrCard title="Cash Flow" count={chartData?.cashFlow.labels.length ?? 0}>
                    <div className="fr-chart-body">
                      <Line
                        data={{
                          labels: chartData?.cashFlow.labels ?? [],
                          datasets: (chartData?.cashFlow.data.datasets ?? []).map((ds: any) => ({
                            ...ds,
                            borderColor: '#0aaa82',
                            backgroundColor: 'rgba(10,170,130,0.08)',
                            fill: true,
                            tension: 0.35,
                          })),
                        }}
                        options={buildLineOptions()}
                      />
                    </div>
                  </FrCard>

                  <FrCard title="General Ledger" count={(currentData?.general_ledger.length ?? 0)}>
                    {balanceLedgerData ? (
                      <>
                        <p className="fr-chart-caption">
                          Showing debit and credit for key balance sheet items.
                        </p>
                        <div className="fr-chart-body tall">
                          <Bar
                            data={balanceLedgerData}
                            options={{
                              ...buildBarOptions(true),
                              indexAxis: 'y' as const,
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { position: 'bottom' as const, labels: { color: '#4b5563' } },
                                tooltip: {
                                  callbacks: {
                                    label: (context: any) => {
                                      const rawValue = context.parsed?.x ?? context.raw ?? 0;
                                      return `${context.dataset.label}: ${formatCurrency(Number(rawValue))}`;
                                    },
                                  },
                                },
                              },
                              scales: {
                                x: {
                                  stacked: true,
                                  grid: { color: 'rgba(15, 23, 42, 0.06)' },
                                  ticks: { color: '#6b7280', callback: (value: any) => formatCurrency(Number(value)).replace(/\.00(?=\s|$)/, '') },
                                },
                                y: { grid: { color: 'rgba(15, 23, 42, 0.06)' }, ticks: { color: '#6b7280' } },
                              },
                            }}
                          />

                          <div style={{ marginTop: 12 }}>
                            <div className="fr-table-wrap">
                              <table className="fr-table">
                                <thead>
                                  <tr>
                                    <th>Item</th>
                                    <th className="right">Debit</th>
                                    <th className="right">Credit</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(balanceLedgerData.labels || []).map((label: string, i: number) => (
                                    <tr key={label}>
                                      <td>
                                        <span className="fr-strong">{label}</span>
                                      </td>
                                      <td className="right">
                                        <span className="fr-chip blue">{formatCurrency((balanceLedgerData.datasets[0].data || [])[i] ?? 0)}</span>
                                      </td>
                                      <td className="right">
                                        <span className="fr-chip green">{formatCurrency((balanceLedgerData.datasets[1].data || [])[i] ?? 0)}</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <EmptyState message="No general ledger entries returned for this period." />
                    )}
                  </FrCard>
                </div>
              </div>

              {!chartData?.ledger.count && (
                <div className="fr-zero">
                  <div className="fr-zero-icon">
                    <TrendingUp size={34} />
                  </div>

                  <h3>No Financial Data</h3>

                  <p>
                    No financial activity found for{' '}
                    <span style={{ fontFamily: 'DM Mono, monospace' }}>
                      {selectedRange}
                    </span>.
                  </p>
                </div>
              )}
            </>
          ) : (
            <>

              {/* Income Statement */}
              <div className="fr-section">

                <div className="fr-section-head">
                  <div className="fr-section-label">P&L</div>
                  <h2 className="fr-section-title">
                    Income Statement
                  </h2>
                </div>

                <div className="fr-kpis">

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon blue">
                      <TrendingUp size={17} />
                    </div>
                    <div className="fr-kpi-label">Revenue</div>
                    <div className="fr-kpi-value blue">
                      {formatCurrency(currentData.income_statement.revenue)}
                    </div>
                    <div className="fr-kpi-corner">
                      <ChevronRight size={11} /> gross income
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon red">
                      <Receipt size={17} />
                    </div>
                    <div className="fr-kpi-label">Refunds</div>
                    <div className="fr-kpi-value red">
                      {formatCurrency(currentData.income_statement.refunds)}
                    </div>
                    <div className="fr-kpi-corner">
                      <ChevronRight size={11} /> returned
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon green">
                      <Wallet size={17} />
                    </div>
                    <div className="fr-kpi-label">Net Revenue</div>
                    <div className="fr-kpi-value green">
                      {formatCurrency(currentData.income_statement.net_revenue)}
                    </div>
                    <div className="fr-kpi-corner">
                      <ChevronRight size={11} /> after refunds
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon blue">
                      <Landmark size={17} />
                    </div>
                    <div className="fr-kpi-label">Confirmed Purchases</div>
                    <div className="fr-kpi-value blue">
                      {formatCurrency(currentData.income_statement.confirmed_purchases)}
                    </div>
                    <div className="fr-kpi-corner">
                      <ChevronRight size={11} /> procurement
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className={`fr-kpi-icon ${Number(currentData.income_statement.estimated_gross_profit) >= 0 ? 'green' : 'red'}`}>
                      <Activity size={17} />
                    </div>
                    <div className="fr-kpi-label">Estimated Gross Profit</div>
                    <div className={`fr-kpi-value ${Number(currentData.income_statement.estimated_gross_profit) >= 0 ? 'green' : 'red'}`}>
                      {formatCurrency(currentData.income_statement.estimated_gross_profit)}
                    </div>
                    <div className="fr-kpi-corner">
                      <ChevronRight size={11} /> profitability
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className={`fr-kpi-icon ${Number(currentData.income_statement.net_profit) >= 0 ? 'green' : 'red'}`}>
                      <Activity size={17} />
                    </div>
                    <div className="fr-kpi-label">Net Profit</div>
                    <div className={`fr-kpi-value ${Number(currentData.income_statement.net_profit) >= 0 ? 'green' : 'red'}`}>
                      {formatCurrency(currentData.income_statement.net_profit)}
                    </div>
                    <div className="fr-kpi-corner">
                      <CheckCircle2 size={11} /> final result
                    </div>
                  </div>

                </div>
              </div>

              {/* Refunds Summary */}
              <div className="fr-section">
                <div className="fr-section-head">
                  <div className="fr-section-label">Refunds Analytics</div>
                  <h2 className="fr-section-title">Refunds Summary</h2>
                </div>

                <div className="fr-kpis">
                  <div className="fr-kpi">
                    <div className="fr-kpi-icon red">
                      <Receipt size={17} />
                    </div>
                    <div className="fr-kpi-label">Today</div>
                    <div className="fr-kpi-value red">
                      {formatCurrency(currentData.refunds_summary.refunds_today)}
                    </div>
                    <div className="fr-kpi-corner">
                      daily returns
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon red">
                      <Receipt size={17} />
                    </div>
                    <div className="fr-kpi-label">This Month</div>
                    <div className="fr-kpi-value red">
                      {formatCurrency(currentData.refunds_summary.refunds_month)}
                    </div>
                    <div className="fr-kpi-corner">
                      monthly returns
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon red">
                      <Receipt size={17} />
                    </div>
                    <div className="fr-kpi-label">Selected Period</div>
                    <div className="fr-kpi-value red">
                      {formatCurrency(currentData.refunds_summary.refunds_period)}
                    </div>
                    <div className="fr-kpi-corner">
                      filtered range
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon red">
                      <Receipt size={17} />
                    </div>
                    <div className="fr-kpi-label">Total All Time</div>
                    <div className="fr-kpi-value red">
                      {formatCurrency(currentData.refunds_summary.refunds_total_all_time)}
                    </div>
                    <div className="fr-kpi-corner">
                      historical
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance Sheet */}
              <div className="fr-section">

                <div className="fr-section-head">
                  <div className="fr-section-label">
                    Assets & Liabilities
                  </div>

                  <h2 className="fr-section-title">
                    Balance Sheet
                  </h2>
                </div>

                <div className="fr-kpis">

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon blue">
                      <Wallet size={17} />
                    </div>
                    <div className="fr-kpi-label">Cash</div>
                    <div className="fr-kpi-value">
                      {formatCurrency(currentData.balance_sheet.assets.cash)}
                    </div>
                    <div className="fr-kpi-corner">
                      liquid assets
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon blue">
                      <TrendingUp size={17} />
                    </div>
                    <div className="fr-kpi-label">Accounts Receivable</div>
                    <div className="fr-kpi-value">
                      {formatCurrency(currentData.balance_sheet.assets.accounts_receivable)}
                    </div>
                    <div className="fr-kpi-corner">
                      to be collected
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon blue">
                      <Layers size={17} />
                    </div>
                    <div className="fr-kpi-label">Inventory</div>
                    <div className="fr-kpi-value">
                      {formatCurrency(currentData.balance_sheet.assets.inventory)}
                    </div>
                    <div className="fr-kpi-corner">
                      stock value
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon red">
                      <Receipt size={17} />
                    </div>
                    <div className="fr-kpi-label">Pending Orders</div>
                    <div className="fr-kpi-value red">
                      {formatCurrency(currentData.balance_sheet.liabilities.pending_purchase_orders)}
                    </div>
                    <div className="fr-kpi-corner">
                      outstanding debt
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon blue">
                      <Landmark size={17} />
                    </div>
                    <div className="fr-kpi-label">Retained Earnings</div>
                    <div className="fr-kpi-value blue">
                      {formatCurrency(currentData.balance_sheet.equity.estimated_retained_earnings)}
                    </div>
                    <div className="fr-kpi-corner">
                      accumulated equity
                    </div>
                  </div>

                </div>
              </div>

              {/* Cash Flow */}
              <div className="fr-section">

                <div className="fr-section-head">
                  <div className="fr-section-label">
                    Liquidity
                  </div>

                  <h2 className="fr-section-title">
                    Cash Flow Statement
                  </h2>
                </div>

                <div className="fr-kpis">

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon green">
                      <TrendingUp size={17} />
                    </div>
                    <div className="fr-kpi-label">Customer Payments</div>
                    <div className="fr-kpi-value green">
                      {formatCurrency(currentData.cash_flow_statement.cash_inflows.customer_payments)}
                    </div>
                    <div className="fr-kpi-corner">
                      cash in
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon red">
                      <Receipt size={17} />
                    </div>
                    <div className="fr-kpi-label">Refunds Outflow</div>
                    <div className="fr-kpi-value red">
                      {formatCurrency(currentData.cash_flow_statement.cash_outflows.refunds)}
                    </div>
                    <div className="fr-kpi-corner">
                      cash out
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className="fr-kpi-icon red">
                      <Landmark size={17} />
                    </div>
                    <div className="fr-kpi-label">Confirmed Purchases</div>
                    <div className="fr-kpi-value red">
                      {formatCurrency(currentData.cash_flow_statement.cash_outflows.confirmed_purchases)}
                    </div>
                    <div className="fr-kpi-corner">
                      cash out
                    </div>
                  </div>

                  <div className="fr-kpi">
                    <div className={`fr-kpi-icon ${Number(currentData.cash_flow_statement.net_cash_flow) >= 0 ? 'green' : 'red'}`}>
                      <Activity size={17} />
                    </div>
                    <div className="fr-kpi-label">Net Cash Flow</div>
                    <div className={`fr-kpi-value ${Number(currentData.cash_flow_statement.net_cash_flow) >= 0 ? 'green' : 'red'}`}>
                      {formatCurrency(currentData.cash_flow_statement.net_cash_flow)}
                    </div>
                    <div className="fr-kpi-corner">
                      liquidity change
                    </div>
                  </div>

                </div>
              </div>

              {/* General Ledger */}
              <FrCard
                title="General Ledger"
                count={currentData.general_ledger.length}
              >
                {currentData.general_ledger.length > 0 ? (
                  <div className="fr-table-wrap">
                    <table className="fr-table">
                      <thead>
                        <tr>
                          <th>Account</th>
                          <th className="right">Debit</th>
                          <th className="right">Credit</th>
                        </tr>
                      </thead>

                      <tbody>
                        {currentData.general_ledger.map((entry, index) => (
                          <tr key={`${entry.account}-${index}`}>
                            <td>
                              <span className="fr-strong">
                                {entry.account}
                              </span>
                            </td>

                            <td className="right">
                              <span className="fr-chip blue">
                                {formatCurrency(entry.debit)}
                              </span>
                            </td>

                            <td className="right">
                              <span className="fr-chip green">
                                {formatCurrency(entry.credit)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState message="No general ledger entries returned for this period." />
                )}
              </FrCard>

              {/* Empty state */}
              {!currentData.general_ledger.length && (
                <div className="fr-zero">
                  <div className="fr-zero-icon">
                    <TrendingUp size={34} />
                  </div>

                  <h3>No Financial Data</h3>

                  <p>
                    No financial activity found for{' '}
                    <span style={{ fontFamily: 'DM Mono, monospace' }}>
                      {selectedRange}
                    </span>.
                  </p>
                </div>
              )}

            </>
          )}
        </div>
      )}

      {/* Default state */}
      {!loading && !error && !currentData && (
        <div className="fr-zero">
          <div className="fr-zero-icon">
            <BarChart3 size={34} />
          </div>

          <h3>Financial Intelligence</h3>

          <p>
            Generate detailed financial insights,
            cash flow analytics, and accounting reports
            using the filters above.
          </p>
        </div>
      )}
    </section>
  );
};