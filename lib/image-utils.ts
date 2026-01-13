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
 * Normalize image URL to use the correct API base URL
 * Handles relative paths and fixes incorrect ports
 * @param imageUrl - The image URL from the API (can be relative or absolute)
 * @returns Normalized full URL
 */
export function normalizeImageUrl(
  imageUrl: string | null | undefined
): string | null {
  if (!imageUrl) {
    return null;
  }

  const baseUrl = getBaseUrl();

  // If it's already a full URL starting with http/https
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Fix incorrect localhost:3000 to use the correct base URL
    if (imageUrl.includes('localhost:3000')) {
      // Extract the path from the URL
      const urlObj = new URL(imageUrl);
      const path = urlObj.pathname;

      // Remove /api from baseUrl if path already starts with /api
      let urlToUse = baseUrl;
      if (baseUrl.endsWith('/api') && path.startsWith('/api')) {
        urlToUse = baseUrl.replace(/\/api$/, '');
      }

      return `${urlToUse}${path}`;
    }
    // If it's already a correct full URL, return as-is
    return imageUrl;
  }

  // If it's a relative path starting with /
  if (imageUrl.startsWith('/')) {
    // Remove /api from baseUrl if path already starts with /api
    let urlToUse = baseUrl;
    if (baseUrl.endsWith('/api') && imageUrl.startsWith('/api')) {
      urlToUse = baseUrl.replace(/\/api$/, '');
    } else if (!baseUrl.endsWith('/api') && imageUrl.startsWith('/api')) {
      // If baseUrl doesn't end with /api but path starts with /api, use baseUrl as-is
      urlToUse = baseUrl;
    }

    return `${urlToUse}${imageUrl}`;
  }

  // If it's a relative path without leading slash, prepend baseUrl
  return `${baseUrl}/${imageUrl}`;
}
