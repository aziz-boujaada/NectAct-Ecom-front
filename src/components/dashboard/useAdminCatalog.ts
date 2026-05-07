import { useEffect, useState } from 'react';
import {
  createClient,
  createSupplier,
  deleteClient,
  deleteSupplier,
  listCategories,
  listClients,
  listProducts,
  listPurchaseItems,
  listPurchases,
  listRefunds,
  listSaleItems,
  listSales,
  listSuppliers,
  updateClient,
  updateSupplier,
} from '../../api/catalog';
import type { Category, Client, Product, Purchase, PurchaseItem, Refund, Sale, SaleItem, Status, Supplier } from '../../types';
import { errorMessage } from './hooks/adminCatalogUtils';
import { useCategoryManagement } from './hooks/useCategoryManagement';
import { useContactManagement } from './hooks/useContactManagement';
import { useProductManagement } from './hooks/useProductManagement';
import { usePurchaseManagement } from './hooks/usePurchaseManagement';
import { useRefundManagement } from './hooks/useRefundManagement';
import { useSaleManagement } from './hooks/useSaleManagement';

async function fetchCatalog() {
  return Promise.all([
    listCategories(),
    listProducts(),
    listPurchases(),
    listPurchaseItems(),
    listSales(),
    listSaleItems(),
    listRefunds(),
    listSuppliers(),
    listClients(),
  ]);
}

export function useAdminCatalog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(true);

  function applyCatalog([
    nextCategories,
    nextProducts,
    nextPurchases,
    nextPurchaseItems,
    nextSales,
    nextSaleItems,
    nextRefunds,
    nextSuppliers,
    nextClients,
  ]: Awaited<ReturnType<typeof fetchCatalog>>) {
    setCategories(nextCategories);
    setProducts(nextProducts);
    setPurchases(nextPurchases);
    setPurchaseItems(nextPurchaseItems);
    setSales(nextSales);
    setSaleItems(nextSaleItems);
    setRefunds(nextRefunds);
    setSuppliers(nextSuppliers);
    setClients(nextClients);
  }

  async function loadCatalog(showPending = true) {
    if (showPending) {
      setLoading(true);
      setStatus(null);
    }

    try {
      applyCatalog(await fetchCatalog());
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    fetchCatalog()
      .then((catalog) => {
        if (!active) return;
        applyCatalog(catalog);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setStatus({ type: 'error', text: errorMessage(error) });
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function refreshProducts() {
    setProducts(await listProducts());
  }

  async function refreshPurchases() {
    setPurchases(await listPurchases());
  }

  async function refreshSales() {
    setSales(await listSales());
  }

  async function refreshRefunds() {
    setRefunds(await listRefunds());
  }

  const categoryManagement = useCategoryManagement({
    setCategories,
    setProducts,
    setLoading,
    setStatus,
    refreshProducts,
  });

  const productManagement = useProductManagement({
    setProducts,
    setLoading,
    setStatus,
  });

  const purchaseManagement = usePurchaseManagement({
    products,
    setPurchases,
    setPurchaseItems,
    setLoading,
    setStatus,
    refreshPurchases,
    refreshProducts,
  });

  const saleManagement = useSaleManagement({
    setSales,
    setSaleItems,
    setProducts,
    setLoading,
    setStatus,
    refreshSales,
    refreshProducts,
  });

  const refundManagement = useRefundManagement({
    setRefunds,
    setProducts,
    setLoading,
    setStatus,
    refreshRefunds,
    refreshSales,
    refreshProducts,
  });

  const supplierManagement = useContactManagement<Supplier>({
    entityName: 'supplier',
    createContact: createSupplier,
    updateContact: updateSupplier,
    deleteContact: deleteSupplier,
    setContacts: setSuppliers,
    setLoading,
    setStatus,
    afterUpdate: refreshProducts,
    afterDelete: async (supplier) => {
      setProducts((current) => current.filter((product) => product.supplier_id !== supplier.id));
      setPurchases((current) => current.filter((purchase) => purchase.supplier_id !== supplier.id));
    },
  });

  const clientManagement = useContactManagement<Client>({
    entityName: 'client',
    createContact: createClient,
    updateContact: updateClient,
    deleteContact: deleteClient,
    setContacts: setClients,
    setLoading,
    setStatus,
    afterDelete: async (client) => {
      setSales((current) => current.filter((sale) => sale.client_id !== client.id));
    },
  });

  return {
    categories,
    products,
    purchases,
    purchaseItems,
    sales,
    saleItems,
    refunds,
    suppliers,
    clients,
    status,
    loading,
    loadCatalog,
    ...categoryManagement,
    ...productManagement,
    ...purchaseManagement,
    ...saleManagement,
    ...refundManagement,
    supplierForm: supplierManagement.contactForm,
    editingSupplier: supplierManagement.editingContact,
    isAddingSupplier: supplierManagement.isAddingContact,
    setSupplierForm: supplierManagement.setContactForm,
    handleSupplierSubmit: supplierManagement.handleContactSubmit,
    handleDeleteSupplier: supplierManagement.handleDeleteContact,
    startAddingSupplier: supplierManagement.startAddingContact,
    cancelSupplierEdit: supplierManagement.cancelContactEdit,
    editSupplier: supplierManagement.editContact,
    clientForm: clientManagement.contactForm,
    editingClient: clientManagement.editingContact,
    isAddingClient: clientManagement.isAddingContact,
    setClientForm: clientManagement.setContactForm,
    handleClientSubmit: clientManagement.handleContactSubmit,
    handleDeleteClient: clientManagement.handleDeleteContact,
    startAddingClient: clientManagement.startAddingContact,
    cancelClientEdit: clientManagement.cancelContactEdit,
    editClient: clientManagement.editContact,
  };
}
