# IM2 correction plan

The user authorized correction of all 29 findings on 2026-09-07. The review report remains the baseline. Use the 96 source lessons as the content inventory. Preserve existing data and unrelated work. Do not mark a finding closed until its correction is verified.

## Phase 1: Authentication and backend correctness

- [~] Task: Repair atomic registration, password login, current-account checks, role routing, and accessible input errors. R01, R02, R08, R09, R10, R11, R15.
- [~] Task: Repair seeds and typed function references. Verify backend types and seed replay. R03, R04, R05, R12, R28.

## Phase 2: Source content and curriculum consistency

- [~] Task: Correct all 28 mathematics groups and source ambiguities. Restore lesson assets from original worksheets. R17, R18.
- [~] Task: Reconcile 96 lessons, public metadata, source-linked daily tasks, the 180-period schedule, and current audits. R13, R16, R19, R20, R25.

## Phase 3: Learning and teacher workflows

- [~] Task: Implement authenticated lesson delivery, graded practice, phase progress, and student dashboard data. R06, R07.
- [~] Task: Implement organization-scoped class enrollment, teacher dashboard, gradebook, and submission evidence. R06, R09, R11.

## Phase 4: Knowledge graph

- [~] Task: Reconcile lesson and skill nodes, source links, standards, and actual prerequisites. R21, R23, R24.
- [ ] Task: Author valid practice blueprints and generators. Connect consistent practice and teacher projections. R20, R22.

## Phase 5: Integration and verification

- [~] Task: Repair CSS sources, links, stale setup tests, development commands, and deployment configuration. R14, R26, R27.
- [ ] Task: Triage dependency advisories and apply approved compatible updates. R29.
- [ ] Task: Run frontend and backend gates, isolated backend checks, and student/teacher browser journeys. Record closure evidence for every finding.

No new hash, checksum, provenance system, or approval runtime is required. Dependency changes remain subject to the project approval rule. Production deployment is separate from local correction and verification.

## Verification checkpoint — 2026-09-07

- Frontend and backend TypeScript checks passed after the first runtime update. Lint passed at that checkpoint.
- The source inventory now has 96 lessons. Tests check every source file, image path, and worksheet PDF.
- All 96 lessons have one authored numeric checkpoint. Seed replay creates no duplicate lessons or activities. This does not complete the full practice bank or mastery coverage.
- Authentication, class ownership, grading, and replay tests pass. Local Convex deployment validation passed on IM2 ports 3222 and 3223.
- The old curriculum suite had 44 failures. It used obsolete paths and checked stored audit claims. The replacement checks current source files. Calendar, activity-bank, and graph checks remain separate open work.
- Mathematics corrections and worksheet asset restoration are applied. Full content verification remains open.
- Student and teacher pages now call protected backend functions. Browser journeys and full workflow verification remain open.
- The dependency update dry run returned no usable result. No dependency update was applied.

## Verified correction checkpoint

The local browser journey passed. See `runtime-verification.md`.

- Atomic registration preserves existing credentials. A class code assigns the student to the teacher's organization and class.
- Password login and current-account session checks pass. Teacher and student routes work.
- All 96 lessons seed with a scored checkpoint. Replay is idempotent. A published revision can receive a new draft without losing evidence.
- The teacher can create a class, assign a published lesson, inspect phase progress, and read both correct and incorrect attempts.
- All four graph inventories now include the 96 source lessons. Lesson titles and source references match. Graph structure validation passes.
- The nonexistent `S-CP.C.9` reference is now `S-CP.B.9`. Source: https://www.thecorestandards.org/Math/Content/HSS/CP/B/9/ . Remaining standard aliases and descriptions still need review.
- The renderer no longer repeats each phase heading. The exponent lesson uses supported math delimiters. Other legacy notation still needs correction.

The full correction task remains open. Do not mark the practice blueprint, calendar, mastery, source-content, or dependency findings closed based on this checkpoint.

Verification before the correction checkpoint: 24 test files and 172 tests passed. Frontend TypeScript, backend TypeScript, lint, and the production build passed.

Saved correction checkpoint: `dd1c25a`. This commit does not close the full correction task.
