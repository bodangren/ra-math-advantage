import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule1LessonsResult {
  lessons: Array<{
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    phasesCreated: number;
    activitiesCreated: number;
  }>;
}

const lessonsData = [
  {
    slug: "module-1-lesson-1",
    title: "Perpendicular Bisectors",
    description:
      "Students find measures of segments related to perpendicular bisectors and angle bisectors, use the Perpendicular Bisector Theorem and its converse, and find the coordinates of the circumcenter.",
    orderIndex: 1,
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
                "## Explore: Where Do Lines Cross?\n\nA triangle has special points where certain lines meet. The perpendicular bisectors of the sides of any triangle intersect at one point, which is the center of the circle that passes through all three vertices. Students explore why this point of concurrency always exists and what properties it has.\n\n**Inquiry Question:**\nWhat makes the circumcenter unique, and how does its location relate to the type of triangle (acute, right, or obtuse)?",
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
                "## Key Terms\n\n- **Perpendicular Bisector** — A line, ray, or segment that is perpendicular to a segment at its midpoint.\n- **Circumcenter** — The point of concurrency of the perpendicular bisectors of a triangle; equidistant from all three vertices.\n- **Circumcircle** — The circle that passes through all three vertices of a triangle; centered at the circumcenter.\n- **Perpendicular Bisector Theorem** — If a point is on the perpendicular bisector of a segment, then it is equidistant from the endpoints of the segment.\n- **Converse of the Perpendicular Bisector Theorem** — If a point is equidistant from the endpoints of a segment, then it is on the perpendicular bisector of the segment.",
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
                "## Learn: Perpendicular Bisectors and Circumcenter\n\n### Key Concept: Perpendicular Bisector Theorem\n\nIf a point lies on the perpendicular bisector of a segment, then it is equally distant from both endpoints of that segment. The converse is also true: if a point is equally distant from two endpoints, it must lie on the perpendicular bisector.\n\n### Key Concept: Finding the Circumcenter\n\nThe circumcenter is the point where all three perpendicular bisectors of a triangle meet. It is equidistant from the three vertices. To find the circumcenter:\n1. Find the midpoints of at least two sides.\n2. Find the slopes of the perpendicular lines to those sides.\n3. Write equations of the perpendicular bisectors.\n4. Solve the system to find the intersection point.",
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
                "## Example 1 — Find Segment Lengths Using Perpendicular Bisectors\n\nUse the Perpendicular Bisector Theorem and properties of perpendicular bisectors to find unknown segment lengths. If a point is on the perpendicular bisector, distances to the endpoints are equal.\n\n### Step 1: Identify Known Information\nRead the diagram to identify which segments are bisected and what relationships are given.\n\n### Step 2: Apply the Perpendicular Bisector Theorem\nIf point D is on the perpendicular bisector of segment AB, then DA equals DB.\n\n### Step 3: Verify and Round\nCheck that the solution makes sense in the context of the diagram.",
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
                "## Example 2 — Find Coordinates of the Circumcenter\n\nGiven the vertices of a triangle, find the circumcenter by solving for the intersection of two perpendicular bisectors.\n\n### Step 1: Find Midpoints and Slopes\nFor two sides of the triangle, calculate the midpoint and the slope of the side.\n\n### Step 2: Write Equations\nUse point-slope form to write the equations of two perpendicular bisectors.\n\n### Step 3: Solve the System\nSolve the two equations simultaneously to find the coordinates of the circumcenter.",
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
                "## Example 3 — Apply Circumcenter in Coordinate Problems\n\nUse coordinates to solve real-world problems involving the circumcenter, such as finding the location of a monument equidistant from three points.\n\n### Step 1: Plot the Points\nGraph the three given vertices on a coordinate plane.\n\n### Step 2: Find the Circumcenter\nApply the same procedure as in Example 2 to find the point equidistant from all three vertices.\n\n### Step 3: Interpret the Result\nThe circumcenter represents the location that is equally distant from all three vertices.",
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
                "## Example 4 — Real-World Circumcenter Applications\n\nSolve applied problems where the circumcenter represents an optimal location for something that must be equidistant from three other locations.\n\n### Step 1: Set Up Coordinates\nAssign coordinates to each of the three given locations based on the problem context.\n\n### Step 2: Calculate the Circumcenter\nUse the perpendicular bisector intersection method to find the point that is equidistant from all three locations.\n\n### Step 3: Describe the Location\nGive the approximate coordinates and explain what this location represents in the context of the problem.",
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
                "## Mixed Exercises\n\nPractice involves:\n\n- Finding unknown segment lengths given diagrams with perpendicular bisectors and circumcenters.\n- Determining whether there is enough information to solve for an unknown.\n- Writing paragraph proofs of the Perpendicular Bisector Theorem.\n- Writing two-column proofs of the Converse of the Perpendicular Bisector Theorem.\n- Finding coordinates of the circumcenter given triangle vertices.\n- Describing the set of all points equidistant from two endpoints of a segment.\n- Real-world application: placing a sprinkler equidistant from three trees on a coordinate grid.\n- Geometry construction and verification using a compass.\n- Creating a coordinate proof for a baseball diamond situation.\n- PROOF: Writing a two-column proof given that a plane is a perpendicular bisector of a segment.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- Multiple diagrams referenced contain geometric figures with perpendicular bisectors in triangles.\n- The worksheet contains 24 practice problems covering perpendicular bisector theorems, circumcenter construction, and coordinate applications.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-1-lesson-2",
    title: "Angle Bisectors",
    description:
      "Students find measures of angles and segments using the Angle Bisector Theorem, apply properties of angle bisectors and the incenter, and solve problems involving the incenter.",
    orderIndex: 2,
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
                "## Explore: Where Do Angle Bisectors Meet?\n\nThe three angle bisectors of any triangle intersect at a single point. This point has a special property: it is equally distant from all three sides of the triangle. Students explore why this happens and how the incenter differs from the circumcenter.\n\n**Inquiry Question:**\nWhy does the incenter always lie inside the triangle while the circumcenter can lie outside?",
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
                "## Key Terms\n\n- **Angle Bisector** — A ray that divides an angle into two congruent angles.\n- **Incenter** — The point of concurrency of the three angle bisectors of a triangle; equidistant from all three sides.\n- **Angle Bisector Theorem** — If a point is on the bisector of an angle, then it is equidistant from the two sides of the angle.\n- **Converse of the Angle Bisector Theorem** — If a point is equidistant from the two sides of an angle, then it lies on the angle bisector.\n- **Incenter Theorem** — The incenter of a triangle is equidistant from all three sides.",
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
                "## Learn: Angle Bisectors and the Incenter\n\n### Key Concept: Angle Bisector Theorem\n\nIf a point lies on the bisector of an angle, then the perpendicular distances from that point to the two sides of the angle are equal. The converse states that if a point is equally distant from the two sides, it lies on the angle bisector.\n\n### Key Concept: The Incenter\n\nThe incenter is the point where all three angle bisectors of a triangle meet. Unlike the circumcenter, the incenter is always inside the triangle. It is the center of the circle that is tangent to all three sides of the triangle.",
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
                "## Example 1 — Find Angle and Segment Measures Using Angle Bisectors\n\nGiven a triangle with an angle bisector, use the Angle Bisector Theorem to find unknown angle measures and segment lengths.\n\n### Step 1: Identify the Angle Bisector\nLocate the ray that divides an angle into two equal parts.\n### Step 2: Apply Proportional Relationships\nWhen a ray bisects an angle, it divides the opposite side into segments proportional to the adjacent sides.\n### Step 3: Solve and Check\nSolve for the unknown variable and substitute back.",
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
                "## Example 2 — Use the Incenter to Find Measures\n\nThe incenter is where all three angle bisectors meet. Use its properties to find distances and angle measures.\n### Step 1: Recognize the Incenter\nThe incenter is equidistant from all three sides.\n### Step 2: Use Equal Distances\nSet up relationships using the fact that the incenter's distance to each side is the same.",
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
                "## Example 3 — Incenter in Triangles\n\nGiven a triangle with an incenter, find angle measures and distances from the incenter to the vertices.\n### Step 1: Find Angle Measures\nSince the incenter is on all three angle bisectors, the angles around the incenter relate to the original triangle's angles.\n### Step 2: Find Distances\nUse triangle geometry relationships to find distances from the incenter to the vertices.",
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
                "## Example 4 — Real-World Angle Bisector Applications\n\nUse angle bisectors to find points that are equidistant from the sides of an angle, such as locating a facility that should be equally distant from two roads.\n### Step 1: Interpret the Problem\nIdentify the two lines (roads) that form an angle.\n### Step 2: Locate the Point\nThe set of points equidistant from two intersecting lines is the union of the two angle bisectors.\n### Step 3: Apply Coordinates\nIf coordinates are given, find the coordinates of the point on the appropriate bisector.",
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
                "## Mixed Exercises\n\nPractice involves:\n\n- Finding the value of x in angle bisector problems.\n- Determining whether there is enough information in a diagram to solve for x.\n- Writing paragraph proofs of the Angle Bisector Theorem.\n- Writing paragraph proofs of the Converse of the Angle Bisector Theorem.\n- Writing a two-column proof of the Incenter Theorem.\n- Analyzing whether the three angle bisectors of a triangle intersect at a point in the exterior.\n- Constructing the incenter of a triangle using a compass.\n- Comparing and contrasting perpendicular bisectors and angle bisectors.\n- Writing a biconditional statement for a theorem and its converse.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- Multiple diagrams referenced show angle bisectors, incenter constructions, and coordinate grid problems.\n- The worksheet contains 27 practice problems covering angle bisector theorems, incenter properties, and real-world applications.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-1-lesson-3",
    title: "Medians and Altitudes of Triangles",
    description:
      "Students find lengths of medians, find coordinates of the centroid and orthocenter, and compare and contrast medians, perpendicular bisectors, and altitudes.",
    orderIndex: 3,
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
                "## Explore: Where Three Lines Meet\n\nEvery triangle has several sets of special lines: medians connect vertices to midpoints of opposite sides, while altitudes are perpendicular to the opposite side. Each set of three lines always meets at one point. Students explore the properties of these points of concurrency.\n\n**Inquiry Question:**\nHow does the location of the orthocenter change as the triangle goes from acute to right to obtuse?",
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
                "## Key Terms\n\n- **Median** — A segment from a vertex to the midpoint of the opposite side.\n- **Centroid** — The point of concurrency of the three medians of a triangle; located at 2/3 of the distance from each vertex to the midpoint of the opposite side.\n- **Centroid Theorem** — The medians of a triangle intersect at a point that divides each median in a 2 to 1 ratio.\n- **Altitude** — A perpendicular segment from a vertex to the line containing the opposite side.\n- **Orthocenter** — The point of concurrency of the three altitudes of a triangle.",
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
                "## Learn: Medians, Altitudes, and Points of Concurrency\n\n### Key Concept: The Centroid\n\nThe centroid is the point where all three medians intersect. It is located at 2/3 of the distance from each vertex to the midpoint of the opposite side. This means if G is the centroid and M is the midpoint of the opposite side, then AG = (2/3) AM and GM = (1/3) AM.\n\n### Key Concept: Finding the Centroid\n\nTo find the centroid given the coordinates of the vertices, find the average of the x-coordinates and the average of the y-coordinates of all three vertices.\n\n### Key Concept: The Orthocenter\n\nThe orthocenter is where all three altitudes intersect. In an acute triangle, it is inside. In a right triangle, it is at the vertex of the right angle. In an obtuse triangle, it is outside the triangle.",
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
                "## Example 1 — Find Segment Lengths Using the Centroid\n\nGiven the centroid and some segment lengths, find other lengths in the triangle.\n### Step 1: Use the 2/3 and 1/3 Relationships\nSince the centroid divides each median in a 2 to 1 ratio, if you know the distance from a vertex to the centroid, you can find the distance from the centroid to the midpoint.\n### Step 2: Set Up Equations\nLet the unknown be x and use the given lengths to set up equations.\n### Step 3: Solve and Verify\nSolve for x, then find the requested segment lengths.",
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
                "## Example 2 — Find Coordinates of the Centroid\n\nGiven the coordinates of the vertices of a triangle, find the coordinates of the centroid.\n### Step 1: Apply the Centroid Formula\nThe centroid is at [(x1 + x2 + x3) / 3, (y1 + y2 + y3) / 3].\n### Step 2: Substitute and Simplify\nPlug in the coordinates and compute the averages.",
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
                "## Example 3 — Real-World Centroid Application\n\nUse the centroid to find the point where a collage should be hung so that it balances.\n### Step 1: Model with Coordinates\nPlace the collage on a coordinate grid and find the coordinates of its vertices.\n### Step 2: Find the Centroid\nUse the centroid formula to find the balance point.\n### Step 3: Describe the Location\nThe centroid is where the string should be attached to balance the collage.",
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
                "## Example 4 — Find the Orthocenter\n\nGiven the coordinates of the vertices of a triangle, find the orthocenter.\n### Step 1: Find Equations of Two Altitudes\nFor each altitude, find the slope of the opposite side, then the negative reciprocal slope for the altitude line.\n### Step 2: Solve the System\nFind the intersection point of the two altitude equations.\n### Step 3: Verify with the Third Altitude\nCheck that the third altitude passes through the same point.",
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
                "## Mixed Exercises\n\nPractice involves:\n- Finding x, y, and z given midpoints of sides and related algebraic expressions.\n- Using properties of medians to find values of x in centroid problems.\n- Given that EC is an altitude, find the angle measures.\n- Proving the Centroid Theorem using coordinate geometry.\n- Determining whether a given segment is a perpendicular bisector, median, and/or altitude.\n- Using altitude properties to solve for x.\n- Writing paragraph proofs involving isosceles triangles and angle bisectors.\n- Finding the centroid of a triangle given coordinates.\n- Investigating relationships among the circumcenter, centroid, and orthocenter.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- Multiple diagrams referenced show medians, altitudes, centroids, and orthocenters.\n- The worksheet contains 36 practice problems covering centroid theorem, altitude properties, orthocenter construction, and proofs.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-1-lesson-4",
    title: "Inequalities in One Triangle",
    description:
      "Students list angles satisfying conditions, order angles and sides from smallest to largest, and apply triangle inequality relationships.",
    orderIndex: 4,
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
                "## Explore: How Are Sides and Angles Related?\n\nIn a triangle, the sides and angles are connected. A bigger angle always sits across from a bigger side, and vice versa. Students explore how to use this relationship to compare the sizes of angles and sides without measuring.\n\n**Inquiry Question:**\nIf you know the side lengths of a triangle, how can you determine which angle is the largest?",
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
                "## Key Terms\n\n- **Triangle Inequality Theorem** — The sum of the lengths of any two sides of a triangle is greater than the length of the third side.\n- **Side-Angle Inequality** — In a triangle, the larger angle is opposite the longer side.\n- **Angle-Side Inequality** — In a triangle, the longer side is opposite the larger angle.",
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
                "## Learn: Comparing Angles and Sides in Triangles\n\n### Key Concept: Side-Angle Relationship\n\nIn any triangle, the longest side is opposite the largest angle, and the shortest side is opposite the smallest angle. This means if one side is longer than another, the angle opposite the longer side is larger.\n\n### Key Concept: Listing Angles and Sides in Order\n\nTo order angles or sides from smallest to largest:\n1. Identify the smallest/largest angle or side using the given information or relationships.\n2. Use the side-angle relationship to determine the corresponding angle/side ordering.",
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
                "## Example 1 — List Angles Satisfying a Condition\n\nGiven a triangle diagram with numbered angles, list all angles that satisfy conditions such as \"measures greater than m∠3\" or \"measures less than m∠1.\"\n### Step 1: Compare Angle Numbers\nUse the diagram to compare the positions and measures of numbered angles.\n### Step 2: Apply the Side-Angle Relationship\nIf a side appears longer or shorter, the angle opposite that side will be correspondingly larger or smaller.\n### Step 3: List All Matching Angles\nCompile all angles from the diagram that satisfy the stated condition.",
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
                "## Example 2 — Order Angles and Sides from Smallest to Largest\n\nGiven a triangle with side lengths or angle measures, list the angles and sides in order from smallest to largest.\n### Step 1: Identify the Smallest and Largest\nFind the smallest angle (opposite the shortest side) and the largest angle (opposite the longest side).\n### Step 2: Write the Ordering\nList the angles in order and separately list the sides in order.",
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
                "## Example 3 — Compare Angles and Sides in Multiple Triangles\n\nGiven multiple triangle diagrams, determine the ordering for each triangle.\n### Step 1: Analyze Each Triangle\nApply the side-angle relationship to each triangle separately.\n### Step 2: Compare Across Triangles\nIf the problem asks for comparisons across triangles, use the given measurements or diagram relationships.",
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
                "## Example 4 — Real-World Angle Comparison\n\nUse the relationship between side lengths and opposite angles to solve real-world problems.\n### Step 1: Model the Situation\nIdentify the three points (e.g., trees on a golf course) and the angles between them.\n### Step 2: Apply the Relationship\nThe largest angle is opposite the longest side. Determine which side is the longest to find the largest angle.",
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
                "## Mixed Exercises\n\nPractice involves:\n- Map problem: determining which two cities are nearest and farthest apart based on angle measures.\n- Listing angles and sides of triangles in order from smallest to largest given diagrams.\n- Analyzing angle bisector intersections and comparing angle measures.\n- Writing a paragraph proof: if WY > YX, then m∠ZWY > m∠YWX.\n- Determining which angle has the greatest measure given a complex diagram.\n- Comparing two angle measures to determine the relationship.\n- Drawing a triangle ABC such that m∠A > m∠B > m∠C using only a ruler.\n- Analyzing whether the base of an isosceles triangle is sometimes, always, or never the longest side.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- Multiple diagrams referenced show triangle angle and side relationships.\n- The worksheet contains 39 practice problems covering angle and side comparisons, proofs, and real-world applications.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-1-lesson-5",
    title: "Indirect Proof",
    description:
      "Students write indirect proofs of algebraic and geometric statements, apply the steps of indirect proof, and use indirect reasoning in real-world contexts.",
    orderIndex: 5,
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
                "## Explore: Proving by Contradiction\n\nSometimes the most direct way to prove something is true is to assume it is false and show that this assumption leads to an impossible situation. This is the idea behind indirect proof.\n\n**Inquiry Question:**\nHow does assuming the opposite of what you want to prove help you reach a conclusion?",
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
                "## Key Terms\n\n- **Indirect Proof** — A proof technique that assumes the opposite of what you want to prove, then shows that this assumption leads to a contradiction.\n- **Contradiction** — A statement that is false because it conflicts with another statement or known fact.",
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
                "## Learn: Writing Indirect Proofs\n\n### Key Concept: Steps for Indirect Proof\n\n1. Identify the statement you want to prove.\n2. Assume the opposite (the negation of the statement).\n3. Use logical reasoning to derive a new statement from your assumption.\n4. Show that this new statement contradicts something you know to be true.\n5. Since the assumption leads to a contradiction, the original statement must be true.\n\n### Key Concept: Common Algebraic Applications\n\nFor statements like \"if x squared plus 8 is less than or equal to 12, then x is less than or equal to 2\":\n1. Assume x > 2.\n2. Show this assumption makes x squared plus 8 > 12.\n3. Conclude x ≤ 2.\n\n### Key Concept: Common Geometric Applications\n\nFor statements about triangles (e.g., \"a triangle can have only one right angle\"):\n1. Assume the triangle has two right angles.\n2. Show this would make the angle sum > 180 degrees.\n3. Conclude the original statement is true.",
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
                "## Example 1 — Indirect Proofs of Algebraic Statements\n\nWrite indirect proofs for statements about inequalities and algebraic relationships.\n### Step 1: State the Original Statement\nIdentify what you are trying to prove.\n### Step 2: Assume the Opposite\nAssume x > 2. This is the negation of x ≤ 2.\n### Step 3: Derive a Contradiction\nUse algebraic manipulation to reach a contradiction.\n### Step 4: Conclude\nSince the assumption leads to a contradiction, the original statement must be true.",
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
                "## Example 2 — Indirect Proofs in Real-World Contexts\n\nUse indirect reasoning to solve problems about purchases, sales, and quantities.\n### Step 1: Interpret the Situation\nUnderstand what you are trying to show.\n### Step 2: Set Up the Negation\nAssume both items cost a certain amount or less.\n### Step 3: Show the Contradiction\nThe problem states a total that exceeds that assumption.",
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
                "## Example 3 — Indirect Proofs with Integer Properties\n\nProve statements about integers using indirect reasoning.\n### Step 1: Identify the Goal\nFor example, prove that if the product xy is odd, then both x and y are odd integers.\n### Step 2: Assume the Opposite\nAssume at least one of x or y is even.\n### Step 3: Derive the Contradiction\nIf x is even, then xy is even.\n### Step 4: Conclude\nBoth x and y must be odd.",
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
                "## Example 4 — Indirect Proofs in Geometry\n\nUse indirect proof to establish geometric properties.\n### Step 1: State What to Prove\nFor example, prove that in an isosceles triangle, neither base angle can be a right angle.\n### Step 2: Assume the Opposite\nAssume one base angle is a right angle.\n### Step 3: Show the Contradiction\nIn an isosceles triangle with a right angle at the base, the other base angle would also be 90 degrees.\n### Step 4: Conclude\nNeither base angle can be a right angle.",
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
                "## Mixed Exercises\n\nPractice involves:\n- Writing indirect proofs for algebraic inequalities.\n- Indirect reasoning about purchases.\n- Proving at least one item costs more than a given amount.\n- Proving that if the product xy is odd, then both x and y are odd.\n- Proving that if x squared is even, then x squared is divisible by 4.\n- Proving that a triangle can have only one right angle.\n- Proving that if angle C is 100 degrees, then angle A is not a right angle.\n- Proving the Side-Angle Inequality Theorem using indirect proof.\n- Proving that the product of a nonzero rational number and an irrational number is irrational.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- Two diagrams referenced show geometric figures for indirect proof examples.\n- The worksheet contains 23 practice problems covering indirect proof techniques in algebraic, geometric, and real-world contexts.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-1-lesson-6",
    title: "The Triangle Inequality",
    description:
      "Students determine whether three given lengths can form a triangle, find the range of possible measures for the third side, and apply the Triangle Inequality Theorem in proofs and real-world contexts.",
    orderIndex: 6,
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
                "## Explore: When Can Three Lengths Make a Triangle?\n\nNot every three lengths can be the sides of a triangle. There is a specific rule that determines whether three lengths can form a triangle. Students explore what happens when this rule is violated.\n\n**Inquiry Question:**\nIf you know two sides of a triangle, what are the possible lengths of the third side?",
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
                "## Key Terms\n\n- **Triangle Inequality Theorem** — The sum of the lengths of any two sides of a triangle must be greater than the length of the third side.\n- **Range of the Third Side** — For two sides a and b, the third side c must satisfy |a - b| < c < a + b.",
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
                "## Learn: Triangle Inequality Theorem\n\n### Key Concept: Testing Three Lengths\n\nTo determine if three lengths a, b, and c can form a triangle, check that all three of these are true:\n- a + b > c\n- b + c > a\n- a + c > b\n\nIf any one of these fails, the three lengths cannot form a triangle.\n\n### Key Concept: Finding the Range of the Third Side\n\nGiven two sides a and b, the third side c must satisfy:\n- c > |a - b| (difference condition)\n- c < a + b (sum condition)\n\nThis means c is greater than the absolute difference of a and b, and less than their sum.",
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
                "## Example 1 — Can These Lengths Form a Triangle?\n\nGiven multiple sets of three lengths, determine which can form a triangle and explain why not for those that cannot.\n### Step 1: Check the Sum Condition\nFor each set, check if the sum of the two smallest lengths is greater than the largest length.\n### Step 2: Apply to All Sets\nSome sets will fail where the sum equals the largest length exactly.\n### Step 3: Explain Why Not\nFor sets that cannot form a triangle, explain that the sum of two sides must be strictly greater than the third side.",
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
                "## Example 2 — Find the Range for the Third Side\n\nGiven two side lengths, find the range of possible values for the third side.\n### Step 1: Apply the Difference Condition\nThe third side must be greater than the difference of the two given sides.\n### Step 2: Apply the Sum Condition\nThe third side must be less than the sum of the two given sides.\n### Step 3: Express the Range\nWrite the range as an inequality.",
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
                "## Example 3 — Real-World Triangle Inequality\n\nApply the Triangle Inequality Theorem to real situations like distances between cities or fencing a plot of land.\n### Step 1: Identify the Two Known Sides\nExtract the two given lengths from the problem context.\n### Step 2: Calculate the Range\nApply the formula for the range of the third side.\n### Step 3: Interpret in Context\nThe third side must be greater than some minimum and less than some maximum.",
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
                "## Example 4 — Proofs Using the Triangle Inequality\n\nWrite two-column proofs that apply the Triangle Inequality Theorem.\n### Step 1: Identify the Given Information\nNote what is provided (parallel lines, midpoints, congruent triangles).\n### Step 2: Plan the Proof Steps\nUse the Triangle Inequality Theorem to establish that a sum of two lengths is greater than a third length.\n### Step 3: Write the Proof\nOrganize into a two-column format with statements and reasons.",
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
                "## Mixed Exercises\n\nPractice involves:\n- Finding the range of possible measures for x given that x, 4, and 6 are triangle side lengths.\n- Finding the range for x given expressions like x - 2, 10, 12 as side lengths.\n- Determining whether given coordinates are the vertices of a triangle.\n- Analyzing how many different triangular borders can be made from four given wood lengths.\n- Writing a two-column proof of Theorem 6.11 (Triangle Inequality Theorem).\n- Finding the probability that an isosceles triangle with whole number sides and perimeter 30 is equilateral.\n- Drawing a triangle in which a 2-inch side is the shortest side and one in which the 2-inch side is the longest side.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- Diagram referenced shows a triangle with parallel lines for proof example.\n- The worksheet contains 26 practice problems covering triangle inequality determination, range finding, proofs, and applications.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-1-lesson-7",
    title: "Inequalities in Two Triangles",
    description:
      "Students apply the Hinge Theorem to compare sides and angles in two triangles, write two-column and paragraph proofs involving triangle inequalities, and use the Hinge Theorem and its converse.",
    orderIndex: 7,
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
                "## Explore: How Does an Angle Affect the Opposite Side?\n\nWhen two triangles have two sides of equal length, the difference in the included angle determines which triangle has the longer third side. This is the idea behind the Hinge Theorem.\n\n**Inquiry Question:**\nWhy is the angle between two sides important in determining the length of the third side?",
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
                "## Key Terms\n\n- **Hinge Theorem** — If two sides of one triangle are congruent to two sides of another triangle, and the included angle of the first is larger, then the third side of the first is longer.\n- **Converse of the Hinge Theorem** — If two sides of one triangle are congruent to two sides of another triangle, and the third side of the first is longer, then the included angle of the first is larger.",
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
                "## Learn: Comparing Two Triangles\n\n### Key Concept: The Hinge Theorem\n\nWhen comparing two triangles:\n- Two pairs of sides are congruent.\n- The included angles are different.\n- The larger included angle produces the longer third side.\n\n### Key Concept: Using the Hinge Theorem\n\nTo apply the Hinge Theorem:\n1. Verify that two pairs of sides are congruent.\n2. Identify which included angle is larger.\n3. Conclude that the third side opposite the larger angle is longer.\n\n### Key Concept: Converse of the Hinge Theorem\n\nIf two pairs of sides are congruent and the third sides differ, the triangle with the longer third side has the larger included angle.",
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
                "## Example 1 — Compare Distances Using the Hinge Theorem\n\nTwo planes take off from the same airstrip and travel different courses. Use the Hinge Theorem to determine which plane is farther from the starting point.\n### Step 1: Identify the Two Sides for Each Triangle\nFor each plane, the two legs of the journey form two sides of a triangle.\n### Step 2: Identify the Included Angle\nThe change in direction forms the included angle between the two legs.\n### Step 3: Apply the Hinge Theorem\nIf one included angle is smaller than the other, the third side is shorter.",
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
                "## Example 2 — Write Proofs Using the Hinge Theorem\n\nWrite two-column proofs that apply the Hinge Theorem or its converse.\n### Step 1: Identify the Two Triangles\nNote which two triangles are being compared and which sides are congruent.\n### Step 2: Compare the Included Angles\nState which angle is larger based on the given information.\n### Step 3: Apply the Hinge Theorem\nConclude that the third side opposite the larger angle is longer.",
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
                "## Example 3 — Find the Range of Values for x\n\nGiven a diagram with an unknown x, use triangle inequality relationships to find the range of possible values.\n### Step 1: Set Up the Inequality\nFor the given diagram, use the relationship between the given sides and the unknown side.\n### Step 2: Solve for x\nIsolate x to find the range of values.\n### Step 3: Express the Range\nWrite the range of possible values for x.",
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
                "## Example 4 — Hinge Theorem in Proofs\n\nWrite two-column or paragraph proofs applying the Hinge Theorem.\n### Step 1: Identify Given Information\nExtract the two pairs of congruent sides and any additional angle information.\n### Step 2: Apply the Hinge Theorem\nUse the theorem to relate the third sides or third angles.\n### Step 3: Write the Proof\nOrganize the logical steps with reasons.",
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
                "## Mixed Exercises\n\nPractice involves:\n- Comparing two segment lengths in a diagram using triangle relationships.\n- Comparing two angle measures using triangle relationships.\n- Writing a two-column proof: if BA ≅ DA and BC > DC, then m∠1 > m∠2.\n- Writing a paragraph proof: if EF ≅ GH and m∠F > m∠G, then EG > FH.\n- Writing a paragraph proof of the Hinge Theorem.\n- Using an indirect proof to prove the Converse of the Hinge Theorem.\n- Determining from a diagram which of three runners is nearest to and farthest from the photographer.\n- Analyzing submarine navigation problems.\n- Comparing and contrasting the Hinge Theorem to the SAS Postulate for triangle congruence.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- Multiple diagrams referenced show triangles for side and angle comparison problems.\n- The worksheet contains 25 practice problems covering Hinge Theorem applications, proofs, and real-world comparisons.",
            },
          },
        ],
      },
    ],
  },
];

export const seedModule1Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule1LessonsResult> => {
    const now = Date.now();
    const results = [];

    for (const lesson of lessonsData) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 1,
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

      results.push({ lessonId, lessonVersionId, phasesCreated, activitiesCreated });
    }

    return { lessons: results };
  },
});
