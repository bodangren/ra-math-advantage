import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DefinitionCard } from '@/components/textbook/DefinitionCard';

describe('DefinitionCard', () => {
  describe('basic rendering', () => {
    it('renders the term prominently', () => {
      render(
        <DefinitionCard term="Quadratic Function" definition="A function of the form f(x) = ax² + bx + c" />
      );
      const term = screen.getByText('Quadratic Function');
      expect(term).toBeInTheDocument();
      expect(term.tagName).toBe('STRONG');
    });

    it('renders the definition', () => {
      render(
        <DefinitionCard term="Quadratic Function" definition="A function of the form f(x) = ax² + bx + c" />
      );
      expect(screen.getByText('A function of the form f(x) = ax² + bx + c')).toBeInTheDocument();
    });

    it('renders without related terms when not provided', () => {
      const { container } = render(
        <DefinitionCard term="Test Term" definition="Test definition" />
      );
      // Should not have a related terms section
      expect(screen.queryByText('Related Terms')).not.toBeInTheDocument();
      expect(container.querySelector('ul')).toBeNull();
    });
  });

  describe('related terms', () => {
    it('renders related terms when provided', () => {
      render(
        <DefinitionCard
          term="Quadratic Function"
          definition="A function of the form f(x) = ax² + bx + c"
          relatedTerms={['Parabola', 'Vertex', 'Axis of Symmetry']}
        />
      );
      expect(screen.getByText('Related Terms')).toBeInTheDocument();
      expect(screen.getByText('Parabola')).toBeInTheDocument();
      expect(screen.getByText('Vertex')).toBeInTheDocument();
      expect(screen.getByText('Axis of Symmetry')).toBeInTheDocument();
    });

    it('renders related terms as a list', () => {
      const { container } = render(
        <DefinitionCard
          term="Test Term"
          definition="Test definition"
          relatedTerms={['Term A', 'Term B']}
        />
      );
      const list = container.querySelector('ul');
      expect(list).toBeInTheDocument();
      const items = list?.querySelectorAll('li');
      expect(items?.length).toBe(2);
    });

    it('handles single related term', () => {
      render(
        <DefinitionCard
          term="Test Term"
          definition="Test definition"
          relatedTerms={['Single Term']}
        />
      );
      expect(screen.getByText('Related Terms')).toBeInTheDocument();
      expect(screen.getByText('Single Term')).toBeInTheDocument();
    });

    it('handles empty related terms array', () => {
      render(
        <DefinitionCard
          term="Test Term"
          definition="Test definition"
          relatedTerms={[]}
        />
      );
      expect(screen.queryByText('Related Terms')).not.toBeInTheDocument();
    });
  });

  describe('visual styling', () => {
    it('has a card-like appearance with border and background', () => {
      const { container } = render(
        <DefinitionCard term="Test Term" definition="Test definition" />
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toMatch(/border/);
      expect(card.className).toMatch(/bg-/);
    });

    it('uses proper typography for term (strong/emphasis)', () => {
      render(
        <DefinitionCard term="Test Term" definition="Test definition" />
      );
      const term = screen.getByText('Test Term');
      expect(term.closest('strong')).toBeInTheDocument();
    });

    it('applies proper spacing between elements', () => {
      const { container } = render(
        <DefinitionCard term="Test Term" definition="Test definition" />
      );
      const card = container.firstChild as HTMLElement;
      // Should have spacing classes (m, p, etc.)
      expect(card.className).toMatch(/p-\d/);
      expect(card.className).toMatch(/m(y|b)?-\d/);
    });
  });

  describe('accessibility', () => {
    it('has proper heading structure for term', () => {
      render(
        <DefinitionCard term="Important Term" definition="Test definition" />
      );
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Important Term');
    });

    it('is properly structured as an article', () => {
      const { container } = render(
        <DefinitionCard term="Test Term" definition="Test definition" />
      );
      const article = container.querySelector('article');
      expect(article).toBeInTheDocument();
    });

    it('has proper list structure for related terms', () => {
      render(
        <DefinitionCard
          term="Test Term"
          definition="Test definition"
          relatedTerms={['Term A', 'Term B']}
        />
      );
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      const items = screen.getAllByRole('listitem');
      expect(items.length).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('renders with empty definition', () => {
      render(
        <DefinitionCard term="Test Term" definition="" />
      );
      expect(screen.getByText('Test Term')).toBeInTheDocument();
    });

    it('renders with multiline definition', () => {
      const multilineDef = 'First line.\nSecond line.\nThird line.';
      render(
        <DefinitionCard term="Test Term" definition={multilineDef} />
      );
      expect(screen.getByText(/First line/)).toBeInTheDocument();
      expect(screen.getByText(/Second line/)).toBeInTheDocument();
      expect(screen.getByText(/Third line/)).toBeInTheDocument();
    });

    it('renders with long term', () => {
      const longTerm = 'This is a very long vocabulary term that should wrap properly';
      render(
        <DefinitionCard term={longTerm} definition="Test definition" />
      );
      expect(screen.getByText(longTerm)).toBeInTheDocument();
    });

    it('renders with many related terms', () => {
      const manyTerms = ['Term 1', 'Term 2', 'Term 3', 'Term 4', 'Term 5'];
      render(
        <DefinitionCard
          term="Test Term"
          definition="Test definition"
          relatedTerms={manyTerms}
        />
      );
      manyTerms.forEach(term => {
        expect(screen.getByText(term)).toBeInTheDocument();
      });
    });

    it('renders with special characters in term and definition', () => {
      render(
        <DefinitionCard
          term="f(x) = ax² + bx + c"
          definition="A quadratic function with coefficients a, b, c ∈ ℝ, where a ≠ 0"
        />
      );
      expect(screen.getByText(/ax² \+ bx \+ c/)).toBeInTheDocument();
      expect(screen.getByText(/a, b, c ∈ ℝ/)).toBeInTheDocument();
    });
  });
});
