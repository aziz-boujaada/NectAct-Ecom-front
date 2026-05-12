import { FormEvent } from 'react';
import { Eye, Plus, ReceiptText, Trash2 } from 'lucide-react';
import type { Refund, RefundFormValues, RefundItem, Sale, SaleItem } from '../../types';
import { RefundEntryForm } from './forms/RefundEntryForm';
import { RefundDetails } from './RefundDetails';
import { usePagination } from './hooks/usePagination';
import { PaginationControls } from './PaginationControls';

type RefundManagerProps = {
  isAddingRefund: boolean;
  loading: boolean;
  refundForm: RefundFormValues;
  refunds: Refund[];
  sales: Sale[];
  viewingRefund: Refund | null;
  onAddRefund: () => void;
  onCancelRefundEdit: () => void;
  onChangeRefund: (form: RefundFormValues) => void;
  onDeleteRefund: (refund: Refund) => void;
  onSubmitRefund: (event: FormEvent<HTMLFormElement>) => void;
  onSetViewingRefund: (refund: Refund | null) => void;
};

function money(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : value;
}

function formatDate(date?: string) {
  if (!date) return 'Not set';

  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function refundItems(refunds: Refund[]) {
  return refunds.flatMap((refund) =>
    (refund.items ?? []).map((item) => ({
      ...item,
      refund,
    })),
  );
}

function getSoldItems(selectedSale: Sale | undefined): SaleItem[] {
  return selectedSale?.items ?? [];
}

function getAvailableByProduct(selectedSale: Sale | undefined, refunds: Refund[]) {
  const available = new Map<number, number>();
  const soldItems = getSoldItems(selectedSale);

  soldItems.forEach((item) => {
    available.set(item.product_id, item.quantity);
  });

  refunds
    .filter((refund) => refund.sale_id === selectedSale?.id)
    .flatMap((refund) => refund.items ?? [])
    .forEach((item) => {
      available.set(item.product_id, (available.get(item.product_id) ?? 0) - item.quantity);
    });

  return available;
}

function canSubmitRefund(form: RefundFormValues, availableByProduct: Map<number, number>) {
  const seen = new Set<number>();

  return (
    form.sale_id !== '' &&
    form.items.length > 0 &&
    form.items.every((item) => {
      const productId = Number(item.product_id);
      const quantity = Number(item.quantity);
      const available = availableByProduct.get(productId) ?? 0;
      const valid = productId > 0 && quantity > 0 && quantity <= available && !seen.has(productId);
      seen.add(productId);
      return valid;
    })
  );
}

export function RefundManager({
  isAddingRefund,
  loading,
  refundForm,
  refunds,
  sales,
  viewingRefund,
  onAddRefund,
  onCancelRefundEdit,
  onChangeRefund,
  onDeleteRefund,
  onSubmitRefund,
  onSetViewingRefund,
}: RefundManagerProps) {
  const selectedSale = sales.find((sale) => sale.id === Number(refundForm.sale_id));
  const soldItems = getSoldItems(selectedSale);
  const availableByProduct = getAvailableByProduct(selectedSale, refunds);
  const items = refundItems(refunds);
  const missingRelations = sales.length === 0;
  const canSubmit = canSubmitRefund(refundForm, availableByProduct);
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(refunds);

  return (
    <div className="purchase-workspace">
      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Returns</p>
            <h2>Refunds</h2>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>{refunds.length} total</span>
            {!isAddingRefund && (
              <button className="primary-action" onClick={onAddRefund} type="button">
                <Plus size={17} /> Add refund
              </button>
            )}
          </div>
        </div>

        {missingRelations && isAddingRefund && (
          <p className="helper-note">Create at least one sale with sale items before saving refunds.</p>
        )}

        {isAddingRefund ? (
          <RefundEntryForm
            availableByProduct={availableByProduct}
            canSubmit={canSubmit}
            form={refundForm}
            loading={loading}
            missingRelations={missingRelations}
            sales={sales}
            selectedSale={selectedSale}
            soldItems={soldItems}
            onCancelEdit={onCancelRefundEdit}
            onChange={onChangeRefund}
            onSubmit={onSubmitRefund}
          />
        ) : (
          <>
            <div className="table-wrap fade-in">
              <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sale</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Items</th>
                  <th>Reason</th>
                  <th>Created at</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {refunds.length === 0 ? (
                  <tr>
                    <td colSpan={8}>No refunds found.</td>
                  </tr>
                ) : (
                  [...paginatedData]
                    .sort((a, b) => b.id - a.id)
                    .map((refund) => (
                      <tr key={refund.id}>
                        <td>#{refund.id}</td>
                        <td>#{refund.sale_id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ReceiptText size={18} className="text-muted" aria-hidden="true" />
                            <strong>{refund.sale?.client?.name ?? refund.sale?.client_id ?? 'Unknown client'}</strong>
                          </div>
                        </td>
                        <td>{money(refund.total)}</td>
                        <td>{refund.items?.length ?? 0}</td>
                        <td>{refund.reason || 'No reason'}</td>
                        <td>{formatDate(refund.created_at)}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              aria-label={`View refund ${refund.id}`}
                              disabled={loading}
                              onClick={() => onSetViewingRefund(refund)}
                              type="button"
                            >
                              <Eye size={16} aria-hidden="true" />
                            </button>
                            <button
                              aria-label={`Delete refund ${refund.id}`}
                              className="danger-action"
                              disabled={loading}
                              onClick={() => onDeleteRefund(refund)}
                              type="button"
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={prevPage}
            onNext={nextPage}
            onPageChange={goToPage}
          />
          </>
        )}
      </section>

      {viewingRefund && (
        <RefundDetails
          loading={loading}
          refund={viewingRefund}
          refunds={refunds}
          sales={sales}
          onClose={() => onSetViewingRefund(null)}
          onDelete={onDeleteRefund}
        />
      )}
    </div>
  );
}
