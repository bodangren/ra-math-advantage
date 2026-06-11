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

/**
 * Renders a fill-in-the-blank activity with a template, blanks, and optional word bank.
 *
 * @param props - Activity configuration with template and blank definitions.
 * @returns A fill-in-the-blank activity.
 */
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
    <div data-testid="fill-in-the-blank">
      <FillInTheBlank
        activityId={activityId}
        mode={mode}
        template={template}
        blanks={blanks}
        wordBank={wordBank}
        onSubmit={handleSubmit}
        onComplete={onComplete}
      />
    </div>
  );
}
