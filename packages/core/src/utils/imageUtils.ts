/**
 * Safely resolves an image URL.
 * If the URL is already a full URL (http/https), returns it as-is.
 * If it's a relative path, it is returned as-is for the platform to resolve.
 *
 * @param {string} url - The original image URL
 * @returns {string} - The safely resolved image URL
 */
export const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url;
};
