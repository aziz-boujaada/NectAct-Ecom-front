import { FormEvent, useState } from 'react';
import {
  createPurchaseWithItems,
  deletePurchase,
  deletePurchaseItem,
  updatePurchase,
  updatePurchaseItem,
} from '../../../api/catalog';
import type { Product, Purchase, PurchaseItem, PurchaseItemDraftValues, Status } from '../../../types';
import {
  emptyPurchaseForm,
  emptyPurchaseItemForm,
  emptyPurchaseItemDraft,
  formFromPurchase,
  formFromPurchaseItem,
} from '../adminCatalogForms';
import { errorMessage } from './adminCatalogUtils';

type PurchaseManagementOptions = {
  products: Product[];
  setPurchases: React.Dispatch<React.SetStateAction<Purchase[]>>;
  setPurchaseItems: React.Dispatch<React.SetStateAction<PurchaseItem[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  refreshPurchases: () => Promise<void>;
  refreshProducts: () => Promise<void>;
};

export function usePurchaseManagement({
  products,
  setPurchases,
  setPurchaseItems,
  setLoading,
  setStatus,
  refreshPurchases,
  refreshProducts,
}: PurchaseManagementOptions) {
  const [purchaseForm, setPurchaseForm] = useState(emptyPurchaseForm);
  const [purchaseItemForm, setPurchaseItemForm] = useState(emptyPurchaseItemForm);
  const [purchaseItemDrafts, setPurchaseItemDrafts] = useState<PurchaseItemDraftValues[]>([emptyPurchaseItemDraft]);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [editingPurchaseItem, setEditingPurchaseItem] = useState<PurchaseItem | null>(null);
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);

  function resetPurchaseItemDrafts() {
    setPurchaseItemDrafts([{ ...emptyPurchaseItemDraft }]);
  }

  function handlePurchaseChange(nextForm: typeof emptyPurchaseForm) {
    setPurchaseForm((current) => {
      if (current.supplier_id !== nextForm.supplier_id && !editingPurchase) {
        resetPurchaseItemDrafts();
      }

      return nextForm;
    });
  }

  function addPurchaseItemDraft() {
    setPurchaseItemDrafts((current) => [...current, { ...emptyPurchaseItemDraft }]);
  }

  function updatePurchaseItemDraft(index: number, field: keyof PurchaseItemDraftValues, value: string) {
    setPurchaseItemDrafts((current) =>
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

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  }

  function removePurchaseItemDraft(index: number) {
    setPurchaseItemDrafts((current) => {
      const nextItems = current.filter((_, itemIndex) => itemIndex !== index);
      return nextItems.length > 0 ? nextItems : [{ ...emptyPurchaseItemDraft }];
    });
  }

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
        const purchase = await createPurchaseWithItems(
          purchaseForm,
          purchaseItemDrafts.filter((item) => item.product_id && item.price && item.quantity),
        );
        if (purchase) {
          setPurchases((current) => [purchase, ...current]);
          if (purchase.items?.length) {
            setPurchaseItems((current) => [...purchase.items!, ...current]);
          }
        }
        setStatus({ type: 'success', text: 'Purchase created successfully' });
      }

      setEditingPurchase(null);
      setPurchaseForm(emptyPurchaseForm);
      resetPurchaseItemDrafts();
      setIsAddingPurchase(false);
      await refreshPurchases();
      await refreshProducts();
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
      }

      setEditingPurchaseItem(null);
      setPurchaseItemForm(emptyPurchaseItemForm);
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
    purchaseItemDrafts,
    editingPurchase,
    editingPurchaseItem,
    isAddingPurchase,
    setPurchaseForm,
    setPurchaseItemForm,
    handlePurchaseSubmit,
    handlePurchaseItemSubmit,
    handleDeletePurchase,
    handleDeletePurchaseItem,
    startAddingPurchase: () => setIsAddingPurchase(true),
    cancelPurchaseEdit: () => {
      setEditingPurchase(null);
      setPurchaseForm(emptyPurchaseForm);
      setIsAddingPurchase(false);
      resetPurchaseItemDrafts();
    },
    cancelPurchaseItemEdit: () => {
      setEditingPurchaseItem(null);
      setPurchaseItemForm(emptyPurchaseItemForm);
    },
    editPurchase: (purchase: Purchase) => {
      setEditingPurchase(purchase);
      setPurchaseForm(formFromPurchase(purchase));
    },
    editPurchaseItem: (purchaseItem: PurchaseItem) => {
      setEditingPurchaseItem(purchaseItem);
      setPurchaseItemForm(formFromPurchaseItem(purchaseItem));
    },
    handlePurchaseChange,
    addPurchaseItemDraft,
    updatePurchaseItemDraft,
    removePurchaseItemDraft,
  };
}
