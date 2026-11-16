'use client';

import React, { useState } from 'react';
import { toConvexActivityId } from '@math-platform/practice-core';
import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import { RateOfChangeCalculatorProps } from '../../schemas/rate-of-change-calculator.schema';

type ROCMode = 'teaching' | 'guided' | 'practice';

interface ROCState {
  currentStep: number;
  identifiedValues: {
    fA: string;
    fB: string;
  };
  calculatedAnswer: string;
  submitted: boolean;
}

/**
 * Compute the average rate of change over a given interval.
 * @param {'function' | 'table' | 'graph'} sourceType - The type of data source (function, table, or graph)
 * @param {RateOfChangeCalculatorProps['data']} data - The data containing function expression, table values, or graph points
 * @param {{ start: number; end: number }} interval - The interval with start and end x-values
 * @returns {number} - The computed average rate of change
 */
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
    const match = expr.match(/(?:y|f\(x\))\s*=\s*(.+)/i);
    if (!match) return 0;
    const formula = match[1];
    const fA = evaluateExpression(formula, start);
    const fB = evaluateExpression(formula, end);
    return (fB - fA) / (end - start);
  }

  if (sourceType === 'graph') {
    const points = (data as { points: [number, number][] }).points;
    const normStart = start === 0 ? 0 : start;
    const normEnd = end === 0 ? 0 : end;
    const aPoint = points.find(p => (p[0] === 0 ? 0 : p[0]) === normStart);
    const bPoint = points.find(p => (p[0] === 0 ? 0 : p[0]) === normEnd);
    if (!aPoint || !bPoint) return 0;
    return (bPoint[1] - aPoint[1]) / (bPoint[0] - aPoint[0]);
  }

  return 0;
}

/**
 * Evaluate a mathematical expression at a given x value.
 * @param {string} formula - The mathematical expression string to evaluate
 * @param {number} x - The x-value to substitute into the expression
 * @returns {number} - The evaluated result, or 0 on failure
 */
function evaluateExpression(formula: string, x: number): number {
  const expr = formula
    .replace(/x\s*(?:\^2|²)/gi, 'x*x')
    .replace(/\s+/g, '')
    .replace(/\^/g, '**')
    .replace(/(\d+)x/gi, '$1*x')
    .replace(/x\^(\d+)/gi, 'x**$1')
    .replace(/x/g, `(${x})`);

  try {
    return safeEvalPolynomial(expr);
  } catch {
    return 0;
  }
}

/**
 * Safely evaluate a polynomial expression without using eval.
 * @param {string} expr - The sanitized polynomial expression string
 * @returns {number} - The computed numeric result
 * @throws {Error} If the expression contains invalid characters or syntax
 */
function safeEvalPolynomial(expr: string): number {
  if (!/^[\d\s+\-*/().]+$/.test(expr)) {
    throw new Error('Invalid expression');
  }
  
  let pos = 0;
  
  function parseExpression(): number {
    let result = parseTerm();
    while (pos < expr.length) {
      if (expr[pos] === '+') {
        pos++;
        result += parseTerm();
      } else if (expr[pos] === '-') {
        pos++;
        result -= parseTerm();
      } else {
        break;
      }
    }
    return result;
  }
  
  function parseTerm(): number {
    let result = parseFactor();
    while (pos < expr.length) {
      if (expr[pos] === '*') {
        pos++;
        result *= parseFactor();
      } else if (expr[pos] === '/') {
        pos++;
        const divisor = parseFactor();
        if (divisor === 0) throw new Error('Division by zero');
        result /= divisor;
      } else {
        break;
      }
    }
    return result;
  }
  
  function parseFactor(): number {
    let sign = 1;
    while (pos < expr.length && (expr[pos] === '+' || expr[pos] === '-')) {
      if (expr[pos] === '-') sign *= -1;
      pos++;
    }
    
    let result: number;
    
    if (pos < expr.length && expr[pos] === '(') {
      pos++;
      result = parseExpression();
      if (pos < expr.length && expr[pos] === ')') {
        pos++;
      }
    } else {
      const start = pos;
      while (pos < expr.length && (expr[pos] >= '0' && expr[pos] <= '9' || expr[pos] === '.')) {
        pos++;
      }
      if (pos === start) {
        throw new Error('Expected number');
      }
      result = parseFloat(expr.substring(start, pos));
    }
    
    return sign * result;
  }
  
  while (pos < expr.length && expr[pos] === ' ') pos++;
  
  const result = parseExpression();
  
  while (pos < expr.length && expr[pos] === ' ') pos++;
  if (pos < expr.length) {
    throw new Error('Unexpected character');
  }
  
  return result;
}

