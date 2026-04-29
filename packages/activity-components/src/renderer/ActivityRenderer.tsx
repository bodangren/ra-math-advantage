'use client';

import { useCallback, Suspense } from 'react';
import { getActivityComponent } from '../registry/index';
import {
  practiceSubmissionEnvelopeSchema,
  type PracticeSubmissionEnvelope,
  type PracticeTimingSummary,
} from '@math-platform/practice-core/contract';

export interface UseActivityTimingReturn {
  getTiming: () => PracticeTimingSummary | null;
}

export interface ActivityRendererProps {
  componentKey: string;
  activityId: string;
  lessonId?: string;
  phaseNumber?: number;
  mode?: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
  /** Optional timing hook for student contexts. When provided, injects timing into submissions. */
  useTiming?: () => UseActivityTimingReturn;
}

/**
 * Delegates to the activity registry by componentKey.
 * Shows a placeholder if the component is not yet registered.
 * In student contexts (mode !== 'teaching'), injects timing telemetry
 * into practice.v1 submission envelopes when a timing hook is provided.
 */
export function ActivityRenderer({
  componentKey,
  activityId,
  mode = 'practice',
  onSubmit,
  onComplete,
  useTiming,
}: ActivityRendererProps) {
  const isStudentContext = mode !== 'teaching';
  const timingHook = useTiming?.();

  const handleSubmit = useCallback(
    (payload: unknown) => {
      const parsed = practiceSubmissionEnvelopeSchema.safeParse(payload);
      if (isStudentContext && parsed.success && !parsed.data.timing && timingHook) {
        const timing = timingHook.getTiming();
        if (timing) {
          const timedPayload: PracticeSubmissionEnvelope = {
            ...parsed.data,
            timing,
          };
          onSubmit?.(timedPayload);
          return;
        }
      }
      onSubmit?.(payload);
    },
    [isStudentContext, timingHook, onSubmit],
  );

  const ActivityComponent = getActivityComponent(componentKey);

  if (!ActivityComponent) {
    return (
      <div className="my-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-700">
          Activity <code className="font-mono text-xs">{componentKey}</code> is not yet available.
        </p>
      </div>
    );
  }

  return (
    <div className="my-4">
      <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading activity…</div>}>
        <ActivityComponent
          activityId={activityId}
          mode={mode}
          onSubmit={handleSubmit}
          onComplete={onComplete}
        />
      </Suspense>
    </div>
  );
}
