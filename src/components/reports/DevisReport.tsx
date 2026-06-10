import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BarChart3, CheckCircle2, Clock3, RefreshCw, Send, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { fetchDevisReport } from '../../api/catalog';
import { formatCurrency } from '../../utils/currency';
import { ReportFilters } from './ReportFilters';
import { getDefaultReportRange, formatRangeLabel, unwrapReportData } from './reportUtils';
import { StatusMessage } from '../StatusMessage';
import type { DevisReport as DevisReportResponse } from '../../types/reports';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

type DevisReportData = DevisReportResponse['data'] | null;
type ReportViewMode = 'normal' | 'charts';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const css = `
  .dr-root{
    --dr-bg:#f4f5f7;
    --dr-surface:#ffffff;
    --dr-surface2:#f0f1f4;
    --dr-border:rgba(0,0,0,.08);
    --dr-border-hi:rgba(0,0,0,.14);
    --dr-text:#0f1117;
    --dr-muted:#6b7280;
    --dr-accent:#1a6af5;
    --dr-green:#0aaa82;
    --dr-red:#dc2626;
    --dr-warn:#d97706;
    --dr-radius:14px;
    background:var(--dr-bg);
    color:var(--dr-text);
    min-height:100vh;
    padding:32px 40px 80px;
    box-sizing:border-box;
  }
  .dr-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid var(--dr-border);position:relative;}
  .dr-header::after{content:'';position:absolute;left:0;bottom:-1px;width:72px;height:2px;border-radius:2px;background:var(--dr-accent);}
  .dr-eyebrow{font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:var(--dr-accent);display:flex;align-items:center;gap:8px;margin-bottom:8px;}
  .dr-eyebrow::before{content:'';width:14px;height:1px;background:var(--dr-accent);display:block;}
  .dr-title{margin:0;font-size:2rem;font-weight:800;line-height:1;letter-spacing:-.03em;}
  .dr-range{display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;background:var(--dr-surface);border:1px solid var(--dr-border-hi);font-size:.78rem;color:var(--dr-muted);}
  .dr-range-dot{width:6px;height:6px;border-radius:50%;background:var(--dr-accent);box-shadow:0 0 10px rgba(26,106,245,.35);}
  .dr-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:22px;}
  .dr-card{background:var(--dr-surface);border:1px solid var(--dr-border);border-radius:var(--dr-radius);padding:20px 22px;box-shadow:0 1px 4px rgba(0,0,0,.06);}
  .dr-card h3{margin:0 0 12px;font-size:.95rem;}
  .dr-kpi{display:flex;align-items:center;gap:12px;}
  .dr-kpi-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(26,106,245,.08);color:var(--dr-accent);flex-shrink:0;}
  .dr-kpi-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--dr-muted);margin-bottom:6px;}
  .dr-kpi-value{font-size:1.7rem;font-weight:800;line-height:1;}
  .dr-section{background:var(--dr-surface);border:1px solid var(--dr-border);border-radius:var(--dr-radius);margin-bottom:14px;overflow:hidden;}
  .dr-section-head{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:16px 20px;border-bottom:1px solid var(--dr-border);}
  .dr-section-title{margin:0;font-size:1rem;font-weight:700;}
  .dr-section-body{padding:18px 20px;}
  .dr-status-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;}
  .dr-status-item{padding:14px;border-radius:12px;background:var(--dr-surface2);border:1px solid var(--dr-border);}
  .dr-status-label{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--dr-muted);margin-bottom:8px;}
  .dr-status-value{font-size:1.5rem;font-weight:800;}
  .dr-table{width:100%;border-collapse:collapse;}
  .dr-table th,.dr-table td{padding:12px 14px;border-bottom:1px solid var(--dr-border);text-align:left;}
  .dr-table th{font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--dr-muted);font-weight:600;}
  .dr-table tr:last-child td{border-bottom:none;}
  .dr-muted{color:var(--dr-muted);}
  .dr-pill{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;}
  .dr-pill.green{background:rgba(16,185,129,.1);color:#0a7c55;}
  .dr-pill.blue{background:rgba(79,82,232,.08);color:#3a3dc2;}
  .dr-pill.red{background:rgba(229,62,62,.08);color:#c53030;}
  .dr-pill.orange{background:rgba(236,153,27,.1);color:#9a5c0a;}
  .dr-pill.gray{background:rgba(107,114,128,.08);color:#4b5563;}
  .dr-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;}
  .dr-view-copy{min-width:220px;}
  .dr-view-label{font-size:.7rem;text-transform:uppercase;letter-spacing:.15em;color:var(--dr-accent);margin-bottom:8px;}
  .dr-view-hint{margin:0;color:var(--dr-muted);font-size:.88rem;line-height:1.5;}
  .dr-view-toggle{display:inline-flex;align-items:center;gap:6px;padding:6px;border-radius:999px;background:var(--dr-surface);border:1px solid var(--dr-border);box-shadow:0 1px 4px rgba(0,0,0,.04);}
  .dr-view-toggle button{appearance:none;border:none;background:transparent;color:var(--dr-muted);font-size:.74rem;letter-spacing:.06em;text-transform:uppercase;padding:10px 14px;border-radius:999px;cursor:pointer;transition:.2s ease;}
  .dr-view-toggle button:hover{color:var(--dr-text);background:var(--dr-surface2);}
  .dr-view-toggle button.active{background:var(--dr-accent);color:#fff;box-shadow:0 8px 18px rgba(26,106,245,.18);}
  .dr-charts-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:28px;}
  .dr-charts-grid > .dr-section{margin-bottom:0;height:100%;}
  .dr-chart-body{height:320px;padding:18px 20px 22px;}
  .dr-chart-body.tall{height:340px;}
  .dr-chart-body.short{height:290px;}
  .dr-chart-body.compact{height:250px;}
  .dr-chart-shell{display:grid;grid-template-columns:minmax(280px,1.3fr) minmax(240px,0.9fr);gap:16px;align-items:stretch;}
  .dr-chart-shell.single{grid-template-columns:1fr;}
  .dr-chart-summary{display:grid;gap:12px;align-content:start;}
  .dr-summary-card{padding:14px 16px;border-radius:12px;background:var(--dr-surface2);border:1px solid var(--dr-border);}
  .dr-summary-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;}
  .dr-summary-label{display:flex;align-items:center;gap:8px;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--dr-muted);}
  .dr-summary-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0;}
  .dr-summary-count{font-size:1.15rem;font-weight:800;line-height:1;}
  .dr-summary-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:.8rem;color:var(--dr-muted);}
  .dr-summary-bar{height:7px;border-radius:999px;background:rgba(107,114,128,.14);overflow:hidden;margin-top:10px;}
  .dr-summary-fill{height:100%;border-radius:999px;background:var(--dr-accent);}
  .dr-summary-note{margin:10px 0 0;font-size:.82rem;line-height:1.45;color:var(--dr-muted);}
  .dr-mini-gauge{display:grid;gap:10px;margin-top:12px;}
  .dr-mini-gauge-track{height:12px;border-radius:999px;background:rgba(107,114,128,.14);overflow:hidden;}
  .dr-mini-gauge-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#3b82f6 0%,#10b981 100%);}
  .dr-mini-gauge-row{display:flex;justify-content:space-between;gap:10px;font-size:.82rem;color:var(--dr-muted);}
  .dr-lost-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;}
  .dr-lost-card{padding:18px;border-radius:14px;background:linear-gradient(180deg,var(--dr-surface),var(--dr-surface2));border:1px solid var(--dr-border);box-shadow:0 1px 4px rgba(0,0,0,.05);}
  .dr-lost-card.rejected{border-left:4px solid var(--dr-red);}
  .dr-lost-card.expired{border-left:4px solid var(--dr-warn);}
  .dr-lost-card.total{border-left:4px solid var(--dr-accent);}
  .dr-lost-label{font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;color:var(--dr-muted);margin-bottom:8px;}
  .dr-lost-count{font-size:1.6rem;font-weight:800;line-height:1;margin-bottom:6px;}
  .dr-lost-value{font-size:1rem;font-weight:700;}
  .dr-lost-note{margin:10px 0 0;color:var(--dr-muted);font-size:.84rem;line-height:1.45;}
  .dr-chart-title{display:flex;align-items:center;gap:8px;font-weight:700;font-size:.98rem;}
  .dr-chart-dot{width:8px;height:8px;border-radius:50%;background:var(--dr-accent);}
  .dr-error{display:flex;align-items:flex-start;gap:14px;padding:18px 22px;border-radius:var(--dr-radius);border:1px solid rgba(220,38,38,.18);background:rgba(220,38,38,.05);margin-bottom:24px;}
  .dr-error p{margin:0;color:#991b1b;font-size:.88rem;}
  .dr-loading{text-align:center;padding:80px 20px;}
  .dr-spinner{width:28px;height:28px;border-radius:50%;border:2px solid var(--dr-border);border-top-color:var(--dr-accent);animation:dr-spin .7s linear infinite;margin:0 auto 16px;}
  .dr-loading p{margin:0;font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;color:var(--dr-muted);}
  .dr-zero{padding:100px 40px;text-align:center;}
  .dr-zero-icon{width:82px;height:82px;margin:0 auto 24px;border-radius:24px;background:var(--dr-surface);border:1px solid var(--dr-border);display:flex;align-items:center;justify-content:center;color:var(--dr-muted);opacity:.5;}
  .dr-zero h3{margin:0 0 10px;font-size:1.45rem;letter-spacing:-.02em;}
  .dr-zero p{margin:0;max-width:360px;margin-inline:auto;line-height:1.6;color:var(--dr-muted);}
  @media (max-width: 1100px){
    .dr-charts-grid{grid-template-columns:1fr;}
  }
  @media (max-width: 720px){
    .dr-root{padding:24px 16px 64px;}
    .dr-chart-shell{grid-template-columns:1fr;}
    .dr-chart-body,.dr-chart-body.tall,.dr-chart-body.short,.dr-chart-body.compact{height:280px;}
  }
  @keyframes dr-spin{to{transform:rotate(360deg)}}
`;

