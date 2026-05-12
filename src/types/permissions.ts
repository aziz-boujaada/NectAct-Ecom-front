/**
 * Permission System Types
 * Based on actual backend API structure
 */

export interface Permission {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  permissions?: Permission[];
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PermissionCategory {
  name: string;
  permissions: Permission[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface ApiListResponse<T> {
  data: T[];
  message: string;
}
