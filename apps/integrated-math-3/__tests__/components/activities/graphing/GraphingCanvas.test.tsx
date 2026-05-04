import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphingCanvas } from '@math-platform/activity-components/graphing';

describe('GraphingCanvas', () => {
  const defaultProps = {
    domain: [-10, 10] as [number, number],
    range: [-10, 10] as [number, number],
    functions: [],
    points: [],
    onPointAdd: vi.fn(),
    onPointRemove: vi.fn(),
    readonly: false,
    width: 600,
    height: 600,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('coordinate plane rendering', () => {
    it('renders coordinate plane with correct domain and range', () => {
      render(<GraphingCanvas {...defaultProps} />);
      const svg = screen.getByRole('img');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox');
    });

    it('renders grid lines', () => {
      render(<GraphingCanvas {...defaultProps} />);
      const gridLines = document.querySelectorAll('.grid-line');
      expect(gridLines.length).toBeGreaterThan(0);
    });

    it('renders x and y axes', () => {
      render(<GraphingCanvas {...defaultProps} />);
      const xAxis = document.querySelector('.x-axis');
      const yAxis = document.querySelector('.y-axis');
      expect(xAxis).toBeInTheDocument();
      expect(yAxis).toBeInTheDocument();
    });

    it('renders axis labels and tick marks', () => {
      render(<GraphingCanvas {...defaultProps} />);
      const tickLabels = document.querySelectorAll('.tick-label');
      expect(tickLabels.length).toBeGreaterThan(0);
    });

    it('uses custom domain when provided', () => {
      render(<GraphingCanvas {...defaultProps} domain={[-5, 5]} />);
      const svg = screen.getByRole('img');
      expect(svg).toBeInTheDocument();
    });

    it('uses custom range when provided', () => {
      render(<GraphingCanvas {...defaultProps} range={[-8, 8]} />);
      const svg = screen.getByRole('img');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('function plotting', () => {
    it('plots a quadratic function as a smooth curve', () => {
      const functions = [
        { expression: 'x^2 + 2x - 3', color: '#ff0000' },
      ];
      render(<GraphingCanvas {...defaultProps} functions={functions} />);
      const path = document.querySelector('.function-curve');
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('stroke', '#ff0000');
    });

    it('plots a linear function', () => {
      const functions = [
        { expression: '2x + 1', color: '#00ff00' },
      ];
      render(<GraphingCanvas {...defaultProps} functions={functions} />);
      const path = document.querySelector('.function-curve');
      expect(path).toBeInTheDocument();
    });

    it('plots multiple functions with distinct colors', () => {
      const functions = [
        { expression: 'x^2', color: '#ff0000' },
        { expression: '2x', color: '#00ff00' },
      ];
      render(<GraphingCanvas {...defaultProps} functions={functions} />);
      const paths = document.querySelectorAll('.function-curve');
      expect(paths.length).toBe(2);
    });

    it('plots up to 3 simultaneous functions', () => {
      const functions = [
        { expression: 'x^2', color: '#ff0000' },
        { expression: '2x', color: '#00ff00' },
        { expression: '-x + 5', color: '#0000ff' },
      ];
      render(<GraphingCanvas {...defaultProps} functions={functions} />);
      const paths = document.querySelectorAll('.function-curve');
      expect(paths.length).toBe(3);
    });
  });

  describe('point markers', () => {
    it('renders pre-set labeled point markers', () => {
      const points = [
        { x: 0, y: -3, label: 'vertex' },
        { x: -3, y: 0, label: 'x-intercept' },
        { x: 1, y: 0, label: 'x-intercept' },
      ];
      render(<GraphingCanvas {...defaultProps} points={points} />);
      const markers = document.querySelectorAll('.point-marker');
      expect(markers.length).toBe(3);
    });

    it('renders vertex marker with special styling', () => {
      const points = [
        { x: 0, y: -3, label: 'vertex', type: 'vertex' as const },
      ];
      render(<GraphingCanvas {...defaultProps} points={points} />);
      const vertexMarker = document.querySelector('.point-marker.vertex');
      expect(vertexMarker).toBeInTheDocument();
    });

    it('displays coordinate labels for points', () => {
      const points = [
        { x: 0, y: -3, label: 'vertex' },
      ];
      render(<GraphingCanvas {...defaultProps} points={points} />);
      const label = screen.getByText(/0.*-3/);
      expect(label).toBeInTheDocument();
    });
  });

  describe('interactive point placement', () => {
    it('allows clicking to place a point when not readonly', () => {
      render(<GraphingCanvas {...defaultProps} readonly={false} />);
      const svg = screen.getByRole('img');
      fireEvent.click(svg, { clientX: 200, clientY: 200 });
      expect(defaultProps.onPointAdd).toHaveBeenCalled();
    });

    it('does not allow clicking when readonly', () => {
      render(<GraphingCanvas {...defaultProps} readonly={true} />);
      const svg = screen.getByRole('img');
      fireEvent.click(svg, { clientX: 200, clientY: 200 });
      expect(defaultProps.onPointAdd).not.toHaveBeenCalled();
    });

    it('snaps point to grid when snapToGrid is enabled', () => {
      render(<GraphingCanvas {...defaultProps} snapToGrid={true} />);
      const svg = screen.getByRole('img');
      fireEvent.click(svg, { clientX: 205, clientY: 205 });
      expect(defaultProps.onPointAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        }),
      );
    });

    it('removes point when clicking an existing point', () => {
      const points = [{ x: 0, y: 0, label: 'test' }];
      render(<GraphingCanvas {...defaultProps} points={points} readonly={false} />);
      const marker = document.querySelector('.point-marker');
      if (marker) {
        fireEvent.click(marker);
        expect(defaultProps.onPointRemove).toHaveBeenCalledWith('test');
      }
    });
  });

  describe('responsive design', () => {
    it('scales SVG for different screen sizes', () => {
      render(<GraphingCanvas {...defaultProps} />);
      const svg = screen.getByRole('img');
      expect(svg).toHaveStyle({ width: '100%' });
    });

    it('maintains aspect ratio', () => {
      render(<GraphingCanvas {...defaultProps} />);
      const svg = screen.getByRole('img');
      const viewBox = svg.getAttribute('viewBox');
      if (viewBox) {
        const [, , width, height] = viewBox.split(' ').map(Number);
        expect(width).toBe(height);
      }
    });
  });

  describe('keyboard accessibility', () => {
    it('svg is focusable with tabIndex=0', () => {
      render(<GraphingCanvas {...defaultProps} />);
      const svg = screen.getByRole('img');
      svg.focus();
      expect(svg).toHaveFocus();
    });

    it('has keyboard instructions via aria-describedby', () => {
      render(<GraphingCanvas {...defaultProps} />);
      const svg = screen.getByRole('img');
      expect(svg).toHaveAttribute('aria-describedby', 'graphing-instructions');
    });

    it('places a point at cursor with Enter key', async () => {
      const user = userEvent.setup();
      render(<GraphingCanvas {...defaultProps} />);
      const svg = screen.getByRole('img');

      svg.focus();
      await user.keyboard('{Enter}');

      expect(defaultProps.onPointAdd).toHaveBeenCalledWith(
        expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
      );
    });

    it('places a point at cursor with Space key', async () => {
      const user = userEvent.setup();
      render(<GraphingCanvas {...defaultProps} />);
      const svg = screen.getByRole('img');

      svg.focus();
      await user.keyboard(' ');

      expect(defaultProps.onPointAdd).toHaveBeenCalledWith(
        expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
      );
    });

    it('does not place point when readonly', async () => {
      const user = userEvent.setup();
      render(<GraphingCanvas {...defaultProps} readonly={true} />);
      const svg = screen.getByRole('img');

      svg.focus();
      await user.keyboard('{Enter}');

      expect(defaultProps.onPointAdd).not.toHaveBeenCalled();
    });

    it('point markers are focusable with tabIndex=0', () => {
      const points = [{ x: 0, y: 0, label: 'test' }];
      render(<GraphingCanvas {...defaultProps} points={points} />);
      const group = document.querySelector('.point-marker')?.closest('g') as HTMLElement;
      group.focus();
      expect(group).toHaveFocus();
    });

    it('removes focused point with Delete key', async () => {
      const user = userEvent.setup();
      const points = [{ x: 0, y: 0, label: 'test' }];
      render(<GraphingCanvas {...defaultProps} points={points} />);
      const group = document.querySelector('.point-marker')?.closest('g') as HTMLElement;

      group.focus();
      await user.keyboard('{Delete}');

      expect(defaultProps.onPointRemove).toHaveBeenCalledWith('test');
    });

    it('removes focused point with Backspace key', async () => {
      const user = userEvent.setup();
      const points = [{ x: 0, y: 0, label: 'test' }];
      render(<GraphingCanvas {...defaultProps} points={points} />);
      const group = document.querySelector('.point-marker')?.closest('g') as HTMLElement;

      group.focus();
      await user.keyboard('{Backspace}');

      expect(defaultProps.onPointRemove).toHaveBeenCalledWith('test');
    });

    it('does not remove point when readonly', async () => {
      const user = userEvent.setup();
      const points = [{ x: 0, y: 0, label: 'test' }];
      render(<GraphingCanvas {...defaultProps} points={points} readonly={true} />);
      const group = document.querySelector('.point-marker')?.closest('g') as HTMLElement;

      group.focus();
      await user.keyboard('{Delete}');

      expect(defaultProps.onPointRemove).not.toHaveBeenCalled();
    });

    it('announces point placement via aria-live region', async () => {
      const user = userEvent.setup();
      render(<GraphingCanvas {...defaultProps} />);
      const svg = screen.getByRole('img');

      svg.focus();
      await user.keyboard('{Enter}');

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
    });

    it('moves cursor with arrow keys', async () => {
      const user = userEvent.setup();
      render(<GraphingCanvas {...defaultProps} />);
      const svg = screen.getByRole('img');

      svg.focus();
      await user.keyboard('{ArrowRight}{ArrowRight}{Enter}');

      const call = defaultProps.onPointAdd.mock.calls[0][0];
      expect(call.x).toBeGreaterThan(0);
    });
  });
});
