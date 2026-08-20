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

  it('accepts a change without client audit metadata', async () => {
    const result = await readAdminChange(new Request('http://localhost/api/admin/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'account.deactivate', targetAccountId: 'accounts:teacher' }),
    }));

    expect(result).toMatchObject({
      claims: { sub: 'accounts:admin' },
      change: { kind: 'account.deactivate', targetAccountId: 'accounts:teacher' },
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
      change: { kind: 'account.deactivate', targetAccountId: 'accounts:teacher' },
    });
  });
});
