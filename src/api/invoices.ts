import { API_BASE_URL, tokenStore } from './auth';

export type PdfInvoiceResult =
  | {
      success: true;
      status: 200;
      filename: string;
      blob: Blob;
      fileUrl?: string;
    }
  | {
      success: false;
      status: number;
      message: string;
    };

function parseFilename(contentDisposition: string | null, fallback: string) {
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

export async function generatePurchaseInvoice(purchaseId: number): Promise<PdfInvoiceResult> {
  const headers = new Headers({ Accept: 'application/pdf' });
  const token = tokenStore.get();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/invoices/purchases/${purchaseId}/generate`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    const message =
      response.status === 403
        ? 'Forbidden'
        : response.status === 404
          ? 'Not Found'
          : await readErrorMessage(response);

    return {
      success: false,
      status: response.status,
      message,
    };
  }

  const blob = await response.blob();
  const filename = parseFilename(response.headers.get('content-disposition'), `purchase-invoice-${purchaseId}.pdf`);

  return {
    success: true,
    status: 200,
    filename,
    blob,
  };
}