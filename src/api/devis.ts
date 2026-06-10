import { API_BASE_URL, request, tokenStore } from './auth';
import type {
  Client,
  Devis,
  DevisFormValues,
  DevisItemDraftValues,
  Sale,
} from '../types';
import type { PdfInvoiceResult } from './invoices';
import { normalizeReferencePrefix } from '../utils/referenceSettings';

type DevisListItem = Devis;

type DevisListResponse = {
  status: string;
  message?: string;
  data?: DevisListItem[] | {
    data?: DevisListItem[];
    total?: number;
    per_page?: number;
    current_page?: number;
    last_page?: number;
  };
  devises?: DevisListItem[] | {
    data?: DevisListItem[];
    current_page?: number;
    first_page_url?: string | null;
    from?: number | null;
    last_page?: number;
    last_page_url?: string | null;
    links?: Array<Record<string, unknown>>;
    next_page_url?: string | null;
    path?: string | null;
    per_page?: number;
    prev_page_url?: string | null;
    to?: number | null;
    total?: number;
  };
  meta?: {
    total?: number;
    per_page?: number;
    current_page?: number;
    last_page?: number;
  };
};

type DevisListMeta = {
  total?: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
};

type DevisResponse = {
  status: string;
  message?: string;
  devis?: Devis;
  data?: Devis | Sale | Devis[];
  sale?: Sale;
  client?: Client;
  timeline?: Devis['timeline'];
};

function authToken() {
  return tokenStore.get();
}

type DevisReferenceOptions = {
  referencePrefix?: string;
};

function devisPayload(payload: DevisFormValues) {
  return {
    client_id: Number(payload.client_id),
    expires_at: payload.expires_at || null,
    notes: payload.notes.trim() || null,
    discount: Number(payload.discount || 0),
    tax: Number(payload.tax || 0),
  };
}

function createDevisPayload(payload: DevisFormValues, options: DevisReferenceOptions = {}) {
  return {
    client_id: Number(payload.client_id),
    reference_prefix: normalizeReferencePrefix(options.referencePrefix || 'DEV'),
    status: 'draft',
    discount: Number(payload.discount || 0),
    tax: Number(payload.tax || 0),
    expires_at: payload.expires_at || null,
    notes: payload.notes.trim(),
  };
}

function devisItemDraftPayload(payload: DevisItemDraftValues) {
  return {
    product_id: Number(payload.product_id),
    price: payload.price,
    quantity: Number(payload.quantity),
  };
}

function extractArrayPayload(value: unknown, depth = 0): DevisListItem[] {
  if (Array.isArray(value)) return value as DevisListItem[];

  if (!value || typeof value !== 'object' || depth > 2) return [];

  const record = value as Record<string, unknown>;
  const directArrays = [record.data, record.items];

  for (const candidate of directArrays) {
    if (Array.isArray(candidate)) {
      return candidate as DevisListItem[];
    }
  }

  const nestedObjects = [record.data, record.items].filter(
    (candidate): candidate is Record<string, unknown> => Boolean(candidate) && typeof candidate === 'object' && !Array.isArray(candidate),
  );

  for (const candidate of nestedObjects) {
    const nested = extractArrayPayload(candidate, depth + 1);
    if (nested.length > 0) {
      return nested;
    }
  }

  return [];
}

function extractDevisItem(value: unknown, depth = 0): Devis | undefined {
  if (!value || typeof value !== 'object' || depth > 2) return undefined;

  const record = value as Record<string, unknown>;

  if (typeof record.id === 'number') {
    return value as Devis;
  }

  const directCandidates = [record.devis, record.data, record.item];
  for (const candidate of directCandidates) {
    if (candidate && typeof candidate === 'object') {
      const nested = extractDevisItem(candidate, depth + 1);
      if (nested) return nested;
    }
  }

  return undefined;
}

function extractDevisMeta(response: DevisListResponse): DevisListMeta {
  const record = response.devises && typeof response.devises === 'object' && !Array.isArray(response.devises)
    ? (response.devises as Record<string, unknown>)
    : response.data && typeof response.data === 'object' && !Array.isArray(response.data)
      ? (response.data as Record<string, unknown>)
    : undefined;

  return {
    total: (record?.total as number | undefined) ?? response.meta?.total,
    per_page: (record?.per_page as number | undefined) ?? response.meta?.per_page,
    current_page: (record?.current_page as number | undefined) ?? response.meta?.current_page,
    last_page: (record?.last_page as number | undefined) ?? response.meta?.last_page,
  };
}

function extractDevisList(response: DevisListResponse) {
  const data = extractArrayPayload(response.devises) || extractArrayPayload(response.data) || [];

  return {
    data,
    meta: extractDevisMeta(response),
  };
}

function readFilename(contentDisposition: string | null, fallback: string) {
  if (!contentDisposition) return fallback;

  const match = contentDisposition.match(/filename\*=UTF-8''([^;\n\r]+)|filename="?([^;\n\r"]+)"?/i);
  if (!match) return fallback;

  return decodeURIComponent(match[1] || match[2] || fallback);
}

