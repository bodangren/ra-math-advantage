import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetRequestSessionClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();
const mockVerifyPassword = vi.fn();
const mockHashPassword = vi.fn();
const mockGeneratePasswordSalt = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  fetchInternalMutation: mockFetchInternalMutation,
  internal: {
    auth: {
      getCredentialByUsername: 'auth:getCredentialByUsername',
      changeOwnPassword: 'auth:changeOwnPassword',
    },
  },
}));
vi.mock('@/lib/auth/session', () => ({
  verifyPassword: mockVerifyPassword,
  hashPassword: mockHashPassword,
  generatePasswordSalt: mockGeneratePasswordSalt,
}));
vi.mock('@/lib/auth/password-policy', () => ({
  validatePasswordForRole: vi.fn(() => null),
  getPasswordRequirementText: vi.fn(() => 'At least 8 characters'),
}));
vi.mock('@/lib/auth/constants', () => ({
  PASSWORD_HASH_ITERATIONS: 120000,
}));

const makeRequest = (body: unknown) =>
  new Request('http://localhost/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('POST /api/auth/change-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGeneratePasswordSalt.mockReturnValue('new-salt');
    mockHashPassword.mockResolvedValue('new-hash');
  });

  it('returns 401 when not authenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);
    const { POST } = await import('@/app/api/auth/change-password/route');
    const res = await POST(makeRequest({ currentPassword: 'a', newPassword: 'b', confirmPassword: 'b' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when passwords do not match', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({ sub: 'p1', username: 'alice', role: 'student' });
    const { POST } = await import('@/app/api/auth/change-password/route');
    const res = await POST(makeRequest({ currentPassword: 'old', newPassword: 'new1', confirmPassword: 'new2' }));
    expect(res.status).toBe(400);
  });

  it('returns 403 when current password is wrong', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({ sub: 'p1', username: 'alice', role: 'student' });
    mockFetchInternalQuery.mockResolvedValue({
      profileId: 'p1',
      passwordHash: 'hash',
      passwordSalt: 'salt',
      passwordHashIterations: 120000,
    });
    mockVerifyPassword.mockResolvedValue(false);
    const { POST } = await import('@/app/api/auth/change-password/route');
    const res = await POST(makeRequest({ currentPassword: 'wrong', newPassword: 'NewPass1!', confirmPassword: 'NewPass1!' }));
    expect(res.status).toBe(403);
  });

  it('returns 200 when password changed successfully', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({ sub: 'p1', username: 'alice', role: 'student' });
    mockFetchInternalQuery.mockResolvedValue({
      profileId: 'p1',
      passwordHash: 'hash',
      passwordSalt: 'salt',
      passwordHashIterations: 120000,
    });
    mockVerifyPassword.mockResolvedValue(true);
    mockFetchInternalMutation.mockResolvedValue({ ok: true, username: 'alice' });
    const { POST } = await import('@/app/api/auth/change-password/route');
    const res = await POST(makeRequest({ currentPassword: 'correct', newPassword: 'NewPass1!', confirmPassword: 'NewPass1!' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
