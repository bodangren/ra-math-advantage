import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule4LessonsResult {
  lessonsCreated: number;
  lessonVersionsCreated: number;
  phasesCreated: number;
  activitiesCreated: number;
}

type PhaseEntry = {
  phaseNumber: number;
  title: string;
  phaseType: "explore" | "learn" | "worked_example" | "vocabulary" | "independent_practice";
  estimatedMinutes: number;
  sections: Array<{
    sequenceOrder: number;
    sectionType: "text" | "activity";
    content: Record<string, unknown>;
  }>;
};

type LessonEntry = {
  lessonSlug: string;
  title: string;
  description: string;
  orderIndex: number;
  phases: PhaseEntry[];
};

const lessonsData: LessonEntry[] = [
  {
    lessonSlug: "module-4-lesson-1",
    title: "Geometric Mean",
    description:
      "Find the geometric mean between two numbers, write similarity statements for right triangles, and find unknown side lengths using geometric mean relationships.",
    orderIndex: 1,
    phases: [
      {
        phaseNumber: 1,
        title: "Vocabulary",
        phaseType: "vocabulary",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Key Terms\n\n- **Geometric Mean** — The geometric mean of two positive numbers [a] and [b] is the positive number [x] such that [a/x = x/b], or [x = √(ab)].\n- **Altitude** — In a right triangle, a segment drawn from the right angle vertex perpendicular to the hypotenuse.",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Explore",
        phaseType: "explore",
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Explore: Geometric Mean\n\nWhen you have two positive numbers [a] and [b], the arithmetic mean is [(a + b)/2]. The geometric mean is found using the proportion [a/x = x/b], which solves to [x = √(ab)].\n\n**Inquiry Question:**\nHow does the geometric mean relate to similar right triangles?",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn",
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Learn: Geometric Mean\n\nFor two positive numbers [a] and [b], the geometric mean [x] satisfies [a/x = x/b].\n\nThis relationship comes from the similarity of triangles formed when an altitude is drawn to the hypotenuse of a right triangle. Each altitude creates three similar right triangles.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Example 1",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 1 — Find the Geometric Mean\n\nFind the geometric mean between each pair of numbers.\n\n### Step 1: Apply the Formula\n\nFor two numbers [a] and [b], the geometric mean is [x = √(ab)].\n\n1. 4 and 6: [x = √(4 · 6) = √24 = 2√6]\n2. [1/2] and 2: [x = √((1/2) · 2) = √1 = 1]\n3. 4 and 25: [x = √(4 · 25) = √100 = 10]\n4. 12 and 20: [x = √(12 · 20) = √240 = 4√15]\n5. 17 and 3: [x = √(17 · 3) = √51]\n6. 3 and 24: [x = √(3 · 24) = √72 = 6√2]",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Example 2",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 2 — Similarity Statements for Right Triangles\n\nWrite a similarity statement identifying the three similar right triangles in each figure.\n\n### Step 1: Identify Corresponding Parts\n\nWhen an altitude is drawn from the right angle to the hypotenuse, three similar right triangles are formed. Use the geometric mean relationships to write proportions.\n\n7. (diagram with altitude to hypotenuse)\n8. (diagram with altitude to hypotenuse)\n9. (diagram with altitude to hypotenuse)\n10. (diagram with altitude to hypotenuse)",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Example 3",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 3 — Find Unknown Values\n\nFind the values of [x], [y], and [z].\n\n### Step 1: Set Up Proportions\n\nUse the geometric mean relationships from similar triangles.\n\n11. (right triangle diagram)\n12. (right triangle diagram)\n13. (right triangle diagram)\n14. (right triangle diagram)",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Example 4",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 4 — Real-World Applications\n\n### Step 1: Model the Situation\n\n15. Museum Statue: A 15-foot railing forms a right triangle with legs of 12 feet and 9 feet. Approximate how close visitors can get.\n\n16. Photography: Point A is 90 feet from the walkway entrance, point B is 40 feet from the entrance. With a 90° viewing angle, where should Noah stop?\n\n17. Highway Service Road: An airport and factory are 6.0 miles apart. Their distances from a shopping center are 3.6 miles and 4.8 miles. Find the shortest service road length.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Mixed Exercises",
        phaseType: "independent_practice",
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Mixed Exercises\n\n18. The geometric mean of a number and four times the number is 22. What is the number?\n\n19-20. Proof problems (Theorem 9.2 and Theorem 9.3)\n\n21. Find values of [x], [y], and [z] in the figure.\n\n22. Compare and contrast arithmetic and geometric means.\n\n23. Find two pairs of whole numbers with a whole-number geometric mean.\n\n24. Find the error: Aiden and Tia finding [x].\n\n25. Analyze statements about geometric mean.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Review Notes",
        phaseType: "independent_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Review Notes\n\n- Images referenced in this lesson:\n  - ![](media/image1.png) — geometric mean triangle diagram\n  - ![](media/image2.png) — geometric mean triangle diagram\n  - ![](media/image3.png) — geometric mean triangle diagram\n  - ![](media/image4.png) — geometric mean triangle diagram\n  - ![](media/image5.png) — altitude diagram\n  - ![](media/image6.png) — altitude diagram\n  - ![](media/image7.png) — altitude diagram\n  - ![](media/image8.png) — altitude diagram\n  - ![](media/image9.png) — proof diagram\n  - ![](media/image10.png) — triangle with altitude\n  - ![](media/image11.png) — triangle diagram\n  - ![](media/image12.png) — Find the Error diagram",
            },
          },
        ],
      },
    ],
  },
  {
    lessonSlug: "module-4-lesson-2",
    title: "Pythagorean Theorem and Its Converse",
    description:
      "Find unknown side lengths in right triangles using the Pythagorean Theorem, identify Pythagorean triples, and classify triangles using the converse.",
    orderIndex: 2,
    phases: [
      {
        phaseNumber: 1,
        title: "Vocabulary",
        phaseType: "vocabulary",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Key Terms\n\n- **Pythagorean Theorem** — In a right triangle, the sum of the squares of the lengths of the legs equals the square of the length of the hypotenuse: [a² + b² = c²].\n- **Pythagorean Triple** — A set of three positive integers [a], [b], and [c] that satisfy [a² + b² = c²].\n- **Converse of the Pythagorean Theorem** — If [a² + b² = c²] for a triangle with sides [a], [b], and [c] (where [c] is longest), then the triangle is a right triangle.",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Explore",
        phaseType: "explore",
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Explore: Pythagorean Theorem\n\nThe Pythagorean Theorem relates the three sides of a right triangle. The converse can determine whether a triangle is acute ([c² < a² + b²]), right ([c² = a² + b²]), or obtuse ([c² > a² + b²]).\n\n**Inquiry Question:**\nHow can you determine whether a triangle is acute, right, or obtuse using only its side lengths?",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn",
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Learn: Pythagorean Theorem\n\nIn a right triangle with legs [a] and [b] and hypotenuse [c]:\n\n[a² + b² = c²]\n\nTo find a missing side, isolate the variable on one side of the equation.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Example 1",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 1 — Find the Value of x\n\n### Step 1: Apply the Pythagorean Theorem\n\n1-6. Solve [a² + b² = c²] for the unknown side length in each right triangle.",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Example 2",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 2 — Use Pythagorean Triples\n\n### Step 1: Recognize Common Triples\n\nPythagorean triples include (3, 4, 5), (5, 12, 13), (7, 24, 25), (8, 15, 17), and (9, 40, 41).\n\n7-12. Identify and use Pythagorean triples to find values more efficiently.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Example 3",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 3 — Real-World Applications\n\n### Step 1: Set Up the Problem\n\n13. Ramp: The bottom of a ramp is 10 feet from the dock. The ramp is 11 feet long. How high is the dock?\n\n14. Flight: An airplane lands 60 miles east and 25 miles north of where it took off. How far apart are the airports?",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Example 4",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 4 — Classify Triangles\n\nDetermine whether points X, Y, and Z can be vertices of a triangle. If so, classify as acute, right, or obtuse.\n\n### Step 1: Check Triangle Inequality and Side Lengths\n\n15. X(−3, −2), Y(−1, 0), Z(0, −1)\n16. X(−7, −3), Y(−2, −5), Z(−4, −1)\n17. X(1, 2), Y(4, 6), Z(6, 6)\n18. X(3, 1), Y(3, 7), Z(11, 1)",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Mixed Exercises",
        phaseType: "independent_practice",
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Mixed Exercises\n\n19. Tether: A 50-foot tether is tied to a pole 40 feet above ground. How far from the base is the anchor?\n\n20-22. Classify triangles as acute, obtuse, or right.\n\n23-24. Proof: Theorem 9.6 and Theorem 9.7\n\n25. Sidewalks: 1071 and 1840 slabs for short sides. How many for the long side?\n\n26-28. Find perimeter and area.\n29. Find [x] for right triangle with sides [x], [x + 5], and 25.\n30. Find [x] values for acute triangle with sides [2x], 8, and 12.\n31. Redwood tree broken at 20 meters tall, top lands 16 feet from centerline.\n32. Construct arguments for garden dimensions.\n33-35. Find the value of [x].\n36. HDTV screen with 16:9 aspect ratio, height 32 inches.\n37. Eduardo and Lisa leave school on bikes.\n38. Office park shortcut distance.\n39. Structure: Pythagorean triple formula.\n40. True or false about right triangles with same hypotenuse.\n41. Create a right triangle with a Pythagorean triple.\n42. Find [x] in the figure.\n43. Research incommensurable magnitudes.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Review Notes",
        phaseType: "independent_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Review Notes\n\n- Images referenced in this lesson:\n  - ![](media/image1.png) through ![](media/image29.png) — various Pythagorean Theorem diagrams",
            },
          },
        ],
      },
    ],
  },
  {
    lessonSlug: "module-4-lesson-3",
    title: "Coordinates in Space",
    description:
      "Graph a rectangular solid in 3D space, find distances between points using the Distance Formula, and find midpoints using the Midpoint Formula.",
    orderIndex: 3,
    phases: [
      {
        phaseNumber: 1,
        title: "Vocabulary",
        phaseType: "vocabulary",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Key Terms\n\n- **Rectangular Solid** — A three-dimensional figure with six rectangular faces, also called a rectangular prism.\n- **Distance Formula in Space** — The distance between points [P(x₁, y₁, z₁)] and [Q(x₂, y₂, z₂)] is [d = √((x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²)].\n- **Midpoint Formula in Space** — The midpoint of segment [PQ] is [M = ((x₁ + x₂)/2, (y₁ + y₂)/2, (z₁ + z₂)/2)].",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Explore",
        phaseType: "explore",
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Explore: Three-Dimensional Coordinates\n\nThe 3D coordinate system extends the 2D plane with a third axis (the z-axis). Points are represented as ordered triples (x, y, z).\n\n**Inquiry Question:**\nHow do the Distance and Midpoint Formulas change when you add a third dimension?",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn",
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Learn: Coordinates in Space\n\nThe distance between two points in space uses the same principle as the Pythagorean Theorem extended into three dimensions.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Example 1",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 1 — Graph a Rectangular Solid\n\nGraph a rectangular solid that contains the given point and the origin as vertices. Label the coordinates of each vertex.\n\n### Step 1: Plot the Point and Origin\n\n1. A(2, 1, 5)\n2. P(−1, 4, 2)\n3. C(−2, 2, 2)\n4. R(3, −4, 1)\n5. H(4, 5, −3)\n6. G(4, 1, −3)",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Example 2",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 2 — Distance in Space\n\nDetermine the distance between each pair of points.\n\n### Step 1: Apply the Distance Formula\n\n[d = √((x₂ - x₁)² + (y₂ - y₁)² + (z₂ - z₁)²)]\n\n7. F(0, 0, 0) and G(2, 4, 3): [d = √(2² + 4² + 3²) = √(4 + 16 + 9) = √29]\n8. X(−2, 5, −1) and Y(9, 0, 4)\n9. A(4, −6, 0) and B(1, 0, 1)\n10. C(8, 7, −2) and D(0, 0, 0)\n\n11. Air Traffic: Find distance from aircraft to tower at (0, 0, 0).\n\n12. Animators: Find distance between point R (nose) and point T (tail) on character.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Example 3",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 3 — Midpoint in Space\n\nDetermine the coordinates of the midpoint [M] of the segment joining each pair of points.\n\n### Step 1: Apply the Midpoint Formula\n\n[M = ((x₁ + x₂)/2, (y₁ + y₂)/2, (z₁ + z₂)/2)]\n\n13. K(−2, −4, −4) and L(4, 2, 0): [M = (1, −1, −2)]\n14. W(−1, −3, −6) and Z(−1, 5, 10)\n15. R(3, 3, 4) and V(5, 4, 13)\n16. A(4, 6, −8) and B(0, 0, 0)\n17. C(8, 7, 11) and D(2, 1, 8)\n18. T(−1, −7, 9) and U(5, −1, −6)",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Mixed Exercises",
        phaseType: "independent_practice",
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Mixed Exercises\n\n19-20. Find distance and midpoint for P(−5, −2, −1) and Q(−1, 0, 3); J(1, 1, 1) and K(−1, −1, −1).\n\n21-24. Find distance and midpoint with fractional coordinates and square roots.\n\n25. Proof: Coordinate proof of the Midpoint Formula in Space.\n\n26. Compare and contrast Distance and Midpoint Formulas in 2D and 3D.\n\n27. Find the Error: Camille and Teion finding distance between A(2, 5, −8) and B(3, −1, 0).\n\n28. Create: Graph a cube with origin as vertex, edge on negative y-axis, face in negative xz-plane.\n\n29. Persevere: Sphere with radius 9 units passes through point P. Find missing z-coordinate.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Review Notes",
        phaseType: "independent_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Review Notes\n\n- Images referenced in this lesson:\n  - ![](media/image1.png) — 3D coordinate system diagram\n  - ![](media/image2.png) — air traffic coordinate diagram\n  - ![](media/image3.png) — animator character diagram\n  - ![](media/image4.png) — Find the Error diagram\n  - ![](media/image5.png) — cube diagram",
            },
          },
        ],
      },
    ],
  },
  {
    lessonSlug: "module-4-lesson-4",
    title: "Special Right Triangles",
    description:
      "Find missing side lengths in 45-45-90 and 30-60-90 triangles using special ratios, and apply special right triangle relationships to solve real-world problems.",
    orderIndex: 4,
    phases: [
      {
        phaseNumber: 1,
        title: "Vocabulary",
        phaseType: "vocabulary",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Key Terms\n\n- **45°-45°-90° Triangle Theorem** — In a 45°-45°-90° triangle, the legs are congruent and the hypotenuse is [l√2] if each leg has length [l].\n- **30°-60°-90° Triangle Theorem** — In a 30°-60°-90° triangle, the hypotenuse is [2x] and the longer leg is [x√3] if the shorter leg has length [x].",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Explore",
        phaseType: "explore",
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Explore: Special Right Triangles\n\nSpecial right triangles have side length ratios that allow you to find all sides if you know just one.\n\n**Inquiry Question:**\nWhy do 45°-45°-90° and 30°-60°-90° triangles have predictable side ratios?",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn",
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Learn: Special Right Triangles\n\n**45°-45°-90° Triangle:** If legs have length [l], hypotenuse is [l√2].\n\n**30°-60°-90° Triangle:** If shorter leg has length [x], longer leg is [x√3] and hypotenuse is [2x].",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Example 1",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 1 — 45°-45°-90° Triangles\n\nFind the value of [x].\n\n### Step 1: Identify the Ratio\n\nFor a 45°-45°-90° triangle, if the leg is [l], the hypotenuse is [l√2].\n\n1-6. Find [x] using the 45°-45°-90° ratio.",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Example 2",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 2 — 30°-60°-90° Triangles\n\nFind the value of [x].\n\n### Step 1: Identify the Shorter Leg\n\nFor a 30°-60°-90° triangle, if the shorter leg is [x], the longer leg is [x√3] and the hypotenuse is [2x].\n\n7-12. Find [x] using the 30°-60°-90° ratio.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Example 3",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 3 — Mixed Special Triangles\n\nFind the value of [x].\n\n### Step 1: Determine Which Special Triangle Applies\n\n13-18. Apply the appropriate ratio based on the given angle measures.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Example 4",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 4 — Find x and y\n\nFind the values of [x] and [y].\n\n### Step 1: Use Both Ratios\n\n19-24. For 30°-60°-90° triangles, find the shorter leg [x] first, then use ratios to find [y].",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Example 5",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 5 — Real-World Applications\n\n### Step 1: Apply Special Triangle Ratios\n\n25. Escalators: A 40-foot escalator rises at a 30° angle. How high is the second floor?\n\n26. Windows: Height of window using six 30°-60°-90° triangles.\n\n27. Certificate: Will a 12-cm equilateral triangle fit in a 12-cm by 10-cm frame?\n\n28. Chocolate Box: Hexagon with side length 3 inches inside rectangular box.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Mixed Exercises",
        phaseType: "independent_practice",
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Mixed Exercises\n\n29. Botanical Gardens: Square garden 6 yards on each side. Length of diagonal pathway.\n\n30. Origami: 150-mm square folded along diagonal. Find hypotenuse length.\n\n31. Movie Theater: Kim and Yanika's line of sight problem.\n\n32. Structure: Find [x] in nested 45°-45°-90° triangles.\n\n33-38. Find [x] and [y] in various triangles.\n\n39-40. Proof: 45°-45°-90° Triangle Theorem and 30°-60°-90° Triangle Theorem.\n\n41. Triangle XYZ is 45°-45°-90° with right angle Z. Find coordinates of X for Y(−1, 2) and Z(6, 2).\n\n42. Triangle EFG is 30°-60°-90° with m∠F = 90°. Find coordinates of E in Quadrant III for F(−3, −4) and G(−3, 2).\n\n43. Use Tools: Loading dock ramp with m∠R = 30° and ST = RS + 4.\n\n44. State Your Assumption: Quilt with two squares cut along diagonal, large block area 36 in².\n\n45. Persevere: Perimeter of quadrilateral ABCD.\n\n46. Write: Why are some right triangles considered special?\n\n47. Find the Error: Carmen and Audrey finding [x].\n\n48. Analyze: Triangle with angle ratio 1:2:3, shortest side 8.\n\n49. Create: Rectangle with diagonal twice as long as width.",
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Review Notes",
        phaseType: "independent_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Review Notes\n\n- Images referenced in this lesson:\n  - ![](media/image1.png) through ![](media/image43.png) — various special right triangle diagrams",
            },
          },
        ],
      },
    ],
  },
  {
    lessonSlug: "module-4-lesson-5",
    title: "Trigonometry",
    description:
      "Find trigonometric ratios (sine, cosine, tangent), use special right triangles for exact values, and solve right triangles using trigonometric ratios.",
    orderIndex: 5,
    phases: [
      {
        phaseNumber: 1,
        title: "Vocabulary",
        phaseType: "vocabulary",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Key Terms\n\n- **Sine** — For acute angle [A], [sin A = opposite/hypotenuse].\n- **Cosine** — For acute angle [A], [cos A = adjacent/hypotenuse].\n- **Tangent** — For acute angle [A], [tan A = opposite/adjacent].\n- **Solve a Triangle** — Find all missing side lengths and angle measures.",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Explore",
        phaseType: "explore",
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Explore: Trigonometric Ratios\n\nThe ratios of sides in a right triangle define the trigonometric functions sine, cosine, and tangent for the acute angles.\n\n**Inquiry Question:**\nHow can the side lengths of a right triangle determine the trigonometric ratios for its acute angles?",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn",
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Learn: Trigonometric Ratios\n\nFor a right triangle with acute angle [A]:\n\n[sin A = opposite/hypotenuse]\n[cos A = adjacent/hypotenuse]\n[tan A = opposite/adjacent]",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Example 1",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 1 — Find Trigonometric Ratios\n\nFind sin [L], cos [L], tan [L], sin [M], cos [M], and tan [M].\n\n### Step 1: Identify Sides Relative to Each Angle\n\n1. l = 15, m = 36, n = 39\n2. l = 12, m = 12√3, n = 24\n3-4. Find ratios for triangles RST and JKL.",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Example 2",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 2 — Special Triangle Trigonometry\n\nUse a special right triangle to express each trigonometric ratio.\n\n### Step 1: Use Known Values from Special Triangles\n\n5. sin 30° = 1/2\n6. tan 45° = 1\n7. cos 60° = 1/2\n8. sin 60° = √3/2\n9. tan 30° = 1/√3 = √3/3\n10. cos 45° = √2/2",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Example 3",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 3 — Find the Value of x\n\nFind [x] to the nearest hundredth.\n\n### Step 1: Choose the Appropriate Ratio\n\n11-14. Set up the trigonometric equation and solve for [x].\n\n15. Geology: Shan measures 43 meters at 36° angle. Find height.\n\n16. Ramps: 60-foot ramp at 15° angle. Find height.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Example 4",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 4 — Find Angle Measures\n\nUse a calculator to find [m∠B] to the nearest tenth.\n\n### Step 1: Use Inverse Trigonometric Functions\n\n16-21. Use [sin⁻¹], [cos⁻¹], or [tan⁻¹] to find angle measures.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Example 5",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 5 — Solve Right Triangles\n\nSolve each right triangle. Round side measures to the nearest tenth and angle measures to the nearest degree.\n\n### Step 1: Find All Missing Measures\n\n22-27. Use trigonometric ratios and triangle sum to find all sides and angles.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Mixed Exercises",
        phaseType: "independent_practice",
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Mixed Exercises\n\n28-29. Find angle measure using Distance Formula and inverse trig.\n\n30-32. Find perimeter and area of triangles.\n\n33. Neighbors: Amy, Barry, and Chris problem with trigonometric expressions.\n\n34. Construct Arguments: Cell phone tower guy wire problem.\n\n35. Complementary Angles: Given sin α = 0.6428 and cos α = 0.7660, find sin β and cos β.\n\n36-38. Find [x] and [y].\n\n39. Find the Error: Lakasha and Treyvon with 52 sin 27° vs 52 cos 63°.\n\n40. Persevere: Solve △ABC.\n\n41. Analyze: Are sine and cosine always less than 1 for acute angles?\n\n42. Which One Doesn't Belong: Identify the triangle that cannot be solved the same way.\n\n43. Write: Explain how to use ratios to find angle measures.\n\n44. Create: Draw a right triangle with tan = 3/2 for one acute angle.",
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Review Notes",
        phaseType: "independent_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Review Notes\n\n- Images referenced in this lesson:\n  - ![](media/image1.png) through ![](media/image31.png) — various trigonometry diagrams",
            },
          },
        ],
      },
    ],
  },
  {
    lessonSlug: "module-4-lesson-6",
    title: "Applying Trigonometry",
    description:
      "Solve problems involving angles of elevation and depression, use trigonometry to find areas of triangles, and apply indirect measurement techniques.",
    orderIndex: 6,
    phases: [
      {
        phaseNumber: 1,
        title: "Vocabulary",
        phaseType: "vocabulary",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Key Terms\n\n- **Angle of Elevation** — The angle between the horizontal and the line of sight when looking upward.\n- **Angle of Depression** — The angle between the horizontal and the line of sight when looking downward.\n- **Indirect Measurement** — Using trigonometric ratios to find distances that are difficult to measure directly.",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Explore",
        phaseType: "explore",
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Explore: Angles of Elevation and Depression\n\nAngles of elevation and depression are measured from a horizontal line. They are congruent when dealing with parallel lines and transversal problems.\n\n**Inquiry Question:**\nHow are angles of elevation and depression related when using alternate interior angles?",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn",
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Learn: Applying Trigonometry\n\nWhen solving problems with angles of elevation and depression, draw a diagram and identify the right triangle formed. Use the appropriate trigonometric ratio.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Example 1",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 1 — Angle of Elevation Problems\n\n### Step 1: Set Up the Diagram and Equation\n\n1. Lighthouses: Sailors spot light at 25° elevation. Light is 30 meters above sea level. Find distance from shore.\n\n2. Water Towers: Student is 110 feet from water tower. Tower is 32.5 feet tall. Eye level is 6 feet above ground. Find angle of elevation.\n\n3. Construction: Ladder reaches 30-foot roof at 55° angle. How far is ladder from wall?\n\n4. Mountain Biking: Nabuko is 60 meters from base, bridges are 100 meters up. Eye level is 5 meters above ground. Find angle of elevation.",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Example 2",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 2 — Angle of Depression Problems\n\n### Step 1: Use the Congruent Angle Relationship\n\n5. Rooftop: Lucia is 5.5 feet tall on 80-foot building. Fountain is 122 feet from base. Find angle of depression.\n\n6. Air Traffic: From 120-foot tower, airplane observed at 19° angle of depression. Find distance from base.\n\n7. Aviation: Flying at 528 feet altitude with 2000 feet horizontal distance until runway. Find angle of depression.\n\n8. Indirect Measurement: Kenneth on 30-foot pier (eye level 3 feet above pier). Angle of depression to whale is 20°. Find distance.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Example 3",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 3 — Indirect Measurement with Two Angles\n\n### Step 1: Set Up a System of Equations\n\n9. Garage: Carlos sights top at 42°, steps back 20 feet and sights at 10°. Carlos is 6 feet tall. Find garage height.\n\n10. Cliff: Sarah sights top at 60°, steps back 50 meters and sights at 30°. Sarah is 1.8 meters tall. Find cliff height.\n\n11. Balloon: Person on ground, steps back 10 feet, angle changes from 36° to 25°. Person is 6 feet tall. Find balloon height.\n\n12. Mr. Dominguez on 40-foot bluff, eye level 6 feet above ground. Angles of depression are 34° and 48° to two friends. Find distance between friends.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Example 4",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 4 — Area Using Trigonometry\n\nUse trigonometry to find the area of △ABC to the nearest tenth.\n\n### Step 1: Use the Formula [Area = (1/2)ab sin C]\n\n13-18. Given two sides and the included angle, find the area.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Example 5",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 5 — Area with Different Given Information\n\n### Step 1: Find the Necessary Components First\n\n19-21. Solve for missing sides or angles, then use the area formula.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Mixed Exercises",
        phaseType: "independent_practice",
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Mixed Exercises\n\n22. Use Estimation: Airplane at 7° elevation from 200-foot tower. Altitude is 5127 feet. Find distance.\n\n23. Use Estimation: Hiker dropped backpack over canyon. Ranger 113 feet away at same height sights backpack at 32° depression.\n\n24. Use a Model: Jermaine and John 10 meters apart watching helicopter. Find height.\n\n25. Use a Source: Research Sandia Peak Tramway angle of depression.\n\n26. Regularity: Geologist general formula for height [h] given distance [d] and angle [x].\n\n27-30. Find area of △ABC given various angle and side combinations.\n\n31. Theater: Large triangular scenery piece. Find area.\n\n32. Find the Error: Terrence vs Rodrigo on elevation and depression relationship.\n\n33. Create: Question to help find angle of depression.\n\n34. Analyze: As person moves closer, does angle of elevation increase?\n\n35. Persevere: Find [x].\n\n36. Write: Describe estimating height without trigonometry.",
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Review Notes",
        phaseType: "independent_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Review Notes\n\n- Images referenced in this lesson:\n  - ![](media/image1.png) through ![](media/image19.png) — various trigonometry application diagrams",
            },
          },
        ],
      },
    ],
  },
  {
    lessonSlug: "module-4-lesson-7",
    title: "The Law of Sines",
    description:
      "Apply the Law of Sines to find missing sides and angles in oblique triangles, determine whether SSA produces 0, 1, or 2 solutions, and solve triangles using the Law of Sines.",
    orderIndex: 7,
    phases: [
      {
        phaseNumber: 1,
        title: "Vocabulary",
        phaseType: "vocabulary",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Key Terms\n\n- **Law of Sines** — For any triangle [ABC] with sides [a], [b], and [c]: [a/sin A = b/sin B = c/sin C].\n- **Oblique Triangle** — A triangle that does not have a right angle.\n- **Ambiguous Case** — When given two sides and a non-included angle (SSA), there may be 0, 1, or 2 possible triangles.",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Explore",
        phaseType: "explore",
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Explore: Law of Sines\n\nThe Law of Sines extends trigonometry to non-right triangles by relating each side to the sine of its opposite angle.\n\n**Inquiry Question:**\nWhen does SSA produce one triangle, two triangles, or no triangle?",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn",
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Learn: Law of Sines\n\nFor any triangle [ABC]:\n\n[a/sin A = b/sin B = c/sin C]\n\nThis allows you to find unknown sides or angles when you know either:\n* Two angles and one side (AAS or ASA)\n* Two sides and an angle opposite one of them (SSA, the ambiguous case)",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Examples 1 and 2",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Examples 1 and 2 — Find the Value of x\n\nFind [x] to the nearest tenth.\n\n### Step 1: Set Up the Law of Sines Proportion\n\n1-12. Apply [a/sin A = b/sin B] and solve for the unknown side.",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Example 3",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 3 — Real-World Applications\n\n### Step 1: Draw a Diagram and Apply the Law of Sines\n\n13. Wildlife: Boat travels north to first osprey site, then 5° north of west for 2.14 miles to second site, then 6.7 miles back to dock. Find distance from dock to first site.\n\n14. Sailing: Two towers 100 feet apart measure angles to sailboat. Find distance [d] from Tower A.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Examples 4-6",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Examples 4-6 — Ambiguous Case\n\nDetermine whether each triangle has no solution, one solution, or two solutions. Then solve the triangle.\n\n### Step 1: Analyze Given Information\n\nFor SSA conditions, the height [h = b sin A] determines the number of solutions:\n\n* If [a < h]: No solution\n* If [a = h]: One solution (right triangle)\n* If [a > h] and [a < b]: Two solutions\n* If [a ≥ b]: One solution\n\n15-26. Classify and solve each triangle.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Mixed Exercises",
        phaseType: "independent_practice",
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Mixed Exercises\n\n27. Proof: Justify each statement for the proof of the Law of Sines.\n\n28-30. Find perimeter of each figure.\n\n31. Walking: Alliya walks on path making 35° angle with road, walks 450 meters, then turns 75° back to road.\n\n32. Cameras: Security camera revolves at 1 revolution per minute. At one point it faces a point 20 meters away, then 10 meters away 4 seconds later.\n\n33. Fishing: 5-foot pole at 22° with deck, hook 3 feet from tip. Find angles for hook to be level with deck.\n\n34. Reasoning: Angle A is obtuse. How many triangles can be formed if [a = b], [a < b], or [a > b]?\n\n35-43. Determine whether given measures define 0, 1, or 2 triangles.\n\n44. Towers: Cell towers A, B, C form triangle. A and B are 8 miles apart. Angle at A is 112°, angle at B is 40°. Find distance between B and C.\n\n45. Find the Error: Cameron vs Gabriela finding [m∠T] in △RST.\n\n46. Write: Two methods to find [x] in △ABC.\n\n47. Persevere: Find both solutions for △ABC if [a = 15], [b = 21], [m∠A = 42°].\n\n48. Analyze: Can Law of Sines always be used when two sides and included angle are known?\n\n49. Create: Give measures for [a], [b], and acute ∠A that define: (a) 0 triangles, (b) exactly one triangle, (c) two triangles.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Review Notes",
        phaseType: "independent_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Review Notes\n\n- Images referenced in this lesson:\n  - ![](media/image1.png) through ![](media/image24.png) — various Law of Sines application diagrams",
            },
          },
        ],
      },
    ],
  },
  {
    lessonSlug: "module-4-lesson-8",
    title: "The Law of Cosines",
    description:
      "Apply the Law of Cosines to find missing sides and angles in oblique triangles, determine whether to use Law of Sines or Law of Cosines, and solve triangles.",
    orderIndex: 8,
    phases: [
      {
        phaseNumber: 1,
        title: "Vocabulary",
        phaseType: "vocabulary",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Key Terms\n\n- **Law of Cosines** — For any triangle [ABC] with sides [a], [b], and [c]: [a² = b² + c² - 2bc cos A].\n- **SAS (Side-Angle-Side)** — Given two sides and the included angle.\n- **SSS (Side-Side-Side)** — Given all three sides.",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Explore",
        phaseType: "explore",
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Explore: Law of Cosines\n\nThe Law of Cosines generalizes the Pythagorean Theorem to all triangles. It is used when you know either SAS or SSS information.\n\n**Inquiry Question:**\nWhy does the Pythagorean Theorem become [a² = b² + c² - 2bc cos A] for non-right triangles?",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn",
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Learn: Law of Cosines\n\nFor any triangle [ABC]:\n\n[a² = b² + c² - 2bc cos A]\n[b² = a² + c² - 2ac cos B]\n[c² = a² + b² - 2ab cos C]\n\nUse the Law of Cosines when you have:\n* **SAS**: Two sides and the included angle\n* **SSS**: All three sides (use Law of Cosines to find the largest angle first)",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Examples 1 and 2",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Examples 1 and 2 — Find the Value of x\n\nFind [x] to the nearest tenth for side lengths and nearest degree for angle measures.\n\n### Step 1: Identify SAS or SSS\n\n1-6. Apply the appropriate Law of Cosines formula.",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Example 3",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Example 3 — Real-World Applications\n\n### Step 1: Set Up the Diagram and Equation\n\n7. Radar: Two stations 2.4 miles apart track an airplane. Station A to plane is 7.4 miles, Station B to plane is 6.9 miles. Find angle of elevation from Station A.\n\n8. Drafting: Marion draws segment AB = 4.2 inches. From B, she draws segment BC = 6.4 inches at 42° to AB. Find AC.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Examples 4 and 5",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Examples 4 and 5 — Solve Triangles\n\nSolve each triangle. Round side lengths to the nearest tenth and angle measures to the nearest degree.\n\n### Step 1: Choose Law of Cosines or Law of Sines\n\nFor SAS: Use Law of Cosines first to find the third side.\nFor SSS: Use Law of Cosines first to find the largest angle.\n\n9-14. Solve each triangle.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Mixed Exercises",
        phaseType: "independent_practice",
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Mixed Exercises\n\nDetermine whether each triangle should be solved by beginning with Law of Sines or Law of Cosines. Then solve.\n\n15-18. Apply the appropriate method.\n\n19. Pools: Lifeguard station problem at Perth County pool.\n\n20. Proof: Two-column proof of the Law of Cosines.\n\n21. Persevere: Find [x] in the figure.\n\n22. Analyze: Why is the Pythagorean Theorem a specific case of the Law of Cosines?\n\n23. Write: What methods can you use to solve a triangle?\n\n24. Create: Draw and label a triangle that can be solved (a) using only Law of Sines, (b) using only Law of Cosines.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Review Notes",
        phaseType: "independent_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown: "## Review Notes\n\n- Images referenced in this lesson:\n  - ![](media/image1.png) through ![](media/image16.png) — various Law of Cosines application diagrams",
            },
          },
        ],
      },
    ],
  },
];

export const seedModule4Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule4LessonsResult> => {
    const now = Date.now();
    const unitNumber = 4;

    let lessonsCreated = 0;
    let lessonVersionsCreated = 0;
    let phasesCreated = 0;
    let activitiesCreated = 0;

    for (const lesson of lessonsData) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lesson.lessonSlug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber,
            title: lesson.title,
            slug: lesson.lessonSlug,
            description: lesson.description,
            orderIndex: lesson.orderIndex,
            createdAt: now,
            updatedAt: now,
          });

      if (!existingLesson) {
        lessonsCreated++;
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
            title: lesson.title,
            description: lesson.description,
            status: "published",
            createdAt: now,
          });

      if (!existingLessonVersion) {
        lessonVersionsCreated++;
      }

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
    }

    return {
      lessonsCreated,
      lessonVersionsCreated,
      phasesCreated,
      activitiesCreated,
    };
  },
});