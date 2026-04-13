'use client';

import React, { useState } from 'react';
import InlineMath from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css';
import { StepRevealContainer, StepMode } from '@/components/textbook/StepRevealContainer';
import { MathInputField } from './MathInputField';
import { generateDistractors, type DistractorType } from '@/lib/activities/algebraic/distractors';

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
  scaffoldLevel?: number;
  problemType?: string;
  onPracticeComplete?: () => void;
}

export function StepByStepper({ mode, steps, scaffoldLevel = 0, problemType, onPracticeComplete }: StepByStepperProps) {
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
    return <GuidedMode steps={steps} problemType={problemType} />;
  }

  if (mode === 'practice') {
    return <PracticeMode steps={steps} scaffoldLevel={scaffoldLevel} onComplete={onPracticeComplete} />;
  }

  return null;
}

function GuidedMode({ steps, problemType }: { steps: AlgebraicStep[]; problemType?: string }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentStep = steps[currentStepIndex];
  const isComplete = currentStepIndex >= steps.length || (showExplanation && currentStepIndex === steps.length - 1);

  const handleOptionClick = (expression: string) => {
    if (expression === currentStep.expression) {
      // Correct selection - show explanation first
      setShowHint(false);
      setHintUsed(false);
      setShowExplanation(true);
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
      setShowExplanation(false);
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
    ...(currentStep.distractors || generateDistractors(
      currentStep.expression,
      (problemType as DistractorType) || 'factoring'
    )),
  ].sort(() => Math.random() - 0.5);

  return (
    <div className="space-y-4">
      {/* Problem statement */}
      {currentStepIndex === 0 && !showExplanation && (
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Problem:
          </div>
          <div className="text-lg">
            <InlineMath math={steps[0].expression} />
          </div>
        </div>
      )}

      {/* Explanation shown after correct answer */}
      {showExplanation && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="text-lg font-medium mb-2">
            <InlineMath math={currentStep.expression} />
          </div>
          <div className="text-sm text-green-700">
            {currentStep.explanation}
          </div>
        </div>
      )}

      {/* Prompt */}
      {!showExplanation && (
        <div className="text-lg font-medium">
          What&apos;s the next step?
        </div>
      )}

      {/* Multiple choice options */}
      {!showExplanation && (
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
      {showExplanation && currentStepIndex < steps.length - 1 && (
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

function PracticeMode({ steps, scaffoldLevel, onComplete }: { steps: AlgebraicStep[]; scaffoldLevel: number; onComplete?: () => void }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentStep = steps[currentStepIndex];

  const handleSubmit = (stepIndex: number) => {
    setSubmitted(prev => ({ ...prev, [stepIndex]: true }));
    setShowSolution(prev => ({ ...prev, [stepIndex]: true }));

    // Check if this is the last step
    if (stepIndex === steps.length - 1) {
      setIsComplete(true);
      onComplete?.();
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const isStepComplete = submitted[currentStepIndex] && currentStepIndex === steps.length - 1;

  if (isComplete || isStepComplete) {
    const correctCount = Object.entries(submitted).filter(([idx, submitted]) => {
      if (!submitted) return false;
      const stepIndex = parseInt(idx);
      const userAnswer = userAnswers[stepIndex];
      const correctAnswer = steps[stepIndex].expression;
      return userAnswer && userAnswer.trim() === correctAnswer.trim();
    }).length;

    return (
      <div className="space-y-4">
        <div className="text-lg font-semibold text-green-600">
          ✓ Complete!
        </div>
        <div className="text-sm text-muted-foreground">
          {correctCount} / {steps.length} steps correct
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Problem statement */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Problem:
        </div>
        <div className="text-lg">
          <InlineMath math={steps[0].expression} />
        </div>
      </div>

      {/* Scaffold/hint steps */}
      {scaffoldLevel > 0 && currentStepIndex >= scaffoldLevel && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm font-medium text-blue-800 mb-1">
            Hint:
          </div>
          <div className="text-sm text-blue-700">
            <InlineMath math={steps[scaffoldLevel - 1].expression} />
          </div>
        </div>
      )}

      {/* Current step input */}
      {!submitted[currentStepIndex] && (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
          <MathInputField
            value={userAnswers[currentStepIndex] || ''}
            onChange={(value) => setUserAnswers(prev => ({ ...prev, [currentStepIndex]: value }))}
            label="Your answer"
            placeholder="Enter your answer..."
            showValidation={false}
          />
          <button
            type="button"
            onClick={() => handleSubmit(currentStepIndex)}
            disabled={!userAnswers[currentStepIndex]?.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      )}

      {/* Solution overlay */}
      {submitted[currentStepIndex] && showSolution[currentStepIndex] && (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="text-sm font-medium text-green-800 mb-1">
              Correct solution:
            </div>
            <div className="text-lg">
              <InlineMath math={currentStep.expression} />
            </div>
            <div className="text-sm text-green-700 mt-2">
              {currentStep.explanation}
            </div>
          </div>

          {/* User's answer for comparison */}
          {userAnswers[currentStepIndex] && (
            <div className={`p-3 rounded-md border ${
              userAnswers[currentStepIndex].trim() === currentStep.expression.trim()
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="text-sm font-medium mb-1">
                Your answer:
              </div>
              <div className="text-lg">
                <InlineMath math={userAnswers[currentStepIndex]} />
              </div>
              <div className={`text-sm mt-1 ${
                userAnswers[currentStepIndex].trim() === currentStep.expression.trim()
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}>
                {userAnswers[currentStepIndex].trim() === currentStep.expression.trim()
                  ? '✓ Correct!'
                  : '✗ Incorrect'}
              </div>
            </div>
          )}

          {/* Next button */}
          {currentStepIndex < steps.length - 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Next Step
            </button>
          )}
        </div>
      )}
    </div>
  );
}
