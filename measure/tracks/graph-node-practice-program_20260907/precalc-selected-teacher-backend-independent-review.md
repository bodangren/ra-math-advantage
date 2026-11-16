# Precalculus Q19 teacher backend independent review v3

## Disposition

The revised backend is ready for bounded integration. It resolves the publication-time blocker. I found no remaining acknowledgement or teacher-attestation contract defect in this scope.

This disposition does not approve the curriculum, blueprint, physical activity, or publication.

## Publication at acknowledgement time

`hasCurrentTopic11Source` now runs inside `createTopic11DailySubmission` before a new acknowledgement insert. It requires the canonical Topic 1.1 lesson, the unique highest published version, one Worked phase, and one exact selected activity section. It also requires each available source record to exist no later than the server-owned acknowledgement time.

This closes the prior draft-to-published counterexample. A draft lesson version cannot produce an acknowledgement. The focused test confirms zero submission, evidence, and SRS rows while the version is draft. The same request creates one acknowledgement after the version becomes published.

The system does not infer publication time from `lesson_versions.createdAt`. Instead, the writer observes the current published state in the same Convex mutation that creates the acknowledgement. The server-owned insertion time establishes that the source was published when the acknowledgement was created.

## Teacher-side temporal defense

The teacher mutation still rejects a stored acknowledgement after the current server time. It rejects a lesson version, Worked phase, source section, physical activity, or physical approval created after the acknowledgement. It rejects a missing physical approval review time.

These checks protect damaged or imported stored rows. Enrollment and assignment must also predate the acknowledgement.

## Authority and identity

The acknowledgement writer requires an active, internally consistent student profile and credential. It requires the exact six-key empty Worked acknowledgement, exact stable activity, component, props, grading seed, physical approval, and approved graph publication. It stores no grade, evidence, or SRS effect.

The teacher mutation requires active and consistent teacher and learner credentials in the same organization. It requires teacher ownership of the active class, active enrollment, the exact class lesson assignment, learner ownership of the acknowledgement, and exact current physical source identity.

The lesson lookup has no fixed row limit. It rejects duplicate highest published versions and ambiguous selected source sections.

## Replay

Opaque acknowledgement replay remains stable and validates stored identity and content. It can replay after physical approval withdrawal. Changed physical content produces an idempotency conflict.

Teacher evidence replay revalidates teacher, learner, class, enrollment, assignment, and physical source authority. It can replay after graph publication withdrawal. One valid teacher action stores one `teacher_led` event. It creates no mastery or SRS result.

The implementation keeps the existing evidence normalization and fingerprint contract.

## Verification and remaining product dependencies

The focused suite passes 35 tests. I reviewed the new draft-version rejection and publication-then-create test directly.

The committed source remains draft. The committed seed does not create the required exact Worked physical activity. The patch includes no teacher interface or provider connection. These are explicit later integration dependencies. They do not weaken the backend fail-closed behavior.
