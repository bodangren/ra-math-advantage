import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityRenderer } from '@/components/lesson/ActivityRenderer';
import { registerActivity, getRegisteredActivityKeys } from '@/lib/activities/registry';

// A test activity component
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
    registerActivity('test-component', TestActivity);
  });

  describe('registered component', () => {
    it('renders the registered component for a known key', () => {
      render(
        <ActivityRenderer componentKey="test-component" activityId="act-1" />
      );
      expect(screen.getByTestId('test-activity')).toBeInTheDocument();
    });

    it('passes activityId to the component', () => {
      render(
        <ActivityRenderer componentKey="test-component" activityId="act-42" />
      );
      expect(screen.getByTestId('test-activity')).toHaveAttribute('data-activity-id', 'act-42');
    });

    it('passes mode to the component (defaults to practice)', () => {
      render(
        <ActivityRenderer componentKey="test-component" activityId="act-1" />
      );
      expect(screen.getByTestId('test-activity')).toHaveAttribute('data-mode', 'practice');
    });

    it('passes explicit mode to the component', () => {
      render(
        <ActivityRenderer componentKey="test-component" activityId="act-1" mode="teaching" />
      );
      expect(screen.getByTestId('test-activity')).toHaveAttribute('data-mode', 'teaching');
    });

    it('passes onSubmit callback', () => {
      const handleSubmit = vi.fn();
      render(
        <ActivityRenderer componentKey="test-component" activityId="act-1" onSubmit={handleSubmit} />
      );
      expect(screen.getByTestId('test-activity')).toHaveAttribute('data-has-submit', 'true');
    });

    it('passes onComplete callback', () => {
      const handleComplete = vi.fn();
      render(
        <ActivityRenderer componentKey="test-component" activityId="act-1" onComplete={handleComplete} />
      );
      expect(screen.getByTestId('test-activity')).toHaveAttribute('data-has-complete', 'true');
    });
  });

  describe('unregistered component', () => {
    it('shows placeholder for unknown component key', () => {
      render(
        <ActivityRenderer componentKey="unknown-key" activityId="act-1" />
      );
      expect(screen.queryByTestId('test-activity')).not.toBeInTheDocument();
      expect(screen.getByText(/unknown-key/)).toBeInTheDocument();
    });

    it('placeholder does not crash the page', () => {
      const { container } = render(
        <ActivityRenderer componentKey="not-registered" activityId="act-1" />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('registry', () => {
    it('getRegisteredActivityKeys includes registered key', () => {
      expect(getRegisteredActivityKeys()).toContain('test-component');
    });
  });
});
