'use client';

import { useCallback, useId, useState, type FormEvent } from 'react';
import InlineMath from '@matejmazur/react-katex';
import { GraphingCanvas, type Point } from './GraphingCanvas';
import { GraphingExplorer } from './GraphingExplorer';
import { InteractiveTableOfValues } from './InteractiveTableOfValues';
import { toConvexActivityId } from '@math-platform/practice-core';
import type { PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import { parseQuadratic } from '@math-platform/graphing-core';

export interface GraphingExplorerActivityProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice' | 'explore';
  onSubmit?: (payload: unknown) => void | Promise<void>;
  onComplete?: () => void;
  equation?: string;
  originalEquation?: string;
  variant?: 'plot_from_equation' | 'compare_functions' | 'find_intercepts' | 'graph_system';
  domain?: [number, number];
  range?: [number, number];
  points?: [number, number][];
  comparisonEquation?: string;
  comparisonQuestion?: string;
  comparisonAnswer?: 'first' | 'second';
  linearEquation?: string;
  responseVariant?: 'quadratic_features' | 'table_graph' | 'domain_range' | 'maximum_value' | 'symmetry_graph' | 'compare_maximums' | 'one_real_solution' | 'two_real_solutions' | 'estimated_root_intervals';
  vertex?: [number, number];
  yIntercept?: [number, number];
  sum?: number;
  product?: number;
}

interface QuadraticFeatureAnswers {
  vertex_x: number;
  vertex_y: number;
  direction: 'upward' | 'downward';
  y_intercept: number;
}

