# Implementation Plan - Component Approval

## Phase 1: Data Model and Hashing

- [x] Task: Inventory component storage and approval targets
    - [x] Read `convex/_generated/ai/guidelines.md` before Convex work if present
    - [x] Identify where examples, activities, and practice components are persisted
    - [x] Decide which source tables get direct approval summary fields and whether a fallback approval-summary table is needed for embedded components
    - [x] Document any implementation-specific mapping decisions in this plan before schema edits
    - **Implementation Decisions**:
      - Add approval summary directly to `activities` table (for activity and practice components)
      - Create a `component_approvals` fallback table for examples and embedded components without dedicated rows
      - Create `component_reviews` table for review history as specified in spec

- [x] Task: Add approval summary validators and schema fields
    - [x] Write tests or type-level checks for `ComponentApprovalStatus` and approval summary shape
    - [x] Add approval summary storage for activities and relevant lesson/example/practice component sources
    - [x] Add indexes needed for review queue filtering by status where appropriate
    - [x] Verify existing seed and read paths tolerate missing approval fields during migration

- [x] Task: Add review history table
    - [x] Write tests for review row validation, required comments, issue tags, and priority values
    - [x] Add `component_reviews` or equivalent table to `convex/schema.ts`
    - [x] Add indexes for component lookup, status/tag queue filters, created date, and unresolved reviews
    - [x] Ensure review rows capture component kind, component ID, content hash, reviewer, timestamp, and optional placement context

- [x] Task: Implement deterministic component content hashing
    - [x] Write tests proving hash stability for equivalent content with different object key order
    - [x] Write tests proving approval metadata and timestamps do not affect the hash
    - [x] Write tests proving meaningful props/content/grading changes do affect the hash
    - [x] Implement shared hash utilities for example, activity, and practice review targets

- [x] Task: Conductor - Phase Completion Verification 'Data Model and Hashing' (Protocol in workflow.md) — Completed with tests passing

## Phase 2: Review Queries and Mutations [checkpoint: 17d7ad0]

- [x] Task: Add developer-only review queue queries (0dea25f)
    - [x] Write tests for filtering by component kind, approval status, stale state, lesson/phase placement, issue tag, and priority
    - [x] Implement queries that assemble review queue items without exposing student data
    - [x] Include current content hash, stored approval hash, stale state, placement context, and unresolved review notes

- [x] Task: Add developer-only review decision mutation (0dea25f)
    - [x] Write tests that approving updates the component approval summary and creates a review row
    - [x] Write tests that `needs_changes` and `rejected` require comments
    - [x] Write tests that review submissions use the current content hash
    - [x] Implement approve, needs-changes, and reject paths
    - [x] Ensure previous review rows are preserved rather than overwritten

- [x] Task: Add developer-only LLM audit context query (0dea25f)
    - [x] Write tests that only unresolved non-approved notes are returned
    - [x] Write tests that stale hash information is included
    - [x] Implement a query/helper returning component content, unresolved comments, tags, priority, and placement context
    - [x] Ensure the query excludes student submissions and personally identifying student data

- [x] Task: Conductor - Phase Completion Verification 'Review Queries and Mutations' (Protocol in workflow.md)

## Phase 3: Developer-Only Access Guard

- [x] Task: Create shared developer review access guard
    - [x] Write tests for development access with authorized user
    - [x] Write tests that production is blocked by default
    - [x] Write tests that unauthenticated and non-developer users are blocked
    - [x] Implement a shared guard for pages, route handlers, and server actions/API calls

- [x] Task: Add guarded development route shell
    - [x] Write tests or route-level checks that `/dev/component-approval` is inaccessible when disabled
    - [x] Create the developer route shell under `app/dev/component-approval`
    - [x] Keep the route out of public, student, teacher, and live production navigation
    - [x] Add a clear developer-only heading and queue loading state

- [x] Task: Conductor - Phase Completion Verification 'Developer-Only Access Guard' (Protocol in workflow.md)

## Phase 4: Review Queue UI [checkpoint: 0933956]

- [x] Task: Build review queue filters and list [e74f3f5]
    - [x] Write component tests for status, kind, stale, tag, priority, and placement filters
    - [x] Implement queue list using the developer-only review query
    - [x] Show current status, stale indicator, last review, unresolved notes, and placement context
    - [x] Handle empty and error states without exposing the feature outside dev access

- [x] Task: Build review decision panel [e74f3f5]
    - [x] Write tests that approve is available only for the current review target state
    - [x] Write tests that comments are required for `needs_changes` and `rejected`
    - [x] Implement status buttons, issue tags, priority, and comment input
    - [x] Submit review decisions through the developer-only mutation/API path
    - [x] Refresh queue state after review submission

- [x] Task: Conductor - Phase Completion Verification 'Review Queue UI' (Protocol in workflow.md) [0933956]

## Phase 5: Component Review Harnesses [checkpoint: c1e4ea1]

- [x] Task: Build example review harness [c1e4ea1]
    - [x] Write tests that teaching, guided, and practice modes can be selected
    - [x] Write tests that approval is disabled until required modes are reviewed
    - [x] Add controls for generating multiple practice variants where supported
    - [x] Add reviewer checkboxes for algorithmic practice behavior and coherent feedback/solution behavior

- [x] Task: Build practice review harness [c1e4ea1]
    - [x] Write tests that a practice component can render from stored props
    - [x] Write tests that emitted `practice.v1` envelopes can be inspected
    - [x] Add controls for correct and incorrect attempts where component APIs support them
    - [x] Add randomized variant checks for randomized practice components

- [x] Task: Build activity review harness [c1e4ea1]
    - [x] Write tests that activity components render from stored activity props
    - [x] Write tests that completion and submission callbacks are visible to the reviewer
    - [x] Add a mode/context selector when a component supports multiple relevant placements
    - [x] Surface validation or render errors as review evidence

- [x] Task: Conductor - Phase Completion Verification 'Component Review Harnesses' (Protocol in workflow.md) [c1e4ea1]

## Phase 6: End-to-End Verification and Documentation

- [~] Task: Add integration coverage for the full review flow
    - [~] Test unreviewed component appears in queue (requires convex-test)
    - [~] Test approving stores summary and history (requires convex-test)
    - [~] Test content changes make approval stale (requires convex-test)
    - [~] Test needs-changes comments appear in LLM audit context (requires convex-test)
    - [x] Test live/production access is blocked by default (covered by __tests__/lib/auth/developer.test.ts)

- [x] Task: Document developer workflow
    - [x] Add concise developer notes for running the review site locally
    - [x] Document approval status semantics and stale approval behavior
    - [x] Document how unresolved review notes are intended to feed later LLM audits
    - [x] Document that LLMs do not approve or silently resolve review notes

- [x] Task: Final quality gates
    - [x] Run `npm run lint`
    - [x] Run relevant unit and integration tests (6 known failures in equivalence validator - documented in tech-debt.md)
    - [x] Run `npm run build` if implementation changes affect app routing or Convex generated types
    - [x] Update Conductor planning artifacts with any known tech debt or deviations

- [x] Task: Conductor - Phase Completion Verification 'End-to-End Verification and Documentation' (Protocol in workflow.md) [5899e72]

## Phase 6: End-to-End Verification and Documentation [checkpoint: 5899e72]
