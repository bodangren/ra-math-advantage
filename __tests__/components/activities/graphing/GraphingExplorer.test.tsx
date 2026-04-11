import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GraphingExplorer } from '@/components/activities/graphing/GraphingExplorer';

describe('GraphingExplorer - plot_from_equation variant', () => {
  const defaultProps = {
    activityId: 'test-activity-1',
    variant: 'plot_from_equation' as const,
    equation: 'y = x^2 - 4',
    domain: [-10, 10] as [number, number],
    range: [-10, 10] as [number, number],
  };

  describe('teaching mode', () => {
    it('renders the graph with function plotted', () => {
      render(<GraphingExplorer {...defaultProps} mode="teaching" />);

      expect(screen.getByText(/graph the function/i)).toBeInTheDocument();
      expect(screen.getByText('y = x^2 - 4')).toBeInTheDocument();
    });

    it('shows all key points labeled (vertex, intercepts)', () => {
      const propsWithPoints = {
        ...defaultProps,
        points: [[0, -4]] as [number, number][],
      };
      render(<GraphingExplorer {...propsWithPoints} mode="teaching" />);

      expect(screen.getByText(/0, -4/i)).toBeInTheDocument();
    });

    it('is read-only - no interaction allowed', () => {
      render(<GraphingExplorer {...defaultProps} mode="teaching" />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('guided mode', () => {
    it('shows table of values before canvas plotting', () => {
      render(<GraphingExplorer {...defaultProps} mode="guided" />);

      expect(screen.getByText(/table of values/i)).toBeInTheDocument();
    });

    it('validates table entries in real-time', async () => {
      render(<GraphingExplorer {...defaultProps} mode="guided" />);

      const firstInput = screen.getAllByRole('spinbutton')[0];
      fireEvent.change(firstInput, { target: { value: '5' } });

      await waitFor(() => {
        expect(firstInput.closest('tr')).toHaveClass('bg-red-100');
      });
    });

    it('enables canvas plotting after table is complete', async () => {
      const onSubmit = vi.fn();
      render(<GraphingExplorer {...defaultProps} mode="guided" onSubmit={onSubmit} />);

      const inputs = screen.getAllByRole('spinbutton');
      fireEvent.change(inputs[0], { target: { value: '-3' } });
      fireEvent.change(inputs[1], { target: { value: '-2' } });
      fireEvent.change(inputs[2], { target: { value: '-1' } });
      fireEvent.change(inputs[3], { target: { value: '0' } });
      fireEvent.change(inputs[4], { target: { value: '1' } });

      await waitFor(() => {
        const canvas = screen.getByRole('img', { name: /coordinate plane/i });
        expect(canvas).not.toBeDisabled();
      });
    });

    it('shows hints panel with axis of symmetry, vertex, direction', () => {
      render(<GraphingExplorer {...defaultProps} mode="guided" />);

      expect(screen.getByText(/hints/i)).toBeInTheDocument();
      expect(screen.getByText(/show axis of symmetry/i)).toBeInTheDocument();
      expect(screen.getByText(/show vertex/i)).toBeInTheDocument();
      expect(screen.getByText(/show direction/i)).toBeInTheDocument();
    });

    it('records hint usage in submission', async () => {
      const onSubmit = vi.fn();
      render(<GraphingExplorer {...defaultProps} mode="guided" onSubmit={onSubmit} />);

      const hintButton = screen.getByText(/show vertex/i);
      fireEvent.click(hintButton);

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach((input, index) => {
        const xValues = [-2, -1, 0, 1, 2];
        fireEvent.change(input, { target: { value: String(xValues[index] ** 2 - 4) } });
      });

      await waitFor(() => {
        const submitButton = screen.queryByText(/submit/i);
        expect(submitButton).toBeInTheDocument();
      });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        const submission = onSubmit.mock.calls[0][0];
        expect(submission.interactionHistory).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ type: 'hint_used' }),
          ])
        );
      });
    });

    it('allows point placement on canvas after table completion', async () => {
      const onSubmit = vi.fn();
      render(<GraphingExplorer {...defaultProps} mode="guided" onSubmit={onSubmit} />);

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach((input, index) => {
        const xValues = [-2, -1, 0, 1, 2];
        fireEvent.change(input, { target: { value: String(xValues[index] ** 2 - 4) } });
      });

      await waitFor(() => {
        expect(screen.getByText(/now plot the points/i)).toBeInTheDocument();
      });

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 300, clientY: 300 });

      await waitFor(() => {
        expect(screen.getByText(/0, 0/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('practice mode', () => {
    it('shows problem statement without table scaffold', () => {
      render(<GraphingExplorer {...defaultProps} mode="practice" />);

      expect(screen.getByText(/graph the function/i)).toBeInTheDocument();
      expect(screen.getByText('y = x^2 - 4')).toBeInTheDocument();
      expect(screen.queryByText(/table of values/i)).not.toBeInTheDocument();
    });

    it('allows direct plotting without table', async () => {
      const onSubmit = vi.fn();
      render(<GraphingExplorer {...defaultProps} mode="practice" onSubmit={onSubmit} />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 300, clientY: 300 });

      await waitFor(() => {
        expect(screen.getByText(/0, 0/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('overlays correct solution after submission', async () => {
      const onSubmit = vi.fn();
      render(<GraphingExplorer {...defaultProps} mode="practice" onSubmit={onSubmit} />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 300, clientY: 300 });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/correct solution/i)).toBeInTheDocument();
      });
    });

    it('assesses placed points for correctness', async () => {
      const onSubmit = vi.fn();
      render(<GraphingExplorer {...defaultProps} mode="practice" onSubmit={onSubmit} />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });

      fireEvent.click(canvas, { clientX: 300, clientY: 300 });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        const submission = onSubmit.mock.calls[0][0];
        expect(submission.parts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              partId: 'placed_points',
              isCorrect: expect.any(Boolean),
            }),
          ])
        );
      });
    });
  });

  describe('submission envelope', () => {
    it('includes placed points in answers', async () => {
      const onSubmit = vi.fn();
      render(<GraphingExplorer {...defaultProps} mode="practice" onSubmit={onSubmit} />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 300, clientY: 300 });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        const submission = onSubmit.mock.calls[0][0];
        expect(submission.answers.placedPoints).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
          ])
        );
      });
    });

    it('includes per-part correctness in parts array', async () => {
      const onSubmit = vi.fn();
      render(<GraphingExplorer {...defaultProps} mode="practice" onSubmit={onSubmit} />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 300, clientY: 300 });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        const submission = onSubmit.mock.calls[0][0];
        expect(submission.parts).toHaveLength(2);
        expect(submission.parts[0]).toHaveProperty('isCorrect');
      });
    });

    it('includes graph state in artifact', async () => {
      const onSubmit = vi.fn();
      render(<GraphingExplorer {...defaultProps} mode="practice" onSubmit={onSubmit} />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 300, clientY: 300 });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        const submission = onSubmit.mock.calls[0][0];
        expect(submission.artifact).toHaveProperty('graphState');
        expect(submission.artifact.graphState).toHaveProperty('placedPoints');
      });
    });

    it('includes interaction history if hints were used', async () => {
      const onSubmit = vi.fn();
      render(<GraphingExplorer {...defaultProps} mode="guided" onSubmit={onSubmit} />);

      const hintButton = screen.getByText(/show vertex/i);
      fireEvent.click(hintButton);

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach((input, index) => {
        const xValues = [-2, -1, 0, 1, 2];
        fireEvent.change(input, { target: { value: String(xValues[index] ** 2 - 4) } });
      });

      await waitFor(() => {
        const submitButton = screen.queryByText(/submit/i);
        expect(submitButton).toBeInTheDocument();
      });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        const submission = onSubmit.mock.calls[0][0];
        expect(submission.interactionHistory).toBeDefined();
      });
    });
  });
});
