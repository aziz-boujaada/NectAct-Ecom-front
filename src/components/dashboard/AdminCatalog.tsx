import { FormEvent, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  createCategory,
  createClient,
  createProduct,
  createPurchase,
  createPurchaseItem,
  createSale,
  createSaleItem,
  createSupplier,
  deleteCategory,
  deleteClient,
  deleteProduct,
  deletePurchase,
  deletePurchaseItem,
  deleteSale,
  deleteSaleItem,
  deleteSupplier,
  listCategories,
  listClients,
  listProducts,
  listPurchaseItems,
  listPurchases,
  listSaleItems,
  listSales,
  listSuppliers,
  updateCategory,
  updateClient,
  updateProduct,
  updatePurchase,
  updatePurchaseItem,
  updateSale,
  updateSaleItem,
  updateSupplier,
} from '../../api/catalog';
import { ApiError } from '../../api/auth';
import type {
  Category,
  CategoryFormValues,
  Client,
  ContactFormValues,
  Product,
  ProductFormValues,
  Purchase,
  PurchaseFormValues,
  PurchaseItem,
  PurchaseItemFormValues,
  Sale,
  SaleFormValues,
  SaleItem,
  SaleItemFormValues,
  Status,
  Supplier,
} from '../../types';
import { StatusMessage } from '../StatusMessage';
import { CategoryManager } from './CategoryManager';
import { ContactManager } from './ContactManager';
import { ProductManager } from './ProductManager';
import { PurchaseManager } from './PurchaseManager';
import { SaleManager } from './SaleManager';

const emptyCategoryForm: CategoryFormValues = {
  name: '',
  description: '',
};

const emptyProductForm: ProductFormValues = {
  reference: '',
  name: '',
  description: '',
  image_path: '',
  price: '',
  stock: '0',
  min_stock: '0',
  category_id: '',
  supplier_id: '',
  image: null,
};

const emptyPurchaseForm: PurchaseFormValues = {
  supplier_id: '',
  status: 'pending',
};

const emptyPurchaseItemForm: PurchaseItemFormValues = {
  purchase_id: '',
  product_id: '',
  price: '',
  quantity: '1',
};

const emptySaleForm: SaleFormValues = {
  client_id: '',
  status: 'unpaid',
};

const emptySaleItemForm: SaleItemFormValues = {
  sale_id: '',
  product_id: '',
  quantity: '1',
};

const emptyContactForm: ContactFormValues = {
  name: '',
  phone: '',
  address: '',
};

function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const firstValidationError = error.errors ? Object.values(error.errors).flat()[0] : undefined;
    return firstValidationError ?? error.message;
  }

  return error instanceof Error ? error.message : 'Catalog request failed';
}

function formFromCategory(category: Category): CategoryFormValues {
  return {
    name: category.name,
    description: category.description ?? '',
  };
}

function formFromProduct(product: Product): ProductFormValues {
  return {
    reference: product.reference,
    name: product.name,
    description: product.description ?? '',
    image_path: product.image_path ?? '',
    price: String(product.price),
    stock: String(product.stock ?? 0),
    min_stock: String(product.min_stock ?? 0),
    category_id: String(product.category_id),
    supplier_id: String(product.supplier_id),
    image: null,
  };
}

function formFromPurchase(purchase: Purchase): PurchaseFormValues {
  return {
    supplier_id: String(purchase.supplier_id),
    status: purchase.status,
  };
}

function formFromPurchaseItem(purchaseItem: PurchaseItem): PurchaseItemFormValues {
  return {
    purchase_id: String(purchaseItem.purchase_id),
    product_id: String(purchaseItem.product_id),
    price: String(purchaseItem.price),
    quantity: String(purchaseItem.quantity),
  };
}

function formFromSale(sale: Sale): SaleFormValues {
  return {
    client_id: String(sale.client_id),
    status: sale.status,
  };
}

function formFromSaleItem(saleItem: SaleItem): SaleItemFormValues {
  return {
    sale_id: String(saleItem.sale_id),
    product_id: String(saleItem.product_id),
    quantity: String(saleItem.quantity),
  };
}

function formFromContact(contact: Client | Supplier): ContactFormValues {
  return {
    name: contact.name,
    phone: contact.phone ?? '',
    address: contact.address ?? '',
  };
}

type AdminCatalogProps = {
  activeTab: 'categories' | 'products' | 'purchases' | 'sales' | 'suppliers' | 'clients';
};