async function readErrorMessage(response: Response) {
  const bodyText = await response.text().catch(() => '');

  if (!bodyText) {
    return response.statusText || 'Request failed';
  }

  try {
    const data = JSON.parse(bodyText) as { message?: string };
    return data.message || bodyText;
  } catch {
    return bodyText;
  }
}

export async function listDevises(page = 1) {
  return request<DevisListResponse>(`/devis?page=${page}`, { token: authToken() });
}

export function normalizeDevisList(response: DevisListResponse) {
  return extractDevisList(response);
}

export async function createDevis(
  payload: DevisFormValues,
  items: DevisItemDraftValues[] = [],
  options: DevisReferenceOptions = {},
) {
  const data = await request<DevisResponse>('/devis', {
    method: 'POST',
    token: authToken(),
    body: {
      ...createDevisPayload(payload, options),
      items: items.map(devisItemDraftPayload),
    },
  });

  return data.devis ?? extractDevisItem(data.data) ?? extractDevisItem(data);
}

export async function showDevis(id: number) {
  const data = await request<DevisResponse>(`/devis/${id}`, { token: authToken() });
  // Attempt to extract items array from various nested shapes
  function extractItems(value: unknown, depth = 0): Devis['items'] | undefined {
    if (!value || typeof value !== 'object' || depth > 3) return undefined;
    const record = value as Record<string, unknown>;

    // Direct arrays that look like line items
    for (const key of ['items', 'data', 'devises', 'devis', 'item']) {
      const candidate = record[key];
      if (Array.isArray(candidate) && candidate.length > 0) {
        const el = candidate[0];
        if (el && typeof el === 'object' && ('product_id' in (el as Record<string, unknown>) || 'price' in (el as Record<string, unknown>))) {
          return candidate as Devis['items'];
        }
      }
    }

    // Recurse into object fields
    for (const val of Object.values(record)) {
      if (val && typeof val === 'object') {
        const nested = extractItems(val, depth + 1);
        if (nested && nested.length > 0) return nested;
      }
    }

    return undefined;
  }

  const devisObj = data.devis ?? extractDevisItem(data.data) ?? extractDevisItem(data);
  const items = extractItems(data) ?? devisObj?.items;

  return {
    devis: devisObj,
    timeline: data.timeline ?? [],
    items: items ?? [],
  };
}

export async function updateDevis(id: number, payload: DevisFormValues) {
  const data = await request<DevisResponse>(`/devis/${id}`, {
    method: 'PUT',
    token: authToken(),
    body: devisPayload(payload),
  });

  return data.devis ?? extractDevisItem(data.data) ?? extractDevisItem(data);
}

export async function deleteDevis(id: number) {
  return request<DevisResponse>(`/devis/${id}`, { method: 'DELETE', token: authToken() });
}

export async function sendDevis(id: number) {
  const data = await request<DevisResponse>(`/devis/${id}/send`, {
    method: 'POST',
    token: authToken(),
  });

  return data.devis ?? extractDevisItem(data.data) ?? extractDevisItem(data);
}

export async function acceptDevis(id: number, options: DevisReferenceOptions = {}) {
  const data = await request<DevisResponse>(`/devis/${id}/accept`, {
    method: 'POST',
    token: authToken(),
    body: {
      reference_prefix: normalizeReferencePrefix(options.referencePrefix || 'FAC'),
    },
  });

  return {
    devis: data.devis ?? extractDevisItem(data.data) ?? extractDevisItem(data),
    sale: data.sale ?? (data.data as Sale | undefined),
  };
}

export async function rejectDevis(id: number) {
  const data = await request<DevisResponse>(`/devis/${id}/reject`, {
    method: 'POST',
    token: authToken(),
  });

  return data.devis ?? extractDevisItem(data.data) ?? extractDevisItem(data);
}

export async function convertDevisToSale(id: number, options: DevisReferenceOptions = {}) {
  const data = await request<DevisResponse>(`/devis/${id}/convert-to-sale`, {
    method: 'POST',
    token: authToken(),
    body: {
      reference_prefix: normalizeReferencePrefix(options.referencePrefix || 'FAC'),
    },
  });

  return {
    devis: data.devis ?? extractDevisItem(data.data) ?? extractDevisItem(data),
    sale: data.sale ?? (data.data as Sale | undefined),
  };
}

export async function generateDevisPdf(devisId: number): Promise<PdfInvoiceResult> {
  const headers = new Headers({ Accept: 'application/pdf' });
  const token = authToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/devis/${devisId}/pdf`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const message = await readErrorMessage(response);
    return {
      success: false,
      status: response.status,
      message,
    };
  }

  const blob = await response.blob();
  const filename = readFilename(response.headers.get('content-disposition'), `devis-${devisId}.pdf`);

  return {
    success: true,
    status: 200,
    filename,
    blob,
  };
}
