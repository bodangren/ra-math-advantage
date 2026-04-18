import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetchInternalQuery = vi.fn();
const mockSignSessionToken = vi.fn();
const mockVerifyPassword = vi.fn();
const mockCookiesSet = vi.fn();
const mockCookies = vi.fn(() => Promise.resolve({ set: mockCookiesSet }));

vi.mock('next/headers', () => ({ cookies: mockCookies }));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: { auth: { getCredentialByUsername: 'auth:getCredentialByUsername' } },
}));
vi.mock('@/lib/auth/session', () => ({
  signSessionToken: mockSignSessionToken,
  verifyPassword: mockVerifyPassword,
}));
vi.mock('@/lib/auth/constants', () => ({
  SESSION_COOKIE_NAME: 'bm_session',
  SESSION_TTL_SECONDS: 43200,
  PASSWORD_HASH_ITERATIONS: 120000,
  getAuthJwtSecret: () => 'test-secret',
}));

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('returns 200 and sets cookie on valid credentials', async () => {
    mockFetchInternalQuery.mockResolvedValue({
      profileId: 'p1',
      username: 'alice',
      role: 'student',
      organizationId: 'org1',
      passwordHash: 'hash',
      passwordSalt: 'salt',
      passwordHashIterations: 120000,
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
