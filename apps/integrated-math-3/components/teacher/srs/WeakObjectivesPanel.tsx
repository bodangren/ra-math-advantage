'use client';

import { Target, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ObjectivePriority } from '@/lib/practice/objective-proficiency';

export interface WeakObjectiveView {
  objectiveId: string;
  standardCode: string;
  standardDescription: string;
  proficientPercent: number;
  avgRetention: number;
  strugglingStudentCount: number;
  priority: ObjectivePriority;
}

export interface WeakObjectivesPanelProps {
  objectives: WeakObjectiveView[];
  isLoading?: boolean;
  onObjectiveClick?: (objectiveId: string) => void;
}

const PRIORITY_LABELS: Record<ObjectivePriority, string> = {
  essential: 'Essential',
  supporting: 'Supporting',
  extension: 'Extension',
  triaged: 'Triaged',
};

const PRIORITY_COLORS: Record<ObjectivePriority, string> = {
  essential: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  supporting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  extension: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  triaged: 'bg-muted text-muted-foreground',
};

function ProficiencyBar({ percent }: { percent: number }) {
  const getColor = (p: number) => {
    if (p >= 40) return 'bg-yellow-500';
    if (p >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getColor(percent))}
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
      </div>
      <span className="text-xs font-mono-num text-muted-foreground w-10 text-right">
        {percent.toFixed(0)}%
      </span>
    </div>
  );
}

export function WeakObjectivesPanel({
  objectives,
  isLoading = false,
  onObjectiveClick,
}: WeakObjectivesPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-4">Weak Objectives</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (objectives.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-4">Weak Objectives</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="h-10 w-10 text-green-500 mb-2" aria-hidden="true" />
          <p className="text-sm text-foreground font-medium">All objectives on track</p>
          <p className="text-xs text-muted-foreground mt-1">
            No objectives have proficiency below 50%
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Weak Objectives</h2>
        <span className="text-xs text-muted-foreground">
          {objectives.length} below 50% proficiency
        </span>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Priority</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Standard</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">Description</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Proficiency</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden lg:table-cell">Retention</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden lg:table-cell">Struggling</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {objectives.map((obj) => (
              <tr
                key={obj.objectiveId}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onObjectiveClick?.(obj.objectiveId)}
              >
                <td className="py-3 px-3">
                  <span
                    className={cn(
                      'inline-block px-2 py-0.5 rounded-full text-xs font-medium',
                      PRIORITY_COLORS[obj.priority]
                    )}
                  >
                    {PRIORITY_LABELS[obj.priority]}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="font-mono-num text-xs text-primary">{obj.standardCode}</span>
                </td>
                <td className="py-3 px-3 hidden md:table-cell">
                  <span className="text-xs text-foreground line-clamp-1 max-w-xs">
                    {obj.standardDescription}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <ProficiencyBar percent={obj.proficientPercent} />
                </td>
                <td className="py-3 px-3 hidden lg:table-cell">
                  <span className="font-mono-num text-xs">
                    {obj.avgRetention > 0 ? `${(obj.avgRetention * 100).toFixed(0)}%` : '—'}
                  </span>
                </td>
                <td className="py-3 px-3 hidden lg:table-cell">
                  {obj.strugglingStudentCount > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs text-red-600">
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      {obj.strugglingStudentCount}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
