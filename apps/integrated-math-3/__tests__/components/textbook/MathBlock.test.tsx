import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MathBlock } from '@/components/textbook/MathBlock';

describe('MathBlock', () => {
  it('renders display math expression', () => {
    render(<MathBlock math="x^2 + y^2 = z^2" />);
    const mathElement = document.querySelector('.katex-display');
    expect(mathElement).toBeInTheDocument();
  });

  it('renders empty string without error', () => {
    render(<MathBlock math="" />);
    expect(document.querySelector('.katex-display')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<MathBlock math="E = mc^2" className="custom-math" />);
    expect(container.querySelector('.custom-math')).toBeInTheDocument();
  });

  it('handles complex mathematical expressions', () => {
    render(<MathBlock math="\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}" />);
    const mathElement = document.querySelector('.katex-display');
    expect(mathElement).toBeInTheDocument();
  });
});
