# IM1 G55 Lesson 10-4 alignment disposition

## Official standard meanings

- G-GPE.B.4 requires the learner to use coordinates to prove a simple geometric theorem algebraically. The official examples include proving or disproving a rectangle claim and point membership on a circle.
- G-MG.A.1 requires the learner to use geometric shapes, measures, and properties to describe objects in a modeling situation.

A distance calculation alone does not prove a theorem. A word problem alone does not establish modeling alignment. The response must use geometry to describe the contextual object or situation.

## Source and skill decisions

| Source or skill | G-GPE.B.4 | G-MG.A.1 | Reason |
|---|---|---|---|
| Example 1 `.012`, Problems 1–14 | Remove | Remove | The learner reads number-line coordinates and reports segment measures. The tasks do not prove a geometric theorem or model an object. |
| Example 2 `.013`, Problems 15–20 | Remove | Remove | The learner writes only yes or no. The source does not request or observe an algebraic coordinate proof. It has no real-world modeling context. |
| Example 3 `.014`, Problems 21–26 | Remove | Remove | The learner computes point-to-point distances. The tasks do not ask for a proof, claim, object description, or modeling interpretation. |
| Example 4 `.015`, Problems 27–30 | Remove | Keep, with exact rationale | The tasks model a spiral trace, migration, a cycling route, and a baseball diamond with geometric measures. Problems 29 and 30 use geometric distance to describe or decide a property of the contextual route or throw. They do not prove a general geometric theorem. |
| Approved 10g skill, use the Distance Formula between two points | Remove | Remove | The skill title and description require only distance computation. They do not require a coordinate proof or a modeling interpretation. Lesson-specific contextual evidence must not broaden the approved skill identity. |
| Approved 10h skill, apply the Distance Formula to real-world problems | Remove | Keep, with exact rationale | The skill expressly applies geometric distance in real-world models. Problems 28–30, 47, and 48 use map, route, baseball, scarf, and artifact measurements. The evidence is sufficient for G-MG.A.1. It does not require proof of a geometric theorem. |

## Exact edge disposition

Keep these two canonical edge identities:

- `math.alignment.im1-example-10-4-015-to-ccss-g-mg-a-1`
- `math.alignment.im1-skill-10-4-apply-the-distance-formula-to-solve-real-world-problems-to-ccss-g-mg-a-1`

Update both retained alignments with exact source rationale. Example 4 must cite the contextual geometric measures in Problems 27–30. The 10h skill must cite Problems 28–30, 47, and 48 through `.015` and the lesson source.

Remove the other 10 canonical Lesson 10-4 alignment edges. This includes every G-GPE.B.4 edge, both Example 1 edges, both Example 3 edges, the Example 2 G-MG.A.1 edge, and the 10g G-MG.A.1 edge.

In `standard-edges.json`, remove three of the four current skill rows. Keep only the 10h-to-G-MG.A.1 skill row.

Set the 10g blueprint `alignmentNodeIds` to an empty array. Set the 10h blueprint `alignmentNodeIds` to only `math.standard.ccss.g-mg-a-1`.

## Deferred alignment

G-GPE.B.7 is close to several worksheet tasks because it names coordinate-based perimeter and distance computation. Do not add it in G55 without a separate accepted alignment review. This report corrects current links. It does not authorize a replacement standard.

## Sources

- Official G-GPE.B.4: https://www.thecorestandards.org/Math/Content/HSG/GPE/B/4/
- Official G-MG.A.1: https://www.thecorestandards.org/Math/Content/HSG/MG/A/1/
