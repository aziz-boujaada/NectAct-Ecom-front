import React, { useState } from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import { getDefaultReportRange } from './reportUtils';

interface ReportFiltersProps {
  onApply: (from: string, to: string) => void;
  onReset: () => void;
  loading?: boolean;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({ onApply, onReset, loading = false }) => {
  const { from: thirtyDaysAgo, to: today } = getDefaultReportRange();

  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);

  const handleApply = () => {
    onApply(fromDate, toDate);
  };

  const handleReset = () => {
    setFromDate(thirtyDaysAgo);
    setToDate(today);
    onReset();
  };

  return (
    <div className="erp-card shadow-sm" style={{ marginBottom: '24px', borderRadius: 'var(--radius-lg)' }}>
      <div className="erp-card-body" style={{ padding: '20px' }}>
        <div style={{ 
          display: 'grid', 
          gap: '20px', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          alignItems: 'end'
        }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="kpi-label" style={{ marginBottom: '8px', display: 'block' }}>From Date</label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              padding: '8px 12px',
              background: 'var(--field-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
              transition: 'var(--transition-fast)'
            }}>
              <Calendar size={16} style={{ color: 'var(--primary)' }} />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                disabled={loading}
                style={{ 
                  flex: 1, 
                  border: 'none', 
                  background: 'transparent',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="kpi-label" style={{ marginBottom: '8px', display: 'block' }}>To Date</label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              padding: '8px 12px',
              background: 'var(--field-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
              transition: 'var(--transition-fast)'
            }}>
              <Calendar size={16} style={{ color: 'var(--primary)' }} />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                disabled={loading}
                style={{ 
                  flex: 1, 
                  border: 'none', 
                  background: 'transparent',
                  outline: 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="primary-action"
              onClick={handleApply}
              disabled={loading}
              type="button"
              style={{ flex: 2, justifyContent: 'center', height: '42px' }}
            >
              {loading ? 'Loading...' : 'Apply Filters'}
            </button>
            <button
              className="secondary-action"
              onClick={handleReset}
              disabled={loading}
              type="button"
              title="Reset to last 30 days"
              style={{ flex: 1, justifyContent: 'center', height: '42px' }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
