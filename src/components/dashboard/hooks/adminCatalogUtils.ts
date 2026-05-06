import { ApiError } from '../../../api/auth';

export function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const firstValidationError = error.errors ? Object.values(error.errors).flat()[0] : undefined;
    return firstValidationError ?? error.message;
  }

  return error instanceof Error ? error.message : 'Catalog request failed';
}
