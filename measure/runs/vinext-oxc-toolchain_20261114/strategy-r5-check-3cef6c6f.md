# Strategy r5 check (3cef6c6f) — vinext-oxc-toolchain_20261114

HEAD: `3cef6c6f52b8d0c8f5dbb0008b1c484a5bd9368d` confirmed (`git rev-parse HEAD`).
Subject: commit `3cef6c6f` (test-strategy.md r5, plan.md, gates.sh `sweep()` compare).
Method: read-only commands only. Collect-only `vitest list` allowed. No gate, build, or sweep ran.

Verdict: **PASS WITH FIXES** (F1–F7 fixed; 0 blockers; 4 majors; 3 minors).

## F1–F7 fix verdicts

| ID | Severity | Section | Evidence | Required fix |
|----|----------|---------|----------|--------------|
| F1 | blocker, fixed | 14.2 | File `scripts/audit/__tests__/framework-wave-w4-audit.test.ts:294-317` holds 7 loop titles from `expectedPostW4Major` (vinext 1, vite 8, @vitejs/plugin-react 6, eslint-config-next 16, typescript 6, eslint 10, @eslint/js 10) plus 1 absent title (line 317). Strategy table rows 1–8 reproduce them verbatim. Collect-only `vitest list`: full pattern 8 lines; red selector 4 lines (titles 4, 6, 7, 8); guard selector 4 lines (titles 1, 2, 3, 5). | None. Done in r5. |
| F2 | blocker, fixed | 2, 6.4, 7, 12, 14.4, gates.sh | `gates.sh:111-117` compares run set with `$BASE/<script>.exit` set and fails on a difference. Guard `! is_record_only && [ -f "$BASE/$s.exit" ]` keeps record-only labels and the missing-base rule. Earlier compares kept (`gates.sh:93,134,175,237`). Counts: `baseline-m2` lint/test/typecheck/build each 27 names; `baseline` each 26; diff is `apps/danielson`; disk has 27 dirs. Strategy 6.4 compares `s1` with `baseline-m2`. | None. Done in r5. |
| F3 | major, fixed | 6.1, 13.4, 14.5 | One risk table holds R1–R20 with one meaning each (R16 nested copy, R18 API surface, R19 baseline compare). Section 13.4 keeps an id map only. R17 cites 13.8 item 4. Residual stale pointers filed as F13. | None for the table. See F13. |
| F4 | major, fixed | plan S2, 8, 14.6 | Plan lines 245–251 name one root config, 26 target-form scripts, `_template` echo. Actual: root `.oxlintrc.json` (29955 bytes) tracked; no `eslint.config.*` tracked; IM3/danielson/app-shell lint scripts use `--config ../../.oxlintrc.json`; `_template` runs echo. Migrate/copy boxes removed. | None. Done in r5. |
| F5 | major, fixed | plan note, 4 | Plan line 238 carries no hex SHA. Section 4 holds the capture and orders roles not to write it into plan or spec. | None. Done in r5. |
| F6 | major, fixed | plan S1 Test, 14.3 | Plan line 148 is one box. It covers 14.3 items 1–5: APP_DIRS cases 1–4, case 7 five files, case 8 nested rule, cases 9/9b, two guard cases, W4 log, commit subject. | None. Done in r5. |
| F7 | nit, fixed | 3, 6.1 R18, 14.7 | Count command gives 62 `from 'next...'` lines and 2 bare `next` lines. Breakdown 24+23+9+3+1+2 sums to 62 in 55 files. Strategy cites the command. | None. Done in r5. |

## New issues introduced by r5

