export type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
};

export type AuthMode = 'login' | 'register';

export type Status = { type: 'success' | 'error' | 'info'; text: string } | null;

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

export type CategoryFormValues = {
  name: string;
  description: string;
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
