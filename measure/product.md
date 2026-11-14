# Product Definition — RA Math Advantage Monorepo

## Overview

This monorepo hosts high school math course applications built on a shared platform. Each app delivers course-specific curriculum through a common architecture: Convex backend, Vinext frontend, phase-based lesson system, and teacher monitoring tools.

This document gives the current state. A direction item of 2026-11-14 has the marker
`(planned: <track id>)`. `README.md` lists the full direction.

## Shared Product Vision

- **Course-agnostic platform**: The technical infrastructure (auth, progress tracking, teacher dashboards, SRS practice) is shared across all courses.
- **Course-specific content**: Each course owns its curriculum, design system, and domain-specific components. Today each course is a separate app. One math app `apps/math` holds IM1, IM2, IM3, and AP Precalculus as course data (planned: math-app-base_20261114). AP Calculus and AP Statistics come later.
- **Classroom-ready**: Every app targets real classroom use — not demos or prototypes.
- **Students across years**: one student account and one history across courses and
  years (planned: math-app-student-history_20261114), and a license for each seat and
  year (planned: math-app-seat-licensing_20261114).

## Apps

| App | Course | Status |
|-----|--------|--------|
| `apps/integrated-math-1/` | Integrated Math 1 | Separate app: Convex schema, seeds, skill graph |
| `apps/integrated-math-2/` | Integrated Math 2 | Separate app: Convex schema, seeds, skill graph |
| `apps/integrated-math-3/` | Integrated Math 3 Honors | Active development |
| `apps/pre-calculus/` | AP Precalculus | Separate app: Convex schema, skill graph |
| `apps/bus-math-v2/` | Math for Business Operations v2 | Migrated, maintained |

Planned changes:

- The four math apps become courses of `apps/math`, and the old apps retire with no
  redirects (planned: math-app-base_20261114, math-app-course-im1_20261114,
  math-app-course-im2_20261114, math-app-course-precalc_20261114,
  math-app-retire-old-apps_20261114).
- BM2 stays a separate app.
- `apps/danielson`, the Danielson Framework professional development site, comes in by
  import (planned: danielson-app-import_20261114).

## Shared Features (Platform-Level)

These features exist across the apps via shared packages in `packages/`:

- **Practice Contract** (`practice-core`): Unified submission envelope, timing telemetry, SRS rating
- **SRS Engine** (`srs-engine`): FSRS scheduler, review processor, queue primitives
- **Knowledge Space** (`knowledge-space-core`, `knowledge-space-practice`): graph schemas, readiness, knowledge state, placement, planner, projections. The contract is kst-srs.v2; the move to kst-srs.v3.2 is planned (planned: kst-v32-runtime_20261114).
- **Auth** (`core-auth`): JWT sessions, password hashing, role-based access. Convex Auth v2 replaces it (planned: math-app-base_20261114, bm2-convex-auth-v2_20261114).
- **App Shell** (`app-shell`): Shared auth context, providers, layout, header components
- **Convex Infrastructure** (`core-convex`): Client config, admin auth, query helpers
- **Activity Runtime** (`activity-runtime`): Phase types, activity modes, completion tracking
- **Activity Components** (`activity-components`): Shared activity components
- **Lesson Renderer** (`lesson-renderer`): Lesson and textbook rendering
- **Component Approval** (`component-approval`): Content hashing, review queue assembly
- **Graphing Core** (`graphing-core`): Quadratic/linear parsers, canvas utilities
- **Math Content** (`math-content`): Problem families, algebraic logic, glossary
- **Practice Test Engine** (`practice-test-engine`): Shared test types and question utilities
- **Study Hub Core** (`study-hub-core`): Flashcard/review session primitives
- **Teacher Reporting Core** (`teacher-reporting-core`): Gradebook, course overview, competency heatmap
- **Efficacy Core** (`efficacy-core`): Efficacy metrics
- **Rate Limiter** (`rate-limiter`): Sliding-window rate limits
- **AI Tutoring** (`ai-tutoring`): OpenRouter provider, retry wrapper, lesson context. The move to `@openrouter/sdk` with one model variable for each role is planned (planned: openrouter-sdk-ai-layer_20261114).
- **Workbook Pipeline** (`workbook-pipeline`): Filename, manifest, and path utilities

## Global Competency Standard Codes

**Current state:** each app stores the CCSS code of a competency in its own form. IM3 and
AP Precalculus use the form `HSA-SSE.B.3`. IM1 and IM2 use the form `A-SSE.A.1` (and IM1
also `6.EE.A.1`). A rule of 2026-05-04 asked for namespaced codes such as `IM1.A.REI.B.3`.
No app implements that rule, and the direction of 2026-11-14 replaces it.

**Planned rule:**

- A competency is a course-neutral CCSS code in canonical form, so evidence on a shared
  competency counts in each course that teaches it, with no transfer step (planned:
  math-app-base_20261114).
- The CCSS code of each skill comes from the released mastery-advantage graph, primary
  link first. A node on the PM-approved exception list shows its AP code only (planned:
  math-graph-consume_20261114).
- Teacher reporting shows the CCSS code. Where the app shows CCSS text, it also shows the
  CCSS copyright notice. The app shows no College Board text.

## App-Local Scope

Each app owns:

- Curriculum content (lessons, phases, activities, standards)
- Design system (DESIGN.md, globals.css, tailwind.config.ts, UI components)
- Domain-specific practice families (algebraic vs. accounting)
- Convex schema and seed data
- Routes and pages

## Target Users

### Students
- Progress through course-specific curriculum
- Complete interactive activities and assessments
- Track progress via personal dashboard
- Access daily practice with SRS scheduling

### Teachers
- Monitor student progress across courses
- View gradebooks and competency heatmaps
- Review submissions and error analysis
- Assign lessons and intervene with struggling students

### Admins
- Access teacher-compatible dashboards
- Organization-scoped data isolation

## License Facts

- The curriculum content is reproducible material from various publishers (Daniel,
  2026-11-14).
- The repository stays public (Daniel, 2026-11-14).
- The school holds the license of the Danielson Framework (Daniel, 2026-11-14).

## Non-Goals

- Content authoring/CMS (content managed in database and seed scripts)
- Real-time collaboration
- Mobile native apps
- Third-party LMS integration (Canvas, Google Classroom)
