import React from 'react';
import Katex from '@matejmazur/react-katex';

export interface MathInlineProps {
  math: string;
  className?: string;
}

/**
 * Renders an inline KaTeX math expression.
 *
 * @param {MathInlineProps} props - Math inline configuration.
 * @returns {JSX.Element} A span containing the rendered math.
 */
export function MathInline({ math, className = '' }: MathInlineProps) {
  return (
    <span className={`math-inline ${className}`}>
      <Katex math={math} />
    </span>
  );
}
