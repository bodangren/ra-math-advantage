# Junior Developer Handoff: Daily Practice SRS Product Contract

## What Was Built

`lib/srs/contract.ts` is the canonical import surface for all SRS-related types.
It consolidates existing practice types and defines new ones needed for the
spaced-repetition pipeline.

## Re-exports vs New Definitions

### Re-exports (do not redefine these)

| Source Module | Re-exported Types |
|---------------|-------------------|
| `lib/practice/srs-rating.ts` | `SrsRating`, `SrsRatingInput`, `SrsRatingResult` |
| `lib/practice/objective-proficiency.ts` | `ObjectivePriority`, `ObjectivePracticePolicy`, `PRIORITY_DEFAULTS`, `EvidenceConfidence`, `ObjectiveProficiencyResult`, `StudentProficiencyView`, `TeacherProficiencyView` |
| `lib/practice/timing-baseline.ts` | `PracticeTimingBaseline`, `PracticeTimingFeatures`, `TimingSpeedBand` |
| `lib/practice/contract.ts` | `PracticeSubmissionEnvelope`, `PracticeSubmissionPart`, `PracticeTimingSummary` |

### New Definitions (defined in this module)

- `SRS_CONTRACT_VERSION = 'srs.contract.v1'`
- `SrsCardId` — branded string type for card identifiers
- `SrsCardState` — FSRS-compatible card state (stability, difficulty, dueDate, etc.)
- `SrsReviewLogEntry` — immutable record of a review event with before/after state
- `SrsSessionConfig` — daily practice queue parameters
- `SrsSession` — a single student practice session
- `STUDENT_DAILY_PRACTICE_COPY` / `TEACHER_DAILY_PRACTICE_COPY` — instructional language constants

## How Track 2 (Scheduler) Uses `SrsCardState`

Track 2 (`srs-core-library`) should:
1. Import `SrsCardState` from `lib/srs/contract`.
2. Implement `createCard(studentId, objectiveId, problemFamilyId)` returning a `SrsCardState` with `state: "new"`, `reps: 0`, `lapses: 0`.
3. Implement `reviewCard(card, rating)` using `ts-fsrs` to compute new stability, difficulty, dueDate, etc.
4. Map `ts-fsrs` internal `Card` fields to `SrsCardState` fields on return.

Key mapping from ts-fsrs to `SrsCardState`:
- `card.due` → `dueDate` (ISO string)
- `card.stability` → `stability`
- `card.difficulty` → `difficulty`
- `card.state` (0=new, 1=learning, 2=review, 3=relearning) → `state` string union
- `card.elapsed_days` → `elapsedDays`
- `card.scheduled_days` → `scheduledDays`
- `card.reps` → `reps`
- `card.lapses` → `lapses`
- `card.last_review` → `lastReview` (ISO string or null)

## How Track 5 (Schema) Maps `SrsCardState` to Convex Tables

Track 5 should create a `srs_cards` table in `convex/schema.ts` with fields
corresponding to `SrsCardState`:

```typescript
srs_cards: defineTable({
  cardId: v.string(),
  studentId: v.string(),
  objectiveId: v.string(),
  problemFamilyId: v.string(),
  stability: v.number(),
  difficulty: v.number(),
  state: v.union(v.literal("new"), v.literal("learning"), v.literal("review"), v.literal("relearning")),
  dueDate: v.string(),
  elapsedDays: v.number(),
  scheduledDays: v.number(),
  reps: v.number(),
  lapses: v.number(),
  lastReview: v.union(v.string(), v.null()),
  createdAt: v.string(),
  updatedAt: v.string(),
})
  .index("by_cardId", ["cardId"])
  .index("by_studentId", ["studentId"])
  .index("by_studentId_dueDate", ["studentId", "dueDate"])
  .index("by_objectiveId", ["objectiveId"])
  .index("by_problemFamilyId", ["problemFamilyId"]),
```

## Triage Handling Contract for Track 5 and Track 8

**Rule:** Objectives with `priority === 'triaged'` must be excluded from the SRS system.

### Track 5 (Convex Schema / Card Creation)
- When creating `srs_cards` for a student, query the objective's priority first.
- If `priority === 'triaged'`, do NOT create a card.
- If a card already exists and the objective is later triaged, the card can remain
  but should be filtered out at query time (Track 8).

### Track 8 (Daily Practice Queue Engine)
- When building the daily queue, filter out any cards whose objective has
  `priority === 'triaged'`.
- Do NOT count triaged objectives toward proficiency or session completion.

## Import Pattern

All SRS code should import from this module only:

```typescript
import { SrsCardState, SrsSessionConfig, SRS_CONTRACT_VERSION } from '@/lib/srs/contract';
```

Do NOT import directly from `lib/practice/srs-rating.ts` or the other practice
modules in SRS-specific code.

## Testing

Tests live in `__tests__/lib/srs/contract.test.ts`. They verify:
- All re-exported types compile correctly from `lib/srs/contract`.
- New types accept valid data for all state variants.
- Instructional copy contains no punitive language.

Run focused tests:
```bash
CI=true npx vitest run __tests__/lib/srs/contract.test.ts
```
