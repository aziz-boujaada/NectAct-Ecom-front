import React from "react";
import { useTranslation } from "react-i18next";
import type { Payment } from "../../types";
import { formatCurrency } from "../../utils/currency";
import {
  formatPaymentMethod,
  getPaymentMethodIcon,
  formatPaymentDate,
} from "../../utils/payment";

interface PaymentApprovalConfirmProps {
  payment: Payment;
  isOpen: boolean;
  isApproving: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PaymentApprovalConfirm: React.FC<PaymentApprovalConfirmProps> = ({
  payment,
  isOpen,
  isApproving,
  error,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation("payments");
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content approval-confirm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t("approval.title")}</h2>
          <button onClick={onCancel} className="modal-close" disabled={isApproving}>
            ✕
          </button>
        </div>

        <div className="modal-body approval-body">
          <div className="approval-warning">
            <p className="warning-title">⚠️ {t("approval.reviewWarning")}</p>
          </div>

          <div className="approval-details">
            <div className="detail-row">
              <span className="detail-label">{t("details.paymentId")}:</span>
              <span className="detail-value">#{payment.id}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">{t("details.saleId")}:</span>
              <span className="detail-value">#{payment.sale_id}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">{t("details.client")}:</span>
              <span className="detail-value">{payment.client?.name || `${t("details.client")} #${payment.client_id}`}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">{t("details.paymentMethod")}:</span>
              <span className="detail-value">
                {getPaymentMethodIcon(payment.method)} {t(`methods.${payment.method}`)}
              </span>
            </div>

            <div className="detail-row highlight">
              <span className="detail-label">{t("details.totalAmount")}:</span>
              <span className="detail-value amount">{formatCurrency(payment.amount)}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">{t("details.createdDate")}:</span>
              <span className="detail-value">{formatPaymentDate(payment.created_at)}</span>
            </div>
          </div>

          <div className="approval-confirmation">
            <p className="confirmation-text">
              {t("approval.confirmQuestion")}
            </p>
            {payment.notes && (
              <div className="approval-notes">
                <p className="notes-label">{t("details.notes")}:</p>
                <p className="notes-content">{payment.notes}</p>
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-error">
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="modal-footer approval-footer">
          <button
            onClick={onCancel}
            disabled={isApproving}
            className="btn btn-secondary"
          >
            {t("actions.cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isApproving}
            className="btn btn-primary btn-approve"
          >
            {isApproving ? t("approval.approving") : `✓ ${t("actions.approvePayment")}`}
          </button>
        </div>
      </div>
    </div>
  );
};

interface PendingPaymentCardProps {
  payment: Payment;
  onApprove: (payment: Payment) => void;
  loading?: boolean;
}

export const PendingPaymentCard: React.FC<PendingPaymentCardProps> = ({
  payment,
  onApprove,
  loading = false,
}) => {
  const { t } = useTranslation("payments");
  return (
    <div className="pending-payment-card">
      <div className="card-header">
        <h3>{t("table.sale")} #{payment.sale_id}</h3>
        <span className="badge pending">⏳ {t("statuses.pending")}</span>
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="label">{t("approval.clientId")}</span>
          <span className="value">#{payment.client_id}</span>
        </div>

        <div className="info-row">
          <span className="label">{t("details.paymentMethod")}:</span>
          <span className="value">
            {getPaymentMethodIcon(payment.method)} {t(`methods.${payment.method}`)}
          </span>
        </div>

        <div className="info-row highlight">
          <span className="label">{t("details.totalAmount")}:</span>
          <span className="amount">{formatCurrency(payment.amount)}</span>
        </div>

        <div className="info-row">
          <span className="label">{t("approval.created")}</span>
          <span className="value">{formatPaymentDate(payment.created_at)}</span>
        </div>

        {payment.notes && (
          <div className="info-row">
            <span className="label">{t("details.notes")}:</span>
            <span className="notes">{payment.notes}</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <button
          onClick={() => onApprove(payment)}
          disabled={loading}
          className="btn btn-primary btn-full"
        >
          {loading ? t("approval.approving") : `✓ ${t("actions.approve")}`}
        </button>
      </div>
    </div>
  );
};
