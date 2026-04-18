import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

const mockVerifySessionToken = vi.fn();
const mockGetAuthJwtSecret = vi.fn(() => 'test-secret');

vi.mock('@/lib/auth/session', () => ({
  verifySessionToken: mockVerifySessionToken,
}));

vi.mock('@/lib/auth/constants', () => ({
  SESSION_COOKIE_NAME: 'bm_session',
  getAuthJwtSecret: mockGetAuthJwtSecret,
}));

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>();
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({ type: 'next' })),
      redirect: vi.fn((url: string | URL) => ({ type: 'redirect', url: url.toString() })),
      json: vi.fn((body: unknown, init?: { status?: number }) => ({ type: 'json', body, status: init?.status ?? 200 })),
    },
  };
});

function makeRequest(pathname: string, cookieHeader?: string) {
  return {
    nextUrl: { pathname },
    url: `http://localhost${pathname}`,
    headers: {
      get: (name: string) => (name.toLowerCase() === 'cookie' ? cookieHeader ?? null : null),
    },
  } as unknown as import('next/server').NextRequest;
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes through non-matching routes unchanged', async () => {
    const { middleware } = await import('@/middleware');
    const res = await middleware(makeRequest('/'));
    expect(res).toEqual({ type: 'next' });
  });

  it('passes through other dev routes unchanged', async () => {
    const { middleware } = await import('@/middleware');
    const res = await middleware(makeRequest('/dev/other'));
    expect(res).toEqual({ type: 'next' });
  });

  it('redirects to login when no cookie is present on dev component-approval route', async () => {
    const { middleware } = await import('@/middleware');
    const res = await middleware(makeRequest('/dev/component-approval'));
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect(res).toEqual({ type: 'redirect', url: 'http://localhost/auth/login?redirect=%2Fdev%2Fcomponent-approval' });
  });

  it('redirects to login when token is invalid', async () => {
    mockVerifySessionToken.mockResolvedValue(null);
    const { middleware } = await import('@/middleware');
    const res = await middleware(makeRequest('/dev/component-approval', 'bm_session=bad-token'));
    expect(mockVerifySessionToken).toHaveBeenCalledWith('bad-token', 'test-secret');
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect(res).toEqual({ type: 'redirect', url: 'http://localhost/auth/login?redirect=%2Fdev%2Fcomponent-approval' });
  });

  it('returns 403 when user is not an admin', async () => {
    mockVerifySessionToken.mockResolvedValue({
      sub: 'p1',
      username: 'alice',
      role: 'teacher',
      iat: 1,
      exp: 9999999999,
    });
    const { middleware } = await import('@/middleware');
    const res = await middleware(makeRequest('/dev/component-approval', 'bm_session=valid-token'));
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Forbidden: Admin access required' },
      { status: 403 },
    );
    expect(res).toEqual({ type: 'json', body: { error: 'Forbidden: Admin access required' }, status: 403 });
  });

  it('allows access when user is an admin', async () => {
    mockVerifySessionToken.mockResolvedValue({
      sub: 'p1',
      username: 'admin',
      role: 'admin',
      iat: 1,
      exp: 9999999999,
    });
    const { middleware } = await import('@/middleware');
    const res = await middleware(makeRequest('/dev/component-approval/subpage', 'bm_session=valid-token'));
    expect(res).toEqual({ type: 'next' });
  });
});

describe('middleware config', () => {
  it('matches /dev/component-approval and subpaths', async () => {
    const { config } = await import('@/middleware');
    expect(config.matcher).toEqual(['/dev/component-approval/:path*']);
  });
});
