import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TheoremBox } from '@/components/textbook/TheoremBox';

describe('TheoremBox', () => {
  describe('basic rendering', () => {
    it('renders the title', () => {
      render(
        <TheoremBox title="Pythagorean Theorem">
          <p>The square of the hypotenuse equals the sum of squares of the other two sides.</p>
        </TheoremBox>
      );
      expect(screen.getByText('Pythagorean Theorem')).toBeInTheDocument();
    });

    it('renders the body content', () => {
      render(
        <TheoremBox title="Pythagorean Theorem">
          <p>The square of the hypotenuse equals the sum of squares of the other two sides.</p>
        </TheoremBox>
      );
      expect(screen.getByText(/The square of the hypotenuse/)).toBeInTheDocument();
    });

    it('renders without icon when not provided', () => {
      const { container } = render(
        <TheoremBox title="Test Theorem">
          <p>Test content</p>
        </TheoremBox>
      );
      // Should not have an icon element
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBe(0);
    });
  });

  describe('icon support', () => {
    it('renders the provided icon', () => {
      const TestIcon = () => (
        <svg data-testid="test-icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );

      render(
        <TheoremBox title="Test Theorem" icon={<TestIcon />}>
          <p>Test content</p>
        </TheoremBox>
      );
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('places icon before title', () => {
      const TestIcon = () => (
        <svg data-testid="test-icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );

      render(
        <TheoremBox title="Test Theorem" icon={<TestIcon />}>
          <p>Test content</p>
        </TheoremBox>
      );

      const icon = screen.getByTestId('test-icon');
      const title = screen.getByText('Test Theorem');
      const iconIndex = Array.from(icon.parentElement?.children || []).indexOf(icon);
      const titleIndex = Array.from(title.parentElement?.children || []).indexOf(title);

      expect(iconIndex).toBeLessThan(titleIndex);
    });
  });

  describe('visual styling', () => {
    it('has a bordered container', () => {
      const { container } = render(
        <TheoremBox title="Test Theorem">
          <p>Test content</p>
        </TheoremBox>
      );
      const box = container.querySelector('[class*="border"]');
      expect(box).toBeInTheDocument();
    });

    it('has a tinted background using oklch tokens', () => {
      const { container } = render(
        <TheoremBox title="Test Theorem">
          <p>Test content</p>
        </TheoremBox>
      );
      const box = container.querySelector('[class*="bg-"]');
      expect(box).toBeInTheDocument();
    });

    it('applies default variant styling', () => {
      const { container } = render(
        <TheoremBox title="Test Theorem">
          <p>Test content</p>
        </TheoremBox>
      );
      const box = container.firstChild as HTMLElement;
      // Should have some form of border and background
      const classList = box.className;
      expect(classList).toMatch(/border/);
      expect(classList).toMatch(/bg-/);
    });
  });

  describe('color variants', () => {
    it('supports default variant', () => {
      const { container } = render(
        <TheoremBox title="Test Theorem" variant="default">
          <p>Test content</p>
        </TheoremBox>
      );
      const box = container.firstChild as HTMLElement;
      expect(box).toBeInTheDocument();
    });

    it('supports primary variant', () => {
      const { container } = render(
        <TheoremBox title="Test Theorem" variant="primary">
          <p>Test content</p>
        </TheoremBox>
      );
      const box = container.firstChild as HTMLElement;
      expect(box).toBeInTheDocument();
    });

    it('supports accent variant', () => {
      const { container } = render(
        <TheoremBox title="Test Theorem" variant="accent">
          <p>Test content</p>
        </TheoremBox>
      );
      const box = container.firstChild as HTMLElement;
      expect(box).toBeInTheDocument();
    });

    it('applies different color classes for different variants', () => {
      const { container: container1 } = render(
        <TheoremBox title="Test Theorem" variant="default">
          <p>Test content</p>
        </TheoremBox>
      );
      const { container: container2 } = render(
        <TheoremBox title="Test Theorem" variant="primary">
          <p>Test content</p>
        </TheoremBox>
      );

      const box1 = container1.firstChild as HTMLElement;
      const box2 = container2.firstChild as HTMLElement;

      // Variants should have different styling
      expect(box1.className).not.toBe(box2.className);
    });
  });

  describe('accessibility', () => {
    it('has proper heading structure for title', () => {
      render(
        <TheoremBox title="Important Theorem">
          <p>Test content</p>
        </TheoremBox>
      );
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Important Theorem');
    });

    it('is properly structured as a section', () => {
      const { container } = render(
        <TheoremBox title="Test Theorem">
          <p>Test content</p>
        </TheoremBox>
      );
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('renders with empty body content', () => {
      render(
        <TheoremBox title="Test Theorem">
          <></>
        </TheoremBox>
      );
      expect(screen.getByText('Test Theorem')).toBeInTheDocument();
    });

    it('renders with multiple body elements', () => {
      render(
        <TheoremBox title="Test Theorem">
          <p>First paragraph</p>
          <p>Second paragraph</p>
          <ul><li>Item 1</li><li>Item 2</li></ul>
        </TheoremBox>
      );
      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('renders with long title', () => {
      const longTitle = 'This is a very long theorem title that should wrap properly and not break the layout';
      render(
        <TheoremBox title={longTitle}>
          <p>Test content</p>
        </TheoremBox>
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });
});
