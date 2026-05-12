import { FormEvent } from "react";
import {
  Edit3,
  Eye,
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
import { PurchaseDetails } from "./PurchaseDetails";
import { usePagination } from "./hooks/usePagination";
import { PaginationControls } from "./PaginationControls";
import { Can } from "../../context/PermissionContext";

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
  viewingPurchase: Purchase | null;
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
  onSetViewingPurchase: (purchase: Purchase | null) => void;
  onCreateSupplier?: () => void;
  onTabChange?: (tab: string) => void;
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
  viewingPurchase,
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
  onSetViewingPurchase,
  onCreateSupplier,
  onTabChange,
}: PurchaseManagerProps) {
  const showPurchaseForm = isAddingPurchase || editingPurchase !== null;
  const showItemForm = editingPurchaseItem !== null;
  const missingPurchaseRelations = suppliers.length === 0;
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(purchases);
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

  const handleCreateSupplier = () => {
    onTabChange?.("suppliers");
    onCreateSupplier?.();
  };
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
              <Can permission="create_purchases">
                <button
                  className="primary-action"
                  onClick={onAddPurchase}
                  type="button"
                >
                  <Plus size={17} /> Add purchase
                </button>
              </Can>
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
            onCreateSupplier={handleCreateSupplier}
          />
        ) : (
          <>
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
                  [...paginatedData]
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
                              aria-label={`View purchase ${purchase.id}`}
                              disabled={loading}
                              onClick={() => onSetViewingPurchase(purchase)}
                              type="button"
                            >
                              <Eye size={16} aria-hidden="true" />
                            </button>
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

      {showItemForm && (
        <section className="admin-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Edit Purchase Item</p>
              <h2>Item Details</h2>
            </div>
          </div>

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
        </section>
      )}

      {viewingPurchase && (
        <PurchaseDetails
          purchase={viewingPurchase}
          purchaseItems={purchaseItems}
          products={products}
          suppliers={suppliers}
          loading={loading}
          onClose={() => onSetViewingPurchase(null)}
          onEdit={onEditPurchase}
          onDelete={onDeletePurchase}
          onEditItem={onEditPurchaseItem}
          onDeleteItem={onDeletePurchaseItem}
        />
      )}
    </div>
  );
}
