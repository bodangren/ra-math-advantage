import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule11LessonsResult {
  lessons: Array<{
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    phasesCreated: number;
    activitiesCreated: number;
    slug: string;
  }>;
}

export const seedModule11Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule11LessonsResult> => {
    const now = Date.now();

    const lessonsData = [
      {
        slug: "module-11-lesson-1",
        title: "Angles and Congruence",
        orderIndex: 1,
        description:
          "Students identify and name parts of an angle, apply the Angle Addition Postulate and angle bisector definition, and solve equations using angle relationships.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: How Many Ways Can You Name an Angle?\n\nStudents examine a figure with multiple angles and discuss how many different names can describe a single angle. Consider what happens when several angles share the same vertex and how to avoid ambiguity.\n\n**Inquiry Question:**\nWhat rules determine whether an angle name is clear or ambiguous when multiple angles share a vertex?",
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
                    "## Vocabulary\n\n- **Angle** — A figure formed by two noncollinear rays that share a common endpoint.\n- **Vertex** — The common endpoint of the two rays that form an angle.\n- **Sides** — The two rays that form an angle.\n- **Interior of an Angle** — The set of all points inside the angle.\n- **Exterior of an Angle** — The set of all points outside the angle.\n- **Angle Bisector** — A ray that divides an angle into two congruent angles.\n- **Opposite Rays** — Two rays that share the same endpoint and form a straight line.\n- **Adjacent Angles** — Two angles that share a common vertex and side but have no common interior points.\n- **Vertical Angles** — Two nonadjacent angles formed by two intersecting lines.\n- **Linear Pair** — A pair of adjacent angles whose noncommon sides are opposite rays.\n- **Congruent Angles** — Angles that have the same measure.",
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
                    "## Learn: Naming Angles and Using Angle Relationships\n\nAngles are named using the vertex and points on each side. When multiple angles share a vertex, a three-letter name is often necessary to identify the angle unambiguously. Angle bisectors, adjacent angles, vertical angles, and linear pairs provide algebraic relationships that can be used to find unknown measures.\n\n### Key Concept: Naming Angles\n\n- An angle can be named using its vertex alone when only one angle exists at that vertex.\n- When multiple angles share a vertex, use three letters with the vertex in the middle.\n- An angle can also be named with a number inside the angle.\n\n### Key Concept: Angle Bisector\n\n- A ray is an angle bisector if it divides an angle into two angles of equal measure.\n- If a ray bisects an angle, the measure of each resulting angle is half the measure of the original angle.\n\n### Key Concept: Adjacent Angles, Vertical Angles, and Linear Pairs\n\n- **Adjacent angles** share a common vertex and a common side but do not overlap.\n- **Vertical angles** are opposite each other when two lines intersect; they are always congruent.\n- **Linear pairs** are adjacent angles whose noncommon sides form opposite rays; the angles in a linear pair are supplementary.\n\n### Key Concept: Solving for Angle Measures\n\n- Use the definitions of angle bisector, vertical angles, and linear pairs to write equations.\n- Solve the equation for the variable, then substitute back to find the angle measure.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Identify Parts of an Angle and Use Proper Notation\n\nGiven a figure with multiple angles sharing vertices, identify the vertex and sides of specific angles and write alternate names for angles.\n\n### Step 1: Identify the Vertex\n\nThe vertex of an angle is the common endpoint of its two sides. For any labeled angle, locate the point where the two rays meet.\n\n### Step 2: Identify the Sides\n\nThe sides of an angle are the two rays that form it. Name the sides using the endpoint and another point on each ray.\n\n### Step 3: Write Another Name for an Angle\n\nWhen multiple angles share a vertex, use three-letter notation with the vertex in the middle to name an angle unambiguously. For example, if points C, A, and D are on the sides of an angle with vertex A, the angle can be named:\n[\n\\angle CAD \\text{ or } \\angle DAC\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Apply the Definition of an Angle Bisector\n\nUse the fact that a ray bisects an angle to set up and solve equations for unknown angle measures.\n\n### Step 1: Recognize an Angle Bisector\n\nWhen a ray bisects an angle, the two smaller angles formed are congruent. If the measures are given as algebraic expressions, set them equal to each other.\n\n### Step 2: Set Up and Solve the Equation\n\nFor example, if a ray bisects an angle and the two resulting angles measure [14x + 5] and [17x - 1], set the expressions equal:\n[\n14x + 5 = 17x - 1\n]\nSolve for [x]:\n[\n5 + 1 = 17x - 14x\n]\n[\n6 = 3x\n]\n[\nx = 2\n]\n\n### Step 3: Find the Measure of the Original Angle\n\nSubstitute the value of [x] back into either expression to find the measure of one of the congruent angles, then double it to find the measure of the original angle:\n[\nm\\angle FLG = 14(2) + 5 = 33\n]\n[\nm\\angle FLH = 2 \\times 33 = 66\n]\n\n### Step 4: Apply the Angle Addition Postulate with Opposite Rays\n\nWhen two rays are opposite rays, they form a straight angle measuring 180°. If a ray lies between them, the sum of the two adjacent angles is 180°. Use this relationship to write equations and solve for unknown measures.\n\nFor example, if two adjacent angles formed by opposite rays measure [2n + 7] and [4n - 13], set up the equation:\n[\n(2n + 7) + (4n - 13) = 180\n]\nSolve:\n[\n6n - 6 = 180\n]\n[\n6n = 186\n]\n[\nn = 31\n]\nThen find each angle measure by substituting back.\n\n### Step 5: Solve Various Bisector and Linear Pair Problems\n\nAdditional problems involve:\n- Finding an angle measure when the total and one part are known.\n- Finding the parts when the total and the relationship between parts are known.\n- Solving equations with variables on both sides.\n\nFor example, if an angle and its adjacent angle formed by opposite rays are related by [m\\angle ABF = 7b - 24] and [m\\angle ABE = 2b], the remaining angle measure can be found by:\n[\nm\\angle EBF = m\\angle ABF - m\\angle ABE\n]\n[\nm\\angle EBF = (7b - 24) - 2b = 5b - 24\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Identify Angle Relationships and Solve for Variables\n\nUse relationships between adjacent angles, vertical angles, and linear pairs in figures with intersecting lines to find unknown angle measures and variable values.\n\n### Step 1: Identify Adjacent Angles\n\nLook for two angles that share a common vertex and a common side without overlapping. Name the pair using the vertex and points on the sides.\n\n### Step 2: Identify Vertical Angles\n\nWhen two lines intersect, the angles opposite each other are vertical angles. Vertical angles are always congruent.\n\nFor example, if two lines intersect and one vertical angle measures [62°], the opposite angle also measures:\n[\n62°\n]\n\n### Step 3: Find an Angle Measure from a Figure\n\nUse the given information in a figure to determine an angle measure. If angles form a linear pair, their measures sum to 180°. If they are vertical angles, they are equal.\n\n### Step 4: Solve for a Variable Using Angle Relationships\n\nWhen angle measures are given as algebraic expressions, use the appropriate relationship to write an equation.\n\n**Supplementary angles** (linear pair):\n[\n(3x + 10) + (5x - 2) = 180\n]\n[\n8x + 8 = 180\n]\n[\n8x = 172\n]\n[\nx = 21.5\n]\n\n**Vertical angles**:\n[\n4y - 20 = 2y + 30\n]\n[\n2y = 50\n]\n[\ny = 25\n]\n\n**Complementary angles**:\n[\n(2a + 15) + (3a - 5) = 90\n]\n[\n5a + 10 = 90\n]\n[\n5a = 80\n]\n[\na = 16\n]",
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
                    "## Mixed Exercises\n\nThe mixed exercises section provides comprehensive practice with all skills from the lesson. Problems include:\n\n- Naming the vertex and sides of angles from a figure.\n- Writing alternative names for angles using proper notation.\n- Identifying points in the interior and exterior of angles.\n- Finding angle pairs that share exactly one point or more than one point.\n- Identifying adjacent angles, vertical angles, and linear pairs from figures.\n- Solving for variables using angle relationships in figures with intersecting lines.\n- Applying angle concepts to real-world contexts such as traffic patterns, pool table geometry, woodworking cuts, and posture analysis.\n- Using multiple angle bisectors to reason backward from a small angle to the original angle measure.\n- Analyzing constructions of copied angles and determining whether angle pairs form linear pairs.\n\n## Review Notes\n\n- Images referenced in the worksheet (angle figures for Examples 1–3, intersecting lines diagrams for variable problems, traffic circle diagram, pool table diagram, woodworking block diagrams, texting posture diagram, angle construction diagram) could not be fully described without visual reference. Teachers should consult the original worksheet for exact figures and diagrams.\n- Several problems in Example 2 and the Mixed Exercises require interpreting figures to identify angle relationships; visual reference is essential for these problems.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-11-lesson-2",
        title: "Angle Relationships",
        orderIndex: 2,
        description:
          "Students solve problems involving complementary, supplementary, and vertical angle relationships using algebra, and determine what can be assumed from figures.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: How Are Angles Related?\n\nStudents consider pairs of angles that appear in everyday settings and in geometric figures. They investigate whether knowing one angle measure is enough to determine another.\n\n**Inquiry Question:**\nHow can you use the relationship between two angles to find a missing measure without using a protractor?",
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
                    "## Vocabulary\n\n- **Complementary Angles** — Two angles whose measures sum to [90^\\circ].\n- **Supplementary Angles** — Two angles whose measures sum to [180^\\circ].\n- **Vertical Angles** — Two nonadjacent angles formed by two intersecting lines; vertical angles are congruent.\n- **Linear Pair** — A pair of adjacent angles whose non-common sides are opposite rays; a linear pair is supplementary.\n- **Perpendicular Lines** — Lines, rays, or segments that intersect to form right angles.\n- **Adjacent Angles** — Two angles that share a common vertex and side but have no common interior points.\n- **Angle Bisector** — A ray that divides an angle into two congruent angles.",
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
                    "## Learn: Using Angle Relationships to Solve Problems\n\nAngle relationships such as complement, supplement, and perpendicularity provide equations that can be solved algebraically. Recognizing these relationships in figures and word problems is essential for finding unknown measures.\n\n### Key Concept: Complementary and Supplementary Angles\n\n- If two angles are complementary, the sum of their measures is [90^\\circ].\n  [m\\angle A + m\\angle B = 90]\n- If two angles are supplementary, the sum of their measures is [180^\\circ].\n  [m\\angle A + m\\angle B = 180]\n\n### Key Concept: Perpendicular Lines and Right Angles\n\n- If two lines, rays, or segments are perpendicular, they form right angles.\n- When a ray lies in the interior of a right angle, the two adjacent angles formed are complementary.\n- When two lines intersect to form perpendicular lines, all four angles are right angles.\n\n### Key Concept: Assumptions from a Figure\n\n- You may assume that straight lines, segments, and rays are straight.\n- You may assume that intersecting lines form vertical angle pairs and linear pairs.\n- You may **not** assume that angles are right angles, congruent, or complementary unless marked or stated.\n- You may **not** assume that lines are parallel or perpendicular unless marked or stated.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Solve Problems Using Complementary and Supplementary Angles\n\nWrite and solve equations based on complementary and supplementary angle relationships. Problems include finding two angles given their sum and a relationship between them, and finding an angle given a relationship between the angle and its complement or supplement.\n\n### Step 1: Define the Variable\n\nLet a variable represent the measure of one angle. Express the other angle in terms of that variable using the given relationship.\n\nFor supplementary angles with a difference of [35^\\circ]:\nLet [x] = the measure of the smaller angle.\nThen the larger angle is [x + 35].\n\n### Step 2: Write the Equation\n\nUse the fact that the angles are complementary or supplementary to write an equation.\n\nSupplementary:\n[x + (x + 35) = 180]\n\nComplementary where one angle is [54^\\circ] more than the other:\n[x + (x + 54) = 90]\n\nSupplement is [76^\\circ] less than the angle:\n[x + (x - 76) = 180]\n\n### Step 3: Solve the Equation\n\nCombine like terms and isolate the variable.\n\nFor [x + (x + 35) = 180]:\n[2x + 35 = 180]\n[2x = 145]\n[x = 72.5]\n\nThe angles measure [72.5^\\circ] and [107.5^\\circ].\n\n### Step 4: Apply to Rate Problems\n\nFor a real-world problem involving an angle opening at a constant rate, set up a proportion or use the rate to find the remaining time.\n\nIf a bridge opens from horizontal to vertical ([90^\\circ]) and has lifted [35^\\circ] in 21 seconds, find the time to reach vertical at the same rate:\n[\\frac{35}{21} = \\frac{90}{t}]",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Use Perpendicular Lines to Find Unknown Measures\n\nUse the property that perpendicular lines, rays, or segments form right angles to write equations and solve for unknown variables in angle expressions.\n\n### Step 1: Identify the Right Angle\n\nWhen two rays are perpendicular, the angle between them is [90^\\circ]. If a point lies in the interior of that angle, the two adjacent angles are complementary.\n\nFor perpendicular rays [BA] and [BC] with point [D] in the interior:\n[m\\angle ABD + m\\angle DBC = 90]\n\n### Step 2: Substitute Expressions and Solve\n\nSubstitute the given algebraic expressions for the angle measures.\n\nIf [m\\angle ABD = (3r + 5)^\\circ] and [m\\angle DBC = (5r - 27)^\\circ]:\n[(3r + 5) + (5r - 27) = 90]\n[8r - 22 = 90]\n[8r = 112]\n[r = 14]\n\nThen find each angle measure:\n[m\\angle ABD = 3(14) + 5 = 47]\n[m\\angle DBC = 5(14) - 27 = 43]\n\n### Step 3: Apply to Intersecting Lines\n\nWhen two lines intersect, if they are perpendicular, all four angles are [90^\\circ]. Use this to find values of variables in angle expressions.\n\nFor intersecting lines [WX] and [YZ] at point [V], if [m\\angle WVY = (4a + 58)^\\circ] and [m\\angle XVY = (2b - 18)^\\circ], and the lines are perpendicular:\n[4a + 58 = 90]\n[2b - 18 = 90]\n\nSolve each equation separately to find [a] and [b].",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Determine Assumptions from a Figure\n\nAnalyze a geometric figure to determine whether a stated relationship can be assumed. Justify each answer by referencing what can and cannot be assumed from an unmarked diagram.\n\n### Step 1: Identify What Is Given in the Figure\n\nExamine the figure for marks indicating right angles, congruent angles, parallel lines, or perpendicular lines. Note any labeled angle measures or tick marks.\n\n### Step 2: Evaluate Each Statement\n\n- **Complementary angles:** Can only be assumed if the angles form a right angle or are marked as such.\n- **Linear pair:** Can be assumed if two angles are adjacent and their non-common sides form a straight line (opposite rays).\n- **Vertical angles:** Can be assumed if two lines intersect and the angles are opposite each other.\n- **Angle addition:** Can be assumed if an angle is clearly composed of two adjacent angles with no overlap.\n- **Congruent angles:** Can **not** be assumed unless marked with arcs or stated in the problem.\n- **Perpendicular lines:** Can **not** be assumed unless marked with a right-angle symbol or stated.\n\n### Step 3: Write the Explanation\n\nFor each statement, state whether it can be assumed and explain why or why not using precise geometric reasoning.",
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
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice with all skills from the lesson:\n\n- Solve problems combining complements and supplements, such as finding an angle when its supplement is related to its complement.\n- Write and solve equations for linear pairs, including problems where one angle measure is expressed as a multiple of another.\n- Use diagrams with labeled points and rays to find values of variables that make an angle a right angle or make two angles supplementary.\n- Determine what can be assumed from figures, including whether angles are vertical, congruent, complementary, or form a linear pair.\n- Solve for variables when two intersecting lines form adjacent angles and the lines are perpendicular.\n- Apply angle relationships to real-world contexts such as designing a flag, analyzing string art patterns, and constructing geometric figures.\n- Use tools to draw and measure an acute angle, then write and solve an equation for the variable in its expression. Explain how to find complementary and supplementary angles.\n- Analyze whether all angles have complements or supplements and justify the reasoning.\n- Find and explain errors in a student's solution to an angle-relationship problem.\n- Create original figures showing an angle with its complement and supplement using only a line and two rays.\n- Evaluate statements made by different students about a figure and determine which are correct.\n- Apply three-dimensional reasoning about lines perpendicular to planes.\n\n## Review Notes\n\n- Problem 6 references an image (`media/image1.png`) of a bascule bridge that cannot be described from the extracted text.\n- Problem 9 references an image (`media/image2.png`) of a geometric figure with rays and angles.\n- Problems 11–14 reference an image (`media/image3.emf`) of a figure used to determine assumptions.\n- Problems 17–19 reference an image (`media/image4.png`) of a figure with labeled points, rays, and angles.\n- Problems 20–23 reference an image (`media/image5.png`) of a figure used to determine assumptions.\n- Problem 24–25 references intersecting lines; no additional image is required beyond the text description.\n- Problem 26 references an image (`media/image6.png`) of a rectangular flag with labeled angles.\n- Problem 27 references images (`media/image7.png` and `media/image8.png`) of string art patterns.\n- Problem 30 references an image (`media/image9.emf`) illustrating a line perpendicular to a plane.\n- Problem 32 references an image (`media/image10.png`) showing a student's work with an error.\n- Problem 33 is a create exercise requiring students to draw their own figure.\n- Problem 34 references an image (`media/image11.emf`) of a figure with intersecting rays used for a \"Which One Doesn't Belong?\" activity.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-11-lesson-3",
        title: "Two-Dimensional Figures",
        orderIndex: 3,
        description:
          "Students calculate perimeter, circumference, and area of two-dimensional figures from coordinate grids and labeled diagrams, and apply coordinate geometry to identify figures.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: How Can Geometry Help Us Measure Real Objects?\n\nStudents investigate how geometric shapes can model real-world objects. They explore when to use perimeter versus area and how to extract measurements from diagrams and coordinate grids.\n\n**Inquiry Question:**\nHow do we decide which measurements and formulas to use when a real-world object is represented by a geometric figure?",
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
                    "## Vocabulary\n\n- **Perimeter** — The distance around a two-dimensional figure.\n- **Circumference** — The distance around a circle.\n- **Area** — The number of square units needed to cover a two-dimensional figure.\n- **Two-Dimensional Model** — A simplified geometric representation of a real-world object used for calculations.\n- **Coordinate Grid** — A plane formed by the intersection of a horizontal number line (x-axis) and a vertical number line (y-axis).\n- **Composite Figure** — A figure made up of two or more simpler geometric shapes.\n- **Radius** — The distance from the center of a circle to any point on the circle.\n- **Diameter** — The distance across a circle through its center.",
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
                    "## Learn: Perimeter, Circumference, and Area of Two-Dimensional Figures\n\nTwo-dimensional figures can be analyzed using perimeter (or circumference for circles) and area. Measurements can be determined from coordinate grids, labeled diagrams, or described dimensions.\n\n### Key Concept: Perimeter and Circumference\n\n- Perimeter of a polygon: sum of all side lengths.\n- Circumference of a circle: [C = 2 \\pi r] or [C = \\pi d].\n- The Pythagorean Theorem may be needed for diagonal distances on a coordinate grid.\n\n### Key Concept: Area Formulas\n\n- Rectangle: [A = l \\times w]\n- Triangle: [A = \\frac{1}{2}bh]\n- Circle: [A = \\pi r^2]\n- Trapezoid: [A = \\frac{1}{2}(b_1 + b_2)h]\n- Parallelogram: [A = bh]\n- For composite figures, decompose into simpler shapes or subtract unwanted regions.\n\n### Key Concept: Coordinate Geometry\n\n- Use the distance formula to find side lengths when vertices are given:\n[\nd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}\n]\n- Count grid units for horizontal and vertical segments.\n- Identify figures by analyzing side lengths, slopes, and angles.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Find Perimeter and Area from Grid Figures\n\nCalculate the perimeter (or circumference) and area for geometric figures drawn on a coordinate grid where each unit represents 1 centimeter.\n\n### Step 1: Determine Dimensions from the Grid\n\nIdentify side lengths, radius, base, and height by counting units or applying the distance formula. Round to the nearest tenth when necessary.\n\n### Step 2: Apply the Appropriate Formula\n\nSelect perimeter or circumference for the distance around the figure, and area for the space enclosed.\n\nFor a rectangle with length [l] and width [w]:\n[\nP = 2l + 2w\n]\n[\nA = l \\times w\n]\n\nFor a circle with radius [r]:\n[\nC = 2 \\pi r\n]\n[\nA = \\pi r^2\n]\n\nFor a triangle with base [b] and height [h]:\n[\nP = a + b + c\n]\n[\nA = \\frac{1}{2}bh\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Calculate Measurements Using Two-Dimensional Models\n\nUse a labeled two-dimensional model with provided dimensions to compute perimeter, circumference, and area for real-world objects.\n\n### Step 1: Identify the Geometric Shape\n\nMatch the object to its geometric model and extract the relevant dimensions from the diagram.\n\n### Step 2: Compute Perimeter or Circumference\n\nAdd side lengths for polygons. Use the circumference formula for circular parts.\n\n### Step 3: Compute Area\n\nApply the area formula that corresponds to the shape. For composite figures, decompose into simpler shapes or subtract regions.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Solve Real-World Problems with Perimeter and Area\n\nApply perimeter and area concepts to multi-step design, construction, and measurement scenarios.\n\n### Step 1: Calculate Perimeter and Area for a Sign\n\nCalculate the perimeter to determine the amount of trim needed. Calculate the area to determine the amount of sealer needed. Divide the total area by the coverage per pint to find the number of pints required.\n\n### Step 2: Calculate Surface Area of a Rectangular Prism\n\nModel the exposed surfaces of a rectangular prism using two-dimensional faces. Exclude the bottom surface from the total. Sum the areas of the remaining faces.\n\nFor a rectangular prism with length [l], width [w], and height [h] (excluding bottom):\n[\nA = lw + 2lh + 2wh\n]\n\n### Step 3: Find Area of Circular and Triangular Regions\n\nUse area formulas for circles and equilateral triangles. Approximate measurements as needed.\n\nArea of a circle:\n[\nA = \\pi r^2\n]\n\nArea of an equilateral triangle with side length [s]:\n[\nA = \\frac{s^2 \\sqrt{3}}{4}\n]\n\n### Step 4: Analyze a Track Modeled by a Rectangle and Semicircles\n\nCalculate the distance around a track by summing the lengths of the straight sides and the circumference of the circular ends. Adjust for lane width and runner position to find precise distances.\n\nDistance around the track:\n[\nd = 2L + 2 \\pi r\n]\n\nFor a runner in the center of a lane of width [w], use an adjusted radius:\n[\nd = 2L + 2 \\pi \\left(r + \\frac{w}{2}\\right)\n]",
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
                    "## Mixed Exercises\n\nThe mixed exercises provide practice with all skills from the lesson: calculating perimeter and area from coordinate grids and models, solving multi-step real-world problems, and using coordinate geometry. Problems include:\n\n- Identifying figures from given vertices and calculating their perimeter and area.\n- Writing algebraic expressions for the perimeter of a rectangle and solving for unknown dimensions.\n- Calculating fencing costs using coordinate grid measurements and unit conversions.\n- Finding areas of triangles using a perpendicular height.\n- Calculating areas represented on coordinate grids with real-world scale factors.\n- Determining perimeter and area of squares given only two vertices.\n- Finding areas of composite figures formed by inscribed shapes.\n- Solving multi-step tiling problems involving unit conversions.\n- Finding the area between a rectangle inscribed in a circle.\n- Constructing and justifying examples of equiangular non-regular polygons.\n- Calculating side lengths and perimeters of equilateral triangles from coordinates.\n\n## Review Notes\n\n- Images referenced in Examples 1 and 2 (grid figures and labeled models) and throughout the mixed exercises (sign diagram, ice cream cake, pool rack, track diagram, coordinate grids for problems 19, 20, 21, and 23) could not be fully described without visual reference. Teachers should consult the original worksheet for exact values and diagrams.\n- The worksheet contains visual diagrams for each figure in Examples 1 and 2 that are essential for calculating measurements.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-11-lesson-4",
        title: "Transformations in the Plane",
        orderIndex: 4,
        description:
          "Students identify rigid motions (reflection, translation, rotation) from diagrams and apply transformations to figures on the coordinate plane.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: How Can You Move a Figure Without Changing Its Shape?\n\nStudents investigate what happens when geometric figures are moved in the plane. They explore different ways to reposition a figure and consider which movements preserve the figure's size and shape.\n\n**Inquiry Question:**\nWhat kinds of movements in the plane keep a figure congruent to its original position, and how can you tell?",
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
                    "## Vocabulary\n\n- **Rigid Motion** — A transformation that preserves distance and angle measure, so the preimage and image are congruent.\n- **Reflection** — A transformation that flips a figure over a line called the line of reflection.\n- **Translation** — A transformation that slides every point of a figure the same distance in the same direction, described by a vector.\n- **Rotation** — A transformation that turns a figure about a fixed point called the center of rotation.\n- **Preimage** — The original figure before a transformation is applied.\n- **Image** — The resulting figure after a transformation is applied.\n- **Line of Reflection** — The line over which a figure is reflected.\n- **Center of Rotation** — The fixed point about which a figure is rotated.\n- **Vector** — A quantity that has both magnitude and direction, written as [\\langle a, b \\rangle] to describe a translation.",
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
                    "## Learn: Reflections, Translations, and Rotations\n\nRigid motions are transformations that preserve the size and shape of a figure. The three basic rigid motions are reflections, translations, and rotations. Each can be identified visually from a diagram or described algebraically on the coordinate plane.\n\n### Key Concept: Reflection\n\n- A reflection flips a figure over a line of reflection.\n- Reflection in the [x]-axis: [(x, y) \\rightarrow (x, -y)]\n- Reflection in the [y]-axis: [(x, y) \\rightarrow (-x, y)]\n- The line of reflection is the perpendicular bisector of every segment joining a point to its image.\n\n### Key Concept: Translation\n\n- A translation slides every point of a figure the same distance in the same direction.\n- Given a vector [\\langle a, b \\rangle], the translation rule is: [(x, y) \\rightarrow (x + a, y + b)]\n- Translations preserve orientation as well as size and shape.\n\n### Key Concept: Rotation\n\n- A rotation turns a figure about a fixed point (the center of rotation).\n- Rotation [180°] about the origin: [(x, y) \\rightarrow (-x, -y)]\n- Rotation [90°] counterclockwise about the origin: [(x, y) \\rightarrow (-y, x)]\n- Rotation [270°] counterclockwise about the origin: [(x, y) \\rightarrow (y, -x)]\n- A [90°] counterclockwise rotation is equivalent to a [270°] clockwise rotation.\n\n### Key Concept: Identifying Rigid Motions\n\n- **Reflection:** The figure appears as a mirror image across a line. Orientation is reversed.\n- **Translation:** Every point moves the same distance in the same direction. No flipping or turning.\n- **Rotation:** The figure turns around a point. Orientation is preserved but position changes.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Identify Rigid Motions from Diagrams\n\nGiven diagrams showing a preimage and its image, determine whether each transformation is a reflection, translation, or rotation by analyzing the relationship between the figures.\n\n### Step 1: Look for a Reflection\n\nCheck whether the image appears as a mirror image of the preimage across a line. If the figure is flipped and orientation is reversed, the transformation is a reflection. Identify the line of reflection if possible.\n\n### Step 2: Look for a Translation\n\nCheck whether every point of the figure has moved the same distance in the same direction. If the figure is simply slid without turning or flipping, the transformation is a translation.\n\n### Step 3: Look for a Rotation\n\nCheck whether the figure has turned around a fixed point. If the figure maintains its orientation relative to itself but is repositioned around a center point, the transformation is a rotation. Identify the angle and center if possible.\n\n### Step 4: Distinguish Between the Three Types\n\nCompare the relative positions of corresponding points. Reflections reverse left-right or up-down relationships; translations preserve all directional relationships; rotations turn the figure around a point.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Reflect Figures on the Coordinate Plane\n\nGiven the coordinates of a triangle's vertices, find the coordinates of the image after reflecting the triangle in the [x]-axis or [y]-axis.\n\n### Step 1: Apply the Reflection Rule for the [x]-Axis\n\nTo reflect a point in the [x]-axis, keep the [x]-coordinate the same and change the sign of the [y]-coordinate:\n[\n(x, y) \\rightarrow (x, -y)\n]\n\nFor example, reflecting [A(2, 0)] in the [x]-axis gives [A'(2, 0)]. Reflecting [B(-1, 5)] gives [B'(-1, -5)]. Reflecting [C(4, 3)] gives [C'(4, -3)].\n\n### Step 2: Apply the Reflection Rule for the [y]-Axis\n\nTo reflect a point in the [y]-axis, change the sign of the [x]-coordinate and keep the [y]-coordinate the same:\n[\n(x, y) \\rightarrow (-x, y)\n]\n\nFor example, reflecting [A(2, 0)] in the [y]-axis gives [A'(-2, 0)]. Reflecting [B(-1, 5)] gives [B'(1, 5)]. Reflecting [C(4, 3)] gives [C'(-4, 3)].\n\n### Step 3: Apply Reflections to a Second Triangle\n\nFor [\\triangle DEF] with vertices [D(4, -1)], [E(5, 2)], and [F(1, 2)], apply the same rules.\n\nReflection in the [x]-axis:\n[\nD'(4, 1), \\quad E'(5, -2), \\quad F'(1, -2)\n]\n\nReflection in the [y]-axis:\n[\nD'(-4, -1), \\quad E'(-5, 2), \\quad F'(-1, 2)\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Translate Figures on the Coordinate Plane\n\nGiven the coordinates of a triangle's vertices, find the coordinates of the image after translating the triangle along a given vector.\n\n### Step 1: Apply the Translation Rule\n\nTo translate a point along a vector [\\langle a, b \\rangle], add [a] to the [x]-coordinate and [b] to the [y]-coordinate:\n[\n(x, y) \\rightarrow (x + a, y + b)\n]\n\n### Step 2: Translate Along [\\langle 0, 2 \\rangle]\n\nFor [\\triangle ABC] with vertices [A(2, 0)], [B(-1, 5)], and [C(4, 3)]:\n[\nA'(2 + 0, 0 + 2) = A'(2, 2)\n]\n[\nB'(-1 + 0, 5 + 2) = B'(-1, 7)\n]\n[\nC'(4 + 0, 3 + 2) = C'(4, 5)\n]\n\n### Step 3: Translate Along [\\langle 3, -4 \\rangle]\n\n[\nA'(2 + 3, 0 + (-4)) = A'(5, -4)\n]\n[\nB'(-1 + 3, 5 + (-4)) = B'(2, 1)\n]\n[\nC'(4 + 3, 3 + (-4)) = C'(7, -1)\n]\n\n### Step 4: Apply Translations to a Second Triangle\n\nFor [\\triangle DEF] with vertices [D(4, -1)], [E(5, 2)], and [F(1, 2)]:\n\nTranslation along [\\langle 1, 0 \\rangle]:\n[\nD'(5, -1), \\quad E'(6, 2), \\quad F'(2, 2)\n]\n\nTranslation along [\\langle -3, 1 \\rangle]:\n[\nD'(1, 0), \\quad E'(2, 3), \\quad F'(-2, 3)\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Rotate Figures on the Coordinate Plane\n\nGiven the coordinates of a triangle's vertices, find the coordinates of the image after rotating the triangle about the origin.\n\n### Step 1: Apply a [180°] Rotation About the Origin\n\nTo rotate a point [180°] about the origin, change the sign of both coordinates:\n[\n(x, y) \\rightarrow (-x, -y)\n]\n\nFor [\\triangle ABC] with vertices [A(2, 0)], [B(-1, 5)], and [C(4, 3)]:\n[\nA'(-2, 0), \\quad B'(1, -5), \\quad C'(-4, -3)\n]\n\nFor [\\triangle DEF] with vertices [D(4, -1)], [E(5, 2)], and [F(1, 2)]:\n[\nD'(-4, 1), \\quad E'(-5, -2), \\quad F'(-1, -2)\n]\n\n### Step 2: Apply a [90°] Counterclockwise Rotation About the Origin\n\nTo rotate a point [90°] counterclockwise about the origin, switch the coordinates and negate the new [x]-coordinate:\n[\n(x, y) \\rightarrow (-y, x)\n]\n\nFor [\\triangle ABC]:\n[\nA'(0, 2), \\quad B'(-5, -1), \\quad C'(-3, 4)\n]\n\n### Step 3: Apply a [270°] Counterclockwise Rotation About the Origin\n\nTo rotate a point [270°] counterclockwise about the origin, switch the coordinates and negate the new [y]-coordinate:\n[\n(x, y) \\rightarrow (y, -x)\n]\n\nFor [\\triangle DEF]:\n[\nD'(-1, -4), \\quad E'(2, -5), \\quad F'(2, -1)\n]\n\n### Step 4: Describe a Transformation from Coordinate Changes\n\nGiven starting coordinates and ending coordinates of points, determine the transformation by analyzing how the coordinates changed. Compare the pattern of change to the rules for reflection, translation, and rotation.",
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
                    "## Mixed Exercises\n\nThe mixed exercises section provides comprehensive practice with all skills from the lesson. Problems include:\n\n- Identifying rigid motions (reflection, translation, rotation) from diagrams of preimages and images.\n- Finding image coordinates after reflecting triangles in the [x]-axis or [y]-axis.\n- Finding image coordinates after translating triangles along given vectors.\n- Finding image coordinates after rotating triangles [90°], [180°], or [270°] counterclockwise about the origin.\n- Describing transformations that map one set of coordinates to another in real-world contexts such as flight demonstrations.\n- Selecting the correct reflected plan from multiple options for a room layout.\n- Identifying transformations in everyday situations such as spinning or passing a basketball.\n- Applying rotation concepts to combination locks to determine the final numbers.\n- Analyzing transformations in natural structures such as honeycomb cells.\n- Graphing preimages and images after translations and rotations on the coordinate plane.\n- Evaluating arguments about whether a pattern is formed by translations or rotations.\n- Identifying congruence transformations given the coordinates of two congruent triangles.\n- Identifying transformations from segment endpoints and their images.\n- Identifying transformations from the coordinates of congruent quadrilaterals.\n- Analyzing the result of applying multiple reflections to a figure.\n- Evaluating student work to find and explain errors in reflecting points.\n- Defining a glide reflection based on a diagram showing a combination of translation and reflection.\n- Creating polygons that are invariant under reflection in the [y]-axis.\n- Analyzing whether reflection in the [x]-axis is equivalent to a [180°] rotation about the origin.\n\n## Review Notes\n\n- Images referenced in the worksheet (diagrams for problems 1–8 showing preimages and images, air show coordinate diagram, office floor plan reflection options, basketball spin illustration, combination lock diagram, honeycomb cell diagram, coordinate grids for problems 26–27, quilt pattern diagram for problem 28, glide reflection diagram for problem 34) could not be fully described without visual reference. Teachers should consult the original worksheet for exact figures and diagrams.\n- Problems 1–8 require visual interpretation of geometric diagrams to identify the type of rigid motion.\n- Problem 22 requires selecting the correct reflected room plan from visual options.\n- Problems 26 and 27 require graphing preimages and images on a coordinate plane.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-11-lesson-5",
        title: "Three-Dimensional Figures",
        orderIndex: 5,
        description:
          "Students identify and classify three-dimensional figures, calculate surface area and volume of prisms, cylinders, pyramids, and cones, and solve real-world problems.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: What Makes a Solid a Polyhedron?\n\nStudents examine various three-dimensional figures and consider what properties distinguish polyhedra from other solids. They discuss whether shapes with curved surfaces can be polyhedra and what features all polyhedra share.\n\n**Inquiry Question:**\nWhat features must a three-dimensional figure have to be classified as a polyhedron, and how can you identify its parts?",
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
                    "## Vocabulary\n\n- **Polyhedron** — A three-dimensional figure with faces that are polygons.\n- **Face** — A flat surface of a polyhedron.\n- **Edge** — A line segment where two faces of a polyhedron meet.\n- **Vertex** — A point where three or more edges of a polyhedron meet.\n- **Base** — A special face of a solid, often parallel to another face, used to name the solid.\n- **Prism** — A polyhedron with two parallel congruent bases and rectangular lateral faces.\n- **Pyramid** — A polyhedron with one base and triangular lateral faces that meet at a common vertex.\n- **Cylinder** — A solid with two parallel congruent circular bases and a curved lateral surface.\n- **Cone** — A solid with one circular base and a curved lateral surface that meets at a vertex.\n- **Sphere** — A set of all points in space equidistant from a center point.\n- **Surface Area** — The sum of the areas of all faces and surfaces of a solid.\n- **Volume** — The amount of space inside a three-dimensional figure, measured in cubic units.\n- **Slant Height** — The height of a lateral face of a regular pyramid or cone, measured along the surface.\n- **Platonic Solid** — A regular, convex polyhedron with congruent regular polygonal faces.",
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
                    "## Learn: Three-Dimensional Figures and Their Measures\n\nThree-dimensional figures can be classified by whether their surfaces are made of polygons. Polyhedra have only flat polygonal faces, while cylinders, cones, and spheres have curved surfaces. Each solid has formulas for finding surface area and volume based on its shape.\n\n### Key Concept: Classifying Solids\n\n- A **polyhedron** has faces that are all polygons. Prisms and pyramids are polyhedra.\n- A **cylinder** has two circular bases and a curved surface. It is not a polyhedron.\n- A **cone** has one circular base and a curved surface that tapers to a vertex. It is not a polyhedron.\n- A **sphere** has no faces, edges, or vertices. It is not a polyhedron.\n\n### Key Concept: Parts of a Polyhedron\n\n- **Bases:** The parallel congruent faces used to name the prism or the single face of a pyramid.\n- **Faces:** All flat surfaces, including the bases and lateral faces.\n- **Edges:** Segments where two faces intersect.\n- **Vertices:** Points where three or more edges meet.\n\n### Key Concept: Surface Area and Volume Formulas\n\n- **Rectangular Prism:**\n  [S = 2lw + 2lh + 2wh]\n  [V = lwh]\n\n- **Cylinder:**\n  [S = 2\\pi r^2 + 2\\pi rh]\n  [V = \\pi r^2 h]\n\n- **Pyramid:**\n  [S = B + \\frac{1}{2} P \\ell]\n  [V = \\frac{1}{3} B h]\n\n- **Cone:**\n  [S = \\pi r^2 + \\pi r \\ell]\n  [V = \\frac{1}{3} \\pi r^2 h]",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Identify and Classify Three-Dimensional Figures\n\nGiven diagrams of three-dimensional solids, determine whether each is a polyhedron, identify the solid by name, and name its bases, faces, edges, and vertices when applicable.\n\n### Step 1: Determine Whether the Solid Is a Polyhedron\n\nCheck whether all surfaces of the solid are flat polygons. If any surface is curved, the solid is not a polyhedron.\n\n### Step 2: Identify the Solid\n\nName the solid based on its base shape and overall structure:\n\n- Two congruent polygonal bases with rectangular faces — prism (rectangular, triangular, etc.)\n- One polygonal base with triangular faces meeting at a vertex — pyramid\n- Two circular bases with a curved surface — cylinder\n- One circular base with a curved surface tapering to a vertex — cone\n\n### Step 3: Name the Parts of Polyhedra\n\nFor each polyhedron, identify:\n\n- **Bases:** The parallel congruent faces (two for prisms, one for pyramids).\n- **Faces:** Count all flat surfaces including bases and lateral faces.\n- **Edges:** Count all segments where two faces intersect.\n- **Vertices:** Count all corner points where edges intersect.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Model Real-World Objects with Three-Dimensional Figures\n\nGiven images of everyday objects, identify which three-dimensional figure best models each object and state whether that model is a polyhedron.\n\n### Step 1: Match Objects to Solids\n\nAnalyze the shape of each object and match it to the closest geometric solid:\n\n- A can or barrel — cylinder\n- A box or crate — rectangular prism\n- A tent or roof peak — triangular prism or pyramid\n- A ball — sphere\n- An ice cream cone — cone\n\n### Step 2: Classify Each Model\n\nState whether the identified solid is a polyhedron. Cylinders, cones, and spheres are not polyhedra because they have curved surfaces. Prisms and pyramids are polyhedra because all their faces are polygons.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Find Surface Area and Volume of Solids\n\nGiven diagrams of various prisms, cylinders, pyramids, and cones with labeled dimensions, calculate the surface area and volume of each solid. Round to the nearest tenth when necessary.\n\n### Step 1: Find Surface Area and Volume of a Rectangular Prism\n\nIdentify the length, width, and height from the diagram.\n\nSurface area:\n[\nS = 2lw + 2lh + 2wh\n]\n\nVolume:\n[\nV = lwh\n]\n\n### Step 2: Find Surface Area and Volume of a Cylinder\n\nIdentify the radius and height from the diagram.\n\nSurface area:\n[\nS = 2\\pi r^2 + 2\\pi rh\n]\n\nVolume:\n[\nV = \\pi r^2 h\n]\n\n### Step 3: Find Surface Area and Volume of a Pyramid\n\nIdentify the base dimensions and slant height from the diagram. For a square pyramid with base side length [s] and slant height [\\ell]:\n\nSurface area:\n[\nS = s^2 + 2s\\ell\n]\n\nVolume:\n[\nV = \\frac{1}{3} s^2 h\n]\n\n### Step 4: Find Surface Area and Volume of a Cone\n\nIdentify the radius and height (or slant height) from the diagram. If only the radius and height are given, find the slant height first:\n[\n\\ell = \\sqrt{r^2 + h^2}\n]\n\nSurface area:\n[\nS = \\pi r^2 + \\pi r \\ell\n]\n\nVolume:\n[\nV = \\frac{1}{3} \\pi r^2 h\n]\n\n### Step 5: Find Surface Area and Volume of a Triangular Prism\n\nIdentify the dimensions of the triangular bases and the length of the prism.\n\nSurface area:\n[\nS = 2B + Ph\n]\nwhere [B] is the area of the triangular base and [P] is the perimeter of the base.\n\nVolume:\n[\nV = Bh\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Solve Real-World Problems with Surface Area and Volume\n\nApply surface area and volume formulas to solve multi-step problems in real-world contexts such as gardening, manufacturing, and geology.\n\n### Step 1: Solve a Gardening Problem\n\nA raised garden bed is constructed in the shape of a rectangular prism with given dimensions. Some faces require one material while others do not.\n\n**Part a:** Calculate the lateral surface area (excluding the top and bottom) by finding the area of the four side faces. Convert all measurements to the same unit before calculating, then round to the nearest square foot.\n\n**Part b:** Calculate the volume of soil needed, accounting for the soil level being slightly below the top of the frame. Convert the result to cubic feet, then determine how many bags of soil are needed given the volume per bag.\n\n### Step 2: Solve a Manufacturing Problem\n\nA cylindrical container has a given height and base radius. Calculate the total surface area including all faces (such as the top lid).\n\nUse the surface area formula for a cylinder including both circular bases:\n[\nS = 2\\pi r^2 + 2\\pi rh\n]\n\nSubstitute the given values and round to the nearest square inch.\n\n### Step 3: Solve a Biology Problem\n\nA fish tank in the shape of a rectangular prism has algae growing on specific surfaces. Find the total area of the affected surfaces.\n\nIdentify which faces have algae (for example, the four sides and the bottom). Calculate the area of each affected face and sum them. The result gives the total area to be tested.\n\n### Step 4: Solve a Geology Problem\n\nA natural formation is approximately cylindrical with a given diameter and depth.\n\n**Part a:** Find the surface area available for plant growth on the bottom and sides. Since the top is open, exclude one circular base. Use:\n[\nS = \\pi r^2 + 2\\pi rh\n]\nRound to the nearest square meter.\n\n**Part b:** Find the volume of the cylindrical formation using:\n[\nV = \\pi r^2 h\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Find Unknown Dimensions Given Surface Area or Volume\n\nGiven the surface area or volume of a solid and some of its dimensions, solve for the missing measurement.\n\n### Step 1: Find the Slant Height of a Pyramid\n\nGiven a square pyramid with a known base side length and total surface area, find the slant height.\n\nStart with the surface area formula for a square pyramid:\n[\nS = s^2 + 2s\\ell\n]\n\nSubstitute the known values for surface area and base side length, then solve for [\\ell]:\n[\n\\ell = \\frac{S - s^2}{2s}\n]\n\n### Step 2: Find the Base Area of a Pyramid\n\nGiven a pyramid with known volume and height, find the area of its base.\n\nStart with the volume formula:\n[\nV = \\frac{1}{3} B h\n]\n\nSubstitute the known values and solve for [B]:\n[\nB = \\frac{3V}{h}\n]\n\n### Step 3: Find the Radius of a Cone\n\nGiven a cone with known volume and height, find its radius.\n\nStart with the volume formula:\n[\nV = \\frac{1}{3} \\pi r^2 h\n]\n\nSubstitute the known values and solve for [r]:\n[\nr = \\sqrt{\\frac{3V}{\\pi h}}\n]\n\nRound to the nearest inch.",
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
                    "## Mixed Exercises\n\nThe mixed exercises section provides comprehensive practice with all skills from the lesson. Problems include:\n\n- Identifying the number of edges of a Platonic solid (cube).\n- Finding the volume of a composite solid made of a cylinder and a cone.\n- Finding and analyzing a real-world object that can be modeled with three-dimensional figures.\n- Converting volume measurements between cubic centimeters and cubic meters.\n- Using density to find the weight of objects with the same volume but different materials.\n- Generalizing the relationship among volume, weight, and density.\n- Finding the volume of a cylinder that packages spherical objects.\n- Evaluating student work to find and explain errors in calculating the surface area of a rectangular prism.\n- Analyzing what solid results when the number of sides of a prism or pyramid base increases infinitely.\n- Comparing the volumes of a cone and a pyramid with related dimensions.\n- Drawing an irregular polyhedron with a specified number of faces and two congruent bases.\n- Finding the volume of a cube given its total surface area.\n- Analyzing whether a cube is a regular polyhedron and justifying the argument.\n\n## Review Notes\n\n- Images referenced in the worksheet (diagrams for problems 1–3 showing three-dimensional solids, images for problems 4–6 showing everyday objects, diagrams for problems 7–12 showing prisms, cylinders, pyramids, and cones with labeled dimensions, diagram for problem 13 showing a raised garden frame, diagram for problem 14 showing a cylindrical trash can, diagram for problem 15 showing a rectangular prism fish tank, diagram for problem 16 showing a cylindrical tiankeng, diagram for problem 17 showing a square pyramid roof model, diagram for problem 19 showing a conical cup, diagram for problem 21 showing a silo composed of a cylinder and cone, diagram for problem 23 showing pyramid-shaped lawn ornaments, diagram for problem 24 showing a cylindrical package containing tennis balls, diagram for problem 25 showing a rectangular prism with student work) could not be fully described without visual reference. Teachers should consult the original worksheet for exact figures, dimensions, and diagrams.\n- Problems 1–3 require visual interpretation of solid diagrams to classify and name parts.\n- Problems 4–6 require matching images of objects to three-dimensional figures.\n- Problems 7–12 require diagrams with labeled dimensions to calculate surface area and volume.\n- Problems 13–16 are multi-step real-world application problems requiring unit conversions and rounding.\n- Problems 17–19 require solving for unknown dimensions using given surface area or volume values.\n- Problem 22 is an open-ended task requiring students to find their own real-world object.\n- Problem 28 requires drawing an original irregular polyhedron.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-11-lesson-6",
        title: "Two-Dimensional Representations of Three-Dimensional Figures",
        orderIndex: 6,
        description:
          "Students interpret orthographic drawings, create orthographic drawings, use nets to identify solids and find surface area, and classify Platonic solids from their nets.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: How Can a Flat Drawing Show a 3D Object?\n\nStudents examine different ways to represent a three-dimensional object on paper. They discuss how a single viewpoint can be misleading and explore why multiple views or unfolded patterns are needed to communicate the full shape of a solid.\n\n**Inquiry Question:**\nWhat information is lost when a three-dimensional object is drawn from only one perspective, and how can we recover it?",
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
                    "## Vocabulary\n\n- **Orthographic Drawing** — A two-dimensional representation of a three-dimensional object that shows multiple views (top, front, left, right).\n- **Net** — A two-dimensional pattern that can be folded to form a three-dimensional solid.\n- **Surface Area** — The sum of the areas of all the faces of a three-dimensional figure.\n- **Platonic Solid** — A regular, convex polyhedron in which all faces are congruent regular polygons and the same number of faces meet at each vertex.\n- **Prism** — A polyhedron with two congruent, parallel bases and rectangular lateral faces.\n- **Pyramid** — A polyhedron with one base and triangular lateral faces that meet at a common vertex.\n- **Face** — A flat surface of a polyhedron.\n- **Edge** — A line segment where two faces of a polyhedron meet.\n- **Vertex** — A point where three or more edges of a polyhedron meet.",
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
                    "## Learn: Representing Solids in Two Dimensions\n\nThree-dimensional figures can be represented in two dimensions using orthographic drawings (multiple views) or nets (unfolded faces). Each representation reveals different properties of the solid and is useful for different purposes such as construction, packaging design, and visualization.\n\n### Key Concept: Orthographic Drawings\n\n- An orthographic drawing shows the top, front, left, and right views of a solid separately.\n- Each view is drawn as if looking directly at that face.\n- By combining all views, one can reconstruct or build a model of the solid.\n\n### Key Concept: Nets\n\n- A net is an arrangement of all the faces of a solid laid out flat.\n- When folded along the edges, the net forms the complete solid.\n- Nets are useful for calculating surface area and for constructing physical models.\n\n### Key Concept: Platonic Solids\n\n- There are exactly five Platonic solids: tetrahedron, cube, octahedron, dodecahedron, and icosahedron.\n- Each Platonic solid has congruent regular polygons for faces and the same number of faces meeting at every vertex.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Build a Model from an Orthographic Drawing\n\nGiven an orthographic drawing showing the top, front, left, and right views, construct a model of the corresponding three-dimensional figure using unit cubes.\n\n### Step 1: Analyze the Top View\n\nThe top view shows the footprint of the solid from above. Use this to determine the length and width of the base and the arrangement of cubes in the bottom layer.\n\n### Step 2: Use the Front and Side Views to Determine Height\n\nThe front view shows the height of each column from the front. The left and right views show the height from the sides. Combine these to determine how many cubes are stacked in each position.\n\n### Step 3: Build the Model\n\nPlace unit cubes according to the heights determined from all views. Verify that the completed model matches every view in the orthographic drawing.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Make an Orthographic Drawing from a Model\n\nGiven a solid built from unit cubes, create an orthographic drawing that shows the top, front, left, and right views.\n\n### Step 1: Determine the Top View\n\nLook directly down on the solid and draw the footprint, showing which positions are occupied by cubes.\n\n### Step 2: Determine the Front View\n\nLook directly at the front of the solid. Draw the outline formed by the highest cube in each column. The front view shows the height and width of the solid.\n\n### Step 3: Determine the Left and Right Views\n\nLook directly at the left and right sides of the solid. Each side view shows the height and depth of the solid. Draw the outline formed by the highest cube in each row from that perspective.\n\n### Step 4: Assemble the Orthographic Drawing\n\nArrange the four views in a standard layout so that they can be used together to reconstruct the solid.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Identify Solids and Find Surface Area from Nets\n\nGiven a net, determine what three-dimensional solid it represents, then calculate the surface area by finding the total area of all faces.\n\n### Step 1: Identify the Solid from the Net\n\nCount the number and shape of the faces in the net. Look for the arrangement that indicates a particular solid:\n\n- Two congruent polygonal bases with rectangular faces between them indicate a prism.\n- One polygonal base with triangular faces meeting at a point indicates a pyramid.\n\n### Step 2: Find the Area of Each Face\n\nCalculate the area of each distinct face shape. For rectangles, use:\n[\nA = l \\times w\n]\n\nFor triangles, use:\n[\nA = \\frac{1}{2}bh\n]\n\n### Step 3: Sum the Areas to Find Surface Area\n\nAdd the areas of all faces in the net. The total is the surface area of the solid.\n[\nSA = \\text{sum of the areas of all faces}\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Identify Platonic Solids from Nets\n\nGiven a net, identify which of the five Platonic solids it represents.\n\n### Step 1: Count the Number and Type of Faces\n\nDetermine whether the net consists entirely of congruent regular polygons:\n\n- Four equilateral triangles: Tetrahedron\n- Six squares: Cube (Hexahedron)\n- Eight equilateral triangles: Octahedron\n- Twelve regular pentagons: Dodecahedron\n- Twenty equilateral triangles: Icosahedron\n\n### Step 2: Verify the Vertex Configuration\n\nConfirm that the same number of faces meets at each vertex when folded. This regularity is what defines a Platonic solid.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Draw a Net for a Rectangular Prism and a Triangular Prism\n\nSketch a net that can be folded to form the given prism. Ensure all faces are connected along edges and that the net can fold without overlapping.\n\n### Step 1: Identify the Bases and Lateral Faces\n\nFor a rectangular prism, identify the two congruent rectangular bases and four rectangular lateral faces.\n\nFor a triangular prism, identify the two congruent triangular bases and three rectangular lateral faces.\n\n### Step 2: Arrange the Faces in a Net\n\nLay out the lateral faces in a row, with the bases attached to opposite sides of one of the lateral faces. There are multiple valid arrangements for any prism.\n\n### Step 3: Verify the Net\n\nCheck that the net contains exactly the right number of faces and that all edges match up correctly when folded. Label dimensions if given.",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Example 6",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 6 — Draw a Net for Pyramids and Other Prisms\n\nSketch nets for solids such as a square pyramid, a hexagonal prism, a pentagonal prism, and a triangular pyramid.\n\n### Step 1: Analyze the Base and Lateral Faces\n\nFor a square pyramid, the net has one square base and four congruent triangular faces.\n\nFor a hexagonal prism, the net has two hexagonal bases and six rectangular lateral faces.\n\nFor a pentagonal prism, the net has two pentagonal bases and five rectangular lateral faces.\n\nFor a triangular pyramid (tetrahedron), the net has four triangular faces.\n\n### Step 2: Sketch the Net\n\nArrange the lateral faces around the base so that they can fold up to meet at the apex (for pyramids) or at the opposite base (for prisms). Ensure adjacent edges match in length.\n\n### Step 3: Confirm Completeness\n\nCount the total number of faces and verify that every edge of the solid is accounted for in the net.",
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
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises provide practice with all skills from the lesson: interpreting orthographic drawings, creating orthographic drawings, working with nets, identifying Platonic solids, and calculating surface area. Problems include:\n\n- Using an orthographic drawing to make a model of a game piece.\n- Making an orthographic drawing to show multiple views of a storage cabinet.\n- Identifying a real-world object that can be represented by a given net.\n- Calculating the amount of wrapping paper needed by finding the surface area from a net.\n- Analyzing whether a given net with known edge lengths could represent a solid with a specified surface area.\n- Determining which orthographic drawing does not belong with a set and justifying the conclusion.\n- Finding and explaining errors in two students' nets for a square pyramid.\n- Creating a possible net for a box used in packaging.\n- Writing a description of the similarities and differences between orthographic drawings and nets.\n- Describing all five Platonic solids, including the number of faces, vertices, edges, and the number of shapes meeting at each vertex.\n\n## Review Notes\n\n- Images referenced in the worksheet (orthographic drawings for Examples 1 and 2, nets for Examples 3 and 4, solid figures for Examples 5 and 6, game piece orthographic drawing, storage cabinet figure, nets for mixed exercises problems 25, 26, 27, 28, 29, and 30) could not be fully described without visual reference. Teachers should consult the original worksheet for exact figures, diagrams, and dimensions.\n- Several problems in Examples 3 and 4 and throughout the mixed exercises require interpreting visual nets to identify solids and calculate surface area; visual reference is essential for these problems.\n- Platonic solid descriptions in problem 32 require knowledge of the five regular polyhedra: tetrahedron (4 triangular faces, 4 vertices, 6 edges, 3 triangles per vertex), cube (6 square faces, 8 vertices, 12 edges, 3 squares per vertex), octahedron (8 triangular faces, 6 vertices, 12 edges, 4 triangles per vertex), dodecahedron (12 pentagonal faces, 20 vertices, 30 edges, 3 pentagons per vertex), and icosahedron (20 triangular faces, 12 vertices, 30 edges, 5 triangles per vertex).",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-11-lesson-7",
        title: "Precision and Accuracy",
        orderIndex: 7,
        description:
          "Students distinguish between accuracy and precision in measurement contexts, calculate approximate error, and determine possible ranges of measurements.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: What Makes a Measurement Good?\n\nStudents discuss what it means for a measurement to be \"good.\" Consider whether being close to the true value is the same as being consistent, and whether a measurement can be one without the other.\n\n**Inquiry Question:**\nCan a set of measurements be accurate without being precise? Can it be precise without being accurate?",
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
                    "## Vocabulary\n\n- **Accuracy** — How close a measured value is to the actual or true value.\n- **Precision** — How close repeated measurements are to each other; the level of detail in a measurement.\n- **Approximate Error** — The difference between a measured value and the actual value.\n- **Greatest Possible Error** — Half of the smallest unit used in a measurement.\n- **Measurement** — A value assigned to a physical quantity using a standard unit.",
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
                    "## Learn: Precision, Accuracy, and Error\n\nMeasurements are never exact. Accuracy describes how close a measurement is to the true value, while precision describes how detailed or consistent the measurements are. Approximate error quantifies the difference between a measured value and the actual value. When a measurement is recorded to a given precision, the true value lies within a range centered at the measured value.\n\n### Key Concept: Accuracy and Precision\n\n- **Accuracy** refers to closeness to the true or accepted value.\n- **Precision** refers to the consistency of repeated measurements or the fineness of the measuring tool.\n- A set of data can be accurate, precise, both, or neither.\n\n### Key Concept: Approximate Error\n\n- The approximate error of a measurement is found by subtracting the actual value from the measured value:\n[\n\\text{approximate error} = \\text{measured value} - \\text{actual value}\n]\n\n### Key Concept: Possible Range of a Measurement\n\n- When a measurement is given to a certain precision, the greatest possible error is half of the smallest unit shown.\n- The actual value lies in the interval:\n[\n\\text{measured value} - \\text{greatest possible error} \\leq \\text{actual value} \\leq \\text{measured value} + \\text{greatest possible error}\n]\n- For area or cost calculations based on measured dimensions, use the least and greatest possible dimensions to find the range.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Analyze Accuracy and Precision from Data\n\nGiven a manufacturer's claim and a sample of measurements, determine whether the claim is accurate and/or precise.\n\n### Step 1: Find the Mean of the Sample\n\nCalculate the average of the sample values to assess accuracy compared to the claimed value.\n\n### Step 2: Assess Accuracy\n\nCompare the sample mean to the claimed value. If the mean is close to the claimed value, the measurements are accurate.\n\n### Step 3: Assess Precision\n\nExamine how close the sample values are to each other. If the values cluster tightly together, the measurements are precise.\n\n### Step 4: Explain the Reasoning\n\nState whether the claim is accurate, precise, both, or neither, using the calculations to justify the conclusion.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Calculate Approximate Error\n\nFind the approximate error for various measurements in real-world contexts.\n\n### Step 1: Identify the Actual and Measured Values\n\nExtract the actual (true) value and the measured value from the problem statement.\n\n### Step 2: Apply the Approximate Error Formula\n\nSubtract the actual value from the measured value:\n[\n\\text{approximate error} = \\text{measured value} - \\text{actual value}\n]\n\n### Step 3: Interpret the Result\n\nState the approximate error with the appropriate units. A positive error means the measurement is too high; a negative error means it is too low.\n\nProblems include weighing a known weight on different scales, measuring circuit amperage, measuring a door frame height, and measuring the boiling point of water.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Determine Possible Range for Area and Cost\n\nGiven measured dimensions of a region and a unit cost, find the possible range for the area and the total cost.\n\n### Step 1: Determine the Greatest Possible Error\n\nIdentify the precision of each measured dimension. The greatest possible error is half of the smallest unit shown.\n\n### Step 2: Find the Least and Greatest Possible Dimensions\n\nSubtract the greatest possible error from each measured dimension to find the least possible value, and add it to find the greatest possible value.\n\n### Step 3: Calculate the Range for the Area\n\nMultiply the least possible dimensions to find the minimum area, and multiply the greatest possible dimensions to find the maximum area.\n\n### Step 4: Calculate the Range for the Cost\n\nMultiply the minimum and maximum areas by the unit cost to find the possible range for the total cost.\n\nProblems include finding the area and cost of a road section and finding the dimensions, area, and cost for grass seed on a lawn.",
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
                    "## Mixed Exercises\n\nThe mixed exercises section provides comprehensive practice with all skills from the lesson. Problems include:\n\n- Finding the approximate error of temperature, length, speed, and weight measurements.\n- Evaluating the accuracy of deli scales using a known standard weight.\n- Finding the possible range for fertilizer cost based on garden dimensions.\n- Finding the possible range for wallpaper cost based on wall dimensions.\n- Classifying sets of measurements as accurate, precise, both, or neither compared to a known correct value.\n- Explaining the difference between accuracy and precision in writing.\n- Evaluating whether accuracy necessarily implies precision and providing a counterexample if not.\n- Calculating face areas and surface area of a rectangular prism from labeled dimensions.\n- Determining the range of values that should contain the true surface area based on measurement precision.\n- Analyzing how an incorrect measurement affects the calculated surface area.\n- Creating a sample of data that is both accurate and precise relative to a target value.\n\n## Review Notes\n\n- Images referenced in the worksheet (road dimensions diagram for problem 6, lawn dimensions diagram for problem 7, thermometer diagram for problem 8, scale results table for problem 12, garden dimensions diagram for problem 13, box dimensions diagram for problem 19) could not be fully described without visual reference. Teachers should consult the original worksheet for exact values and diagrams.\n- Problems 6, 7, 13, 15, and 19 require interpreting measured dimensions and their precision to determine possible ranges for area or cost.\n- Problem 12 requires reading a table of scale measurements to determine which scale is most accurate.\n- Problem 19 involves a three-dimensional figure with labeled dimensions; visual reference is essential.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-11-lesson-8",
        title: "Representing Measurements",
        orderIndex: 8,
        description:
          "Students count significant digits in measurements, determine possible ranges based on precision, and apply correct significant figures in area, perimeter, and circumference calculations.",
        phases: [
          {
            phaseNumber: 1,
            title: "Explore",
            phaseType: "explore" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Explore: How Precise Is a Measurement?\n\nStudents consider what a reported measurement tells us about the actual value. If a length is reported as 5.2 centimeters, what is the smallest and largest the true length could be? How does the number of digits change what we know about the measurement?\n\n**Inquiry Question:**\nWhy does adding more digits to a measurement make it more precise, and how do you know which digits actually matter?",
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
                    "## Vocabulary\n\n- **Significant Figures** — The digits in a measurement that carry meaning contributing to its precision.\n- **Significant Digits** — Another name for significant figures; the reliable digits in a reported measurement.\n- **Precision** — The level of detail of a measurement, indicated by the place value of the last significant digit.\n- **Accuracy** — How close a measurement is to the true or accepted value.\n- **Leading Zeros** — Zeros that precede all non-zero digits in a number; they are not significant.\n- **Trailing Zeros** — Zeros at the end of a number; they are significant only if a decimal point is present.\n- **Measurement** — A number with a unit that expresses the size or amount of a quantity.",
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
                    "## Learn: Significant Figures in Measurements and Calculations\n\nSignificant figures communicate the precision of a measurement. Rules determine which digits in a number are significant, and additional rules govern how to report results after arithmetic operations.\n\n### Key Concept: Rules for Significant Figures\n\n- All non-zero digits are significant.\n- Zeros between non-zero digits are significant.\n- Leading zeros are not significant.\n- Trailing zeros are significant if the number contains a decimal point.\n- In a whole number without a decimal point, trailing zeros may or may not be significant and are considered ambiguous without further context.\n\n### Key Concept: Range of a Measurement\n\nA measurement reported to a certain precision has a greatest possible value and a least possible value that are half a unit above and half a unit below the reported value in the last significant place.\n\n### Key Concept: Operations with Significant Figures\n\n- For addition and subtraction, round the result to the same number of decimal places as the measurement with the fewest decimal places.\n- For multiplication and division, round the result to the same number of significant figures as the measurement with the fewest significant figures.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Count Significant Digits in Measurements\n\nApply the rules for significant figures to count how many digits are significant in each given measurement.\n\n### Step 1: Identify Non-Zero Digits\n\nCount all non-zero digits as significant.\n\n[\n54.023 \\text{ has } 5 \\text{ significant digits}\n]\n\n[\n0.923 \\text{ has } 3 \\text{ significant digits}\n]\n\n[\n100.58 \\text{ has } 5 \\text{ significant digits}\n]\n\n### Step 2: Account for Leading Zeros\n\nLeading zeros are placeholders and are not significant.\n\n[\n0.0002 \\text{ has } 1 \\text{ significant digit}\n]\n\n### Step 3: Account for Trailing Zeros After a Decimal\n\nZeros after the last non-zero digit and after the decimal point are significant.\n\n[\n0.30 \\text{ has } 2 \\text{ significant digits}\n]\n\n[\n101.01 \\text{ has } 5 \\text{ significant digits}\n]\n\n### Step 4: Apply to a Real-World Context\n\nCompare several reported measurements of the same object and determine which one is reported with the required number of significant digits.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Find the Possible Range of a Segment Length\n\nGiven a measurement for the length of a segment, find the greatest possible measurement and the least possible measurement consistent with the reported precision.\n\n### Step 1: Identify the Place Value of Precision\n\nDetermine the place value of the last significant digit in the reported measurement.\n\nFor a measurement reported to the nearest tenth:\n[\n\\text{Greatest possible value} = \\text{reported value} + 0.05\n]\n\n[\n\\text{Least possible value} = \\text{reported value} - 0.05\n]\n\n### Step 2: Calculate the Range\n\nApply the half-unit above and half-unit below rule to find the interval containing the true length.\n\n### Step 3: Apply to Diagrams\n\nUse segment diagrams with labeled measurements to determine the possible range for each indicated length. Express the range as an inequality or interval.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Significant Figures in Area of a Triangle\n\nThe base of a triangle is fixed. Given several different heights, determine how many significant figures the computed area should have.\n\n### Step 1: Recall the Area Formula\n\nThe area of a triangle is:\n[\nA = \\frac{1}{2}bh\n]\n\n### Step 2: Determine Significant Figures in Each Factor\n\nCount the significant figures in the fixed base and in each given height.\n\n### Step 3: Apply the Multiplication Rule\n\nFor multiplication, the result should be rounded to the same number of significant figures as the factor with the fewest significant figures.\n\nIf the base has 4 significant figures and a height has 3 significant figures, the area should be reported with 3 significant figures.\n\n### Step 4: Verify with Multiple Heights\n\nRepeat the process for each height and observe how the number of significant figures in the height affects the precision of the area.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Real-World Applications with Significant Figures\n\nSolve applied problems by performing arithmetic and rounding the final answer to the correct number of significant figures.\n\n### Step 1: Subtraction with Significant Figures\n\nSubtract two measurements and round to the correct number of decimal places.\n\n[\n8.341 \\text{ mL} - 1.1 \\text{ mL}\n]\n\nSince 1.1 has only one decimal place, round the result to one decimal place.\n\n### Step 2: Area of a Parallelogram\n\nUse the formula [\nA = bh\n] to find the area of a parallelogram with given base and height. Round the result to the least number of significant figures in the given dimensions.\n\n### Step 3: Area of a Triangle\n\nUse [\nA = \\frac{1}{2}bh\n] with given base and height. Round the computed area to match the factor with the fewest significant figures.\n\n### Step 4: Estimate and Compute Area of a Rectangle\n\nEstimate the area of a rectangular region using the given dimensions, then find the exact area and round to the correct number of significant figures.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Possible Range for Area and Circumference of a Circle\n\nGiven the radius of a circle with a certain precision, find the possible range for the area and circumference.\n\n### Step 1: Determine the Range of the Radius\n\nFind the greatest and least possible values of the radius based on its reported precision.\n\n### Step 2: Compute the Greatest and Least Possible Area\n\nUse [\nA = \\pi r^2\n] with the greatest radius to find the greatest possible area, and with the least radius to find the least possible area. Round each result to the correct number of significant figures.\n\n### Step 3: Compute the Greatest and Least Possible Circumference\n\nUse [\nC = 2\\pi r\n] with the extreme values of the radius to find the range of possible circumferences. Round to the correct number of significant figures.",
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
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson: counting significant digits, finding possible measurement ranges, computing areas and perimeters with correct significant figures, and applying these skills to real-world contexts. Problems include:\n\n- Counting significant digits in decimal and whole-number measurements, including cases with leading and trailing zeros.\n- Finding the difference between two mass measurements and rounding to the correct precision.\n- Adding multiple mass measurements on a plate and rounding the total to the correct number of decimal places.\n- Interpreting digital scale readings and reporting the correct number of significant figures.\n- Finding the perimeter and area of a rectangle and rounding each to the correct number of significant figures.\n- Finding the area of a triangle given a diagram and rounding to the correct precision.\n- Solving a rate problem involving area painted per hour and rounding the time to the correct number of significant figures.\n- Using density and volume to find mass and rounding to the correct number of significant figures.\n- Adding two distance measurements from a trip and rounding to the correct precision.\n- Finding the volume of a rectangular prism and rounding to the correct number of significant figures.\n- Solving a cost-of-travel problem using miles per gallon and cost per gallon, rounding to the correct number of significant figures.\n- Analyzing a student's error in reporting the area of a rectangle with significant figures and explaining the correct approach.\n- Solving a multi-step solar panel electricity problem involving unit conversions and rounding appropriately.\n- Writing an explanation about whether two measurements with different decimal placements have the same number of significant figures.\n- Explaining the process of using significant figures to report sums and products of two measures.\n- Analyzing whether the statement \"zeros are significant figures\" is sometimes, always, or never true, with justification.\n- Creating possible swim team times with four significant digits that satisfy a given comparison condition.\n\n## Review Notes\n\n- Images referenced in the worksheet (segment length diagrams, triangle diagrams, circle radius diagrams, digital scales, rectangular prism, gas price display, and various measurement illustrations) could not be fully described without visual reference. Teachers should consult the original worksheet for exact values and diagrams.",
                },
              },
            ],
          },
        ],
      },
    ];

    const results: SeedModule11LessonsResult["lessons"] = [];

    for (const lesson of lessonsData) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 11,
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
