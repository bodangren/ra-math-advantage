import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VocabularyHighlight } from '@/components/textbook/VocabularyHighlight';

describe('VocabularyHighlight', () => {
  describe('basic rendering', () => {
    it('renders the term inline', () => {
      render(
        <VocabularyHighlight term="Quadratic Function" definition="A function of the form f(x) = ax² + bx + c" />
      );
      expect(screen.getByText('Quadratic Function')).toBeInTheDocument();
    });

    it('renders with custom children', () => {
      render(
        <VocabularyHighlight term="Test" definition="Definition">
          Custom content
        </VocabularyHighlight>
      );
      expect(screen.getByText('Custom content')).toBeInTheDocument();
    });

    it('renders without definition initially visible', () => {
      render(
        <VocabularyHighlight term="Test" definition="This is the definition" />
      );
      expect(screen.queryByText('This is the definition')).not.toBeInTheDocument();
    });
  });

  describe('tooltip behavior', () => {
    it('shows tooltip on hover', () => {
      render(
        <VocabularyHighlight term="Test" definition="This is the definition" />
      );

      const term = screen.getByText('Test');
      fireEvent.mouseEnter(term);

      expect(screen.getByText('This is the definition')).toBeInTheDocument();
    });

    it('hides tooltip when mouse leaves', () => {
      render(
        <VocabularyHighlight term="Test" definition="This is the definition" />
      );

      const term = screen.getByText('Test');
      fireEvent.mouseEnter(term);
      expect(screen.getByText('This is the definition')).toBeInTheDocument();

      fireEvent.mouseLeave(term);
      expect(screen.queryByText('This is the definition')).not.toBeInTheDocument();
    });

    it('shows tooltip on click', () => {
      render(
        <VocabularyHighlight term="Test" definition="This is the definition" />
      );

      const term = screen.getByText('Test');
      fireEvent.click(term);

      expect(screen.getByText('This is the definition')).toBeInTheDocument();
    });

    it('toggles tooltip on click', () => {
      render(
        <VocabularyHighlight term="Test" definition="This is the definition" />
      );

      const term = screen.getByText('Test');

      // Click to show
      fireEvent.click(term);
      expect(screen.getByText('This is the definition')).toBeInTheDocument();

      // Click to hide
      fireEvent.click(term);
      expect(screen.queryByText('This is the definition')).not.toBeInTheDocument();
    });
  });

  describe('keyboard accessibility', () => {
    it('is focusable', () => {
      render(
        <VocabularyHighlight term="Test" definition="Definition" />
      );

      const term = screen.getByText('Test');
      expect(term).toHaveAttribute('tabIndex', '0');
    });

    it('shows tooltip on Enter key', () => {
      render(
        <VocabularyHighlight term="Test" definition="This is the definition" />
      );

      const term = screen.getByText('Test');
      fireEvent.keyDown(term, { key: 'Enter', code: 'Enter' });

      expect(screen.getByText('This is the definition')).toBeInTheDocument();
    });

    it('shows tooltip on Space key', () => {
      render(
        <VocabularyHighlight term="Test" definition="This is the definition" />
      );

      const term = screen.getByText('Test');
      fireEvent.keyDown(term, { key: ' ', code: 'Space' });

      expect(screen.getByText('This is the definition')).toBeInTheDocument();
    });

    it('toggles tooltip on Enter key', () => {
      render(
        <VocabularyHighlight term="Test" definition="This is the definition" />
      );

      const term = screen.getByText('Test');

      // Enter to show
      fireEvent.keyDown(term, { key: 'Enter', code: 'Enter' });
      expect(screen.getByText('This is the definition')).toBeInTheDocument();

      // Enter to hide
      fireEvent.keyDown(term, { key: 'Enter', code: 'Enter' });
      expect(screen.queryByText('This is the definition')).not.toBeInTheDocument();
    });

    it('does not show tooltip on other keys', () => {
      render(
        <VocabularyHighlight term="Test" definition="This is the definition" />
      );

      const term = screen.getByText('Test');
      fireEvent.keyDown(term, { key: 'a', code: 'KeyA' });

      expect(screen.queryByText('This is the definition')).not.toBeInTheDocument();
    });
  });

  describe('aria attributes', () => {
    it('has proper aria attributes for accessibility', () => {
      render(
        <VocabularyHighlight term="Test" definition="This is the definition" />
      );

      const term = screen.getByText('Test');
      expect(term).toHaveAttribute('role', 'button');
      expect(term).toHaveAttribute('aria-expanded', 'false');
      expect(term).toHaveAttribute('aria-label', expect.stringContaining('Test'));
    });

    it('updates aria-expanded when tooltip is shown', () => {
      render(
        <VocabularyHighlight term="Test" definition="Definition" />
      );

      const term = screen.getByText('Test');
      expect(term).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(term);
      expect(term).toHaveAttribute('aria-expanded', 'true');
    });

    it('has aria-describedby pointing to tooltip when visible', () => {
      render(
        <VocabularyHighlight term="Test" definition="Definition" />
      );

      const term = screen.getByText('Test');
      fireEvent.click(term);

      expect(term).toHaveAttribute('aria-describedby');
    });
  });

  describe('visual styling', () => {
    it('applies highlight styling to term', () => {
      render(
        <VocabularyHighlight term="Test" definition="Definition" />
      );

      const term = screen.getByText('Test');
      // Should have accent color styling and border
      expect(term.className).toMatch(/text-accent/);
      expect(term.className).toMatch(/border-/);
    });

    it('applies proper styling to tooltip', () => {
      render(
        <VocabularyHighlight term="Test" definition="Definition" />
      );

      const term = screen.getByText('Test');
      fireEvent.click(term);

      const tooltip = screen.getByText('Definition');
      expect(tooltip.closest('[class*="tooltip"]') || tooltip.closest('[class*="absolute"]')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('renders with long term', () => {
      const longTerm = 'This is a very long vocabulary term that should wrap properly';
      render(
        <VocabularyHighlight term={longTerm} definition="Definition" />
      );
      expect(screen.getByText(longTerm)).toBeInTheDocument();
    });

    it('renders with long definition', () => {
      const longDef = 'This is a very long definition that should wrap properly and display correctly in the tooltip without breaking the layout or causing overflow issues';
      render(
        <VocabularyHighlight term="Test" definition={longDef} />
      );

      fireEvent.click(screen.getByText('Test'));
      expect(screen.getByText(longDef)).toBeInTheDocument();
    });

    it('renders with special characters in term', () => {
      render(
        <VocabularyHighlight term="f(x) = ax²" definition="Definition" />
      );
      expect(screen.getByText(/ax²/)).toBeInTheDocument();
    });

    it('renders with special characters in definition', () => {
      render(
        <VocabularyHighlight term="Test" definition="For a, b, c ∈ ℝ where a ≠ 0" />
      );

      fireEvent.click(screen.getByText('Test'));
      expect(screen.getByText(/a, b, c ∈ ℝ/)).toBeInTheDocument();
    });

    it('renders with multiline definition', () => {
      const multilineDef = 'First line.\nSecond line.\nThird line.';
      render(
        <VocabularyHighlight term="Test" definition={multilineDef} />
      );

      fireEvent.click(screen.getByText('Test'));
      expect(screen.getByText(/First line/)).toBeInTheDocument();
      expect(screen.getByText(/Second line/)).toBeInTheDocument();
      expect(screen.getByText(/Third line/)).toBeInTheDocument();
    });
  });
});
