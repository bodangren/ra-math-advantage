import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HintPanel } from '@/components/activities/graphing/HintPanel';

describe('HintPanel', () => {
  const defaultProps = {
    functionExpression: 'x^2 + 2x - 3',
    onHintUsed: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial rendering', () => {
    it('renders hint buttons', () => {
      render(<HintPanel {...defaultProps} />);

      expect(screen.getByText('Show Axis of Symmetry')).toBeInTheDocument();
      expect(screen.getByText('Show Vertex')).toBeInTheDocument();
      expect(screen.getByText('Show Direction')).toBeInTheDocument();
    });

    it('renders all hints as inactive initially', () => {
      render(<HintPanel {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toBeDisabled();
      });
    });

    it('disables all hints when readonly', () => {
      render(<HintPanel {...defaultProps} readonly={true} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('axis of symmetry hint', () => {
    it('calls onHintUsed with axis of symmetry data when clicked', () => {
      render(<HintPanel {...defaultProps} />);

      const axisButton = screen.getByText('Show Axis of Symmetry');
      fireEvent.click(axisButton);

      expect(defaultProps.onHintUsed).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'axis_of_symmetry',
          data: expect.objectContaining({
            x: expect.any(Number),
          }),
        })
      );
    });

    it('calculates correct axis of symmetry for quadratic', () => {
      render(<HintPanel {...defaultProps} />);

      const axisButton = screen.getByText('Show Axis of Symmetry');
      fireEvent.click(axisButton);

      expect(defaultProps.onHintUsed).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'axis_of_symmetry',
          data: { x: -1 },
        })
      );
    });

    it('handles simple x^2 expression', () => {
      render(<HintPanel {...defaultProps} functionExpression="x^2" />);

      const axisButton = screen.getByText('Show Axis of Symmetry');
      fireEvent.click(axisButton);

      expect(defaultProps.onHintUsed).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'axis_of_symmetry',
          data: { x: 0 },
        })
      );
    });
  });

  describe('vertex hint', () => {
    it('calls onHintUsed with vertex data when clicked', () => {
      render(<HintPanel {...defaultProps} />);

      const vertexButton = screen.getByText('Show Vertex');
      fireEvent.click(vertexButton);

      expect(defaultProps.onHintUsed).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'vertex',
          data: expect.objectContaining({
            x: expect.any(Number),
            y: expect.any(Number),
          }),
        })
      );
    });

    it('calculates correct vertex for quadratic', () => {
      render(<HintPanel {...defaultProps} />);

      const vertexButton = screen.getByText('Show Vertex');
      fireEvent.click(vertexButton);

      expect(defaultProps.onHintUsed).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'vertex',
          data: { x: -1, y: -4 },
        })
      );
    });

    it('handles simple x^2 expression', () => {
      render(<HintPanel {...defaultProps} functionExpression="x^2" />);

      const vertexButton = screen.getByText('Show Vertex');
      fireEvent.click(vertexButton);

      expect(defaultProps.onHintUsed).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'vertex',
          data: { x: 0, y: 0 },
        })
      );
    });
  });

  describe('direction hint', () => {
    it('calls onHintUsed with direction data when clicked', () => {
      render(<HintPanel {...defaultProps} />);

      const directionButton = screen.getByText('Show Direction');
      fireEvent.click(directionButton);

      expect(defaultProps.onHintUsed).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'direction',
          data: expect.objectContaining({
            opens: expect.stringMatching(/up|down/),
          }),
        })
      );
    });

    it('identifies upward opening for positive coefficient', () => {
      render(<HintPanel {...defaultProps} functionExpression="x^2" />);

      const directionButton = screen.getByText('Show Direction');
      fireEvent.click(directionButton);

      expect(defaultProps.onHintUsed).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'direction',
          data: { opens: 'up' },
        })
      );
    });

    it('identifies downward opening for negative coefficient', () => {
      render(<HintPanel {...defaultProps} functionExpression="-x^2" />);

      const directionButton = screen.getByText('Show Direction');
      fireEvent.click(directionButton);

      expect(defaultProps.onHintUsed).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'direction',
          data: { opens: 'down' },
        })
      );
    });
  });

  describe('hint usage tracking', () => {
    it('records multiple hint uses', () => {
      render(<HintPanel {...defaultProps} />);

      fireEvent.click(screen.getByText('Show Axis of Symmetry'));
      fireEvent.click(screen.getByText('Show Vertex'));
      fireEvent.click(screen.getByText('Show Direction'));

      expect(defaultProps.onHintUsed).toHaveBeenCalledTimes(3);
    });

    it('passes hint type in callback', () => {
      render(<HintPanel {...defaultProps} />);

      fireEvent.click(screen.getByText('Show Axis of Symmetry'));
      fireEvent.click(screen.getByText('Show Vertex'));

      expect(defaultProps.onHintUsed).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          type: 'axis_of_symmetry',
          data: expect.any(Object),
        })
      );

      expect(defaultProps.onHintUsed).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          type: 'vertex',
          data: expect.any(Object),
        })
      );
    });

    it('includes timestamp in hint usage', async () => {
      render(<HintPanel {...defaultProps} />);

      const beforeClick = Date.now();
      fireEvent.click(screen.getByText('Show Vertex'));
      const afterClick = Date.now();

      expect(defaultProps.onHintUsed).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(Number),
        })
      );

      const call = defaultProps.onHintUsed.mock.calls[0][0];
      expect(call.timestamp).toBeGreaterThanOrEqual(beforeClick);
      expect(call.timestamp).toBeLessThanOrEqual(afterClick);
    });
  });

  describe('hint button states', () => {
    it('disables hint button after it has been used', () => {
      render(<HintPanel {...defaultProps} />);

      const vertexButton = screen.getByText('Show Vertex');
      expect(vertexButton).not.toBeDisabled();

      fireEvent.click(vertexButton);

      expect(vertexButton).toBeDisabled();
    });

    it('shows visual indication for used hints', () => {
      render(<HintPanel {...defaultProps} />);

      const vertexButton = screen.getByText('Show Vertex');
      fireEvent.click(vertexButton);

      expect(vertexButton).toHaveClass('opacity-50');
    });
  });

  describe('edge cases', () => {
    it('handles linear functions (no axis of symmetry)', () => {
      render(<HintPanel {...defaultProps} functionExpression="2x + 1" />);

      const axisButton = screen.getByText('Show Axis of Symmetry');
      fireEvent.click(axisButton);

      expect(defaultProps.onHintUsed).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'axis_of_symmetry',
          data: null,
        })
      );
    });

    it('handles constant functions', () => {
      render(<HintPanel {...defaultProps} functionExpression="5" />);

      const axisButton = screen.getByText('Show Axis of Symmetry');
      fireEvent.click(axisButton);

      expect(defaultProps.onHintUsed).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'axis_of_symmetry',
          data: null,
        })
      );
    });

    it('handles malformed expressions gracefully', () => {
      render(<HintPanel {...defaultProps} functionExpression="invalid" />);

      const vertexButton = screen.getByText('Show Vertex');
      expect(() => fireEvent.click(vertexButton)).not.toThrow();
    });
  });
});
