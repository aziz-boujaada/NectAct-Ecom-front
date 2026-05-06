import { request, tokenStore } from './auth';
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
  Supplier,
} from '../types';

type CategoryResponse = {
  status: string;
  message?: string;
  category?: Category;
  categories?: Category[];
};

type ProductResponse = {
  status: string;
  message?: string;
  product?: Product;
  products?: Product[];
};

type SupplierResponse = {
  status: string;
  message?: string;
  supplier?: Supplier;
  suppliers?: Supplier[];
};

type PurchaseResponse = {
  status: string;
  message?: string;
  purchase?: Purchase;
  purchases?: Purchase[];
};

type PurchaseItemResponse = {
  status: string;
  message?: string;
  purchase_item?: PurchaseItem;
  purchase_items?: PurchaseItem[];
};

type SaleResponse = {
  status: string;
  message?: string;
  sale?: Sale;
  sales?: Sale[];
};

type SaleItemResponse = {
  status: string;
  message?: string;
  sale_item?: SaleItem;
  sale_items?: SaleItem[];
};

type ClientResponse = {
  status: string;
  message?: string;
  client?: Client;
  clients?: Client[];
};

function authToken() {
  return tokenStore.get();
}

function purchasePayload(payload: PurchaseFormValues) {
  return {
    supplier_id: Number(payload.supplier_id),
    status: payload.status,
  };
}

function purchaseItemPayload(payload: PurchaseItemFormValues) {
  return {
    purchase_id: Number(payload.purchase_id),
    product_id: Number(payload.product_id),
    quantity: Number(payload.quantity),
  };
}

function salePayload(payload: SaleFormValues) {
  return {
    client_id: Number(payload.client_id),
    status: payload.status,
  };
}

function saleItemPayload(payload: SaleItemFormValues) {
  return {
    sale_id: Number(payload.sale_id),
    product_id: Number(payload.product_id),
    quantity: Number(payload.quantity),
  };
}

