'use client';

import { Check, Circle, CircleDot, Lock, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PhaseType } from '@/lib/curriculum/phase-types';
import { getPhaseDisplayInfo } from '@/lib/curriculum/phase-types';

export type PhaseStatus = 'completed' | 'current' | 'available' | 'locked' | 'skipped';

export interface StepperPhase {
  phaseNumber: number;
  phaseId: string;
  phaseType: PhaseType;
  title: string;
  status: PhaseStatus;
}

export interface LessonStepperProps {
  phases: StepperPhase[];
  currentPhase: number;
  onPhaseClick?: (phaseNumber: number, phaseId: string) => void;
  className?: string;
}

export function LessonStepper({ phases, currentPhase, onPhaseClick, className }: LessonStepperProps) {
  const handleClick = (phase: StepperPhase) => {
    if (phase.status !== 'locked') {
      onPhaseClick?.(phase.phaseNumber, phase.phaseId);
    }
  };

  return (
    <nav aria-label="Lesson phases" className={cn('w-full', className)}>
      {/* Desktop: horizontal stepper with connectors */}
      <ol className="hidden md:flex items-center justify-between gap-2">
        {phases.map((phase, idx) => (
          <li key={phase.phaseId} className="flex flex-1 items-center">
            <StepButton
              phase={phase}
              isCurrent={phase.phaseNumber === currentPhase}
              onClick={() => handleClick(phase)}
            />
            {idx < phases.length - 1 && (
              <div
                className={cn('h-0.5 flex-1 transition-colors', phase.status === 'completed' ? 'bg-green-600' : 'bg-muted')}
                aria-hidden
              />
            )}
          </li>
        ))}
      </ol>

      {/* Mobile: horizontal scroll */}
      <ol className="flex md:hidden items-center gap-3 overflow-x-auto pb-2">
        {phases.map(phase => (
          <li key={phase.phaseId} className="flex-shrink-0">
            <StepButton
              phase={phase}
              isCurrent={phase.phaseNumber === currentPhase}
              onClick={() => handleClick(phase)}
              compact
            />
          </li>
        ))}
      </ol>
    </nav>
  );
}

function StepButton({
  phase,
  isCurrent,
  onClick,
  compact = false,
}: {
  phase: StepperPhase;
  isCurrent: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const isClickable = phase.status !== 'locked';
  const displayInfo = getPhaseDisplayInfo(phase.phaseType);
  const label = displayInfo.label;

  const statusClass = {
    completed: 'bg-green-600 text-white border-green-600',
    current: 'bg-primary text-primary-foreground border-primary',
    available: 'bg-background text-foreground border-border hover:border-primary/60',
    locked: 'bg-muted text-muted-foreground border-muted cursor-not-allowed',
    skipped: 'bg-amber-500 text-white border-amber-500',
  }[phase.status];

  const StepIcon = () => {
    switch (phase.status) {
      case 'completed': return <Check className="h-4 w-4" aria-hidden />;
      case 'current':   return <CircleDot className="h-4 w-4" aria-hidden />;
      case 'locked':    return <Lock className="h-4 w-4" aria-hidden />;
      case 'skipped':   return <SkipForward className="h-4 w-4" aria-hidden />;
      default:          return <Circle className="h-4 w-4" aria-hidden />;
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={!isClickable}
        aria-label={`Phase ${phase.phaseNumber}: ${phase.title}`}
        aria-current={isCurrent ? 'step' : undefined}
        title={phase.status === 'locked' ? 'Complete previous phase to unlock' : phase.title}
        className={cn(
          'flex items-center justify-center rounded-full border-2 transition-all',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          compact ? 'h-9 w-9' : 'h-11 w-11',
          statusClass,
          isClickable && 'hover:scale-105',
        )}
      >
        {compact
          ? <span className="text-sm font-semibold">{phase.phaseNumber}</span>
          : <StepIcon />
        }
      </button>
      {!compact && (
        <span className="text-xs text-muted-foreground font-medium text-center leading-tight max-w-[64px]">
          {label}
        </span>
      )}
    </div>
  );
}
