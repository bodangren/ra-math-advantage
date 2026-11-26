# AGENTS -- RA Math Advantage

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

Each phase of a track ends with the checkpoint protocol of `measure/workflow.md`. Each track
ends with a sync with origin: `git fetch origin`, `git pull --ff-only origin master`, then
`git push origin master`. If the pull cannot fast-forward, stop and report. No step before
the closeout pushes. Do the tracks in the order of `measure/tracks.md`.


## Writing Standard

Use ASD-STE100 Simplified Technical English for all documents, plans, specifications, status updates, reports, and user-facing web text.

- Use short and direct sentences.
- Use active voice.
- Give one instruction in each sentence.
- Use one term for one concept.
- Define an abbreviation when you first use it.
- Do not use idioms, vague words, or unnecessary modifiers.
- Preserve exact code, API, product, and source terms when accuracy requires them.
- Apply this standard to page content, navigation labels, form labels, help text, validation messages, error messages, empty states, and confirmation messages.

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

### Over-Engineering Limits

- Implement the requested behavior. Do not build for hypothetical future needs.
- Do not add registries, approval workflows, audit ledgers, event sourcing, caches, projection tables, wrappers, adapters, or extension points unless the current behavior requires them.
- Prefer deletion, reuse, and direct code before you add a new layer.
- Keep one source of truth. Do not persist data that the application can read or derive safely at the required scale.
- Do not turn documentation, provenance, or review notes into runtime systems.
- If a correct change requires more scope, stop and explain why before implementation.

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

## Current State and Planned Direction

The documents keep the current state apart from the planned direction of 2026-11-14.

- **Current state:** five apps under `apps/`: `integrated-math-3` (primary),
  `integrated-math-1`, `integrated-math-2`, `pre-calculus`, and `bus-math-v2`. Each app has
  its own Convex schema, curriculum, design system, and `wrangler.jsonc`. Auth is the
  custom JWT auth of `packages/core-auth`.
- **Planned direction:** `README.md` (section "Planned Direction") lists each item with its
  track. The main items are one math app `apps/math` with the four courses as data, Convex
  Auth v2, the mastery-advantage graph (kst-srs.v3.2), the OpenRouter SDK, vinext 1.x with
  the Oxc tools, and local deploys to Cloudflare Workers.

### Planned Marker Rule

- A document marks a direction item with `(planned: <track id>)`, for example
  `(planned: math-app-base_20261114)`. Keep each marker on one line, so that `git grep`
  finds it.
- The track that completes the item removes the marker and writes the current state in the
  same document.
- Do not describe a planned item as current, and do not describe a current item as
  planned.

## Scope

- Edit the apps under `apps/` and the packages under `packages/`, through a track. Today
  the tracks edit `apps/integrated-math-3/` and `apps/bus-math-v2/` most. The math app
  `apps/math` replaces the four math apps (planned: math-app-base_20261114).
- Shared code lives in `packages/` and must not import from `apps/` or `convex/_generated/`.
- Each app owns its own design system, curriculum, and domain-specific components.

## Practice Contract

Activities implement the `practice.v1` contract from bus-math-v2.
See `measure/practice-component-contract.md` for the full spec.

## Where to Look

| What | Where |
|------|-------|
| Current state and planned direction | `README.md` |
| Architecture, auth, routing | `measure/architecture.md` |
| Tech stack and dev commands | `measure/tech-stack.md` |
| Curriculum (IM3: 9 modules, 52 lessons) | `apps/integrated-math-3/curriculum/` |
| Product scope and features | `measure/product.md` (math apps) or `apps/bus-math-v2/product.md` (BM2) |
| Active tracks and plans | `measure/tracks.md` |
| Practice/activity contract | `measure/practice-component-contract.md` |
| Design system (per-app) | `apps/<app-name>/DESIGN.md` — each app owns its own design tokens, palette, and component patterns. See `measure/index.md` "Design Definitions" table for the full list. |

## Guardrails

- No `npm install` or dependency changes without explicit approval.
- No destructive git commands (`reset --hard`, `checkout -- <file>`, `push --force`).
- TDD: write/adjust tests first, run `npm run format:check`, `npm run lint`, and relevant tests before each commit.
- Always run `npm run typecheck` in addition to `npm run build`. vinext build does not enforce TypeScript types. `npm run typecheck` runs oxlint with tsrs.
- Report discovered bugs/tech debt in Measure planning artifacts.
- **Commit policy:** When a skill-specific workflow (e.g., Measure's atomic-commits-per-task rule) is active, follow that workflow's commit requirements. Generic "do not commit unless asked" only applies to ad-hoc work outside tracked workflows.
- **Deploys and cloud cleanup:** Daniel authorized the orchestrator to run the prod deploys
  and to delete the old cloud resources of this repository (2026-11-14). This replaces the
  rule "deploys and deletions are human gates" for this project only. The deploy path runs
  locally with the OAuth logins of `wrangler` and `convex`
  (planned: prod-deploy-pipeline_20261114). Never touch the Convex project
  `codex-convex-probe`.
- **Secrets:** a deploy key, a token, or a password never goes into a file, a commit, or a
  log. The orchestrator gets each manual secret (for example the OpenRouter API key) from
  Daniel through a secret card.
- **Paid spend:** paid generation and paid model use need Daniel's word.

## Cross-Project Rules

- The PM orchestrator session (project advantage-pr) is the only cross-project coordinator.
- Send work for another project to the PM orchestrator, with what, why, done-when, and the
  date needed.
- Never write in another project's repository. Facts and files move by handoff through the
  PM orchestrator (for example the folders under `/home/daniebo/Desktop/handoff/`).
- Direct read-only questions between sessions are allowed. Log each exchange in your next
  report.
- Close every PM assignment with a "facts changed" list.

## Shared Machine Rules

- Run `~/Desktop/advantage-pr/scripts/jobs/slot check` before you start a role (a
  subagent). Start the role only when the check says ok.
- Run each heavy job through `~/Desktop/advantage-pr/scripts/jobs/heavy-run.sh`, one at a
  time.
- Choose the model of each role yourself from the Lending Desk Bench model guide and results, other benchmarks, and `ra-quota status`.
- The full rules are in `~/Desktop/advantage-pr/measure/pm-working-rules.md`.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
