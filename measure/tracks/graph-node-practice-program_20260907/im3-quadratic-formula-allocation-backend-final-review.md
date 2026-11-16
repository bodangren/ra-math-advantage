# IM3 quadratic-formula allocation backend review

Accepted source commit: `e4c9f6889`.

## Change

Explicit Start creates one server-owned pending submission. The row retains its identity, ordinal, retry key, and private variant when it becomes final. Each practice mode has four finite variants. The seed creates only canonical relations. Start creates later shared relations. A coherent seed rerun preserves existing records.

The backend uses existing tables and the existing learner/activity ordinal index. It adds one optional private allocatedVariantKey field. The history query reads six descending rows. It validates the allocated sequence and its legacy transition anchor. It relies on the documented append-only legacy prefix. It does not audit arbitrary older database corruption.

Public responses omit private seeds and variant metadata. Guided checks and final submissions require the correct learner-owned pending handle. Exact legacy receipt replay remains available. Draft practice produces no learning evidence or SRS effects.

## Verification

Parent and independent runs passed 146 tests in seven files. Parent lint, build, and separate post-build TypeScript passed. All 11 staged files matched the accepted candidate. Six previously clean or absent main paths were materialized. Five mixed main paths remain intact.

The disposable backend used loopback ports 43140 and 43141. Actual conflict logs show retry for same-learner Start, same-row finalization, and shared later-relation creation. Full snapshots prove exact rollback for Start and final mutations. Snapshots enumerate all eight allowed variant keys directly, so an orphan variant cannot remain invisible.

Both modes complete their exact private seed schedules. Their scores are 3, 3, 2, and 3. The repeated-root case assigns zero maximum points to the unused second-root part. Exhaustion changes no captured record. The seed rerun preserves full activity, variant, item, submission, and effect snapshots. Exact legacy replay returns the original row.

The final database contains two activities, eight variants, eight items, and 13 submissions. Eleven submissions are final. Two are the expected pending attempts for the shared-relation test. It contains no learning evidence, evidence receipts, cards, reviews, or scheduled functions. No submission has masteryContractVersion.

Independent review accepts the actual transaction evidence. The saved evidence includes complete synthetic record snapshots, executed fixtures, runner scripts, and conflict retry logs. It excludes administrator keys, credential records, and database files. See `evidence/im3-qf-local/`.

## Test preparation corrections

The fixture initially used a nonexistent evidence index and an unvalidated branded activity ID. The parent used the actual learner/node index and parsed the legacy request with the existing practice schema. The Convex-specific configuration also lacked Node types and the app alias for existing modules. The local test temporarily supplied these settings with installed dependencies. The push passed with type checking enabled.

The runner reached the successful null-returning seed rerun, then failed to parse empty CLI output. The parent handled only that explicit null case. The continuation read prior real logs and completed the same database. It did not reseed or regenerate earlier results.

The fixture is removed from the candidate. The original Convex configuration is restored byte for byte. All five generated files match their prior bytes. The restored app passes standalone TypeScript.

## Remaining work and cleanup

Client allocation, draft learner placement, browser verification, and source approval remain open. This backend does not establish full course coverage. The finite schedule is not unlimited practice.

Stop the local backend after this report and evidence are committed. Remove its key, database, storage, temporary generated-file backup, and completed backend review copies. Keep the shared candidate for the active client task. Preserve all recovery branches and unrelated main changes.
