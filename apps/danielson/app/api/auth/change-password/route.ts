import { NextResponse } from 'next/server';
import {
  generatePasswordSalt,
  hashPassword,
  PASSWORD_HASH_ITERATIONS,
  verifyPassword,
} from '@/lib/auth/session';
import { getPasswordRequirementText, validatePasswordForRole } from '@math-platform/core-auth';
import { fetchInternalMutation, fetchInternalQuery, internal } from '@/lib/convex/server';
import { requireDanielsonApiSession } from '@/lib/auth/server';

export async function POST(request: Request) {
  const claimsOrResponse = await requireDanielsonApiSession(request, {
    allowTemporaryCredential: true,
  });
  if (claimsOrResponse instanceof Response) return claimsOrResponse;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const data = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  const currentPassword = typeof data.currentPassword === 'string' ? data.currentPassword : '';
  const newPassword = typeof data.newPassword === 'string' ? data.newPassword : '';
  const confirmPassword = typeof data.confirmPassword === 'string' ? data.confirmPassword : '';
  if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'Invalid password change request' }, { status: 400 });
  }
  const error = validatePasswordForRole(claimsOrResponse.role, newPassword);
  if (error) return NextResponse.json({ error, requirement: getPasswordRequirementText(claimsOrResponse.role) }, { status: 400 });
  const credential = await fetchInternalQuery(internal.auth.getCredentialByAccountId, {
    accountId: claimsOrResponse.sub,
  });
  if (!credential) return NextResponse.json({ error: 'Invalid password change request' }, { status: 400 });
  const valid = await verifyPassword(currentPassword, {
    passwordHash: credential.passwordHash,
    salt: credential.passwordSalt,
    iterations: credential.passwordHashIterations ?? PASSWORD_HASH_ITERATIONS,
  });
  if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 });
  const salt = generatePasswordSalt();
  const passwordHash = await hashPassword(newPassword, salt, PASSWORD_HASH_ITERATIONS);
  const result = await fetchInternalMutation(internal.auth.changeOwnPassword, {
    accountId: claimsOrResponse.sub,
    expectedPasswordSalt: credential.passwordSalt,
    passwordHash,
    passwordSalt: salt,
    passwordHashIterations: PASSWORD_HASH_ITERATIONS,
  });
  return result.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: 'Unable to update password' }, { status: 500 });
}
