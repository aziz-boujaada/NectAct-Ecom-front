import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Payment } from "../../types";
import { formatCurrency } from "../../utils/currency";
import {
  formatPaymentStatus,
  getPaymentStatusClass,
  getPaymentStatusIcon,
  formatPaymentMethod,
  getPaymentMethodClass,
  getPaymentMethodIcon,
  formatPaymentDate,
  canApprovePayment,
  formatPayableType,
} from "../../utils/payment";

interface PaymentDetailModalProps {
  payment: Payment;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (payment: Payment) => void;
  onManageAllocations?: (payment: Payment) => void;
  onViewLogs?: (payment: Payment) => void;
  isApproving?: boolean;
}

export const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  payment,
  isOpen,
  onClose,
  onApprove,
  onManageAllocations,
  onViewLogs,
  isApproving = false,
}) => {
  const { t } = useTranslation("payments");
  const [notes, setNotes] = useState(payment.notes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t("details.title")}</h2>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Status Badge */}
          <div className="detail-section status-section">
            <span className={`badge status-badge large ${getPaymentStatusClass(payment.status)}`}>
              {getPaymentStatusIcon(payment.status)} {t(`statuses.${payment.status}`)}
            </span>
          </div>

          {/* Main Amount */}
          <div className="detail-section amount-section">
            <div className="amount-display">
              <div className="amount-label">{t("details.totalAmount")}</div>
              <div className="amount-value">{formatCurrency(payment.amount)}</div>
            </div>
          </div>

          {/* Payment Information Grid */}
          <div className="detail-grid">
            <div className="detail-item">
              <label>{t("details.paymentId")}</label>
              <span className="detail-value">#{payment.id}</span>
            </div>

            <div className="detail-item">
              <label>{t("details.saleId")}</label>
              <span className="detail-value">#{payment.sale_id}</span>
            </div>

            <div className="detail-item">
              <label>{t("details.client")}</label>
              <span className="detail-value">{payment.client?.name || `${t("details.client")} #${payment.client_id}`}</span>
            </div>

            <div className="detail-item">
              <label>{t("details.paymentMethod")}</label>
              <span className={`detail-value ${getPaymentMethodClass(payment.method)}`}>
                {getPaymentMethodIcon(payment.method)} {t(`methods.${payment.method}`)}
              </span>
            </div>

            <div className="detail-item">
              <label>{t("details.createdDate")}</label>
              <span className="detail-value">{formatPaymentDate(payment.created_at)}</span>
            </div>

            {payment.approved_at && (
              <div className="detail-item">
                <label>{t("details.approvedDate")}</label>
                <span className="detail-value">{formatPaymentDate(payment.approved_at)}</span>
              </div>
            )}

            {payment.approved_by && (
              <div className="detail-item">
                <label>{t("details.approvedBy")}</label>
                <span className="detail-value">{payment.approver?.name || `${t("common:user", { defaultValue: "User" })} #${payment.approved_by}`}</span>
              </div>
            )}

            {payment.created_by && (
              <div className="detail-item">
                <label>{t("details.createdBy")}</label>
                <span className="detail-value">{payment.creator?.name || `${t("common:user", { defaultValue: "User" })} #${payment.created_by}`}</span>
              </div>
            )}
          </div>

          {/* Allocations Summary */}
          {payment.allocations && payment.allocations.length > 0 && (
            <div className="detail-section allocations-summary">
              <h3>{t("details.allocations")} ({payment.allocations.length})</h3>
              <div className="allocation-list">
                {payment.allocations.map((alloc) => (
                  <div key={alloc.id} className="allocation-item">
                    <div className="allocation-type">{t(`payableTypes.${alloc.payable_type}`, { defaultValue: alloc.payable_type })}</div>
                    <div className="allocation-amount">{formatCurrency(alloc.amount_applied)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="detail-section notes-section">
            <h3>{t("details.notes")}</h3>
            {isEditingNotes ? (
              <div className="notes-edit">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("details.addNotes")}
                  className="notes-input"
                  rows={3}
                />
                <div className="notes-actions">
                  <button onClick={() => setIsEditingNotes(false)} className="btn btn-primary">
                    {t("actions.save")}
                  </button>
                  <button
                    onClick={() => {
                      setNotes(payment.notes || "");
                      setIsEditingNotes(false);
                    }}
                    className="btn btn-secondary"
                  >
                    {t("actions.cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="notes-view">
                <p className={payment.notes ? "" : "text-muted"}>
                  {payment.notes || t("details.noNotes")}
                </p>
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="btn btn-sm btn-secondary"
                >
                  ✏️ {t("details.editNotes")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            {t("actions.close")}
          </button>

          {canApprovePayment(payment) && (
            <button
              onClick={() => onApprove?.(payment)}
              disabled={isApproving}
              className="btn btn-primary btn-approve"
            >
              {isApproving ? t("details.approving") : `✓ ${t("actions.approvePayment")}`}
            </button>
          )}

          <button
            onClick={() => {
              onManageAllocations?.(payment);
              onClose();
            }}
            className="btn btn-primary"
          >
            💰 {t("actions.manageAllocations")}
          </button>

          <button
            onClick={() => {
              onViewLogs?.(payment);
              onClose();
            }}
            className="btn btn-secondary"
          >
            📋 {t("actions.viewActivity")}
          </button>
        </div>
      </div>
    </div>
  );
};
