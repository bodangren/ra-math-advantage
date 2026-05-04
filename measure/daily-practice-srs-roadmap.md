# Daily Practice SRS Roadmap

## Purpose

This roadmap sequences post-Module-9 work for daily practice, spaced repetition scheduling, objective proficiency, and reusable course-agnostic practice infrastructure.

The guiding design is:

```text
practice.v1 submission evidence
  -> deterministic system-derived review rating
  -> SRS card state
  -> objective proficiency interpreted by objective policy
```

Students should answer math problems. They should not self-select FSRS ratings.

## Completed Tracks

These tracks are done and provide the foundation for the remaining work.

- [x] **Track 3: Practice Timing Telemetry** — `measure/tracks/practice-timing-telemetry_20260415/`
- [x] **Track 7: Practice Timing Baselines** — `measure/tracks/practice-timing-baselines_20260415/`

## Implementation Order

Tracks are organized into **waves**. Within each wave, tracks can be developed in parallel. A wave cannot start until all tracks in the preceding wave are complete.

```
Wave 0 (DONE)        Wave 1                Wave 2                Wave 3               Wave 4               Wave 5
┌──────────────┐    ┌──────────────────┐  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ Timing       │    │ Track 1: SRS     │  │ Track 5: Convex  │ │ Track 6:          │ │ Track 9: Student │ │ Track 12:       │
│ Telemetry    │───>│ Product Contract │──>│ SRS Schema &     │─>│ Submission-to-SRS │─>│ Daily Practice   │─>│ Cross-Course    │
│ Timing       │    │                  │  │ Review Log       │ │ Rating Adapter    │ │ Experience       │ │ Extraction &    │
│ Baselines    │    │ Track 2: SRS     │  │                  │ │                  │ │                  │ │ Developer Docs  │
│              │    │ Core Library      │  │                  │ │ Track 8: Daily    │ │ Track 10:        │ │                 │
│              │    │                  │  │                  │ │ Practice Queue    │ │ Objective        │ │                 │
│              │    │ Track 4: Practice │  │                  │ │ Engine            │ │ Proficiency      │ │                 │
│              │    │ Item Blueprint   │  │                  │ │                  │ │                  │ │                 │
│              │    │                  │  │                  │ │                  │ │ Track 11:        │ │                 │
│              │    │                  │  │                  │ │                  │ │ Teacher SRS      │ │                 │
│              │    │                  │  │                  │ │                  │ │ Dashboard        │ │                 │
└──────────────┘    └──────────────────┘  └──────────────────┘ └──────────────────┘ └──────────────────┘ └─────────────────┘
```

### Wave 1 — Foundations (start immediately, can parallelize)

| Track | Directory | Summary |
|-------|-----------|---------|
| **Track 1: SRS Product Contract** | `srs-product-contract_20260416` | Consolidate existing types into `lib/srs/contract.ts`; define card state, review log, session types; version as `srs.contract.v1` |
| **Track 2: SRS Core Library** | `srs-core-library_20260416` | FSRS scheduler wrapper (`ts-fsrs`), review processor bridging `srs-rating.ts` to card state, queue primitives, adapter interfaces |
| **Track 4: Practice Item Blueprint** | `practice-item-blueprint_20260416` | Map practice activities to problem families and objectives; assign objective policies; seed data for all 9 modules |

**Why these three in parallel:** Track 1 and Track 2 are pure TypeScript with no new deps (except `ts-fsrs` for Track 2). Track 4 is a data model + seed track that only needs existing Convex. None depend on each other.

### Wave 2 — Persistence (after Wave 1)

| Track | Directory | Summary |
|-------|-----------|---------|
| **Track 5: Convex SRS Schema** | `convex-srs-schema_20260416` | Add `srs_cards`, `srs_review_log`, `srs_sessions` tables; implement `CardStore`/`ReviewLogStore` adapters backed by Convex |

**Depends on:** Track 1 (types), Track 2 (adapter interfaces, scheduler), Track 4 (problem family model for foreign keys).

### Wave 3 — Integration (after Wave 2)

| Track | Directory | Summary |
|-------|-----------|---------|
| **Track 6: Submission-to-SRS Adapter** | `submission-srs-adapter_20260416` | Wire practice.v1 submissions through `srs-rating.ts` → FSRS card state updates; handle first-seen items; integrate timing baselines |
| **Track 8: Daily Practice Queue** | `daily-practice-queue_20260416` | Query SRS cards from Convex; apply queue ordering with session limits; resolve items to activities; manage session lifecycle |

**Depends on:** Tracks 1, 2, 4, 5. **These two can run in parallel** since Track 6 writes cards and Track 8 reads them.

### Wave 4 — User-Facing (after Wave 3)

| Track | Directory | Summary |
|-------|-----------|---------|
| **Track 9: Student Daily Practice** | `student-daily-practice_20260416` | Student daily practice page at `/student/practice`, session flow, card rendering with activity components, submission with timing, completion states |
| **Track 10: Objective Proficiency** | `objective-proficiency_20260416` | Upgrade `objective-proficiency.ts` to use FSRS stability from card states; build aggregation pipeline; student/teacher proficiency queries |
| **Track 11: Teacher SRS Dashboard** | `teacher-srs-dashboard_20260416` | Class health overview, weak objectives panel, struggling students, **Knowledge Graph-powered misconception and prerequisite diagnostics**, basic interventions |

**Depends on:** Track 9 needs Tracks 6 and 8. Track 10 needs Track 5 (can start early if card schema is stable). Track 11 needs Track 10. **Start Track 10 first, then Track 9, then Track 11.**

### Wave 5 — Polish (after Wave 4)

| Track | Directory | Summary |
|-------|-----------|---------|
| **Track 12: Cross-Course Extraction** | `cross-course-extraction_20260416` | Boundary audit, interface documentation, integration guide (`INTEGRATION.md`), adapter verification |

**Depends on:** All tracks 1-11 complete.

## Timing Design Notes

Timing is useful only after it is normalized by problem family. A correct 90-second response can mean different things for different objectives.

The system should track:

- Wall-clock time.
- Active working time.
- Idle time.
- Focus loss count.
- Hidden-tab count.
- Timing confidence.
- Part-level timing when a component can provide it.

The system should not:

- Use raw speed as a grade.
- Compare students on speed leaderboards.
- Penalize low-confidence timing.
- Let timing override correctness or misconception evidence.

## Objective Measurement Notes

Objective proficiency should be interpreted against an objective-specific policy:

- `essential`
- `supporting`
- `extension`
- `triaged`

Different objectives can intentionally require different amounts of evidence. A narrow objective may be complete with a small number of problem families. A broad or essential objective may require more varied evidence.
fic policy:

- `essential`
- `supporting`
- `extension`
- `triaged`

Different objectives can intentionally require different amounts of evidence. A narrow objective may be complete with a small number of problem families. A broad or essential objective may require more varied evidence.
