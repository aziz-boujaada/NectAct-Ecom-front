import { AlertCircle, CheckCircle, InfoIcon, X } from 'lucide-react';
import type { ValidationError } from '../../utils/refundValidation';

type ValidationMessageProps = {
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
};

type ValidationListProps = {
  errors: ValidationError[];
  onClose?: () => void;
  dismissible?: boolean;
};

const typeConfig = {
  error: {
    icon: AlertCircle,
    className: 'error-message',
    bgClass: 'error-bg',
  },
  warning: {
    icon: AlertCircle,
    className: 'warning-message',
    bgClass: 'warning-bg',
  },
  success: {
    icon: CheckCircle,
    className: 'success-message',
    bgClass: 'success-bg',
  },
  info: {
    icon: InfoIcon,
    className: 'info-message',
    bgClass: 'info-bg',
  },
};

export function ValidationMessage({ type, message, onClose, dismissible = true }: ValidationMessageProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`validation-message ${config.className}`} role="alert">
      <div className="validation-message-content">
        <Icon size={16} className="validation-icon" aria-hidden="true" />
        <p className="validation-text">{message}</p>
      </div>
      {dismissible && onClose && (
        <button className="validation-close" onClick={onClose} type="button" aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export function ValidationList({ errors, onClose, dismissible = true }: ValidationListProps) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="validation-list" role="alert">
      <div className="validation-list-header">
        <div className="validation-list-title">
          <AlertCircle size={16} />
          <span>Validation Errors ({errors.length})</span>
        </div>
        {dismissible && onClose && (
          <button className="validation-close" onClick={onClose} type="button" aria-label="Dismiss">
            <X size={16} />
          </button>
        )}
      </div>
      <ul className="validation-list-items">
        {errors.map((error, index) => (
          <li key={index} className="validation-list-item">
            {error.field && <span className="validation-field">{error.field}:</span>}
            <span>{error.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RefundValidationDisplay({ errors, onClose }: { errors: ValidationError[]; onClose?: () => void }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className="refund-validation-container">
      <ValidationList errors={errors} onClose={onClose} dismissible={true} />
    </div>
  );
}
