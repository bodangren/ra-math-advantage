import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  PASSWORD_HASH_ITERATIONS,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  getAuthJwtSecret,
  signSessionToken,
  verifyPassword,
} from '@math-platform/core-auth';
import { fetchInternalQuery, internal } from '@/lib/convex/server';

interface LoginBody {
  username?: string;
  password?: string;
}

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const username = body.username?.trim();
  const password = body.password ?? '';

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  try {
    const credential = await fetchInternalQuery(internal.auth.getCredentialByUsernameIncludingInactive, { username });
    if (!credential) {
      return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 });
    }

    if (!credential.isActive) {
      return NextResponse.json({ error: 'Account is deactivated', code: 'deactivated' }, { status: 403 });
    }

    const isValidPassword = await verifyPassword(password, {
      salt: credential.passwordSalt,
      iterations: credential.passwordHashIterations ?? PASSWORD_HASH_ITERATIONS,
      passwordHash: credential.passwordHash,
    });

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 });
    }

    const token = await signSessionToken(
      {
        sub: credential.profileId,
        username: credential.username,
        role: credential.role,
        organizationId: credential.organizationId,
      },
      getAuthJwtSecret(),
      SESSION_TTL_SECONDS,
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Login route failed', error);
    return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 500 });
  }
}
