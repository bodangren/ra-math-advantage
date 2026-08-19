import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRequireDanielsonSession = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/server', () => ({
  requireDanielsonSession: mockRequireDanielsonSession,
}));

vi.mock('@/lib/improvement-plans/improvement-plan-page', () => ({
  getImprovementPlanProposalWorkspace: vi.fn(),
}));

const { default: NewImprovementPlanPage } = await import(
  '../../app/improvement-plans/new/page'
);

describe('new improvement plan page authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireDanielsonSession.mockResolvedValue({
      claims: { sub: 'accounts:supervisor' },
      account: { danielsonRoles: ['school_head'] },
    });
  });

  it('requires a session before it returns the teacher-selection state', async () => {
    await NewImprovementPlanPage({ searchParams: Promise.resolve({}) });

    expect(mockRequireDanielsonSession).toHaveBeenCalledOnce();
    expect(mockRequireDanielsonSession).toHaveBeenCalledWith('/improvement-plans/new');
  });
});
