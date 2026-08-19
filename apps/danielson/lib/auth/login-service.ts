import {
  getAuthJwtSecret,
  PASSWORD_HASH_ITERATIONS,
  SESSION_TTL_SECONDS,
  signSessionToken,
  verifyPassword,
} from '@/lib/auth/session';
import { hashIpAddress } from '@/lib/auth/ip-hash';
import { fetchInternalMutation, fetchInternalQuery, internal } from '@/lib/convex/server';

export type DanielsonLoginResult =
  | { kind: 'invalid_credentials' }
  | { kind: 'rate_limited'; retryAfterSeconds: number }
  | { kind: 'authenticated'; sessionToken: string; mustChangePassword: boolean };

export function getTrustedClientAddress(
  request: Request,
  env: Record<string, string | undefined> = process.env,
): string {
  if (env.VERCEL === '1') {
    const address = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim();
    if (address) return address;
    if (env.NODE_ENV === 'production') throw new Error('Trusted client IP header is missing');
    return 'local-development';
  }
  const trustedHeader = env.TRUSTED_CLIENT_IP_HEADER?.trim().toLowerCase();
  if (trustedHeader) {
    const address = request.headers.get(trustedHeader)?.trim();
    if (address) return address;
    if (env.NODE_ENV === 'production') throw new Error('Trusted client IP header is missing');
    return 'local-development';
  }
  if (env.NODE_ENV === 'production') {
    throw new Error('Trusted client IP header is not configured');
  }
  return 'local-development';
}

export async function authenticateDanielsonLogin(
  request: Request,
  input: { username: string; password: string },
): Promise<DanielsonLoginResult> {
  const normalizedUsername = input.username.trim().toLowerCase();
  const key = await hashIpAddress(`${normalizedUsername}\0${getTrustedClientAddress(request)}`);
  const rate = await fetchInternalMutation(internal.auth.checkAndIncrementLoginRateLimit, { key });
  if (!rate.allowed) {
    return {
      kind: 'rate_limited',
      retryAfterSeconds: Math.max(1, Math.ceil((rate.windowExpiresAt - Date.now()) / 1000)),
    };
  }

  const credential = await fetchInternalQuery(internal.auth.getCredentialByUsername, {
    username: normalizedUsername,
  });
  const valid = credential
    ? await verifyPassword(input.password, {
      passwordHash: credential.passwordHash,
      salt: credential.passwordSalt,
      iterations: credential.passwordHashIterations ?? PASSWORD_HASH_ITERATIONS,
    })
    : false;
  if (!credential || !valid) return { kind: 'invalid_credentials' };

  const sessionToken = await signSessionToken({
    sub: credential.accountId,
    username: credential.username,
    role: credential.sharedSessionRole,
    organizationId: credential.organizationId,
  }, getAuthJwtSecret(), SESSION_TTL_SECONDS);
  await fetchInternalMutation(internal.auth.clearLoginRateLimit, { key });
  return { kind: 'authenticated', sessionToken, mustChangePassword: credential.mustChangePassword };
}
