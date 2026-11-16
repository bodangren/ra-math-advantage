# Business Math correction report

Date: 2026-09-07.

The local corrections address 41 of the 42 review findings. BM2-41 remains open. Dependency changes require approval under the repository instructions. The proposed package changes are in [dependency-plan.md](dependency-plan.md).

The release is not ready. The root boundary check reports an undeclared dependency in Precalculus. Production deployment and production curriculum seeding were not performed. Most Business Math changes overlap existing work in the same files. These changes remain in the shared workspace for integration. The isolated Convex worker correction is committed as `681b29e8`.

## Verification

- The final app run passes 2,599 tests in 381 files. TypeScript, lint, and the production build pass. The app diff passes the whitespace check.
- The shared Convex package passes 14 tests, TypeScript, and lint.
- Two browser tests pass against the Node app. The same two tests pass against the built Cloudflare worker over local HTTPS.
- The browser flow uses a fresh student account. It checks login, practice and study access, required phase work, server grading, saved manual work, assessment replay, teacher evidence retrieval, and workbook permissions.
- The local backend uses a database copy on ports 3212 and 3213. The original backend on port 3210 was not changed.
- Asset checks cover 71 workbook files, 744 formula cells, and 56 datasets. Independent expected values match the teacher workbook outputs. Workbook archives contain no corrupt entries or cached formula errors. All seven Unit 1 datasets balance.
- All 20 previously missing asset references resolve. Fifteen PDF guides were added. All 15 guides received a visual check. Workbook visual checks sampled each unit and each capstone sheet. Automated workbook checks cover all 71 files.
- The curriculum has 89 lessons and 208 activities. The graph has 89 capability nodes and 162 prerequisite edges. Tests check references, acyclicity, lesson coverage, and agreement with the published activity data.
- The root boundary check fails at `apps/pre-calculus/scripts/sync-graph-projections.ts`. The Precalculus package does not declare its import of `@math-platform/knowledge-space-practice`. This is outside the Business Math correction scope.

## Finding results

“Corrected” means that the local code or content has a correction and relevant verification. It does not mean that production has received the change.

