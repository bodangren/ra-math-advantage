# Anti-Slop Oxlint Integration Plan

## Phase 1: Contract and Schema

- [x] Task 1: Record the anti-slop integration contract [3a078a21]
  - [x] Record the Oxlint version and the generic-rule scope in `measure/tech-stack.md`.
  - [x] Record the separate command and the no-Effect decision.

## Phase 2: Tests

- [x] Task 2: Define configuration checks
  - [x] Verify the plugin entry point and every generic rule in the root config.
  - [x] Verify the installed dependency versions match the current registry versions.

## Phase 3: Implement

- [x] Task 3: Install and configure anti-slop
  - [x] Vendor the plugin source.
  - [x] Add the matching Oxlint dependencies.
  - [x] Add the root Oxlint configuration and `lint:oxlint` command.

## Phase 4: Generate Docs and Doctor

- [x] Task 4: Verify and record the result — commit `3a078a2`
  - [x] Run the focused Oxlint configuration check.
  - [x] Run the repository quality checks.
  - [x] Run Measure Doctor. Defer Measure generation because the worktree contains user-owned generated changes.
  - [x] Record remaining findings as scope.

## Verification Record

- `npm run lint:oxlint` loads the plugin and reports pre-existing source findings.
- The focused Oxlint configuration check passes.
- The 15 generic anti-slop rules are configured at error severity.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run build` passes.
- `npx tsc --noEmit` passes.
- `npm run doctor` passes.
- `npm audit --omit=dev --audit-level=high` reports six existing high-severity advisories. No audit fix was applied.
- Existing anti-slop findings remain out of scope. No rule was weakened and no suppression was added.
