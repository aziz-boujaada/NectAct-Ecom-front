import { Loader, Printer, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { tokenStore } from '../../api/auth';
import type { Product, Sale, SaleItem } from '../../types';
import { usePagination } from './hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { formatCurrency } from '../../utils/currency';

type SaleInvoiceProps = {
  sale: Sale;
  saleItems: SaleItem[];
  products: Product[];
  clientName?: string;
  loading?: boolean;
  onDeleteItem?: (item: SaleItem) => void;
};

function formatDate(date?: string) {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString();
}

function getItemAmount(item: SaleItem) {
  const total = Number(item.total ?? 0);
  if (Number.isFinite(total) && total > 0) return total;
  const price = Number(item.price ?? 0);
  const quantity = Number(item.quantity ?? 0);
  return price * quantity;
}

export function SaleInvoice({ sale, saleItems, products, clientName, loading = false, onDeleteItem }: SaleInvoiceProps) {
  const [isExporting, setIsExporting] = useState(false);
  const productById = new Map(products.map((p) => [p.id, p]));
  const relatedItems = saleItems.filter((i) => i.sale_id === sale.id);
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(relatedItems);
  const subtotal = relatedItems.reduce((s, it) => s + getItemAmount(it), 0);
  const total = Number(sale.total ?? subtotal);
  const displayTotal = Number.isFinite(total) ? total : subtotal;
  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

  async function exportPdfToFile() {
    if (isExporting) return;
    try {
      setIsExporting(true);
      const token = tokenStore.get();
      const headers: HeadersInit = { Accept: 'application/pdf' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/invoices/${sale.id}/generate`, {
        method: 'POST',
        headers,
      });

      if (!res.ok) throw new Error(res.statusText || 'Failed to generate PDF');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // filename from sale id; backend sets Content-Disposition but anchor download is convenient
      a.download = `invoice-${sale.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      // minimal user-visible error
      // eslint-disable-next-line no-console
      console.error('Invoice export failed', err);
      alert('Failed to generate invoice PDF.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="invoice-sheet" aria-label={`Invoice for sale #${sale.id}`}>
      <div className="invoice-toolbar">
        <div>
          <p className="eyebrow">Invoice</p>
          <h3>Sale #{sale.id}</h3>
          <p className="text-muted">Download a backend-generated PDF for this sale.</p>
        </div>

        <div className="invoice-toolbar-actions">
          <button className="secondary-action invoice-export-button" onClick={exportPdfToFile} disabled={isExporting || loading} type="button">
            {isExporting ? (
              <>
                <Loader size={16} className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Printer size={16} /> Export PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="detail-grid invoice-meta-grid">
        <div className="detail-item">
          <span className="label">Client</span>
          <span className="value">{clientName ?? sale.client?.name ?? `Client ${sale.client_id}`}</span>
        </div>
        <div className="detail-item">
          <span className="label">Status</span>
          <span className={`status-pill ${sale.status}`}>{sale.status}</span>
        </div>
        <div className="detail-item">
          <span className="label">Created</span>
          <span className="value">{formatDate(sale.created_at)}</span>
        </div>
        <div className="detail-item">
          <span className="label">Items</span>
          <span className="value">{relatedItems.length}</span>
        </div>
      </div>

      <div className="detail-section">
        {relatedItems.length === 0 ? (
          <p className="text-muted">No items found for this sale.</p>
        ) : (
          <div className="detail-table-wrap invoice-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Reference</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  {onDeleteItem && <th aria-label="Actions" />}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => {
                  const product = productById.get(item.product_id);
                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{product?.name ?? `Product ${item.product_id}`}</strong>
                      </td>
                      <td>{product?.reference ?? '—'}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.total ?? getItemAmount(item))}</td>
                      {onDeleteItem && (
                        <td>
                          <button aria-label={`Delete item ${item.id}`} className="danger-action" disabled={loading} onClick={() => onDeleteItem(item)} type="button">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={prevPage}
          onNext={nextPage}
          onPageChange={goToPage}
        />
      )}

      <div className="invoice-summary">
        <div className="invoice-total-box">
          <div className="invoice-total-row">
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div className="invoice-total-row">
            <span>Invoice total</span>
            <strong>{formatCurrency(displayTotal)}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
