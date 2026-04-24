# Plan: Fix getTeacherClassProficiencyHandler N+1 Queries

## Phase 1: Pre-fetch Data Outside S×O Loop [x]

- [x] Task: Write test for getTeacherClassProficiencyHandler query count reduction
    - [x] Create test that mocks Convex DB and verifies pre-fetch queries are called once, not per-objective
    - [x] Verify output matches pre-refactor behavior

- [x] Task: Pre-fetch problem_families into objectiveId→families Map
    - [x] Collect all unique objectiveIds from all student cards
    - [x] Batch-fetch all problem_families with by_objectiveId index
    - [x] Build Map<string, ProblemFamily[]> keyed by objectiveId

- [x] Task: Pre-fetch timing_baselines for all problem family IDs
    - [x] Collect all unique problemFamilyIds from pre-fetched families
    - [x] Batch-fetch all timing_baselines with by_problem_family index
    - [x] Build TimingBaselines map

- [x] Task: Pre-fetch activity_submissions for all students
    - [x] Collect all unique studentIds
    - [x] Batch-fetch all activity_submissions with by_user index per student
    - [x] Build Map<studentId, submission[]> for fetchSubmissionTimings

- [x] Task: Pre-fetch competency_standards and objective_policies
    - [x] Batch-fetch all competency_standards by_code for all objectiveIds
    - [x] Batch-fetch all objective_policies by_standardId for matched standards
    - [x] Build lookup Maps

- [x] Task: Refactor computeProficiencyForObjective to accept pre-fetched data
    - [x] Add PreFetchedData parameter type
    - [x] Replace internal DB queries with Map lookups
    - [x] Update getTeacherClassProficiencyHandler to build and pass PreFetchedData

- [x] Task: Run full test suite, typecheck, and build
    - [x] Run `npx vitest run` in apps/integrated-math-3
    - [x] Run `npx tsc --noEmit` in apps/integrated-math-3
    - [x] Run `npm run build` in apps/integrated-math-3
    - [x] Fix any failures

- [x] Task: Update tech-debt.md and lessons-learned.md
    - [x] Mark getTeacherClassProficiencyHandler N+1 as Resolved in tech-debt.md
    - [x] Add lesson about batch pre-fetching for nested loop patterns

- [x] Task: Commit with checkpoint
    - [x] Stage changes
    - [x] Commit with model name in subject line
