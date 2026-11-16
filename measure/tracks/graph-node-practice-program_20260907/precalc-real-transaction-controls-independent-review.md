# Precalculus Q35 local controls independent review

## Disposition

Accept the concurrency, assistance persistence, and disabled-credential controls.

## Guided writer and concurrent delivery

The fixture sends the real Guided writer three correct answers. Its part assistance values are `hintsUsed` 2, 1, and 0. Each part has zero reveal steps and zero changes. The real writer returned score 3 of 3, maximum score 3, and attempt ordinal 1.

The two concurrent real evidence calls returned one `new` delivery and one `replay` delivery. The stored delta is one evidence row and one receipt. The card and review arrays did not change.

The new evidence row has the exact learner ID, physical submission ID, selected node ID, Guided stable activity ID, attempt ordinal 1, `guided_practice` mode, and `mastery_advantage` origin. It has no `gradedEvidence` field. The receipt has `persisted: true`, `masteryApplied: false`, `kstApplied: false`, and `reason: ungraded_evidence`.

The real backend log records an optimistic concurrency control conflict on the new receipt. It records an automatic retry of `selectedLearningEvidence:submitSelected`. This supports actual overlapping first delivery. The final store contains one receipt and one Guided participation row for this physical submission.

## Stored assistance evidence

The read-only backend query in `/tmp/precalc-q35-guided-stored-submission.log` closes the prior evidence gap. The stored physical submission ID is `jd7dc4fcnvsaxt2pjkqd0jdmxn8e1b0f`, which matches the Guided writer result and the Guided evidence row.

The stored submission has score 3 of 3 and three server-graded parts. The parts retain hint counts 2, 1, and 0. Each part has `revealStepsSeen: 0`, `changedCount: 0`, `isCorrect: true`, score 1, and maximum score 1. The stored mode, stable activity ID, attempt ordinal, learner ID, and `practice.v1` contract also match the selected Guided request.

This read-only row inspection proves that the real writer preserved the evidence-bearing assistance values before the concurrent evidence transaction. Guided evidence correctly omitted `gradedEvidence` and produced no SRS effect.

## Disabled credential control

The runner created a fresh Independent physical submission before it disabled the credential. It then called the real selected evidence mutation for that fresh submission and for an existing receipt replay.

Both calls failed with `Inactive student identity`. The complete serialized evidence, receipt, card, and review arrays are byte-identical before and after both rejected calls. The fresh submission did not have a preseeded receipt. The restore mutation returned `isActive: true`.

This verifies that active authentication runs before both fresh processing and receipt replay. The rejected calls did not change any selected evidence or SRS effect row.

## Backend and scope

The reviewed backend process is PID 34091 on loopback port 43130. I did not query or mutate it. I reviewed the saved fixture, runner, result files, full effect snapshots, per-call errors, and backend log.

These controls use the real local Convex backend and real selected handlers. They do not prove cloud deployment behavior or browser behavior. They do not approve curriculum content.
