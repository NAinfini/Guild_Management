// Enable debug logging in development
const IS_DEV = import.meta.env.DEV;

// In dev, default to real backend origin instead of localhost relative /api.
// Can be overridden via VITE_API_BASE_URL.
const DEV_API_ORIGIN = import.meta.env.VITE_DEV_API_ORIGIN || 'https://guild-management.na-infini.workers.dev';
const DEFAULT_API_BASE = IS_DEV ? `${DEV_API_ORIGIN}/api` : '/api';
const API_BASE = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE;

// Import toast for error notifications
import { toast } from './toast';
import { useAuthStore } from '../store';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
interface RequestOptions {
  headers?: Record<string, string>;
}

export class APIError extends Error {
  status?: number;
  url?: string;
  constructor(message: string, status?: number, url?: string) {
    super(message);
    this.status = status;
    this.url = url;
    this.name = 'APIError';
  }
}

// Response cache for conditional requests (HTTP caching)
const responseCache = new Map<string, { etag: string, data: any }>();

// Get CSRF token from auth store
function getCSRFToken(): string | null {
  try {
    return useAuthStore.getState().csrfToken;
  } catch {
    return null;
  }
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: any,
  query?: Record<string, string | number | boolean | undefined>,
  options?: RequestOptions,
): Promise<T> {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  const requestUrl = url.toString();

  // Build headers.
  // Avoid forcing Content-Type on GET/no-body requests to reduce CORS preflight issues.
  const headers: Record<string, string> = { ...(options?.headers || {}) };
  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
  }

  // Add CSRF token for mutations (POST, PUT, PATCH, DELETE)
  if (method !== 'GET') {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;

    }
  }

  // Add ETag for GET requests (conditional request)
  if (method === 'GET') {
    const cached = responseCache.get(requestUrl);
    if (cached?.etag) {
      headers['If-None-Match'] = cached.etag;
    }
  }

  try {
        const resp = await fetch(requestUrl, {
      method,
      headers,
      credentials: 'include',
      mode: 'cors',
      body: body ? JSON.stringify(body) : undefined,
    });



    // Handle 304 Not Modified for GET requests
    if (resp.status === 304 && method === 'GET') {
      const cached = responseCache.get(requestUrl);
      if (cached?.data) {
        return cached.data as T;
      }
    }



    // Handle non-OK responses
    if (!resp.ok) {
      let errorData: any = {};
      try {
        errorData = await resp.json();
      } catch {
        // If error response is not JSON, use status text
        errorData = { message: resp.statusText };
      }

      // Enhanced error messages based on status code
      let userMessage = errorData.message || (errorData.error?.message) || 'An error occurred';
      
      switch (resp.status) {
        case 400:
          userMessage = `Invalid request: ${userMessage}`;
          break;
        case 401:
          // Use backend message if available (e.g. "Incorrect credentials"), otherwise default
          userMessage = userMessage !== 'An error occurred' ? userMessage : 'Session expired. Please log in again.';
          break;
        case 403:
          userMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          userMessage = 'The requested resource was not found.';
          break;
        case 409:
          userMessage = `Conflict: ${errorData.message || 'The resource has been modified by someone else'}`;
          break;
        case 429:
          userMessage = 'Too many requests. Please slow down and try again in a moment.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          userMessage = 'Server error. Please try again later.';
          break;
        default:
          userMessage = errorData.message || `Request failed with status ${resp.status}`;
      }

      throw new APIError(
        userMessage,
        resp.status,
        requestUrl
      );
    }

    const rawData = await resp.json();

    // Unwrap worker response envelope: { success, data, error?, meta? }
    // If success: true, return data; if success: false, throw error
    let finalData: T;
    if (typeof rawData === 'object' && rawData !== null && 'success' in rawData) {
      const envelope = rawData as { success: boolean; data?: T; error?: { message: string } };
      if (!envelope.success && envelope.error) {
        throw new APIError(
          envelope.error.message || 'Request failed',
          resp.status,
          requestUrl
        );
      }
      finalData = (envelope.data !== undefined ? envelope.data : {}) as T;
    } else {
      finalData = rawData as T;
    }

    // Store ETag and unwrapped data for 304 cache
    if (method === 'GET') {
      const etag = resp.headers.get('ETag');
      if (etag) {
        responseCache.set(requestUrl, { etag, data: finalData });
      }
    }

    return finalData;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    // Network or parsing error
    if (IS_DEV) {
      console.error(`[API] Network error for ${method} ${requestUrl}:`, error);
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Network request failed',
      undefined,
      requestUrl
    );
  }
}

