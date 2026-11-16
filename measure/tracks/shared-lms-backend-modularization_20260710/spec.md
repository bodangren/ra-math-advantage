# Specification: Shared LMS Backend Modularization

## Overview

Remove duplicated domain-neutral LMS backend behavior while preserving each
course application's independent Convex deployment, app-owned identifiers,
curriculum data, authorization, and generated API. The audit found identical
schemas and auth/backend files across course apps, but a Convex component is
not automatically the right abstraction: shared parent-table IDs and app-local
joins remain easier and safer in app-owned tables. Use normal packages for
contracts and pure behavior; use a packaged Convex component only for a bounded
subsystem that owns all of its tables and exposes a small validated API.

## Functional Requirements

1. Inventory common tables and operations for organizations, profiles,
   credentials, classes, enrollments, lessons, versions, phases, progress, and
   submissions; distinguish exact common behavior from app policy.
2. Define a shared LMS contract package for validators, roles, DTOs, table
   definition fragments, index names, errors, and pure domain services.
3. Keep schemas composed in each app so app-owned `Id<>` types, curriculum
   tables, generated APIs, and independent deployments remain intact.
4. Keep auth, environment access, authorization, public wrappers, HTTP routes,
   and cross-table orchestration in each app; shared packages accept explicit
   validated inputs and never trust caller-supplied user IDs for authorization.
5. Evaluate each candidate persistent subsystem against the Convex component
   decision rule. If a packaged component is justified, it owns isolated
   tables, uses string parent IDs at its boundary, has full args/returns
   validators, and is called through authenticated app wrappers.
6. Replace duplicated handlers with shared pure functions plus thin typed
   Convex adapters; preserve bounded indexed queries and transactional behavior.
7. Migrate apps incrementally with schema-parity, handler-behavior, auth, and
   stored-data compatibility tests.
8. Preserve each app's curriculum, design system, seed data, and domain-specific
   logic.

## Non-Functional Requirements

- No shared package imports an app or app-generated Convex module.
- No cross-app database or shared deployment is introduced.
- Queries are indexed and bounded; independent reads are parallelized, and
  per-student N+1 patterns are prohibited.
- Public/shared functions have explicit schemas and error contracts.
- Extraction must reduce duplicated behavior without replacing it with a
  generic untyped `utils` package.

## Acceptance Criteria

- Common LMS schemas and pure behavior have one implementation owner.
- App schemas remain independently deployable and validate existing documents.
- App adapters contain authorization and generated references but no duplicated
  domain-neutral algorithms.
- Component decisions are recorded; any packaged component is validated through
  codegen, package build, an example consumer, and `convex-test`.
- Behavioral parity tests pass across IM3, BM2, IM1, IM2, and Precalculus.

## Out of Scope

- One shared Convex database for all apps.
- Moving curriculum or design-system ownership into shared packages.
- Replacing the repository's custom auth product without a separate decision.

