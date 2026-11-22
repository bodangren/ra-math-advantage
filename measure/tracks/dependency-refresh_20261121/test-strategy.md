# Test Strategy: dependency-refresh_20261121

Track: `dependency-refresh_20261121`. Type: chore. Lane: light.
Phases: D1 (Fix the critical and high advisories), D2 (Update the remaining packages).
Role: measure-strategy. Status: D2 refreshed at the authoring role base `89c3f4d1`.

This file is the strategy contract for both phases. D1 stays as accepted. D2 is the current phase. This track never edits `measure/gates.json`. The orchestrator passes all five gate commands as environment variables on each role gate, including `PROJECT_TESTS` for adversarial testing. Section 3 lists the exact values.

## 1. What this strategy proves

Dependency changes can alter build output, runtime behavior, types, and test behavior. Security findings require a real npm audit report. The proof has three parts.

1. Gate sweeps compared with a baseline by diagnostic key across all active workspaces.
2. A validated full audit JSON and a Green gate that resolves advisory identifiers to named exceptions.
3. Live behavior proof: build, typecheck, workerd probe, accepted S1 tests, and both bundle audits.

Artifact and document checks are supporting evidence only. They cover the evidence tables, the plan target table, the final advisory table, the gate-tool fixtures, unstaged generated files, unchanged budgets, and unchanged deploy triggers. A document check proves that text exists. It does not prove that a tool works. Each document check has a live complement in section 6.

No test calls a paid model API. No new product test is needed for version changes alone. Add a failing regression test first when a compatibility edit changes behavior. Do not replace durable assertions with frozen package-version assertions.

The D2 gate-tool changes are different. `gates.sh` is a guard, not product source. Every D2 guard change lands with a fixture case that fails before the fix and passes after. The fixture is live proof, not a document check.

## 2. Risk and review applicability

| Phase | Risk | Review A | Review B | Review C | Adversarial | Browser |
|-------|------|----------|----------|----------|-------------|---------|
| D1 | high | applicable | applicable | not applicable | applicable | not applicable |
| D2 | high | applicable | applicable | not applicable | applicable | not applicable |

D1 risk is high. It changed dependency chains across the root, six apps, and 20 packages. The chains include native binaries and the Cloudflare build and deploy toolchain. It changed security posture. It could add a root `overrides` entry, a changed contract for every workspace.

D2 risk is high. D2 changes the guard tool itself. ADV-12 and ADV-13 change `key()` and the execution check. F8 and F9 change audit exception binding and severity parsing. A false-green in these functions hides a failure in the D2 results. D2 also updates the remaining packages. At the 11-25 phase close D2 may adopt stable miniflare 5.x, a major change to the Cloudflare runtime chain. The earlier miniflare 5 beta grew the IM3 and BM2 bundles by more than 100 percent and stopped D1. The bundle stop rule in section 7 still applies. D2 writes the final advisory table for 6 moderate and 5 low findings and keeps the 5 named high exceptions.

The four named review kinds:

- **Security review (Review B):** applicable to D1 and D2. It audits the lockfile diff, install scripts, manifest ranges, and each override with its reason. It includes the full audit JSON validation, the accepted S1 tests, and the workerd probe. For D2 it also audits the miniflare recheck and the bound path set of every high exception after the new dependency changes.
- **UX/API review (Review C):** not applicable. Neither phase changes a public package contract or a user or API surface. If a necessary compatibility edit changes an interface, UX/API review becomes required for that phase.
- **Adversarial testing:** applicable to D1 and D2. For D2 the reviewer tries to make the gate tool pass a failing result: a failed run with no attributable key, a dropped `node:test` or Playwright failure title, a known identifier on an undisclosed path, or a critical escalation under a high identifier. The PM cap of 2026-11-22 bounds this role: a gate-tool finding that hides no failure in the D2 results is tech debt, not a blocker. The gate tool must not grow without end. Each such call goes to `plan.md` with its reason. The allowed outcome is never an exclusion. The outcome is a PM decision.
- **Browser review:** not applicable. Both phases are dependency-only and no UI change is expected. If a compatibility edit changes the interface, browser review against a fresh baseline becomes required.

Review A (both phases): independent review of gate changes, fixture changes, evidence claims, and the diff. The reviewer is not the Red author.

Review B (both phases): read the lockfile diff, install scripts, every manifest range change, and each root `overrides` entry with its compatibility proof. The reviewer is not the Green implementer.

