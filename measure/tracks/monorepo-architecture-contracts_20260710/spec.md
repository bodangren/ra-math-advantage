# Specification: Monorepo Architecture Contracts and Enforcement

## Overview

Turn the LMS modularity audit into an enforceable architecture contract. The
current guard checks only three regular-expression patterns, root commands
exercise a small subset of workspaces, and eight of twenty non-template
packages are absent from the CI package matrix. This track establishes a
machine-readable ownership and dependency graph before extraction work begins.

## Functional Requirements

1. Create a versioned architecture manifest listing every app/package, owner,
   layer, allowed dependencies, public entry points, domain classification,
   quality commands, and temporary-debt references.
2. Enforce no app-to-app imports, package-to-app imports, generated Convex
   imports, undeclared dependencies, prohibited layer edges, domain-content
   leakage, package cycles, or private/deep source imports.
3. Derive workspace validation from the actual workspace graph rather than a
   hand-maintained partial list.
4. Add all twenty non-template packages to CI lint, test, and typecheck gates;
   require root quality commands to exercise the same inventory.
5. Restore `math-content` lint and standalone typecheck so it can join the
   blocking package matrix.
6. Generate package-DAG, ownership, export-surface, and gate-coverage reports.
7. Permit temporary violations only through an explicit debt record containing
   owner, rationale, follow-up track, and expiration; exceptions cannot hide
   new violations or pass after expiry.
8. Provide architecture-test fixtures that deliberately inject each violation
   class and prove the guard fails.

## Non-Functional Requirements

- The manifest is the human-approved source of architecture policy; generated
  reports describe the current repository.
- Checks are deterministic, fast enough for local pre-commit use, and
  platform-independent.
- Architecture-lint tests complement behavioral tests and never substitute for
  them.
- Existing app-owned curriculum and design-system boundaries remain valid.
- No dependency changes are made without explicit approval.

## Acceptance Criteria

- Every current workspace appears exactly once in both architecture and CI
  coverage reports.
- Injected app import, deep import, cycle, domain leak, undeclared dependency,
  and missing-gate fixtures fail with actionable messages.
- All packages pass lint, test, and typecheck, including `math-content`.
- Root and CI workspace inventories cannot drift silently.
- Existing boundary debt is explicit, owned, expiring, and linked to one of the
  approved follow-up tracks.

## Out of Scope

- Moving shared LMS backend code or app scaffolding.
- Fixing the `activity-components` dependency inversion beyond registering it
  as owned debt for `app-platform-consolidation_20260710`.
- Changing course-specific design systems or curriculum ownership.