| Finding | Result | Correction and evidence |
| --- | --- | --- |
| BM2-01 | Corrected | The seed preserves phase IDs for unchanged content. It rejects changed content under a published version. Changed lessons use version 2. Earlier records remain. Seed regression tests cover retained progress and immutable versions. |
| BM2-02 | Corrected | ActivityRenderer saves through the assessment API without private grading metadata. The browser test confirms a real student submission. |
| BM2-03 | Corrected | Quiz components display the server result. They do not grade against removed answer keys. The browser test confirms the saved 1/1 score. |
| BM2-04 | Corrected | Phase completion requires earlier phases and submitted required work. Auto-graded work must meet its threshold. Mutation tests and browser tests cover blocked completion. |
| BM2-05 | Corrected | Phase completion no longer awards competency credit from a client-selected standard. Server assessment data selects the standard. |
| BM2-06 | Corrected | Teacher solutions moved out of public assets. Authenticated teacher or admin routes serve them without caching. The built worker returns 404 for the old static path and rejects students. |
| BM2-07 | Corrected | Study, student practice, and teacher practice use authenticated app APIs. The server supplies identity to internal Convex functions. Route and browser checks cover this flow. |
| BM2-08 | Corrected | The app maps problemFamilyId to the shared variantKey contract. Contract and daily practice tests cover the mapping. |
| BM2-09 | Corrected | All 89 lessons contain activities. Guided checks, assessments, workbook evidence, and project reflections replace the empty lessons. Curriculum tests cover every lesson. |
| BM2-10 | Corrected | Units 2–8 include worked explanations and student instructions. Project phases give draft, review, and presentation tasks. Phase guidance and curriculum tests pass. |
| BM2-11 | Corrected | Added the five missing guided workbooks and 15 missing PDF guides. Asset reference checks find no missing resources. |
| BM2-12 | Corrected | Rebuilt 71 workbook files with matching unit models and scaffold levels. Unit 7 includes a full amortization sheet. The capstone links statements, operations, financing, and inputs. Independent output checks pass. |
| BM2-13 | Corrected | Unit 1 tables and datasets now agree with their totals. The Lesson 4 case uses its own correct totals. Later cases use assets 11,020, liabilities 5,230, and equity 5,790. All Unit 1 datasets balance. |
| BM2-14 | Corrected | The application assessment requires evidence for classification, workbook structure, events, entries, validation, and a chart. It saves work for teacher review instead of using unrelated numeric answers. |
| BM2-15 | Corrected | Replaced 49 later-unit datasets with the input labels and values required by the matching workbook models. CSV schema and asset checks pass. |
| BM2-16 | Corrected | The dataset route accepts the authored class and group filenames. Route tests cover valid names and reject invalid paths. |
| BM2-17 | Corrected | Manual work and drafts persist. Incomplete reflection work stays a draft. Completed manual work receives a teacher-review message. The browser test retrieves this evidence as a teacher. |
| BM2-18 | Corrected | Retry repeats the save with the same request key. It cannot bypass a failed save. ActivityRenderer tests and the browser replay check pass. |
| BM2-19 | Corrected | SpreadsheetEvaluator owns its submission endpoint. It signals completion after the save succeeds. Component and mutation tests cover the sequence. |
| BM2-20 | Corrected | The phase mutation checks and writes the idempotency key atomically. Replays preserve the original completion time. Mutation tests pass. |
| BM2-21 | Corrected | Both page and API session checks revalidate current account status and role. Session revocation tests cover deactivation and role changes. |
| BM2-22 | Corrected | Daily practice uses a bounded session snapshot. Saved cards do not shift the current positional index. Queue and component tests pass. |
| BM2-23 | Corrected | Card identity and review count reset the answer state. Consecutive-card tests pass. |
| BM2-24 | Corrected | Unsupported families are excluded from the playable queue. The app reports their count and gives a specific empty state when no supported cards remain. |
| BM2-25 | Corrected | Legacy scheduling writes are internal. The practice endpoint generates and grades supported answers on the server. The server controls scheduling. Authority tests pass. |
| BM2-26 | Corrected | Target validation evaluates formulas and dependencies on the server. A required formula cannot be replaced by a typed total. Tests cover cycles, zero-rate loans, and depreciation limits. |
| BM2-27 | Corrected | Formula names are case-insensitive. The missing taught financial functions, SWITCH, and scalar XLOOKUP use one shared browser/server implementation. Formula tests check calculated outputs and errors. |
| BM2-28 | Corrected | One mutation saves the spreadsheet attempt, response, assessment, and credit. Replay does not consume another attempt. Optional AI feedback cannot invalidate a completed save. Atomic submission tests pass. |
| BM2-29 | Corrected | Server mutations enforce attempt limits after replay checks. Drafts do not consume the final assessment limit. Limit and request-key conflicts return 409. Regression tests cover these cases. |
| BM2-30 | Corrected | Numeric scoring normalizes equivalent number formats. The browser test submits `3,500` and receives the correct score. Scoring tests cover equivalent inputs. |
| BM2-31 | Corrected | Student payloads remove nested answers, alternatives, explanations, formulas, and notebook category keys. Redaction and component tests pass. |
| BM2-32 | Corrected | Competency standards use the reviewed capability descriptions. Placeholder labels are removed. Seed and graph checks pass. |
| BM2-33 | Corrected | Added a curriculum-based capability graph, prerequisite edges, and activity mappings. The graph describes manual and automatic evidence separately. It does not claim automatic mastery or spaced review for unsupported capabilities. |
| BM2-34 | Corrected | Public lists and counts use the latest published lesson versions. Publication tests cover drafts and duplicate versions. |
| BM2-35 | Corrected | Search and Glossary pages exist. The browser test confirms both routes and their headings. |
| BM2-36 | Corrected | Demo buttons use theme-aware colors. The login page has a main heading. Component and browser checks pass. |
| BM2-37 | Corrected | Activity components load through lazy imports. Registry and build checks pass. |
| BM2-38 | Corrected | Added a Business Math deployment workflow for the built Cloudflare worker. It runs types, lint, tests, build, asset privacy, and boundary checks. The shared boundary failure currently blocks release. |
| BM2-39 | Corrected | Added persistent student/teacher browser tests with a real local backend. Both the Node app and built worker pass. |
| BM2-40 | Corrected | The depreciation text states the implemented salvage floor. It no longer claims an automatic change to straight-line depreciation. Schedule checks pass. |
| BM2-41 | Open: approval required | No dependency changes were made. The audit still reports vulnerable dependency paths. The concrete upgrade plan is ready for approval. |
| BM2-42 | Corrected | Added current setup, authentication, curriculum, asset, backend, and worker guidance. Removed obsolete environment examples and the unused worker wrapper. The dev script uses the installed Convex command. Setup and TypeScript checks pass. |

## Additional defects found during verification

The real browser flow exposed optional Convex fields that failed API parsing. The route now normalizes missing optional fields before validation. Teacher evidence queries now use canonical phase activity links. They no longer require a legacy completion record before showing saved work. The teacher backend also uses a static import supported by Convex.

The built worker exposed a shared mutation queue that could cross request boundaries. Server calls now bypass this client queue. Callers still await dependent mutations. Commit `681b29e8` contains this correction and its regression assertions.

The installed formula parser listed SWITCH but did not implement it. It also lacked several financial functions accepted by the app. The browser and server now share these course functions. XLOOKUP returns one cell. It does not provide Excel spilled-array behavior.

## Release and integration limits

Dependency approval is still required. The root boundary failure must also be resolved before deployment. The corrected curriculum needs an explicit backend deployment and a reviewed seed on the selected production database. The new lesson versions preserve old evidence. They do not copy old completion records to changed assessments.

The browser tests verify the main student/teacher path. They do not exercise every activity on every browser. Curriculum and contract tests cover the full published inventory. Workbook numeric checks cover all repaired workbooks. Visual workbook checks use representative files.

Existing learning-evidence, QA, schema, and curriculum changes overlap this task. Their owners must integrate the remaining shared file changes together. Do not stage entire app directories or the root lockfile as part of this task.

The temporary backend copy, private worker configuration, and verification credentials were removed after the checks. The app environment again targets its original local deployment. All test services started by this task were stopped.
