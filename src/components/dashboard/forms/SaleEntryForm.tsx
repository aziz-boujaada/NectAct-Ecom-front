import { FormEvent } from 'react';
import { Edit3, Plus, X } from 'lucide-react';
import type { Client, Sale, SaleFormValues } from '../../../types';

type SaleEntryFormProps = {
  clients: Client[];
  editingSale: Sale | null;
  form: SaleFormValues;
  loading: boolean;
  missingRelations: boolean;
  onCancelEdit: () => void;
  onChange: (form: SaleFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function SaleEntryForm({
  clients,
  editingSale,
  form,
  loading,
  missingRelations,
  onCancelEdit,
  onChange,
  onSubmit,
}: SaleEntryFormProps) {
  return (
    <form className="manager-form purchase-form fade-in" onSubmit={onSubmit}>
      <label>
        Client
        <select value={form.client_id} onChange={(event) => onChange({ ...form, client_id: event.target.value })} required>
          <option value="">Select client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select
          value={form.status}
          onChange={(event) => onChange({ ...form, status: event.target.value as SaleFormValues['status'] })}
          required
        >
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
      </label>
      <div className="form-actions full-field">
        <button className="primary-action" disabled={loading || missingRelations} type="submit">
          {editingSale ? <Edit3 size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
          {editingSale ? 'Update sale' : 'Create sale'}
        </button>
        <button className="secondary-action" disabled={loading} onClick={onCancelEdit} type="button">
          <X size={17} aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}
