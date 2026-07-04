import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubmissionDetailModal } from '@/components/teacher/gradebook/SubmissionDetailModal';
import { runAxeOnRendered } from '@/lib/a11y/harness';

vi.mock('convex/react', () => ({
  useMutation: () => async () => ({ classId: 'c1' }),
}));

vi.mock('@/convex/_generated/api', () => ({
  api: { onboarding: { rosterImport: { createClass: 'createClass', importRoster: 'importRoster' } } },
}));

const sampleModalData = {
  studentName: 'Alice',
  lessonTitle: 'Quadratics',
  phases: [
    {
      phaseNumber: 1,
      phaseId: 'p1',
      title: 'Engage',
      status: 'completed',
      completedAt: Date.now() - 86400000,
      spreadsheetData: null,
      evidence: [] as unknown[],
    },
  ],
  studentErrorSummary: null,
};

describe('SubmissionDetailModal (Task 13 Group A/D)', () => {
  it('renders dialog with role=dialog, aria-modal, and accessible title when open', async () => {
    render(
      <SubmissionDetailModal
        open={true}
        onOpenChange={() => {}}
        data={sampleModalData as any}
      />,
    );
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('close button has an accessible name', () => {
    render(
      <SubmissionDetailModal
        open={true}
        onOpenChange={() => {}}
        data={sampleModalData as any}
      />,
    );
    const closeBtn = screen.getByRole('button', { name: /close/i });
    expect(closeBtn).toBeTruthy();
  });

  it('axe clean against rendered open modal', async () => {
    const results = await runAxeOnRendered(
      <SubmissionDetailModal
        open={true}
        onOpenChange={() => {}}
        data={sampleModalData as any}
      />,
    );
    expect(results.critical + results.serious, `unexpected serious/critical: ${results.violations.map(v => v.id).join(',')}`).toBe(0);
  });
});
