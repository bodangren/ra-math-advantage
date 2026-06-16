# Specification: Repository Hygiene Remediation

## Overview

The repository has accumulated significant hygiene debt: 96 dirty files in the working tree, 6 uncommitted stashes, incomplete spec-compliance phases (3-7), ESLint v8/v9 configuration gaps, BM2 pre-existing test reds, and IM3 React 19 lint rule suppressions. This track systematically remediates each issue to restore a clean, verifiable repo state.

## Functional Requirements

- FR-1: Clean working tree — all 96 dirty files either committed with meaningful messages or reverted to known-good state
- FR-2: Resolve remaining 6 stashes — evaluate each for merge, branch preservation, or discard
- FR-3: Complete spec-compliance Phase 3 (FR-5 typed JSDoc annotations) for the highest-impact files
- FR-4: Complete spec-compliance Phase 7 (final verification) — guards, lint, typecheck all pass
- FR-5: Fix BM2 pre-existing test reds (UserMenu AuthProvider wrapper, GradebookDrillDown timeout)
- FR-6: Re-enable IM3 React 19 eslint rules by fixing the 20 violations across 14 files
- FR-7: Ensure IM3 and BM2 TypeScript compilation succeeds (`npx tsc --noEmit`)
- FR-8: Verify IM3 and BM2 lint passes with zero errors

## Non-Functional Requirements

- NFR-1: Every commit must pass the lint gate for the affected workspace
- NFR-2: No commit may introduce new TypeScript errors
- NFR-3: Changes must be atomic — one logical fix per commit

## Acceptance Criteria

- AC-1: `git status --short` returns empty after track completion
- AC-2: `git stash list` returns empty
- AC-3: `npm run lint --workspace=apps/integrated-math-3` exits 0
- AC-4: `npm run lint --workspace=apps/bus-math-v2` exits 0
- AC-5: `npx tsc --noEmit -p apps/integrated-math-3/tsconfig.json` exits 0 (or only pre-existing errors unchanged)
- AC-6: `npx tsc --noEmit -p apps/bus-math-v2/tsconfig.json` exits 0 (or only pre-existing errors unchanged)
- AC-7: IM3 React 19 eslint rules re-enabled with zero violations
- AC-8: BM2 UserMenu and GradebookDrillDown tests pass

## Out of Scope

- Completing spec-compliance Phases 4-6 (JSDoc @throws, exported surface, kst-lesser-holes quality) — deferred to existing track
- New feature development
- Dependency upgrades
- Curriculum content changes
