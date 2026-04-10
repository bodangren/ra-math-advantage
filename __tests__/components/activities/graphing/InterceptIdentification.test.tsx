import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InterceptIdentification } from '@/components/activities/graphing/InterceptIdentification';

describe('InterceptIdentification', () => {
  const defaultProps = {
    functionExpression: 'x^2 + 2x - 3',
    onInterceptIdentified: vi.fn(),
    readonly: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial rendering', () => {
    it('renders intercept identification prompt', () => {
      render(<InterceptIdentification {...defaultProps} />);

      expect(screen.getByText(/identify the x-intercepts/i)).toBeInTheDocument();
    });

    it('shows no intercepts button by default', () => {
      render(<InterceptIdentification {...defaultProps} />);

      expect(screen.getByText(/no real solutions/i)).toBeInTheDocument();
    });

    it('disables all controls when readonly', () => {
      render(<InterceptIdentification {...defaultProps} readonly={true} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('intercept identification', () => {
    it('allows clicking on canvas to identify intercepts', () => {
      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 100, clientY: 200 });

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalled();
    });

    it('snaps to nearby intercept when clicking close to it', () => {
      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 105, clientY: 300 });

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'intercept',
          data: expect.objectContaining({
            x: expect.closeTo(-3, 0.1),
          }),
        })
      );
    });

    it('shows correct feedback when intercept is correctly identified', () => {
      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 100, clientY: 300 });

      expect(screen.getByText(/correct!/i)).toBeInTheDocument();
    });

    it('shows incorrect feedback when wrong point is selected', () => {
      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 400, clientY: 400 });

      expect(screen.getByText(/try again/i)).toBeInTheDocument();
    });

    it('labels identified intercepts with coordinates', () => {
      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 100, clientY: 300 });

      expect(screen.getByText(/-3, 0/i)).toBeInTheDocument();
    });
  });

  describe('multiple intercepts', () => {
    it('allows identifying both x-intercepts', () => {
      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 100, clientY: 300 });
      fireEvent.click(canvas, { clientX: 500, clientY: 300 });

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalledTimes(2);
    });

    it('shows visual markers for both intercepts', () => {
      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 100, clientY: 300 });
      fireEvent.click(canvas, { clientX: 500, clientY: 300 });

      const markers = document.querySelectorAll('.intercept-marker');
      expect(markers.length).toBe(2);
    });
  });

  describe('no real solutions', () => {
    it('shows no intercepts button for functions with no x-intercepts', () => {
      render(<InterceptIdentification {...defaultProps} functionExpression="x^2 + 1" />);

      const noInterceptsButton = screen.getByText(/no real solutions/i);
      expect(noInterceptsButton).toBeInTheDocument();
    });

    it('allows selecting no real solutions when appropriate', () => {
      render(<InterceptIdentification {...defaultProps} functionExpression="x^2 + 1" />);

      const noInterceptsButton = screen.getByText(/no real solutions/i);
      fireEvent.click(noInterceptsButton);

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalledWith({
        type: 'no_intercepts',
        data: null,
        timestamp: expect.any(Number),
      });
    });

    it('disables no intercepts button for functions with intercepts', () => {
      render(<InterceptIdentification {...defaultProps} functionExpression="x^2 - 4" />);

      const noInterceptsButton = screen.getByText(/no real solutions/i);
      expect(noInterceptsButton).toBeDisabled();
    });
  });

  describe('intercept validation', () => {
    it('calculates correct x-intercepts for quadratic', () => {
      render(<InterceptIdentification {...defaultProps} functionExpression="x^2 - 4" />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 100, clientY: 300 });

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'intercept',
          data: expect.objectContaining({
            x: expect.closeTo(-2, 0.1),
            y: expect.closeTo(0, 0.1),
          }),
        })
      );
    });

    it('handles single x-intercept (tangent to x-axis)', () => {
      render(<InterceptIdentification {...defaultProps} functionExpression="x^2" />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 300, clientY: 300 });

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'intercept',
          data: expect.objectContaining({
            x: expect.closeTo(0, 0.1),
            y: expect.closeTo(0, 0.1),
          }),
        })
      );
    });
  });

  describe('visual feedback', () => {
    it('shows success animation for correct intercept identification', () => {
      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 100, clientY: 300 });

      const feedback = screen.getByText(/correct!/i);
      expect(feedback).toHaveClass('text-green-600');
    });

    it('shows error animation for incorrect selection', () => {
      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 400, clientY: 400 });

      const feedback = screen.getByText(/try again/i);
      expect(feedback).toHaveClass('text-red-600');
    });

    it('displays identified intercepts with distinct markers', () => {
      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 100, clientY: 300 });

      const marker = document.querySelector('.intercept-marker');
      expect(marker).toBeInTheDocument();
      expect(marker).toHaveClass('bg-blue-500');
    });
  });

  describe('completion tracking', () => {
    it('calls callback with all identified intercepts', () => {
      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 100, clientY: 300 });
      fireEvent.click(canvas, { clientX: 500, clientY: 300 });

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalledTimes(2);

      const firstCall = defaultProps.onInterceptIdentified.mock.calls[0][0];
      const secondCall = defaultProps.onInterceptIdentified.mock.calls[1][0];

      expect(firstCall.type).toBe('intercept');
      expect(secondCall.type).toBe('intercept');
    });

    it('includes timestamp in intercept identification', () => {
      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      const beforeClick = Date.now();
      fireEvent.click(canvas, { clientX: 100, clientY: 300 });
      const afterClick = Date.now();

      const call = defaultProps.onInterceptIdentified.mock.calls[0][0];
      expect(call.timestamp).toBeGreaterThanOrEqual(beforeClick);
      expect(call.timestamp).toBeLessThanOrEqual(afterClick);
    });
  });

  describe('edge cases', () => {
    it('handles linear functions', () => {
      render(<InterceptIdentification {...defaultProps} functionExpression="2x - 4" />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 400, clientY: 300 });

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'intercept',
          data: expect.objectContaining({
            x: expect.closeTo(2, 0.1),
          }),
        })
      );
    });

    it('handles constant functions', () => {
      render(<InterceptIdentification {...defaultProps} functionExpression="5" />);

      const noInterceptsButton = screen.getByText(/no real solutions/i);
      expect(noInterceptsButton).toBeDisabled();
    });

    it('handles clicking outside canvas gracefully', () => {
      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      expect(() => fireEvent.click(canvas, { clientX: -100, clientY: -100 })).not.toThrow();
    });
  });
});
