import React from 'react';
import { DevisManager } from '../../components/dashboard/DevisManager';
import { SubViewType } from '../../components/layout/Sidebar';

interface DevisModuleProps {
  activeView: SubViewType;
  catalog: any;
  onTabChange?: (tab: any) => void;
}

export const DevisModule: React.FC<DevisModuleProps> = ({ activeView, catalog, onTabChange }) => {
  const handleCreateClient = () => {
    onTabChange?.('clients');
    catalog.startAddingClient?.();
  };

  const handleCreateProduct = () => {
    onTabChange?.('products');
    catalog.startAddingProduct?.();
  };

  return (
    <div className="fade-in">
      {activeView === 'devis-list' && (
        <DevisManager
          editingDevis={catalog.editingDevis}
          isAddingDevis={catalog.isAddingDevis}
          loading={catalog.loading}
          clients={catalog.clients}
          products={catalog.products}
          devisForm={catalog.devisForm}
          devisItemDrafts={catalog.devisItemDrafts}
          devises={catalog.devises}
          viewingDevis={catalog.viewingDevis}
          currentPage={catalog.devisCurrentPage}
          totalPages={catalog.devisTotalPages}
          onAddDevis={catalog.startAddingDevis}
          onCancelDevisEdit={catalog.cancelDevisEdit}
          onChangeDevis={catalog.setDevisForm}
          onDeleteDevis={catalog.handleDeleteDevis}
          onEditDevis={catalog.editDevis}
          onSubmitDevis={catalog.handleDevisSubmit}
          onAddDevisItemDraft={catalog.addDevisItemDraft}
          onChangeDevisItemDraft={catalog.updateDevisItemDraft}
          onRemoveDevisItemDraft={catalog.removeDevisItemDraft}
          onSetViewingDevis={catalog.setViewingDevis}
          onViewDevis={catalog.viewDevis}
          onSendDevis={catalog.handleSendDevis}
          onAcceptDevis={catalog.handleAcceptDevis}
          onRejectDevis={catalog.handleRejectDevis}
          onConvertDevis={catalog.handleConvertDevis}
          onExportPdf={catalog.handleExportPdf}
          onCreateClient={handleCreateClient}
          onCreateProduct={handleCreateProduct}
          onNextPage={catalog.nextDevisPage}
          onPreviousPage={catalog.previousDevisPage}
          onGoToPage={catalog.goToDevisPage}
        />
      )}
    </div>
  );
};
