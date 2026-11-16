import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockFetchInternalMutation,
  mockFetchInternalQuery,
  mockHashIpAddress,
  mockSignSessionToken,
  mockVerifyPassword,
} = vi.hoisted(() => ({
  mockFetchInternalMutation: vi.fn(),
  mockFetchInternalQuery: vi.fn(),
  mockHashIpAddress: vi.fn(),
  mockSignSessionToken: vi.fn(),
  mockVerifyPassword: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  getAuthJwtSecret: () => 'test-secret',
  PASSWORD_HASH_ITERATIONS: 120000,
  SESSION_TTL_SECONDS: 43200,
  signSessionToken: mockSignSessionToken,
  verifyPassword: mockVerifyPassword,
}));
vi.mock('@/lib/auth/ip-hash', () => ({ hashIpAddress: mockHashIpAddress }));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalMutation: mockFetchInternalMutation,
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    auth: {
      checkAndIncrementLoginRateLimit: 'check-rate',
      clearLoginRateLimit: 'clear-rate',
      getCredentialByUsername: 'get-credential',
    },
  },
}));

const {
  authenticateDanielsonLogin,
  getTrustedClientAddress,
} = await import('../../../lib/auth/login-service');

beforeEach(() => {
  vi.clearAllMocks();
  mockHashIpAddress.mockResolvedValue('login-key');
  mockSignSessionToken.mockResolvedValue('signed-token');
});

describe('Danielson trusted client address', () => {
  it('uses the Vercel-protected forwarding header on Vercel', () => {
    const request = new Request('https://example.test/login', {
      headers: {
        'x-vercel-forwarded-for': '198.51.100.10, 10.0.0.1',
        'x-forwarded-for': '203.0.113.90',
      },
    });

    expect(getTrustedClientAddress(request, { VERCEL: '1' })).toBe('198.51.100.10');
  });

  it('does not trust a caller-controlled forwarding header outside Vercel', () => {
    const request = new Request('https://example.test/login', {
      headers: { 'x-forwarded-for': '203.0.113.90' },
    });

    expect(getTrustedClientAddress(request, {})).toBe('local-development');
  });

  it('rejects a production login when no trusted client address source exists', () => {
    const request = new Request('https://example.test/login', {
      headers: { 'x-forwarded-for': '203.0.113.90' },
    });

    expect(() => getTrustedClientAddress(request, { NODE_ENV: 'production' }))
      .toThrow('Trusted client IP header is not configured');
  });

  it('rejects a production login when the configured trusted header is missing', () => {
    const request = new Request('https://example.test/login');

    expect(() => getTrustedClientAddress(request, {
      NODE_ENV: 'production',
      TRUSTED_CLIENT_IP_HEADER: 'X-School-Client-IP',
    })).toThrow('Trusted client IP header is missing');
  });

  it('uses only the explicitly configured trusted proxy header', () => {
    const request = new Request('https://example.test/login', {
      headers: { 'x-school-client-ip': '192.0.2.12' },
    });

    expect(getTrustedClientAddress(request, {
      TRUSTED_CLIENT_IP_HEADER: 'X-School-Client-IP',
    })).toBe('192.0.2.12');
  });

  it('stops before a credential read when the rate limit is active', async () => {
    mockFetchInternalMutation.mockResolvedValue({
      allowed: false,
      windowExpiresAt: Date.now() + 60_000,
    });

    await expect(authenticateDanielsonLogin(
      new Request('https://example.test/login'),
      { username: ' Teacher.One ', password: 'wrong' },
    )).resolves.toMatchObject({ kind: 'rate_limited' });
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();
  });

  it('returns the same result for an unknown account and an incorrect password', async () => {
    mockFetchInternalMutation.mockResolvedValue({ allowed: true, windowExpiresAt: Date.now() + 1 });
    mockFetchInternalQuery.mockResolvedValueOnce(null);
    await expect(authenticateDanielsonLogin(
      new Request('https://example.test/login'),
      { username: 'unknown', password: 'wrong' },
    )).resolves.toEqual({ kind: 'invalid_credentials' });

    mockFetchInternalQuery.mockResolvedValueOnce({
      accountId: 'accounts:teacher', username: 'teacher', displayName: 'Teacher',
      sharedSessionRole: 'teacher', organizationId: 'organizations:school',
      passwordHash: 'hash', passwordSalt: 'salt', passwordHashIterations: 120000,
      mustChangePassword: false,
    });
    mockVerifyPassword.mockResolvedValue(false);
    await expect(authenticateDanielsonLogin(
      new Request('https://example.test/login'),
      { username: 'teacher', password: 'wrong' },
    )).resolves.toEqual({ kind: 'invalid_credentials' });
  });

  it('creates a session and clears the rate limit after valid credentials', async () => {
    mockFetchInternalMutation
      .mockResolvedValueOnce({ allowed: true, windowExpiresAt: Date.now() + 1 })
      .mockResolvedValueOnce({ ok: true });
    mockFetchInternalQuery.mockResolvedValue({
      accountId: 'accounts:teacher', username: 'teacher', displayName: 'Teacher',
      sharedSessionRole: 'teacher', organizationId: 'organizations:school',
      passwordHash: 'hash', passwordSalt: 'salt', passwordHashIterations: 120000,
      mustChangePassword: true,
    });
    mockVerifyPassword.mockResolvedValue(true);

    await expect(authenticateDanielsonLogin(
      new Request('https://example.test/login'),
      { username: 'teacher', password: 'correct' },
    )).resolves.toEqual({
      kind: 'authenticated', sessionToken: 'signed-token', mustChangePassword: true,
    });
    expect(mockSignSessionToken).toHaveBeenCalledWith(expect.objectContaining({
      sub: 'accounts:teacher', organizationId: 'organizations:school',
    }), 'test-secret', 43200);
    expect(mockFetchInternalMutation).toHaveBeenLastCalledWith('clear-rate', { key: 'login-key' });
  });
});
