'use client';

import { useState, useRef } from 'react';
import { Info } from 'lucide-react';

export interface VocabularyHighlightProps {
  term: string;
  definition: string;
  children?: React.ReactNode;
}

export function VocabularyHighlight({ term, definition, children }: VocabularyHighlightProps) {
  const [isOpen, setIsOpen] = useState(false);
  const termRef = useRef<HTMLSpanElement>(null);
  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  const toggleTooltip = () => {
    setIsOpen(prev => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTooltip();
    }
  };

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <span className="relative inline-block">
      <span
        ref={termRef}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/10 text-accent border-b-2 border-accent/50 cursor-pointer hover:bg-accent/20 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-label={`Definition of ${term}`}
        aria-describedby={isOpen ? tooltipId : undefined}
        onClick={toggleTooltip}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children || term}
        <Info className="w-3 h-3 opacity-70" />
      </span>

      {isOpen && (
        <div
          id={tooltipId}
          className="absolute left-0 top-full mt-2 z-50 w-64 p-3 bg-popover border rounded-lg shadow-lg text-sm animate-in fade-in slide-in-from-top-2 duration-200"
          role="tooltip"
        >
          <div className="font-semibold text-foreground mb-1">{term}</div>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {definition}
          </div>
        </div>
      )}
    </span>
  );
}
