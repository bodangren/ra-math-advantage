import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockCookies,
  mockFetchInternalQuery,
  mockRedirect,
  mockRequireActiveRequestSessionClaims,
  mockVerifySessionToken,
} = vi.hoisted(() => ({
  mockCookies: vi.fn(),
  mockFetchInternalQuery: vi.fn(),
  mockRedirect: vi.fn(),
  mockRequireActiveRequestSessionClaims: vi.fn(),
  mockVerifySessionToken: vi.fn(),
}));

vi.mock('next/headers', () => ({ cookies: mockCookies }));
vi.mock('next/navigation', () => ({ redirect: mockRedirect }));
vi.mock('@/lib/auth/session', () => ({
  getAuthJwtSecret: () => 'test-secret',
  SESSION_COOKIE_NAME: 'bm_session',
  verifySessionToken: mockVerifySessionToken,
}));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    auth: { getAccountById: 'getAccountById' },
    foundation: { resolveAccessContext: 'resolveAccessContext' },
  },
}));
vi.mock('@math-platform/core-auth', () => ({
  buildRequestForbiddenResponse: (message: string) => new Response(message, { status: 403 }),
  requireActiveRequestSessionClaims: mockRequireActiveRequestSessionClaims,
}));

const {
  getCurrentDanielsonAccount,
  getServerSessionClaims,
  requireDanielsonApiSession,
  requireDanielsonSession,
} = await import('../../../lib/auth/server');

const claims = {
  sub: 'accounts:admin',
  username: 'admin',
  role: 'admin' as const,
  organizationId: 'stale-client-organization',
  iat: 1,
  exp: 2,
};

function account(overrides: Record<string, unknown> = {}) {
  return {
    accountId: 'accounts:admin',
    organizationId: 'organizations:school',
    accountIsActive: true,
    organizationIsActive: true,
    credentialIsActive: true,
    mustChangePassword: false,
    ...overrides,
  };
}

describe('Danielson protected API session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies.mockResolvedValue({ get: () => ({ value: 'session-token' }) });
    mockRedirect.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    });
    mockVerifySessionToken.mockResolvedValue(claims);
    mockRequireActiveRequestSessionClaims.mockImplementation(
      async (_request: Request, _verify: unknown, verifyActive: (value: typeof claims) => Promise<boolean>) => (
        await verifyActive(claims)
          ? claims
          : new Response('Unauthorized', { status: 401 })
      ),
    );
  });

  it('reads the session token from the protected cookie', async () => {
    await expect(getServerSessionClaims()).resolves.toEqual(claims);
    expect(mockVerifySessionToken).toHaveBeenCalledWith('session-token', 'test-secret');
  });

  it('uses only current database roles in the account view', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce(account())
      .mockResolvedValueOnce({ roleAssignments: [{ role: 'slt' }, { role: 'teacher' }] });

    await expect(getCurrentDanielsonAccount(claims)).resolves.toMatchObject({
      danielsonRoles: ['slt', 'teacher'],
      organizationId: 'organizations:school',
    });
  });

  it('redirects a temporary credential to the password-change page', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce(account({ mustChangePassword: true }))
      .mockResolvedValueOnce({ roleAssignments: [] });

    await expect(requireDanielsonSession('/admin')).rejects.toThrow(
      'REDIRECT:/auth/change-password',
    );
  });

  it('rejects a session when its current credential is inactive', async () => {
    mockFetchInternalQuery.mockResolvedValue(account({ credentialIsActive: false }));

    const result = await requireDanielsonApiSession(new Request('http://localhost/api/admin'));

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
  });

  it('requires a password change before normal protected API work', async () => {
    mockFetchInternalQuery.mockResolvedValue(account({ mustChangePassword: true }));

    const result = await requireDanielsonApiSession(new Request('http://localhost/api/admin'));

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(403);
    await expect((result as Response).text()).resolves.toBe('Password change required');
  });

  it('permits only the password-change endpoint to use a temporary credential', async () => {
    mockFetchInternalQuery.mockResolvedValue(account({ mustChangePassword: true }));

    await expect(requireDanielsonApiSession(
      new Request('http://localhost/api/auth/change-password'),
      { allowTemporaryCredential: true },
    )).resolves.toEqual(claims);
  });
});
