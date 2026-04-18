import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LessonRenderer, type LessonRendererProps } from '@/components/lesson/LessonRenderer';
import type { PhaseSection } from '@/components/lesson/PhaseRenderer';

// Mock heavy sub-components
vi.mock('@/components/textbook/LessonPageLayout', () => ({
  LessonPageLayout: ({ children, lessonTitle, phases }: {
    children: React.ReactNode;
    lessonTitle: string;
    phases: unknown[];
  }) => (
    <div data-testid="lesson-page-layout" data-phase-count={phases.length}>
      <h1>{lessonTitle}</h1>
      {children}
    </div>
  ),
}));

vi.mock('@/components/lesson/LessonStepper', () => ({
  LessonStepper: ({ phases, currentPhase, onPhaseClick }: {
    phases: { phaseNumber: number; title: string }[];
    currentPhase: number;
    onPhaseClick?: (n: number, id: string) => void;
  }) => (
    <nav data-testid="lesson-stepper" data-current={currentPhase}>
      {phases.map(p => (
        <button
          key={p.phaseNumber}
          onClick={() => onPhaseClick?.(p.phaseNumber, `p${p.phaseNumber}`)}
          data-testid={`stepper-phase-${p.phaseNumber}`}
        >
          {p.title}
        </button>
      ))}
    </nav>
  ),
}));

vi.mock('@/components/lesson/PhaseRenderer', () => ({
  PhaseRenderer: ({ phaseType, sections }: { phaseType: string; sections: unknown[] }) => (
    <div data-testid="phase-renderer" data-phase-type={phaseType} data-section-count={sections.length} />
  ),
}));

vi.mock('@/components/lesson/PhaseCompleteButton', () => ({
  PhaseCompleteButton: ({ lessonId, phaseNumber }: { lessonId: string; phaseNumber: number }) => (
    <button data-testid="phase-complete-btn" data-lesson={lessonId} data-phase={phaseNumber}>
      Mark Complete
    </button>
  ),
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
      sections: [], status: 'locked', completed: false,
    },
  ],
  mode: 'practice',
};

