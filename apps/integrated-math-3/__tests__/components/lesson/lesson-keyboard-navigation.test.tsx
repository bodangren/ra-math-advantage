import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonRenderer, type LessonRendererProps } from '@/components/lesson/LessonRenderer';
import { LessonCompleteScreen } from '@/components/lesson/LessonCompleteScreen';
import type { PhaseSection } from '@/components/lesson/PhaseRenderer';

// Mock heavy sub-components that would otherwise require dynamic imports
vi.mock('@/components/lesson/PhaseRenderer', () => ({
  PhaseRenderer: ({ phaseType, sections }: { phaseType: string; sections: unknown[] }) => (
    <div data-testid="phase-renderer" data-phase-type={phaseType} data-section-count={sections.length} />
  ),
}));

vi.mock('@/components/student/LessonChatbot', () => ({
  LessonChatbot: () => null,
}));

const textSection: PhaseSection = {
  id: 's1', sequenceOrder: 1, sectionType: 'text', content: { markdown: 'Content' },
};

const defaultProps: LessonRendererProps = {
  lessonId: 'lesson-1',
  lessonTitle: 'Introduction to Linear Functions',
  moduleLabel: 'Module 1',
  lessonNumber: 1,
  phases: [
    {
      phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore',
      sections: [textSection], status: 'current', completed: false,
    },
    {
      phaseId: 'p2', phaseNumber: 2, phaseType: 'learn', title: 'Learn',
      sections: [], status: 'available', completed: false,
    },
    {
      phaseId: 'p3', phaseNumber: 3, phaseType: 'worked_example', title: 'Example',
      sections: [], status: 'locked', completed: false,
    },
  ],
  mode: 'practice',
};

describe('Lesson Page Keyboard Navigation', () => {
  describe('Tab order through lesson shell', () => {
    it('reaches skip link on first Tab, then mobile sidebar toggle', async () => {
      const user = userEvent.setup();
      render(<LessonRenderer {...defaultProps} />);

      await user.tab();
      const skipLink = screen.getByRole('link', { name: /skip to lesson content/i });
      expect(skipLink).toHaveFocus();

      await user.tab();
      const toggle = screen.getByRole('button', { name: /toggle phases navigation/i });
      expect(toggle).toHaveFocus();
    });

    it('cycles through stepper buttons and reaches Mark Complete', async () => {
      const user = userEvent.setup();
      render(<LessonRenderer {...defaultProps} />);

      // Tab past skip link
      await user.tab();
      expect(document.activeElement).toHaveAttribute('href', '#lesson-content');

      // Tab to toggle
      await user.tab();
      expect(document.activeElement).toHaveAttribute('aria-label', 'Toggle phases navigation');

      // Tab through desktop stepper buttons (disabled phase 3 is skipped)
      await user.tab();
      expect(document.activeElement).toHaveAttribute('aria-label', 'Phase 1: Explore');

      await user.tab();
      expect(document.activeElement).toHaveAttribute('aria-label', 'Phase 2: Learn');

      // Tab through mobile stepper buttons (disabled phase 3 is skipped)
      await user.tab();
      expect(document.activeElement).toHaveAttribute('aria-label', 'Phase 1: Explore');

      await user.tab();
      expect(document.activeElement).toHaveAttribute('aria-label', 'Phase 2: Learn');

      // Mark Complete button
      await user.tab();
      expect(document.activeElement).toHaveTextContent(/mark complete/i);
    });

    it('reaches Skip button when phase is skippable', async () => {
      const user = userEvent.setup();
      render(<LessonRenderer {...defaultProps} />);

      // Tab past skip link, toggle, desktop stepper, mobile stepper, and Mark Complete
      await user.tab(); // skip link
      await user.tab(); // toggle
      await user.tab(); // desktop P1
      await user.tab(); // desktop P2
      await user.tab(); // mobile P1
      await user.tab(); // mobile P2
      await user.tab(); // Mark Complete
      await user.tab(); // Skip

      expect(document.activeElement).toHaveTextContent(/skip/i);
    });

    it('does not show Skip button for non-skippable phases', () => {
      const props: LessonRendererProps = {
        ...defaultProps,
        phases: [
          {
            phaseId: 'p1', phaseNumber: 1, phaseType: 'learn', title: 'Learn',
            sections: [], status: 'current', completed: false,
          },
        ],
      };
      render(<LessonRenderer {...props} />);

      const skipButton = screen.queryByRole('button', { name: /^skip$/i });
      expect(skipButton).not.toBeInTheDocument();
    });
  });

  describe('Shift+Tab reverse navigation', () => {
    it('reverses through interactive elements in reverse order', async () => {
      const user = userEvent.setup();
      render(<LessonRenderer {...defaultProps} />);

      // Tab forward to Skip (last interactive element in normal flow)
      await user.tab(); // skip link
      await user.tab(); // toggle
      await user.tab(); // desktop P1
      await user.tab(); // desktop P2
      await user.tab(); // mobile P1
      await user.tab(); // mobile P2
      await user.tab(); // Mark Complete
      await user.tab(); // Skip

      expect(document.activeElement).toHaveTextContent(/skip/i);

      // Shift+Tab backwards
      await user.tab({ shift: true });
      expect(document.activeElement).toHaveTextContent(/mark complete/i);

      await user.tab({ shift: true });
      expect(document.activeElement).toHaveAttribute('aria-label', 'Phase 2: Learn');

      await user.tab({ shift: true });
      expect(document.activeElement).toHaveAttribute('aria-label', 'Phase 1: Explore');

      await user.tab({ shift: true });
      expect(document.activeElement).toHaveAttribute('aria-label', 'Phase 2: Learn');

      await user.tab({ shift: true });
      expect(document.activeElement).toHaveAttribute('aria-label', 'Phase 1: Explore');

      await user.tab({ shift: true });
      expect(document.activeElement).toHaveAttribute('aria-label', 'Toggle phases navigation');

      await user.tab({ shift: true });
      expect(document.activeElement).toHaveAttribute('href', '#lesson-content');
    });
  });

  describe('lesson complete screen keyboard access', () => {
    it('reaches Continue button when lesson is complete', async () => {
      const user = userEvent.setup();
      render(
        <LessonCompleteScreen
          lessonTitle="Test Lesson"
          lessonNumber={1}
          phasesCompleted={3}
          totalPhases={3}
          onContinue={() => {}}
        />
      );

      await user.tab();
      expect(screen.getByRole('button', { name: /continue/i })).toHaveFocus();
    });
  });

  describe('focus indicators', () => {
    it('mobile toggle button has visible focus indicator classes', () => {
      render(<LessonRenderer {...defaultProps} />);
      const toggle = screen.getByRole('button', { name: /toggle phases navigation/i });
      // Should have focus-visible ring styles for keyboard accessibility
      expect(toggle.className).toMatch(/focus-visible:/);
    });

    it('stepper buttons have visible focus indicator classes', () => {
      render(<LessonRenderer {...defaultProps} />);
      const buttons = screen.getAllByRole('button', { name: /phase 1: explore/i });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
      // Should use focus-visible (not focus) so indicator only shows for keyboard
      expect(buttons[0].className).toMatch(/focus-visible:/);
    });
  });
});
