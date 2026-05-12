import { FormEvent, useState } from 'react';
import { createSaleWithItems, deleteSale, deleteSaleItem, updateSale } from '../../../api/catalog';
import type { Product, Sale, SaleItem, SaleItemDraftValues, Status } from '../../../types';
import { emptySaleForm, emptySaleItemDraft, formFromSale } from '../adminCatalogForms';
import { errorMessage } from './adminCatalogUtils';

type SaleManagementOptions = {
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  setSaleItems: React.Dispatch<React.SetStateAction<SaleItem[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  refreshSales: () => Promise<void>;
  refreshProducts: () => Promise<void>;
};

export function useSaleManagement({
  setSales,
  setSaleItems,
  setLoading,
  setStatus,
  refreshSales,
  refreshProducts,
}: SaleManagementOptions) {
  const [saleForm, setSaleForm] = useState(emptySaleForm);
  const [saleItemDrafts, setSaleItemDrafts] = useState<SaleItemDraftValues[]>([{ ...emptySaleItemDraft }]);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [isAddingSale, setIsAddingSale] = useState(false);

  function resetSaleItemDrafts() {
    setSaleItemDrafts([{ ...emptySaleItemDraft }]);
  }

  function addSaleItemDraft() {
    setSaleItemDrafts((current) => [...current, { ...emptySaleItemDraft }]);
  }

  function updateSaleItemDraft(index: number, field: keyof SaleItemDraftValues, value: string) {
    setSaleItemDrafts((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    );
  }

  function removeSaleItemDraft(index: number) {
    setSaleItemDrafts((current) => {
      const nextItems = current.filter((_, itemIndex) => itemIndex !== index);
      return nextItems.length > 0 ? nextItems : [{ ...emptySaleItemDraft }];
    });
  }

  async function handleSaleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (editingSale) {
        const sale = await updateSale(editingSale.id, saleForm);
        if (sale) {
          setSales((current) => current.map((item) => (item.id === sale.id ? sale : item)));
        }
        setStatus({ type: 'success', text: 'Sale updated successfully' });
      } else {
        const sale = await createSaleWithItems(
          saleForm,
          saleItemDrafts.filter((item) => item.product_id && item.quantity),
        );
        if (sale) {
          setSales((current) => [sale, ...current]);
          if (sale.items?.length) {
            setSaleItems((current) => [...sale.items!, ...current]);
          }
        }
        setStatus({ type: 'success', text: 'Sale created successfully' });
      }

      setEditingSale(null);
      setSaleForm(emptySaleForm);
      resetSaleItemDrafts();
      setIsAddingSale(false);
      await refreshSales();
      await refreshProducts();
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSale(sale: Sale) {
    if (!confirm(`Delete sale #${sale.id}?`)) return;
    setLoading(true);
    setStatus(null);

    try {
      await deleteSale(sale.id);
      setSales((current) => current.filter((item) => item.id !== sale.id));
      setSaleItems((current) => current.filter((item) => item.sale_id !== sale.id));
      if (viewingSale?.id === sale.id) {
        setViewingSale(null);
      }
      if (editingSale?.id === sale.id) {
        setEditingSale(null);
        setSaleForm(emptySaleForm);
        resetSaleItemDrafts();
      }
      await refreshProducts();
      setStatus({ type: 'success', text: 'Sale deleted successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSaleItem(saleItem: SaleItem) {
    if (!confirm(`Delete sale item #${saleItem.id}?`)) return;
    setLoading(true);
    setStatus(null);

    try {
      await deleteSaleItem(saleItem.id);
      setSaleItems((current) => current.filter((item) => item.id !== saleItem.id));
      await refreshSales();
      await refreshProducts();
      setStatus({ type: 'success', text: 'Sale item deleted successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  return {
    saleForm,
    saleItemDrafts,
    editingSale,
    isAddingSale,
    setSaleForm,
    handleSaleSubmit,
    handleDeleteSale,
    handleDeleteSaleItem,
    startAddingSale: () => setIsAddingSale(true),
    cancelSaleEdit: () => {
      setEditingSale(null);
      setSaleForm(emptySaleForm);
      setIsAddingSale(false);
      resetSaleItemDrafts();
    },
    editSale: (sale: Sale) => {
      setEditingSale(sale);
      setSaleForm(formFromSale(sale));
    },
    addSaleItemDraft,
    updateSaleItemDraft,
    removeSaleItemDraft,
    viewingSale,
    setViewingSale,
  };
}
