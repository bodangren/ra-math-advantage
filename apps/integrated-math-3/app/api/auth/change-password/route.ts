import { NextResponse } from 'next/server';
import { z } from 'zod';

import { PASSWORD_HASH_ITERATIONS, validatePasswordForRole, generatePasswordSalt, hashPassword, verifyPassword } from '@math-platform/core-auth';
import { requireActiveRequestSessionClaims } from '@/lib/auth/server';
import { fetchInternalMutation, fetchInternalQuery, internal } from '@/lib/convex/server';

const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(1, 'New password is required'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
});

/**
 * Handles POST requests to change the authenticated user's password.
 * Validates the current password, enforces password policy, hashes
 * the new password, and updates it via Convex.
 *
 * @param request - The incoming request with a JSON body containing
 *   currentPassword, newPassword, and confirmPassword.
 * @returns A JSON response confirming the password change or an error.
 */
export async function POST(request: Request) {
  const claimsOrResponse = await requireActiveRequestSessionClaims(request);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }
  const claims = claimsOrResponse;

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = changePasswordBodySchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: validation.error.format() },
      { status: 400 },
    );
  }

  const { currentPassword, newPassword, confirmPassword } = validation.data;

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

    const result = await fetchInternalMutation(internal.auth.changeOwnPassword, {
      profileId: claims.sub,
      passwordHash: newHash,
      passwordSalt: newSalt,
      passwordHashIterations: PASSWORD_HASH_ITERATIONS,
    });

    if (result && typeof result === 'object' && 'ok' in result && !result.ok) {
      const reason = 'reason' in result ? result.reason : 'unknown';
      console.error('changeOwnPassword mutation failed:', reason);
      return NextResponse.json({ error: 'Password change failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Change password route failed', error);
    return NextResponse.json({ error: 'Password change failed' }, { status: 500 });
  }
}
