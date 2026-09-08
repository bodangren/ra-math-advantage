# Precalculus selected teacher backend integration

## Bounded result

The committed baseline gains a server-owned Topic 1.1 Worked acknowledgement and a trusted teacher confirmation mutation. These functions do not accept a client grade or occurrence time.

The acknowledgement requires an active learner credential, an exact empty six-field practice acknowledgement, and an opaque creation key. It checks the complete Worked specification and physical identity. It also checks the unique current published lesson version and exact Worked source section in the same transaction before insert. This establishes source availability when the server stores the acknowledgement. It creates no learning evidence or SRS effect.

The teacher action requires active teacher and learner credentials, matching organization, class ownership, active enrollment, assignment, and exact learner-owned acknowledgement. Enrollment and assignment must precede the acknowledgement. New evidence rejects future acknowledgement times and late source or approval timestamps. It uses the stored acknowledgement time for the teacher-led occurrence.

Replay validates the applicable current authority before it returns the stored result. A valid acknowledgement replay preserves the opaque key and original physical content identity. Teacher confirmation creates no grade or SRS effect. The existing JSON evidence serializer remains unchanged.

## Combined publication check

The first author patch added Worked validation to the existing Guided and Independent publication predicate. Combining it with the accepted evidence code caused six real writer-to-evidence tests to fail.

The parent scopes the new Worked check to `isTopic11WorkedSourcePublished`. The acknowledgement and new teacher confirmation use it. The accepted Guided and Independent checks remain unchanged. Independent review accepts this correction.

## Verification

The combined parent suite passes 134 tests in nine files. It covers the teacher backend, selected writer, evidence consumer, real writer-to-store flow, and route contracts. Lint, a fresh build, and post-build standalone TypeScript pass. Tests and TypeScript use isolated committed shared-package sources.

The independent combined backend review passes 94 tests. The earlier acknowledgement and temporal publication findings are repaired. See `precalc-selected-teacher-backend-independent-review.md` and `precalc-selected-teacher-backend-combined-review.md`.

Logs: `/tmp/precalc-q19-combined-parent-all-tests.log`, `/tmp/precalc-q19-combined-parent-lint.log`, `/tmp/precalc-q19-combined-parent-build.log`, and `/tmp/precalc-q19-combined-parent-tsc.log`.

## Remaining work

This is a bounded baseline integration. The main checkout has pending teacher and later-topic implementations. Their reconciliation remains open. The exact physical Worked seed, learner route and lesson delivery, teacher provider and interface, source approval, and positive signed-in flow remain separate prerequisites.

The tests use hypothetical approved content. They do not approve the curriculum or physical activity. No dependency update, source approval, live seed, schema push, or deployment occurred. Real Convex rollback and concurrent delivery tests remain open.
