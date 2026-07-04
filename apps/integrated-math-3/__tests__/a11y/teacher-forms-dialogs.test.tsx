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

describe('Adversarial: icon-only button and form-label edge cases (wcag adversarial)', () => {
  it('axe flags a button with empty aria-label="" as a button-name violation', async () => {
    const results = await runAxeOnRendered(
      <button type="button" aria-label="">
        <svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" /></svg>
      </button>,
    );
    const buttonNameViolations = results.violations.filter(v => v.id === 'button-name');
    expect(
      buttonNameViolations.length,
      'empty-string aria-label must NOT satisfy button-name — axe flags it',
    ).toBeGreaterThanOrEqual(1);
  });

  it('detects an orphan <label htmlFor> (no matching control) via structural guard', async () => {
    await runAxeOnRendered(
      <form>
        <label htmlFor="does-not-exist">Missing field</label>
      </form>,
    );
    // axe in jsdom does not always flag orphan label[for] as a violation. Defend
    // with a direct DOM structural assertion: every label[for] must resolve to
    // an element with that id.
    const labels = Array.from(document.querySelectorAll('label[for]'));
    const orphaned = labels.filter(l => !document.getElementById(l.getAttribute('for') ?? ''));
    expect(orphaned.length, 'structural guard: orphan label[for] must be detected').toBeGreaterThanOrEqual(1);
  });

  it('axe flags an icon-only <button> with no accessible name in modified components', async () => {
    const results = await runAxeOnRendered(
      <button type="button">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
        </svg>
      </button>,
    );
    const violations = results.violations.filter(
      v => v.id === 'button-name' && ['critical', 'serious'].includes(v.impact ?? ''),
    );
    expect(
      violations.length,
      'bare icon-only button must be caught — regression guard for a11y work',
    ).toBeGreaterThanOrEqual(1);
  });
});