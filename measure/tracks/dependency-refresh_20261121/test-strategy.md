# Test Strategy: dependency-refresh_20261121

Track: `dependency-refresh_20261121`. Type: chore. Lane: light.
Phases: D1 (Fix the critical and high advisories), D2 (Update the remaining packages).
Role: measure-strategy. Status: confirmed for D1 by the strategy role. D2 holds the essentials; refresh D2 at D2 Red if the plan changes.

This file confirms and corrects the author draft. This track never edits `measure/gates.json`. The orchestrator passes all five gate commands as environment variables on each role-gate, including `PROJECT_TESTS` for adversarial testing. Section 3 lists the exact values.

## 1. What this strategy proves

Dependency changes can alter build output, runtime behavior, types, and test behavior. Security findings require a real npm audit report. The proof has three parts.

1. Gate sweeps compared with a baseline by diagnostic key across all active workspaces.
2. A validated full audit JSON and a Green gate that resolves advisory identifiers to named exceptions.
3. Live behavior proof: build, typecheck, workerd probe, accepted S1 tests, and both bundle audits.

Artifact and document checks are supporting evidence only. These checks cover evidence tables, the plan target table, unstaged generated files, and unchanged budgets. A document check proves that text exists. It does not prove that a tool works. Each document check has a live complement in section 6.

No test calls a paid model API. No new test code is needed for version changes alone. Add a failing regression test first when a compatibility edit changes behavior. Do not replace durable assertions with frozen package-version assertions.

## 2. Risk and review applicability

| Phase | Risk | Review A | Review B | Review C | Adversarial | Browser |
|-------|------|----------|----------|----------|-------------|---------|
| D1 | high | applicable | applicable | not applicable | applicable | not applicable |
| D2 | medium | applicable | applicable | not applicable | not applicable | not applicable |

D1 risk is high. It changes dependency chains across the root, six apps, and 20 packages. The chains include native binaries (sharp) and the build and deploy toolchain (wrangler, `@cloudflare/vite-plugin`, miniflare, undici, ws). It changes security posture. It may add a root `overrides` entry, a changed contract for every workspace. A false-green audit gate can ship a known high advisory as resolved. Adversarial testing therefore applies to D1.

The four named review kinds:

- **Security review:** applicable to D1 and D2. It is the Review B audit of the lockfile diff, install scripts, manifest ranges, and each override with its reason. It includes the full audit JSON validation, the accepted S1 tests, and the workerd probe.
- **UX/API review:** not applicable. Review C does not apply because neither phase changes a public package contract or a user or API surface. If a necessary compatibility edit changes an interface, UX/API review becomes required for that phase.
- **Adversarial testing:** applicable to D1 because risk is high. The reviewer tries to make the audit gate pass falsely: an exception row that hides an unresolved advisory, a `--omit` option, a vinext downgrade to 0.2.1, an override with no fixed parent, or a corrupted audit JSON that the validator accepts. The allowed outcome is never an exclusion. The outcome is a PM decision. Not applicable to D2.
- **Browser review:** not applicable. Both phases are dependency-only and no UI change is expected. If a compatibility edit changes the interface, browser review against a fresh baseline becomes required.

Review A (both phases): independent review of gate changes, test changes, evidence claims, and the diff. The reviewer is not the Red author.
Review B (both phases): read the lockfile diff, install scripts, every manifest range change, and each root `overrides` entry with its compatibility proof. The reviewer is not the Green implementer.

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

D2 values are in `plan.md`. Refresh them at D2 Red. They use the `d2-baseline` label, or `d1-green` when no code or lockfile changed after that sweep.

## 4. Baseline capture points

### 4.1 Immutable phase base commit

This strategy commit lands first. Its subject is `measure(strategy): confirm the D1 test strategy (track_id: dependency-refresh_20261121)`. Immediately after that commit, before any other commit, the orchestrator runs `git rev-parse HEAD` and stores the value as the D1 `phase_base_sha` in the run log and the role handoff. No SHA in this document is the phase base. A SHA that predates this strategy commit is void. Capture before the first D1 task commit. Capture the D2 phase base right after the plan commit that marks D1 complete.

At the D1 capture, only the six generated files and the concurrent OpenRouter plan edit may appear in `git status --porcelain`. No role stages them. Any staged file or another modified file stops the capture. `measure/runs/` is gitignored.

### 4.2 Gate baseline folder

