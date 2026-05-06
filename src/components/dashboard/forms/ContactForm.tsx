import { FormEvent } from 'react';
import { Edit3, Plus, X } from 'lucide-react';
import type { ContactFormValues } from '../../../types';

type ContactFormProps = {
  createLabel: string;
  hasEditingContact: boolean;
  form: ContactFormValues;
  loading: boolean;
  updateLabel: string;
  onCancelEdit: () => void;
  onChange: (form: ContactFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ContactForm({
  createLabel,
  hasEditingContact,
  form,
  loading,
  updateLabel,
  onCancelEdit,
  onChange,
  onSubmit,
}: ContactFormProps) {
  return (
    <form className="manager-form contact-form fade-in" onSubmit={onSubmit}>
      <label>
        Name
        <input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} required />
      </label>
      <label>
        Phone
        <input value={form.phone} onChange={(event) => onChange({ ...form, phone: event.target.value })} />
      </label>
      <label className="full-field">
        Address
        <textarea value={form.address} onChange={(event) => onChange({ ...form, address: event.target.value })} rows={3} />
      </label>
      <div className="form-actions full-field">
        <button className="primary-action" disabled={loading} type="submit">
          {hasEditingContact ? <Edit3 size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
          {hasEditingContact ? updateLabel : createLabel}
        </button>
        <button className="secondary-action" disabled={loading} onClick={onCancelEdit} type="button">
          <X size={17} aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}