### Independence and family limits

D1 Red ran on Muse. D1 Green ran on Hunyuan. D2 keeps the same independence rule. The orchestrator picks each D2 role with `ra-quota pick <role>` and records the model in the handoff. Red and Green must come from different model families. Review A must not share the Red family. Review B must not share the Green family. The adversarial role must be independent of the role that wrote the gate-tool fixes. If `ra-quota pick` has no slot in a different family, the orchestrator records the limit and sends the conflict to the PM. No role runs `openchamber` or the `opencode` CLI.

### Build-graph scope

`graph.db` and `build-graph` are available. No D2 task changes an exported TypeScript symbol. The changed files are manifests, the lockfile, the bash and node guard tool, and Measure documents. `build-graph` indexes TypeScript symbols only. I skipped the graph scan. `graph.db` is a tracked binary and the pre-commit hook blocks a graph-only commit. This matches the parent-portal track practice. If a D2 compatibility edit adds or changes an exported TypeScript symbol, the Green role rescans the affected app before Review A.

## 3. Role environment (exact commands)

The orchestrator exports these D1 values on every role-gate. They override `measure/gates.json`. The file stays unchanged.

```
RED_TEST_COMMAND='npm audit --audit-level=high'
GREEN_TEST_COMMAND='GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh audit-high d1-audit-green'
PROJECT_LINT='GATES_BASE=d1-baseline GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh lint d1-green'
PROJECT_CHECKS='GATES_BASE=d1-baseline GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh checks-all d1-green'
PROJECT_TESTS='GATES_BASE=d1-baseline GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh test d1-green'
```

The orchestrator wraps the direct Red audit in `RED_TEST_COMMAND` through `heavy-run.sh`. The environment value stays the bare command. `gates.sh` wraps its own jobs through `heavy-run.sh`. Do not add a second wrapper.

D2 values are in `plan.md`. The orchestrator exports them on every D2 role-gate:

```
RED_TEST_COMMAND='bash measure/tracks/dependency-refresh_20261121/gates.sh targets'
GREEN_TEST_COMMAND='bash measure/tracks/dependency-refresh_20261121/gates.sh targets && GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh audit-high d2-audit-green'
PROJECT_LINT='GATES_BASE=d2-baseline GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh lint d2-green'
PROJECT_CHECKS='GATES_BASE=d2-baseline GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh checks-all d2-green'
PROJECT_TESTS='GATES_BASE=d2-baseline GATES_RESUME=1 bash measure/tracks/dependency-refresh_20261121/gates.sh test d2-green'
```

If D2 reuses D1 logs, set `GATES_BASE=d1-green` in every D2 comparison command. Update every label in every role brief together after a code retry.

## 4. Baseline capture points

### 4.1 Immutable phase base commit

This strategy commit lands first. Its subject contains `(track_id: dependency-refresh_20261121)`. Immediately after this commit, before any other commit, the orchestrator runs `git rev-parse HEAD` and stores the value as the immutable D2 `phase_base_sha` in the run log and every role handoff. The orchestrator captures again if this strategy commit is amended or rebased. No SHA in this document is the D2 phase base.

The authoring role base is `89c3f4d1bc081bb667d50ccfc2cde43d78f0b161`, the plan commit that records the D1 checkpoint. It equals `origin/master` and follows checkpoint `71450a85`. It predates this strategy commit. It is void as a phase base. D2 Red, Green, Review A, Review B, adversarial testing, and phase acceptance all use the captured D2 value.

The strategy log is committed in the same commit as this file. After that commit, only the six generated files may appear in `git status --porcelain`. No role stages them. Any staged file or other modified file stops the capture. The orchestrator captures before the first D2 task commit.

### 4.2 Gate baseline folder

D2 Red records a baseline before any dependency change. Reuse the `d1-green` logs when no code or lockfile changed after that sweep. Otherwise run every group with label `d2-baseline`: format, lint, typecheck, test, build, support, docs. Labels containing `-baseline` record only. Set `GATES_BASE=d2-baseline` at Green. Refresh the baseline when code or the lockfile changes after capture. Use a new label suffix and keep earlier logs. Record the base commit, commands, workspace paths, and log paths in `evidence.md`.

## 5. Known baseline failures — keys, not counts

The baseline has standing failures. Record each by diagnostic key from the phase baseline logs in `evidence.md`. Do not rely on counts. Neither the plan nor this strategy pins a failure count.

