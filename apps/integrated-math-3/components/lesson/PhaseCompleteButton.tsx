'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { completePhaseRequest, skipPhaseRequest } from '@/lib/phase-completion/client';
import { cn } from '@/lib/utils';
import { isSkippable, type PhaseType } from '@/lib/curriculum/phase-types';

type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export interface PhaseCompleteButtonProps {
  lessonId: string;
  phaseNumber: number;
  initialStatus?: ProgressStatus;
  disabled?: boolean;
  className?: string;
  idleLabel?: string;
  completedLabel?: string;
  skippedLabel?: string;
  phaseType?: PhaseType;
  onStatusChange?: (status: ProgressStatus) => void;
}

export function PhaseCompleteButton({
  lessonId,
  phaseNumber,
  initialStatus = 'not_started',
  disabled = false,
  className,
  idleLabel = 'Mark Complete',
  completedLabel = 'Completed',
  skippedLabel = 'Skipped',
  phaseType,
  onStatusChange,
}: PhaseCompleteButtonProps) {
  const [status, setStatus] = useState<ProgressStatus>(initialStatus);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const isCompleted = status === 'completed';
  const isSkipped = status === 'skipped';
  const canSkip = phaseType && isSkippable(phaseType);
  const isDisabled = disabled || isCompleting || isSkipping || isCompleted || isSkipped;

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleComplete = useCallback(async () => {
    if (isDisabled) return;

    setIsCompleting(true);
    setErrorMessage(null);

    try {
      await completePhaseRequest({
        lessonId,
        phaseNumber,
        timeSpent: Math.round((Date.now() - startTimeRef.current) / 1000),
        idempotencyKey: `${lessonId}-${phaseNumber}-${Date.now()}`,
      });

      setStatus('completed');
      onStatusChange?.('completed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save progress. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsCompleting(false);
    }
  }, [isDisabled, lessonId, phaseNumber, onStatusChange]);

  const handleSkip = useCallback(async () => {
    if (isDisabled || !canSkip) return;

    setIsSkipping(true);
    setErrorMessage(null);

    try {
      await skipPhaseRequest({
        lessonId,
        phaseNumber,
        idempotencyKey: `${lessonId}-${phaseNumber}-skip-${Date.now()}`,
      });

      setStatus('skipped');
      onStatusChange?.('skipped');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to skip phase. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSkipping(false);
    }
  }, [isDisabled, canSkip, lessonId, phaseNumber, onStatusChange]);

  return (
    <div className={cn('w-full max-w-sm space-y-2', className)}>
      <Button
        type="button"
        variant={isCompleted ? 'outline' : 'default'}
        aria-pressed={isCompleted}
        disabled={isDisabled}
        onClick={handleComplete}
        className={cn(
          'w-full justify-center font-semibold',
          isCompleted ? 'border-green-300 text-green-700 dark:text-green-300' : '',
        )}
      >
        {isCompleting && <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />}
        {!isCompleting && isCompleted && <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden />}
        {isCompleted ? completedLabel : idleLabel}
      </Button>

      {canSkip && !isCompleted && !isSkipped && (
        <Button
          type="button"
          variant="ghost"
          disabled={isDisabled}
          onClick={handleSkip}
          className="w-full justify-center text-muted-foreground hover:text-foreground"
        >
          {isSkipping && <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />}
          {!isSkipping && <SkipForward className="h-4 w-4 mr-2" aria-hidden />}
          Skip
        </Button>
      )}

      {isSkipped && (
        <p className="text-sm text-center text-muted-foreground">
          {skippedLabel}
        </p>
      )}

      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
