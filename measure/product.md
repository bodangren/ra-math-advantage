# Product Definition — ra-integrated-math-3 Monorepo

## Overview

This monorepo hosts multiple high school math course applications built on a shared platform. Each app delivers course-specific curriculum through a common architecture: Convex backend, Vinext frontend, phase-based lesson system, and teacher monitoring tools.

## Shared Product Vision

- **Course-agnostic platform**: The technical infrastructure (auth, progress tracking, teacher dashboards, SRS practice) is shared across all courses.
- **Course-specific apps**: Each app owns its curriculum, design system, and domain-specific components.
- **Classroom-ready**: Every app targets real classroom use — not demos or prototypes.

## Apps

| App | Course | Status |
|-----|--------|--------|
| `apps/integrated-math-1/` | Integrated Math 1 | Scaffold in progress |
| `apps/integrated-math-2/` | Integrated Math 2 | Scaffold complete |
| `apps/integrated-math-3/` | Integrated Math 3 Honors | Active development |
| `apps/bus-math-v2/` | Math for Business Operations v2 | Migrated, maintained |

## Shared Features (Platform-Level)

These features exist across all apps via shared packages in `packages/`:

- **Practice Contract** (`practice-core`): Unified submission envelope, timing telemetry, SRS rating
- **SRS Engine** (`srs-engine`): FSRS scheduler, review processor, queue primitives
- **Auth** (`core-auth`): JWT sessions, password hashing, role-based access
- **Convex Infrastructure** (`core-convex`): Client config, admin auth, query helpers
- **Activity Runtime** (`activity-runtime`): Phase types, activity modes, completion tracking
- **Component Approval** (`component-approval`): Content hashing, review queue assembly
- **Graphing Core** (`graphing-core`): Quadratic/linear parsers, canvas utilities
- **Practice Test Engine** (`practice-test-engine`): Shared test types and question utilities
- **Study Hub Core** (`study-hub-core`): Flashcard/review session primitives
- **Teacher Reporting Core** (`teacher-reporting-core`): Gradebook, course overview, competency heatmap
- **AI Tutoring** (`ai-tutoring`): OpenRouter provider, retry wrapper, lesson context
- **Workbook Pipeline** (`workbook-pipeline`): Filename, manifest, and path utilities

## Global Competency Standard Codes

To support cross-course remediation (e.g., a student in Integrated Math 3 receiving practice activities from Integrated Math 1), the system implements a Knowledge Graph for competency standards.
Therefore, all `competency_standards` records must use **globally unique, namespaced codes** across the entire monorepo.
- **Example:** `IM1.A.REI.B.3`, `IM3.F.TF.A.1`, `BM2.FIN.4`

This prevents namespace collisions when the SRS engine pulls problem families from `packages/math-content` for prerequisites belonging to different courses.

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

## Non-Goals

- Content authoring/CMS (content managed in database and seed scripts)
- Real-time collaboration
- Mobile native apps
- Third-party LMS integration (Canvas, Google Classroom)
