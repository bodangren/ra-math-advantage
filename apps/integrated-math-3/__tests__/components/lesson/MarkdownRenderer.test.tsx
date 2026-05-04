import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LessonMarkdownRenderer } from '@/components/lesson/MarkdownRenderer';

describe('LessonMarkdownRenderer', () => {
  describe('markdown rendering', () => {
    it('renders plain text', () => {
      render(<LessonMarkdownRenderer content="Hello world" />);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders headings', () => {
      render(<LessonMarkdownRenderer content="## Section Title" />);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('renders bold text', () => {
      render(<LessonMarkdownRenderer content="**bold text**" />);
      expect(screen.getByText('bold text')).toBeInTheDocument();
    });

    it('renders GFM tables', () => {
      const content = `| x | y |
|---|---|
| 1 | 2 |`;
      render(<LessonMarkdownRenderer content={content} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders unordered lists', () => {
      render(<LessonMarkdownRenderer content="- item one\n- item two" />);
      expect(screen.getByText(/item one/)).toBeInTheDocument();
      expect(screen.getByText(/item two/)).toBeInTheDocument();
    });

    it('renders links with focus-visible indicator classes', () => {
      render(<LessonMarkdownRenderer content="[Example](https://example.com)" />);
      const link = screen.getByRole('link', { name: /example/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.className).toMatch(/focus-visible:/);
    });
  });

  describe('math rendering', () => {
    it('renders inline math with $ delimiters', () => {
      const { container } = render(
        <LessonMarkdownRenderer content="The value is $x^2 + 1$." />
      );
      // KaTeX renders .katex spans
      expect(container.querySelector('.katex, .math-inline')).toBeInTheDocument();
    });

    it('renders block math with $$ delimiters', () => {
      const { container } = render(
        <LessonMarkdownRenderer content="$$x^2 + y^2 = r^2$$" />
      );
      expect(container.querySelector('.katex, .math-block')).toBeInTheDocument();
    });
  });

  describe('textbook-content scope', () => {
    it('wraps output in .textbook-content class', () => {
      const { container } = render(
        <LessonMarkdownRenderer content="Some content" />
      );
      expect(container.querySelector('.textbook-content')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('renders empty string without crashing', () => {
      const { container } = render(<LessonMarkdownRenderer content="" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('accepts optional className', () => {
      const { container } = render(
        <LessonMarkdownRenderer content="text" className="custom-class" />
      );
      const wrapper = container.querySelector('.textbook-content');
      expect(wrapper?.className).toContain('custom-class');
    });
  });
});
