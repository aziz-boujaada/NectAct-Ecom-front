import { FormEvent } from 'react';
import { ClipboardList, Edit3, Plus, ReceiptText, Trash2 } from 'lucide-react';
import type { Client, Product, Sale, SaleFormValues, SaleItem, SaleItemFormValues } from '../../types';
import { SaleEntryForm } from './forms/SaleEntryForm';
import { SaleItemEntryForm } from './forms/SaleItemEntryForm';

type SaleManagerProps = {
  editingSale: Sale | null;
  editingSaleItem: SaleItem | null;
  isAddingSale: boolean;
  isAddingSaleItem: boolean;
  loading: boolean;
  clients: Client[];
  products: Product[];
  saleForm: SaleFormValues;
  saleItemForm: SaleItemFormValues;
  saleItems: SaleItem[];
  sales: Sale[];
  onAddSale: () => void;
  onAddSaleItem: () => void;
  onCancelSaleEdit: () => void;
  onCancelSaleItemEdit: () => void;
  onChangeSale: (form: SaleFormValues) => void;
  onChangeSaleItem: (form: SaleItemFormValues) => void;
  onDeleteSale: (sale: Sale) => void;
  onDeleteSaleItem: (saleItem: SaleItem) => void;
  onEditSale: (sale: Sale) => void;
  onEditSaleItem: (saleItem: SaleItem) => void;
  onSubmitSale: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitSaleItem: (event: FormEvent<HTMLFormElement>) => void;
};

function money(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : value;
}

export function SaleManager({
  editingSale,
  editingSaleItem,
  isAddingSale,
  isAddingSaleItem,
  loading,
  clients,
  products,
  saleForm,
  saleItemForm,
  saleItems,
  sales,
  onAddSale,
  onAddSaleItem,
  onCancelSaleEdit,
  onCancelSaleItemEdit,
  onChangeSale,
  onChangeSaleItem,
  onDeleteSale,
  onDeleteSaleItem,
  onEditSale,
  onEditSaleItem,
  onSubmitSale,
  onSubmitSaleItem,
}: SaleManagerProps) {
  const showSaleForm = isAddingSale || editingSale !== null;
  const showItemForm = isAddingSaleItem || editingSaleItem !== null;
  const missingSaleRelations = clients.length === 0;
  const missingItemRelations = sales.length === 0 || products.length === 0;
  const selectedProduct = products.find((product) => product.id === Number(saleItemForm.product_id));
  const selectedProductStock = selectedProduct?.stock ?? 0;
  const currentItemQuantity = editingSaleItem?.product_id === selectedProduct?.id ? editingSaleItem?.quantity : 0;
  const availableStock = selectedProductStock + currentItemQuantity;
  const canSubmitItem = !missingItemRelations && (!selectedProduct || availableStock > 0);

  const formatDate = (date?: string) => {
    if (!date) return 'Not set';

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="purchase-workspace">
      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Sales</p>
            <h2>Sales</h2>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>{sales.length} total</span>
            {!showSaleForm && (
              <button className="primary-action" onClick={onAddSale} type="button">
                <Plus size={17} /> Add sale
              </button>
            )}
          </div>
        </div>

        {missingSaleRelations && showSaleForm && (
          <p className="helper-note">Create at least one client before saving sales.</p>
        )}

        {showSaleForm ? (
          <SaleEntryForm
            clients={clients}
            editingSale={editingSale}
            form={saleForm}
            loading={loading}
            missingRelations={missingSaleRelations}
            onCancelEdit={onCancelSaleEdit}
            onChange={onChangeSale}
            onSubmit={onSubmitSale}
          />
        ) : (
          <div className="table-wrap fade-in">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Items</th>
                  <th>Created at</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No sales found.</td>
                  </tr>
                ) : (
                  [...sales]
                    .sort((a, b) => b.id - a.id)
                    .map((sale) => (
                      <tr key={sale.id}>
                        <td>#{sale.id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ReceiptText size={18} className="text-muted" aria-hidden="true" />
                            <strong>{sale.client?.name ?? sale.client_id}</strong>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${sale.status}`}>{sale.status}</span>
                        </td>
                        <td>{money(sale.total)}</td>
                        <td>{sale.items?.length ?? saleItems.filter((item) => item.sale_id === sale.id).length}</td>
                        <td>{formatDate(sale.created_at)}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              aria-label={`Edit sale ${sale.id}`}
                              disabled={loading}
                              onClick={() => onEditSale(sale)}
                              type="button"
                            >
                              <Edit3 size={16} aria-hidden="true" />
                            </button>
                            <button
                              aria-label={`Delete sale ${sale.id}`}
                              className="danger-action"
                              disabled={loading}
                              onClick={() => onDeleteSale(sale)}
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
        )}
      </section>

      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Sale Lines</p>
            <h2>Sale Items</h2>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>{saleItems.length} total</span>
            {!showItemForm && (
              <button className="primary-action" onClick={onAddSaleItem} type="button">
                <Plus size={17} /> Add item
              </button>
            )}
          </div>
        </div>

        {missingItemRelations && showItemForm && (
          <p className="helper-note">Create at least one sale and one product before saving sale items.</p>
        )}

        {showItemForm ? (
          <SaleItemEntryForm
            availableStock={availableStock}
            canSubmitItem={canSubmitItem}
            editingSaleItem={editingSaleItem}
            form={saleItemForm}
            loading={loading}
            products={products}
            sales={sales}
            selectedProduct={selectedProduct}
            onCancelEdit={onCancelSaleItemEdit}
            onChange={onChangeSaleItem}
            onSubmit={onSubmitSaleItem}
          />
        ) : (
          <div className="table-wrap fade-in">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sale</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {saleItems.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No sale items found.</td>
                  </tr>
                ) : (
                  [...saleItems]
                    .sort((a, b) => b.id - a.id)
                    .map((saleItem) => (
                      <tr key={saleItem.id}>
                        <td>#{saleItem.id}</td>
                        <td>{saleItem.sale?.client?.name ?? saleItem.sale_id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ClipboardList size={18} className="text-muted" aria-hidden="true" />
                            <div>
                              <strong>{saleItem.product?.name ?? saleItem.product_id}</strong>
                              <span>{saleItem.product?.reference.slice(0, 15) ?? 'No reference'}</span>
                            </div>
                          </div>
                        </td>
                        <td>{money(saleItem.price)}</td>
                        <td>{saleItem.quantity}</td>
                        <td>{money(saleItem.total)}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              aria-label={`Edit sale item ${saleItem.id}`}
                              disabled={loading}
                              onClick={() => onEditSaleItem(saleItem)}
                              type="button"
                            >
                              <Edit3 size={16} aria-hidden="true" />
                            </button>
                            <button
                              aria-label={`Delete sale item ${saleItem.id}`}
                              className="danger-action"
                              disabled={loading}
                              onClick={() => onDeleteSaleItem(saleItem)}
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
        )}
      </section>
    </div>
  );
}
