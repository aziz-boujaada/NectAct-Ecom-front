import { FormEvent } from 'react';
import { Edit3, Eye, Plus, ReceiptText, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Client, Product, Sale, SaleFormValues, SaleItem, SaleItemDraftValues } from '../../types';
import { SaleEntryForm } from './forms/SaleEntryForm';
import { SaleDetails } from './SaleDetails';
import { usePagination } from './hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { Can } from '../../context/PermissionContext';
import { formatCurrency } from '../../utils/currency';

type SaleManagerProps = {
  editingSale: Sale | null;
  isAddingSale: boolean;
  loading: boolean;
  clients: Client[];
  products: Product[];
  saleForm: SaleFormValues;
  saleItemDrafts: SaleItemDraftValues[];
  saleItems: SaleItem[];
  sales: Sale[];
  viewingSale: Sale | null;
  onAddSale: () => void;
  onCancelSaleEdit: () => void;
  onChangeSale: (form: SaleFormValues) => void;
  onDeleteSale: (sale: Sale) => void;
  onDeleteSaleItem: (saleItem: SaleItem) => void;
  onEditSale: (sale: Sale) => void;
  onSubmitSale: (event: FormEvent<HTMLFormElement>) => void;
  onAddSaleItemDraft: () => void;
  onChangeSaleItemDraft: (index: number, field: keyof SaleItemDraftValues, value: string) => void;
  onRemoveSaleItemDraft: (index: number) => void;
  onSetViewingSale: (sale: Sale | null) => void;
  onCreateClient?: () => void;
  onCreateProduct?: () => void;
  onTabChange?: (tab: string) => void;
};

export function SaleManager({
  editingSale,
  isAddingSale,
  loading,
  clients,
  products,
  saleForm,
  saleItemDrafts,
  saleItems,
  sales,
  viewingSale,
  onAddSale,
  onCancelSaleEdit,
  onChangeSale,
  onDeleteSale,
  onDeleteSaleItem,
  onEditSale,
  onSubmitSale,
  onAddSaleItemDraft,
  onChangeSaleItemDraft,
  onRemoveSaleItemDraft,
  onSetViewingSale,
  onCreateClient,
  onCreateProduct,
  onTabChange,
}: SaleManagerProps) {
  const { t, i18n } = useTranslation(['sales', 'common']);
  const showSaleForm = isAddingSale || editingSale !== null;
  const missingSaleRelations = clients.length === 0;
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(sales);

  const formatDate = (date?: string) => {
    if (!date) return t('not set');

    return new Date(date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : i18n.language === 'fr' ? 'fr-FR' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateClient = () => {
    onTabChange?.("clients");
    onCreateClient?.();
  };

  const handleCreateProduct = () => {
    onTabChange?.("products");
    onCreateProduct?.();
  };

  return (
    <div className="purchase-workspace">
      <section className="admin-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t('title')}</p>
            <h2>{t('title')}</h2>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span>{sales.length} {t('common:common.total')}</span>
            {!showSaleForm && (
              <Can permission="create_sales">
                <button className="primary-action" onClick={onAddSale} type="button">
                  <Plus size={17} /> {t('add sale')}
                </button>
              </Can>
            )}
          </div>
        </div>

        {missingSaleRelations && showSaleForm && (
          <p className="helper-note">{t('helper create client')}</p>
        )}

        {showSaleForm ? (
          <SaleEntryForm
            clients={clients}
            editingSale={editingSale}
            form={saleForm}
            items={saleItemDrafts}
            products={products}
            loading={loading}
            missingRelations={missingSaleRelations}
            onAddItem={onAddSaleItemDraft}
            onCancelEdit={onCancelSaleEdit}
            onChange={onChangeSale}
            onChangeItem={onChangeSaleItemDraft}
            onRemoveItem={onRemoveSaleItemDraft}
            onSubmit={onSubmitSale}
            onCreateClient={handleCreateClient}
            onCreateProduct={handleCreateProduct}
          />
        ) : (
          <>
            <div className="table-wrap fade-in">
              <table>
              <thead>
                <tr>
                  <th>{t('common:common.id')}</th>
                  <th>{t('clients')}</th>
                  <th>{t('common:common.status')}</th>
                  <th>{t('common:common.total')}</th>
                  <th>{t('items count')}</th>
                  <th>{t('created at')}</th>
                  <th aria-label={t('common:common.actions')} />
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={7}>{t('no sales found')}</td>
                  </tr>
                ) : (
                  [...paginatedData]
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
                          <span className={`status-pill ${sale.status}`}>{t(`status.${sale.status}`)}</span>
                        </td>
                        <td>{formatCurrency(sale.total)}</td>
                        <td>{sale.items?.length ?? saleItems.filter((item) => item.sale_id === sale.id).length}</td>
                        <td>{formatDate(sale.created_at)}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              aria-label={`${t('view sale')} ${sale.id}`}
                              disabled={loading}
                              onClick={() => onSetViewingSale(sale)}
                              type="button"
                            >
                              <Eye size={16} aria-hidden="true" />
                            </button>
                            <button
                              aria-label={`${t('edit sale')} ${sale.id}`}
                              disabled={loading}
                              onClick={() => onEditSale(sale)}
                              type="button"
                            >
                              <Edit3 size={16} aria-hidden="true" />
                            </button>
                            <button
                              aria-label={`${t('delete sale')} ${sale.id}`}
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

      {viewingSale && (
        <SaleDetails
          loading={loading}
          products={products}
          sale={viewingSale}
          saleItems={saleItems}
          clients={clients}
          onClose={() => onSetViewingSale(null)}
          onEdit={onEditSale}
          onDelete={onDeleteSale}
          onDeleteItem={onDeleteSaleItem}
        />
      )}
    </div>
  );
}
