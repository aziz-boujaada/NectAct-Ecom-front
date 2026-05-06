import { FormEvent } from 'react';
import { Edit3, Plus, X } from 'lucide-react';
import type { Purchase, PurchaseFormValues, Supplier } from '../../../types';

type PurchaseEntryFormProps = {
  editingPurchase: Purchase | null;
  form: PurchaseFormValues;
  loading: boolean;
  missingRelations: boolean;
  suppliers: Supplier[];
  onCancelEdit: () => void;
  onChange: (form: PurchaseFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function PurchaseEntryForm({
  editingPurchase,
  form,
  loading,
  missingRelations,
  suppliers,
  onCancelEdit,
  onChange,
  onSubmit,
}: PurchaseEntryFormProps) {
  return (
    <form className="manager-form purchase-form fade-in" onSubmit={onSubmit}>
      <label>
        Supplier
        <select value={form.supplier_id} onChange={(event) => onChange({ ...form, supplier_id: event.target.value })} required>
          <option value="">Select supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value as PurchaseFormValues['status'] })}
          required
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
        </select>
      </label>
      <div className="form-actions full-field">
        <button className="primary-action" disabled={loading || missingRelations} type="submit">
          {editingPurchase ? <Edit3 size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
          {editingPurchase ? 'Update purchase' : 'Create purchase'}
        </button>
        <button className="secondary-action" disabled={loading} onClick={onCancelEdit} type="button">
          <X size={17} aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}
