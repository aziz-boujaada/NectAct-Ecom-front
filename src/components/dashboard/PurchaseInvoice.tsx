import { Loader, Printer, Trash2, Edit3 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { Product, Purchase, PurchaseItem } from '../../types';
import { usePagination } from './hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { formatCurrency } from '../../utils/currency';
import { generatePurchaseInvoice } from '../../api/invoices';

type PurchaseInvoiceProps = {
  purchase: Purchase;
  purchaseItems: PurchaseItem[];
  products: Product[];
  supplierName?: string;
  loading?: boolean;
  onEditItem?: (item: PurchaseItem) => void;
  onDeleteItem?: (item: PurchaseItem) => void;
};

function formatDate(date?: string) {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString();
}

function getItemAmount(item: PurchaseItem) {
  const total = Number(item.total ?? 0);
  if (Number.isFinite(total) && total > 0) return total;
  const price = Number(item.price ?? 0);
  const quantity = Number(item.quantity ?? 0);
  return price * quantity;
}

export function PurchaseInvoice({
  purchase,
  purchaseItems,
  products,
  supplierName,
  loading = false,
  onEditItem,
  onDeleteItem,
}: PurchaseInvoiceProps) {
  const [isExporting, setIsExporting] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const productById = new Map(products.map((product) => [product.id, product]));
  const relatedItems = purchaseItems.filter((item) => item.purchase_id === purchase.id);
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(relatedItems);
  const subtotal = relatedItems.reduce((sum, item) => sum + getItemAmount(item), 0);
  const total = Number(purchase.total ?? subtotal);
  const displayTotal = Number.isFinite(total) ? total : subtotal;

  async function exportPdfToFile() {
    if (isExporting) return;

    try {
      setIsExporting(true);

      const result = await generatePurchaseInvoice(purchase.id);

      if (!result.success) {
        throw new Error(result.message);
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const fileUrl = URL.createObjectURL(result.blob);
      objectUrlRef.current = fileUrl;

      const openedWindow = window.open(fileUrl, '_blank', 'noopener,noreferrer');

      if (!openedWindow) {
        const anchor = document.createElement('a');
        anchor.href = fileUrl;
        anchor.download = result.filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }

      window.setTimeout(() => {
        if (objectUrlRef.current === fileUrl) {
          URL.revokeObjectURL(fileUrl);
          objectUrlRef.current = null;
        }
      }, 60000);
    } catch (error) {
      console.error('Purchase invoice export failed', error);
      alert('Failed to generate purchase invoice PDF.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="invoice-sheet" aria-label={`Invoice for purchase #${purchase.id}`}>
      <div className="invoice-toolbar">
        <div>
          <p className="eyebrow">Purchase Invoice</p>
          <h3>Purchase #{purchase.id}</h3>
          <p className="text-muted">Download a backend-generated PDF for this purchase.</p>
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
          <span className="label">Supplier</span>
          <span className="value">{supplierName ?? purchase.supplier?.name ?? `Supplier ${purchase.supplier_id}`}</span>
        </div>
        <div className="detail-item">
          <span className="label">Status</span>
          <span className={`status-pill ${purchase.status}`}>{purchase.status}</span>
        </div>
        <div className="detail-item">
          <span className="label">Created</span>
          <span className="value">{formatDate(purchase.created_at)}</span>
        </div>
        <div className="detail-item">
          <span className="label">Items</span>
          <span className="value">{relatedItems.length}</span>
        </div>
      </div>

      <div className="detail-section">
        {relatedItems.length === 0 ? (
          <p className="text-muted">No items found for this purchase.</p>
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
                  {(onEditItem || onDeleteItem) && <th aria-label="Actions" />}
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
                      {(onEditItem || onDeleteItem) && (
                        <td>
                          <div className="row-actions">
                            {onEditItem && (
                              <button aria-label={`Edit item ${item.id}`} className="secondary-action" disabled={loading} onClick={() => onEditItem(item)} type="button">
                                <Edit3 size={16} aria-hidden="true" />
                              </button>
                            )}
                            {onDeleteItem && (
                              <button aria-label={`Delete item ${item.id}`} className="danger-action" disabled={loading} onClick={() => onDeleteItem(item)} type="button">
                                <Trash2 size={16} aria-hidden="true" />
                              </button>
                            )}
                          </div>
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