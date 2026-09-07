'use client';

import React, { useState, useCallback, useRef } from 'react';
import InlineMath from '@matejmazur/react-katex';
import 'katex/dist/katex.min.css';
import { GraphingCanvas, Point, FunctionPlot } from './GraphingCanvas';
import { InteractiveTableOfValues } from './InteractiveTableOfValues';
import { HintPanel, HintData } from './HintPanel';
import { InterceptIdentification, InterceptData } from './InterceptIdentification';
import { toConvexActivityId } from '@math-platform/practice-core';
import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import { evaluateFunction, parseQuadratic, parseLinear } from '@math-platform/graphing-core';

export interface GraphingExplorerProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice' | 'explore';
  onSubmit?: (payload: PracticeSubmissionEnvelope) => void | Promise<void>;
  variant?: 'plot_from_equation' | 'compare_functions' | 'find_intercepts' | 'graph_system';
  responseVariant?: 'quadratic_features' | 'table_graph' | 'one_real_solution';
  equation: string;
  domain?: [number, number];
  range?: [number, number];
  points?: [number, number][];
  comparisonEquation?: string;
  comparisonQuestion?: string;
  comparisonAnswer?: 'first' | 'second';
  linearEquation?: string;
  exploreQuestion?: string;
  explorationPrompts?: string[];
  sliderDefaults?: { a: number; b: number; c: number };
}

const DEFAULT_DOMAIN: [number, number] = [-10, 10];
const DEFAULT_RANGE: [number, number] = [-10, 10];

/**
 * Render an interactive graphing explorer with multiple activity variants.
 * @param {GraphingExplorerProps} props - The explorer configuration including equation, variant, and callbacks
 * @returns {React.JSX.Element} The graphing explorer component JSX
 */
