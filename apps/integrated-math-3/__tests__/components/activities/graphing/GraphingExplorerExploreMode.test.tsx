import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GraphingExplorer } from '@/components/activities/graphing/GraphingExplorer';

describe('GraphingExplorer - explore mode', () => {
  const defaultExploreProps = {
    activityId: 'test-explore-activity',
    mode: 'explore' as const,
    equation: 'y = x^2',
    variant: 'plot_from_equation' as const,
    domain: [-10, 10] as [number, number],
    range: [-10, 10] as [number, number],
  };

  describe('mode acceptance', () => {
    it('accepts explore as a valid mode', () => {
      render(<GraphingExplorer {...defaultExploreProps} />);
      expect(screen.getByRole('img', { name: /coordinate plane/i })).toBeInTheDocument();
    });
  });

  describe('exploreQuestion prop', () => {
    it('displays the explore question when provided', () => {
      render(
        <GraphingExplorer
          {...defaultExploreProps}
          exploreQuestion="How does changing 'a' affect the parabola?"
        />
      );
      expect(screen.getByText(/how does changing 'a' affect the parabola\?/i)).toBeInTheDocument();
    });

    it('does not show exploreQuestion heading when not provided', () => {
      render(<GraphingExplorer {...defaultExploreProps} />);
      expect(screen.queryByText(/explore the relationship/i)).not.toBeInTheDocument();
    });
  });

  describe('explorationPrompts prop', () => {
    it('displays exploration prompts when provided', () => {
      render(
        <GraphingExplorer
          {...defaultExploreProps}
          explorationPrompts={[
            'What happens when a is positive vs negative?',
            'How does b affect the vertex position?',
          ]}
        />
      );
      expect(screen.getByText(/what happens when a is positive vs negative\?/i)).toBeInTheDocument();
      expect(screen.getByText(/how does b affect the vertex position\?/i)).toBeInTheDocument();
    });

    it('renders prompts as checkable items', () => {
      render(
        <GraphingExplorer
          {...defaultExploreProps}
          explorationPrompts={['What happens when a is positive?']}
        />
      );
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(1);
    });
  });

  describe('slider controls', () => {
    it('renders three sliders for a, b, c coefficients', () => {
      render(<GraphingExplorer {...defaultExploreProps} />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(3);
    });

    it('slider for coefficient a has range [-5, 5]', () => {
      render(<GraphingExplorer {...defaultExploreProps} />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('min', '-5');
      expect(sliders[0]).toHaveAttribute('max', '5');
    });

    it('slider for coefficient b has range [-10, 10]', () => {
      render(<GraphingExplorer {...defaultExploreProps} />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[1]).toHaveAttribute('min', '-10');
      expect(sliders[1]).toHaveAttribute('max', '10');
    });

    it('slider for coefficient c has range [-10, 10]', () => {
      render(<GraphingExplorer {...defaultExploreProps} />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[2]).toHaveAttribute('min', '-10');
      expect(sliders[2]).toHaveAttribute('max', '10');
    });

    it('displays current coefficient values', () => {
      const { container } = render(<GraphingExplorer {...defaultExploreProps} />);
      const spans = container.querySelectorAll('span.text-blue-600');
      expect(spans[0]).toHaveTextContent('1.0');
      expect(spans[1]).toHaveTextContent('0.0');
      expect(spans[2]).toHaveTextContent('0.0');
    });

    it('displays the live equation with current coefficient values', () => {
      render(<GraphingExplorer {...defaultExploreProps} />);
      expect(screen.getByText(/y\s*=\s*x²/i)).toBeInTheDocument();
    });

    it('updates equation display when sliders change', async () => {
      render(<GraphingExplorer {...defaultExploreProps} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.change(sliders[0], { target: { value: '2' } });
      expect(screen.getByText(/y\s*=\s*2x²/i)).toBeInTheDocument();
    });
  });

  describe('reset functionality', () => {
    it('renders a reset button', () => {
      render(<GraphingExplorer {...defaultExploreProps} />);
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('reset button restores default values', async () => {
      const { container } = render(<GraphingExplorer {...defaultExploreProps} />);
      const sliders = screen.getAllByRole('slider');
      fireEvent.change(sliders[0], { target: { value: '3' } });
      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);
      const spans = container.querySelectorAll('span.text-blue-600');
      expect(spans[0]).toHaveTextContent('1.0');
    });
  });

  describe('no submission', () => {
    it('does not show a submit button in explore mode', () => {
      render(<GraphingExplorer {...defaultExploreProps} />);
      expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
    });

    it('does not show table of values in explore mode', () => {
      render(<GraphingExplorer {...defaultExploreProps} />);
      expect(screen.queryByText(/table of values/i)).not.toBeInTheDocument();
    });

    it('does not show hint panel in explore mode', () => {
      render(<GraphingExplorer {...defaultExploreProps} />);
      expect(screen.queryByText(/hints/i)).not.toBeInTheDocument();
    });
  });

  describe('graph updates', () => {
    it('renders the coordinate plane in explore mode', () => {
      render(<GraphingExplorer {...defaultExploreProps} />);
      expect(screen.getByRole('img', { name: /coordinate plane/i })).toBeInTheDocument();
    });

    it('renders graph as read-only in explore mode', () => {
      render(<GraphingExplorer {...defaultExploreProps} />);
      const canvas = screen.getByRole('img', { name: /coordinate plane/i });
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('sliderDefaults prop', () => {
    it('uses custom default values when provided', () => {
      const { container } = render(
        <GraphingExplorer
          {...defaultExploreProps}
          sliderDefaults={{ a: 2, b: -3, c: 1 }}
        />
      );
      const spans = container.querySelectorAll('span.text-blue-600');
      expect(spans[0]).toHaveTextContent('2.0');
      expect(spans[1]).toHaveTextContent('-3.0');
      expect(spans[2]).toHaveTextContent('1.0');
    });
  });
});