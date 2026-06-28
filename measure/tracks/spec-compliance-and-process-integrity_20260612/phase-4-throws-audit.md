# Phase 4 Throws Audit — spec-compliance-and-process-integrity_20260612

> **Status:** Red baseline recorded at `c5ac819d` (Phase 4 baseline SHA).
>
> This table enumerates every `throw` site in the Phase 4 scope
> (`apps/integrated-math-3/convex/`, `apps/integrated-math-3/lib/`) and records
> whether the enclosing function's JSDoc contains a `@throws` tag.
>
> Per spec §D (Missing `@throws` and `@returns`) and FR-4: every function that
> throws must have a `@throws` tag in its JSDoc block.

## Summary

| Metric | Count |
|--------|-------|
| Throw sites in scope | 74 |
| With `@throws` | 0 |
| Without `@throws` | 74 |
| Action needed | Add `@throws` tags to all throwing functions (or document exceptions for internal-only helpers). |

## Detailed Table

| File | Function | Line | Throw statement | @throws present? |
|------|----------|------|-----------------|------------------|
| apps/integrated-math-3/convex/activities.ts | newLevel | 391 | `throw new Error("Activity not found");` | No |
| apps/integrated-math-3/convex/placement.ts | unknown | 31 | `throw new Error(` | No |
| apps/integrated-math-3/convex/placement.ts | unknown | 36 | `throw new Error(` | No |
| apps/integrated-math-3/convex/dev.ts | effectiveStatus | 164 | `throw new Error("Comment is required for needs_changes or rejected status");` | No |
| apps/integrated-math-3/convex/dev.ts | unknown | 220 | `throw new Error("Content hash mismatch: the component has changed since the last review. Please refresh and review the current version.");` | No |
| apps/integrated-math-3/convex/rateLimits.ts | retry | 78 | `throw new ConvexError("Unauthorized: admin only");` | No |
| apps/integrated-math-3/convex/study.ts | moduleNum | 284 | `throw new Error("Invalid score: must be between 0 and questionCount");` | No |
| apps/integrated-math-3/convex/study.ts | moduleNum | 287 | `throw new Error("Invalid question count: must be positive");` | No |
| apps/integrated-math-3/convex/study.ts | moduleNum | 290 | `throw new Error("Invalid module number: must be between 1 and 9");` | No |
| apps/integrated-math-3/convex/exports.ts | latest | 202 | `throw new Error("Unauthorized: caller is not a teacher");` | No |
| apps/integrated-math-3/convex/exports.ts | latest | 207 | `throw new Error("Unauthorized: target is not a student");` | No |
| apps/integrated-math-3/convex/exports.ts | latest | 211 | `throw new Error("Unauthorized: student is in a different organization");` | No |
| apps/integrated-math-3/convex/exports.ts | entry | 360 | `throw new Error("Unauthorized: caller is not a teacher");` | No |
| apps/integrated-math-3/convex/exports.ts | entry | 365 | `throw new Error("Unauthorized: class not found");` | No |
| apps/integrated-math-3/convex/exports.ts | entry | 369 | `throw new Error("Forbidden: teacher does not own this class");` | No |
| apps/integrated-math-3/convex/exports.ts | activity | 487 | `throw new Error("Unauthorized: caller is not a teacher");` | No |
| apps/integrated-math-3/convex/exports.ts | activity | 492 | `throw new Error("Unauthorized: class not found");` | No |
| apps/integrated-math-3/convex/exports.ts | activity | 496 | `throw new Error("Forbidden: teacher does not own this class");` | No |
| apps/integrated-math-3/convex/misconceptionState.ts | unknown | 105 | `throw new Error(` | No |
| apps/integrated-math-3/convex/onboarding/roster-import.ts | unknown | 49 | `throw new Error('class not found');` | No |
| apps/integrated-math-3/convex/onboarding/roster-import.ts | unknown | 53 | `throw new Error('forbidden: importedBy is not the class teacher');` | No |
| apps/integrated-math-3/convex/onboarding/roster-import.ts | unknown | 58 | `throw new Error('importedBy profile not found');` | No |
| apps/integrated-math-3/convex/queue/sessions.ts | queue | 105 | `throw new Error(`Failed to create session for student ${args.studentId}`);` | No |
| apps/integrated-math-3/convex/queue/sessions.ts | queue | 177 | `throw new Error(`No active session found for student ${args.studentId}`);` | No |
| apps/integrated-math-3/convex/parent/visualization.ts | unknown | 101 | `throw new Error(` | No |
| apps/integrated-math-3/convex/parent/visualization.ts | unknown | 108 | `throw new Error('parent.visualization: student profile not found');` | No |
| apps/integrated-math-3/convex/parent/visualization.ts | unknown | 111 | `throw new Error(` | No |
| apps/integrated-math-3/convex/migrations/__tests__/rename-problem-family.test.ts | unknown | 57 | `throw new Error(`MemoryDb: unexpected table ${table}`);` | No |
| apps/integrated-math-3/convex/migrations/__tests__/rename-problem-family.test.ts | unknown | 66 | `throw new Error(`MemoryDb: row ${id} not found`);` | No |
| apps/integrated-math-3/convex/srs/reviews.ts | unknown | 39 | `throw new Error(` | No |
| apps/integrated-math-3/convex/srs/reviews.ts | unknown | 44 | `throw new Error(` | No |
| apps/integrated-math-3/convex/srs/reviews.ts | unknown | 50 | `throw new Error(` | No |
| apps/integrated-math-3/convex/srs/reviews.ts | unknown | 85 | `throw new Error(`Invalid reviewedAt date: ${args.reviewedAt}`);` | No |
| apps/integrated-math-3/convex/srs/reviews.ts | unknown | 180 | `throw new Error(`Invalid since date: ${args.since}`);` | No |
| apps/integrated-math-3/convex/srs/processReview.ts | unknown | 113 | `throw new Error(` | No |
| apps/integrated-math-3/convex/srs/processReview.ts | unknown | 118 | `throw new Error(` | No |
| apps/integrated-math-3/convex/srs/processReview.ts | unknown | 124 | `throw new Error(` | No |
| apps/integrated-math-3/convex/srs/processReview.ts | unknown | 144 | `throw new Error("studentId mismatch: cardState and reviewEntry must refer to the same student");` | No |
| apps/integrated-math-3/convex/srs/sessions.ts | unknown | 108 | `throw new Error(`Session not found: ${args.sessionId}`);` | No |
| apps/integrated-math-3/convex/teacher/lessonAssignment.ts | classLessons | 153 | `throw new Error("Unauthorized: teacher does not own this class");` | No |
| apps/integrated-math-3/convex/teacher/lessonAssignment.ts | classLessons | 209 | `throw new Error("Unauthorized: teacher does not own this class");` | No |
| apps/integrated-math-3/convex/teacher/srs_mutations.ts | unknown | 104 | `throw new Error("Invalid priority");` | No |
| apps/integrated-math-3/lib/placement/im3-probe-adapter.ts | unknown | 41 | `throw new Im3ProbeAdapterError(nodeId);` | No |
| apps/integrated-math-3/lib/placement/seed-knowledge-state.ts | unknown | 35 | `throw new Error(`Invalid confidence value: "${r.confidence}". Placement seeds must be low or medium.`);` | No |
| apps/integrated-math-3/lib/placement/seed-knowledge-state.ts | unknown | 38 | `throw new Error(`Invalid masteryEstimate: ${r.masteryEstimate}. Must be in [0, 1].`);` | No |
| apps/integrated-math-3/lib/phase-completion/client.ts | record | 58 | `throw new PhaseCompletionError(` | No |
| apps/integrated-math-3/lib/phase-completion/client.ts | record | 102 | `throw new PhaseSkipError(` | No |
| apps/integrated-math-3/lib/srs/convexCardStore.ts | unknown | 14 | `throw new Error('studentId must be a non-empty string');` | No |
| apps/integrated-math-3/lib/scale/cost-record.ts | unknown | 42 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/budget-evaluator.ts | unknown | 103 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/budget-evaluator.ts | unknown | 137 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/budget-evaluator.ts | unknown | 145 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/budget-evaluator.ts | unknown | 155 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | unknown | 30 | `throw new Error('insights-parser: path must be a non-empty string');` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | unknown | 34 | `throw new Error('insights-parser: input must be a JSON object');` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | unknown | 38 | `throw new Error('insights-parser: input must contain a perFunction array');` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | unknown | 44 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | unknown | 51 | `throw new Error('insights-parser: perFunction entry must be an object');` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | unknown | 55 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | unknown | 66 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | unknown | 71 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | unknown | 76 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | unknown | 81 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | occ | 90 | `throw new Error('insights-parser: input must contain a totals object');` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | occ | 99 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | occ | 104 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | occ | 109 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | occ | 114 | `throw new Error(` | No |
| apps/integrated-math-3/lib/scale/insights-parser.ts | occ | 133 | `throw new Error('insights-parser: input must contain a totals object');` | No |
| apps/integrated-math-3/lib/teacher/data-export.ts | unknown | 141 | `throw new Error(` | No |
| apps/integrated-math-3/lib/teacher/data-export.ts | unknown | 152 | `throw new Error(` | No |
| apps/integrated-math-3/lib/teacher/data-export.ts | unknown | 163 | `throw new Error(` | No |
| apps/integrated-math-3/lib/teacher/data-export.ts | unknown | 168 | `throw new Error(` | No |
| apps/integrated-math-3/lib/teacher/data-export.ts | args | 180 | `throw new Error(`resolveExportScope: unknown dataset '${dataset}'`);` | No |

## Notes

- Many "unknown" function names indicate throw sites inside inline handlers or
  anonymous arrow functions (common in Convex `internalQuery`/`internalMutation`
  handlers). The jr-green Phase 4 implementation must still document these
  exceptions, either on the exported wrapper or on a named helper.
- Two throw sites live in `apps/integrated-math-3/convex/migrations/__tests__/`.
  These are test-only memory-DB helpers; the implementation may decide to
  exclude test directories from the `@throws` requirement, but any such
  exclusion must be documented in the Green commit.

## Audit command (reference)

```bash
grep -rEn '^\s*throw\b' apps/integrated-math-3/convex/ apps/integrated-math-3/lib/ \
  | wc -l \
  | xargs -I{} echo "throw_sites:{}"
```

**Red result at `c5ac819d`:** `throw_sites:74`.