function cleanNullable(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function productFormData(payload: ProductFormValues, method?: 'PUT') {
  const data = new FormData();

  if (method) {
    data.append('_method', method);
  }

  data.append('reference', payload.reference.trim());
  data.append('name', payload.name.trim());
  data.append('description', payload.description.trim());
  data.append('image_path', payload.image_path.trim());
  data.append('price', payload.price);
  data.append('stock', payload.stock || '0');
  data.append('min_stock', payload.min_stock || '0');
  data.append('category_id', payload.category_id);
  data.append('supplier_id', payload.supplier_id);

  if (payload.image) {
    data.append('image', payload.image);
  }

  return data;
}

export async function listCategories() {
  const data = await request<CategoryResponse>('/categories', { token: authToken() });
  return data.categories ?? [];
}

export async function createCategory(payload: CategoryFormValues) {
  const data = await request<CategoryResponse>('/categories', {
    method: 'POST',
    token: authToken(),
    body: {
      name: payload.name.trim(),
      description: cleanNullable(payload.description),
    },
  });
  return data.category;
}

export async function updateCategory(id: number, payload: CategoryFormValues) {
  const data = await request<CategoryResponse>(`/categories/${id}`, {
    method: 'PUT',
    token: authToken(),
    body: {
      name: payload.name.trim(),
      description: cleanNullable(payload.description),
    },
  });
  return data.category;
}

export async function deleteCategory(id: number) {
  return request<CategoryResponse>(`/categories/${id}`, { method: 'DELETE', token: authToken() });
}

export async function listProducts() {
  const data = await request<ProductResponse>('/products', { token: authToken() });
  return data.products ?? [];
}

export async function createProduct(payload: ProductFormValues) {
  const data = await request<ProductResponse>('/products', {
    method: 'POST',
    token: authToken(),
    body: productFormData(payload),
  });
  return data.product;
}

export async function updateProduct(id: number, payload: ProductFormValues) {
  const data = await request<ProductResponse>(`/products/${id}`, {
    method: 'POST',
    token: authToken(),
    body: productFormData(payload, 'PUT'),
  });
  return data.product;
}

export async function deleteProduct(id: number) {
  return request<ProductResponse>(`/products/${id}`, { method: 'DELETE', token: authToken() });
}

export async function listPurchases() {
  const data = await request<PurchaseResponse>('/purchases', { token: authToken() });
  return data.purchases ?? [];
}

export async function createPurchase(payload: PurchaseFormValues) {
  const data = await request<PurchaseResponse>('/purchases', {
    method: 'POST',
    token: authToken(),
    body: purchasePayload(payload),
  });
  return data.purchase;
}

export async function updatePurchase(id: number, payload: PurchaseFormValues) {
  const data = await request<PurchaseResponse>(`/purchases/${id}`, {
    method: 'PUT',
    token: authToken(),
    body: purchasePayload(payload),
  });
  return data.purchase;
}

export async function deletePurchase(id: number) {
  return request<PurchaseResponse>(`/purchases/${id}`, { method: 'DELETE', token: authToken() });
}

export async function listPurchaseItems() {
  const data = await request<PurchaseItemResponse>('/purchase-items', { token: authToken() });
  return data.purchase_items ?? [];
}

export async function createPurchaseItem(payload: PurchaseItemFormValues) {
  const data = await request<PurchaseItemResponse>('/purchase-items', {
    method: 'POST',
    token: authToken(),
    body: purchaseItemPayload(payload),
  });
  return data.purchase_item;
}

export async function updatePurchaseItem(id: number, payload: PurchaseItemFormValues) {
  const data = await request<PurchaseItemResponse>(`/purchase-items/${id}`, {
    method: 'PUT',
    token: authToken(),
    body: purchaseItemPayload(payload),
  });
  return data.purchase_item;
}

export async function deletePurchaseItem(id: number) {
  return request<PurchaseItemResponse>(`/purchase-items/${id}`, { method: 'DELETE', token: authToken() });
}

export async function listSales() {
  const data = await request<SaleResponse>('/sales', { token: authToken() });
  return data.sales ?? [];
}

export async function createSale(payload: SaleFormValues) {
  const data = await request<SaleResponse>('/sales', {
    method: 'POST',
    token: authToken(),
    body: salePayload(payload),
  });
  return data.sale;
}

export async function updateSale(id: number, payload: SaleFormValues) {
  const data = await request<SaleResponse>(`/sales/${id}`, {
    method: 'PUT',
    token: authToken(),
    body: salePayload(payload),
  });
  return data.sale;
}

export async function deleteSale(id: number) {
  return request<SaleResponse>(`/sales/${id}`, { method: 'DELETE', token: authToken() });
}

export async function listSaleItems() {
  const data = await request<SaleItemResponse>('/sale-items', { token: authToken() });
  return data.sale_items ?? [];
}

export async function createSaleItem(payload: SaleItemFormValues) {
  const data = await request<SaleItemResponse>('/sale-items', {
    method: 'POST',
    token: authToken(),
    body: saleItemPayload(payload),
  });
  return data.sale_item;
}

export async function updateSaleItem(id: number, payload: SaleItemFormValues) {
  const data = await request<SaleItemResponse>(`/sale-items/${id}`, {
    method: 'PUT',
    token: authToken(),
    body: saleItemPayload(payload),
  });
  return data.sale_item;
}

export async function deleteSaleItem(id: number) {
  return request<SaleItemResponse>(`/sale-items/${id}`, { method: 'DELETE', token: authToken() });
}

export async function listSuppliers() {
  const data = await request<SupplierResponse>('/suppliers', { token: authToken() });
  return data.suppliers ?? [];
}

export async function createSupplier(payload: ContactFormValues) {
  const data = await request<SupplierResponse>('/suppliers', {
    method: 'POST',
    token: authToken(),
    body: {
      name: payload.name.trim(),
      phone: cleanNullable(payload.phone),
      address: cleanNullable(payload.address),
    },
  });
  return data.supplier;
}

export async function updateSupplier(id: number, payload: ContactFormValues) {
  const data = await request<SupplierResponse>(`/suppliers/${id}`, {
    method: 'PUT',
    token: authToken(),
    body: {
      name: payload.name.trim(),
      phone: cleanNullable(payload.phone),
      address: cleanNullable(payload.address),
    },
  });
  return data.supplier;
}

export async function deleteSupplier(id: number) {
  return request<SupplierResponse>(`/suppliers/${id}`, { method: 'DELETE', token: authToken() });
}

export async function listClients() {
  const data = await request<ClientResponse>('/clients', { token: authToken() });
  return data.clients ?? [];
}

export async function createClient(payload: ContactFormValues) {
  const data = await request<ClientResponse>('/clients', {
    method: 'POST',
    token: authToken(),
    body: {
      name: payload.name.trim(),
      phone: cleanNullable(payload.phone),
      address: cleanNullable(payload.address),
    },
  });
  return data.client;
}

export async function updateClient(id: number, payload: ContactFormValues) {
  const data = await request<ClientResponse>(`/clients/${id}`, {
    method: 'PUT',
    token: authToken(),
    body: {
      name: payload.name.trim(),
      phone: cleanNullable(payload.phone),
      address: cleanNullable(payload.address),
    },
  });
  return data.client;
}

export async function deleteClient(id: number) {
  return request<ClientResponse>(`/clients/${id}`, { method: 'DELETE', token: authToken() });
}
