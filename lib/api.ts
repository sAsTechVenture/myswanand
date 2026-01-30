type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  method?: HttpMethod;
  token?: string | null;
  body?: unknown | FormData;
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

  // Check if body is FormData
  const isFormData = body instanceof FormData;

  // Build headers
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(customHeaders || {}),
  };

  // Only set Content-Type for JSON, not for FormData (browser will set it with boundary)
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Add authorization header if token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Prepare request config
  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
    ...fetchOptions,
  };

  // Add body if provided (and not GET)
  if (body && method !== 'GET') {
    if (isFormData) {
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
    }
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
      // Try to extract error message from response
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;

      // If response is JSON, try to get the message
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = data as any;
          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If parsing fails, use default message
        }
      }

      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).data = data;
      throw error;
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

/**
 * Send OTP to mobile number (Twilio Verify).
 * Phone should include country code, e.g., +919876543210
 *
 * Endpoint: POST /patient/otp/send
 * Body: { "phone": "+919876543210" }
 */
export function sendOtp(
  phone: string
): Promise<ApiResponse<{ success: boolean; data?: unknown }>> {
  return apiClient.post('/patient/otp/send', { phone });
}

/**
 * Verify OTP and return JWT token on success.
 * This endpoint works for both:
 * - OTP registration verification (sets emailVerified: true and returns JWT)
 * - OTP login (returns JWT for existing verified user)
 *
 * Endpoint: POST /patient/otp/verify
 * Body: { "phone": "+919876543210", "otp": "123456" }
 */
export function verifyOtp(
  phone: string,
  otp: string
): Promise<
  ApiResponse<{
    success: boolean;
    data?: { token: string; user?: Record<string, unknown> };
  }>
> {
  return apiClient.post('/patient/otp/verify', { phone, otp });
}
