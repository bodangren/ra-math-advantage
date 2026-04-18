# AGENTS -- Integrated Math 3

This project uses the **conductor** skill for spec-driven development.
Follow Conductor tracks and the workflow in `conductor/workflow.md`.

## Scope

- Edit only `apps/integrated-math-3/`. The sibling `bus-math-v2/` is reference-only.
- Do not port business-domain components (accounting, spreadsheets, simulations) from the template.

## Practice Contract

Activities implement the `practice.v1` contract from bus-math-v2.
See `conductor/practice-component-contract.md` for the full spec.

## Where to Look

| What | Where |
|------|-------|
| Architecture, auth, routing | `conductor/architecture.md` |
| Tech stack and dev commands | `conductor/tech-stack.md` |
| Curriculum (9 modules, 52 lessons) | `apps/integrated-math-3/curriculum/` |
| Product scope and features | `conductor/product.md` |
| Active tracks and plans | `conductor/tracks.md` |
| Practice/activity contract | `conductor/practice-component-contract.md` |

## Guardrails

- No `npm install` or dependency changes without explicit approval.
- No destructive git commands (`reset --hard`, `checkout -- <file>`, `push --force`).
- TDD: write/adjust tests first, run `npm run lint` and relevant tests before each commit.
- Always run `npx tsc --noEmit` in addition to `npm run build` — vinext build does not enforce TypeScript types.
- Report discovered bugs/tech debt in Conductor planning artifacts.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
