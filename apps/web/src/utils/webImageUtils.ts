import { resolveImageUrl as coreResolveImageUrl } from '@hastkala/core';

/**
 * Web-specific image URL resolver.
 * Extends the core resolveImageUrl with Vite's BASE_URL handling
 * for relative paths starting with '/'.
 */
export const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  // Delegate full URLs to core
  if (url.startsWith('http')) return coreResolveImageUrl(url);
  // Handle Vite base path for local static assets
  if (url.startsWith('/')) {
    const base = import.meta.env.BASE_URL;
    if (base.endsWith('/')) {
      return `${base}${url.slice(1)}`;
    }
    return `${base}${url}`;
  }
  return url;
};
