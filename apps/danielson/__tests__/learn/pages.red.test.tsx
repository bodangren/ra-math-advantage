import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRequireDanielsonSession = vi.hoisted(() => vi.fn());
const mockNotFound = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/server', () => ({
  requireDanielsonSession: mockRequireDanielsonSession,
}));

vi.mock('next/navigation', () => ({
  notFound: mockNotFound,
}));

const { default: LearnPage } = await import('../../app/learn/page');
const { default: LearnTechniquePage } = await import('../../app/learn/[slug]/page');

describe('Danielson Learn route access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireDanielsonSession.mockResolvedValue({
      account: { danielsonRoles: ['teacher'] },
      claims: { sub: 'accounts:teacher' },
    });
    mockNotFound.mockImplementation(() => {
      throw new Error('not_found');
    });
  });

  it('requires an active session for the Learn index', async () => {
    await LearnPage();
    expect(mockRequireDanielsonSession).toHaveBeenCalledWith('/learn');
  });

  it('requires an active session for one Learn detail page', async () => {
    await LearnTechniquePage({ params: Promise.resolve({ slug: 'cold-call' }) });
    expect(mockRequireDanielsonSession).toHaveBeenCalledWith('/learn/cold-call');
  });

  it('returns not found for an unknown technique', async () => {
    await expect(LearnTechniquePage({
      params: Promise.resolve({ slug: 'not-a-technique' }),
    })).rejects.toThrow('not_found');
    expect(mockNotFound).toHaveBeenCalledOnce();
  });
});
