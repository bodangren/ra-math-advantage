import Link from 'next/link';

export interface RecommendedNextItem {
  nodeId: string;
  title: string;
  description?: string;
  state: 'mastered' | 'ready' | 'blocked' | 'review_due' | 'unknown';
  difficulty?: number;
  domain?: string;
}

export interface RecommendedNextPanelProps {
  recommendedNext: readonly RecommendedNextItem[];
  activeMisconceptionCount: number;
}

/**
 * Renders the student dashboard's "Recommended next skills" panel.
 *
 * Sourced from `internal.student.getStudentVisualization` (per the
 * next-skill-planner production-wiring track). When the planner returns no
 * recommendations — e.g. a student with no proficiency history — the panel
 * renders an explicit empty-state message and suppresses the items list and
 * the active-misconception count so we never fabricate content.
 *
 * @param {RecommendedNextPanelProps} props - The planner payload slice
 *   consumed by this panel.
 * @returns {JSX.Element} The rendered panel.
 */
export function RecommendedNextPanel({
  recommendedNext,
  activeMisconceptionCount,
}: RecommendedNextPanelProps) {
  const hasRecommendations = recommendedNext.length > 0;

  return (
    <section
      data-testid="recommended-next-panel"
      className="rounded-xl border border-border bg-card p-6 space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Recommended next skills
          </h2>
          {hasRecommendations ? (
            <p className="text-sm text-muted-foreground mt-1">
              Up next based on your mastery and recent practice.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              No recommendations yet
            </p>
          )}
        </div>
        {hasRecommendations && activeMisconceptionCount > 0 && (
          <span
            data-testid="active-misconception-count"
            className="font-mono-num text-xs uppercase tracking-wide text-destructive bg-destructive/10 rounded-md px-3 py-1"
          >
            {activeMisconceptionCount} active misconceptions
          </span>
        )}
      </div>

      {hasRecommendations ? (
        <ul className="space-y-2">
          {recommendedNext.map((item) => (
            <li key={item.nodeId}>
              <Link
                href={`/student/study?focus=${encodeURIComponent(item.nodeId)}`}
                data-testid="recommended-next-item"
                className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/40 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-display text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
                <span className="font-mono-num text-xs text-muted-foreground whitespace-nowrap">
                  {formatDifficulty(item.difficulty)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/**
 * Formats a 0-1 difficulty value as a percentage label, e.g. 0.45 → "45%".
 *
 * Returns an empty string when difficulty is undefined so the panel does
 * not render a misleading "NaN% difficulty" for nodes without a recorded
 * difficulty.
 *
 * @param {number | undefined} difficulty - The 0-1 difficulty value.
 * @returns {string} The formatted percentage label, or an empty string.
 */
function formatDifficulty(difficulty: number | undefined): string {
  if (typeof difficulty !== 'number' || Number.isNaN(difficulty)) {
    return '';
  }
  const pct = Math.round(difficulty * 100);
  return `${pct}% difficulty`;
}