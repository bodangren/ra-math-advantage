# Implementation plan

## Phase 1: Review corrections

- [~] Protect phase identity, completion evidence, competency credit, and atomic retries (BM2-01, 04, 05, 20).
- [~] Save and grade every activity through the server. Protect answer keys and attempts (BM2-02, 03, 17, 18, 19, 29, 30, 31).
- [~] Protect teacher assets and enforce current account identity (BM2-06, 21).
- [~] Repair practice authentication, card fields, session state, and scheduling authority (BM2-07, 08, 22, 23, 24, 25).
- [~] Repair spreadsheet evaluation, function validation, and atomic submission (BM2-26, 27, 28).
- [~] Correct curriculum arithmetic, task alignment, data, and standards (BM2-13, 14, 15, 16, 32, 40).
- [~] Author missing lesson instruction and activities. Supply correct matching assets (BM2-09, 10, 11, 12).
- [~] Derive and validate the curriculum capability graph and evidence coverage (BM2-33).
- [~] Repair published listings, navigation, accessibility, and activity loading (BM2-34, 35, 36, 37).
- [~] Repair end-to-end tests, deployment workflow, dependency findings, and setup guidance (BM2-38, 39, 41, 42).
- [~] Run complete verification. Review all 42 findings against final code and record remaining limits.

## Verification record

Implementation started on 2026-09-07. The workspace has pre-existing changes from other tasks. The review baseline had 29 TypeScript errors and 27 failed tests. Do not stage unrelated changes.

2026-09-07 verification update: 170 focused tests pass for activity saves, active account checks, assessment APIs, and daily practice. Curriculum coverage checks pass for all 89 lessons. Asset content, graph coverage, complete checks, and release checks remain open. This was an intermediate result.

## Final local verification

2026-09-07: 41 findings have local corrections. BM2-41 awaits dependency approval. The app passes 2,599 tests, TypeScript, lint, and build. The shared Convex package passes 14 tests, TypeScript, and lint. Both Node and built Cloudflare worker browser tests pass. The asset checks cover 71 workbooks and 56 datasets. See [fixes.md](fixes.md) for all 42 results and verification limits.

- [x] Correct the shared worker mutation queue and verify assessment replay. Commit: 681b29e8.
- [ ] Obtain dependency approval and apply the reviewed security updates for BM2-41.
- [ ] Integrate the remaining changes with the overlapping learning-evidence and QA work.

The implementation items above remain in progress because their commits overlap earlier changes in the same files. Do not stage those earlier changes. The root boundary check also remains blocked by a Precalculus dependency declaration. No production deployment or seed was performed.
