import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedResult {
  lessonsSeeded: number;
  lessonVersionsCreated: number;
  phasesCreated: number;
}

export const seedModule13Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedResult> => {
    const now = Date.now();

    const lessonsData = [
      {
        slug: "13-1-reflections",
        title: "Reflections",
        description:
          "Students graph the image of a figure after a reflection over a given line and determine coordinates after reflection in horizontal or vertical lines.",
        orderIndex: 1,
        phases: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Key Terms\n\n- **Reflection** — A transformation that flips a figure over a line, creating a mirror image.\n- **Line of Reflection** — The line over which a figure is reflected; the perpendicular bisector of the segment joining any point to its image.\n- **Image** — The new figure formed after a transformation.\n- **Preimage** — The original figure before a transformation.\n- **Coordinate Plane** — A two-dimensional grid formed by the intersection of a horizontal number line (the x-axis) and a vertical number line (the y-axis).",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: What Happens to Coordinates When You Flip a Figure?\n\nStudents examine what happens to the coordinates of a point when it is reflected across different lines on the coordinate plane. Consider whether reflecting over the x-axis, y-axis, or the line y = x produces predictable changes.\n\n**Inquiry Question:**\nHow can you predict the new coordinates of a point after it is reflected across a line without graphing?",
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
                    "## Learn: Reflections on the Coordinate Plane\n\nA reflection is a transformation that flips a figure over a line called the line of reflection. Every point of the preimage and its corresponding point on the image are the same distance from the line of reflection.\n\n### Key Concept: Reflection Rules\n\n- **Reflection in the x-axis:** \\((x, y) \\rightarrow (x, -y)\\)\n- **Reflection in the y-axis:** \\((x, y) \\rightarrow (-x, y)\\)\n- **Reflection in the line \\(y = x\\):** \\((x, y) \\rightarrow (y, x)\\)\n- **Reflection in the line \\(y = -x\\):** \\((x, y) \\rightarrow (-y, -x)\\)\n\n### Key Concept: Reflection in Horizontal and Vertical Lines\n\n- **Reflection in a horizontal line \\(y = k\\):** The x-coordinate stays the same; the y-coordinate becomes \\(2k - y\\).\n  \\[(x, y) \\rightarrow (x, 2k - y)\\]\n- **Reflection in a vertical line \\(x = h\\):** The y-coordinate stays the same; the x-coordinate becomes \\(2h - x\\).\n  \\[(x, y) \\rightarrow (2h - x, y)\\]",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 1 and 2 — Graph the Image of a Figure Under a Reflection\n\nGraph a figure and its image after a reflection over a given line, then determine the coordinates of the image vertices.\n\n### Step 1: Reflect a Triangle in the Line \\(y = x\\)\n\nUse the rule \\((x, y) \\rightarrow (y, x)\\) to find the image of each vertex of the triangle. Graph the original vertices and the reflected vertices, then connect the reflected vertices to form the image.\n\n\\[ A(x, y) \\rightarrow A'(y, x) \\]\n\\[ B(x, y) \\rightarrow B'(y, x) \\]\n\\[ C(x, y) \\rightarrow C'(y, x) \\]\n\n### Step 2: Reflect a Trapezoid in a Vertical Line\n\nUse the rule for reflection in a vertical line \\(x = h\\), where \\(h = -1\\). For each vertex \\((x, y)\\), the image is \\((2h - x, y) = (-2 - x, y)\\).\n\n\\[ D(x, y) \\rightarrow D'(-2 - x, y) \\]\n\\[ E(x, y) \\rightarrow E'(-2 - x, y) \\]\n\\[ F(x, y) \\rightarrow F'(-2 - x, y) \\]\n\\[ G(x, y) \\rightarrow G'(-2 - x, y) \\]\n\nGraph the original trapezoid and the reflected trapezoid.\n\n### Step 3: Reflect a Parallelogram in the Line \\(y = x\\)\n\nApply the same rule \\((x, y) \\rightarrow (y, x)\\) to each vertex of the parallelogram. Plot the preimage and image, then verify that corresponding sides are congruent.\n\n\\[ R(x, y) \\rightarrow R'(y, x) \\]\n\\[ S(x, y) \\rightarrow S'(y, x) \\]\n\\[ T(x, y) \\rightarrow T'(y, x) \\]\n\\[ U(x, y) \\rightarrow U'(y, x) \\]\n\n### Step 4: Reflect a Square in a Horizontal Line\n\nUse the rule for reflection in a horizontal line \\(y = k\\), where \\(k = -2\\). For each vertex \\((x, y)\\), the image is \\((x, 2k - y) = (x, -4 - y)\\).\n\n\\[ K(x, y) \\rightarrow K'(x, -4 - y) \\]\n\\[ L(x, y) \\rightarrow L'(x, -4 - y) \\]\n\\[ M(x, y) \\rightarrow M'(x, -4 - y) \\]\n\\[ N(x, y) \\rightarrow N'(x, -4 - y) \\]\n\nGraph the original square and the reflected square.",
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
                    "## Example 3 — Determine Coordinates After a Reflection\n\nFind the coordinates of a single point after a reflection in a given line without graphing.\n\n### Step 1: Reflect a Point in a Horizontal Line\n\nFor a point \\(S(-7, 1)\\) reflected in the line \\(y = 3\\), apply the rule \\((x, y) \\rightarrow (x, 2k - y)\\) with \\(k = 3\\):\n\n\\[ S(-7, 1) \\rightarrow S'(-7, 2(3) - 1) = S'(-7, 5) \\]\n\n### Step 2: Reflect a Point in a Vertical Line\n\nFor a point \\(Q(6, -4)\\) reflected in the line \\(x = 2\\), apply the rule \\((x, y) \\rightarrow (2h - x, y)\\) with \\(h = 2\\):\n\n\\[ Q(6, -4) \\rightarrow Q'(2(2) - 6, -4) = Q'(-2, -4) \\]",
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
                    "## Example 4 — Apply Reflections to Real-World Problems\n\nUse reflection rules to solve problems involving objects placed on the coordinate plane.\n\n### Step 1: Reflect a Triangular Banner in a Vertical Line\n\nA triangular banner has vertices at \\(P(0, 4)\\), \\(Q(2, 8)\\), and \\(R(-3, 6)\\). To reflect the banner over the line \\(x = 1\\), apply the rule \\((x, y) \\rightarrow (2(1) - x, y) = (2 - x, y)\\) to each vertex:\n\n\\[ P(0, 4) \\rightarrow P'(2 - 0, 4) = P'(2, 4) \\]\n\\[ Q(2, 8) \\rightarrow Q'(2 - 2, 8) = Q'(0, 8) \\]\n\\[ R(-3, 6) \\rightarrow R'(2 - (-3), 6) = R'(5, 6) \\]\n\nPlot the original vertices and the reflected vertices, then draw the image of the banner.\n\n### Step 2: Reflect a Square Sandbox in a Vertical Line\n\nA square sandbox has vertices at \\(D(1, 1)\\), \\(E(1, 6)\\), \\(F(6, 6)\\), and \\(G(6, 1)\\). To reflect the sandbox in the line \\(x = 1\\), apply the rule \\((x, y) \\rightarrow (2(1) - x, y) = (2 - x, y)\\) to each vertex:\n\n\\[ D(1, 1) \\rightarrow D'(2 - 1, 1) = D'(1, 1) \\]\n\\[ E(1, 6) \\rightarrow E'(2 - 1, 6) = E'(1, 6) \\]\n\\[ F(6, 6) \\rightarrow F'(2 - 6, 6) = F'(-4, 6) \\]\n\\[ G(6, 1) \\rightarrow G'(2 - 6, 1) = G'(-4, 1) \\]\n\nNotice that vertices on the line of reflection remain unchanged.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides comprehensive practice with all skills from the lesson. Problems include:\n\n- Determining the coordinates of a point after a reflection in a horizontal line without graphing.\n- Graphing a rectangle and its image after a reflection in a horizontal line, then finding the image coordinates.\n- Graphing a triangle and its image after a reflection in the line \\(y = x\\), then finding the image coordinates.\n- Graphing a triangle and its image after a reflection in the line \\(y = x\\) and verifying the result.\n- Using a diagram to identify the vertices of a triangle, then finding the image after reflection in the line \\(y = x\\).\n- Identifying the line of reflection when given the coordinates of a point and its image.\n- Analyzing a student's claim about whether a figure is a reflection in the line \\(y = x\\) and explaining the error in their reasoning.\n- Creating five points that form the letter M on the coordinate plane, then finding their images under a reflection in the line \\(y = x\\).\n- Describing the process for reflecting a figure in a line when the figure is not on the coordinate plane.\n- Finding the coordinates of the image of a point in the second quadrant after a reflection in the line \\(y = -x\\).\n- Analyzing whether the image of a point reflected in a line is sometimes, always, or never located on the other side of the line of reflection, and justifying the answer.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "13-2-translations",
        title: "Translations",
        description:
          "Students determine whether a transformation is a translation, find translation vectors, apply translations to find image coordinates, and draw images on the coordinate plane.",
        orderIndex: 2,
        phases: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Key Terms\n\n- **Translation** — A rigid transformation that slides every point of a figure the same distance in the same direction.\n- **Translation Vector** — A vector written as \\(\\langle a, b \\rangle\\) that describes a horizontal shift of \\(a\\) units and a vertical shift of \\(b\\) units.\n- **Preimage** — The original figure before a transformation is applied.\n- **Image** — The figure resulting from applying a transformation to the preimage.\n- **Rigid Transformation** — A transformation that preserves side lengths and angle measures.\n- **Composition of Transformations** — The result of applying two or more transformations in sequence.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: What Makes a Transformation a Translation?\n\nStudents examine pairs of figures on the coordinate plane and consider what conditions must be met for one figure to be a translation image of another. Discussions focus on whether corresponding sides remain parallel, whether all points move by the same vector, and how to verify these properties.\n\n**Inquiry Question:**\nHow can you tell whether one figure is a translation image of another without measuring every side and angle?",
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
                    "## Learn: Translations on the Coordinate Plane\n\nA translation moves every point of a figure by the same vector. On the coordinate plane, a point \\((x, y)\\) translated by the vector \\(\\langle a, b \\rangle\\) has an image at \\((x + a, y + b)\\).\n\n### Key Concept: Properties of Translations\n\n- Translations preserve side lengths and angle measures.\n- Corresponding sides of the preimage and image are parallel.\n- Every point shifts by exactly the same vector.\n- The orientation of the figure does not change.\n\n### Key Concept: Finding a Translation Vector\n\nTo find the translation vector that maps a point to its image, subtract the coordinates of the preimage from the image:\n\\[ \\langle a, b \\rangle = \\langle x' - x, y' - y \\rangle \\]",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Determine Whether a Triangle Is a Translation Image\n\nVerify whether a given triangle maps onto another triangle by a translation. If it does, find the translation vector; if not, explain which properties fail.\n\n### Step 1: Compare Corresponding Side Lengths\n\nCheck whether the side lengths of the preimage triangle match the side lengths of the image triangle. If any side length differs, the transformation is not a translation.\n\n### Step 2: Compare Corresponding Angles\n\nVerify that angle measures are preserved. A translation is a rigid transformation, so all angle measures must be equal.\n\n### Step 3: Find the Translation Vector Between Corresponding Vertices\n\nCalculate the vector from one vertex of the preimage to its corresponding vertex in the image:\n\\[ \\langle a, b \\rangle = \\langle x_{J'} - x_J, y_{J'} - y_J \\rangle \\]\n\nRepeat for the other two pairs of corresponding vertices. If all three vectors are identical, the transformation is a translation.\n\n### Step 4: State the Conclusion\n\nIf the vectors match, report the translation vector \\(\\langle a, b \\rangle\\). If they do not match, explain that the transformation is not a translation because not all points shift by the same vector.",
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
                    "## Example 2 — Determine Whether a Quadrilateral Is a Translation Image\n\nApply the same verification process to a quadrilateral. Check side lengths, angle measures, and the consistency of translation vectors between all four pairs of corresponding vertices.\n\n### Step 1: Verify Rigid Transformation Properties\n\nConfirm that corresponding sides and angles of the quadrilateral and its image are congruent.\n\n### Step 2: Compute Vectors for All Pairs of Corresponding Vertices\n\nCalculate the shift vector for each vertex:\n\\[ \\langle a, b \\rangle = \\langle x_{L'} - x_L, y_{L'} - y_L \\rangle \\]\n\\[ \\langle a, b \\rangle = \\langle x_{M'} - x_M, y_{M'} - y_M \\rangle \\]\n\\[ \\langle a, b \\rangle = \\langle x_{N'} - x_N, y_{N'} - y_N \\rangle \\]\n\\[ \\langle a, b \\rangle = \\langle x_{P'} - x_P, y_{P'} - y_P \\rangle \\]\n\n### Step 3: Draw a Conclusion\n\nIf all four vectors are identical, the transformation is a translation with that vector. Otherwise, explain why the transformation fails to be a translation.",
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
                    "## Example 3 — Find Missing Coordinates in a Translation Pattern\n\nGiven a repeating pattern formed by translating a single figure, determine the coordinates of a missing figure that continues the pattern.\n\n### Step 1: Identify the Translation Vector from the Pattern\n\nExamine the coordinates of two consecutive figures in the pattern. Compute the translation vector:\n\\[ \\langle a, b \\rangle = \\langle x_{\\text{next}} - x_{\\text{current}}, y_{\\text{next}} - y_{\\text{current}} \\rangle \\]\n\n### Step 2: Apply the Translation Vector to Find the Missing Figure\n\nUse the identified vector to shift the vertices of the nearest known figure to the location of the missing figure:\n\\[ (x_{\\text{missing}}, y_{\\text{missing}}) = (x_{\\text{known}} + a, y_{\\text{known}} + b) \\]\n\n### Step 3: Verify Consistency\n\nCheck that the computed vertices align with the overall pattern and spacing shown in the diagram.",
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
                    "## Example 4 — Describe a Translation and Apply It to Another Figure\n\nGiven a preimage and its image for one figure on a coordinate plane, describe the translation vector. Then apply the same translation to a second figure and draw its image.\n\n### Step 1: Determine the Translation Vector\n\nSelect a pair of corresponding points from the preimage and image of the first figure. Compute:\n\\[ \\langle a, b \\rangle = \\langle x_{\\text{image}} - x_{\\text{preimage}}, y_{\\text{image}} - y_{\\text{preimage}} \\rangle \\]\n\nDescribe the translation in words (for example, \\(a\\) units right/left and \\(b\\) units up/down).\n\n### Step 2: Apply the Same Translation to the Second Figure\n\nShift every vertex of the second figure by the same vector \\(\\langle a, b \\rangle\\):\n\\[ (x', y') = (x + a, y + b) \\]\n\n### Step 3: Draw the Image\n\nPlot the translated vertices and connect them to form the image of the second figure.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises provide practice with all skills from the lesson: identifying translations, finding translation vectors, computing image coordinates, drawing translated figures, and analyzing properties of translations. Problems include:\n\n- Drawing and labeling the image of a figure after a translation by a given horizontal or vertical shift or by a specified translation vector.\n- Finding the image of a point after applying a translation vector, using the rule \\((x, y) \\to (x + a, y + b)\\).\n- Finding the image of a second point under the same translation that maps a known preimage to its image.\n- Constructing arguments to explain why a given pair of triangles cannot be related by a translation, citing specific properties that fail.\n- Determining whether a triangle is a translation image of another and explaining the reasoning.\n- Writing a translation vector that corresponds to a verbal description of a shift (for example, a given number of units left and up).\n- Describing the single translation that results from reflecting an object across two parallel lines.\n- Classifying statements about translations as always, sometimes, or never true, with justification.\n- Solving a problem about translating a square so that one vertex lands at the origin, choosing the translation vector with the least possible length.\n- Translating a triangle by a given vector, listing the image vertices, and calculating the distance the figure has moved.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "13-3-rotations",
        title: "Rotations",
        description:
          "Students graph the image of a polygon after rotations of 90°, 180°, or 270° about a given point, determine coordinates after rotation, and apply rotation rules to real-world problems.",
        orderIndex: 3,
        phases: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Key Terms\n\n- **Rotation** — A transformation that turns a figure about a fixed point called the center of rotation.\n- **Center of Rotation** — The fixed point about which a figure is rotated.\n- **Angle of Rotation** — The number of degrees a figure is turned about the center of rotation.\n- **Preimage** — The original figure before a transformation is applied.\n- **Image** — The resulting figure after a transformation is applied.\n- **Clockwise** — The direction of rotation that follows the motion of a clock's hands.\n- **Counterclockwise** — The direction of rotation opposite to the motion of a clock's hands.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: What Happens to a Figure When You Turn It Around a Point?\n\nStudents investigate what happens to the coordinates of a figure when it is rotated around a point that is not the origin. They explore whether rotating 180° produces the same result as two 90° rotations, and how the center of rotation affects the image's position.\n\n**Inquiry Question:**\nHow can you find the coordinates of a figure's image after a rotation about any point on the coordinate plane?",
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
                    "## Learn: Rotations About a Given Point\n\nA rotation turns every point of a figure about a fixed center point through a given angle. To rotate a figure about a point other than the origin, translate the center to the origin, apply the rotation rule, then translate back.\n\n### Key Concept: Rotation Rules About the Origin\n\n- **Rotation 180° about the origin:** \\((x, y) \\rightarrow (-x, -y)\\)\n- **Rotation 90° counterclockwise about the origin:** \\((x, y) \\rightarrow (-y, x)\\)\n- **Rotation 270° counterclockwise about the origin:** \\((x, y) \\rightarrow (y, -x)\\)\n- A 90° clockwise rotation is equivalent to a 270° counterclockwise rotation.\n- A 270° clockwise rotation is equivalent to a 90° counterclockwise rotation.\n\n### Key Concept: Rotating About an Arbitrary Point\n\nTo rotate a point \\((x, y)\\) about a center \\((a, b)\\):\n1. Translate by subtracting the center: \\((x - a, y - b)\\)\n2. Apply the rotation rule about the origin.\n3. Translate back by adding the center: add \\((a, b)\\) to the result.\n\nFor example, a 180° rotation about \\((a, b)\\) gives:\n\\[ (x, y) \\rightarrow (2a - x, 2b - y) \\]\n\n### Key Concept: Properties Preserved Under Rotation\n\n- Distance from any point to the center of rotation equals the distance from its image to the center.\n- Side lengths and angle measures are preserved.\n- The figure and its image are congruent.\n- Collinearity and betweenness of points are maintained.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Rotate Polygons About a Given Point\n\nGraph a polygon and its image after a rotation of 180°, 270° counterclockwise, or 90° counterclockwise about a given point. Determine the coordinates of the image vertices using the translate-rotate-translate-back method.\n\n### Step 1: Rotate a Triangle 180° About a Given Point\n\nFor a triangle with vertices at given coordinates, rotate 180° about the point \\((2, -3)\\).\n\nTranslate each vertex by subtracting the center \\((2, -3)\\), apply the 180° rule \\((x, y) \\rightarrow (-x, -y)\\), then add \\((2, -3)\\) back:\n\n\\[ X(0, 2) \\rightarrow (0 - 2, 2 - (-3)) = (-2, 5) \\rightarrow (2, -5) \\rightarrow (2 + 2, -5 + (-3)) = X'(4, -8) \\]\n\n\\[ Y(4, 4) \\rightarrow (4 - 2, 4 - (-3)) = (2, 7) \\rightarrow (-2, -7) \\rightarrow (-2 + 2, -7 + (-3)) = Y'(0, -10) \\]\n\n\\[ Z(3, -1) \\rightarrow (3 - 2, -1 - (-3)) = (1, 2) \\rightarrow (-1, -2) \\rightarrow (-1 + 2, -2 + (-3)) = Z'(1, -5) \\]\n\nGraph the original triangle and the image triangle.\n\n### Step 2: Rotate a Triangle 270° Counterclockwise About a Given Point\n\nFor a triangle with vertices at given coordinates, rotate 270° counterclockwise about the point \\((-4, 2)\\).\n\nTranslate each vertex by subtracting \\((-4, 2)\\), apply the 270° counterclockwise rule \\((x, y) \\rightarrow (y, -x)\\), then add \\((-4, 2)\\) back:\n\n\\[ A(1, 7) \\rightarrow (1 - (-4), 7 - 2) = (5, 5) \\rightarrow (5, -5) \\rightarrow (5 + (-4), -5 + 2) = A'(1, -3) \\]\n\n\\[ B(3, 2) \\rightarrow (3 - (-4), 2 - 2) = (7, 0) \\rightarrow (0, -7) \\rightarrow (0 + (-4), -7 + 2) = B'(-4, -5) \\]\n\n\\[ C(-2, -2) \\rightarrow (-2 - (-4), -2 - 2) = (2, -4) \\rightarrow (-4, -2) \\rightarrow (-4 + (-4), -2 + 2) = C'(-8, 0) \\]\n\nGraph the original triangle and the image triangle.\n\n### Step 3: Rotate Another Triangle 180° About a Different Point\n\nApply the same 180° rotation method from Step 1 to a triangle with given vertices about the point \\((-3, -6)\\).\n\nTranslate each vertex by subtracting \\((-3, -6)\\), apply \\((x, y) \\rightarrow (-x, -y)\\), then add \\((-3, -6)\\) back to find the image coordinates. Graph both triangles.\n\n### Step 4: Rotate a Quadrilateral 90° Counterclockwise About a Given Point\n\nFor a quadrilateral with vertices at given coordinates, rotate 90° counterclockwise about the point \\((-1, 2)\\).\n\nTranslate each vertex by subtracting \\((-1, 2)\\), apply the 90° counterclockwise rule \\((x, y) \\rightarrow (-y, x)\\), then add \\((-1, 2)\\) back:\n\n\\[ A(-2, 4) \\rightarrow (-2 - (-1), 4 - 2) = (-1, 2) \\rightarrow (-2, -1) \\rightarrow (-2 + (-1), -1 + 2) = A'(-3, 1) \\]\n\n\\[ B(1, 3) \\rightarrow (1 - (-1), 3 - 2) = (2, 1) \\rightarrow (-1, 2) \\rightarrow (-1 + (-1), 2 + 2) = B'(-2, 4) \\]\n\n\\[ C(2, -3) \\rightarrow (2 - (-1), -3 - 2) = (3, -5) \\rightarrow (5, 3) \\rightarrow (5 + (-1), 3 + 2) = C'(4, 5) \\]\n\n\\[ D(-3, -1) \\rightarrow (-3 - (-1), -1 - 2) = (-2, -3) \\rightarrow (3, -2) \\rightarrow (3 + (-1), -2 + 2) = D'(2, 0) \\]\n\nGraph the original quadrilateral and the image quadrilateral.\n\n### Step 5: Apply Rotation to a Real-World Scale Drawing\n\nA scale drawing of a baseball field has home plate, first base, second base, and third base at given coordinates on the coordinate plane. Rotate the entire field 270° counterclockwise about second base.\n\nTranslate each base by subtracting the coordinates of second base, apply the 270° counterclockwise rule \\((x, y) \\rightarrow (y, -x)\\), then add the coordinates of second base back to find the new position of each base.\n\nFor example, if home plate is at \\((3, 3)\\) and second base is at \\((13, 13)\\):\n\\[ (3, 3) \\rightarrow (3 - 13, 3 - 13) = (-10, -10) \\rightarrow (-10, 10) \\rightarrow (-10 + 13, 10 + 13) = (3, 23) \\]\n\nRepeat for the remaining bases to find their new coordinates.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice with all skills from the lesson. Problems include:\n\n- Finding the coordinates of a point after a 270° clockwise rotation about a given point.\n- Finding the coordinates of a single vertex of a parallelogram after the parallelogram is rotated 270° counterclockwise about a given point.\n- Using a protractor and ruler to draw the image of a triangle after a rotation of 210° about a given point.\n- Finding the endpoints of a line segment after a 90° counterclockwise rotation about a given point.\n- Solving a real-world compass problem by determining the angle of rotation from a damaged compass reading to true north.\n- Determining how many times a repeated rotation of a circular dial returns it to its original position.\n- Finding the image of a point under a rotation about the origin when given the image of another point under the same rotation.\n- Drawing a right triangle and a point not on the triangle, rotating the triangle 90° counterclockwise about the point, and finding an equivalent clockwise rotation.\n- Analyzing the distance from a rotated vertex to the center of rotation and the measure of the angle formed by a vertex, the center, and its image.\n- Analyzing what happens when two rotations are applied in sequence about the same center.\n- Evaluating a student's claim about whether two reflections are equivalent to a rotation and explaining the error.\n- Listing and explaining the properties of a figure that are preserved under a rotation.\n- Evaluating a student's claim about the angle of rotation based on congruent triangles and explaining the error.\n- Analyzing whether collinearity and betweenness of points are maintained under rotations.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "13-4-compositions-of-transformations",
        title: "Compositions of Transformations",
        description:
          "Students graph images after glide reflections and other compositions, identify single transformations equivalent to compositions of reflections, and determine congruence.",
        orderIndex: 4,
        phases: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Key Terms\n\n- **Composition of Transformations** — A transformation that consists of two or more transformations performed in sequence.\n- **Glide Reflection** — A composition of a translation followed by a reflection in a line parallel to the direction of the translation.\n- **Preimage** — The original figure before a transformation is applied.\n- **Image** — The resulting figure after a transformation is applied.\n- **Isometry** — A transformation that preserves distance and angle measure; a rigid transformation.\n- **Congruent** — Having the same size and shape.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: What Happens When You Apply Two Transformations in a Row?\n\nStudents investigate what happens to a figure when two transformations are applied sequentially. They explore whether reflecting a figure and then rotating it produces the same result as rotating first and then reflecting, and how the order affects the final position.\n\n**Inquiry Question:**\nHow does the order of transformations affect the final image of a composition?",
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
                    "## Learn: Compositions of Transformations\n\nA composition of transformations applies two or more transformations in sequence. The image of the first transformation becomes the preimage for the second. A glide reflection is a special composition of a translation followed by a reflection.\n\n### Key Concept: Glide Reflection\n\nA glide reflection is a composition of a translation along a vector followed by a reflection in a line parallel to that vector.\n\n### Key Concept: Composition of Two Reflections\n\n- If a figure is reflected in two parallel lines, the composition is equivalent to a translation perpendicular to the lines. The distance of the translation is twice the distance between the two lines.\n- If a figure is reflected in two intersecting lines, the composition is equivalent to a rotation about the point of intersection. The angle of rotation is twice the angle between the two lines.\n\n### Key Concept: Order of Transformations\n\nIn general, the order in which transformations are applied matters. A composition of transformation A followed by transformation B is not always the same as B followed by A.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Graph the Image of a Figure Under a Glide Reflection\n\nGraph a figure and its image after a glide reflection, which consists of a translation followed by a reflection.\n\n### Step 1: Translate and Reflect a Triangle\n\nFor a triangle with given vertices, first apply the translation vector to each vertex. Then reflect the translated vertices in the given line.\n\nFor a translation along \\( \\langle a, b \\rangle \\) followed by a reflection in the x-axis:\n\\[ (x, y) \\rightarrow (x + a, y + b) \\rightarrow (x + a, -(y + b)) \\]\n\n### Step 2: Apply Glide Reflections with Different Parameters\n\nRepeat the process for other triangles using different translation vectors and different lines of reflection, including reflections in the x-axis and the line \\(y = x\\).",
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
                    "## Example 2 — Graph the Image of a Figure Under a Composition of Transformations\n\nGraph a line segment and its image after a composition of two transformations such as a reflection followed by a rotation, a rotation followed by a translation, or a translation followed by a reflection.\n\n### Step 1: Reflect Then Rotate\n\nFor a line segment with given endpoints, first reflect each endpoint in the given line. Then rotate each reflected endpoint about the origin by the given angle.\n\nFor example, reflect in the x-axis then rotate \\(90^{\\circ}\\) about the origin:\n\\[ (x, y) \\rightarrow (x, -y) \\rightarrow (y, x) \\]\n\n### Step 2: Rotate Then Translate\n\nFor a line segment with given endpoints, first rotate each endpoint about the origin by the given angle. Then apply the translation vector to each rotated endpoint.\n\nFor example, rotate \\(90^{\\circ}\\) about the origin then translate along \\( \\langle a, b \\rangle \\):\n\\[ (x, y) \\rightarrow (-y, x) \\rightarrow (-y + a, x + b) \\]\n\n### Step 3: Apply Different Compositions\n\nRepeat the process for other line segments using different pairs of transformations, including reflections in the x-axis or y-axis, rotations of \\(90^{\\circ}\\) or \\(180^{\\circ}\\) about the origin, and translations along various vectors.",
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
                    "## Example 3 — Identify a Single Transformation Equivalent to Two Reflections\n\nGiven a figure and two reflection lines, reflect the figure in the first line and then in the second line. Describe the single transformation that maps the original figure onto the final image.\n\n### Step 1: Reflect in Two Parallel Lines\n\nReflect a figure in line u and then in line v, where u and v are parallel. The composition is equivalent to a translation perpendicular to the lines. Determine the direction and distance of this translation.\n\n### Step 2: Reflect in Two Intersecting Lines\n\nReflect a figure in line u and then in line v, where u and v intersect. The composition is equivalent to a rotation about the point of intersection. Determine the angle and direction of this rotation.",
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
                    "## Example 4 — Determine Congruence and Find a Composition of Transformations\n\nGiven two triangles on the coordinate plane, determine whether they are congruent. If they are, identify a sequence of transformations that maps one triangle onto the other.\n\n### Step 1: Verify Congruence\n\nCompare the side lengths and angle measures of the two triangles. If all corresponding parts are congruent, the triangles are congruent.\n\n### Step 2: Identify the Composition\n\nFind a sequence of transformations (such as a translation followed by a rotation, or a reflection followed by a translation) that maps each vertex of the first triangle onto the corresponding vertex of the second triangle.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Worked Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Describe Transformations in a Pattern\n\nAnalyze a decorative border or repeating pattern and describe the transformations that are combined to create it.\n\n### Step 1: Analyze a Border Pattern\n\nIdentify the basic unit of the pattern and describe how it is repeated using transformations such as translations, reflections, or rotations.\n\n### Step 2: Analyze a Tessellation Pattern\n\nIdentify the basic unit of the pattern and describe the composition of transformations that creates the overall design.",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice with all skills from the lesson. Problems include:\n\n- Drawing and labeling the image of a figure after a composition of a rotation and a translation, or a reflection and a rotation.\n- Determining the coordinates of a preimage given the image and the composition of transformations that produced it.\n- Finding the single translation equivalent to reflecting a point over two parallel lines that are a given distance apart.\n- Determining whether statements about compositions are always, sometimes, or never true, and justifying the argument.\n- Writing a paragraph proof for the Composition of Isometries Theorem.\n- Writing a two-column proof for a theorem about reflections in parallel lines.\n- Analyzing whether the order of a rotation and a reflection affects the final image.\n- Finding and explaining errors in reasoning about whether a given composition is a glide reflection.\n- Finding the coordinates of a quadrilateral after three transformations.\n- Analyzing whether the order of two reflections affects the final image.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "13-5-tessellations",
        title: "Tessellations",
        description:
          "Students determine whether regular polygons tessellate the plane, analyze semiregular uniform tessellations, classify tessellation patterns, and describe transformations used to create tessellations.",
        orderIndex: 5,
        phases: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Key Terms\n\n- **Tessellation** — A repeating pattern of figures that completely covers a plane without gaps or overlaps.\n- **Regular Tessellation** — A tessellation formed by only one type of regular polygon.\n- **Semiregular Tessellation** — A tessellation formed by two or more regular polygons arranged in the same pattern at each vertex.\n- **Uniform Tessellation** — A tessellation in which the same combination of shapes and angles meets at every vertex.\n- **Interior Angle** — The angle formed inside a polygon at each vertex by two adjacent sides.\n- **Vertex** — A point where two or more edges of a polygon meet; in a tessellation, the point where the corners of the shapes come together.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: Which Shapes Can Cover a Plane Without Gaps?\n\nStudents consider how regular polygons fit together around a point and what conditions must be met for them to cover a plane completely without overlapping or leaving gaps.\n\n**Inquiry Question:**\nWhy do only certain regular polygons tessellate the plane, and what role does angle measure play?",
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
                    "## Learn: Tessellations of the Plane\n\nA tessellation is created when a shape (or combination of shapes) is repeated to cover a plane with no gaps and no overlaps. Whether a regular polygon tessellates depends on whether its interior angle is a factor of 360 degrees.\n\n### Key Concept: Regular Polygon Tessellations\n\n- The interior angle of a regular n-gon is given by:\n\\[ \\frac{(n - 2) \\times 180^{\\circ}}{n} \\]\n- A regular polygon tessellates the plane if and only if its interior angle measure divides evenly into 360 degrees.\n- Only three regular polygons tessellate the plane: the equilateral triangle, the square, and the regular hexagon.\n\n### Key Concept: Semiregular and Uniform Tessellations\n\n- A semiregular tessellation combines two or more different regular polygons.\n- For a semiregular tessellation to be uniform, the same combination of polygons must meet at every vertex, and the sum of the interior angles at each vertex must equal 360 degrees.\n- If the arrangement of polygons differs from vertex to vertex, the tessellation is not uniform.\n\n### Key Concept: Tessellations from General Figures\n\n- Any triangle or quadrilateral can tessellate the plane.\n- Certain other polygons (such as some hexagons) can also tessellate depending on their angle measures and side lengths.\n- Common transformations used to create tessellations include translations, reflections, and rotations.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Determine Whether Regular Polygons Tessellate\n\nUse the interior angle measure to decide whether a given regular polygon can tessellate the plane, and explain the reasoning.\n\n### Step 1: Find the Interior Angle\n\nApply the interior angle formula for a regular n-gon.\n\nFor a regular pentagon (\\[n = 5\\]):\n\\[ \\frac{(5 - 2) \\times 180^{\\circ}}{5} = \\frac{540^{\\circ}}{5} = 108^{\\circ} \\]\n\nFor a regular hexagon (\\[n = 6\\]):\n\\[ \\frac{(6 - 2) \\times 180^{\\circ}}{6} = \\frac{720^{\\circ}}{6} = 120^{\\circ} \\]\n\nFor a regular 9-gon (\\[n = 9\\]):\n\\[ \\frac{(9 - 2) \\times 180^{\\circ}}{9} = \\frac{1260^{\\circ}}{9} = 140^{\\circ} \\]\n\n### Step 2: Check Divisibility Into 360 Degrees\n\nDetermine whether the interior angle divides evenly into 360 degrees.\n\nFor the pentagon:\n\\[ 360^{\\circ} \\div 108^{\\circ} = 3.\\overline{3} \\]\nThe result is not a whole number, so a regular pentagon does not tessellate.\n\nFor the hexagon:\n\\[ 360^{\\circ} \\div 120^{\\circ} = 3 \\]\nThe result is a whole number, so regular hexagons tessellate the plane (three meet at each vertex).\n\nFor the 9-gon:\n\\[ 360^{\\circ} \\div 140^{\\circ} = 2.\\overline{571428} \\]\nThe result is not a whole number, so a regular 9-gon does not tessellate.",
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
                    "## Example 2 — Determine Whether Semiregular Uniform Tessellations Exist\n\nGiven two types of regular polygons (with all sides equal to 1 unit), determine whether a semiregular uniform tessellation can be formed. If so, find how many of each shape meet at each vertex.\n\n### Step 1: Identify the Interior Angles\n\nList the interior angle measures of the given polygons.\n\n- Regular pentagon interior angle: \\(108^{\\circ}\\)\n- Square interior angle: \\(90^{\\circ}\\)\n- Regular hexagon interior angle: \\(120^{\\circ}\\)\n- Equilateral triangle interior angle: \\(60^{\\circ}\\)\n\n### Step 2: Test Combinations That Sum to 360 Degrees\n\nFind a combination of the given polygons whose interior angles sum to exactly 360 degrees.\n\nFor regular pentagons and squares:\n\\[ 108^{\\circ} + 108^{\\circ} + 90^{\\circ} + 90^{\\circ} = 396^{\\circ} \\]\n\\[ 108^{\\circ} + 90^{\\circ} + 90^{\\circ} + 90^{\\circ} = 378^{\\circ} \\]\nNo combination of pentagons and squares sums to exactly 360 degrees, so no semiregular uniform tessellation exists using these two shapes.\n\nFor regular hexagons and equilateral triangles:\n\\[ 120^{\\circ} + 120^{\\circ} + 60^{\\circ} + 60^{\\circ} = 360^{\\circ} \\]\nThis combination works: two hexagons and two triangles meet at each vertex. Therefore, a semiregular uniform tessellation exists.",
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
                    "## Example 3 — Classify Tessellation Patterns\n\nExamine a given pattern to determine whether it is a tessellation, and if so, classify it as uniform, not uniform, regular, not regular, or semiregular.\n\n### Step 1: Verify It Is a Tessellation\n\nCheck that the pattern covers the plane completely with no gaps and no overlaps.\n\n### Step 2: Check for Uniformity\n\nDetermine whether the same arrangement of shapes meets at every vertex. If every vertex looks identical, the pattern is uniform. If vertices differ, it is not uniform.\n\n### Step 3: Check for Regularity\n\nDetermine whether the tessellation uses only one type of regular polygon. If so, it is regular. If it uses more than one type of regular polygon, it is semiregular. If the shapes are not all regular polygons, the tessellation is not regular.",
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
                    "## Example 4 — Tessellations from General Figures\n\nDetermine whether a tessellation can be created from a given non-regular figure, describe the transformation(s) that can be used, and justify the reasoning.\n\n### Step 1: Consider Triangles and Quadrilaterals\n\nAny triangle can tessellate the plane. Copies of the triangle can be arranged by translations and rotations so that angles summing to 180 degrees meet along a straight line, and pairs of triangles form a parallelogram that tiles by translation.\n\nFor a scalene triangle:\n\\[ 180^{\\circ} + 180^{\\circ} = 360^{\\circ} \\]\nTwo copies of the triangle placed together form a parallelogram, which tessellates by translations.\n\n### Step 2: Consider Special Quadrilaterals\n\nA rhombus is a parallelogram, and all parallelograms tessellate by translations.\n\nFor a parallelogram:\n\\[ \\text{opposite angles are equal, and consecutive angles are supplementary} \\]\nTranslations along the sides of the parallelogram produce a tessellation.\n\n### Step 3: Consider Polygons with More Than Four Sides\n\nA regular dodecagon has an interior angle of 150 degrees:\n\\[ \\frac{(12 - 2) \\times 180^{\\circ}}{12} = 150^{\\circ} \\]\nSince 360 divided by 150 is not a whole number, regular dodecagons do not tessellate by themselves. However, a dodecagon can be part of a semiregular tessellation when combined with other polygons whose angles complement it to 360 degrees.\n\nA regular 15-gon has an interior angle of:\n\\[ \\frac{(15 - 2) \\times 180^{\\circ}}{15} = 156^{\\circ} \\]\nSince 360 divided by 156 is not a whole number, a regular 15-gon never tessellates the plane by itself.\n\n### Step 4: Describe Transformations\n\nWhen a figure tessellates, identify the specific rigid transformations used:\n\n- **Translations** — slide copies of the figure without rotating or flipping.\n- **Reflections** — flip copies across a line.\n- **Rotations** — turn copies around a vertex or the midpoint of a side.\n\nFor an isosceles trapezoid, rotate a copy 180 degrees around the midpoint of a leg to form a hexagon-like shape, then translate that combined unit to tile the plane.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson:\n\n- Determining the transformation(s) used to create a tessellation from a given pattern.\n- Applying the interior angle criterion to select a single shape of regular polygon paving stones that will form a solid floor.\n- Describing the transformations that can be used to tessellate a custom figure (such as a heart-shaped puzzle piece).\n- Evaluating a conjecture about whether a regular polygon with a 180-degree interior angle tessellates, and explaining the flaw in the reasoning.\n- Creating an original tessellation using translations or rotations.\n- Writing a precise verbal description of what a tessellation is.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "13-6-symmetry",
        title: "Symmetry",
        description:
          "Students identify and draw lines of symmetry, determine rotational symmetry and its order/magnitude, locate centers of symmetry, and apply symmetry understanding to real-world objects.",
        orderIndex: 6,
        phases: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Key Terms\n\n- **Line of Symmetry** — A line that divides a figure into two congruent halves that are mirror images of each other.\n- **Rotational Symmetry** — A property of a figure that can be rotated less than 360° about a central point and map onto itself.\n- **Center of Symmetry** — The fixed point about which a figure with rotational symmetry is rotated.\n- **Order of Symmetry** — The number of times a figure maps onto itself during one complete 360° rotation.\n- **Magnitude of Symmetry** — The smallest angle through which a figure can be rotated to map onto itself, calculated as \\(360^{\\circ} \\div \\text{order}\\).",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: When Does a Figure Look the Same After Turning or Flipping?\n\nStudents examine everyday objects and geometric shapes to notice when a figure can be folded so that the two halves match, or when a figure looks unchanged after being rotated partway around a point.\n\n**Inquiry Question:**\nCan a figure have both line symmetry and rotational symmetry? Can it have one but not the other?",
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
                    "## Learn: Line Symmetry and Rotational Symmetry\n\nSymmetry describes the ways a figure can be transformed and still look the same. Line symmetry involves reflection across a line; rotational symmetry involves rotation around a point.\n\n### Key Concept: Line Symmetry\n\n- A figure has line symmetry if there exists at least one line that divides the figure into two matching halves.\n- Some figures have no lines of symmetry, some have exactly one, and others have multiple lines of symmetry.\n- Regular polygons have the same number of lines of symmetry as they have sides.\n\n### Key Concept: Rotational Symmetry\n\n- A figure has rotational symmetry if it maps onto itself after a rotation of less than 360° around its center.\n- The order of symmetry is the count of distinct positions in which the figure looks identical during a full rotation.\n- The magnitude of symmetry is found by dividing 360° by the order.\n- A figure with 180° rotational symmetry has order 2 and is also called point symmetric.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Identify and Draw Lines of Symmetry\n\nDetermine whether each figure has a line of symmetry. For figures that do, draw the line(s) of symmetry and state the total count.\n\n### Step 1: Test for a Vertical Line of Symmetry\n\nImagine folding the figure vertically. If the left half matches the right half exactly, the figure has a vertical line of symmetry.\n\n### Step 2: Test for a Horizontal Line of Symmetry\n\nImagine folding the figure horizontally. If the top half matches the bottom half exactly, the figure has a horizontal line of symmetry.\n\n### Step 3: Test for Diagonal Lines of Symmetry\n\nFor some figures, especially squares and regular polygons, check whether a diagonal fold produces matching halves.\n\n### Step 4: Count All Lines of Symmetry\n\nRecord the total number of distinct lines of symmetry found for each figure.",
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
                    "## Example 2 — Determine Rotational Symmetry in Real-World Objects\n\nAnalyze real-world objects and symbols to decide whether each has rotational symmetry, then explain the reasoning.\n\n### Step 1: Identify the Center Point\n\nLocate the approximate center of the object or symbol.\n\n### Step 2: Mentally Rotate the Figure\n\nImagine turning the figure around its center by various angles less than 360°.\n\n### Step 3: Check for Self-Coincidence\n\nDetermine whether the rotated figure looks identical to the original. If it matches at any angle other than 360°, the figure has rotational symmetry.\n\n### Step 4: Explain the Conclusion\n\nState clearly whether the object has rotational symmetry and describe the evidence that supports the answer.",
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
                    "## Example 3 — Order and Magnitude of Rotational Symmetry\n\nDetermine whether each figure has rotational symmetry. If so, locate the center of symmetry and state the order and magnitude.\n\n### Step 1: Locate the Center of Symmetry\n\nFind the point around which the figure appears balanced. For regular shapes, this is often the geometric center.\n\n### Step 2: Determine the Order\n\nCount how many times the figure maps onto itself during one complete 360° rotation.\n\n### Step 3: Calculate the Magnitude\n\nUse the formula:\n\\[ \\text{magnitude} = 360^{\\circ} \\div \\text{order} \\]\n\n### Step 4: State the Results\n\nRecord the center location, the order, and the magnitude for each figure that has rotational symmetry.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises section provides comprehensive practice with all symmetry skills from the lesson. Problems include:\n\n- Drawing all lines of symmetry for a given figure and locating its center of symmetry.\n- Determining the order and magnitude of rotational symmetry for a given figure.\n- Examining capital letters of the alphabet to identify which have 180° rotational symmetry about their center.\n- Finding the regular polygon that corresponds to a given order and magnitude of symmetry.\n- Analyzing the symmetry of a circle, including its infinite lines of symmetry and its order of rotation.\n- Determining whether named polygons (equilateral triangle, scalene triangle, regular hexagon) have rotational symmetry and describing their order and magnitude when applicable.\n- Constructing a three-dimensional object whose base has line symmetry.\n- Creating and describing an object that has at least one line of symmetry.\n- Analyzing a gallery floor plan to describe every reflection or rotation that maps the plan onto itself.\n- Finding the number of sides of a regular polygon given its magnitude of symmetry.\n- Evaluating student arguments about whether a figure has line symmetry, rotational symmetry, both, or neither.\n- Finding possible vertices for a quadrilateral with exactly two given lines of symmetry and graphing the figure.\n- Drawing a figure that has line symmetry but not rotational symmetry and explaining why.\n- Writing about the relationship between line symmetry and rotational symmetry.",
                },
              },
            ],
          },
        ],
      },
    ];

    let lessonsSeeded = 0;
    let lessonVersionsCreated = 0;
    let phasesCreated = 0;

    for (const lessonData of lessonsData) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lessonData.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 13,
            title: lessonData.title,
            slug: lessonData.slug,
            description: lessonData.description,
            orderIndex: lessonData.orderIndex,
            createdAt: now,
            updatedAt: now,
          });

      if (!existingLesson) {
        lessonsSeeded++;
      }

      const existingLessonVersion = await ctx.db
        .query("lesson_versions")
        .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
        .first();

      const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
        ? existingLessonVersion._id
        : await ctx.db.insert("lesson_versions", {
            lessonId,
            version: 1,
            title: lessonData.title,
            description: lessonData.description,
            status: "published",
            createdAt: now,
          });

      if (!existingLessonVersion) {
        lessonVersionsCreated++;
      }

      for (const phase of lessonData.phases) {
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

        phasesCreated++;

        for (const section of phase.sections) {
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

    return {
      lessonsSeeded,
      lessonVersionsCreated,
      phasesCreated,
    };
  },
});