export function AdminCatalog({ activeTab }: AdminCatalogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [purchaseForm, setPurchaseForm] = useState(emptyPurchaseForm);
  const [purchaseItemForm, setPurchaseItemForm] = useState(emptyPurchaseItemForm);
  const [saleForm, setSaleForm] = useState(emptySaleForm);
  const [saleItemForm, setSaleItemForm] = useState(emptySaleItemForm);
  const [supplierForm, setSupplierForm] = useState(emptyContactForm);
  const [clientForm, setClientForm] = useState(emptyContactForm);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [editingPurchaseItem, setEditingPurchaseItem] = useState<PurchaseItem | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editingSaleItem, setEditingSaleItem] = useState<SaleItem | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  const [isAddingPurchaseItem, setIsAddingPurchaseItem] = useState(false);
  const [isAddingSale, setIsAddingSale] = useState(false);
  const [isAddingSaleItem, setIsAddingSaleItem] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(true);

  async function loadCatalog(showPending = true) {
    if (showPending) {
      setLoading(true);
      setStatus(null);
    }

    try {
      const [
        nextCategories,
        nextProducts,
        nextPurchases,
        nextPurchaseItems,
        nextSales,
        nextSaleItems,
        nextSuppliers,
        nextClients,
      ] = await Promise.all([
        listCategories(),
        listProducts(),
        listPurchases(),
        listPurchaseItems(),
        listSales(),
        listSaleItems(),
        listSuppliers(),
        listClients(),
      ]);
      setCategories(nextCategories);
      setProducts(nextProducts);
      setPurchases(nextPurchases);
      setPurchaseItems(nextPurchaseItems);
      setSales(nextSales);
      setSaleItems(nextSaleItems);
      setSuppliers(nextSuppliers);
      setClients(nextClients);
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    Promise.all([
      listCategories(),
      listProducts(),
      listPurchases(),
      listPurchaseItems(),
      listSales(),
      listSaleItems(),
      listSuppliers(),
      listClients(),
    ])
      .then(([nextCategories, nextProducts, nextPurchases, nextPurchaseItems, nextSales, nextSaleItems, nextSuppliers, nextClients]) => {
        if (!active) return;
        setCategories(nextCategories);
        setProducts(nextProducts);
        setPurchases(nextPurchases);
        setPurchaseItems(nextPurchaseItems);
        setSales(nextSales);
        setSaleItems(nextSaleItems);
        setSuppliers(nextSuppliers);
        setClients(nextClients);
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

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (editingCategory) {
        const category = await updateCategory(editingCategory.id, categoryForm);
        if (category) {
          setCategories((current) => current.map((item) => (item.id === category.id ? category : item)));
        }
        setStatus({ type: 'success', text: 'Category updated successfully' });
      } else {
        const category = await createCategory(categoryForm);
        if (category) {
          setCategories((current) => [category, ...current]);
        }
        setStatus({ type: 'success', text: 'Category created successfully' });
      }

      setEditingCategory(null);
      setCategoryForm(emptyCategoryForm);
      setIsAddingCategory(false);
      await refreshProductsOnly();
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (editingProduct) {
        const product = await updateProduct(editingProduct.id, productForm);
        if (product) {
          setProducts((current) => current.map((item) => (item.id === product.id ? product : item)));
        }
        setStatus({ type: 'success', text: 'Product updated successfully' });
      } else {
        const product = await createProduct(productForm);
        if (product) {
          setProducts((current) => [product, ...current]);
        }
        setStatus({ type: 'success', text: 'Product created successfully' });
      }

      setEditingProduct(null);
      setProductForm(emptyProductForm);
      setIsAddingProduct(false);
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
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
      await refreshPurchasesOnly();
      await refreshProductsOnly();
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
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
      await refreshSalesOnly();
      await refreshProductsOnly();
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleSupplierSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (editingSupplier) {
        const supplier = await updateSupplier(editingSupplier.id, supplierForm);
        if (supplier) {
          setSuppliers((current) => current.map((item) => (item.id === supplier.id ? supplier : item)));
        }
        setStatus({ type: 'success', text: 'Supplier updated successfully' });
        await refreshProductsOnly();
      } else {
        const supplier = await createSupplier(supplierForm);
        if (supplier) {
          setSuppliers((current) => [supplier, ...current]);
        }
        setStatus({ type: 'success', text: 'Supplier created successfully' });
      }

      setEditingSupplier(null);
      setSupplierForm(emptyContactForm);
      setIsAddingSupplier(false);
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleClientSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      if (editingClient) {
        const client = await updateClient(editingClient.id, clientForm);
        if (client) {
          setClients((current) => current.map((item) => (item.id === client.id ? client : item)));
        }
        setStatus({ type: 'success', text: 'Client updated successfully' });
      } else {
        const client = await createClient(clientForm);
        if (client) {
          setClients((current) => [client, ...current]);
        }
        setStatus({ type: 'success', text: 'Client created successfully' });
      }

      setEditingClient(null);
      setClientForm(emptyContactForm);
      setIsAddingClient(false);
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function refreshProductsOnly() {
    const nextProducts = await listProducts();
    setProducts(nextProducts);
  }

  async function refreshPurchasesOnly() {
    const nextPurchases = await listPurchases();
    setPurchases(nextPurchases);
  }

  async function refreshSalesOnly() {
    const nextSales = await listSales();
    setSales(nextSales);
  }

  async function handleDeleteCategory(category: Category) {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    setLoading(true);
    setStatus(null);

    try {
      await deleteCategory(category.id);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      setProducts((current) => current.filter((product) => product.category_id !== category.id));
      if (editingCategory?.id === category.id) {
        setEditingCategory(null);
        setCategoryForm(emptyCategoryForm);
      }
      setStatus({ type: 'success', text: 'Category deleted successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    if (!confirm(`Delete product "${product.name}"?`)) return;
    setLoading(true);
    setStatus(null);

    try {
      await deleteProduct(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingProduct?.id === product.id) {
        setEditingProduct(null);
        setProductForm(emptyProductForm);
      }
      setStatus({ type: 'success', text: 'Product deleted successfully' });
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
      await refreshPurchasesOnly();
      await refreshProductsOnly();
      setStatus({ type: 'success', text: 'Purchase item deleted successfully' });
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
      await refreshProductsOnly();
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
      await refreshSalesOnly();
      await refreshProductsOnly();
      setStatus({ type: 'success', text: 'Sale item deleted successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSupplier(supplier: Supplier) {
    if (!confirm(`Delete supplier "${supplier.name}"?`)) return;
    setLoading(true);
    setStatus(null);

    try {
      await deleteSupplier(supplier.id);
      setSuppliers((current) => current.filter((item) => item.id !== supplier.id));
      setProducts((current) => current.filter((product) => product.supplier_id !== supplier.id));
      setPurchases((current) => current.filter((purchase) => purchase.supplier_id !== supplier.id));
      if (editingSupplier?.id === supplier.id) {
        setEditingSupplier(null);
        setSupplierForm(emptyContactForm);
      }
      setStatus({ type: 'success', text: 'Supplier deleted successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteClient(client: Client) {
    if (!confirm(`Delete client "${client.name}"?`)) return;
    setLoading(true);
    setStatus(null);

    try {
      await deleteClient(client.id);
      setClients((current) => current.filter((item) => item.id !== client.id));
      setSales((current) => current.filter((sale) => sale.client_id !== client.id));
      if (editingClient?.id === client.id) {
        setEditingClient(null);
        setClientForm(emptyContactForm);
      }
      setStatus({ type: 'success', text: 'Client deleted successfully' });
    } catch (error) {
      setStatus({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  const titles = {
    categories: 'Categories',
    products: 'Products',
    purchases: 'Purchases',
    sales: 'Sales',
    suppliers: 'Suppliers',
    clients: 'Clients',
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-titlebar">
        <div>
          <p className="eyebrow">Catalog Management</p>
          <h2>{titles[activeTab]}</h2>
        </div>
        <button className="secondary-action" disabled={loading} onClick={() => void loadCatalog()} type="button">
          <RefreshCw size={17} aria-hidden="true" />
          Reload
        </button>
      </div>

      <StatusMessage status={status} />

      <div className="admin-grid fade-in" key={activeTab}>
        {activeTab === 'categories' && (
          <CategoryManager
            categories={categories}
            editingCategory={editingCategory}
            form={categoryForm}
            loading={loading}
            isAdding={isAddingCategory}
            onAdd={() => setIsAddingCategory(true)}
            onCancelEdit={() => {
              setEditingCategory(null);
              setCategoryForm(emptyCategoryForm);
              setIsAddingCategory(false);
            }}
            onChange={setCategoryForm}
            onDelete={handleDeleteCategory}
            onEdit={(category) => {
              setEditingCategory(category);
              setCategoryForm(formFromCategory(category));
            }}
            onSubmit={handleCategorySubmit}
          />
        )}

        {activeTab === 'products' && (
          <ProductManager
            categories={categories}
            editingProduct={editingProduct}
            form={productForm}
            loading={loading}
            products={products}
            suppliers={suppliers}
            isAdding={isAddingProduct}
            onAdd={() => setIsAddingProduct(true)}
            onCancelEdit={() => {
              setEditingProduct(null);
              setProductForm(emptyProductForm);
              setIsAddingProduct(false);
            }}
            onChange={setProductForm}
            onDelete={handleDeleteProduct}
            onEdit={(product) => {
              setEditingProduct(product);
              setProductForm(formFromProduct(product));
            }}
            onSubmit={handleProductSubmit}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchaseManager
            editingPurchase={editingPurchase}
            editingPurchaseItem={editingPurchaseItem}
            isAddingPurchase={isAddingPurchase}
            isAddingPurchaseItem={isAddingPurchaseItem}
            loading={loading}
            products={products}
            purchaseForm={purchaseForm}
            purchaseItemForm={purchaseItemForm}
            purchaseItems={purchaseItems}
            purchases={purchases}
            suppliers={suppliers}
            onAddPurchase={() => setIsAddingPurchase(true)}
            onAddPurchaseItem={() => setIsAddingPurchaseItem(true)}
            onCancelPurchaseEdit={() => {
              setEditingPurchase(null);
              setPurchaseForm(emptyPurchaseForm);
              setIsAddingPurchase(false);
            }}
            onCancelPurchaseItemEdit={() => {
              setEditingPurchaseItem(null);
              setPurchaseItemForm(emptyPurchaseItemForm);
              setIsAddingPurchaseItem(false);
            }}
            onChangePurchase={setPurchaseForm}
            onChangePurchaseItem={setPurchaseItemForm}
            onDeletePurchase={handleDeletePurchase}
            onDeletePurchaseItem={handleDeletePurchaseItem}
            onEditPurchase={(purchase) => {
              setEditingPurchase(purchase);
              setPurchaseForm(formFromPurchase(purchase));
            }}
            onEditPurchaseItem={(purchaseItem) => {
              setEditingPurchaseItem(purchaseItem);
              setPurchaseItemForm(formFromPurchaseItem(purchaseItem));
            }}
            onSubmitPurchase={handlePurchaseSubmit}
            onSubmitPurchaseItem={handlePurchaseItemSubmit}
          />
        )}

        {activeTab === 'sales' && (
          <SaleManager
            clients={clients}
            editingSale={editingSale}
            editingSaleItem={editingSaleItem}
            isAddingSale={isAddingSale}
            isAddingSaleItem={isAddingSaleItem}
            loading={loading}
            products={products}
            saleForm={saleForm}
            saleItemForm={saleItemForm}
            saleItems={saleItems}
            sales={sales}
            onAddSale={() => setIsAddingSale(true)}
            onAddSaleItem={() => setIsAddingSaleItem(true)}
            onCancelSaleEdit={() => {
              setEditingSale(null);
              setSaleForm(emptySaleForm);
              setIsAddingSale(false);
            }}
            onCancelSaleItemEdit={() => {
              setEditingSaleItem(null);
              setSaleItemForm(emptySaleItemForm);
              setIsAddingSaleItem(false);
            }}
            onChangeSale={setSaleForm}
            onChangeSaleItem={setSaleItemForm}
            onDeleteSale={handleDeleteSale}
            onDeleteSaleItem={handleDeleteSaleItem}
            onEditSale={(sale) => {
              setEditingSale(sale);
              setSaleForm(formFromSale(sale));
            }}
            onEditSaleItem={(saleItem) => {
              setEditingSaleItem(saleItem);
              setSaleItemForm(formFromSaleItem(saleItem));
            }}
            onSubmitSale={handleSaleSubmit}
            onSubmitSaleItem={handleSaleItemSubmit}
          />
        )}

        {activeTab === 'suppliers' && (
          <ContactManager
            contacts={suppliers}
            createLabel="Create supplier"
            editingContact={editingSupplier}
            emptyText="No suppliers found."
            eyebrow="Purchasing"
            form={supplierForm}
            loading={loading}
            title="Suppliers"
            icon="building"
            updateLabel="Update supplier"
            isAdding={isAddingSupplier}
            onAdd={() => setIsAddingSupplier(true)}
            onCancelEdit={() => {
              setEditingSupplier(null);
              setSupplierForm(emptyContactForm);
              setIsAddingSupplier(false);
            }}
            onChange={setSupplierForm}
            onDelete={handleDeleteSupplier}
            onEdit={(supplier) => {
              setEditingSupplier(supplier);
              setSupplierForm(formFromContact(supplier));
            }}
            onSubmit={handleSupplierSubmit}
          />
        )}

        {activeTab === 'clients' && (
          <ContactManager
            contacts={clients}
            createLabel="Create client"
            editingContact={editingClient}
            emptyText="No clients found."
            eyebrow="Sales"
            form={clientForm}
            loading={loading}
            title="Clients"
            icon="users"
            updateLabel="Update client"
            isAdding={isAddingClient}
            onAdd={() => setIsAddingClient(true)}
            onCancelEdit={() => {
              setEditingClient(null);
              setClientForm(emptyContactForm);
              setIsAddingClient(false);
            }}
            onChange={setClientForm}
            onDelete={handleDeleteClient}
            onEdit={(client) => {
              setEditingClient(client);
              setClientForm(formFromContact(client));
            }}
            onSubmit={handleClientSubmit}
          />
        )}
      </div>
    </div>
  );
}
