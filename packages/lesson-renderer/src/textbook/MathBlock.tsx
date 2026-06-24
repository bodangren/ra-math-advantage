import React from 'react';
import Katex from '@matejmazur/react-katex';

export interface MathBlockProps {
  math: string;
  className?: string;
}

/**
 * Render a block-level LaTeX math expression centered on the page.
 * @param {MathBlockProps} props - LaTeX string and optional className
 */
export function MathBlock({ math, className = '' }: MathBlockProps) {
  return (
    <div className={`math-block my-4 flex justify-center ${className}`}>
      <Katex block math={math} />
    </div>
  );
}
