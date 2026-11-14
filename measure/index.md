# Measure Index — RA Math Advantage

> Universal File Resolution Protocol: Named references resolve to paths below.

| Name | Path |
|------|------|
| **Current State and Planned Direction** | `../README.md` |
| **Agent Rules** | `../AGENTS.md` |
| **Current Directive** | `./current_directive.md` |
| **Product Definition** | `./product.md` |
| **Product Guidelines** | `./product-guidelines.md` |
| **Tech Stack** | `./tech-stack.md` |
| **Workflow** | `./workflow.md` |
| **Tracks Registry** | `./tracks.md` |
| **Track Sets Directory** | `./sets/` |
| **Lessons Learned** | `./lessons-learned.md` |
| **Tech Debt Registry** | `./tech-debt.md` |
| **Architecture** | `./architecture.md` |
| **Knowledge Space Architecture** | `./knowledge-space.md` |
| **Knowledge Space Contract** | `../kst-srs.v2/SPECIFICATION.md`; a pointer to the kst-srs.v3.2 source replaces it (planned: kst-v32-runtime_20261114) |
| **Tech Specs** | `./tech-specs.md` |
| **Code Styleguides** | `./code_styleguides/` |
| **Practice Component Contract** | `./practice-component-contract.md` |
| **Modules 3-9 Roadmap** | `./modules-3-9-roadmap.md` |
| **Daily Practice SRS Roadmap** | `./daily-practice-srs-roadmap.md` |
| **Practice Primitives Roadmap** | `./practice-primitives-roadmap.md` |
| **Curriculum** | `../apps/<app>/curriculum/` |

## Per-App Definitions

Each app owns its own product vision, guidelines, and design system. The root-level `measure/product.md` and `measure/product-guidelines.md` cover the monorepo-wide platform; app-specific docs cover course-specific details.

Today each math course is a separate app. One math app `apps/math` with the four courses as
data replaces them (planned: math-app-base_20261114, math-app-retire-old-apps_20261114).
`apps/danielson` comes in by import (planned: danielson-app-import_20261114).

### Product Definition

| App | Path |
|-----|------|
| **Monorepo (shared)** | `./product.md` |
| **Integrated Math 1** | `../apps/integrated-math-1/product.md` |
| **Integrated Math 2** | `../apps/integrated-math-2/product.md` |
| **Integrated Math 3** | `../apps/integrated-math-3/product.md` |
| **Bus Math v2** | `../apps/bus-math-v2/product.md` |
| **AP Precalculus** | `../apps/pre-calculus/product.md` |

### Product Guidelines

| App | Path |
|-----|------|
| **Monorepo (shared)** | `./product-guidelines.md` |
| **Integrated Math 1** | none (the shared guidelines apply) |
| **Integrated Math 2** | `../apps/integrated-math-2/product-guidelines.md` |
| **Integrated Math 3** | `../apps/integrated-math-3/product-guidelines.md` |
| **Bus Math v2** | `../apps/bus-math-v2/product-guidelines.md` |
| **AP Precalculus** | `../apps/pre-calculus/product-guidelines.md` |

### Design Definitions

| App | Path |
|-----|------|
| **Integrated Math 1** | `../apps/integrated-math-1/DESIGN.md` |
| **Integrated Math 2** | `../apps/integrated-math-2/DESIGN.md` |
| **Integrated Math 3** | `../apps/integrated-math-3/DESIGN.md` |
| **Bus Math v2** | `../apps/bus-math-v2/DESIGN.md` |
| **AP Precalculus** | `../apps/pre-calculus/DESIGN.md` |
