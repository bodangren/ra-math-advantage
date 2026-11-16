# IM3 v2 Runtime and Persistence Inventory

**Recorded:** 2026-07-11  
**Track:** `kst-srs-v3-2-im3-runtime-migration_20260710`  
**Authoritative engine contract:** `kst-srs.v3.2/SPECIFICATION.md` and `MIGRATION-v3.md`

## Current runtime surface

| Surface | Current implementation | v3.2 migration concern | Data and risk assumption |
|---|---|---|---|
| SRS cards | `convex/schema.ts` (`srs_cards`), `convex/srs/cards.ts`, `lib/srs/convexCardStore.ts` | The deployed schema expects `variantKey`, while legacy documents and the queue path still use `problemFamilyId`. Add a temporary dual-field representation with an explicit migration marker and one resolver. | Potentially unbounded by student; all reads must use `by_student` or `by_student_and_variant` and bounded batches. |
| Review logs | `srs_review_log`, `convex/srs/processReview.ts`, `convex/srs/reviews.ts`, `lib/srs/convexReviewLogStore.ts` | `paramsVersion` is already optional, but provenance and migration version are absent. Existing review facts and timestamps must remain untouched. | Potentially high-volume append-only data; batch by `by_student_and_reviewed_at` only, never load an entire table. |
| Placement | `placement_results`, `convex/placement.ts`, `lib/placement/*` | Current rows retain only estimate/confidence/source. v3.2 needs direct/inferred evidence, provenance, source timestamps, synthesis markers, and card seeding without fabricated review history. | At most a placement run per student, but process in component batches because production volume is unknown. |
| Daily practice | `convex/queue/queue.ts`, `convex/queue/sessions.ts`, `convex/srs/dashboard.ts`, `/student/practice` | This is the live v2 queue: it reads `problemFamilyId`, uses the old queue API, and has no review-load state or deterministic session composition. | Student card reads currently cap at 100; retain a documented per-session bound and report truncation instead of silently omitting cards. |
| Knowledge state and recommendations | `convex/student/knowledge-state.ts`, `convex/student.ts`, `/student/knowledge-state`, `/student/dashboard` | Knowledge-state uses the bridge, but the dashboard still derives recommendations from placement rows. Both must consume one v3.2 projection and surface review-day state. | Graph is app-owned JSON; no database graph migration is needed. |
| Submission path | `convex/srs/submissionSrs.ts`, `convex/srs/processReview.ts` | New writes must record canonical v3.2 fields while preserving legacy compatibility until cutover. | Writes are transactional and per submission; dual writes must share the same mutation. |
| BM2 compatibility | `apps/bus-math-v2/lib/srs/queue.ts`, `lib/srs/scheduler.ts`, `convex/srs.ts` | BM2 wraps the shared engine but exposes a separate app-local queue adapter. The final gate must prove it delegates to canonical queue selection/composition. | No IM3 data is read by BM2; compatibility is contract/build behavior only. |

## Tables, indexes, and widening plan

| Table | Current indexes used by runtime | Widened fields | Required index additions |
|---|---|---|---|
| `srs_cards` | `by_student`, `by_student_and_due`, `by_student_and_variant`, `by_objective` | optional `variantKey`, optional `legacyProblemFamilyId`, optional `migrationVersion`, optional `synthesizedFromPlacement`, optional `placementEvidenceType`, optional `sourceTimestamp` | `by_migrationVersion` |
| `srs_review_log` | `by_card`, `by_student`, `by_student_and_reviewed_at` | optional `migrationVersion`, optional provenance marker | `by_migrationVersion` |
| `placement_results` | `by_student`, `by_student_and_node`, `by_student_and_createdAt` | optional `evidenceType`, `provenance`, `sourceTimestamp`, `migrationVersion`, `synthesizedCardId` | `by_migrationVersion` |
| `srs_sessions` | `by_student`, `by_student_and_status` | optional `queueContractVersion`, `reviewLoadState`, `comparisonMode` | `by_queueContractVersion` |
| `srs_migration_runs` (new) | n/a | migration run name, state, dry-run result, cursor/status metadata, timestamps | `by_name`, `by_status` |
| `srs_comparison_events` (new) | n/a | student, subject, v2/v3.2 outputs, divergence class, deterministic explanation, timestamp | `by_student_and_createdAt`, `by_divergenceClass` |

`variantKey` takes precedence whenever present. `legacyProblemFamilyId` is read only as a migration fallback and is written alongside the canonical key until the verified rollback window ends. No reader may refer to the ambiguous historic field name directly.

## Existing migration debt

`convex/migrations/rename-problem-family.ts` uses unbounded `.collect()` and is not a registered Convex migration. Its test only exercises an in-memory fake. It is not safe evidence for a deployment and will be superseded by component-managed, idempotent migration definitions in Phase 3.

## Cutover and rollback controls

- A server-side `srsRuntimeMode` flag has the values `compare`, `v3_2`, and `rollback_v2`; clients do not select it.
- Compare mode produces an event only when normalized v2 and v3.2 results differ, classified as `intended_contract_change`, `data_gap`, or `unexpected` with a stable explanation key.
- Cutover requires zero unmigrated rows from every verification query, no `unexpected` comparison events, and an explicit approval recorded with the run.
- The rollback window retains legacy fields and dual-read code. Narrowing is a separately approved final deployment, never part of a dry run.

## Operational evidence still required

The repository contains no installed `@convex-dev/migrations` component and this inspection intentionally made no deployment or data mutation. After its explicit installation approval, Phase 3 will run component dry-runs and status queries against the configured development deployment to replace the unknown-volume assumptions with measured counts.
