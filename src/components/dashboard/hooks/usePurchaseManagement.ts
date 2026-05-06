import { FormEvent, useState } from 'react';
import {
  createPurchase,
  createPurchaseItem,
  deletePurchase,
  deletePurchaseItem,
  updatePurchase,
  updatePurchaseItem,
} from '../../../api/catalog';
import type { Product, Purchase, PurchaseItem, Status } from '../../../types';
import {
  emptyPurchaseForm,
  emptyPurchaseItemForm,
  formFromPurchase,
  formFromPurchaseItem,
} from '../adminCatalogForms';
import { errorMessage } from './adminCatalogUtils';

type PurchaseManagementOptions = {
  setPurchases: React.Dispatch<React.SetStateAction<Purchase[]>>;
  setPurchaseItems: React.Dispatch<React.SetStateAction<PurchaseItem[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  refreshPurchases: () => Promise<void>;
  refreshProducts: () => Promise<void>;
};

export function usePurchaseManagement({
  setPurchases,
  setPurchaseItems,
  setLoading,
  setStatus,
  refreshPurchases,
  refreshProducts,
}: PurchaseManagementOptions) {
  const [purchaseForm, setPurchaseForm] = useState(emptyPurchaseForm);
  const [purchaseItemForm, setPurchaseItemForm] = useState(emptyPurchaseItemForm);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [editingPurchaseItem, setEditingPurchaseItem] = useState<PurchaseItem | null>(null);
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  const [isAddingPurchaseItem, setIsAddingPurchaseItem] = useState(false);

  async function handlePurchaseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (editingPurchase) {
        const purchase = await updatePurchase(editingPurchase.id, purchaseForm);
        if (purchase) {
          setPurchases((current) => current.map((item) => (item.id === purchase.id ? purchase : item)));
        }
        setStatus({ type: 'success', text: 'Purchase updated successfully' });
      } else {
        const purchase = await createPurchase(purchaseForm);
        if (purchase) {
          setPurchases((current) => [purchase, ...current]);
        }
        setStatus({ type: 'success', text: 'Purchase created successfully' });
      }

      setEditingPurchase(null);
      setPurchaseForm(emptyPurchaseForm);
      setIsAddingPurchase(false);
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchaseItemSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (editingPurchaseItem) {
        const purchaseItem = await updatePurchaseItem(editingPurchaseItem.id, purchaseItemForm);
        if (purchaseItem) {
          setPurchaseItems((current) => current.map((item) => (item.id === purchaseItem.id ? purchaseItem : item)));
        }
        setStatus({ type: 'success', text: 'Purchase item updated successfully' });
      } else {
        const purchaseItem = await createPurchaseItem(purchaseItemForm);
        if (purchaseItem) {
          setPurchaseItems((current) => [purchaseItem, ...current]);
        }
        setStatus({ type: 'success', text: 'Purchase item created successfully' });
      }

      setEditingPurchaseItem(null);
      setPurchaseItemForm(emptyPurchaseItemForm);
      setIsAddingPurchaseItem(false);
      await refreshPurchases();
      await refreshProducts();
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePurchase(purchase: Purchase) {
    if (!confirm(`Delete purchase #${purchase.id}?`)) return;
    setLoading(true);
    setStatus(null);

    try {
      await deletePurchase(purchase.id);
      setPurchases((current) => current.filter((item) => item.id !== purchase.id));
      setPurchaseItems((current) => current.filter((item) => item.purchase_id !== purchase.id));
      if (editingPurchase?.id === purchase.id) {
        setEditingPurchase(null);
        setPurchaseForm(emptyPurchaseForm);
      }
      setStatus({ type: 'success', text: 'Purchase deleted successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePurchaseItem(purchaseItem: PurchaseItem) {
    if (!confirm(`Delete purchase item #${purchaseItem.id}?`)) return;
    setLoading(true);
    setStatus(null);

    try {
      await deletePurchaseItem(purchaseItem.id);
      setPurchaseItems((current) => current.filter((item) => item.id !== purchaseItem.id));
      if (editingPurchaseItem?.id === purchaseItem.id) {
        setEditingPurchaseItem(null);
        setPurchaseItemForm(emptyPurchaseItemForm);
      }
      await refreshPurchases();
      await refreshProducts();
      setStatus({ type: 'success', text: 'Purchase item deleted successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  return {
    purchaseForm,
    purchaseItemForm,
    editingPurchase,
    editingPurchaseItem,
    isAddingPurchase,
    isAddingPurchaseItem,
    setPurchaseForm,
    setPurchaseItemForm,
    handlePurchaseSubmit,
    handlePurchaseItemSubmit,
    handleDeletePurchase,
    handleDeletePurchaseItem,
    startAddingPurchase: () => setIsAddingPurchase(true),
    startAddingPurchaseItem: () => setIsAddingPurchaseItem(true),
    cancelPurchaseEdit: () => {
      setEditingPurchase(null);
      setPurchaseForm(emptyPurchaseForm);
      setIsAddingPurchase(false);
    },
    cancelPurchaseItemEdit: () => {
      setEditingPurchaseItem(null);
      setPurchaseItemForm(emptyPurchaseItemForm);
      setIsAddingPurchaseItem(false);
    },
    editPurchase: (purchase: Purchase) => {
      setEditingPurchase(purchase);
      setPurchaseForm(formFromPurchase(purchase));
    },
    editPurchaseItem: (purchaseItem: PurchaseItem) => {
      setEditingPurchaseItem(purchaseItem);
      setPurchaseItemForm(formFromPurchaseItem(purchaseItem));
    },
  };
}
