import { AlertTriangle, X, AlertCircle, TrendingDown, Eye, CheckCircle, Loader } from 'lucide-react';
import type { Alert } from '../../types';
import { markAlertAsRead } from '../../api/catalog';
import { useState } from 'react';
import { AlertDetails } from './AlertDetails';
import './AlertsPanel.css';

type AlertsPanelProps = {
  alerts: Alert[];
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onAlertRead?: () => void;
};

function getAlertIcon(type: string) {
  switch (type) {
    case 'low_stock':
      return <TrendingDown size={18} className="alert-icon-low" />;
    case 'out_of_stock':
      return <AlertTriangle size={18} className="alert-icon-critical" />;
    case 'warning':
      return <AlertTriangle size={18} className="alert-icon-warning" />;
    default:
      return <AlertCircle size={18} className="alert-icon-info" />;
  }
}

function getAlertBadgeClass(type: string): string {
  switch (type) {
    case 'low_stock':
      return 'alert-badge-low-stock';
    case 'out_of_stock':
      return 'alert-badge-out-of-stock';
    case 'warning':
      return 'alert-badge-warning';
    default:
      return 'alert-badge-info';
  }
}

function getAlertLabel(type: string): string {
  switch (type) {
    case 'low_stock':
      return 'Low Stock';
    case 'out_of_stock':
      return 'Out of Stock';
    case 'warning':
      return 'Warning';
    default:
      return 'Info';
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

export function AlertsPanel({ alerts, isOpen, onClose, unreadCount, onAlertRead }: AlertsPanelProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState<number | null>(null);

  const handleQuickMarkAsRead = async (alert: Alert, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setMarkingAsRead(alert.id);
      await markAlertAsRead(alert.id);
      onAlertRead?.();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="alerts-overlay" onClick={onClose} />

      {/* Panel */}
      <div className="alerts-panel fade-in">
        <div className="alerts-header">
          <h3>Notifications</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close alerts">
            <X size={20} />
          </button>
        </div>

        {unreadCount > 0 && (
          <div className="alerts-unread-indicator">
            {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
          </div>
        )}

        <div className="alerts-content">
          {alerts.length === 0 ? (
            <div className="alerts-empty">
              <AlertCircle size={32} />
              <p>No alerts</p>
            </div>
          ) : (
            <div className="alerts-list">
              {alerts.map((alert) => (
                <div key={alert.id} className={`alert-item ${alert.is_read === 0 ? 'unread' : 'read'}`}>
                  <div className="alert-icon-wrapper">{getAlertIcon(alert.type)}</div>

                  <div className="alert-content" onClick={() => setSelectedAlert(alert)} style={{ cursor: 'pointer' }}>
                    <div className="alert-header-row">
                      <span className={`alert-badge ${getAlertBadgeClass(alert.type)}`}>
                        {getAlertLabel(alert.type)}
                      </span>
                      <span className="alert-time">{formatDate(alert.created_at)}</span>
                    </div>

                    <p className="alert-product">{alert.product}</p>

                    {(alert.type === 'low_stock' || alert.type === 'out_of_stock') && alert.stock !== undefined && alert.alert_stock !== undefined && (
                      <div className="alert-stock-info">
                        <span className="stock-current">
                          Current: <strong>{alert.stock}</strong>
                        </span>
                        <span className="stock-threshold">
                          Threshold: <strong>{alert.alert_stock}</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="alert-actions">
                    <button
                      className="alert-action-btn view-btn"
                      onClick={() => setSelectedAlert(alert)}
                      title="View details"
                      aria-label="View alert details"
                    >
                      <Eye size={16} />
                    </button>

                    {alert.is_read === 0 && (
                      <button
                        className="alert-action-btn read-btn"
                        onClick={(e) => handleQuickMarkAsRead(alert, e)}
                        disabled={markingAsRead === alert.id}
                        title="Mark as read"
                        aria-label="Mark alert as read"
                      >
                        {markingAsRead === alert.id ? <Loader size={16} className="spin" /> : <CheckCircle size={16} />}
                      </button>
                    )}
                  </div>

                  {alert.is_read === 0 && <div className="alert-unread-dot" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {alerts.length > 0 && (
          <div className="alerts-footer">
            <button className="clear-btn" onClick={onClose}>
              Dismiss
            </button>
          </div>
        )}
      </div>

      {selectedAlert && (
        <AlertDetails
          alert={selectedAlert}
          isOpen={true}
          onClose={() => setSelectedAlert(null)}
          onMarkedAsRead={onAlertRead}
        />
      )}
    </>
  );
}
