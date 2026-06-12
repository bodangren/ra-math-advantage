import React from 'react';
import Katex from '@matejmazur/react-katex';

export interface MathInlineProps {
  math: string;
  className?: string;
}

/**
 * Render inline LaTeX math using KaTeX.
 * @param props - LaTeX string and optional className
 */
export function MathInline({ math, className = '' }: MathInlineProps) {
  return (
    <span className={`math-inline ${className}`}>
      <Katex math={math} />
    </span>
  );
}
