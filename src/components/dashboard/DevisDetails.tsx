import {
  Download,
  Send,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Trash2,
  X,
  AlertTriangle,
  PlusCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Devis } from "../../types";
import { formatCurrency } from "../../utils/currency";

type DevisDetailsProps = {
  devis: Devis;
  loading: boolean;
  onClose: () => void;
  onEdit: (devis: Devis) => void;
  onDelete: (devis: Devis) => void;
  onSend: (devis: Devis) => void;
  onAccept: (devis: Devis) => void;
  onReject: (devis: Devis) => void;
  onConvert: (devis: Devis) => void;
  onExportPdf: (devis: Devis) => void;
  onCreateNew?: (devis: Devis) => void; // ← new optional prop
};

export function DevisDetails({
  devis,
  loading,
  onClose,
  onEdit,
  onDelete,
  onSend,
  onAccept,
  onReject,
  onConvert,
  onExportPdf,
  onCreateNew,
}: DevisDetailsProps) {
  const { t, i18n } = useTranslation("devis");
  const items = devis.items ?? [];
  const isExpired = devis.status === "expired";

  function formatDate(date?: string | null) {
    if (!date) return t("not_set");
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return t("not_set");
    return parsed.toLocaleString(
      i18n.language === "ar"
        ? "ar-EG"
        : i18n.language === "fr"
          ? "fr-FR"
          : "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  }

  function formatPercent(value?: string | number | null) {
    if (value === null || value === undefined || value === "")
      return t("not_set");
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return t("not_set");
    return `${parsed.toLocaleString(
      i18n.language === "ar"
        ? "ar-EG"
        : i18n.language === "fr"
          ? "fr-FR"
          : "en-GB",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      },
    )}%`;
  }

  type TimelineStep = {
    key: "created" | "sent" | "accepted-converted" | "rejected" | "expired";
    label: string;
    date?: string | null;
    note?: string | null;
    state: "done" | "current" | "pending";
  };

  function buildTimelineSteps(devis: Devis): TimelineStep[] {
    const timeline = devis.timeline ?? [];
    const saleCreatedAt = devis.sale?.created_at ?? null;
    const devisRecord = devis as Devis & Record<string, unknown>;

    const readTimestamp = (...keys: string[]) => {
      for (const key of keys) {
        const value = devisRecord[key];
        if (typeof value === "string" && value.trim()) return value;
      }
      return null;
    };

    const findStep = (statusKey: TimelineStep["key"]) => {
      const mapping: Record<TimelineStep["key"], string[]> = {
        created: ["draft", "created"],
        sent: ["sent", "emailed", "mail_sent", "sent_to_client", "emailed_to_client"],
        "accepted-converted": ["accepted", "converted", "approved"],
        rejected: ["rejected", "declined"],
        expired: ["expired"],
      };

      const candidates = mapping[statusKey] ?? [statusKey];

      const entryMatches = (
        entry: Devis["timeline"] extends (infer U)[] ? U : any,
      ) => {
        const fieldsToCheck = [
          entry?.status,
          entry?.type,
          entry?.action,
          entry?.event,
        ]
          .filter(Boolean)
          .map(String);
        return fieldsToCheck.some((f) => candidates.includes(f));
      };

      return timeline.find((entry) => entryMatches(entry));
    };

    // ─── Determine current stage ─────────────────────────────────────────────
    const currentStage: TimelineStep["key"] =
      devis.status === "expired"
        ? "expired"
        : devis.status === "rejected"
          ? "rejected"
          : devis.status === "accepted" || devis.sale
            ? "accepted-converted"
            : devis.status === "sent"
              ? "sent"
              : "created";

    // ─── Build the order array for each terminal state ────────────────────────
    const order: TimelineStep["key"][] =
      devis.status === "rejected"
        ? ["created", "sent", "rejected"]
        : devis.status === "expired"
          ? ["created", "sent", "expired"]           // ← was missing before
          : ["created", "sent", "accepted-converted"];

    const currentIndex = order.indexOf(currentStage);

    return order.map((key, index) => {
      const timelineEntry = findStep(key);
      const isFinalApproval = key === "accepted-converted";

      const entryDate =
        timelineEntry &&
        (() => {
          const candidates = [
            "created_at", "createdAt", "date", "timestamp", "time",
            "sent_at", "sentAt", "accepted_at", "acceptedAt",
            "rejected_at", "rejectedAt",
          ];
          for (const k of candidates) {
            const v = (timelineEntry as any)[k];
            if (v) return v as string;
          }
          return null;
        })();

      const rootDate =
        key === "sent"             ? readTimestamp("sent_at", "sentAt")
        : key === "accepted-converted" ? readTimestamp("accepted_at", "acceptedAt")
        : key === "rejected"       ? readTimestamp("rejected_at", "rejectedAt")
        : key === "expired"        ? readTimestamp("expired_at", "expiredAt")
        : key === "created"        ? readTimestamp("created_at", "createdAt")
        : null;

      const stepLabel: Record<TimelineStep["key"], string> = {
        created:             t("step_created"),
        sent:                t("step_sent"),
        "accepted-converted": t("step_accepted"),
        rejected:            t("step_rejected"),
        expired:             t("step_expired"),
      };

      return {
        key,
        label: stepLabel[key],
        date: isFinalApproval
          ? (saleCreatedAt ?? entryDate ?? rootDate ?? null)
          : (entryDate ?? rootDate ?? (key === "created" ? (devis.created_at ?? null) : null)),
        note: isFinalApproval
          ? (timelineEntry?.note ?? t("approved_converted"))
          // Expired step always gets a hint note
          : key === "expired"
            ? (timelineEntry?.note ?? t("expired_note", { defaultValue: "This quotation has expired." }))
            : (timelineEntry?.note ?? null),
        state:
          index < currentIndex ? "done"
          : index === currentIndex ? "current"
          : "pending",
      };
    });
  }

  const timelineSteps = buildTimelineSteps(devis);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content sale-details-modal"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="modal-header">
          <div>
            <h2>{t("devis_details", { reference: devis.reference })}</h2>
            <p className="text-muted">{t("devis_desc")}</p>
          </div>
          <button
            aria-label={t("close_details")}
            className="secondary-action"
            onClick={onClose}
            type="button"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">

          {/* ── Expired banner ───────────────────────────────────────────────── */}
          {isExpired && (
            <div className="devis-expired-banner" role="alert">
              <span className="devis-expired-banner__icon">
                <AlertTriangle size={20} aria-hidden="true" />
              </span>
              <div className="devis-expired-banner__body">
                <strong>{t("expired_note", { defaultValue: "This quotation has expired" })}</strong>
                <p>
                  {t("expired_banner_desc", {
                    defaultValue:
                      "The validity period for this quotation has passed. You can duplicate it to send a fresh one to the client.",
                  })}
                </p>
              </div>
              {onCreateNew && (
                <button
                  className="primary-action devis-expired-banner__cta"
                  disabled={loading}
                  onClick={() => onCreateNew(devis)}
                  type="button"
                >
                  <PlusCircle size={16} aria-hidden="true" />
                  {t("create_new_devis", { defaultValue: "New quotation" })}
                </button>
              )}
            </div>
          )}

          {/* ── Quotation info ── */}
          <section className="detail-section">
            <h3>{t("quotation_info")}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">{t("client")}</span>
                <span className="value">
                  {devis.client?.name ?? `${t("client")} ${devis.client_id}`}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">{t("status")}</span>
                <span className={`status-pill ${devis.status}`}>
                  {t(`status_labels.${devis.status}`, { defaultValue: devis.status })}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">{t("expires_at")}</span>
                <span className="value">{formatDate(devis.expires_at)}</span>
              </div>
              <div className="detail-item">
                <span className="label">{t("created")}</span>
                <span className="value">{formatDate(devis.created_at)}</span>
              </div>
              <div className="detail-item">
                <span className="label">{t("total")}</span>
                <span className="value">{formatCurrency(devis.total)}</span>
              </div>
              <div className="detail-item">
                <span className="label">{t("subtotal")}</span>
                <span className="value">{formatCurrency(devis.subtotal)}</span>
              </div>
              <div className="detail-item">
                <span className="label">{t("discount")}</span>
                <span className="value">{formatCurrency(devis.discount)}</span>
              </div>
              <div className="detail-item">
                <span className="label">{t("tax")}</span>
                <span className="value">{formatPercent(devis.tax)}</span>
              </div>
              <div className="detail-item">
                <span className="label">{t("created_by")}</span>
                <span className="value">
                  {devis.created_by?.name ?? t("system")}
                </span>
              </div>
            </div>
          </section>

          {/* ── Notes ── */}
          {devis.notes && (
            <section className="detail-section">
              <h3>{t("notes")}</h3>
              <div className="detail-item">
                <span className="value">{devis.notes}</span>
              </div>
            </section>
          )}

          {/* ── Timeline ── */}
          <section className="detail-section">
            <h3>{t("workflow_timeline")}</h3>
            <div className="devis-timeline">
              {timelineSteps.map((step, index) => (
                <div
                  className={`devis-timeline-step ${step.state}${step.key === "expired" ? " expired" : ""}`}
                  key={step.key}
                >
                  <div className="devis-timeline-marker" aria-hidden="true">
                    <span className="devis-timeline-dot" />
                  </div>
                  <div className="devis-timeline-card">
                    <div className="devis-timeline-head">
                      <strong>{step.label}</strong>
                      <span className={`status-pill ${step.key === "expired" ? "expired" : step.state}`}>
                        {step.key === "expired"
                          ? t("status_labels.expired", { defaultValue: "Expired" })
                          : t(`timeline.${step.state}`, { defaultValue: step.state })}
                      </span>
                    </div>
                    <p>{step.note ?? t("no_note")}</p>
                    <small>
                      {step.date ? formatDate(step.date) : t("not_set")}
                    </small>
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <span className="devis-timeline-connector" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── Items ── */}
          <section className="detail-section">
            <div className="section-heading" style={{ margin: 0 }}>
              <div>
                <h3>{t("quotation_items")}</h3>
              </div>
              <span>
                {items.length} {t("items")}
              </span>
            </div>
            {items.length === 0 ? (
              <p className="text-muted">{t("no_items_in_devis")}</p>
            ) : (
              <div className="detail-table-wrap invoice-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t("product")}</th>
                      <th>{t("reference")}</th>
                      <th>{t("price")}</th>
                      <th>{t("quantity")}</th>
                      <th>{t("total")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>
                            {item.product?.name ?? `${t("product")} ${item.product_id}`}
                          </strong>
                        </td>
                        <td>{item.product?.reference ?? "—"}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{item.quantity}</td>
                        <td>
                          {formatCurrency(
                            item.total ?? Number(item.price) * Number(item.quantity),
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── Summary ── */}
          <section className="detail-section">
            <h3>{t("summary")}</h3>
            <div className="invoice-total-box" style={{ marginLeft: "auto" }}>
              <div className="invoice-total-row">
                <span>{t("subtotal")}</span>
                <strong>{formatCurrency(devis.subtotal)}</strong>
              </div>
              <div className="invoice-total-row">
                <span>{t("discount")}</span>
                <strong>{formatCurrency(devis.discount)}</strong>
              </div>
              <div className="invoice-total-row">
                <span>{t("tax")}</span>
                <strong>{formatPercent(devis.tax)}</strong>
              </div>
              <div className="invoice-total-row">
                <span>{t("total")}</span>
                <strong>{formatCurrency(devis.total)}</strong>
              </div>
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="modal-footer">
          <button
            className="secondary-action"
            disabled={loading}
            onClick={() => onExportPdf(devis)}
            type="button"
          >
            <Download size={17} aria-hidden="true" />
            {t("pdf")}
          </button>

          {!["accepted", "rejected", "expired"].includes(devis.status) && (
            <>
              <button
                className="secondary-action"
                disabled={loading}
                onClick={() => onSend(devis)}
                type="button"
              >
                <Send size={17} aria-hidden="true" />
                {t("send")}
              </button>
              <button
                className="secondary-action"
                disabled={loading}
                onClick={() => onAccept(devis)}
                type="button"
              >
                <CheckCircle2 size={17} aria-hidden="true" />
                {t("accept")}
              </button>
              <button
                className="secondary-action"
                disabled={loading}
                onClick={() => onReject(devis)}
                type="button"
              >
                <XCircle size={17} aria-hidden="true" />
                {t("reject")}
              </button>
              <button
                className="secondary-action"
                disabled={loading}
                onClick={() => onConvert(devis)}
                type="button"
              >
                <ArrowRightLeft size={17} aria-hidden="true" />
                {t("convert")}
              </button>
              <button
                className="secondary-action"
                disabled={loading}
                onClick={() => onEdit(devis)}
                type="button"
              >
                {t("edit")}
              </button>
            </>
          )}

          {/* Expired shortcut in footer too */}
          {isExpired && onCreateNew && (
            <button
              className="primary-action"
              disabled={loading}
              onClick={() => onCreateNew(devis)}
              type="button"
            >
              <PlusCircle size={17} aria-hidden="true" />
              {t("create_new_devis", { defaultValue: "New quotation" })}
            </button>
          )}

          <button
            className="danger-action"
            disabled={loading}
            onClick={() => onDelete(devis)}
            type="button"
          >
            <Trash2 size={17} aria-hidden="true" />
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}