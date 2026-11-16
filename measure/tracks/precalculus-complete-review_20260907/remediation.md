# Precalculus remediation results

Date: 2026-09-07.

Local corrections are verified for 44 of the 45 review findings. PC-43 has a local configuration correction, but hosted configuration and verification remain open. The hosted Convex deployment and Cloudflare environment are not specified.

This report describes the current workspace. It does not certify every possible defect or a clean release commit. The workspace contains pre-existing work from other tasks.

## Finding status

| Finding | Status | Correction |
|---|---|---|
| PC-01 | Verified locally | Registration creates accounts atomically. It cannot replace existing credentials. |
| PC-02 | Verified locally | Login verifies the complete stored password credential. |
| PC-03 | Verified locally | The seed action calls all 58 real seed modules. Required failures propagate. |
| PC-04 | Verified locally | All 58 published lessons have student routes and saved written responses. |
| PC-05 | Verified locally | Teachers can manage classes, enrollment, assignments, grades, feedback, and competency records. |
| PC-06 | Verified locally | Login uses the current account role. Dashboard routes resolve. |
| PC-07 | Verified locally | Preface, gradebook, and account settings routes exist. |
| PC-08 | Verified locally | Authentication has input bounds and shared database request limits. |
| PC-09 | Verified locally | Session guards check current credentials, account status, organization, and role. |
| PC-10 | Verified locally | Tailwind scans shared component sources. Wide display equations scroll within the lesson. |
| PC-11 | Verified locally | The brand renders the integral symbol. |
| PC-12 | Verified locally | Worked and practice clients refresh server state after saved evidence. |
| PC-13 | Verified locally | Start new attempt creates a new attempt identity. A transport retry retains its original identity. |
| PC-14 | Verified locally | Mastery thresholds match the two available Guided and Independent variants. |
| PC-15 | Verified locally | Knowledge-state handlers use current elapsed time through the shared implementation. |
| PC-16 | Verified locally | Readiness uses teacher introduction and reviewed prerequisite proficiency. |
| PC-17 | Verified locally | The dashboard links assigned lessons and due review activities. |
| PC-18 | Verified locally | Linear-rate classification uses divided differences for unequal input intervals. |
| PC-19 | Verified locally | Public topics and all lesson seeds use the normalized 58-topic course. |
| PC-20 | Verified locally | Unit 4 is identified as content that the AP exam does not assess. |
| PC-21 | Verified locally | Lesson 1.8 uses the correct rational-inequality intervals and excludes undefined values. |
| PC-22 | Verified locally | Lesson 3.6 uses period 12 and corrected sine and cosine models. |
| PC-23 | Verified locally | Lesson 3.10 uses the correct trigonometric inequality interval. |
| PC-24 | Verified locally | Lesson 3.12 distinguishes reciprocal functions from inverse functions. |
| PC-25 | Verified locally | Lesson 3.7 uses the stated center height once. |
| PC-26 | Verified locally | Lesson 2.2 gives the corrected growth prediction of 676. |
| PC-27 | Verified locally | Lesson 1.13 uses unequal-interval rates and the corrected regression model. |
| PC-28 | Verified locally | Incorrect numerical results in the identified worked examples are corrected. |
| PC-29 | Verified locally | Lesson 4.3 distinguishes a secant estimate from an instantaneous rate. |
| PC-30 | Verified locally | Average change no longer implies monotonicity throughout an interval. |
| PC-31 | Verified locally | Identified exercises now include the required equations, graphs, or data. |
| PC-32 | Verified locally | Logarithm and conjugate-zero rules include the required domains and coefficient assumptions. |
| PC-33 | Verified locally | Lesson math delimiters and matrix notation are normalized. All 58 sources render without math parse errors. |
| PC-34 | Verified locally | Identified incomplete worked examples include the requested results. |
| PC-35 | Verified locally | Graph catalogs use the same 345 nodes. Endpoint and count checks pass. |
| PC-36 | Verified locally | The 62 placeholder blueprints contain lesson content and teacher-review guidance. |
| PC-37 | Verified locally | The graph has 68 reviewed prerequisite edges. Directed-cycle checks pass. |
| PC-38 | Verified locally | Activity and spaced-repetition projections use the shared projector and match its output. |
| PC-39 | Verified locally | Regeneration preserves authored activity maps and all four class-period packages. |
| PC-40 | Verified locally | The curriculum audit computes its checks from content. A missing-topic fixture fails the audit. |
| PC-41 | Verified locally | Tests use the current behavior and contracts. Historical defect probes are clearly marked. |
| PC-42 | Verified locally | Independent mathematical checks cover generated rate patterns, including 10000 shared variants. |
| PC-43 | Pending hosted target | Removed the localhost production setting. The server rejects local or non-HTTPS production URLs. Hosted configuration and verification remain open. |
| PC-44 | Verified locally | Common knowledge-state logic, response validation, transport, and phase seed updates replace repeated code where the contracts match. |
| PC-45 | Verified locally | Course counts, font guidance, workflow paths, and redundant type documentation are corrected. |

## Verification

- App tests: 5946 passed across 236 files.
- App lint, TypeScript (`npx tsc --noEmit`), and production build passed.
- Shared tests: 68 passed. These cover mathematics, graph activities, projections, and lesson rendering.
- All 58 normalized lesson sources passed math rendering checks.
- Local Convex deployment and the complete seed action passed.
- A repeated seed preserved 58 lessons, 58 lesson versions, 406 phases, 407 sections, and the saved student response.
- Browser checks passed for registration, login, student lessons, written responses, teacher classes, enrollment, assignments, grading, and student feedback.
- A student could not access the teacher dashboard.
- Practice checks passed for an incorrect answer, a new attempt, corrected answers, and mastery after both variants.
- The dashboard has no page script errors. Shared SVG titles no longer cause hydration errors.
- At a 390-pixel viewport, the dashboard and Lessons 1.8 and 4.14 have a 390-pixel document width. These pages have no page script errors.
- No dependency was installed or changed for this work.

Coverage percentage was not measured. Test counts do not establish a coverage percentage. Browser checks cover the listed flows, not every possible browser and device.

See [verification output](./remediation-verification.txt) for the final check excerpts.

## Delivery limits

All 58 lessons support reading and teacher-reviewed written responses. Automatic practice grading covers 18 skills. The other blueprints provide lesson content and teacher-review guidance. They do not claim automatic grading.

PC-43 needs the hosted Convex deployment and Cloudflare environment. No hosted deployment was made. The local server now rejects an invalid production database URL instead of using localhost.

Authentication changes are committed in `fe38063d`. The associated plan update is `68efac7b`. Shared style discovery and mobile equation containment are committed in `20151d43`. Other corrections overlap pre-existing workspace work. They remain available in the workspace. They must be integrated without staging unrelated changes.

See [the initial review](./report.md) for the original evidence. Its failing results are historical. See [the plan](./plan.md) for the remaining work.