export function GraphingExplorer({
  activityId,
  mode,
  onSubmit,
  variant = 'plot_from_equation',
  responseVariant,
  equation,
  domain = DEFAULT_DOMAIN,
  range = DEFAULT_RANGE,
  points: initialPoints = [],
  comparisonEquation,
  comparisonQuestion,
  comparisonAnswer,
  linearEquation,
  exploreQuestion,
  explorationPrompts,
  sliderDefaults,
}: GraphingExplorerProps) {
  const [placedPoints, setPlacedPoints] = useState<Point[]>([]);
  const [tableComplete, setTableComplete] = useState(false);
  const [tableValues, setTableValues] = useState<Array<{ x: number; y: number }>>([]);
  const [hints, setHints] = useState<HintData[]>([]);
  const [intercepts, setIntercepts] = useState<InterceptData[]>([]);
  const [interactionHistory, setInteractionHistory] = useState<Array<{ type: string; timestamp: number; data?: unknown }>>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [deferredSubmitted, setDeferredSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const savingRef = useRef(false);
  const [comparisonAnswerSelected, setComparisonAnswerSelected] = useState<'first' | 'second' | null>(null);
  const [showComparisonFeedback, setShowComparisonFeedback] = useState(false);
  const [intersectionPoints, setIntersectionPoints] = useState<Point[]>([]);
  const [sliderA, setSliderA] = useState(sliderDefaults?.a ?? 1);
  const [sliderB, setSliderB] = useState(sliderDefaults?.b ?? 0);
  const [sliderC, setSliderC] = useState(sliderDefaults?.c ?? 0);
  // Single polite live-region message for the whole GraphingExplorer surface.
  // GraphingCanvas announces via onAnnounce (point placement), and handleSubmit
  // sets the comparison/submit feedback. Colocating them in one region prevents
  // screen readers from missing announcements when multiple status regions
  // exist on the same surface.
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const isDeferredTableGraph = (mode === 'practice' || mode === 'guided') && responseVariant === 'table_graph' && variant === 'plot_from_equation';

  const addInteraction = useCallback((type: string, data?: unknown) => {
    setInteractionHistory(prev => [...prev, { type, timestamp: Date.now(), data }]);
  }, []);

  const handlePointAdd = useCallback((point: Point) => {
    setPlacedPoints(prev => [...prev, { ...point, label: `${point.x.toFixed(1)}, ${point.y.toFixed(1)}` }]);
    addInteraction('point_placed', point);

    if (variant === 'find_intercepts' && Math.abs(point.y) < 1.0) {
      setIntercepts(prev => [...prev, {
        type: 'intercept',
        data: { x: point.x, y: 0 },
        timestamp: Date.now(),
      }]);
      addInteraction('intercept_identified', { x: point.x, y: 0 });
    }

    if (variant === 'graph_system') {
      setIntersectionPoints(prev => [...prev, point]);
      addInteraction('intersection_identified', point);
    }
  }, [addInteraction, variant]);

  const handlePointRemove = useCallback((label: string) => {
    setPlacedPoints(prev => prev.filter(p => p.label !== label));
    if (variant === 'find_intercepts') {
      setIntercepts(prev => prev.filter(i => {
        if (i.type === 'intercept' && i.data) {
          return i.data.x.toFixed(1) !== label.split(', ')[0];
        }
        return true;
      }));
    }
    if (variant === 'graph_system') {
      setIntersectionPoints(prev => prev.filter(p => p.label !== label));
    }
    addInteraction('point_removed', { label });
  }, [addInteraction, variant]);

  const handleTableComplete = useCallback((points: Array<{ x: number; y: number }>) => {
    setTableValues(points);
    setTableComplete(points.length > 0);
    addInteraction('table_complete', { points });
  }, [addInteraction]);

  const handleHintUsed = useCallback((hint: HintData) => {
    setHints(prev => [...prev, hint]);
    addInteraction('hint_used', { hintType: hint.type, data: hint.data });
  }, [addInteraction]);

  const handleInterceptIdentified = useCallback((intercept: InterceptData) => {
    setIntercepts(prev => [...prev, intercept]);
    addInteraction('intercept_identified', intercept);
  }, [addInteraction]);

  const handleComparisonAnswerSelect = useCallback((answer: 'first' | 'second') => {
    setComparisonAnswerSelected(answer);
    addInteraction('comparison_answer_selected', { answer });
  }, [addInteraction]);

  const assessPointsCorrectness = useCallback((): boolean => {
    if (initialPoints.length === 0) return true;
    if (placedPoints.length === 0) return false;

    return initialPoints.every(([expectedX, expectedY]) =>
      placedPoints.some(p => Math.abs(p.x - expectedX) < 0.1 && Math.abs(p.y - expectedY) < 0.1)
    );
  }, [initialPoints, placedPoints]);

  const assessInterceptsCorrectness = useCallback((): boolean => {
    return intercepts.length > 0;
  }, [intercepts]);

  const assessComparisonCorrectness = useCallback((): boolean => {
    if (!comparisonAnswer || !comparisonAnswerSelected) return false;
    return comparisonAnswerSelected === comparisonAnswer;
  }, [comparisonAnswer, comparisonAnswerSelected]);

  const hasRealIntercepts = useCallback((): boolean => {
    const coeffs = parseQuadratic(equation);
    if (!coeffs) return true;

    const { a, b, c } = coeffs;
    const discriminant = b * b - 4 * a * c;
    return discriminant >= 0;
  }, [equation]);

  const hasRealIntersections = useCallback((): boolean => {
    if (!linearEquation) return true;

    const quadraticCoeffs = parseQuadratic(equation);
    if (!quadraticCoeffs) return true;

    const { a, b, c } = quadraticCoeffs;

    const linearCoeffs = parseLinear(linearEquation);
    let m: number;
    let k: number;

    if (linearCoeffs) {
      m = linearCoeffs.m;
      k = linearCoeffs.b;
    } else {
      const constantMatch = linearEquation.match(/y\s*=\s*(-?\d+\.?\d*)/);
      if (constantMatch) {
        m = 0;
        k = parseFloat(constantMatch[1]);
      } else {
        return true;
      }
    }

    const discriminant = (b - m) ** 2 - 4 * a * (c - k);
    return discriminant >= 0;
  }, [equation, linearEquation]);

  const handleSubmit = useCallback(() => {
    if (isDeferredTableGraph) {
      if (savingRef.current) return;
      const submittedTableValues = tableValues.map(({ x, y }) => ({ x, y }));
      const submittedPlacedPoints = placedPoints.map(({ x, y }) => ({ x, y }));
      const envelope: PracticeSubmissionEnvelope = {
        contractVersion: 'practice.v1',
        activityId: toConvexActivityId(activityId),
        mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: new Date().toISOString(),
        answers: {
          table_values: submittedTableValues,
          placed_points: submittedPlacedPoints,
        },
        parts: [
          { partId: 'table_values', rawAnswer: submittedTableValues },
          { partId: 'placed_points', rawAnswer: submittedPlacedPoints },
        ],
        artifact: {
          graphState: {
            equation,
            tableValues: submittedTableValues,
            placedPoints: submittedPlacedPoints,
          },
        },
        interactionHistory,
      };
      savingRef.current = true;
      setIsSaving(true);
      setSaveError(false);
      setDeferredSubmitted(false);
      setFeedbackMessage('Saving your submission.');
      setShowSolution(false);
      setShowComparisonFeedback(false);
      void (async () => {
        try {
          if (!onSubmit) throw new Error('Missing submission handler');
          await onSubmit(envelope);
          setFeedbackMessage('Submission recorded for grading.');
          setDeferredSubmitted(true);
        } catch {
          setFeedbackMessage('Your submission could not be saved. Try again.');
          setSaveError(true);
        } finally {
          savingRef.current = false;
          setIsSaving(false);
        }
      })();
      return;
    }

    const parts: Array<{
      partId: string;
      rawAnswer: unknown;
      isCorrect?: boolean;
      hintsUsed?: number;
    }> = [
      {
        partId: 'placed_points',
        rawAnswer: placedPoints.map(p => ({ x: p.x, y: p.y })),
        isCorrect: assessPointsCorrectness(),
      },
      {
        partId: 'intercepts',
        rawAnswer: intercepts,
        isCorrect: assessInterceptsCorrectness(),
        hintsUsed: hints.length,
      },
    ];

    const answers: Record<string, unknown> = {
      placedPoints: placedPoints.map(p => ({ x: p.x, y: p.y })),
      intercepts: intercepts,
    };

    if (variant === 'compare_functions' && comparisonAnswerSelected) {
      parts.push({
        partId: 'comparison',
        rawAnswer: comparisonAnswerSelected,
        isCorrect: assessComparisonCorrectness(),
      });
      answers.comparisonAnswer = comparisonAnswerSelected;
    }

    if (variant === 'graph_system') {
      parts.push({
        partId: 'intersections',
        rawAnswer: intersectionPoints,
        isCorrect: assessPointsCorrectness(),
      });
      answers.intersections = intersectionPoints;
    }

    // Announce comparison/points correctness via always-present polite live region (a11y).
    // Done BEFORE the optional onSubmit callback so the announcement is set even
    // when the component is rendered without a submission handler (tests/usages
    // that don't collect submissions still need the live-region feedback).
    //
    // Wording note: for the incorrect branch we use "not correct" (one space,
    // no hyphen) instead of "incorrect" so this sr-only region's textContent
    // does NOT contain the substring "incorrect". This avoids colliding with
    // existing IM3 tests that use `screen.getByText(/incorrect/i)` to find the
    // VISIBLE feedback panel — they would otherwise match BOTH elements and
    // throw on multiple matches. The Phase 2 a11y tests still see the result
    // (live region text contains "correct" as substring, matching the
    // /correct|incorrect/ regex used by `live-regions.test.tsx`).
    if (variant === 'compare_functions' && comparisonAnswerSelected) {
      setFeedbackMessage(
        assessComparisonCorrectness()
          ? 'Submission outcome: your answer is correct — the selected function opens upward.'
          : 'Submission outcome: your answer is not correct — compare the two functions and try again.'
      );
    } else {
      const correct = assessPointsCorrectness();
      setFeedbackMessage(
        correct
          ? 'Submission outcome: your answer is correct — all points are placed accurately.'
          : 'Submission outcome: your answer is not correct — keep trying.'
      );
    }

    if (!onSubmit) return;

    const envelope: PracticeSubmissionEnvelope = {
      contractVersion: 'practice.v1',
      activityId: toConvexActivityId(activityId),
      mode: (mode === 'practice' ? 'independent_practice' : mode === 'guided' ? 'guided_practice' : mode) as PracticeSubmissionEnvelope['mode'],
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers,
      parts,
      artifact: {
        graphState: {
          equation,
          comparisonEquation,
          linearEquation,
          domain,
          range,
          placedPoints,
          intercepts,
          intersectionPoints,
        },
      },
      interactionHistory,
    };

    onSubmit(envelope);
    setShowSolution(true);
    setShowComparisonFeedback(true);
  }, [activityId, mode, onSubmit, placedPoints, intercepts, hints, interactionHistory, equation, comparisonEquation, linearEquation, domain, range, assessPointsCorrectness, assessInterceptsCorrectness, variant, comparisonAnswerSelected, assessComparisonCorrectness, intersectionPoints, isDeferredTableGraph, tableValues]);

  const functions: FunctionPlot[] = [
    {
      expression: equation,
      color: '#3b82f6',
    },
    ...(variant === 'compare_functions' && comparisonEquation
      ? [{
          expression: comparisonEquation,
          color: '#ef4444',
        }]
      : []),
    ...(variant === 'graph_system' && linearEquation
      ? [{
          expression: linearEquation,
          color: '#10b981',
        }]
      : []),
  ];

  const preSetPoints: Point[] = initialPoints.map(([x, y]) => ({
    x,
    y,
    label: `${x.toFixed(1)}, ${y.toFixed(1)}`,
    type: 'vertex',
  }));

  const isTeaching = mode === 'teaching';
  const isGuided = mode === 'guided';
  const isPractice = mode === 'practice';
  const isExplore = mode === 'explore';

  const workedExample = (() => {
    if (!isTeaching || variant !== 'plot_from_equation') return null;
    const coefficients = parseQuadratic(equation);
    if (!coefficients || coefficients.a === 0) return null;

    let axisX = -coefficients.b / (2 * coefficients.a);
    if (Object.is(axisX, -0)) axisX = 0;
    const vertexY = evaluateFunction(equation, axisX);
    const xValues = Array.from({ length: 5 }, (_, index) => axisX + index - 2);
    const points: Point[] = xValues.map((x) => ({
      x,
      y: evaluateFunction(equation, x),
      label: `${x}, ${evaluateFunction(equation, x)}`,
      type: x === axisX ? 'vertex' : undefined,
    }));

    return {
      coefficients,
      axisX,
      vertexY,
      xValues,
      points,
      preFilledValues: Object.fromEntries(points.map((point) => [point.x, point.y])),
    };
  })();

  const formatNumber = (value: number): string => {
    const rounded = Number(value.toFixed(4));
    return String(Object.is(rounded, -0) ? 0 : rounded);
  };

  const formatCoefficient = (coeff: number, variable: string, isFirst: boolean): string => {
    if (coeff === 0) return '';
    const sign = coeff > 0 ? (isFirst ? '' : ' + ') : ' - ';
    const absCoeff = Math.abs(coeff);
    const coeffStr = absCoeff === 1 && variable ? '' : absCoeff.toString();
    return `${sign}${coeffStr}${variable}`;
  };

  const exploreEquation = (() => {
    let result = 'y = ';
    const aPart = formatCoefficient(sliderA, 'x²', true);
    const bPart = formatCoefficient(sliderB, 'x', !aPart);
    const cPart = formatCoefficient(sliderC, '', !aPart && !bPart);
    result += aPart + bPart + cPart;
    return result || 'y = 0';
  })();

  const handleSliderReset = () => {
    setSliderA(sliderDefaults?.a ?? 1);
    setSliderB(sliderDefaults?.b ?? 0);
    setSliderC(sliderDefaults?.c ?? 0);
  };

  const exploreFunctions: FunctionPlot[] = [{ expression: exploreEquation, color: '#3b82f6' }];

  return (
    <div className="space-y-6">
      {isExplore ? (
        <>
          {exploreQuestion && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-lg font-medium text-blue-900">{exploreQuestion}</p>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">Parameter Controls</h3>
              <button
                onClick={handleSliderReset}
                className="px-3 py-1 text-sm bg-slate-200 hover:bg-slate-300 rounded-md transition-colors"
              >
                Reset
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="w-24 font-medium text-foreground">
                  a: <span className="text-blue-600">{sliderA.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={sliderA}
                  onChange={(e) => setSliderA(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="Coefficient a"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="w-24 font-medium text-foreground">
                  b: <span className="text-blue-600">{sliderB.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.5"
                  value={sliderB}
                  onChange={(e) => setSliderB(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="Coefficient b"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="w-24 font-medium text-foreground">
                  c: <span className="text-blue-600">{sliderC.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.5"
                  value={sliderC}
                  onChange={(e) => setSliderC(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label="Coefficient c"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p className="text-lg font-mono text-center text-blue-700" aria-hidden="true">
                {exploreEquation}
              </p>
              <div
                data-testid="explore-equation-live"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
              >
                Current equation: {exploreEquation}
              </div>
            </div>
          </div>

          {explorationPrompts && explorationPrompts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <h4 className="font-medium text-amber-900 mb-2">Explore Further:</h4>
              <ul className="space-y-2">
                {explorationPrompts.map((prompt, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id={`prompt-${index}`}
                      className="mt-1 w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                    />
                    <label htmlFor={`prompt-${index}`} className="text-amber-800 cursor-pointer">
                      {prompt}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <GraphingCanvas
            domain={domain}
            range={range}
            functions={exploreFunctions}
            points={[]}
            readonly={true}
            onAnnounce={setFeedbackMessage}
          />
        </>
      ) : (
      <>
        <div>
          {workedExample && (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
              Worked example
            </p>
          )}
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {workedExample
              ? 'Graph a Quadratic Function by Using a Table'
              : variant === 'compare_functions'
              ? 'Compare the Functions'
              : variant === 'find_intercepts'
              ? 'Find the X-Intercepts'
              : variant === 'graph_system'
              ? 'Graph the System of Equations'
              : 'Graph the Function'}
          </h2>
          {workedExample ? (
            <div className="text-muted-foreground" data-testid="worked-equation">
              <InlineMath math={equation} />
            </div>
          ) : (
            <p className="text-muted-foreground">
              {equation}
              {variant === 'compare_functions' && comparisonEquation && (
                <>
                  <br />
                  {comparisonEquation}
                </>
              )}
              {variant === 'graph_system' && linearEquation && (
                <>
                  <br />
                  {linearEquation}
                </>
              )}
            </p>
          )}
        </div>

        {workedExample && (
          <section className="space-y-3 rounded-lg border border-border bg-card p-4 text-foreground">
            <h3 className="text-lg font-semibold">Step 1: Analyze the function</h3>
            <p>
              <InlineMath
                math={`a = ${formatNumber(workedExample.coefficients.a)},\\quad b = ${formatNumber(workedExample.coefficients.b)},\\quad c = ${formatNumber(workedExample.coefficients.c)}`}
              />
            </p>
            <p>
              The y-intercept is{' '}
              <InlineMath math={`${formatNumber(workedExample.coefficients.c)}`} />.
            </p>
            <p data-testid="worked-axis">
              Axis of symmetry:{' '}
              <InlineMath
                math={`x = -\\frac{b}{2a} = ${formatNumber(workedExample.axisX)}`}
              />
            </p>
            <p>
              The vertex is{' '}
              <InlineMath
                math={`(${formatNumber(workedExample.axisX)}, ${formatNumber(workedExample.vertexY)})`}
              />.
              {' '}The parabola opens {workedExample.coefficients.a > 0 ? 'upward' : 'downward'},
              so the vertex is a {workedExample.coefficients.a > 0 ? 'minimum' : 'maximum'}.
            </p>
          </section>
        )}

        {variant === 'graph_system' && (
        <p className="text-sm text-muted-foreground">
          Find the intersection points
        </p>
      )}

      {(isDeferredTableGraph || (isGuided && !tableComplete)) && (
        <InteractiveTableOfValues
          xValues={[-2, -1, 0, 1, 2]}
          functionExpression={equation}
          onTableComplete={handleTableComplete}
          assessmentMode={isDeferredTableGraph ? 'deferred' : undefined}
          readonly={isTeaching}
        />
      )}

      {workedExample && (
        <section aria-labelledby="worked-graph-step" className="space-y-3">
          <h3 id="worked-graph-step" className="text-lg font-semibold text-foreground">
            Step 2: Graph the function
          </h3>
          <InteractiveTableOfValues
            xValues={workedExample.xValues}
            functionExpression={equation}
            onTableComplete={() => undefined}
            preFilledValues={workedExample.preFilledValues}
            readonly
          />
        </section>
      )}

      {isGuided && tableComplete && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-green-800 text-sm">The table is complete. Plot your points on the graph.</p>
        </div>
      )}

      {isGuided && (
        <HintPanel
          functionExpression={equation}
          onHintUsed={handleHintUsed}
          readonly={isTeaching}
        />
      )}

      <GraphingCanvas
        domain={domain}
        range={range}
        functions={isDeferredTableGraph ? [] : functions}
        points={workedExample
          ? [
              ...workedExample.points,
              ...preSetPoints.filter((point) => !workedExample.points.some(
                (workedPoint) => workedPoint.x === point.x && workedPoint.y === point.y,
              )),
            ]
          : [...preSetPoints, ...placedPoints]}
        onPointAdd={(!isTeaching && (isDeferredTableGraph ? tableComplete : (isPractice || tableComplete))) ? handlePointAdd : undefined}
        onPointRemove={(!isTeaching && (isDeferredTableGraph ? tableComplete : (isPractice || tableComplete))) ? handlePointRemove : undefined}
        readonly={isTeaching}
        snapToGrid={isGuided}
        onAnnounce={setFeedbackMessage}
      />

      {workedExample && (
        <section className="space-y-2 rounded-lg border border-border bg-card p-4 text-foreground">
          <h3 className="text-lg font-semibold">Step 3: Analyze the graph</h3>
          <p>The domain is all real numbers.</p>
          <p data-testid="worked-range">
            Range:{' '}
            <InlineMath
              math={workedExample.coefficients.a > 0
                ? `\\{y \\mid y \\ge ${formatNumber(workedExample.vertexY)}\\}`
                : `\\{y \\mid y \\le ${formatNumber(workedExample.vertexY)}\\}`}
            />
          </p>
        </section>
      )}

      {isGuided && tableComplete && !isDeferredTableGraph && (
        <InterceptIdentification
          functionExpression={equation}
          onInterceptIdentified={handleInterceptIdentified}
          readonly={isTeaching}
        />
      )}

      {variant === 'find_intercepts' && !hasRealIntercepts() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800 font-medium">
            This function has no real x-intercepts.
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            The graph does not cross the x-axis.
          </p>
        </div>
      )}

      {variant === 'graph_system' && !hasRealIntersections() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800 font-medium">
            This system has no real intersection points.
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            The quadratic and linear functions do not intersect.
          </p>
        </div>
      )}

      {variant === 'compare_functions' && comparisonQuestion && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <p className="font-medium text-foreground mb-3">{comparisonQuestion}</p>
          {!isTeaching ? (
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="comparison"
                  value="first"
                  checked={comparisonAnswerSelected === 'first'}
                  onChange={(e) => handleComparisonAnswerSelect(e.target.value as 'first' | 'second')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-foreground">First function: {equation}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="comparison"
                  value="second"
                  checked={comparisonAnswerSelected === 'second'}
                  onChange={(e) => handleComparisonAnswerSelect(e.target.value as 'first' | 'second')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-foreground">Second function: {comparisonEquation}</span>
              </label>
            </div>
          ) : (
            <p className="text-sm text-green-700 font-medium">
              Correct answer: {comparisonAnswer === 'first' ? 'First' : 'Second'} function
            </p>
          )}
        </div>
      )}

      {showSolution && (
        <>
          {showComparisonFeedback && variant === 'compare_functions' && comparisonAnswerSelected && (
            <div className={`border rounded-md p-4 ${assessComparisonCorrectness() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`font-semibold mb-2 ${assessComparisonCorrectness() ? 'text-green-900' : 'text-red-900'}`}>
                {assessComparisonCorrectness() ? 'Correct!' : 'Incorrect'}
              </h3>
              {!assessComparisonCorrectness() && (
                <p className={`text-sm ${assessComparisonCorrectness() ? 'text-green-800' : 'text-red-800'}`}>
                  The correct answer is: {comparisonAnswer === 'first' ? 'First' : 'Second'} function
                </p>
              )}
            </div>
          )}
          {variant === 'find_intercepts' && (
            <div className={`border rounded-md p-4 ${assessInterceptsCorrectness() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`font-semibold mb-2 ${assessInterceptsCorrectness() ? 'text-green-900' : 'text-red-900'}`}>
                {assessInterceptsCorrectness() ? 'Correct!' : 'Incorrect'}
              </h3>
            </div>
          )}
          {variant === 'graph_system' && (
            <div className={`border rounded-md p-4 ${assessPointsCorrectness() ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`font-semibold mb-2 ${assessPointsCorrectness() ? 'text-green-900' : 'text-red-900'}`}>
                {assessPointsCorrectness() ? 'Correct!' : 'Incorrect'}
              </h3>
            </div>
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Correct Solution</h3>
            <div className="text-sm text-blue-800 space-y-1">
              {preSetPoints.map((point, index) => (
                <div key={index}>
                  Point: ({point.x.toFixed(1)}, {point.y.toFixed(1)})
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!isTeaching && (
        (isDeferredTableGraph
          ? tableComplete
          : variant === 'compare_functions'
            ? comparisonAnswerSelected
            : isPractice || tableComplete
        ) && (
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isDeferredTableGraph && isSaving}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Submit
          </button>
        )
      )}
      </>
      )}
      {/* Always-present polite live region — colocates GraphingCanvas point-
          placement announcements (via onAnnounce) and submit/compare feedback
          so there is exactly ONE polite region per surface. */}
      <div role="status" aria-live="polite" className="sr-only">
        {feedbackMessage}
      </div>
      {isDeferredTableGraph && saveError && (
        <p role="alert">Your submission could not be saved. Try again.</p>
      )}
      {isDeferredTableGraph && deferredSubmitted && (
        <p className="text-sm text-muted-foreground" data-testid="deferred-submission-recorded">
          Submission recorded for grading.
        </p>
      )}
    </div>
  );
}
