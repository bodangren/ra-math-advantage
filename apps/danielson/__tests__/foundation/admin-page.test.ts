import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockFetchInternalQuery,
  mockRedirect,
  mockRequireDanielsonSession,
} = vi.hoisted(() => ({
  mockFetchInternalQuery: vi.fn(),
  mockRedirect: vi.fn(),
  mockRequireDanielsonSession: vi.fn(),
}));

vi.mock('next/navigation', () => ({ redirect: mockRedirect }));
vi.mock('@/lib/auth/server', () => ({
  requireDanielsonSession: mockRequireDanielsonSession,
}));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    foundation: {
      listAdministrationAccounts: 'list-accounts',
      listAdministrationDepartments: 'list-departments',
    },
  },
}));

const { getCoachAssignmentDirectory } = await import('../../lib/foundation/admin-page');

describe('administration page data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireDanielsonSession.mockResolvedValue({
      claims: { sub: 'accounts:admin' },
      account: { danielsonRoles: ['sysadmin'] },
    });
    mockRedirect.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    });
  });

  it('loads coach and teacher selectors with independent account cursors', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({
        kind: 'allowed',
        accountPage: { items: [{ accountId: 'accounts:coach' }], nextCursor: 'coach-next' },
      })
      .mockResolvedValueOnce({
        kind: 'allowed',
        accountPage: { items: [{ accountId: 'accounts:teacher' }], nextCursor: 'teacher-next' },
      });

    await expect(getCoachAssignmentDirectory('/admin/coaches', {
      coachCursor: 'coach-current',
      teacherCursor: 'teacher-current',
    })).resolves.toEqual({
      coachPage: { items: [{ accountId: 'accounts:coach' }], nextCursor: 'coach-next' },
      teacherPage: { items: [{ accountId: 'accounts:teacher' }], nextCursor: 'teacher-next' },
    });
    expect(mockFetchInternalQuery).toHaveBeenNthCalledWith(1, 'list-accounts', {
      actorAccountId: 'accounts:admin',
      paginationOpts: { cursor: 'coach-current', numItems: 100 },
    });
    expect(mockFetchInternalQuery).toHaveBeenNthCalledWith(2, 'list-accounts', {
      actorAccountId: 'accounts:admin',
      paginationOpts: { cursor: 'teacher-current', numItems: 100 },
    });
  });
});
