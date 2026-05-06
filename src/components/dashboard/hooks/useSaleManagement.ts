import { FormEvent, useState } from 'react';
import { createSale, createSaleItem, deleteSale, deleteSaleItem, updateSale, updateSaleItem } from '../../../api/catalog';
import type { Product, Sale, SaleItem, Status } from '../../../types';
import { emptySaleForm, emptySaleItemForm, formFromSale, formFromSaleItem } from '../adminCatalogForms';
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
  const [saleItemForm, setSaleItemForm] = useState(emptySaleItemForm);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editingSaleItem, setEditingSaleItem] = useState<SaleItem | null>(null);
  const [isAddingSale, setIsAddingSale] = useState(false);
  const [isAddingSaleItem, setIsAddingSaleItem] = useState(false);

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
        const sale = await createSale(saleForm);
        if (sale) {
          setSales((current) => [sale, ...current]);
        }
        setStatus({ type: 'success', text: 'Sale created successfully' });
      }

      setEditingSale(null);
      setSaleForm(emptySaleForm);
      setIsAddingSale(false);
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaleItemSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (editingSaleItem) {
        const saleItem = await updateSaleItem(editingSaleItem.id, saleItemForm);
        if (saleItem) {
          setSaleItems((current) => current.map((item) => (item.id === saleItem.id ? saleItem : item)));
        }
        setStatus({ type: 'success', text: 'Sale item updated successfully' });
      } else {
        const saleItem = await createSaleItem(saleItemForm);
        if (saleItem) {
          setSaleItems((current) => [saleItem, ...current]);
        }
        setStatus({ type: 'success', text: 'Sale item created successfully' });
      }

      setEditingSaleItem(null);
      setSaleItemForm(emptySaleItemForm);
      setIsAddingSaleItem(false);
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
      if (editingSale?.id === sale.id) {
        setEditingSale(null);
        setSaleForm(emptySaleForm);
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
      if (editingSaleItem?.id === saleItem.id) {
        setEditingSaleItem(null);
        setSaleItemForm(emptySaleItemForm);
      }
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
    saleItemForm,
    editingSale,
    editingSaleItem,
    isAddingSale,
    isAddingSaleItem,
    setSaleForm,
    setSaleItemForm,
    handleSaleSubmit,
    handleSaleItemSubmit,
    handleDeleteSale,
    handleDeleteSaleItem,
    startAddingSale: () => setIsAddingSale(true),
    startAddingSaleItem: () => setIsAddingSaleItem(true),
    cancelSaleEdit: () => {
      setEditingSale(null);
      setSaleForm(emptySaleForm);
      setIsAddingSale(false);
    },
    cancelSaleItemEdit: () => {
      setEditingSaleItem(null);
      setSaleItemForm(emptySaleItemForm);
      setIsAddingSaleItem(false);
    },
    editSale: (sale: Sale) => {
      setEditingSale(sale);
      setSaleForm(formFromSale(sale));
    },
    editSaleItem: (saleItem: SaleItem) => {
      setEditingSaleItem(saleItem);
      setSaleItemForm(formFromSaleItem(saleItem));
    },
  };
}
