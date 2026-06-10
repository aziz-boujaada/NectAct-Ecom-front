import React, { useEffect, useMemo, useState } from 'react';
import { fetchInventoryReport } from '../../api/catalog';
import { formatCurrency } from '../../utils/currency';
import { ReportFilters } from './ReportFilters';
import {
  Box,
  AlertCircle,
  Package,
  Warehouse,
  TrendingUp,
  Activity,
  ChevronRight,
  Layers,
  BarChart3,
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Legend,
  Title,
  Tooltip,
} from 'chart.js';
import { getDefaultReportRange } from './reportUtils';
import type { InventoryReport as InventoryReportResponse } from '../../types/reports';
import { Line, Radar } from 'react-chartjs-2';

type InventoryReportData = InventoryReportResponse['data'] | null;
type ReportViewMode = 'normal' | 'charts';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);
ChartJS.register(PointElement, LineElement, RadialLinearScale, Filler);

function toNumber(value: string | number | undefined) {
  if (value === undefined || value === null) return 0;

  if (typeof value === 'number') return value;

  const cleaned = value.replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
}

function toDecimal(value: string | number | undefined) {
  return toNumber(value);
}

function toPercentage(value: string | number | undefined) {
  if (value === undefined || value === null) return 0;

  const rawText = String(value).trim();
  const numericValue = toNumber(rawText);

  if (rawText.includes('%')) {
    return numericValue;
  }

  return numericValue <= 1 ? numericValue * 100 : numericValue;
}

function formatDecimal(value: string | number | undefined) {
  return toDecimal(value).toFixed(2);
}

