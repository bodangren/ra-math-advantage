# Product Guidelines — ra-integrated-math-3 Monorepo

## Shared Voice & Tone

- **Professional, clear, educational** — not playful or juvenile
- Student-facing text: encouraging and accessible
- Teacher-facing text: precise and data-oriented
- Serious but not corporate
- Specific instructions over motivational filler

## Shared Terminology

| Term | Meaning |
|------|---------|
| **Phase** | Lesson division (not "step" or "section") |
| **Unit** | Top-level course grouping |
| **Activity** | Interactive exercise (spreadsheet, practice problem, drag-and-drop, assessment) |
| **Practice Family** | Reusable problem type with shared grading logic |
| **SRS** | Spaced Repetition System for daily practice scheduling |
| **Competency** | Standards-aligned skill with mastery tracking |

## Shared Interaction Principles

- A student should always have a visible next step
- A teacher should identify student status without reading dense tables first
- Progress language distinguishes **published curriculum** from drafts
- Lesson shells reflect lesson type instead of forcing one UI pattern

## Shared Accessibility

- All interactive elements must have visible focus indicators
- Color is never the sole indicator of state — always pair with text/icon
- Phase status badges use color + text labels (e.g., "Completed", "In Progress")

## Shared Code Quality

- TypeScript strict mode enabled
- React Server Components by default; `"use client"` only for interactive components
- No `any` types without lint suppression comments
- Path alias `@/*` maps to app root

## App-Specific Guidelines

Each app extends these shared guidelines with course-specific rules:

| App | Guidelines |
|-----|------------|
| IM3 | `apps/integrated-math-3/product-guidelines.md` |
| BM2 | `apps/bus-math-v2/product-guidelines.md` |
| Danielson Teacher Growth | `apps/danielson/product-guidelines.md` |

## Anti-Patterns

- No admin-first information architecture
- No promise of in-app authoring before it exists
- No parallel curriculum story told by docs versus runtime
- No stale platform branding in active planning artifacts
- No business-domain code in shared packages
- No curriculum data in shared packages
