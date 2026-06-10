import { Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Client, Product, Sale, SaleItem } from '../../types';
import { SaleInvoice } from './SaleInvoice';

type SaleDetailsProps = {
  sale: Sale;
  saleItems: SaleItem[];
  products: Product[];
  clients: Client[];
  loading: boolean;
  onClose: () => void;
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
  onDeleteItem: (item: SaleItem) => void;
};

export function SaleDetails({
  sale,
  saleItems,
  products,
  clients,
  loading,
  onClose,
  onEdit,
  onDelete,
  onDeleteItem,
}: SaleDetailsProps) {
  const { t } = useTranslation(['sales', 'common']);
  const client = clients.find((entry) => entry.id === sale.client_id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content sale-details-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{t('invoice title')} #{sale.id}</h2>
            <p className="text-muted">{t('invoice view actions')}</p>
          </div>
          <button aria-label={t('common:common.cancel')} className="secondary-action" onClick={onClose} type="button">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <SaleInvoice
            clientName={client?.name}
            loading={loading}
            onDeleteItem={onDeleteItem}
            products={products}
            sale={sale}
            saleItems={saleItems}
          />
        </div>

        <div className="modal-footer">
          <button className="secondary-action" disabled={loading} onClick={onClose} type="button">
            {t('common:common.cancel')}
          </button>
          <button className="primary-action" disabled={loading} onClick={() => onEdit(sale)} type="button">
            {t('edit sale')}
          </button>
          <button className="danger-action" disabled={loading} onClick={() => onDelete(sale)} type="button">
            <Trash2 size={17} aria-hidden="true" />
            {t('common:common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}