function formatPercent(value: string | number | undefined) {
  return `${toPercentage(value).toFixed(1)}%`;
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
            return `${context.dataset.label}: ${context.dataset.label === 'Value' ? formatCurrency(Number(rawValue)) : Number(rawValue).toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(15, 23, 42, 0.06)' },
        ticks: { color: '#6b7280' },
      },
      y: {
        grid: { color: 'rgba(15, 23, 42, 0.06)' },
        ticks: { color: '#6b7280' },
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
        labels: {
          usePointStyle: true,
          pointStyle: 'circle' as const,
          boxWidth: 10,
          color: '#4b5563',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${Number(context.parsed.y ?? 0).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(15, 23, 42, 0.06)' },
        ticks: { color: '#6b7280' },
      },
      y: {
        grid: { color: 'rgba(15, 23, 42, 0.06)' },
        ticks: {
          color: '#6b7280',
          callback: (value: any) => Number(value).toFixed(2),
        },
      },
    },
  };
}

function buildRadarOptions() {
  return {
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
          label: (context: any) => `${context.dataset.label}: ${Number(context.parsed.r ?? 0).toFixed(1)}%`,
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 100,
        grid: { color: 'rgba(15, 23, 42, 0.08)' },
        angleLines: { color: 'rgba(15, 23, 42, 0.08)' },
        pointLabels: {
          color: '#4b5563',
          font: {
            family: 'DM Mono, monospace',
          },
        },
        ticks: {
          color: '#6b7280',
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };
}

/* ───────────────────────────────────────────────────────────── */
/* Premium inline styles */
/* ───────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=Instrument+Sans:wght@400;500;600&display=swap');

  .ir-root{
    --ir-bg:#f4f5f7;
    --ir-surface:#ffffff;
    --ir-surface2:#f0f1f4;
    --ir-border:rgba(0,0,0,0.08);
    --ir-border-hi:rgba(0,0,0,0.14);
    --ir-text:#0f1117;
    --ir-muted:#6b7280;
    --ir-dim:#4b5563;
    --ir-accent:#1a6af5;
    --ir-green:#0aaa82;
    --ir-warn:#d97706;
    --ir-danger:#dc2626;

    --ir-radius:14px;
    --ir-radius-sm:8px;

    background:var(--ir-bg);
    min-height:100vh;
    padding:32px 40px 80px;
    color:var(--ir-text);
    font-family:'Instrument Sans',sans-serif;
    box-sizing:border-box;
  }

  .ir-header{
    display:flex;
    align-items:flex-end;
    justify-content:space-between;
    padding-bottom:28px;
    margin-bottom:34px;
    border-bottom:1px solid var(--ir-border);
    position:relative;
  }

  .ir-header::after{
    content:'';
    position:absolute;
    left:0;
    bottom:-1px;
    width:78px;
    height:2px;
    border-radius:2px;
    background:var(--ir-accent);
  }

  .ir-eyebrow{
    font-family:'DM Mono',monospace;
    font-size:.7rem;
    letter-spacing:.18em;
    text-transform:uppercase;
    color:var(--ir-accent);
    display:flex;
    align-items:center;
    gap:8px;
    margin-bottom:8px;
  }

  .ir-eyebrow::before{
    content:'';
    width:14px;
    height:1px;
    background:var(--ir-accent);
    display:block;
  }

  .ir-title{
    font-family:'Syne',sans-serif;
    font-size:2.1rem;
    font-weight:800;
    letter-spacing:-0.03em;
    margin:0;
    line-height:1;
  }

  .ir-range{
    display:flex;
    align-items:center;
    gap:10px;
    padding:8px 14px;
    border-radius:100px;
    border:1px solid var(--ir-border-hi);
    background:var(--ir-surface);
    font-family:'DM Mono',monospace;
    font-size:.76rem;
    color:var(--ir-dim);
  }

  .ir-range-dot{
    width:6px;
    height:6px;
    border-radius:50%;
    background:var(--ir-accent);
    box-shadow:0 0 10px rgba(26,106,245,.4);
  }

  .ir-filters{
    margin-bottom:30px;
  }

  .ir-filters-top{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:16px;
    margin-bottom:16px;
    flex-wrap:wrap;
  }

  .ir-view-copy{
    min-width:220px;
  }

  .ir-view-label{
    font-family:'DM Mono',monospace;
    font-size:.7rem;
    text-transform:uppercase;
    letter-spacing:.15em;
    color:var(--ir-accent);
    margin-bottom:8px;
  }

  .ir-view-hint{
    margin:0;
    color:var(--ir-muted);
    font-size:.88rem;
    line-height:1.5;
  }

  .ir-view-toggle{
    display:inline-flex;
    align-items:center;
    gap:6px;
    padding:6px;
    border-radius:999px;
    background:var(--ir-surface);
    border:1px solid var(--ir-border);
    box-shadow:0 1px 4px rgba(0,0,0,.04);
  }

  .ir-view-toggle button{
    appearance:none;
    border:none;
    background:transparent;
    color:var(--ir-muted);
    font-family:'DM Mono',monospace;
    font-size:.74rem;
    letter-spacing:.06em;
    text-transform:uppercase;
    padding:10px 14px;
    border-radius:999px;
    cursor:pointer;
    transition:.2s ease;
  }

  .ir-view-toggle button:hover{
    color:var(--ir-text);
    background:var(--ir-surface2);
  }

  .ir-view-toggle button.active{
    background:var(--ir-accent);
    color:#fff;
    box-shadow:0 8px 18px rgba(26,106,245,.18);
  }

  .ir-charts-grid{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(300px,1fr));
    gap:14px;
    margin-bottom:28px;
  }

  .ir-chart-body{
    height:320px;
    padding:18px 20px 22px;
  }

  .ir-chart-body.tall{
    height:340px;
  }

  .ir-chart-caption{
    margin:0 20px 18px;
    color:var(--ir-muted);
    font-size:.82rem;
    line-height:1.5;
  }

  .ir-error{
    display:flex;
    gap:14px;
    padding:18px 22px;
    border-radius:var(--ir-radius);
    border:1px solid rgba(220,38,38,.18);
    background:rgba(220,38,38,.05);
    margin-bottom:24px;
    animation:ir-fade .35s ease;
  }

  .ir-error p{
    margin:0;
    color:#991b1b;
    font-size:.9rem;
  }

  .ir-loading{
    text-align:center;
    padding:80px 20px;
    animation:ir-fade .3s ease;
  }

  .ir-spinner{
    width:28px;
    height:28px;
    border-radius:50%;
    border:2px solid var(--ir-border);
    border-top-color:var(--ir-accent);
    animation:ir-spin .7s linear infinite;
    margin:0 auto 16px;
  }

  .ir-loading p{
    margin:0;
    font-family:'DM Mono',monospace;
    color:var(--ir-muted);
    font-size:.78rem;
    letter-spacing:.08em;
  }

  .ir-kpis{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:14px;
    margin-bottom:28px;
  }

  .ir-kpi{
    position:relative;
    overflow:hidden;
    background:var(--ir-surface);
    border:1px solid var(--ir-border);
    border-radius:var(--ir-radius);
    padding:22px;
    transition:.2s ease;
    animation:ir-fadeup .45s ease both;
    box-shadow:0 1px 4px rgba(0,0,0,.05);
  }

  .ir-kpi:hover{
    transform:translateY(-2px);
    border-color:var(--ir-border-hi);
    box-shadow:0 10px 24px rgba(0,0,0,.08);
  }

  .ir-kpi-icon{
    width:36px;
    height:36px;
    border-radius:10px;
    display:flex;
    align-items:center;
    justify-content:center;
    margin-bottom:16px;
  }

  .ir-kpi-icon.blue{
    background:rgba(26,106,245,.09);
    color:var(--ir-accent);
  }

  .ir-kpi-icon.green{
    background:rgba(10,170,130,.1);
    color:var(--ir-green);
  }

  .ir-kpi-icon.warn{
    background:rgba(217,119,6,.1);
    color:var(--ir-warn);
  }

  .ir-kpi-icon.red{
    background:rgba(220,38,38,.08);
    color:var(--ir-danger);
  }

  .ir-kpi-label{
    font-size:.72rem;
    text-transform:uppercase;
    letter-spacing:.1em;
    color:var(--ir-muted);
    font-family:'DM Mono',monospace;
    margin-bottom:8px;
  }

  .ir-kpi-value{
    font-size:1.9rem;
    font-weight:700;
    line-height:1;
    letter-spacing:-0.03em;
    font-family:'Syne',sans-serif;
  }

  .ir-kpi-value.blue{ color:var(--ir-accent); }
  .ir-kpi-value.green{ color:var(--ir-green); }
  .ir-kpi-value.warn{ color:var(--ir-warn); }
  .ir-kpi-value.red{ color:var(--ir-danger); }

  .ir-kpi-corner{
    position:absolute;
    right:18px;
    bottom:16px;
    display:flex;
    align-items:center;
    gap:4px;
    font-family:'DM Mono',monospace;
    font-size:.68rem;
    color:var(--ir-muted);
    opacity:.7;
  }

  .ir-card{
    background:var(--ir-surface);
    border:1px solid var(--ir-border);
    border-radius:var(--ir-radius);
    overflow:hidden;
    margin-bottom:14px;
    animation:ir-fadeup .45s ease both;
    box-shadow:0 1px 4px rgba(0,0,0,.05);
    transition:.2s ease;
  }

  .ir-card:hover{
    border-color:var(--ir-border-hi);
    box-shadow:0 8px 24px rgba(0,0,0,.07);
  }

  .ir-card-head{
    padding:18px 22px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    border-bottom:1px solid var(--ir-border);
  }

  .ir-card-title{
    display:flex;
    align-items:center;
    gap:10px;
    font-family:'Syne',sans-serif;
    font-size:.95rem;
    font-weight:700;
  }

  .ir-card-dot{
    width:7px;
    height:7px;
    border-radius:50%;
    background:var(--ir-accent);
  }

  .ir-card-count{
    padding:3px 10px;
    border-radius:100px;
    background:var(--ir-surface2);
    border:1px solid var(--ir-border);
    color:var(--ir-muted);
    font-size:.72rem;
    font-family:'DM Mono',monospace;
  }

  .ir-table-wrap{
    overflow-x:auto;
  }

  .ir-table{
    width:100%;
    border-collapse:collapse;
    font-size:.88rem;
  }

  .ir-table thead tr{
    border-bottom:1px solid var(--ir-border);
  }

  .ir-table th{
    padding:12px 20px;
    text-align:left;
    white-space:nowrap;
    font-size:.68rem;
    text-transform:uppercase;
    letter-spacing:.1em;
    color:var(--ir-muted);
    font-family:'DM Mono',monospace;
    font-weight:400;
  }

  .ir-table td{
    padding:14px 20px;
    color:var(--ir-dim);
    border-bottom:1px solid var(--ir-border);
  }

  .ir-table tbody tr:last-child td{
    border-bottom:none;
  }

  .ir-table tbody tr:hover{
    background:var(--ir-surface2);
  }

  .ir-table .right{
    text-align:right;
  }

  .ir-strong{
    font-weight:600;
    color:var(--ir-text);
  }

  .ir-mono{
    font-family:'DM Mono',monospace;
  }

  .ir-chip{
    display:inline-flex;
    align-items:center;
    padding:4px 10px;
    border-radius:7px;
    font-size:.72rem;
    font-family:'DM Mono',monospace;
    font-weight:500;
  }

  .ir-chip.blue{
    background:rgba(26,106,245,.08);
    color:var(--ir-accent);
  }

  .ir-chip.green{
    background:rgba(10,170,130,.09);
    color:var(--ir-green);
  }

  .ir-chip.warn{
    background:rgba(217,119,6,.1);
    color:var(--ir-warn);
  }

  .ir-chip.red{
    background:rgba(220,38,38,.08);
    color:var(--ir-danger);
  }

  .ir-two-col{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(360px,1fr));
    gap:14px;
    margin-bottom:14px;
  }

  .ir-stats{
    display:grid;
    gap:14px;
    padding:20px;
  }

  .ir-stat{
    background:var(--ir-surface2);
    border:1px solid var(--ir-border);
    border-radius:12px;
    padding:16px;
  }

  .ir-empty{
    text-align:center;
    padding:52px 24px;
  }

  .ir-empty-icon{
    width:52px;
    height:52px;
    margin:0 auto 16px;
    opacity:.15;
    display:flex;
    align-items:center;
    justify-content:center;
  }

  .ir-empty p{
    margin:0;
    color:var(--ir-muted);
    font-family:'DM Mono',monospace;
    font-size:.82rem;
  }

  .ir-zero{
    text-align:center;
    padding:100px 40px;
  }

  .ir-zero-icon{
    width:82px;
    height:82px;
    margin:0 auto 24px;
    border-radius:24px;
    background:var(--ir-surface);
    border:1px solid var(--ir-border);
    display:flex;
    align-items:center;
    justify-content:center;
    opacity:.5;
    color:var(--ir-muted);
  }

  .ir-zero h3{
    margin:0 0 10px;
    font-family:'Syne',sans-serif;
    font-size:1.45rem;
    letter-spacing:-0.02em;
  }

  .ir-zero p{
    margin:0;
    color:var(--ir-muted);
    line-height:1.6;
    max-width:360px;
    margin-inline:auto;
  }

  @keyframes ir-spin{
    to{transform:rotate(360deg)}
  }

  @keyframes ir-fade{
    from{opacity:0}
    to{opacity:1}
  }

  @keyframes ir-fadeup{
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
/* Tiny reusable components */
/* ───────────────────────────────────────────────────────────── */

const IrCard: React.FC<{
  title: string;
  count?: number;
  children: React.ReactNode;
}> = ({ title, count, children }) => (
  <div className="ir-card">
    <div className="ir-card-head">
      <div className="ir-card-title">
        <span className="ir-card-dot" />
        {title}
      </div>

      {count !== undefined && (
        <div className="ir-card-count">
          {count}
        </div>
      )}
    </div>

    {children}
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="ir-empty">
    <div className="ir-empty-icon">
      <Layers size={36} />
    </div>
    <p>{message}</p>
  </div>
);

/* ───────────────────────────────────────────────────────────── */
/* Main component */
/* ───────────────────────────────────────────────────────────── */

export const InventoryReport: React.FC = () => {
  const [data, setData] = useState<InventoryReportData>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ReportViewMode>('normal');

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

  const selectedRange = currentData
    ? `${currentData.period.from} → ${currentData.period.to}`
    : 'all dates';

  const chartData = useMemo(() => {
    if (!currentData) return null;

    const stockSummary = {
      labels: ['Total Products', 'Total Units', 'Out of Stock', 'Low Stock'],
      data: {
        labels: ['Total Products', 'Total Units', 'Out of Stock', 'Low Stock'],
        datasets: [
          {
            label: 'Count',
            data: [
              currentData.stock_levels.total_products,
              currentData.stock_levels.total_units,
              currentData.stock_levels.out_of_stock_products,
              currentData.stock_levels.low_stock_products,
            ],
            backgroundColor: ['#1a6af5', '#0aaa82', '#dc2626', '#d97706'],
            borderRadius: 10,
            borderSkipped: false,
          },
        ],
      },
    };

    const valuationItems = [...currentData.inventory_valuation.items]
      .map((item) => ({
        label: item.name,
        value: toNumber(item.inventory_value),
      }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 8);

    const turnoverItems = [...currentData.turnover_rates]
      .map((item) => ({
        label: item.name,
        turnoverRate: toDecimal(item.turnover_rate),
        currentStock: item.current_stock,
      }))
      .sort((left, right) => right.turnoverRate - left.turnoverRate)
      .slice(0, 8);

    return {
      stockSummary,
      valuation: {
        labels: valuationItems.map((item) => item.label),
        data: {
          labels: valuationItems.map((item) => item.label),
          datasets: [
            {
              label: 'Value',
              data: valuationItems.map((item) => item.value),
              backgroundColor: '#0aaa82',
              borderRadius: 10,
              borderSkipped: false,
            },
          ],
        },
      },
      turnover: {
        labels: turnoverItems.map((item) => item.label),
        data: {
          labels: turnoverItems.map((item) => item.label),
          datasets: [
            {
              label: 'Turnover Rate',
              data: turnoverItems.map((item) => item.turnoverRate),
              borderColor: '#1a6af5',
              backgroundColor: 'rgba(26,106,245,0.14)',
              tension: 0.32,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#1a6af5',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
            },
          ],
        },
      },
      warehouse: {
        labels: ['Movement Throughput', 'Active SKU Ratio', 'Low Stock Ratio'],
        data: {
          labels: ['Movement Throughput', 'Active SKU Ratio', 'Low Stock Ratio'],
          datasets: [
            {
              label: 'Efficiency %',
              data: [
                toPercentage(currentData.warehouse_efficiency.movement_throughput),
                toPercentage(currentData.warehouse_efficiency.active_sku_ratio),
                toPercentage(currentData.warehouse_efficiency.low_stock_ratio),
              ],
              borderColor: '#0aaa82',
              backgroundColor: 'rgba(10,170,130,0.18)',
              pointBackgroundColor: '#0aaa82',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              borderWidth: 2,
            },
          ],
        },
      },
    };
  }, [currentData]);

  return (
    <section className="ir-root">
      <style>{css}</style>

      {/* Header */}
      <div className="ir-header">
        <div>
          <div className="ir-eyebrow">Reporting</div>
          <h1 className="ir-title">Inventory Reports</h1>
        </div>

        {currentData && (
          <div className="ir-range">
            <span className="ir-range-dot" />
            {selectedRange}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="ir-filters">
        <div className="ir-filters-top">
          <div className="ir-view-copy">
            <div className="ir-view-label">View mode</div>
            <p className="ir-view-hint">
              Switch between the detailed inventory report and a visual summary of the same stock data.
            </p>
          </div>

          <div className="ir-view-toggle" role="tablist" aria-label="Inventory report view mode">
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
        <div className="ir-error">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="ir-loading">
          <div className="ir-spinner" />
          <p>Analyzing inventory operations...</p>
        </div>
      )}

      {/* Content */}
      {!loading && currentData && viewMode === 'charts' && (
        <div>
          <div className="ir-charts-grid">
            <IrCard title="Stock Summary" count={chartData?.stockSummary.labels.length ?? 0}>
              <div className="ir-chart-body">
                <Bar data={chartData?.stockSummary.data ?? { labels: [], datasets: [] }} options={buildBarOptions()} />
              </div>
            </IrCard>

            <IrCard title="Inventory Valuation" count={chartData?.valuation.labels.length ?? 0}>
              <div className="ir-chart-body">
                <Bar data={chartData?.valuation.data ?? { labels: [], datasets: [] }} options={buildBarOptions()} />
              </div>
            </IrCard>

            <IrCard title="Turnover Rates" count={chartData?.turnover.labels.length ?? 0}>
              <div className="ir-chart-body">
                <Line data={chartData?.turnover.data ?? { labels: [], datasets: [] }} options={buildLineOptions()} />
              </div>
            </IrCard>

            <IrCard title="Warehouse Efficiency" count={chartData?.warehouse.labels.length ?? 0}>
              <p className="ir-chart-caption">
                Efficiency is shown as a percentage, not a decimal.
              </p>
              <div className="ir-chart-body">
                <Radar data={chartData?.warehouse.data ?? { labels: [], datasets: [] }} options={buildRadarOptions()} />
              </div>
            </IrCard>
          </div>

          {!currentData.stock_levels.items.length && !currentData.inventory_valuation.items.length && (
            <div className="ir-zero">
              <div className="ir-zero-icon">
                <TrendingUp size={34} />
              </div>

              <h3>No Inventory Data</h3>

              <p>
                No inventory activity found for{' '}
                <span className="ir-mono">
                  {selectedRange}
                </span>.
              </p>
            </div>
          )}
        </div>
      )}

      {!loading && currentData && viewMode === 'normal' && (
        <div>
          <div className="ir-kpis">
            <div className="ir-kpi">
              <div className="ir-kpi-icon blue">
                <Package size={17} />
              </div>

              <div className="ir-kpi-label">Total Products</div>

              <div className="ir-kpi-value blue">
                {currentData.stock_levels.total_products}
              </div>

              <div className="ir-kpi-corner">
                <ChevronRight size={11} />
                catalog size
              </div>
            </div>

            <div className="ir-kpi">
              <div className="ir-kpi-icon green">
                <Warehouse size={17} />
              </div>

              <div className="ir-kpi-label">Total Units</div>

              <div className="ir-kpi-value green">
                {currentData.stock_levels.total_units}
              </div>

              <div className="ir-kpi-corner">
                <ChevronRight size={11} />
                stored units
              </div>
            </div>

            <div className="ir-kpi">
              <div className="ir-kpi-icon red">
                <AlertCircle size={17} />
              </div>

              <div className="ir-kpi-label">Out of Stock</div>

              <div className="ir-kpi-value red">
                {currentData.stock_levels.out_of_stock_products}
              </div>

              <div className="ir-kpi-corner">
                <ChevronRight size={11} />
                unavailable
              </div>
            </div>

            <div className="ir-kpi">
              <div className="ir-kpi-icon warn">
                <TrendingUp size={17} />
              </div>

              <div className="ir-kpi-label">Low Stock</div>

              <div className="ir-kpi-value warn">
                {currentData.stock_levels.low_stock_products}
              </div>

              <div className="ir-kpi-corner">
                <ChevronRight size={11} />
                attention
              </div>
            </div>
          </div>

          <IrCard
            title="Stock Levels"
            count={currentData.stock_levels.items.length}
          >
            {currentData.stock_levels.items.length > 0 ? (
              <div className="ir-table-wrap">
                <table className="ir-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Product</th>
                      <th>Stock</th>
                      <th>Min Stock</th>
                      <th>Alert Stock</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.stock_levels.items.map((item) => (
                      <tr key={item.id}>
                        <td><span className="ir-chip blue">{item.reference}</span></td>
                        <td><span className="ir-strong">{item.name}</span></td>
                        <td>
                          <span
                            className={
                              item.stock <= item.min_stock
                                ? 'ir-chip red'
                                : item.stock <= item.alert_stock
                                  ? 'ir-chip warn'
                                  : 'ir-chip green'
                            }
                          >
                            {item.stock}
                          </span>
                        </td>
                        <td className="ir-mono">{item.min_stock}</td>
                        <td className="ir-mono">{item.alert_stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="No stock level items returned for this period." />
            )}
          </IrCard>

          <IrCard
            title="Inventory Valuation"
            count={currentData.inventory_valuation.items.length}
          >
            {currentData.inventory_valuation.items.length > 0 ? (
              <div className="ir-table-wrap">
                <table className="ir-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Product</th>
                      <th>Stock</th>
                      <th className="right">Average Cost</th>
                      <th className="right">Inventory Value</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentData.inventory_valuation.items.map((item) => (
                      <tr key={item.id}>
                        <td><span className="ir-chip blue">{item.reference}</span></td>
                        <td><span className="ir-strong">{item.name}</span></td>
                        <td className="ir-mono">{item.stock}</td>
                        <td className="right"><span className="ir-mono">{formatCurrency(item.average_cost)}</span></td>
                        <td className="right"><span className="ir-chip green">{formatCurrency(item.inventory_value)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="No inventory valuation items returned for this period." />
            )}
          </IrCard>

          <div className="ir-two-col">
            <IrCard
              title="Turnover Rates"
              count={currentData.turnover_rates.length}
            >
              {currentData.turnover_rates.length > 0 ? (
                <div className="ir-table-wrap">
                  <table className="ir-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Sold</th>
                        <th className="right">Turnover</th>
                        <th className="right">Sales</th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentData.turnover_rates.map((item) => (
                        <tr key={item.id}>
                          <td><span className="ir-strong">{item.name}</span></td>
                          <td className="ir-mono">{item.sold_quantity}</td>
                          <td className="right"><span className="ir-chip blue">{formatDecimal(item.turnover_rate)}</span></td>
                          <td className="right"><span className="ir-mono">{formatCurrency(item.sales_total)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState message="No turnover records returned." />
              )}
            </IrCard>

            <IrCard title="Warehouse Efficiency">
              <div className="ir-stats">
                <div className="ir-stat">
                  <div className="ir-kpi-label">Movement Throughput</div>
                  <div className="ir-kpi-value blue">{formatPercent(currentData.warehouse_efficiency.movement_throughput)}</div>
                </div>

                <div className="ir-stat">
                  <div className="ir-kpi-label">Active SKU Ratio</div>
                  <div className="ir-kpi-value">{formatPercent(currentData.warehouse_efficiency.active_sku_ratio)}</div>
                </div>

                <div className="ir-stat">
                  <div className="ir-kpi-label">Low Stock Ratio</div>
                  <div className="ir-kpi-value red">{formatPercent(currentData.warehouse_efficiency.low_stock_ratio)}</div>
                </div>
              </div>
            </IrCard>
          </div>

          {!currentData.stock_levels.items.length &&
            !currentData.inventory_valuation.items.length && (
              <div className="ir-zero">
                <div className="ir-zero-icon">
                  <Box size={34} />
                </div>

                <h3>No Inventory Data</h3>

                <p>
                  No inventory activity found for{' '}
                  <span className="ir-mono">
                    {selectedRange}
                  </span>.
                </p>
              </div>
            )}
        </div>
      )}

      {/* Default state */}
      {!loading && !error && !currentData && (
        <div className="ir-zero">
          <div className="ir-zero-icon">
            <BarChart3 size={34} />
          </div>

          <h3>Inventory Intelligence</h3>

          <p>
            Analyze stock movement, warehouse efficiency,
            and valuation performance by selecting a date range.
          </p>
        </div>
      )}
    </section>
  );
};