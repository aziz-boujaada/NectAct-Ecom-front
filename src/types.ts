export type User = {
  id: number;
  name: string;
  email: string;
  role?: UserRole;
  permissions?: Array<
    | string
    | {
        id?: number;
        name?: string;
        slug?: string;
        description?: string;
      }
  >;
  created_at?: string;
  updated_at?: string;
};

export type UserRole = 'admin' | 'employee';

export type AlertType = 'low_stock' | 'out_of_stock' | 'warning' | 'info';

export type Alert = {
  id: number;
  type: AlertType;
  stock?: number | null;
  alert_stock?: number | null;
  product: string;
  product_id?: number | null;
  is_read: 0 | 1;
  created_at: string;
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
  role: UserRole;
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
  security_stock?: number | null;
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

export type Invoice = {
  sale: Sale;
  items?: SaleItem[];
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

export type StockMovement = {
  id: number;
  product_id: number;
  quantity: number;
  type: 'in' | 'out' | string;
  source?: 'purchase' | 'sale' | 'refund' | string | null;
  reference_id?: number | null;
  product?: Product | null;
  created_at?: string;
  updated_at?: string;
};

export type DashboardStats = {
  summary: {
    gross_sales: string;
    total_refunds: string;
    net_sales: string;
    total_purchases: string;
    estimated_profit: string;
  };
  counts: {
    sales: number;
    refunds: number;
    purchases: number;
    products: number;
    clients: number;
    suppliers: number;
    low_stock_products: number;
  };
  today: {
    sales: number;
    sales_total: string;
    refunds: number;
    refunds_total: string;
  };
  current_month: {
    sales_total: string;
    refunds_total: string;
    purchases_total: string;
  };
  sales_by_status: Record<SaleStatus, number>;
  purchases_by_status: Record<PurchaseStatus, number>;
  top_selling_products: Array<{
    id: number;
    reference?: string | null;
    name: string;
    quantity_sold: number;
    sales_total: string;
  }>;
  low_stock_products: Array<{
    id: number;
    reference?: string | null;
    name: string;
    stock: number | null;
    min_stock: number | null;
  }>;
  recent_sales: Array<Pick<Sale, 'id' | 'client_id' | 'total' | 'status' | 'created_at'> & {
    reference?: string | null;
    client?: Pick<Client, 'id' | 'name'> | null;
  }>;
  recent_refunds: Array<Pick<Refund, 'id' | 'sale_id' | 'total' | 'reason' | 'created_at'> & {
    sale?: {
      id: number;
      reference?: string | null;
      client_id: number;
      client?: Pick<Client, 'id' | 'name'> | null;
    } | null;
  }>;
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
  security_stock: string;
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

export type PurchaseItemDraftValues = {
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

export type SaleItemDraftValues = {
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
  permissions?: Array<
    | string
    | {
        id?: number;
        name?: string;
        slug?: string;
        description?: string;
      }
  >;
  authorization?: AuthPayload;
  errors?: Record<string, string[]>;
};
