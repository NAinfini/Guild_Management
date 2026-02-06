// Use environment variable if set, otherwise default to /api
// This works for both local development and production
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Enable debug logging in development
const IS_DEV = import.meta.env.DEV;

// Import toast for error notifications
import { toast } from './toast';
import { useAuthStore } from '../store';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

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

// ETag cache for conditional requests (HTTP caching)
const etagCache = new Map<string, string>();

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
): Promise<T> {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`, window.location.origin);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  const requestUrl = url.toString();
  
  if (IS_DEV) {
    console.log(`[API] ${method} ${requestUrl}`);
    if (body) console.log('[API] Request body:', body);
  }

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add CSRF token for mutations (POST, PUT, PATCH, DELETE)
  if (method !== 'GET') {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
      if (IS_DEV) {
        console.log(`[API] Adding CSRF token: ${csrfToken.substring(0, 8)}...`);
      }
    }
  }

  // Add ETag for GET requests (conditional request)
  if (method === 'GET') {
    const cachedETag = etagCache.get(requestUrl);
    if (cachedETag) {
      headers['If-None-Match'] = cachedETag;
      if (IS_DEV) {
        console.log(`[API] Adding If-None-Match: ${cachedETag}`);
      }
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

    if (IS_DEV) {
      console.log(`[API] ${method} ${requestUrl} - Status: ${resp.status}`);
    }

    // Handle 304 Not Modified for GET requests
    if (resp.status === 304 && method === 'GET') {
      if (IS_DEV) {
        console.log(`[API] ${method} ${requestUrl} - 304 Not Modified (using cache)`);
      }
      // Return empty object - TanStack Query will use its cached data
      return {} as T;
    }

    // Store ETag for future requests
    if (method === 'GET') {
      const etag = resp.headers.get('ETag');
      if (etag) {
        etagCache.set(requestUrl, etag);
        if (IS_DEV) {
          console.log(`[API] Stored ETag: ${etag}`);
        }
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

    const data = (await resp.json()) as T;
    
    if (IS_DEV) {
      console.log(`[API] ${method} ${requestUrl} - Response:`, data);
    }
    
    // Unwrap worker response envelope: { success, data, error?, meta? }
    // If success: true, return data; if success: false, throw error
    if (typeof data === 'object' && data !== null && 'success' in data) {
      const envelope = data as { success: boolean; data?: T; error?: { message: string } };
      if (envelope.success && envelope.data !== undefined) {
        return envelope.data;
      }
      if (!envelope.success && envelope.error) {
        throw new APIError(
          envelope.error.message || 'Request failed',
          resp.status,
          requestUrl
        );
      }
      // Fallback: if success is true but no data, return empty object
      return {} as T;
    }
    
    return data;
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
  options?: RetryOptions
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const retryDelayMs = options?.retryDelayMs ?? 1000; // 1 second
  const retryOn = options?.retryOn ?? ((error: APIError) => error.status === 429 || error.status === 503); // Retry on Too Many Requests or Service Unavailable

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await request<T>(method, path, body, query);
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
  get: <T = any>(path: string, query?: Record<string, any>) =>
    apiRequestWithRetry<T>(path, 'GET', undefined, query),
    
  post: <T = any>(path: string, body?: any, query?: Record<string, any>) =>
    apiRequestWithRetry<T>(path, 'POST', body, query, { maxRetries: 2 }), // Fewer retries for mutations
    
  put: <T = any>(path: string, body?: any, query?: Record<string, any>) =>
    apiRequestWithRetry<T>(path, 'PUT', body, query, { maxRetries: 2 }),
    
  patch: <T = any>(path: string, body?: any, query?: Record<string, any>) =>
    apiRequestWithRetry<T>(path, 'PATCH', body, query, { maxRetries: 2 }),
    
  delete: <T = any>(path: string, query?: Record<string, any>) =>
    apiRequestWithRetry<T>(path, 'DELETE', undefined, query, { maxRetries: 2 }),

  upload: async <T = any>(path: string, file: File, extraFields?: Record<string, string>): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);
    if (extraFields) {
      Object.entries(extraFields).forEach(([k, v]) => formData.set(k, v));
    }
    
    // We don't use apiRequestWithRetry here because fetch handles FormData Content-Type automatically
    // and we don't want to JSON.stringify FormData.
    const url = new URL(`${API_BASE}${path}`, window.location.origin);
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
  get: <T = any>(path: string, query?: Record<string, any>) =>
    request<T>('GET', path, undefined, query),
    
  post: <T = any>(path: string, body?: any, query?: Record<string, any>) =>
    request<T>('POST', path, body, query),
    
  put: <T = any>(path: string, body?: any, query?: Record<string, any>) =>
    request<T>('PUT', path, body, query),
    
  patch: <T = any>(path: string, body?: any, query?: Record<string, any>) =>
    request<T>('PATCH', path, body, query),
    
  delete: <T = any>(path: string, query?: Record<string, any>) =>
    request<T>('DELETE', path, undefined, query),
};

export default api;
