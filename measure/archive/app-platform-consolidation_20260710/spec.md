# Specification: App and Platform Consolidation

## Overview

Reduce repeated course-app scaffolding and correct package-direction defects
without erasing app-owned curriculum or design systems. The audit found 43
identical production-file groups (about 123 KB of duplicated source), repeated
development/configuration files, and an inverted dependency from reusable
`activity-components` to domain-heavy `math-content`.

## Functional Requirements

1. Classify every identical production-file group as shared platform behavior,
   generated app scaffolding, or intentional app ownership; record rationale.
2. Define versioned shared presets or generators for development-stack scripts,
   framework/test/lint configuration, and genuinely common TypeScript types.
3. Preserve app-owned `DESIGN.md`, design tokens, global styles, curriculum,
   routes, seed data, and domain-specific components unless a contract explicitly
   identifies a course-neutral seam.
4. Remove the `activity-components -> math-content` dependency by injecting a
   renderer/content registry through a domain adapter owned by the consuming
   app or domain package.
5. Define a reusable course-app composition template that declares platform
   providers, auth/Convex adapters, routes, quality commands, and app-owned
   extension points.
6. Consolidate duplicated `dev-stack`, common types, framework config, test
   setup, and safe shell/provider wrappers through shared packages or generated
   artifacts.
7. Prevent copied shared files from drifting by adding generation freshness or
   ownership checks.
8. Measure duplicate groups/bytes, package edges, build output, and consumer
   behavior before and after consolidation.

## Non-Functional Requirements

- Shared presets expose typed extension points and do not become an unbounded
  configuration object.
- Consolidation is incremental and keeps each app runnable at every step.
- Package exports are explicit; consumers do not deep-import source files.
- No new dependencies are added without explicit approval.
- Visual and curriculum differences are treated as product requirements, not
  duplication defects.

## Acceptance Criteria

- The `activity-components` package no longer depends on `math-content`.
- No identical domain-neutral business logic remains app-owned without an
  explicit documented exception.
- Repeated configuration is shared or generated and freshness-tested.
- All five apps preserve their app-specific visual and curriculum contracts.
- Duplicate source bytes materially decrease from the recorded baseline and all
  architecture/quality gates remain green.

## Out of Scope

- A single visual design system for all courses.
- Shared curriculum or seed datasets.
- Backend table/handler extraction owned by
  `shared-lms-backend-modularization_20260710`.

