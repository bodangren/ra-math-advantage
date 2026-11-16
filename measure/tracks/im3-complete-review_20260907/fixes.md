# IM3 review corrections

Date: 2026-09-07.

The local changes address the 38 findings in `review.md`. The original review remains a historical record. This report describes the corrections and their verification limits.

## Corrections by finding

| Finding | Correction |
| --- | --- |
| 01 | Return the active-account field with credentials. Test active and inactive accounts. |
| 02 | Make export queries internal. Keep identity checks at the server boundary. |
| 03–06 | Remove the unused roster backend and wizard. This removes the public write path, cross-organization matching, invalid credential creation, and broken module call. Preserve stored data. |
| 07 | Check current credential status, role, profile, and organization when protected sessions are used. Test deactivation and mismatched claims. |
| 08 | Validate login input. Add a shared login-attempt limit and bounded expiry cleanup. Return controlled errors. |
| 09 | Exclude unpublished lessons from the public curriculum. Remove unused legacy public curriculum queries. |
| 10 | Normalize seeded quiz questions to the renderer contract. Normalize existing stored props when lessons are read. |
| 11 | Replace permissive graph evaluation with a restricted expression parser. Support the course functions. Reject unsupported expressions. Break plot paths at discontinuities. |
| 12 | Normalize activity seed props across all 52 lessons. Fill empty solver steps. Check actual seed output against the runtime schemas. |
| 13 | Derive grading rules from canonical quiz and solver props on the server. Keep exploratory activities ungraded. Preserve approved mastery-evidence rules. |
| 14 | Preserve guided-practice and graph-exploration modes through lesson dispatch. |
| 15 | Use one solver-answer normalization rule for feedback and grading. Accept spacing, minus-symbol, and alternative-answer order differences. Preserve meaningful operators. |
| 16 | Await successful saves before completion. Show failure and retry states. Make repeated session completion safe. |
| 17 | Calculate practice-test scores and lesson results from registered answer keys on the server. Reject duplicate or foreign questions. |
| 18 | Save the test result and study session in one transaction. Use a per-user attempt ID to make retries idempotent. |
| 19 | Correct the verified answer keys, distractors, multiplicity definition, and ambiguous practice-test prompts. Add mathematics regression checks. |
| 20 | Correct the verified discriminant, roots, polynomial identity, series sum, exponential examples, and lesson-title mismatch. |
| 21 | Remove unsafe equivalence transformations. Anchor supported expression patterns. Add unequal-expression regression cases. |
| 22 | Add the three missing generator relationships to the existing generator. |
| 23 | Synchronize embedded graph nodes with canonical nodes. |
| 24 | Regenerate current projections. Remove 88 concept rows from the saved spaced repetition system (SRS) projection. |
| 25 | Add 52 missing worked-example source relationships. Fill missing blueprint source links from the existing lesson or module content groups. |
| 26 | Remove 44 sequence-derived prerequisite edges and 921 same-module concept-support edges. These 965 edges did not have semantic evidence. Preserve verified relationships. |
| 27 | Use the canonical objective-proficiency calculation. Reconstruct assessed proficiency and calculate current retention. Test mastery entry, retention between thresholds, decay, and repeated reads. |
| 28 | Remove silent 500-card and 2,000-review cutoffs from student knowledge-state reads. |
| 29 | Use the same knowledge-state producer for parent and student views. Preserve parent-link authorization. |
| 30 | Show an unavailable state and retry link when knowledge-state loading fails. Do not display false zero mastery. |
| 31 | Correct login button foreground and background tokens in both themes. Verify rendered contrast in Chrome. |
| 32 | Remove unused roster and export surfaces, placeholder activity registrations, and the obsolete linear-functions dashboard branch. Keep shared components that belong to other apps. |
| 33 | Escape spreadsheet-formula prefixes in CSV strings. Preserve numeric negative values. |
| 34 | Repair stale fixtures, path assumptions, navigation behavior, and asynchronous save assertions. Replace source-only seed assumptions with execution of all lesson seeds. |
| 35 | Include graph, migration, and SRS tests in the default app test command. |
| 36 | Remove blanket CI exclusions for Markdown and Measure files. |
| 37 | Remove the unused 655-entry generated activity map and its unsupported readiness claims. Keep the 180 class-period plans. Validate executable seed props and publication props against the six components that IM3 actually registers. |
| 38 | Correct product, curriculum-path, technology-version, and framework-export documentation. Record current verification and remaining rollout limits. |