| Area | Standing failure | Key definition |
|------|------------------|----------------|
| IM3 typecheck | diagnostic lines | workspace + file + TS code |
| IM3 tests | failing tests | workspace + test file + full test title |
| BM2 tests | failing tests | workspace + test file + full test title |
| Scripts suite | failing tests | suite + test file + full test title |
| Audit suites | failing tests | suite + test file + full test title |
| BM2 bundle audit | `Total dist/server` exceeds its budget | app + budget entry |

The baseline log paths in `evidence.md` are authoritative. Fresh logs must prove the exact keys, including any invalid KaTeX edge from `npm ls --all`. Counts in `evidence.md` describe the initial report only. A count does not authorize an exception. A missing log, command, workspace, or expected test execution fails. `NEWFAIL=0` means no new keys, not that every command passed.

D2 adds two live key sources. The `D2 Targets` table supplies version targets. The final advisory table supplies the identifiers, severities, versions, and paths for 6 moderate, 5 low, and 5 high findings.

## 6. Fixtures, mocks, and live-behavior proof

Fixtures:

- The full audit JSON from `npm audit --json`. The runner rejects a top-level error, a missing `metadata.vulnerabilities` object, non-integer severity counts, a missing `vulnerabilities` object, and a count mismatch.
- The `D1 High Exceptions` table in `evidence.md`. Each row needs five non-empty cells, a valid identifier (`GHSA-...` or `npm:<n>`), a bound package, and a disclosed dependency path.
- The plan `D2 Targets` table. Each row needs a manifest, package, stable target, and decision. A deferral needs a `Deferred:` prefix and an exact installed pin.
- The final advisory table at the end of `evidence.md`. It needs one reason row for each remaining moderate and low advisory. Each reason uses `no upstream fix` or `breaking major deferred` and cites a registry result or a failed compatibility gate.
- `adversarial-gates-fixture.cjs`. D2 adds fixture cases for ADV-12, ADV-13, F8, and F9. Each case fails before the guard fix and passes after. No existing case is weakened or deleted.
- `bundle-comparison-fixture.cjs`. It stays green after every D2 guard change.

Mocks:

- The workerd probe uses a local mock server and makes no paid request. Require `probe-ok` from the real SDK.
- No mock replaces the npm audit. The audit report must come from the registry.

Live-behavior proof:

- Gate sweeps for format, lint, typecheck, test, build, support, and docs across every active workspace. Each job runs through `heavy-run.sh` with `CI=true`. Run one job at a time.
- The full audit and `npm ls --all`. Tree keys cover invalid, missing, and extraneous edges.
- The full `packages/ai-tutoring` suite and the accepted OpenRouter S1 route and provider tests in IM3 and BM2.
- The workerd probe with `probe-ok`.
- Both bundle audits with per-entry parsing and total bytes comparison.
- `npm view miniflare dist-tags` at the 11-25 phase close. The log proves whether a stable 5.x exists.

A passing build does not replace the typecheck or the workerd probe. A document row does not replace a live audit.

## 7. Architecture guardrails and changed-contract risks

- Shared packages must not import from `apps/` or `convex/_generated/`. The support group runs the boundary check.
- A root `overrides` entry is a changed contract. Review B reads each entry and its reason. Use an override only when the blocking parent has no fixed release. The blocking parent is the first package whose range excludes the fixed version, starting at the vulnerable leaf.
- Manifest ranges and the lockfile are changed contracts. Review B reads them. Keep updates targeted. Never run `npm audit fix --force`. Never downgrade vinext to 0.2.1.
- Keep `@types/node` on 24.x for the Node 24 runtime. Move exact pins (`oxfmt`, `tsrs`) only to released versions that pass the gates. Adopt no new prerelease. Do no repository-wide reformat.
- Review B F5: keep `wrangler` and `@cloudflare/vite-plugin` as `Deferred:` rows at 4.116.0 and 1.49.0 when miniflare 5 has no stable release. Tighten the ranges only after the miniflare recheck proves a stable 5.x. A stable parent must not pull a prerelease child.
- At the 11-25 phase close, run `npm view miniflare dist-tags`. If dist-tag `latest` points to a stable 5.x, adopt it in D2, clear the five Cloudflare high exceptions, record the new audit counts, and rerun the full sweep against `d2-baseline`. Require `NEWFAIL=0` and no total growth above 5 percent. If no stable 5.x exists, record the dist-tag output and keep the exceptions.
- Keep bundle budgets and the manual deploy triggers in `.github/workflows/` unchanged. Name `apps/bus-math-v2/scripts/bundle-size-audit.mjs` and `apps/integrated-math-3/scripts/bundle-size-audit.mjs`.
- Keep the six generated files unstaged. Keep `measure/gates.json` unchanged.
- Add no hashes, checksums, manifests, or provenance fields. Use Git commit identity.
- Stop the phase on a new failure key or an infrastructure failure. Stop when a passing budget entry fails or an app total grows more than 5% over baseline. Send either stop condition to the orchestrator. The known BM2 total failure stays a baseline key and still obeys the growth rule.

