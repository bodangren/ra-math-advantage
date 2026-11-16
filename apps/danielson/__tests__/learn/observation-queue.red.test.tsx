import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mockGetObservationWorkspace = vi.hoisted(() => vi.fn());

vi.mock('@/lib/observations/observation-page', () => ({
  getObservationWorkspace: mockGetObservationWorkspace,
}));

vi.mock('@math-platform/app-shell', () => ({
  useAuth: () => ({ profile: null }),
  LogoutButton: () => <button type="button">Logout</button>,
}));

const { default: ObservationsPage } = await import('../../app/observations/page');

describe('walkthrough queue Learn links', () => {
  it('opens the Learn page for each prioritized skill', async () => {
    mockGetObservationWorkspace.mockResolvedValue({
      queue: [{
        teacherProfileId: 'teacher_profiles:one',
        displayName: 'Teacher One',
        reason: 'below_proficient',
        eligibleTargetCount: 1,
        shortfall: 2,
        shortfallReason: 'fewer_than_three_eligible_skills',
        targets: [{
          skillId: 'danielson.tlac.skill.double-plan',
          skillTitle: 'Double Plan',
          componentTitle: '1e: Planning Coherent Instruction',
        }],
      }],
      formalCandidates: [],
      drafts: { page: [], isDone: true, continueCursor: '' },
      components: [{ value: 'danielson.framework.component.1e', label: '1e' }],
      permittedTypes: ['walkthrough'],
    });

    render(await ObservationsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole('link', { name: 'Learn Double Plan' })).toHaveAttribute(
      'href',
      '/learn/double-plan',
    );
  });
});