interface RetryOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  retryOn?: (error: APIError) => boolean;
}

async function apiRequestWithRetry<T>(
  path: string,
  method: HttpMethod,
  body?: any,
  query?: Record<string, any>,
  options?: RetryOptions & RequestOptions
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const retryDelayMs = options?.retryDelayMs ?? 1000; // 1 second
  const retryOn = options?.retryOn ?? ((error: APIError) => error.status === 429 || error.status === 503); // Retry on Too Many Requests or Service Unavailable

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await request<T>(method, path, body, query, options);
    } catch (error) {
      if (error instanceof APIError && retryOn(error) && i < maxRetries) {
        if (IS_DEV) {
          console.warn(`[API] Retrying ${method} ${path} (attempt ${i + 1}/${maxRetries}). Error: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, retryDelayMs * (i + 1))); // Exponential backoff
      } else {
        // Show toast for final error (won't retry)
        if (error instanceof APIError) {
          // Error handling logic moved to global QueryClient or component level
          // to avoid duplicate toasts.
          
          /* 
          // Original toast logic removed
          if (error.status === 401) {
             toast.error(error.message);
          } else if (error.status === 429) {
             toast.apiError(error);
          } else if (error.status && error.status >= 500) {
             toast.error(error.message, 8000);
          } else if (error.status === 403) {
             toast.warning(error.message);
          }
          */
          // For other errors (400, 404, 409) let the component handle them
        }
        throw error; // Re-throw if not retryable or max retries reached
      }
    }
  }
  // Should not be reached, but for type safety
  throw new APIError('Max retries reached and request failed', undefined, path);
}

/**
 * Public API methods with retry logic
 */
export const api = {
  get: <T = any>(path: string, query?: Record<string, any>, options?: RequestOptions) =>
    apiRequestWithRetry<T>(path, 'GET', undefined, query, options),
    
  post: <T = any>(path: string, body?: any, query?: Record<string, any>, options?: RequestOptions) =>
    apiRequestWithRetry<T>(path, 'POST', body, query, { maxRetries: 2, ...(options || {}) }), // Fewer retries for mutations
    
  put: <T = any>(path: string, body?: any, query?: Record<string, any>, options?: RequestOptions) =>
    apiRequestWithRetry<T>(path, 'PUT', body, query, { maxRetries: 2, ...(options || {}) }),
    
  patch: <T = any>(path: string, body?: any, query?: Record<string, any>, options?: RequestOptions) =>
    apiRequestWithRetry<T>(path, 'PATCH', body, query, { maxRetries: 2, ...(options || {}) }),
    
  delete: <T = any>(path: string, query?: Record<string, any>, options?: RequestOptions) =>
    apiRequestWithRetry<T>(path, 'DELETE', undefined, query, { maxRetries: 2, ...(options || {}) }),

  upload: async <T = any>(path: string, file: File, extraFields?: Record<string, string>): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);
    if (extraFields) {
      Object.entries(extraFields).forEach(([k, v]) => formData.set(k, v));
    }
    
    // We don't use apiRequestWithRetry here because fetch handles FormData Content-Type automatically
    // and we don't want to JSON.stringify FormData.
    const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`, window.location.origin);
    const headers: Record<string, string> = {};
    
    const csrfToken = getCSRFToken();
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

    const resp = await fetch(url.toString(), {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({ message: resp.statusText }));
      throw new APIError(errorData.message || 'Upload failed', resp.status, url.toString());
    }

    const data = await resp.json();
    return (data as any).success ? (data as any).data : data;
  },
};

/**
 * Direct API request without retries (for special cases)
 */
export const apiDirect = {
  get: <T = any>(path: string, query?: Record<string, any>, options?: RequestOptions) =>
    request<T>('GET', path, undefined, query, options),
    
  post: <T = any>(path: string, body?: any, query?: Record<string, any>, options?: RequestOptions) =>
    request<T>('POST', path, body, query, options),
    
  put: <T = any>(path: string, body?: any, query?: Record<string, any>, options?: RequestOptions) =>
    request<T>('PUT', path, body, query, options),
    
  patch: <T = any>(path: string, body?: any, query?: Record<string, any>, options?: RequestOptions) =>
    request<T>('PATCH', path, body, query, options),
    
  delete: <T = any>(path: string, query?: Record<string, any>, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, query, options),
};

export default api;
