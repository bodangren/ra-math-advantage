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
}: GraphingExplorerProps) {
  if (variant !== 'plot_from_equation') {
    console.warn(`GraphingExplorer: variant '${variant}' is not yet implemented. Only 'plot_from_equation' is supported.`);
  }
  const [placedPoints, setPlacedPoints] = useState<Point[]>([]);
  const [tableComplete, setTableComplete] = useState(false);
  const [hints, setHints] = useState<HintData[]>([]);
  const [intercepts, setIntercepts] = useState<InterceptData[]>([]);
  const [interactionHistory, setInteractionHistory] = useState<Array<{ type: string; timestamp: number; data?: unknown }>>([]);
  const [showSolution, setShowSolution] = useState(false);

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

  const handleSubmit = useCallback(() => {
    if (!onSubmit) return;

    const envelope: PracticeSubmissionEnvelope = {
      contractVersion: 'practice.v1',
      activityId,
      mode,
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers: {
        placedPoints: placedPoints.map(p => ({ x: p.x, y: p.y })),
        intercepts: intercepts,
      },
      parts: [
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
      ],
      artifact: {
        graphState: {
          equation,
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
  }, [activityId, mode, onSubmit, placedPoints, intercepts, hints, interactionHistory, equation, domain, range, assessPointsCorrectness, assessInterceptsCorrectness]);

  const functions: FunctionPlot[] = [
    {
      expression: equation,
      color: '#3b82f6',
    },
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
          Graph the Function
        </h2>
        <p className="text-muted-foreground">
          {equation}
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

      {showSolution && (
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
      )}

      {!isTeaching && (isPractice || tableComplete) && (
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Submit
        </button>
      )}
    </div>
  );
}
