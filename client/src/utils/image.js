/**
 * Utility to resolve image paths (external URL, relative uploads, data URLs, blob URLs).
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  
  // If it's already a full URL, data URI, or blob URL, return as-is
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }

  // Ensure it starts with a slash
  const cleanPath = url.startsWith('/') ? url : `/${url}`;

  // If VITE_UPLOADS_URL is defined, use it to resolve uploads
  const uploadsBase = import.meta.env.VITE_UPLOADS_URL;
  if (uploadsBase) {
    const trimmedBase = uploadsBase.replace(/\/+$/, '');
    if (cleanPath.startsWith('/uploads/')) {
      const baseWithoutUploads = trimmedBase.replace(/\/uploads$/, '');
      return `${baseWithoutUploads}${cleanPath}`;
    }
    return `${trimmedBase}${cleanPath}`;
  }

  // Fallback to checking VITE_API_URL's host origin if set
  const apiBase = import.meta.env.VITE_API_URL;
  if (apiBase && apiBase.startsWith('http')) {
    try {
      const origin = new URL(apiBase).origin;
      return `${origin}${cleanPath}`;
    } catch (e) {
      console.error('Invalid VITE_API_URL for origin parsing:', e);
    }
  }

  // Fallback to relative path resolving on the frontend host
  return cleanPath;
};
