import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExampleHeader } from '@/components/textbook/ExampleHeader';

describe('ExampleHeader', () => {
  describe('basic rendering', () => {
    it('renders the example number', () => {
      render(<ExampleHeader number={1} title="Solving Quadratic Equations" />);
      expect(screen.getByText(/Example 1/i)).toBeInTheDocument();
    });

    it('renders the title', () => {
      render(<ExampleHeader number={1} title="Solving Quadratic Equations" />);
      expect(screen.getByText('Solving Quadratic Equations')).toBeInTheDocument();
    });

    it('renders without difficulty badge when not provided', () => {
      const { container } = render(
        <ExampleHeader number={1} title="Example Title" />
      );
      // Should not have a badge element
      const badge = container.querySelector('[class*="badge"]');
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe('difficulty badge', () => {
    it('renders difficulty badge when provided', () => {
      render(
        <ExampleHeader
          number={1}
          title="Example Title"
          difficulty="basic"
        />
      );
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });

    it('renders basic difficulty badge', () => {
      render(
        <ExampleHeader
          number={1}
          title="Example Title"
          difficulty="basic"
        />
      );
      const badge = screen.getByText('Basic');
      expect(badge).toBeInTheDocument();
    });

    it('renders intermediate difficulty badge', () => {
      render(
        <ExampleHeader
          number={1}
          title="Example Title"
          difficulty="intermediate"
        />
      );
      const badge = screen.getByText('Intermediate');
      expect(badge).toBeInTheDocument();
    });

    it('renders advanced difficulty badge', () => {
      render(
        <ExampleHeader
          number={1}
          title="Example Title"
          difficulty="advanced"
        />
      );
      const badge = screen.getByText('Advanced');
      expect(badge).toBeInTheDocument();
    });

    it('applies different colors for different difficulties', () => {
      const { container: container1 } = render(
        <ExampleHeader number={1} title="Example" difficulty="basic" />
      );
      const { container: container2 } = render(
        <ExampleHeader number={1} title="Example" difficulty="advanced" />
      );

      // Find the badge span (the one with rounded-full class)
      const badge1 = container1.querySelector('span.rounded-full');
      const badge2 = container2.querySelector('span.rounded-full');

      expect(badge1?.className).not.toBe(badge2?.className);
    });
  });

  describe('visual styling', () => {
    it('has a visually distinct appearance', () => {
      const { container } = render(
        <ExampleHeader number={1} title="Example Title" />
      );
      const header = container.firstChild as HTMLElement;
      // Should have some styling classes
      expect(header.className.length).toBeGreaterThan(0);
    });

    it('uses proper typography for example number and title', () => {
      render(<ExampleHeader number={1} title="Solving Quadratic Equations" />);
      const number = screen.getByText(/Example 1/i);
      const title = screen.getByText('Solving Quadratic Equations');

      // Both should be visible and properly styled
      expect(number).toBeInTheDocument();
      expect(title).toBeInTheDocument();
    });

    it('applies proper spacing between elements', () => {
      const { container } = render(
        <ExampleHeader number={1} title="Example Title" />
      );
      const header = container.firstChild as HTMLElement;
      // Should have spacing classes
      expect(header.className).toMatch(/(p|m|gap)-\d/);
    });

    it('displays example number and title on the same line', () => {
      const { container } = render(
        <ExampleHeader number={1} title="Example Title" />
      );
      const header = container.firstChild as HTMLElement;
      // Should have flex or inline-flex for horizontal layout
      expect(header.className).toMatch(/flex/);
    });
  });

  describe('accessibility', () => {
    it('has proper heading structure', () => {
      render(<ExampleHeader number={1} title="Example Title" />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it('includes example number in heading text for screen readers', () => {
      render(<ExampleHeader number={5} title="Example Title" />);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveTextContent(/Example 5/i);
    });
  });

  describe('edge cases', () => {
    it('renders with example number 0', () => {
      render(<ExampleHeader number={0} title="Example Title" />);
      expect(screen.getByText(/Example 0/i)).toBeInTheDocument();
    });

    it('renders with large example number', () => {
      render(<ExampleHeader number={100} title="Example Title" />);
      expect(screen.getByText(/Example 100/i)).toBeInTheDocument();
    });

    it('renders with empty title', () => {
      render(<ExampleHeader number={1} title="" />);
      expect(screen.getByText(/Example 1/i)).toBeInTheDocument();
    });

    it('renders with long title', () => {
      const longTitle = 'This is a very long example title that should wrap properly and not break the layout of the component';
      render(<ExampleHeader number={1} title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('renders with title containing special characters', () => {
      render(<ExampleHeader number={1} title="Solving f(x) = ax² + bx + c" />);
      expect(screen.getByText(/ax² \+ bx \+ c/)).toBeInTheDocument();
    });
  });
});