D1 Red captures the `d1-baseline` gate folder before any dependency change. Run every group once: format, lint, typecheck, test, build, support, docs. Labels containing `-baseline` record only. Set `GATES_BASE=d1-baseline` at Green. Refresh the baseline when code or the lockfile changes after capture. Use a new label suffix and keep earlier logs. Record the base commit, commands, workspace paths, and log paths in `evidence.md`.

## 5. Known baseline failures — keys, not counts

The baseline has standing failures. Record each by diagnostic key from the `d1-baseline` logs in `evidence.md`. Do not rely on counts. Neither the plan nor this strategy pins a failure count.

| Area | Standing failure | Key definition |
|------|------------------|----------------|
| IM3 typecheck | diagnostic lines | workspace + file + TS code |
| IM3 tests | failing tests | workspace + test file + full test title |
| BM2 tests | failing tests | workspace + test file + full test title |
| Scripts suite | failing tests | suite + test file + full test title |
| Audit suites | failing tests | suite + test file + full test title |
| BM2 bundle audit | `Total dist/server` exceeds its budget | app + budget entry |

The baseline log paths in `evidence.md` are authoritative. Fresh logs must prove the exact keys, including any invalid KaTeX edge from `npm ls --all`. Counts in `evidence.md` describe the initial report only. A count does not authorize an exception. A missing log, command, workspace, or expected test execution fails. `NEWFAIL=0` means no new keys, not that every command passed.

## 6. Fixtures, mocks, and live-behavior proof

Fixtures:

- The full audit JSON from `npm audit --json`. The runner rejects a top-level error, a missing `metadata.vulnerabilities` object, non-integer severity counts, and a missing `vulnerabilities` object.
- The `D1 High Exceptions` table in `evidence.md`. Each row needs five non-empty cells and a valid identifier (`GHSA-...` or `npm:<n>`).
- The plan `D2 Targets` table. Each row needs a manifest, package, stable target, and decision.

Mocks:

- The workerd probe uses a local mock server and makes no paid request. Require `probe-ok` from the real SDK.
- No mock replaces the npm audit. The audit report must come from the registry.

Live-behavior proof:

- Gate sweeps for format, lint, typecheck, test, build, support, and docs across every active workspace. Each job runs through `heavy-run.sh` with `CI=true`. Run one job at a time.
- The full audit and `npm ls --all`. Tree keys cover invalid, missing, and extraneous edges.
- The full `packages/ai-tutoring` suite and the accepted OpenRouter S1 route and provider tests in IM3 and BM2.
- The workerd probe with `probe-ok`.
- Both bundle audits with per-entry parsing and total bytes comparison.

A passing build does not replace the typecheck or the workerd probe.

## 7. Architecture guardrails and changed-contract risks

- Shared packages must not import from `apps/` or `convex/_generated/`. The support group runs the boundary check.
- A root `overrides` entry is a changed contract. Review B reads each entry and its reason. Use an override only when the blocking parent has no fixed release. The blocking parent is the first package whose range excludes the fixed version, starting at the vulnerable leaf.
- Manifest ranges and the lockfile are changed contracts. Review B reads them. Keep updates targeted. Never run `npm audit fix --force`. Never downgrade vinext to 0.2.1.
- Keep `@types/node` on 24.x. Move exact pins (oxfmt, tsrs) only to released versions that pass the gates. Adopt no new prerelease. Do no repository-wide reformat.
- Keep bundle budgets and the manual deploy triggers in `.github/workflows/` unchanged. Name `apps/bus-math-v2/scripts/bundle-size-audit.mjs` and `apps/integrated-math-3/scripts/bundle-size-audit.mjs`.
- Keep the six generated files unstaged. Keep `measure/gates.json` unchanged.
- Add no hashes, checksums, manifests, or provenance fields. Use Git commit identity.
- Stop the phase on a new failure key or an infrastructure failure. Stop when a passing budget entry fails or an app total grows more than 5% over baseline. Send either stop condition to the orchestrator. The known BM2 total failure stays a baseline key and still obeys the growth rule.

## 8. Intentionally-red aggregate-suite handling

- D1 Red is intentionally red. `npm audit --audit-level=high` exits 1 on critical or high advisories. An infrastructure failure is not valid Red. If the audit already passes, Red records `red_kind: gap_closing`, `gaps:`, and `breakage_proof:`. The strategy role confirms that deviation from evidence. Red does not manufacture a failure.
- The Green command can exit 0 while the raw `npm audit` stays red for named exceptions. A disclosed exception permits the Green gate. It does not mean the audit passes. The PM report names every unresolved finding.
- The gate sweeps are red at baseline from standing failures. These are not intentionally red. The key comparison absorbs them. Do not expect `PROJECT_TESTS` to be green between Red and Green.
- A filtered Green run is not evidence. The Green command must exit 0 without a filter.
- D2 Red uses the target command. It fails while any installed version is below its stable target.

