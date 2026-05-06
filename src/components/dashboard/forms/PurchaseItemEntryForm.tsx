import { FormEvent } from 'react';
import { Edit3, PackagePlus, X } from 'lucide-react';
import type { Product, Purchase, PurchaseItem, PurchaseItemFormValues } from '../../../types';

type PurchaseItemEntryFormProps = {
  editingPurchaseItem: PurchaseItem | null;
  form: PurchaseItemFormValues;
  loading: boolean;
  missingItemRelations: boolean;
  products: Product[];
  purchases: Purchase[];
  purchaseProducts: Product[];
  selectedPurchase: Purchase | undefined;
  onCancelEdit: () => void;
  onChange: (form: PurchaseItemFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function purchaseLabel(purchase: Purchase) {
  return `#${purchase.id} - ${purchase.supplier?.name ?? `Supplier ${purchase.supplier_id}`}`;
}

export function PurchaseItemEntryForm({
  editingPurchaseItem,
  form,
  loading,
  missingItemRelations,
  products,
  purchases,
  purchaseProducts,
  selectedPurchase,
  onCancelEdit,
  onChange,
  onSubmit,
}: PurchaseItemEntryFormProps) {
  const missingPurchaseProducts = Boolean(selectedPurchase) && purchaseProducts.length === 0;

  return (
    <form className="manager-form purchase-item-form fade-in" onSubmit={onSubmit}>
      <label>
        Purchase
        <select
          value={form.purchase_id}
          onChange={(event) => {
            const nextPurchase = purchases.find((purchase) => purchase.id === Number(event.target.value));
            const currentProduct = products.find((product) => product.id === Number(form.product_id));
            const keepProduct = nextPurchase && currentProduct && currentProduct.supplier_id === nextPurchase.supplier_id;

            onChange({
              ...form,
              purchase_id: event.target.value,
              product_id: keepProduct ? form.product_id : '',
              price: keepProduct ? form.price : '',
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
          value={form.product_id}
          onChange={(event) => {
            const product = products.find((item) => item.id === Number(event.target.value));
            onChange({
              ...form,
              product_id: event.target.value,
              price: product ? String(product.price) : form.price,
            });
          }}
          disabled={!selectedPurchase}
          required
        >
          <option value="">{selectedPurchase ? 'Select product' : 'Select purchase first'}</option>
          {purchaseProducts.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>
      {missingPurchaseProducts && <p className="helper-note full-field">No products found for this purchase supplier.</p>}
      <label>
        Price
        <input min="0" step="0.01" type="number" value={form.price} onChange={(event) => onChange({ ...form, price: event.target.value })} required />
      </label>
      <label>
        Quantity
        <input min="1" type="number" value={form.quantity} onChange={(event) => onChange({ ...form, quantity: event.target.value })} required />
      </label>
      <div className="form-actions full-field">
        <button className="primary-action" disabled={loading || missingItemRelations} type="submit">
          {editingPurchaseItem ? <Edit3 size={17} aria-hidden="true" /> : <PackagePlus size={17} aria-hidden="true" />}
          {editingPurchaseItem ? 'Update item' : 'Create item'}
        </button>
        <button className="secondary-action" disabled={loading} onClick={onCancelEdit} type="button">
          <X size={17} aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}
