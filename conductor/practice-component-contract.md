# Practice Component Contract

> Canonical reference for the activity/practice system. Carried forward from bus-math-v2.

## Contract Version

`practice.v1` -- all practice components and submissions use this version identifier.

## Architecture Overview

The practice system has three layers:

```
1. Component Registry    componentKey string → React component (lazy-loaded)
2. Activity Props        Zod schemas defining valid props per componentKey
3. Submission Envelope   Normalized structure every component emits on submit
```

### Source File (to be created)

`lib/practice/contract.ts` -- defines the envelope schema, builder helpers, and normalization functions. This file is a direct port from bus-math-v2.

---

## Canonical Modes

Every practice component declares one mode that governs its behavior:

| Mode | Purpose |
|------|---------|
| `worked_example` | Read-only instruction; shows explicit reasoning steps |
| `guided_practice` | Includes scaffolding, hints, partial structure, coachmarks |
| `independent_practice` | Reduced scaffolding, fresh problems |
| `assessment` | Auto-graded, teacher-reviewed, or hybrid |
| `teaching` | Instructor/preview view |

## Submission Status

| Status | Meaning |
|--------|---------|
| `draft` | Work in progress |
| `submitted` | Student submitted |
| `graded` | Teacher/system graded |
| `returned` | Returned with feedback |

---

## Submission Envelope

Every component emits a `PracticeSubmissionEnvelope` on submit:

```typescript
type PracticeSubmissionEnvelope = {
  contractVersion: 'practice.v1';
  activityId: string;
  mode: PracticeMode;
  status: PracticeSubmissionStatus;
  attemptNumber: number;          // positive integer
  submittedAt: string;            // ISO timestamp
  answers: Record<string, unknown>;  // raw responses by part ID
  parts: PracticeSubmissionPart[];   // per-part detail
  artifact?: Record<string, unknown>; // richer deliverable (graph, table, etc.)
  interactionHistory?: unknown[];    // event log
  analytics?: Record<string, unknown>;
  studentFeedback?: string;
  teacherSummary?: string;
};
```

### PracticeSubmissionPart

```typescript
type PracticeSubmissionPart = {
  partId: string;
  rawAnswer: unknown;
  normalizedAnswer?: string;
  isCorrect?: boolean;
  score?: number;
  maxScore?: number;
  misconceptionTags?: string[];
  hintsUsed?: number;
  revealStepsSeen?: number;
  changedCount?: number;
  firstInteractionAt?: string;
  answeredAt?: string;
  wallClockMs?: number;
  activeMs?: number;
};

### Timing Evidence

> Timing is **optional process evidence**, not a standalone grade. It belongs in canonical fields, not arbitrary `analytics`.

```typescript
type PracticeTimingConfidence = "high" | "medium" | "low";

type PracticeTimingSummary = {
  startedAt: string;
  submittedAt: string;
  wallClockMs: number;
  activeMs: number;
  idleMs: number;
  pauseCount: number;
  focusLossCount: number;
  visibilityHiddenCount: number;
  longestIdleMs?: number;
  confidence: PracticeTimingConfidence;
  confidenceReasons?: string[];
};
```

The `timing` field is added to the `PracticeSubmissionEnvelope`:

```typescript
type PracticeSubmissionEnvelope = {
  // ... existing fields
  timing?: PracticeTimingSummary;
};
```

Design notes:
- `wallClockMs` is the total elapsed time from `startedAt` to `submittedAt`.
- `activeMs` is the subset of wall-clock time when the student was actively engaged. Hidden tabs, blur/focus losses, and idle gaps do not count.
- `confidence` is deterministic: `high` for clean sessions, `medium` for minor interruptions, `low` for significant idle gaps or focus losses.
- `confidenceReasons` are machine-readable so future SRS adapters can down-weight timing when appropriate.
- Backward compatibility: envelopes without `timing` remain valid.

---

## Component Registry Pattern

`lib/activities/registry.ts` maps `componentKey` strings to React components:

```typescript
const activityRegistry: Record<ActivityComponentKey, ComponentType<any>>;

function getActivityComponent(key: string): ComponentType<any> | null;
```

### Component Interface

Every activity component receives:

```typescript
interface ActivityComponentProps {
  activity: Activity;  // includes componentKey and typed props
  onSubmit?: (payload: PracticeSubmissionEnvelope) => void;
  onComplete?: () => void;
}
```

---

## Activity Database Model

Activities are stored in Convex (`activities` table):

| Field | Type | Description |
|-------|------|-------------|
| `componentKey` | string | Maps to registry entry |
| `displayName` | string | Human-readable name |
| `description` | string? | Optional description |
| `props` | JSON | Component-specific configuration |
| `gradingConfig` | JSON? | Auto-grade rules, rubric, passing score |
| `standardId` | ID? | Link to `competency_standards` |

### Grading Config

```typescript
type GradingConfig = {
  autoGrade: boolean;
  passingScore?: number;      // 0-100
  partialCredit: boolean;
  rubric?: Array<{ criteria: string; points: number }>;
};
```

---

## IM3 Component Keys (Planned)

These are the activity types needed for the Integrated Math 3 curriculum. Business-specific components from bus-math-v2 (spreadsheet, simulations, journal-entry) are **not** carried forward.

### Core Math Activities

| Component Key | Description | Modules |
|---------------|-------------|---------|
| `comprehension-quiz` | Multiple-choice, true/false, short-answer quiz | All |
| `fill-in-the-blank` | Equation/expression completion | All |
| `tiered-assessment` | Multi-tier assessment (knowledge → application) | All |
| `graphing-explorer` | Interactive graph with transformations | 1, 2, 3, 4, 5, 6, 7, 9 |
| `equation-solver` | Step-by-step equation solving workspace | 1, 3, 4, 5, 6, 7 |
| `function-analyzer` | Domain, range, end behavior, key features | 2, 4, 5, 6, 7, 9 |
| `drag-drop-categorization` | Sort/classify items into categories | 1, 2, 7, 8 |
| `statistical-explorer` | Data visualization, distributions, z-scores | 8 |
| `unit-circle-trainer` | Interactive unit circle with angle/value practice | 9 |

> This list is a starting point. Add new component keys as curriculum content is authored. Each new key needs a Zod props schema and a React component registered in the registry.

---

## Design Principles

1. **One componentKey → one React component** -- deterministic lookup
2. **All submissions use the practice.v1 envelope** -- normalized for persistence and teacher review
3. **Part-level tracking** -- raw answer, normalized answer, correctness, misconception tags
4. **Mode-based behavior** -- same component adapts across worked_example → assessment
5. **Deterministic evaluation first** -- compute correctness before any AI-assisted analysis
6. **Course-agnostic contract** -- the envelope, modes, and registry pattern are reusable across courses; only componentKeys and props schemas are course-specific
