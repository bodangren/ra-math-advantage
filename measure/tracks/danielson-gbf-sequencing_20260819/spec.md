# Specification: GBF Sequence and TLAC 3.0 Edges

## Overview

Use the supplied GBF scope and sequence to assign reviewed TLAC 3.0 skills to
parallel Management and Rigor trajectories. Record direct mappings and
inferences separately. Create reviewed support and prerequisite candidates for
the professional-learning graph.

The scope and sequence is sufficient to start this track. The full GBF 2.0 book
can later improve rationales and resolve gaps. Its absence does not permit
invented source claims.

## Functional Requirements

1. **FR-1 — Source manifest:** Record the exact source filenames, hashes,
   visible metadata, user-provided edition context, and permitted internal use.
2. **FR-2 — Source extraction:** Preserve the two parallel trajectories, phase
   boundaries, action-step numbers, names, and source pages.
3. **FR-3 — Versioned mapping:** Map each source action step to zero or more
   stable Track 2 skill IDs. Mark each mapping `direct` or `inferred`.
4. **FR-4 — Inference rationale:** Record the behavior match, author, date,
   confidence, and review status for each inferred mapping.
5. **FR-5 — Unsupported gaps:** Keep a gap list for TLAC 3.0 skills that the
   source does not safely place. Do not assign them a false GBF phase.
6. **FR-6 — Parallel paths:** Keep Management and Rigor progress separate. Do
   not require completion of one whole trajectory before the other.
7. **FR-7 — Support candidates:** Use `supports` for secondary skills that help
   deliver one source action step but are not required predecessors.
8. **FR-8 — Prerequisite candidates:** Infer `prerequisite_for` candidates only
   between reviewed primary skills in consecutive steps of one trajectory.
9. **FR-9 — Safe activation:** Keep every new edge in `draft` until human
   review. Do not assign hard-gate weight by default.
10. **FR-10 — Assigned GBF track:** Assign a new teacher a versioned set of GBF
    skills and trajectory phases. Keep the assignment separate from observed
    proficiency.
11. **FR-11 — KST readiness:** Use only approved prerequisite edges in KST
    readiness and outer-fringe calculations.
12. **FR-12 — SRS due dates:** Continue to use Track 2 SRS cards for time and
    review scheduling. GBF phase metadata must not create a second scheduler.
13. **FR-13 — Progress projection:** Provide current phase, assigned skills,
    proficient skills, due skills, and unresolved gaps to Track 4.
14. **FR-14 — Version stability:** A source or mapping update creates a new
    release. It must not rewrite historical assignments or evidence.

## Non-Functional Requirements

- Keep source text, mappings, and graph edges application-owned.
- Do not import the sibling application at runtime.
- Do not copy long source passages into application data.
- Use stable source locations and short rationales.
- Validate graph closure, duplicate IDs, endpoints, and prerequisite cycles.
- Keep edge activation deterministic, reviewable, and reversible.

## Acceptance Criteria

1. The source manifest matches both supplied PDF hashes.
2. The normalized sequence contains Phase 1, Phase 2, Phase 3, Phase 4, and
   Stretch It with separate Management and Rigor trajectories.
3. Every mapping has a stable source action-step ID, TLAC skill ID, mapping
   status, rationale, confidence, and review status.
4. The mapping output matches `tlac3-sequence.md` or records an approved review
   amendment.
5. Unsequenced TLAC skills receive no GBF phase or prerequisite edge.
6. Draft mappings and edges have no effect on KST readiness, SRS due dates, or
   teacher reports.
7. Approved support edges do not become prerequisites.
8. Approved prerequisite edges stay inside one trajectory unless a separate
   reviewed rationale permits a cross-trajectory edge.
9. No activated edge has a dangling endpoint, duplicate identity, prohibited
   pairing, or medium- or high-confidence prerequisite cycle.
10. A new-teacher assignment records the exact graph and sequence release.
11. GBF progress shows phase and skill status without changing raw Danielson
    ratings.
12. A new source release does not rewrite an earlier assignment, observation,
    or report.
13. Source, graph, KST, SRS, projection, tests, coverage, lint, typecheck, build,
    generated-fact, boundary, and Measure Doctor gates pass.

## Out of Scope

- Reproducing the full GBF 2.0 book.
- Treating chapter or phase order as an automatic hard prerequisite.
- Changing KST or SRS algorithms.
- Changing Track 2 stable node IDs.
- A second scheduling system.
- Automatic changes to Danielson ratings.
- Source-informed coaching meetings, reflections, or surveys that the school
  has not approved.
