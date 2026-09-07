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

## Calendar correction

The generated calendar now has 180 periods: 108 instruction, 36 mastery, 18 jigsaw, nine review, and nine test periods. Nine assessment blocks preserve the existing year-level instruction budget. The old rule for 13 separate review/test pairs conflicted with that budget. A preference question remains available to the user.

All 96 source lessons occur in the calendar. Twelve lessons receive an additional instruction period. Tests verify the exact counts and worked-example titles. The 239 older individual period packages are removed. The 13 module views now use the current calendar.

This closes the numerical calendar conflict in R19. It does not complete secure test forms, daily practice authoring, or the class-period runtime. Those remain open under R06 and R20.

## Calendar, standards, and revision correction checkpoint

- The activity map now contains the 96 implemented checkpoints. It no longer marks generic text as auto-graded practice or spaced review.
- Canonical standard codes replace duplicate HS-prefixed aliases. The graph has 72 standard definitions. No graph definition remains a placeholder. The remaining teaching alignment edges still require review.
- Trigonometry references use F-TF.B.6 and F-TF.B.7. The official trigonometric-functions standard places these statements in cluster B.
- Rate-limit cleanup removes a bounded number of expired records. It preserves active limits.
- Student lesson access, assignment, publication, and gradebook queries select published revisions by status. More than 100 archived revisions no longer hide published content. Progress queries use current phase IDs. Published titles take precedence over draft titles.
- The renderer parses all 596 marked math expressions without an error. This includes more than 520 delimiter or syntax corrections. Plain-text mathematical notation and complete worked-example givens remain open.
- The obsolete stored curriculum pass report is removed. Current tests verify source files instead.

Verification: 27 test files and 181 tests passed. Lint, frontend TypeScript, backend TypeScript, and the production build passed. The isolated IM2 backend accepted both new indexes on local ports 3222 and 3223. No production deployment or dependency update occurred.

Remaining work includes complete worked examples, full practice and mastery coverage, graph teaching relationships and blueprints, class-period workflows, and approved dependency updates. This checkpoint does not close those findings.

The graph now contains all 403 current worked-example headings. The correction preserves existing IDs where the lesson and example number still match. It removes edges to examples absent from the source. It does not mark teaching alignment as reviewed.

The example correction passes the graph validator. Seventy-three restored headings have explicit pending-alignment exceptions. The validator result does not mean that these headings have reviewed standards or practice coverage.
