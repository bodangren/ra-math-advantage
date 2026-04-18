'use client';

import React, { useState } from 'react';
import { DiscriminantAnalyzerProps } from '@/lib/activities/schemas/discriminant-analyzer.schema';

type DAMode = 'teaching' | 'guided' | 'practice';

interface DAState {
  currentStep: number;
  identifiedCoefficients: {
    a: string;
    b: string;
    c: string;
  };
  computedDiscriminant: string;
  classification: string;
  submitted: boolean;
}

function computeDiscriminant(a: number, b: number, c: number): number {
  return b * b - 4 * a * c;
}

function classifyDiscriminant(discriminant: number): string {
  if (discriminant > 0) {
    return 'Two distinct real roots';
  } else if (discriminant === 0) {
    return 'One repeated real root';
  } else {
    return 'Two complex roots';
  }
}

function extractCoefficients(
  equation: string,
  providedCoefficients?: { a: number; b: number; c: number }
): { a: number; b: number; c: number } | null {
  if (providedCoefficients) {
    return providedCoefficients;
  }

  const normalized = equation.replace(/\s/g, '').replace(/x²/gi, 'x^2');

  const aMatch = normalized.match(/(?:^|[-+])(\d*(?:\.\d+)?)\*?x\^2/i);
  const bMatch = normalized.match(/(?:^|[-+])(\d*(?:\.\d+)?)\*?x(?!\^)/i);
  const cMatch = normalized.match(/(?:^|[-+])(\d+(?:\.\d+)?)(?![*x])/i);

  if (!aMatch) return null;

  const a = parseFloat(aMatch[1] || '1') * (aMatch[0].startsWith('-') ? -1 : 1);
  const b = bMatch ? parseFloat(bMatch[1] || '1') * (bMatch[0].startsWith('-') ? -1 : 1) : 0;
  const c = cMatch ? parseFloat(cMatch[1]) * (cMatch[0].startsWith('-') ? -1 : 1) : 0;

  return { a, b, c };
}

