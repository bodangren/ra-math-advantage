# IM1 G53 standards alignment review

## Verdict

Remove the eight unsupported alignment edges in the bounded scope. Clear the three related blueprint alignment fields. Regenerate the affected projections. Leave replacement alignment pending.

Do not align the new maximum-count atom from Problems 47 and 48.

## Official standard definitions

Official CCSS.MATH.CONTENT.HSG.CO.A.2 concerns representing transformations in the plane, treating transformations as functions on points, and comparing transformations that preserve distance and angle with transformations that do not. [Official G-CO.A.2](https://www.thecorestandards.org/Math/Content/HSG/CO/A/2/)

Official CCSS.MATH.CONTENT.HSG.CO.A.4 concerns definitions of rotations, reflections, and translations in terms of angles, circles, perpendicular lines, parallel lines, and line segments. [Official High School Geometry congruence standards](https://www.thecorestandards.org/Math/Content/HSG/CO/)

Neither definition matches the reviewed capabilities:

- Lesson 10-2 identifies points, lines, planes, incidence, intersection, and coplanarity. It also draws figures that satisfy those relationships.
- The reused Lesson 12-4 skill applies point-line-plane postulates to justify statements.

The graph labels both standard nodes as draft placeholders. Placeholder status does not make the links safe. Current projections present these IDs as covered standards.

## Exact canonical edges to remove

Remove these seven Lesson 10-2 edges to `math.standard.ccss.g-co-a-2`:

- `math.alignment.im1-example-10-2-003-to-ccss-g-co-a-2`
- `math.alignment.im1-example-10-2-004-to-ccss-g-co-a-2`
- `math.alignment.im1-example-10-2-005-to-ccss-g-co-a-2`
- `math.alignment.im1-example-10-2-006-to-ccss-g-co-a-2`
- `math.alignment.im1-example-10-2-007-to-ccss-g-co-a-2`
- `math.alignment.im1-skill-10-2-draw-and-label-figures-that-accurately-represent-given-geome-to-ccss-g-co-a-2`
- `math.alignment.im1-skill-10-2-identify-and-name-points-lines-and-planes-from-geometric-fig-to-ccss-g-co-a-2`

Remove this reused-skill edge to `math.standard.ccss.g-co-a-4`:

- `math.alignment.im1-skill-12-4-apply-geometric-postulates-about-points-lines-and-planes-to-to-ccss-g-co-a-4`

The five Example edges use the same lesson-level inference as the two skill edges. The exact Example source groups contain no transformation demand. Keeping the Example edges while removing the skill edges would retain the same false Lesson 10-2 alignment.

Do not remove the two standard nodes in this bounded repair. Other transformation skills can use these standards. A separate standards ingestion task can replace their placeholder titles and descriptions with authoritative definitions.

Do not change other Lesson 12-4 Example or skill alignments in this task. Their source scope was not part of G53. Review those alignments separately before changing them.

## Blueprint fields

In `apps/integrated-math-1/curriculum/skill-graph/blueprints.json`, set `alignmentNodeIds` to an empty array for these three rows:

- `math.im1.skill.10.2.draw-and-label-figures-that-accurately-represent-given-geome`
- `math.im1.skill.10.2.identify-and-name-points-lines-and-planes-from-geometric-fig`
- `math.im1.skill.12.4.apply-geometric-postulates-about-points-lines-and-planes-to`

Do not substitute G-CO.A.1 automatically. G-CO.A.1 covers precise definitions of angle, circle, perpendicular line, parallel line, and line segment from undefined notions. It does not cover the complete point-line-plane incidence and coplanarity scope in this lesson. [Official G-CO cluster](https://www.thecorestandards.org/Math/Content/HSG/CO/)

## Derived projection fields

Regenerate these files from the corrected canonical graph and blueprints:

- `apps/integrated-math-1/curriculum/skill-graph/projection/practice-v1-activity-map.json`
- `apps/integrated-math-1/curriculum/skill-graph/projection/srs-input.json`
- `apps/integrated-math-1/curriculum/skill-graph/projection/teacher-evidence-map.json`

The current projections contain these affected fields:

- Nine mode activity rows copy the three blueprint `alignmentNodeIds` values.
- Three `srsInputs` rows copy the standard IDs into `standards`.
- Three teacher skill rows copy them into `standardsCovered`.
- The teacher standard groups for G-CO.A.2 and G-CO.A.4 include the affected skill and Example node IDs. Their node lists and aggregate counts must be derived again.

`practice-v1-activity-map.json` embeds the SRS and teacher-evidence projections. Regeneration must keep it equal to the standalone projection sources for the affected fields.

## Minimum test scope

Add a focused regression that asserts:

- no Lesson 10-2 Example or approved Lesson 10-2 skill aligns to G-CO.A.2;
- the reused Lesson 12-4 postulate skill does not align to G-CO.A.4;
- the three blueprint alignment arrays are empty pending an authoritative match;
- the activity, SRS, and teacher projections contain the same corrected alignment state;
- unrelated valid transformation alignments to G-CO.A.2 and G-CO.A.4 remain present;
- the new maximum-count atom has no invented standard alignment.

This correction removes false claims. It does not require a replacement standard to complete G53 source or capability restoration.
