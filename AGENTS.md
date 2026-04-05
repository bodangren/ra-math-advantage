# AGENTS -- Integrated Math 3

This project uses the **conductor** skill for spec-driven development.
Follow Conductor tracks and the workflow in `conductor/workflow.md`.

## Scope

- Edit only `integrated-math-3/`. The sibling `bus-math-v2/` is reference-only.
- Do not port business-domain components (accounting, spreadsheets, simulations) from the template.

## Practice Contract

Activities implement the `practice.v1` contract from bus-math-v2.
See `conductor/practice-component-contract.md` for the full spec.

## Where to Look

| What | Where |
|------|-------|
| Architecture, auth, routing | `conductor/architecture.md` |
| Tech stack and dev commands | `conductor/tech-stack.md` |
| Curriculum (9 modules, 52 lessons) | `curriculum/` |
| Product scope and features | `conductor/product.md` |
| Active tracks and plans | `conductor/tracks.md` |
| Practice/activity contract | `conductor/practice-component-contract.md` |

## Guardrails

- No `npm install` or dependency changes without explicit approval.
- No destructive git commands (`reset --hard`, `checkout -- <file>`, `push --force`).
- TDD: write/adjust tests first, run `npm run lint` and relevant tests before each commit.
- Report discovered bugs/tech debt in Conductor planning artifacts.
