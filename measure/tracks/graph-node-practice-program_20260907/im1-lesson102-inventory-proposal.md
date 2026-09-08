# IM1 Lesson 10-2 source inventory and proposal

## Status and source

This is a read-only inventory and a proposal. It does not approve a source or graph change.

The source is the committed `HEAD` version of `apps/integrated-math-1/curriculum/source-materials/practice-worksheet-student-bundle/Int1_1002_practice.docx`.

The printed title is `Points, Lines, and Planes ⸱ Practice`. The worksheet has 50 numbered prompts and 14 native figures. The rendered content occurs on pages 1, 2, 3, and 5. The renderer inserted a blank page 4. That blank page is not source content.

## Stable source identities

Keep these approved identities:

- `math.im1.example.10.2.003`: Example 1. It owns Problems 1-7.
- `math.im1.example.10.2.004`: Example 2. It owns Problems 8-19.
- `math.im1.example.10.2.005`: Example 3. It owns Problems 20-24.
- `math.im1.example.10.2.006`: Example 4. It owns Problems 25-28.
- `math.im1.example.10.2.007`: Example 5. It owns Problems 29-31.
- `math.im1.lesson.10.2`: the lesson identity. Problems 32-50 are Mixed Exercises under this lesson.

Do not create a Mixed Exercises worked-example identity. Do not renumber the five existing example identities. Their `.003` through `.007` suffixes are established stable IDs.

Keep these approved skill identities:

- `math.im1.skill.10.2.identify-and-name-points-lines-and-planes-from-geometric-fig`
- `math.im1.skill.10.2.draw-and-label-figures-that-accurately-represent-given-geome`

The existing blueprint rows have empty `sourceNodeIds`. A graph change must add exact source identities before it claims executable evidence.

## Complete prompt and response inventory

### Example 1 on source page 1

1. `Name the lines that are only in plane 𝒬.` Response: line `𝓃` and line `𝓆`.
2. `How many planes are labeled in the figure?` Response: `2`, planes `𝒬` and `ℛ`.
3. `Name the plane containing the lines 𝓂 and 𝓉.` Response: plane `ℛ`.
4. `Name the intersection of lines 𝓂 and 𝓉.` Response: point `C`.
5. `Name a point that is not coplanar with points A, B, and C.` Response: one valid point outside plane `ℛ`, such as `D`, `M`, `G`, `H`, or `P`.
6. `Are points F, M, G, and P coplanar? Explain.` Response: `No`, with an incidence explanation from the two-plane figure.
7. `Does line 𝓃 intersect line 𝓆? Explain.` Response: `Yes`; the coplanar lines have different directions and intersect when extended beyond the shown part of plane `𝒬`. The figure has no parallel marks.

Problems 1-5 have short exact responses. Problems 6-7 require an explanation.

### Example 2 on source page 1

The direction is `Name the geometric terms modeled by each object or phrase.`

8. `roof of a house` Response: a plane.
9. `a tabletop` Response: a plane.
10. `bridge support beam` Response: a line.
11. `a chessboard` Response: a plane.
12. The supplied drawing shows two vertical planes that intersect. Response: intersecting planes.
13. The supplied drawing shows a marked point on a line. Response: a point on a line.
14. `a wall and the floor` Response: intersecting planes.
15. `the edge of a table` Response: a line.
16. `two connected walls` Response: intersecting planes.
17. `a blanket` Response: a plane.
18. `a telephone pole` Response: a line.
19. `a tablet computer` Response: a plane.

These responses model ideal geometric objects. A scorer must accept a clear equivalent term. It must not treat the physical object as an infinite mathematical object without the modeling convention.

### Example 3 on source page 2

The direction is `USE TOOLS Draw and label a figure for each relationship.`

20. `Points X and Y lie on CD.` Response: a labeled line through `C`, `D`, `X`, and `Y`.
21. `Two planes do not intersect.` Response: two labeled parallel planes.
22. `Line 𝓂 intersects plane ℛ at a single point.` Response: a line that crosses the plane at one labeled point.
23. `Three lines intersect at point J but do not all lie in the same plane.` Response: three labeled concurrent lines with a three-dimensional, noncoplanar arrangement.
24. `Points A(2, 3), B(2, –3), C, and D are collinear, but A, B, C, D, and F are not.` Response: place `A`, `B`, `C`, and `D` on the vertical line `x = 2`; place `F` off that line.

