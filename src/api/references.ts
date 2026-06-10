import { request, tokenStore } from './auth';

export type ReferenceDateFormat = 'YYYY' | 'YYMM';

type ReferenceGenerateResponse = {
  status: string;
  message?: string;
  data?: {
    reference: string;
    prefix: string;
    date_format: ReferenceDateFormat;
  };
};

const authToken = () => tokenStore.get();

export async function generateReference(payload: { prefix: string; date_format: ReferenceDateFormat }) {
  const response = await request<ReferenceGenerateResponse>('/references/generate', {
    method: 'POST',
    token: authToken(),
    body: payload,
  });

  return response.data;
}
