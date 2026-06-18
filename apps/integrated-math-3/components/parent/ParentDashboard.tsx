'use client';

import type { ParentVisualizationV1 } from '@math-platform/knowledge-space-practice';
import { parentVisualizationV1Schema } from '@math-platform/knowledge-space-practice';

export interface ParentDashboardProps {
  payload: ParentVisualizationV1;
  studentId: string;
  studentName: string;
}

const trendLabels: Record<ParentVisualizationV1['progressTrend'], string> = {
  improving: 'Improving — keep up the great work!',
  stable: 'Steady progress — staying on track',
  declining: 'Needs attention — consider extra practice',
  unknown: 'Not enough data yet to show a trend',
};

export function ParentDashboard({
  payload,
  studentId,
  studentName,
}: ParentDashboardProps) {
  parentVisualizationV1Schema.parse(payload);

  return (
    <div data-student-id={studentId} className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-mono-num">
          Viewing progress for
        </p>
        <h1 className="text-3xl font-display font-bold text-foreground">
          {studentName}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-workbook p-5 space-y-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            What your student can do
          </span>
          <p data-testid="parent-dashboard-can-do" className="text-lg font-semibold text-foreground">
            {payload.canDoSummary}
          </p>
        </div>

        <div className="card-workbook p-5 space-y-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Next focus
          </span>
          <p className="text-lg font-semibold text-foreground">
            {payload.nextFocus}
          </p>
        </div>
      </div>

      <div className="card-workbook p-5 space-y-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          Areas to work on
        </span>
        <div data-testid="parent-dashboard-blockers">
          {payload.blockers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blockers — great progress!</p>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {payload.blockers.map((blocker) => (
                <li key={blocker} className="text-sm text-foreground">
                  {blocker}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card-workbook p-5 space-y-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          Progress trend
        </span>
        <p data-testid="parent-dashboard-trend" className="text-lg font-semibold text-foreground">
          {trendLabels[payload.progressTrend]}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Skills overview</h2>
        {payload.nodes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No skills to show yet. Your student will build their skill map as they complete lessons.
          </p>
        ) : (
          <div data-testid="parent-dashboard-visual-nodes" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {payload.nodes.map((node) => (
              <div
                key={node.nodeId}
                className="card-workbook p-4 flex items-start justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{node.title}</p>
                  {node.description && (
                    <p className="text-xs text-muted-foreground">{node.description}</p>
                  )}
                </div>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${stateBadgeClass(node.state)}`}
                >
                  {stateLabel(node.state)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function stateLabel(state: string): string {
  switch (state) {
    case 'mastered':
      return 'Mastered';
    case 'ready':
      return 'Ready';
    case 'blocked':
      return 'Blocked';
    case 'review_due':
      return 'Review due';
    case 'unknown':
      return 'Unknown';
    default:
      return state;
  }
}

function stateBadgeClass(state: string): string {
  switch (state) {
    case 'mastered':
      return 'bg-green-100 text-green-800';
    case 'ready':
      return 'bg-blue-100 text-blue-800';
    case 'blocked':
      return 'bg-red-100 text-red-800';
    case 'review_due':
      return 'bg-yellow-100 text-yellow-800';
    case 'unknown':
      return 'bg-muted/30 text-muted-foreground';
    default:
      return 'bg-muted/30 text-muted-foreground';
  }
}
