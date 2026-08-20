# AGENTS -- Integrated Math 3

## Measure Workflow

All development runs through the **Measure** spec-driven development framework exclusively. At the start of every session:

1. Load the `measure` skill
2. Read `measure/index.md` to understand the project context
3. Follow the workflow defined in `measure/workflow.md`

Key reference files:
- `measure/tracks.md` — Active work registry
- `measure/tracks/<track_id>/plan.md` — Task checklist
- `measure/product.md` — Product vision
- `measure/tech-stack.md` — Technology choices
- `measure/lessons-learned.md` — Project memory
- `measure/tech-debt.md` — Known shortcuts

Never start significant work without an active track. Always update `measure/tracks.md` and the current track's `plan.md` before and after work.


This project uses the **measure** skill for spec-driven development.
Follow Measure tracks and the workflow in `measure/workflow.md`.

## Writing Standard

Use ASD-STE100 Simplified Technical English for all documents, plans, specifications, status updates, and reports.

- Use short and direct sentences.
- Use active voice.
- Give one instruction in each sentence.
- Use one term for one concept.
- Define an abbreviation when you first use it.
- Do not use idioms, vague words, or unnecessary modifiers.
- Preserve exact code, API, product, and source terms when accuracy requires them.

## Ponytail Rule

Before you write code, understand the problem. Read the code that the change touches. Trace the real flow. Then stop at the first rung that solves the problem:

1. Does this need to exist? If no, skip it. Apply YAGNI.
2. Does this codebase already have it? If yes, reuse it.
3. Does the standard library provide it? If yes, use it.
4. Does the native platform provide it? If yes, use it.
5. Does an installed dependency provide it? If yes, use it.
6. Can one line solve it? If yes, use one line.
7. Only then, create the minimum solution that works.

Be lazy about the solution. Do not be lazy about reading or verification. Do not reduce trust-boundary validation, data-loss protection, security, or accessibility.

## Hashing and Scope Policy

Do not add or expand cryptographic hashing unless an explicit existing specification, protocol, test, or external interface requires the exact change.

- Do not add SHA or checksum fields for screenshots, reports, snapshots, tests, manifests, review subjects, or source trees for audit purposes.
- Do not expand a hash to cover more files unless a documented contract requires it.
- Do not create a chain in which one generated artifact hashes another generated artifact.
- Do not regenerate an unrelated hash because a nearby implementation file changed.
- Use Git commit or tree identity for repository provenance.
- Use tests and assertions to verify correctness.
- Treat existing hash code as local legacy behavior. Do not copy its pattern.
- Before you add or broaden a hash, checksum, manifest, or provenance field, stop and explain the explicit existing contract and the minimum required scope.
- Change only the hashes that the requested behavior requires.

A hash proves content identity. It does not prove correctness.

Keep each change narrow. Do not add or expand manifests, checksums, tree hashes, screenshot hashes, provenance metadata, or audit machinery without an explicit existing contract.


## Scope

- Shared code lives in `packages/` and must not import from `apps/` or `convex/_generated/`.
- Each app owns its own design system, curriculum, and domain-specific components.

## Practice Contract

Activities implement the `practice.v1` contract from bus-math-v2.
See `measure/practice-component-contract.md` for the full spec.

## Where to Look

| What | Where |
|------|-------|
| Architecture, auth, routing | `measure/architecture.md` |
| Tech stack and dev commands | `measure/tech-stack.md` |
| Curriculum (9 modules, 52 lessons) | `apps/integrated-math-3/curriculum/` |
| Product scope and features | `measure/product.md` (IM3) or `apps/bus-math-v2/product.md` (BM2) |
| Active tracks and plans | `measure/tracks.md` |
| Practice/activity contract | `measure/practice-component-contract.md` |
| Design system (per-app) | `apps/<app-name>/DESIGN.md` — each app owns its own design tokens, palette, and component patterns. See `measure/index.md` "Design Definitions" table for the full list. |

## Guardrails

- No `npm install` or dependency changes without explicit approval.
- No destructive git commands (`reset --hard`, `checkout -- <file>`, `push --force`).
- TDD: write/adjust tests first, run `npm run lint` and relevant tests before each commit.
- Always run `npx tsc --noEmit` in addition to `npm run build` — vinext build does not enforce TypeScript types.
- Report discovered bugs/tech debt in Measure planning artifacts.
- **Commit policy:** When a skill-specific workflow (e.g., Measure's atomic-commits-per-task rule) is active, follow that workflow's commit requirements. Generic "do not commit unless asked" only applies to ad-hoc work outside tracked workflows.
- **Peer-reviewed components:** `measure/automation-supervisor.py` is a peer-reviewed component. Any modification to it (especially task-marker parsing, the `r"^- \[([~xb])\] (.+)"` regex, or `is_task_structurally_blocked`) must be peer-reviewed and re-audited by `measure-orchestrator-audit` before merge, because a regression silently corrupts phase completion accounting (anti-patterns A1/A8/A12).

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
