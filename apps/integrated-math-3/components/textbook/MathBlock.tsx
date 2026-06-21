import React from 'react';
import Katex from '@matejmazur/react-katex';

export interface MathBlockProps {
  math: string;
  className?: string;
}

/**
 * Renders a block-level KaTeX math expression centered in its container.
 *
 * @param {MathBlockProps} props - Math block configuration.
 * @returns {JSX.Element} A div containing the rendered math.
 */
export function MathBlock({ math, className = '' }: MathBlockProps) {
  return (
    <div className={`math-block my-4 flex justify-center ${className}`}>
      <Katex block math={math} />
    </div>
  );
}
