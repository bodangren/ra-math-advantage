# IM2 Lesson 1.4 atomic-practice final independent review

## Decision

Accepted for integration.

The final client corrections resolve the two remaining receipt defects. The server stored-response validation remains exact.

## Client findings

- A complete receipt now treats the current part as correct independently of its aggregate score. The full Guided score of 3 and Problem 10 score of 2 both preserve the final accepted answer and advance.
- Returned `revealStepsSeen` must equal the frozen request value.
- Returned `hintsUsed` must equal the frozen request value. One Guided incorrect result must equal that value plus one.
- Invalid complete shapes, negative or inflated counters, malformed answer maps, arbitrary next parts, and extra private fields retain the exact frozen retry.
- The component tests execute the full three-part Guided flow and the two-part Problem 10 flow.

## Server findings

- The server derives the complete stored response from the fixed item, fixed part order, mode, server grade, accepted prefix, and counters.
- Query recovery, new-key continuation, and exact replay reject changed feedback, next-part identity, nested private data, and changed hints.
- Publication, exact identity, evidence gates, Problem 10 prerequisite behavior, teacher projection, and draft zero-effect behavior remain correct.

## Verification

- The patch reconstructs all 15 candidate paths exactly from baseline `f6c771fc076e3a208ec88359c1082e30212e664a`.
- My focused run passed 80 tests in eight files.
- The parent full run passed 334 tests.
- The parent lint, build, and post-build TypeScript checks passed.

Memory fixtures do not prove real Convex transaction behavior. Graph activation and activity approval remain separate later steps.

## Parent integration

Committed as `ff4b4458d`. Parent full verification passed 334 tests, lint, build, and separate post-build TypeScript. All fifteen staged paths and their full contents matched the tested candidate. All fifteen main paths were clean or absent before integration and now match the commit.

A second review accepted the semantics and exact reconstruction. It found temporary-directory prefixes in the old-side headers for eight new files in the patch artifact. Git applied these new files to the correct repository paths. The exact index path and content checks confirmed the committed tree. The temporary patch headers are now normalized. No application content changed.

The two skill nodes remain draft. Native database, learner browser, teacher view, and evidence activation checks remain open. Passing source tests does not establish rollout readiness.
