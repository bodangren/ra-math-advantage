import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InterceptIdentification } from '@math-platform/activity-components/graphing';

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
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 210, clientY: 200 });

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalled();

      getBoundingClientRectSpy.mockRestore();
    });

    it('snaps to nearby intercept when clicking close to it', () => {
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 210, clientY: 200 });

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'intercept',
          data: expect.objectContaining({
            x: expect.closeTo(-3, 0.1),
          }),
        })
      );

      getBoundingClientRectSpy.mockRestore();
    });

    it('shows correct feedback when intercept is correctly identified', () => {
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 210, clientY: 200 });

      expect(screen.getByText(/correct!/i)).toBeInTheDocument();

      getBoundingClientRectSpy.mockRestore();
    });

    it('shows incorrect feedback when wrong point is selected', () => {
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 400, clientY: 400 });

      expect(screen.getByText(/try again/i)).toBeInTheDocument();

      getBoundingClientRectSpy.mockRestore();
    });

    it('labels identified intercepts with coordinates', () => {
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 210, clientY: 200 });

      expect(screen.getByText(/-3\.0, 0/i)).toBeInTheDocument();

      getBoundingClientRectSpy.mockRestore();
    });
  });

  describe('multiple intercepts', () => {
    it('allows identifying both x-intercepts', () => {
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 210, clientY: 200 });
      fireEvent.click(canvas, { clientX: 330, clientY: 200 });

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalledTimes(2);

      getBoundingClientRectSpy.mockRestore();
    });

    it('shows visual markers for both intercepts', () => {
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 210, clientY: 200 });
      fireEvent.click(canvas, { clientX: 330, clientY: 200 });

      const markers = document.querySelectorAll('.intercept-marker');
      expect(markers.length).toBe(2);

      getBoundingClientRectSpy.mockRestore();
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
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} functionExpression="x^2 - 4" />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 240, clientY: 200 });

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'intercept',
          data: expect.objectContaining({
            x: expect.closeTo(-2, 0.1),
            y: expect.closeTo(0, 0.1),
          }),
        })
      );

      getBoundingClientRectSpy.mockRestore();
    });

    it('handles single x-intercept (tangent to x-axis)', () => {
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} functionExpression="x^2" />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 300, clientY: 200 });

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'intercept',
          data: expect.objectContaining({
            x: expect.closeTo(0, 0.1),
            y: expect.closeTo(0, 0.1),
          }),
        })
      );

      getBoundingClientRectSpy.mockRestore();
    });
  });

  describe('visual feedback', () => {
    it('shows success animation for correct intercept identification', () => {
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 210, clientY: 200 });

      const feedback = screen.getByText(/correct!/i);
      expect(feedback).toHaveClass('text-green-800');

      getBoundingClientRectSpy.mockRestore();
    });

    it('shows error animation for incorrect selection', () => {
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 400, clientY: 400 });

      const feedback = screen.getByText(/try again/i);
      expect(feedback).toHaveClass('text-red-800');

      getBoundingClientRectSpy.mockRestore();
    });

    it('displays identified intercepts with distinct markers', () => {
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 210, clientY: 200 });

      const marker = document.querySelector('.intercept-marker');
      expect(marker).toBeInTheDocument();
      expect(marker).toHaveClass('fill-blue-500');

      getBoundingClientRectSpy.mockRestore();
    });
  });

  describe('completion tracking', () => {
    it('calls callback with all identified intercepts', () => {
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 210, clientY: 200 });
      fireEvent.click(canvas, { clientX: 330, clientY: 200 });

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalledTimes(2);

      const firstCall = defaultProps.onInterceptIdentified.mock.calls[0][0];
      const secondCall = defaultProps.onInterceptIdentified.mock.calls[1][0];

      expect(firstCall.type).toBe('intercept');
      expect(secondCall.type).toBe('intercept');

      getBoundingClientRectSpy.mockRestore();
    });

    it('includes timestamp in intercept identification', () => {
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      const beforeClick = Date.now();
      fireEvent.click(canvas, { clientX: 210, clientY: 200 });
      const afterClick = Date.now();

      const call = defaultProps.onInterceptIdentified.mock.calls[0][0];
      expect(call.timestamp).toBeGreaterThanOrEqual(beforeClick);
      expect(call.timestamp).toBeLessThanOrEqual(afterClick);

      getBoundingClientRectSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('handles linear functions', () => {
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} functionExpression="2x - 4" />);

      const canvas = screen.getByRole('img');
      fireEvent.click(canvas, { clientX: 360, clientY: 200 });

      expect(defaultProps.onInterceptIdentified).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'intercept',
          data: expect.objectContaining({
            x: expect.closeTo(2, 0.1),
          }),
        })
      );

      getBoundingClientRectSpy.mockRestore();
    });

    it('handles constant functions', () => {
      render(<InterceptIdentification {...defaultProps} functionExpression="5" />);

      const noInterceptsButton = screen.getByText(/no real solutions/i);
      expect(noInterceptsButton).not.toBeDisabled();
    });

    it('handles clicking outside canvas gracefully', () => {
      const getBoundingClientRectSpy = vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 600,
        height: 400,
        right: 600,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      render(<InterceptIdentification {...defaultProps} />);

      const canvas = screen.getByRole('img');
      expect(() => fireEvent.click(canvas, { clientX: -100, clientY: -100 })).not.toThrow();

      getBoundingClientRectSpy.mockRestore();
    });
  });
});
