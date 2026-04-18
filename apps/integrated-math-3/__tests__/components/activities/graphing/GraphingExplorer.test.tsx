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

describe('GraphingExplorer - find_intercepts variant', () => {
  const defaultProps = {
    activityId: 'test-activity-3',
    variant: 'find_intercepts' as const,
    equation: 'y = x^2 - 4',
    domain: [-10, 10] as [number, number],
    range: [-10, 10] as [number, number],
  };

  describe('teaching mode', () => {
    it('renders the graph with intercepts highlighted', () => {
      const props = {
        ...defaultProps,
        points: [[-2, 0], [2, 0]] as [number, number][],
      };
      render(<GraphingExplorer {...props} mode="teaching" />);

      expect(screen.getByText(/find the x-intercepts/i)).toBeInTheDocument();
      expect(screen.getByText('y = x^2 - 4')).toBeInTheDocument();
    });

    it('shows all x-intercepts labeled', () => {
      const props = {
        ...defaultProps,
        points: [[-2, 0], [2, 0]] as [number, number][],
      };
      render(<GraphingExplorer {...props} mode="teaching" />);

      const intercept1Labels = screen.queryAllByText(/-2\.0, 0\.0/i);
      const intercept2Labels = screen.queryAllByText(/2\.0, 0\.0/i);
      expect(intercept1Labels.length).toBeGreaterThan(0);
      expect(intercept2Labels.length).toBeGreaterThan(0);
    });

    it('is read-only - no interaction allowed', () => {
      render(<GraphingExplorer {...defaultProps} mode="teaching" />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('guided mode', () => {
    it('shows instruction to find x-intercepts', () => {
      render(<GraphingExplorer {...defaultProps} mode="guided" />);

      expect(screen.getByText(/find the x-intercepts/i)).toBeInTheDocument();
    });

    it('allows student to identify intercepts by tapping on graph', async () => {
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
      fireEvent.click(canvas, { clientX: 240, clientY: 300 });
      fireEvent.click(canvas, { clientX: 360, clientY: 300 });

      await waitFor(() => {
        const intercept1Labels = screen.queryAllByText(/-2\.0, 0\.0/i);
        const intercept2Labels = screen.queryAllByText(/2\.0, 0\.0/i);
        expect(intercept1Labels.length).toBeGreaterThan(0);
        expect(intercept2Labels.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('provides feedback when intercepts are correctly identified', async () => {
      const onSubmit = vi.fn();
      const props = {
        ...defaultProps,
        points: [[-2, 0], [2, 0]] as [number, number][],
        onSubmit,
      };
      render(<GraphingExplorer {...props} mode="guided" />);

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach((input, index) => {
        const xValues = [-2, -1, 0, 1, 2];
        fireEvent.change(input, { target: { value: String(xValues[index] ** 2 - 4) } });
      });

      await waitFor(() => {
        const submitButton = screen.queryByText(/submit/i);
        expect(submitButton).toBeInTheDocument();
      });

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 240, clientY: 300 });
      fireEvent.click(canvas, { clientX: 360, clientY: 300 });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/correct!/i)).toBeInTheDocument();
      });
    });

    it('handles case of no real intercepts', async () => {
      const props = {
        ...defaultProps,
        equation: 'y = x^2 + 4',
        points: [] as [number, number][],
      };
      render(<GraphingExplorer {...props} mode="guided" />);

      expect(screen.getByText(/this function has no real x-intercepts/i)).toBeInTheDocument();
    });

    it('records intercept identification in submission', async () => {
      const onSubmit = vi.fn();
      const props = {
        ...defaultProps,
        points: [[-2, 0], [2, 0]] as [number, number][],
        onSubmit,
      };
      render(<GraphingExplorer {...props} mode="guided" />);

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach((input, index) => {
        const xValues = [-2, -1, 0, 1, 2];
        fireEvent.change(input, { target: { value: String(xValues[index] ** 2 - 4) } });
      });

      await waitFor(() => {
        const submitButton = screen.queryByText(/submit/i);
        expect(submitButton).toBeInTheDocument();
      });

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 240, clientY: 300 });
      fireEvent.click(canvas, { clientX: 360, clientY: 300 });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        const submission = onSubmit.mock.calls[0][0];
        expect(submission.answers.intercepts).toBeDefined();
        expect(submission.parts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              partId: 'intercepts',
              isCorrect: expect.any(Boolean),
            }),
          ])
        );
      });
    });
  });

  describe('practice mode', () => {
    it('shows instruction to find x-intercepts', () => {
      render(<GraphingExplorer {...defaultProps} mode="practice" />);

      expect(screen.getByText(/find the x-intercepts/i)).toBeInTheDocument();
    });

    it('allows direct plotting without table', async () => {
      const onSubmit = vi.fn();
      render(<GraphingExplorer {...defaultProps} mode="practice" onSubmit={onSubmit} />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 240, clientY: 300 });
      fireEvent.click(canvas, { clientX: 360, clientY: 300 });

      await waitFor(() => {
        const intercept1Labels = screen.queryAllByText(/-2\.0, 0\.0/i);
        const intercept2Labels = screen.queryAllByText(/2\.0, 0\.0/i);
        expect(intercept1Labels.length).toBeGreaterThan(0);
        expect(intercept2Labels.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('overlays correct intercepts after submission', async () => {
      const onSubmit = vi.fn();
      const props = {
        ...defaultProps,
        points: [[-2, 0], [2, 0]] as [number, number][],
        onSubmit,
      };
      render(<GraphingExplorer {...props} mode="practice" />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 240, clientY: 300 });
      fireEvent.click(canvas, { clientX: 360, clientY: 300 });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/correct solution/i)).toBeInTheDocument();
        const intercept1Labels = screen.queryAllByText(/-2\.0, 0\.0/i);
        const intercept2Labels = screen.queryAllByText(/2\.0, 0\.0/i);
        expect(intercept1Labels.length).toBeGreaterThan(0);
        expect(intercept2Labels.length).toBeGreaterThan(0);
      });
    });

    it('assesses intercept identification for correctness', async () => {
      const onSubmit = vi.fn();
      const props = {
        ...defaultProps,
        points: [[-2, 0], [2, 0]] as [number, number][],
        onSubmit,
      };
      render(<GraphingExplorer {...props} mode="practice" />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 240, clientY: 300 });
      fireEvent.click(canvas, { clientX: 360, clientY: 300 });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        const submission = onSubmit.mock.calls[0][0];
        expect(submission.parts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              partId: 'intercepts',
              isCorrect: true,
            }),
          ])
        );
      });
    });
  });
});