## 9. Green and closeout gates

D1 Green gate: `GREEN_TEST_COMMAND` exits 0 with no high or critical identifier outside the exception table. `PROJECT_LINT`, `PROJECT_CHECKS`, and `PROJECT_TESTS` each print `NEWFAIL=0`. No infrastructure failure. No new budget failure and no total growth above 5%.

D1 closeout gate (phase acceptance): the Green gate; the full baseline key comparison with no new key; OpenRouter S1 acceptance evidence (passing phase role-gate and checkpoint commit) in `evidence.md` before Green; PM confirmation of exclusive dependency changes through the checkpoint; the accepted S1 tests and workerd probe pass; every gate group logged; budgets and manual triggers unchanged; the six generated files unstaged; Daniel's confirmation recorded; the checkpoint commit in the phase heading. The orchestrator pushes the D1 checkpoint through `safe-push` by 2026-11-23.

D2 Green gate: the target command exits 0; the audit exception check passes; all gates print `NEWFAIL=0` against `d2-baseline` (or `d1-green` when reused).
D2 closeout gate: D2 phase acceptance and checkpoint; the final advisory table complete; budgets and manual triggers unchanged; generated files unstaged; push at closeout through `safe-push` by 2026-11-25.

## 10. Anti-pattern coverage

Every defense names its falsification condition.

| Phase | A-class | Defense | Falsification condition |
|-------|---------|---------|-------------------------|
| D1 | A3 | Parse audit counts and `NEWFAIL` as labeled integers from `critical=`, `high=`, and `NEWFAIL=`. | A bare digit or substring match passes a wrong count. |
| D1 | A4 | The audit gate requires every high or critical identifier in a non-empty exception row. The sweep requires workspaces ran. The validator rejects missing results. | An empty exception table, an empty suite, or a missing report passes. |
| D1 | A5 | Each evidence claim cites a log at the same commit. `all pass` appears only after a command exits 0. | A claim has no green command at that commit. |
| D1 | A6 | With unresolved exceptions, the PM report says `unresolved`. The registry never says `resolved` while the full audit is red. | The registry claims `all pass` with an open exception. |
| D1 | A7 | Advisory parse uses anchored patterns (`^(GHSA-[\\w-]+\|npm:\\d+)$`, `^(high\|critical)$`). No bare English-word filters. | A coarse filter drops a real advisory. |
| D1 | A9 | All track-path references stay inside this track folder. `gates.sh` moves with the track on archive. | A test outside the track pins `measure/tracks/dependency-refresh_...`. |
| D1 | A10 | Generated files stay unstaged. The docs gate runs generate and doctor without staging drift. | A generated change is staged. |
| D1 | A11 | `gates.sh` and the audit checks are the live guard suite. | The runner disappears or is never run. |
| All | A8 | Tasks move `[~]` then `[x]` with a commit SHA. Role gates read structured markers. | A `[ ]` space marker counts as in-progress. |
| D2 | A3 | Parse target versions as integers and compare by label. | A digit-only match passes a below-target version. |
| D2 | A4 | The target command fails on an empty table or a missing package. | An empty target set passes. |
| D2 | A5, A6 | Evidence claims cite logs at the same commit. A deferral carries a failed gate and reason. | A deferral has no failing command. |
| D2 | A9, A10 | Same defenses as D1. | Same falsification conditions as D1. |

A1, A2, and A12 are supervisor, consent, and governance anti-patterns. This dependency-only track touches none of those code paths. No test in this track exercises them.

## 11. Gate script verification

`bash -n measure/tracks/dependency-refresh_20261121/gates.sh` passes. Usage paths exit 2: no arguments, an invalid gate name, and an invalid label. No full gate ran in this role. The runner reuses `key`, `new_keys`, `sweep`, `audit_step`, `has_infra_output`, `GATES_BASE`, and `GATES_RESUME` from the archived toolchain runner. It validates audit JSON, resolves propagated parent findings to advisory identifiers, detects infrastructure failures, compares workspace sets, and rejects removed scripts. `NEWFAIL=0` means no new failure key. Infrastructure failures return 3.
