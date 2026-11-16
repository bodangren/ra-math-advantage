'use client';

import { Suspense, createElement } from 'react';
import { AlertTriangle, Loader2, Monitor, Send } from 'lucide-react';
import { getActivityComponent } from '@math-platform/activity-components/registry';
import { getPropsSchema } from '@math-platform/activity-components/schemas';
import type { ProjectedActivity } from '@math-platform/knowledge-space-practice';
import { ensureActivitiesRegistered } from './register-activities';
import type { HarnessState, SkillNode, SubmissionEntry } from '../types';

interface RendererPreviewProps {
  state: HarnessState;
  selectedNode: SkillNode | null;
  activity: ProjectedActivity | null;
  onIntercept: (entry: SubmissionEntry) => void;
}

export interface StudentPreviewProblem {
  summary: string;
  details: string[];
}

function formatIssuePath(path: PropertyKey[]): string {
  return path.length === 0 ? 'props' : path.map(String).join('.');
}

export function getStudentPreviewProblem(
  activity: ProjectedActivity | null,
): StudentPreviewProblem | null {
  if (!activity) {
    return {
      summary: 'The activity projection is missing for this modality.',
      details: [],
    };
  }

  const schema = getPropsSchema(activity.rendererKey);
  if (!schema) {
    return {
      summary: `No runtime prop schema exists for ${activity.rendererKey}.`,
      details: [],
    };
  }

  const parsed = schema.safeParse(activity.props);
  if (!parsed.success) {
    return {
      summary: `The projected props do not match ${activity.rendererKey}.`,
      details: parsed.error.issues.map(
        (issue) => `${formatIssuePath(issue.path)}: ${issue.message}`,
      ),
    };
  }

  ensureActivitiesRegistered();
  if (!getActivityComponent(activity.rendererKey)) {
    return {
      summary: `The ${activity.rendererKey} student component is not registered.`,
      details: [],
    };
  }

  return null;
}

function runtimeMode(mode: ProjectedActivity['mode']): 'teaching' | 'guided' | 'practice' {
  if (mode === 'worked_example') return 'teaching';
  if (mode === 'guided_practice') return 'guided';
  return 'practice';
}

export function RendererPreview({
  state,
  selectedNode,
  activity,
  onIntercept,
}: RendererPreviewProps) {
  const problem = selectedNode ? getStudentPreviewProblem(activity) : null;
  const activityComponent = problem || !activity
    ? null
    : getActivityComponent(activity.rendererKey);

  const handleSubmit = (payload: unknown) => {
    onIntercept({ partId: 'submission', rawAnswer: payload, isCorrect: false });
  };

  const handleComplete = () => {
    return undefined;
  };

  return (
    <div className="space-y-4 border border-[#8A958E] bg-[#EEEADF] p-4 text-[#0A1C1A]">
      <div className="flex items-center gap-2">
        <Monitor className="size-4 text-[#365451]" aria-hidden="true" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Student view</h2>
      </div>

      {!selectedNode ? (
        <p className="text-sm text-[#365451]">Select a skill to preview its student component.</p>
      ) : problem ? (
        <div role="alert" className="flex items-start gap-2 border border-amber-500 bg-amber-50 p-3 text-amber-950">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-semibold">Student view unavailable</p>
            <p className="mt-1">{problem.summary}</p>
            {problem.details.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5 font-mono text-xs">
                {problem.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>
            )}
          </div>
        </div>
      ) : activity && activityComponent ? (
        <div>
          <p className="mb-2 text-xs text-[#365451]">
            Component: <code className="font-mono font-semibold">{activity.rendererKey}</code>
          </p>
          <div data-testid="student-view" className="rounded-lg border border-border bg-background p-4 text-foreground">
            <Suspense fallback={(
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Loading student component…
              </div>
            )}>
              {createElement(activityComponent, {
                key: activity.stableActivityId,
                ...activity.props,
                activityId: activity.stableActivityId,
                stableActivityId: activity.stableActivityId,
                mode: runtimeMode(activity.mode),
                onSubmit: handleSubmit,
                onComplete: handleComplete,
              })}
            </Suspense>
          </div>
        </div>
      ) : null}

      {state.lastSubmission && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Send className="size-3 text-[#365451]" aria-hidden="true" />
            <h3 className="text-xs font-semibold">Submission log</h3>
          </div>
          <div className="bg-white p-3 text-[#0A1C1A]">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs text-[#365451]">Part:</span>
              <code className="bg-[#EEEADF] px-1.5 text-xs font-mono">
                {state.lastSubmission.partId}
              </code>
              <span className="ml-auto bg-[#DCE9E0] px-2 py-0.5 text-xs font-semibold text-[#1E6238]">
                Captured
              </span>
            </div>
            <pre className="max-h-32 overflow-auto bg-[#EEEADF] p-2 text-xs text-[#0A1C1A]">
              {JSON.stringify({
                rawAnswer: state.lastSubmission.rawAnswer,
                partId: state.lastSubmission.partId,
              }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
