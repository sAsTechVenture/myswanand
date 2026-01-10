type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  method?: HttpMethod;
  token?: string | null;
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * Get the base API URL from environment variables
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side
    return process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }
  // Server-side
  return process.env.NEXT_PUBLIC_API_BASE_URL || '';
}

/**
 * Centralized API calling helper function
 * @param url - The API endpoint URL (relative or absolute)
 * @param options - Request options including method, token, body, and headers
 * @returns Promise with the response data
 */
export async function api<T = unknown>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  // Build full URL
  const baseUrl = getBaseUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const {
    method = 'GET',
    token,
    body,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(customHeaders || {}),
  };

  // Add authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Prepare request config
  const config: RequestInit = {
    method,
    headers,
    ...fetchOptions,
  };

  // Add body if provided (and not GET)
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(fullUrl, config);

    // Parse response
    let data: T;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // For non-JSON responses, return as text
      data = (await response.text()) as unknown as T;
    }

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    // Handle network errors or parsing errors
    if (error instanceof Error) {
      throw new Error(`API Request Failed: ${error.message}`);
    }
    throw new Error('API Request Failed: Unknown error');
  }
}

/**
 * Convenience methods for different HTTP methods
 */
export const apiClient = {
  get: <T = unknown>(
    url: string,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) => api<T>(url, { ...options, method: 'GET' }),

  post: <T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) => api<T>(url, { ...options, method: 'POST', body }),

  put: <T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) => api<T>(url, { ...options, method: 'PUT', body }),

  patch: <T = unknown>(
    url: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) => api<T>(url, { ...options, method: 'PATCH', body }),

  delete: <T = unknown>(
    url: string,
    options?: Omit<ApiRequestOptions, 'method' | 'body'>
  ) => api<T>(url, { ...options, method: 'DELETE' }),
};
