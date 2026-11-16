import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetchInternalQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();
const mockSignSessionToken = vi.fn();
const mockVerifyPassword = vi.fn();
const mockCookiesSet = vi.fn();
const mockCookies = vi.fn(() => Promise.resolve({ set: mockCookiesSet }));

vi.mock('next/headers', () => ({ cookies: mockCookies }));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  fetchInternalMutation: mockFetchInternalMutation,
  internal: { rateLimits: { checkLoginAttempt: 'rateLimits:checkLoginAttempt' }, auth: { getCredentialByUsername: 'auth:getCredentialByUsername', getCredentialByUsernameIncludingInactive: 'auth:getCredentialByUsernameIncludingInactive' } },
}));
vi.mock('@math-platform/core-auth', () => ({
  signSessionToken: mockSignSessionToken,
  verifyPassword: mockVerifyPassword,
  SESSION_COOKIE_NAME: 'bm_session',
  SESSION_TTL_SECONDS: 43200,
  PASSWORD_HASH_ITERATIONS: 120000,
  getAuthJwtSecret: () => 'test-secret',
}));

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchInternalMutation.mockResolvedValue({ allowed: true });
    mockSignSessionToken.mockResolvedValue('signed-token');
    mockCookies.mockResolvedValue({ set: mockCookiesSet });
  });

  it('returns 400 when body is missing username or password', async () => {
    const { POST } = await import('@/app/api/auth/login/route');
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: '', password: '' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 401 when credential not found', async () => {
    mockFetchInternalQuery.mockResolvedValue(null);
    const { POST } = await import('@/app/api/auth/login/route');
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'nobody', password: 'secret' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 when password does not match', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      profileId: 'p1',
      username: 'alice',
      role: 'student',
      organizationId: 'org1',
      passwordHash: 'hash',
      passwordSalt: 'salt',
      passwordHashIterations: 120000,
      isActive: true,
    });
    mockVerifyPassword.mockResolvedValue(false);
    const { POST } = await import('@/app/api/auth/login/route');
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'alice', password: 'wrong' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns the same failure for deactivated credentials', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      profileId: 'p1',
      username: 'deactivated',
      role: 'student',
      organizationId: 'org1',
      passwordHash: 'hash',
      passwordSalt: 'salt',
      passwordHashIterations: 120000,
      isActive: false,
    });
    const { POST } = await import('@/app/api/auth/login/route');
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'deactivated', password: 'secret' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Invalid login credentials');
  });

  it('returns 200 and sets cookie on valid credentials', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      profileId: 'p1',
      username: 'alice',
      role: 'student',
      organizationId: 'org1',
      passwordHash: 'hash',
      passwordSalt: 'salt',
      passwordHashIterations: 120000,
      isActive: true,
    });
    mockVerifyPassword.mockResolvedValue(true);
    const { POST } = await import('@/app/api/auth/login/route');
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'alice', password: 'correct' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
    expect(mockCookiesSet).toHaveBeenCalledWith(
      'bm_session',
      'signed-token',
      expect.objectContaining({ httpOnly: true }),
    );
  });
});


describe('login input and attempt limits', () => {
  it.each([null, 1, [], { username: 12, password: 'secret' }, { username: 'alice', password: {} }])('rejects invalid JSON shapes: %j', async (body) => {
    const { POST } = await import('@/app/api/auth/login/route');
    expect((await POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify(body) }))).status).toBe(400);
  });
  it('returns 429 before password work when attempts are exhausted', async () => {
    mockFetchInternalMutation.mockResolvedValue({ allowed: false, windowExpiresAt: Date.now() + 60000 });
    const { POST } = await import('@/app/api/auth/login/route');
    expect((await POST(new Request('http://localhost', { method: 'POST', body: JSON.stringify({ username: 'alice', password: 'secret' }) }))).status).toBe(429);
  });
});
