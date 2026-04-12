'use client';

import React, { useState } from 'react';
import InlineMath from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css';
import { StepRevealContainer, StepMode } from '@/components/textbook/StepRevealContainer';

export interface AlgebraicStep {
  expression: string;
  explanation: string;
  hint?: string;
  isKeyStep?: boolean;
  distractors?: string[];
}

export interface StepByStepperProps {
  mode: StepMode;
  steps: AlgebraicStep[];
}

export function StepByStepper({ mode, steps }: StepByStepperProps) {
  if (steps.length === 0) {
    return <StepRevealContainer mode={mode} steps={[]} />;
  }

  if (mode === 'teaching') {
    const stepRevealSteps = steps.map((step) => ({
      content: (
        <div className="space-y-2">
          <div className="text-lg font-medium">
            <InlineMath math={step.expression} />
          </div>
          <div className="text-sm text-muted-foreground">
            {step.explanation}
          </div>
        </div>
      ),
    }));

    return (
      <StepRevealContainer mode={mode} steps={stepRevealSteps} />
    );
  }

  if (mode === 'guided') {
    return <GuidedMode steps={steps} />;
  }

  return null;
}

function GuidedMode({ steps }: { steps: AlgebraicStep[] }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  const currentStep = steps[currentStepIndex];
  const isComplete = currentStepIndex >= steps.length;

  const handleOptionClick = (expression: string) => {
    if (expression === currentStep.expression) {
      // Correct selection
      setShowHint(false);
      setHintUsed(false);
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      }
    } else {
      // Incorrect selection
      setShowHint(true);
      setHintUsed(true);
      setHintCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setShowHint(false);
      setHintUsed(false);
    }
  };

  if (isComplete) {
    return (
      <div className="space-y-4">
        <div className="text-lg font-semibold text-green-600">
          ✓ Complete!
        </div>
        <div className="text-sm text-muted-foreground">
          {hintCount > 0 && `Hints used: ${hintCount}`}
        </div>
      </div>
    );
  }

  const options = [
    currentStep.expression,
    ...(currentStep.distractors || generateDistractors(currentStep.expression)),
  ].sort(() => Math.random() - 0.5);

  return (
    <div className="space-y-4">
      {/* Problem statement */}
      {currentStepIndex === 0 && (
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Problem:
          </div>
          <div className="text-lg">
            <InlineMath math={steps[0].expression} />
          </div>
        </div>
      )}

      {/* Prompt */}
      {!showHint && (
        <div className="text-lg font-medium">
          What's the next step?
        </div>
      )}

      {/* Multiple choice options */}
      {!showHint && (
        <div className="space-y-2">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleOptionClick(option)}
              className="w-full p-3 text-left border rounded-md hover:bg-secondary transition-colors"
            >
              <InlineMath math={option} />
            </button>
          ))}
        </div>
      )}

      {/* Hint */}
      {showHint && currentStep.hint && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="text-sm font-medium text-yellow-800 mb-1">
            Hint:
          </div>
          <div className="text-sm text-yellow-700">
            {currentStep.hint}
          </div>
        </div>
      )}

      {/* Next button after correct answer */}
      {!showHint && currentStepIndex > 0 && currentStepIndex < steps.length && (
        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Next
        </button>
      )}

      {/* Hint usage tracking */}
      {hintCount > 0 && (
        <div className="text-xs text-muted-foreground">
          Hints used: {hintCount}
        </div>
      )}
    </div>
  );
}

function generateDistractors(correctAnswer: string): string[] {
  // Simple distractor generation based on common misconceptions
  // This is a placeholder - in a real implementation, this would be more sophisticated
  const distractors: string[] = [];
  
  // For now, return generic distractors
  if (correctAnswer.includes('x^2')) {
    distractors.push('x + 5', '2x + 3');
  } else if (correctAnswer.includes('(x')) {
    distractors.push('x^2 + 5x + 5', 'x^2 + 5x - 6');
  } else {
    distractors.push('x + 1', 'x - 1');
  }
  
  return distractors.slice(0, 2);
}
