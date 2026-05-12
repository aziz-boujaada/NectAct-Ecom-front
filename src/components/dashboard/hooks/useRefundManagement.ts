import { FormEvent, useState } from 'react';
import { createRefund, deleteRefund } from '../../../api/catalog';
import type { Product, Refund, RefundFormValues, Status } from '../../../types';
import { emptyRefundForm } from '../adminCatalogForms';
import { errorMessage } from './adminCatalogUtils';

type RefundManagementOptions = {
  setRefunds: React.Dispatch<React.SetStateAction<Refund[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<Status>>;
  refreshRefunds: () => Promise<void>;
  refreshSales: () => Promise<void>;
  refreshProducts: () => Promise<void>;
};

export function useRefundManagement({
  setRefunds,
  setLoading,
  setStatus,
  refreshRefunds,
  refreshSales,
  refreshProducts,
}: RefundManagementOptions) {
  const [refundForm, setRefundForm] = useState<RefundFormValues>(emptyRefundForm);
  const [isAddingRefund, setIsAddingRefund] = useState(false);
  const [viewingRefund, setViewingRefund] = useState<Refund | null>(null);

  async function handleRefundSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const refund = await createRefund(refundForm);
      if (refund) {
        setRefunds((current) => [refund, ...current]);
      }

      setRefundForm(emptyRefundForm);
      setIsAddingRefund(false);
      await refreshRefunds();
      await refreshSales();
      await refreshProducts();
      setStatus({ type: 'success', text: 'Refund created successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteRefund(refund: Refund) {
    if (!confirm(`Delete refund #${refund.id}?`)) return;
    setLoading(true);
    setStatus(null);

    try {
      await deleteRefund(refund.id);
      setRefunds((current) => current.filter((item) => item.id !== refund.id));
      if (viewingRefund?.id === refund.id) {
        setViewingRefund(null);
      }
      await refreshSales();
      await refreshProducts();
      setStatus({ type: 'success', text: 'Refund deleted successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  return {
    refundForm,
    isAddingRefund,
    setRefundForm,
    handleRefundSubmit,
    handleDeleteRefund,
    startAddingRefund: () => setIsAddingRefund(true),
    cancelRefundEdit: () => {
      setRefundForm(emptyRefundForm);
      setIsAddingRefund(false);
    },
    viewingRefund,
    setViewingRefund,
  };
}
