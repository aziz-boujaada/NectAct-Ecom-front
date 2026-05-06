import { FormEvent } from "react";
import {
  ClipboardList,
  Edit3,
  PackagePlus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import type {
  Product,
  Purchase,
  PurchaseFormValues,
  PurchaseItem,
  PurchaseItemFormValues,
  Supplier,
} from "../../types";

type PurchaseManagerProps = {
  editingPurchase: Purchase | null;
  editingPurchaseItem: PurchaseItem | null;
  isAddingPurchase: boolean;
  isAddingPurchaseItem: boolean;
  loading: boolean;
  products: Product[];
  purchaseForm: PurchaseFormValues;
  purchaseItemForm: PurchaseItemFormValues;
  purchaseItems: PurchaseItem[];
  purchases: Purchase[];
  suppliers: Supplier[];
  onAddPurchase: () => void;
  onAddPurchaseItem: () => void;
  onCancelPurchaseEdit: () => void;
  onCancelPurchaseItemEdit: () => void;
  onChangePurchase: (form: PurchaseFormValues) => void;
  onChangePurchaseItem: (form: PurchaseItemFormValues) => void;
  onDeletePurchase: (purchase: Purchase) => void;
  onDeletePurchaseItem: (purchaseItem: PurchaseItem) => void;
  onEditPurchase: (purchase: Purchase) => void;
  onEditPurchaseItem: (purchaseItem: PurchaseItem) => void;
  onSubmitPurchase: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitPurchaseItem: (event: FormEvent<HTMLFormElement>) => void;
};

function money(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : value;
}

function purchaseLabel(purchase: Purchase) {
  return `#${purchase.id} - ${purchase.supplier?.name ?? `Supplier ${purchase.supplier_id}`}`;
}

export function PurchaseManager({
  editingPurchase,
  editingPurchaseItem,
  isAddingPurchase,
  isAddingPurchaseItem,
  loading,
  products,
  purchaseForm,
  purchaseItemForm,
  purchaseItems,
  purchases,
  suppliers,
  onAddPurchase,
  onAddPurchaseItem,
  onCancelPurchaseEdit,
  onCancelPurchaseItemEdit,
  onChangePurchase,
  onChangePurchaseItem,
  onDeletePurchase,
  onDeletePurchaseItem,
  onEditPurchase,
  onEditPurchaseItem,
  onSubmitPurchase,
  onSubmitPurchaseItem,
}: PurchaseManagerProps) {
  const showPurchaseForm = isAddingPurchase || editingPurchase !== null;
  const showItemForm = isAddingPurchaseItem || editingPurchaseItem !== null;
  const missingPurchaseRelations = suppliers.length === 0;
  const missingItemRelations = purchases.length === 0 || products.length === 0;
  const selectedPurchase = purchases.find(
    (purchase) => purchase.id === Number(purchaseItemForm.purchase_id),
  );
  const purchaseProducts = selectedPurchase
    ? products.filter(
        (product) => product.supplier_id === selectedPurchase.supplier_id,
      )
    : [];
  const missingPurchaseProducts =
    Boolean(selectedPurchase) && purchaseProducts.length === 0;

  const formatDate = (date : string | Date) => {
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
          <form
            className="manager-form purchase-form fade-in"
            onSubmit={onSubmitPurchase}
          >
            <label>
              Supplier
              <select
                value={purchaseForm.supplier_id}
                onChange={(event) =>
                  onChangePurchase({
                    ...purchaseForm,
                    supplier_id: event.target.value,
                  })
                }
                required
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                value={purchaseForm.status}
                onChange={(event) =>
                  onChangePurchase({
                    ...purchaseForm,
                    status: event.target.value as PurchaseFormValues["status"],
                  })
                }
                required
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
              </select>
            </label>
            <div className="form-actions full-field">
              <button
                className="primary-action"
                disabled={loading || missingPurchaseRelations}
                type="submit"
              >
                {editingPurchase ? (
                  <Edit3 size={17} aria-hidden="true" />
                ) : (
                  <Plus size={17} aria-hidden="true" />
                )}
                {editingPurchase ? "Update purchase" : "Create purchase"}
              </button>
              <button
                className="secondary-action"
                disabled={loading}
                onClick={onCancelPurchaseEdit}
                type="button"
              >
                <X size={17} aria-hidden="true" />
                Cancel
              </button>
            </div>
          </form>
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
            {!showItemForm && (
              <button
                className="primary-action"
                onClick={onAddPurchaseItem}
                type="button"
              >
                <Plus size={17} /> Add item
              </button>
            )}
          </div>
        </div>

        {missingItemRelations && showItemForm && (
          <p className="helper-note">
            Create at least one purchase and one product before saving purchase
            items.
          </p>
        )}

        {showItemForm ? (
          <form
            className="manager-form purchase-item-form fade-in"
            onSubmit={onSubmitPurchaseItem}
          >
            <label>
              Purchase
              <select
                value={purchaseItemForm.purchase_id}
                onChange={(event) => {
                  const nextPurchase = purchases.find(
                    (purchase) => purchase.id === Number(event.target.value),
                  );
                  const currentProduct = products.find(
                    (product) =>
                      product.id === Number(purchaseItemForm.product_id),
                  );
                  const keepProduct =
                    nextPurchase &&
                    currentProduct &&
                    currentProduct.supplier_id === nextPurchase.supplier_id;

                  onChangePurchaseItem({
                    ...purchaseItemForm,
                    purchase_id: event.target.value,
                    product_id: keepProduct ? purchaseItemForm.product_id : "",
                    price: keepProduct ? purchaseItemForm.price : "",
                  });
                }}
                required
              >
                <option value="">Select purchase</option>
                {purchases.map((purchase) => (
                  <option key={purchase.id} value={purchase.id}>
                    {purchaseLabel(purchase)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Product
              <select
                value={purchaseItemForm.product_id}
                onChange={(event) => {
                  const product = products.find(
                    (item) => item.id === Number(event.target.value),
                  );
                  onChangePurchaseItem({
                    ...purchaseItemForm,
                    product_id: event.target.value,
                    price: product
                      ? String(product.price)
                      : purchaseItemForm.price,
                  });
                }}
                disabled={!selectedPurchase}
                required
              >
                <option value="">
                  {selectedPurchase
                    ? "Select product"
                    : "Select purchase first"}
                </option>
                {purchaseProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            {missingPurchaseProducts && (
              <p className="helper-note full-field">
                No products found for this purchase supplier.
              </p>
            )}
            <label>
              Price
              <input
                min="0"
                step="0.01"
                type="number"
                value={purchaseItemForm.price}
                onChange={(event) =>
                  onChangePurchaseItem({
                    ...purchaseItemForm,
                    price: event.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              Quantity
              <input
                min="1"
                type="number"
                value={purchaseItemForm.quantity}
                onChange={(event) =>
                  onChangePurchaseItem({
                    ...purchaseItemForm,
                    quantity: event.target.value,
                  })
                }
                required
              />
            </label>
            <div className="form-actions full-field">
              <button
                className="primary-action"
                disabled={loading || missingItemRelations}
                type="submit"
              >
                {editingPurchaseItem ? (
                  <Edit3 size={17} aria-hidden="true" />
                ) : (
                  <PackagePlus size={17} aria-hidden="true" />
                )}
                {editingPurchaseItem ? "Update item" : "Create item"}
              </button>
              <button
                className="secondary-action"
                disabled={loading}
                onClick={onCancelPurchaseItemEdit}
                type="button"
              >
                <X size={17} aria-hidden="true" />
                Cancel
              </button>
            </div>
          </form>
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
                    .map((purchaseItem) => (
                      <tr key={purchaseItem.id}>
                        <td>#{purchaseItem.id}</td>
                        <td>{purchaseItem.purchase?.supplier?.name}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <ClipboardList
                              size={18}
                              className="text-muted"
                              aria-hidden="true"
                            />
                            <div>
                              <strong>
                                {purchaseItem.product?.name ??
                                  purchaseItem.product_id}
                              </strong>
                              <span>
                                {purchaseItem.product?.reference.slice(0, 15) ??
                                  "No reference"}
                              </span>
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
