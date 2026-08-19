import { compareText, type SubmittedObservation } from './contracts';

const MAX_HISTORY_PAGE = 100;

function encodeCursor(record: SubmittedObservation): string {
  return `${record.submittedAt}:${encodeURIComponent(record.observationId)}`;
}

/** Return one bounded cross-year observation-history page. */
export function paginateObservationHistory(
  records: readonly SubmittedObservation[],
  options: { cursor: string | null; limit: number },
) {
  if (!Number.isInteger(options.limit) || options.limit < 1 || options.limit > MAX_HISTORY_PAGE) {
    throw new Error(`limit must be an integer from 1 through ${MAX_HISTORY_PAGE}`);
  }
  const ordered = [...records].sort((left, right) => {
    const time = right.submittedAt - left.submittedAt;
    return time !== 0 ? time : compareText(left.observationId, right.observationId);
  });
  const start = options.cursor === null
    ? 0
    : ordered.findIndex((record) => encodeCursor(record) === options.cursor) + 1;
  if (options.cursor !== null && start === 0) throw new Error('Invalid history cursor');
  const items = ordered.slice(start, start + options.limit);
  const hasMore = start + items.length < ordered.length;
  return {
    items,
    nextCursor: hasMore && items.length > 0 ? encodeCursor(items.at(-1)!) : null,
  };
}

