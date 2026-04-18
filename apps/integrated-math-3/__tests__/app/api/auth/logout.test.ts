import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCookiesSet = vi.fn();
const mockCookies = vi.fn(() => Promise.resolve({ set: mockCookiesSet }));

vi.mock('next/headers', () => ({ cookies: mockCookies }));
vi.mock('@/lib/auth/constants', () => ({
  SESSION_COOKIE_NAME: 'bm_session',
}));

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies.mockResolvedValue({ set: mockCookiesSet });
  });

  it('clears the session cookie and returns ok: true', async () => {
    const { POST } = await import('@/app/api/auth/logout/route');
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
    expect(mockCookiesSet).toHaveBeenCalledWith(
      'bm_session',
      '',
      expect.objectContaining({ expires: new Date(0) }),
    );
  });
});
