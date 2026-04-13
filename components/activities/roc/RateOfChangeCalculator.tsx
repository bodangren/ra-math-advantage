'use client';

import React, { useState } from 'react';
import { RateOfChangeCalculatorProps } from '@/lib/activities/schemas/rate-of-change-calculator.schema';

type ROCMode = 'teaching' | 'guided' | 'practice';

interface ROCState {
  currentStep: number;
  identifiedValues: {
    a: string;
    fA: string;
    b: string;
    fB: string;
  };
  calculatedAnswer: string;
  submitted: boolean;
}

function computeRateOfChange(
  sourceType: 'function' | 'table' | 'graph',
  data: RateOfChangeCalculatorProps['data'],
  interval: { start: number; end: number }
): number {
  const { start, end } = interval;

  if (sourceType === 'table') {
    const tableData = data as { x: number[]; y: number[] };
    const aIndex = tableData.x.indexOf(start);
    const bIndex = tableData.x.indexOf(end);
    if (aIndex === -1 || bIndex === -1) return 0;
    return (tableData.y[bIndex] - tableData.y[aIndex]) / (tableData.x[bIndex] - tableData.x[aIndex]);
  }

  if (sourceType === 'function') {
    const expr = (data as { expression: string }).expression;
    const match = expr.match(/y\s*=\s*(.+)/i);
    if (!match) return 0;
    const formula = match[1];
    const fA = evaluateExpression(formula, start);
    const fB = evaluateExpression(formula, end);
    return (fB - fA) / (end - start);
  }

  if (sourceType === 'graph') {
    const points = (data as { points: [number, number][] }).points;
    const aPoint = points.find(p => Object.is(p[0], start));
    const bPoint = points.find(p => Object.is(p[0], end));
    if (!aPoint || !bPoint) return 0;
    return (bPoint[1] - aPoint[1]) / (bPoint[0] - aPoint[0]);
  }

  return 0;
}

function evaluateExpression(formula: string, x: number): number {
  const expr = formula
    .replace(/\^/g, '**')
    .replace(/(\d+)x/gi, '$1*x')
    .replace(/x\^(\d+)/gi, 'x**$1')
    .replace(/x/g, `(${x})`);
  
  try {
    return Function(`return ${expr}`)();
  } catch {
    return 0;
  }
}

function getValueAtIndex(
  sourceType: 'function' | 'table' | 'graph',
  data: RateOfChangeCalculatorProps['data'],
  index: number
): string {
  if (sourceType === 'table') {
    const tableData = data as { x: number[]; y: number[] };
    return String(tableData.y[tableData.y.length > index ? index : 0]);
  }

  if (sourceType === 'function') {
    const expr = (data as { expression: string }).expression;
    const match = expr.match(/y\s*=\s*(.+)/i);
    if (!match) return '';
    return String(evaluateExpression(match[1], index));
  }

  if (sourceType === 'graph') {
    const points = (data as { points: [number, number][] }).points;
    const point = points.find(p => Object.is(p[0], index));
    return point ? String(point[1]) : '';
  }

  return '';
}

