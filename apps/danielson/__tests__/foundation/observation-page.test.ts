import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRequireDanielsonSession = vi.hoisted(() => vi.fn());
const mockFetchInternalQuery = vi.hoisted(() => vi.fn());
const mockRedirect = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/server', () => ({
  requireDanielsonSession: mockRequireDanielsonSession,
}));
vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    observations: {
      readRankedTeacherQueue: Symbol('queue'),
      listMyObservationDrafts: Symbol('drafts'),
      readPublishedObservation: Symbol('published'),
      listObservationAmendments: Symbol('amendments'),
    },
  },
}));
vi.mock('next/navigation', () => ({ redirect: mockRedirect }));

const {
  getObservationWorkspace,
  getPublishedObservationPage,
} = await import('../../lib/observations/observation-page');

describe('observation page failures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireDanielsonSession.mockResolvedValue({
      claims: { sub: 'accounts:observer' },
      account: { danielsonRoles: ['school_head'] },
    });
  });

  it('surfaces queue capacity as an operational error', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({ kind: 'queue_capacity_exceeded' })
      .mockResolvedValueOnce({
        kind: 'allowed',
        page: { page: [], isDone: true, continueCursor: '' },
      });

    await expect(getObservationWorkspace('/observations')).rejects.toThrow(
      'The observation queue exceeded its safe capacity.',
    );
    expect(mockRedirect).not.toHaveBeenCalledWith('/unauthorized');
  });

  it('surfaces history capacity as an operational error', async () => {
    mockFetchInternalQuery
      .mockResolvedValueOnce({ kind: 'history_capacity_exceeded' })
      .mockResolvedValueOnce({
        kind: 'allowed',
        page: { page: [], isDone: true, continueCursor: '' },
      });

    await expect(getPublishedObservationPage('/observations/records/one', 'one')).rejects.toThrow(
      'The observation history exceeded its safe capacity.',
    );
    expect(mockRedirect).not.toHaveBeenCalledWith('/unauthorized');
  });
});