| ID | Severity | Section | Evidence | Required fix |
|----|----------|---------|----------|--------------|
| F8 | major | 6.3 step 3 | Line 346 cites `(section 13.3)` for the follow-up Red commit. Section 13.3 lacks cases 9/9b and its W4 row is superseded. The shape lives in 14.3. Plan line 148 cites 14.3 correctly, so Red can still proceed. | Change the citation to 14.3 before Red r3 starts. One line. |
| F9 | major | 6.2 case 9(c) | Text: "The case reads no `node_modules/eslint` key and no `node_modules/@eslint/js` key." Both keys exist (`node_modules/eslint@9.39.5` dev+peer, `node_modules/@eslint/js@9.39.5` dev+peer, verified with `node -e` on `package-lock.json`). Specified outcome is "Passes at this HEAD (guard)". A reader who asserts absence writes a Red that fails for the wrong reason. | Clarify that case 9 asserts nothing about `node_modules` keys before Red r3 starts. S2 asserts lockfile absence. |
| F10 | major | plan S1 audit box (line 210–212) | Box repeats four prefix titles without the `(post-W4; ...)` suffix and cites superseded 13.3. The file holds none of them. Strategy 14.2 holds the exact titles. Admitted in 14.8 item 1. | Cite 14.2 with exact titles before Green starts. Not needed before Red r3. |
| F11 | major | 14.2 titles B/C, 8, 6.4 | Titles B/C let the Green W4 check pass 8/8 while the lockfile keeps `eslint` 9.39.5 as a peer. Full issue #2 closure then rests on the S2 lockfile-absence case (section 8 row, plan S2 case 1), which the S2 refresh may re-derive away. | Pin the S2 lockfile-absence case as non-droppable before Green starts. B/C alone assert only the S1 half. |
| F12 | minor | plan S1 Verify (line 221) | Box says "r4 case set (cases 1 to 8, with the issue #2 audit case)". R5 set is 11 tests: cases 1–9 with 5b and 9b (6.2, 14.3). Admitted in 14.8 item 6. | Fix the wording before Verify runs. |
| F13 | minor | 3 (line 123), plan baseline box (line 116) | Line 123 cites `(section 13.4)` for the danielson risk; 13.4 is now an id map and the risk lives in 6.1 R18. Plan line 116 cites 13.2 for the workspace rule; the two-baseline compare there is superseded and the live rule is 6.4 with 14.4. Both redirect text lets a reader recover. | Fix both pointers before Verify runs. |
| F14 | minor | 6.2 (lines 293–299), 14.3 | Text: "at this HEAD the S1 describe holds 11 tests". At `3cef6c6f` the test file still holds the pre-Red set; cases 9/9b and sentinels land in the follow-up Red commit. | Say "after the follow-up Red commit". Anytime. |

## Other r5 checks

- Contradictions: none remaining beyond F8 and F10–F14. Section 2 W4 command (8 tests) and 14.2 red/guard selectors (4/4) serve distinct purposes. Sections 6.3 step 5 and 14.4 agree on the `s1-premerge` rename.
- Exclusion rule: sound. `sweep()` reads the disk glob, so a manifest or ignore edit cannot drop a workspace silently. The `_template` exception is a package with an echo script, named in both plan and strategy. No gate passes by exclusion.
- Fact claims: 14.7 table verified. 27 dirs; 28 manifests; no manifest declares `eslint` or `@eslint/js`; no workspace lockfile entry lists them; no `typescript-eslint` or `eslint-config-next` key; danielson `next ^16.0.0`, `vinext ^0.0.55`, `@types/node ^22`, no `vite.config.*`, sole vitest config without the vinext alias; workflows are 5 files with setup-node counts 1/7/1/0/1 and only `business-math-deploy.yml` below major 24. Registry versions are dated claims, not tree facts.
- Case 9/9b soundness: 9(a) mirrors the case 3 reader with a 28-manifest sentinel; sound. 9(b) checks workspace lockfile entries, distinct from `node_modules` peer keys; sound. 9(c) ambiguous; filed as F9. 9b seeds a fault on an in-memory set and expects two exact hits; sound A4 proof.
- Replacement W4 titles A/B/C: A asserts full absence and matches the tree. B/C assert the S1 half (manifest absence) and defer lockfile absence to S2 by design. They do not assert full issue #2 completion alone; filed as F11.
- Plan/strategy agreement: each box changed in `3cef6c6f` agrees (baseline `[~]`, Red box with 14.3, S2 with 14.6, note with section 4) except the admitted opens, filed as F10 and F12.

## 14.8 open-item ratings (must it be fixed before Red r3 starts?)

1. Prefix titles in the S1 audit-forward box: NO. Green work. Fix before Green starts (F10).
2. Danielson `next/*` vitest alias box: NO. Green work. The 6.3 step-4 log search catches a missing alias. Add before Green starts.
3. Second `npm outdated` pass (danielson ranges, root `oxlint ^1.79.0`): NO. Green Verify work. Fix before Green closes.
4. S2 "before" lint timing and evidence section 6: NO. S2 refresh decides. Not needed for S1 Red or S1 Green.
5. S3 `-c .oxlintrc.json` boxes: NO. S3 refresh uses `--config ../../.oxlintrc.json` (section 14.6). Fix before S3 Red.
6. S1 Verify "r4 case set" wording: NO. Fix before Verify runs (F12).
7. Rename `gates/s1` to `gates/s1-premerge`: NO before Red r3 starts (Red r3 runs vitest, not `s1` gates). YES before the first r5 `s1` gate. Do it now; one move avoids resume corruption.
