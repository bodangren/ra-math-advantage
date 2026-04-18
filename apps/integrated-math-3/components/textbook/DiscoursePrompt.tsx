'use client';

import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

export interface DiscoursePromptProps {
  prompt: string;
  title?: string;
  expandableArea?: React.ReactNode;
}

export function DiscoursePrompt({ prompt, title = 'Think About It', expandableArea }: DiscoursePromptProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div className="my-6 rounded-lg border-2 border-accent/30 bg-accent/5 p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 mt-0.5">
          <MessageSquare className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <h4 className="font-display font-semibold text-base text-accent mb-2">
            {title}
          </h4>
          <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {prompt}
          </p>
        </div>
      </div>

      {expandableArea && (
        <div className="mt-4 pt-4 border-t border-accent/20">
          <button
            type="button"
            onClick={toggleExpanded}
            className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-2 py-1"
            aria-expanded={isExpanded}
            aria-controls="discourse-expandable-content"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Response Area
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Response Area
              </>
            )}
          </button>

          {isExpanded && (
            <div
              id="discourse-expandable-content"
              className="mt-3 p-4 bg-background/50 rounded-md border border-border/50 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {expandableArea}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
