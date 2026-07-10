import { z } from 'zod';

export const masterySnapshotSchema = z.object({
  timestamp: z.number().int().nonnegative(),
  masteredNodeIds: z.array(z.string().min(1)),
});

/**
 * Progress-trend history: non-empty, chronologically ordered, unique ids per snapshot.
 *
 * Contract: a valid history window must contain at least one snapshot (otherwise
 * there is no window to aggregate), every snapshot's `timestamp` must be ≥
 * the previous snapshot's `timestamp` so `progressTrend` can compute a
 * monotonic window delta, and each snapshot's `masteredNodeIds` must be
 * pairwise unique so per-snapshot mastery counts are well-defined.
 */
export const progressTrendHistorySchema = z.array(masterySnapshotSchema)
  .min(1, 'A progress-trend history must contain at least one snapshot')
  .superRefine((history, ctx) => {
    for (let i = 0; i < history.length; i++) {
      const snapshot = history[i]!;

      const seenIds = new Set<string>();
      for (let j = 0; j < snapshot.masteredNodeIds.length; j++) {
        const id = snapshot.masteredNodeIds[j]!;
        if (seenIds.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Snapshot at index ${i} has duplicate masteredNodeId "${id}" — ids must be unique within a snapshot`,
            path: [i, 'masteredNodeIds', j],
          });
          return;
        }
        seenIds.add(id);
      }

      if (i > 0) {
        const prev = history[i - 1]!;
        if (snapshot.timestamp < prev.timestamp) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Snapshot at index ${i} has timestamp ${snapshot.timestamp} which precedes the previous snapshot at index ${i - 1} with timestamp ${prev.timestamp} — history must be chronologically ordered (non-decreasing)`,
            path: [i, 'timestamp'],
          });
          return;
        }
      }
    }
  });

export type MasterySnapshot = z.infer<typeof masterySnapshotSchema>;
export type ProgressTrendHistory = z.infer<typeof progressTrendHistorySchema>;

export type ProgressTrend = 'improving' | 'stable' | 'declining' | 'unknown';

export type ProgressTrendOptions = {
  /** Evaluation timestamp. Defaults to the latest snapshot for deterministic replay. */
  now?: number;
  /** Comparison window in days. */
  windowDays?: number;
  /** Symmetric mastered-count threshold for improving and declining. */
  trendThreshold?: number;
  /** Optional graph/domain boundary; mastered ids outside it do not count. */
  includedNodeIds?: ReadonlySet<string>;
};

export const DEFAULT_PROGRESS_TREND_WINDOW_DAYS = 14;
export const DEFAULT_PROGRESS_TREND_THRESHOLD = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

function requirePositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number`);
  }
}

/**
 * Compare mastered-count snapshots over a real-time window using v3's
 * symmetric threshold contract.
 *
 * The helper intentionally accepts an empty readonly array even though the
 * persistence schema requires a non-empty history: projection callers need a
 * safe `unknown` value for new learners before their first snapshot exists.
 *
 * @param {ReadonlyArray<MasterySnapshot>} history - Mastery snapshots to compare
 * @param {ProgressTrendOptions} options - Window, threshold, clock, and optional node filter
 * @returns {ProgressTrend} - Symmetric trend classification or `unknown`
 */
export function computeProgressTrend(
  history: ReadonlyArray<MasterySnapshot>,
  options: ProgressTrendOptions = {},
): ProgressTrend {
  const windowDays = options.windowDays ?? DEFAULT_PROGRESS_TREND_WINDOW_DAYS;
  const trendThreshold = options.trendThreshold ?? DEFAULT_PROGRESS_TREND_THRESHOLD;
  requirePositiveFinite(windowDays, 'windowDays');
  requirePositiveFinite(trendThreshold, 'trendThreshold');

  if (history.length < 2) return 'unknown';

  const latestTimestamp = Math.max(...history.map((snapshot) => snapshot.timestamp));
  const now = options.now ?? latestTimestamp;
  if (!Number.isFinite(now) || now < 0) {
    throw new RangeError('now must be a non-negative finite timestamp');
  }

  const windowStart = now - windowDays * DAY_MS;
  const inWindow = history
    .filter((snapshot) => snapshot.timestamp >= windowStart && snapshot.timestamp <= now)
    .toSorted((left, right) => left.timestamp - right.timestamp);

  if (inWindow.length < 2) return 'unknown';

  const countMastered = (snapshot: MasterySnapshot): number => {
    const uniqueIds = new Set(snapshot.masteredNodeIds);
    if (options.includedNodeIds === undefined) return uniqueIds.size;
    let count = 0;
    for (const nodeId of uniqueIds) {
      if (options.includedNodeIds.has(nodeId)) count++;
    }
    return count;
  };

  const delta = countMastered(inWindow[inWindow.length - 1]!) - countMastered(inWindow[0]!);
  if (delta >= trendThreshold) return 'improving';
  if (delta <= -trendThreshold) return 'declining';
  return 'stable';
}