Each response is a drawing. More than one drawing can satisfy each prompt.

### Example 4 on source page 2

25. `How many planes are shown in the figure?` Response: `5`: planes `ABC` (or `W`), `FED`, `FEBA`, `EDCB`, and `FDCA`.
26. `How many of the planes contain points F and E?` Response: `2`: planes `FED` and `FEBA`.
27. `Name four points that are coplanar.` Response: one valid set is `F, E, A, B`, `E, D, B, C`, or `F, D, A, C`.
28. `Are points A, B, and C coplanar? Explain.` Response: `Yes`; all three lie in plane `W`.

Problems 25-27 have exact responses. Problem 28 requires an explanation.

### Example 5 on source page 2

29. `BUILDING The roof and exterior walls of a house represent intersecting planes. Using the image, name all the lines that are formed by the intersecting planes.` Response: name every shown shared edge between adjacent roof and wall planes. This requires manual comparison with the labeled house figure. Do not score a partial hard-coded line list as complete without a figure audit.
30. `If the surface of a lake represents a plane, what geometric term is represented by the intersection of a fishing line and the lake’s surface?` Response: a point.
31. `ART` perspective prompt.
   - a. `Where do the receding lines and horizon lines intersect?` Response: at the vanishing points.
   - b. `Identify examples of planes within this picture.` Response: valid visible building faces or other flat surfaces, with a clear identification.

Problem 29 and Problem 31b need figure-aware review. Problem 30 and Problem 31a have short exact responses.

### Mixed Exercises on source page 3

The first direction is `USE TOOLS Draw and label a figure for each relationship.`

32. `LM and NP are coplanar but do not intersect.` Response: draw two labeled parallel lines in one plane.
33. `FG and JK intersect at P(4, 3), where point F is at (–2, 5) and point J is at (7, 9).` Response: draw line `FG` through `F` and `P`, and line `JK` through `J` and `P`. The lines have slopes `-1/3` and `2/3` respectively.
34. `Lines 𝓈 and 𝓉 intersect, and line 𝓋 does not intersect either one.` Response: draw `𝓈` and `𝓉` as intersecting lines. Place `𝓋` so it misses both lines. It can be parallel to one line and skew to the other. It does not have to be skew to both.

The figure for Problems 35-38 shows plane `ABC`, line `𝓅` through `C` and `D`, line `𝓃` through `A` and `B`, and line `𝓆` through `B`, `G`, and `E`.

35. `Name a line that contains point E.` Response: line `𝓆`.
36. `Name a point contained in line 𝓃.` Response: `A` or `B`.
37. `What is another name for line 𝓅?` Response: line `CD` or line `DC`.
38. `Name the plane containing lines 𝓃 and 𝓅.` Response: plane `ABC` or another valid three-point name from the labeled plane.

The second direction is `USE TOOLS Draw and label a figure for each relationship.`

39. `Point K lies on RT.` Response: draw and label `K` on line `RT`.
40. `Plane 𝒥 contains line 𝓈.` Response: draw and label line `𝓈` in plane `𝒥`.
41. `YP lies in plane ℬ and contains point C, but does not contain point H.` Response: draw plane `ℬ`, line `YP` in it, point `C` on the line, and point `H` off the line. The source does not require `H` to be outside the plane.
42. `Lines 𝓆 and 𝒻 intersect at point Z in plane 𝒰.` Response: draw two labeled lines that meet at `Z` in plane `𝒰`.
43. `Name the geometric term modeled by the object.` The object is a table. Response: `plane`. The shown table surface models the plane requested by this source.
44. `Name the geometric term modeled by a partially-opened folder.` Response: two intersecting planes.

### Mixed Exercises on the final source content page

