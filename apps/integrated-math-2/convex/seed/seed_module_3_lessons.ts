import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedModule3LessonsResult {
  lessonsCreated: number;
  totalPhasesCreated: number;
  totalActivitiesCreated: number;
}

export const seedModule3Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule3LessonsResult> => {
    const now = Date.now();

    const lessonsData = [
      {
        lessonSlug: "module-3-lesson-1",
        title: "Dilations",
        description:
          "Students analyze dilations, determine whether a dilation is an enlargement or reduction, graph dilated figures, and explore the effects of scale factors on perimeter and sequential dilations.",
        orderIndex: 1,
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: Understanding Dilations\n\nStudents explore how dilations transform figures by examining whether the image is larger or smaller than the original and how the scale factor determines the relationship between corresponding points.\n\nInquiry Question:\nWhat does the scale factor tell you about whether a dilation produces an enlargement or a reduction?",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Vocabulary\n\n- **Dilation** — A transformation that produces an image that is the same shape as the original, but not necessarily the same size.\n- **Enlargement** — A dilation with a scale factor greater than 1, producing a larger image.\n- **Reduction** — A dilation with a scale factor between 0 and 1, producing a smaller image.\n- **Scale Factor** — The ratio of the distances (or lengths) of corresponding points of the image to the original.\n- **Invariant Point** — A point that remains fixed under a transformation.\n- **Center of Dilation** — The fixed point about which a dilation is performed.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Dilations\n\n### Key Concept: Scale Factor and Dilation Type\n\n- If [k > 1], the dilation is an **enlargement** — the image is larger than the original.\n- If [0 < k < 1], the dilation is a **reduction** — the image is smaller than the original.\n- If [k = 1], the image is congruent to the original (no change).\n- If [k < 0], the dilation also includes a rotation of 180° about the center.\n\n### Key Concept: Coordinates After a Dilation\n\nWhen a point [(x, y)] is dilated by a scale factor [k] centered at the origin, the image is [(kx, ky)].",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Identify Enlargement or Reduction\n\nDetermine whether each dilation is an enlargement or reduction, then find the scale factor.\n\n### Step 1: Compare Image to Original\n\nFor each figure pair, compare corresponding lengths. If the image is larger, it is an enlargement. If smaller, it is a reduction.\n\n[\nscale\\ factor = \\frac{image\\ length}{original\\ length}\n]\n\n### Step 2: Classify the Dilation\n\nBased on the scale factor value, classify as enlargement ([k > 1]), reduction ([0 < k < 1]), or identity ([k = 1]).",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Dilations with Scale Factors\n\n### Step 1: Apply the Scale Factor\n\nWhen a dilation has scale factor [k = \\frac{1}{2}], the image dimensions are half the original dimensions. The perimeter of the image is also half the original perimeter.\n\n**BLUEPRINTS:** Ezra is redrawing a blueprint so that the image is [k = \\frac{1}{2}] the size of the original. If the original perimeter is [P], the new perimeter is [\\frac{1}{2}P].",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Graph Dilated Triangles\n\nFor each set of triangle vertices, graph the image after a dilation centered at the origin with the given scale factor.\n\n### Step 1: Multiply Coordinates by the Scale Factor\n\nMultiply each coordinate of the original vertices by the scale factor [k].\n\n*Problem 6:* [J(-8, 0)], [K(-4, 4)], [L(-2, 0)], [k = 0.5]\nImage vertices: [J'(-4, 0)], [K'(-2, 2)], [L'(-1, 0)]\n\n*Problem 7:* [S(0, 0)], [T(-4, 0)], [V(-8, -8)], [k = 1.25]\nImage vertices: [S'(0, 0)], [T'(-5, 0)], [V'(-10, -10)]\n\n### Step 2: Plot and Connect\n\nPlot the original triangle and its dilated image on the coordinate plane.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Worked Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Find the Scale Factor\n\n### Step 1: Use Corresponding Points\n\nTo find the scale factor, compare the lengths of corresponding sides or distances from the center of dilation to corresponding points.\n\n[\nk = \\frac{image\\ length}{original\\ length}\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson. Problems include:\n\n- Determining enlargement vs. reduction for figures (Problems 1–4)\n- Blueprint scale factor and perimeter calculations (Problem 5)\n- Graphing dilated triangles and identifying coordinates (Problems 6–9, 13–16)\n- Finding scale factors from given triangle pairs (Problems 10–12, 17–19)\n- Finding coordinates after dilation with a given scale factor (Problem 20)\n- Using a ruler to draw dilations with a non-origin center (Problem 21)\n- Sequential dilations — finding the final image after two dilations and determining if there is a single direct transformation (Problem 22)\n- Analyzing the slope of lines connecting points to their dilated images (Problem 23)\n- Perimeter comparison after dilation (Problem 24)\n- Finding the equation of a dilated line (Problem 25)\n- Comparing preservation of parallelism and collinearity under transformations (Problem 26)\n- Determining when invariant points exist for various transformations (Problem 27)\n- Creating a dilation with a specific area relationship (Problem 28)\n- Using transformations to create congruent figures (Problem 29)\n- Analyzing statements about dilations and lines (Problem 30)",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Images referenced in the worksheet (triangles and quadrilaterals for problems 1–4, 6–9, 10–12, 13–16, 19, 21, 22) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams and values.\n- ![](media/image1.png) — Figure for problems 1, 2\n- ![](media/image2.png) — Figure for problems 1, 2\n- ![](media/image3.png) — Figure for problems 3, 4\n- ![](media/image4.png) — Figure for problems 3, 4\n- ![](media/image5.png) — Blueprint figure for problem 5\n- ![](media/image6.png) — Triangle for problem 10\n- ![](media/image7.png) — Triangle for problem 11\n- ![](media/image8.png) — Logo figure for problem 12\n- ![](media/image9.png) — Triangle for problem 17\n- ![](media/image10.png) — Triangle for problem 18\n- ![](media/image11.png) — Figure N for problem 19\n- ![](media/image12.png) — Triangle ABC for problem 20\n- ![](media/image13.png) — Figure for problem 21\n- The worksheet contains 30 practice problems across four examples and mixed exercises.",
                },
              },
            ],
          },
        ],
      },
      {
        lessonSlug: "module-3-lesson-2",
        title: "Similar Polygons",
        description:
          "Students identify pairs of congruent angles and write proportions for corresponding sides of similar polygons, determine whether polygons are similar, find unknown side lengths using proportions, and apply similarity to real-world problems.",
        orderIndex: 2,
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: What Makes Polygons Similar?\n\nStudents consider how similar polygons maintain their shape while their size changes, and how corresponding angles and sides relate.\n\nInquiry Question:\nIf two polygons are similar, what must be true about their corresponding angles and corresponding sides?",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Vocabulary\n\n- **Similar Polygons** — Two polygons with the same shape but not necessarily the same size; corresponding angles are congruent and corresponding sides are proportional.\n- **Scale Factor** — The ratio of the lengths of corresponding sides of similar polygons.\n- **Congruent Angles** — Angles that have the same measure.\n- **Proportion** — An equation stating that two ratios are equal.\n- **Similarity Statement** — A statement such as [ABCD ∼ WXYZ] indicating which vertices correspond between similar figures.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Similar Polygons\n\n### Key Concept: Properties of Similar Polygons\n\n- Corresponding angles are **congruent** (equal in measure).\n- Corresponding sides are **proportional** (ratios equal the scale factor).\n- The ratio of perimeters equals the scale factor: [\\frac{perimeter_{image}}{perimeter_{original}} = k]\n\n### Key Concept: Writing Similarity Statements\n\nWhen writing similarity statements, list vertices in corresponding order:\n[ABCD ∼ WXYZ] means [A ↔ W], [B ↔ X], [C ↔ Y], [D ↔ Z].",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Identify Corresponding Parts\n\n### Step 1: List Congruent Angles\n\nFor similar polygons, identify the pairs of congruent angles by matching vertex positions in the similarity statement.\n\n*Problem 1:* [ABCD ∼ WXYZ]\nCongruent angles: [∠A ≅ ∠W], [∠B ≅ ∠X], [∠C ≅ ∠Y], [∠D ≅ ∠Z]\n\n### Step 2: Write the Proportion\n\nWrite proportions relating corresponding sides using the similarity statement.\n\n[\n\\frac{AB}{WX} = \\frac{BC}{XY} = \\frac{CD}{YZ} = \\frac{DA}{ZW}\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Determine Similarity and Scale Factor\n\n### Step 1: Compare Angle Measures\n\nCheck whether corresponding angles are congruent. If all corresponding angles are equal, the figures may be similar.\n\n### Step 2: Compare Side Ratios\n\nVerify that all pairs of corresponding sides have the same ratio (scale factor). If they do, the polygons are similar.\n\n[\nk = \\frac{side_{image}}{side_{original}}\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Find Unknown Values\n\n### Step 1: Set Up a Proportion\n\nUse the known side lengths and the scale factor to set up a proportion.\n\n### Step 2: Solve for the Unknown\n\nCross-multiply and solve for the variable.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Worked Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Apply Similarity to Real-World Problems\n\n### Step 1: Extract Given Information\n\nIdentify the actual distances or measurements from the problem.\n\n*Problem 15 (GAMING):* Map distances: home to health food store = 2 cm, health food store to dungeon = 8 cm, dungeon to home = 7 cm. Actual distance from health food store to dungeon = 4 km.\n\n### Step 2: Find the Scale Factor\n\n[\nk = \\frac{actual\\ distance}{map\\ distance}\n]\n\n### Step 3: Calculate the Requested Distance\n\nApply the scale factor to find other actual distances.\n\n*Problem 16 (LAWN CARE):* Perimeter = 126 m, ratio length:width = 5:2.\nLet [l = 5x] and [w = 2x]. Then [2(5x + 2x) = 126], so [x = 9], and [w = 18] m.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson. Problems include:\n\n- Finding perimeters of triangles given similarity with other triangles in geometric figures (Problems 17–18)\n- Finding values of [x] and [y] in similar polygons (Problems 19–20)\n- Proving the Perimeters of Similar Triangles Theorem (Theorem 8.3) (Problem 21)\n- Finding [x] and the scale factor from one triangle to another (Problem 22)\n- Scale factor between rectangles given perimeters (Problem 23)\n- Writing ratios and possible side measures for isosceles triangles with given perimeters (Problem 24)\n- Comparing Olympic and community college ice hockey rink dimensions for similarity (Problem 25)\n- Magnification scale factors for a paramecium (Problem 26)\n- Finding values for which quadrilaterals are similar (Problem 27)\n- Analyzing whether similarity is an equivalence relation (Problem 28)\n- Finding a counterexample to \"all rectangles are similar\" (Problem 29)\n- Determining if regular pentagons of different sizes are similar (Problem 30)\n- Describing the relationship between two figures (Problem 31)",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Images referenced in the worksheet (polygon pairs for problems 1–6, similar figure comparisons for problems 7–10, proportion problems for problems 11–14, triangle figures for problems 17–18, additional polygon problems for problems 19–20, proof diagram for problem 21, triangle for problem 22, hockey rink for problem 25, paramecium for problem 26, pentagon for problem 30) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams and values.\n- ![](media/image1.png) — Polygon pair for problem 1 (ABCD ∼ WXYZ)\n- ![](media/image2.png) — Polygon pair for problem 2 (MNPQ ∼ RSTU)\n- ![](media/image3.png) — Triangle pair for problem 3 (△FGH ∼ △JKL)\n- ![](media/image4.png) — Triangle pair for problem 4 (△DEF ∼ △VWX)\n- ![](media/image5.png) — Polygon pair for problem 5 (ABCD ∼ FGHJ)\n- ![](media/image6.png) — Triangle pair for problem 6 (△MNP ∼ △QRP)\n- ![](media/image7.png) — Figure for problem 7\n- ![](media/image8.png) — Figure for problem 8\n- ![](media/image9.png) — Figure for problem 9\n- ![](media/image10.png) — Figure for problem 10\n- ![](media/image11.png) — Figure for problem 11\n- ![](media/image12.png) — Figure for problem 12\n- ![](media/image13.png) — Figure for problem 13\n- ![](media/image14.png) — Figure for problem 14\n- ![](media/image15.png) — Triangle for problem 17 (△CBH ∼ △FEH)\n- ![](media/image16.png) — Triangle for problem 18 (△DEF ∼ △CBF)\n- ![](media/image17.png) — Polygon for problem 19 (ABCD ∼ QSRP)\n- ![](media/image18.png) — Triangle for problem 20 (△JKL ∼ △WYZ)\n- ![](media/image19.png) — Proof diagram for Theorem 8.3\n- ![](media/image20.png) — Triangle for problem 22\n- ![](media/image21.png) — Ice hockey rink for problem 25\n- ![](media/image22.png) — Paramecium figure for problem 26\n- The worksheet contains 31 practice problems across four examples and mixed exercises.",
                },
              },
            ],
          },
        ],
      },
      {
        lessonSlug: "module-3-lesson-3",
        title: "Similar Triangles: AA Similarity",
        description:
          "Students determine whether two triangles are similar using the AA Similarity Postulate, identify corresponding parts, find unknown side lengths and angle measures, and apply AA similarity to real-world problems involving indirect measurement.",
        orderIndex: 3,
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: Why AA Proves Similarity\n\nStudents explore why knowing just two angles are congruent is enough to conclude that triangles are similar.\n\nInquiry Question:\nIf two triangles have two pairs of congruent angles, why must the third pair of angles also be congruent, and what does this tell us about the triangles?",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Vocabulary\n\n- **AA Similarity Postulate** — If two angles of one triangle are congruent to two angles of another triangle, then the triangles are similar.\n- **Corresponding Angles** — Angles in the same relative position in similar figures.\n- **Corresponding Sides** — Sides in the same relative position in similar figures.\n- **Similar Triangles** — Triangles that have congruent corresponding angles and proportional corresponding sides.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: AA Similarity\n\n### Key Concept: AA Similarity Postulate\n\nIf [∠A ≅ ∠D] and [∠B ≅ ∠E] in triangles △ABC and △DEF, then △ABC ∼ △DEF.\n\nThe third pair of angles must also be congruent because the sum of angles in a triangle is always 180°.\n\n### Key Concept: Identifying Similar Triangles\n\nWhen given a diagram with overlapping triangles, look for:\n- Shared angles\n- Vertical angles\n- Right angles\n- Angles formed by parallel lines",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Determine Triangle Similarity\n\n### Step 1: Identify Given Angle Relationships\n\nLook for angles that are congruent based on given information (shared angles, vertical angles, right angles, or parallel line angle relationships).\n\n### Step 2: Apply the AA Similarity Postulate\n\nIf two angles of one triangle are congruent to two angles of another triangle, conclude the triangles are similar and write the similarity statement.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Indirect Measurement with AA Similarity\n\nUse similar triangles to find distances that cannot be measured directly.\n\n### Step 1: Set Up the Proportion\n\n**CELL TOWERS (Problem 7):** Tower shadow = 100 ft, Lia's shadow = 3 ft 4 in (3.33 ft), Lia's height = 4 ft 6 in (4.5 ft).\n\nThe tower and Lia form similar triangles with their shadows:\n[\n\\frac{tower\\ height}{tower\\ shadow} = \\frac{Lia's\\ height}{Lia's\\ shadow}\n]\n[\n\\frac{h}{100} = \\frac{4.5}{3.33}\n]\n\n### Step 2: Solve for the Unknown\n\n[\nh = \\frac{4.5 \\times 100}{3.33} ≈ 135\\ ft\n]\n\n**LIGHTHOUSE (Problem 8):** Maya's shadow coincides with the lighthouse shadow. Use the similar triangles formed by each object and its shadow to find distances [x] and [y].",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson. Problems include:\n\n- Determining whether given triangle pairs are similar and explaining reasoning (Problems 1–6)\n- Cell tower shadow problem — finding height using similar triangles (Problem 7)\n- Lighthouse problem — finding distances using coinciding shadows (Problem 8)\n- Finding lengths of segments [AC] and [JL] using similar triangle identification (Problems 9–10)\n- Finding lengths of segments [EH] and [VT] using similar triangle identification (Problems 11–12)\n- Proving triangles in a 5-pointed star are similar (Problem 13)\n- Writing triangle similarity statements from a figure and justifying (Problem 14)\n- Proving whether △JKL ∼ △JMK given perpendicular lines (Problem 15)",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Images referenced in the worksheet (triangle pairs for problems 1–6, cell tower diagram for problem 7, lighthouse diagram for problem 8, triangle figures for problems 9–12, pentagon/star figure for problem 13, triangle figure for problem 14, perpendicular line figure for problem 15) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams and values.\n- ![](media/image1.png) — Triangle pair for problem 1\n- ![](media/image2.png) — Triangle pair for problem 2\n- ![](media/image3.png) — Triangle pair for problem 3\n- ![](media/image4.png) — Triangle pair for problem 4\n- ![](media/image5.png) — Triangle pair for problem 5\n- ![](media/image6.png) — Triangle pair for problem 6\n- ![](media/image7.png) — Cell tower diagram for problem 7\n- ![](media/image8.png) — Triangle for problem 9\n- ![](media/image9.png) — Triangle for problem 10\n- ![](media/image10.png) — Triangle for problem 11\n- ![](media/image11.png) — Triangle for problem 12\n- ![](media/image12.png) — Triangle for problem 12 (continued)\n- ![](media/image13.png) — Pentagon/star figure for problem 13\n- ![](media/image14.png) — Triangle figure for problem 14\n- The worksheet contains 15 practice problems across two examples and mixed exercises.",
                },
              },
            ],
          },
        ],
      },
      {
        lessonSlug: "module-3-lesson-4",
        title: "Similar Triangles: SSS and SAS Similarity",
        description:
          "Students determine whether triangles are similar using the SSS and SAS Similarity Theorems, find unknown side lengths, and apply these criteria to real-world problems involving proportional reasoning.",
        orderIndex: 4,
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: Proving Similarity with Limited Information\n\nStudents consider what minimum information is needed to prove triangles are similar, beyond AA.\n\nInquiry Question:\nWhat combinations of side lengths and angles are sufficient to guarantee that two triangles are similar?",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Vocabulary\n\n- **SSS Similarity Theorem** — If the three sides of one triangle are proportional to the three sides of another triangle, then the triangles are similar.\n- **SAS Similarity Theorem** — If two sides of one triangle are proportional to two sides of another triangle and the included angles are congruent, then the triangles are similar.\n- **Included Angle** — The angle between two given sides of a triangle.\n- **Proportional Sides** — Sides whose lengths have the same ratio.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: SSS and SAS Similarity\n\n### Key Concept: SSS Similarity Theorem\n\nIf [\n\\frac{AB}{DE} = \\frac{BC}{EF} = \\frac{AC}{DF}\n], then △ABC ∼ △DEF.\n\nAll three side ratios must be equal.\n\n### Key Concept: SAS Similarity Theorem\n\nIf [\n\\frac{AB}{DE} = \\frac{AC}{DF}\n] and [∠A ≅ ∠D], then △ABC ∼ △DEF.\n\nTwo sides must be proportional AND the included angle must be congruent.\n\n### Key Concept: SSS vs. SAS\n\n- **SSS**: Requires all three side ratios\n- **SAS**: Requires two side ratios and the included angle",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Determine Similarity Using SSS or SAS\n\n### Step 1: Identify Given Information\n\nLook for side length ratios or angle measures that are given or can be deduced.\n\n### Step 2: Apply the Appropriate Theorem\n\n- For SSS: Verify all three side ratios are equal.\n- For SAS: Verify two side ratios are equal AND the included angle is congruent.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Find Unknown Values Using Similarity\n\n### Step 1: Set Up the Proportion\n\nUse the given side lengths to set up a proportion based on the similarity relationship.\n\n### Step 2: Solve for the Unknown\n\nCross-multiply and solve.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Apply Similarity to Real-World Problems\n\n**ROOFING (Problem 9):** Find [x] such that triangles DEF and FBC in the roof outline are similar.\n\n**RADIO (Problem 10):** Radio tower shadow = 8 ft, yardstick shadow = 0.5 ft (1/2 in = 1/12 ft), yardstick height = 3 ft.\n[\n\\frac{tower\\ height}{8} = \\frac{3}{0.5}\n]\n[\ntower\\ height = 3 \\times \\frac{8}{0.5} = 48\\ ft\n]\n\n**SAILING (Problem 11):** Find [x] given similar sails.\n\n**MOUNTAIN PEAKS (Problem 12):** Marcus and Skye measure distances to a mountain peak. Given the actual distance between houses is [1\\frac{1}{2}] miles, find distances from each house to the peak.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson. Problems include:\n\n- Determining triangle similarity using SSS or SAS with given diagrams (Problems 1–4)\n- Finding values of [x] in similar triangle problems (Problems 5–8)\n- Roofing problem — finding [x] for similar triangles in roof structure (Problem 9)\n- Radio tower problem — finding height using similar triangles (Problem 10)\n- Sailing problem — finding [x] from similar sails (Problem 11)\n- Mountain peaks problem — finding distances to a peak (Problem 12)\n- Mia's triangle claim — justifying if △STU ∼ △SQR (Problem 13)\n- Two-column proof of SAS Similarity Theorem (Theorem 8.5) (Problem 14)\n- Comparing AA, SSS, and SAS similarity criteria (Problem 15)\n- Finding altitude length [YW] in a triangle (Problem 16)\n- Finding [x] in similar triangles with given angle and side measures (Problem 17)\n- Creating a triangle similar to a given triangle and explaining (Problem 18)",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Images referenced in the worksheet (triangle pairs for problems 1–4, similar triangle figures for problems 5–9, roof structure for problem 9, radio tower diagram for problem 10, sailboats for problem 11, mountain peak diagram for problem 12, Mia's triangles for problem 13, proof figure for problem 14, triangle for problem 16, triangle for problem 17, triangle for problem 18) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams and values.\n- ![](media/image1.png) — Triangle for problem 1\n- ![](media/image2.png) — Triangle for problem 2\n- ![](media/image3.png) — Triangle for problem 3\n- ![](media/image4.png) — Triangle for problem 4\n- ![](media/image5.png) — Triangle for problem 5\n- ![](media/image6.png) — Triangle for problem 6\n- ![](media/image7.png) — Triangle for problem 7\n- ![](media/image8.png) — Triangle for problem 8\n- ![](media/image9.png) — Triangle for problem 9\n- ![](media/image10.png) — Triangle for problem 10\n- ![](media/image11.png) — Mountain diagram for problem 12\n- ![](media/image12.png) — Triangle for problem 12\n- ![](media/image13.png) — Mia's triangles for problem 13\n- ![](media/image14.png) — Proof figure for problem 14\n- ![](media/image15.png) — Triangle for problem 17\n- The worksheet contains 18 practice problems across three examples and mixed exercises.",
                },
              },
            ],
          },
        ],
      },
      {
        lessonSlug: "module-3-lesson-5",
        title: "Triangle Proportionality",
        description:
          "Students apply the Triangle Proportionality Theorem to find unknown lengths, determine whether lines are parallel using the converse of the theorem, find midsegment lengths, and solve real-world problems involving parallel lines.",
        orderIndex: 5,
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: When Lines Divide Sides Proportionally\n\nStudents explore how a line parallel to one side of a triangle creates proportional segments on the other two sides.\n\nInquiry Question:\nIf a line parallel to one side of a triangle divides the other two sides proportionally, what can you conclude about that line?",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Vocabulary\n\n- **Triangle Proportionality Theorem** — If a line is parallel to one side of a triangle and intersects the other two sides, it divides those sides proportionally.\n- **Converse of the Triangle Proportionality Theorem** — If a line divides two sides of a triangle proportionally, then it is parallel to the third side.\n- **Midsegment** — A segment connecting the midpoints of two sides of a triangle.\n- **Triangle Midsegment Theorem** — A midsegment of a triangle is parallel to one side and half its length.\n- **Proportional Segments** — Segments that have the same ratio.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Triangle Proportionality\n\n### Key Concept: Triangle Proportionality Theorem\n\nIf [DE ∥ BC] in △ABC, then [\n\\frac{AD}{DB} = \\frac{AE}{EC}\n].\n\nConversely, if [\n\\frac{AD}{DB} = \\frac{AE}{EC}\n], then [DE ∥ BC].\n\n### Key Concept: Midsegments\n\nA **midsegment** connects the midpoints of two sides of a triangle.\n\n- A midsegment is **parallel** to the third side.\n- A midsegment is **half the length** of the third side.\n\n### Key Concept: Corollary 8.1 (Three Parallel Lines)\n\nIf three parallel lines intersect two transversals, they divide the transversals proportionally: [\n\\frac{AB}{BC} = \\frac{EF}{FG}\n].",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Apply the Triangle Proportionality Theorem\n\n### Step 1: Identify the Proportion\n\nGiven [AB = 6], [BC = 4], and [AE = 9], find [ED].\n\nUsing [\n\\frac{AB}{BC} = \\frac{AE}{ED}\n]:\n[\n\\frac{6}{4} = \\frac{9}{ED}\n]\n[\nED = \\frac{9 \\times 4}{6} = 6\n]\n\n### Step 2: Solve for the Unknown\n\nGiven [AB = 12], [AC = 16], and [ED = 5], find [AE].\n\nSince [AC = AE + ED], we have [16 = AE + 5], so [AE = 11].",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Determine Whether Lines Are Parallel\n\n### Step 1: Check the Proportion\n\nTo determine if [NR ∥ PQ], verify whether the segments are divided proportionally.\n\n**Problem 3:** [PM = 18], [PN = 6], [QM = 24], [RM = 16]\n[\n\\frac{PN}{PM} = \\frac{6}{18} = \\frac{1}{3}\n]\n[\n\\frac{RM}{QM} = \\frac{16}{24} = \\frac{2}{3}\n]\nSince [\\frac{1}{3} ≠ \\frac{2}{3}], [NR] is **not** parallel to [PQ].\n\n**Problem 4:** [QM = 31], [RM = 21], [PM = 4PN]\nLet [PN = x], then [PM = 4x].\n[\n\\frac{PN}{PM} = \\frac{x}{4x} = \\frac{1}{4}\n]\n[\n\\frac{RM}{QM} = \\frac{21}{31}\n]\nFor [NR ∥ PQ], we need [\\frac{PN}{PM} = \\frac{RM}{QM}], which requires [\\frac{1}{4} = \\frac{21}{31}], which is false. So [NR] is **not** parallel to [PQ].",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Find Values with Midsegments\n\n### Step 1: Identify Midpoints and Apply the Midsegment Theorem\n\n**Midsegments of △UWY:** If [VR], [VZ], and [ZR] are midsegments, then each is parallel to one side and half its length.\n\n### Step 2: Set Up Equations\n\nUse the given lengths to solve for [x] in each problem (Problems 5–8).",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Worked Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Apply to Real-World Problems\n\n**MAPS (Problem 9):** Cay Street ∥ Bay Street. Find [x], the distance between streets along Earl Street.\n\n**PLAYSCAPES (Problem 10):** Two-story playscape with parallel supports. Find [x].",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Worked Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Find Multiple Unknown Values\n\n### Step 1: Set Up Multiple Proportions\n\nFor problems with two unknowns, set up a system of equations using the proportionality relationships.",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson. Problems include:\n\n- Finding values using midsegment relationships in triangles (Problems 13–16)\n- Finding length of [AC] when [DE] is a midsegment (Problem 16)\n- Carpentry problem — horizontal support beam length (Problem 17)\n- Paragraph proof of Triangle Proportionality Theorem (Theorem 8.8) (Problem 18)\n- Paragraph proof of Converse of Triangle Proportionality Theorem (Theorem 8.9) (Problem 19)\n- Two-column proof of Triangle Midsegment Theorem (Theorem 8.10) (Problem 20)\n- Paragraph proof of Corollary 8.1 (Three Parallel Lines) (Problem 21)\n- Finding [AD] given parallel lines and segment lengths (Problem 22)\n- Stained glass window — finding total length of cames using triangle similarity (Problem 23)\n- Shuffleboard court — finding lengths [AB], [BD], [DF] (Problem 24)\n- Series of midsegments in a triangle — finding lengths of [ST], [UV], [WX] and [YZ] (Problem 25)\n- Find the error — analyzing incorrect reasoning about midsegment relationships (Problem 26)\n- Analyzing whether [DE] is sometimes, always, or never [3/4] of [BC] (Problem 27)\n- Two-column proof involving parallel lines (Problem 28)\n- Drawing segments with given proportional relationships (Problem 29)\n- Comparing Triangle Proportionality and Triangle Midsegment Theorems (Problem 30)",
                },
              },
            ],
          },
          {
            phaseNumber: 10,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Images referenced in the worksheet (triangle figures for problems 1–2, parallel line determination figures for problems 3–4, midsegment figures for problems 5–8, map for problem 9, playscape for problem 10, triangle for problems 11–12, midsegment of △KLM for problems 13–15, triangle for problem 16, carpentry figure for problem 17, proof figures for problems 18–21, figure for problem 22, stained glass for problem 23, shuffleboard for problem 24, series of midsegments for problem 25, triangle JHL for problem 26, triangle ABC for problem 27, proof figure for problem 28) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams and values.\n- ![](media/image1.png) — Triangle figure for introduction\n- ![](media/image2.png) — Triangle for problems 1–2\n- ![](media/image3.png) — Triangle for problems 5, 6\n- ![](media/image4.png) — Triangle for problems 5, 6\n- ![](media/image5.png) — Triangle for problems 7, 8\n- ![](media/image6.png) — Triangle for problems 7, 8\n- ![](media/image7.png) — Triangle for problems 9–10\n- ![](media/image8.png) — Map figure for problem 9\n- ![](media/image9.png) — Triangle for problems 11, 12\n- ![](media/image10.png) — Triangle for problems 11, 12\n- ![](media/image11.png) — Triangle KLM for problems 13–15\n- ![](media/image12.png) — Figure for problem 13\n- ![](media/image13.png) — Figure for problem 14\n- ![](media/image14.png) — Figure for problem 15\n- ![](media/image15.png) — Carpentry figure for problem 17\n- ![](media/image16.png) — Proof figure for problem 19\n- ![](media/image17.png) — Proof figure for problem 20\n- ![](media/image18.png) — Proof figure for problem 20\n- ![](media/image19.png) — Proof figure for problem 21\n- ![](media/image20.png) — Figure for problem 22\n- ![](media/image21.png) — Stained glass for problem 23\n- ![](media/image22.png) — Shuffleboard for problem 24\n- ![](media/image23.png) — Series of midsegments for problem 25\n- ![](media/image24.png) — Triangle JHL for problem 26\n- ![](media/image25.png) — Triangle ABC for problem 27\n- The worksheet contains 30 practice problems across five examples and mixed exercises.",
                },
              },
            ],
          },
        ],
      },
      {
        lessonSlug: "module-3-lesson-6",
        title: "Parts of Similar Triangles",
        description:
          "Students find unknown side lengths in similar triangles using proportional reasoning, find lengths of altitudes, apply theorems about proportional relationships of medians and angle bisectors, and use the Triangle Angle Bisector Theorem.",
        orderIndex: 6,
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: Special Segments in Similar Triangles\n\nStudents explore how special segments (altitudes, medians, angle bisectors) behave in similar triangles.\n\nInquiry Question:\nWhen triangles are similar, how do the lengths of corresponding altitudes, medians, and angle bisectors relate?",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Vocabulary\n\n- **Altitude** — A perpendicular segment from a vertex to the line containing the opposite side.\n- **Median** — A segment from a vertex to the midpoint of the opposite side.\n- **Angle Bisector** — A ray that divides an angle into two congruent angles.\n- **Triangle Angle Bisector Theorem** — The angle bisector of a triangle divides the opposite side into segments proportional to the adjacent sides.\n- **Theorem 8.12** — Perimeters of similar triangles are in the same ratio as the corresponding sides.\n- **Theorem 8.13** — If two triangles are similar, the lengths of corresponding medians are in the same ratio as the corresponding sides.\n- **Theorem 8.14** — Angle bisectors of similar triangles are proportional to the corresponding sides.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Parts of Similar Triangles\n\n### Key Concept: Altitudes in Similar Triangles\n\nIf △RST ∼ △EFG and [SH] and [FJ] are altitudes, then [\n\\frac{SH}{FJ} = \\frac{ST}{FG} = k\n], where [k] is the scale factor.\n\n### Key Concept: Perimeters Ratio\n\nThe ratio of the perimeters of similar triangles equals the scale factor.\n\n### Key Concept: Medians in Similar Triangles\n\nIf △ABC ∼ △RST, [AD] is a median of △ABC, and [RU] is a median of △RST, then [\n\\frac{AD}{RU} = \\frac{AB}{RS} = k\n].\n\n### Key Concept: Angle Bisectors in Similar Triangles\n\nIf △RTS ∼ △EGF and [TA] and [GB] are angle bisectors, then [\n\\frac{TA}{GB} = \\frac{RT}{EG} = k\n].\n\n### Key Concept: Triangle Angle Bisector Theorem\n\nIf [CD] bisects [∠ACB], then [\n\\frac{AD}{DB} = \\frac{AC}{BC}\n].",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Find Unknown Side Lengths\n\n### Step 1: Set Up a Proportion\n\nGiven similar triangles, use the ratio of corresponding sides to set up a proportion.\n\n### Step 2: Solve for the Unknown\n\nCross-multiply and solve.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Altitudes in Similar Triangles\n\n### Step 1: Identify Corresponding Altitudes\n\nIf △RST ∼ △EFG and [SH] is an altitude of △RST and [FJ] is an altitude of △EFG, then [SH] and [FJ] are corresponding altitudes.\n\n### Step 2: Apply the Proportion\n\n**Problem 5:** △RST ∼ △EFG, [ST = 6], [SH = 5], [FJ = 7], find [FG].\n\nSince [\n\\frac{SH}{FJ} = \\frac{ST}{FG}\n]:\n[\n\\frac{5}{7} = \\frac{6}{FG}\n]\n[\nFG = \\frac{6 \\times 7}{5} = 8.4\n]\n\n**Problem 6:** △ABC ∼ △MNP, [AB = 24], [AD = 14], [MQ = 10.5], find [MN].\n\nSince [\n\\frac{AD}{MQ} = \\frac{AB}{MN}\n]:\n[\n\\frac{14}{10.5} = \\frac{24}{MN}\n]\n[\nMN = \\frac{24 \\times 10.5}{14} = 18\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Real-World Application\n\n### Step 1: Set Up the Proportion\n\n**SCENERY (Problem 7):** Two similar triangles formed by paths. [AC = 50] yd, [MP = 35] yd. Fountain is 5 yd from intersection.\n\nUse the scale factor [\nk = \\frac{MP}{AC} = \\frac{35}{50} = \\frac{7}{10}\n].\n\n### Step 2: Find the Unknown Distance\n\nDistance from intersection to stadium entrance is proportional to [AC] and [MP].",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson. Problems include:\n\n- Finding values of [x] in similar triangle problems (Problems 1–4)\n- Altitude problems in similar triangles (Problems 5–6)\n- Scenery/paths problem — finding distance to stadium entrance (Problem 7)\n- Finding values of variables in triangle figures (Problems 8–9)\n- Finding lengths of segments [XC] and [EY] in similar triangles (Problems 10–11)\n- Paragraph proof of Theorem 8.12 — angle bisector proportionality (Problem 12)\n- Two-column proof of Theorem 8.13 — median proportionality (Problem 13)\n- Two-column proof of Triangle Angle Bisector Theorem (Theorem 8.14) (Problem 14)\n- Find the error — analyzing incorrect proportion setups (Problem 15)\n- Creating non-similar triangles with proportional altitude and side (Problem 16)\n- Finding [PS] and [RS] using angle bisector theorem (Problem 17)",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n- Images referenced in the worksheet (triangle figures for problems 1–4, altitude figures for problems 5–6, scenery/paths diagram for problem 7, triangle figures for problems 8–9, triangle figures for problems 10–11, proof figures for problems 12–14, triangle for problem 15, figure for problem 16, triangle for problem 17) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams and values.\n- ![](media/image1.png) — Triangle for problem 1\n- ![](media/image2.png) — Triangle for problem 2\n- ![](media/image3.png) — Triangle for problem 3\n- ![](media/image4.png) — Triangle for problem 4\n- ![](media/image5.png) — Triangle for problem 5\n- ![](media/image6.png) — Triangle for problem 6\n- ![](media/image7.png) — Scenery/path figure for problem 7\n- ![](media/image8.png) — Triangle for problem 8\n- ![](media/image9.png) — Triangle for problem 9\n- ![](media/image10.png) — Triangle for problems 10–11\n- ![](media/image11.png) — Proof figure for problem 12\n- ![](media/image12.png) — Proof figure for problem 13\n- ![](media/image13.png) — Proof figure for problem 13\n- ![](media/image14.png) — Triangle for problem 14\n- ![](media/image15.png) — Figure for problem 16\n- The worksheet contains 17 practice problems across three examples and mixed exercises.",
                },
              },
            ],
          },
        ],
      },
    ];

    let lessonsCreated = 0;
    let totalPhasesCreated = 0;
    let totalActivitiesCreated = 0;

    for (const lesson of lessonsData) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lesson.lessonSlug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 3,
            title: lesson.title,
            slug: lesson.lessonSlug,
            description: lesson.description,
            orderIndex: lesson.orderIndex,
            createdAt: now,
            updatedAt: now,
          });

      if (!existingLesson) lessonsCreated++;

      const existingLessonVersion = await ctx.db
        .query("lesson_versions")
        .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
        .first();

      const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
        ? existingLessonVersion._id
        : await ctx.db.insert("lesson_versions", {
            lessonId,
            version: 1,
            title: lesson.title,
            description: lesson.description,
            status: "published",
            createdAt: now,
          });

      let phasesCreatedThisLesson = 0;

      for (const phase of lesson.phases) {
        const existingPhase = await ctx.db
          .query("phase_versions")
          .withIndex("by_lesson_version_and_phase", (q) =>
            q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", phase.phaseNumber)
          )
          .first();

        if (existingPhase) continue;

        const phaseId = await ctx.db.insert("phase_versions", {
          lessonVersionId,
          phaseNumber: phase.phaseNumber,
          title: phase.title,
          estimatedMinutes: phase.estimatedMinutes,
          phaseType: phase.phaseType,
          createdAt: now,
        });

        phasesCreatedThisLesson++;

        for (const section of phase.sections) {
          if (section.sectionType === "activity") {
            const activityContent = section.content as {
              componentKey: string;
              props: Record<string, unknown>;
            };

            const insertedActivityId = await ctx.db.insert("activities", {
              componentKey: activityContent.componentKey,
              displayName: `${phase.title} - ${activityContent.componentKey}`,
              description: `Activity for ${phase.title}`,
              props: activityContent.props,
              gradingConfig: { autoGrade: true, partialCredit: true },
              createdAt: now,
              updatedAt: now,
            });

            totalActivitiesCreated++;

            await ctx.db.insert("phase_sections", {
              phaseVersionId: phaseId,
              sequenceOrder: section.sequenceOrder,
              sectionType: section.sectionType,
              content: {
                ...activityContent,
                activityId: insertedActivityId,
              },
              createdAt: now,
            });
          } else {
            await ctx.db.insert("phase_sections", {
              phaseVersionId: phaseId,
              sequenceOrder: section.sequenceOrder,
              sectionType: section.sectionType,
              content: section.content,
              createdAt: now,
            });
          }
        }
      }

      totalPhasesCreated += phasesCreatedThisLesson;
    }

    return {
      lessonsCreated,
      totalPhasesCreated,
      totalActivitiesCreated,
    };
  },
});
