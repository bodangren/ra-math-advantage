# Spec Review: vinext-oxc-toolchain_20261114

Author model: claude-opus-5-5[1m]

## Round 1

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track moves the monorepo to vinext 1.x and removes the `next` package. It replaces ESLint with oxlint, `tsc` with tsrs through oxlint, and adds oxfmt as the format gate. It also updates every dependency to the latest version that passes the gates. Each phase records speed, gaps, and workarounds in one evidence file for other repositories.

### How the current system works, per this spec

Five apps and 20 shared packages run as npm workspaces on vinext 0.0.55 with `next` 16 pinned in the root `overrides`. Nineteen workspaces hold an `eslint.config.mjs`; ESLint is the lint gate, `tsc --noEmit` (TypeScript 6.0.3) is the type-check gate, and no formatter exists. CI uses Node 20 while the local Node is 24. The spec verified these facts on 2026-11-14.

### Findings

- F1 [Major] spec "Terms" (Conformance gap) and Story S3: The plan pins `typescript` 7.0.2 but `tsrs` 0.25.0-ts7.1.0-beta, and tsrs pins its own compiler, TypeScript 7.1.0-beta. The S3 comparison then mixes tsrs checker differences with compiler version differences. Rationale: The evidence file is a track deliverable (D5). Gaps that come from 7.0.2 vs 7.1.0-beta would be recorded as tsrs conformance gaps and would mislead other repositories. The plan should pin one compiler line for both tools, or record the compiler skew next to each gap.
- F2 [Nit] plan.md S5 Contract: "in each `ws:*:typecheck` script, remove the `|| npx tsc --noEmit --project ...` part". The text does not say whether the trailing `||` stays. A trailing `||` is a shell syntax error. Rationale: The edit target should be unambiguous; the S5 test only checks that no `ws:*` script contains `tsc`.
- F3 [Nit] plan.md S2: The task "Add `oxlint` `^1.93.0` to the root `devDependencies`" appears twice, in S2 Contract and in S2 Implement. Rationale: The duplicate step is harmless but can confuse the implementer about which task owns the change.

### Author Response
- F1: FIX
- F2: DECLINE
- F3: DECLINE

## Round 2

Date: 2026-11-14
Reviewer: measure-spec-review (kimi-code-plan-cn/kimi-for-coding#high)

### What this track proposes

This track moves the monorepo to vinext 1.x and replaces ESLint, tsc, and no formatter with the Oxc tools: oxlint, tsrs, and oxfmt. It runs in 5 phases: S1 refreshes packages and moves the apps to vinext 1.x without the `next` package, S2 migrates each ESLint config to oxlint, S3 makes TypeScript 7 and tsrs the type-check gate, S4 formats the repository with oxfmt in one format-only commit, and S5 names the new gates in AGENTS.md, the workflow, the tech stack, the root scripts, and CI. The track records speed, held packages, rule gaps, and conformance gaps in one evidence file so other repositories can reuse the results. Every dependency moves to the latest version that passes the gates.

### How the current system works, per this spec

The 5 apps run vinext 0.0.55 and declare the `next` package, which the root overrides pin. Each workspace runs `tsc --noEmit` on TypeScript 6.0.3, 19 ESLint configs exist, and no formatter exists. CI uses Node 20 while the local Node is 24. The audit suites of the precedent track pin package lines, but no CI step runs them.

### Findings

- F1: resolved. The spec now pins the conformance comparison to one compiler line and adds the "Compiler-version difference" term. Story S3, the evidence contract, and the plan task match. Withdrawn.
- F2: DECLINE stands. Valid for a Nit. Withdrawn from findings.
- F3: DECLINE stands. Valid for a Nit. Withdrawn from findings.
- F4 [Nit] plan.md "S3 Implement — compare tsrs with tsc on the same compiler line" and spec.md "Terms" "New failure": the plan records compiler-version differences in the section 7 table but does not say the implementer treats a compiler-version difference that tsrs reports as not a new failure of the tsrs gate. The baseline uses tsc 6.0.3, so a diagnostic that only the 7.1.0-beta line reports can look new at the gate. Rationale: the gate pass rule compares against the baseline, and the plan can send the implementer to fix a diagnostic that is not a code fault.

```measure-agent-result
MEASURE_AGENT_RESULT
role: spec-review
phase: track setup
status: pass
retry_recommendation: none
findings: F1 withdrawn (fixed); F2 withdrawn (declined Nit); F3 withdrawn (declined Nit); F4 Nit (nonblocking)
```

### Author Response
- F4: DECLINE

## Accepted Risks
- None. No Blocker or Major finding remains after Round 2.
