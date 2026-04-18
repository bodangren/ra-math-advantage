import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockVerifySessionToken = vi.fn();
const mockGetAuthJwtSecret = vi.fn(() => 'test-secret');
const mockFetchInternalQuery = vi.fn();

vi.mock('@math-platform/core-auth', () => ({
  verifySessionToken: mockVerifySessionToken,
  SESSION_COOKIE_NAME: 'session',
  getAuthJwtSecret: mockGetAuthJwtSecret,
}));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    auth: {
      getCredentialByUsername: 'auth:getCredentialByUsername',
    },
  },
}));

const makeRequest = (cookie?: string) =>
  new Request('http://localhost/api/test', {
    headers: cookie ? { cookie } : {},
  });

describe('requireRequestSessionClaims', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no cookie is present', async () => {
    const { requireRequestSessionClaims } = await import('@/lib/auth/server');
    const res = await requireRequestSessionClaims(makeRequest());
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(401);
  });

  it('returns 401 when token verification fails', async () => {
    mockVerifySessionToken.mockResolvedValue(null);
    const { requireRequestSessionClaims } = await import('@/lib/auth/server');
    const res = await requireRequestSessionClaims(makeRequest('session=bad-token'));
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(401);
    expect(mockVerifySessionToken).toHaveBeenCalledWith('bad-token', 'test-secret');
  });

  it('returns claims when token is valid', async () => {
    const claims = {
      sub: 'p1',
      username: 'alice',
      role: 'student' as const,
      iat: 1,
      exp: 9999999999,
    };
    mockVerifySessionToken.mockResolvedValue(claims);
    const { requireRequestSessionClaims } = await import('@/lib/auth/server');
    const res = await requireRequestSessionClaims(makeRequest('session=valid-token'));
    expect(res).toEqual(claims);
  });
});

describe('requireStudentRequestClaims', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    const { requireStudentRequestClaims } = await import('@/lib/auth/server');
    const res = await requireStudentRequestClaims(makeRequest());
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(401);
  });

  it('returns 403 when user is not a student', async () => {
    mockVerifySessionToken.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'teacher',
      iat: 1,
      exp: 9999999999,
    });
    const { requireStudentRequestClaims } = await import('@/lib/auth/server');
    const res = await requireStudentRequestClaims(makeRequest('session=valid-token'));
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(403);
  });

  it('returns claims when user is a student', async () => {
    const claims = {
      sub: 'p1',
      username: 'alice',
      role: 'student' as const,
      iat: 1,
      exp: 9999999999,
    };
    mockVerifySessionToken.mockResolvedValue(claims);
    const { requireStudentRequestClaims } = await import('@/lib/auth/server');
    const res = await requireStudentRequestClaims(makeRequest('session=valid-token'));
    expect(res).toEqual(claims);
  });
});

describe('requireTeacherRequestClaims', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    const { requireTeacherRequestClaims } = await import('@/lib/auth/server');
    const res = await requireTeacherRequestClaims(makeRequest());
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(401);
  });

  it('returns 403 when user is a student', async () => {
    mockVerifySessionToken.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
      iat: 1,
      exp: 9999999999,
    });
    const { requireTeacherRequestClaims } = await import('@/lib/auth/server');
    const res = await requireTeacherRequestClaims(makeRequest('session=valid-token'));
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(403);
  });

  it('returns claims when user is a teacher', async () => {
    const claims = {
      sub: 'p1',
      username: 'alice',
      role: 'teacher' as const,
      iat: 1,
      exp: 9999999999,
    };
    mockVerifySessionToken.mockResolvedValue(claims);
    const { requireTeacherRequestClaims } = await import('@/lib/auth/server');
    const res = await requireTeacherRequestClaims(makeRequest('session=valid-token'));
    expect(res).toEqual(claims);
  });

  it('returns claims when user is an admin', async () => {
    const claims = {
      sub: 'p1',
      username: 'alice',
      role: 'admin' as const,
      iat: 1,
      exp: 9999999999,
    };
    mockVerifySessionToken.mockResolvedValue(claims);
    const { requireTeacherRequestClaims } = await import('@/lib/auth/server');
    const res = await requireTeacherRequestClaims(makeRequest('session=valid-token'));
    expect(res).toEqual(claims);
  });
});

