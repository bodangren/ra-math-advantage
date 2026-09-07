import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRequireDanielsonApiSession = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/server', () => ({
  requireDanielsonApiSession: mockRequireDanielsonApiSession,
}));

const mockQuery = vi.hoisted(() => vi.fn());
const mockMutation = vi.hoisted(() => vi.fn());
vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockQuery, fetchInternalMutation: mockMutation,
  internal: { auth: { getAccountById: 'account' }, foundation: { applyAdministrationChange: 'change' } },
}));

const { readAdminChange, applyAdminChange } = await import('../../lib/foundation/admin-route');

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


it('accepts the active account shape returned by the real auth query', async () => {
  mockQuery.mockResolvedValue({ accountId: 'accounts:admin', organizationId: 'org', accountIsActive: true, credentialIsActive: true, organizationIsActive: true });
  mockMutation.mockResolvedValue({ kind: 'applied', targetId: 'department' });
  const prepared = await readAdminChange(new Request('http://localhost/api/admin/departments', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'department.create', name: 'Math', key: 'math' }),
  }));
  expect(await applyAdminChange(prepared)).toEqual({ kind: 'applied', targetId: 'department' });
});
