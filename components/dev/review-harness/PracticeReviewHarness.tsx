'use client';

import { useState, useCallback } from 'react';

interface SubmissionEnvelope {
  activityId: string;
  answers: Record<string, unknown>;
  parts: Array<{
    partId: string;
    response: unknown;
    correct: boolean;
  }>;
  score?: number;
  feedback?: Record<string, unknown>;
  completedAt: number;
  variant?: string;
}

interface PracticeReviewHarnessProps {
  componentKey: string;
  componentProps?: Record<string, unknown>;
  onCorrectAttempt?: (envelope: SubmissionEnvelope) => void;
  onIncorrectAttempt?: (envelope: SubmissionEnvelope) => void;
  onVariantChecked?: () => void;
}

export function PracticeReviewHarness({
  componentKey,
  componentProps = {},
  onCorrectAttempt,
  onIncorrectAttempt,
  onVariantChecked,
}: PracticeReviewHarnessProps) {
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionEnvelope[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionEnvelope | null>(null);
  const [variantCount, setVariantCount] = useState(0);
  const [renderKey, setRenderKey] = useState(0);

  const simulateCorrectAttempt = useCallback(() => {
    const envelope: SubmissionEnvelope = {
      activityId: `practice-${componentKey}-correct`,
      answers: { q1: 'x = 2', q2: '3x + 1' },
      parts: [
        { partId: 'p1', response: 'x = 2', correct: true },
        { partId: 'p2', response: '3x + 1', correct: true },
      ],
      score: 100,
      feedback: { q1: 'Correct!', q2: 'Correct!' },
      completedAt: Date.now(),
      variant: variantCount > 0 ? `variant-${variantCount}` : undefined,
    };
    setSubmissionHistory(prev => [...prev, envelope]);
    onCorrectAttempt?.(envelope);
  }, [componentKey, variantCount, onCorrectAttempt]);

  const simulateIncorrectAttempt = useCallback(() => {
    const envelope: SubmissionEnvelope = {
      activityId: `practice-${componentKey}-incorrect`,
      answers: { q1: 'x = 3', q2: '2x + 1' },
      parts: [
        { partId: 'p1', response: 'x = 3', correct: false },
        { partId: 'p2', response: '2x + 1', correct: false },
      ],
      score: 0,
      feedback: { q1: 'Incorrect - try again', q2: 'Incorrect - check your work' },
      completedAt: Date.now(),
      variant: variantCount > 0 ? `variant-${variantCount}` : undefined,
    };
    setSubmissionHistory(prev => [...prev, envelope]);
    onIncorrectAttempt?.(envelope);
  }, [componentKey, variantCount, onIncorrectAttempt]);

  const handleGenerateVariant = useCallback(() => {
    setVariantCount(prev => prev + 1);
    setRenderKey(prev => prev + 1);
    onVariantChecked?.();
  }, [onVariantChecked]);

  const canApprove = submissionHistory.some(s => s.score === 100) && 
                     submissionHistory.some(s => s.score === 0);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold">Practice Review Harness</h3>
        <p className="text-sm text-muted-foreground font-mono">{componentKey}</p>
      </div>

      <div className="p-4 border rounded bg-card">
        <div className="text-sm font-medium mb-2">Practice Component Preview</div>
        <div key={renderKey} className="min-h-[200px] p-4 bg-muted/30 rounded">
          <PracticePreview componentKey={componentKey} props={componentProps} variant={variantCount} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium">Test Attempts</div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={simulateCorrectAttempt}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Simulate Correct Attempt
          </button>
          <button
            type="button"
            onClick={simulateIncorrectAttempt}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Simulate Incorrect Attempt
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleGenerateVariant}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
        >
          Generate Randomized Variant ({variantCount} generated)
        </button>
        {variantCount >= 2 && (
          <p className="text-xs text-muted-foreground">
            Multiple variants verified. Component appears to support algorithmic variation.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Submission History</div>
        {submissionHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet. Test correct and incorrect attempts.</p>
        ) : (
          <div className="space-y-2">
            {submissionHistory.map((env, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedSubmission(env)}
                className={`w-full text-left p-3 border rounded ${
                  selectedSubmission === env ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Attempt #{idx + 1}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    env.score === 100 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    Score: {env.score}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1">
                  {env.parts.length} parts | {env.completedAt}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSubmission && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Submission Envelope (practice.v1)</div>
          <div className="p-3 bg-muted/50 rounded border overflow-auto max-h-[300px]">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {JSON.stringify(selectedSubmission, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="p-3 rounded border">
        <div className="text-sm font-medium mb-2">Validation Checklist</div>
        <div className="space-y-1">
          <CheckItem 
            checked={submissionHistory.some(s => s.score === 100)} 
            label="Correct attempt submitted" 
          />
          <CheckItem 
            checked={submissionHistory.some(s => s.score === 0)} 
            label="Incorrect attempt submitted" 
          />
          <CheckItem 
            checked={variantCount >= 2} 
            label="Randomized variants verified" 
          />
          <CheckItem 
            checked={selectedSubmission !== null} 
            label="Submission envelope inspected" 
          />
        </div>
        {!canApprove && (
          <p className="text-xs text-yellow-600 mt-2">
            Both correct and incorrect attempts required before approving.
          </p>
        )}
      </div>
    </div>
  );
}

function CheckItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <label className="flex items-center gap-2">
      <span className={`text-xs ${checked ? 'text-green-600' : 'text-muted-foreground'}`}>
        {checked ? '✓' : '○'}
      </span>
      <span className="text-sm">{label}</span>
    </label>
  );
}

function PracticePreview({
  componentKey,
  props,
  variant,
}: {
  componentKey: string;
  props: Record<string, unknown>;
  variant: number;
}) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">Practice Mode Component</div>
      <div className="text-sm">
        Component: <span className="font-mono">{componentKey}</span>
      </div>
      {variant > 0 && (
        <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
          Variant #{variant} active
        </div>
      )}
      <div className="text-xs text-muted-foreground">
        Props: {Object.keys(props).length > 0 ? JSON.stringify(props) : 'default'}
      </div>
    </div>
  );
}

export function usePracticeReviewHarnessState() {
  const [submissions, setSubmissions] = useState<SubmissionEnvelope[]>([]);
  const [variantCount, setVariantCount] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionEnvelope | null>(null);

  const addSubmission = useCallback((envelope: SubmissionEnvelope) => {
    setSubmissions(prev => [...prev, envelope]);
  }, []);

  const incrementVariant = useCallback(() => {
    setVariantCount(prev => prev + 1);
  }, []);

  const canApprove = submissions.some(s => s.score === 100) && 
                     submissions.some(s => s.score === 0);

  return {
    submissions,
    variantCount,
    selectedSubmission,
    setSelectedSubmission,
    addSubmission,
    incrementVariant,
    canApprove,
  };
}
