# Track 7: Practice-Variant Rename

Program: Knowledge Space Engine Alignment (kst-srs.v2)
Type: Refactor
Depends on: Track 1 — Wire the KST Pipeline + v2 Mastery Model
Improvement Plan: Item 7

## Overview

A `Card` is `student × objective × problemFamily`, and proficiency requires ≥3
families — but "problem family" is a math-app artifact. `ProblemFamily` is a
first-class typed entity in `practice-core` with a Zod schema, and
`problemFamilyId` is threaded through the scheduler, the SRS contract, and
proficiency, including the domain-neutral packages.

The domain-neutral need is **breadth of evidence** — proficiency should not rest
on a single problem type. This track renames the concept to "practice variant"
and makes subdivision optional, so a domain that does not subdivide uses a single
variant per objective. No new node kind is introduced (this retracts an earlier
proposal to promote problem family to a graph entity).

## Functional Requirements

- FR1 — Rename throughout. `problemFamilyId → variantKey`,
  `ProblemFamily → PracticeVariant`, `ProblemFamilyEvidence →
  PracticeVariantEvidence`, `minProblemFamilies → minVariants`, and all related
  identifiers — across `practice-core`, `srs-engine`, and
  `knowledge-space-practice`.
- FR2 — `Card` redefinition. `Card = student × objective × variantKey`.
  `variantKey` is domain-supplied; a domain that does not subdivide uses a single
  variant per objective (`variantKey = objectiveId`).
- FR3 — No new node kind. Variants live below the graph's resolution; they remain
  a domain decision.
- FR4 — Convex schema migration. Rename `srs_cards.problemFamilyId → variantKey`
  (and any related fields); define and apply a data migration for existing cards.
- FR5 — Call sites and tests. Update all call sites, fixtures, and tests for the
  breaking rename; the suite stays green throughout.

## Non-Functional Requirements

- Behaviour-preserving refactor — the proficiency algorithm is unchanged.
- Tests stay green at each phase boundary; the rename is mechanical, not semantic.
- Data migration is reversible / verifiable before old fields are dropped.

## Acceptance Criteria

- AC1 — Rename is complete and consistent across all three packages; no
  `problemFamily*` identifiers remain.
- AC2 — `Card` is keyed by `variantKey`; the single-variant default
  (`variantKey = objectiveId`) is implemented and documented.
- AC3 — No new node kind introduced.
- AC4 — Convex schema migration defined, applied, and verified against existing
  card data.
- AC5 — Boundary lints, `tsc --noEmit`, and the full test suite pass.

## Out of Scope

- Changing the objective-proficiency algorithm or thresholds.
- Introducing variants into the knowledge graph as nodes.
