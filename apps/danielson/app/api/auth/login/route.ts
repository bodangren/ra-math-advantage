import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { buildDanielsonSessionCookieOptions, getSafePostSignInRedirect } from '@/lib/auth/login-policy';
import { authenticateDanielsonLogin } from '@/lib/auth/login-service';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const data = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  const username = typeof data.username === 'string' ? data.username.trim().toLowerCase() : '';
  const password = typeof data.password === 'string' ? data.password : '';
  if (!username || !password) return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });

  try {
    const result = await authenticateDanielsonLogin(request, { username, password });
    if (result.kind === 'invalid_credentials') {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }
    if (result.kind === 'rate_limited') {
      return NextResponse.json(
        { error: 'Too many sign-in attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(result.retryAfterSeconds) } },
      );
    }
    const requestedRedirect = getSafePostSignInRedirect(
      typeof data.redirect === 'string'
        ? data.redirect
        : new URL(request.url).searchParams.get('redirect'),
    );
    const redirect = result.mustChangePassword ? '/auth/change-password' : requestedRedirect;
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, result.sessionToken, buildDanielsonSessionCookieOptions());
    return NextResponse.json({ ok: true, redirect });
  } catch {
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
  }
}
