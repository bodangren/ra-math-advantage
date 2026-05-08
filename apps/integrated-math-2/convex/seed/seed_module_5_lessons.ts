import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule5LessonsResult {
  lessons: Array<{
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    slug: string;
    phasesCreated: number;
    activitiesCreated: number;
  }>;
}

export const seedModule5Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule5LessonsResult> => {
    const now = Date.now();
    const lessonsData = [
      {
        slug: "5-1-circles-circumference",
        title: "Circles and Circumference",
        description:
          "Students identify and name circles, radii, chords, and diameters. They use relationships between radii, diameters, and circumference to find missing measures.",
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
                  markdown: "## Explore: What Makes Circles Unique?\n\nCircles appear throughout the physical world — from bicycle tires to clock faces. Students investigate how the fixed distance from the center to any point on the circle (the radius) connects to the distance around the circle (the circumference).\n\n**Inquiry Question:**\nIf you double the diameter of a circle, what happens to its circumference?",
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
                  markdown: "## Vocabulary\n\n- **Circle** — The set of all points in a plane that are the same distance from a given point called the center.\n- **Radius** — A segment from the center of a circle to any point on the circle; also the length of that segment.\n- **Chord** — A segment whose endpoints are on a circle.\n- **Diameter** — A chord that passes through the center of a circle; also the length of that segment.\n- **Congruent Circles** — Circles that have the same radius.\n- **Concentric Circles** — Circles that share the same center but have different radii.\n- **Circumference** — The distance around a circle.",
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
                  markdown: "## Learn: Circles and Circumference\n\n### Key Concept: Parts of a Circle\n\nA circle is named by its center. For example, ⊙*A* is a circle with center *A*. Key segments related to a circle include:\n\n- A **radius** is a segment from the center to any point on the circle. All radii of a circle are congruent.\n- A **diameter** is a chord that passes through the center. The diameter is twice the radius: $d = 2r$.\n- A **chord** is a segment whose endpoints are both on the circle.\n\n### Key Concept: Circumference\n\nThe circumference $C$ of a circle is related to its diameter $d$ and radius $r$ by the ratio π. The formulas are:\n\n$C = \\pi d$\n$C = 2\\pi r$\n\n### Key Concept: Relationships Among Radius, Diameter, and Circumference\n\nIf the radius or diameter of a circle is known, the other measures can be found:\n\n$r = d \\div 2$\n$d = 2r$\n$C = \\pi d = 2\\pi r$\n\nConversely, if the circumference is known, the radius and diameter can be found:\n\n$d = C \\div \\pi$\n$r = C \\div (2\\pi)$",
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
                  markdown: "## Example 1 — Identify Parts of Circles\n\nUse the figures to identify circles, radii, chords, and diameters. Understand the naming conventions for these elements.\n\n### Step 1: Identify the Circle and Its Center\n\nA circle is named using the symbol ⊙ followed by the center point. For example, ⊙*R* is a circle with center *R*. A radius is any segment from the center to a point on the circle, such as $\\overline{AR}$. A diameter is a chord that passes through the center, such as $\\overline{AB}$ if *A* and *B* are on the circle and the segment passes through *R*.\n\nIn the figure for Exercises 9–11, if $\\overline{AB} = 18$ millimeters, then $\\overline{AR} = 9$ millimeters because the diameter is twice the radius. Similarly, if $\\overline{RY} = 10$ inches, then $\\overline{AR} = 10$ inches and $\\overline{AB} = 20$ inches.\n\n### Step 2: Identify Chords\n\nA chord is any segment whose endpoints lie on the circle. A diameter is a special type of chord. In the circle, chords do not necessarily pass through the center unless they are diameters.\n\nIn the circle ⊙*R*, determine whether $\\overline{AB} \\cong \\overline{XY}$ by noting that congruent circles have congruent radii, and if the circles are congruent, corresponding chords are congruent.",
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
                  markdown: "## Example 2 — Find Radius, Diameter, and Circumference\n\nUse the given measures to find missing radius, diameter, and circumference values.\n\n### Step 1: Given a Diameter, Find Radius and Circumference\n\nIf the diameter of a bicycle tire is 26 inches, then the radius is $r = 13$ inches. The circumference is found using $C = 2\\pi r = 2\\pi(13) = 26\\pi$ inches.\n\nIf the diameter of a sundial is 9.5 inches, the radius is $r = 4.75$ inches and the circumference is $C = 2\\pi(4.75) = 9.5\\pi \\approx 29.85$ inches to the nearest hundredth. Assumptions include treating the sundial as a perfect circle and using π ≈ 3.14.\n\n### Step 2: Given Circumference, Find Radius and Diameter\n\nIf $C = 40$ inches, then $d = 40 \\div \\pi \\approx 12.73$ inches and $r = d \\div 2 \\approx 6.37$ inches.\n\nIf $C = 256$ feet, then $d = 256 \\div \\pi \\approx 81.49$ feet and $r = d \\div 2 \\approx 40.75$ feet.\n\nIf $C = 15.62$ meters, then $d = 15.62 \\div \\pi \\approx 4.97$ meters and $r = d \\div 2 \\approx 2.49$ meters.\n\nIf $C = 79.5$ yards, then $d = 79.5 \\div \\pi \\approx 25.31$ yards and $r = d \\div 2 \\approx 12.66$ yards.\n\nIf $C = 204.16$ meters, then $d = 204.16 \\div \\pi \\approx 64.99$ meters and $r = d \\div 2 \\approx 32.50$ meters.\n\n### Step 3: Algebraic Circumference\n\nIf $C = 35x$ cm, then $d = 35x \\div \\pi$ and $r = 35x \\div (2\\pi)$.\n\nIf $r = x/8$, then $d = x/4$ and $C = 2\\pi(x/4) = (\\pi x)/2$.",
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
                  markdown: "## Mixed Exercises\n\nPractice with all skills from the lesson, including:\n\n- Naming circles, radii, chords, and diameters from diagrams.\n- Finding radius, diameter, and circumference given any one of these measures, including fractional and algebraic values.\n- Determining whether circles are congruent, concentric, or neither from diagrams.\n- Finding exact circumference in terms of π given diagrams with labeled radii.\n- Writing paragraph proofs (e.g., proof of Theorem 10.1 that all circles are similar).\n- Researching real-world circular objects (e.g., clock faces) and computing their circumference.\n- Finding spoke length on a wheel given diameter.\n- Determining whether a cut through a circle is a radius, diameter, or chord.\n- Reasoning about three identical coins lined up in a row.\n- Designing exercise hoops with a given length of material.\n- Analyzing the ratio of circle circumferences.\n- Determining whether a point inside a circle is sometimes, always, or never closer than the radius to the center.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "5-2-measuring-angles-arcs",
        title: "Measuring Angles and Arcs",
        description:
          "Students find central angle measures and arc measures in degrees, classify arcs as major arcs, minor arcs, or semicircles, and convert between degree and radian measure.",
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
                  markdown: "## Explore: How Are Arcs and Angles Related?\n\nWhen a central angle cuts a circle, it creates an arc. Students explore how the measure of the central angle directly determines the measure of the intercepted arc, and how this relationship extends to arc length.\n\n**Inquiry Question:**\nIf a central angle measures 72°, what type of arc does it intercept? How many such arcs would fill the entire circle?",
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
                  markdown: "## Vocabulary\n\n- **Central Angle** — An angle whose vertex is at the center of a circle and whose sides are radii.\n- **Minor Arc** — An arc smaller than a semicircle, named by its endpoints.\n- **Major Arc** — An arc larger than a semicircle, named by three points (the endpoints and a point in between).\n- **Semicircle** — An arc that is exactly half of a circle, named by three points (the endpoints and a point on the arc).\n- **Arc Measure** — The measure in degrees of an arc, equal to the measure of its central angle.\n- **Arc Length** — The linear distance along an arc, found using $s = r\\theta$ where θ is in radians.",
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
                  markdown: "## Learn: Measuring Angles and Arcs\n\n### Key Concept: Arc Measures\n\n- A **minor arc** has measure less than 180°.\n- A **semicircle** has measure exactly 180°.\n- A **major arc** has measure greater than 180°.\n\nThe sum of the measures of all arcs in a circle is 360°.\n\n### Key Concept: Arc Length\n\nArc length is a fraction of the circumference. If the radius is $r$ and the central angle measures $θ$ degrees, the arc length is:\n\n$s = (\\theta/360) \\times 2\\pi r$\n\nIn radians: $s = r\\theta$.\n\n### Key Concept: Degree–Radian Conversion\n\n$180° = \\pi$ radians\n\nTo convert degrees to radians: multiply by $\\pi/180$.\nTo convert radians to degrees: multiply by $180/\\pi$.",
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
                  markdown: "## Example 1 — Find Angle Measures in Circles\n\nFind the value of $x$ using geometric relationships in circle diagrams.\n\n### Step 1: Apply Angle Relationships\n\nUse the fact that angles around a point sum to 360°, vertical angles are congruent, and linear pairs sum to 180°.",
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
                  markdown: "## Example 2 — Classify Arcs and Find Arc Measures\n\nIn ⊙*R*, $\\overline{AC}$ and $\\overline{EB}$ are diameters. Identify each arc as major, minor, or semicircle, then find its measure.\n\n### Step 1: Identify Arc Type and Apply 360°\n\nFor arc $\\overset{\\frown}{EA}$: since *E* and *A* are endpoints and the arc does not pass through the opposite side of the circle, $m\\overset{\\frown}{EA} = 60°$ or similar, making it a minor arc.\n\nFor arc $\\overset{\\frown}{DEB}$: this arc passes through *D* and *E* to *B*, spanning more than 180°, making it a major arc. Its measure is $360° - m\\overset{\\frown}{ED} - m\\overset{\\frown}{DC} - m\\overset{\\frown}{CB} - m\\overset{\\frown}{BA}$ or similar decomposition.\n\nFor arc $\\overset{\\frown}{AB}$: if $\\overline{AB}$ is a diameter, then $m\\overset{\\frown}{AB} = 180°$, making it a semicircle.\n\nFor arc $\\overset{\\frown}{CDA}$: this arc goes from *C* through *D* to *A*, passing through the opposite side of the circle. $m\\overset{\\frown}{CDA} = 180°$, making it a semicircle.\n\n### Step 2: Find Specific Arc Measures\n\nIf $m\\angle HCG = 2x°$ and $m\\angle HCD = (6x + 28)°$, and $\\overline{HE}$ and $\\overline{GD}$ are diameters, then find the arc measures using the relationship between inscribed angles and arcs.",
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
                  markdown: "## Mixed Exercises\n\nPractice with all skills from the lesson, including:\n\n- Finding angle measures using circle geometry relationships.\n- Classifying arcs as major, minor, or semicircles and finding their measures.\n- Converting between degrees and radians (120°, 45°, 30°, 90°, 180°, 225°, etc.).\n- Finding arc length given radius or diameter (r = 5 in, d = 3 yd, JD = 7 cm, NL = 12 ft, etc.).\n- Real-world arc problems (clock divisions, ribbons around cylinders, pie slices).\n- Finding how far a bike wheel travels given rotations or distance traveled.\n- Constructing circle graphs and analyzing arc types.\n- Writing two-column proofs of Theorem 10.2.\n- Finding circumference and arc measures in given circle diagrams.\n- Analyzing adjacent arcs and central angle relationships.\n- Determining whether statements about arcs are always, sometimes, or never true.\n- Finding the angle formed by clock hands at a given time.\n- Working with arcs in the ratio 5:3:4.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "5-3-arcs-chords",
        title: "Arcs and Chords",
        description:
          "Students use relationships among arcs, chords, and central angles. They apply Theorems 10.5 and 10.6 about chords equidistant from the center, and find chord lengths using perpendicular bisectors.",
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
                  markdown: "## Explore: What Determines a Chord's Length?\n\nWhen a chord is drawn in a circle, its length is related to its distance from the center. Students investigate how the perpendicular from the center to a chord bisects the chord, and how chords that are equidistant from the center are congruent.\n\n**Inquiry Question:**\nIf two chords in the same circle have the same length, what can you say about their distances from the center?",
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
                  markdown: "## Vocabulary\n\n- **Chord** — A segment whose endpoints are on a circle.\n- **Minor Arc** — An arc smaller than a semicircle.\n- **Major Arc** — An arc larger than a semicircle.\n- **Semicircle** — An arc that is exactly half of a circle.\n- **Perpendicular Bisector** — A line or segment that is perpendicular to a chord and bisects it.",
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
                  markdown: "## Learn: Arcs and Chords\n\n### Key Concept: Chord–Arc Relationships\n\nWithin the same circle or congruent circles:\n\n- Congruent arcs have congruent chords.\n- Congruent chords have congruent arcs.\n\n### Key Concept: Perpendicular Bisector Theorem\n\nThe perpendicular from the center of a circle to a chord bisects the chord. Conversely, the perpendicular bisector of a chord passes through the center.\n\n### Key Concept: Distance from Center to Chord\n\nIf two chords are equidistant from the center, they are congruent. This is the converse of the perpendicular bisector relationship.",
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
                  markdown: "## Example 1 — Find Missing Values Using Chord Relationships\n\nGiven congruent circles or chord relationships, find the value of $x$.\n\n### Step 1: Apply Theorems About Chords and Arcs\n\nIf $PQ = 13$ and $RS = 24$ in ⊙*P*, find $RT$, $PT$, and $TQ$. Use the fact that perpendicular radii bisect chords.\n\nIf in ⊙*A*, $EB = 12$, $CD = 8$, and $m\\overset{\\frown}{CD} = 90°$, find $m\\overset{\\frown}{DE}$, $FD$, and $AF$. Round to the nearest hundredth if necessary.\n\n### Step 2: Solve for Unknowns\n\nIf $TS = 21$ and $UV = 3x$ in ⊙*R*, find $x$: $3x = 21$, so $x = 7$.\n\nIf $CD \\cong CB$ in ⊙*Q*, with $GQ = x + 5$ and $EQ = 3x - 6$, find $x$. Since $CD \\cong CB$, the distances from the center to these chords are equal, so $GQ = EQ$. Solve: $x + 5 = 3x - 6$, giving $2x = 11$, so $x = 5.5$.",
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
                  markdown: "## Example 2 — Use the Perpendicular Bisector to Find Chord Length\n\nUse the distance from the center to a chord to find the chord's length.\n\n### Step 1: Apply the Distance–Chord Relationship\n\nA chord located 0.7 cm from the center of a circle with radius 2.5 cm: the chord's half-length is found using the Pythagorean theorem: $\\sqrt{2.5^2 - 0.7^2} = \\sqrt{6.25 - 0.49} = \\sqrt{5.76} = 2.4$ cm. The full chord length is $2 \\times 2.4 = 4.8$ cm to the nearest tenth.",
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
                  markdown: "## Mixed Exercises\n\nPractice with all skills from the lesson, including:\n\n- Finding the value of $x$ in circle diagrams with chord relationships (Exercises 1–9).\n- Finding chord lengths, arc measures, and segment lengths using circle geometry (Exercises 10–18).\n- Using constructions with chords and perpendicular bisectors to reconstruct a broken plate.\n- Analyzing a circular garden with arcs and chords to find equal straight paths.\n- Writing two-column proofs of Theorem 10.6 (converses about chords equidistant from center).\n- Explaining how to determine whether a segment is a diameter or a shorter chord.\n- Analyzing quilt patterns with inscribed chords and explaining why the result may not be a rectangle.\n- Constructing a circle, drawing a chord, and finding the radius from the chord length and its distance from the center.\n- Determining whether $HX = GX$ is sometimes, always, or never true when a diameter and chord intersect.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "5-4-inscribed-angles",
        title: "Inscribed Angles",
        description:
          "Students find the measure of inscribed angles and their intercepted arcs, prove theorems about inscribed angles, and apply properties of angles inscribed in semicircles.",
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
                  markdown: "## Explore: How Do Inscribed Angles Compare to Central Angles?\n\nAn inscribed angle is formed by two chords meeting at a point on the circle, while a central angle has its vertex at the center. Students explore why an inscribed angle measures half of its intercepted arc.\n\n**Inquiry Question:**\nIf two inscribed angles intercept the same arc, how are they related?",
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
                  markdown: "## Vocabulary\n\n- **Inscribed Angle** — An angle whose vertex is on the circle and whose sides contain chords of the circle.\n- **Intercepted Arc** — The arc that lies in the interior of an inscribed angle, with endpoints on the angle.\n- **Inscribed Polygon** — A polygon whose vertices all lie on a circle.",
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
                  markdown: "## Learn: Inscribed Angles\n\n### Key Concept: Inscribed Angle Theorem\n\nThe measure of an inscribed angle is half the measure of its intercepted arc:\n\n$m\\angle ABC = (1/2)m\\overset{\\frown}{AC}$\n\nThis is true whether the angle is acute, right, or obtuse.\n\n### Key Concept: Angles Inscribed in a Semicircle\n\nAn angle inscribed in a semicircle is a right angle. This is a direct consequence of the Inscribed Angle Theorem, since a semicircle measures 180°, and half of 180° is 90°.\n\n### Key Concept: Cyclic Quadrilaterals\n\nOpposite angles of an inscribed quadrilateral are supplementary. If a quadrilateral is inscribed in a circle, then:\n\n$m\\angle D + m\\angle F = 180°$\n$m\\angle E + m\\angle G = 180°$",
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
                  markdown: "## Example 1 — Find Measures of Inscribed Angles\n\nFind $m\\overset{\\frown}{AC}$, $m\\angle N$, $m\\angle QSR$, $m\\angle XY$, $m\\angle E$, and $m\\angle R$ from circle diagrams.\n\n### Step 1: Apply the Inscribed Angle Theorem\n\nUse the relationship $m\\angle = (1/2)m$(intercepted arc). Identify the intercepted arc for each inscribed angle.",
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
                  markdown: "## Example 2 — Find Angle Measures in Overlapping Triangles\n\nUse properties of inscribed angles to find $m\\angle N$, $m\\angle L$, $m\\angle C$, and $m\\angle A$ from circle diagrams.\n\n### Step 1: Identify the Intercepted Arc for Each Angle\n\nFor each inscribed angle, find the arc it intercepts, then apply the inscribed angle theorem.",
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
                  markdown: "## Example 3 — Prove Inscribed Angle Theorems\n\nWrite paragraph and two-column proofs involving inscribed angles.\n\n### Step 1: Paragraph Proof\n\n**Given:** $m\\angle T = (1/2)m\\angle S$\n**Prove:** $m\\angle TUR = 2m\\angle URS$\n\nUse the relationship between central and inscribed angles, or the relationship between an inscribed angle and its intercepted arc.\n\n### Step 2: Two-Column Proof\n\n**Given:** ⊙*C*\n**Prove:** $\\triangle KML \\sim \\triangle JMH$\n\nUse inscribed angle properties to establish angle congruence, then conclude similarity.",
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
                  markdown: "## Mixed Exercises\n\nPractice with all skills from the lesson, including:\n\n- Finding arc measures and inscribed angle measures from circle diagrams (Exercises 26–31).\n- Writing two-column proofs for Theorem 10.8 (if two inscribed angles intercept the same arc, they are congruent).\n- Writing paragraph proofs for Theorem 10.10 (opposite angles of an inscribed quadrilateral are supplementary).\n- Proving both directions of Theorem 10.9 (angle inscribed in a semicircle is a right angle and converse).\n- Proving that if $PQRS$ is an inscribed quadrilateral and $\\angle Q \\cong \\angle S$, then $PR$ is a diameter.\n- Finding angle measures in a triangular garden inscribed in a circle, then using trigonometry to find the radius.\n- Finding $m\\angle 1$ for five lights equally spaced around a circular arena.\n- Finding $m\\angle ADC$ given $m\\angle ADC$ and writing a formula relating inscribed angle measure to intercepted arc measure.\n- Finding $m\\angle SRU$ and the value of $x$ in a kite inscribed in a circle.\n- Analyzing whether squares, rectangles, parallelograms, rhombuses, and kites can always be inscribed in a circle.\n- Finding the ratio of the area of a circle to the area of an inscribed square.\n- Explaining how to find leg lengths of a 45°-45°-90° triangle inscribed in a circle given the radius.\n- Comparing and contrasting inscribed angles and central angles.\n- Determining whether statements about arcs and inscribed angles are always, sometimes, or never true.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "5-5-tangents",
        title: "Tangents",
        description:
          "Students identify common tangents to pairs of circles, determine whether a segment is tangent to a circle, find angle measures involving tangents, and find perimeters of circumscribed polygons.",
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
                  markdown: "## Explore: How Does a Tangent Touch a Circle?\n\nA tangent line grazes a circle at exactly one point — the point of tangency. Students explore how the radius drawn to the point of tangency is perpendicular to the tangent line, and how tangents from a common external point are congruent.\n\n**Inquiry Question:**\nIf two tangents are drawn from the same external point to a circle, what do you know about their lengths?",
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
                  markdown: "## Vocabulary\n\n- **Tangent** — A line that touches a circle at exactly one point without crossing it.\n- **Common Tangent** — A line that is tangent to two circles.\n- **Point of Tangency** — The single point where a tangent touches a circle.\n- **Circumscribed Polygon** — A polygon whose sides are all tangent to a circle.",
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
                  markdown: "## Learn: Tangents\n\n### Key Concept: Tangent–Radius Relationship\n\nA radius drawn to the point of tangency is perpendicular to the tangent line. The converse is also true: a line perpendicular to a radius at its outer endpoint is tangent to the circle.\n\n### Key Concept: Tangents from an External Point\n\nIf two tangent segments are drawn from the same external point to a circle, they are congruent.\n\n### Key Concept: Common Tangents\n\n- Two circles can have 0, 1, or 2 common tangents.\n- External tangents do not cross the segment connecting the two centers.\n- Internal tangents cross the segment connecting the two centers.",
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
                  markdown: "## Example 1 — Identify Common Tangents\n\nIdentify the number of common tangents between pairs of circles.\n\n### Step 1: Analyze the Position of Two Circles\n\nIf the circles are separate and do not overlap, there are typically 2 common tangents (one external, one internal).\nIf one circle is inside the other without touching, there are 0 common tangents.\nIf the circles touch externally at one point, there is 1 common tangent.\nIf the circles intersect at two points, there are 2 common tangents.",
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
                  markdown: "## Example 2 — Determine Whether a Segment Is Tangent\n\nCheck whether $\\overline{HI}$, $\\overline{AB}$, $\\overline{MP}$, or $\\overline{QR}$ is tangent to the given circle. Justify your answer.\n\n### Step 1: Apply the Converse of the Tangent–Radius Theorem\n\nIf a segment from a point outside the circle to a point on the circle is perpendicular to the radius drawn to that point, then the segment is tangent. Use the Pythagorean theorem to check perpendicularity.\n\nFor $\\overline{HI}$: check whether $HI^2 = GI^2 + GH^2$ or similar relationship holds.",
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
                  markdown: "## Example 3 — Find Values Involving Tangents\n\nFind the value of $x$ in tangent–secant configurations.\n\n### Step 1: Use the Tangent–Chord Angle Theorem\n\nAn angle formed by a tangent and a chord through the point of tangency equals half the intercepted arc. If $m\\angle BDC = 12x°$ and $m\\angle A = (4x + 4)°$, find $m\\angle A$. The angle formed by the tangent and chord equals half the measure of the intercepted arc. Set up an equation using this relationship.\n\n### Step 2: Solve for $x$\n\n$m\\angle A = 4x + 4$ and $m\\angle BDC = 12x$. Since the angle formed by the tangent and chord relates to the intercepted arc, and the intercepted arc relates to the other angle, solve: $12x = 2(4x + 4)$ gives $12x = 8x + 8$, so $4x = 8$ and $x = 2$. Then $m\\angle A = 4(2) + 4 = 12°$.",
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
                  markdown: "## Example 4 — Find Perimeter of Circumscribed Polygons\n\nEach polygon is circumscribed about a circle. Find the perimeter.\n\n### Step 1: Recognize That Opposite Sides Have Common External Tangents\n\nFor a polygon circumscribed about a circle, the sum of the lengths of opposite sides are equal. Add all side lengths to find the perimeter.",
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
                  markdown: "## Mixed Exercises\n\nPractice with all skills from the lesson, including:\n\n- Identifying common tangents between various pairs of circles.\n- Determining whether segments are tangent to circles (justify using the tangent–radius relationship).\n- Finding values of $x$ in tangent diagrams with various geometric configurations.\n- Solving real-world tangent problems (hanging a terrarium, carnival game basket positions).\n- Finding perimeter of circumscribed polygons given side lengths.\n- Finding the value of $x$ in circumscribed polygons and computing their perimeters.\n- Analyzing a clock face inscribed in a triangular base.\n- Writing two-column proofs for Theorem 10.12 (tangents from a common external point are congruent), Theorem 10.13 (an angle formed by two tangents equals 180° minus the minor arc), and circumscribed quadrilateral property.\n- Finding side lengths and perimeter of a triangle circumscribed about a circular gem.\n- Using precision to find $x$ to the nearest hundredth in tangent diagrams.\n- Finding the radius of the large circle in an equilateral triangle with inscribed circles.\n- Determining which spoke of a rolling wheel is perpendicular to an incline.\n- Constructing a tangent line through a point on a circle.\n- Finding distance to the horizon from a spacecraft at a given altitude.\n- Finding the length of a common external tangent segment between two circles.\n- Identifying which polygon is not circumscribed.\n- Analyzing how three tangent segments can be congruent even if circles have different radii.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "5-6-tangents-secants-angle-measures",
        title: "Tangent, Secant, and Angle Measures",
        description:
          "Students find angle measures formed by chords, tangents, and secants. They apply theorems for angles formed inside, on, and outside circles and use angle measure relationships to find arc measures.",
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
                  markdown: "## Explore: Where Does the Angle's Vertex Live?\n\nThe measure of an angle formed by intersecting lines and circles depends on where the vertex is located. Students discover different formulas for angles inside a circle (vertex in the interior), on the circle (vertex on the circle), and outside the circle (vertex in the exterior).\n\n**Inquiry Question:**\nIf a tangent and a secant intersect outside a circle, how is the angle formed related to the arcs they intercept?",
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
                  markdown: "## Vocabulary\n\n- **Secant** — A line that intersects a circle at two points.\n- **Interior Angle (Circle)** — An angle formed by two chords whose vertex is inside the circle.\n- **Exterior Angle (Circle)** — An angle formed by a tangent and a secant, two secants, or two tangents whose vertex is outside the circle.",
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
                  markdown: "## Learn: Tangents, Secants, and Angle Measures\n\n### Key Concept: Angles Inside a Circle\n\nWhen two chords intersect inside a circle, the measure of each angle is half the sum of the measures of the arcs intercepted by the angle and its vertical angle:\n\n$m\\angle = (1/2)(m$ intercepted arc $+ m$ opposite arc)\n\n### Key Concept: Angles On the Circle (Inscribed Angle)\n\nAn angle formed by two chords with its vertex on the circle has measure half the measure of its intercepted arc:\n\n$m\\angle = (1/2)m$ intercepted arc\n\n### Key Concept: Angles Outside a Circle\n\nWhen a tangent and a secant, two secants, or a tangent and a chord intersect outside a circle, the angle measure is half the difference of the intercepted arcs:\n\n$m\\angle = (1/2)(m$ major arc $- m$ minor arc)\n\nFor a tangent and secant: $m\\angle = (1/2)(m$ larger intercepted arc $- m$ smaller intercepted arc).",
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
                  markdown: "## Example 1 — Find Angle Measures from Diagrams\n\nFind $m\\angle 2$, $m\\angle 1$, $m\\overset{\\frown}{GH}$, $m\\angle 5$, $m\\angle 1$, and $m\\angle 2$ from circle diagrams.\n\n### Step 1: Identify the Type of Angle\n\nDetermine whether each angle is an interior angle, an inscribed angle, or an exterior angle based on the location of its vertex. Apply the appropriate formula.",
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
                  markdown: "## Example 2 — Find Measures with Tangents and Secants\n\nFind $m\\angle 1$, $m\\angle 3$, $m\\overset{\\frown}{RT}$, $m\\angle 6$, $m\\angle 3$, and $m\\angle 4$ in tangent–secant configurations. Assume segments that appear tangent are tangent.\n\n### Step 1: Apply the Exterior Angle Theorem\n\nFor an angle formed by a tangent and a secant intersecting outside the circle, $m\\angle = (1/2)(m$ major arc $- m$ minor arc). Identify the intercepted arcs for each angle.",
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
                  markdown: "## Example 3 — Find Angle Measures and Arc Measures\n\nFind $m\\angle R$, $m\\angle U$, and $m\\overset{\\frown}{DPA}$ in tangent–secant configurations.\n\n### Step 1: Set Up Equations Using Arc Differences\n\nIf $m\\angle R = (1/2)(m$ major arc $- m$ minor arc), set up the equation using the given arc measures and solve for the unknown.\n\nFor $m\\angle R$, the intercepted arcs come from the secant and tangent lines. The angle exterior to the circle equals half the difference between the far arc and the near arc.",
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
                  markdown: "## Mixed Exercises\n\nPractice with all skills from the lesson, including:\n\n- Finding angle measures and arc measures from circle diagrams.\n- Analyzing a plane at altitude 5 miles finding the visible portion of a longitude line.\n- Finding $m\\overset{\\frown}{AB}$ given an apex angle of 30° and $m\\overset{\\frown}{BC} = 22°$ in a circular canvas on an A-frame easel.\n- Writing paragraph proofs for both parts of Theorem 10.15 (tangent–secant angle theorem).\n- Finding the value of $x$ in various tangent–secant configurations.\n- Analyzing an isosceles triangle inscribed in a circle to find arc measures.\n- Explaining how to find the measure of an angle formed by a secant and a tangent intersecting outside a circle.\n- Drawing a circle with two tangents intersecting outside, measuring the angle, and finding the minor and major arc measures.\n- Finding $m\\angle A$ when given concentric circles and angle relationships.\n- Describing how to find measures of three minor arcs formed by the points of tangency of an inscribed circle in a triangle with angles 50° and 60°.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "5-7-equations-of-circles",
        title: "Equations of Circles",
        description:
          "Students write equations of circles in standard form given center and radius, center and diameter, or center and a point on the circle. They identify center and radius from equations and find intersections with lines.",
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
                  markdown: "## Explore: Where Do Points Lie?\n\nA circle is the set of all points equidistant from a center. Students explore how this geometric definition translates into an algebraic equation.\n\n**Inquiry Question:**\nIf the center of a circle is at (3, -2) and a point on the circle is at (7, -2), what is the radius? How would you write the equation?",
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
                  markdown: "## Vocabulary\n\n- **Standard Form (Circle)** — $(x - h)^2 + (y - k)^2 = r^2$, where $(h, k)$ is the center and $r$ is the radius.\n- **General Form** — $x^2 + y^2 + Dx + Ey + F = 0$",
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
                  markdown: "## Learn: Equations of Circles\n\n### Key Concept: Standard Form of a Circle\n\nThe standard form of a circle with center $(h, k)$ and radius $r$ is:\n\n$(x - h)^2 + (y - k)^2 = r^2$\n\nIf the center is at the origin (0, 0), the equation simplifies to:\n\n$x^2 + y^2 = r^2$\n\n### Key Concept: Writing Equations of Circles\n\n**Given center and radius:** Use the standard form directly.\n\n**Given center and diameter:** Find the radius as half the diameter, then use the standard form.\n\n**Given center and a point on the circle:** Find the radius by computing the distance from the center to the point, then use the standard form.\n\nDistance formula: $r = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$\n\n### Key Concept: Converting to Standard Form\n\nTo convert $x^2 + y^2 + Dx + Ey + F = 0$ to standard form, complete the square for both $x$ and $y$:\n\n$x^2 + Dx \\rightarrow (x + D/2)^2$\n$y^2 + Ey \\rightarrow (y + E/2)^2$\n\nThe center is $(-D/2, -E/2)$ and the radius is $r = \\sqrt{(D/2)^2 + (E/2)^2 - F}$.\n\n### Key Concept: Intersections of Circles and Lines\n\nTo find where a circle and a line intersect, substitute the linear equation into the circle equation and solve the resulting quadratic.",
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
                  markdown: "## Example 1 — Write Equations of Circles\n\nWrite the equation of each circle described.\n\n### Step 1: Identify Known Information\n\nFor center at (0, 0) with radius 8: $(x - 0)^2 + (y - 0)^2 = 64$, or $x^2 + y^2 = 64$.\n\nFor center at (-2, 6) with diameter 8: radius is 4. $(x + 2)^2 + (y - 6)^2 = 16$.\n\nFor a circle centered at (3, -4) passing through (-1, -4): the radius is the distance $\\sqrt{(3 - (-1))^2 + (-4 - (-4))^2)} = \\sqrt{16 + 0} = 4$. $(x - 3)^2 + (y + 4)^2 = 16$.\n\n### Step 2: Write the Standard Form\n\nFor center (0, 3) passing through (2, 0): radius = $\\sqrt{(0-2)^2 + (3-0)^2} = \\sqrt{4 + 9} = \\sqrt{13}$. $x^2 + (y - 3)^2 = 13$.",
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
                  markdown: "## Example 2 — Identify Center and Radius from an Equation\n\nState the coordinates of the center and the radius. Then graph.\n\n### Step 1: Complete the Square or Use Standard Form\n\nFor $x^2 + y^2 = 16$: center is (0, 0), radius is $r = 4$.\n\nFor $(x - 1)^2 + (y - 4)^2 = 9$: center is (1, 4), radius is $r = 3$.\n\nFor $x^2 + y^2 - 4 = 0$: rewrite as $x^2 + y^2 = 4$, center is (0, 0), radius is $r = 2$.\n\nFor $x^2 + y^2 + 6x - 6y + 9 = 0$: complete the square: $(x^2 + 6x) + (y^2 - 6y) = -9$. $(x + 3)^2 + (y - 3)^2 = -9 + 9 + 9 = 9$. Center is (-3, 3), radius is $r = 3$.",
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
                  markdown: "## Example 3 — Circle Equations in Real-World Contexts\n\n### Step 1: Define the Circle from the Context\n\nFor the dog leash problem: $\\overline{RS}$ is a diameter of ⊙*Q*. With endpoints R(-4, 1) and S(8, 7), the center is the midpoint: $Q = ((-4+8)/2, (1+7)/2) = (2, 4)$. The radius is half the distance between R and S: $r = (1/2)\\sqrt{(8-(-4))^2 + (7-1)^2} = (1/2)\\sqrt{144 + 36} = (1/2)\\sqrt{180} = 3\\sqrt{5}$. The equation is $(x - 2)^2 + (y - 4)^2 = 45$.\n\nFor the pizza delivery problem: points A(-2, 2), B(2, -2), and C(6, 2) lie on ⊙*P*, with $\\overline{AC}$ as a diameter. The center is the midpoint of A and C: $P = ((-2+6)/2, (2+2)/2) = (2, 2)$. The radius is half the distance between A and C: $r = (1/2)\\sqrt{(6-(-2))^2 + (2-2)^2} = (1/2)(8) = 4$. The equation is $(x - 2)^2 + (y - 2)^2 = 16$.",
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
                  markdown: "## Mixed Exercises\n\nPractice with all skills from the lesson, including:\n\n- Writing equations of circles given center and radius or diameter endpoints.\n- Writing equations of circles given center and a point on the circle.\n- Identifying centers and radii from circle equations (including equations that require completing the square).\n- Graphing circles from their equations.\n- Finding points of intersection between circles and lines (substitute and solve).\n- Writing equations for circles given real-world constraints (delivery areas, roaming boundaries).\n- Analyzing whether $x^2 + y^2 + 4x - 10y = k$ is always a circle for any value of $k$.\n- Sketching wallpaper patterns modeled by $(x - a)^2 + (y - b)^2 = 4$ for even integer values of $b$.\n- Finding the equation of an inscribed circle in a square.\n- Finding the radius of a park given $(x - 3)^2 + (y - 7)^2 = 225$ where each unit represents 10 feet.\n- Finding the radius of a fire station's response area given $(x - 8)^2 + (y + 2)^2 = 324$.\n- Analyzing whether a circle intersects a given line based on its equation.\n- Explaining how the equation of a circle changes when translated.\n- Constructing a circle that circumscribes a triangle given three noncollinear points.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "5-8-equations-of-parabolas",
        title: "Equations of Parabolas",
        description:
          "Students write equations of parabolas given the focus and directrix, identify focus and directrix from equations, find intersections with lines, and apply parabolic equations to real-world contexts.",
        orderIndex: 8,
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
                  markdown: "## Explore: What Defines a Parabola?\n\nA parabola is defined by the condition that every point on it is equidistant from a fixed point (the focus) and a fixed line (the directrix). Students explore how this geometric definition leads to an algebraic equation.\n\n**Inquiry Question:**\nIf the focus is at (0, 3) and the directrix is $y = -3$, what point on the parabola is closest to the directrix?",
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
                  markdown: "## Vocabulary\n\n- **Parabola** — The set of all points equidistant from a focus and a directrix.\n- **Focus** — A fixed point used to define a parabola; the distance from any point on the parabola to the focus equals the distance from that point to the directrix.\n- **Directrix** — A fixed line used to define a parabola.\n- **Vertex** — The point on the parabola that is halfway between the focus and directrix.",
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
                  markdown: "## Learn: Equations of Parabolas\n\n### Key Concept: Standard Form of a Parabola with Vertical Axis\n\nFor a parabola with vertex at the origin and focus at (0, p):\n\n- If the focus is at (0, p) and directrix is $y = -p$, the equation is $x^2 = 4py$.\n- If the focus is at (0, -p) and directrix is $y = p$, the equation is $x^2 = -4py$.\n\nFor a parabola with vertex at $(h, k)$:\n\n$(x - h)^2 = 4p(y - k)$ (opens upward if $p > 0$, downward if $p < 0$)\n$(y - k)^2 = 4p(x - h)$ (opens right if $p > 0$, left if $p < 0$)\n\n### Key Concept: Writing Equations Given Focus and Directrix\n\nThe distance from any point $(x, y)$ on the parabola to the focus $(x_f, y_f)$ equals the distance from $(x, y)$ to the directrix. Set up the equation $\\sqrt{(x - x_f)^2 + (y - y_f)^2} = |$distance to directrix$|$ and simplify.\n\nFor focus (0, 3) and directrix $y = -3$: The vertex is at (0, 0) and $p = 3$. The equation is $x^2 = 12y$.\n\nFor focus (0, -5) and directrix $y = 5$: $p = -5$, so the equation is $x^2 = -20y$.\n\nFor focus (0, 4) and directrix $y = -4$: $p = 4$, so $x^2 = 16y$.\n\nFor focus (0, 2) and directrix $y = -2$: $p = 2$, so $x^2 = 8y$.\n\n### Key Concept: Parabolas with Horizontal Axes\n\nIf the focus is at (1, 7) and directrix is $y = -9$, the axis of symmetry is vertical. The vertex is midway between the focus and directrix: $(1, -1)$. The distance $p = 8$. Since the focus is above the directrix, the parabola opens upward. The equation is $(x - 1)^2 = 32(y + 1)$.",
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
                  markdown: "## Example 1 — Write Equations with Vertical Axes\n\nWrite the equation of the parabola with the given focus and directrix.\n\n### Step 1: Find the Vertex and Value of p\n\nThe vertex is at the midpoint between the focus and directrix along the axis of symmetry. The value of $p$ is the distance from the vertex to the focus (or directrix).\n\nFor focus (0, 8) and directrix $y = -8$: vertex at (0, 0), $p = 8$, so $x^2 = 32y$.\n\nFor focus (0, -9) and directrix $y = 9$: vertex at (0, 0), $p = -9$, so $x^2 = -36y$.",
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
                  markdown: "## Example 2 — Write Equations with Horizontal or Off-Axis Parabolas\n\nFor focus (8, 0) and directrix $y = 4$: the axis of symmetry is vertical through $x = 8$. The vertex is at (8, 2). The distance $p = -2$ (focus is below directrix, so it opens downward). The equation is $(x - 8)^2 = -8(y - 2)$.\n\n### Step 1: Identify the Axis of Symmetry\n\nThe axis of symmetry is perpendicular to the directrix and passes through the focus. Determine whether the parabola opens vertically (up/down) or horizontally (left/right) based on whether the directrix is horizontal or vertical.\n\n### Step 2: Apply the Formula\n\nFor a vertical axis: $(x - h)^2 = 4p(y - k)$.\nFor a horizontal axis: $(y - k)^2 = 4p(x - h)$.",
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
                  markdown: "## Example 3 — Parabolas in the Real World\n\n### Step 1: Highway Valley\n\nFor a highway section modeled by a parabola with focus at (100, 55) and directrix at $y = 5$: the vertex is at (100, 30), and $p = 25$. The equation is $(x - 100)^2 = 100(y - 30)$.\n\nThe level section is modeled by $y = 70$. To find the maximum width, solve for $x$ when $y = 70$: $(x - 100)^2 = 100(40) = 4000$. $x - 100 = \\pm \\sqrt{4000} = \\pm 20\\sqrt{10} \\approx \\pm 63.25$. The width is approximately $126.5$ km.\n\n### Step 2: Tunnel Design\n\nFor a tunnel with focus at (4, -2.5) and directrix at $y = 2.5$: the vertex is at (4, 0), $p = -2.5$. The equation is $(x - 4)^2 = -10y$.\n\nTo check the width at 5 feet above ground ($y = -5$): $(-5 - 4)^2 = -10(-5)$, so $81 = 50$. This is false, so the width at 5 feet is not 14 feet.",
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
                  markdown: "## Mixed Exercises\n\nPractice with all skills from the lesson, including:\n\n- Writing equations of parabolas given focus and directrix (Exercises 1–9).\n- Finding points of intersection between parabolas and lines.\n- Writing equations for parabolic reflectors in headlights and flashlights given focus and directrix.\n- Proving or disproving that a point lies on a parabola given the focus and directrix.\n- Explaining how to determine whether a parabola opens upward, downward, left, or right given its focus and directrix.\n- Finding the equation of a parabola B with the same vertex as parabola A but with focus and directrix twice as far apart.\n- Determining whether the vertex of a parabola is always closer to the focus than to the directrix.",
                },
              },
            ],
          },
        ],
      },
    ];

    const results = [];

    for (const lesson of lessonsData) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 5,
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
        slug: lesson.slug,
        phasesCreated,
        activitiesCreated,
      });
    }

    return { lessons: results };
  },
});