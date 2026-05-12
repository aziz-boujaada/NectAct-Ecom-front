import React from 'react';
import { PurchaseManager } from '../../components/dashboard/PurchaseManager';
import { ContactManager } from '../../components/dashboard/ContactManager';
import { SubViewType } from '../../components/layout/Sidebar';

interface PurchasingModuleProps {
  activeView: SubViewType;
  catalog: any;
  onTabChange?: (tab: any) => void;
}

export const PurchasingModule: React.FC<PurchasingModuleProps> = ({ activeView, catalog, onTabChange }) => {
  return (
    <div className="fade-in">
      {activeView === 'purchases-list' && (
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

      {activeView === 'suppliers' && (
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
    </div>
  );
};
