# Precalculus Q19 combined integration independent review

## Disposition

The combined Q18 and Q19 backend is ready for bounded integration. The root merge preserves the existing Guided and Independent publication contract. It applies the complete Worked source requirement only to the acknowledgement and teacher source paths.

This review does not approve the curriculum, blueprint, activity, or publication.

## Publication boundary separation

`isPrecalculusPilotPublished` retains the accepted Q18 checks for the exact selected node, blueprint, Guided specification, Independent specification, mode map, generator, grading parts, rubric, and answer schema. The root merge does not add the Worked source requirement to this function.

`isTopic11WorkedSourcePublished` filters for the exact selected Worked specification and `rendererModeMap.worked === "interval-classification"`. It then reuses `isPrecalculusPilotPublished`. This requires a single blueprint to satisfy the accepted Guided and Independent contract and the new Worked contract.

Only `createTopic11DailySubmission` and the first `submitTopic11TeacherSubmission` delivery use the Worked-specific predicate. The Guided and Independent writer and selected evidence source checks continue to use `isPrecalculusPilotPublished`. The scope correction therefore does not reject valid Q18 Guided or Independent submissions only because the optional Worked source is absent.

## Merged handler review

The merged `learning-evidence.ts` has one set of imports and one teacher result validator. The appended teacher mutation uses the existing Q18 evidence store and runtime. It does not replace the selected physical-submission evidence handler.

The acknowledgement writer keeps the exact six-key empty envelope, active learner credential, opaque key, physical identity, approval, server timestamp, and replay checks. New acknowledgement creation requires the exact current published Topic 1.1 lesson, Worked phase, and source section in the same transaction.

The teacher mutation keeps the active teacher and learner checks, organization parity, class ownership, enrollment, assignment, learner submission ownership, physical source identity, future-time rejection, and late-source rejection. First delivery requires the Worked-specific graph publication. Durable replay keeps its prior authority and publication-withdrawal behavior.

The teacher action writes one `teacher_led` event. It does not write a grade, mastery result, SRS card, or SRS review. The shared serializer and fingerprint contract remain unchanged.

## Verification

I ran the four combined backend suites in the parent candidate:

- Selected physical writer: 42 tests.
- Selected evidence policy: 11 tests.
- Real writer-to-evidence flow: 6 tests.
- Selected teacher backend: 35 tests.

All 94 tests pass.

The initial six Q18 failures are consistent with the rejected global Worked requirement. The scoped predicate fixes that regression while retaining the Q19 Worked boundary.

## Limits

The selected graph and blueprint remain draft. The production seed, approval, teacher interface, and provider connection remain separate prerequisites. The combined backend continues to fail closed without them.
