import { request, tokenStore } from './auth';
import type { Category, CategoryFormValues, Product, ProductFormValues, Supplier } from '../types';

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
  suppliers?: Supplier[];
};

function authToken() {
  return tokenStore.get();
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

export async function listSuppliers() {
  const data = await request<SupplierResponse>('/suppliers', { token: authToken() });
  return data.suppliers ?? [];
}
