import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ActivityRenderer } from '@/components/lesson/ActivityRenderer';

describe('ActivityRenderer - graphing-explorer', () => {
  const defaultProps = {
    componentKey: 'graphing-explorer',
    activityId: 'test-activity-1',
    mode: 'practice' as const,
    onSubmit: vi.fn(),
    onComplete: vi.fn(),
  };

  it('renders GraphingExplorer when componentKey is graphing-explorer', async () => {
    render(<ActivityRenderer {...defaultProps} />);

    expect(await screen.findByText(/graph the function/i)).toBeInTheDocument();
    expect(screen.getByText('y = x^2')).toBeInTheDocument();
  });

  it('passes activityId and mode to GraphingExplorer', async () => {
    render(<ActivityRenderer {...defaultProps} mode="teaching" />);

    expect(await screen.findByText(/graph the function/i)).toBeInTheDocument();
  });

  it('calls onSubmit when GraphingExplorer submits', async () => {
    const onSubmit = vi.fn();
    const onComplete = vi.fn();
    render(
      <ActivityRenderer
        {...defaultProps}
        onSubmit={onSubmit}
        onComplete={onComplete}
      />
    );

    const submitButton = await screen.findByText(/submit/i);
    submitButton.click();

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('shows placeholder for unregistered component', () => {
    render(
      <ActivityRenderer
        {...defaultProps}
        componentKey="non-existent-component"
      />
    );

    expect(screen.getByText(/is not yet available/i)).toBeInTheDocument();
  });
});
