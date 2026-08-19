import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRequireDanielsonApiSession = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/server', () => ({
  requireDanielsonApiSession: mockRequireDanielsonApiSession,
}));

const { readAdminChange } = await import('../../lib/foundation/admin-route');

describe('administrator request parsing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireDanielsonApiSession.mockResolvedValue({ sub: 'accounts:admin' });
  });

  it('requires a stable client request ID', async () => {
    const result = await readAdminChange(new Request('http://localhost/api/admin/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'account.deactivate', targetAccountId: 'accounts:teacher' }),
    }));

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(400);
    await expect((result as Response).json()).resolves.toEqual({
      error: 'A valid request ID is required',
    });
  });

  it('removes client actor and organization fields', async () => {
    const result = await readAdminChange(new Request('http://localhost/api/admin/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestId: 'request-1',
        kind: 'account.deactivate',
        targetAccountId: 'accounts:teacher',
        actorAccountId: 'accounts:attacker',
        organizationId: 'organizations:other',
      }),
    }));

    expect(result).not.toBeInstanceOf(Response);
    expect(result).toMatchObject({
      claims: { sub: 'accounts:admin' },
      requestId: 'request-1',
      change: { kind: 'account.deactivate', targetAccountId: 'accounts:teacher' },
    });
  });
});
