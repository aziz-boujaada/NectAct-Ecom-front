import type { AuthPayload, AuthResponse, ProfileFormValues } from '../types';

const meta = import.meta as any;
export const API_BASE_URL = meta.env?.VITE_API_BASE_URL ?? 'http://localhost:8000/api';
const TOKEN_KEY = 'nextact_auth_token';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: BodyInit | Record<string, unknown> | null;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers({ Accept: 'application/json' });
  const isFormData = options.body instanceof FormData;

  if (options.body && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? (isFormData ? options.body : JSON.stringify(options.body)) : undefined,
  });

  const data = (await response.json().catch(() => ({}))) as AuthResponse;

  if (!response.ok) {
    throw new ApiError(data.message ?? 'Request failed', response.status, data.errors);
  }

  return data as T;
}

function mergePermissionsIntoUser(data: AuthResponse) {
  if (!data.user) return null;

  const userWithPerms = { ...data.user };
  const topLevelPermissions = data.permissions;

  // Some backend responses return permissions at root level instead of user.permissions.
  if ((!userWithPerms.permissions || userWithPerms.permissions.length === 0) && topLevelPermissions?.length) {
    userWithPerms.permissions = topLevelPermissions;
  }

  return userWithPerms;
}

export const tokenStore = {
  get() {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

function persistAuthorization(authorization?: AuthPayload) {
  if (authorization?.token) {
    tokenStore.set(authorization.token);
  }
}

export async function register(payload: { name: string; email: string; password: string }) {
  const data = await request<AuthResponse>('/register', { method: 'POST', body: payload });
  persistAuthorization(data.authorization);
  return {
    ...data,
    user: mergePermissionsIntoUser(data) ?? undefined,
  };
}

export async function login(payload: { email: string; password: string }) {
  const data = await request<AuthResponse>('/login', { method: 'POST', body: payload });
  persistAuthorization(data.authorization);
  return {
    ...data,
    user: mergePermissionsIntoUser(data) ?? undefined,
  };
}

export async function fetchMe(token = tokenStore.get()) {
  if (!token) return null;
  const data = await request<AuthResponse>('/me', { token });
  return mergePermissionsIntoUser(data);
}

export async function updateProfile(payload: ProfileFormValues, token = tokenStore.get()) {
  const data = await request<AuthResponse>('/profile', { method: 'PUT', body: payload, token });
  return data.user;
}

export async function updatePassword(
  payload: { current_password: string; password: string; password_confirmation: string },
  token = tokenStore.get(),
) {
  return request<AuthResponse>('/password', { method: 'PUT', body: payload, token });
}

export async function refreshToken(token = tokenStore.get()) {
  const data = await request<AuthResponse>('/refresh', { method: 'POST', token });
  persistAuthorization(data.authorization);
  return data.authorization;
}

export async function logout(token = tokenStore.get()) {
  if (token) {
    await request<AuthResponse>('/logout', { method: 'POST', token }).catch(() => undefined);
  }
  tokenStore.clear();
}
