const DEFAULT_LOCAL_CONVEX_HOST = '127.0.0.1';
const DEFAULT_LOCAL_CONVEX_PORT = '3210';

export const DEFAULT_LOCAL_CONVEX_URL = `http://${DEFAULT_LOCAL_CONVEX_HOST}:${DEFAULT_LOCAL_CONVEX_PORT}`;
type EnvLike = Record<string, string | undefined>;

/**
 * Normalizes a URL by trimming whitespace and removing trailing slashes.
 * @param {string} url - URL string to normalize
 * @returns {string} - Normalized URL string
 */
function normalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

/**
 * Gets the configured Convex URL from env vars or returns null.
 * @param {EnvLike} env - Environment object
 * @returns {string | null} - Configured URL or null if not set
 */
function getConfiguredConvexUrl(env: EnvLike): string | null {
  const configuredUrl = env.CONVEX_URL?.trim() || env.NEXT_PUBLIC_CONVEX_URL?.trim();
  return configuredUrl ? normalizeUrl(configuredUrl) : null;
}

/**
 * Gets the Convex deployment URL from env or local default.
 * @param {EnvLike} env - Environment object (defaults to process.env)
 * @returns {string} - Convex URL string
 */
export function getConvexUrl(env: EnvLike = process.env): string {
  return getConfiguredConvexUrl(env) ?? DEFAULT_LOCAL_CONVEX_URL;
}