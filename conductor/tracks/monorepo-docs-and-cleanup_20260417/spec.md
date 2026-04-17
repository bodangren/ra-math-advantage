# Specification: Monorepo Docs and Cleanup

## Overview

Close migration with maintainable docs and minimal technical residue so future contributors can work safely.

## Dependencies

- `monorepo-ci-deploy-hardening_20260417`

## Functional Requirements

- FR-1: Integration Docs: write root integration docs for package creation and app adoption.
- FR-2: Cleanup: remove temporary compatibility shims and stale path references.
- FR-3: Ownership Rules: document package/app ownership boundaries and review checklist.
- FR-4: Final Validation: confirm no stale old-layout imports remain.

## Non-Functional Requirements

- Must preserve behavior while changing structure/import boundaries.
- Must keep package boundaries app-agnostic and enforceable.
- Must include tests for every extracted or reconciled public module.
- Must document every intentional deferment in `reconciliation-notes.md`.

## Acceptance Criteria

- [ ] Root integration docs are complete and accurate.
- [ ] Temporary migration shims are removed or explicitly justified.
- [ ] No stale old-root path references remain.
- [ ] Final lint/test/build/typecheck are green for both apps.

## Out of Scope

- New package extraction.
- New feature development.
