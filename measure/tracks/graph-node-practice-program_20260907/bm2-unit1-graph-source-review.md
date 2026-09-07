# BM2 Unit 1 graph source review

Date: 2026-09-07

## Scope

This review covers the first three Unit 1 capabilities. It focuses on `math.bm2.skill.1.1.apply-accounting-equation`. It also checks the classification and transaction-analysis boundaries.

## Source boundaries

Lesson 1 has three objectives in `apps/bus-math-v2/lib/curriculum/generated/unit1-authored.ts:16`:

- Define Assets, Liabilities, and Equity.
- Explain why the accounting equation must balance.
- Identify how a simple business event affects the equation.

The Lesson 1 video gives two simple events. An owner investment produces `5000 = 0 + 5000`. A bank loan then produces `8000 = 3000 + 5000`. The Guided and Independent activities at lines 182 and 267 are notebook sorting activities. They classify accounts and calculate category totals. They do not require a before-and-after event analysis. The exit ticket at line 375 has one exact event item. Question `q2` asks for the effect of a 3000 bank loan.

Lesson 2 is the account-classification lesson. Its objectives are at lines 483-486. Its activities start at lines 661, 784, and 915. These activities support `math.bm2.skill.1.2`.

Lesson 3 is the full transaction-analysis lesson. Its objectives are at lines 1023-1026. It requires two affected parts and balance verification across a series of events. Its activities start at lines 1193 and 1273. These activities support `math.bm2.skill.1.3`.

## Graph findings

`math.bm2.skill.1.1.apply-accounting-equation` is an observable capability. Keep its kind as `skill`. Its title is broader than the exact Lesson 1 objective. The minimum source title is `Identify how a simple business event affects the accounting equation`.

The current Lesson 1 blueprint maps all three Lesson 1 activities to the selected node. This mapping overstates exact evidence. The two notebook organizers assess account classification and aggregate balance. They do not assess an event response. The exit ticket contains only one exact event part. A whole-activity score cannot prove the event capability.

`math.bm2.skill.1.2` is also a skill. It has a clear learner response. It owns account classification. Do not use a Lesson 1 notebook sort as event-application evidence. A notebook sort can remain lesson work without becoming exact-node mastery evidence.

`math.bm2.skill.1.3` is a separate skill. It covers the dual effect of transactions and a sequence balance check. Evidence for a simple Lesson 1 investment, loan, or laptop case does not prove the Lesson 3 capability.

The generated `accounting-equation` problem family calculates one missing term. It is a practice variant. It is not a curriculum skill, concept, or topic. Do not create a graph node from the family name. Its numerical result cannot prove classification, event effects, or an explanation.

The current edge from `math.bm2.skill.1.1.apply-accounting-equation` to `math.bm2.skill.1.2` is not supported by the source sequence. Event application is not a prerequisite for classification. The source explicitly says that classification supports later dual-impact work. The edge from `math.bm2.skill.1.2` to `math.bm2.skill.1.3` is source-supported. The edge from the simple Lesson 1 event capability to the broader Lesson 3 transaction capability is plausible, but it needs a specific rationale about one event before a series of events.

Lesson 1 also contains definition and explanation objectives. The current one-node-per-lesson graph compresses these objectives into the selected event skill. Do not treat the event skill as proof of both objectives. A later source repair can add atomic definition and explanation skills if the product needs separate readiness or evidence. Do not add a concept or topic row only to preserve the current one-node count.

## Assessment readiness

An activity is assessment-ready for a node only when its required response proves that exact capability. Renderer presence and a total activity score are insufficient.

For the selected node, exact evidence must include the event, affected accounts, account categories, directions, amounts, ending totals, and equation check. The server can grade the structured fields. A teacher must review the explanation before the result can establish the complete application capability.

The new event component has this response shape. Its content is still draft. The current blueprint still identifies `notebook-organizer` and has no Guided specification. Keep the publication gate closed. Do not approve the node, blueprint, activity, SRS, or evidence path from this review.

## Minimum next repair

1. Preserve the stable ID `math.bm2.skill.1.1.apply-accounting-equation`.
2. Change its title and description to the exact simple-event objective.
3. Remove the Lesson 1 notebook organizer activities from exact event evidence mapping.
4. Keep the existing physical activities in the published lesson. They remain valid lesson work.
5. Map the exit-ticket loan item only if the evidence contract can bind one graded part. Do not map the whole exit-ticket score.
6. Add the three event activity identities only after content review and publication.
7. Keep `math.bm2.skill.1.2` as the classification owner.
8. Keep `math.bm2.skill.1.3` as the broader transaction-analysis owner.
9. Remove the unsupported `1.1 -> 1.2` prerequisite edge. Retain `1.2 -> 1.3`.
10. Review the `1.1 -> 1.3` rationale against the simple-event to event-series progression.

This is a selected-row repair. It does not accept the complete 89-row graph.

## Implementation result

The bounded repair preserves the selected stable ID and physical lesson activities. It changes the selected title and description to the exact Lesson 1 objective. It removes all three Lesson 1 activities from the blueprint evidence list and activity-map projection for this node. It removes the unsupported prerequisite to classification. It keeps the prerequisite to Lesson 3 with a source-specific rationale about one event before a series of events.

The new selected-boundary test passed four tests. The BM2 pilot publication test passed two tests. The capability graph test passed three tests.

The capability graph test now checks the evidence-map contract. Each evidence row must resolve to a published activity and an existing node. Each row must preserve the published component, props, and grading configuration. Stable evidence identities must be unique. The test also proves that all three physical Lesson 1 activities remain published and have no exact event-skill evidence row. It does not require each published lesson activity to prove a graph skill.

All nine focused tests passed. The BM2 lint, TypeScript check, and production build passed.

## Parent review

The parent checked the authored Lesson 1 objectives and the published Lesson 11 application prompt. The Lesson 11 `application-1` prompt explicitly requires one business event before and after it occurs. This supports retaining the event-to-application-assessment prerequisite rationale. It does not make the whole Lesson 11 activity exact event evidence.

The parent reviewed the four new boundary tests and the revised structural projection test. Removing a projection does not remove its published lesson activity. The current 205 projection rows remain a provisional inventory. Their count does not prove exact source alignment for all remaining rows.

The catalog files remain pending because the complete course source review is open. This bounded review does not accept all 89 rows. The catalog README still contains broad review and pilot statements that need reconciliation during catalog integration.
