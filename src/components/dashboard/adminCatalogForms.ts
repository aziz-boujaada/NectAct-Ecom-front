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
  PurchaseItemDraftValues,
  PurchaseItemFormValues,
  Refund,
  RefundFormValues,
  Sale,
  SaleFormValues,
  SaleItemDraftValues,
  SaleItem,
  SaleItemFormValues,
  Supplier,
} from '../../types';

export const emptyCategoryForm: CategoryFormValues = {
  name: '',
  description: '',
};

export const emptyProductForm: ProductFormValues = {
  reference: '',
  name: '',
  description: '',
  image_path: '',
  price: '',
  stock: '0',
  min_stock: '0',
  security_stock: '0',
  category_id: '',
  supplier_id: '',
  image: null,
};

export const emptyPurchaseForm: PurchaseFormValues = {
  supplier_id: '',
  status: 'pending',
};

export const emptyPurchaseItemForm: PurchaseItemFormValues = {
  purchase_id: '',
  product_id: '',
  price: '',
  quantity: '1',
};

export const emptyPurchaseItemDraft: PurchaseItemDraftValues = {
  product_id: '',
  price: '',
  quantity: '1',
};

export const emptySaleForm: SaleFormValues = {
  client_id: '',
  status: 'unpaid',
};

export const emptySaleItemDraft: SaleItemDraftValues = {
  product_id: '',
  quantity: '1',
};

export const emptySaleItemForm: SaleItemFormValues = {
  sale_id: '',
  product_id: '',
  quantity: '1',
};

export const emptyRefundForm: RefundFormValues = {
  sale_id: '',
  reason: '',
  items: [{ product_id: '', quantity: '1' }],
};

export const emptyContactForm: ContactFormValues = {
  name: '',
  phone: '',
  address: '',
};

export function formFromCategory(category: Category): CategoryFormValues {
  return {
    name: category.name,
    description: category.description ?? '',
  };
}

export function formFromProduct(product: Product): ProductFormValues {
  return {
    reference: product.reference,
    name: product.name,
    description: product.description ?? '',
    image_path: product.image_path ?? '',
    price: String(product.price),
    stock: String(product.stock ?? 0),
    min_stock: String(product.min_stock ?? 0),
    security_stock: String(product.security_stock ?? 0),
    category_id: String(product.category_id),
    supplier_id: String(product.supplier_id),
    image: null,
  };
}

export function formFromPurchase(purchase: Purchase): PurchaseFormValues {
  return {
    supplier_id: String(purchase.supplier_id),
    status: purchase.status,
  };
}

export function formFromPurchaseItem(purchaseItem: PurchaseItem): PurchaseItemFormValues {
  return {
    purchase_id: String(purchaseItem.purchase_id),
    product_id: String(purchaseItem.product_id),
    price: String(purchaseItem.price),
    quantity: String(purchaseItem.quantity),
  };
}

export function formFromSale(sale: Sale): SaleFormValues {
  return {
    client_id: String(sale.client_id),
    status: sale.status,
  };
}

export function formFromSaleItem(saleItem: SaleItem): SaleItemFormValues {
  return {
    sale_id: String(saleItem.sale_id),
    product_id: String(saleItem.product_id),
    quantity: String(saleItem.quantity),
  };
}

export function formFromRefund(refund: Refund): RefundFormValues {
  return {
    sale_id: String(refund.sale_id),
    reason: refund.reason ?? '',
    items: refund.items?.map((item) => ({
      product_id: String(item.product_id),
      quantity: String(item.quantity),
    })) ?? [{ product_id: '', quantity: '1' }],
  };
}

export function formFromContact(contact: Client | Supplier): ContactFormValues {
  return {
    name: contact.name,
    phone: contact.phone ?? '',
    address: contact.address ?? '',
  };
}
