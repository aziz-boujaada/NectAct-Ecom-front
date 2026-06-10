import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Payment, PaymentAllocation, PaymentAllocationPayableType } from "../../types";
import {
  listPaymentAllocations,
  createPaymentAllocation,
  updatePaymentAllocation,
  deletePaymentAllocation,
} from "../../api/payments";
import { formatCurrency } from "../../utils/currency";
import {
  calculateRemainingBalance,
  validateAllocationAmount,
  formatPayableType,
  getAllocationPercentage,
  formatAllocationStatus,
  canAllocatePayment,
} from "../../utils/payment";
import { ApiError } from "../../api/auth";

interface PaymentAllocationsManagerProps {
  payment: Payment;
  isOpen: boolean;
  onClose: () => void;
  onAllocationsChanged?: () => void | Promise<void>;
}

export const PaymentAllocationsManager: React.FC<PaymentAllocationsManagerProps> = ({
  payment,
  isOpen,
  onClose,
  onAllocationsChanged,
}) => {
  const { t } = useTranslation("payments");
  const [allocations, setAllocations] = useState<PaymentAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [amountApplied, setAmountApplied] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState("");

  const totalAllocated = allocations.reduce((sum, a) => {
    const amount = typeof a.amount_applied === "string" ? parseFloat(a.amount_applied) : a.amount_applied;
    return sum + amount;
  }, 0);

  const remainingBalance = calculateRemainingBalance(payment.amount, totalAllocated);
  const allocationPercentage = getAllocationPercentage(totalAllocated, payment.amount);

  useEffect(() => {
    if (isOpen) {
      loadAllocations();
    }
  }, [isOpen, payment.id]);

  const loadAllocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listPaymentAllocations(payment.id, 1, 100);

      if (response.allocations?.data) {
        setAllocations(response.allocations.data);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("errors.failedToLoadAllocations");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!amountApplied.trim()) {
      setFormError(t("errors.enterAmount"));
      return;
    }

    const validation = validateAllocationAmount(amountApplied, payment.amount, totalAllocated);
    if (!validation.valid) {
      setFormError(validation.error || t("errors.invalidAmount", { defaultValue: "Invalid amount" }));
      return;
    }

    try {
      setIsSubmitting(true);
      await createPaymentAllocation(payment.id, {
        payable_type: "Sale",
        payable_id: payment.sale_id.toString(),
        amount_applied: amountApplied,
      });

      setSuccessMessage(t("allocations.createdSuccess"));
      setAmountApplied("");
      setShowAddForm(false);
      await loadAllocations();
      await onAllocationsChanged?.();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("errors.failedToCreateAllocation");
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAllocation = async (allocationId: number) => {
    if (!editAmount.trim()) {
      setError(t("errors.enterAmount"));
      return;
    }

    const validation = validateAllocationAmount(editAmount, payment.amount, totalAllocated);
    if (!validation.valid) {
      setError(validation.error || t("errors.invalidAmount", { defaultValue: "Invalid amount" }));
      return;
    }

    try {
      setIsSubmitting(true);
      await updatePaymentAllocation(payment.id, allocationId, {
        amount_applied: editAmount,
      });

      setSuccessMessage(t("allocations.updatedSuccess"));
      setEditingId(null);
      setEditAmount("");
      await loadAllocations();
      await onAllocationsChanged?.();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("errors.failedToUpdateAllocation");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAllocation = async (allocationId: number) => {
    if (!confirm(t("allocations.confirmDelete"))) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deletePaymentAllocation(payment.id, allocationId);

      setSuccessMessage(t("allocations.deletedSuccess"));
      await loadAllocations();
      await onAllocationsChanged?.();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("errors.failedToDeleteAllocation");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const canAddAllocations = canAllocatePayment(payment);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content allocations-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t("allocations.title", { id: payment.id })}</h2>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Summary Section */}
          <div className="allocations-summary">
            <div className="summary-card">
              <div className="summary-item">
                <span className="label">{t("allocations.totalPaymentAmount")}</span>
                <span className="value">{formatCurrency(payment.amount)}</span>
              </div>

              <div className="summary-item">
                <span className="label">{t("allocations.totalAllocated")}</span>
                <span className="value allocated">{formatCurrency(totalAllocated)}</span>
              </div>

              <div className="summary-item">
                <span className="label">{t("allocations.remainingBalance")}</span>
                <span className={`value ${remainingBalance > 0 ? "highlight" : "full"}`}>
                  {formatCurrency(remainingBalance)}
                </span>
              </div>

              <div className="summary-item">
                <span className="label">{t("allocations.allocationStatus")}</span>
                <span className="value">
                  {allocations.length === 0 
                    ? t("details.noAllocations", { defaultValue: "No allocations" }) 
                    : (totalAllocated >= (typeof payment.amount === "string" ? parseFloat(payment.amount) : payment.amount)
                      ? t("details.fullyAllocated", { defaultValue: "Fully allocated" })
                      : t("details.partiallyAllocated", { 
                          defaultValue: `Partially allocated (${formatCurrency(remainingBalance)} remaining)`,
                          remaining: formatCurrency(remainingBalance)
                        }))
                  }
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="allocation-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${allocationPercentage}%` }}></div>
              </div>
              <div className="progress-text">
                {t("allocations.percentageAllocated", { percentage: allocationPercentage.toFixed(1) })}
              </div>
            </div>
          </div>

          {/* Messages */}
          {!canAddAllocations && (
            <div className="alert alert-warning">
              <p>⚠️ {t("allocations.mustBeApproved")}</p>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <p>{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success">
              <p>✓ {successMessage}</p>
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>{t("allocations.loading")}</p>
            </div>
          ) : (
            <>
              {/* Current Allocations */}
              <div className="current-allocations">
                <h3>{t("allocations.currentAllocations")}</h3>

                {allocations.length === 0 ? (
                  <div className="empty-state">
                    <p>{t("allocations.noAllocations")}</p>
                  </div>
                ) : (
                  <div className="allocations-list">
                    {allocations.map((alloc) => (
                      <div key={alloc.id} className="allocation-card">
                        <div className="allocation-info">
                          <div className="allocation-type">
                            {t(`payableTypes.${alloc.payable_type}`, { defaultValue: alloc.payable_type })}
                          </div>
                          <div className="allocation-reference">
                            {t("allocations.reference", { ref: alloc.payable?.reference || `#${alloc.payable_id}` })}
                          </div>
                          <div className="allocation-amount">
                            {t("allocations.amountApplied", { amount: formatCurrency(alloc.amount_applied) })}
                          </div>
                          <div className="allocation-date">
                            {t("allocations.created", { date: alloc.created_at })}
                          </div>
                        </div>

                        <div className="allocation-actions">
                          {editingId === alloc.id ? (
                            <div className="edit-form">
                              <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => setEditAmount(e.target.value)}
                                placeholder={t("allocations.newAmount")}
                                className="input-edit"
                                step="0.01"
                                min="0"
                              />
                              <button
                                onClick={() => handleUpdateAllocation(alloc.id)}
                                disabled={isSubmitting}
                                className="btn btn-sm btn-primary"
                              >
                                {t("actions.save")}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditAmount("");
                                }}
                                className="btn btn-sm btn-secondary"
                              >
                                {t("actions.cancel")}
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(alloc.id);
                                  setEditAmount(alloc.amount_applied.toString());
                                }}
                                className="btn btn-sm btn-secondary"
                              >
                                ✏️ {t("actions.edit")}
                              </button>
                              <button
                                onClick={() => handleDeleteAllocation(alloc.id)}
                                disabled={isSubmitting}
                                className="btn btn-sm btn-danger"
                              >
                                🗑️ {t("actions.delete")}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Allocation */}
              {canAddAllocations && (
                <div className="add-allocation-section">
                  {!showAddForm ? (
                    <button onClick={() => setShowAddForm(true)} className="btn btn-primary btn-block">
                      + {t("actions.addNewAllocation")}
                    </button>
                  ) : (
                    <form onSubmit={handleAddAllocation} className="add-allocation-form">
                      <h3>{t("actions.addNewAllocation")}</h3>

                      {formError && (
                        <div className="alert alert-error">
                          <p>{formError}</p>
                        </div>
                      )}

                      {/* Read-only allocation target info */}
                      <div className="allocation-info-read-only">
                        <div className="info-row">
                          <span className="info-label">{t("allocations.allocatingTo")}</span>
                          <span className="info-value">{t("table.sale")} #{payment.sale_id}</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>{t("allocations.amountToAllocate")}</label>
                        <div className="amount-input-group">
                          <input
                            type="number"
                            value={amountApplied}
                            onChange={(e) => setAmountApplied(e.target.value)}
                            placeholder={t("allocations.enterAmount")}
                            className="form-input"
                            step="0.01"
                            min="0.01"
                            max={remainingBalance.toString()}
                          />
                          <span className="amount-suffix">DH</span>
                        </div>
                        <small className="form-hint">
                          {t("allocations.maxAvailable", { amount: formatCurrency(remainingBalance) })}
                        </small>
                      </div>

                      <div className="form-actions">
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                          {isSubmitting ? t("allocations.creating") : t("actions.createAllocation")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddForm(false);
                            setFormError(null);
                            setAmountApplied("");
                          }}
                          className="btn btn-secondary"
                        >
                          {t("actions.cancel")}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            {t("actions.close")}
          </button>
        </div>
      </div>
    </div>
  );
};