## 8. Intentionally-red aggregate-suite handling

- D1 Red was intentionally red. `npm audit --audit-level=high` exits 1 on critical or high advisories. An infrastructure failure is not valid Red. If the audit already passes, Red records `red_kind: gap_closing`, `gaps:`, and `breakage_proof:`. Red does not manufacture a failure.
- The D1 Green command can exit 0 while raw `npm audit` stays red for named exceptions. A disclosed exception permits the Green gate. It does not mean the audit passes. The PM report names every unresolved finding.
- D2 Red uses the target command. It fails while any installed version is below its stable target. It also fails on an empty table or a missing package. If no target needs an update, Red records `red_kind: gap_closing`, `gaps:`, and `breakage_proof:` instead.
- The D2 Green command requires the target command to exit 0 and the audit exception check to pass. The raw audit stays red for the 5 high exceptions and the 6 moderate and 5 low findings.
- The gate sweeps are red at baseline from standing failures. These are not intentionally red. The key comparison absorbs them. Do not expect `PROJECT_TESTS` to be green between Red and Green.
- A filtered Green run is not evidence. Each Green command must exit 0 without a filter.

## 9. Green and closeout gates

D1 Green gate: `GREEN_TEST_COMMAND` exits 0 with no high or critical identifier outside the exception table. `PROJECT_LINT`, `PROJECT_CHECKS`, and `PROJECT_TESTS` each print `NEWFAIL=0`. No infrastructure failure. No new budget failure and no total growth above 5%.

D1 closeout gate (phase acceptance): the Green gate; the full baseline key comparison with no new key; OpenRouter S1 acceptance evidence in `evidence.md` before Green; PM confirmation of exclusive dependency changes; the accepted S1 tests and workerd probe pass; every gate group logged; budgets and manual triggers unchanged; the six generated files unstaged; Daniel's confirmation recorded; the checkpoint commit in the phase heading. The orchestrator pushed the D1 checkpoint through `safe-push` by 2026-11-23.

D2 Green gate: `targets` exits 0 after all targets are met or recorded as tested deferrals. `audit-high d2-audit-green` exits 0 with every high identifier bound to its package, version, and disclosed path. `PROJECT_LINT`, `PROJECT_CHECKS`, and `PROJECT_TESTS` each print `NEWFAIL=0` against `d2-baseline` or `d1-green`. No infrastructure failure. No new budget failure and no total growth above 5 percent. The adversarial fixture has no failing case. `bundle-comparison-fixture.cjs` stays green.

D2 closeout gate (phase acceptance): D2 phase acceptance and checkpoint by 2026-11-25. The final advisory table lists every remaining moderate and low advisory with a supported reason. The 5 high exceptions keep their names and reasons. The 11-25 miniflare dist-tag log is in `evidence.md`. Every gate group has a fresh log. Budgets and manual triggers are unchanged. The six generated files are unstaged. The D2 manual-verification task is PM-verified, not a Daniel gate. The PM records that verdict in `plan.md`. The orchestrator pushes D2 at closeout through `safe-push`. No step before closeout pushes.

## 10. Anti-pattern coverage

Every defense names its falsification condition.

