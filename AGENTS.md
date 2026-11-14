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

This project uses the **measure** skill for spec-driven development.
Follow Measure tracks and the workflow in `measure/workflow.md`.

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
  `(planned: math-app-base_20261114)`.
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
- TDD: write/adjust tests first, run `npm run lint` and relevant tests before each commit.
- Always run `npx tsc --noEmit` in addition to `npm run build` — vinext build does not enforce TypeScript types.
- Report discovered bugs/tech debt in Measure planning artifacts.
- **Commit policy:** When a skill-specific workflow (e.g., Measure's atomic-commits-per-task rule) is active, follow that workflow's commit requirements. Generic "do not commit unless asked" only applies to ad-hoc work outside tracked workflows.
- **Deploys and cloud cleanup:** Daniel authorized the orchestrator to run the prod deploys
  and to delete the old cloud resources of this repository (2026-11-14). This replaces the
  rule "deploys and deletions are human gates" for this project only. The deploy path runs
  locally with the OAuth logins of `wrangler` and `convex` (planned:
  prod-deploy-pipeline_20261114). Never touch the Convex project `codex-convex-probe`.
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
- Get the model of each role from `~/Desktop/advantage-pr/scripts/jobs/ra-quota pick <role>`.
- The full rules are in `~/Desktop/advantage-pr/measure/pm-working-rules.md`.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
