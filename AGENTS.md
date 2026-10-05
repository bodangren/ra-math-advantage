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


## Scope

- Edit `apps/integrated-math-3/` and `apps/bus-math-v2/` — both are first-class apps in this monorepo.
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

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
