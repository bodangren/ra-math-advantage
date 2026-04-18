'use client';

import { useCallback } from 'react';
import { getActivityComponent } from '@/lib/activities/registry';
import { usePracticeTiming } from '@/components/practice-timing';
import {
  practiceSubmissionEnvelopeSchema,
  type PracticeSubmissionEnvelope,
} from '@/lib/practice/contract';

export interface ActivityRendererProps {
  componentKey: string;
  activityId: string;
  lessonId?: string;
  phaseNumber?: number;
  mode?: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

/**
 * Delegates to the activity registry by componentKey.
 * Shows a placeholder if the component is not yet registered.
 * In student contexts (mode !== 'teaching'), injects timing telemetry
 * into practice.v1 submission envelopes.
 */
export function ActivityRenderer({
  componentKey,
  activityId,
  mode = 'practice',
  onSubmit,
  onComplete,
}: ActivityRendererProps) {
  const isStudentContext = mode !== 'teaching';
  const { getTiming } = usePracticeTiming();

  const handleSubmit = useCallback(
    (payload: unknown) => {
      const parsed = practiceSubmissionEnvelopeSchema.safeParse(payload);
      if (isStudentContext && parsed.success && !parsed.data.timing) {
        const timing = getTiming();
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
    [isStudentContext, getTiming, onSubmit],
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
      <ActivityComponent
        activityId={activityId}
        mode={mode}
        onSubmit={handleSubmit}
        onComplete={onComplete}
      />
    </div>
  );
}
