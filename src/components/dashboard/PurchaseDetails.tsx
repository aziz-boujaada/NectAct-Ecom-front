import { X, Edit3, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Product, Purchase, PurchaseItem, Supplier } from '../../types';
import { PurchaseInvoice } from './PurchaseInvoice';

type PurchaseDetailsProps = {
  purchase: Purchase;
  purchaseItems: PurchaseItem[];
  products: Product[];
  suppliers: Supplier[];
  loading: boolean;
  onClose: () => void;
  onEdit: (purchase: Purchase) => void;
  onDelete: (purchase: Purchase) => void;
  onEditItem: (item: PurchaseItem) => void;
  onDeleteItem: (item: PurchaseItem) => void;
};

export function PurchaseDetails({
  purchase,
  purchaseItems,
  products,
  suppliers,
  loading,
  onClose,
  onEdit,
  onDelete,
  onEditItem,
  onDeleteItem,
}: PurchaseDetailsProps) {
  const { t } = useTranslation(['purchasing', 'common']);
  const supplier = suppliers.find((s) => s.id === purchase.supplier_id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{t('purchasing:purchase_details')} #{purchase.id}</h2>
            <p className="text-muted">{t('purchasing:details_and_items')}</p>
          </div>
          <button
            aria-label={t('common:common.cancel')}
            className="secondary-action"
            onClick={onClose}
            type="button"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <PurchaseInvoice
            purchase={purchase}
            purchaseItems={purchaseItems}
            products={products}
            loading={loading}
            onDeleteItem={onDeleteItem}
            onEditItem={onEditItem}
            supplierName={supplier?.name}
          />
        </div>

        <div className="modal-footer">
          <button
            className="secondary-action"
            disabled={loading}
            onClick={onClose}
            type="button"
          >
            {t('common:common.cancel')}
          </button>
          <button
            className="primary-action"
            disabled={loading}
            onClick={() => onEdit(purchase)}
            type="button"
          >
            <Edit3 size={17} aria-hidden="true" />
            {t('purchasing:edit_purchase')}
          </button>
          <button
            className="danger-action"
            disabled={loading}
            onClick={() => onDelete(purchase)}
            type="button"
          >
            <Trash2 size={17} aria-hidden="true" />
            {t('common:common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
