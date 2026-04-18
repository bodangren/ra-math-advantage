import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetchInternalQuery = vi.fn();
const mockVerifySessionToken = vi.fn();
const mockCookiesGet = vi.fn();
const mockCookiesSet = vi.fn();
const mockCookies = vi.fn(() => Promise.resolve({ get: mockCookiesGet, set: mockCookiesSet }));

vi.mock('next/headers', () => ({ cookies: mockCookies }));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: { auth: { getAccountSettingsContext: 'auth:getAccountSettingsContext' } },
}));
vi.mock('@math-platform/core-auth', () => ({
  verifySessionToken: mockVerifySessionToken,
  SESSION_COOKIE_NAME: 'bm_session',
  getAuthJwtSecret: () => 'test-secret',
}));

describe('GET /api/auth/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies.mockResolvedValue({ get: mockCookiesGet, set: mockCookiesSet });
  });

  it('returns authenticated: false when no cookie', async () => {
    mockCookiesGet.mockReturnValue(undefined);
    const { GET } = await import('@/app/api/auth/session/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authenticated).toBe(false);
  });

  it('returns authenticated: false and clears cookie when token invalid', async () => {
    mockCookiesGet.mockReturnValue({ value: 'bad-token' });
    mockVerifySessionToken.mockResolvedValue(null);
    const { GET } = await import('@/app/api/auth/session/route');
    const res = await GET();
    const body = await res.json();
    expect(body.authenticated).toBe(false);
    expect(mockCookiesSet).toHaveBeenCalledWith('bm_session', '', expect.objectContaining({ expires: new Date(0) }));
  });

  it('returns authenticated: true with user and profile', async () => {
    mockCookiesGet.mockReturnValue({ value: 'valid-token' });
    mockVerifySessionToken.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
      iat: 0,
      exp: 9999999999,
    });
    mockFetchInternalQuery.mockResolvedValue({
      id: 'p1',
      username: 'alice',
      role: 'student',
      displayName: 'Alice',
      organizationId: 'org1',
      organizationName: 'Demo Org',
    });
    const { GET } = await import('@/app/api/auth/session/route');
    const res = await GET();
    const body = await res.json();
    expect(body.authenticated).toBe(true);
    expect(body.user.username).toBe('alice');
    expect(body.profile).toBeDefined();
  });
});
