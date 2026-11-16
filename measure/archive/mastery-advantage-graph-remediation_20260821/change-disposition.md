# Removal Disposition Review

**Track:** `mastery-advantage-graph-remediation_20260821`

**Disposition:** Approved for implementation by the user's direct request on
2026-08-21. The implementation keeps accepted trust-boundary behavior and
removes only code that depends on the withdrawn proxy inventories.

| Path or hunk | Disposition | Evidence or reason |
|---|---|---|
| `apps/integrated-math-3/lib/practice/im3-rollout.ts` and proxy-count tests | remove | The layer derives runtime eligibility from the withdrawn node-kind and gap counts. |
| IM3 queue and activity imports that require the proxy rollout map | remove | Queue and submission code must not treat the withdrawn projection as an approved inventory. |
| IM3 opaque submission IDs, server grading, role checks, idempotency, and retry behavior | preserve | These trust-boundary behaviors are independent of the proxy count. Existing authority tests cover them. |
| IM3 hard-coded phase-completion evidence branch | remove | A completed phase is not a real activity attempt. Ordinary phase completion must remain generic. |
| IM3 phase-completion idempotency test for teacher evidence | remove | The test freezes the invalid phase-to-evidence behavior. Phase idempotency remains covered by the ordinary completion and completed-row tests. |
| AP Precalculus regenerated edge and review-queue diff | remove | The diff was generated from the withdrawn mixed-granularity inventory. Restore the existing artifact. |
| AP Precalculus extensions in `scripts/generate-course-edges.ts` | remove | The extensions can recreate the withdrawn mixed-granularity graph and reviewed-edge changes. |
| AP Precalculus pilot authority paths | preserve | The pilot uses a real source activity and opaque submission flow. Keep behavior tests and server ownership checks. |
| AP Precalculus raw-evidence route test | remove | The test freezes the withdrawn client-submitted evidence contract. The opaque submission authority and production route tests remain. |
| AP Precalculus lowercase `convex/learning-evidence.ts` seam | remove | The stale seam duplicates the current camel-case Convex evidence boundary. Keep one server-owned evidence implementation. |
| Business Math `curriculum/skill-graph/nodes.json`, `edges.json`, and `rollout-map.json` | remove | The files derive graph identity from generator families and assign all rows to Unit 1 Lesson 1. |
| Business Math graph loader and KST tests tied to 19 rows | remove | They freeze the invalid family-to-skill bijection. |
| Business Math accounting-equation, normal-balance, and classification answer inputs | preserve | These are the three reviewed raw-answer inputs. Their server-authority tests pass. |
| Business Math all-family generic answer fallback | remove | It exposed unsupported response shapes and could submit generated answers instead of student answers. |
| Business Math direct `knowledge-space-core` dependency | remove | No approved Business Math graph consumer uses the direct dependency. Shared pilot behavior remains available through existing packages. |
| Shared `bm2` course-series ID union | remove | The shared extractor supports the IM1 to AP Precalculus course-series graph. Local Business Math opaque IDs do not require a shared course-union expansion. |
| Shared KST, SRS, and learning-evidence packages | preserve | They are existing shared implementations and are not replaced by a new graph. |
| Draft cross-course equivalence edges | preserve | They remain graph artifacts only. They do not affect runtime decisions. |
| Generated route facts | rework | Generate current repository-relative facts with the existing `repo-graph` tool and a temporary database. Remove foreign-machine paths. |
| Superseded Measure plans | preserve as incident history | Their claims are withdrawn. Active planning points to this remediation track. |

## Safety boundary

The removal is hunk-level. Unrelated dirty-worktree changes remain untouched.
No replacement graph, eligibility registry, schema field, hash, or dependency
is introduced.
