import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAuthenticateDanielsonLogin = vi.fn();
const mockCookies = vi.fn();
const mockCookieSet = vi.fn();

vi.mock('@/lib/auth/login-service', () => ({
  authenticateDanielsonLogin: mockAuthenticateDanielsonLogin,
}));

vi.mock('next/headers', () => ({
  cookies: mockCookies,
}));

const { POST } = await import('../../../../../app/api/auth/login/route');

function buildRequest(body: unknown, redirect = '/'): Request {
  return new Request(`http://localhost/api/auth/login?redirect=${encodeURIComponent(redirect)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '198.51.100.4',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies.mockResolvedValue({ set: mockCookieSet });
  });

  it('returns one generic error for unknown and incorrect credentials', async () => {
    mockAuthenticateDanielsonLogin.mockResolvedValue({ kind: 'invalid_credentials' });
    const unknownAccount = await POST(buildRequest({ username: 'unknown', password: 'wrong' }));
    const unknownJson = await unknownAccount.json();

    mockAuthenticateDanielsonLogin.mockResolvedValue({ kind: 'invalid_credentials' });
    const incorrectPassword = await POST(buildRequest({ username: 'known', password: 'wrong' }));
    const incorrectJson = await incorrectPassword.json();

    expect(unknownAccount.status).toBe(401);
    expect(incorrectPassword.status).toBe(401);
    expect(unknownJson).toEqual({ error: 'Invalid username or password.' });
    expect(incorrectJson).toEqual(unknownJson);
    expect(mockCookieSet).not.toHaveBeenCalled();
  });

  it('passes the request to the login service and does not accept a client network address', async () => {
    mockAuthenticateDanielsonLogin.mockResolvedValue({ kind: 'invalid_credentials' });

    await POST(buildRequest({
      username: 'teacher.one',
      password: 'wrong',
      networkAddress: 'attacker-controlled-address',
    }));

    expect(mockAuthenticateDanielsonLogin).toHaveBeenCalledWith(
      expect.any(Request),
      { username: 'teacher.one', password: 'wrong' },
    );
  });

  it('returns a throttled response before it creates a session', async () => {
    mockAuthenticateDanielsonLogin.mockResolvedValue({
      kind: 'rate_limited',
      retryAfterSeconds: 90,
    });

    const response = await POST(buildRequest({ username: 'teacher.one', password: 'wrong' }));
    const json = await response.json();

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('90');
    expect(json).toEqual({ error: 'Too many sign-in attempts. Try again later.' });
    expect(mockCookieSet).not.toHaveBeenCalled();
  });

  it('sets a protected cookie and returns a safe requested redirect after a successful sign-in', async () => {
    mockAuthenticateDanielsonLogin.mockResolvedValue({
      kind: 'authenticated',
      sessionToken: 'signed-session-token',
      mustChangePassword: false,
    });

    const response = await POST(buildRequest(
      { username: 'teacher.one', password: 'correct-password' },
      '/admin/accounts',
    ));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true, redirect: '/admin/accounts' });
    expect(mockCookieSet).toHaveBeenCalledWith(
      'bm_session',
      'signed-session-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 12 * 60 * 60,
      }),
    );
  });

  it('uses the password-change route after a temporary-credential sign-in', async () => {
    mockAuthenticateDanielsonLogin.mockResolvedValue({
      kind: 'authenticated',
      sessionToken: 'signed-session-token',
      mustChangePassword: true,
    });

    const response = await POST(buildRequest(
      { username: 'teacher.one', password: 'temporary-password' },
      'https://attacker.example',
    ));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true, redirect: '/auth/change-password' });
    expect(mockCookieSet).toHaveBeenCalledTimes(1);
  });
});
