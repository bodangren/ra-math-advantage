import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityRenderer } from '@/components/lesson/ActivityRenderer';
import { FillInTheBlank } from '@math-platform/activity-components/blanks';
import { registerActivity } from '@math-platform/activity-components/registry';
import type { PracticeSubmissionEnvelope, PracticeTimingSummary } from '@math-platform/practice-core/contract';

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

type ActivityRendererAuthorityProbeProps = {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
  authoredMarker?: string;
};

function ActivityRendererAuthorityProbe({
  activityId,
  mode,
  onSubmit,
  onComplete,
  authoredMarker,
}: ActivityRendererAuthorityProbeProps) {
  return (
    <div
      data-testid="activity-renderer-authority-probe"
      data-activity-id={activityId}
      data-mode={mode}
      data-authored-marker={authoredMarker}
    >
      <button
        onClick={() => onSubmit?.({
          contractVersion: 'practice.v1',
          activityId,
          mode: 'independent_practice',
          status: 'submitted',
          attemptNumber: 1,
          submittedAt: '2026-08-19T10:00:00.000Z',
          answers: { probe: 'trusted submission' },
          parts: [{
            partId: 'probe',
            rawAnswer: 'trusted submission',
            isCorrect: true,
            score: 1,
            maxScore: 1,
          }],
        })}
      >
        Submit probe envelope
      </button>
      <button onClick={onComplete}>Complete probe activity</button>
    </div>
  );
}

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
      await user.click(screen.getByRole('radio', { name: '(0, 0)' }));
      await user.click(screen.getByRole('radio', { name: 'True' }));

      const mathInput = screen.getByLabelText(/your answer/i);
      await user.type(mathInput, '7');

      const q4Buttons = screen.getAllByRole('button').filter((button) => (
        button.textContent?.includes('☐')
      ));
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

      // Step 1
      fireEvent.change(screen.getByLabelText(/your answer/i), { target: { value: 'x^2 + 5x + 6 = 0' } });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/next step/i)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /next step/i }));

      // Step 2
      await waitFor(() => expect(screen.getByLabelText(/your answer/i)).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText(/your answer/i), { target: { value: '(x + 2)(x + 3) = 0' } });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/next step/i)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /next step/i }));

      // Step 3
      await waitFor(() => expect(screen.getByLabelText(/your answer/i)).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText(/your answer/i), { target: { value: 'x + 2 = 0 or x + 3 = 0' } });
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/next step/i)).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: /next step/i }));

      // Step 4 (final)
      await waitFor(() => expect(screen.getByLabelText(/your answer/i)).toBeInTheDocument());
      fireEvent.change(screen.getByLabelText(/your answer/i), { target: { value: 'x = -2 or x = -3' } });
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
    it('forwards template and blanks through ActivityRenderer, then submits a timed practice.v1 envelope', async () => {
      const handleSubmit = vi.fn();
      registerActivity('fill-in-the-blank', FillInTheBlank);

      render(
        <ActivityRenderer
          componentKey="fill-in-the-blank"
          activityId="fitb-1"
          mode="practice"
          onSubmit={handleSubmit}
          activityProps={{
            template: 'The quadratic formula is {{blank:formula}}.',
            blanks: [{ id: 'formula', correctAnswer: 'x = (-b ± √(b²-4ac)) / 2a' }],
          }}
        />
      );

      const user = userEvent.setup();
      const mathInput = screen.getByRole('textbox');
      await user.type(mathInput, 'x = (-b ± √(b²-4ac)) / 2a');

      fireEvent.click(screen.getByRole('button', { name: /submit all answers/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledOnce();
        const envelope = handleSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
        expect(envelope.contractVersion).toBe('practice.v1');
        expect(envelope.activityId).toBe('fitb-1');
        expect(envelope.mode).toBe('independent_practice');
        expect(envelope.timing).toEqual(mockTiming);
        expect(envelope.answers.formula).toBeDefined();
      });
    });
  });

  describe('trusted renderer props', () => {
    it('keeps top-level activity identity and callbacks authoritative while forwarding activity props', async () => {
      const outerSubmit = vi.fn();
      const outerComplete = vi.fn();
      const untrustedSubmit = vi.fn();
      const untrustedComplete = vi.fn();
      registerActivity('activity-renderer-authority-probe', ActivityRendererAuthorityProbe);

      render(
        <ActivityRenderer
          componentKey="activity-renderer-authority-probe"
          activityId="trusted-activity-id"
          mode="practice"
          onSubmit={outerSubmit}
          onComplete={outerComplete}
          activityProps={{
            activityId: 'untrusted-activity-id',
            mode: 'teaching',
            onSubmit: untrustedSubmit,
            onComplete: untrustedComplete,
            authoredMarker: 'forwarded-activity-prop',
          }}
        />
      );

      const probe = screen.getByTestId('activity-renderer-authority-probe');
      expect(probe).toHaveAttribute('data-activity-id', 'trusted-activity-id');
      expect(probe).toHaveAttribute('data-mode', 'practice');
      expect(probe).toHaveAttribute('data-authored-marker', 'forwarded-activity-prop');

      fireEvent.click(screen.getByRole('button', { name: 'Submit probe envelope' }));

      await waitFor(() => {
        expect(outerSubmit).toHaveBeenCalledOnce();
      });
      const envelope = outerSubmit.mock.calls[0][0] as PracticeSubmissionEnvelope;
      expect(envelope.contractVersion).toBe('practice.v1');
      expect(envelope.activityId).toBe('trusted-activity-id');
      expect(envelope.mode).toBe('independent_practice');
      expect(envelope.timing).toEqual(mockTiming);
      expect(untrustedSubmit).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Complete probe activity' }));
      expect(outerComplete).toHaveBeenCalledOnce();
      expect(untrustedComplete).not.toHaveBeenCalled();
    });
  });
});
