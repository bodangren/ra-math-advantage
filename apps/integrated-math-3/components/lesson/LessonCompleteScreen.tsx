'use client';

import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LessonCompleteScreenProps {
  lessonTitle: string;
  lessonNumber: number;
  phasesCompleted: number;
  totalPhases: number;
  onContinue: () => void;
  className?: string;
}

export function LessonCompleteScreen({
  lessonTitle,
  lessonNumber,
  phasesCompleted,
  totalPhases,
  onContinue,
  className,
}: LessonCompleteScreenProps) {
  const isFullyComplete = phasesCompleted === totalPhases;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-6 py-12 text-center',
        className
      )}
      data-testid="lesson-complete-screen"
    >
      <CheckCircle2 className="h-16 w-16 text-green-500" />

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Lesson {lessonNumber} Complete!</h2>
        <p className="text-lg font-medium text-foreground">{lessonTitle}</p>
      </div>

      <div className="space-y-1 text-muted-foreground">
        <p>{phasesCompleted} / {totalPhases} phases completed</p>
        {isFullyComplete && (
          <p className="text-green-600 font-medium">All phases complete!</p>
        )}
      </div>

      <Button
        type="button"
        onClick={onContinue}
        className="mt-4"
        data-testid="lesson-complete-continue-btn"
      >
        Continue
        <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
