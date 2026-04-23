import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  requireActiveRequestSessionClaims,
  requireActiveStudentRequestClaims,
  requireActiveTeacherRequestClaims,
} from '@/lib/auth/server';

vi.mock('@/lib/auth/server', async () => {
  const actual = await vi.importActual('@/lib/auth/server');
  return {
    ...actual,
  };
});

vi.mock('@/lib/convex/server', () => ({
  internal: {
    auth: {
      getCredentialByUsername: 'internal:auth:getCredentialByUsername',
    },
  },
  fetchInternalQuery: vi.fn(),
}));

import { fetchInternalQuery } from '@/lib/convex/server';
import { signSessionToken } from '@/lib/auth/session';
import { getAuthJwtSecret } from '@/lib/auth/constants';

const mockFetchInternalQuery = vi.mocked(fetchInternalQuery);

function buildRequestWithCookie(token: string): Request {
  return new Request('http://localhost/api/test', {
    headers: { cookie: `bm_session=${token}` },
  });
}

async function makeToken(overrides: Partial<{ username: string; sub: string; role: 'student' | 'teacher' | 'admin' }> = {}) {
  return signSessionToken(
    {
      sub: overrides.sub ?? 'profile_123',
      username: overrides.username ?? 'test_user',
      role: overrides.role ?? 'student',
    },
    getAuthJwtSecret(),
    3600,
  );
}

describe('requireActiveRequestSessionClaims', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns claims when credential is active', async () => {
    mockFetchInternalQuery.mockResolvedValue({ id: 'cred_123', username: 'test_user', role: 'student' });

    const token = await makeToken({ role: 'student', username: 'test_user' });
    const request = buildRequestWithCookie(token);
    const result = await requireActiveRequestSessionClaims(request);

    expect(result).not.toBeInstanceOf(Response);
    if (!(result instanceof Response)) {
      expect(result.role).toBe('student');
      expect(result.username).toBe('test_user');
    }
  });

  it('returns 401 when credential is deactivated', async () => {
    mockFetchInternalQuery.mockResolvedValue(null);

    const token = await makeToken({ role: 'student' });
    const request = buildRequestWithCookie(token);
    const result = await requireActiveRequestSessionClaims(request);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(401);
    }
  });

  it('returns 503 when Convex query throws', async () => {
    mockFetchInternalQuery.mockRejectedValue(new Error('Convex network error'));

    const token = await makeToken({ role: 'teacher' });
    const request = buildRequestWithCookie(token);
    const result = await requireActiveRequestSessionClaims(request);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(503);
    }
  });
});

describe('requireActiveStudentRequestClaims', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns claims when credential is active and role is student', async () => {
    mockFetchInternalQuery.mockResolvedValue({ id: 'cred_123', username: 'test_student', role: 'student' });

    const token = await makeToken({ role: 'student', username: 'test_student' });
    const request = buildRequestWithCookie(token);
    const result = await requireActiveStudentRequestClaims(request);

    expect(result).not.toBeInstanceOf(Response);
    if (!(result instanceof Response)) {
      expect(result.role).toBe('student');
      expect(result.username).toBe('test_student');
    }
  });

  it('returns 401 when credential is deactivated', async () => {
    mockFetchInternalQuery.mockResolvedValue(null);

    const token = await makeToken({ role: 'student' });
    const request = buildRequestWithCookie(token);
    const result = await requireActiveStudentRequestClaims(request);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(401);
    }
  });

  it('returns 403 when credential is active but role is teacher', async () => {
    mockFetchInternalQuery.mockResolvedValue({ id: 'cred_123', username: 'test_teacher', role: 'teacher' });

    const token = await makeToken({ role: 'teacher', username: 'test_teacher' });
    const request = buildRequestWithCookie(token);
    const result = await requireActiveStudentRequestClaims(request);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(403);
    }
  });

  it('returns 403 when credential is active but role is admin', async () => {
    mockFetchInternalQuery.mockResolvedValue({ id: 'cred_123', username: 'test_admin', role: 'admin' });

    const token = await makeToken({ role: 'admin', username: 'test_admin' });
    const request = buildRequestWithCookie(token);
    const result = await requireActiveStudentRequestClaims(request);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(403);
    }
  });

  it('returns 503 when Convex query throws', async () => {
    mockFetchInternalQuery.mockRejectedValue(new Error('Convex network error'));

    const token = await makeToken({ role: 'student' });
    const request = buildRequestWithCookie(token);
    const result = await requireActiveStudentRequestClaims(request);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(503);
    }
  });
});

describe('requireActiveTeacherRequestClaims', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns claims when credential is active and role is teacher', async () => {
    mockFetchInternalQuery.mockResolvedValue({ id: 'cred_123', username: 'test_teacher', role: 'teacher' });

    const token = await makeToken({ role: 'teacher', username: 'test_teacher' });
    const request = buildRequestWithCookie(token);
    const result = await requireActiveTeacherRequestClaims(request);

    expect(result).not.toBeInstanceOf(Response);
    if (!(result instanceof Response)) {
      expect(result.role).toBe('teacher');
      expect(result.username).toBe('test_teacher');
    }
  });

  it('returns claims when credential is active and role is admin', async () => {
    mockFetchInternalQuery.mockResolvedValue({ id: 'cred_123', username: 'test_admin', role: 'admin' });

    const token = await makeToken({ role: 'admin', username: 'test_admin' });
    const request = buildRequestWithCookie(token);
    const result = await requireActiveTeacherRequestClaims(request);

    expect(result).not.toBeInstanceOf(Response);
    if (!(result instanceof Response)) {
      expect(result.role).toBe('admin');
      expect(result.username).toBe('test_admin');
    }
  });

  it('returns 401 when credential is deactivated', async () => {
    mockFetchInternalQuery.mockResolvedValue(null);

    const token = await makeToken({ role: 'teacher' });
    const request = buildRequestWithCookie(token);
    const result = await requireActiveTeacherRequestClaims(request);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(401);
    }
  });

  it('returns 403 when credential is active but role is student', async () => {
    mockFetchInternalQuery.mockResolvedValue({ id: 'cred_123', username: 'test_student', role: 'student' });

    const token = await makeToken({ role: 'student', username: 'test_student' });
    const request = buildRequestWithCookie(token);
    const result = await requireActiveTeacherRequestClaims(request);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(403);
    }
  });

  it('returns 503 when Convex query throws', async () => {
    mockFetchInternalQuery.mockRejectedValue(new Error('Convex network error'));

    const token = await makeToken({ role: 'teacher' });
    const request = buildRequestWithCookie(token);
    const result = await requireActiveTeacherRequestClaims(request);

    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(503);
    }
  });
});
