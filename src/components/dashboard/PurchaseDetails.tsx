import { X, Edit3, Trash2 } from 'lucide-react';
import type { Product, Purchase, PurchaseItem, Supplier } from '../../types';
import { usePagination } from './hooks/usePagination';
import { PaginationControls } from './PaginationControls';

type PurchaseDetailsProps = {
  purchase: Purchase;
  purchaseItems: PurchaseItem[];
  products: Product[];
  suppliers: Supplier[];
  loading: boolean;
  onClose: () => void;
  onEdit: (purchase: Purchase) => void;
  onDelete: (purchase: Purchase) => void;
  onEditItem: (item: PurchaseItem) => void;
  onDeleteItem: (item: PurchaseItem) => void;
};

function money(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : value;
}

export function PurchaseDetails({
  purchase,
  purchaseItems,
  products,
  suppliers,
  loading,
  onClose,
  onEdit,
  onDelete,
  onEditItem,
  onDeleteItem,
}: PurchaseDetailsProps) {
  const purchaseById = new Map(
    purchaseItems.map((item) => [item.purchase_id, purchase])
  );
  const productById = new Map(products.map((product) => [product.id, product]));
  const relatedItems = purchaseItems.filter((item) => item.purchase_id === purchase.id);
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(relatedItems);
  const supplier = suppliers.find((s) => s.id === purchase.supplier_id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Purchase #{purchase.id}</h2>
            <p className="text-muted">Details and items</p>
          </div>
          <button
            aria-label="Close details"
            className="secondary-action"
            onClick={onClose}
            type="button"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3>Purchase Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Supplier</span>
                <span className="value">{supplier?.name ?? `Supplier ${purchase.supplier_id}`}</span>
              </div>
              <div className="detail-item">
                <span className="label">Status</span>
                <span className={`status-pill ${purchase.status}`}>{purchase.status}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total</span>
                <span className="value">{money(purchase.total)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Items Count</span>
                <span className="value">{relatedItems.length}</span>
              </div>
              {purchase.created_at && (
                <div className="detail-item">
                  <span className="label">Created</span>
                  <span className="value">
                    {new Date(purchase.created_at).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="detail-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Purchase Items</h3>
              <span>{relatedItems.length} items</span>
            </div>
            {relatedItems.length === 0 ? (
              <p className="text-muted">No items in this purchase.</p>
            ) : (
              <div className="detail-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item) => {
                      const product = productById.get(item.product_id);
                      return (
                        <tr key={item.id}>
                          <td>
                            <div>
                              <strong>{product?.name ?? `Product ${item.product_id}`}</strong>
                              <span>{product?.reference ?? 'No reference'}</span>
                            </div>
                          </td>
                          <td>{money(item.price)}</td>
                          <td>{item.quantity}</td>
                          <td>{money(item.total)}</td>
                          <td>
                            <div className="row-actions">
                              <button
                                aria-label={`Edit item ${item.id}`}
                                disabled={loading}
                                onClick={() => onEditItem(item)}
                                type="button"
                              >
                                <Edit3 size={16} aria-hidden="true" />
                              </button>
                              <button
                                aria-label={`Delete item ${item.id}`}
                                className="danger-action"
                                disabled={loading}
                                onClick={() => onDeleteItem(item)}
                                type="button"
                              >
                                <Trash2 size={16} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {relatedItems.length > 0 && totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={prevPage}
                onNext={nextPage}
                onPageChange={goToPage}
              />
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="secondary-action"
            disabled={loading}
            onClick={onClose}
            type="button"
          >
            Close
          </button>
          <button
            className="primary-action"
            disabled={loading}
            onClick={() => onEdit(purchase)}
            type="button"
          >
            <Edit3 size={17} aria-hidden="true" />
            Edit Purchase
          </button>
          <button
            className="danger-action"
            disabled={loading}
            onClick={() => onDelete(purchase)}
            type="button"
          >
            <Trash2 size={17} aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
