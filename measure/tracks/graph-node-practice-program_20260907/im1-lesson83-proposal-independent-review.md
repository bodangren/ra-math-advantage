# IM1 Lesson 8-3 proposal independent review

## Decision

Revise the proposal before implementation. The source identities and most mathematics are correct. The capability list must remove one duplicate and revise its reuse set. Two direct-evidence claims exceed the learner response. Two rounding and threshold statements need tighter wording.

## Findings

### P1 — Reuse repaired G39 8d for Problems 7–10

The proposed basic graph-to-equation node duplicates repaired G39 skill `math.im1.skill.8.2.write-equations-for-transformed-exponential-functions-given`. Both operations require the learner to read an exponential graph and write its equation. A zero-translation graph is an input variant of that operation. It is not a separate atomic capability.

Do not add `math.im1.skill.8.3.write-a-basic-exponential-function-from-a-graph`. Extend the draft G39 8d source scope to `.008`, Problems 7–10, and add a Lesson 8-3 containment that reuses 8d. Keep 8d draft and inactive.

### P1 — Problem 25 assesses evaluation, not model writing

Problem 25 supplies the initial population and percent decrease, then asks for an estimate in 2025. It does not ask the learner to write the model. Model construction is an internal step. Remove Problem 25 from direct evidence for the contextual model-writing node. Keep it under the existing evaluate-and-interpret reuse.

### P2 — Reuse the existing table rate-of-change capability for Problem 29(b)

Problem 29(b) directly asks for the average rate of change from table data. Reuse `math.im1.skill.4.2.calculate-the-rate-of-change-from-a-table`. The value is `(250 - 128) / 3 = 122/3`, or approximately `40.67` deer per year. Keep Problem 29(c) manual because it asks for an explanation about nonconstant additive increases.


### P1 — Problem 18 does not directly assess the repaired 8f balance capability

The repaired 8f capability is `Calculate a compound-interest balance from principal, rate, compounding frequency, and time`.

Problem 18 asks how long the resulting fund balance can cover the listed annual costs. The learner must calculate the balance as an internal step, add the two costs, divide, convert the duration, and round to the nearest month. The response does not separately expose the balance. The proposal correctly classifies the whole task as a manual composite, but it also lists Problem 18 as direct evidence for 8f. These statements conflict.

Use Problems 16 and 20 as direct 8f evidence. Keep Problem 18 as a manual composite. The `.010` source group can still map to 8f because Problems 16 and 20 are in that group. Do not cite Problem 18 in the exact node source reference or as independent 8f evidence.

### P1 — Problem 28(b) does not prove the existing domain-and-range capability

Problem 28(b) asks whether the gas model has a continuous domain. It does not ask for a range.

The proposed reused node is `math.im1.skill.8.1.determine-a-context-relevant-domain-and-range-for-an-exponential-model`. Its observable response requires both domain and range. A domain-only response cannot establish the complete capability.

Remove this Lesson 8-3 reuse containment. Keep Problem 28 as a manual multi-operation task. Do not narrow the existing Lesson 8-1 node because its reviewed source directly assesses both domain and range. The final exact reuse count is six: four Lesson 8-1 reuses, repaired G39 8d, and the Lesson 4.2 table rate-of-change skill.

### P2 — State the final Problem 18 rounding result

The fund balance is approximately `$29,423.33`. Dividing by the fixed annual public cost `$19,548` gives approximately `1.505` years, or `18.06` months. The source asks for the nearest month. The final reported duration is therefore `18 months`.

Keep the intermediate `18.06` only as verification work. State `18 months` as the source-rounded result.

### P2 — State the strict threshold boundary for Problem 26(c)

The equation reaches exactly `1` microgram at approximately `25.93` days. It is less than `1` for times greater than that crossing. There is no first real-valued time strictly after the crossing. If the response uses whole elapsed days, the first whole day with less than `1` microgram is day `26`.

Preserve both interpretations in review and future rubric work. Do not state that the amount “first becomes less” at exactly `25.93` days.

## Verified source identities

The four canonical source groups are correct:

