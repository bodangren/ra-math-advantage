import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MathInline } from '@/components/textbook/MathInline';

describe('MathInline', () => {
  it('renders inline math expression', () => {
    render(<MathInline math="x^2" />);
    const mathElement = document.querySelector('.katex');
    expect(mathElement).toBeInTheDocument();
  });

  it('renders empty string without error', () => {
    render(<MathInline math="" />);
    expect(document.querySelector('.katex')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<MathInline math="a^2 + b^2" className="custom-math" />);
    expect(container.querySelector('.custom-math')).toBeInTheDocument();
  });

  it('renders within text context', () => {
    render(<MathInline math="\sqrt{x}" />);
    const mathElement = document.querySelector('.katex');
    expect(mathElement).toBeInTheDocument();
  });

  it('handles complex inline expressions', () => {
    render(<MathInline math="\frac{a}{b}" />);
    const mathElement = document.querySelector('.katex');
    expect(mathElement).toBeInTheDocument();
  });
});
