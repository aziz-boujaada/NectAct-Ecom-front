import React from 'react';
import { SaleManager } from '../../components/dashboard/SaleManager';
import { ContactManager } from '../../components/dashboard/ContactManager';
import { RefundManager } from '../../components/dashboard/RefundManager';
import { SubViewType } from '../../components/layout/Sidebar';

interface SalesModuleProps {
  activeView: SubViewType;
  catalog: any;
  onTabChange?: (tab: any) => void;
}

export const SalesModule: React.FC<SalesModuleProps> = ({ activeView, catalog, onTabChange }) => {
  return (
    <div className="fade-in">
      {activeView === 'sales-list' && (
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

      {activeView === 'clients' && (
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

      {activeView === 'refunds' && (
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
    </div>
  );
};
