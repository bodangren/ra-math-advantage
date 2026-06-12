'use client';

import React, { useState, useMemo } from 'react';
import InlineMath from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css';
import { MathInputField } from '../algebraic/MathInputField';

export type StepMode = 'teaching' | 'guided' | 'practice';

export interface AlgebraicStep {
  expression: string;
  explanation: string;
  hint?: string;
  isKeyStep?: boolean;
  distractors?: string[];
}

export interface StepAttempt {
  stepIndex: number;
  userAnswer: string | null;
  isCorrect: boolean;
}

export interface StepByStepperProps {
  mode: StepMode;
  steps: AlgebraicStep[];
  scaffoldLevel?: number;
  problemType?: string;
  generateDistractors?: (expression: string, problemType: string) => string[];
  onPracticeComplete?: (attempts: StepAttempt[]) => void;
}

/**
 * Render a sequential step reveal display for teaching mode.
 * @param props - The steps array with content to reveal
 * @returns The step reveal component JSX
 */
function SimpleStepReveal({ steps }: { steps: Array<{ content: React.ReactNode }> }) {
  const [visibleCount, setVisibleCount] = useState(steps.length);

  if (steps.length === 0) {
    return <div className="my-6" />;
  }

  return (
    <div className="my-6">
      <div className="space-y-4">
        {steps.slice(0, visibleCount).map((step, index) => (
          <div
            key={index}
            className="flex gap-4"
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
    </div>
  );
}

/**
 * Render a step-by-step algebraic problem solver.
 * @param props - The stepper configuration including mode, steps, and scaffold level
 * @returns The stepper component JSX
 */
export function StepByStepper({ mode, steps, scaffoldLevel = 0, problemType, generateDistractors, onPracticeComplete }: StepByStepperProps) {
  if (steps.length === 0) {
    return <SimpleStepReveal steps={[]} />;
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
      <SimpleStepReveal steps={stepRevealSteps} />
    );
  }

  if (mode === 'guided') {
    return <GuidedMode steps={steps} problemType={problemType} generateDistractors={generateDistractors} />;
  }

  if (mode === 'practice') {
    return <PracticeMode steps={steps} scaffoldLevel={scaffoldLevel} onComplete={onPracticeComplete} />;
  }
}

/**
 * Render guided mode with multiple-choice step selection and hints.
 * @param props - The steps, problem type, and optional distractor generator
 * @returns The guided mode component JSX
 */
function GuidedMode({ steps, problemType, generateDistractors }: { steps: AlgebraicStep[]; problemType?: string; generateDistractors?: (expression: string, problemType: string) => string[] }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentStep = steps[currentStepIndex];
  const isComplete = currentStepIndex >= steps.length || (showExplanation && currentStepIndex === steps.length - 1);

  const options = useMemo(() => {
    if (!currentStep) return [];
    const distractors = currentStep.distractors || (generateDistractors ? generateDistractors(
      currentStep.expression,
      problemType || 'factoring'
    ) : []);
    return [
      currentStep.expression,
      ...distractors,
    ].sort(() => Math.random() - 0.5);
  }, [currentStep, problemType, generateDistractors]);

  const handleOptionClick = (expression: string) => {
    if (expression === currentStep.expression) {
      setShowHint(false);
      setHintUsed(false);
      setShowExplanation(true);
    } else {
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

  return (
    <div className="space-y-4">
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

      {!showExplanation && (
        <div className="text-lg font-medium">
          What&apos;s the next step?
        </div>
      )}

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

      {showExplanation && currentStepIndex < steps.length - 1 && (
        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Next
        </button>
      )}

      {hintCount > 0 && (
        <div className="text-xs text-muted-foreground">
          Hints used: {hintCount}
        </div>
      )}
    </div>
  );
}

/**
 * Render practice mode with free-form text input for each step.
 * @param props - The steps, scaffold level, and completion callback
 * @returns The practice mode component JSX
 */
function PracticeMode({ steps, scaffoldLevel, onComplete }: { steps: AlgebraicStep[]; scaffoldLevel: number; onComplete?: (attempts: StepAttempt[]) => void }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentStep = steps[currentStepIndex];

  const handleSubmit = (stepIndex: number) => {
    setSubmitted(prev => ({ ...prev, [stepIndex]: true }));
    setShowSolution(prev => ({ ...prev, [stepIndex]: true }));

    if (stepIndex === steps.length - 1) {
      setIsComplete(true);
      const attempts: StepAttempt[] = steps.map((step, idx) => ({
        stepIndex: idx,
        userAnswer: userAnswers[idx] ?? null,
        isCorrect: (userAnswers[idx] ?? '').trim() === step.expression.trim(),
      }));
      onComplete?.(attempts);
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
      <div className="p-4 bg-muted/30 rounded-lg">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Problem:
        </div>
        <div className="text-lg">
          <InlineMath math={steps[0].expression} />
        </div>
      </div>

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
            type="submit"
            onClick={() => handleSubmit(currentStepIndex)}
            disabled={!userAnswers[currentStepIndex]?.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      )}

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
