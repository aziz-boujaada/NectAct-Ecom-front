import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CashLog, CashLogAction, CashLogStatistics } from "../../types";
import { listCashLogs, getCashLogsStatistics, getPaymentLogs } from "../../api/payments";
import { formatCurrency } from "../../utils/currency";
import {
  formatCashLogAction,
  getCashLogActionClass,
  getCashLogActionIcon,
  formatPaymentDate,
  formatPaymentStatus,
  getPaymentStatusClass,
} from "../../utils/payment";
import { ApiError } from "../../api/auth";

interface CashLogsPageProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId?: number;
}

type LogValueMap = Record<string, unknown>;

const paymentStatusValues = ["pending", "approved", "rejected"];

export const CashLogsPage: React.FC<CashLogsPageProps> = ({
  isOpen,
  onClose,
  paymentId,
}) => {
  const { t } = useTranslation("payments");
  const [logs, setLogs] = useState<CashLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [perPage] = useState(20);

  // Filter states
  const [filterPaymentId, setFilterPaymentId] = useState(paymentId?.toString() || "");
  const [filterAction, setFilterAction] = useState<string>("");
  const [filterUserId, setFilterUserId] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  // Statistics states
  const [stats, setStats] = useState<CashLogStatistics | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [selectedLogDetail, setSelectedLogDetail] = useState<CashLog | null>(null);

  const formatFieldName = useCallback((key: string) => {
    return t(`logs.fields.${key}`, { 
      defaultValue: key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) 
    });
  }, [t]);

  const formatLogValue = useCallback((key: string, value: unknown): string => {
    if (value === null || value === undefined || value === "") return t("logs.values.notSet");

    if (key === "status" && typeof value === "string" && paymentStatusValues.includes(value)) {
      return t(`statuses.${value}`, { defaultValue: value });
    }

    if ((key.includes("amount") || key.includes("total") || key.includes("price")) && (typeof value === "number" || typeof value === "string")) {
      const numericValue = Number(value);
      if (!Number.isNaN(numericValue)) return formatCurrency(numericValue);
    }

    if ((key.endsWith("_at") || key.includes("date")) && typeof value === "string") {
      return formatPaymentDate(value);
    }

    if (typeof value === "boolean") return value ? t("logs.values.yes") : t("logs.values.no");

    if (Array.isArray(value)) {
      const count = value.length;
      return `${count} ${count === 1 ? t("logs.values.item") : t("logs.values.items")}`;
    }

    if (typeof value === "object") return t("logs.values.updatedDetails");

    return String(value).replace(/_/g, " ");
  }, [t]);

  const getChangedFields = useCallback((oldValue?: LogValueMap | null, newValue?: LogValueMap | null) => {
    const keys = Array.from(new Set([...Object.keys(oldValue || {}), ...Object.keys(newValue || {})]));

    return keys
      .filter((key) => JSON.stringify(oldValue?.[key] ?? null) !== JSON.stringify(newValue?.[key] ?? null))
      .map((key) => ({
        key,
        label: formatFieldName(key),
        before: formatLogValue(key, oldValue?.[key]),
        after: formatLogValue(key, newValue?.[key]),
        rawAfter: newValue?.[key],
      }));
  }, [formatFieldName, formatLogValue]);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = paymentId
        ? await getPaymentLogs(paymentId, currentPage, perPage)
        : await listCashLogs(currentPage, perPage, {
            payment_id: filterPaymentId ? parseInt(filterPaymentId) : undefined,
            action: filterAction || undefined,
            user_id: filterUserId ? parseInt(filterUserId) : undefined,
            from_date: filterFromDate || undefined,
            to_date: filterToDate || undefined,
          });

      if (response.logs?.data) {
        setLogs(response.logs.data);
        setTotalPages(response.logs.last_page);
        setTotalLogs(response.logs.total);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("errors.failedToLoadLogs", { defaultValue: "Failed to load logs" });
      setError(message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterAction, filterFromDate, filterPaymentId, filterToDate, filterUserId, paymentId, perPage, t]);

  const loadStatistics = useCallback(async () => {
    try {
      const response = await getCashLogsStatistics(filterFromDate || undefined, filterToDate || undefined);
      setStats(response.statistics);
    } catch (err) {
      console.error("Failed to load statistics", err);
    }
  }, [filterFromDate, filterToDate]);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadLogs();
      if (!paymentId) {
        loadStatistics();
      }
    }
  }, [isOpen, loadLogs, loadStatistics, paymentId]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadLogs();
    if (!paymentId) {
      loadStatistics();
    }
  };

  const handleClearFilters = () => {
    setFilterPaymentId(paymentId?.toString() || "");
    setFilterAction("");
    setFilterUserId("");
    setFilterFromDate("");
    setFilterToDate("");
    setCurrentPage(1);
    loadLogs();
    if (!paymentId) {
      loadStatistics();
    }
  };

  if (!isOpen) return null;

  const actionOptions: CashLogAction[] = ["created", "approved", "updated", "deleted", "status_changed"];
  const selectedLogChanges = selectedLogDetail
    ? getChangedFields(selectedLogDetail.old_value, selectedLogDetail.new_value)
    : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cash-logs-modal large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 {t("logs.title")} {paymentId && `- ${t("table.payment")} #${paymentId}`}</h2>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Statistics */}
          {!paymentId && (
            <div className="cash-logs-header">
              <button
                onClick={() => {
                  setShowStats(!showStats);
                  if (!showStats) loadStatistics();
                }}
                className="btn btn-secondary"
              >
                {showStats ? t("logs.hide") : t("logs.show")} {t("logs.statistics")}
              </button>
            </div>
          )}

          {showStats && stats && (
            <div className="statistics-section">
              <div className="stat-cards">
                <div className="stat-card">
                  <div className="stat-label">{t("logs.totalLogs")}</div>
                  <div className="stat-value">{stats.total_logs}</div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">{t("logs.byAction")}</div>
                  <div className="action-stats">
                    {stats.by_action.map((item) => (
                      <div key={item.action} className="action-stat-item">
                        <span className="action-name">{t(`logs.actions.${item.action}`, { defaultValue: item.action })}</span>
                        <span className="action-count">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {stats.by_user && (
                  <div className="stat-card">
                    <div className="stat-label">{t("logs.topUsers")}</div>
                    <div className="user-stats">
                      {stats.by_user.slice(0, 3).map((item) => (
                        <div key={item.user_id} className="user-stat-item">
                          <span className="user-name">{item.user?.name || `${t("common:user", { defaultValue: "User" })} #${item.user_id}`}</span>
                          <span className="user-count">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="cash-logs-filters">
            <h3>{t("filters.title", { defaultValue: "Filters", ns: "common" })}</h3>

            <div className="filter-row">
              {!paymentId && (
                <div className="filter-group">
                  <label>{t("details.paymentId")}</label>
                  <input
                    type="number"
                    value={filterPaymentId}
                    onChange={(e) => setFilterPaymentId(e.target.value)}
                    placeholder={t("logs.enterPaymentId")}
                    className="filter-input"
                  />
                </div>
              )}

              <div className="filter-group">
                <label>{t("table.method")}</label>
                <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="filter-select">
                  <option value="">{t("logs.allActions")}</option>
                  {actionOptions.map((action) => (
                    <option key={action} value={action}>
                      {t(`logs.actions.${action}`, { defaultValue: action })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>{t("common:user", { defaultValue: "User ID" })}</label>
                <input
                  type="number"
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                  placeholder={t("logs.enterUserId")}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>{t("filters.fromDate")}</label>
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>{t("filters.toDate")}</label>
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className="filter-input"
                />
              </div>

              <div className="filter-actions">
                <button onClick={handleApplyFilters} className="btn btn-primary">
                  {t("filters.apply")}
                </button>
                <button onClick={handleClearFilters} className="btn btn-secondary">
                  {t("filters.clear")}
                </button>
              </div>
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
              <p>{t("actions.loading", { defaultValue: "Loading logs..." })}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <p>{t("logs.emptyState")}</p>
            </div>
          ) : (
            <>
              {/* Logs Table */}
              <div className="cash-logs-table-wrapper">
                <table className="cash-logs-table">
                  <thead>
                    <tr>
                      <th>{t("logs.table.dateTime")}</th>
                      <th>{t("table.method")}</th>
                      <th>{t("logs.table.user")}</th>
                      <th>{t("logs.table.payment")}</th>
                      <th>{t("logs.table.description")}</th>
                      <th>{t("logs.table.ipAddress")}</th>
                      <th>{t("logs.table.details")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="log-row">
                        <td className="cell-date">{formatPaymentDate(log.created_at)}</td>
                        <td className="cell-action">
                          <span className={`badge action-badge ${getCashLogActionClass(log.action)}`}>
                            {getCashLogActionIcon(log.action)} {t(`logs.actions.${log.action}`, { defaultValue: log.action })}
                          </span>
                        </td>
                        <td className="cell-user">{log.user?.name || `${t("common:user", { defaultValue: "User" })} #${log.user_id}`}</td>
                        <td className="cell-payment">{t("table.payment")} #{log.payment_id}</td>
                        <td className="cell-description">{log.description}</td>
                        <td className="cell-ip">{log.ip_address}</td>
                        <td className="cell-actions">
                          <button
                            onClick={() => setSelectedLogDetail(log)}
                            className="btn btn-sm btn-secondary"
                          >
                            {t("actions.view")}
                          </button>
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
                  {t("page")} {currentPage} {t("of")} {totalPages} ({totalLogs} {t("logs.totalLogs")})
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

        {/* Log Detail Modal */}
        {selectedLogDetail && (
          <div className="modal-overlay" onClick={() => setSelectedLogDetail(null)}>
            <div className="modal-content log-detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <p className="modal-eyebrow">{t("logs.details.title")}</p>
                  <h3>{t(`logs.actions.${selectedLogDetail.action}`, { defaultValue: selectedLogDetail.action })} {t("table.payment").toLowerCase()} #{selectedLogDetail.payment_id}</h3>
                </div>
                <button onClick={() => setSelectedLogDetail(null)} className="modal-close">
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="log-detail-summary">
                  <div>
                    <span className={`badge action-badge ${getCashLogActionClass(selectedLogDetail.action)}`}>
                      {getCashLogActionIcon(selectedLogDetail.action)} {t(`logs.actions.${selectedLogDetail.action}`, { defaultValue: selectedLogDetail.action })}
                    </span>
                  </div>
                  <p>{selectedLogDetail.description || t("logs.details.defaultDescription")}</p>
                  <span>{formatPaymentDate(selectedLogDetail.created_at)}</span>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <label>{t("logs.details.activity")}</label>
                    <span>#{selectedLogDetail.id}</span>
                  </div>

                  <div className="detail-item">
                    <label>{t("table.payment")}</label>
                    <span>#{selectedLogDetail.payment_id}</span>
                  </div>

                  <div className="detail-item">
                    <label>{t("common:user")}</label>
                    <span>{selectedLogDetail.user?.name || `${t("common:user")} #${selectedLogDetail.user_id}`}</span>
                  </div>

                  <div className="detail-item">
                    <label>{t("logs.details.userEmail")}</label>
                    <span>{selectedLogDetail.user?.email || "N/A"}</span>
                  </div>

                  <div className="detail-item">
                    <label>{t("logs.details.time")}</label>
                    <span>{formatPaymentDate(selectedLogDetail.created_at)}</span>
                  </div>

                  <div className="detail-item">
                    <label>{t("logs.table.ipAddress")}</label>
                    <span>{selectedLogDetail.ip_address}</span>
                  </div>

                  {(selectedLogDetail.old_value || selectedLogDetail.new_value) && (
                    <div className="detail-item full-width">
                      <label>{t("logs.details.whatChanged")}</label>
                      <div className="friendly-changes">
                        {selectedLogChanges.length > 0 ? (
                          selectedLogChanges.map((change) => {
                            const isStatusChange = change.key === "status" && typeof change.rawAfter === "string";

                            return (
                              <div className="friendly-change-row" key={change.key}>
                                <div className="friendly-change-field">{change.label}</div>
                                <div className="friendly-change-values">
                                  <span>{change.before}</span>
                                  <span className="change-arrow">→</span>
                                  {isStatusChange ? (
                                    <span className={`badge status-badge ${getPaymentStatusClass(change.rawAfter as "pending" | "approved" | "rejected")}`}>
                                      {change.after}
                                    </span>
                                  ) : (
                                    <strong>{change.after}</strong>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="friendly-change-empty">{t("logs.details.noChanges")}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedLogDetail.payment && (
                    <div className="detail-item full-width">
                      <label>{t("logs.details.relatedPayment")}</label>
                      <div className="related-payment">
                        <p>{t("table.amount")}: {formatCurrency(selectedLogDetail.payment.amount)}</p>
                        <p>{t("table.status")}: {t(`statuses.${selectedLogDetail.payment.status}`, { defaultValue: selectedLogDetail.payment.status })}</p>
                        <p>{t("table.sale")}: #{selectedLogDetail.payment.sale_id}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={() => setSelectedLogDetail(null)} className="btn btn-secondary">
                  {t("actions.close")}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            {t("actions.close")}
          </button>
        </div>
      </div>
    </div>
  );
};