| Phase | A-class | Defense | Falsification condition |
|-------|---------|---------|-------------------------|
| D1 | A3 | Parse audit counts and `NEWFAIL` as labeled integers from `critical=`, `high=`, and `NEWFAIL=`. | A bare digit or substring match passes a wrong count. |
| D1 | A4 | The audit gate requires every high or critical identifier in a non-empty exception row. The sweep requires workspaces ran. | An empty exception table or an empty suite passes. |
| D1 | A5 | Each evidence claim cites a log at the same commit. `all pass` appears only after a command exits 0. | A claim has no green command at that commit. |
| D1 | A6 | With unresolved exceptions, the PM report says `unresolved`. The registry never says `resolved` while the full audit is red. | The registry claims `all pass` with an open exception. |
| D1 | A7 | Advisory parse uses anchored identifiers and whole package names. No bare English-word filters. | A coarse filter drops a real advisory. |
| D1 | A9 | All track-path references stay inside this track folder. | A test outside the track pins `measure/tracks/dependency-refresh_...`. |
| D1 | A10 | Generated files stay unstaged. The docs gate runs generate and doctor without staging drift. | A generated change is staged. |
| D1 | A11 | `gates.sh` and the audit checks are the live guard suite. | The runner disappears or is never run. |
| All | A8 | Tasks move `[~]` then `[x]` with a commit SHA. Role gates read structured markers. | A `[ ]` space marker counts as in-progress. |
| D2 | A3 | Parse target versions, audit counts, and `NEWFAIL` as labeled integers from `Target met:`, `critical=`, `high=`, `moderate=`, `low=`, and `NEWFAIL=`. | A bare digit or substring match passes a below-target version or a wrong count. |
| D2 | A4 | `targets` fails an empty table, a missing package, or a below-target install. The sweep fails when no workspace ran. | An empty target set or an empty suite passes. |
| D2 | A5 | Each evidence claim cites a log at the same commit. A deferral names the exact failing gate. `all pass` appears only after exit 0. | A claim has no green command, or a deferral has no failing command. |
| D2 | A6 | With five high exceptions open, the registry and PM report say `unresolved`. The final table gives all 6 moderate and 5 low findings a reason. | The registry says `resolved` while the audit is red, or an advisory lacks a reason. |
| D2 | A7 | Advisory parse uses anchored identifiers (`^(GHSA-[\w-]+\|npm:\d+)$`) and whole package names, including scopes. No bare English-word filters. | A coarse filter drops a real advisory or matches a wrong package. |
| D2 | A9 | All track-path references stay inside this track folder. Fixtures and `gates.sh` move with the track on archive. | A test outside this track pins `measure/tracks/dependency-refresh_...`. |
| D2 | A10 | The six generated files stay unstaged. The docs gate runs generate and doctor without staging drift. | A generated change is staged. |
| D2 | A11 (ADV-12) | The gate tool rejects a failed run that has no attributable key. A fixture case with a failing exit and no key must fail the comparison. | A failing run with no parseable key passes a failing baseline. |
| D2 | A11, A7 (ADV-13) | `key()` keeps `node:test` and Playwright failure titles. A fixture case that changes such a FAIL title must yield a new key. | A changed `node:test` or Playwright FAIL title does not create a new key. |
| D2 | A6, A7 (F8) | After the new dependency changes, the audit gate revalidates each exception's bound package, version, and path set. | A disclosed advisory on a new node path passes the gate. |
| D2 | A3, A5 (F9) | The audit gate parses severity as a labeled value and rejects a critical under an identifier disclosed only as high. | A high identifier escalates to critical and the gate passes. |
| D2 | A5 (F-PA1) | The lint group claim cites the group `NEWFAIL` marker. Root lint output alone is not a group result. | A lint group is claimed green from root output only. |
| D2 | A5, A6 (F-PA3) | The corrected evidence sentence cites the verified lockfile parent chain. | An exception names a parent absent from the lockfile chain. |

A1, A2, and A12 are supervisor, consent, and governance anti-patterns. This dependency-only track touches none of those code paths. No test in this track exercises them.

## 11. Gate script verification

`bash -n measure/tracks/dependency-refresh_20261121/gates.sh` passes. Usage paths exit 2: no arguments, an invalid gate name, and an invalid label. No full gate ran in this role. The runner reuses `key`, `new_keys`, `sweep`, `audit_step`, `has_infra_output`, `GATES_BASE`, and `GATES_RESUME` from the archived toolchain runner. It validates audit JSON, resolves propagated parent findings to advisory identifiers, detects infrastructure failures, compares workspace sets, and rejects removed scripts. `NEWFAIL=0` means no new failure key. Infrastructure failures return 3.

D2 changes the guard tool. For each change, the role records the fixture case that failed before the fix and passes after. The PM cap of 2026-11-22 limits new cases. A finding that hides no failure in the D2 results goes to `plan.md` as tech debt. No role edits `measure/gates.json`. No role grows the gate tool without an end.
