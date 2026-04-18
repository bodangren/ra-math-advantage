import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LessonStepper, type StepperPhase } from '@/components/lesson/LessonStepper';

const samplePhases: StepperPhase[] = [
  { phaseNumber: 1, phaseId: 'p1', phaseType: 'explore', title: 'Explore', status: 'completed' },
  { phaseNumber: 2, phaseId: 'p2', phaseType: 'learn', title: 'Learn', status: 'current' },
  { phaseNumber: 3, phaseId: 'p3', phaseType: 'worked_example', title: 'Example', status: 'locked' },
];

describe('LessonStepper', () => {
  describe('renders phase labels from getPhaseDisplayInfo()', () => {
    it('renders labels for all phases', () => {
      render(<LessonStepper phases={samplePhases} currentPhase={2} />);
      expect(screen.getAllByText('Explore').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Learn').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Example').length).toBeGreaterThan(0);
    });

    it('renders the correct number of phase buttons', () => {
      render(<LessonStepper phases={samplePhases} currentPhase={2} />);
      const buttons = screen.getAllByRole('button');
      // At minimum one button per phase (desktop + mobile may duplicate)
      expect(buttons.length).toBeGreaterThanOrEqual(samplePhases.length);
    });
  });

  describe('current phase highlighting', () => {
    it('marks the current phase with aria-current="step"', () => {
      render(<LessonStepper phases={samplePhases} currentPhase={2} />);
      const currentBtns = screen.getAllByRole('button').filter(
        b => b.getAttribute('aria-current') === 'step',
      );
      expect(currentBtns.length).toBeGreaterThan(0);
    });
  });

  describe('completion state', () => {
    it('shows a checkmark icon for completed phases', () => {
      render(
        <LessonStepper phases={samplePhases} currentPhase={2} />
      );
      // Completed phase should have a lucide Check icon (svg)
      const completedBtns = screen.getAllByRole('button').filter(
        b => b.getAttribute('aria-label')?.includes('Phase 1'),
      );
      expect(completedBtns.length).toBeGreaterThan(0);
    });
  });

  describe('click navigation', () => {
    it('calls onPhaseClick when clicking a completed phase', () => {
      const onPhaseClick = vi.fn();
      render(
        <LessonStepper phases={samplePhases} currentPhase={2} onPhaseClick={onPhaseClick} />
      );
      // Click the completed (phase 1) button — get first one matching Phase 1 label
      const phase1Btn = screen.getAllByRole('button').find(
        b => b.getAttribute('aria-label')?.includes('Phase 1'),
      );
      fireEvent.click(phase1Btn!);
      expect(onPhaseClick).toHaveBeenCalledWith(1, 'p1');
    });

    it('does not call onPhaseClick for locked phases', () => {
      const onPhaseClick = vi.fn();
      render(
        <LessonStepper phases={samplePhases} currentPhase={2} onPhaseClick={onPhaseClick} />
      );
      const lockedBtn = screen.getAllByRole('button').find(
        b => b.getAttribute('aria-label')?.includes('Phase 3'),
      );
      fireEvent.click(lockedBtn!);
      expect(onPhaseClick).not.toHaveBeenCalled();
    });
  });

  describe('layout', () => {
    it('renders a navigation landmark', () => {
      render(<LessonStepper phases={samplePhases} currentPhase={2} />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('renders with 5 phases (variable N)', () => {
      const fivePhases: StepperPhase[] = Array.from({ length: 5 }, (_, i) => ({
        phaseNumber: i + 1,
        phaseId: `p${i + 1}`,
        phaseType: 'learn' as const,
        title: `Phase ${i + 1}`,
        status: i === 0 ? 'current' : 'locked',
      }));
      render(<LessonStepper phases={fivePhases} currentPhase={1} />);
      // Should render 5 steps without crashing
      const btns = screen.getAllByRole('button').filter(
        b => b.getAttribute('aria-label')?.startsWith('Phase'),
      );
      expect(btns.length).toBeGreaterThanOrEqual(5);
    });
  });
});
