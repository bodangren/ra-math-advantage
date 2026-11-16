'use client';

import { useCallback, useRef, useState } from 'react';
import { CheckCircle2, Loader2, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { completePhaseRequest, skipPhaseRequest } from '@/lib/phase-completion/client';
import { cn } from '@/lib/utils';
import { isSkippable, type PhaseType } from '@math-platform/activity-runtime/phase-types';
import type { CompletePhaseRequest } from '@/types/api';

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

/**
 * Renders a button to mark a lesson phase as complete or skip it.
 *
 * @param {PhaseCompleteButtonProps} props - Phase complete button configuration.
 * @returns {JSX.Element} A phase completion button with loading states.
 */
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
  const [requestError, setRequestError] = useState<{ message: string; retryCompletion: boolean } | null>(null);
  const pendingCompletion = useRef<CompletePhaseRequest | null>(null);
  const [startTime] = useState(() => Date.now());

  const isCompleted = status === 'completed';
  const isSkipped = status === 'skipped';
  const canSkip = phaseType && isSkippable(phaseType);
  const isDisabled = disabled || isCompleting || isSkipping || isCompleted || isSkipped;

  const handleComplete = useCallback(async () => {
    if (isDisabled) return;

    setIsCompleting(true);
    setRequestError(null);
    const request = pendingCompletion.current ?? {
      lessonId,
      phaseNumber,
      timeSpent: Math.round((Date.now() - startTime) / 1000),
      idempotencyKey: `${lessonId}-${phaseNumber}-${Date.now()}`,
    };
    pendingCompletion.current = request;

    try {
      await completePhaseRequest(request);

      pendingCompletion.current = null;
      setStatus('completed');
      onStatusChange?.('completed');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save progress. Please try again.';
      setRequestError({ message, retryCompletion: true });
    } finally {
      setIsCompleting(false);
    }
  }, [isDisabled, lessonId, onStatusChange, phaseNumber, startTime]);

  const handleSkip = useCallback(async () => {
    if (isDisabled || !canSkip) return;

    setIsSkipping(true);
    setRequestError(null);

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
      setRequestError({ message, retryCompletion: false });
    } finally {
      setIsSkipping(false);
    }
  }, [isDisabled, canSkip, lessonId, phaseNumber, onStatusChange]);

  return (
    <div className={cn('w-full max-w-sm space-y-2', className)} data-testid="phase-complete-status" data-status={status}>
      <Button
        type="button"
        variant={isCompleted ? 'outline' : 'default'}
        aria-pressed={isCompleted}
        disabled={isDisabled}
        onClick={handleComplete}
        data-testid="phase-complete-button"
        className={cn(
          'w-full justify-center font-semibold min-h-[44px] min-w-[44px]',
          isCompleted ? 'border-green-300 text-green-700 dark:text-green-300' : '',
        )}
      >
        {isCompleting && <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden />}
        {!isCompleting && isCompleted && <CheckCircle2 className="h-4 w-4 mr-2" aria-hidden />}
        {isCompleted
          ? completedLabel
          : requestError?.retryCompletion
            ? 'Retry completion'
            : idleLabel}
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

      {requestError && (
        <div className="grid gap-2 text-sm text-destructive" role="alert">
          <p>{requestError.message}</p>
        </div>
      )}
    </div>
  );
}
