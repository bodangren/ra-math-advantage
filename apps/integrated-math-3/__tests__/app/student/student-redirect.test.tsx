import { describe, it, expect, vi } from 'vitest';

const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({ redirect: mockRedirect }));

describe('app/student/page.tsx', () => {
  it('redirects to /student/dashboard when rendered', async () => {
    const { default: StudentPage } = await import('@/app/student/page');
    StudentPage();
    expect(mockRedirect).toHaveBeenCalledWith('/student/dashboard');
  });
});
