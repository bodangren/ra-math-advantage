import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedModule6LessonsResult {
  lessons: {
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    slug: string;
    phasesCreated: number;
  }[];
}

export const seedModule6Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule6LessonsResult> => {
    const now = Date.now();
    const lessonData = [
      {
        slug: "module-6-lesson-1",
        title: "Areas of Quadrilaterals",
        description:
          "Find areas of parallelograms, rhombuses, and trapezoids. Find areas of kites. Solve real-world problems involving areas of quadrilaterals.",
        orderIndex: 1,
        sections: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            content: `## Key Terms\n\n- **Parallelogram** — A quadrilateral with both pairs of opposite sides parallel.\n- **Rhombus** — A parallelogram with four congruent sides.\n- **Trapezoid** — A quadrilateral with exactly one pair of parallel sides.\n- **Kite** — A quadrilateral with two pairs of consecutive sides that are congruent, but no opposite sides are congruent.`,
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            content: `## Explore: Areas of Quadrilaterals\n\nStudents explore how the area formulas for parallelograms, rhombuses, trapezoids, and kites are derived from the rectangle area formula. Each shape's area can be found by rearranging the shape into a rectangle or by using triangles within the shape.\n\nInquiry Question:\nHow are the area formulas for a parallelogram, a rhombus, a trapezoid, and a kite related to the area formula for a rectangle?`,
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            content: `## Learn: Areas of Quadrilaterals\n\n### Key Concept: Area of a Parallelogram\n\nThe area of a parallelogram is found by multiplying the base length by the height perpendicular to that base.\n\n### Key Concept: Area of a Rhombus\n\nThe area of a rhombus can be found using the diagonals: $[A = \\frac{d_1 \\cdot d_2}{2}]$\n\n### Key Concept: Area of a Trapezoid\n\nThe area of a trapezoid is the average of the lengths of the two parallel bases multiplied by the height.\n\n### Key Concept: Area of a Kite\n\nThe area of a kite is half the product of the lengths of its diagonals: $[A = \\frac{d_1 \\cdot d_2}{2}]$`,
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 1 — Find Areas of Parallelograms and Rhombuses\n\nFind the area of each parallelogram or rhombus.\n\n### Step 1: Identify Base and Height\n\nFor a parallelogram, identify one side as the base and draw the perpendicular height to the opposite side. The height must be perpendicular to the base.\n\n### Step 2: Apply the Formula\n\nFor a parallelogram: $[A = bh]$\nFor a rhombus: $[A = \\frac{d_1 \\cdot d_2}{2}]$\n\nFind the area of a parallelogram with base 10 centimeters and height 7 centimeters.\n\\[A = bh\\]\n\\[A = 10 \\cdot 7\\]\n\\[A = 70 \\text{ cm}^2\\]\n\nFind the area of a rhombus with diagonals measuring 8 inches and 6 inches.\n\\[A = \\frac{d_1 \\cdot d_2}{2}\\]\n\\[A = \\frac{8 \\cdot 6}{2}\\]\n\\[A = 24 \\text{ in}^2\\]\n\nFind the area of a rhombus with diagonals measuring 12 meters and 10 meters.\n\\[A = \\frac{d_1 \\cdot d_2}{2}\\]\n\\[A = \\frac{12 \\cdot 10}{2}\\]\n\\[A = 60 \\text{ m}^2\\]\n\nFind the area of a parallelogram with base 9 feet and height 11 feet.\n\\[A = bh\\]\n\\[A = 9 \\cdot 11\\]\n\\[A = 99 \\text{ ft}^2\\]`,
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 2 — Find Areas of Trapezoids and Kites\n\nFind the area of each trapezoid or kite.\n\n### Step 1: Identify the Parallel Bases (for Trapezoid)\n\nFor a trapezoid, identify the two parallel sides as the bases. Find the length of each base and the perpendicular height.\n\n### Step 2: Identify the Diagonals (for Kite)\n\nFor a kite, identify the two diagonals and find their lengths.\n\n### Step 3: Apply the Formula\n\nFor a trapezoid: $[A = \\frac{b_1 + b_2}{2} \\cdot h]$\nFor a kite: $[A = \\frac{d_1 \\cdot d_2}{2}]$\n\nFind the area of a trapezoid with bases 8 inches and 12 inches, and height 5 inches.\n\\[A = \\frac{b_1 + b_2}{2} \\cdot h\\]\n\\[A = \\frac{8 + 12}{2} \\cdot 5\\]\n\\[A = 50 \\text{ in}^2\\]\n\nFind the area of a kite with diagonals 7 centimeters and 10 centimeters.\n\\[A = \\frac{d_1 \\cdot d_2}{2}\\]\n\\[A = \\frac{7 \\cdot 10}{2}\\]\n\\[A = 35 \\text{ cm}^2\\]\n\nFind the area of a trapezoid with bases 6 meters and 14 meters, and height 4 meters.\n\\[A = \\frac{b_1 + b_2}{2} \\cdot h\\]\n\\[A = \\frac{6 + 14}{2} \\cdot 4\\]\n\\[A = 40 \\text{ m}^2\\]\n\nFind the area of a kite with diagonals 9 feet and 6 feet.\n\\[A = \\frac{d_1 \\cdot d_2}{2}\\]\n\\[A = \\frac{9 \\cdot 6}{2}\\]\n\\[A = 27 \\text{ ft}^2\\]`,
          },
          {
            phaseNumber: 6,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 3 — Construction: Trapezoidal Window\n\nA contractor is replacing a trapezoidal window on the front of a house.\n\n**a.** Find the area of the window.\n\n**b.** If the glass for the window costs \\$7 per square foot, about how much should the contractor expect to pay to replace the window?\n\nThe window has a height of 3.5 feet and base lengths of 4 feet and 6 feet.\n\\[A = \\frac{b_1 + b_2}{2} \\cdot h\\]\n\\[A = \\frac{4 + 6}{2} \\cdot 3.5\\]\n\\[A = 5 \\cdot 3.5\\]\n\\[A = 17.5 \\text{ ft}^2\\]\n\nFor part b:\n\\[\\text{Cost} = 17.5 \\cdot 7 = \\$122.50\\]`,
          },
          {
            phaseNumber: 7,
            title: "Worked Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 4 — Find Areas of Parallelograms and Rhombuses\n\nFind the area of each parallelogram or rhombus.\n\nFind the area of a parallelogram with base 7 meters and height 8 meters.\n\\[A = bh\\]\n\\[A = 7 \\cdot 8\\]\n\\[A = 56 \\text{ m}^2\\]\n\nFind the area of a rhombus with diagonals measuring 10 centimeters and 6 centimeters.\n\\[A = \\frac{d_1 \\cdot d_2}{2}\\]\n\\[A = \\frac{10 \\cdot 6}{2}\\]\n\\[A = 30 \\text{ cm}^2\\]\n\nFind the area of a parallelogram with base 12 inches and height 6 inches.\n\\[A = bh\\]\n\\[A = 12 \\cdot 6\\]\n\\[A = 72 \\text{ in}^2\\]`,
          },
          {
            phaseNumber: 8,
            title: "Worked Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 5 — Find Areas of Trapezoids and Kites\n\nFind the area of each trapezoid or kite.\n\nFind the area of a trapezoid with bases 9 feet and 13 feet, and height 5 feet.\n\\[A = \\frac{b_1 + b_2}{2} \\cdot h\\]\n\\[A = \\frac{9 + 13}{2} \\cdot 5\\]\n\\[A = 55 \\text{ ft}^2\\]\n\nFind the area of a kite with diagonals 8 meters and 12 meters.\n\\[A = \\frac{d_1 \\cdot d_2}{2}\\]\n\\[A = \\frac{8 \\cdot 12}{2}\\]\n\\[A = 48 \\text{ m}^2\\]\n\nFind the area of a trapezoid with bases 7 inches and 11 inches, and height 4 inches.\n\\[A = \\frac{b_1 + b_2}{2} \\cdot h\\]\n\\[A = \\frac{7 + 11}{2} \\cdot 4\\]\n\\[A = 36 \\text{ in}^2\\]`,
          },
          {
            phaseNumber: 9,
            title: "Worked Example 6",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 6 — More Area Problems\n\nFind the area of each parallelogram, trapezoid, rhombus, or kite.\n\nFind the area of a rhombus with diagonals measuring 14 meters and 8 meters.\n\\[A = \\frac{d_1 \\cdot d_2}{2}\\]\n\\[A = \\frac{14 \\cdot 8}{2}\\]\n\\[A = 56 \\text{ m}^2\\]\n\nFind the area of a parallelogram with base 15 feet and height 9 feet.\n\\[A = bh\\]\n\\[A = 15 \\cdot 9\\]\n\\[A = 135 \\text{ ft}^2\\]\n\nFind the area of a kite with diagonals 10 centimeters and 7 centimeters.\n\\[A = \\frac{d_1 \\cdot d_2}{2}\\]\n\\[A = \\frac{10 \\cdot 7}{2}\\]\n\\[A = 35 \\text{ cm}^2\\]`,
          },
          {
            phaseNumber: 10,
            title: "Worked Example 7",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 7 — Find Diagonal Lengths\n\nThe area of a rhombus is 168 square centimeters. If one diagonal is three times as long as the other, what are the lengths of the diagonals to the nearest tenth of a centimeter?\n\nLet $d_1 = x$ and $d_2 = 3x$.\n\\[A = \\frac{d_1 \\cdot d_2}{2}\\]\n\\[168 = \\frac{x \\cdot 3x}{2}\\]\n\\[168 = \\frac{3x^2}{2}\\]\n\\[336 = 3x^2\\]\n\\[x^2 = 112\\]\n\\[x \\approx 10.6\\]\n\nSo $d_1 \\approx 10.6$ cm and $d_2 \\approx 31.8$ cm.`,
          },
          {
            phaseNumber: 11,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            content: `## Mixed Exercises\n\n- A parallelogram has a base of 15 meters and a height of 8 meters. Find the area.\n- A rhombus has diagonals of length 10 centimeters and 14 centimeters. Find the area.\n- A trapezoid has bases of 9 inches and 13 inches, and a height of 6 inches. Find the area.\n- A kite has diagonals of length 12 feet and 8 feet. Find the area.\n- A parallelogram has an area of 72 square yards and a base of 9 yards. Find the height.\n- A kite has an area of 48 square meters and one diagonal of 8 meters. Find the length of the other diagonal.\n- A trapezoid has an area of 100 square centimeters and a height of 10 centimeters. The sum of the bases is 25 centimeters. If one base is 12 centimeters, find the other base.\n- A rhombus has a perimeter of 40 centimeters. What is the length of each side?\n- Find the area of a square with a diagonal of 10 inches.\n- A parallelogram has a base of $2x + 3$ and a height of 5. Express the area in terms of $x$.\n- A kite has an area of 36 square centimeters and one diagonal is twice as long as the other. Find the lengths of the diagonals.\n- REASONING: Explain why the area formula for a rhombus $[A = \\frac{d_1 \\cdot d_2}{2}]$ works even though a rhombus is not a kite.\n- PRECISION: Find the area of a parallelogram with vertices at $(0, 0)$, $(5, 0)$, $(3, 4)$, and $(8, 4)$.\n- STRUCTURE: How is the area of a trapezoid related to the area of a parallelogram?\n- ANALYZE: If you double the height of a parallelogram while keeping the base the same, what happens to the area?\n- PERSEVERE: A trapezoid has an area of 48 square inches. The height is 6 inches, one base is 5 inches. Find the other base.\n- CREATE: Draw a kite and a rhombus that have the same area. Label all dimensions.\n- A trapezoid has a height of 8 meters, a base length of 12 meters, and an area of 64 square meters. What is the length of the other base?\n- The height of a parallelogram is 10 feet more than the length of the base. If the area is 1200 square feet, find the base and height.\n- A trapezoid has base lengths of 4 and 19 feet and an area of 115 square feet. What is the height?\n- One diagonal of a kite is twice as long as the other. If the area is 240 square inches, what are the diagonal lengths?\n- One diagonal of a kite is four times as long as the other. If the area is 72 square meters, what are the diagonal lengths?`,
          },
          {
            phaseNumber: 12,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            content: `## Review Notes\n\n- The worksheet contains image references for geometric figures that could not be fully captured. Teachers should consult the original DOCX for exact diagrams.\n- Students should verify that their height measurements are perpendicular to the base when calculating parallelogram areas.\n- The formula $[A = \\frac{d_1 \\cdot d_2}{2}]$ applies to both rhombuses and kites since both have perpendicular diagonals that bisect each other.\n- When solving real-world problems, students should identify the quadrilateral type first, then select the appropriate area formula.`,
          },
        ],
      },
      {
        slug: "module-6-lesson-2",
        title: "Areas of Regular Polygons",
        description:
          "Identify the center, radius, apothem, and central angle of a regular polygon. Find the area of regular polygons. Find the area of composite figures involving regular polygons.",
        orderIndex: 2,
        sections: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            content: `## Key Terms\n\n- **Center** — The point from which all vertices of a regular polygon are equidistant.\n- **Radius** — A segment from the center of a regular polygon to a vertex.\n- **Apothem** — A perpendicular segment from the center of a regular polygon to a side.\n- **Central Angle** — An angle formed by two radii drawn to consecutive vertices.\n- **Regular Polygon** — A polygon that is equilateral and equiangular.`,
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            content: `## Explore: Areas of Regular Polygons\n\nStudents explore how a regular polygon can be divided into congruent isosceles triangles, each with the center as a vertex and a side of the polygon as the base. The area of the polygon is the sum of the areas of these triangles.\n\nInquiry Question:\nHow can you use the formula for the area of a triangle to find the area of any regular polygon?`,
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            content: `## Learn: Areas of Regular Polygons\n\n### Key Concept: Central Angle Measure\n\nThe measure of each central angle of a regular n-gon is $[\\frac{360}{n}]$ degrees.\n\n### Key Concept: Area of a Regular Polygon\n\nThe area of a regular polygon with n sides, side length s, and apothem a is:\n\\[A = \\frac{1}{2} \\cdot \\text{Perimeter} \\cdot \\text{Apothem}\\]\n\\[A = \\frac{1}{2} \\cdot n \\cdot s \\cdot a\\]`,
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 1 — Identify Parts of Regular Polygons\n\nIn each figure, a regular polygon is inscribed in a circle. Identify the center, a radius, an apothem, and a central angle of each polygon. Then find the measure of a central angle.\n\n### Step 1: Identify the Center\n\nThe center is the point equidistant from all vertices.\n\n### Step 2: Identify the Radius\n\nA radius is a segment from the center to any vertex.\n\n\n### Step 3: Identify the Apothem\n\nThe apothem is a perpendicular segment from the center to a side.\n\n\n### Step 4: Find the Central Angle\n\nDivide 360 degrees by the number of sides: $[\\frac{360}{n}]$\n\nFor a regular hexagon, the central angle is $[\\frac{360}{6} = 60]$ degrees.\nFor a regular octagon, the central angle is $[\\frac{360}{8} = 45]$ degrees.`,
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 2 — Find Areas of Regular Polygons\n\nFind the area of each regular polygon. Round to the nearest tenth.\n\n### Step 1: Find the Perimeter\n\nMultiply the side length by the number of sides.\n\n\n### Step 2: Find the Apothem\n\nUse trigonometry if needed. The apothem is the height of each isosceles triangle formed by radii.\n\n### Step 3: Apply the Formula\n\n\\[A = \\frac{1}{2} \\cdot \\text{Perimeter} \\cdot \\text{Apothem}\\]\n\nFind the area of a regular pentagon with side length 6 centimeters and apothem 4.1 centimeters.\n\\[P = 5 \\cdot 6 = 30 \\text{ cm}\\]\n\\[A = \\frac{1}{2} \\cdot 30 \\cdot 4.1\\]\n\\[A = 61.5 \\text{ cm}^2\\]\n\n\nFind the area of a regular hexagon with side length 8 inches and apothem 6.9 inches.\n\\[P = 6 \\cdot 8 = 48 \\text{ in}\\]\n\\[A = \\frac{1}{2} \\cdot 48 \\cdot 6.9\\]\n\\[A = 165.6 \\text{ in}^2\\]\n\nFind the area of a regular octagon with side length 5 meters and apothem 6 meters.\n\\[P = 8 \\cdot 5 = 40 \\text{ m}\\]\n\\[A = \\frac{1}{2} \\cdot 40 \\cdot 6\\]\n\\[A = 120 \\text{ m}^2\\]`,
          },
          {
            phaseNumber: 6,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 3 — Area with Given Apothem\n\nFind the area of each figure. Round to the nearest tenth, if necessary.\n\n### Step 1: Calculate the Perimeter\n\nMultiply the side length by the number of sides.\n\n### Step 2: Apply the Area Formula\n\nUse $[A = \\frac{1}{2} \\cdot P \\cdot a]$ where P is perimeter and a is apothem.`,
          },
          {
            phaseNumber: 7,
            title: "Worked Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 4 — Composite Figures with Regular Polygons\n\nFind the area of each figure. Round to the nearest tenth, if necessary.\n\n### Step 1: Decompose the Figure\n\nBreak the composite figure into regular polygons and other shapes.\n\n### Step 2: Find the Area of Each Part\n\nCalculate the area of each component.\n\n### Step 3: Combine or Subtract\n\nAdd areas of combined shapes or subtract holes from larger areas.`,
          },
          {
            phaseNumber: 8,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            content: `## Mixed Exercises\n\n- LAWN: Lalita has to buy grass seed for her lawn shaped like a composite figure. Find the area.\n- PATIO: Chenoa is building a patio to surround his fire pit. Find the area of patio pavers needed.\n- Find the area of a regular hexagon with a perimeter of 72 inches. Round to the nearest square inch.\n- Draw a regular pentagon inscribed in a circle with center X, radius, apothem, and central angle.\n- Find the perimeter and area of a regular hexagon with side length 12 centimeters.\n- Find the total area of shaded regions. Round to the nearest tenth.\n- HOME IMPROVEMENT: Pilar is putting a backsplash with octagon and square tiles. Find the area of one tile sheet.\n- REASONING: Miguel's living room floor plan requires varnish and paint calculations.\n- STATE YOUR ASSUMPTION: Find the area of a shelf for 15 homerun baseballs shaped like a regular triangle.\n- USE A SOURCE: Research the Pentagon building and find its area in square feet.\n- SIGNS: A stop sign has side lengths of approximately 12.5 inches. What is the area?\n- DIAMONDS: A regular heptagon diamond with side length 6 millimeters. Find the area.\n- ARCHITECTURE: Fort Jefferson in the Florida Keys is a hexagon with side lengths of 477 feet. Find the area.\n- FRAME: A regular pentagonal picture frame with outside side lengths of 9 inches. Find the area.\n- FLOWER: An approximately regular triangular flower with side lengths of 4 centimeters. Find the area.\n- STAINED GLASS: A regular octagonal window with apothem of 14 inches. Find the area.\n- GAMING: A 12-sided die made of 12 regular pentagons with side length 1.5 centimeters. Find the area of one face.\n- HONEYCOMB: A hexagonal wax cell with height approximately 5 millimeters. Find the area.\n- FIND THE ERROR: Chenglei and Flavio want to find the area of a hexagon. Who is correct?\n- ANALYZE: Is the measure of an apothem sometimes, always, or never $[s \\cdot \\frac{\\sqrt{3}}{2}]$ where s is a side length?\n- CREATE: Draw a pair of composite figures that have the same area.\n- PERSEVERE: Consider the sequence of area diagrams. What algebraic theorem do they prove?\n- WRITE: How can you find the area of any figure?\n- WHICH ONE DOESN'T BELONG?: Find which diagram for area of regular polygons is incorrect.`,
          },
          {
            phaseNumber: 9,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            content: `## Review Notes\n\n- The DOCX contains many diagrams and images for the polygon identification and area problems. Teachers should consult the original worksheet for exact figures.\n- ![](media/) — Image references in original worksheet could not be fully captured.\n- The formula $[A = \\frac{1}{2} \\cdot \\text{Perimeter} \\cdot \\text{Apothem}]$ works for ALL regular polygons.\n- For composite figures, students should identify all regular polygon components and calculate each separately before combining.`,
          },
        ],
      },
      {
        slug: "module-6-lesson-3",
        title: "Areas of Circles and Sectors",
        description:
          "Find the area of a circle. Find the area of a sector of a circle. Solve problems involving areas of circles and sectors.",
        orderIndex: 3,
        sections: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            content: `## Key Terms\n\n- **Circle** — The set of all points in a plane that are a fixed distance (radius) from a given point (center).\n- **Radius** — A segment from the center of a circle to any point on the circle.\n- **Diameter** — A chord that passes through the center of a circle; twice the radius.\n- **Sector** — A region bounded by two radii and an arc of a circle.\n- **Arc** — A portion of the circumference of a circle.`,
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            content: `## Explore: Areas of Circles and Sectors\n\nStudents explore how the area of a circle relates to the area of a parallelogram. By dividing a circle into many thin sectors and rearranging them, the shape approximates a parallelogram with base equal to half the circumference and height equal to the radius.\n\nInquiry Question:\nHow can you derive the formula for the area of a circle from the area formula for a parallelogram?`,
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            content: `## Learn: Areas of Circles and Sectors\n\n### Key Concept: Area of a Circle\n\nThe area of a circle with radius r is:\n\\[A = \\pi \\cdot r^2\\]\n\n### Key Concept: Area of a Sector\n\nThe area of a sector with central angle x degrees is:\n\\[A = \\frac{x}{360} \\cdot \\pi \\cdot r^2\\]\n\n### Key Concept: Relating Diameter and Radius\n\n\\[d = 2r\\]\n\\[r = \\frac{d}{2}\\]`,
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 1 — Find the Area of a Circle\n\nFind the area of each circle. Round to the nearest tenth.\n\n### Step 1: Identify the Radius or Diameter\n\nRead the problem to find either the radius directly or the diameter from which you can calculate the radius.\n\n\n### Step 2: Apply the Area Formula\n\n\\[A = \\pi \\cdot r^2\\]\n\nIf the radius is 5 inches:\n\\[A = \\pi \\cdot 5^2\\]\n\\[A = 25\\pi\\]\n\\[A = 78.5 \\text{ in}^2\\]\n\n\nIf the diameter is 10 centimeters:\n\\[r = \\frac{10}{2} = 5 \\text{ cm}\\]\n\\[A = \\pi \\cdot 5^2\\]\n\\[A = 78.5 \\text{ cm}^2\\]\n\nDINING: Maricela is making a tablecloth for a circular table with diameter 8 feet.\na. Find the area of the tabletop. Round to the nearest tenth.\n\\[r = \\frac{8}{2} = 4 \\text{ ft}\\]\n\\[A = \\pi \\cdot 4^2 = 16\\pi = 50.3 \\text{ ft}^2\\]\nb. If a square yard of fabric costs \\$13.99, what is the minimum cost?\n\\[A = 50.3 \\text{ ft}^2 = 50.3/9 \\text{ yd}^2 = 5.59 \\text{ yd}^2\\]\n\\[\\text{Cost} = 5.59 \\cdot 13.99 = \\$78.20\\]\n\n\nGAMES: Kiyoshi is making circular tiles with radius 2 inches. Balsa wood costs \\$1.99 per square foot.\na. Find the area of a single tile. Round to the nearest tenth.\n\\[A = \\pi \\cdot 2^2 = 4\\pi = 12.6 \\text{ in}^2\\]\nb. Cost for 30 tiles:\n\\[30 \\cdot 12.6 = 378 \\text{ in}^2 = 378/144 \\text{ ft}^2 = 2.625 \\text{ ft}^2\\]\n\\[\\text{Cost} = 2.625 \\cdot 1.99 = \\$5.22\\]\n\nPORTHOLES: A circular window with radius 8 inches. Find the area of glass needed.\n\\[A = \\pi \\cdot 8^2 = 64\\pi = 201.06 \\text{ in}^2\\]`,
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 2 — Find Diameter, Radius, or Area Given One Measure\n\nFind the indicated measure. Round to the nearest tenth.\n\n### Step 1: Use the Appropriate Formula\n\nIf given area, solve for radius or diameter using the area formula.\n\n### Step 2: Show All Steps\n\nWork through the algebra to isolate the unknown variable.\n\n\nFind the diameter of a circle with an area of 94 square millimeters.\n\\[A = \\pi \\cdot r^2\\]\n\\[94 = \\pi \\cdot r^2\\]\n\\[r^2 = \\frac{94}{\\pi}\\]\n\\[r = \\sqrt{\\frac{94}{\\pi}} = 5.5 \\text{ mm}\\]\n\\[d = 2r = 11 \\text{ mm}\\]\n\n\nThe area of a circle is 132.7 square centimeters. Find the diameter.\n\\[132.7 = \\pi \\cdot r^2\\]\n\\[r^2 = \\frac{132.7}{\\pi}\\]\n\\[r = 6.5 \\text{ cm}\\]\n\\[d = 13 \\text{ cm}\\]\n\nThe area of a circle is 112 square inches. Find the radius.\n\\[112 = \\pi \\cdot r^2\\]\n\\[r^2 = \\frac{112}{\\pi}\\]\n\\[r = 6.0 \\text{ in}\\]\n\nFind the diameter of a circle with area 1134.1 square millimeters.\n\\[1134.1 = \\pi \\cdot r^2\\]\n\\[r = \\sqrt{\\frac{1134.1}{\\pi}} = 19.0 \\text{ mm}\\]\n\\[d = 38.0 \\text{ mm}\\]\n\n\nThe area of a circle is 706.9 square inches. Find the radius.\n\\[r = \\sqrt{\\frac{706.9}{\\pi}} = 15.0 \\text{ in}\\]\n\nFind the radius of a circle with area 2827.4 square feet.\n\\[r = \\sqrt{\\frac{2827.4}{\\pi}} = 30.0 \\text{ ft}\\]`,
          },
          {
            phaseNumber: 6,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 3 — Find the Area of a Sector\n\nFind the area of each shaded sector. Round to the nearest tenth.\n\n### Step 1: Find the Radius\n\nIdentify the radius of the circle from the diagram or given information.\n\n### Step 2: Find the Central Angle\n\nRead the measure of the arc or central angle that bounds the sector.\n\n### Step 3: Apply the Sector Area Formula\n\n\\[A = \\frac{x}{360} \\cdot \\pi \\cdot r^2\\]\n\nFind the area of a sector with radius 6 inches and central angle 60 degrees.\n\\[A = \\frac{60}{360} \\cdot \\pi \\cdot 6^2\\]\n\\[A = \\frac{1}{6} \\cdot 36\\pi\\]\n\\[A = 6\\pi = 18.8 \\text{ in}^2\\]\n\nFind the area of a sector with radius 4 centimeters and central angle 90 degrees.\n\\[A = \\frac{90}{360} \\cdot \\pi \\cdot 4^2\\]\n\\[A = \\frac{1}{4} \\cdot 16\\pi\\]\n\\[A = 4\\pi = 12.6 \\text{ cm}^2\\]\n\nSPINNERS: Jeremy wants to make a spinner divided into 8 congruent pieces. What is the area of each piece?\n\\[\\text{Central angle} = \\frac{360}{8} = 45 \\text{ degrees}\\]\n\\[A = \\frac{45}{360} \\cdot \\pi \\cdot r^2\\]\n`,
          },
          {
            phaseNumber: 7,
            title: "Worked Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 4 — Find the Area of a Circle Containing a Sector\n\nFind the area of the circle that contains each sector. Round to the nearest tenth, if necessary.\n\n### Step 1: Use the Sector Area Formula in Reverse\n\nIf a sector has area A and central angle x, the whole circle area can be found:\n\\[A_{\\text{circle}} = A_{\\text{sector}} \\cdot \\frac{360}{x}\\]\n\n### Step 2: Verify with Radius if Possible\n\nIf the sector's radius is known, you can also use $[A = \\pi \\cdot r^2]$ directly.\n\nOne sector has an area of 210 square centimeters and arc measure of 30 degrees.\n\\[A_{\\text{circle}} = 210 \\cdot \\frac{360}{30}\\]\n\\[A_{\\text{circle}} = 210 \\cdot 12\\]\n\\[A_{\\text{circle}} = 2520 \\text{ cm}^2\\]\n\nOne sector has an area of 65 square feet and arc measure of 270 degrees.\n\\[A_{\\text{circle}} = 65 \\cdot \\frac{360}{270}\\]\n\\[A_{\\text{circle}} = 65 \\cdot \\frac{4}{3}\\]\n\\[A_{\\text{circle}} = 86.7 \\text{ ft}^2\\]\n\n\nOne sector has an area of 325 square millimeters and arc measure of 72 degrees.\n\\[A_{\\text{circle}} = 325 \\cdot \\frac{360}{72}\\]\n\\[A_{\\text{circle}} = 325 \\cdot 5\\]\n\\[A_{\\text{circle}} = 1625 \\text{ mm}^2\\]\n\n\nOne sector has an area of 167 square inches and arc measure of 110 degrees.\n\\[A_{\\text{circle}} = 167 \\cdot \\frac{360}{110}\\]\n\\[A_{\\text{circle}} = 167 \\cdot 3.27\\]\n\\[A_{\\text{circle}} = 546.1 \\text{ in}^2\\]\n\nOne sector has an area of 98 square meters and arc measure of 40 degrees.\n\\[A_{\\text{circle}} = 98 \\cdot \\frac{360}{40}\\]\n\\[A_{\\text{circle}} = 98 \\cdot 9\\]\n\\[A_{\\text{circle}} = 882 \\text{ m}^2\\]\n\nOne sector has an area of 412 square inches and arc measure of 82 degrees.\n\\[A_{\\text{circle}} = 412 \\cdot \\frac{360}{82}\\]\n\\[A_{\\text{circle}} = 412 \\cdot 4.39\\]\n\\[A_{\\text{circle}} = 1808.7 \\text{ in}^2\\]`,
          },
          {
            phaseNumber: 8,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            content: `## Mixed Exercises\n\n- LOBBY: A circular table with diameter 15 feet. Find the area. If a floral arrangement with diameter 2 feet is added, how much space remains?\n- STRUCTURE: A stained-glass circle separated into 3 equal sectors with the bottom sector divided equally in two.\n- SOUP CAN: Cover the top and bottom of a cylindrical can with diameter 7.5 centimeters. Find total area.\n- POOL: A circular pool surrounded by a 3-foot-wide sidewalk with diameter 26 feet. Find areas.\n- REASONING: Explain how to find the area of the shaded region.\n- REGULARITY: A sector has area A and central angle x degrees. Explain how to find the area of the whole circle.\n- PIE: One sector of apple pie has area 8 square inches and arc measure 45 degrees. Find the area of the pie.\n- USE ESTIMATION: A lawn sprinkler sprays water in an arc with sector area approximately 235.6 square feet.\n- PRECISION: Luciano wants to use sectors of different circles for a mural. Find areas and star counts.\n- FIND THE ERROR: Ketria and Colton want to find the area of a shaded region. Who is correct?\n- PERSEVERE: Find the area of the shaded region.\n- ANALYZE: Is the area of a sector sometimes, always, or never greater than the area of its corresponding segment?\n- WRITE: Describe two methods to find the area of the shaded region of a circle.\n- PERSEVERE: Derive the formula for the area of a sector using the arc length formula.\n- CREATE: Draw a circle with a shaded sector and find its area.`,
          },
          {
            phaseNumber: 9,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            content: `## Review Notes\n\n- ![](media/) — Image references for diagrams in the original DOCX could not be fully captured. Teachers should consult the original worksheet for figures.\n- Remember: sector area is a fraction of the whole circle's area, determined by the ratio of the central angle to 360 degrees.\n- When finding the radius or diameter from a given area, divide by pi first, then take the square root.`,
          },
        ],
      },
      {
        slug: "module-6-lesson-4",
        title: "Surface Area",
        description:
          "Find lateral areas and surface areas of prisms, cylinders, pyramids, and cones. Find surface areas of spheres. Solve real-world problems involving surface area.",
        orderIndex: 4,
        sections: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            content: `## Key Terms\n\n- **Surface Area** — The total area of all faces of a three-dimensional figure.\n- **Lateral Area** — The sum of the areas of the lateral faces of a prism or pyramid.\n- **Prism** — A polyhedron with two parallel, congruent bases and rectangular lateral faces.\n- **Cylinder** — A solid with two parallel, congruent circular bases.\n- **Pyramid** — A polyhedron with one base and triangular lateral faces meeting at a vertex.\n- **Cone** — A solid with one circular base and a curved lateral surface meeting at a vertex.\n- **Sphere** — The set of all points equidistant from a center point in three-dimensional space.`,
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            content: `## Explore: Surface Area\n\nStudents explore how to find the surface area of three-dimensional figures by identifying all faces and their dimensions. For prisms and pyramids, this involves finding the area of each face. For cylinders and cones, curved surface area formulas are used.\n\nInquiry Question:\nHow does finding the surface area of a three-dimensional figure compare to finding the area of a two-dimensional figure?`,
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            content: `## Learn: Surface Area\n\n### Key Concept: Lateral Area and Surface Area of a Prism\n\n- Lateral Area of a right prism: $[L = \\text{Perimeter of base} \\cdot \\text{height}]$\n- Surface Area: $[SA = L + 2B]$ where B is the area of the base\n\n### Key Concept: Lateral Area and Surface Area of a Cylinder\n\n- Lateral Area: $[L = 2\\pi \\cdot r \\cdot h]$\n- Surface Area: $[SA = 2\\pi \\cdot r \\cdot h + 2\\pi \\cdot r^2]$\n\n\n### Key Concept: Lateral Area and Surface Area of a Pyramid\n\n- Lateral Area: $[L = \\frac{1}{2} \\cdot \\text{Perimeter of base} \\cdot \\text{slant height}]$\n- Surface Area: $[SA = L + B]$\n\n\n### Key Concept: Lateral Area and Surface Area of a Cone\n\n- Lateral Area: $[L = \\pi \\cdot r \\cdot l]$ where l is the slant height\n- Surface Area: $[SA = \\pi \\cdot r \\cdot l + \\pi \\cdot r^2]$\n\n### Key Concept: Surface Area of a Sphere\n\n- Surface Area: $[SA = 4\\pi \\cdot r^2]$`,
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 1 — Surface Area of Prisms\n\nFind the lateral area and surface area of each prism. Round to the nearest tenth, if necessary.\n\n\n### Step 1: Find the Perimeter and Area of the Base\n\nCalculate these from the given base dimensions.\n\n### Step 2: Find the Lateral Area\n\nMultiply the perimeter of the base by the height of the prism.\n\n### Step 3: Find the Surface Area\n\nAdd twice the base area to the lateral area: $[SA = L + 2B]$\n\nA rectangular prism with length 5 cm, width 3 cm, and height 4 cm:\n\\[P = 2(5 + 3) = 16 \\text{ cm}\\]\n\\[L = 16 \\cdot 4 = 64 \\text{ cm}^2\\]\n\\[B = 5 \\cdot 3 = 15 \\text{ cm}^2\\]\n\\[SA = 64 + 2(15) = 94 \\text{ cm}^2\\]\n\n\nA triangular prism with base area 12 in², base perimeter 16 in, and height 8 in:\n\\[L = 16 \\cdot 8 = 128 \\text{ in}^2\\]\n\\[SA = 128 + 2(12) = 152 \\text{ in}^2\\]`,
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 2 — Surface Area of Cylinders\n\nFind the lateral area and surface area of each cylinder. Round to the nearest tenth, if necessary.\n\n### Step 1: Find the Lateral Area\n\n\\[L = 2\\pi \\cdot r \\cdot h\\]\n\n\n### Step 2: Find the Surface Area\n\n\\[SA = 2\\pi \\cdot r \\cdot h + 2\\pi \\cdot r^2\\]\n\n\nA cylinder with radius 3 cm and height 7 cm:\n\\[L = 2\\pi \\cdot 3 \\cdot 7 = 42\\pi = 131.9 \\text{ cm}^2\\]\n\\[SA = 42\\pi + 2\\pi \\cdot 9 = 42\\pi + 18\\pi = 60\\pi = 188.5 \\text{ cm}^2\\]`,
          },
          {
            phaseNumber: 6,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 3 — Surface Area of Prisms with Variables\n\nFind the surface area in terms of x.\n\n\nPAINTING: Greg is painting the four walls of his bedroom and the ceiling. The height of the walls is x and the edge length of the square ceiling is 2x.\na. Surface area in terms of x:\n\\[\\text{Wall area} = 4 \\cdot (x \\cdot 2x) = 8x^2\\]\n\\[\\text{Ceiling area} = (2x)^2 = 4x^2\\]\n\\[\\text{Total} = 12x^2\\]\nb. If x = 8 feet:\n\\[\\text{Total} = 12 \\cdot 64 = 768 \\text{ ft}^2\\]`,
          },
          {
            phaseNumber: 7,
            title: "Worked Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 4 — Surface Area of Pyramids\n\nFind the lateral area and surface area of each pyramid. Round to the nearest tenth, if necessary.\n\n\n### Step 1: Find the Perimeter of the Base\n\nCalculate the perimeter from the base dimensions.\n\n\n### Step 2: Find the Lateral Area\n\n\\[L = \\frac{1}{2} \\cdot P \\cdot \\text{slant height}\\]\n\n### Step 3: Find the Surface Area\n\n\\[SA = L + B\\]\n\n\nA square pyramid with base side 6 m and slant height 5 m:\n\\[P = 4 \\cdot 6 = 24 \\text{ m}\\]\n\\[L = \\frac{1}{2} \\cdot 24 \\cdot 5 = 60 \\text{ m}^2\\]\n\\[B = 6^2 = 36 \\text{ m}^2\\]\n\\[SA = 60 + 36 = 96 \\text{ m}^2\\]`,
          },
          {
            phaseNumber: 8,
            title: "Worked Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 5 — Surface Area of Cones\n\nFind the lateral area and surface area of each cone. Round to the nearest tenth, if necessary.\n\n\n### Step 1: Find the Slant Height if Not Given\n\nUse the Pythagorean Theorem if needed: $[l = \\sqrt{r^2 + h^2}]$\n\n### Step 2: Apply the Formulas\n\n\\[L = \\pi \\cdot r \\cdot l\\]\n\\[SA = \\pi \\cdot r \\cdot l + \\pi \\cdot r^2\\]\n\n\nA cone with radius 4 cm and slant height 9 cm:\n\\[L = \\pi \\cdot 4 \\cdot 9 = 36\\pi = 113.1 \\text{ cm}^2\\]\n\\[SA = 36\\pi + 16\\pi = 52\\pi = 163.4 \\text{ cm}^2\\]`,
          },
          {
            phaseNumber: 9,
            title: "Worked Example 6",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 6 — Surface Area of Cones with Variables\n\nMANUFACTURING: A cylindrical package with radius x and height x + 4. Find surface area that is cardboard (lateral area + bottom):\n\\[L = 2\\pi \\cdot x \\cdot (x + 4) = 2\\pi(x^2 + 4x)\\]\n\\[\\text{Bottom} = \\pi \\cdot x^2\\]\n\\[\\text{Cardboard area} = 3\\pi \\cdot x^2 + 8\\pi \\cdot x\\]\nIf x = 6 cm:\n\\[= 3\\pi(36) + 8\\pi(6) = 108\\pi + 48\\pi = 156\\pi = 490.1 \\text{ cm}^2\\]\n\nCAMPING: A tent shaped like a square pyramid with base x and slant height 1.5x. Find sidewall area:\n\\[P = 4x\\]\n\\[L = \\frac{1}{2} \\cdot 4x \\cdot 1.5x = 3x^2\\]\nIf x = 9 ft:\n\\[L = 3(81) = 243 \\text{ ft}^2\\]\n\n\nTOPIARY: A bush shaped like a cone with radius x and slant height 4x. Find lateral area:\n\\[L = \\pi \\cdot x \\cdot 4x = 4\\pi \\cdot x^2\\]\nSurface area of slipcover (no base):\n\\[SA = \\pi \\cdot x \\cdot 4x = 4\\pi \\cdot x^2\\]\nIf x = 0.75 m:\n\\[SA = 4\\pi(0.5625) = 7.1 \\text{ m}^2\\]`,
          },
          {
            phaseNumber: 10,
            title: "Worked Example 7",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 7 — Surface Area of Spheres\n\nFind the surface area of each sphere to the nearest tenth.\n\n\n### Step 1: Identify the Radius\n\nUse the given radius or diameter to find the radius.\n\n\n### Step 2: Apply the Sphere Formula\n\n\\[SA = 4\\pi \\cdot r^2\\]\n\nA sphere with radius 5 cm:\n\\[SA = 4\\pi \\cdot 25 = 100\\pi = 314.2 \\text{ cm}^2\\]\n\n\nMOONS OF SATURN: Titan has radius about 2575 kilometers. Find surface area:\n\\[SA = 4\\pi \\cdot (2575)^2\\]\n\\[SA = 4\\pi \\cdot 6,630,625\\]\n\\[SA = 83,304,588 \\text{ km}^2\\]`,
          },
          {
            phaseNumber: 11,
            title: "Worked Example 8",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 8 — Surface Area from Circumference\n\nFind the surface area in terms of pi.\n\n\n### Step 1: Find the Radius from Circumference\n\n\\[C = 2\\pi \\cdot r\\] so \\[r = \\frac{C}{2\\pi}\\]\n\n### Step 2: Apply the Sphere Formula\n\nAMUSEMENT PARK: Spaceship Earth has circumference $[C]$. Find surface area in terms of $[C]$ and $[\\pi]$:\n\\[r = \\frac{C}{2\\pi}\\]\n\\[SA = 4\\pi \\cdot (\\frac{C}{2\\pi})^2\\]\n\\[SA = 4\\pi \\cdot \\frac{C^2}{4\\pi^2}\\]\n\\[SA = \\frac{C^2}{\\pi}\\]\n\nBILLIARDS: An eight-ball with circumference $[C]$. Find surface area in terms of $[C]$ and $[\\pi]$:\n\\[SA = \\frac{C^2}{\\pi}\\]`,
          },
          {
            phaseNumber: 12,
            title: "Worked Example 9",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 9 — Surface Area of Composite Solids\n\nFind the surface area of each figure to the nearest tenth.\n\n### Step 1: Identify All Components\n\nBreak the composite solid into simpler shapes.\n\n### Step 2: Find Each Surface Area\n\nCalculate the surface area of each component.\n\n\n### Step 3: Combine Appropriately\n\nAdd areas that are exposed, subtract areas that are joined.\n\nTHEATER: Carlos is building a tower prop that is a hollow cylinder with no base. Radius is 2.5 feet.\n\\[\\text{Lateral area of outside} = 2\\pi \\cdot 2.5 \\cdot h\\]\n\\[\\text{Lateral area of inside} = 2\\pi \\cdot 2.5 \\cdot h\\]\n\\[\\text{Top ring area} = \\pi \\cdot (R^2 - r^2)\\]\n\\[\\text{Total} = 2\\pi \\cdot 2.5 \\cdot h + 2\\pi \\cdot 2.5 \\cdot h + \\text{top ring}\\]`,
          },
          {
            phaseNumber: 13,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            content: `## Mixed Exercises\n\n- STATE YOUR ASSUMPTION: Maddie is painting a shed. Approximate surface area.\n- STRUCTURE: A cylinder has lateral area 120π m² and height 7 m. Find the radius.\n- Find lateral and surface areas of various solids: triangular prism, square pyramid, hexagonal pyramid, cones.\n- GREAT CIRCLE: Find surface area of sphere with great circle circumference 2 cm and great circle area 32 ft².\n- GREENHOUSE: Reina's greenhouse is a square pyramid with all edges 6 feet. Find total surface area including floor.\n- PAPER MODELS: A net is cut and folded into a pyramid. Find surface area.\n- CAKES: A rectangular prism cake with frosting on sides and top. Find surface area with frosting.\n- CONSTRUCTION: A metal pipe shaped like a cylinder with height 50 in and radius 6 in. Find surface area.\n- INSTRUMENTS: A mute formed by cutting a cone. Find surface areas of original cone, removed cone, and mute.\n- USE A MODEL: Find total surface area of a sofa for a fitted cover.\n- REASONING: Jaylen builds a sphere inside a cube. Find surface areas and ratio.\n- CONSTRUCT ARGUMENTS: A cone and square pyramid have same surface area and same base area. Do they have same slant height?\n- ANALYZE: Is the surface area of a cone sometimes, always, or never less than a cylinder of same radius and height?\n- WRITE: Compare and contrast finding surface area of a prism and a cylinder.\n- CREATE: Give an example of two cylinders with same lateral area but different surface areas.\n- PERSEVERE: Find general formula for total surface area of a right prism with equilateral triangle base.\n- WRITE: Compare lateral areas of square prism and triangular prism with same height.`,
          },
          {
            phaseNumber: 14,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            content: `## Review Notes\n\n- ![](media/) — Image references for the many solid figures in the worksheet could not be fully captured.\n- For composite solids, be careful to only count exposed surfaces.\n- When a cylinder has no top or bottom, do not include those areas in surface area.\n- The slant height of a cone is different from its vertical height — use the Pythagorean Theorem to find slant height when only vertical height is given.`,
          },
        ],
      },
      {
        slug: "module-6-lesson-5",
        title: "Cross Sections and Solids of Revolution",
        description:
          "Describe planes of symmetry for three-dimensional solids. Identify shapes of cross sections. Identify solids formed by rotating two-dimensional shapes about an axis. Determine whether objects have axis symmetry.",
        orderIndex: 5,
        sections: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            content: `## Key Terms\n\n- **Plane of Symmetry** — A plane that divides a three-dimensional figure into two mirror-image halves.\n- **Cross Section** — The intersection of a plane with a three-dimensional solid.\n- **Solid of Revolution** — A three-dimensional solid created by rotating a two-dimensional shape around an axis.\n- **Axis Symmetry** — Symmetry around a line (axis); rotating the object around that line leaves it unchanged.\n- **Axis of Rotation** — The line around which a two-dimensional shape is rotated to create a solid of revolution.`,
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            content: `## Explore: Cross Sections and Solids of Revolution\n\nStudents explore how two-dimensional slices of three-dimensional solids can reveal information about the solid's structure. They also explore how rotating a two-dimensional shape around an axis creates a three-dimensional solid.\n\nInquiry Question:\nWhat cross sections are possible when you slice a cube? How does rotating different shapes about different axes create different solids?`,
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            content: `## Learn: Cross Sections and Solids of Revolution\n\n### Key Concept: Planes of Symmetry\n\nA plane of symmetry divides a solid into two congruent halves that are mirror images of each other.\n\n### Key Concept: Cross Sections\n\nThe shape of a cross section depends on the orientation of the cutting plane relative to the solid's bases and faces.\n\n### Key Concept: Solids of Revolution\n\nRotating a shape around an axis creates a solid. The shape of the resulting solid depends on both the original shape and the axis of rotation.`,
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 1 — Planes of Symmetry\n\nDescribe each plane of symmetry for each solid.\n\n\n### Step 1: Identify Symmetry Planes\n\nLook for ways to divide the solid into two equal halves.\n\n\n### Step 2: Describe Each Plane\n\nA rectangular prism has 3 planes of symmetry: one through the length, one through the width, and one through the height (each dividing the prism into two congruent halves).\n\nA cylinder has infinitely many planes of symmetry if it is a right circular cylinder — any plane containing the central axis.\n\nA cone has planes of symmetry that contain the central axis.\n\nA sphere has infinitely many planes of symmetry — any plane through the center.`,
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 2 — Identify Cross Section Shapes\n\nIdentify the shape of each cross section.\n\n### Step 1: Identify the Cutting Direction\n\nDetermine whether the cut is parallel or perpendicular to the base, or at some other angle.\n\n### Step 2: Match the Shape to the Solid\n\nA slice parallel to the base of a pyramid gives a smaller similar shape.\nA slice perpendicular to the base gives a triangle (for a pyramid) or rectangle (for a prism).\nA diagonal slice gives various quadrilaterals or triangles.\n\nCross sections can be: triangles, rectangles, squares, pentagons, hexagons, circles, ellipses.`,
          },
          {
            phaseNumber: 6,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 3 — Identify Solids of Revolution\n\nIdentify the solid formed by rotating the two-dimensional shape about each line.\n\n### Step 1: Visualize the Rotation\n\nThink about what the shape would look like if spun around the given axis.\n\n### Step 2: Match to Known Solids\n\nRotating a rectangle about one side creates a cylinder.\nRotating a right triangle about one leg creates a cone.\nRotating a semicircle about its diameter creates a sphere.\nRotating a rectangle about its diagonal creates a cylinder with an oblique appearance.\nRotating a trapezoid about its parallel side creates a truncated cone (frustum).`,
          },
          {
            phaseNumber: 7,
            title: "Worked Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 4 — Axis Symmetry\n\nDetermine whether each item has axis symmetry. Write yes or no.\n\n\n### Step 1: Identify the Axis\n\nLook for a central line around which the object could rotate.\n\n### Step 2: Check if Rotation Leaves the Object Unchanged\n\nIf rotating the object around an axis produces the same appearance, it has axis symmetry.\n\n\nA traffic cone with a base: Yes — any rotation around its central vertical axis leaves it unchanged.\n\nA one pound weight: Yes — a standard weight has axis symmetry around its central vertical axis.\n\n\nA flower petal and stem: No — the petal is not symmetric around the stem axis.\n\nA golf ball: Yes — rotation around any axis through the center leaves it appearing the same (if the dimples are uniform).\n\n\nA tree: Generally No — most trees are not perfectly symmetric around a central axis.\n\n\nA lamp: It depends on the lamp design. A symmetrical lamp shade would have axis symmetry.`,
          },
          {
            phaseNumber: 8,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            content: `## Mixed Exercises\n\nFor Exercises 18 and 19, refer to the solid shown.\n\n- Name the shape of the cross section cut parallel to the base.\n- Name the shape of the cross section cut perpendicular to the base.\n\nSketch the cross section from a vertical slice of the solid shown.\n\nReshan rotated a semicircle about a vertical axis to create a sphere. Describe another way Reshan could have rotated a semicircle about an axis to generate a sphere.\n\nWASHER: Describe the two-dimensional shape and axis that could be used to generate the washer by rotating the two-dimensional shape around the axis.\n\n\nTRIANGLES: Sallie is going to rotate the right triangle around the axis shown. Describe a real-world object that could be generated.\n\nREASONING: The rectangle shown will be rotated about the x-axis.\na. Describe the three-dimensional shape that is generated.\nb. What is the length of the radius and height of the figure generated?\n\nUSE TOOLS: Determine whether each cross section can be made from a cube. If so, sketch the cube and its cross section.\na. triangle b. square c. rectangle d. pentagon e. hexagon f. octagon\n\nUSE A SOURCE: Research the shape and dimensions of the Washington Monument.\na. Describe each plane of symmetry of the Washington Monument.\nb. Describe the cross section from a vertical slice perpendicular to the base through the vertex.\nc. Determine if the Washington Monument has axis symmetry. Write yes or no.\n\n\nIdentify and sketch the cross section of an object made by each cut described.\n\n\n- square pyramid cut perpendicular to base but not through the vertex\n- rectangular prism cut diagonally from a top edge to a bottom edge on the opposite side\n\nYou want to cut each geometric object so that the cross section is a circle. Give the name for each object. Then describe the cut that results in a circle.\n\nSketch and describe the object that is created by rotating each shape around the indicated axis of rotation.\n\n\nCONSTRUCT ARGUMENTS: A regular polyhedron has axis symmetry of order 3, but does not have plane symmetry. What is the figure? Justify your argument.\n\n\nPERSEVERE: The figure at the right is a cross section of a geometric solid. Describe a solid and how the cross section was made.\n\nWRITE: A hexagonal pyramid is sliced through the vertex and the base so that the prism is separated into two congruent parts. Describe the cross section. Is there more than one way to separate the figure into two congruent parts? Will the shape of the cross section change? Explain.\n\nCREATE: Sketch a real-world object that has plane symmetry, but not axis symmetry.\n\nANALYZE: Determine whether the statement below is true or false. Justify your argument.\n"The only two shapes formed by the cross sections of a square pyramid are a triangle and a square."`,
          },
          {
            phaseNumber: 9,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            content: `## Review Notes\n\n- ![](media/) — Image references for the many cross section and rotation diagrams in the worksheet could not be fully captured. Teachers should consult the original DOCX for exact figures.\n- Cross sections are named by their shape: triangle, rectangle, square, pentagon, hexagon, circle, ellipse.\n- When a shape is rotated about an axis, points on the axis remain fixed while all other points trace circles.\n- A solid can have multiple different cross sections depending on how you slice it.`,
          },
        ],
      },
      {
        slug: "module-6-lesson-6",
        title: "Volumes of Prisms and Pyramids",
        description:
          "Find volumes of prisms. Find volumes of pyramids. Find volumes of composite solids. Solve real-world problems involving volume.",
        orderIndex: 6,
        sections: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            content: `## Key Terms\n\n- **Volume** — The amount of space occupied by a three-dimensional solid.\n- **Prism** — A polyhedron with two parallel, congruent bases and rectangular lateral faces.\n- **Pyramid** — A polyhedron with one base and triangular lateral faces meeting at a vertex.\n- **Composite Solid** — A three-dimensional solid made up of two or more simpler solids.\n- **Base** — A congruent, parallel face of a prism or pyramid.`,
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            content: `## Explore: Volumes of Prisms and Pyramids\n\nStudents explore the relationship between the volumes of prisms and pyramids that share the same base and height. They discover that the volume of a pyramid is exactly one-third the volume of a prism with the same base and height.\n\n\nInquiry Question:\nWhy is the volume of a pyramid one-third the volume of a prism with the same base and height?`,
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            content: `## Learn: Volumes of Prisms and Pyramids\n\n### Key Concept: Volume of a Prism\n\nThe volume of a prism is the area of the base multiplied by the height:\n\\[V = B \\cdot h\\]\nwhere B is the area of the base.\n\n### Key Concept: Volume of a Pyramid\n\nThe volume of a pyramid is one-third the area of the base multiplied by the height:\n\\[V = \\frac{1}{3} \\cdot B \\cdot h\\]\n\n### Key Concept: Volume of a Composite Solid\n\nFind the volume of each component and add them together (or subtract holes).`,
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 1 — Volume of Prisms\n\nFind the volume of each prism. Round to the nearest tenth, if necessary.\n\n### Step 1: Find the Area of the Base\n\nCalculate the base area using the appropriate formula for the base shape.\n\n\n### Step 2: Multiply by the Height\n\n\\[V = B \\cdot h\\]\n\nA rectangular prism with length 5 cm, width 3 cm, and height 4 cm:\n\\[V = 5 \\cdot 3 \\cdot 4 = 60 \\text{ cm}^3\\]\n\n\nA triangular prism with base area 12 in² and height 8 in:\n\\[V = 12 \\cdot 8 = 96 \\text{ in}^3\\]`,
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 2 — Volume of Pyramids\n\nFind the volume of each pyramid. Round to the nearest tenth, if necessary.\n\n### Step 1: Find the Area of the Base\n\nCalculate the base area.\n\n\n### Step 2: Multiply by Height and Divide by 3\n\n\\[V = \\frac{1}{3} \\cdot B \\cdot h\\]\n\nA square pyramid with base side 6 m and height 4 m:\n\\[B = 6^2 = 36 \\text{ m}^2\\]\n\\[V = \\frac{1}{3} \\cdot 36 \\cdot 4 = 48 \\text{ m}^3\\]`,
          },
          {
            phaseNumber: 6,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 3 — Volume with Variables\n\nFind the volume in terms of x.\n\n\nCHOCOLATE: Leah wants to calculate the volume of chocolate in her candy bar.\na. Find the volume in terms of x.\nb. Find the volume if x = 2 inches.\n\nCANDLE: Benton wants to calculate the volume of wax needed for a candle.\na. Find the volume in terms of x.\nb. Find the volume if x = 3 centimeters.`,
          },
          {
            phaseNumber: 7,
            title: "Worked Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 4 — More Volume Problems\n\nFind the volume of each prism or pyramid. Round to the nearest tenth, if necessary.\n\nWork through problems involving various base shapes including rectangles, triangles, and regular polygons.`,
          },
          {
            phaseNumber: 8,
            title: "Worked Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 5 — Volume of Pyramids with Variables\n\nFind the volume in terms of x.\n\nSAND ART: Noelle wants to calculate the volume of sand in a regular hexagonal pyramid.\na. Find the volume in terms of x.\nb. Find the volume if x = 5 inches.\n\nPUZZLE: A puzzle shaped like a pyramid with square base and height 5x units.\na. Find the volume in terms of x.\nb. Find the volume if x = 10 centimeters.`,
          },
          {
            phaseNumber: 9,
            title: "Worked Example 6",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 6 — Volume of Composite Solids\n\nFind the volume of each composite solid. Round to the nearest tenth, if necessary.\n\n### Step 1: Decompose the Solid\n\nBreak the composite solid into recognizable prisms, pyramids, cylinders, cones, or spheres.\n\n### Step 2: Find Each Volume\n\nCalculate the volume of each component.\n\n### Step 3: Combine the Volumes\n\nAdd all component volumes to find the total volume.`,
          },
          {
            phaseNumber: 10,
            title: "Worked Example 7",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 7 — Volume of Frames\n\nFRAMES: Margaret makes a square frame out of four pieces of wood. Each piece is a rectangular prism with length 40 cm, height 4 cm, and depth 6 cm. What is the total volume of wood?\n\\[\\text{Volume of one piece} = 40 \\cdot 4 \\cdot 6 = 960 \\text{ cm}^3\\]\n\\[\\text{Total volume} = 4 \\cdot 960 = 3840 \\text{ cm}^3\\]\n\n\nPARKS: Find the volume of a trashcan shaped like a composite solid.`,
          },
          {
            phaseNumber: 11,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            content: `## Mixed Exercises\n\n- A rectangular prism has length 16 ft, width 9 ft, and height 8 ft. Find the volume.\n- A pyramid has height 18 cm and base area 26 cm². Find the volume.\n- BENCH: A bench shaped like a block with square base 6 ft on each side and height 1 ft. Find the volume.\n- TUNNELS: A tunnel shaped like a rectangular prism, mouth 20 ft by 50 ft, length 900 ft. Find volume of rock to remove.\n- GREENHOUSES: A greenhouse shaped like a square pyramid with base side 30 yd and height 18 yd. Find the volume.\n- STAGES: A wooden stage made of oak (45 lb/ft³) in the form of a square pyramid with top sliced off. Top side 12 ft, bottom side 16 ft, height 3 ft. Find volumes and weight.\n- PRECISION: Find the volume of a triangular prism and a rectangular prism. Discuss how the formulas are similar.\n- USE A MODEL: Benjamin finds masses of baking soda (2.2 g/cm³) and corn flakes (0.12 g/cm³) in boxes with given dimensions.\n- STRUCTURE: A model pyramid has volume 270 ft³ and base area 90 ft². Find the height of a right pyramid and an oblique pyramid.\n- REASONING: Tristan makes sugar-free candies in square pyramid-shaped boxes. Find volume, price per cubic inch, and design bigger packages.\n- STRUCTURE: Anisa builds a box shaped like a right triangular prism with a secret compartment that is a pyramid.\n- FIND THE ERROR: Francisco and Valerie calculated volume of an equilateral triangular prism with height 5 and base apothem 4. Who is correct?\n- CREATE: Give an example of a pyramid and a prism with the same base and same volume.\n- ANALYZE: Make a conjecture about how many pentagonal pyramids fit inside a pentagonal prism of same height.\n- PERSEVERE: Write an equation for dimensions of a composite solid of a cube with a square pyramid on top of equal height, with volume 36 in³.`,
          },
          {
            phaseNumber: 12,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            content: `## Review Notes\n\n- ![](media/) — Image references for diagrams in the original DOCX could not be fully captured. Teachers should consult the original worksheet for figures.\n- The key relationship: a pyramid has exactly 1/3 the volume of a prism with the same base and height.\n- Volume formulas: Prism $[V = Bh]$, Pyramid $[V = \\frac{1}{3}Bh]$ where B is base area and h is height.\n- When finding volume of composite solids, be careful to identify all components and whether volumes should be added or subtracted.`,
          },
        ],
      },
      {
        slug: "module-6-lesson-7",
        title: "Volumes of Cylinders, Cones, and Spheres",
        description:
          "Find volumes of cylinders. Find volumes of cones. Find volumes of spheres. Find volumes of composite solids involving cylinders, cones, and spheres.",
        orderIndex: 7,
        sections: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            content: `## Key Terms\n\n- **Cylinder** — A solid with two parallel, congruent circular bases.\n- **Cone** — A solid with one circular base and a curved lateral surface meeting at a vertex.\n- **Sphere** — The set of all points equidistant from a center point in three-dimensional space.\n- **Hemisphere** — Half of a sphere.\n- **Composite Solid** — A solid made up of two or more simpler solids.`,
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            content: `## Explore: Volumes of Cylinders, Cones, and Spheres\n\nStudents explore how the volume formulas for cylinders, cones, and spheres are related. A cone has exactly one-third the volume of a cylinder with the same base and height, and a sphere has volume equal to (2/3) of the volume of the smallest cylinder that contains it.\n\nInquiry Question:\nHow are the volume formulas for a cylinder, a cone, and a sphere related to each other?`,
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            content: `## Learn: Volumes of Cylinders, Cones, and Spheres\n\n### Key Concept: Volume of a Cylinder\n\n\\[V = \\pi \\cdot r^2 \\cdot h\\]\n\n### Key Concept: Volume of a Cone\n\n\\[V = \\frac{1}{3} \\cdot \\pi \\cdot r^2 \\cdot h\\]\n\n### Key Concept: Volume of a Sphere\n\n\\[V = \\frac{4}{3} \\cdot \\pi \\cdot r^3\\]\n\n### Key Concept: Volume of a Hemisphere\n\nA hemisphere is half a sphere:\n\\[V = \\frac{2}{3} \\cdot \\pi \\cdot r^3\\]`,
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 1 — Volume of Cylinders\n\nFind the volume of each cylinder. Round to the nearest tenth.\n\n\n### Step 1: Identify the Radius and Height\n\nExtract these values from the problem statement.\n\n### Step 2: Apply the Formula\n\n\\[V = \\pi \\cdot r^2 \\cdot h\\]\n\n\nDISPOSAL: A kitchen trash can shaped like a cylinder with height 18 inches and base diameter 12 inches.\n\\[r = \\frac{12}{2} = 6 \\text{ in}\\]\n\\[V = \\pi \\cdot 6^2 \\cdot 18\\]\n\\[V = 648\\pi = 2035.8 \\text{ in}^3\\]\n\n\nCOFFEE: A canister shaped like a cylinder with radius 1.5 inches and height 7.5 inches.\n\\[V = \\pi \\cdot 1.5^2 \\cdot 7.5\\]\n\\[V = 16.875\\pi = 53.0 \\text{ in}^3\\]`,
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 2 — Volume of Cylinders with Variables\n\nFind the volume of a cylinder with given conditions.\n\n### Step 1: Write the Formula in Terms of Variables\n\n### Step 2: Simplify the Expression\n\n### Step 3: Substitute to Find Numerical Value\n\n\nFind the volume of a cylinder with radius 2x millimeters and height x - 2 millimeters.\na. \\[V = \\pi \\cdot (2x)^2 \\cdot (x - 2)\\]\n\\[V = 4\\pi \\cdot x^2 \\cdot (x - 2)\\]\n\\[V = 4\\pi(x^3 - 2x^2)\\]\nb. If x = 10:\n\\[V = 4\\pi(1000 - 200) = 3200\\pi = 10,053.5 \\text{ mm}^3\\]\n\nFind the volume of a cylinder with diameter 6 cm shorter than the height x.\na. \\[r = \\frac{x - 6}{2}\\]\n\\[V = \\pi \\cdot (\\frac{x - 6}{2})^2 \\cdot x\\]\n\\[V = \\pi \\cdot \\frac{(x - 6)^2}{4} \\cdot x\\]\nb. If height is 14 cm (so x = 14):\n\\[r = \\frac{14 - 6}{2} = 4 \\text{ cm}\\]\n\\[V = \\pi \\cdot 16 \\cdot 14 = 224\\pi = 703.7 \\text{ cm}^3\\]\n\nFind the volume of a cylinder with radius x feet and height 3x + 4 feet.\na. \\[V = \\pi \\cdot x^2 \\cdot (3x + 4)\\]\n\\[V = \\pi(3x^3 + 4x^2)\\]\nb. If x = 3:\n\\[V = \\pi(3(27) + 4(9)) = \\pi(81 + 36) = 117\\pi = 367.6 \\text{ ft}^3\\]`,
          },
          {
            phaseNumber: 6,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 3 — Volume of Cones\n\nExamine the cone and find the volume.\n\n\n### Step 1: Identify the Radius and Height\n\n### Step 2: Apply the Cone Volume Formula\n\n\\[V = \\frac{1}{3} \\cdot \\pi \\cdot r^2 \\cdot h\\]\n\n\nA cone with radius 4 ft and height 7 ft:\n\\[V = \\frac{1}{3} \\cdot \\pi \\cdot 16 \\cdot 7\\]\n\\[V = \\frac{112}{3}\\pi = 117.3 \\text{ ft}^3\\]`,
          },
          {
            phaseNumber: 7,
            title: "Worked Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 4 — Volume of Cones with Variables\n\nExamine the cone and find the volume in terms of x and when x = given value.\n\n### Step 1: Write the Formula\n\nFor a cone with radius x and height x + 2:\n\\[V = \\frac{1}{3} \\cdot \\pi \\cdot x^2 \\cdot (x + 2)\\]\n\\[V = \\frac{1}{3} \\cdot \\pi \\cdot (x^3 + 2x^2)\\]\n\n### Step 2: Substitute and Calculate\n\nIf x = 4 ft:\n\\[V = \\frac{1}{3} \\cdot \\pi \\cdot 16 \\cdot 6 = \\frac{96}{3}\\pi = 100.5 \\text{ ft}^3\\]\n\n\nDINING: A dish shaped like a cone with radius 2 inches and height 1.2 inches.\n\\[V = \\frac{1}{3} \\cdot \\pi \\cdot 4 \\cdot 1.2\\]\n\\[V = 1.6\\pi = 5.03 \\text{ in}^3\\]\n\n\nAUTOMOBILE: A funnel with radius 6 cm and slant height 10 cm. Find height first:\n\\[h = \\sqrt{10^2 - 6^2} = \\sqrt{64} = 8 \\text{ cm}\\]\n\\[V = \\frac{1}{3} \\cdot \\pi \\cdot 36 \\cdot 8 = 96\\pi = 301.6 \\text{ cm}^3\\]`,
          },
          {
            phaseNumber: 8,
            title: "Worked Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 5 — Volume of Spheres\n\nExamine the sphere and find the volume.\n\n### Step 1: Identify the Radius\n\n### Step 2: Apply the Sphere Volume Formula\n\n\\[V = \\frac{4}{3} \\cdot \\pi \\cdot r^3\\]\n\n\nA sphere with radius 2 inches:\n\\[V = \\frac{4}{3} \\cdot \\pi \\cdot 8 = \\frac{32}{3}\\pi = 33.5 \\text{ in}^3\\]\n\n\nORANGES: Moesha cuts a spherical orange in half. Radius is 2 inches. Find volume of half (hemisphere).\n\\[V_{\\text{sphere}} = \\frac{4}{3} \\cdot \\pi \\cdot 8 = 33.5 \\text{ in}^3\\]\n\\[V_{\\text{hemisphere}} = \\frac{2}{3} \\cdot \\pi \\cdot 8 = 16.8 \\text{ in}^3\\]`,
          },
          {
            phaseNumber: 9,
            title: "Worked Example 6",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 6 — Volume of Spheres with Variables\n\nExamine the sphere and find the volume in terms of x.\n\n\n### Step 1: Write the Formula\n\nFor a sphere with radius x:\n\\[V = \\frac{4}{3} \\cdot \\pi \\cdot x^3\\]\n\n### Step 2: Substitute and Calculate\n\nDESIGN: A spherical fountain with radius 1.5 feet.\n\\[V = \\frac{4}{3} \\cdot \\pi \\cdot 3.375 = 14.14 \\text{ ft}^3\\]\n\nExamine spheres and find volumes for various values of x.`,
          },
          {
            phaseNumber: 10,
            title: "Worked Example 7",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 7 — Volume of Composite Solids with Cylinders and Cones\n\nFind the volume of each composite solid. Round to the nearest tenth.\n\n\n### Step 1: Identify the Components\n\nBreak into cylinder, cone, and/or other shapes.\n\n### Step 2: Find Each Volume\n\nCalculate separately.\n### Step 3: Combine Appropriately\n\nAdd or subtract as needed.`,
          },
          {
            phaseNumber: 11,
            title: "Worked Example 8",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 8 — More Composite Solids\n\nFind the volume of each composite solid.\n\n\nCELEBRATION: Emilia's three-tiered cake. Each tier is a cylinder with height 4 inches. Diameters: 6 in, 10 in, 14 in.\n\\[\\text{Top tier: } r = 3, V = \\frac{1}{3} \\cdot \\pi \\cdot 9 \\cdot 4 = 12\\pi\\]\n\\[\\text{Middle tier: } r = 5, V = \\frac{1}{3} \\cdot \\pi \\cdot 25 \\cdot 4 = \\frac{100}{3}\\pi\\]\n\\[\\text{Bottom tier: } r = 7, V = \\frac{1}{3} \\cdot \\pi \\cdot 49 \\cdot 4 = \\frac{196}{3}\\pi\\]\n\\[\\text{Total} = 12\\pi + \\frac{100}{3}\\pi + \\frac{196}{3}\\pi = \\frac{36 + 100 + 196}{3} \\cdot \\pi = \\frac{332}{3} \\cdot \\pi = 347.3 \\text{ in}^3\\]\n\nSCULPTING: A sculptor removes stone from a cylindrical block to create a cone. Cylinder height 3 ft, cone and cylinder diameter 2 ft.\n\\[V_{\\text{cylinder}} = \\pi \\cdot 1^2 \\cdot 3 = 3\\pi\\]\n\\[V_{\\Text{cone}} = \\frac{1}{3} \\cdot \\pi \\cdot 1^2 \\cdot 3 = \\pi\\]\n\\[V_{\\Text{stone}} = 3\\pi - \\pi = 2\\pi = 6.28 \\text{ ft}^3\\]`,
          },
          {
            phaseNumber: 12,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            content: `## Mixed Exercises\n\n- STRUCTURE: Write a formula for the volume of a solid in terms of radius r.\n- PRECISION: Explain how to write the formula.\n- Find the volume of a cone. Round to the nearest tenth.\n- REASONING: A hemisphere has base area 25π cm². Find the volume.\n- TEEPEE: Cathy made a teepee with diameter 6 ft and side angle 65 degrees with ground.\n- SCHOOL SUPPLIES: A pencil grip shaped like a triangular prism with a cylinder removed.\n- CONSTRUCT ARGUMENTS: A wooden sphere carved from a cube with volume 729 in³.\n- REASONING: Reginald's scale model of a building (cube topped with hemisphere, 30 ft total height).\n- REGULARITY: A cylindrical container with radius 3 in and height 10 in. Find radius of another cylinder with same volume but height 8 in.\n- PERSEVERE: A cylindrical can fills a container in 3 full cans. Describe possible dimensions of the container if it's a rectangular prism, square prism, or triangular prism.\n- CREATE: Sketch a composite solid made of a cylinder and cone with volume about 7698.5 cm³.\n- WRITE: How are volume formulas for prisms and cylinders similar? Different?\n- ANALYZE: Is the volume of a cone with radius r and height h sometimes, always, or never equal to the volume of a prism with height h?\n- FIND THE ERROR: Alexandra and Cornelio calculating volume of a cone. Who is correct?\n- ANALYZE: If a sphere has radius r, does there exist a cone with radius r having the same volume?`,
          },
          {
            phaseNumber: 13,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            content: `## Review Notes\n\n- ![](media/) — Image references for diagrams in the original DOCX could not be fully captured.\n- Key relationships: Cone volume = (1/3) of cylinder with same base and height. Sphere volume = (2/3) of cylinder with same base and height (actually same radius and height equal to diameter).\n- Remember to use the height perpendicular to the base for cones, not the slant height.\n- When solving composite solid problems, draw a diagram to identify all components.`,
          },
        ],
      },
      {
        slug: "module-6-lesson-8",
        title: "Applying Similarity to Solid Figures",
        description:
          "Find missing areas given similar figures. Find scale factors from areas of similar figures. Find volumes of similar solids. Apply similarity to solve real-world problems involving surface areas and volumes.",
        orderIndex: 8,
        sections: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            content: `## Key Terms\n\n- **Similar Figures** — Figures that have the same shape but not necessarily the same size; corresponding angles are congruent and corresponding sides are proportional.\n- **Scale Factor** — The ratio of corresponding lengths in similar figures.\n- **Similar Solids** — Three-dimensional figures that have the same shape; corresponding angles are congruent and corresponding lengths are proportional.\n- **Area Ratio** — For similar figures, the ratio of areas is the square of the scale factor.\n- **Volume Ratio** — For similar solids, the ratio of volumes is the cube of the scale factor.`,
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            content: `## Explore: Applying Similarity to Solid Figures\n\nStudents explore how the relationships between similar figures extend to three dimensions. While linear dimensions scale by the scale factor k, areas scale by k² and volumes scale by k³.\n\nInquiry Question:\nIf you double all the dimensions of a solid, by what factor does the surface area increase? By what factor does the volume increase?`,
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            content: `## Learn: Applying Similarity to Solid Figures\n\n### Key Concept: Scale Factor from Areas\n\nIf two similar figures have areas A₁ and A₂, the scale factor is:\n\\[k = \\sqrt{\\frac{A_1}{A_2}}\\]\n\n### Key Concept: Finding Missing Areas\n\nIf two similar figures have scale factor k, then:\n\\[A_2 = k^2 \\cdot A_1\\]\n\n\n### Key Concept: Scale Factor from Volumes\n\nIf two similar solids have volumes V₁ and V₂, the scale factor is:\n\\[k = \\sqrt[3]{\\frac{V_1}{V_2}}\\]\n\n\n### Key Concept: Volume of Similar Solids\n\nIf the scale factor between similar solids is k, then:\n\\[V_2 = k^3 \\cdot V_1\\]\n\n\n### Key Concept: Surface Area of Similar Solids\n\nIf the scale factor between similar solids is k, then:\n\\[SA_2 = k^2 \\cdot SA_1\\]`,
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 1 — Find Missing Areas\n\nFor each pair of similar figures, find the missing area. Round to the nearest tenth, if necessary.\n\n### Step 1: Find the Scale Factor\n\nUse the ratio of corresponding sides.\n\n### Step 2: Square the Scale Factor\n\nThe area ratio is k².\n\n### Step 3: Find the Missing Area\n\nMultiply or divide the known area by k².\n\nIf the scale factor from small to large is 2:1, and small area is 10 cm²:\n\\[k = 2\\]\n\\[\\text{Area ratio} = 4\\]\n\\[\\text{Large area} = 10 \\cdot 4 = 40 \\text{ cm}^2\\]`,
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 2 — Find Scale Factor and Missing Value\n\nFor each pair of similar figures, use the given areas to find the scale factor. Then find the value of x to the nearest tenth.\n\n### Step 1: Find the Scale Factor\n\n\\[k = \\sqrt{\\frac{A_{\\text{small}}}{A_{\\text{large}}} \\text{ or } \\sqrt{\\frac{A_{\\text{large}}}{A_{\\text{small}}}\\]\n\n\n### Step 2: Use the Scale Factor to Find x\n\nSet up a proportion using corresponding sides.\n\nIf areas are 25 cm² and 100 cm²:\n\\[k = \\sqrt{\\frac{25}{100}} = \\frac{1}{2}\\]\n\\[\\text{If large figure side} = 8 \\text{ cm}, \\text{small figure side} = 4 \\text{ cm}\\]`,
          },
          {
            phaseNumber: 6,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 3 — Real-World Similarity Problems\n\nASSIGNMENTS: Matt has two similar rectangular posters. Larger poster length is 11 in, smaller is 6 in. Larger area is 93.5 in². Find smaller area.\n\\[k = \\frac{6}{11}\\]\n\\[\\text{Area ratio} = (\\frac{6}{11})^2 = \\frac{36}{121}\\]\n\\[\\text{Small area} = 93.5 \\cdot \\frac{36}{121} = 27.8 \\text{ in}^2\\]\n\n\nACCESSORIES: Carla has decorative pins shaped like equilateral triangles. Larger pin has side 3 times longer than smaller. Smaller area is 6.9 cm². Find larger area.\n\\[k = 3\\]\n\\[\\text{Area ratio} = 9\\]\n\\[\\text{Large area} = 6.9 \\cdot 9 = 62.1 \\text{ cm}^2\\]\n\nQUILT: A quilt design has one large rectangle surrounded by four congruent rectangles similar to the large rectangle. Large area is 45 in². Find area of each small rectangle.\n\\[\\text{Each small rectangle has area} = \\frac{45}{5} = 9 \\text{ in}^2\\]`,
          },
          {
            phaseNumber: 7,
            title: "Worked Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 4 — Find Volumes of Similar Solids\n\nEach pair of solids is similar. Find the volume of each solid. Round to the nearest tenth, if necessary.\n\n\n### Step 1: Find the Scale Factor\n\nUse corresponding linear dimensions.\n\n### Step 2: Cube the Scale Factor for Volume\n\nVolume ratio = k³.\n### Step 3: Find the Volumes\n\nIf k = 2, then volume ratio = 8.\n\nIf two similar cylinders have scale factor 3:1 and small volume is 50 m³:\n\\[\\text{Large volume} = 50 \\cdot 27 = 1350 \\text{ m}^3\\]`,
          },
          {
            phaseNumber: 8,
            title: "Worked Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 5 — Surface Area and Volume with Similar Solids\n\nTwo similar cylinders have radii of 3 inches and 12 inches. If the height of the larger cylinder is 24 inches, what is the surface area of the smaller cylinder?\n\n### Step 1: Find the Scale Factor\n\n\\[k = \\frac{3}{12} = \\frac{1}{4}\\]\n\n### Step 2: Find the Height of the Smaller Cylinder\n\n\\[h_{\\text{small}} = 24 \\cdot \\frac{1}{4} = 6 \\text{ in}\\]\n\n### Step 3: Find the Surface Area\n\nFor the larger cylinder with r = 12 and h = 24:\n\\[SA_{\\text{large}} = 2\\pi \\cdot 12 \\cdot 24 + 2\\pi \\cdot 144 = 576\\pi + 288\\pi = 864\\pi\\]\n\\[SA_{\\text{small}} = SA_{\\text{large}} \\cdot \\frac{1}{4}^2 = \\frac{864\\pi}{16} = 54\\pi = 169.6 \\text{ in}^2\\]\n\n\nTwo similar rectangular prisms have surface areas 112 cm² and 1008 cm². If the length and width of the smaller prism base are 4 cm and 2 cm, find the perimeter of one base of the larger prism.\n\n### Step 1: Find the Scale Factor\n\n\\[k = \\sqrt{\\frac{112}{1008}} = \\sqrt{\\frac{1}{9}} = \\frac{1}{3}\\]\n\n\n### Step 2: Find the Perimeter of the Small Base\n\n\\[P_{\\text{small}} = 2(4 + 2) = 12 \\text{ cm}\\]\n\n### Step 3: Find the Perimeter of the Large Base\n\n\\[P_{\\text{large}} = 12 \\cdot 3 = 36 \\text{ cm}\\]`,
          },
          {
            phaseNumber: 9,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            content: `## Mixed Exercises\n\n- Two similar prisms have heights 12 ft and 20 ft. Find the ratio of their volumes.\n- Two cubes have surface areas 81 in² and 144 in². Find the ratio of their volumes.\n- REGULARITY: A polygon has area 225 m². If the area is tripled, how does each side length change?\n- REASONING: Smith's Bakery is baking several large cakes similar to a small cake. If 50 pieces come from the small cake, how many from the large cake?\n- PROOF: Write paragraph proofs for Theorem 11.1 and Theorem 11.2 about surface area and volume ratios of similar prisms.\n- ATMOSPHERE: Earth's atmosphere is in a 31-km thick layer. Earth radius is 6378 km. Find ratio of atmosphere volume to Earth volume.\n- SCULPTURE: Two similar regular octagon sculptures. Larger side is 7 in. Smaller base area is 19.28 in². Find side length of smaller. Will larger fit in 15-in diameter box?\n- SPORTS: Baseball circumference 9 in. Softball circumference max 12 in. Find ratio of volumes.\n- STRUCTURE: Toy tennis balls in 3 sizes. Find volume in terms of pi for each size as diameter increases. What pattern?\n- Describe dimensions of a similar trapezoid with area 4 times the original.\n- FIND THE ERROR: Violeta and Gavin with a formula for area of enlarged circle. Who is correct?\n- PERSEVERE: If you want area of polygon to be x% of original, by what scale factor should you multiply each side?\n- CREATE: Draw a pair of similar figures with area ratio 4:1.\n- WRITE: Explain how to find area of an enlarged polygon given original area and scale factor.\n- PERSEVERE: Cylinder A : Cylinder B = 5 : 1. Cylinder A similar to Cylinder C (scale 2:1). Cylinder B similar to Cylinder D (scale 3:1). Find ratio of Cylinder C to Cylinder D.`,
          },
          {
            phaseNumber: 10,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            content: `## Review Notes\n\n- ![](media/) — Image references for similar figure diagrams could not be fully captured.\n- Key formulas: If scale factor is k, then area ratio is k² and volume ratio is k³.\n- To find scale factor from areas: $k = \\sqrt{A_1/A_2}$.\n- To find scale factor from volumes: $k = \\sqrt[3]{V_1/V_2}$.\n- When working with similar solids, ALL linear dimensions scale by k, including height, radius, slant height, perimeter, etc.`,
          },
        ],
      },
      {
        slug: "module-6-lesson-9",
        title: "Density",
        description:
          "Find population density. Find area density and mass density. Solve real-world problems involving density concepts.",
        orderIndex: 9,
        sections: [
          {
            phaseNumber: 1,
            title: "Vocabulary",
            phaseType: "vocabulary" as const,
            estimatedMinutes: 10,
            content: `## Key Terms\n\n- **Density** — The measure of how much of something is packed into a given unit of space or area. Expresses the concentration of a quantity.\n- **Population Density** — The number of people per unit of area: $[D = \\frac{\\text{Population}}{\\text{Area}}$]\n- **Mass Density** — The mass per unit volume of a substance: $[D = \\frac{\\text{Mass}}{\\text{Volume}}$]\n- **Area Density** — The amount of quantity per unit area: $[D = \\frac{\\text{Quantity}}{\\text{Area}}$]\n- **Linear Density** — The mass per unit length of a one-dimensional object.`,
          },
          {
            phaseNumber: 2,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 20,
            content: `## Explore: Density\n\nStudents explore how density describes the concentration of a quantity in a given space. Population density tells us how crowded a place is. Mass density tells us how heavy a material is for its size. Density is a ratio that allows comparison between different-sized objects or regions.\n\nInquiry Question:\nWhy do some cities with similar populations have very different population densities? What does this tell us about how people are distributed?`,
          },
          {
            phaseNumber: 3,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            content: `## Learn: Density\n\n### Key Concept: Population Density\n\nPopulation density measures how many people live per unit of area:\n\\[D = \\frac{\\text{Population}}{\\text{area}}\\]\nCommon units: people per square mile, people per square kilometer.\n\n\n### Key Concept: Mass Density\n\nMass density measures mass per unit volume:\n\\[D = \\frac{\\text{mass}}{\\text{volume}}\\]\nCommon units: grams per cubic centimeter, kilograms per cubic meter.\n\n\n### Key Concept: Area Density\n\nFor objects with uniform distribution:\n\\[D = \\frac{\\text{quantity}}{\\text{area}}\\]\n\n\n### Key Concept: Solving Density Problems\n\nMany real-world problems give density and ask for quantity, or give quantity and density and ask for area/volume.\n\nRearrange the density formula:\n\\[\\text{Quantity} = \\text{Density} \\cdot \\text{Area}\n\\[\\text{Area} = \\frac{\\text{Quantity}}{\\text{Density}}\\]`,
          },
          {
            phaseNumber: 4,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 1 — Population Density\n\nUse the data in the table to find the population density of each city.\n\n### Step 1: Identify Population and Area\n\nFind these values from the data.\n\n\n### Step 2: Divide Population by Area\n\n\\[D = \\frac{\\text{Population}}{\\text{Area}}\\]\n\n\nLondon, England:\n\\[D = \\frac{8,900,000}{607 \\text{ mi}^2} = 14,662 \\text{ people/mi}^2\\]\n\n\nParis, France:\n\\[D = \\frac{2,200,000}{41 \\text{ mi}^2} = 53,659 \\text{ people/mi}^2\\]\n\nMadrid, Spain:\n\\[D = \\frac{3,200,000}{233.3 \\text{ mi}^2} = 13,717 \\text{ people/km}^2\\]\n\nSydney, Australia:\n\\[D = \\frac{5,300,000}{4800 \\text{ km}^2} = 1,104 \\text{ people/km}^2\\]`,
          },
          {
            phaseNumber: 5,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 2 — Applying Density to Solve Problems\n\nWILDLIFE: A town is installing bat boxes to reduce mosquitos. Each bat box houses 150 bats. The town has 300 bats per square mile to control the mosquito population. The town area is 12 square miles. How many bat boxes are needed?\n\n### Step 1: Find the Number of Bats the Town Can Support\n\n\\[300 \\text{ bats/mi}^2 \\cdot 12 \\text{ mi}^2 = 3600 \\text{ bats}\\]\n\n### Step 2: Divide by Bats per Box\n\n\\[3600 / 150 = 24 \\text{ boxes}\\]\n\n\nOCCUPANCY: Jamero wants to open a restaurant. Safety regulations require 15 ft² per person. If he wants to accommodate 50 people, what is the smallest floor space needed?\n\n\n### Step 1: Multiply People by Space per Person\n\n\\[50 \\cdot 15 = 750 \\text{ ft}^2\\]`,
          },
          {
            phaseNumber: 6,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            content: `## Example 3 — Mass Density Problems\n\nFESTIVALS: Ohio State Fair butter sculptures of cow and calf weighed 2000 pounds in 2017.\na. If a stick of butter weighs 4 ounces, what is its approximate density?\n\\[1 \\text{ pound} = 16 \\text{ ounces}\\]\n\\[1 \\text{ stick} = 4 \\text{ oz} = 0.25 \\text{ lb}\\]\n\\[\\text{Density of butter is approximately } 0.25 \\text{ lb per stick, but we need volume...}\\]\n\nActually, the problem asks about the sculpture density:\n\\[\\text{We need volume to find density}\]\n\nb. What was the total volume of the sculptures? (1 lb = 16 oz, density of butter is about 0.94 g/cm³ or we work in pounds and cubic inches)\n\n\nFirst find the number of sticks:\n\\[2000 \\text{ lb} \\cdot 16 \\text{ oz/lb} = 32,000 \\text{ oz}\\]\n\\[32,000 \\text{ oz} / 4 \\text{ oz/stick} = 8000 \\text{ sticks}\\]\n\n\nIf we know the volume of one stick of butter, we could find total volume. Assuming a stick is about 1 oz in volume (actual is about 1.8 oz or about 5.3 cm³), we work with the given information.\n\n\nc. Approximately how many sticks of butter were used?\n\\[2000 \\text{ lb} / 0.25 \\text{ lb} = 8000 \\text{ sticks}\\]\n\n\nENERGY: A house is 80 ft by 25 ft by 8 ft. Requires 60,000 BTUs to heat.\na. What is the density of the house in BTUs?\n\\[\\text{Volume} = 80 \\cdot 25 \\cdot 8 = 16,000 \\text{ ft}^3\\]\n\\[\\text{Density} = \\frac{60,000}{16,000} = 3.75 \\text{ BTU/ft}^3\\]\n\nb. A nearby house requires 52,000 BTUs, is 31 ft by 25 ft. Find the height.\n\\[\\text{Volume needed} = \\frac{52,000}{3.75} = 13,866.7 \\text{ ft}^3\\]\n\\[\\text{Area} = 31 \\cdot 25 = 775 \\text{ ft}^2\\]\n\\[\\text{Height} = \\frac{13,866.7}{775} = 17.9 \\text{ ft}\\]`,
          },
          {
            phaseNumber: 7,
            title: "Mixed Exercises",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 25,
            content: `## Mixed Exercises\n\n- REGULATIONS: A rectangular park 2 mi by 3 mi has maximum capacity 250 people. Find population density.\n- REASONING: A city has east river portion (25% of city) with density 28 persons/km² and west portion with 17 persons/km². Find overall density.\n- CONSTRUCT ARGUMENTS: A semi-trailer can weigh no more than 34,000 lb. Interior dimensions given. Freight has density 0.006 lb/in³. Will the load meet weight restrictions?\n- PAPER WEIGHTS: A cylindrical paper weight with given dimensions has mass 606.7 g. Find density. Use a table to determine which material.\n- WHICH ONE DOESN'T BELONG?: Jonathan building a terrarium for 18 plants, 120 in³ space per plant. Which structure won't meet requirement?\n- WRITE: Explain why a cubic foot of gas and a cubic foot of gold do not have the same density.\n- ANALYZE: Determine whether Block A having greater density than Block B is true or false.\n- PERSEVERE: An engineer designing a marble fountain. Marble sample is 4 in by 6 in by 1 in with mass 1066.32 g.\na. Find density of marble.\nb. A sphere fountain with radius 2 ft. Find mass in kilograms.`,
          },
          {
            phaseNumber: 8,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            content: `## Review Notes\n\n- ![](media/) — Image references for diagrams and tables in the original DOCX could not be fully captured.\n- Density is ALWAYS a ratio of quantity to space (mass/volume, population/area, etc.).\n- To find the total quantity: multiply density by the area or volume.\n- To find area or volume: divide quantity by density.\n- Units matter! Make sure density units match the units of the quantity you're calculating.\n- Population density is typically expressed as people per square mile or people per square kilometer.\n- Mass density is typically expressed as grams per cubic centimeter or kilograms per cubic meter.`,
          },
        ],
      },
    ];

    const results: SeedModule6LessonsResult["lessons"] = [];

    for (const lesson of lessonData) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 6,
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

      for (const phase of lesson.sections) {
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

        await ctx.db.insert("phase_sections", {
          phaseVersionId: phaseId,
          sequenceOrder: 1,
          sectionType: "text",
          content: { markdown: phase.content },
          createdAt: now,
        });
      }

      results.push({
        lessonId,
        lessonVersionId,
        slug: lesson.slug,
        phasesCreated,
      });
    }

    return { lessons: results };
  },
});
