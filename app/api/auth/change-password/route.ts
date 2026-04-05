import { NextResponse } from 'next/server';

import { PASSWORD_HASH_ITERATIONS } from '@/lib/auth/constants';
import { validatePasswordForRole } from '@/lib/auth/password-policy';
import { getRequestSessionClaims } from '@/lib/auth/server';
import { generatePasswordSalt, hashPassword, verifyPassword } from '@/lib/auth/session';
import { fetchInternalMutation, fetchInternalQuery, internal } from '@/lib/convex/server';

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export async function POST(request: Request) {
  const claims = await getRequestSessionClaims(request);
  if (!claims) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ChangePasswordBody;
  try {
    body = (await request.json()) as ChangePasswordBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const currentPassword = body.currentPassword ?? '';
  const newPassword = body.newPassword ?? '';
  const confirmPassword = body.confirmPassword ?? '';

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: 'All password fields are required' }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'New passwords do not match' }, { status: 400 });
  }

  const policyError = validatePasswordForRole(claims.role, newPassword);
  if (policyError) {
    return NextResponse.json({ error: policyError }, { status: 400 });
  }

  try {
    const credential = await fetchInternalQuery(internal.auth.getCredentialByUsername, {
      username: claims.username,
    });

    if (!credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 403 });
    }

    const isValid = await verifyPassword(currentPassword, {
      salt: credential.passwordSalt,
      iterations: credential.passwordHashIterations ?? PASSWORD_HASH_ITERATIONS,
      passwordHash: credential.passwordHash,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 });
    }

    const newSalt = generatePasswordSalt();
    const newHash = await hashPassword(newPassword, newSalt, PASSWORD_HASH_ITERATIONS);

    await fetchInternalMutation(internal.auth.changeOwnPassword, {
      profileId: claims.sub,
      passwordHash: newHash,
      passwordSalt: newSalt,
      passwordHashIterations: PASSWORD_HASH_ITERATIONS,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Change password route failed', error);
    return NextResponse.json({ error: 'Password change failed' }, { status: 500 });
  }
}
