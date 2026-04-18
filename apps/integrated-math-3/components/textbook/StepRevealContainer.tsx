'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type StepMode = 'teaching' | 'guided' | 'practice';

export interface Step {
  content: React.ReactNode;
}

export interface StepRevealContainerProps {
  mode: StepMode;
  steps: Step[];
}

export function StepRevealContainer({ mode, steps }: StepRevealContainerProps) {
  const [visibleSteps, setVisibleSteps] = useState(
    mode === 'teaching' ? steps.length : 1
  );

  const canShowMore = visibleSteps < steps.length;
  const isInteractive = mode === 'guided' || mode === 'practice';

  const handleShowNext = () => {
    if (canShowMore) {
      setVisibleSteps(prev => prev + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleShowNext();
    }
  };

  if (steps.length === 0) {
    return <div className="my-6" />;
  }

  return (
    <div className="my-6">
      <div className="space-y-4">
        {steps.slice(0, visibleSteps).map((step, index) => (
          <div
            key={index}
            className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
              {index + 1}
            </div>
            <div className="flex-1 pt-1">
              <div className="prose prose-sm max-w-none">
                {step.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isInteractive && canShowMore && (
        <button
          type="button"
          onClick={handleShowNext}
          onKeyDown={handleKeyDown}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Show next step"
        >
          Show Next Step
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