- `.007`: Example 1, Problems 1–6.
- `.008`: Example 2, Problems 7–10.
- `.009`: Example 3, Problems 11–13.
- `.010`: Examples 4–6, Problems 14–21.

Rows `.011` and `.012` duplicate the grouped Examples 4–6 heading. Preserve them as rejected inactive historical identities. Do not delete or repurpose them.

The six original image mappings are correct. Images 1–4 map to Problems 7–10. Image 5 is the Problem 18 college-cost table. Image 6 is the Problem 29 deer table.

## Verified mathematics

The point-pair functions for Problems 1–6 and 22–24 are correct.

The graph readings require one correction:

- Problem 7: `(0, 3)` and `(-1, 1.5)`, so `y = 3(2)^x`.
- Problem 8: `(0, -1)` and `(1, -3)`, so `y = -(3)^x`.
- Problem 9: `(0, 1)` and `(-1, 4)`, so `y = (1/4)^x`. The native source image shows the curve near `y = 4` at `x = -1`.
- Problem 10: `(0, -1)` and `(-1, -2)`, so `y = -(1/2)^x`.

Independent calculations confirm the other reported values, including Problems 15–21, 25, 27–31. The financial statements remain worksheet assumptions. They must not appear as current data or financial advice.

## Capability boundary review

After removal of the duplicate graph-input node, five proposed new operations are defensible:

1. Write a contextual percent or repeated-factor exponential model.
2. Write a compound-interest model from financial terms.
3. Write an exponential function from equally spaced table data.
4. Solve an exponential model for time with technology.
5. Determine percent growth from a growth factor.

Problems 7–10 reuse repaired G39 8d. They do not create a basic-graph duplicate.

The contextual model skill correctly excludes compound-interest frequency. The compound-interest model-writing skill is distinct from repaired 8f balance calculation. The table-model skill correctly requires model construction, not only common-ratio classification.

Stable 8e correctly covers Problems 1–6 and 22–24. Stable 8f must cover direct balance calculations in Problems 16 and 20 only within this source.

## Exact reuse and graph effects

Keep these six exact reuses:

- Evaluate and interpret an exponential model at a given input.
- Determine the initial value or y-intercept.
- Classify growth or decay with reasoning.
- Identify exponential behavior from common ratios.
- Repaired G39 8d graph-to-equation for Problems 7–10.
- Lesson 4.2 calculate rate of change from a table for Problem 29(b).

Remove the proposed contextual domain-and-range reuse for Problem 28(b).

The corrected graph batch therefore adds five new capability containments and six reuse containments. It keeps repaired 8e and 8f containments. It removes only sequence prerequisite `math.im1.edge.1267`. It must not restore edge `1266`.

Keep all repaired and new rows draft and inactive. Remove the six empty legacy activity rows. Add no activity, evidence, equivalence, or readiness claim.

## Required test additions

Add assertions that:

- Problem 18 is not listed as direct 8f evidence.
- Problem 28(b) does not create a containment for the combined domain-and-range node.
- The Problem 18 final rounded duration is 18 months.
- Problem 26(c) distinguishes the crossing time from the first whole day below the threshold.
- Exactly eleven new Lesson 8-3 skill containments exist: five new and six reused.


## Revised proposal disposition

The revised capability definitions and direct problem references resolve the substantive findings. Three count statements remain stale and must be corrected before graph authoring:

- Required test 8 says “all six new skills.” Change this to five new skills.
- Proposed counts says “Six new draft and inactive skill candidates.” Change this to five.
- Proposed counts says “Five exact reused Lesson 8-1 skills” and “six new and five reuse edges.” Change this to six exact reuses in total: four Lesson 8-1 skills, repaired G39 8d, and the Lesson 4.2 table rate-of-change skill. The eleven containments are five new plus six reused.

The inactive SRS planning row count remains seven for repaired 8e, repaired 8f, and five new nodes. It is not eight.

After these four count corrections, the proposal is accepted for graph authoring.

## Final proposal disposition

The parent corrected the remaining count statements. The proposal now specifies five new skills, six exact reuses, eleven new containments, and seven inactive SRS planning rows for repaired and new Lesson 8-3 skills. The direct evidence and mathematics match this independent review. I accept the corrected proposal for source and graph authoring.
