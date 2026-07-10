# Specification: KST+SRS v3 Contract and Core Correctness

## Overview

Adopt `kst-srs.v3.2` from `../mastery-advantage/SPECIFICATION.md` as the
canonical KST+SRS contract and implement the v3 correctness changes before
v3.1 or v3.2 feature work begins. The vendored source must be an exact,
hash-stamped snapshot; `mastery-advantage` remains upstream.

Upstream snapshot at track creation:

- `SPECIFICATION.md` SHA-256: `e227f55846565901530b08466188b18f348cf32333e57bed933b099eb0d5ee43`
- `MIGRATION-v3.md` SHA-256: `600a692325f64df6d5b057c68478dfb589795f27c4da3c3149a8f76cb793a647`

## Functional Requirements

1. Vendor the specification and migration notes byte-for-byte with a
   provenance manifest containing source path, version, hashes, and capture
   timestamp; update all canonical-spec references from v2 to v3.2.
2. Add `hardGateThreshold` and `trendThreshold` to validated engine config and
   implement gated weighted readiness in state, fringe, and visualization
   paths.
3. Make `srs-engine` the sole owner of FSRS retention, proficiency, placement,
   and queue semantics per upstream Appendix A. Remove or adapt competing
   implementations instead of maintaining formula copies.
4. Implement `stabilityToRetention(stability, elapsedDays)` with FSRS-consistent
   constants and objective retention as the minimum across cards with
   `reps >= 1`.
5. Correct necessity calibration so only not-proficient-in-A rows update the
   posterior; existing v2 posterior values are treated as invalid inputs to a
   later recomputation.
6. Implement placement-synthesized review cards, confidence-to-stability
   mapping, direct/inferred evidence provenance, direct-evidence replacement,
   and hard-edge-only ancestor closure.
7. Rewrite the daily queue to schedule lowest-retention reviews before new
   cards, enforce both caps, and suppress new cards during backlog mode.
8. Apply the symmetric progress-trend threshold and preserve specified v2
   behavior where the v3 migration property says results are identical.

## Non-Functional Requirements

- All algorithms are deterministic and domain-neutral.
- Reusable packages contain synthetic fixtures only and import no app code,
  generated Convex modules, or proprietary curriculum.
- Behavioral tests must execute the upstream worked examples; source-grep or
  symbol-presence tests are complementary only.
- Public package exports remain backward compatible unless a versioned v3
  replacement and migration note are provided.
- New or changed code must meet the repository lint, typecheck, test, build,
  boundary, documentation, and coverage gates.

## Acceptance Criteria

- The vendored documents match the recorded upstream hashes exactly.
- All Appendix B v3 fixtures pass with the normative expected values.
- One canonical retention implementation exists and all consumers use it.
- Hard-gate, retention aggregation, calibration, placement, queue backlog, and
  trend tests demonstrate observable behavior.
- `measure/generate.sh` and `measure/doctor.sh` pass and generated architecture
  identifies the v3.2 contract.

## Out of Scope

- v3.1 evidence/calibration improvements beyond the corrected v3 posterior.
- v3.2 utility-led planning and session composition.
- Production Convex backfills and IM3 cutover.