45. `CREATE Sketch three planes that intersect in a point.` Response: any labeled three-plane model with one common point.
46. `ANALYZE Is it possible for two points on the surface of a prism to be neither collinear nor coplanar? Justify your argument.` Response: `No`. Any two points determine a line, and at least one plane contains that line. A valid answer must state the incidence reason.
47. `FIND THE ERROR Camille and Hiroshi are trying to determine the greatest number of lines that can be drawn using any two of four random points. Is either correct? Explain your reasoning.` Response: Hiroshi is correct under the maximum condition. Four points with no three collinear determine `C(4,2) = 6` lines. Camille counts ordered choices and double-counts each line.
48. `PERSEVERE What is the greatest number of planes determined using any three of the points A, B, C, and D if no three points are collinear?` Response: `C(4,3) = 4`. A noncoplanar placement attains this maximum. The source does not request a written explanation.
49. `WRITE A finite plane is a plane that has boundaries, or does not extend indefinitely. The sides of a cereal box shown are finite planes. Give a real-life example of a finite plane. Is it possible to have a real-life object that is an infinite plane? Explain your reasoning.` Response: accept a bounded flat surface as the finite-plane example. The real object cannot be an infinite mathematical plane. Require the physical-boundary explanation.
50. `CREATE Sketch three planes that intersect in a line.` Response: any labeled three-plane model with one common line.

## Native figure inventory

The one extraction directory is `/tmp/im1-g53-parent-native`. It contains all 14 native files from the committed DOCX.

1. `image1.png`: two parallel-looking planes `ℛ` and `𝒬`; transversal line `p`; lines `𝓂`, `𝓉`, `𝓃`, and `𝓆`; points `A` through `H`, `L`, `M`, and `P`. Used by Problems 1-7.
2. `image2.png`: roof of a house. Used by Problem 8.
3. `image3.png`: tabletop with dishes. Used by Problem 9.
4. `image4.png`: bridge support beam. Used by Problem 10.
5. `image5.png`: chessboard. Used by Problem 11.
6. `image6.png`: two intersecting vertical planes. Used by Problem 12.
7. `image7.jpg`: a point marked on a horizontal line. Used by Problem 13.
8. `image8.png`: planes `W` and a vertical plane with points `A` through `F`. Used by Problems 25-28.
9. `image9.png`: house with labeled vertices `A` through `H`. Used by Problem 29.
10. `image10.png`: horizon line, two vanishing points, and labeled receding lines. Used by Problem 31.
11. `image11.png`: plane with lines `𝓅`, `𝓃`, and `𝓆`, and points `A` through `E` and `G`. Used by Problems 35-38.
12. `image12.png`: table. Used by Problem 43.
13. `image13.png`: Camille and Hiroshi statements. Camille says `4 · 3 = 12`; Hiroshi says `3 + 2 + 1 = 6`. Used by Problem 47.
14. `image14.png`: cereal box. Used by Problem 49.

A source restoration must preserve these native bytes. Accessible text must include the labels and incidence facts needed to answer each linked prompt.

## Capability proposal

### Exact reuse

Reuse `math.im1.skill.10.2.identify-and-name-points-lines-and-planes-from-geometric-fig` for Problems 1-19, 25-31, 35-38, 43, and 44. Use prompt-level scoring for incidence, intersection, parallelism, coplanarity, and physical-object modeling. Do not treat one correct noun as proof of every relationship in a multi-part figure.

Reuse `math.im1.skill.10.2.draw-and-label-figures-that-accurately-represent-given-geome` for Problems 20-24, 32-34, 39-42, 45, and 50. Each drawing must satisfy every stated incidence and exclusion condition.

Reuse `math.im1.skill.12.4.apply-geometric-postulates-about-points-lines-and-planes-to` for the justification in Problem 46. This is an exact capability match. Its later lesson location does not create a prerequisite from Lesson 12.4 to Lesson 10.2. The source evidence can attach to the stable skill without adding lesson-order edges.

### Minimum new draft atom

Add one draft, inactive capability:

