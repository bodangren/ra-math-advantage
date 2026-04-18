# Reconciliation Notes

## Canonical Source Decision
- Canonical source: **IM3 (evolved/superset)**
- Reason: The srs-engine package was built from the IM3 implementation, which evolved through multiple iterations of the SRS product. BM2 contains older prototype versions of the same modules.

## Delta Classification

### contract.ts
- **BM2**: Simple Zod schemas (srsRatingSchema, srsCardStateSchema, srsReviewLogSchema, srsSessionSchema, dailyQueueSchema, srsReviewResultSchema)
- **Package**: Comprehensive typed contract with ObjectivePriority/ObjectivePracticePolicy types, TimingSpeedBand/PracticeTimingBaseline/PracticeTimingFeatures types, PracticeSubmissionPart/Envelope/TimingSummary types, SrsCardId/SrsCardState/SrsReviewLogEntry/SrsSession/SrsSessionConfig with ISO timestamps, instructional copy constants
- **Classification**: Package is superset; BM2 is deprecated prototype
- **required behavior**: All BM2 behavior is represented in package

### scheduler.ts
- **BM2**: createNewCard, reviewCard, getCardsDue, serializeCard, deserializeCard (basic)
- **Package**: DEFAULT_SCHEDULER_CONFIG, mapSrsRatingToGrade, mapGradeToSrsRating, createCard (with proper params), reviewCard (updated signature), getDueCards, previewInterval, generatorParameters-based FSRS
- **Classification**: Package is superset; BM2 is deprecated prototype
- **required behavior**: All BM2 behavior is represented in package

### review-processor.ts
- **BM2**: processPracticeSubmission with inline timing/rating logic
- **Package**: processReview with ReviewProcessorInput/Result types, imports from @math-platform/practice-core for rating and timing, generateReviewId
- **Classification**: Package is superset; BM2 is deprecated prototype
- **required behavior**: All BM2 behavior is represented in package

### queue.ts
- **BM2**: Simple buildDailyQueue (just due cards), getQueueSummary
- **Package**: QueueItem type, isOverdue, daysOverdue, buildDailyQueue with priority ordering (essential/supporting/extension/triaged), config-based session limits, policy filtering
- **Classification**: Package is superset; BM2 is deprecated prototype
- **required behavior**: All BM2 behavior is represented in package

### family-map.ts (BM2 only)
- **Classification**: domain-specific (not in package scope)
- **Must remain**: App-local in BM2

### teacher-analytics.ts (BM2 only)
- **Classification**: domain-specific (not in package scope)
- **Must remain**: App-local in BM2

## App-Local Keep List
- **IM3**:
  - `lib/srs/convexCardStore.ts` - Convex-specific CardStore adapter
  - `lib/srs/convexReviewLogStore.ts` - Convex-specific ReviewLogStore adapter
  - `lib/srs/convexSessionStore.ts` - Convex-specific session store
  - `lib/srs/submission-srs-adapter.ts` - App-specific submission wiring
- **BM2**:
  - `lib/srs/family-map.ts` - BM2-specific family resolution
  - `lib/srs/teacher-analytics.ts` - BM2-specific analytics

## Package API Decisions
- exported symbols: All SRS contract types, scheduler functions, review processor, queue primitives, adapters, submission adapter
- intentionally not exported: Convex store adapters, app-specific submission adapter (these remain app-local)

## Verification Results
- package tests: 18/18 passing
- typecheck: clean (per code review 2026-04-18)