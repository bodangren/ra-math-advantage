'use client';

import { FillInTheBlank } from '@math-platform/activity-components/blanks';

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
  wordBank?: Array<{
    id: string;
    text: string;
  }>;
}

export function FillInTheBlankActivity({
  activityId,
  mode,
  template,
  blanks,
  wordBank,
  onSubmit,
  onComplete,
}: FillInTheBlankActivityProps) {
  const handleSubmit = (payload: unknown) => {
    onSubmit?.(payload);
  };

  return (
    <FillInTheBlank
      activityId={activityId}
      mode={mode}
      template={template}
      blanks={blanks}
      wordBank={wordBank}
      onSubmit={handleSubmit}
      onComplete={onComplete}
    />
  );
}
