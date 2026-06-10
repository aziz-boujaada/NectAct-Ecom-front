import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, PackageSearch } from "lucide-react";
import { useTranslation } from "react-i18next";
import { listStockMovements } from "../../api/catalog";
import type { StockMovement } from "../../types";

export default function StockMovements() {
  const { t, i18n } = useTranslation("inventory");
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function formatDate(value?: string) {
    if (!value) return t("history.unknown");

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleString(i18n.language, {
          dateStyle: "medium",
          timeStyle: "short",
        });
  }

  function movementLabel(type: StockMovement["type"]) {
    return type === "in" ? t("history.stock_in") : type === "out" ? t("history.stock_out") : type;
  }

  function sourceLabel(source?: StockMovement["source"] | null, referenceId?: number | null) {
    if (!source) return t("history.manual");
    return referenceId ? `${source} #${referenceId}` : source;
  }

  async function fetchStock(pageNumber = 1) {
    setLoading(true);
    setError(null);

    try {
      const result = await listStockMovements(pageNumber);
      setMovements(result.movements);
      setPage(result.currentPage);
      setLastPage(result.lastPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("history.fetch_error"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    listStockMovements(1)
      .then((result) => {
        if (!active) return;
        setMovements(result.movements);
        setPage(result.currentPage);
        setLastPage(result.lastPage);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : t("history.fetch_error"));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t]);

  return (
    <div className="stock-movements">
      {error && <p className="helper-note error-text">{error}</p>}

      <div className="table-wrap fade-in">
        <table>
          <thead>
            <tr>
              <th>{t("history.id")}</th>
              <th>{t("history.product")}</th>
              <th>{t("history.movement")}</th>
              <th>{t("history.quantity")}</th>
              <th>{t("history.source")}</th>
              <th>{t("history.date")}</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                  {t("history.loading")}
                </td>
              </tr>
            ) : movements.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                  {t("history.no_movements")}
                </td>
              </tr>
            ) : (
              movements.map((item) => {
                const isStockIn = item.type === "in";

                return (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>
                      <div className="stock-product-cell">
                        <PackageSearch size={18} className="text-muted" aria-hidden="true" />
                        <div>
                          <strong>{item.product?.name ?? t("history.product_label", { id: item.product_id })}</strong>
                          <span>{item.product?.reference.slice(0 , 12) ?? t("history.no_reference")}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`movement-pill ${isStockIn ? "in" : "out"}`}>
                        {isStockIn ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        {movementLabel(item.type)}
                      </span>
                    </td>
                    <td>
                      <strong>{isStockIn ? "+" : "-"}{item.quantity}</strong>
                    </td>
                    <td>{sourceLabel(item.source, item.reference_id)}</td>
                    <td>{formatDate(item.created_at)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-row">
        <button onClick={() => fetchStock(page - 1)} disabled={page === 1 || loading} type="button">
          {t("history.prev")}
        </button>
        <span>
          {t("history.page_info", { page, lastPage })}
        </span>
        <button onClick={() => fetchStock(page + 1)} disabled={page === lastPage || loading} type="button">
          {t("history.next")}
        </button>
      </div>
    </div>
  );
}
