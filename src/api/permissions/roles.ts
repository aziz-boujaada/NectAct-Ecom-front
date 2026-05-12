import { tokenStore } from '../auth';
import type { User, Permission, ApiResponse, ApiListResponse } from '../../types/permissions';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

function getHeaders() {
  const token = tokenStore.get();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API Error: ${response.statusText}`);
  }

  const json = await response.json();
  return json.data;
}

// ========== Permissions ==========
export async function getPermissions(): Promise<Permission[]> {
  return request<Permission[]>('/permissions');
}

// ========== Users (Employees) ==========
export async function getUsers(): Promise<User[]> {
  return request<User[]>('/users');
}

export async function getUserById(id: number): Promise<User> {
  return request<User>(`/users/${id}`);
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  return request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(
  id: number,
  data: {
    name?: string;
    email?: string;
    password?: string;
role?: string 
  }
): Promise<User> {
  return request<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: number): Promise<void> {
  return request<void>(`/users/${id}`, {
    method: 'DELETE',
  });
}

export async function assignPermissionsToUser(
  userId: number,
  permissionIds: number[]
): Promise<User> {
  return request<User>(`/users/${userId}/permissions`, {
    method: 'POST',
    body: JSON.stringify({ permissions: permissionIds }),
  });
}