/**
 * Retrieve the y-value at a given x-index from the data source.
 * @param {'function' | 'table' | 'graph'} sourceType - The type of data source (function, table, or graph)
 * @param {RateOfChangeCalculatorProps['data']} data - The data containing function expression, table values, or graph points
 * @param {number} index - The x-value at which to retrieve the y-value
 * @returns {string} - The y-value as a string, or empty string if not found
 */
function getValueAtIndex(
  sourceType: 'function' | 'table' | 'graph',
  data: RateOfChangeCalculatorProps['data'],
  index: number
): string {
  if (sourceType === 'table') {
    const tableData = data as { x: number[]; y: number[] };
    const idx = tableData.x.indexOf(index);
    if (idx === -1) return '';
    return String(tableData.y[idx]);
  }

  if (sourceType === 'function') {
    const expr = (data as { expression: string }).expression;
    const match = expr.match(/(?:y|f\(x\))\s*=\s*(.+)/i);
    if (!match) return '';
    return String(evaluateExpression(match[1], index));
  }

  if (sourceType === 'graph') {
    const points = (data as { points: [number, number][] }).points;
    const normIndex = index === 0 ? 0 : index;
    const point = points.find(p => (p[0] === 0 ? 0 : p[0]) === normIndex);
    return point ? String(point[1]) : '';
  }

  return '';
}

/**
 * Render a rate of change calculator in teaching, guided, or practice mode.
 * @param {RateOfChangeCalculatorProps & { activityId?: string; mode: ROCMode; onSubmit?: (payload: unknown) => void | Promise<void>; onComplete?: () => void }} props - The calculator configuration including mode, data source, and interval
 * @returns {React.JSX.Element | null} The calculator component JSX
 */
