'use client';

interface PhaseProgress {
  phaseId: string;
  phaseNumber: number;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  completedAt: string | null;
}

interface ProgressTimelineProps {
  phases: PhaseProgress[];
  totalTimeMinutes?: number;
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  in_progress: 'In Progress',
  skipped: 'Skipped',
  not_started: 'Not Started',
};

export function ProgressTimeline({ phases, totalTimeMinutes }: ProgressTimelineProps) {
  if (phases.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No phase progress recorded.
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Progress Timeline</h3>
        {totalTimeMinutes !== undefined && (
          <span className="text-sm text-muted-foreground">
            Total time: {totalTimeMinutes} min
          </span>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {phases.map((phase) => (
            <div key={phase.phaseId} className="relative flex items-start gap-4 pl-10">
              <div
                className={[
                  'absolute left-2.5 w-3 h-3 rounded-full flex items-center justify-center text-xs',
                  phase.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : phase.status === 'in_progress'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-muted text-muted-foreground',
                ].join(' ')}
              >
                {phase.status === 'in_progress' && (
                  <span className="text-[8px]">●</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    Phase {phase.phaseNumber}: {phase.title}
                  </span>
                  <span
                    className={[
                      'shrink-0 px-2 py-0.5 rounded text-xs font-medium',
                      phase.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : phase.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : phase.status === 'skipped'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-muted text-muted-foreground',
                    ].join(' ')}
                  >
                    {STATUS_LABELS[phase.status]}
                  </span>
                </div>

                {phase.completedAt && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatDate(phase.completedAt)}</span>
                    <span>at {formatTime(phase.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}