import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule2Result {
  lessons: {
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    phasesCreated: number;
    activitiesCreated: number;
    slug: string;
  }[];
}

const lessonConfigs = [
  {
    slug: "module-2-lesson-1",
    title: "Angles of Polygons",
    description: "Students find the sum of interior and exterior angles of polygons and solve problems involving regular polygons.",
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
              markdown: "## Explore: Interior and Exterior Angles\n\nStudents investigate the relationship between the number of sides in a polygon and the sum of its interior angles. They also explore how exterior angles behave regardless of the number of sides.\n\n**Inquiry Question:**\nIf you know the number of sides of a regular polygon, how can you find the measure of each interior angle?",
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
              markdown: "## Key Terms\n\n- **Interior Angle** — An angle inside a polygon at one of its vertices.\n- **Exterior Angle** — An angle formed by one side of a polygon and the extension of an adjacent side.\n- **Regular Polygon** — A polygon with all sides congruent and all interior angles congruent.\n- **Polygon Interior Angles Sum Theorem** — The sum of the interior angles of a convex n-gon is $[(n - 2) \\times 180]$ degrees.\n- **Polygon Exterior Angles Sum Theorem** — The sum of the exterior angles of any convex polygon is 360 degrees.",
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
              markdown: "## Angles of Polygons\n\n### Key Concept: Interior Angle Sum\n\nThe sum of the measures of the interior angles of a convex n-gon is:\n\n$$S = (n - 2) \\times 180$$\n\nFor a regular polygon, each interior angle measures:\n\n$$A = \\frac{(n - 2) \\times 180}{n}$$\n\n### Key Concept: Exterior Angle Sum\n\nThe sum of the measures of the exterior angles of any convex polygon is always 360 degrees, regardless of the number of sides.\n\nEach exterior angle of a regular n-gon measures:\n\n$$E = \\frac{360}{n}$$",
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
              markdown: "## Example 1 — Find Measures of Interior Angles\n\nUse the Polygon Interior Angles Sum Theorem to find the measure of each interior angle of given regular polygons shown in diagrams.\n\n### Step 1: Apply the Interior Angle Formula\n\nFor a regular polygon with n sides, substitute n into the formula for each interior angle. Use given diagrams to identify the polygon and count the number of sides.\n\n### Step 2: Verify with the Sum Formula\n\nCheck that the sum of all interior angles equals $[(n - 2) \\times 180]$ by adding the individual angle measures.",
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
              markdown: "## Example 2 — Apply Interior Angles to Real Polygons\n\nUse knowledge of interior angles to solve applied problems involving regular polygons found in architecture and real-world contexts.\n\n### Step 1: Identify the Polygon Type\n\nDetermine the number of sides from the context (octagon has 8 sides, dodecagon has 12 sides, heptagon has 7 sides).\n\n### Step 2: Calculate the Interior Angle\n\nFor a regular octagon, the measure of the angle formed by two consecutive walls is found by computing the interior angle measure using the formula.",
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
              markdown: "## Example 3 — Find Number of Sides Given Interior Angle\n\nGiven the measure of one interior angle of a regular polygon, find the number of sides.\n\n### Step 1: Set Up the Equation\n\nUse the formula for a regular polygon's interior angle:\n\n$$A = \\frac{(n - 2) \\times 180}{n}$$\n\nSubstitute the given angle measure for A and solve for n.\n\n### Step 2: Solve for n\n\nMultiply both sides by n, expand, and isolate n to find the number of sides.",
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
              markdown: "## Example 4 — Find Unknown Values in Diagrams\n\nSolve for unknown variables in polygon diagrams using angle relationships and the interior angle sum theorem.\n\n### Step 1: Write Equations\n\nUse the interior angle sum to write an equation involving the unknown variable.\n\n### Step 2: Solve the Equation\n\nSolve for the unknown, then substitute back to find the angle measures.",
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
              markdown: "## Example 5 — Find Exterior Angle Measures\n\nFind the measure of each exterior angle of given regular polygons.\n\n### Step 1: Apply the Exterior Angle Formula\n\nFor a regular n-gon, each exterior angle measures:\n\n$$E = \\frac{360}{n}$$\n\n### Step 2: Calculate for Each Polygon\n\nSubstitute the number of sides (pentagon = 5, 15-gon = 15, hexagon = 6, etc.) to find each exterior angle measure.",
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
              markdown: "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson. Problems include:\n\n- Finding measures of both exterior and interior angles of regular polygons with 7, 13, and 14 sides.\n- Solving for unknowns in convex polygons: an octagon with angles expressed as $(x + 55)$, $(3x + 20)$, $4x$, and other expressions; a hexagon with angles $(5x - 103)$, $(2x + 60)$, $(7x - 31)$, and more.\n- Finding interior angles of a decagon and a pentagon (ABCDE) when angles are expressed algebraically.\n- Writing paragraph proofs for the Polygon Interior Angles Sum Theorem and a proof using algebra for the Polygon Exterior Angles Sum Theorem.\n- Finding how many sides a polygon has given that its interior angle is 24 more than 38 times its exterior angle.\n- Using angle measures from unearthed castle walls to determine the actual number of sides of the original polygon.\n- Designing a regular polygon where interior angles are half the measure of exterior angles.\n- Finding the sum of interior angles of a quadrilateral (one face of turquoise crystal).\n- Solving for unknown angles in a hexagon where three angles measure 140, one measures 84, and the remaining two have a 3:1 ratio.\n- Determining whether the sum of exterior angles of a decagon is greater than that of a heptagon.\n- Writing an explanation of how triangles relate to the Polygon Interior Angles Sum Theorem.\n- Creating a polygon and finding its interior angles sum, then determining how many sides a polygon with twice that sum would have.\n- Finding values a, b, and c in a regular hexagon QRSTVX and justifying each step.\n- Analyzing whether extending two sides of a regular hexagon always, sometimes, or never produces an equilateral triangle.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-2-lesson-2",
    title: "Parallelograms",
    description: "Students use properties of parallelograms to find angle measures and side lengths, and write proofs involving parallelogram theorems.",
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
              markdown: "## Explore: Properties of Parallelograms\n\nStudents investigate the unique properties of parallelograms and how these properties relate to the shapes of gates, supports, and other real-world structures.\n\n**Inquiry Question:**\nWhat relationships exist between the sides, angles, and diagonals of a parallelogram?",
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
              markdown: "## Key Terms\n\n- **Parallelogram** — A quadrilateral with both pairs of opposite sides parallel.\n- **Opposite Sides** — Two sides of a parallelogram that do not share a vertex.\n- **Opposite Angles** — Two angles of a parallelogram that do not share a vertex.\n- **Consecutive Angles** — Two angles of a parallelogram that share a side.\n- **Diagonal** — A segment connecting two non-adjacent vertices of a polygon.",
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
              markdown: "## Parallelograms\n\n### Key Concept: Properties of Parallelograms\n\n- Both pairs of opposite sides are parallel and congruent.\n- Both pairs of opposite angles are congruent.\n- Consecutive angles are supplementary.\n- The diagonals bisect each other.\n\n### Key Concept: Using Diagonal Properties\n\nThe diagonals of a parallelogram bisect each other, meaning they cut each other into two equal segments. This property can be used to find unknown lengths.",
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
              markdown: "## Example 1 — Find Measures in a Parallelogram\n\nUse parallelogram properties to find unknown angle measures and side lengths.\n\n### Step 1: Use Opposite Angle Congruence\n\nIn parallelogram PQRS, opposite angles are congruent, so $m\\angle R = m\\angle P$ and $m\\angle Q = m\\angle S$. Use this to find missing angle measures.\n\n### Step 2: Use Parallel Side Congruence\n\nOpposite sides of a parallelogram are congruent. Use this to find the length of QR or QP when given a diagram with measurements.",
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
              markdown: "## Example 2 — Write Parallelogram Proofs\n\nWrite two-column and paragraph proofs to prove statements about parallelograms using established theorems.\n\n### Step 1: Identify Given Information\n\nNote the parallelogram stated in the problem and any additional congruent segments or angles provided.\n\n### Step 2: Plan the Proof Steps\n\nUse properties of parallelograms (opposite sides parallel, opposite angles congruent, consecutive angles supplementary) to build a logical chain of reasoning.\n\n### Step 3: Write the Proof\n\nPresent the proof in two-column format with statements and reasons, or as a coherent paragraph.",
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
              markdown: "## Example 3 — Find Unknown Values in Parallelograms\n\nSolve for variables in parallelogram diagrams using angle and side relationships.\n\n### Step 1: Set Up Equations\n\nUse the property that opposite angles are congruent and consecutive angles are supplementary to write equations involving the unknown variables.\n\n### Step 2: Solve the Equations\n\nSolve for each variable, then substitute to find angle measures or side lengths.",
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
              markdown: "## Example 4 — Area and Perimeter of Parallelograms\n\nCalculate the area and perimeter of parallelograms in real-world contexts like park design and cookie cutting.\n\n### Step 1: Find Perimeter\n\nAdd all four side lengths. Since opposite sides are congruent, perimeter = 2(length + width).\n\n### Step 2: Find Area\n\nThe area of a parallelogram is $A = base \\times height$, where the height is the perpendicular distance between the parallel sides.",
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
              markdown: "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson. Problems include:\n\n- Writing two-column proofs for Theorem 7.3 (opposite sides congruent), Theorem 7.7 (diagonal bisectors), Theorem 7.5 (consecutive angles supplementary), and Theorem 7.8 (diagonal triangles congruent).\n- Finding values x and y, angle measures $m\\angle AFB$, $m\\angle DAC$, $m\\angle ACD$, and $m\\angle DAB$ in a parallelogram diagram.\n- Using the Distance Formula to verify whether diagonals of JKLM bisect each other, checking if diagonals are congruent, and using slopes to determine if consecutive sides are perpendicular.\n- Creating a Venn diagram showing the relationship between squares, rectangles, and parallelograms.\n- Finding the perimeter of parallelogram ABCD given side length expressions and solving for unknown variables.\n- Explaining why parallelograms are always quadrilaterals but quadrilaterals are sometimes parallelograms.\n- Summarizing all properties of sides, angles, and diagonals of a parallelogram.\n- Providing an example showing that parallelograms with congruent corresponding sides are not always congruent.\n- Finding $m\\angle 1$ and $m\\angle 10$ in a geometric figure and justifying the reasoning.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-2-lesson-3",
    title: "Tests for Parallelograms",
    description: "Students determine whether a quadrilateral is a parallelogram using side, angle, and diagonal properties, and use coordinate geometry to verify parallelograms.",
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
              markdown: "## Explore: How Do We Know It's a Parallelogram?\n\nStudents explore the minimum conditions needed to guarantee that a quadrilateral is a parallelogram, considering both geometric properties and coordinate approaches.\n\n**Inquiry Question:**\nWhat is the smallest set of measurements you can make to confirm that a quadrilateral is a parallelogram?",
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
              markdown: "## Key Terms\n\n- **Parallelogram Tests** — Conditions that guarantee a quadrilateral is a parallelogram (e.g., both pairs of opposite sides parallel, both pairs of opposite sides congruent, diagonals bisect each other, one pair of opposite sides parallel and congruent).\n- **Coordinate Proof** — A proof that uses coordinates and algebraic calculations to verify geometric properties.",
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
              markdown: "## Tests for Parallelograms\n\n### Key Concept: Tests for Parallelograms\n\nA quadrilateral is a parallelogram if any of the following is true:\n\n- Both pairs of opposite sides are parallel.\n- Both pairs of opposite sides are congruent.\n- One pair of opposite sides is both parallel and congruent.\n- Both pairs of opposite angles are congruent.\n- The diagonals bisect each other.\n\n### Key Concept: Using Coordinate Geometry\n\nTo verify a quadrilateral is a parallelogram using coordinates:\n\n- **Slope Formula** — Opposite sides have the same slope (parallel).\n- **Distance Formula** — Opposite sides have the same length (congruent).\n- **Midpoint Formula** — Diagonals have the same midpoint (bisect each other).",
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
              markdown: "## Example 1 — Identify Parallelograms from Diagrams\n\nDetermine whether each given quadrilateral is a parallelogram based on visual inspection and measurement information.\n\n### Step 1: Check Side Relationships\n\nLook for parallel sides (indicated by arrows), congruent sides (tick marks), or other properties shown in the diagram.\n\n### Step 2: Apply a Test\n\nUse one of the parallelogram tests to justify whether the quadrilateral is or is not a parallelogram.",
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
              markdown: "## Example 2 — Find Values to Form a Parallelogram\n\nSolve for x and y so that a quadrilateral satisfies the conditions to be a parallelogram.\n\n### Step 1: Identify the Test Being Used\n\nDetermine whether to use opposite sides parallel, opposite sides congruent, or another condition based on the problem context.\n\n### Step 2: Set Up Equations\n\nCreate equations using the given expressions for sides or angles, then solve for the unknowns.",
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
              markdown: "## Example 3 — Coordinate Geometry Verification\n\nGraph quadrilaterals with given vertices and determine whether each is a parallelogram using the indicated formula.\n\n### Step 1: Calculate Slopes, Distances, or Midpoints\n\nUse the appropriate formula based on whether the problem asks for slope formula, distance and slope formulas, or midpoint formula verification.\n\n### Step 2: Compare Results\n\nFor opposite sides to be parallel, their slopes must be equal. For opposite sides to be congruent, their lengths must be equal. For diagonals to bisect each other, their midpoints must be equal.",
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
              markdown: "## Example 4 — Write Coordinate Proofs\n\nWrite coordinate proofs for statements about parallelograms.\n\n### Step 1: Position the Figure\n\nPlace the parallelogram conveniently on the coordinate plane, often with one vertex at the origin and sides along the axes.\n\n### Step 2: Use Algebraic Methods\n\nCalculate slopes, distances, or midpoints algebraically to prove the desired property.",
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
              markdown: "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson. Problems include:\n\n- Writing paragraph proofs and two-column proofs for theorems about parallelogram tests (Theorem 7.10 about opposite angles congruent implying parallelogram, Theorem 7.11 about diagonal bisection).\n- Finding a possible fourth vertex for parallelogram ABCD given three vertices, and finding all possible coordinates for the fourth vertex of a parallelogram with given vertices.\n- Determining the slope of a side so that a quadrilateral with given side slopes becomes a parallelogram.\n- Explaining how a designer can be certain that congruent parallelogram shapes in a pattern are actually parallelograms.\n- Finding the perimeter of a parallelogram given one side length.\n- Determining how many different parallelograms can be formed with four given side lengths (two of one length, two of another).\n- Verifying whether four street lamps form the vertices of a parallelogram on a town map coordinate plane.\n- Explaining how to use Theorem 7.11 to construct a parallelogram, then performing the construction.\n- Determining whether four people balancing on an X-shaped object must all be the same distance from the center to form a parallelogram.\n- Finding three possible locations for a missing jet when three jets are at vertices of a parallelogram.\n- Writing a coordinate proof that segments joining midpoints of any quadrilateral form a parallelogram.\n- Analyzing whether two parallelograms with four congruent corresponding angles are always, sometimes, or never congruent.\n- Comparing Theorem 7.9 and Theorem 7.3.\n- Proving that if ABCD is a parallelogram and AJ ≅ KC, then quadrilateral JBKD is a parallelogram.\n- Finding the remaining vertices of a parallelogram when given two vertices and the intersection point of the diagonals.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-2-lesson-4",
    title: "Rectangles",
    description: "Students apply properties of rectangles to find angle measures and diagonal lengths, prove triangles are congruent, and use coordinate geometry to determine whether a quadrilateral is a rectangle.",
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
              markdown: "## Explore: Special Properties of Rectangles\n\nStudents explore what makes rectangles special among parallelograms, focusing on the unique relationship between the diagonals and the right angles.\n\n**Inquiry Question:**\nWhat additional property do rectangles have that general parallelograms do not have?",
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
              markdown: "## Key Terms\n\n- **Rectangle** — A parallelogram with four right angles.\n- **Right Angle** — An angle measuring exactly 90 degrees.\n- **Diagonal of a Rectangle** — The segment connecting opposite vertices of a rectangle.",
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
              markdown: "## Rectangles\n\n### Key Concept: Properties of Rectangles\n\n- All rectangles are parallelograms (inherit all parallelogram properties).\n- All angles are right angles.\n- The diagonals of a rectangle are congruent.\n- The diagonals bisect each other.\n- The diagonals create two congruent right triangles.\n\n### Key Concept: Diagonal Length\n\nIn a rectangle with length $l$ and width $w$, the diagonal $d$ can be found using the Pythagorean Theorem:\n\n$$d^2 = l^2 + w^2$$",
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
              markdown: "## Example 1 — Find Measures in Rectangles\n\nUse rectangle properties and the Pythagorean Theorem to find side lengths, diagonal lengths, and angle measures.\n\n### Step 1: Identify Right Angles\n\nIn a rectangle, all angles are right angles (90°). Use this to find complementary and supplementary angles.\n\n### Step 2: Apply the Pythagorean Theorem\n\nWhen a rectangle's sides form right triangles with the diagonal, use $a^2 + b^2 = c^2$ to find unknown side lengths.",
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
              markdown: "## Example 2 — Solve Algebraic Problems with Rectangles\n\nSet up and solve equations involving angle measures and side lengths in rectangles.\n\n### Step 1: Write Equations\n\nUse the given angle expressions and the fact that angles in a rectangle are right angles or that consecutive angles are supplementary.\n\n### Step 2: Solve for the Unknown\n\nSolve the equation to find the value of the variable, then substitute to find the actual measure.",
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
              markdown: "## Example 3 — Prove Triangles Congruent Using Rectangles\n\nWrite two-column proofs showing that triangles within or created by rectangle diagonals are congruent.\n\n### Step 1: Identify Congruent Triangles\n\nRectangles have diagonals that bisect each other and create two pairs of congruent triangles.\n\n### Step 2: List Corresponding Parts\n\nUse the properties of rectangles (right angles, congruent diagonals, bisecting diagonals) to justify triangle congruence criteria.",
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
              markdown: "## Example 4 — Coordinate Geometry with Rectangles\n\nGraph quadrilaterals on the coordinate plane and determine whether each is a rectangle using slope and distance formulas.\n\n### Step 1: Check for Right Angles (Slope Formula)\n\nFor adjacent sides to be perpendicular, the product of their slopes must equal -1.\n\n### Step 2: Check for Congruent Diagonals (Distance Formula)\n\nCalculate the lengths of both diagonals and verify they are equal.",
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
              markdown: "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson. Problems include:\n\n- Writing a two-column proof for Theorem 7.13 (diagonals of a rectangle are congruent) and Theorem 7.14 (if a parallelogram has congruent diagonals, it is a rectangle).\n- Determining whether knowing opposite sides are congruent and parallel is sufficient to conclude a garden plot is rectangular.\n- Naming a property true for rectangles but not always true for parallelograms.\n- Constructing a rectangle using congruent segment and perpendicular line constructions.\n- Determining whether a sign with given dimensions must be a rectangle based on measurements.\n- Finding diagonal lengths in rectangles (if XW = 3 and WZ = 4, find YW; if ZY = 6 and XY = 8, find WY).\n- Comparing distances BD and AC in a rectangular frame to verify it's a rectangle.\n- Determining whether sections of a bookshelf with two vertical planks and five horizontal shelves form rectangles.\n- Finding the coordinates of a fourth corner of a rectangular plot when three corners are given on a coordinate plane.\n- Counting how many rectangles can be formed using lines in a figure of seven rectangles with four equal sides.\n- Finding possible side lengths for extending a pattern of rectangles to make a larger rectangle.\n- Solving for x and y in a rectangle given angle expressions $m\\angle EAB = (4x + 6)°$, $m\\angle DEC = (10 - 11y)°$, and $m\\angle EBC = 60°$.\n- Determining whether any two congruent acute triangles can form a rectangle or if only congruent right triangles work.\n- Explaining why all rectangles are parallelograms but not all parallelograms are rectangles.\n- Writing equations of four lines whose intersections form a rectangle and verifying with coordinate geometry.\n- Analyzing whether proving one right angle is sufficient to prove a quadrilateral is a rectangle.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-2-lesson-5",
    title: "Rhombi and Squares",
    description: "Students apply properties of rhombi and squares to find angle measures and diagonal lengths, and compare properties of parallelograms, rectangles, rhombi, and squares.",
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
              markdown: "## Explore: Properties of Special Parallelograms\n\nStudents explore the hierarchy of quadrilaterals and how rhombi and squares fit into the classification system alongside rectangles and general parallelograms.\n\n**Inquiry Question:**\nWhat properties must a quadrilateral have to be classified as a rhombus? What additional properties make it a square?",
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
              markdown: "## Key Terms\n\n- **Rhombus** — A parallelogram with all four sides congruent.\n- **Square** — A parallelogram with all sides congruent and all angles right angles (a regular quadrilateral).\n- **Diagonal of a Rhombus** — The diagonals of a rhombus are perpendicular bisectors of each other.\n- **Kite** — A quadrilateral with two pairs of adjacent congruent sides.",
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
              markdown: "## Rhombi and Squares\n\n### Key Concept: Properties of Rhombi\n\n- All properties of parallelograms apply.\n- All four sides are congruent.\n- The diagonals are perpendicular bisectors of each other.\n- Each diagonal bisects a pair of opposite angles.\n\n### Key Concept: Properties of Squares\n\n- All properties of rectangles apply.\n- All properties of rhombi apply.\n- All four sides are congruent.\n- All four angles are right angles.\n- The diagonals are congruent, perpendicular, and bisect the angles.\n\n### Key Concept: The Hierarchy\n\nSquare ⊂ Rhombus ⊂ Parallelogram\nSquare ⊂ Rectangle ⊂ Parallelogram\n\nA square is simultaneously a rectangle and a rhombus.",
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
              markdown: "## Example 1 — Find Values in a Rhombus\n\nUse rhombus properties to find unknown angle measures and diagonal lengths.\n\n### Step 1: Use Diagonal Perpendicularity\n\nThe diagonals of a rhombus intersect at right angles (are perpendicular).\n\n### Step 2: Use Angle Bisector Properties\n\nEach diagonal bisects the angles at the vertices it connects.",
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
              markdown: "## Example 2 — Find Diagonal Lengths in Squares\n\nSolve for unknown values in square diagrams using the relationship between side lengths and diagonal lengths.\n\n### Step 1: Apply Square Properties\n\nIn a square, all sides are congruent and diagonals are equal in length. The diagonal and two sides form an isosceles right triangle.\n\n### Step 2: Use the Pythagorean Theorem\n\nFor a square with side $s$, diagonal $d = s\\sqrt{2}$.",
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
              markdown: "## Example 3 — Prove Quadrilaterals Are Rhombi or Squares\n\nWrite two-column proofs to demonstrate that a given quadrilateral satisfies the definition of a rhombus or square.\n\n### Step 1: Show the Quadrilateral Is a Parallelogram\n\nFirst prove the quadrilateral is a parallelogram using appropriate tests.\n\n### Step 2: Show Additional Properties\n\nFor a rhombus, prove all sides are congruent. For a square, prove all sides congruent and all angles right (or prove it's both a rectangle and a rhombus).",
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
              markdown: "## Example 4 — Precision Problems with Real Objects\n\nDetermine what measurements are needed to confirm whether a garden box or quilt patch is a square.\n\n### Step 1: Identify Required Properties\n\nA square requires: four right angles and four congruent sides.\n\n### Step 2: State What to Measure\n\nExplain what measurements (side lengths, diagonals, angles) would confirm the shape is a square.",
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
              markdown: "## Example 5 — Classify Quadrilaterals Using Coordinates\n\nGiven coordinates of four vertices, determine whether the quadrilateral is a rhombus, rectangle, square, parallelogram, or none. List all that apply.\n\n### Step 1: Calculate Slopes and Distances\n\nFind slopes of all sides, lengths of all sides, and slopes of diagonals.\n\n### Step 2: Check Each Category\n\n- Parallelogram: opposite sides parallel.\n- Rectangle: parallelogram with right angles or congruent diagonals.\n- Rhombus: parallelogram with all sides congruent or perpendicular diagonals.\n- Square: both rectangle and rhombus properties.",
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
              markdown: "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson. Problems include:\n\n- Finding side lengths, diagonals, and angle measures in squares (BC, CD, GD, BD given FD = 55; ZX, XY, $m\\angle WTZ$, $m\\angle WYX$ given WT = 3).\n- Writing two-column proofs for Theorem 7.16 (diagonals of a rhombus bisect opposite angles), Theorem 7.17 (parallelogram with perpendicular diagonals is a rhombus), Theorem 7.19 (parallelogram with congruent adjacent sides is a rhombus), and Theorem 7.20 (rectangle and rhombus is a square).\n- Estimating and measuring shapes in a quilt pattern to identify quadrilaterals used.\n- Classifying individual quadrilateral shapes shown in diagrams.\n- Using diagonals to construct a rhombus and a square, justifying each construction step.\n- Classifying the four congruent triangles formed when cutting a rhombus-shaped cake along both diagonals (acute, obtuse, or right).\n- Finding CF given that the area of square ABCD is 36 square units, area of triangle EBF is 20 square units, EB is perpendicular to BF, and AE = 2.\n- Comparing all properties of parallelograms, rectangles, rhombi, and squares in a comprehensive summary.\n- Analyzing whether a parallelogram with congruent diagonals PR and QS is a square or a rhombus (or neither).\n- Determining truth values of the statement \"If a quadrilateral is a square, then it is a rectangle\" and its converse, inverse, and contrapositive.\n- Finding vertices of a square with diagonals on $y = x$ and $y = -x + 6$ and justifying the answer.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-2-lesson-6",
    title: "Trapezoids and Kites",
    description: "Students apply properties of trapezoids, isosceles trapezoids, and kites to solve problems, find midsegment lengths, and classify quadrilaterals.",
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
              markdown: "## Explore: Trapezoids, Kites, and Their Properties\n\nStudents investigate the unique properties of trapezoids and kites and how they differ from parallelograms and other quadrilaterals.\n\n**Inquiry Question:**\nWhat makes an isosceles trapezoid different from a regular trapezoid? What special properties do kites have?",
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
              markdown: "## Key Terms\n\n- **Trapezoid** — A quadrilateral with exactly one pair of parallel sides.\n- **Isosceles Trapezoid** — A trapezoid with congruent non-parallel sides (legs).\n- **Midsegment of a Trapezoid** — The segment connecting the midpoints of the legs; its length is the average of the two bases.\n- **Kite** — A quadrilateral with two pairs of adjacent congruent sides.\n- **Legs of a Trapezoid** — The non-parallel sides of a trapezoid.\n- **Bases of a Trapezoid** — The parallel sides of a trapezoid.",
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
              markdown: "## Trapezoids and Kites\n\n### Key Concept: Trapezoid Properties\n\n- A trapezoid has exactly one pair of parallel sides.\n- In an isosceles trapezoid, the base angles are congruent and the diagonals are congruent.\n- The midsegment of a trapezoid is parallel to both bases and its length equals the average of the base lengths:\n\n$$m = \\frac{b_1 + b_2}{2}$$\n\n### Key Concept: Kite Properties\n\n- A kite has two pairs of adjacent congruent sides.\n- The diagonals of a kite are perpendicular.\n- One pair of opposite angles are congruent (the angles between unequal sides).\n- One diagonal bisects the other at a right angle.",
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
              markdown: "## Example 1 — Solve Problems with Trapezoids\n\nUse trapezoid properties to solve for unknown variables, angle measures, and perimeters.\n\n### Step 1: Set Up Equations\n\nUse the given algebraic expressions for side lengths and the properties of trapezoids (or isosceles trapezoids) to write equations.\n\n### Step 2: Solve and Verify\n\nSolve for the unknown variable, then use this to find angle measures or perimeter.",
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
              markdown: "## Example 2 — Verify Trapezoids Using Coordinates\n\nDetermine whether a quadrilateral is a trapezoid or an isosceles trapezoid by calculating slopes and distances.\n\n### Step 1: Check for Parallel Sides\n\nCalculate slopes to determine which sides are parallel. A trapezoid has exactly one pair of parallel sides.\n\n### Step 2: Check for Congruent Legs (Isosceles)\n\nCalculate the lengths of the non-parallel sides (legs). If they are congruent, the trapezoid is isosceles.",
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
              markdown: "## Example 3 — Find Midsegment Lengths\n\nUse the midsegment formula to find unknown lengths in trapezoids.\n\n### Step 1: Identify the Bases and Midsegment\n\nThe midsegment connects the midpoints of the legs.\n\n### Step 2: Apply the Formula\n\nSubstitute the known base lengths into:\n\n$$m = \\frac{b_1 + b_2}{2}$$\n\nand solve for the unknown.",
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
              markdown: "## Example 4 — Find Midsegment Endpoints\n\nFind the coordinates of the endpoints of the midsegment of a trapezoid given the vertices.\n\n### Step 1: Find Midpoints of the Legs\n\nUse the midpoint formula to find where each leg is bisected.\n\n### Step 2: Connect the Midpoints\n\nThe segment connecting these midpoints is the midsegment.",
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
              markdown: "## Example 5 — Find Angle Measures in Kites\n\nUse kite properties to find unknown angle measures.\n\n### Step 1: Identify Congruent Angles\n\nIn a kite, the angles between pairs of unequal adjacent sides are congruent.\n\n### Step 2: Apply Angle Sum\n\nUse the fact that the sum of interior angles in a quadrilateral is 360 degrees.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 6 — Perimeter and Area Problems with Kites\n\nSolve for unknown side lengths and find perimeters of kites.\n\n### Step 1: Use Diagonal Properties\n\nThe diagonals of a kite are perpendicular and one diagonal bisects the other.\n\n### Step 2: Apply the Pythagorean Theorem\n\nRight triangles formed by the diagonals allow use of the Pythagorean Theorem to find unknown lengths.",
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson. Problems include:\n\n- Finding x or angle measures in isosceles trapezoids and kites given diagonal or angle expressions.\n- Finding the width of a set of stairs halfway up if the bottom is 21 feet wide and the top is 14 feet wide (isosceles trapezoid).\n- Determining what measurements a carpenter needs besides both base lengths to replace trapezoid-shaped desktops.\n- Writing two-column proofs for Theorem 7.22 (trapezoid with congruent base angles is isosceles) and Theorem 7.25 (diagonal of a kite is perpendicular to the other diagonal).\n- Writing a paragraph proof for Theorem 7.26 (angles in a kite).\n- Researching traditional diamond kites to find perimeter and area.\n- Writing equations of four lines that intersect to form an isosceles trapezoid and verifying with coordinate geometry.\n- Determining which quadrilateral does not belong given three characteristics: at least one pair of opposite sides parallel, diagonals not perpendicular, at least one pair of opposite sides congruent.\n- Analyzing whether $m\\angle A$ in kite ABCD is 45° or 115°.\n- Finding the perimeter of kite JKLM given side expressions and condition KL > JK.\n- Describing properties that classify a quadrilateral as trapezoid, isosceles trapezoid, or kite, and comparing all three.\n- Analyzing whether a square is also a kite (sometimes, always, never).\n- Analyzing whether one pair of opposite sides are congruent in a kite (sometimes, always, never).\n- Analyzing whether opposite angles of a trapezoid are supplementary (sometimes, always, never).",
            },
          },
        ],
      },
    ],
  },
] as const;

export const seedModule2Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule2Result> => {
    const now = Date.now();
    const results = [];

    for (const lesson of lessonConfigs) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 2,
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            orderIndex: lesson.orderIndex,
            createdAt: now,
            updatedAt: now,
          });

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

      let phasesCreated = 0;
      let activitiesCreated = 0;

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

        phasesCreated++;

        for (const section of phase.sections) {
          if (section.sectionType === "activity") {
            const activityContent = section.content as SeedActivityContent;

            const insertedActivityId = await ctx.db.insert("activities", {
              componentKey: activityContent.componentKey,
              displayName: `${phase.title} - ${activityContent.componentKey}`,
              description: `Activity for ${phase.title}`,
              props: activityContent.props as never,
              gradingConfig: { autoGrade: true, partialCredit: true },
              createdAt: now,
              updatedAt: now,
            });

            activitiesCreated++;

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

      results.push({
        lessonId,
        lessonVersionId,
        phasesCreated,
        activitiesCreated,
        slug: lesson.slug,
      });
    }

    return { lessons: results };
  },
});
