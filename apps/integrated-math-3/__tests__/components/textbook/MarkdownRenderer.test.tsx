import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/textbook/MarkdownRenderer';

describe('MarkdownRenderer', () => {
  describe('inline math — $...$', () => {
    it('renders inline math expression via KaTeX', () => {
      render(<MarkdownRenderer content="The value of $x^2$ is positive." />);
      expect(document.querySelector('.katex')).toBeInTheDocument();
    });

    it('renders multiple inline math expressions', () => {
      render(<MarkdownRenderer content="When $a > 0$ and $b > 0$, then $a + b > 0$." />);
      const katexElements = document.querySelectorAll('.katex');
      expect(katexElements.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('display math — $$...$$', () => {
    it('renders display math via KaTeX', () => {
      render(<MarkdownRenderer content="$$x^2 + y^2 = z^2$$" />);
      expect(document.querySelector('.katex-display')).toBeInTheDocument();
    });

    it('renders multiline display math', () => {
      render(<MarkdownRenderer content={'$$\n\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n$$'} />);
      expect(document.querySelector('.katex-display')).toBeInTheDocument();
    });
  });

  describe('display math — \\[...\\]', () => {
    it('renders \\[...\\] notation as display math via KaTeX', () => {
      render(<MarkdownRenderer content={'\\[x^2 + y^2 = z^2\\]'} />);
      expect(document.querySelector('.katex-display')).toBeInTheDocument();
    });
  });

  describe('existing markdown content', () => {
    it('renders h2 headings', () => {
      render(<MarkdownRenderer content="## Section Title" />);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('renders h3 headings', () => {
      render(<MarkdownRenderer content="### Subsection" />);
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('renders bold text', () => {
      render(<MarkdownRenderer content="Some **bold** text." />);
      expect(document.querySelector('strong')).toBeInTheDocument();
    });

    it('renders paragraph text', () => {
      render(<MarkdownRenderer content="A simple paragraph with no math." />);
      expect(document.querySelector('p')).toBeInTheDocument();
    });

    it('renders unordered lists', () => {
      render(<MarkdownRenderer content={'- item one\n- item two\n- item three'} />);
      expect(document.querySelector('ul')).toBeInTheDocument();
    });

    it('renders ordered lists', () => {
      render(<MarkdownRenderer content={'1. first\n2. second\n3. third'} />);
      expect(document.querySelector('ol')).toBeInTheDocument();
    });

    it('applies custom className to wrapper', () => {
      const { container } = render(
        <MarkdownRenderer content="Hello" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders mixed math and markdown without breaking structure', () => {
      render(
        <MarkdownRenderer
          content={'## Quadratic Formula\n\nThe formula is:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$\n\nWhere $a \\neq 0$.'}
        />
      );
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(document.querySelector('.katex-display')).toBeInTheDocument();
      expect(document.querySelector('.katex')).toBeInTheDocument();
    });
  });
});
