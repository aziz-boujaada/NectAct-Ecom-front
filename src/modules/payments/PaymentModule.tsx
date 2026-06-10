import React, { useState } from "react";
import type { Payment } from "../../types";
import { PaymentDashboard } from "../../components/dashboard/PaymentDashboard";
import { PaymentDetailModal } from "../../components/dashboard/PaymentDetailModal";
import { PaymentAllocationsManager } from "../../components/dashboard/PaymentAllocationsManager";
import { CashLogsPage } from "../../components/dashboard/CashLogsPage";
import { PaymentApprovalConfirm } from "../../components/dashboard/PaymentApprovalConfirm";
import { approvePayment } from "../../api/payments";
import { ApiError } from "../../api/auth";

type PaymentModuleProps = {
  onSalesChanged?: () => void | Promise<void>;
};

export const PaymentModule: React.FC<PaymentModuleProps> = ({ onSalesChanged }) => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAllocationsModal, setShowAllocationsModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalPayment, setApprovalPayment] = useState<Payment | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleApproveClick = (payment: Payment) => {
    setApprovalPayment(payment);
    setApprovalError(null);
    setShowApprovalModal(true);
  };

  const handleConfirmApproval = async () => {
    if (!approvalPayment) return;

    try {
      setIsApproving(true);
      setApprovalError(null);

      await approvePayment(approvalPayment.id);

      setSuccessMessage("Payment approved successfully!");
      setShowApprovalModal(false);
      setShowDetailModal(false);
      setRefreshTrigger((prev) => prev + 1);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to approve payment";
      setApprovalError(message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleManageAllocations = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowAllocationsModal(true);
    setShowDetailModal(false);
  };

  const handleViewLogs = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowLogsModal(true);
    setShowDetailModal(false);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPayment(null);
  };

  const handleCloseAllocationsModal = () => {
    setShowAllocationsModal(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAllocationsChanged = async () => {
    setRefreshTrigger((prev) => prev + 1);
    await onSalesChanged?.();
  };

  return (
    <div className="payment-module">
      {successMessage && (
        <div className="module-alert alert alert-success">
          <p>✓ {successMessage}</p>
        </div>
      )}

      {/* Main Dashboard */}
      <PaymentDashboard
        key={refreshTrigger}
        onSelectPayment={handleSelectPayment}
        onApproveClick={handleApproveClick}
        onManageAllocations={handleManageAllocations}
        onViewLogs={handleViewLogs}
      />

      {/* Detail Modal */}
      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          onApprove={handleApproveClick}
          onManageAllocations={handleManageAllocations}
          onViewLogs={handleViewLogs}
          isApproving={isApproving}
        />
      )}

      {/* Allocations Manager */}
      {selectedPayment && (
        <PaymentAllocationsManager
          payment={selectedPayment}
          isOpen={showAllocationsModal}
          onClose={handleCloseAllocationsModal}
          onAllocationsChanged={handleAllocationsChanged}
        />
      )}

      {/* Cash Logs */}
      {selectedPayment && (
        <CashLogsPage
          key={selectedPayment.id}
          isOpen={showLogsModal}
          onClose={() => setShowLogsModal(false)}
          paymentId={selectedPayment.id}
        />
      )}

      {/* Approval Confirmation */}
      {approvalPayment && (
        <PaymentApprovalConfirm
          payment={approvalPayment}
          isOpen={showApprovalModal}
          isApproving={isApproving}
          error={approvalError}
          onConfirm={handleConfirmApproval}
          onCancel={() => {
            setShowApprovalModal(false);
            setApprovalPayment(null);
            setApprovalError(null);
          }}
        />
      )}
    </div>
  );
};

export default PaymentModule;
