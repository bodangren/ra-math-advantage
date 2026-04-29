import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityRenderer } from '../renderer/ActivityRenderer';
import { registerActivity, getRegisteredActivityKeys, clearActivityRegistry } from '../registry/index';

// Test activity component
const TestActivity = vi.fn(({ activityId, mode, onSubmit, onComplete }) => (
  <div
    data-testid="test-activity"
    data-activity-id={activityId}
    data-mode={mode}
    data-has-submit={onSubmit ? 'true' : 'false'}
    data-has-complete={onComplete ? 'true' : 'false'}
  >
    Test Activity
  </div>
));

describe('ActivityRenderer', () => {
  beforeEach(() => {
    TestActivity.mockClear();
    clearActivityRegistry();
    registerActivity('test-component', TestActivity);
  });

  describe('registered component', () => {
    it('renders the registered component for a known key', () => {
      render(
        <ActivityRenderer componentKey="test-component" activityId="act-1" />
      );
      expect(screen.getByTestId('test-activity')).toBeTruthy();
    });

    it('passes activityId to the component', () => {
      render(
        <ActivityRenderer componentKey="test-component" activityId="act-42" />
      );
      expect(screen.getByTestId('test-activity').getAttribute('data-activity-id')).toBe('act-42');
    });

    it('passes mode to the component (defaults to practice)', () => {
      render(
        <ActivityRenderer componentKey="test-component" activityId="act-1" />
      );
      expect(screen.getByTestId('test-activity').getAttribute('data-mode')).toBe('practice');
    });

    it('passes explicit mode to the component', () => {
      render(
        <ActivityRenderer componentKey="test-component" activityId="act-1" mode="teaching" />
      );
      expect(screen.getByTestId('test-activity').getAttribute('data-mode')).toBe('teaching');
    });

    it('passes onSubmit callback', () => {
      const handleSubmit = vi.fn();
      render(
        <ActivityRenderer componentKey="test-component" activityId="act-1" onSubmit={handleSubmit} />
      );
      expect(screen.getByTestId('test-activity').getAttribute('data-has-submit')).toBe('true');
    });

    it('passes onComplete callback', () => {
      const handleComplete = vi.fn();
      render(
        <ActivityRenderer componentKey="test-component" activityId="act-1" onComplete={handleComplete} />
      );
      expect(screen.getByTestId('test-activity').getAttribute('data-has-complete')).toBe('true');
    });
  });

  describe('unregistered component', () => {
    it('shows placeholder for unknown component key', () => {
      render(
        <ActivityRenderer componentKey="unknown-key" activityId="act-1" />
      );
      expect(screen.queryByTestId('test-activity')).toBeNull();
      expect(screen.getByText(/unknown-key/)).toBeTruthy();
    });

    it('placeholder does not crash the page', () => {
      const { container } = render(
        <ActivityRenderer componentKey="not-registered" activityId="act-1" />
      );
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('timing injection', () => {
    const mockTiming = {
      startedAt: '2026-04-29T08:00:00Z',
      submittedAt: '2026-04-29T08:01:30Z',
      wallClockMs: 90000,
      activeMs: 75000,
      idleMs: 15000,
      pauseCount: 0,
      focusLossCount: 1,
      visibilityHiddenCount: 0,
      confidence: 'high' as const,
    };

    const validPayload = {
      contractVersion: 'practice.v1',
      activityId: 'act-1',
      mode: 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: '2026-04-29T08:01:30Z',
      answers: { q1: '42' },
      parts: [{ partId: 'q1', rawAnswer: '42' }],
    };

    it('injects timing into submission when useTiming is provided and mode is practice', () => {
      const mockGetTiming = vi.fn().mockReturnValue(mockTiming);
      const mockUseTiming = vi.fn().mockReturnValue({ getTiming: mockGetTiming });
      const onSubmit = vi.fn();

      render(
        <ActivityRenderer
          componentKey="test-component"
          activityId="act-1"
          mode="practice"
          onSubmit={onSubmit}
          useTiming={mockUseTiming}
        />
      );

      const callArgs = TestActivity.mock.calls[0];
      const props = callArgs[0];
      props.onSubmit(validPayload);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submittedPayload = onSubmit.mock.calls[0][0];
      expect(submittedPayload.timing).toEqual(mockTiming);
      expect(mockGetTiming).toHaveBeenCalledTimes(1);
    });

    it('does not inject timing when mode is teaching', () => {
      const mockGetTiming = vi.fn().mockReturnValue(mockTiming);
      const mockUseTiming = vi.fn().mockReturnValue({ getTiming: mockGetTiming });
      const onSubmit = vi.fn();

      render(
        <ActivityRenderer
          componentKey="test-component"
          activityId="act-1"
          mode="teaching"
          onSubmit={onSubmit}
          useTiming={mockUseTiming}
        />
      );

      const callArgs = TestActivity.mock.calls[0];
      const props = callArgs[0];
      props.onSubmit(validPayload);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submittedPayload = onSubmit.mock.calls[0][0];
      expect(submittedPayload.timing).toBeUndefined();
      expect(mockGetTiming).not.toHaveBeenCalled();
    });

    it('does not inject timing when useTiming is not provided', () => {
      const onSubmit = vi.fn();

      render(
        <ActivityRenderer
          componentKey="test-component"
          activityId="act-1"
          mode="practice"
          onSubmit={onSubmit}
        />
      );

      const callArgs = TestActivity.mock.calls[0];
      const props = callArgs[0];
      props.onSubmit(validPayload);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submittedPayload = onSubmit.mock.calls[0][0];
      expect(submittedPayload.timing).toBeUndefined();
    });

    it('does not inject timing if timing already present in payload', () => {
      const existingTiming = {
        startedAt: '2026-04-29T08:00:00Z',
        submittedAt: '2026-04-29T08:01:00Z',
        wallClockMs: 60000,
        activeMs: 50000,
        idleMs: 10000,
        pauseCount: 0,
        focusLossCount: 0,
        visibilityHiddenCount: 0,
        confidence: 'medium' as const,
      };
      const mockGetTiming = vi.fn().mockReturnValue(mockTiming);
      const mockUseTiming = vi.fn().mockReturnValue({ getTiming: mockGetTiming });
      const onSubmit = vi.fn();

      render(
        <ActivityRenderer
          componentKey="test-component"
          activityId="act-1"
          mode="practice"
          onSubmit={onSubmit}
          useTiming={mockUseTiming}
        />
      );

      const callArgs = TestActivity.mock.calls[0];
      const props = callArgs[0];
      props.onSubmit({ ...validPayload, timing: existingTiming });

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submittedPayload = onSubmit.mock.calls[0][0];
      expect(submittedPayload.timing).toEqual(existingTiming);
      expect(mockGetTiming).not.toHaveBeenCalled();
    });

    it('does not inject timing if getTiming returns null', () => {
      const mockGetTiming = vi.fn().mockReturnValue(null);
      const mockUseTiming = vi.fn().mockReturnValue({ getTiming: mockGetTiming });
      const onSubmit = vi.fn();

      render(
        <ActivityRenderer
          componentKey="test-component"
          activityId="act-1"
          mode="practice"
          onSubmit={onSubmit}
          useTiming={mockUseTiming}
        />
      );

      const callArgs = TestActivity.mock.calls[0];
      const props = callArgs[0];
      props.onSubmit(validPayload);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const submittedPayload = onSubmit.mock.calls[0][0];
      expect(submittedPayload.timing).toBeUndefined();
      expect(mockGetTiming).toHaveBeenCalledTimes(1);
    });
  });

  describe('registry', () => {
    it('getRegisteredActivityKeys includes registered key', () => {
      expect(getRegisteredActivityKeys()).toContain('test-component');
    });
  });
});
