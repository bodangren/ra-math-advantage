'use client';

import { AlertCircle, TrendingDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StrugglingStudentView {
  studentId: string;
  displayName: string;
  overdueCount: number;
  avgRetention: number;
  weakestObjective: string;
}

export interface StrugglingStudentsPanelProps {
  students: StrugglingStudentView[];
  isLoading?: boolean;
  onStudentClick?: (studentId: string) => void;
}

function StudentCard({
  student,
  rank,
  onClick,
}: {
  student: StrugglingStudentView;
  rank: number;
  onClick?: (studentId: string) => void;
}) {
  const retentionColor =
    student.avgRetention >= 0.8
      ? 'text-green-600'
      : student.avgRetention >= 0.5
        ? 'text-yellow-600'
        : 'text-red-600';

  return (
    <div
      className={cn(
        'bg-card border rounded-lg p-4 transition-colors',
        onClick ? 'cursor-pointer hover:bg-muted/30' : ''
      )}
      onClick={() => onClick?.(student.studentId)}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick(student.studentId);
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{student.displayName}</p>
            {student.weakestObjective && (
              <p className="text-xs text-muted-foreground truncate">
                Weak: {student.weakestObjective}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1">
              {student.overdueCount > 0 && (
                <AlertCircle className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
              )}
              <span
                className={cn(
                  'text-lg font-bold font-mono-num',
                  student.overdueCount > 0 ? 'text-red-600' : 'text-foreground'
                )}
              >
                {student.overdueCount}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">overdue</p>
          </div>

          <div className="text-right">
            <p className={cn('text-lg font-bold font-mono-num', retentionColor)}>
              {student.avgRetention > 0 ? `${(student.avgRetention * 100).toFixed(0)}%` : '—'}
            </p>
            <p className="text-xs text-muted-foreground">retention</p>
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingDown className="h-3 w-3" aria-hidden="true" />
          <span>Rank #{rank + 1} by urgency</span>
        </div>
      </div>
    </div>
  );
}

export function StrugglingStudentsPanel({
  students,
  isLoading = false,
  onStudentClick,
}: StrugglingStudentsPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-4">Struggling Students</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-4">Struggling Students</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <User className="h-10 w-10 text-green-500 mb-2" aria-hidden="true" />
          <p className="text-sm text-foreground font-medium">No struggling students</p>
          <p className="text-xs text-muted-foreground mt-1">
            All students are on track with their practice
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Struggling Students</h2>
        <span className="text-xs text-muted-foreground">
          {students.length} need attention
        </span>
      </div>

      <div className="space-y-3">
        {students.map((student, index) => (
          <StudentCard
            key={student.studentId}
            student={student}
            rank={index}
            onClick={onStudentClick}
          />
        ))}
      </div>

      {onStudentClick && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Click a student to view their SRS detail
          </p>
        </div>
      )}
    </div>
  );
}
