# Component Approval - Developer Notes

## Running the Review Site Locally

The component approval review site is a developer-only feature that is **never** exposed on the production site.

### Prerequisites

1. Convex backend must be running:
   ```bash
   npx convex dev
   ```

2. Next.js development server must be running:
   ```bash
   npm run dev
   ```

### Accessing the Review Site

Navigate to: `http://localhost:3000/dev/component-approval`

**Important:** This route is blocked in production and preview environments. It is only accessible when:
- `NODE_ENV` is set to `development` or `test`
- The user has an `admin` role

### Authentication

The review site uses the existing authentication system. You must be logged in as a user with `admin` role to access the review queue.

## Approval Status Semantics

Each component can have one of the following approval statuses:

| Status | Meaning |
|--------|---------|
| `unreviewed` | Component has never been reviewed |
| `approved` | Component has been manually approved by a developer |
| `needs_changes` | Component has issues that must be addressed before approval |
| `rejected` | Component is not suitable and should not be used |

### Stale Approval

A component's approval becomes **stale** when its content changes after approval. This is detected by comparing:

1. The `contentHash` stored in the approval summary
2. The current content hash computed from component props/content

When a component is stale:
- The stored approval status remains unchanged
- The queue UI displays a "Stale" indicator
- The stale approval should be re-reviewed when time permits

**Note:** Stale approvals do not automatically change the approval status. The component must be re-reviewed manually.

## Unresolved Review Notes and LLM Audits

Review notes (comments) from `needs_changes` and `rejected` reviews are stored in the `component_reviews` table with their `resolvedAt` field set to `undefined`.

### LLM Audit Query

The `internal.dev.getAuditContext` query returns all unresolved review notes for components. This query:
- Returns only reviews where `resolvedAt` is `undefined`
- Returns `needs_changes` and `rejected` reviews only
- Does NOT return `approved` reviews
- Includes issue tags, priority, and placement context

### How LLMs Use This Data

LLMs can query unresolved review notes to:
1. Identify components that need attention
2. Propose repairs based on the issue tags and comments
3. Generate repair suggestions without making any decisions

### LLM Restrictions

LLMs are **NOT** permitted to:
1. Mark components as approved
2. Resolve review notes without a new human review
3. Automatically dismiss comments as resolved

Any repair proposed by an LLM must go through the same manual review queue for human approval.

## Review Workflow

1. **Identify**: Find unreviewed or stale components in the queue
2. **Test**: Use the component harness to exercise teaching, guided, and practice modes
3. **Decide**: Select approval status and add comments if needed
4. **Document**: Add issue tags and priority to help future repair work
5. **Submit**: The review is stored and the component's approval summary is updated

## Data Model

- `activities` table: Has an `approval` field for activity components
- `component_approvals` table: Fallback approval storage for example and practice components
- `component_reviews` table: Immutable-ish review history with comments, tags, and timestamps

## Queue Coverage

The review queue discovers targets from persisted curriculum data across all three component kinds:

- **Activities**: Queried from the `activities` table. Placement context is resolved via `buildActivityPlacementMap` which maps `phase_sections.content.activityId` to lesson/phase/sequence order.
- **Examples**: Derived from `phase_sections` where `phaseType === "worked_example"` and the section has an `activityId` reference. Component kind is `example`.
- **Practice**: Derived from `phase_sections` where `phaseType` is one of `guided_practice`, `independent_practice`, or `assessment` and the section has an `activityId` reference. Component kind is `practice`.

Queue filtering supports: `componentKind`, `status`, `onlyStale`, and all filters from the original spec. Orphaned `component_approvals` rows (for deleted curriculum) are preserved in the queue to maintain review history accessibility.

## Content Hashing

All three component kinds use deterministic content hashing via `computeComponentContentHash` (from `lib/activities/content-hash`). The hash is computed from:

- `componentKind` (example | activity | practice)
- `componentKey` (the registered activity key)
- `props` (component-specific configuration)
- `gradingConfig` (when present)

Approval metadata, reviewer IDs, timestamps, and review history are **excluded** from the hash. This ensures that re-reviewing the same content produces the same hash, making stale detection reliable.

A component's approval becomes stale when its current hash differs from the stored `approval.contentHash`. The stored status itself is not changed automatically — re-review is required.

## LLM Audit Query

The `internal.dev.getAuditContext` query returns all `needs_changes` and `rejected` reviews where `resolvedAt` is `undefined`. It does NOT return `approved` reviews. The query uses `.withIndex("by_status")` and `.filter()` on the `resolvedAt` field to efficiently bound results.

LLMs may use this data to propose repairs but **may not**:
1. Mark components as approved
2. Resolve review notes without a new human review
3. Automatically dismiss comments as resolved

## Remaining Limitations

The following issues are known and tracked in `conductor/tech-debt.md`:

1. **`submitReview` takes `createdBy` as an argument** — The mutation accepts a `createdBy` parameter rather than deriving the reviewer identity from the Convex auth context. This is mitigated by route-level `requireDeveloperRequestClaims` checks, but the internal function boundary remains trust-dependent.
2. **Approval race condition** — Concurrent reviews of the same component can silently overwrite each other. There is no versioning or optimistic-concurrency control on the approval summary row.
3. **N+1 hash computation in `listReviewQueue`** — The queue computes up to 500 SHA-256 hashes per query. This is functional but may become a Convex billing/performance concern at scale.
4. **No Convex-layer authorization** — Auth guards live entirely in the Next.js server layer. The Convex internal functions do not independently verify the caller's identity or role.
5. **Server-side `componentKind` validation is not enforced** — The client sends `componentKind` in the review payload, but the server does not verify it against the actual placement context in `phase_sections`.

## Tech Debt

- ~~Content hashing for example/practice components uses a placeholder string (`"todo-hash-for-example-practice"` in `convex/dev.ts:113`)~~ — **Resolved in Phase 2**; `computeComponentContentHash` now used for all kinds
- ~~Queue coverage missing for embedded examples/practice~~ — **Resolved in Phase 1**; `listReviewQueue` now discovers example and practice from `phase_sections` + `phase_versions`
- ~~Review harnesses use hardcoded sample data~~ — **Resolved in Phase 3**; harnesses now render from stored props/steps
- ~~Approval UI does not enforce harness checklist before approve~~ — **Resolved in Phase 3**; `harnessCanApprove` state gates the approve button
- ~~Review queue filter state split between view/list/client hook~~ — **Resolved in code review 2026-04-15**; `ReviewQueueView` now uses the client's `filters`/`setFilters` directly
- Convex function-level auth checks are not implemented for internal mutations. Route-level guards are in place via `requireDeveloperRequestClaims`.
