import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockClaims = {
  sub: 'p_teacher_1',
  username: 'teacher1',
  role: 'teacher' as const,
  organizationId: 'org1',
  iat: 0,
  exp: 9999999999,
};

vi.mock('@/lib/auth/server', () => ({
  requireTeacherSessionClaims: vi.fn(),
}));

describe('TeacherContentAuthoringPage authorization gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the teacher session guard before rendering the composer', async () => {
    const { requireTeacherSessionClaims } = await import('@/lib/auth/server');
    vi.mocked(requireTeacherSessionClaims).mockResolvedValue(mockClaims);

    const { default: Page } = await import('@/app/teacher/content-authoring/page');
    const jsx = await Page({ searchParams: Promise.resolve({}) });

    expect(requireTeacherSessionClaims).toHaveBeenCalledTimes(1);
    expect(requireTeacherSessionClaims).toHaveBeenCalledWith('/auth/login');
    expect(jsx).toBeDefined();
    render(jsx);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /teacher content authoring/i,
    );
  });

  it('propagates the auth redirect for unauthenticated or non-teacher callers', async () => {
    const { requireTeacherSessionClaims } = await import('@/lib/auth/server');
    vi.mocked(requireTeacherSessionClaims).mockRejectedValue(
      new Error('NEXT_REDIRECT'),
    );

    const { default: Page } = await import('@/app/teacher/content-authoring/page');
    await expect(Page({ searchParams: Promise.resolve({}) })).rejects.toThrow(
      'NEXT_REDIRECT',
    );
  });
});