function QuadraticFeatureForm({
  equation,
  onSubmit,
}: {
  equation: string;
  onSubmit: (answers: QuadraticFeatureAnswers) => void;
}) {
  const [vertexX, setVertexX] = useState('');
  const [vertexY, setVertexY] = useState('');
  const [direction, setDirection] = useState<QuadraticFeatureAnswers['direction'] | ''>('');
  const [yIntercept, setYIntercept] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedVertexX = Number(vertexX);
    const parsedVertexY = Number(vertexY);
    const parsedYIntercept = Number(yIntercept);
    if (
      !Number.isFinite(parsedVertexX)
      || !Number.isFinite(parsedVertexY)
      || !Number.isFinite(parsedYIntercept)
      || direction === ''
    ) {
      return;
    }

    onSubmit({
      vertex_x: parsedVertexX,
      vertex_y: parsedVertexY,
      direction,
      y_intercept: parsedYIntercept,
    });
  };

  return (
    <form
      className="space-y-5 rounded-lg border border-border bg-card p-5 text-foreground"
      data-testid="im3-pilot-answer-form"
      onSubmit={handleSubmit}
    >
      <div>
        <h2 className="text-xl font-semibold">Graph the Function</h2>
        <p
          className="mt-1 text-muted-foreground"
          data-testid="quadratic-feature-equation"
        >
          <InlineMath math={equation} />
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        Enter the vertex, opening direction, and y-intercept.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium" htmlFor="im3-pilot-vertex-x">
          Vertex x
          <input
            id="im3-pilot-vertex-x"
            data-testid="im3-pilot-vertex-x"
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
            inputMode="decimal"
            type="number"
            value={vertexX}
            onChange={(event) => setVertexX(event.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm font-medium" htmlFor="im3-pilot-vertex-y">
          Vertex y
          <input
            id="im3-pilot-vertex-y"
            data-testid="im3-pilot-vertex-y"
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
            inputMode="decimal"
            type="number"
            value={vertexY}
            onChange={(event) => setVertexY(event.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm font-medium" htmlFor="im3-pilot-direction">
          Direction
          <select
            id="im3-pilot-direction"
            data-testid="im3-pilot-direction"
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
            value={direction}
            onChange={(event) => setDirection(event.target.value as QuadraticFeatureAnswers['direction'] | '')}
          >
            <option value="">Select direction</option>
            <option value="upward">Opens upward</option>
            <option value="downward">Opens downward</option>
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium" htmlFor="im3-pilot-y-intercept">
          Y-intercept
          <input
            id="im3-pilot-y-intercept"
            data-testid="im3-pilot-y-intercept"
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
            inputMode="decimal"
            type="number"
            value={yIntercept}
            onChange={(event) => setYIntercept(event.target.value)}
          />
        </label>
      </div>

      <button
        className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
        data-testid="im3-pilot-submit"
        type="submit"
      >
        Submit answer
      </button>
    </form>
  );
}


/**
 * Render a graphing explorer activity with default equation and submission handling.
 * @param {GraphingExplorerActivityProps} props - The activity configuration including ID, mode, and callbacks
 * @returns {import("react").JSX.Element} The activity component JSX
 */
export function GraphingExplorerActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  equation = 'y = x^2',
  originalEquation,
  variant = 'plot_from_equation',
  domain,
  range,
  points,
  comparisonEquation,
  comparisonQuestion,
  comparisonAnswer,
  linearEquation,
  responseVariant,
  vertex,
  yIntercept,
  sum,
  product,
}: GraphingExplorerActivityProps) {
  const instanceId = useId();
  const [domainAnswer, setDomainAnswer] = useState('');
  const [rangeRelation, setRangeRelation] = useState<'gte' | 'lte' | ''>('');
  const [rangeBoundary, setRangeBoundary] = useState('');
  const [maximumAnswer, setMaximumAnswer] = useState('');
  const [comparisonSelection, setComparisonSelection] = useState<'first' | 'second' | ''>('');
  const [placedPoints, setPlacedPoints] = useState<Point[]>([]);
  const [nextPointId, setNextPointId] = useState(1);
  const [oneRealTableValues, setOneRealTableValues] = useState<Array<{ x: number; y: number }>>([]);
  const [oneRealSolution, setOneRealSolution] = useState('');
  const [twoRealTableValues, setTwoRealTableValues] = useState<Array<{ x: number; y: number }>>([]);
  const [firstTwoRealSolution, setFirstTwoRealSolution] = useState('');
  const [secondTwoRealSolution, setSecondTwoRealSolution] = useState('');
  const [estimatedRootTableValues, setEstimatedRootTableValues] = useState<Array<{ x: number; y: number }>>([]);
  const [firstRootIntervalLower, setFirstRootIntervalLower] = useState('');
  const [firstRootIntervalUpper, setFirstRootIntervalUpper] = useState('');
  const [secondRootIntervalLower, setSecondRootIntervalLower] = useState('');
  const [secondRootIntervalUpper, setSecondRootIntervalUpper] = useState('');

  const handleOneRealTableComplete = useCallback((tableValues: Array<{ x: number; y: number }>) => {
    setOneRealTableValues(tableValues);
  }, []);

  const handleTwoRealTableComplete = useCallback((tableValues: Array<{ x: number; y: number }>) => {
    setTwoRealTableValues(tableValues);
  }, []);

  const handleEstimatedRootTableComplete = useCallback((tableValues: Array<{ x: number; y: number }>) => {
    setEstimatedRootTableValues(tableValues);
  }, []);

  const handleSubmit = (payload: unknown) => {
    try {
      const result = onSubmit?.(payload);
      void Promise.resolve(result)
        .then(() => onComplete?.())
        .catch(() => undefined);
    } catch {
      // Keep the activity incomplete when submission storage fails.
    }
  };

  if (responseVariant === 'estimated_root_intervals') {
    let coefficients: ReturnType<typeof parseQuadratic> = null;
    try {
      coefficients = parseQuadratic(equation);
    } catch {
      coefficients = null;
    }

    const discriminant = coefficients
      ? coefficients.b * coefficients.b - 4 * coefficients.a * coefficients.c
      : Number.NaN;
    const roots = coefficients && discriminant > 0
      ? [
        (-coefficients.b - Math.sqrt(discriminant)) / (2 * coefficients.a),
        (-coefficients.b + Math.sqrt(discriminant)) / (2 * coefficients.a),
      ].sort((first, second) => first - second)
      : [];
    const signChangeIndexes = points
      ? points.slice(0, -1).flatMap(([, y], index) => {
        const nextY = points[index + 1]?.[1];
        return nextY !== undefined && y * nextY < 0 ? [index] : [];
      })
      : [];
    const hasValidSource = Boolean(
      originalEquation?.trim()
      && equation.trim()
      && coefficients
      && Number.isFinite(coefficients.a)
      && Number.isFinite(coefficients.b)
      && Number.isFinite(coefficients.c)
      && coefficients.a !== 0
      && discriminant > 0
      && roots.length === 2
      && roots.every((root) => Number.isFinite(root) && !Number.isInteger(root))
      && roots[0] !== roots[1]
      && points
      && points.length === 8
      && points.every(([x, y], index) => (
        Number.isInteger(x)
        && Number.isFinite(y)
        && Math.abs(coefficients.a * x * x + coefficients.b * x + coefficients.c - y) <= 1e-9
        && (index === 0 || x === points[index - 1]![0] + 1)
      ))
      && signChangeIndexes.length === 2,
    );

    if (!hasValidSource || !coefficients || !points) {
      return <p role="status">Estimated-root-interval activity is unavailable until valid source data is provided.</p>;
    }

    const rootIntervals = signChangeIndexes.map((index) => [
      points[index]![0],
      points[index + 1]![0],
    ] as [number, number]);
    const preFilledValues: Record<number, number> = {};
    points.forEach(([x, y]) => {
      preFilledValues[x] = y;
    });
    const graphPoints: Point[] = points.map(([x, y], index) => ({
      x,
      y,
      label: `${instanceId}-estimated-root-interval-point-${index + 1}`,
    }));

    if (mode !== 'teaching') {
      const submissionMode = mode === 'guided' ? 'guided_practice' : 'independent_practice';
      const intervalEndpoints = [
        Number(firstRootIntervalLower),
        Number(firstRootIntervalUpper),
        Number(secondRootIntervalLower),
        Number(secondRootIntervalUpper),
      ];
      const hasFiniteIntegerEndpoints = [
        firstRootIntervalLower,
        firstRootIntervalUpper,
        secondRootIntervalLower,
        secondRootIntervalUpper,
      ].every(value => value.trim() !== '') && intervalEndpoints.every(value => Number.isFinite(value) && Number.isInteger(value));
      const hasValidIntervals = hasFiniteIntegerEndpoints
        && intervalEndpoints[0] + 1 === intervalEndpoints[1]
        && intervalEndpoints[2] + 1 === intervalEndpoints[3]
        && intervalEndpoints[1] < intervalEndpoints[2];
      const canPlacePoints = estimatedRootTableValues.length === 8;
      const canSubmit = canPlacePoints && placedPoints.length === 8 && hasValidIntervals;
      const handleEstimatedRootPointAdd = (point: Point) => {
        if (!canPlacePoints || placedPoints.length >= 8) return;
        const labelledPoint: Point = { ...point, label: `${instanceId}-estimated-root-interval-point-${nextPointId}` };
        setPlacedPoints(current => current.length >= 8 ? current : [...current, labelledPoint]);
        setNextPointId(current => current + 1);
      };
      const handleEstimatedRootPointRemove = (label: string) => {
        setPlacedPoints(current => current.filter(point => point.label !== label));
      };
      const handleEstimatedRootSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSubmit) return;

        const submittedTableValues = estimatedRootTableValues.map(({ x, y }) => ({ x, y }));
        const submittedPlacedPoints = placedPoints.map(({ x, y }) => ({ x, y }));
        const submittedRootIntervals = [
          [intervalEndpoints[0], intervalEndpoints[1]],
          [intervalEndpoints[2], intervalEndpoints[3]],
        ];
        const envelope: PracticeSubmissionEnvelope = {
          contractVersion: 'practice.v1',
          activityId: toConvexActivityId(activityId),
          mode: submissionMode,
          status: 'submitted',
          attemptNumber: 1,
          submittedAt: new Date().toISOString(),
          answers: {
            table_values: submittedTableValues,
            placed_points: submittedPlacedPoints,
            root_intervals: submittedRootIntervals,
          },
          parts: [
            { partId: 'table_values', rawAnswer: submittedTableValues },
            { partId: 'placed_points', rawAnswer: submittedPlacedPoints },
            { partId: 'root_intervals', rawAnswer: submittedRootIntervals },
          ],
          artifact: {
            graphState: {
              originalEquation: originalEquation ?? '',
              equation,
              tableValues: submittedTableValues,
              placedPoints: submittedPlacedPoints,
              domain: domain ?? [-10, 10],
              range: range ?? [-10, 10],
            },
          },
        };

        handleSubmit(envelope);
      };

      return (
        <div className="space-y-6 rounded-lg border border-border bg-card p-5 text-foreground">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Estimate Roots by Graphing</h2>
            <p>{`Solve ${originalEquation} by graphing. If the exact roots cannot be found, state the consecutive integers between which the roots are located.`}</p>
            <p>Related function: {equation}</p>
            <p>Axis of symmetry: x = {-coefficients.b / (2 * coefficients.a)}</p>
          </div>
          {mode === 'guided' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-gray-900">
              <p>Use the table and graph to locate each root between consecutive integers.</p>
            </div>
          )}
          <InteractiveTableOfValues
            xValues={points.map(([x]) => x)}
            functionExpression={equation}
            onTableComplete={handleEstimatedRootTableComplete}
            assessmentMode="deferred"
          />
          <GraphingCanvas
            domain={domain ?? [-10, 10]}
            range={range ?? [-10, 10]}
            functions={[]}
            points={placedPoints}
            onPointAdd={handleEstimatedRootPointAdd}
            onPointRemove={handleEstimatedRootPointRemove}
            readonly={false}
            snapToGrid
          />
          <form className="space-y-4" onSubmit={handleEstimatedRootSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-medium" htmlFor={`${instanceId}-first-root-interval-lower`}>
                First interval lower bound
                <input
                  id={`${instanceId}-first-root-interval-lower`}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  type="number"
                  step={1}
                  value={firstRootIntervalLower}
                  onChange={(event) => setFirstRootIntervalLower(event.target.value)}
                />
              </label>
              <label className="space-y-1 text-sm font-medium" htmlFor={`${instanceId}-first-root-interval-upper`}>
                First interval upper bound
                <input
                  id={`${instanceId}-first-root-interval-upper`}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  type="number"
                  step={1}
                  value={firstRootIntervalUpper}
                  onChange={(event) => setFirstRootIntervalUpper(event.target.value)}
                />
              </label>
              <label className="space-y-1 text-sm font-medium" htmlFor={`${instanceId}-second-root-interval-lower`}>
                Second interval lower bound
                <input
                  id={`${instanceId}-second-root-interval-lower`}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  type="number"
                  step={1}
                  value={secondRootIntervalLower}
                  onChange={(event) => setSecondRootIntervalLower(event.target.value)}
                />
              </label>
              <label className="space-y-1 text-sm font-medium" htmlFor={`${instanceId}-second-root-interval-upper`}>
                Second interval upper bound
                <input
                  id={`${instanceId}-second-root-interval-upper`}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  type="number"
                  step={1}
                  value={secondRootIntervalUpper}
                  onChange={(event) => setSecondRootIntervalUpper(event.target.value)}
                />
              </label>
            </div>
            <button
              className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={!canSubmit}
            >
              Submit graph and root intervals
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="space-y-6 rounded-lg border border-border bg-card p-5 text-foreground">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Estimate Roots by Graphing</h2>
          <p>{`Solve ${originalEquation} by graphing. If the exact roots cannot be found, state the consecutive integers between which the roots are located.`}</p>
          <p>Related function: {equation}</p>
          <p>Axis of symmetry: x = {-coefficients.b / (2 * coefficients.a)}</p>
        </div>
        <InteractiveTableOfValues
          xValues={points.map(([x]) => x)}
          functionExpression={equation}
          onTableComplete={() => undefined}
          preFilledValues={preFilledValues}
          readonly
        />
        <GraphingCanvas
          domain={domain ?? [-10, 10]}
          range={range ?? [-10, 10]}
          functions={[{ expression: equation, color: '#3b82f6' }]}
          points={graphPoints}
          readonly
        />
        <p>The roots are between {rootIntervals[0]![0]} and {rootIntervals[0]![1]}, and between {rootIntervals[1]![0]} and {rootIntervals[1]![1]}.</p>
      </div>
    );
  }

  if (responseVariant === 'two_real_solutions') {
    const equationParts = equation.split('=');
    const equationRightSide = equationParts.slice(1).join('=').trim();
    let coefficients: ReturnType<typeof parseQuadratic> = null;
    try {
      coefficients = parseQuadratic(equation);
    } catch {
      coefficients = null;
    }

    const discriminant = coefficients
      ? coefficients.b * coefficients.b - 4 * coefficients.a * coefficients.c
      : Number.NaN;
    const rawRoots = coefficients && discriminant > 0
      ? [
        (-coefficients.b - Math.sqrt(discriminant)) / (2 * coefficients.a),
        (-coefficients.b + Math.sqrt(discriminant)) / (2 * coefficients.a),
      ]
      : [];
    const roots = rawRoots.sort((first, second) => first - second).map((root) => (
      Object.is(root, -0) ? 0 : root
    ));
    const hasValidSource = Boolean(
      originalEquation?.trim()
      && equationRightSide
      && coefficients
      && Number.isFinite(coefficients.a)
      && Number.isFinite(coefficients.b)
      && Number.isFinite(coefficients.c)
      && coefficients.a > 0
      && discriminant > 0
      && roots.length === 2
      && Number.isFinite(roots[0])
      && Number.isFinite(roots[1])
      && Number.isInteger(roots[0])
      && Number.isInteger(roots[1])
      && roots[0] !== roots[1]
      && typeof sum === 'number'
      && Number.isFinite(sum)
      && typeof product === 'number'
      && Number.isFinite(product)
      && Math.abs(sum - (roots[0] + roots[1])) <= 1e-9
      && Math.abs(product - (roots[0] * roots[1])) <= 1e-9
      && points
      && points.length === 5
      && points.every(([x, y]) => (
        Number.isFinite(x)
        && Number.isFinite(y)
        && Math.abs(coefficients.a * x * x + coefficients.b * x + coefficients.c - y) <= 1e-9
      ))
      && points.some(([x, y]) => x === roots[0] && y === 0)
      && points.some(([x, y]) => x === roots[1] && y === 0)
    );

    if (!hasValidSource || !coefficients || !points || sum === undefined || product === undefined) {
      return <p role="status">Two-real-solutions activity is unavailable until valid source data is provided.</p>;
    }

    if (mode !== 'teaching') {
      const submissionMode = mode === 'guided' ? 'guided_practice' : 'independent_practice';
      const parsedFirstSolution = Number(firstTwoRealSolution);
      const parsedSecondSolution = Number(secondTwoRealSolution);
      const canPlacePoints = twoRealTableValues.length === 5;
      const canSubmit = canPlacePoints
        && placedPoints.length === 5
        && firstTwoRealSolution.trim() !== ''
        && secondTwoRealSolution.trim() !== ''
        && Number.isFinite(parsedFirstSolution)
        && Number.isFinite(parsedSecondSolution);
      const handleTwoRealPointAdd = (point: Point) => {
        if (!canPlacePoints || placedPoints.length >= 5) return;
        const labelledPoint: Point = { ...point, label: `${instanceId}-two-real-solutions-point-${nextPointId}` };
        setPlacedPoints(current => current.length >= 5 ? current : [...current, labelledPoint]);
        setNextPointId(current => current + 1);
      };
      const handleTwoRealPointRemove = (label: string) => {
        setPlacedPoints(current => current.filter(point => point.label !== label));
      };
      const handleTwoRealSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSubmit) return;

        const submittedTableValues = twoRealTableValues.map(({ x, y }) => ({ x, y }));
        const submittedPlacedPoints = placedPoints.map(({ x, y }) => ({ x, y }));
        const envelope: PracticeSubmissionEnvelope = {
          contractVersion: 'practice.v1',
          activityId: toConvexActivityId(activityId),
          mode: submissionMode,
          status: 'submitted',
          attemptNumber: 1,
          submittedAt: new Date().toISOString(),
          answers: {
            table_values: submittedTableValues,
            placed_points: submittedPlacedPoints,
            solutions: [parsedFirstSolution, parsedSecondSolution],
          },
          parts: [
            { partId: 'table_values', rawAnswer: submittedTableValues },
            { partId: 'placed_points', rawAnswer: submittedPlacedPoints },
            { partId: 'solutions', rawAnswer: [parsedFirstSolution, parsedSecondSolution] },
          ],
          artifact: {
            graphState: {
              originalEquation: originalEquation ?? '',
              equation,
              tableValues: submittedTableValues,
              placedPoints: submittedPlacedPoints,
              domain: domain ?? [-10, 10],
              range: range ?? [-10, 10],
            },
          },
        };

        handleSubmit(envelope);
      };

      return (
        <div className="space-y-6 rounded-lg border border-border bg-card p-5 text-foreground">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Find Two Numbers by Graphing a Quadratic Equation</h2>
            <p>Find two real numbers with a sum of {sum} and a product of {product}.</p>
            <p>Model: {originalEquation}</p>
            <p>Related function: {equation}</p>
          </div>
          {mode === 'guided' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-gray-900">
              <p>Complete the table, plot five points, and use the two x-intercepts as the two numbers.</p>
            </div>
          )}
          <InteractiveTableOfValues
            xValues={points.map(([x]) => x)}
            functionExpression={equation}
            onTableComplete={handleTwoRealTableComplete}
            assessmentMode="deferred"
          />
          <GraphingCanvas
            domain={domain ?? [-10, 10]}
            range={range ?? [-10, 10]}
            functions={[]}
            points={placedPoints}
            onPointAdd={handleTwoRealPointAdd}
            onPointRemove={handleTwoRealPointRemove}
            readonly={false}
            snapToGrid
          />
          <form className="space-y-4" onSubmit={handleTwoRealSubmit}>
            <label className="space-y-1 text-sm font-medium" htmlFor={`${instanceId}-first-two-real-solution`}>
              First number
              <input
                id={`${instanceId}-first-two-real-solution`}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                type="number"
                step="any"
                value={firstTwoRealSolution}
                onChange={(event) => setFirstTwoRealSolution(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm font-medium" htmlFor={`${instanceId}-second-two-real-solution`}>
              Second number
              <input
                id={`${instanceId}-second-two-real-solution`}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                type="number"
                step="any"
                value={secondTwoRealSolution}
                onChange={(event) => setSecondTwoRealSolution(event.target.value)}
              />
            </label>
            <button
              className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={!canSubmit}
            >
              Submit graph and solutions
            </button>
          </form>
        </div>
      );
    }

    const axisOfSymmetry = -coefficients.b / (2 * coefficients.a);
    const preFilledValues: Record<number, number> = {};
    points.forEach(([x, y]) => {
      preFilledValues[x] = y;
    });
    const graphPoints: Point[] = points.map(([x, y], index) => ({
      x,
      y,
      label: `${instanceId}-two-real-solutions-point-${index + 1}`,
    }));

    return (
      <div className="space-y-6 rounded-lg border border-border bg-card p-5 text-foreground">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Find Two Numbers by Graphing a Quadratic Equation</h2>
          <p>Find two real numbers with a sum of {sum} and a product of {product}.</p>
          <p>Model: {originalEquation}</p>
          <p>Standard form: 0 = {equationRightSide}</p>
          <p>Axis of symmetry: x = {axisOfSymmetry}</p>
        </div>
        <InteractiveTableOfValues
          xValues={points.map(([x]) => x)}
          functionExpression={equation}
          onTableComplete={() => undefined}
          preFilledValues={preFilledValues}
          readonly
        />
        <GraphingCanvas
          domain={domain ?? [-10, 10]}
          range={range ?? [-10, 10]}
          functions={[{ expression: equation, color: '#3b82f6' }]}
          points={graphPoints}
          readonly
        />
        <p>The zeros are {roots[0]} and {roots[1]}.</p>
        <p>Thus, the two numbers are {roots[0]} and {roots[1]}.</p>
      </div>
    );
  }

  if (responseVariant === 'one_real_solution') {
    const equationParts = equation.split('=');
    const equationRightSide = equationParts.slice(1).join('=').trim();
    let coefficients: ReturnType<typeof parseQuadratic> = null;
    try {
      coefficients = parseQuadratic(equation);
    } catch {
      coefficients = null;
    }

    const discriminant = coefficients
      ? coefficients.b * coefficients.b - 4 * coefficients.a * coefficients.c
      : Number.NaN;
    const rootValue = coefficients ? -coefficients.b / (2 * coefficients.a) : Number.NaN;
    const repeatedRoot = Object.is(rootValue, -0) ? 0 : rootValue;
    const hasValidSource = Boolean(
      originalEquation?.trim()
      && equation.includes('=')
      && equationRightSide
      && coefficients
      && Number.isFinite(coefficients.a)
      && Number.isFinite(coefficients.b)
      && Number.isFinite(coefficients.c)
      && coefficients.a > 0
      && Math.abs(discriminant) <= 1e-9
      && Number.isFinite(repeatedRoot)
      && Number.isInteger(repeatedRoot),
    );

    if (!hasValidSource || !coefficients) {
      return (
        <p role="status">One-real-solution activity is unavailable until valid source data is provided.</p>
      );
    }

    const xValues = [repeatedRoot - 2, repeatedRoot - 1, repeatedRoot, repeatedRoot + 1, repeatedRoot + 2];
    const yValues = xValues.map((x) => (
      coefficients.a * x * x + coefficients.b * x + coefficients.c
    ));

    if (mode !== 'teaching') {
      const submissionMode = mode === 'guided' ? 'guided_practice' : 'independent_practice';
      const parsedSolution = Number(oneRealSolution);
      const canPlacePoints = oneRealTableValues.length === 5;
      const canSubmit = canPlacePoints
        && placedPoints.length === 5
        && oneRealSolution.trim() !== ''
        && Number.isFinite(parsedSolution);
      const handleOneRealPointAdd = (point: Point) => {
        if (!canPlacePoints || placedPoints.length >= 5) return;
        const labelledPoint: Point = { ...point, label: `${instanceId}-one-real-solution-point-${nextPointId}` };
        setPlacedPoints(current => current.length >= 5 ? current : [...current, labelledPoint]);
        setNextPointId(current => current + 1);
      };
      const handleOneRealPointRemove = (label: string) => {
        setPlacedPoints(current => current.filter(point => point.label !== label));
      };
      const handleOneRealSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSubmit) return;

        const submittedTableValues = oneRealTableValues.map(({ x, y }) => ({ x, y }));
        const submittedPlacedPoints = placedPoints.map(({ x, y }) => ({ x, y }));
        const envelope: PracticeSubmissionEnvelope = {
          contractVersion: 'practice.v1',
          activityId: toConvexActivityId(activityId),
          mode: submissionMode,
          status: 'submitted',
          attemptNumber: 1,
          submittedAt: new Date().toISOString(),
          answers: {
            table_values: submittedTableValues,
            placed_points: submittedPlacedPoints,
            solution: parsedSolution,
          },
          parts: [
            { partId: 'table_values', rawAnswer: submittedTableValues },
            { partId: 'placed_points', rawAnswer: submittedPlacedPoints },
            { partId: 'solution', rawAnswer: parsedSolution },
          ],
          artifact: {
            graphState: {
              originalEquation: originalEquation ?? '',
              equation,
              tableValues: submittedTableValues,
              placedPoints: submittedPlacedPoints,
              domain: domain ?? [-10, 10],
              range: range ?? [-10, 10],
            },
          },
        };

        handleSubmit(envelope);
      };

      return (
        <div className="space-y-6 rounded-lg border border-border bg-card p-5 text-foreground">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Solve a Quadratic Equation by Graphing</h2>
            <p>Original equation: {originalEquation}</p>
            <p>Related function: {equation}</p>
          </div>
          {mode === 'guided' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-gray-900">
              <p>Use the table to plot the parabola. The single x-intercept is the solution.</p>
            </div>
          )}
          <InteractiveTableOfValues
            xValues={xValues}
            functionExpression={equation}
            onTableComplete={handleOneRealTableComplete}
            assessmentMode="deferred"
          />
          <GraphingCanvas
            domain={domain ?? [-10, 10]}
            range={range ?? [-10, 10]}
            functions={[]}
            points={placedPoints}
            onPointAdd={handleOneRealPointAdd}
            onPointRemove={handleOneRealPointRemove}
            readonly={false}
            snapToGrid
          />
          <form className="space-y-4" onSubmit={handleOneRealSubmit}>
            <label className="space-y-1 text-sm font-medium" htmlFor={`${instanceId}-one-real-solution`}>
              Solution x
              <input
                id={`${instanceId}-one-real-solution`}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                type="number"
                step="any"
                value={oneRealSolution}
                onChange={(event) => setOneRealSolution(event.target.value)}
              />
            </label>
            <button
              className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={!canSubmit}
            >
              Submit graph and solution
            </button>
          </form>
        </div>
      );
    }

    const preFilledValues: Record<number, number> = {};
    xValues.forEach((x, index) => {
      preFilledValues[x] = yValues[index] ?? 0;
    });
    const graphPoints: Point[] = xValues.map((x, index) => ({
      x,
      y: yValues[index] ?? 0,
      label: `${instanceId}-one-real-solution-point-${index + 1}`,
    }));

    return (
      <div className="space-y-6 rounded-lg border border-border bg-card p-5 text-foreground">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Solve a Quadratic Equation by Graphing</h2>
          <p>Original equation: {originalEquation}</p>
          <p>Rewrite the equation as 0 = {equationRightSide}.</p>
          <p data-testid="one-real-solution-axis">Axis of symmetry: x = {repeatedRoot}</p>
        </div>
        <InteractiveTableOfValues
          xValues={xValues}
          functionExpression={equation}
          onTableComplete={() => undefined}
          preFilledValues={preFilledValues}
          readonly
        />
        <GraphingCanvas
          domain={domain ?? [-10, 10]}
          range={range ?? [-10, 10]}
          functions={[{ expression: equation, color: '#3b82f6' }]}
          points={graphPoints}
          readonly
        />
        <p>The graph touches the x-axis once, so the solution is x = {repeatedRoot}.</p>
      </div>
    );
  }

  if (responseVariant === 'quadratic_features') {
    return <QuadraticFeatureForm equation={equation} onSubmit={handleSubmit} />;
  }

  if (responseVariant === 'symmetry_graph') {
    if (!vertex || !yIntercept) {
      return (
        <p role="status">Symmetry graph activity is unavailable until vertex and y-intercept are provided.</p>
      );
    }

    const reflectedPoint: [number, number] = [
      2 * vertex[0] - yIntercept[0],
      yIntercept[1],
    ];
    const openingDirection = vertex[1] > yIntercept[1] ? 'downward' : 'upward';

    if (mode === 'teaching') {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Graph by Using Symmetry</h2>
            <p>Vertex: ({vertex[0]}, {vertex[1]})</p>
            <p>Y-intercept: ({yIntercept[0]}, {yIntercept[1]})</p>
          </div>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Plot the vertex at ({vertex[0]}, {vertex[1]}) and use the axis of symmetry x = {vertex[0]}.</li>
            <li>Plot the y-intercept at ({yIntercept[0]}, {yIntercept[1]}).</li>
            <li>Reflect ({yIntercept[0]}, {yIntercept[1]}) across x = {vertex[0]} to get ({reflectedPoint[0]}, {reflectedPoint[1]}).</li>
            <li>Draw the {openingDirection}-opening parabola through ({vertex[0]}, {vertex[1]}), ({yIntercept[0]}, {yIntercept[1]}), and ({reflectedPoint[0]}, {reflectedPoint[1]}).</li>
          </ol>
          <p>({yIntercept[0]}, {yIntercept[1]}) and ({reflectedPoint[0]}, {reflectedPoint[1]}) are equally far from x = {vertex[0]}.</p>
          <GraphingCanvas
            domain={domain ?? [-10, 10]}
            range={range ?? [-10, 10]}
            functions={[{ expression: equation, color: '#3b82f6' }]}
            points={[
              { x: vertex[0], y: vertex[1] },
              { x: yIntercept[0], y: yIntercept[1] },
              { x: reflectedPoint[0], y: reflectedPoint[1] },
            ]}
            readonly
          />
        </div>
      );
    }

    const canSubmit = placedPoints.length === 3;
    const handlePointAdd = (point: Point) => {
      if (placedPoints.length >= 3) return;
      const labelledPoint: Point = { ...point, label: `${instanceId}-symmetry-point-${nextPointId}` };
      setPlacedPoints(current => current.length >= 3 ? current : [...current, labelledPoint]);
      setNextPointId(current => current + 1);
    };
    const handlePointRemove = (label: string) => {
      setPlacedPoints(current => current.filter(point => point.label !== label));
    };
    const handleSymmetrySubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit) return;

      const submittedPoints = placedPoints.map(({ x, y }) => ({ x, y }));
      const envelope: PracticeSubmissionEnvelope = {
        contractVersion: 'practice.v1',
        activityId: toConvexActivityId(activityId),
        mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: new Date().toISOString(),
        answers: { placed_points: submittedPoints },
        parts: [{ partId: 'placed_points', rawAnswer: submittedPoints }],
        artifact: {
          graphState: {
            equation,
            vertex,
            yIntercept,
            placedPoints: submittedPoints,
            domain: domain ?? [-10, 10],
            range: range ?? [-10, 10],
          },
        },
      };

      handleSubmit(envelope);
    };

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Graph by Using Symmetry</h2>
          <p>Plot the vertex, the y-intercept, and its reflection across the axis of symmetry.</p>
          <p>Vertex: ({vertex[0]}, {vertex[1]})</p>
          <p>Y-intercept: ({yIntercept[0]}, {yIntercept[1]})</p>
        </div>
        {mode === 'guided' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-gray-900">
            <p>Reflect the y-intercept across the axis of symmetry x = {vertex[0]}.</p>
          </div>
        )}
        <GraphingCanvas
          domain={domain ?? [-10, 10]}
          range={range ?? [-10, 10]}
          functions={[]}
          points={placedPoints}
          onPointAdd={handlePointAdd}
          onPointRemove={handlePointRemove}
          readonly={false}
          snapToGrid
        />
        <form className="space-y-4" onSubmit={handleSymmetrySubmit}>
          <button
            className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={!canSubmit}
          >
            Submit graph
          </button>
        </form>
      </div>
    );
  }

  if (responseVariant === 'maximum_value') {
    if (mode === 'teaching') {
      return <GraphingExplorer
        activityId={activityId}
        mode={mode}
        variant={variant}
        equation={equation}
        domain={domain}
        range={range}
        points={points}
        comparisonEquation={comparisonEquation}
        comparisonQuestion={comparisonQuestion}
        comparisonAnswer={comparisonAnswer}
        linearEquation={linearEquation}
        onSubmit={handleSubmit}
      />;
    }

    const fieldPrefix = `graphing-maximum-value-${activityId.replace(/[^a-zA-Z0-9_-]/g, '-')}-${instanceId.replace(/:/g, '')}`;
    const parsedMaximum = Number(maximumAnswer);
    const canSubmit = maximumAnswer.trim() !== '' && Number.isFinite(parsedMaximum);

    const handleMaximumSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit) return;

      const envelope: PracticeSubmissionEnvelope = {
        contractVersion: 'practice.v1',
        activityId: toConvexActivityId(activityId),
        mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: new Date().toISOString(),
        answers: { maximum_value: parsedMaximum },
        parts: [{ partId: 'maximum_value', rawAnswer: parsedMaximum }],
        artifact: {
          graphState: {
            equation,
            domain: domain ?? [-10, 10],
            range: range ?? [-10, 10],
          },
        },
      };

      handleSubmit(envelope);
    };

    return (
      <div className="space-y-6">
        <GraphingCanvas
          domain={domain ?? [-10, 10]}
          range={range ?? [-10, 10]}
          functions={[{ expression: equation, color: '#3b82f6' }]}
          points={[]}
          readonly
        />

        {mode === 'guided' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-gray-900">
            <p>Find the highest point on the graph. Use its y-coordinate.</p>
          </div>
        )}

        <form
          className="space-y-4 rounded-lg border border-border bg-card p-5 text-foreground"
          onSubmit={handleMaximumSubmit}
        >
          <label className="block space-y-1 text-sm font-medium" htmlFor={`${fieldPrefix}-maximum`}>
            Maximum value
            <input
              id={`${fieldPrefix}-maximum`}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              inputMode="decimal"
              step="any"
              type="number"
              value={maximumAnswer}
              onChange={(event) => setMaximumAnswer(event.target.value)}
            />
          </label>

          <button
            className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={!canSubmit}
          >
            Submit answer
          </button>
        </form>
      </div>
    );
  }

  if (responseVariant === 'domain_range') {
    if (mode === 'teaching') {
      return <GraphingExplorer
        activityId={activityId}
        mode={mode}
        variant={variant}
        equation={equation}
        domain={domain}
        range={range}
        points={points}
        comparisonEquation={comparisonEquation}
        comparisonQuestion={comparisonQuestion}
        comparisonAnswer={comparisonAnswer}
        linearEquation={linearEquation}
        onSubmit={handleSubmit}
      />;
    }

    const fieldPrefix = `graphing-domain-range-${activityId.replace(/[^a-zA-Z0-9_-]/g, '-')}-${instanceId.replace(/:/g, '')}`;
    const hasValidRange = (
      (rangeRelation === 'gte' || rangeRelation === 'lte')
      && rangeBoundary.trim() !== ''
      && Number.isFinite(Number(rangeBoundary))
    );
    const canSubmit = domainAnswer === 'all_real_numbers' && hasValidRange;

    const handleDomainRangeSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSubmit || (rangeRelation !== 'gte' && rangeRelation !== 'lte')) return;

      const envelope: PracticeSubmissionEnvelope = {
        contractVersion: 'practice.v1',
        activityId: toConvexActivityId(activityId),
        mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
        status: 'submitted',
        attemptNumber: 1,
        submittedAt: new Date().toISOString(),
        answers: {
          domain: domainAnswer,
          range: { relation: rangeRelation, boundary: Number(rangeBoundary) },
        },
        parts: [
          { partId: 'domain', rawAnswer: domainAnswer },
          { partId: 'range', rawAnswer: { relation: rangeRelation, boundary: Number(rangeBoundary) } },
        ],
        artifact: {
          graphState: {
            equation,
            domain: domain ?? [-10, 10],
            range: range ?? [-10, 10],
          },
        },
      };

      handleSubmit(envelope);
    };

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-gray-900" data-testid="domain-range-equation">
            <InlineMath math={equation} />
          </p>
        </div>

        <GraphingCanvas
          domain={domain ?? [-10, 10]}
          range={range ?? [-10, 10]}
          functions={[{ expression: equation, color: '#3b82f6' }]}
          points={[]}
          readonly
        />

        {mode === 'guided' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-gray-900">
            <p>A quadratic has an all-real domain. Its vertex supplies the lower or upper range bound.</p>
          </div>
        )}

        <form
          className="space-y-4 rounded-lg border border-border bg-card p-5 text-foreground"
          onSubmit={handleDomainRangeSubmit}
        >
          <label className="block space-y-1 text-sm font-medium" htmlFor={`${fieldPrefix}-domain`}>
            Domain
            <select
              id={`${fieldPrefix}-domain`}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              value={domainAnswer}
              onChange={(event) => setDomainAnswer(event.target.value)}
            >
              <option value="">Select domain</option>
              <option value="all_real_numbers">All real numbers</option>
            </select>
          </label>

          <label className="block space-y-1 text-sm font-medium" htmlFor={`${fieldPrefix}-relation`}>
            Range relation
            <select
              id={`${fieldPrefix}-relation`}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              value={rangeRelation}
              onChange={(event) => setRangeRelation(event.target.value as 'gte' | 'lte' | '')}
            >
              <option value="">Select relation</option>
              <option value="gte">Greater than or equal to</option>
              <option value="lte">Less than or equal to</option>
            </select>
          </label>

          <label className="block space-y-1 text-sm font-medium" htmlFor={`${fieldPrefix}-boundary`}>
            Range boundary
            <input
              id={`${fieldPrefix}-boundary`}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              inputMode="decimal"
              step="any"
              type="number"
              value={rangeBoundary}
              onChange={(event) => setRangeBoundary(event.target.value)}
            />
          </label>

          <button
            className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={!canSubmit}
          >
            Submit answer
          </button>
        </form>
      </div>
    );
  }

  if (responseVariant === 'compare_maximums') {
    const firstCoefficients = parseQuadratic(equation);
    const secondCoefficients = comparisonEquation ? parseQuadratic(comparisonEquation) : null;
    const secondVertexX = secondCoefficients ? -secondCoefficients.b / (2 * secondCoefficients.a) : Number.NaN;
    const secondVertexY = secondCoefficients
      ? secondCoefficients.c - (secondCoefficients.b * secondCoefficients.b) / (4 * secondCoefficients.a)
      : Number.NaN;
    const hasValidSource = Boolean(
      comparisonEquation
      && comparisonQuestion
      && (comparisonAnswer === 'first' || comparisonAnswer === 'second')
      && firstCoefficients
      && firstCoefficients.a < 0
      && secondCoefficients
      && secondCoefficients.a < 0
      && vertex
      && vertex.length === 2
      && Number.isFinite(vertex[0])
      && Number.isFinite(vertex[1])
      && yIntercept
      && yIntercept.length === 2
      && Number.isFinite(yIntercept[0])
      && Number.isFinite(yIntercept[1])
      && yIntercept[0] === 0
      && Math.abs(vertex[0] - secondVertexX) < 1e-9
      && Math.abs(vertex[1] - secondVertexY) < 1e-9
      && Math.abs(yIntercept[1] - secondCoefficients.c) < 1e-9
    );

    if (!hasValidSource || !vertex || !yIntercept || !comparisonQuestion || !comparisonAnswer || !comparisonEquation || !firstCoefficients || !secondCoefficients) {
      return <p role="status">Compare-maximum activity is unavailable until valid source data is provided.</p>;
    }

    if (mode !== 'teaching') {
      const handleCompareMaximumSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (comparisonSelection === '') return;

        const envelope: PracticeSubmissionEnvelope = {
          contractVersion: 'practice.v1',
          activityId: toConvexActivityId(activityId),
          mode: mode === 'guided' ? 'guided_practice' : 'independent_practice',
          status: 'submitted',
          attemptNumber: 1,
          submittedAt: new Date().toISOString(),
          answers: { greater_maximum: comparisonSelection },
          parts: [{ partId: 'greater_maximum', rawAnswer: comparisonSelection }],
        };

        handleSubmit(envelope);
      };

      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Compare Maximum Values</h2>
            <p>{comparisonQuestion}</p>
            <p>Vertex of g: ({vertex[0]}, {vertex[1]})</p>
            <p>Y-intercept of g: ({yIntercept[0]}, {yIntercept[1]})</p>
          </div>
          {mode === 'guided' && (
            <p>Find the highest point on the graph for f. Use the y-coordinate of g&apos;s vertex as its maximum.</p>
          )}
          <GraphingCanvas
            domain={domain ?? [-10, 10]}
            range={range ?? [-10, 10]}
            functions={[{ expression: equation, color: '#3b82f6' }]}
            points={[]}
            readonly
          />
          <form className="space-y-4" onSubmit={handleCompareMaximumSubmit}>
            <fieldset className="space-y-2">
              <legend className="font-medium">Which function has the greater maximum value?</legend>
              <label className="block">
                <input
                  type="radio"
                  name={`compare-maximum-${instanceId}`}
                  value="first"
                  checked={comparisonSelection === 'first'}
                  onChange={() => setComparisonSelection('first')}
                />
                {' '}f(x)
              </label>
              <label className="block">
                <input
                  type="radio"
                  name={`compare-maximum-${instanceId}`}
                  value="second"
                  checked={comparisonSelection === 'second'}
                  onChange={() => setComparisonSelection('second')}
                />
                {' '}g(x)
              </label>
            </fieldset>
            <button
              className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={comparisonSelection === ''}
            >
              Submit answer
            </button>
          </form>
        </div>
      );
    }

    const firstMaximum = firstCoefficients.c - (firstCoefficients.b * firstCoefficients.b) / (4 * firstCoefficients.a);
    const comparisonOperator = firstMaximum > secondVertexY ? '>' : '<';
    const greaterFunction = firstMaximum > secondVertexY ? 'f(x)' : 'g(x)';
    const reflectedPoint: [number, number] = [2 * vertex[0] - yIntercept[0], yIntercept[1]];

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Compare Maximum Values</h2>
          <p>{comparisonQuestion}</p>
        </div>
        <h3 className="text-lg font-semibold">Graph of f(x)</h3>
        <GraphingCanvas
          domain={domain ?? [-10, 10]}
          range={range ?? [-10, 10]}
          functions={[{ expression: equation, color: '#3b82f6' }]}
          points={[]}
          readonly
        />
        <ol className="list-decimal space-y-1 pl-5">
          <li>From the graph, f(x) has a maximum value of {firstMaximum}.</li>
          <li>The vertex of g is ({vertex[0]}, {vertex[1]}), so its axis of symmetry is x = {vertex[0]}.</li>
          <li>Plot the y-intercept ({yIntercept[0]}, {yIntercept[1]}). Reflect it across x = {vertex[0]} to get ({reflectedPoint[0]}, {reflectedPoint[1]}).</li>
          <li>Connect the three points with a smooth downward-opening curve. The maximum value of g is {vertex[1]}.</li>
          <li>Since {firstMaximum} {comparisonOperator} {secondVertexY}, {greaterFunction} has the greater maximum value.</li>
        </ol>
        <h3 className="text-lg font-semibold">Completed graph of g(x)</h3>
        <GraphingCanvas
          domain={domain ?? [-10, 10]}
          range={range ?? [-10, 10]}
          functions={[{ expression: comparisonEquation, color: '#ef4444' }]}
          points={[
            { x: vertex[0], y: vertex[1] },
            { x: yIntercept[0], y: yIntercept[1] },
            { x: reflectedPoint[0], y: reflectedPoint[1] },
          ]}
          readonly
        />
      </div>
    );
  }

  return <GraphingExplorer
    activityId={activityId}
    mode={mode}
    variant={variant}
    equation={equation}
    domain={domain}
    range={range}
    points={points}
    comparisonEquation={comparisonEquation}
    comparisonQuestion={comparisonQuestion}
    comparisonAnswer={comparisonAnswer}
    linearEquation={linearEquation}
    responseVariant={responseVariant}
    onSubmit={responseVariant === 'table_graph' ? async (payload) => {
      if (!onSubmit) throw new Error('Missing submission handler');
      await onSubmit(payload);
      onComplete?.();
    } : handleSubmit}
  />;
}