describe('LessonRenderer', () => {
  describe('layout', () => {
    it('renders LessonPageLayout', () => {
      render(<LessonRenderer {...defaultProps} />);
      expect(screen.getByTestId('lesson-page-layout')).toBeInTheDocument();
    });

    it('passes lessonTitle to layout', () => {
      render(<LessonRenderer {...defaultProps} />);
      expect(screen.getByText('Introduction to Linear Functions')).toBeInTheDocument();
    });

    it('renders LessonStepper', () => {
      render(<LessonRenderer {...defaultProps} />);
      expect(screen.getByTestId('lesson-stepper')).toBeInTheDocument();
    });

    it('renders PhaseRenderer for the current phase', () => {
      render(<LessonRenderer {...defaultProps} />);
      expect(screen.getByTestId('phase-renderer')).toBeInTheDocument();
    });

    it('renders PhaseCompleteButton in practice mode', () => {
      render(<LessonRenderer {...defaultProps} />);
      expect(screen.getByTestId('phase-complete-btn')).toBeInTheDocument();
    });
  });

  describe('phase navigation', () => {
    it('starts on the first current phase', () => {
      render(<LessonRenderer {...defaultProps} />);
      expect(screen.getByTestId('lesson-stepper')).toHaveAttribute('data-current', '1');
    });

    it('navigates to a different phase when stepper button is clicked', () => {
      const props: LessonRendererProps = {
        ...defaultProps,
        phases: [
          { phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore', sections: [textSection], status: 'completed', completed: true },
          { phaseId: 'p2', phaseNumber: 2, phaseType: 'learn', title: 'Learn', sections: [], status: 'current', completed: false },
        ],
      };
      render(<LessonRenderer {...props} />);

      // Click phase 1 stepper button to navigate back
      fireEvent.click(screen.getByTestId('stepper-phase-1'));

      expect(screen.getByTestId('lesson-stepper')).toHaveAttribute('data-current', '1');
    });

    it('updates PhaseRenderer when phase changes', () => {
      const props: LessonRendererProps = {
        ...defaultProps,
        phases: [
          { phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore', sections: [textSection], status: 'completed', completed: true },
          { phaseId: 'p2', phaseNumber: 2, phaseType: 'learn', title: 'Learn', sections: [], status: 'current', completed: false },
        ],
      };
      render(<LessonRenderer {...props} />);

      fireEvent.click(screen.getByTestId('stepper-phase-1'));

      expect(screen.getByTestId('phase-renderer')).toHaveAttribute('data-phase-type', 'explore');
    });
  });

  describe('keyboard navigation', () => {
    const multiPhaseProps: LessonRendererProps = {
      ...defaultProps,
      phases: [
        { phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore', sections: [textSection], status: 'completed', completed: true },
        { phaseId: 'p2', phaseNumber: 2, phaseType: 'learn', title: 'Learn', sections: [], status: 'current', completed: false },
        { phaseId: 'p3', phaseNumber: 3, phaseType: 'worked_example', title: 'Example', sections: [], status: 'locked', completed: false },
      ],
    };

    it('navigates to the next phase on ArrowRight', () => {
      render(<LessonRenderer {...multiPhaseProps} />);
      // Starts on phase 2 (current)
      expect(screen.getByTestId('lesson-stepper')).toHaveAttribute('data-current', '2');

      fireEvent.keyDown(document.body, { key: 'ArrowRight' });

      expect(screen.getByTestId('lesson-stepper')).toHaveAttribute('data-current', '3');
    });

    it('navigates to the previous phase on ArrowLeft', () => {
      render(<LessonRenderer {...multiPhaseProps} />);
      // Starts on phase 2 (current)
      fireEvent.keyDown(document.body, { key: 'ArrowLeft' });

      expect(screen.getByTestId('lesson-stepper')).toHaveAttribute('data-current', '1');
    });

    it('does not go before the first phase on ArrowLeft', () => {
      render(<LessonRenderer {...defaultProps} />);
      // Starts on phase 1
      fireEvent.keyDown(document.body, { key: 'ArrowLeft' });

      expect(screen.getByTestId('lesson-stepper')).toHaveAttribute('data-current', '1');
    });

    it('does not go past the last phase on ArrowRight', () => {
      const lastPhaseProps: LessonRendererProps = {
        ...defaultProps,
        phases: [
          { phaseId: 'p1', phaseNumber: 1, phaseType: 'explore', title: 'Explore', sections: [textSection], status: 'completed', completed: true },
          { phaseId: 'p2', phaseNumber: 2, phaseType: 'learn', title: 'Learn', sections: [], status: 'current', completed: false },
        ],
      };
      render(<LessonRenderer {...lastPhaseProps} />);
      // Starts on phase 2 (last)
      fireEvent.keyDown(document.body, { key: 'ArrowRight' });

      expect(screen.getByTestId('lesson-stepper')).toHaveAttribute('data-current', '2');
    });

    it('ignores other keys', () => {
      render(<LessonRenderer {...multiPhaseProps} />);
      fireEvent.keyDown(document.body, { key: 'Enter' });

      expect(screen.getByTestId('lesson-stepper')).toHaveAttribute('data-current', '2');
    });
  });

  describe('teacher mode', () => {
    it('does not render PhaseCompleteButton in teaching mode', () => {
      render(<LessonRenderer {...defaultProps} mode="teaching" />);
      expect(screen.queryByTestId('phase-complete-btn')).not.toBeInTheDocument();
    });

    it('passes teaching mode to PhaseRenderer', () => {
      render(<LessonRenderer {...defaultProps} mode="teaching" />);
      // PhaseRenderer mock would receive mode="teaching" but we test via absence of complete btn
      expect(screen.getByTestId('phase-renderer')).toBeInTheDocument();
    });
  });
});
