import React from 'react';
import Katex from '@matejmazur/react-katex';

export interface MathInlineProps {
  math: string;
  className?: string;
}

export function MathInline({ math, className = '' }: MathInlineProps) {
  return (
    <span className={`math-inline ${className}`}>
      <Katex math={math} />
    </span>
  );
}