export function RateOfChangeCalculator({
  activityId,
  mode,
  sourceType,
  data,
  interval,
  onSubmit,
  onComplete,
}: RateOfChangeCalculatorProps & { activityId?: string; mode: ROCMode; onSubmit?: (payload: unknown) => void | Promise<void>; onComplete?: () => void }) {
  const [state, setState] = useState<ROCState>({
    currentStep: 0,
    identifiedValues: { fA: '', fB: '' },
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
    if (!activityId?.trim() || state.identifiedValues.fA.trim() === '' || state.identifiedValues.fB.trim() === '' || state.calculatedAnswer.trim() === '') {
      return;
    }

    const envelope: PracticeSubmissionEnvelope = {
      contractVersion: 'practice.v1',
      activityId: toConvexActivityId(activityId),
      mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers: {
        fA: state.identifiedValues.fA,
        fB: state.identifiedValues.fB,
        rate: state.calculatedAnswer,
      },
      parts: [
        { partId: 'f_a', rawAnswer: state.identifiedValues.fA },
        { partId: 'f_b', rawAnswer: state.identifiedValues.fB },
        { partId: 'rate', rawAnswer: state.calculatedAnswer },
      ],
    };

    if (!onSubmit) {
      return;
    }

    try {
      const result = onSubmit(envelope);
      void Promise.resolve(result)
        .then(() => {
          onComplete?.();
          setState(prev => ({ ...prev, submitted: true }));
        })
        .catch(() => undefined);
    } catch {
      // Keep the activity incomplete when submission storage fails.
    }
  };

  if (mode === 'teaching') {
    return (
      <div className="space-y-8 p-4">
        <h2 className="text-xl font-bold">Rate of Change Calculator</h2>

        {sourceType === 'function' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Formula</p>
              <p className="text-lg text-gray-900">Average Rate of Change = (f(b) - f(a)) / (b - a)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">f(a) where a = {start}</p>
                <p className="text-xl font-mono text-gray-900">
                  f({start}) = {getValueAtIndex(sourceType, data, start)}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">f(b) where b = {end}</p>
                <p className="text-xl font-mono text-gray-900">
                  f({end}) = {getValueAtIndex(sourceType, data, end)}
                </p>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-800 mb-1">Expression</p>
              <p className="text-lg font-mono text-gray-900">{(data as { expression: string }).expression}</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-1">Result</p>
              <p className="text-2xl font-bold text-gray-900">
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
                    point[0] === start || point[0] === end
                      ? 'bg-yellow-100 border-2 border-yellow-400'
                      : 'bg-gray-50'
                  }`}
                >
                  <p className="text-sm font-medium">
                    ({point[0]}, {point[1]})
                    {point[0] === start && ' (start)'}
                    {point[0] === end && ' (end)'}
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

        {sourceType === 'function' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-mono text-lg text-gray-900">{(data as { expression: string }).expression}</p>
          </div>
        )}

        <div className="space-y-4">
          {state.currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-lg">Use a = {start} as the starting x-value.</p>
              <div>
                <label htmlFor="guided-fA" className="block text-sm font-medium mb-1">f({start})</label>
                <input
                  id="guided-fA"
                  type="text"
                  value={state.identifiedValues.fA}
                  onChange={(e) => handleGuidedStep('fA', e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder={`Enter f(${start})`}
                />
              </div>
            </div>
          )}

          {state.currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-lg">Use b = {end} as the ending x-value.</p>
              <div>
                <label htmlFor="guided-fB" className="block text-sm font-medium mb-1">f({end})</label>
                <input
                  id="guided-fB"
                  type="text"
                  value={state.identifiedValues.fB}
                  onChange={(e) => handleGuidedStep('fB', e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder={`Enter f(${end})`}
                />
              </div>
            </div>
          )}

          {state.currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-lg">Apply the rate of change formula</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-mono text-lg text-gray-900">
                  (f(b) - f(a)) / (b - a) = ({state.identifiedValues.fB || '?'} - {state.identifiedValues.fA || '?'}) / ({end} - {start})
                </p>
              </div>
            </div>
          )}

          {state.currentStep === 3 && (
            <div className="space-y-4">
              <label htmlFor="guided-rate" className="block text-lg">Average rate of change</label>
              <input
                id="guided-rate"
                type="text"
                value={state.calculatedAnswer}
                onChange={(e) => setState(prev => ({ ...prev, calculatedAnswer: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter calculated rate of change"
              />
              {state.submitted && (
                <p className="text-sm text-muted-foreground">Submission recorded for grading.</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {state.currentStep < totalSteps - 1 ? (
            <button
              onClick={handleNextStep}
              disabled={state.currentStep === 0 ? state.identifiedValues.fA.trim() === '' : state.currentStep === 1 ? state.identifiedValues.fB.trim() === '' : state.identifiedValues.fA.trim() === '' || state.identifiedValues.fB.trim() === ''}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handlePracticeSubmit}
              disabled={state.identifiedValues.fA.trim() === '' || state.identifiedValues.fB.trim() === '' || state.calculatedAnswer.trim() === ''}
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
              <p className="font-mono text-lg text-gray-900">{(data as { expression: string }).expression}</p>
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
            <label htmlFor="practice-fA" className="block text-sm font-medium mb-1">f({start})</label>
            <input
              id="practice-fA"
              type="text"
              value={state.identifiedValues.fA}
              onChange={(e) => handleGuidedStep('fA', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder={`Enter f(${start})`}
            />
          </div>
          <div>
            <label htmlFor="practice-fB" className="block text-sm font-medium mb-1">f({end})</label>
            <input
              id="practice-fB"
              type="text"
              value={state.identifiedValues.fB}
              onChange={(e) => handleGuidedStep('fB', e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder={`Enter f(${end})`}
            />
          </div>
          <div>
            <label htmlFor="practice-rate" className="block text-sm font-medium mb-1">Average rate of change</label>
            <input
              id="practice-rate"
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
          disabled={state.identifiedValues.fA.trim() === '' || state.identifiedValues.fB.trim() === '' || state.calculatedAnswer.trim() === ''}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Submit
        </button>

        {state.submitted && (
          <div className="mt-4 p-4 rounded-lg bg-yellow-50">
            <p className="font-medium text-gray-900">Submission recorded for grading.</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
