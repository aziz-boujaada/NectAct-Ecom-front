export type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
};

export type AuthMode = 'login' | 'register';

export type Status = { type: 'success' | 'error' | 'info' | 'failed'; text: string } | null;

export type LoginFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export type ProfileFormValues = {
  name: string;
  email: string;
};

export type PasswordFormValues = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export type Category = {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Supplier = {
  id: number;
  name: string;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Client = {
  id: number;
  name: string;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Product = {
  id: number;
  reference: string;
  name: string;
  description?: string | null;
  image_path?: string | null;
  price: string | number;
  stock?: number | null;
  min_stock?: number | null;
  category_id: number;
  supplier_id: number;
  category?: Category | null;
  supplier?: Supplier | null;
  created_at?: string;
  updated_at?: string;
};

export type PurchaseStatus = 'pending' | 'confirmed';

export type Purchase = {
  id: number;
  supplier_id: number;
  total?: string | number | null;
  status: PurchaseStatus;
  supplier?: Supplier | null;
  items?: PurchaseItem[];
  created_at?: string;
  updated_at?: string;
};

export type PurchaseItem = {
  id: number;
  purchase_id: number;
  product_id: number;
  price: string | number;
  quantity: number;
  total?: string | number | null;
  purchase?: Purchase | null;
  product?: Product | null;
  created_at?: string;
  updated_at?: string;
};

export type SaleStatus = 'paid' | 'unpaid' | 'refunded';

export type Sale = {
  id: number;
  client_id: number;
  total?: string | number | null;
  status: SaleStatus;
  client?: Client | null;
  items?: SaleItem[];
  refunds?: Refund[];
  created_at?: string;
  updated_at?: string;
};

export type SaleItem = {
  id: number;
  sale_id: number;
  product_id: number;
  price: string | number;
  quantity: number;
  total?: string | number | null;
  sale?: Sale | null;
  product?: Product | null;
  created_at?: string;
  updated_at?: string;
};

export type Refund = {
  id: number;
  sale_id: number;
  total?: string | number | null;
  reason?: string | null;
  sale?: Sale | null;
  items?: RefundItem[];
  created_at?: string;
  updated_at?: string;
};

export type RefundItem = {
  id: number;
  refund_id: number;
  product_id: number;
  price: string | number;
  quantity: number;
  total?: string | number | null;
  refund?: Refund | null;
  product?: Product | null;
};

export type CategoryFormValues = {
  name: string;
  description: string;
};

export type ContactFormValues = {
  name: string;
  phone: string;
  address: string;
};

export type ProductFormValues = {
  reference: string;
  name: string;
  description: string;
  image_path: string;
  price: string;
  stock: string;
  min_stock: string;
  category_id: string;
  supplier_id: string;
  image: File | null;
};

export type PurchaseFormValues = {
  supplier_id: string;
  status: PurchaseStatus;
};

export type PurchaseItemFormValues = {
  purchase_id: string;
  product_id: string;
  price: string;
  quantity: string;
};

export type SaleFormValues = {
  client_id: string;
  status: SaleStatus;
};

export type SaleItemFormValues = {
  sale_id: string;
  product_id: string;
  quantity: string;
};

export type RefundItemFormValues = {
  product_id: string;
  quantity: string;
};

export type RefundFormValues = {
  sale_id: string;
  reason: string;
  items: RefundItemFormValues[];
};

export type AuthPayload = {
  token: string;
  type: string;
  expires_in: number;
};

export type AuthResponse = {
  status: string;
  message?: string;
  user?: User;
  authorization?: AuthPayload;
  errors?: Record<string, string[]>;
};
