# GBF Release Report

## Release IDs

- Sequence: `danielson.gbf.sequence.2026-08-19.v1`
- Mapping: `danielson.gbf.mapping.2026-08-19.v1`
- Graph: `danielson.gbf.graph.2026-08-19.v1`

## Source Facts

- The GBF scope and sequence has 5 pages.
- The sequence has 5 phases.
- The sequence has 12 required Management steps.
- The sequence has 13 required Rigor steps.
- The sequence has 5 preview steps.
- The TLAC snapshot has 63 approved skill modules.

## Mapping Facts

- The release has 78 mappings.
- The mappings use 50 unique TLAC skills.
- The release keeps 13 TLAC skills unsequenced.
- An unsequenced skill stays in the Danielson proficiency graph.
- An unsequenced skill gets no GBF phase or prerequisite edge.

## Edge Facts

- The release has 46 `supports` candidates.
- The release has 23 `prerequisite_for` candidates.
- The release rejects 4 unsafe prerequisite candidates.
- The release keeps all other candidates in `draft` state.
- The release has no active edge.
- Draft and rejected edges do not change KST readiness.
- GBF does not change SRS due dates.

## Assignment and Report Facts

- School heads and Senior Leadership Team (SLT) members can assign a GBF track.
- A system administrator role alone cannot assign a GBF track.
- Each assignment stores the sequence and graph release IDs.
- Reassignment adds an immutable row.
- Leadership reports use one bounded organization assignment read.
- Teacher reports use one bounded teacher assignment read.
- Reports show progress from Track 2 proficiency and due data.

## Deferred Work

The release does not activate a prerequisite edge.
A human must approve an edge before activation.
The full GBF and TLAC books can improve the mappings in a later release.
That later release must not change an earlier assignment.
