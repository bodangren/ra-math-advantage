import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityRenderer } from '@/components/lesson/ActivityRenderer';
import { FillInTheBlank } from '@/components/activities/blanks/FillInTheBlank';
import { registerActivity } from '@/lib/activities/registry';
import type { PracticeSubmissionEnvelope, PracticeTimingSummary } from '@/lib/practice/contract';

const mockTiming: PracticeTimingSummary = {
  startedAt: '2026-01-01T00:00:01.000Z',
  submittedAt: '2026-01-01T00:02:00.000Z',
  wallClockMs: 120000,
  activeMs: 90000,
  idleMs: 30000,
  pauseCount: 0,
  focusLossCount: 0,
  visibilityHiddenCount: 0,
  confidence: 'high',
};

vi.mock('@/components/practice-timing', () => ({
  usePracticeTiming: vi.fn(() => ({
    getTiming: vi.fn(() => mockTiming),
    recordInteraction: vi.fn(),
    isTracking: vi.fn(() => true),
  })),
}));

describe('ActivityRenderer - Representative Activity Families with Timing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('comprehension-quiz', () => {
    it('submits practice.v1 envelope with timing through ActivityRenderer', async () => {
      const handleSubmit = vi.fn();
      const { ComprehensionQuizActivity } = await import('@/components/activities/quiz/ComprehensionQuizActivity');
      registerActivity('comprehension-quiz', ComprehensionQuizActivity);

      render(
        <ActivityRenderer
          componentKey="comprehension-quiz"
          activityId="quiz-1"
          mode="practice"
          onSubmit={handleSubmit}
        />
      );

      const user = userEvent.setup();
      const buttons = screen.getAllByRole('button');
      const zeroZeroBtn = buttons.find(b => b.textContent?.includes('(0, 0)'));
      const trueBtn = buttons.find(b => b.textContent === 'True');
      await user.click(zeroZeroBtn!);
      await user.click(trueBtn!);

      const mathInput = screen.getByLabelText(/your answer/i);
      await user.type(mathInput, '7');

      const q4Buttons = buttons.filter(b => b.textContent?.includes('☐'));
      await user.click(q4Buttons[0]!); // (x-2)(x+2)
      await user.click(q4Buttons[3]!); // (x+2)(x-2)

      await user.click(screen.getByText(/submit all answers/i));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledOnce();
        const envelope = handleSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
        expect(envelope.contractVersion).toBe('practice.v1');
        expect(envelope.activityId).toBe('quiz-1');
        expect(envelope.mode).toBe('independent_practice');
        expect(envelope.timing).toEqual(mockTiming);
      });
    });
  });

  describe('graphing-explorer', () => {
    it('submits practice.v1 envelope with timing and interactionHistory through ActivityRenderer', async () => {
      const handleSubmit = vi.fn();
      const { GraphingExplorerActivity } = await import('@/components/activities/graphing/GraphingExplorerActivity');
      registerActivity('graphing-explorer', GraphingExplorerActivity);

      render(
        <ActivityRenderer
          componentKey="graphing-explorer"
          activityId="graph-1"
          mode="practice"
          onSubmit={handleSubmit}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/graph the function/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/submit/i));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledOnce();
        const envelope = handleSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
        expect(envelope.contractVersion).toBe('practice.v1');
        expect(envelope.activityId).toBe('graph-1');
        expect(envelope.timing).toEqual(mockTiming);
        expect(Array.isArray(envelope.interactionHistory)).toBe(true);
      });
    });
  });

  describe('step-by-step-solver', () => {
    it('submits practice.v1 envelope with timing through ActivityRenderer', async () => {
      const handleSubmit = vi.fn();
      const { StepByStepSolverActivity } = await import('@/components/activities/algebraic/StepByStepSolverActivity');
      registerActivity('step-by-step-solver', StepByStepSolverActivity);

      render(
        <ActivityRenderer
          componentKey="step-by-step-solver"
          activityId="solver-1"
          mode="practice"
          onSubmit={handleSubmit}
        />
      );

      const user = userEvent.setup();
      const mathInput = screen.getByLabelText(/your answer/i);
      await user.type(mathInput, 'x^2 + 5x + 6 = 0');

      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/next step/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /next step/i }));

      await waitFor(() => {
        const input2 = screen.getByLabelText(/your answer/i);
        expect(input2).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/your answer/i), '(x + 2)(x + 3) = 0');
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/next step/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /next step/i }));
      await user.type(screen.getByLabelText(/your answer/i), 'x + 2 = 0 or x + 3 = 0');
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/next step/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /next step/i }));
      await user.type(screen.getByLabelText(/your answer/i), 'x = -2 or x = -3');
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledOnce();
        const envelope = handleSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
        expect(envelope.contractVersion).toBe('practice.v1');
        expect(envelope.activityId).toBe('solver-1');
        expect(envelope.timing).toEqual(mockTiming);
        expect(envelope.parts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('fill-in-the-blank', () => {
    it('produces a valid practice.v1 envelope (tested directly due to ActivityRenderer prop forwarding)', async () => {
      const handleSubmit = vi.fn();

      render(
        <FillInTheBlank
          activityId="fitb-1"
          mode="practice"
          template="The quadratic formula is {{blank:formula}}."
          blanks={[{ id: 'formula', correctAnswer: 'x = (-b ± √(b²-4ac)) / 2a' }]}
          onSubmit={handleSubmit}
        />
      );

      const user = userEvent.setup();
      const mathInput = screen.getByLabelText(/your answer/i);
      await user.type(mathInput, 'x = (-b ± √(b²-4ac)) / 2a');

      fireEvent.click(screen.getByRole('button', { name: /submit all answers/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledOnce();
        const envelope = handleSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
        expect(envelope.contractVersion).toBe('practice.v1');
        expect(envelope.activityId).toBe('fitb-1');
        expect(envelope.mode).toBe('independent_practice');
        expect(envelope.answers.formula).toBeDefined();
      });
    });
  });
});
