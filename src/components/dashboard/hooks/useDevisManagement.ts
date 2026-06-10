import { FormEvent, useEffect, useState } from 'react';
import {
  acceptDevis,
  convertDevisToSale,
  createDevis,
  deleteDevis,
  generateDevisPdf,
  listDevises,
  rejectDevis,
  sendDevis,
  showDevis,
  normalizeDevisList,
  updateDevis,
} from '../../../api/devis';
import { useCompanySettings } from '../../../context/CompanySettingsContext';
import type { Client, Devis, DevisFormValues, DevisItemDraftValues, Product, Sale, SaleItem, Status } from '../../../types';
import { referenceSettingsFromCompanySettings } from '../../../utils/referenceSettings';
import { emptyDevisForm, emptyDevisItemDraft, formFromDevis } from '../adminCatalogForms';
import { errorMessage } from './adminCatalogUtils';

type UseDevisManagementOptions = {
  clients: Client[];
  products: Product[];
  setDevises: React.Dispatch<React.SetStateAction<Devis[]>>;
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  setSaleItems: React.Dispatch<React.SetStateAction<SaleItem[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  refreshSales: () => Promise<void>;
};

export function useDevisManagement({
  clients,
  products,
  setDevises,
  setSales,
  setSaleItems,
  setLoading,
  setStatus,
  refreshSales,
}: UseDevisManagementOptions) {
  const { companySettings } = useCompanySettings();
  const referenceSettings = referenceSettingsFromCompanySettings(companySettings);
  const [devisForm, setDevisForm] = useState<DevisFormValues>(emptyDevisForm);
  const [devisItemDrafts, setDevisItemDrafts] = useState<DevisItemDraftValues[]>([{ ...emptyDevisItemDraft }]);
  const [editingDevis, setEditingDevis] = useState<Devis | null>(null);
  const [isAddingDevis, setIsAddingDevis] = useState(false);
  const [viewingDevis, setViewingDevis] = useState<Devis | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  function hydrateDevisClient(devis: Devis): Devis {
    const resolvedClient = clients.find((client) => client.id === devis.client_id) ?? devis.client ?? null;

    return {
      ...devis,
      client: resolvedClient,
    };
  }

  async function loadDevises(page = currentPage, options: { replaceOnEmpty?: boolean } = {}) {
    try {
      const response = await listDevises(page);
      const normalized = normalizeDevisList(response);

      setDevises((current) => {
        if (!options.replaceOnEmpty && normalized.data.length === 0 && current.length > 0) {
          return current;
        }

        return normalized.data.map((nd) => {
          const existing = current.find((c) => c.id === nd.id);
          const merged: Devis = {
            ...(existing ?? {}),
            ...nd,
            items: (nd.items && nd.items.length > 0) ? nd.items : existing?.items ?? nd.items ?? [],
          };

          return hydrateDevisClient(merged);
        });
      });
      const current = normalized.meta?.current_page ?? page;
      const total = normalized.meta?.total ?? 0;
      const perPage = normalized.meta?.per_page ?? (normalized.data.length || 1);
      const derivedLastPage = normalized.meta?.last_page ?? (total > 0 ? Math.ceil(total / perPage) : 1);
      setCurrentPage(current);
      setTotalPages(Math.max(1, derivedLastPage));
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    }
  }

  useEffect(() => {
    void loadDevises(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetDevisItemDrafts() {
    setDevisItemDrafts([{ ...emptyDevisItemDraft }]);
  }

  function updateDevisItemDraft(index: number, field: keyof DevisItemDraftValues, value: string) {
    setDevisItemDrafts((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (field === 'product_id') {
          const product = value ? products.find((entry) => entry.id === Number(value)) : undefined;
          return {
            ...item,
            product_id: value,
            price: product ? String(product.price) : item.price,
          };
        }

        return { ...item, [field]: value };
      }),
    );
  }

  function addDevisItemDraft() {
    setDevisItemDrafts((current) => [...current, { ...emptyDevisItemDraft }]);
  }

  function removeDevisItemDraft(index: number) {
    setDevisItemDrafts((current) => {
      const nextItems = current.filter((_, itemIndex) => itemIndex !== index);
      return nextItems.length > 0 ? nextItems : [{ ...emptyDevisItemDraft }];
    });
  }

  async function handleDevisSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (editingDevis) {
        const devis = await updateDevis(editingDevis.id, devisForm);
        if (devis) {
          setDevises((current) => current.map((item) => (item.id === devis.id ? hydrateDevisClient({ ...item, ...devis, items: (devis.items && devis.items.length > 0) ? devis.items : item.items }) : item)));
          setViewingDevis((current) => (current?.id === devis.id ? hydrateDevisClient({ ...current, ...devis, items: (devis.items && devis.items.length > 0) ? devis.items : current.items }) : current));
        }
        setStatus({ type: 'success', text: 'Devis updated successfully' });
      } else {
        const devis = await createDevis(
          devisForm,
          devisItemDrafts.filter((item) => item.product_id && item.price && item.quantity),
          { referencePrefix: referenceSettings.devis_reference_prefix },
        );
        if (devis) {
          setDevises((current) => [hydrateDevisClient(devis), ...current]);
        }
        setStatus({ type: 'success', text: 'Devis created successfully' });
      }

      setEditingDevis(null);
      setDevisForm(emptyDevisForm);
      resetDevisItemDrafts();
      setIsAddingDevis(false);
      await loadDevises(1);
      await refreshSales();
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteDevis(devis: Devis) {
    if (!confirm(`Delete devis ${devis.reference}?`)) return;
    setLoading(true);
    setStatus(null);

    try {
      await deleteDevis(devis.id);
      setDevises((current) => current.filter((item) => item.id !== devis.id));
      if (viewingDevis?.id === devis.id) {
        setViewingDevis(null);
      }
      setStatus({ type: 'success', text: 'Devis deleted successfully' });
      await loadDevises(currentPage, { replaceOnEmpty: true });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleSendDevis(devis: Devis) {
    setLoading(true);
    setStatus(null);

    try {
      const updated = await sendDevis(devis.id);
      if (updated) {
        setDevises((current) => current.map((item) => (item.id === devis.id ? hydrateDevisClient({ ...item, ...updated, items: (updated.items && updated.items.length > 0) ? updated.items : item.items }) : item)));
        setViewingDevis((current) => (current?.id === devis.id ? hydrateDevisClient({ ...current, ...updated, items: (updated.items && updated.items.length > 0) ? updated.items : current.items }) : current));
      }
      setStatus({ type: 'success', text: 'Devis sent successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptDevis(devis: Devis) {
    setLoading(true);
    setStatus(null);

    try {
      const result = await acceptDevis(devis.id, {
        referencePrefix: referenceSettings.sale_reference_prefix,
      });
      if (result.devis) {
        const updated = result.devis;
        setDevises((current) => current.map((item) => (item.id === devis.id ? hydrateDevisClient({ ...item, ...updated, items: (updated.items && updated.items.length > 0) ? updated.items : item.items }) : item)));
        setViewingDevis((current) => (current?.id === devis.id ? hydrateDevisClient({ ...current, ...updated, items: (updated.items && updated.items.length > 0) ? updated.items : current.items, sale: result.sale ?? current.sale }) : current));
      }
      if (result.sale) {
        setSales((current) => [result.sale!, ...current]);
        if (result.sale.items) {
          setSaleItems((current) => [...result.sale!.items!, ...current]);
        }
      }
      await refreshSales();
      setStatus({ type: 'success', text: 'Devis accepted and converted to sale successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleRejectDevis(devis: Devis) {
    setLoading(true);
    setStatus(null);

    try {
      const updated = await rejectDevis(devis.id);
      if (updated) {
        setDevises((current) => current.map((item) => (item.id === devis.id ? hydrateDevisClient({ ...item, ...updated, items: (updated.items && updated.items.length > 0) ? updated.items : item.items }) : item)));
        setViewingDevis((current) => (current?.id === devis.id ? hydrateDevisClient({ ...current, ...updated, items: (updated.items && updated.items.length > 0) ? updated.items : current.items }) : current));
      }
      setStatus({ type: 'success', text: 'Devis rejected successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleConvertDevis(devis: Devis) {
    setLoading(true);
    setStatus(null);

    try {
      const result = await convertDevisToSale(devis.id, {
        referencePrefix: referenceSettings.sale_reference_prefix,
      });
      if (result.devis) {
        const updated = result.devis;
        setDevises((current) => current.map((item) => (item.id === devis.id ? hydrateDevisClient({ ...item, ...updated, items: (updated.items && updated.items.length > 0) ? updated.items : item.items }) : item)));
        setViewingDevis((current) => (current?.id === devis.id ? hydrateDevisClient({ ...current, ...updated, items: (updated.items && updated.items.length > 0) ? updated.items : current.items, sale: result.sale ?? current.sale }) : current));
      }
      if (result.sale) {
        setSales((current) => [result.sale!, ...current]);
        if (result.sale.items) {
          setSaleItems((current) => [...result.sale!.items!, ...current]);
        }
      }
      await refreshSales();
      setStatus({ type: 'success', text: 'Devis converted to sale successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleExportPdf(devis: Devis) {
    setLoading(true);
    try {
      const result = await generateDevisPdf(devis.id);
      if (!result.success) {
        throw new Error(result.message);
      }

      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noreferrer';
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function viewDevis(devis: Devis) {
    setLoading(true);
    setStatus(null);

    try {
      const result = await showDevis(devis.id);
      if (result.devis) {
        setViewingDevis(hydrateDevisClient({
          ...devis,
          ...result.devis,
          items: (result.items && result.items.length > 0) ? result.items : (result.devis.items && result.devis.items.length > 0) ? result.devis.items : devis.items ?? [],
          timeline: result.timeline,
        }));
      } else {
        setViewingDevis(hydrateDevisClient(devis));
      }
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
      setViewingDevis(hydrateDevisClient(devis));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setDevises((current) => current.map((devis) => hydrateDevisClient(devis)));
    setViewingDevis((current) => (current ? hydrateDevisClient(current) : current));
    setEditingDevis((current) => (current ? hydrateDevisClient(current) : current));
    // Rehydrate devis objects whenever the client catalog changes so stale client objects do not survive refreshes.
  }, [clients]);

  return {
    devisForm,
    devisItemDrafts,
    editingDevis,
    isAddingDevis,
    viewingDevis,
    devisCurrentPage: currentPage,
    devisTotalPages: totalPages,
    setDevisForm,
    handleDevisSubmit,
    handleDeleteDevis,
    handleSendDevis,
    handleAcceptDevis,
    handleRejectDevis,
    handleConvertDevis,
    handleExportPdf,
    startAddingDevis: () => setIsAddingDevis(true),
    cancelDevisEdit: () => {
      setEditingDevis(null);
      setDevisForm(emptyDevisForm);
      setIsAddingDevis(false);
      resetDevisItemDrafts();
    },
    editDevis: (devis: Devis) => {
      setEditingDevis(devis);
      setDevisForm(formFromDevis(devis));
    },
    addDevisItemDraft,
    updateDevisItemDraft,
    removeDevisItemDraft,
    setViewingDevis: (devis: Devis | null) => setViewingDevis(devis),
    viewDevis,
    loadDevises,
    nextDevisPage: () => {
      const next = Math.min(currentPage + 1, totalPages);
      void loadDevises(next);
    },
    previousDevisPage: () => {
      const prev = Math.max(currentPage - 1, 1);
      void loadDevises(prev);
    },
    goToDevisPage: (page: number) => void loadDevises(page),
  };
}
