import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SessionClaims } from '@math-platform/core-auth';

const mocks = vi.hoisted(() => ({
  account: vi.fn(),
  cookieGet: vi.fn(),
  cookies: vi.fn(),
  getAuthJwtSecret: vi.fn(),
  redirect: vi.fn(),
  verifySessionToken: vi.fn(),
}));

vi.mock('@/lib/convex/server', () => ({ fetchInternalQuery: mocks.account, internal: { auth: { getAccountSettingsContext: 'account' } } }));

vi.mock('next/headers', () => ({
  cookies: mocks.cookies,
}));

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => (
      new Response(JSON.stringify(body), init)
    ),
  },
}));

vi.mock('@math-platform/core-auth', () => ({
  SESSION_COOKIE_NAME: 'precalc-session',
  getAuthJwtSecret: mocks.getAuthJwtSecret,
  verifySessionToken: mocks.verifySessionToken,
}));

import {
  getRequestSessionClaims,
  getServerSessionClaims,
  requireServerSessionClaims,
  requireStudentRequestClaims,
  requireStudentSessionClaims,
  requireTeacherRequestClaims,
  requireTeacherSessionClaims,
} from '@/lib/auth/server';

function claims(role: 'student' | 'teacher' | 'admin'): SessionClaims {
  return {
    sub: `precalc-${role}-user`, username: role, organizationId: 'org',
    role,
  } as SessionClaims;
}

function requestWithCookie(cookie: string | null): Request {
  return new Request('http://localhost/precalc-auth-test', {
    headers: cookie === null ? {} : { cookie },
  });
}

async function expectErrorResponse(value: SessionClaims | Response, status: number, error: string) {
  expect(value).toBeInstanceOf(Response);
  const response = value as Response;
  expect(response.status).toBe(status);
  await expect(response.json()).resolves.toEqual({ error });
}

describe('Precalculus server authentication boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.account.mockImplementation(async (_ref, { profileId }) => { const role = profileId.split('-')[1]; return { username: role, role, organizationId: 'org' }; });
    mocks.cookies.mockResolvedValue({ get: mocks.cookieGet });
    mocks.cookieGet.mockReturnValue(undefined);
    mocks.getAuthJwtSecret.mockReturnValue('precalc-test-secret');
    mocks.redirect.mockImplementation((destination: string) => {
      throw new Error(`redirect:${destination}`);
    });
  });

  it('reads a server cookie only when it contains a token', async () => {
    await expect(getServerSessionClaims()).resolves.toBeNull();
    expect(mocks.verifySessionToken).not.toHaveBeenCalled();

    const student = claims('student');
    mocks.cookieGet.mockReturnValue({ value: 'server-session-token' });
    mocks.verifySessionToken.mockResolvedValueOnce(student);

    await expect(getServerSessionClaims()).resolves.toEqual(student);
    expect(mocks.cookieGet).toHaveBeenCalledWith('precalc-session');
    expect(mocks.verifySessionToken).toHaveBeenCalledWith(
      'server-session-token',
      'precalc-test-secret',
    );
  });

  it('parses the request cookie without accepting malformed or unrelated entries', async () => {
    await expect(getRequestSessionClaims(requestWithCookie(null))).resolves.toBeNull();
    expect(mocks.verifySessionToken).not.toHaveBeenCalled();

    const student = claims('student');
    mocks.verifySessionToken.mockResolvedValueOnce(student);
    const request = requestWithCookie(
      '; malformed; =missing-name; unrelated=value; precalc-session=encoded%2Dtoken',
    );

    await expect(getRequestSessionClaims(request)).resolves.toEqual(student);
    expect(mocks.verifySessionToken).toHaveBeenCalledWith(
      'encoded-token',
      'precalc-test-secret',
    );
  });

  it('requires an authenticated student for request-boundary access', async () => {
    const noSession = await requireStudentRequestClaims(
      requestWithCookie(null),
      'Sign in first',
      'Students only',
    );
    await expectErrorResponse(noSession, 401, 'Sign in first');

    mocks.verifySessionToken.mockResolvedValueOnce(claims('teacher'));
    const teacher = await requireStudentRequestClaims(
      requestWithCookie('precalc-session=teacher-token'),
      'Sign in first',
      'Students only',
    );
    await expectErrorResponse(teacher, 403, 'Students only');

    const student = claims('student');
    mocks.verifySessionToken.mockResolvedValueOnce(student);
    await expect(requireStudentRequestClaims(
      requestWithCookie('precalc-session=student-token'),
    )).resolves.toEqual(student);
  });

  it.each(['teacher', 'admin'] as const)(
    'accepts an authenticated %s at the teacher request boundary',
    async (role) => {
      const authorized = claims(role);
      mocks.verifySessionToken.mockResolvedValueOnce(authorized);

      await expect(requireTeacherRequestClaims(
        requestWithCookie(`precalc-session=${role}-token`),
      )).resolves.toEqual(authorized);
    },
  );

  it('rejects a student at the teacher request boundary', async () => {
    mocks.verifySessionToken.mockResolvedValueOnce(claims('student'));

    const result = await requireTeacherRequestClaims(
      requestWithCookie('precalc-session=student-token'),
      'Sign in first',
      'Teacher role required',
    );

    await expectErrorResponse(result, 403, 'Teacher role required');
  });

  it('redirects an unauthenticated server request and returns authenticated claims', async () => {
    await expect(requireServerSessionClaims('/student/dashboard')).rejects.toThrow(
      'redirect:/auth/login?redirect=/student/dashboard',
    );

    const student = claims('student');
    mocks.cookieGet.mockReturnValue({ value: 'server-student-token' });
    mocks.verifySessionToken.mockResolvedValueOnce(student);

    await expect(requireServerSessionClaims('/student/dashboard')).resolves.toEqual(student);
  });

  it('keeps teacher-page and student-page role redirects separate', async () => {
    mocks.cookieGet.mockReturnValue({ value: 'server-role-token' });
    mocks.verifySessionToken.mockResolvedValueOnce(claims('student'));
    await expect(requireTeacherSessionClaims('/teacher', '/student/dashboard')).rejects.toThrow(
      'redirect:/student/dashboard',
    );

    const admin = claims('admin');
    mocks.verifySessionToken.mockResolvedValueOnce(admin);
    await expect(requireTeacherSessionClaims('/teacher')).resolves.toEqual(admin);

    mocks.verifySessionToken.mockResolvedValueOnce(claims('teacher'));
    await expect(requireStudentSessionClaims('/student/dashboard')).rejects.toThrow('redirect:/teacher/dashboard');

    const student = claims('student');
    mocks.verifySessionToken.mockResolvedValueOnce(student);
    await expect(requireStudentSessionClaims('/student/dashboard')).resolves.toEqual(student);
  });
});

it('rejects revoked sessions and malformed cookie escapes', async () => {
  mocks.account.mockResolvedValue(null);
  mocks.verifySessionToken.mockResolvedValue(claims('student'));
  expect(await getRequestSessionClaims(requestWithCookie('precalc-session=token'))).toBeNull();
  expect(await getRequestSessionClaims(requestWithCookie('precalc-session=%ZZ'))).toBeNull();
});
it('uses the current role instead of an old token role', async () => {
  mocks.verifySessionToken.mockResolvedValue(claims('teacher'));
  mocks.account.mockResolvedValue({ username: 'teacher', role: 'student', organizationId: 'org' });
  await expectErrorResponse(await requireTeacherRequestClaims(requestWithCookie('precalc-session=token')), 403, 'Forbidden');
});
