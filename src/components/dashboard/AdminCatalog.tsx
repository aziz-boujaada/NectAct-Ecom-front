import { RefreshCw } from "lucide-react";
import { StatusMessage } from "../StatusMessage";
import { CategoryManager } from "./CategoryManager";
import { ContactManager } from "./ContactManager";
import { ProductManager } from "./ProductManager";
import { PurchaseManager } from "./PurchaseManager";
import { RefundManager } from "./RefundManager";
import { SaleManager } from "./SaleManager";
import { useAdminCatalog } from "./useAdminCatalog";
import StockMovements from "./StockHistory";

type AdminCatalogProps = {
  activeTab:
    | "categories"
    | "products"
    | "purchases"
    | "sales"
    | "refunds"
    | "suppliers"
    | "clients"
    | "stock";
  onTabChange?: (tab: AdminCatalogProps["activeTab"]) => void;
};

const titles: Record<AdminCatalogProps["activeTab"], string> = {
  categories: "Categories",
  products: "Products",
  purchases: "Purchases",
  sales: "Sales",
  refunds: "Refunds",
  suppliers: "Suppliers",
  clients: "Clients",
  stock: "Stock",
};

export function AdminCatalog({ activeTab, onTabChange }: AdminCatalogProps) {
  const catalog = useAdminCatalog();

  return (
    <div className="admin-dashboard">
      <div className="admin-titlebar">
        <div>
          <p className="eyebrow">Catalog Management</p>
          <h2>{titles[activeTab]}</h2>
        </div>
        <button
          className="secondary-action"
          disabled={catalog.loading}
          onClick={() => void catalog.loadCatalog()}
          type="button"
        >
          <RefreshCw size={17} aria-hidden="true" />
          Reload
        </button>
      </div>

      <StatusMessage status={catalog.status} />

      <div className="admin-grid fade-in" key={activeTab}>
        {activeTab === "categories" && (
          <CategoryManager
            categories={catalog.categories}
            editingCategory={catalog.editingCategory}
            form={catalog.categoryForm}
            loading={catalog.loading}
            isAdding={catalog.isAddingCategory}
            onAdd={catalog.startAddingCategory}
            onCancelEdit={catalog.cancelCategoryEdit}
            onChange={catalog.setCategoryForm}
            onDelete={catalog.handleDeleteCategory}
            onEdit={catalog.editCategory}
            onSubmit={catalog.handleCategorySubmit}
          />
        )}

        {activeTab === "products" && (
          <ProductManager
            categories={catalog.categories}
            editingProduct={catalog.editingProduct}
            form={catalog.productForm}
            loading={catalog.loading}
            products={catalog.products}
            suppliers={catalog.suppliers}
            isAdding={catalog.isAddingProduct}
            onAdd={catalog.startAddingProduct}
            onCancelEdit={catalog.cancelProductEdit}
            onChange={catalog.setProductForm}
            onDelete={catalog.handleDeleteProduct}
            onEdit={catalog.editProduct}
            onSubmit={catalog.handleProductSubmit}
            onCreateCategory={catalog.startAddingCategory}
            onCreateSupplier={catalog.startAddingSupplier}
            onTabChange={onTabChange}
          />
        )}

        {activeTab === "purchases" && (
          <PurchaseManager
            editingPurchase={catalog.editingPurchase}
            editingPurchaseItem={catalog.editingPurchaseItem}
            isAddingPurchase={catalog.isAddingPurchase}
            loading={catalog.loading}
            products={catalog.products}
            purchaseForm={catalog.purchaseForm}
            purchaseItemForm={catalog.purchaseItemForm}
            purchaseItemDrafts={catalog.purchaseItemDrafts}
            purchaseItems={catalog.purchaseItems}
            purchases={catalog.purchases}
            suppliers={catalog.suppliers}
            viewingPurchase={catalog.viewingPurchase}
            onAddPurchase={catalog.startAddingPurchase}
            onCancelPurchaseEdit={catalog.cancelPurchaseEdit}
            onCancelPurchaseItemEdit={catalog.cancelPurchaseItemEdit}
            onChangePurchase={catalog.handlePurchaseChange}
            onChangePurchaseItem={catalog.setPurchaseItemForm}
            onChangePurchaseItemDraft={catalog.updatePurchaseItemDraft}
            onDeletePurchase={catalog.handleDeletePurchase}
            onDeletePurchaseItem={catalog.handleDeletePurchaseItem}
            onEditPurchase={catalog.editPurchase}
            onEditPurchaseItem={catalog.editPurchaseItem}
            onAddPurchaseItemDraft={catalog.addPurchaseItemDraft}
            onRemovePurchaseItemDraft={catalog.removePurchaseItemDraft}
            onSubmitPurchase={catalog.handlePurchaseSubmit}
            onSubmitPurchaseItem={catalog.handlePurchaseItemSubmit}
            onSetViewingPurchase={catalog.setViewingPurchase}
            onCreateSupplier={catalog.startAddingSupplier}
            onTabChange={onTabChange}
          />
        )}

        {activeTab === "sales" && (
          <SaleManager
            clients={catalog.clients}
            editingSale={catalog.editingSale}
            isAddingSale={catalog.isAddingSale}
            loading={catalog.loading}
            products={catalog.products}
            saleForm={catalog.saleForm}
            saleItemDrafts={catalog.saleItemDrafts}
            saleItems={catalog.saleItems}
            sales={catalog.sales}
            viewingSale={catalog.viewingSale}
            onAddSale={catalog.startAddingSale}
            onCancelSaleEdit={catalog.cancelSaleEdit}
            onChangeSale={catalog.setSaleForm}
            onDeleteSale={catalog.handleDeleteSale}
            onDeleteSaleItem={catalog.handleDeleteSaleItem}
            onEditSale={catalog.editSale}
            onSubmitSale={catalog.handleSaleSubmit}
            onAddSaleItemDraft={catalog.addSaleItemDraft}
            onChangeSaleItemDraft={catalog.updateSaleItemDraft}
            onRemoveSaleItemDraft={catalog.removeSaleItemDraft}
            onSetViewingSale={catalog.setViewingSale}
            onCreateClient={catalog.startAddingClient}
            onCreateProduct={catalog.startAddingProduct}
            onTabChange={onTabChange}
          />
        )}

        {activeTab === "refunds" && (
          <RefundManager
            isAddingRefund={catalog.isAddingRefund}
            loading={catalog.loading}
            refundForm={catalog.refundForm}
            refunds={catalog.refunds}
            sales={catalog.sales}
            viewingRefund={catalog.viewingRefund}
            onAddRefund={catalog.startAddingRefund}
            onCancelRefundEdit={catalog.cancelRefundEdit}
            onChangeRefund={catalog.setRefundForm}
            onDeleteRefund={catalog.handleDeleteRefund}
            onSubmitRefund={catalog.handleRefundSubmit}
            onSetViewingRefund={catalog.setViewingRefund}
          />
        )}

        {activeTab === "suppliers" && (
          <ContactManager
            contacts={catalog.suppliers}
            createLabel="Create supplier"
            editingContact={catalog.editingSupplier}
            emptyText="No suppliers found."
            eyebrow="Purchasing"
            form={catalog.supplierForm}
            loading={catalog.loading}
            title="Suppliers"
            icon="building"
            updateLabel="Update supplier"
            isAdding={catalog.isAddingSupplier}
            createPermission="create_suppliers"
            editPermission="edit_suppliers"
            deletePermission="delete_suppliers"
            onAdd={catalog.startAddingSupplier}
            onCancelEdit={catalog.cancelSupplierEdit}
            onChange={catalog.setSupplierForm}
            onDelete={catalog.handleDeleteSupplier}
            onEdit={catalog.editSupplier}
            onSubmit={catalog.handleSupplierSubmit}
          />
        )}

        {activeTab === "clients" && (
          <ContactManager
            contacts={catalog.clients}
            createLabel="Create client"
            editingContact={catalog.editingClient}
            emptyText="No clients found."
            eyebrow="Sales"
            form={catalog.clientForm}
            loading={catalog.loading}
            title="Clients"
            icon="users"
            updateLabel="Update client"
            isAdding={catalog.isAddingClient}
            createPermission="create_clients"
            editPermission="edit_clients"
            deletePermission="delete_clients"
            onAdd={catalog.startAddingClient}
            onCancelEdit={catalog.cancelClientEdit}
            onChange={catalog.setClientForm}
            onDelete={catalog.handleDeleteClient}
            onEdit={catalog.editClient}
            onSubmit={catalog.handleClientSubmit}
          />
        )}

        {activeTab === "stock" && (
          <div className="admin-section fade-in">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Inventory</p>
                <h2>Stock Movements</h2>
              </div>
            </div>

            <StockMovements />
          </div>
        )}
      </div>
    </div>
  );
}