- **Determine the maximum number of distinct lines or planes formed by point subsets.** Use only for Problems 47 and 48. Keep two evidence variants. Problem 47 observes the line count and the required double-counting explanation. Problem 48 observes the maximum plane count only. It does not observe a written general-position explanation. Do not transfer either unobserved response from one variant to the other.

Do not create separate line-count and plane-count atoms. Both prompts observe the same subset-counting operation with a geometric uniqueness condition.

Do not add a separate finite-plane atom from Problem 49 at this stage. The prompt defines `finite plane` locally. Keep the real-object example and infinite-plane explanation as task-local manual evidence. Do not attach it as direct evidence for the existing identify-and-name skill. Reconsider a reusable capability only if another accepted source teaches this distinction.

Do not add atoms for each diagram question, coplanarity question, or real-world object. The two approved Lesson 10.2 skills already name those operations at the required scope.

## Prerequisite proposal

Do not restore `math.im1.edge.1192` or any Lesson 10.1 to Lesson 10.2 sequence edge.

No new prerequisite is supported by this source. The identify-and-name and draw-and-label tasks are related, but the source does not establish that the complete first skill is necessary for the second skill. Both use local geometric terms. This shared term knowledge does not establish a prerequisite edge. In particular:

- Lesson order does not establish a prerequisite.
- The maximum-count atom does not require the complete Lesson 10.2 identification skill. It requires the local definitions of a line and a plane plus subset counting. The current graph has no exact approved subset-counting skill to cite.
- Problem 46 supplies evidence for the existing postulate-application skill. It does not show that Lesson 10.2 depends on all of Lesson 12.4.

## Review and scoring boundaries

Use automatic exact scoring only where the response has a unique short value or a controlled equivalent set. This includes Problems 1-5, 8-19, 25-27, 30, 31a, 35-38, 43, 44, and 48.

Use manual review for Problems 6-7, 20-24, 28-29, 31b-34, 39-42, 45-47, and 49-50. These prompts require an explanation, a drawing, an exhaustive figure list, an open real-world example, or a condition-sensitive argument.

Specific boundaries:

- Problem 5 accepts any labeled point that is outside the plane determined by `A`, `B`, and `C`.
- Problem 24 allows different positions for `C`, `D`, and `F` if all stated conditions hold.
- Problem 29 needs an audited complete edge set from the native house figure before an exact answer key can exist.
- Problem 31b accepts more than one visible plane.
- Problem 34 requires a three-dimensional interpretation. Line `𝓋` must miss both intersecting lines. It can be parallel to one and skew to the other. Do not require it to be skew to both.
- Problem 38 accepts any valid three-noncollinear-point name for the shown plane.
- Problem 41 does not state that `H` is outside plane `ℬ`. It states only that line `YP` does not contain `H`.
- Problem 46 must use the two-point incidence fact. A picture alone is not sufficient.
- Problem 47 asks for the greatest number. The no-three-collinear condition is part of the maximizing arrangement even though the prompt says `random points`.
- Problem 48 asks for a maximum. Accept the exact count `4`. Use a noncoplanar placement to validate that the maximum is attainable. Do not require an unrequested written explanation.
- Problem 49 uses a source-defined informal term, `finite plane`. Do not change the canonical definition of a mathematical plane.

## Recommended change scope

A later source restoration should have this narrow scope:

- Restore one extensionless lesson source at `apps/integrated-math-1/curriculum/modules/module-10-lesson-2`.
- Add one exact source regression test.
- Add the 14 exact native files under `apps/integrated-math-1/public/curriculum/module-10-lesson-2/`.

A later graph change should update only the canonical graph catalogs, projections, coverage data, audit counts, and focused tests required for:

- the five existing stable source identities;
- the two existing Lesson 10.2 skills;
- the exact reuse of the existing Lesson 12.4 postulate skill for Problem 46;
- one new draft, inactive maximum-count capability;
- removal of empty executable specifications or placeholder activity rows only when exact inspection confirms they exist;
- no new prerequisite edge.

Do not add runtime modes, generator claims, source approval, or readiness claims in this proposal.

## Corrected freeze

This revision applies the independent-review corrections. It is ready for a quick peer check. It does not authorize source or graph implementation.