function formatNumber(value: number) {
  return value.toLocaleString('en-US');
}

function statusClass(status: string) {
  if (status === 'accepted') return 'green';
  if (status === 'sent') return 'blue';
  if (status === 'rejected') return 'red';
  if (status === 'expired') return 'orange';
  return 'gray';
}

function buildCurrencyBarOptions(horizontal = false) {
  return {
    indexAxis: horizontal ? ('y' as const) : ('x' as const),
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
        beginAtZero: true,
        grid: { color: 'rgba(15, 23, 42, 0.06)' },
        ticks: { color: '#6b7280', precision: 0 },
      },
      y: { grid: { display: false }, ticks: { color: '#6b7280' } },
    },
  };
}

function buildCountBarOptions(horizontal = false) {
  return {
    indexAxis: horizontal ? ('y' as const) : ('x' as const),
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const rawValue = context.parsed?.y ?? context.parsed?.x ?? context.raw ?? 0;
            return `${context.dataset.label}: ${formatNumber(Number(rawValue))}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(15, 23, 42, 0.06)' },
        ticks: { color: '#6b7280', precision: 0 },
      },
      y: { grid: { display: false }, ticks: { color: '#6b7280' } },
    },
  };
}

function buildDoughnutOptions(labels: string[], counts: number[]) {
  const total = counts.reduce((sum, value) => sum + value, 0) || 1;

  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '66%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          pointStyle: 'circle' as const,
          color: '#4b5563',
          padding: 14,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = Number(context.raw ?? 0);
            const percent = ((value / total) * 100).toFixed(1);
            return `${labels[context.dataIndex]}: ${formatNumber(value)} (${percent}%)`;
          },
        },
      },
    },
  };
}

function statusDescription(status: string) {
  if (status === 'accepted') return 'Won quotations';
  if (status === 'rejected') return 'Lost quotations';
  if (status === 'sent') return 'Shared quotations';
  if (status === 'expired') return 'Expired quotations';
  return 'Draft quotations';
}

export function DevisReport() {
  const range = useMemo(() => getDefaultReportRange(), []);
  const [fromDate, setFromDate] = useState(range.from);
  const [toDate, setToDate] = useState(range.to);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<DevisReportData>(null);
  const [status, setStatus] = useState<{ type: 'error' | 'success' | 'info' | 'failed'; text: string } | null>(null);
  const [viewMode, setViewMode] = useState<ReportViewMode>('normal');

  async function loadReport(from = fromDate, to = toDate) {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetchDevisReport(from, to);
      setReport(unwrapReportData<DevisReportResponse['data']>(response));
      setStatus({ type: 'success', text: 'Devis report loaded.' });
    } catch (error) {
      setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load devis report.' });
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = (from: string, to: string) => {
    setFromDate(from);
    setToDate(to);
    void loadReport(from, to);
  };

  const handleResetFilters = () => {
    const defaults = getDefaultReportRange();
    setFromDate(defaults.from);
    setToDate(defaults.to);
    void loadReport(defaults.from, defaults.to);
  };

  const periodLabel = report?.period ? formatRangeLabel(report.period.from, report.period.to) : formatRangeLabel(fromDate, toDate);

  const chartData = useMemo(() => {
    if (!report) return null;

    const statusLabels = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
    const statusValues = statusLabels.map((label) => report.status_distribution[label] ?? 0);
    const statusTotal = statusValues.reduce((sum, value) => sum + value, 0);
    const statusBreakdown = statusLabels.map((label, index) => ({
      label,
      value: statusValues[index],
      percentage: statusTotal ? (statusValues[index] / statusTotal) * 100 : 0,
      color:
        label === 'draft' ? '#6366f1' : label === 'sent' ? '#3b82f6' : label === 'accepted' ? '#10b981' : label === 'rejected' ? '#ef4444' : '#f59e0b',
    }));

    const financialLabels = ['sent', 'accepted', 'rejected', 'expired'];
    const financialValues = [
      Number(report.financial_aggregations.sent_total || 0),
      Number(report.financial_aggregations.accepted_total || 0),
      Number(report.financial_aggregations.rejected_total || 0),
      Number(report.financial_aggregations.expired_total || 0),
    ];
    const financialTotal = financialValues.reduce((sum, value) => sum + value, 0) || 1;
    const totalDevis = report.total_devis || statusTotal || 1;
    const pendingRatio = Math.min(100, (report.pipeline_metrics.sent_pending / totalDevis) * 100);
    const sentValueRatio = Math.min(100, ((Number(report.pipeline_metrics.sent_total_value || 0) / financialTotal) * 100));
    const agingLabels = ['Over 7 Days', 'Over 30 Days'];
    const agingValues = [report.aging_metrics.sent_over_7_days, report.aging_metrics.sent_over_30_days];

    return {
      statusDoughnut: {
        labels: statusLabels,
        datasets: [
          {
            label: 'Devis',
            data: statusValues,
            backgroundColor: statusBreakdown.map((item) => item.color),
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      statusBreakdown,
      financialBar: {
        labels: financialLabels,
        datasets: [
          {
            label: 'Total value',
            data: financialValues,
            backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'],
            borderRadius: 10,
            borderSkipped: false,
            maxBarThickness: 42,
          },
        ],
      },
      pendingRatio,
      sentValueRatio,
      agingBar: {
        labels: agingLabels,
        datasets: [
          {
            label: 'Open sent quotations',
            data: agingValues,
            backgroundColor: ['#f59e0b', '#ef4444'],
            borderRadius: 10,
            borderSkipped: false,
            maxBarThickness: 40,
          },
        ],
      },
    };
  }, [report]);

  return (
    <div className="dr-root">
      <style>{css}</style>

      <div className="dr-header">
        <div>
          <p className="dr-eyebrow"><BarChart3 size={14} /> Reports</p>
          <h1 className="dr-title">Devis Report</h1>
        </div>
        <div className="dr-range"><span className="dr-range-dot" /> {periodLabel}</div>
      </div>

      <div className="dr-section" style={{ marginBottom: 18 }}>
        <div className="dr-section-body" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="dr-view-copy">
            <div className="dr-view-label">View mode</div>
            <p className="dr-view-hint">Switch between a card-based summary and chart-focused analytics for the same Devis data.</p>
          </div>
          <div className="dr-view-toggle" role="tablist" aria-label="Devis report view mode">
            <button type="button" className={viewMode === 'normal' ? 'active' : ''} onClick={() => setViewMode('normal')} aria-pressed={viewMode === 'normal'}>
              Normal
            </button>
            <button type="button" className={viewMode === 'charts' ? 'active' : ''} onClick={() => setViewMode('charts')} aria-pressed={viewMode === 'charts'}>
              Charts
            </button>
          </div>
        </div>
      </div>

      <StatusMessage status={status} />

      <div style={{ marginBottom: 18 }}>
        <ReportFilters onApply={handleApplyFilters} onReset={handleResetFilters} loading={loading} />
      </div>

      <div className="dr-actions" style={{ marginBottom: 18 }}>
        <button className="secondary-action" disabled={loading} onClick={() => void loadReport()} type="button">
          <RefreshCw size={16} />
          Reload
        </button>
      </div>

      {loading && !report ? (
        <div className="dr-loading">
          <div className="dr-spinner" />
          <p>Generating devis analytics...</p>
        </div>
      ) : null}

      {status?.type === 'error' && (
        <div className="dr-error">
          <AlertCircle size={18} />
          <p>{status.text}</p>
        </div>
      )}

      {!loading && report && chartData && viewMode === 'charts' ? (
        <div className="dr-charts-grid">
          <section className="dr-section">
            <div className="dr-section-head">
              <div>
                <h2 className="dr-section-title">Status Distribution</h2>
              </div>
             
            </div>
            <div className="dr-section-body">
              <div className="dr-chart-shell">
                <div className="dr-chart-body compact">
                  <Doughnut data={chartData.statusDoughnut} options={buildDoughnutOptions(chartData.statusDoughnut.labels as string[], chartData.statusDoughnut.datasets[0].data as number[])} />
                </div>
                <div className="dr-chart-summary">
                  {chartData.statusBreakdown.map((item) => (
                    <div className="dr-summary-card" key={item.label}>
                      <div className="dr-summary-head">
                        <div className="dr-summary-label"><span className="dr-summary-dot" style={{ background: item.color }} />{item.label}</div>
                        <div className="dr-summary-count">{formatNumber(item.value)}</div>
                      </div>
                      <div className="dr-summary-meta">
                        <span>{item.percentage.toFixed(1)}%</span>
                        <span>{statusDescription(item.label)}</span>
                      </div>
                      <div className="dr-summary-bar">
                        <div className="dr-summary-fill" style={{ width: `${item.percentage}%`, background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="dr-section">
            <div className="dr-section-head">
              <h2 className="dr-section-title">Financial Aggregations</h2>
              
            </div>
            <div className="dr-section-body">
              <div className="dr-chart-body tall">
                <Bar data={chartData.financialBar} options={buildCurrencyBarOptions(false)} />
              </div>
              <p className="dr-chart-title" style={{ marginTop: 12 }}><span className="dr-chart-dot" /> Exact values appear on hover for each status.</p>
            </div>
          </section>

          <section className="dr-section">
            <div className="dr-section-head">
              <h2 className="dr-section-title">Pipeline Metrics</h2>
              
            </div>
            <div className="dr-section-body">
              <div className="dr-grid" style={{ marginBottom: 0 }}>
                <div className="dr-card">
                  <div className="dr-kpi">
                    <div className="dr-kpi-icon"><Clock3 size={18} /></div>
                    <div>
                      <div className="dr-kpi-label">Sent pending</div>
                      <div className="dr-kpi-value">{formatNumber(report.pipeline_metrics.sent_pending)}</div>
                    </div>
                  </div>
                  <div className="dr-mini-gauge">
                    <div className="dr-mini-gauge-row"><span>Share of all quotations</span><strong>{chartData.pendingRatio.toFixed(1)}%</strong></div>
                    <div className="dr-mini-gauge-track"><div className="dr-mini-gauge-fill" style={{ width: `${chartData.pendingRatio}%` }} /></div>
                  </div>
                </div>

                <div className="dr-card">
                  <div className="dr-kpi">
                    <div className="dr-kpi-icon"><Send size={18} /></div>
                    <div>
                      <div className="dr-kpi-label">Sent total value</div>
                      <div className="dr-kpi-value">{formatCurrency(report.pipeline_metrics.sent_total_value)}</div>
                    </div>
                  </div>
                  <div className="dr-mini-gauge">
                    <div className="dr-mini-gauge-row"><span>Share of tracked financials</span><strong>{chartData.sentValueRatio.toFixed(1)}%</strong></div>
                    <div className="dr-mini-gauge-track"><div className="dr-mini-gauge-fill" style={{ width: `${chartData.sentValueRatio}%` }} /></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="dr-section">
            <div className="dr-section-head">
              <h2 className="dr-section-title">Lost Opportunities</h2>
              <span className="dr-muted">Rejected + expired quotations</span>
            </div>
            <div className="dr-section-body">
              <div className="dr-lost-grid">
                <div className="dr-lost-card rejected">
                  <div className="dr-lost-label">Rejected</div>
                  <div className="dr-lost-count">{formatNumber(report.lost_opportunity_metrics.rejected_count)}</div>
                  <div className="dr-lost-value">{formatCurrency(report.lost_opportunity_metrics.rejected_total ?? '0.00')}</div>
                  <p className="dr-lost-note">Rejected quotations that did not convert to revenue.</p>
                </div>
                <div className="dr-lost-card expired">
                  <div className="dr-lost-label">Expired</div>
                  <div className="dr-lost-count">{formatNumber(report.lost_opportunity_metrics.expired_count)}</div>
                  <div className="dr-lost-value">{formatCurrency(report.lost_opportunity_metrics.expired_total ?? '0.00')}</div>
                  <p className="dr-lost-note">Expired quotations that need follow-up or renewal.</p>
                </div>
                <div className="dr-lost-card total">
                  <div className="dr-lost-label">Total Lost</div>
                  <div className="dr-lost-count">{formatCurrency(report.lost_opportunity_metrics.lost_total ?? '0.00')}</div>
                  <div className="dr-lost-value">Combined impact</div>
                  <p className="dr-lost-note">Rejected + expired quotations.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="dr-section">
            <div className="dr-section-head">
              <h2 className="dr-section-title">Aging Metrics</h2>
              <span className="dr-muted">Horizontal bar comparison</span>
            </div>
            <div className="dr-section-body">
              <div className="dr-chart-body short">
                <Bar data={chartData.agingBar} options={buildCountBarOptions(true)} />
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {!loading && report && chartData && viewMode === 'normal' ? (
        <>
          <div className="dr-grid">
            <div className="dr-card">
              <div className="dr-kpi">
                <div className="dr-kpi-icon"><Send size={18} /></div>
                <div>
                  <div className="dr-kpi-label">Total devis</div>
                  <div className="dr-kpi-value">{formatNumber(report.total_devis)}</div>
                </div>
              </div>
            </div>
          
            <div className="dr-card">
              <div className="dr-kpi">
                <div className="dr-kpi-icon"><ArrowRightLeft size={18} /></div>
                <div>
                  <div className="dr-kpi-label">Acceptance rate </div>
                  <div className="dr-kpi-value">{Number(report.conversion_metrics.acceptance_rate).toFixed(1)}%</div>
                </div>
              </div>
            </div>
            <div className="dr-card">
              <div className="dr-kpi">
                <div className="dr-kpi-icon"><Clock3 size={18} /></div>
                <div>
                  <div className="dr-kpi-label">Sent pending</div>
                  <div className="dr-kpi-value">{formatNumber(report.pipeline_metrics.sent_pending)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="dr-section">
            <div className="dr-section-head">
              <h2 className="dr-section-title">Status Distribution</h2>
              <span className="dr-muted">Counts + percentages</span>
            </div>
            <div className="dr-section-body">
              <div className="dr-status-list">
                {chartData.statusBreakdown.map((item) => (
                  <div className="dr-status-item" key={item.label}>
                    <div className="dr-status-label">
                      <span className={`dr-pill ${statusClass(item.label)}`}>{item.label}</span>
                      <span>{item.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="dr-status-value">{formatNumber(item.value)}</div>
                    <div className="dr-muted">{statusDescription(item.label)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dr-section">
            <div className="dr-section-head">
              <h2 className="dr-section-title">Financial Aggregations</h2>
              <span className="dr-muted">Sent, accepted, rejected, expired</span>
            </div>
            <div className="dr-section-body">
              <table className="dr-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.financialBar.labels.map((label: string, index: number) => (
                    <tr key={label}>
                      <td><span className={`dr-pill ${statusClass(label)}`}>{label}</span></td>
                      <td>{formatCurrency(chartData.financialBar.datasets[0].data[index] as number)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dr-grid">
            <div className="dr-section">
              <div className="dr-section-head">
                <h2 className="dr-section-title">Pipeline Metrics</h2>
              </div>
              <div className="dr-section-body">
                <div className="dr-status-item">
                  <div className="dr-status-label"><span>Sent pending</span><span>{formatNumber(report.pipeline_metrics.sent_pending)}</span></div>
                  <div className="dr-muted">Sent quotations waiting for approval.</div>
                  <div className="dr-mini-gauge">
                    <div className="dr-mini-gauge-row"><span>Share of all quotations</span><strong>{chartData.pendingRatio.toFixed(1)}%</strong></div>
                    <div className="dr-mini-gauge-track"><div className="dr-mini-gauge-fill" style={{ width: `${chartData.pendingRatio}%` }} /></div>
                  </div>
                </div>
                <div className="dr-status-item" style={{ marginTop: 12 }}>
                  <div className="dr-status-label"><span>Sent total value</span><span>{formatCurrency(report.pipeline_metrics.sent_total_value)}</span></div>
                  <div className="dr-muted">Tracked financial value currently in the pipeline.</div>
                  <div className="dr-mini-gauge">
                    <div className="dr-mini-gauge-row"><span>Share of financial total</span><strong>{chartData.sentValueRatio.toFixed(1)}%</strong></div>
                    <div className="dr-mini-gauge-track"><div className="dr-mini-gauge-fill" style={{ width: `${chartData.sentValueRatio}%` }} /></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dr-section">
              <div className="dr-section-head">
                <h2 className="dr-section-title">Lost Opportunities</h2>
              </div>
              <div className="dr-section-body">
                <div className="dr-lost-grid">
                  <div className="dr-lost-card rejected">
                    <div className="dr-lost-label">Rejected</div>
                    <div className="dr-lost-count">{formatNumber(report.lost_opportunity_metrics.rejected_count)}</div>
                    <div className="dr-lost-value">{formatCurrency(report.lost_opportunity_metrics.rejected_total ?? '0.00')}</div>
                  </div>
                  <div className="dr-lost-card expired">
                    <div className="dr-lost-label">Expired</div>
                    <div className="dr-lost-count">{formatNumber(report.lost_opportunity_metrics.expired_count)}</div>
                    <div className="dr-lost-value">{formatCurrency(report.lost_opportunity_metrics.expired_total ?? '0.00')}</div>
                  </div>
                  <div className="dr-lost-card total">
                    <div className="dr-lost-label">Total Lost</div>
                    <div className="dr-lost-count">{formatCurrency(report.lost_opportunity_metrics.lost_total ?? '0.00')}</div>
                    <div className="dr-lost-value">Rejected + expired quotations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dr-section">
            <div className="dr-section-head">
              <h2 className="dr-section-title">Aging Metrics</h2>
            </div>
            <div className="dr-section-body">
              <div className="dr-status-list">
                <div className="dr-status-item">
                  <div className="dr-status-label"><span>Sent over 7 days</span><span>{formatNumber(report.aging_metrics.sent_over_7_days)}</span></div>
                  <div className="dr-muted">Older open quotations that need attention.</div>
                </div>
                <div className="dr-status-item">
                  <div className="dr-status-label"><span>Sent over 30 days</span><span>{formatNumber(report.aging_metrics.sent_over_30_days)}</span></div>
                  <div className="dr-muted">Long-running quotations with higher follow-up urgency.</div>
                </div>
              </div>
              <div className="dr-chart-body short" style={{ marginTop: 12 }}>
                <Bar data={chartData.agingBar} options={buildCountBarOptions(true)} />
              </div>
            </div>
          </div>

          <div className="dr-section">
            <div className="dr-section-head">
              <h2 className="dr-section-title">Period</h2>
            </div>
            <div className="dr-section-body">
              <p className="dr-muted" style={{ margin: 0 }}>
                From <strong>{report.period.from}</strong> to <strong>{report.period.to}</strong>
              </p>
            </div>
          </div>
        </>
      ) : null}

      {!loading && !report && (
        <div className="dr-zero">
          <div className="dr-zero-icon">
            <TrendingUp size={34} />
          </div>
          <h3>No Devis Data</h3>
          <p>
            No quotation activity found for <span style={{ fontFamily: 'DM Mono, monospace' }}>{periodLabel}</span>.
          </p>
        </div>
      )}
    </div>
  );
}