import { FormEvent } from 'react';
import { Building2, Edit3, Plus, Trash2, Users } from 'lucide-react';
import type { ContactFormValues } from '../../types';
import { ContactForm } from './forms/ContactForm';
import { usePagination } from './hooks/usePagination';
import { PaginationControls } from './PaginationControls';
import { Can } from "../../context/PermissionContext";


type Contact = {
  id: number;
  name: string;
  phone?: string | null;
  address?: string | null;
};

type ContactManagerProps<TContact extends Contact> = {
  eyebrow: string;
  title: string;
  icon: 'building' | 'users';
  createLabel: string;
  updateLabel: string;
  emptyText: string;
  contacts: TContact[];
  editingContact: TContact | null;
  form: ContactFormValues;
  loading: boolean;
  isAdding: boolean;
  createPermission?: string;
  editPermission?: string;
  deletePermission?: string;
  onAdd: () => void;
  onCancelEdit: () => void;
  onChange: (form: ContactFormValues) => void;
  onDelete: (contact: TContact) => void;
  onEdit: (contact: TContact) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function ContactManager<TContact extends Contact>({
  eyebrow,
  title,
  icon,
  createLabel,
  updateLabel,
  emptyText,
  contacts,
  editingContact,
  form,
  loading,
  isAdding,
  createPermission,
  editPermission,
  deletePermission,
  onAdd,
  onCancelEdit,
  onChange,
  onDelete,
  onEdit,
  onSubmit,
}: ContactManagerProps<TContact>) {
  const showForm = isAdding || editingContact !== null;
  const { paginatedData, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(contacts);

  return (
    <section className="admin-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>{contacts.length} total</span>
          {!showForm && (
            <Can permission={createPermission || []}>
              <button className="primary-action" onClick={onAdd} type="button">
                <Plus size={17} /> {createLabel}
              </button>
            </Can>
          )}
        </div>
      </div>

      {showForm ? (
        <ContactForm
          createLabel={createLabel}
          hasEditingContact={editingContact !== null}
          form={form}
          loading={loading}
          updateLabel={updateLabel}
          onCancelEdit={onCancelEdit}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      ) : (
        <>
          <div className="table-wrap fade-in">
            <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={3}>{emptyText}</td>
                </tr>
              ) : (
                [...paginatedData].sort((a, b) => b.id - a.id).map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {icon === 'building' ? (
                          <Building2 size={18} className="text-muted" aria-hidden="true" />
                        ) : (
                          <Users size={18} className="text-muted" aria-hidden="true" />
                        )}
                        <strong>{contact.name}</strong>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{contact.phone || 'No phone'}</span>
                        <br />
                        <span className="text-muted">{contact.address || 'No address'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="row-actions">
                        <Can permission={editPermission || []}>
                          <button aria-label={`Edit ${contact.name}`} disabled={loading} onClick={() => onEdit(contact)} type="button">
                            <Edit3 size={16} aria-hidden="true" />
                          </button>
                        </Can>
                        <Can permission={deletePermission || []}>
                          <button
                            aria-label={`Delete ${contact.name}`}
                            className="danger-action"
                            disabled={loading}
                            onClick={() => onDelete(contact)}
                            type="button"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </Can>
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
  );
}