export function RateOfChangeCalculator({
  activityId,
  mode,
  sourceType,
  data,
  interval,
  onSubmit,
  onComplete,
}: RateOfChangeCalculatorProps & { mode: ROCMode; onSubmit?: (payload: unknown) => void; onComplete?: () => void }) {
  const [state, setState] = useState<ROCState>({
    currentStep: 0,
    identifiedValues: { a: '', fA: '', b: '', fB: '' },
    calculatedAnswer: '',
    submitted: false,
  });

  const rocValue = computeRateOfChange(sourceType, data, interval);
  const { start, end } = interval;

  const totalSteps = mode === 'guided' ? 4 : 1;

  const handleGuidedStep = (field: keyof ROCState['identifiedValues'], value: string) => {
    setState(prev => ({
      ...prev,
      identifiedValues: { ...prev.identifiedValues, [field]: value },
    }));
  };

  const handleNextStep = () => {
    if (state.currentStep < totalSteps - 1) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  };

  const handlePracticeSubmit = () => {
    const envelope = {
      activityId,
      mode: mode === 'practice' ? 'independent_practice' : mode,
      status: 'submitted',
      attemptNumber: 1,
      identifiedValues: state.identifiedValues,
      finalAnswer: state.calculatedAnswer,
      correctAnswer: String(rocValue),
      isCorrect: Math.abs(parseFloat(state.calculatedAnswer) - rocValue) < 0.001,
      analytics: {
        score: Math.abs(parseFloat(state.calculatedAnswer) - rocValue) < 0.001 ? 100 : 0,
      },
    };

    onSubmit?.(envelope);
    onComplete?.();
    setState(prev => ({ ...prev, submitted: true }));
  };

  if (mode === 'teaching') {
    return (
      <div className="space-y-8 p-4">
        <h2 className="text-xl font-bold">Rate of Change Calculator</h2>

        {sourceType === 'function' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Formula</p>
              <p className="text-lg">Average Rate of Change = (f(b) - f(a)) / (b - a)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">f(a) where a = {start}</p>
                <p className="text-xl font-mono">
                  f({start}) = {getValueAtIndex(sourceType, data, start)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">f(b) where b = {end}</p>
                <p className="text-xl font-mono">
                  f({end}) = {getValueAtIndex(sourceType, data, end)}
                </p>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-800 mb-1">Expression</p>
              <p className="text-lg font-mono">{(data as { expression: string }).expression}</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-1">Result</p>
              <p className="text-2xl font-bold">
                ({getValueAtIndex(sourceType, data, end)} - {getValueAtIndex(sourceType, data, start)}) / ({end} - {start}) = {rocValue}
              </p>
            </div>
          </div>
        )}

        {sourceType === 'table' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Formula</p>
              <p className="text-lg">Average Rate of Change = (y₂ - y₁) / (x₂ - x₁)</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border px-4 py-2 bg-gray-100">x</th>
                    {(data as { x: number[] }).x.map((val, i) => (
                      <th
                        key={i}
                        className={`border px-4 py-2 ${
                          val >= start && val <= end ? 'bg-yellow-100 font-bold' : ''
                        }`}
                        data-testid={val >= start && val <= end ? 'highlighted' : ''}
                      >
                        {val}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2 bg-gray-100 font-medium">y</td>
                    {(data as { y: number[] }).y.map((val, i) => (
                      <td
                        key={i}
                        className={`border px-4 py-2 ${
                          (data as { x: number[] }).x[i] >= start && (data as { x: number[] }).x[i] <= end
                            ? 'bg-yellow-100 font-bold'
                            : ''
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-800 mb-1">Interval</p>
              <p className="text-lg">
                a = {start}, b = {end}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-1">Result</p>
              <p className="text-2xl font-bold">
                ({getValueAtIndex(sourceType, data, end)} - {getValueAtIndex(sourceType, data, start)}) / ({end} - {start}) = {rocValue}
              </p>
            </div>
          </div>
        )}

        {sourceType === 'graph' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Formula</p>
              <p className="text-lg">Average Rate of Change = (y₂ - y₁) / (x₂ - x₁)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(data as { points: [number, number][] }).points.map((point, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg ${
                    Object.is(point[0], start) || Object.is(point[0], end)
                      ? 'bg-yellow-100 border-2 border-yellow-400'
                      : 'bg-gray-50'
                  }`}
                >
                  <p className="text-sm font-medium">
                    ({point[0]}, {point[1]})
                    {Object.is(point[0], start) && ' (start)'}
                    {Object.is(point[0], end) && ' (end)'}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-1">Estimation</p>
              <p className="text-lg">Visual slope approximation from graph</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-800 mb-1">Exact Value</p>
              <p className="text-2xl font-bold">{rocValue}</p>
            </div>
          </div>
        )}
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
              <p className="text-lg">Identify the starting point (a) and its y-value (f(a))</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">a = {start}</label>
                  <input
                    type="text"
                    value={state.identifiedValues.a}
                    onChange={(e) => handleGuidedStep('a', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Confirm a value"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">f(a) = ?</label>
                  <input
                    type="text"
                    value={state.identifiedValues.fA}
                    onChange={(e) => handleGuidedStep('fA', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter f(a)"
                  />
                </div>
              </div>
            </div>
          )}

          {state.currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-lg">Identify the ending point (b) and its y-value (f(b))</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">b = {end}</label>
                  <input
                    type="text"
                    value={state.identifiedValues.b}
                    onChange={(e) => handleGuidedStep('b', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Confirm b value"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">f(b) = ?</label>
                  <input
                    type="text"
                    value={state.identifiedValues.fB}
                    onChange={(e) => handleGuidedStep('fB', e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter f(b)"
                  />
                </div>
              </div>
            </div>
          )}

          {state.currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-lg">Apply the rate of change formula</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-mono text-lg">
                  (f(b) - f(a)) / (b - a) = ({state.identifiedValues.fB || '?'} - {state.identifiedValues.fA || '?'}) / ({state.identifiedValues.b || end} - {state.identifiedValues.a || start})
                </p>
              </div>
            </div>
          )}

          {state.currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-lg">Enter your final answer</p>
              <input
                type="text"
                value={state.calculatedAnswer}
                onChange={(e) => setState(prev => ({ ...prev, calculatedAnswer: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter calculated rate of change"
              />
              <p className="text-sm text-muted-foreground">Correct answer: {rocValue}</p>
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
        <h2 className="text-xl font-bold">Rate of Change Calculator</h2>

        <div className="space-y-4">
          <p className="text-lg">
            Calculate the average rate of change from x = {start} to x = {end}
          </p>

          {sourceType === 'table' && (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border px-4 py-2 bg-gray-100">x</th>
                    {(data as { x: number[] }).x.map((val, i) => (
                      <th key={i} className="border px-4 py-2">
                        {val}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-4 py-2 bg-gray-100 font-medium">y</td>
                    {(data as { y: number[] }).y.map((val, i) => (
                      <td key={i} className="border px-4 py-2">
                        {val}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {sourceType === 'function' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-mono text-lg">{(data as { expression: string }).expression}</p>
            </div>
          )}

          {sourceType === 'graph' && (
            <div className="space-y-2">
              {(data as { points: [number, number][] }).points.map((point, i) => (
                <div key={i} className="bg-gray-50 p-2 rounded">
                  ({point[0]}, {point[1]})
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your answer (rate of change):</label>
            <input
              type="text"
              value={state.calculatedAnswer}
              onChange={(e) => setState(prev => ({ ...prev, calculatedAnswer: e.target.value }))}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Enter the calculated rate of change"
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
            <p className="font-medium">Correct answer: {rocValue}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}