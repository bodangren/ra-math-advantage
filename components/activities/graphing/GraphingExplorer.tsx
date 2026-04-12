'use client';

import React, { useState, useCallback } from 'react';
import { GraphingCanvas, Point, FunctionPlot } from './GraphingCanvas';
import { InteractiveTableOfValues } from './InteractiveTableOfValues';
import { HintPanel, HintData } from './HintPanel';
import { InterceptIdentification, InterceptData } from './InterceptIdentification';

export interface GraphingExplorerProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: PracticeSubmissionEnvelope) => void;
  variant?: 'plot_from_equation' | 'compare_functions' | 'find_intercepts' | 'graph_system';
  equation: string;
  domain?: [number, number];
  range?: [number, number];
  points?: [number, number][];
  comparisonEquation?: string;
  comparisonQuestion?: string;
  comparisonAnswer?: 'first' | 'second';
}

interface PracticeSubmissionEnvelope {
  contractVersion: 'practice.v1';
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  attemptNumber: number;
  submittedAt: string;
  answers: Record<string, unknown>;
  parts: Array<{
    partId: string;
    rawAnswer: unknown;
    normalizedAnswer?: string;
    isCorrect?: boolean;
    score?: number;
    maxScore?: number;
    misconceptionTags?: string[];
    hintsUsed?: number;
    revealStepsSeen?: number;
    changedCount?: number;
  }>;
  artifact?: Record<string, unknown>;
  interactionHistory?: Array<{
    type: string;
    timestamp: number;
    data?: unknown;
  }>;
  analytics?: Record<string, unknown>;
  studentFeedback?: string;
  teacherSummary?: string;
}

const DEFAULT_DOMAIN: [number, number] = [-10, 10];
const DEFAULT_RANGE: [number, number] = [-10, 10];

export function GraphingExplorer({
  activityId,
  mode,
  onSubmit,
  variant = 'plot_from_equation',
  equation,
  domain = DEFAULT_DOMAIN,
  range = DEFAULT_RANGE,
  points: initialPoints = [],
  comparisonEquation,
  comparisonQuestion,
  comparisonAnswer,
}: GraphingExplorerProps) {
  const [placedPoints, setPlacedPoints] = useState<Point[]>([]);
  const [tableComplete, setTableComplete] = useState(false);
  const [hints, setHints] = useState<HintData[]>([]);
  const [intercepts, setIntercepts] = useState<InterceptData[]>([]);
  const [interactionHistory, setInteractionHistory] = useState<Array<{ type: string; timestamp: number; data?: unknown }>>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [comparisonAnswerSelected, setComparisonAnswerSelected] = useState<'first' | 'second' | null>(null);
  const [showComparisonFeedback, setShowComparisonFeedback] = useState(false);

  const addInteraction = useCallback((type: string, data?: unknown) => {
    setInteractionHistory(prev => [...prev, { type, timestamp: Date.now(), data }]);
  }, []);

  const handlePointAdd = useCallback((point: Point) => {
    setPlacedPoints(prev => [...prev, { ...point, label: `${point.x.toFixed(1)}, ${point.y.toFixed(1)}` }]);
    addInteraction('point_placed', point);
  }, [addInteraction]);

  const handlePointRemove = useCallback((label: string) => {
    setPlacedPoints(prev => prev.filter(p => p.label !== label));
    addInteraction('point_removed', { label });
  }, [addInteraction]);

  const handleTableComplete = useCallback((points: Array<{ x: number; y: number }>) => {
    setTableComplete(true);
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

  const handleSubmit = useCallback(() => {
    if (!onSubmit) return;

    const parts = [
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

    const envelope: PracticeSubmissionEnvelope = {
      contractVersion: 'practice.v1',
      activityId,
      mode,
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers,
      parts,
      artifact: {
        graphState: {
          equation,
          comparisonEquation,
          domain,
          range,
          placedPoints,
          intercepts,
        },
      },
      interactionHistory,
    };

    onSubmit(envelope);
    setShowSolution(true);
    setShowComparisonFeedback(true);
  }, [activityId, mode, onSubmit, placedPoints, intercepts, hints, interactionHistory, equation, comparisonEquation, domain, range, assessPointsCorrectness, assessInterceptsCorrectness, variant, comparisonAnswerSelected, assessComparisonCorrectness]);

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          {variant === 'compare_functions' ? 'Compare the Functions' : 'Graph the Function'}
        </h2>
        <p className="text-muted-foreground">
          {equation}
          {variant === 'compare_functions' && comparisonEquation && (
            <>
              <br />
              {comparisonEquation}
            </>
          )}
        </p>
      </div>

      {isGuided && !tableComplete && (
        <InteractiveTableOfValues
          xValues={[-2, -1, 0, 1, 2]}
          functionExpression={equation}
          onTableComplete={handleTableComplete}
          readonly={isTeaching}
        />
      )}

      {isGuided && tableComplete && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-green-800 text-sm">Great! Now plot the points on the graph.</p>
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
        functions={functions}
        points={[...preSetPoints, ...placedPoints]}
        onPointAdd={(!isTeaching && (isPractice || tableComplete)) ? handlePointAdd : undefined}
        onPointRemove={(!isTeaching && (isPractice || tableComplete)) ? handlePointRemove : undefined}
        readonly={isTeaching}
        snapToGrid={isGuided}
      />

      {isGuided && tableComplete && (
        <InterceptIdentification
          functionExpression={equation}
          onInterceptIdentified={handleInterceptIdentified}
          readonly={isTeaching}
        />
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
        (variant === 'compare_functions'
          ? comparisonAnswerSelected
          : isPractice || tableComplete
        ) && (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Submit
          </button>
        )
      )}
    </div>
  );
}
