import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { listPayments } from "../../api/payments";
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
  calculateRemainingBalance,
} from "../../utils/payment";
import { ApiError } from "../../api/auth";

interface PaymentDashboardProps {
  onSelectPayment?: (payment: Payment) => void;
  onApproveClick?: (payment: Payment) => void;
  onManageAllocations?: (payment: Payment) => void;
  onViewLogs?: (payment: Payment) => void;
}

export const PaymentDashboard: React.FC<PaymentDashboardProps> = ({
  onSelectPayment,
  onApproveClick,
  onManageAllocations,
  onViewLogs,
}) => {
  const {t} = useTranslation("payments");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(15);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  useEffect(() => {
    loadPayments();
  }, [currentPage]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listPayments(currentPage, perPage);

      if (response.payments) {
        let filtered = response.payments.data;

        // Apply filters
        if (searchTerm) {
          filtered = filtered.filter((p) =>
            p.id.toString().includes(searchTerm) ||
            p.sale_id.toString().includes(searchTerm) ||
            p.client_id.toString().includes(searchTerm)
          );
        }

        if (filterMethod) {
          filtered = filtered.filter((p) => p.method === filterMethod);
        }

        if (filterStatus) {
          filtered = filtered.filter((p) => p.status === filterStatus);
        }

        if (filterDateFrom) {
          filtered = filtered.filter((p) => new Date(p.created_at || "") >= new Date(filterDateFrom));
        }

        if (filterDateTo) {
          filtered = filtered.filter((p) => new Date(p.created_at || "") <= new Date(filterDateTo));
        }

        setPayments(filtered);
        setTotalPages(response.payments.last_page);
        setTotalItems(response.payments.total);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("errors.failedToLoad", { defaultValue: "Failed to load payments" });
      setError(message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    loadPayments();
  };

  const applyFilters = () => {
    setCurrentPage(1);
    loadPayments();
  };

  const calculateTotalAllocated = (payment: Payment): number => {
    if (!payment.allocations || payment.allocations.length === 0) return 0;
    return payment.allocations.reduce((sum, alloc) => {
      return sum + (typeof alloc.amount_applied === "string" 
        ? parseFloat(alloc.amount_applied) 
        : alloc.amount_applied);
    }, 0);
  };

  const getAllocationPercentage = (payment: Payment): number => {
    const totalAllocated = calculateTotalAllocated(payment);
    const totalAmount = typeof payment.amount === "string" 
      ? parseFloat(payment.amount) 
      : payment.amount;
    return totalAmount > 0 ? Math.round((totalAllocated / totalAmount) * 100) : 0;
  };

  return (
    <div className="payment-dashboard">
      <div className="payment-header">
        <h1>{t("management")}</h1>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-label">{t("totalPayments")}</span>
            <span className="stat-value">{totalItems}</span>
          </div>
          <div className="stat">
            <span className="stat-label">{t("page")}</span>
            <span className="stat-value">
              {currentPage} {t("of")} {totalPages}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="payment-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>{t("table.method")}</label>
            <select
              value={filterMethod}
              onChange={(e) => {
                setFilterMethod(e.target.value);
                handleFilterChange();
              }}
              className="filter-select"
            >
              <option value="">{t("filters.allMethods")}</option>
              <option value="cash">{t("methods.cash")}</option>
              <option value="stripe">{t("methods.stripe")}</option>
            </select>
          </div>

          <div className="filter-group">
            <label>{t("table.status")}</label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                handleFilterChange();
              }}
              className="filter-select"
            >
              <option value="">{t("filters.allStatus")}</option>
              <option value="pending">{t("statuses.pending")}</option>
              <option value="approved">{t("statuses.approved")}</option>
              <option value="rejected">{t("statuses.rejected")}</option>
            </select>
          </div>

          <div className="filter-group">
            <label>{t("filters.fromDate")}</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>{t("filters.toDate")}</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="filter-input"
            />
          </div>

          <button onClick={applyFilters} className="btn btn-primary">
            {t("filters.apply")}
          </button>
          <button
            onClick={() => {
              setFilterMethod("");
              setFilterStatus("");
              setFilterDateFrom("");
              setFilterDateTo("");
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className="btn btn-secondary"
          >
            {t("filters.clear")}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t("loading")}</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="empty-state">
          <p>{t("noPayments")}</p>
          <p className="text-muted">{t("emptyStateHint")}</p>
        </div>
      ) : (
        <>
          <div className="payment-table-wrapper">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>{t("table.id")}</th>
                  <th>{t("table.sale")}</th>
                  <th>{t("table.client")}</th>
                  <th>{t("table.amount")}</th>
                  <th>{t("table.method")}</th>
                  <th>{t("table.status")}</th>
                  <th>{t("table.allocated")}</th>
                  <th>{t("table.approvedBy")}</th>
                  <th>{t("table.created")}</th>
                  <th>{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="payment-row">
                    <td className="cell-id">#{payment.id}</td>
                    <td className="cell-sale">{t("table.sale")} #{payment.sale_id}</td>
                    <td className="cell-client">{payment.client?.name || `${t("table.client")} #${payment.client_id}`}</td>
                    <td className="cell-amount">{formatCurrency(payment.amount)}</td>
                    <td className="cell-method">
                      <span className={`badge method-badge ${getPaymentMethodClass(payment.method)}`}>
                        {getPaymentMethodIcon(payment.method)} {t(`methods.${payment.method}`)}
                      </span>
                    </td>
                    <td className="cell-status">
                      <span className={`badge status-badge ${getPaymentStatusClass(payment.status)}`}>
                        {getPaymentStatusIcon(payment.status)} {t(`statuses.${payment.status}`)}
                      </span>
                    </td>
                    <td className="cell-allocated">
                      {payment.allocations && payment.allocations.length > 0 ? (
                        <div className="allocation-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${getAllocationPercentage(payment)}%` }}
                            />
                          </div>
                          <span className="progress-text">{getAllocationPercentage(payment)}%</span>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="cell-approved">
                      {payment.approver?.name || (payment.approved_by ? `${t("common:user", { defaultValue: "User" })} #${payment.approved_by}` : "-")}
                    </td>
                    <td className="cell-date">{formatPaymentDate(payment.created_at)}</td>
                    <td className="cell-actions">
                      <div className="action-buttons">
                        <button
                          onClick={() => onSelectPayment?.(payment)}
                          className="btn btn-sm btn-view"
                          title={t("actions.viewDetails")}
                        >
                          👁️ {t("actions.view")}
                        </button>
                        {payment.status === "pending" && (
                          <button
                            onClick={() => onApproveClick?.(payment)}
                            className="btn btn-sm btn-approve"
                            title={t("actions.approvePayment")}
                          >
                            ✓ {t("actions.approve")}
                          </button>
                        )}
                        <button
                          onClick={() => onManageAllocations?.(payment)}
                          className="btn btn-sm btn-allocate"
                          title={t("actions.manageAllocations")}
                        >
                          💰 {t("actions.allocate")}
                        </button>
                        <button
                          onClick={() => onViewLogs?.(payment)}
                          className="btn btn-sm btn-logs"
                          title={t("actions.viewActivityLogs")}
                        >
                          📋 {t("actions.logs")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              ← {t("pagination.previous")}
            </button>

            <div className="pagination-info">
              {t("page")} {currentPage} {t("of")} {totalPages} ({totalItems} {t("totalItems")})
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary"
            >
              {t("pagination.next")} →
            </button>
          </div>
        </>
      )}
    </div>
  );
};
