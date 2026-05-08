import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule10Result {
  lessons: Array<{
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    slug: string;
    phasesCreated: number;
  }>;
}

const lessonsData = [
  {
    slug: "module-10-lesson-1",
    title: "The Geometric System",
    description:
      "Understand the structure of an axiomatic system and distinguish between axioms and conclusions. Apply given axioms to real-world situations to draw valid logical conclusions. Differentiate between synthetic geometry and analytic geometry based on their defining characteristics. Construct and evaluate models for a given set of axioms.",
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
                "## Vocabulary\n\n* **Axiomatic System** — A logical structure built from undefined terms, defined terms, axioms, and theorems.\n* **Axiom** — A statement accepted as true without proof; a rule or assumption in a system.\n* **Conclusion** — A statement that logically follows from one or more axioms or given facts.\n* **Synthetic Geometry** — The study of geometry using logical reasoning and proof without relying on a coordinate system or numerical measurements.\n* **Analytic Geometry** — The study of geometry using a coordinate system, algebra, and numerical calculations to analyze geometric figures.\n* **Model** — A specific interpretation or diagram that satisfies all axioms of an axiomatic system.",
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
                "## Explore: What Makes a System Logical?\n\nStudents consider how games, sports, and real-world systems operate according to a set of agreed-upon rules. They explore how conclusions can be drawn when rules and facts are known.\n\nInquiry Question:\nHow can a small set of rules (axioms) be used to logically determine facts about a situation?",
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
                "## Learn: Axiomatic Systems in Geometry\n\nAn axiomatic system begins with basic assumptions called axioms. From these axioms, logical conclusions can be drawn without needing to measure or calculate.\n\n### Key Concept: Structure of an Axiomatic System\n\n* Undefined terms are the basic building blocks (for example, point, line, plane).\n* Axioms are assumptions about how those terms relate.\n* Conclusions are statements that must be true if the axioms are true.\n* A model is a specific example or diagram that satisfies every axiom in the system.\n\n### Key Concept: Synthetic vs. Analytic Geometry\n\n* **Synthetic Geometry** relies on logic, axioms, and proof. No coordinates or formulas are used.\n* **Analytic Geometry** uses coordinates, formulas (such as distance or slope), and algebraic calculations to solve geometric problems.",
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
                "## Example 1 — Draw Conclusions from Axioms\n\nUse a given set of axioms about a real-world situation to make logical conclusions. Students analyze facts about a scenario and apply the axioms to deduce what must be true.\n\n### Step 1: Identify the Axioms and Facts\n\nRead the problem to extract the axioms (rules of the system) and the given facts about individuals or items involved.\n\n### Step 2: Match Facts to Axioms\n\nDetermine which axioms apply to each given fact. Use the rules to reason about quantities, categories, and relationships.\n\n### Step 3: State Valid Conclusions\n\nFor each fact, write a conclusion that must logically follow. For example, if an axiom states that each item in a category has a specific price, and a person paid that exact price, conclude which item they purchased.",
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
                "## Example 2 — Classify Synthetic and Analytic Geometry\n\nExamine diagrams and descriptions of geometric work to classify each as synthetic geometry or analytic geometry.\n\n### Step 1: Identify Coordinate or Formula Use\n\nLook for evidence of a coordinate grid, numerical coordinates, algebraic formulas, or measured distances. If present, the figure represents analytic geometry.\n\n### Step 2: Identify Purely Logical Construction\n\nLook for compass-and-straightedge constructions, logical proofs without numbers, or figures without grids. If present, the figure represents synthetic geometry.\n\n### Step 3: Classify Each Figure\n\nBased on the presence or absence of coordinates and algebraic tools, label each figure as synthetic geometry or analytic geometry.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson. Problems include:\n\n* Applying axioms about real-world situations (restaurant menu, clothing sale, shopping) to draw logical conclusions.\n* Classifying classroom tools and projects as synthetic or analytic geometry and explaining the reasoning.\n* Determining whether a test problem involving a distance formula represents synthetic or analytic geometry.\n* Writing original axioms based on collected survey data and using them to form a conclusion.\n* Evaluating whether a given set of bus routes satisfies all axioms of an axiomatic system and justifying the argument.\n* Drawing a model that satisfies a given list of axioms about points and lines.\n* Identifying which diagram does not satisfy the axioms of three-point geometry.\n* Finding and explaining errors in a student's conclusions from an axiomatic system.\n* Comparing the rules and plays of a game to the elements of an axiomatic system.\n* Using assumptions to classify a blueprint on a grid as synthetic or analytic geometry.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-10-lesson-2",
    title: "Points, Lines, and Planes",
    description:
      "Identify and name points, lines, and planes from geometric figures. Determine relationships between points, lines, and planes, including collinear, coplanar, and intersecting. Model real-world objects and situations with correct geometric terms. Draw and label figures that accurately represent given geometric relationships.",
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
                "## Vocabulary\n\n* **Point** — A location in space with no size, represented by a dot and named with a capital letter.\n* **Line** — A straight path that extends infinitely in opposite directions.\n* **Plane** — A flat surface that extends infinitely in all directions.\n* **Collinear** — Points that lie on the same line.\n* **Coplanar** — Points or lines that lie in the same plane.\n* **Intersection** — The set of points that two or more geometric figures share.\n* **Line Segment** — Part of a line consisting of two endpoints and all points between them.\n* **Ray** — Part of a line with one endpoint that extends infinitely in one direction.",
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
                "## Explore: How Do Points, Lines, and Planes Connect?\n\nStudents explore the fundamental building blocks of geometry. Consider how a point with no dimension, a line with one dimension, and a plane with two dimensions relate to each other and to the physical world.\n\nInquiry Question:\nHow can three undefined terms — point, line, and plane — form the foundation for all of geometry?",
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
                "## Learn: Points, Lines, and Planes\n\nPoints, lines, and planes are the undefined terms of geometry. They are described and understood through examples and relationships rather than formal definitions.\n\n### Key Concept: Undefined Terms and Their Dimensions\n\n* A point has no dimension; it is represented by a dot and named with a capital letter.\n* A line has one dimension; it extends without end in two directions and is named by any two points on the line or by a lowercase script letter.\n* A plane has two dimensions; it extends without end and is named by a capital script letter or by three non-collinear points.\n\n### Key Concept: Relationships Between Geometric Figures\n\n* Collinear points lie on the same line.\n* Coplanar points or lines lie in the same plane.\n* Two distinct lines intersect at exactly one point.\n* Two distinct planes intersect in exactly one line.\n* A line and a plane can intersect at one point, or the line can lie entirely in the plane.",
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
                "## Example 1 — Identify Lines, Planes, and Relationships from a Figure\n\nAnalyze a three-dimensional figure containing labeled points, lines, and planes to answer questions about containment, coplanarity, and intersection.\n\n### Step 1: Identify Lines in a Given Plane\n\nName the lines that lie entirely within a specified plane.\n\n### Step 2: Count Labeled Planes\n\nDetermine the total number of distinct planes that are labeled in the figure.\n\n### Step 3: Name the Plane Containing Two Lines\n\nIdentify the plane that contains both of two given lines.\n\n### Step 4: Find the Intersection of Two Lines\n\nName the point where two given lines cross.\n\n### Step 5: Identify a Non-Coplanar Point\n\nFind a point that does not lie in the same plane as three given points.\n\n### Step 6: Determine Whether Points Are Coplanar\n\nExplain whether four specified points all lie in a single plane.\n\n### Step 7: Determine Whether Two Lines Intersect\n\nExplain whether two given lines share a common point.",
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
                "## Example 2 — Model Real-World Objects with Geometric Terms\n\nMatch everyday objects, images, and phrases to the geometric terms they best represent.\n\n### Step 1: Identify Geometric Terms from Descriptions\n\nConsider common objects such as a roof, a tabletop, or a support beam, and name the geometric term each object models.\n\n### Step 2: Identify Geometric Terms from Images\n\nExamine images of various objects and name the geometric term each represents, such as a point, line, plane, line segment, or ray.\n\n### Step 3: Identify Intersections and Spatial Relationships\n\nConsider phrases describing spatial relationships, such as where a wall meets the floor or the edge of a table, and name the geometric concept.\n\n### Step 4: Apply Terminology to Additional Objects\n\nName the geometric term modeled by objects such as a blanket, a telephone pole, or a tablet computer.",
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
                "## Example 3 — Draw and Label Geometric Figures\n\nUse tools to construct figures that illustrate specified geometric relationships.\n\n### Step 1: Draw Points on a Line\n\nSketch a line and mark two points that lie on it.\n\nFor example, points X and Y lie on: \\(\\overleftrightarrow{CD}\\)\n\n### Step 2: Draw Non-Intersecting Planes\n\nSketch two planes that do not share any points.\n\n### Step 3: Draw a Line Intersecting a Plane\n\nSketch a line that crosses a plane at exactly one point.\n\n### Step 4: Draw Non-Coplanar Lines Through a Point\n\nSketch three lines that all pass through one point but do not all lie in the same plane.\n\n### Step 5: Draw Collinear and Non-Collinear Points\n\nSketch points that are collinear in one group but include an additional point that is not collinear with the others.",
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
                "## Example 4 — Analyze a Three-Dimensional Figure for Planes and Coplanarity\n\nExamine a figure showing multiple planes to answer questions about planes and coplanar points.\n\n### Step 1: Count Planes in the Figure\n\nDetermine the total number of planes shown.\n\n### Step 2: Find Planes Containing Two Points\n\nCount how many of the shown planes contain two specified points.\n\n### Step 3: Name Coplanar Points\n\nIdentify four points that all lie in the same plane.\n\n### Step 4: Determine if Points Are Coplanar\n\nExplain whether three given points lie in the same plane.",
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
                "## Example 5 — Apply Geometric Concepts to Real-World Contexts\n\nUse geometric terminology to describe and analyze real-world situations.\n\n### Step 1: Identify Lines Formed by Intersecting Planes\n\nUsing an image of a house, name all the lines formed where the roof and exterior walls intersect.\n\n### Step 2: Model a Line and Plane Intersection\n\nIf the surface of a lake represents a plane, name the geometric term represented by where a fishing line meets the lake's surface.\n\n### Step 3: Analyze Perspective Drawing\n\na. Identify where receding lines and horizon lines intersect in an artist's perspective drawing.\n\nb. Identify examples of planes within the perspective drawing.",
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
                "## Mixed Exercises\n\nThe mixed exercises provide practice with all skills from the lesson: identifying geometric relationships from figures, modeling real-world objects with geometric terms, and drawing figures to represent relationships. Problems include:\n\n* Drawing and labeling figures for coplanar non-intersecting lines, intersecting lines with coordinates, and a third line that does not intersect either of two given lines.\n* Referring to figures to name lines containing given points, points contained in given lines, alternate names for lines, and planes containing given lines.\n* Drawing figures showing a point on a line, a plane containing a line, a line in a plane that contains some points but not others, and intersecting lines in a plane.\n* Naming geometric terms modeled by everyday objects.\n* Sketching three planes that intersect in a single point.\n* Analyzing whether two points on the surface of a prism can be neither collinear nor coplanar, and justifying the argument.\n* Finding errors in student reasoning about the greatest number of lines that can be drawn through four random points.\n* Determining the greatest number of planes determined by four points, with no three collinear.\n* Writing about finite planes and real-world examples, and explaining whether an infinite plane can exist in real life.\n* Sketching three planes that intersect in a line.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-10-lesson-3",
    title: "Line Segments",
    description:
      "Find the length of a segment by reading coordinates from a number line. Apply the Segment Addition Postulate to find missing segment lengths. Set up and solve linear equations involving segment measures. Use segment addition to model and solve real-world distance problems. Find segment measures when coordinates involve variables or midpoints.",
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
                "## Vocabulary\n\n* **Line Segment** — A part of a line consisting of two endpoints and all points between them.\n* **Endpoint** — A point at either end of a segment.\n* **Measure of a Segment** — The distance between the endpoints of a segment.\n* **Segment Addition Postulate** — If point B is between points A and C, then AB + BC = AC.\n* **Between** — A point is between two other points if it lies on the segment connecting them.\n* **Collinear** — Points that lie on the same line.\n* **Midpoint** — A point that divides a segment into two congruent segments.\n* **Congruent Segments** — Segments that have the same measure.",
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
                "## Explore: How Can You Find a Distance Without Measuring Directly?\n\nStudents consider situations where the total distance between two points is known, but only part of the distance is directly measurable. They explore how subtraction or algebraic reasoning can reveal an unknown portion of a path.\n\nInquiry Question:\nIf you know the total length of a path and the length of one section, how can you determine the length of the remaining section?",
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
                "## Learn: Measuring and Applying Line Segments\n\nLine segments are measured by finding the distance between their endpoints. On a number line, this is done by subtracting the lesser coordinate from the greater coordinate. The Segment Addition Postulate connects the parts of a segment to the whole, allowing us to solve for unknown lengths using algebra.\n\n### Key Concept: Measuring a Segment on a Number Line\n\n* The length of a segment with endpoints at coordinates a and b is found by computing the absolute difference of the coordinates.\n* If the coordinates are positive and ordered, subtract the left coordinate from the right coordinate.\n\n\\(\\overline{AB} = |b - a|\\)\n\n### Key Concept: Segment Addition Postulate\n\n* If point B lies between points A and C on a segment, then the sum of the two parts equals the whole segment.\n\n\\(AB + BC = AC\\)\n\n* This relationship can be used to write an equation when some measures are known and others are expressed as variables.",
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
                "## Examples 1 and 2 — Find Segment Lengths from Number Lines\n\nRead the coordinates of the endpoints from each number line diagram and subtract to find the segment length.\n\n### Step 1: Identify the Coordinates\n\nLocate the two endpoints on the number line and record their coordinates.\n\nFor a segment with endpoints at 3 and 10:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 2: Compute the Length\n\nSubtract the lesser coordinate from the greater coordinate to find the measure.\n\n\\(10 - 3 = 7\\)\n\n### Step 3: Apply to Additional Diagrams\n\nRepeat the process for each number line. When one or both coordinates are negative, use the same subtraction method. The result is always a positive measure.\n\nFor a segment from \\([-2]\\) to \\([5]\\):\n\\(\\overline{AB} = 5 - (-2) = 7\\)",
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
                "## Example 3 — Apply the Segment Addition Postulate Algebraically\n\nGiven that a point Y is between points X and Z, use the Segment Addition Postulate to write an equation and solve for an unknown variable. Then find the length of the requested segment.\n\n### Step 1: Write the Equation\n\nExpress the relationship XY + YZ = XZ using the given algebraic expressions.\n\nIf XY = 11, YZ = 4c, and XZ = 83:\n\\(\\overline{AB} = 10 - 3\\)\n\nIf XY = 6b, YZ = 8b, and XZ = 175:\n\\(\\overline{AB} = 10 - 3\\)\n\nIf XY = 7a, YZ = 5a, and XZ = 6a + 24:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 2: Solve for the Variable\n\nCombine like terms and isolate the variable.\n\nFor \\([6b + 8b = 175]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\nFor \\([7a + 5a = 6a + 24]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 3: Find the Requested Segment Length\n\nSubstitute the value of the variable back into the expression for the segment asked for in the problem.\n\nIf YZ = 4c and c = 18:\n\\(\\overline{AB} = 10 - 3\\)\n\nIf YZ = 8b and b = 12.5:\n\\(\\overline{AB} = 10 - 3\\)",
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
                "## Example 4 — Solve Real-World Problems Using Segment Addition\n\nApply the Segment Addition Postulate to practical situations involving distances, lengths, and locations along a straight path.\n\n### Step 1: Identify the Total and the Known Part\n\nDetermine which distance represents the total segment and which represents a part.\n\n**Railroad Track:** A straight track between two cities measures 160.5 miles total. A mail stop is 28.5 miles from the first city. The remaining distance is:\n\\(\\overline{AB} = 10 - 3\\)\n\n**Carpentry:** A board 78 inches long is cut so one piece is five times the other. Let the shorter piece be x. The total length gives:\n\\(\\overline{AB} = 10 - 3\\)\n\nThe two pieces are 13 inches and 65 inches.\n\n### Step 2: Use Collinear Points to Find a Distance\n\nWhen three locations are collinear, the total distance equals the sum of the two parts.\n\n**Walking:** A home is 2300 yards from school and 1500 yards from a pharmacy, with all three locations collinear. The pharmacy lies between the home and the school. The distance from pharmacy to school is:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 3: Set Up Multi-Step Equations\n\nWhen relationships are described with comparisons, define a variable and write an equation for the total.\n\n**Coffee Shop:** Let the distance from the coffee shop to school be x. The distance from home to the coffee shop is 3 miles more than twice that distance, so it is 2x + 3. The total distance from home to school is 5 times the coffee-shop-to-school distance, so:\n\\(\\overline{AB} = 10 - 3\\)\n\nThe distance from home to the coffee shop is:\n\\(\\overline{AB} = 10 - 3\\)",
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
                "## Example 5 — Find Segment Measures with Variables and Midpoints\n\nFind the measure of segments when number line coordinates involve variables, fractions, or midpoint relationships.\n\n### Step 1: Read Coordinates Involving Variables\n\nIdentify the coordinates of the endpoints from the diagram. Some coordinates may be given as algebraic expressions.\n\nFor a segment from \\([2x]\\) to \\([8]\\) with midpoint-related information, use the relationship between the parts.\n\n### Step 2: Use the Midpoint Relationship\n\nIf a point is the midpoint, the two resulting segments are congruent. Set their expressions equal and solve.\n\nIf the segments to the left and right of a midpoint measure \\([3y + 2]\\) and \\([5y - 4]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 3: Find the Total Segment Length\n\nSubstitute back to find each part, then add to find the whole segment.\n\n\\(\\overline{AB} = 10 - 3\\)\n\n\\(\\overline{AB} = 10 - 3\\)\n\n\\(\\text{Total} = 11 + 11 = 22\\)\n\n### Step 4: Solve with Fractional Coordinates\n\nWhen coordinates are fractions, subtract them carefully using common denominators.\n\nFor endpoints at \\(\\frac{3}{4}\\) and \\(\\frac{5}{2}\\):\n\\(\\overline{AB} = 10 - 3\\)",
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
                "## Mixed Exercises\n\nThe mixed exercises provide practice with all skills from the lesson: reading segment lengths from number lines, applying the Segment Addition Postulate with numerical values, setting up and solving algebraic equations for segment measures, working with congruent segments, and solving real-world distance problems. Problems include:\n\n* Finding a missing segment length when the total and one part are known numerically.\n* Finding the value of a variable when a segment is expressed algebraically.\n* Using congruent segments to write an equation and solve for a variable.\n* Working with midpoints to determine segment measures.\n* Solving real-world problems involving distances along straight paths, including field trips, hiking trails, race routes, and everyday locations.\n* Using precision and reasoning to write true statements about betweenness and segment relationships.\n* Analyzing whether statements about betweenness are sometimes, always, or never true.\n* Writing and solving equations with quadratic expressions for segment lengths.\n* Solving systems of equations involving two variables in a segment addition context.\n* Explaining the process for finding segment lengths and creating original segment diagrams.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-10-lesson-4",
    title: "Distance",
    description:
      "Find the distance between two points on a number line by subtracting coordinates. Determine whether segments are congruent by comparing their lengths. Use the Distance Formula to find the distance between two points in the coordinate plane. Apply the Distance Formula to solve real-world problems.",
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
                "## Vocabulary\n\n* **Distance** — The length of the segment between two points.\n* **Congruent Segments** — Segments that have the same length.\n* **Distance Formula** — A formula used to find the distance between two points \\([(x_1, y_1)]\\) and \\([(x_2, y_2)]\\) in a coordinate plane.\n* **Segment** — A part of a line that consists of two endpoints and all points between them.",
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
                "## Explore: How Can We Measure the Distance Between Two Points?\n\nStudents investigate how to find the length of a segment on a number line and in the coordinate plane. Consider whether counting units, subtracting coordinates, or using a formula gives the most reliable result.\n\nInquiry Question:\nWhy is the absolute value used when finding distance on a number line, and how does this idea extend to two dimensions?",
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
                "## Learn: Finding Distance on a Number Line and in the Coordinate Plane\n\nDistance can be found on a number line by subtracting coordinates, and in the coordinate plane by applying the Distance Formula.\n\n### Key Concept: Distance on a Number Line\n\nThe distance between two points \\([A]\\) and \\([B]\\) on a number line with coordinates \\([a]\\) and \\([b]\\) is:\n\\(\\overline{AB} = |b - a|\\)\n\n### Key Concept: The Distance Formula\n\nThe distance \\([d]\\) between two points \\([(x_1, y_1)]\\) and \\([(x_2, y_2)]\\) is:\n\\(\\overline{AB} = 10 - 3\\)",
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
                "## Example 1 — Find Segment Lengths on a Number Line\n\nUse number lines with labeled points to find the measure of various segments.\n\n### Step 1: Identify the Coordinates\n\nRead the coordinate of each endpoint from the number line.\n\n### Step 2: Subtract and Take the Absolute Value\n\nFind the distance by subtracting the smaller coordinate from the larger coordinate.\n\nFor points \\([J]\\) at \\([-3]\\) and \\([L]\\) at \\([5]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\nFor points \\([J]\\) at \\([-3]\\) and \\([K]\\) at \\([1]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\nFor points \\([K]\\) at \\([1]\\) and \\([P]\\) at \\([8]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 3: Apply to Additional Segments\n\nRepeat the process for other segments on the same or different number lines.\n\nFor points \\([N]\\) at \\([6]\\) and \\([P]\\) at \\([8]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\nFor points \\([J]\\) at \\([-3]\\) and \\([P]\\) at \\([8]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\nFor points \\([L]\\) at \\([5]\\) and \\([N]\\) at \\([6]\\):\n\\(\\overline{AB} = 10 - 3\\)",
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
                "## Example 2 — Determine Whether Segments Are Congruent\n\nCompare the lengths of segments shown on a number line to determine if they are congruent.\n\n### Step 1: Find the Length of Each Segment\n\nUse the coordinates of the endpoints to calculate each segment's length.\n\nFor \\([\\overline{AB}]\\) with endpoints \\([A]\\) and \\([B]\\):\n\\(\\overline{AB} = |B - A|\\)\n\nFor \\([\\overline{EF}]\\) with endpoints \\([E]\\) and \\([F]\\):\n\\(\\overline{AB} = |B - A|\\)\n\n### Step 2: Compare Lengths\n\nIf the lengths are equal, the segments are congruent. Write *yes* or *no*.\n\nFor example, if \\([AB = 3]\\) and \\([EF = 3]\\):\n\\(\\overline{AB} = |B - A|\\)\n\nIf \\([BD = 2]\\) and \\([DF = 4]\\):\n\\(\\overline{AB} = |B - A|\\)\n\nContinue comparing pairs of segments using their calculated lengths.",
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
                "## Example 3 — Find the Distance Between Two Points in the Coordinate Plane\n\nUse the Distance Formula to find the distance between pairs of points, including points shown on coordinate planes and points given as ordered pairs.\n\n### Step 1: Identify the Coordinates\n\nFor points shown on a graph, read the \\([x]\\)- and \\([y]\\)-coordinates of each point.\n\nFor points given as ordered pairs, such as \\([A(2, 6)]\\) and \\([N(5, 10)]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 2: Apply the Distance Formula\n\nSubstitute the coordinates into the formula and simplify.\n\nFor \\([A(2, 6)]\\) and \\([N(5, 10)]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\nFor \\([R(3, 4)]\\) and \\([T(7, 2)]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\nFor \\([X(-3, 8)]\\) and \\([Z(-5, 1)]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 3: Round When Necessary\n\nIf the result is not a perfect square, round to the nearest tenth.",
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
                "## Example 4 — Apply the Distance Formula to Real-World Problems\n\nSolve contextual problems using the Distance Formula, including paths on coordinate grids and scale conversions.\n\n### Step 1: Identify Coordinates and Scale\n\nExtract the starting and ending coordinates from the problem. Note any scale factor that converts map units to real-world units.\n\nFor a spiral beginning at the origin \\([(0, 0)]\\) and ending at a point \\([(x, y)]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 2: Apply the Distance Formula\n\nSubstitute the coordinates and compute the distance.\n\nFor a bird migrating from \\([(63, 45)]\\) to \\([(67, 10)]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 3: Convert Using the Scale Factor\n\nMultiply the map distance by the scale factor to find the real-world distance.\n\nIf each unit represents 75 kilometers:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 4: Construct Arguments Using Distance\n\nFor problems requiring justification, calculate the distance and compare it to a given threshold.\n\nFor example, to determine whether a cycling distance is at least \\([\\frac{2}{3}]\\) of a 12-mile triathlon segment:\n\\(\\overline{AB} = 10 - 3\\)\n\nCalculate the actual cycling distance using the grid scale, then compare to 8 miles and justify the conclusion with the calculated result.\n\n### Step 5: Solve Sports Applications\n\nFor a baseball infield where the distance between bases is 90 feet, use the Distance Formula to find the length of a throw from third base to a point \\([P]\\) in the outfield. Substitute the coordinates of third base and point \\([P]\\), then round to the nearest foot.",
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
                "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice with all distance skills, including:\n\n* Finding the distance between pairs of points in the coordinate plane and rounding to the nearest tenth, such as \\([M(-4, 9)]\\) and \\([N(-5, 3)]\\), \\([C(2, 4)]\\) and \\([D(5, 7)]\\), and \\([W(-8, 1)]\\) and \\([Y(0, 6)]\\).\n* Using a number line to determine whether two segments are congruent.\n* Finding points on the \\([x]\\)-axis or \\([y]\\)-axis that are a given distance from a specified point.\n* Applying the Distance Formula to real-world contexts, including knitting patterns on a coordinate grid where each unit represents 2 inches.\n* Finding the perimeter of a triangle given its vertices on a coordinate plane and converting to real-world units.\n* Analyzing whether segments in a rectangle are congruent by comparing their calculated lengths.\n* Explaining the relationship between the Pythagorean Theorem and the Distance Formula.\n* Finding a point that divides a segment in a given ratio, such as when the distance from \\([A]\\) to \\([P]\\) is twice the distance from \\([P]\\) to \\([D]\\).\n* Using the Distance Formula to find an unknown coordinate when the distance and one endpoint are known.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-10-lesson-5",
    title: "Locating Points on a Number Line",
    description:
      "Find the coordinate of a point located at a fractional distance between two given points on a number line. Locate a point that divides a segment on a number line in a given ratio. Apply partitioning concepts to solve real-world problems involving distances, locations, and proportional divisions.",
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
                "## Vocabulary\n\n* **Coordinate** — The real number that corresponds to a point on a number line.\n* **Partition** — To divide a segment into parts with a specified ratio or fraction.\n* **Ratio** — A comparison of two quantities by division.\n* **Segment** — A part of a line that consists of two endpoints and all points between them.\n* **Fractional Distance** — A portion of the total length of a segment, expressed as a fraction.",
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
                "## Explore: How Can We Precisely Locate a Point Between Two Coordinates?\n\nStudents explore how to locate points between two given coordinates by considering fractions of the distance and ratios of the two parts. Consider how finding a midpoint relates to finding other fractional locations, and how direction on the number line affects the calculation.\n\nInquiry Question:\nHow can we use fractions and ratios to precisely locate a point between two given coordinates on a number line?",
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
                "## Learn: Partitioning Segments on a Number Line\n\nTo locate a point that partitions a segment on a number line, use the coordinates of the endpoints and either a fractional distance or a ratio.\n\n### Key Concept: Fractional Distance\n\nIf point P is a fraction of the distance from point A to point B, its coordinate is:\n\\(\\overline{AB} = 10 - 3\\)\n\nThe fraction represents how far from A toward B the point lies. For example, \\([\\frac{1}{3}]\\) of the distance from A to B means:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Key Concept: Ratio Partitioning\n\nIf point X divides segment AB such that the ratio of AX to XB is m:n, then the coordinate of X is:\n\\(\\overline{AB} = 10 - 3\\)\n\nThe total number of parts is \\([m + n]\\), and the first portion is \\([\\frac{m}{m+n}]\\) of the whole segment.",
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
                "## Example 1 — Locate Points Using Fractional Distances\n\nGiven two endpoints on a number line, find the coordinate of a point located at a specified fractional distance from one endpoint toward the other.\n\n### Step 1: Identify the Coordinates of the Endpoints\n\nRead the coordinates of the two given points from the number line. Let the starting point have coordinate \\([x_1]\\) and the ending point have coordinate \\([x_2]\\).\n\n### Step 2: Calculate the Distance Between the Endpoints\n\nFind the length of the segment by subtracting the coordinates:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 3: Find the Fractional Distance\n\nMultiply the total distance by the given fraction to determine how far to travel from the starting point:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 4: Find the Coordinate of the New Point\n\nAdd the fractional distance to the coordinate of the starting point:\n\\(\\overline{AB} = 10 - 3\\)\n\nFor example, to find a point that is \\([\\frac{2}{3}]\\) of the distance from M to J:\n\\(\\overline{AB} = 10 - 3\\)",
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
                "## Example 2 — Real-World Problems with Fractional Distances and Ratios\n\nApply the concept of partitioning to practical situations such as travel, hiking trails, and physical objects.\n\n### Step 1: Identify the Starting and Ending Values\n\nExtract the two reference points from the problem. For example, a gas stop at one mile marker and a destination at another.\n\n### Step 2: Determine the Fraction or Ratio\n\nIdentify the fraction of the total distance at which the intermediate point lies, or the ratio that describes how the segment is divided.\n\n### Step 3: Apply the Partitioning Formula\n\nFor a fractional distance, calculate the location using:\n\\(\\overline{AB} = 10 - 3\\)\n\nFor a stop at \\([3/4]\\) of the way from mile marker 36 to mile marker 353:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 4: Interpret the Result\n\nRound to the appropriate place value if the context requires it, and state the answer with proper units.\n\n### Step 5: Apply to Ratio-Based Problems\n\nWhen a point divides a segment in a given ratio, convert the ratio to a fraction of the total. For example, a ratio of 2:9 means the first part is \\([\\frac{2}{11}]\\) of the total distance:\n\\(\\overline{AB} = 10 - 3\\)",
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
                "## Example 3 — Locate Points Using Ratios on a Number Line\n\nGiven two endpoints on a number line, find the coordinate of a point that divides the segment in a specified ratio.\n\n### Step 1: Identify the Endpoints and the Ratio\n\nRead the coordinates of the two given points and identify the ratio of the two parts. For example, if the ratio of MX to XJ is 3:1.\n\n### Step 2: Convert the Ratio to a Fraction of the Total\n\nAdd the parts of the ratio to find the total number of parts:\n\\(\\overline{AB} = 10 - 3\\)\n\nThe first part is \\([\\frac{m}{m+n}]\\) of the total distance:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 3: Calculate the Coordinate\n\nApply the partitioning formula using the fraction:\n\\(\\overline{AB} = 10 - 3\\)\n\nFor a ratio of MX to XJ of 3:1:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 4: Handle Equal Ratios\n\nWhen the ratio is 1:1, the point is the midpoint of the segment:\n\\(\\overline{AB} = 10 - 3\\)",
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
                "## Example 4 — Partitioning Physical Objects\n\nApply partitioning concepts to divide physical objects, such as a canvas or a wall, into equal or proportional parts.\n\n### Step 1: Identify the Total Length\n\nDetermine the total length of the object to be partitioned. For example, a canvas that is 8 feet wide.\n\n### Step 2: Determine the Number of Equal Parts\n\nIdentify how many equal segments the length is divided into. For example, hangers placed at regular fractional intervals of the length, excluding the edges.\n\n### Step 3: Calculate the Partition Points\n\nMark the locations by adding successive fractional distances from one edge. If the canvas is centered on a wall, first find the starting position, then mark each hanger location:\n\\(\\overline{AB} = 10 - 3\\)\n\nwhere \\([k]\\) is the partition number and \\([n]\\) is the total number of equal parts.\n\n### Step 4: Justify the Placement\n\nVerify that the spacing is uniform and that the placement satisfies the given conditions, such as excluding the edges or centering the object on a larger surface.",
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
                "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson: locating points at fractional distances on a number line, partitioning segments in given ratios, and applying these concepts to real-world contexts. Problems include:\n\n* Finding the coordinate of a point at a fractional distance between two given points on a number line.\n* Locating a point that divides a segment in a given ratio on a number line.\n* Identifying which labeled point on a number line corresponds to a given fractional distance.\n* Writing an equation to find the coordinate of a point at a fractional distance.\n* Solving real-world problems involving travel distances, trail locations, photo resizing, and body proportions using partitioning.\n* Constructing a segment with a specified multiple length using a compass and straightedge.\n* Analyzing whether a statement about coordinates and fractional distances is sometimes, always, or never true.\n* Persevering through multi-step partitioning problems on a number line.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-10-lesson-6",
    title: "Locating Points on a Coordinate Plane",
    description:
      "Find the coordinates of a point that is a given fractional distance from one endpoint of a segment to the other on a coordinate plane. Find the coordinates of a point that divides a segment in a given ratio on a coordinate plane. Apply the partition formula to solve real-world problems involving locations and maps. Analyze and correct errors when applying the partition formula to find a point on a segment.",
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
                "## Vocabulary\n\n* **Partition** — To divide a segment into parts with specified proportional relationships.\n* **Ratio** — A comparison of two quantities by division.\n* **Coordinate Plane** — A two-dimensional grid formed by a horizontal x-axis and a vertical y-axis, used to locate points with ordered pairs.\n* **Endpoint** — A point at either end of a segment.\n* **Fractional Distance** — The distance from one endpoint to an interior point, expressed as a fraction of the total segment length.\n* **Section Formula** — A formula used to find the coordinates of a point that divides a segment in a given ratio.",
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
                "## Explore: How Can You Find a Point Partway Along a Segment?\n\nStudents consider how to locate a point that is not at the midpoint of a segment but at some other fractional distance from one endpoint. They explore whether proportional reasoning or weighted averages can determine the coordinates of such a point.\n\nInquiry Question:\nHow can you use the coordinates of the endpoints to find the coordinates of any point along the segment between them?",
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
                "## Learn: Partitioning Segments on a Coordinate Plane\n\nA point that lies on a segment can be located by using the coordinates of the endpoints and the desired fractional distance or ratio. The coordinates of the interior point are found by taking a weighted average of the endpoint coordinates.\n\n### Key Concept: Finding a Point at a Fractional Distance\n\nTo find a point that is \\([\\frac{m}{n}]\\) of the distance from \\([(x_1, y_1)]\\) to \\([(x_2, y_2)]\\), use the partition formula:\n\\(\\overline{AB} = 10 - 3\\)\n\nAlternatively, the coordinates can be written as:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Key Concept: Finding a Point That Divides a Segment in a Given Ratio\n\nIf a point divides a segment so that the ratio of the first part to the second part is \\([a:b]\\), then the point is \\([\\frac{a}{a+b}]\\) of the distance from the first endpoint. Apply the same partition formula using this fraction.\n\nFor example, if the ratio of \\([AX]\\) to \\([XB]\\) is \\([1:3]\\), the point \\([X]\\) is \\([\\frac{1}{4}]\\) of the distance from \\([A]\\) to \\([B]\\).",
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
                "## Example 1 — Find a Point at a Fractional Distance\n\nGiven a segment on a coordinate plane with labeled endpoints, find the coordinates of an interior point that is a specified fractional distance from one endpoint to the other.\n\n### Step 1: Identify the Endpoint Coordinates\n\nRead the coordinates of the two endpoints from the coordinate plane.\n\n### Step 2: Identify the Fractional Distance\n\nDetermine what fraction of the total distance the point is from the first endpoint.\n\n### Step 3: Apply the Partition Formula\n\nSubstitute the endpoint coordinates and the fraction into the formula. Compute each coordinate separately.\n\nFor a point that is \\([\\frac{2}{3}]\\) of the distance from \\([(x_1, y_1)]\\) to \\([(x_2, y_2)]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 4: Simplify and State the Coordinates\n\nPerform the arithmetic to find the ordered pair of the interior point.",
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
                "## Example 2 — Find a Point That Divides a Segment in a Given Ratio\n\nGiven a segment on a coordinate plane with labeled endpoints, find the coordinates of an interior point such that the ratio of the two parts is specified.\n\n### Step 1: Identify the Endpoint Coordinates\n\nRead the coordinates of the two endpoints from the coordinate plane.\n\n### Step 2: Convert the Ratio to a Fraction\n\nIf the ratio of the first part to the second part is \\([a:b]\\), the point is \\([\\frac{a}{a+b}]\\) of the distance from the first endpoint.\n\nFor example, a ratio of \\([1:3]\\) means the point is \\([\\frac{1}{4}]\\) of the distance from the first endpoint.\n\n### Step 3: Apply the Partition Formula\n\nSubstitute the endpoint coordinates and the computed fraction into the formula.\n\nFor a ratio of \\([2:3]\\), the fraction is \\([\\frac{2}{5}]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 4: Simplify and State the Coordinates\n\nPerform the arithmetic to find the ordered pair of the interior point.",
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
                "## Examples 1 and 2 — Combined Practice with Coordinate Grids\n\nApply both fractional distance and ratio methods to find interior points on segments shown on coordinate grids.\n\n### Step 1: Find a Point at a Fractional Distance\n\nRead the endpoint coordinates from the grid. Determine the specified fractional distance. Apply the partition formula and simplify.\n\n### Step 2: Find a Point That Divides a Segment in a Ratio\n\nRead the endpoint coordinates from the grid. Convert the given ratio to a fraction of the total distance. Apply the partition formula and simplify.\n\n### Step 3: Repeat for Additional Segments\n\nUse the same process for each segment on the coordinate grid, paying attention to which endpoint is used as the starting point.",
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
                "## Example 3 — Real-World Applications\n\nApply the partition formula to solve contextual problems involving maps, city planning, and navigation.\n\n### Step 1: Identify the Endpoint Coordinates and Ratio\n\nExtract the coordinates of the two endpoints from the problem description or map. Identify the ratio or fractional distance given in the context.\n\nFor example, if a person wants to stop for a break when the distance traveled to the distance remaining is \\([3:5]\\), the stopping point is \\([\\frac{3}{8}]\\) of the total distance from the starting point.\n\n### Step 2: Apply the Partition Formula\n\nSubstitute the coordinates and the fraction into the formula:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 3: Interpret the Result in Context\n\nState the coordinates of the stopping point and verify that the result makes sense on the map.\n\n### Step 4: Find Multiple Points on a Segment\n\nWhen asked to find two points that divide a segment in a given ratio, identify both possible points on either side of the segment that satisfy the ratio condition, or find two distinct interior points if the problem specifies multiple divisions.",
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
                "## Mixed Exercises\n\nThe mixed exercises provide practice with all skills from the lesson: finding points at fractional distances, dividing segments in given ratios, and applying these concepts to real-world and abstract problems. Problems include:\n\n* Finding a point on a segment that is a given fractional distance from one endpoint to the other on a coordinate grid.\n* Finding a point on a segment that divides it in a specified ratio on a coordinate grid.\n* Working backward from a known interior point and one endpoint to determine the ratio in which the point divides the segment.\n* Determining what fraction of the total distance a known interior point represents.\n* Finding the inverse ratio when the interior point divides the segment.\n* Analyzing a student's work to identify and explain an error in applying the partition formula, then finding the correct coordinates.\n* Evaluating whether a proposed formula for a one-third distance point is sometimes, always, or never correct, and justifying the argument.\n* Explaining how to find the fractional distance of a point and computing its coordinates when the point divides a segment in a given ratio.\n* Working backward from a known interior point and one endpoint to find the coordinates of the other endpoint.\n* Creating an original diagram and determining the fractional distance of a self-selected interior point.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-10-lesson-7",
    title: "Midpoints and Bisectors",
    description:
      "Find the coordinate of a midpoint on a number line. Apply the concept of midpoint to solve real-world problems. Use the Midpoint Formula to find the coordinates of the midpoint of a segment in the coordinate plane. Find the coordinates of a missing endpoint when the midpoint and one endpoint are known. Use algebraic expressions to find missing segment lengths when a point is known to be the midpoint.",
    orderIndex: 7,
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
                "## Vocabulary\n\n* **Midpoint** — The point on a segment that divides it into two congruent segments.\n* **Bisector** — A point, line, ray, or segment that divides a segment or angle into two congruent parts.\n* **Midpoint Formula** — The formula for finding the midpoint of a segment with endpoints \\([(x_1, y_1)]\\) and \\([(x_2, y_2)]\\) is \\(\\left( \\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2} \\right)\\).\n* **Segment Bisector** — A segment, ray, line, or plane that intersects a segment at its midpoint.\n* **Congruent Segments** — Segments that have the same length.",
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
                "## Explore: What Does \"Halfway\" Mean on a Number Line?\n\nStudents explore how to locate the point that is exactly halfway between two given points on a number line. They consider whether adding the coordinates and dividing by two always produces the correct halfway point.\n\nInquiry Question:\nWhy does averaging the two endpoint coordinates give the midpoint on a number line?",
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
                "## Learn: Midpoints and Segment Bisectors\n\nThe midpoint of a segment is the point that divides the segment into two segments of equal length. On a number line, the midpoint coordinate is the average of the endpoint coordinates. In the coordinate plane, the Midpoint Formula averages the x-coordinates and the y-coordinates separately.\n\n### Key Concept: Midpoint on a Number Line\n\nIf a segment has endpoints with coordinates \\([a]\\) and \\([b]\\) on a number line, the coordinate of the midpoint is:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Key Concept: Midpoint Formula in the Coordinate Plane\n\nFor a segment with endpoints \\([(x_1, y_1)]\\) and \\([(x_2, y_2)]\\), the midpoint \\([M]\\) has coordinates:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Key Concept: Finding a Missing Endpoint\n\nIf the midpoint \\([M]\\) and one endpoint are known, the missing endpoint can be found by solving for the unknown coordinate. If \\([M_x = \\frac{x_1 + x_2}{2}]\\) and \\([M_y = \\frac{y_1 + y_2}{2}]\\), then:\n\\(\\overline{AB} = 10 - 3\\)\nEquivalently, the missing endpoint is twice the midpoint coordinate minus the known endpoint coordinate.\n\n### Key Concept: Algebraic Midpoint Problems\n\nWhen a point \\([M]\\) is the midpoint of \\([\\overline{FG}]\\), the two segments \\([\\overline{FM}]\\) and \\([\\overline{MG}]\\) are congruent, so \\([FM = MG]\\). If expressions are given for \\([FM]\\) and \\([MG]\\), set them equal and solve for the variable. Then substitute back to find the segment lengths. The total length \\([FG = FM + MG = 2 \\cdot FM = 2 \\cdot MG]\\).",
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
                "## Example 1 — Find the Midpoint on a Number Line\n\nUse number lines with labeled points to find the coordinate of the midpoint of various segments.\n\n### Step 1: Identify the Endpoint Coordinates\n\nRead the number line to determine the coordinates of the two endpoints of the given segment.\n\n### Step 2: Apply the Midpoint Formula for a Number Line\n\nAdd the two endpoint coordinates and divide by 2 to find the midpoint coordinate:\n\\(\\overline{AB} = 10 - 3\\)\n\nFor example, if the endpoints are at \\([3]\\) and \\([7]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\nIf the endpoints are at \\([-4]\\) and \\([2]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\nIf the endpoints are at \\([-6]\\) and \\([-2]\\):\n\\(\\overline{AB} = 10 - 3\\)",
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
                "## Example 2 — Real-World Midpoint Applications\n\nApply the concept of midpoint to solve real-world problems involving distances and halfway locations.\n\n### Step 1: Identify the Given Information\n\nRead the problem to determine what distances or locations are known and what needs to be found.\n\n### Step 2: Apply Midpoint Reasoning\n\nIf a fence is to be built halfway between two houses, the distance from either house to the fence is half the total distance between the houses. If a location is at the midpoint between two places and the distance to one place is known, the distance to the other place is the same.\n\nFor example, if the total distance between two houses is \\([d]\\) miles, the fence should be built at a distance of:\n\\(\\overline{AB} = 10 - 3\\)\nmiles from each house.\n\nIf a home is at the midpoint between two pizzerias and one pizzeria is a quarter mile away, the other pizzeria is also a quarter mile away, and the total distance between the two pizzerias is:\n\\(\\overline{AB} = 10 - 3\\)\nmile.",
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
                "## Example 3 — Find the Midpoint in the Coordinate Plane\n\nUse the Midpoint Formula to find the coordinates of the midpoint of a segment when the two endpoints are given as ordered pairs.\n\n### Step 1: Identify the Endpoint Coordinates\n\nExtract the x- and y-coordinates of the two endpoints \\([(x_1, y_1)]\\) and \\([(x_2, y_2)]\\).\n\n### Step 2: Apply the Midpoint Formula\n\nCalculate the average of the x-coordinates and the average of the y-coordinates:\n\\(\\overline{AB} = 10 - 3\\)\n\nFor example, for endpoints \\([(5, 11)]\\) and \\([(3, 1)]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\nFor endpoints \\([(7, -5)]\\) and \\([(3, 3)]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\nFor endpoints \\([(-8, -11)]\\) and \\([(2, 5)]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\nFor endpoints with decimals, such as \\([(2.4, 14)]\\) and \\([(6, 6.8)]\\):\n\\(\\overline{AB} = 10 - 3\\)",
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
                "## Example 4 — Find a Missing Endpoint\n\nFind the coordinates of a missing endpoint when one endpoint and the midpoint of the segment are known.\n\n### Step 1: Set Up the Midpoint Equation\n\nUse the Midpoint Formula with the known endpoint \\([(x_1, y_1)]\\) and the known midpoint \\([(M_x, M_y)]\\). Let the missing endpoint be \\([(x_2, y_2)]\\).\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 2: Solve for the Missing Coordinates\n\nMultiply both sides by 2 and subtract the known coordinate:\n\\(\\overline{AB} = 10 - 3\\)\n\nFor example, if endpoint \\([C]\\) is \\([(-5, 4)]\\) and midpoint \\([B]\\) is \\([(-2, 5)]\\), find the missing endpoint \\([A = (x_2, y_2)]\\):\n\\(\\overline{AB} = 10 - 3\\)\nSo the missing endpoint is \\([(1, 6)]\\).\n\nFor another example, if endpoint \\([A]\\) is \\([(1, 7)]\\) and midpoint \\([B]\\) is \\([(-3, 1)]\\), find the missing endpoint \\([C = (x_2, y_2)]\\):\n\\(\\overline{AB} = 10 - 3\\)\nSo the missing endpoint is \\([(-7, -5)]\\).",
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
                "## Examples 5 and 6 — Algebraic Midpoint Problems\n\nGiven that \\([M]\\) is the midpoint of \\([\\overline{FG}]\\), use the fact that \\([FM = MG]\\) to find missing measures or variable values.\n\n### Step 1: Set the Segment Expressions Equal\n\nSince \\([M]\\) is the midpoint, the two parts of the segment are congruent:\n\\(\\overline{AB} = 10 - 3\\)\n\nFor example, if \\([FM = 5y + 13]\\) and \\([MG = 5 - 3y]\\):\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 2: Solve for the Variable\n\nSolve the equation for the variable:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 3: Find the Segment Lengths\n\nSubstitute back to find each segment length:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 4: Find the Total Segment Length\n\nThe total length \\([FG]\\) is the sum of the two parts:\n\\(\\overline{AB} = 10 - 3\\)\nAlternatively:\n\\(\\overline{AB} = 10 - 3\\)\n\n### Step 5: Find a Variable When the Total Length Is Known\n\nIf \\([FG]\\) is known but one part is given as an expression, first use \\([FG = 2 \\cdot FM]\\) (or \\([FG = 2 \\cdot MG]\\)) to find the value of the expression, then solve for the variable.\n\nFor example, if \\([FM = 8a + 1]\\) and \\([FG = 42]\\):\n\\(\\overline{AB} = 10 - 3\\)",
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
                "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson. Problems include:\n\n* Finding the coordinates of a missing endpoint when the midpoint and one endpoint are known.\n* Using a number line or coordinate plane diagram to find a midpoint in a real-world context (camping, game design, scavenger hunt).\n* Finding a missing variable value when a point is the midpoint of a segment on a number line or coordinate plane.\n* Calculating walking distances using midpoint information on a coordinate grid.\n* Finding the midpoint of a geometric figure (such as a quadrilateral) to locate a point for practical purposes.\n* Reasoning about the coordinates for an irrigation system by finding the midpoint of a dry area.\n* Persevering through a problem by deriving the Midpoint Formula and explaining why it works.\n* Writing about how the Midpoint Formula relates to the Section Formula.\n* Creating a segment given a midpoint and one endpoint.",
            },
          },
        ],
      },
    ],
  },
];

export const seedModule10Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule10Result> => {
    const now = Date.now();
    const results = [];

    for (const lessonData of lessonsData) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lessonData.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 10,
            title: lessonData.title,
            slug: lessonData.slug,
            description: lessonData.description,
            orderIndex: lessonData.orderIndex,
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
            title: lessonData.title,
            description: lessonData.description,
            status: "published",
            createdAt: now,
          });

      let phasesCreated = 0;

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
        slug: lessonData.slug,
        phasesCreated,
      });
    }

    return { lessons: results };
  },
});
