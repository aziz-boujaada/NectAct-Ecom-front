import { FormEvent } from 'react';
import { Edit3, Eye, Plus, ReceiptText, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Client, Devis, DevisFormValues, DevisItemDraftValues, Product } from '../../types';
import { DevisEntryForm } from './forms/DevisEntryForm';
import { DevisDetails } from './DevisDetails';
import { PaginationControls } from './PaginationControls';
import { formatCurrency } from '../../utils/currency';

type DevisManagerProps = {
  editingDevis: Devis | null;
  isAddingDevis: boolean;
  loading: boolean;
  clients: Client[];
  products: Product[];
  devisForm: DevisFormValues;
  devisItemDrafts: DevisItemDraftValues[];
  devises: Devis[];
  viewingDevis: Devis | null;
  currentPage: number;
  totalPages: number;
  onAddDevis: () => void;
  onCancelDevisEdit: () => void;
  onChangeDevis: (form: DevisFormValues) => void;
  onDeleteDevis: (devis: Devis) => void;
  onEditDevis: (devis: Devis) => void;
  onSubmitDevis: (event: FormEvent<HTMLFormElement>) => void;
  onAddDevisItemDraft: () => void;
  onChangeDevisItemDraft: (index: number, field: keyof DevisItemDraftValues, value: string) => void;
  onRemoveDevisItemDraft: (index: number) => void;
  onSetViewingDevis: (devis: Devis | null) => void;
  onViewDevis: (devis: Devis) => void;
  onSendDevis: (devis: Devis) => void;
  onAcceptDevis: (devis: Devis) => void;
  onRejectDevis: (devis: Devis) => void;
  onConvertDevis: (devis: Devis) => void;
  onExportPdf: (devis: Devis) => void;
  onCreateClient?: () => void;
  onCreateProduct?: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onGoToPage: (page: number) => void;
};

export function DevisManager({
  editingDevis,
  isAddingDevis,
  loading,
  clients,
  products,
  devisForm,
  devisItemDrafts,
  devises,
  viewingDevis,
  currentPage,
  totalPages,
  onAddDevis,
  onCancelDevisEdit,
  onChangeDevis,
  onDeleteDevis,
  onEditDevis,
  onSubmitDevis,
  onAddDevisItemDraft,
  onChangeDevisItemDraft,
  onRemoveDevisItemDraft,
  onSetViewingDevis,
  onViewDevis,
  onSendDevis,
  onAcceptDevis,
  onRejectDevis,
  onConvertDevis,
  onExportPdf,
  onCreateClient,
  onCreateProduct,
  onNextPage,
  onPreviousPage,
  onGoToPage,
}: DevisManagerProps) {
  const { t, i18n } = useTranslation('devis');
  const showDevisForm = isAddingDevis || editingDevis !== null;
  const missingRelations = clients.length === 0 || products.length === 0;

  const formatDate = (date?: string | null) => {
    if (!date) return t('not_set');
    return new Date(date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'fr' ? 'fr-FR' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateClient = () => {
    onCreateClient?.();
  };

  const handleCreateProduct = () => {
    onCreateProduct?.();
  };
  const devisList = Array.isArray(devises) ? devises : [];

  return (
    <div className="purchase-workspace">
      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t('title')}</p>
            <h2>{t('devis')}</h2>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>{devisList.length} {t('total')}</span>
            {!showDevisForm && (
              <button className="primary-action" onClick={onAddDevis} type="button">
                <Plus size={17} /> {t('add_devis')}
              </button>
            )}
          </div>
        </div>

        <div className="detail-grid" style={{ marginBottom: '16px' }}>
          <div className="detail-item">
            <span className="label">{t('current_page')}</span>
            <span className="value">{currentPage} / {totalPages}</span>
          </div>
        </div>

        {missingRelations && showDevisForm && (
          <p className="helper-note">{t('helper_create_devis')}</p>
        )}

        {showDevisForm ? (
          <DevisEntryForm
            clients={clients}
            editingDevis={editingDevis}
            form={devisForm}
            items={devisItemDrafts}
            products={products}
            loading={loading}
            missingRelations={missingRelations}
            onAddItem={onAddDevisItemDraft}
            onCancelEdit={onCancelDevisEdit}
            onChange={onChangeDevis}
            onChangeItem={onChangeDevisItemDraft}
            onRemoveItem={onRemoveDevisItemDraft}
            onSubmit={onSubmitDevis}
            onCreateClient={handleCreateClient}
            onCreateProduct={handleCreateProduct}
          />
        ) : (
          <>
            <div className="table-wrap fade-in">
              <table>
                <thead>
                  <tr>
                    <th>{t('reference')}</th>
                    <th>{t('client')}</th>
                    <th>{t('status')}</th>
                    <th>{t('total')}</th>
                    <th>{t('expires')}</th>
                    <th>{t('created')}</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {devisList.length === 0 ? (
                    <tr>
                      <td colSpan={7}>{t('no_devis_found')}</td>
                    </tr>
                  ) : (
                    [...devisList]
                      .sort((a, b) => b.id - a.id)
                      .map((devis) => (
                      <tr key={devis.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ReceiptText size={18} className="text-muted" aria-hidden="true" />
                            <strong>{devis.reference}</strong>
                          </div>
                        </td>
                        <td>{devis.client?.name ?? `${t('client')} ${devis.client_id}`}</td>
                        <td><span className={`status-pill ${devis.status}`}>{t(`status_labels.${devis.status}`, { defaultValue: devis.status })}</span></td>
                        <td>{formatCurrency(devis.total)}</td>
                        <td>{formatDate(devis.expires_at)}</td>
                        <td>{formatDate(devis.created_at)}</td>
                        <td>
                          <div className="row-actions">
                            <button aria-label={`${t('view_devis')} ${devis.id}`} disabled={loading} onClick={() => onViewDevis(devis)} type="button">
                              <Eye size={16} aria-hidden="true" />
                            </button>
                            {devis.status !== 'accepted' && devis.status !== 'rejected' && (
                              <button aria-label={`${t('edit_devis')} ${devis.id}`} disabled={loading} onClick={() => onEditDevis(devis)} type="button">
                                <Edit3 size={16} aria-hidden="true" />
                              </button>
                            )}
                            <button aria-label={`${t('delete_devis')} ${devis.id}`} className="danger-action" disabled={loading} onClick={() => onDeleteDevis(devis)} type="button">
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
              onPrevious={onPreviousPage}
              onNext={onNextPage}
              onPageChange={onGoToPage}
            />
          </>
        )}
      </section>

      {viewingDevis && (
        <DevisDetails
          devis={viewingDevis}
          loading={loading}
          onClose={() => onSetViewingDevis(null)}
          onEdit={onEditDevis}
          onDelete={onDeleteDevis}
          onSend={onSendDevis}
          onAccept={onAcceptDevis}
          onReject={onRejectDevis}
          onConvert={onConvertDevis}
          onExportPdf={onExportPdf}
        />
      )}
    </div>
  );
}