## Additional corrections found during verification

- Connect lesson sidebar phase buttons to navigation. Respect locked phases. Preserve keyboard input inside controls.
- Add shared UI package paths to Tailwind source scanning. This restores their compiled styles.
- Import the KaTeX stylesheet through the bundler. The production build now resolves its font assets.
- Correct shared footer contrast, heading order, and navigation labels. Verify the rendered login page with axe in both themes.
- Reject unsupported shared-library activity types during IM3 authoring. Revalidate stored activity props before publication.

## Test changes

The all-lesson contract suite executes all 52 seed functions in an in-memory database. It checks inserted activity props, phase links, and lesson titles. The capture contains 422 activities. It has no invalid activity props and no empty solver activities. Exploratory activities do not imply graded mastery evidence.

Remove the obsolete phase-5 checkpoint test. It required a specific local Git history and Git notes. It did not test application behavior. Keep the historical planning records. Remove source-text tests that required a fixed Markdown heading count or treated the first `title` field in a seed file as the lesson title. Keep source-title checks and add actual seed execution checks.

The tests for removed roster and export UI surfaces were removed with those surfaces. Tests for retained export authorization and CSV behavior remain.

## Verification

| Check | Result |
| --- | --- |
| App lint | Pass. Zero warnings. |
| Separate TypeScript check | Pass. |
| Production build | Pass. KaTeX font assets resolve. |
| Full app tests | 6,641 passed; 0 failed; 5 skipped. Zero failed suites. |
| Final seed and footer subset | 69 passed. |
| Graph suite | 229 passed. Included in the default app suite. |
| Actual lesson seeds | 52 lessons; 422 activities; zero invalid props or empty solvers. |
| Curriculum structure audit | 11 checks pass. Existing ALEKS topic-list exceptions remain explicit. |
| Seed integrity command | Pass. |
| Browser accessibility | Zero axe violations on the login page in light and dark themes. |
| Browser contrast | Login button: 4.97:1 light; 6.87:1 dark. |
| Mobile layout | No horizontal overflow at 390 × 844. |
| Malformed login request | Returns HTTP 400. |
| Shared package sweep | 3,532 passed; 8 failed across 20 packages. Failures are detailed below. |
| Shared footer package | Lint, types, and both tests pass after the final footer change. |
| Bundle budget | Server index 531.63 KB; limit 700 KB. The existing checker only reports matching files. |
| Changed-code whitespace check | Pass. |

The five skipped app tests are three known-bad viewport fixtures and two unsupported symbolic-equivalence cases. The production mobile page was checked separately. General symbolic equivalence remains outside the helper contract.

The shared sweep has three boundary/doctor failures from the undeclared Precalculus projection dependency. Four assertions concern the concurrently edited Precalculus rate-pattern activity, schema, or generator. One Precalculus polynomial-extrema stress test also failed. These failures do not occur in the IM3 test suite. The repository boundary check remains red for the same Precalculus dependency.

The browser check uses the installed Chrome against a fresh production server. An earlier server retained old asset names after a rebuild. That run was discarded. The final run loaded the current stylesheet and JavaScript before the checks.

## Limits

No deployment, production seed, or live database write was performed. These corrections take effect in a deployment only after the normal release process. Existing stored activity props receive read-time normalization. Corrected authored mathematics must also pass through the normal content publication process.

Authenticated browser flows could not be verified against a reachable configured backend. Backend tests use controlled database contexts. They do not prove production data integrity or live provider behavior.

The graph corrections remove unsupported relationships and repair structural inconsistencies. They do not replace the separate row-level taxonomy and curriculum-authoring work. The proficiency read reconstructs assessed state from stored evidence; it does not introduce a new persistent knowledge-state history.

The workspace contains concurrent changes from other app reviews. Shared Precalculus tests and its boundary declaration currently have separate failures. Do not interpret this report as a clean result for the whole monorepo.

Changes remain uncommitted. The workspace already contained changes in the same app and shared files. A whole-file commit would include work from other tasks. The normal Measure commit step remains pending until those changes can be separated safely.