describe('GraphingExplorer - graph_system variant', () => {
  const defaultProps = {
    activityId: 'test-activity-4',
    variant: 'graph_system' as const,
    equation: 'y = x^2 - 4',
    linearEquation: 'y = x',
    domain: [-10, 10] as [number, number],
    range: [-10, 10] as [number, number],
  };

  describe('teaching mode', () => {
    it('renders two functions (quadratic and linear) with different colors', () => {
      const props = {
        ...defaultProps,
        points: [[-2, -2], [2, 2]] as [number, number][],
      };
      render(<GraphingExplorer {...props} mode="teaching" />);

      expect(screen.getByText(/graph the system of equations/i)).toBeInTheDocument();
      const equationContainer = screen.getByText(/y = x\^2 - 4/).parentElement;
      expect(equationContainer?.textContent).toContain('y = x^2 - 4');
      expect(equationContainer?.textContent).toContain('y = x');
    });

    it('shows intersection points labeled', () => {
      const props = {
        ...defaultProps,
        points: [[-2, -2], [2, 2]] as [number, number][],
      };
      render(<GraphingExplorer {...props} mode="teaching" />);

      const point1Labels = screen.queryAllByText(/-2\.0, -2\.0/i);
      const point2Labels = screen.queryAllByText(/2\.0, 2\.0/i);
      expect(point1Labels.length).toBeGreaterThan(0);
      expect(point2Labels.length).toBeGreaterThan(0);
    });

    it('is read-only - no interaction allowed', () => {
      render(<GraphingExplorer {...defaultProps} mode="teaching" />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('guided mode', () => {
    it('shows instruction to find intersection points', () => {
      render(<GraphingExplorer {...defaultProps} mode="guided" />);

      expect(screen.getByText(/find the intersection points/i)).toBeInTheDocument();
    });

    it('allows student to identify intersection points by tapping on graph', async () => {
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
      fireEvent.click(canvas, { clientX: 240, clientY: 360 });
      fireEvent.click(canvas, { clientX: 360, clientY: 240 });

      await waitFor(() => {
        const point1Labels = screen.queryAllByText(/-2\.0, -2\.0/i);
        const point2Labels = screen.queryAllByText(/2\.0, 2\.0/i);
        expect(point1Labels.length).toBeGreaterThan(0);
        expect(point2Labels.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('provides feedback when intersection points are correctly identified', async () => {
      const onSubmit = vi.fn();
      const props = {
        ...defaultProps,
        points: [[-2, -2], [2, 2]] as [number, number][],
        onSubmit,
      };
      render(<GraphingExplorer {...props} mode="guided" />);

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach((input, index) => {
        const xValues = [-2, -1, 0, 1, 2];
        fireEvent.change(input, { target: { value: String(xValues[index] ** 2 - 4) } });
      });

      await waitFor(() => {
        const submitButton = screen.queryByText(/submit/i);
        expect(submitButton).toBeInTheDocument();
      });

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 240, clientY: 360 });
      fireEvent.click(canvas, { clientX: 360, clientY: 240 });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/correct!/i)).toBeInTheDocument();
      });
    });

    it('handles case of no real intersection points', async () => {
      const props = {
        ...defaultProps,
        equation: 'y = x^2 + 4',
        linearEquation: 'y = 0',
        points: [] as [number, number][],
      };
      render(<GraphingExplorer {...props} mode="guided" />);

      expect(screen.getByText(/this system has no real intersection points/i)).toBeInTheDocument();
    });

    it('records intersection point identification in submission', async () => {
      const onSubmit = vi.fn();
      const props = {
        ...defaultProps,
        points: [[-2, -2], [2, 2]] as [number, number][],
        onSubmit,
      };
      render(<GraphingExplorer {...props} mode="guided" />);

      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach((input, index) => {
        const xValues = [-2, -1, 0, 1, 2];
        fireEvent.change(input, { target: { value: String(xValues[index] ** 2 - 4) } });
      });

      await waitFor(() => {
        const submitButton = screen.queryByText(/submit/i);
        expect(submitButton).toBeInTheDocument();
      });

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 240, clientY: 360 });
      fireEvent.click(canvas, { clientX: 360, clientY: 240 });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        const submission = onSubmit.mock.calls[0][0];
        expect(submission.answers.intersections).toBeDefined();
        expect(submission.parts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              partId: 'intersections',
              isCorrect: expect.any(Boolean),
            }),
          ])
        );
      });
    });
  });

  describe('practice mode', () => {
    it('shows instruction to find intersection points', () => {
      render(<GraphingExplorer {...defaultProps} mode="practice" />);

      expect(screen.getByText(/find the intersection points/i)).toBeInTheDocument();
    });

    it('allows direct plotting without table', async () => {
      const onSubmit = vi.fn();
      render(<GraphingExplorer {...defaultProps} mode="practice" onSubmit={onSubmit} />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 240, clientY: 360 });
      fireEvent.click(canvas, { clientX: 360, clientY: 240 });

      await waitFor(() => {
        const point1Labels = screen.queryAllByText(/-2\.0, -2\.0/i);
        const point2Labels = screen.queryAllByText(/2\.0, 2\.0/i);
        expect(point1Labels.length).toBeGreaterThan(0);
        expect(point2Labels.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    it('overlays correct intersection points after submission', async () => {
      const onSubmit = vi.fn();
      const props = {
        ...defaultProps,
        points: [[-2, -2], [2, 2]] as [number, number][],
        onSubmit,
      };
      render(<GraphingExplorer {...props} mode="practice" />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 240, clientY: 360 });
      fireEvent.click(canvas, { clientX: 360, clientY: 240 });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/correct solution/i)).toBeInTheDocument();
        const point1Labels = screen.queryAllByText(/-2\.0, -2\.0/i);
        const point2Labels = screen.queryAllByText(/2\.0, 2\.0/i);
        expect(point1Labels.length).toBeGreaterThan(0);
        expect(point2Labels.length).toBeGreaterThan(0);
      });
    });

    it('assesses intersection point identification for correctness', async () => {
      const onSubmit = vi.fn();
      const props = {
        ...defaultProps,
        points: [[-2, -2], [2, 2]] as [number, number][],
        onSubmit,
      };
      render(<GraphingExplorer {...props} mode="practice" />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      fireEvent.click(canvas, { clientX: 240, clientY: 360 });
      fireEvent.click(canvas, { clientX: 360, clientY: 240 });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        const submission = onSubmit.mock.calls[0][0];
        expect(submission.parts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              partId: 'intersections',
              isCorrect: true,
            }),
          ])
        );
      });
    });
  });
});