describe('requireDeveloperRequestClaims', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    const { requireDeveloperRequestClaims } = await import('@/lib/auth/server');
    const res = await requireDeveloperRequestClaims(makeRequest());
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(401);
  });

  it('returns 403 when user is not an admin', async () => {
    mockVerifySessionToken.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'teacher',
      iat: 1,
      exp: 9999999999,
    });
    const { requireDeveloperRequestClaims } = await import('@/lib/auth/server');
    const res = await requireDeveloperRequestClaims(makeRequest('session=valid-token'));
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(403);
  });

  it('returns claims when user is an admin', async () => {
    const claims = {
      sub: 'p1',
      username: 'alice',
      role: 'admin' as const,
      iat: 1,
      exp: 9999999999,
    };
    mockVerifySessionToken.mockResolvedValue(claims);
    const { requireDeveloperRequestClaims } = await import('@/lib/auth/server');
    const res = await requireDeveloperRequestClaims(makeRequest('session=valid-token'));
    expect(res).toEqual(claims);
  });
});

describe('requireActiveRequestSessionClaims', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no cookie is present', async () => {
    const { requireActiveRequestSessionClaims } = await import('@/lib/auth/server');
    const res = await requireActiveRequestSessionClaims(makeRequest());
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(401);
  });

  it('returns 401 when token verification fails', async () => {
    mockVerifySessionToken.mockResolvedValue(null);
    const { requireActiveRequestSessionClaims } = await import('@/lib/auth/server');
    const res = await requireActiveRequestSessionClaims(makeRequest('session=bad-token'));
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(401);
  });

  it('returns 401 when credential is not found in Convex', async () => {
    mockVerifySessionToken.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
      iat: 1,
      exp: 9999999999,
    });
    mockFetchInternalQuery.mockResolvedValue(null);
    const { requireActiveRequestSessionClaims } = await import('@/lib/auth/server');
    const res = await requireActiveRequestSessionClaims(makeRequest('session=valid-token'));
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(401);
    expect(mockFetchInternalQuery).toHaveBeenCalledWith('auth:getCredentialByUsername', { username: 'alice' });
  });

  it('returns 401 when credential is deactivated', async () => {
    mockVerifySessionToken.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
      iat: 1,
      exp: 9999999999,
    });
    mockFetchInternalQuery.mockResolvedValue({
      id: 'cred1',
      profileId: 'p1',
      username: 'alice',
      role: 'student',
      isActive: false,
    });
    const { requireActiveRequestSessionClaims } = await import('@/lib/auth/server');
    const res = await requireActiveRequestSessionClaims(makeRequest('session=valid-token'));
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(401);
  });

  it('returns 503 when Convex query throws (fail-closed)', async () => {
    mockVerifySessionToken.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'student',
      iat: 1,
      exp: 9999999999,
    });
    mockFetchInternalQuery.mockRejectedValue(new Error('Convex unreachable'));
    const { requireActiveRequestSessionClaims } = await import('@/lib/auth/server');
    const res = await requireActiveRequestSessionClaims(makeRequest('session=valid-token'));
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(503);
    const body = await (res as Response).json();
    expect(body.error).toContain('Service unavailable');
  });

  it('returns claims when credential is active', async () => {
    const claims = {
      sub: 'p1',
      username: 'alice',
      role: 'student' as const,
      iat: 1,
      exp: 9999999999,
    };
    mockVerifySessionToken.mockResolvedValue(claims);
    mockFetchInternalQuery.mockResolvedValue({
      id: 'cred1',
      profileId: 'p1',
      username: 'alice',
      role: 'student',
      isActive: true,
    });
    const { requireActiveRequestSessionClaims } = await import('@/lib/auth/server');
    const res = await requireActiveRequestSessionClaims(makeRequest('session=valid-token'));
    expect(res).toEqual(claims);
  });
});
