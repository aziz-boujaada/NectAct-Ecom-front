import { AlertTriangle, AlertCircle, TrendingDown, X, CheckCircle, Loader } from 'lucide-react';
import type { Alert } from '../../types';
import { markAlertAsRead } from '../../api/catalog';
import { useState } from 'react';
import './AlertDetails.css';

type AlertDetailsProps = {
  alert: Alert;
  isOpen: boolean;
  onClose: () => void;
  onMarkedAsRead?: () => void;
};

function getAlertIcon(type: string) {
  switch (type) {
    case 'low_stock':
      return <TrendingDown size={24} className="alert-icon-low" />;
    case 'out_of_stock':
      return <AlertTriangle size={24} className="alert-icon-critical" />;
    case 'warning':
      return <AlertTriangle size={24} className="alert-icon-warning" />;
    default:
      return <AlertCircle size={24} className="alert-icon-info" />;
  }
}

function getAlertLabel(type: string): string {
  switch (type) {
    case 'low_stock':
      return 'Low Stock Alert';
    case 'out_of_stock':
      return 'Out of Stock Alert';
    case 'warning':
      return 'Warning Alert';
    default:
      return 'Information Alert';
  }
}

function getAlertDescription(alert: Alert): string {
  switch (alert.type) {
    case 'low_stock':
      return `The product "${alert.product}" has low stock levels. Current stock: ${alert.stock}, Alert threshold: ${alert.alert_stock}. Please consider restocking soon.`;
    case 'out_of_stock':
      return `The product "${alert.product}" is out of stock. Please reorder this item immediately to avoid stockouts.`;
    case 'warning':
      return alert.product;
    default:
      return alert.product;
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AlertDetails({ alert, isOpen, onClose, onMarkedAsRead }: AlertDetailsProps) {
  const [loading, setLoading] = useState(false);

  const handleMarkAsRead = async () => {
    try {
      setLoading(true);
      await markAlertAsRead(alert.id);
      onMarkedAsRead?.();
      onClose();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="alert-details-overlay" onClick={onClose} />
      <div className="alert-details-modal fade-in">
        <div className="alert-details-header">
          <div className="alert-details-icon-wrapper">{getAlertIcon(alert.type)}</div>
          <button className="alert-details-close" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <div className="alert-details-content">
          <div className="alert-details-title">
            <h2>{getAlertLabel(alert.type)}</h2>
            {alert.is_read === 0 && <span className="alert-details-unread-badge">Unread</span>}
          </div>

          <p className="alert-details-description">{getAlertDescription(alert)}</p>

          <div className="alert-details-info">
            <div className="info-item">
              <span className="info-label">Product Name</span>
              <p className="info-value">{alert.product}</p>
            </div>

            {(alert.type === 'low_stock' || alert.type === 'out_of_stock') && (
              <>
                <div className="info-item">
                  <span className="info-label">Current Stock</span>
                  <p className={`info-value ${alert.stock === 0 ? 'critical' : 'warning'}`}>
                    {alert.stock ?? 'N/A'} units
                  </p>
                </div>

                <div className="info-item">
                  <span className="info-label">Alert Threshold</span>
                  <p className="info-value">{alert.alert_stock ?? 'N/A'} units</p>
                </div>
              </>
            )}

            <div className="info-item">
              <span className="info-label">Alert Date</span>
              <p className="info-value">{formatDate(alert.created_at)}</p>
            </div>

            <div className="info-item">
              <span className="info-label">Status</span>
              <p className={`info-value ${alert.is_read === 0 ? 'unread-status' : 'read-status'}`}>
                {alert.is_read === 0 ? 'Unread' : 'Read'}
              </p>
            </div>
          </div>
        </div>

        <div className="alert-details-footer">
          {alert.is_read === 0 ? (
            <button className="btn-mark-read" onClick={handleMarkAsRead} disabled={loading}>
              {loading ? (
                <>
                  <Loader size={16} className="spin" />
                  Marking as read...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Mark as Read
                </>
              )}
            </button>
          ) : (
            <div className="alert-already-read">
              <CheckCircle size={16} className="check-icon" />
              <span>Already marked as read</span>
            </div>
          )}
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  );
}
