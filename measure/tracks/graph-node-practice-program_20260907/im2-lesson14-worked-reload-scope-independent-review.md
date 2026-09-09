# IM2 Lesson 1.4 Worked reload scope review

## Decision

Accepted.

The three-path scope is the minimum safe repair. It changes the server query and write authority without changing the client sequence, stored schema, graph state, or teacher projection.

## Findings

The shared acknowledgement validator closes the current ambiguity. It binds the row to the learner, physical activity, canonical Lesson 1.4 row, attempt ordinal, request counters, and exact empty Worked envelope. It also rejects grade fields and extra nested data.

The canonical `lessonId` is required for the existing teacher query. That query filters submissions through the assigned lesson. A valid Worked row then appears with the existing public fallback values: empty answer, score 0, maximum score 1, and `canRecordExposure: false`.

The newest-row-only rule is correct for this completed activity. A valid acknowledgement removes that one Worked item from the learner query. A malformed newest row makes the full triangle result unavailable. The query does not fall back to an older row or silently recreate the activity.

The mutation rules also preserve one physical acknowledgement:

- An exact same-key retry returns the original row.
- A different key with the same empty request returns the original row.
- A changed counter conflicts without a write.
- A malformed stored row blocks replay and a new-key write.
- The handler does not create a later ordinal after completion.

These rules let the existing component start with the first unfinished returned item. Guided and Independent recovery continues to use `parseTriangleRow()`. No client change is necessary.

## Test scope

The existing triangle server test is the correct owner for query, replay, malformed-history, counter, and full-table assertions. The existing teacher candidate test uses the real teacher query and is the correct owner for canonical lesson visibility. Keep all malformed cases table-driven and compare complete table snapshots after each rejected mutation.

The final regression set must include both Worked activities. It must also prove that completed or partial Guided and Independent histories retain their current behavior when one or both Worked items are omitted.

No source or database change was made during this review.
