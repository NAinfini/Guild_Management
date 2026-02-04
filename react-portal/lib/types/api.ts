export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

export interface ApiHeaders {
  etag?: string;
  [key: string]: string | undefined;
}

export interface ApiResponseEnvelope<T> {
  data: T | undefined;
  etag?: string;
  status: number;
  _responseHeaders: ApiHeaders;
}

export type ApiResponseWithPayload<T> = ApiResponseEnvelope<T> & (T extends object ? T : Record<string, never>);

export interface ApiErrorPayload {
  code?: string;
  message?: string;
  details?: unknown;
}

export interface ApiRequestOptions extends RequestInit {
  ifNoneMatch?: string;
}
