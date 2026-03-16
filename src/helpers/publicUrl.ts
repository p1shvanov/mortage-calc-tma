/**
 * Returns a complete public URL for a path, respecting Vite base and origin.
 * Used for TON Connect manifest and other static assets.
 * @param path - path relative to base (e.g. 'tonconnect-manifest.json')
 */
export function publicUrl(path: string): string {
  let baseUrl = import.meta.env.BASE_URL;
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }

  let isBaseAbsolute = false;
  try {
    new URL(baseUrl);
    isBaseAbsolute = true;
  } catch {
    // baseUrl is relative
  }

  return new URL(
    path.replace(/^\/+/, ''),
    isBaseAbsolute ? baseUrl : window.location.origin + baseUrl,
  ).toString();
}
