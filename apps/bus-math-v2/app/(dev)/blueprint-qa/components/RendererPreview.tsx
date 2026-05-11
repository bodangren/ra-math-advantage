'use client';

import { useMemo, createContext, useContext } from 'react';
import { Monitor, Send, AlertTriangle, Puzzle } from 'lucide-react';
import { getActivityComponent } from '@math-platform/activity-components';
import type { HarnessState, SkillNode, SubmissionEntry } from '../types';
import type { KnowledgeBlueprint, GradingMetadata } from '@math-platform/knowledge-space-practice';

interface RendererPreviewProps {
  state: HarnessState;
  selectedNode: SkillNode | null;
  selectedBlueprint: KnowledgeBlueprint | null;
  onIntercept: (entry: SubmissionEntry) => void;
}

interface MockSubmissionContextValue {
  submit: (partId: string, rawAnswer: unknown) => Promise<{ success: boolean }>;
  isSubmitting: boolean;
}

const MockSubmissionContext = createContext<MockSubmissionContextValue>({
  submit: async () => ({ success: false }),
  isSubmitting: false,
});

export function useMockSubmission() {
  return useContext(MockSubmissionContext);
}

function gradeAnswerLocally(
  rawAnswer: unknown,
  expected: unknown,
  rule: 'exact_match' | 'numeric_tolerance' | 'expression_equivalence',
  tolerance?: number,
): boolean {
  if (rule === 'exact_match') {
    return String(rawAnswer).trim() === String(expected).trim();
  }
  if (rule === 'numeric_tolerance') {
    const numAnswer = Number(rawAnswer);
    const numExpected = Number(expected);
    if (isNaN(numAnswer) || isNaN(numExpected)) return false;
    const tol = tolerance ?? 0.01;
    return Math.abs(numAnswer - numExpected) <= tol;
  }
  if (rule === 'expression_equivalence') {
    return String(rawAnswer).replace(/\s+/g, '') === String(expected).replace(/\s+/g, '');
  }
  return false;
}

export function RendererPreview({ state, selectedNode, selectedBlueprint, onIntercept }: RendererPreviewProps) {
  const gradingMetadata = (state.generatorOutput?.gradingMetadata ?? null) as GradingMetadata | null;

  const mockContext = useMemo<MockSubmissionContextValue>(
    () => ({
      isSubmitting: false,
      submit: async (partId: string, rawAnswer: unknown) => {
        if (!gradingMetadata) {
          onIntercept({ partId, rawAnswer, isCorrect: false });
          return { success: true };
        }
        const expected = gradingMetadata.partAnswers[partId];
        const rule = gradingMetadata.partGradingRules[partId] ?? 'exact_match';
        const tolerance = gradingMetadata.partTolerances?.[partId];
        const isCorrect = gradeAnswerLocally(rawAnswer, expected, rule, tolerance);
        onIntercept({ partId, rawAnswer, isCorrect });
        return { success: true };
      },
    }),
    [gradingMetadata, onIntercept],
  );

  const rendererKey = selectedBlueprint?.rendererKey ?? selectedNode?.rendererKey ?? null;
  const Component = rendererKey ? getActivityComponent(rendererKey) : null;
  const hasOutput = !!state.generatorOutput;
  const componentProps = hasOutput ? (state.generatorOutput?.data as Record<string, unknown> ?? {}) : {};

  return (
    <div className="space-y-4 rounded-2xl border bg-white/90 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Monitor className="size-4 text-slate-400" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Preview</h2>
      </div>

      {!selectedNode ? (
        <p className="text-xs text-slate-400">Select a skill to preview its component.</p>
      ) : !rendererKey ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <AlertTriangle className="size-4 shrink-0 text-amber-500 mt-0.5" />
          <p className="text-xs text-amber-700">No renderer key assigned.</p>
        </div>
      ) : !Component ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <Puzzle className="size-4 shrink-0 text-red-500 mt-0.5" />
          <p className="text-xs text-red-700">
            Component <code className="rounded bg-red-100 px-1 font-mono">{rendererKey}</code> not registered in the activity components registry.
          </p>
        </div>
      ) : !hasOutput ? (
        <p className="text-xs text-slate-400">Generate output first to preview the component.</p>
      ) : (
        <MockSubmissionContext.Provider value={mockContext}>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Renderer:</span>
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">
                {rendererKey}
              </code>
            </div>
            <Component {...componentProps} />
          </div>
        </MockSubmissionContext.Provider>
      )}

      {state.lastSubmission && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Send className="size-3 text-slate-400" />
            <h3 className="text-xs font-semibold text-slate-600">Submission Log</h3>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs text-slate-500">Part:</span>
              <code className="rounded bg-slate-200 px-1.5 text-xs font-mono">
                {state.lastSubmission.partId}
              </code>
              <span
                className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${
                  state.lastSubmission.isCorrect
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {state.lastSubmission.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <pre className="max-h-32 overflow-auto rounded bg-slate-100 p-2 text-xs text-slate-700">
              {JSON.stringify({ rawAnswer: state.lastSubmission.rawAnswer, partId: state.lastSubmission.partId, isCorrect: state.lastSubmission.isCorrect }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
