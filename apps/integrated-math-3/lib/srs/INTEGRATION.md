# SRS Integration Guide

> **Version:** `srs.contract.v1`
> **Audience:** Developers integrating the Daily Practice SRS system into a new or existing course.

This guide walks through adding the spaced-repetition daily practice system to a course. The SRS system is fully course-agnostic — all scheduling, rating, and queue logic operates on generic identifiers (`problemFamilyId`, `objectiveId`, `studentId`). Course-specific data lives only in seed data and activity configuration.

## Table of Contents

1. [Define Activity Components](#1-define-activity-components)
2. [Create Problem Family Seed Data](#2-create-problem-family-seed-data)
3. [Assign Objective Practice Policies](#3-assign-objective-practice-policies)
4. [Implement CardStore and ReviewLogStore](#4-implement-cardstore-and-reviewlogstore)
5. [Create Daily Practice Page](#5-create-daily-practice-page)
6. [Wire Submission Adapter](#6-wire-submission-adapter)

---

## 1. Define Activity Components

Register each activity type in your practice system with a stable `componentKind` key.

### Requirements

- Each activity component must accept `ActivityProps` and emit a `PracticeSubmissionEnvelope` on completion.
- The `componentKind` string is the stable key used to route submissions to the correct SRS pipeline.

### Example

```tsx
// components/practice/QuadraticExplorer.tsx
import type { ActivityProps, PracticeSubmissionEnvelope } from '@/lib/practice/contract';

export function QuadraticExplorer({ onSubmit }: ActivityProps) {
  return (
    <GraphingExplorer
      mode="practice"
      onSubmit={(parts) => {
        onSubmit({
          activityId: 'quadratic-explorer-v1',
          attemptNumber: 1,
          parts,
          submittedAt: new Date().toISOString(),
        });
      }}
    />
  );
}
```

### Register in the component registry

```ts
// lib/practice/component-registry.ts
import { QuadraticExplorer } from '@/components/practice/QuadraticExplorer';

export const PRACTICE_COMPONENT_REGISTRY = {
  'quadratic-explorer-v1': QuadraticExplorer,
  'step-by-step-solver-v1': StepByStepSolverActivity,
  'comprehension-quiz-v1': ComprehensionQuiz,
} as const;
```

---

## 2. Create Problem Family Seed Data

Map each activity to problem families and objectives. Problem families are the SRS atomic unit — a card is created per `(student, problemFamily)`.

### Data Model

```ts
// lib/practice/types.ts (extend as needed)
export type ProblemFamily = {
  problemFamilyId: string;  // unique, e.g. 'pf_quadratic_roots'
  objectiveId: string;       // links to an objective
  title: string;
  description: string;
};
```

### Seed Example

```ts
// seed/data/problem-families.ts
export const PROBLEM_FAMILIES = [
  {
    problemFamilyId: 'pf_quadratic_roots',
    objectiveId: 'obj_quadratic_roots',
    title: 'Quadratic Roots',
    description: 'Find roots of quadratic equations by factoring, completing the square, or quadratic formula.',
  },
  {
    problemFamilyId: 'pf_linear_systems',
    objectiveId: 'obj_linear_systems',
    title: 'Linear Systems',
    description: 'Solve systems of two linear equations.',
  },
];

export const OBJECTIVES = [
  {
    objectiveId: 'obj_quadratic_roots',
    standardCode: 'AI.CE.1',  // CCSS or custom
    description: 'Solve quadratic equations in one variable.',
    moduleNumber: 1,
    lessonNumber: 3,
  },
  {
    objectiveId: 'obj_linear_systems',
    standardCode: 'AI.REI.6',
    description: 'Solve systems of linear equations exactly and approximately.',
    moduleNumber: 1,
    lessonNumber: 5,
  },
];
```

### Seeding to Database

```ts
// convex/seed/problem-families.ts
import { seedProblemFamilies } from './impl/problem-families-impl';
import { seedObjectives } from './impl/objectives-impl';
import { seedLessonObjectives } from './impl/lesson-objectives-impl';

export async function seedAllProblemFamiliesStaging(db: Database) {
  await seedProblemFamilies(db, PROBLEM_FAMILIES);
  await seedObjectives(db, OBJECTIVES);
  await seedLessonObjectives(db, LESSON_OBJECTIVE_LINKS);
}
```

---

## 3. Assign Objective Practice Policies

Each objective needs a practice policy that controls SRS queue priority and daily limits.

### Policy Model

```ts
// Imported from lib/srs/contract.ts
import type { ObjectivePracticePolicy, ObjectivePriority } from '@/lib/srs/contract';

// Priority levels:
// - essential:   Core skills, highest queue priority, included in proficiency
// - supporting:   Helpful but not central, medium priority
// - extension:    Enrichment, lower priority
// - triaged:     Explicitly excluded from daily queues and proficiency
```

### Policy Seed Example

```ts
// seed/data/objective-policies.ts
import type { ObjectivePracticePolicy } from '@/lib/srs/contract';

export const OBJECTIVE_POLICIES: ObjectivePracticePolicy[] = [
  {
    objectiveId: 'obj_quadratic_roots',
    priority: 'essential',
    minProblemFamilies: 2,
    minCoverageThreshold: 0.6,
    minRetentionThreshold: 0.7,
  },
  {
    objectiveId: 'obj_linear_systems',
    priority: 'essential',
    minProblemFamilies: 2,
    minCoverageThreshold: 0.6,
    minRetentionThreshold: 0.7,
  },
  {
    objectiveId: 'obj_extension_challenge',
    priority: 'extension',
    minProblemFamilies: 1,
    minCoverageThreshold: 0.4,
    minRetentionThreshold: 0.5,
  },
];
```

### Priority Override (Teacher Intervention)

Teachers can change priority via `updateObjectivePriority` mutation:

```ts
// convex/teacher/srs-mutations.ts
export const updateObjectivePriority = mutation({
  args: {
    objectiveId: v.string(),
    priority: v.union(v.literal('essential'), v.literal('supporting'), v.literal('extension'), v.literal('triaged')),
  },
  handler: async (ctx, args) => {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const policy = await ctx.db
      .query('objective_policies')
      .withIndex('by_objectiveId', [args.objectiveId])
      .first();

    if (!policy) throw new Error('Policy not found');
    // Validate teacher owns the class...

    await ctx.db.patch(policy._id, { priority: args.priority });
  },
});
```

---

## 4. Implement CardStore and ReviewLogStore

The SRS core library is backend-agnostic. You provide implementations of two interfaces:

### Interfaces

```ts
// lib/srs/adapters.ts
import type { SrsCardState, SrsReviewLogEntry } from './contract';

export interface CardStore {
  getCard(id: string): Promise<SrsCardState | null>;
  getCardsByStudent(studentId: string): Promise<SrsCardState[]>;
  getCardsByObjective(objectiveId: string): Promise<SrsCardState[]>;
  getCardByStudentAndFamily(studentId: string, problemFamilyId: string): Promise<SrsCardState | null>;
  getDueCards(studentId: string, now: string): Promise<SrsCardState[]>;
  saveCard(card: SrsCardState): Promise<void>;
  saveCards(cards: SrsCardState[]): Promise<void>;
}

export interface ReviewLogStore {
  saveReview(entry: SrsReviewLogEntry): Promise<void>;
  getReviewsByCard(cardId: string): Promise<SrsReviewLogEntry[]>;
  getReviewsByStudent(studentId: string, since?: string): Promise<SrsReviewLogEntry[]>;
}
```

### Convex Implementation

```ts
// convex/srs/adapters.ts
import { InMemoryCardStore, InMemoryReviewLogStore } from '@/lib/srs/adapters';
import type { CardStore, ReviewLogStore } from '@/lib/srs/adapters';
import type { SrsCardState, SrsReviewLogEntry } from '@/lib/srs/contract';

// Convex-backed CardStore — ctx is a MutationCtx or QueryCtx passed via constructor
export class ConvexCardStore implements CardStore {
  constructor(private ctx: any) {} // Use MutationCtx | QueryCtx from convex/_generated/server

  async getCard(id: string): Promise<SrsCardState | null> {
    const doc = await this.ctx.db.get(id as Id<'srs_cards'>);
    return doc ? mapDbCardToContract(doc) : null;
  }

  async getCardsByStudent(studentId: string): Promise<SrsCardState[]> {
    const cards = await this.ctx.db
      .query('srs_cards')
      .withIndex('by_student', [studentId])
      .collect();
    return cards.map(mapDbCardToContract);
  }

  async getDueCards(studentId: string, now: string): Promise<SrsCardState[]> {
    const nowMs = new Date(now).getTime();
    const cards = await this.getCardsByStudent(studentId);
    return cards.filter((card) => new Date(card.dueDate).getTime() <= nowMs);
  }

  async saveCard(card: SrsCardState): Promise<void> {
    const existing = await this.getCard(card.cardId);
    if (existing) {
      await this.ctx.db.patch(card.cardId as Id<'srs_cards'>, mapContractToDbCard(card));
    } else {
      await this.ctx.db.insert('srs_cards', mapContractToDbCard(card));
    }
  }

  async saveCards(cards: SrsCardState[]): Promise<void> {
    for (const card of cards) {
      await this.saveCard(card);
    }
  }

  // ... getCardsByObjective, getCardByStudentAndFamily
}

// Convex-backed ReviewLogStore
export class ConvexReviewLogStore implements ReviewLogStore {
  constructor(private ctx: any) {} // Use MutationCtx from convex/_generated/server

  async saveReview(entry: SrsReviewLogEntry): Promise<void> {
    await this.ctx.db.insert('srs_review_log', mapReviewLogToDb(entry));
  }

  async getReviewsByCard(cardId: string): Promise<SrsReviewLogEntry[]> {
    const entries = await ctx.db
      .query('srs_review_log')
      .withIndex('by_card', [cardId])
      .collect();
    return entries.map(mapDbReviewLogToContract);
  }

  // ... getReviewsByStudent
}
```

### Required Convex Schema Indexes

```ts
// convex/schema.ts
srs_cards: defineTable({
  studentId: v.string(),
  objectiveId: v.string(),
  problemFamilyId: v.string(),
  // ... other fields
})
  .index('by_student', ['studentId'])
  .index('by_objective', ['objectiveId'])
  .index('by_student_and_family', ['studentId', 'problemFamilyId'])
  .index('by_student_and_due', ['studentId', 'dueDate']),

srs_review_log: defineTable({
  cardId: v.string(),
  studentId: v.string(),
  reviewedAt: v.string(),
  // ... other fields
})
  .index('by_card', ['cardId'])
  .index('by_student_reviewedAt', ['studentId', 'reviewedAt']),
```

---

## 5. Create Daily Practice Page

Use the queue engine to build daily practice sessions.

### Queue Construction

```tsx
// app/student/practice/page.tsx (Server Component)
import { buildDailyQueue } from '@/lib/srs/queue';
import type { SrsSessionConfig } from '@/lib/srs/contract';

export default async function DailyPracticePage({ params }: { params: { studentId: string } }) {
  const cardStore = new ConvexCardStore();
  const policyStore = new ConvexObjectivePolicyStore();

  const studentId = params.studentId;
  const now = new Date().toISOString();

  // Load all cards and policies
  const allCards = await cardStore.getCardsByStudent(studentId);
  const policies = await policyStore.getAllPolicies();
  const policyMap = new Map(policies.map((p) => [p.objectiveId, p]));

  const config: SrsSessionConfig = {
    newCardsPerDay: 5,
    maxReviewsPerDay: 20,
    prioritizeOverdue: true,
  };

  const queue = buildDailyQueue(allCards, policyMap, config, now);

  return <PracticeQueueView items={queue} studentId={studentId} />;
}
```

### Queue Item Rendering

```tsx
// components/student/PracticeQueueView.tsx
'use client';

import { PracticeQueueItem } from './PracticeQueueItem';

export function PracticeQueueView({
  items,
  studentId,
}: {
  items: QueueItem[];
  studentId: string;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">All done for today! Come back tomorrow.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <PracticeQueueItem key={item.card.cardId} item={item} studentId={studentId} />
      ))}
    </div>
  );
}
```

---

## 6. Wire Submission Adapter

When a student completes a practice activity, process the submission through the SRS pipeline.

### Submission Processing

```ts
// lib/practice/submission-srs-adapter.ts
import { processReview } from '@/lib/srs/review-processor';
import { createCard } from '@/lib/srs/scheduler';
import type { CardStore, ReviewLogStore } from '@/lib/srs/adapters';
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract';

export async function processPracticeSubmission(args: {
  submission: PracticeSubmissionEnvelope;
  studentId: string;
  cardStore: CardStore;
  reviewLogStore: ReviewLogStore;
  now?: string;
}): Promise<{ cardId: string; rating: string }> {
  const { submission, studentId, cardStore, reviewLogStore } = args;
  const now = args.now ?? new Date().toISOString();

  // Resolve problem family for this activity
  const problemFamilyId = resolveProblemFamilyForActivity(submission.activityId);
  const objectiveId = resolveObjectiveForProblemFamily(problemFamilyId);

  // Find or create the SRS card
  let card = await cardStore.getCardByStudentAndFamily(studentId, problemFamilyId);

  if (!card) {
    // First-seen: create new card
    card = createCard({
      studentId,
      objectiveId,
      problemFamilyId,
      now,
    });
    await cardStore.saveCard(card);
  }

  // Process the review through FSRS
  const result = processReview({
    card,
    submission,
    now,
  });

  // Persist updated card and review log
  await cardStore.saveCard(result.updatedCard);
  await reviewLogStore.saveReview(result.reviewLog);

  return { cardId: card.cardId, rating: result.rating };
}
```

### Convex Mutation Wrapper

```ts
// convex/student/practice-mutations.ts
export const submitPracticeReview = mutation({
  args: {
    submission: PracticeSubmissionEnvelopeSchema,
  },
  handler: async (ctx, args) => {
    const identity = ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const cardStore = new ConvexCardStore();
    const reviewLogStore = new ConvexReviewLogStore();

    const result = await processPracticeSubmission({
      submission: { ...args.submission, studentId: identity.subject },
      cardStore,
      reviewLogStore,
    });

    return result;
  },
});
```

---

## Quick Reference

### Key Imports

| Module | Exports |
|--------|---------|
| `lib/srs/contract.ts` | `SrsCardState`, `SrsReviewLogEntry`, `SrsSession`, `SrsSessionConfig`, `ObjectivePracticePolicy`, `ObjectivePriority`, `SrsRating` |
| `lib/srs/adapters.ts` | `CardStore`, `ReviewLogStore`, `InMemoryCardStore`, `InMemoryReviewLogStore` |
| `lib/srs/scheduler.ts` | `createCard`, `reviewCard`, `getDueCards`, `previewInterval`, `mapSrsRatingToGrade` |
| `lib/srs/queue.ts` | `buildDailyQueue`, `isOverdue`, `daysOverdue`, `QueueItem` |
| `lib/srs/review-processor.ts` | `processReview`, `ReviewProcessorInput`, `ReviewProcessorResult` |
| `lib/practice/srs-rating.ts` | `mapPracticeToSrsRating`, `computeBaseRating`, `applyTimingToRating`, `SrsRating` |

### FSRS Rating Scale

| Rating | Meaning | FSRS Grade |
|--------|---------|------------|
| `Again` | Incorrect or misconception | 1 |
| `Hard` | Correct with hints/reveals | 2 |
| `Good` | Correct, no assistance | 3 |
| `Easy` | Correct and fast | 4 |

### Card States

| State | Meaning |
|-------|---------|
| `new` | Never reviewed |
| `learning` | In learning steps |
| `review` | In review cycle |
| `relearning` | After a lapse (Again rating) |

### Session Config Defaults

```ts
const DEFAULT_SESSION_CONFIG: SrsSessionConfig = {
  newCardsPerDay: 5,
  maxReviewsPerDay: 20,
  prioritizeOverdue: true,
};
```
