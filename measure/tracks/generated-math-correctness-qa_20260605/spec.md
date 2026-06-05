# Track: Generated-Math Correctness QA

Program: High-Leverage Backlog (Tier 2)
Type: Chore (test infrastructure)
Depends on: blueprint/generator contract (Skill Graph T6); informs T17-T19

## Overview

The Runtime Enablement program will author ~450 deterministic generators (Tracks
17–19) that emit algorithmic math problems. A codebase check confirms there are
**no** golden-answer or property-based correctness tests for generators today.
Shipping generated problems without automated correctness verification risks
delivering wrong answers, invalid distractors, or unsolvable configurations to
students. This track builds a reusable correctness harness and a per-generator
contract that gates the generator program.

## Functional Requirements

- FR1 — Generator correctness contract. A shared interface each generator
  satisfies for QA: given a seed, it yields `{ problem, correctAnswer,
  distractors[], solutionSteps? }` with declared invariants.
- FR2 — Determinism property. Same seed → identical output; tested across many
  seeds (property-based).
- FR3 — Unique correct answer. For each generated instance, the stated correct
  answer is verifiably correct and unique (independent solver/oracle or
  structural check), across a large sampled seed space.
- FR4 — Distractor validity. Every distractor is *wrong*, distinct from the
  correct answer and from each other, and plausibly typed.
- FR5 — Solvability/range invariants. No degenerate instances (division by zero,
  empty solution sets where unexpected, out-of-range coefficients) — invariants
  declared per generator and asserted.
- FR6 — Harness + reporting. A single `verifyGenerator(gen, opts)` utility plus a
  CI report; a registry test runs all registered generators through it.
- FR7 — Gate. Wiring so a new/changed generator must pass the harness in CI.

## Non-Functional Requirements

- Domain-neutral harness core; math oracles live in math-content/app layers.
- Property-based testing (e.g., fast-check) with bounded, reproducible seeds.
- Fast enough for CI (sampled, not exhaustive) with a configurable sample size.

## Acceptance Criteria

- AC1 — `verifyGenerator` enforces FR2–FR5 with clear failure messages.
- AC2 — Registry test runs all existing generators through the harness; failures
  are surfaced (and either fixed or quarantined with a tracked debt row).
- AC3 — Determinism, unique-answer, distractor, and invariant properties each
  have passing tests on sample generators and catch an injected bad generator.
- AC4 — CI gate blocks a generator that violates the contract (proof test).
- AC5 — Boundary lints, `tsc --noEmit`, and tests pass.

## Out of Scope

- Authoring the missing generators themselves (Tracks 17–19).
- Pedagogical quality (difficulty calibration) beyond correctness.
- Rendering/visual correctness (covered by renderer tracks).
