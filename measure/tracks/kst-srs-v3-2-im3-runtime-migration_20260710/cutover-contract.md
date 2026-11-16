# IM3 v3.2 Cutover, Comparison, and Rollback Contract

## Server-controlled feature flag

`srs_runtime_controls.mode` is one of `compare`, `v3_2`, or `rollback_v2`.
Only internal admin mutations may change it. A client, route query string, or
user preference cannot select a runtime mode.

## Comparison protocol

In `compare` mode, the server produces both normalized observable outputs and
records an event only if their canonical fingerprints differ. The stored event
contains no learner response data: it records subject, mode-independent output
fingerprints, a deterministic explanation key, and exactly one classification:

| Classification | Allowed explanation |
|---|---|
| `intended_contract_change` | `review-load-saturated` — v3.2 deliberately suppresses new work during a review day |
| `data_gap` | `legacy-card-fallback` or `unmigrated-placement` |
| `unexpected` | `unclassified-output-change` or a later reviewed key |

Every `unexpected` event blocks cutover. `data_gap` events must reach zero
before cutover. An intended event is accepted only if its corresponding v3.2
worked example and learner-facing copy pass review.

## Cutover gate

The internal cutover mutation rejects unless all are true:

1. Component migration verification reports zero unmigrated documents.
2. No unexpected comparison events exist for the active release.
3. An authorized operator records `approvedAt` after reviewing the dry run,
   executed migration, verification results, and comparison report.

## Rollback window and narrowing

For 14 days after cutover, writes remain dual, reads retain the legacy fallback,
and `rollback_v2` remains available. No historic field is removed during this
window. Narrowing requires a fresh approval after a new zero-unmigrated
verification query; it is not implied by the initial cutover approval.
