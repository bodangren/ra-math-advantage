# Spec: SRS saveCards Batch Mutation

## Overview

The `saveCards` internalMutation in `convex/srs/cards.ts` performs 2N sequential DB operations (N lookups + N writes) for N cards due to sequential `await` in a for-loop. This must be refactored to use `Promise.all` for parallel execution.

## Functional Requirements

1. Phase 1: All card lookups execute in parallel via `Promise.all`
2. Phase 2: All card writes (replace/insert) execute in parallel via `Promise.all`
3. Behavior must remain identical: existing cards are replaced, new cards are inserted

## Technical Approach

Current sequential pattern:
```
for (const card of cards) {
  const existing = await ctx.db.query(...).first();  // N sequential queries
  if (existing) await ctx.db.replace(...);            // N sequential writes
  else await ctx.db.insert(...);                      // N sequential writes
}
```

Batched pattern:
```
// Phase 1: All lookups in parallel
const lookups = await Promise.all(
  cards.map(card => ctx.db.query(...).first())
);

// Phase 2: All writes in parallel
await Promise.all(
  cards.map((card, i) => {
    if (lookups[i]) ctx.db.replace(lookups[i]._id, ...);
    else ctx.db.insert(...);
  })
);
```

## Non-Functional Requirements

- Tests must verify parallel execution via mock call ordering
- Tests cover: all existing, all new, mixed existing/new, empty array

## Acceptance Criteria

- [ ] `saveCards` uses Promise.all for lookups phase
- [ ] `saveCards` uses Promise.all for writes phase
- [ ] Existing cards are replaced, new cards are inserted
- [ ] Tests cover edge cases: empty array, all existing, all new, mixed
- [ ] All existing tests pass
- [ ] Build passes