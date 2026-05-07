import { FormEvent } from "react";
import {
  ClipboardList,
  Edit3,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import type {
  Product,
  Purchase,
  PurchaseFormValues,
  PurchaseItem,
  PurchaseItemDraftValues,
  PurchaseItemFormValues,
  Supplier,
} from "../../types";
import { PurchaseEntryForm } from "./forms/PurchaseEntryForm";
import { PurchaseItemEntryForm } from "./forms/PurchaseItemEntryForm";

type PurchaseManagerProps = {
  editingPurchase: Purchase | null;
  editingPurchaseItem: PurchaseItem | null;
  isAddingPurchase: boolean;
  loading: boolean;
  products: Product[];
  purchaseForm: PurchaseFormValues;
  purchaseItemForm: PurchaseItemFormValues;
  purchaseItemDrafts: PurchaseItemDraftValues[];
  purchaseItems: PurchaseItem[];
  purchases: Purchase[];
  suppliers: Supplier[];
  onAddPurchase: () => void;
  onCancelPurchaseEdit: () => void;
  onCancelPurchaseItemEdit: () => void;
  onChangePurchase: (form: PurchaseFormValues) => void;
  onChangePurchaseItem: (form: PurchaseItemFormValues) => void;
  onChangePurchaseItemDraft: (index: number, field: keyof PurchaseItemDraftValues, value: string) => void;
  onDeletePurchase: (purchase: Purchase) => void;
  onDeletePurchaseItem: (purchaseItem: PurchaseItem) => void;
  onEditPurchase: (purchase: Purchase) => void;
  onEditPurchaseItem: (purchaseItem: PurchaseItem) => void;
  onAddPurchaseItemDraft: () => void;
  onRemovePurchaseItemDraft: (index: number) => void;
  onSubmitPurchase: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitPurchaseItem: (event: FormEvent<HTMLFormElement>) => void;
};

function money(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : value;
}

export function PurchaseManager({
  editingPurchase,
  editingPurchaseItem,
  isAddingPurchase,
  loading,
  products,
  purchaseForm,
  purchaseItemForm,
  purchaseItemDrafts,
  purchaseItems,
  purchases,
  suppliers,
  onAddPurchase,
  onCancelPurchaseEdit,
  onCancelPurchaseItemEdit,
  onChangePurchase,
  onChangePurchaseItem,
  onChangePurchaseItemDraft,
  onDeletePurchase,
  onDeletePurchaseItem,
  onEditPurchase,
  onEditPurchaseItem,
  onAddPurchaseItemDraft,
  onRemovePurchaseItemDraft,
  onSubmitPurchase,
  onSubmitPurchaseItem,
}: PurchaseManagerProps) {
  const showPurchaseForm = isAddingPurchase || editingPurchase !== null;
  const showItemForm = editingPurchaseItem !== null;
  const missingPurchaseRelations = suppliers.length === 0;
  const purchaseById = new Map(purchases.map((purchase) => [purchase.id, purchase]));
  const productById = new Map(products.map((product) => [product.id, product]));
  const selectedPurchase = purchases.find(
    (purchase) => purchase.id === Number(purchaseItemForm.purchase_id),
  );
  const purchaseProducts = selectedPurchase
    ? products.filter(
        (product) => product.supplier_id === selectedPurchase.supplier_id,
      )
    : [];
  const formatDate = (date?: string) => {
    if (!date) {
      return 'Not set';
    }

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="purchase-workspace">
      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Purchasing</p>
            <h2>Purchases</h2>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span>{purchases.length} total</span>
            {!showPurchaseForm && (
              <button
                className="primary-action"
                onClick={onAddPurchase}
                type="button"
              >
                <Plus size={17} /> Add purchase
              </button>
            )}
          </div>
        </div>

        {missingPurchaseRelations && showPurchaseForm && (
          <p className="helper-note">
            Create at least one supplier before saving purchases.
          </p>
        )}

        {showPurchaseForm ? (
          <PurchaseEntryForm
            editingPurchase={editingPurchase}
            form={purchaseForm}
            items={purchaseItemDrafts}
            products={products}
            loading={loading}
            missingRelations={missingPurchaseRelations}
            suppliers={suppliers}
            onAddItem={onAddPurchaseItemDraft}
            onCancelEdit={onCancelPurchaseEdit}
            onChange={onChangePurchase}
            onChangeItem={onChangePurchaseItemDraft}
            onRemoveItem={onRemovePurchaseItemDraft}
            onSubmit={onSubmitPurchase}
          />
        ) : (
          <div className="table-wrap fade-in">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Supplier</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Items</th>
                  <th>Created at</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={6}>No purchases found.</td>
                  </tr>
                ) : (
                  [...purchases]
                    .sort((a, b) => b.id - a.id)
                    .map((purchase) => (
                      <tr key={purchase.id}>
                        <td>#{purchase.supplier?.id}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <ShoppingCart
                              size={18}
                              className="text-muted"
                              aria-hidden="true"
                            />
                            <strong>
                              {purchase.supplier?.name ?? purchase.supplier_id}
                            </strong>
                          </div>
                        </td>
                        <td>
                          <span className={`status-pill ${purchase.status}`}>
                            {purchase.status}
                          </span>
                        </td>
                        <td>{money(purchase.total)}</td>
                        <td>
                          {purchase.items?.length ??
                            purchaseItems.filter(
                              (item) => item.purchase_id === purchase.id,
                            ).length}
                        </td>
                        <td>{formatDate(purchase.created_at)}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              aria-label={`Edit purchase ${purchase.id}`}
                              disabled={loading}
                              onClick={() => onEditPurchase(purchase)}
                              type="button"
                            >
                              <Edit3 size={16} aria-hidden="true" />
                            </button>
                            <button
                              aria-label={`Delete purchase ${purchase.id}`}
                              className="danger-action"
                              disabled={loading}
                              onClick={() => onDeletePurchase(purchase)}
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
            <p className="eyebrow">Purchase Lines</p>
            <h2>Purchase Items</h2>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span>{purchaseItems.length} total</span>
          </div>
        </div>

        {showItemForm ? (
          <PurchaseItemEntryForm
            editingPurchaseItem={editingPurchaseItem}
            form={purchaseItemForm}
            loading={loading}
            missingItemRelations={purchases.length === 0 || products.length === 0}
            products={products}
            purchases={purchases}
            purchaseProducts={purchaseProducts}
            selectedPurchase={selectedPurchase}
            onCancelEdit={onCancelPurchaseItemEdit}
            onChange={onChangePurchaseItem}
            onSubmit={onSubmitPurchaseItem}
          />
        ) : (
          <div className="table-wrap fade-in">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Purchase</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {purchaseItems.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No purchase items found.</td>
                  </tr>
                ) : (
                  [...purchaseItems]
                    .sort((a, b) => b.id - a.id)
                    .map((purchaseItem) => {
                      const resolvedPurchase = purchaseItem.purchase ?? purchaseById.get(purchaseItem.purchase_id);
                      const resolvedProduct = purchaseItem.product ?? productById.get(purchaseItem.product_id);

                      return (
                        <tr key={purchaseItem.id}>
                          <td>#{purchaseItem.id}</td>
                          <td>{resolvedPurchase?.supplier?.name ?? resolvedPurchase?.supplier_id ?? purchaseItem.purchase_id}</td>
                          <td>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                              }}
                            >
                              <ClipboardList size={18} className="text-muted" aria-hidden="true" />
                              <div>
                                <strong>{resolvedProduct?.name ?? purchaseItem.product_id}</strong>
                                <span>{resolvedProduct?.reference?.slice(0, 15) ?? 'No reference'}</span>
                              </div>
                            </div>
                          </td>
                          <td>{money(purchaseItem.price)}</td>
                          <td>{purchaseItem.quantity}</td>
                          <td>{money(purchaseItem.total)}</td>
                          <td>
                            <div className="row-actions">
                              <button
                                aria-label={`Edit purchase item ${purchaseItem.id}`}
                                disabled={loading}
                                onClick={() => onEditPurchaseItem(purchaseItem)}
                                type="button"
                              >
                                <Edit3 size={16} aria-hidden="true" />
                              </button>
                              <button
                                aria-label={`Delete purchase item ${purchaseItem.id}`}
                                className="danger-action"
                                disabled={loading}
                                onClick={() => onDeletePurchaseItem(purchaseItem)}
                                type="button"
                              >
                                <Trash2 size={16} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
