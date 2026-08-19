import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from '@math-platform/core-auth';

export function getSafePostSignInRedirect(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/';
  try {
    const url = new URL(value, 'https://danielson.invalid');
    return url.origin === 'https://danielson.invalid' ? value : '/';
  } catch {
    return '/';
  }
}

export function buildDanielsonSessionCookieOptions(env: { NODE_ENV?: string } = process.env) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  };
}

export function clearDanielsonSessionCookieOptions(env: { NODE_ENV?: string } = process.env) {
  return {
    ...buildDanielsonSessionCookieOptions(env),
    expires: new Date(0),
    maxAge: 0,
  };
}

export { SESSION_COOKIE_NAME };