describe('GraphingExplorer - compare_functions variant', () => {
  const defaultProps = {
    activityId: 'test-activity-2',
    variant: 'compare_functions' as const,
    equation: 'y = x^2 - 4',
    domain: [-10, 10] as [number, number],
    range: [-10, 10] as [number, number],
  };

  describe('teaching mode', () => {
    it('renders two functions with different colors', () => {
      const props = {
        ...defaultProps,
        comparisonEquation: 'y = x^2',
        comparisonQuestion: 'Which function has a greater y-intercept?',
        comparisonAnswer: 'second' as const,
      };
      render(<GraphingExplorer {...props} mode="teaching" />);

      expect(screen.getByText(/compare the functions/i)).toBeInTheDocument();
      const equationContainer = screen.getByText(/y = x\^2 - 4/).parentElement;
      expect(equationContainer?.textContent).toContain('y = x^2 - 4');
      expect(equationContainer?.textContent).toContain('y = x^2');
    });

    it('shows the correct answer for comparison question', () => {
      const props = {
        ...defaultProps,
        comparisonEquation: 'y = x^2',
        comparisonQuestion: 'Which function has a greater y-intercept?',
        comparisonAnswer: 'second' as const,
      };
      render(<GraphingExplorer {...props} mode="teaching" />);

      expect(screen.getByText(/correct answer: second function/i)).toBeInTheDocument();
    });

    it('is read-only - no interaction allowed', () => {
      const props = {
        ...defaultProps,
        comparisonEquation: 'y = x^2',
        comparisonQuestion: 'Which function has a greater y-intercept?',
        comparisonAnswer: 'second' as const,
      };
      render(<GraphingExplorer {...props} mode="teaching" />);

      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('guided mode', () => {
    it('shows comparison question with radio button options', () => {
      const props = {
        ...defaultProps,
        comparisonEquation: 'y = x^2',
        comparisonQuestion: 'Which function has a greater y-intercept?',
        comparisonAnswer: 'second' as const,
      };
      render(<GraphingExplorer {...props} mode="guided" />);

      expect(screen.getByText(/which function has a greater y-intercept\?/i)).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /first function/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /second function/i })).toBeInTheDocument();
    });

    it('allows selecting an answer for comparison question', async () => {
      const props = {
        ...defaultProps,
        comparisonEquation: 'y = x^2',
        comparisonQuestion: 'Which function has a greater y-intercept?',
        comparisonAnswer: 'second' as const,
      };
      render(<GraphingExplorer {...props} mode="guided" />);

      const firstRadio = screen.getByRole('radio', { name: /first function/i });
      fireEvent.click(firstRadio);

      await waitFor(() => {
        expect(firstRadio).toBeChecked();
      });
    });

    it('shows correct feedback when answer is correct', async () => {
      const onSubmit = vi.fn();
      const props = {
        ...defaultProps,
        comparisonEquation: 'y = x^2',
        comparisonQuestion: 'Which function has a greater y-intercept?',
        comparisonAnswer: 'second' as const,
        onSubmit,
      };
      render(<GraphingExplorer {...props} mode="guided" />);

      const secondRadio = screen.getByRole('radio', { name: /second function/i });
      fireEvent.click(secondRadio);

      await waitFor(() => {
        const submitButton = screen.queryByText(/submit/i);
        expect(submitButton).toBeInTheDocument();
      });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/correct!/i)).toBeInTheDocument();
      });
    });

    it('shows incorrect feedback when answer is wrong', async () => {
      const onSubmit = vi.fn();
      const props = {
        ...defaultProps,
        comparisonEquation: 'y = x^2',
        comparisonQuestion: 'Which function has a greater y-intercept?',
        comparisonAnswer: 'second' as const,
        onSubmit,
      };
      render(<GraphingExplorer {...props} mode="guided" />);

      const firstRadio = screen.getByRole('radio', { name: /first function/i });
      fireEvent.click(firstRadio);

      await waitFor(() => {
        const submitButton = screen.queryByText(/submit/i);
        expect(submitButton).toBeInTheDocument();
      });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
      });
    });

    it('records comparison answer in submission', async () => {
      const onSubmit = vi.fn();
      const props = {
        ...defaultProps,
        comparisonEquation: 'y = x^2',
        comparisonQuestion: 'Which function has a greater y-intercept?',
        comparisonAnswer: 'second' as const,
        onSubmit,
      };
      render(<GraphingExplorer {...props} mode="guided" />);

      const secondRadio = screen.getByRole('radio', { name: /second function/i });
      fireEvent.click(secondRadio);

      await waitFor(() => {
        const submitButton = screen.queryByText(/submit/i);
        expect(submitButton).toBeInTheDocument();
      });

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        const submission = onSubmit.mock.calls[0][0];
        expect(submission.answers.comparisonAnswer).toBe('second');
        expect(submission.parts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              partId: 'comparison',
              isCorrect: true,
            }),
          ])
        );
      });
    });
  });

  describe('practice mode', () => {
    it('shows comparison question with radio button options', () => {
      const props = {
        ...defaultProps,
        comparisonEquation: 'y = x^2',
        comparisonQuestion: 'Which function has a greater y-intercept?',
        comparisonAnswer: 'second' as const,
      };
      render(<GraphingExplorer {...props} mode="practice" />);

      expect(screen.getByText(/which function has a greater y-intercept\?/i)).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /first function/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /second function/i })).toBeInTheDocument();
    });

    it('overlays correct solution after submission', async () => {
      const onSubmit = vi.fn();
      const props = {
        ...defaultProps,
        comparisonEquation: 'y = x^2',
        comparisonQuestion: 'Which function has a greater y-intercept?',
        comparisonAnswer: 'second' as const,
        onSubmit,
      };
      render(<GraphingExplorer {...props} mode="practice" />);

      const firstRadio = screen.getByRole('radio', { name: /first function/i });
      fireEvent.click(firstRadio);

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/correct answer is: second function/i)).toBeInTheDocument();
      });
    });

    it('assesses comparison answer for correctness', async () => {
      const onSubmit = vi.fn();
      const props = {
        ...defaultProps,
        comparisonEquation: 'y = x^2',
        comparisonQuestion: 'Which function has a greater y-intercept?',
        comparisonAnswer: 'second' as const,
        onSubmit,
      };
      render(<GraphingExplorer {...props} mode="practice" />);

      const secondRadio = screen.getByRole('radio', { name: /second function/i });
      fireEvent.click(secondRadio);

      const submitButton = screen.getByText(/submit/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        const submission = onSubmit.mock.calls[0][0];
        expect(submission.parts).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              partId: 'comparison',
              isCorrect: true,
            }),
          ])
        );
      });
    });
  });
});