export function DiscriminantAnalyzer({
  mode,
  equation,
  coefficients,
  onSubmit,
  onComplete,
}: DiscriminantAnalyzerProps & { mode: DAMode; onSubmit?: (payload: unknown) => void; onComplete?: () => void }) {
  const extractedCoeffs = extractCoefficients(equation, coefficients);
  const a = extractedCoeffs?.a ?? 1;
  const b = extractedCoeffs?.b ?? 0;
  const c = extractedCoeffs?.c ?? 0;
  const discriminant = computeDiscriminant(a, b, c);
  const classification = classifyDiscriminant(discriminant);

  const [state, setState] = useState<DAState>({
    currentStep: 0,
    identifiedCoefficients: { a: '', b: '', c: '' },
    computedDiscriminant: '',
    classification: '',
    submitted: false,
  });

  const totalSteps = mode === 'guided' ? 3 : 1;

  if (!extractedCoeffs && !coefficients) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-800 font-medium">Unable to parse coefficients from equation: <code>{equation}</code></p>
        <p className="text-red-600 text-sm mt-1">Please provide coefficients explicitly.</p>
      </div>
    );
  }

  const handleGuidedStep = (field: keyof DAState['identifiedCoefficients'], value: string) => {
    setState(prev => ({
      ...prev,
      identifiedCoefficients: { ...prev.identifiedCoefficients, [field]: value },
    }));
  };

  const handleNextStep = () => {
    if (state.currentStep < totalSteps - 1) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const handlePracticeSubmit = () => {
    const userDiscriminant = parseFloat(state.computedDiscriminant);
    const isCorrect = !isNaN(userDiscriminant) && Math.abs(userDiscriminant - discriminant) < 0.001;

    const envelope = {
      mode: mode === 'practice' ? 'independent_practice' : mode === 'guided' ? 'guided_practice' : mode,
      status: 'submitted',
      attemptNumber: 1,
      identifiedCoefficients: state.identifiedCoefficients,
      computedDiscriminant: state.computedDiscriminant,
      correctDiscriminant: String(discriminant),
      isCorrect,
      classification: state.classification,
      correctClassification: classification,
      analytics: {
        score: isCorrect ? 100 : 0,
      },
    };

    onSubmit?.(envelope);
    onComplete?.();
    setState(prev => ({ ...prev, submitted: true }));
  };

  if (mode === 'teaching') {
    return (
      <div className="space-y-8 p-4">
        <h2 className="text-xl font-bold">Discriminant Analyzer</h2>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">Equation</p>
            <p className="text-lg font-mono">{equation}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-1">a</p>
              <p className="text-xl font-mono">a = {a}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-1">b</p>
              <p className="text-xl font-mono">b = {b}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-1">c</p>
              <p className="text-xl font-mono">c = {c}</p>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-purple-800 mb-2">Discriminant Formula</p>
            <p className="text-lg font-mono">b² - 4ac</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-1">Computation</p>
            <p className="text-lg font-mono">
              ({b})² - 4({a})({c}) = {b * b} - {4 * a * c} = {discriminant}
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-red-800 mb-1">Classification</p>
            <p className="text-xl font-bold">{classification}</p>
            <p className="text-sm text-red-600 mt-1">
              {discriminant > 0 && 'The parabola crosses the x-axis at two points.'}
              {discriminant === 0 && 'The parabola touches the x-axis at one point (vertex).'}
              {discriminant < 0 && 'The parabola does not cross the x-axis.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'guided') {
    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Step {state.currentStep + 1} of {totalSteps}
          </span>
        </div>

        <div className="space-y-4">
          {state.currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-lg">Identify the coefficients from the equation:</p>
              <p className="font-mono text-lg">{equation}</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">a = ?</label>
                  <input
                    type="text"
                    value={state.identifiedCoefficients.a}
                    onChange={(e) => handleGuidedStep('a', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter a"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">b = ?</label>
                  <input
                    type="text"
                    value={state.identifiedCoefficients.b}
                    onChange={(e) => handleGuidedStep('b', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter b"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">c = ?</label>
                  <input
                    type="text"
                    value={state.identifiedCoefficients.c}
                    onChange={(e) => handleGuidedStep('c', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter c"
                  />
                </div>
              </div>
            </div>
          )}

          {state.currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-lg">Apply the discriminant formula</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-mono text-lg">
                  b² - 4ac = ({state.identifiedCoefficients.b || '?'})² - 4({state.identifiedCoefficients.a || '?'})({state.identifiedCoefficients.c || '?'})
                </p>
              </div>
            </div>
          )}

          {state.currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-lg">Enter the discriminant value and classify the roots</p>
              <div>
                <label className="block text-sm font-medium mb-1">Discriminant value:</label>
                <input
                  type="text"
                  value={state.computedDiscriminant}
                  onChange={(e) => setState(prev => ({ ...prev, computedDiscriminant: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Enter discriminant value"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Classification:</label>
                <select
                  value={state.classification}
                  onChange={(e) => setState(prev => ({ ...prev, classification: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select classification</option>
                  <option value="Two distinct real roots">Two distinct real roots</option>
                  <option value="One repeated real root">One repeated real root</option>
                  <option value="Two complex roots">Two complex roots</option>
                </select>
              </div>
              {state.submitted && (
                <div className="p-4 rounded-lg bg-yellow-50">
                  <p className="font-medium">Correct discriminant: {discriminant}</p>
                  <p className="font-medium">Correct classification: {classification}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {state.currentStep < totalSteps - 1 ? (
            <button
              onClick={handleNextStep}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handlePracticeSubmit}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Submit Answer
            </button>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'practice') {
    return (
      <div className="space-y-8 p-4">
        <h2 className="text-xl font-bold">Discriminant Analyzer</h2>

        <div className="space-y-4">
          <p className="text-lg">Analyze the quadratic equation and find its discriminant.</p>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-lg font-mono">{equation}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Discriminant (b² - 4ac):</label>
            <input
              type="text"
              value={state.computedDiscriminant}
              onChange={(e) => setState(prev => ({ ...prev, computedDiscriminant: e.target.value }))}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Enter the discriminant value"
            />
          </div>
        </div>

        <button
          onClick={handlePracticeSubmit}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Submit
        </button>

        {state.submitted && (
          <div className="mt-4 p-4 rounded-lg bg-yellow-50">
            <p className="font-medium">Correct discriminant: {discriminant}</p>
            <p className="font-medium">Classification: {classification}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
