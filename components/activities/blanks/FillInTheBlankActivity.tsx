'use client';

import { FillInTheBlank } from '@/components/activities/blanks/FillInTheBlank';

export interface FillInTheBlankActivityProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
  template: string;
  blanks: Array<{
    id: string;
    correctAnswer: string;
    isMath?: boolean;
  }>;
}

export function FillInTheBlankActivity({
  activityId,
  mode,
  template,
  blanks,
  onSubmit,
  onComplete,
}: FillInTheBlankActivityProps) {
  const handleSubmit = (payload: unknown) => {
    onSubmit?.(payload);
    onComplete?.();
  };

  return (
    <FillInTheBlank
      activityId={activityId}
      mode={mode}
      template={template}
      blanks={blanks}
      onSubmit={handleSubmit}
      onComplete={onComplete}
    />
  );
}