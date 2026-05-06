import { FormEvent, useState } from 'react';
import type { ContactFormValues, Status } from '../../../types';
import { emptyContactForm, formFromContact } from '../adminCatalogForms';
import { errorMessage } from './adminCatalogUtils';

type Contact = {
  id: number;
  name: string;
  phone?: string | null;
  address?: string | null;
};

type ContactManagementOptions<TContact extends Contact> = {
  entityName: string;
  createContact: (payload: ContactFormValues) => Promise<TContact | undefined>;
  updateContact: (id: number, payload: ContactFormValues) => Promise<TContact | undefined>;
  deleteContact: (id: number) => Promise<unknown>;
  setContacts: React.Dispatch<React.SetStateAction<TContact[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  afterCreate?: () => Promise<void>;
  afterUpdate?: () => Promise<void>;
  afterDelete?: (contact: TContact) => void | Promise<void>;
};

export function useContactManagement<TContact extends Contact>({
  entityName,
  createContact,
  updateContact,
  deleteContact,
  setContacts,
  setLoading,
  setStatus,
  afterCreate,
  afterUpdate,
  afterDelete,
}: ContactManagementOptions<TContact>) {
  const [contactForm, setContactForm] = useState(emptyContactForm);
  const [editingContact, setEditingContact] = useState<TContact | null>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const title = entityName[0].toUpperCase() + entityName.slice(1);

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (editingContact) {
        const contact = await updateContact(editingContact.id, contactForm);
        if (contact) {
          setContacts((current) => current.map((item) => (item.id === contact.id ? contact : item)));
        }
        setStatus({ type: 'success', text: `${title} updated successfully` });
        await afterUpdate?.();
      } else {
        const contact = await createContact(contactForm);
        if (contact) {
          setContacts((current) => [contact, ...current]);
        }
        setStatus({ type: 'success', text: `${title} created successfully` });
        await afterCreate?.();
      }

      setEditingContact(null);
      setContactForm(emptyContactForm);
      setIsAddingContact(false);
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteContact(contact: TContact) {
    if (!confirm(`Delete ${entityName} "${contact.name}"?`)) return;
    setLoading(true);
    setStatus(null);

    try {
      await deleteContact(contact.id);
      setContacts((current) => current.filter((item) => item.id !== contact.id));
      await afterDelete?.(contact);
      if (editingContact?.id === contact.id) {
        setEditingContact(null);
        setContactForm(emptyContactForm);
      }
      setStatus({ type: 'success', text: `${title} deleted successfully` });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  return {
    contactForm,
    editingContact,
    isAddingContact,
    setContactForm,
    handleContactSubmit,
    handleDeleteContact,
    startAddingContact: () => setIsAddingContact(true),
    cancelContactEdit: () => {
      setEditingContact(null);
      setContactForm(emptyContactForm);
      setIsAddingContact(false);
    },
    editContact: (contact: TContact) => {
      setEditingContact(contact);
      setContactForm(formFromContact(contact));
    },
  };
}
