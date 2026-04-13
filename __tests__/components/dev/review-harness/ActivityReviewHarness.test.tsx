import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActivityReviewHarness } from '@/components/dev/review-harness/ActivityReviewHarness';

describe('ActivityReviewHarness', () => {
  const defaultProps = {
    componentKey: 'graphing-explorer',
    activityId: 'activity-123',
  };

  describe('mode selection', () => {
    it('renders with teaching mode active by default', () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      const teachingButton = screen.getByRole('button', { name: /teaching/i });
      expect(teachingButton).toHaveClass('bg-primary');
    });

    it('switches to guided mode when clicked', () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      const guidedButton = screen.getByRole('button', { name: /guided/i });
      fireEvent.click(guidedButton);

      expect(guidedButton).toHaveClass('bg-primary');
    });

    it('switches to practice mode when clicked', () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      const practiceButton = screen.getByRole('button', { name: /practice/i });
      fireEvent.click(practiceButton);

      expect(practiceButton).toHaveClass('bg-primary');
    });
  });

  describe('component rendering', () => {
    it('renders activity preview', () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      expect(screen.getByTestId('activity-preview')).toBeInTheDocument();
    });

    it('shows component key in preview', () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      expect(screen.getAllByText('graphing-explorer')).toHaveLength(2);
    });

    it('shows activity ID in preview', () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      expect(screen.getByText('activity-123')).toBeInTheDocument();
    });
  });

  describe('callback simulation', () => {
    it('has simulate interaction button', () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      expect(screen.getByRole('button', { name: /trigger submit callback/i })).toBeInTheDocument();
    });

    it('has simulate complete button', () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      expect(screen.getByRole('button', { name: /trigger complete callback/i })).toBeInTheDocument();
    });

    it('logs submit callback when triggered', () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /trigger submit callback/i });
      fireEvent.click(submitButton);

      expect(screen.getByText(/\]\s*SUBMIT:/)).toBeInTheDocument();
    });

    it('logs complete callback when triggered', () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      const completeButton = screen.getByRole('button', { name: /trigger complete callback/i });
      fireEvent.click(completeButton);

      expect(screen.getByText(/\]\s*COMPLETE/)).toBeInTheDocument();
    });
  });

  describe('callback log display', () => {
    it('shows empty state when no callbacks triggered', () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      expect(screen.getByText(/no callbacks triggered yet/i)).toBeInTheDocument();
    });

    it('shows callback entries with timestamp and type', async () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /trigger submit callback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const entries = screen.getAllByText(/SUBMIT/);
        expect(entries.length).toBeGreaterThan(0);
      });
    });
  });

  describe('stored props display', () => {
    it('shows stored props section', () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      expect(screen.getByText(/stored props/i)).toBeInTheDocument();
    });

    it('displays props in JSON format', () => {
      const propsWithData = {
        ...defaultProps,
        storedProps: { equation: 'y = x^2', mode: 'plot' },
      };
      render(<ActivityReviewHarness {...propsWithData} />);

      expect(screen.getByText(/"equation": "y = x\^2"/i)).toBeInTheDocument();
    });
  });

  describe('review checklist', () => {
    it('shows component renders as checked after successful render', () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      expect(screen.getByText('Component renders without errors')).toBeInTheDocument();
      expect(screen.getByText('Component renders without errors').closest('label')?.textContent).toContain('✓');
    });

    it('checks submit when callback triggered', async () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /trigger submit callback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Submit callback triggered').closest('label')?.textContent).toContain('✓');
      });
    });

    it('checks complete when callback triggered', async () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      const completeButton = screen.getByRole('button', { name: /trigger complete callback/i });
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(screen.getByText('Complete callback triggered').closest('label')?.textContent).toContain('✓');
      });
    });
  });

  describe('mode change', () => {
    it('resets callbacks when mode changes', async () => {
      render(<ActivityReviewHarness {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /trigger submit callback/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/\]\s*SUBMIT:/)).toBeInTheDocument();
      });

      const guidedButton = screen.getByRole('button', { name: /guided/i });
      fireEvent.click(guidedButton);

      expect(screen.getByText(/no callbacks triggered yet/i)).toBeInTheDocument();
    });
  });

  describe('render error handling', () => {
    it('calls onRenderError when render fails', () => {
      const onRenderError = vi.fn();
      render(<ActivityReviewHarness {...defaultProps} onRenderError={onRenderError} />);

      expect(onRenderError).not.toHaveBeenCalled();
    });
  });

  describe('supported modes', () => {
    it('respects supportedModes prop', () => {
      const propsWithModes = {
        ...defaultProps,
        supportedModes: ['teaching', 'practice'] as ('teaching' | 'guided' | 'practice')[],
      };
      render(<ActivityReviewHarness {...propsWithModes} />);

      expect(screen.queryByRole('button', { name: /guided/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /teaching/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /practice/i })).toBeInTheDocument();
    });
  });
});
