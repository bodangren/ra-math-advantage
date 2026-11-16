import { getConvexUrl } from '@math-platform/core-convex';

export function getServerConvexUrl(env: Record<string, string | undefined>): string {
  const url = getConvexUrl(env);
  if (env.NODE_ENV === 'production') {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)) {
      throw new Error('Set a hosted HTTPS Convex URL for the production environment.');
    }
  }
  return url;
}
