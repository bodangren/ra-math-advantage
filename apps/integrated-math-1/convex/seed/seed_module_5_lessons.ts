import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule5LessonsResult {
  lessonsCreated: number;
  lessonVersionsCreated: number;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedModule5Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule5LessonsResult> => {
    const now = Date.now();
    let lessonsCreated = 0;
    let lessonVersionsCreated = 0;
    let phasesCreated = 0;
    let activitiesCreated = 0;

    const lessons = [
      {
        slug: "module-5-lesson-1",
        title: "Writing Equations in Slope-Intercept Form",
        description:
          "Write linear equations in slope-intercept form given a point and a slope, given two points, model real-world situations, and determine whether a point lies on a given line.",
        orderIndex: 1,
        phaseData: [
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
                    "## Key Terms\n\n- **Slope-intercept form** — A linear equation written as [ y = mx + b ], where [ m ] is the slope and [ b ] is the [ y ]-intercept.\n- **Point-slope form** — A linear equation written as [ y - y_1 = m(x - x_1) ], used when a point [ (x_1, y_1) ] and slope [ m ] are known.\n- **Rate of change** — The ratio of the change in the dependent variable to the change in the independent variable; represented by the slope in a linear model.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Writing Equations in Slope-Intercept Form\n\nTo write the equation of a line in slope-intercept form [ y = mx + b ], identify the slope [ m ] and the [ y ]-intercept [ b ]. When these values are not given directly, use the information provided (a point and slope, two points, or a real-world scenario) to calculate them.\n\n### Key Concept: Slope-Intercept Form\n\n* The slope-intercept form of a line is [ y = mx + b ].\n* [ m ] represents the slope (rate of change).\n* [ b ] represents the [ y ]-intercept (the value of [ y ] when [ x = 0 ]).",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Write an Equation Given a Point and a Slope\n\nGiven a point [ (x_1, y_1) ] and slope [ m ], write the equation of the line in slope-intercept form.\n\n### Step 1: Substitute into Point-Slope Form\n\nUse [ y - y_1 = m(x - x_1) ].\n\nFor example, with point [ (4, 2) ] and slope [ \\frac{1}{2} ]:\n[\ny - 2 = \\frac{1}{2}(x - 4)\n]\n\n### Step 2: Solve for [ y ]\n\nDistribute and isolate [ y ]:\n[\ny - 2 = \\frac{1}{2}x - 2\n]\n[\ny = \\frac{1}{2}x\n]\n\nVariations in the worksheet include:\n* Positive and negative integer slopes (e.g., slope [ -3 ])\n* Positive and negative fractional slopes (e.g., slope [ -\\frac{3}{4} ])\n* Points with positive and negative coordinates",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Model Real-World Situations with Linear Equations\n\nTranslate a verbal description of a linear relationship into an equation in slope-intercept form.\n\n### Step 1: Identify the Slope and Initial Value\n\nDetermine the rate of change [ m ] and the starting value [ b ] from the context.\n\nFor example, a person jogs at a constant speed starting 12 feet from a marker and is 21 feet away after 3 seconds:\n[\nm = \\frac{21 - 12}{3} = 3, \\quad b = 12\n]\n\n### Step 2: Write the Equation\n\nSubstitute [ m ] and [ b ] into [ y = mx + b ] using context-appropriate variables:\n[\nd = 3t + 12\n]\n\nScenarios in the worksheet include:\n* Distance traveled at a constant rate over time\n* Total pay consisting of a base salary plus commission\n* Ticket price increasing by a fixed amount per year\n* Words typed at a constant rate after an initial amount",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Write an Equation Given Two Points\n\nGiven two points [ (x_1, y_1) ] and [ (x_2, y_2) ], write the equation of the line in slope-intercept form.\n\n### Step 1: Calculate the Slope\n\nUse the slope formula:\n[\nm = \\frac{y_2 - y_1}{x_2 - x_1}\n]\n\nFor example, with points [ (-4, -2) ] and [ (4, 0) ]:\n[\nm = \\frac{0 - (-2)}{4 - (-4)} = \\frac{2}{8} = \\frac{1}{4}\n]\n\n### Step 2: Find the [ y ]-Intercept\n\nSubstitute the slope and one point into [ y = mx + b ] and solve for [ b ]:\n[\n0 = \\frac{1}{4}(4) + b \\implies b = -1\n]\n\n### Step 3: Write the Equation\n\n[\ny = \\frac{1}{4}x - 1\n]\n\nVariations in the worksheet include:\n* Horizontal lines (e.g., [ (0, -4) ] and [ (5, -4) ], slope [ 0 ])\n* Vertical lines (e.g., [ (-6, 5) ] and [ (-6, -4) ], undefined slope)\n* Points with fractional coordinates (e.g., [ \\left(\\frac{5}{4}, 1\\right) ] and [ \\left(-\\frac{1}{4}, \\frac{3}{4}\\right) ])",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Worked Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Write Equations from Data and Models\n\nUse given data points, tables, or models to write linear equations representing real-world contexts.\n\n### Step 1: Extract Two Data Points\n\nIdentify two ordered pairs from the problem.\n\nFor example, guitar lessons: 7 lessons and 11 lessons with corresponding prices, or population data from two different years.\n\n### Step 2: Calculate Slope and Intercept\n\nApply the same process as Example 3. For the population of Laredo (123,000 in 1990 and 215,500 in 2007):\n[\nm = \\frac{215500 - 123000}{2007 - 1990} = \\frac{92500}{17} \\approx 5441\n]\nThen use an integer slope and solve for [ b ].\n\n### Step 3: Write the Final Equation\n\nExpress the equation using variables defined by the problem context.\n\nScenarios in the worksheet include:\n* Pricing models with two known data points\n* Population growth over time\n* Temperature change with elevation\n* Fundraising amounts tied to units sold",
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
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice across all skills in this lesson. Problem types include:\n\n* Writing equations from graphed lines (6 graph images)\n* Checking whether a given ordered pair satisfies a linear equation by substitution\n* Finding another point on a line given two points on the line\n* Selecting the correct linear equation for a described situation and explaining the meaning of each variable\n* Writing an equation from a table of ordered pairs\n* Comparing shoe sizes across countries using a linear model\n* Analyzing a repayment schedule table to write and interpret a linear equation\n* Analyzing a puppy growth table to write and interpret a linear equation\n* Finding the intersection of two lines and interpreting its meaning\n* Identifying and explaining errors in writing an equation through two points\n* Discussing limitations of linear models for real-world prediction\n* Creating an original real-world situation to match a given graph",
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
                    "## Review Notes\n\n* Example 4, Exercise 23 references a sign showing guitar lesson prices (image: `media/image1.png`). The price data should be reviewed for accuracy.\n* Exercises 27–29 reference graphed lines on coordinate planes (images: `media/image2.emf`, `media/image3.emf`, `media/image4.emf`).\n* Exercises 30–32 reference graphed lines on coordinate planes (images: `media/image5.png`, `media/image6.png`, `media/image7.png`).\n* Exercise 46 references a table of ordered pairs and its corresponding graph (images: `media/image8.png`, `media/image9.png`). The table data should be reviewed for accuracy.\n* Exercise 48 references a table showing amount owed over weeks (image: `media/image10.png`). The table data should be reviewed.\n* Exercise 49 references a table showing puppy weight by age in months (image: `media/image11.png`). The table data should be reviewed.\n* Exercise 51 references two students' work writing an equation (image: `media/image12.png`). The student work needs review.\n* Exercise 53 references a graph for creating a real-world situation (image: `media/image13.emf`). The graph needs review.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-5-lesson-2",
        title: "Writing Equations in Standard and Point-Slope Forms",
        description:
          "Write linear equations in point-slope form given a point and a slope or two points, convert between point-slope, slope-intercept, and standard forms, write equations for parallel or perpendicular lines, and model real-world situations.",
        orderIndex: 2,
        phaseData: [
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
                    "## Key Terms\n\n- **Point-slope form** — A linear equation written as [ y - y_1 = m(x - x_1) ], where [ m ] is the slope and [ (x_1, y_1) ] is a point on the line.\n- **Standard form** — A linear equation written as [ Ax + By = C ], where [ A ], [ B ], and [ C ] are integers and [ A \\ne 0 ].\n- **Slope-intercept form** — A linear equation written as [ y = mx + b ], where [ m ] is the slope and [ b ] is the [ y ]-intercept.\n- **Parallel lines** — Lines in the same plane that never intersect; they have identical slopes.\n- **Perpendicular lines** — Lines that intersect at a right angle; their slopes are negative reciprocals (product is [ -1 ]).",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Writing Equations in Point-Slope and Standard Forms\n\nDifferent situations call for different forms of a linear equation. Point-slope form is most useful when a point and the slope are known. Standard form is useful for finding intercepts and working with certain real-world constraints. Converting between forms requires algebraic manipulation while preserving equality.\n\n### Key Concept: Forms of a Linear Equation\n\n* **Point-slope form:** [ y - y_1 = m(x - x_1) ]\n* **Slope-intercept form:** [ y = mx + b ]\n* **Standard form:** [ Ax + By = C ] with integer coefficients",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Write Point-Slope Form Given a Point and Slope\n\nGiven a point [ (x_1, y_1) ] and slope [ m ], write the equation of the line in point-slope form, then graph the line.\n\n### Step 1: Substitute into Point-Slope Form\n\nUse [ y - y_1 = m(x - x_1) ].\n\nFor example, with point [ (-6, -3) ] and slope [ -1 ]:\n[\ny - (-3) = -1(x - (-6))\n]\nSimplifying:\n[\ny + 3 = -(x + 6)\n]\n\n### Step 2: Graph the Equation\n\nPlot the given point, use the slope to find a second point, and draw the line through them.\n\nVariations in the worksheet include:\n* Negative integer slopes (e.g., [ m = -1 ])\n* Zero slope (horizontal line, e.g., [ m = 0 ])\n* Positive fractional slopes (e.g., [ m = \\frac{4}{3} ])\n* Points with positive and negative coordinates",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Write Point-Slope Form Given Two Points\n\nGiven two points [ (x_1, y_1) ] and [ (x_2, y_2) ], first calculate the slope, then write the equation in point-slope form using either point.\n\n### Step 1: Calculate the Slope\n\nUse the slope formula:\n[\nm = \\frac{y_2 - y_1}{x_2 - x_1}\n]\n\nFor example, with points [ (-4, 6) ] and [ (-2, 22) ]:\n[\nm = \\frac{22 - 6}{-2 - (-4)} = \\frac{16}{2} = 8\n]\n\n### Step 2: Write in Point-Slope Form\n\nSubstitute the slope and one point into [ y - y_1 = m(x - x_1) ]:\n[\ny - 6 = 8(x - (-4)) \\quad \\text{or} \\quad y - 6 = 8(x + 4)\n]\n\nVariations include points with positive, negative, and mixed coordinates.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Convert Point-Slope Form to Slope-Intercept Form\n\nGiven an equation in point-slope form, solve for [ y ] to rewrite it in slope-intercept form [ y = mx + b ].\n\n### Step 1: Distribute the Slope\n\nFor example, with [ y - 1 = \\frac{4}{5}(x + 5) ]:\n[\ny - 1 = \\frac{4}{5}x + 4\n]\n\n### Step 2: Isolate [ y ]\n\nAdd or subtract the constant on the left side:\n[\ny = \\frac{4}{5}x + 5\n]\n\nVariations in the worksheet include:\n* Positive and negative integer slopes (e.g., [ y + 5 = -6(x + 7) ])\n* Positive and negative fractional slopes (e.g., [ y + 6 = -\\frac{3}{4}(x + 8) ])\n* Various constant terms on the left side",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Worked Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Model Real-World Situations in Point-Slope Form\n\nTranslate a verbal description or graph of a linear relationship into an equation in point-slope form.\n\n### Step 1: Identify a Point and the Slope\n\nExtract a known point [ (x_1, y_1) ] and the rate of change [ m ] from the context or graph.\n\nFor example, a cricket chirps at a rate related to temperature. From the graph, identify a point such as [ (30, 67) ] and slope [ m = \\frac{3}{5} ].\n\n### Step 2: Write the Equation\n\nSubstitute into [ y - y_1 = m(x - x_1) ]:\n[\ny - 67 = \\frac{3}{5}(x - 30)\n]\n\nScenarios in the worksheet include:\n* Cricket chirps and outdoor temperature (graph provided)\n* Canoeing distance over time at a constant speed\n* Perimeter of a square as a function of side length",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Worked Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Convert Equations to Standard Form\n\nRewrite various linear equations into standard form [ Ax + By = C ] with integer coefficients.\n\n### Step 1: Eliminate Fractions and Distribute\n\nFor example, with [ y - 10 = 2(x - 8) ]:\n[\ny - 10 = 2x - 16\n]\n\n### Step 2: Rearrange Terms\n\nMove all variable terms to one side and constants to the other:\n[\n-2x + y = -6\n]\n\nOr multiply by [ -1 ] to make [ A ] positive:\n[\n2x - y = 6\n]\n\nVariations in the worksheet include:\n* Equations starting in point-slope form with integer slopes\n* Equations starting in point-slope form with fractional slopes (e.g., [ y + 7 = -\\frac{3}{2}(x + 1) ])\n* Equations with variables on both sides that require simplification first (e.g., [ 4y - 5x = 3(4x - 2y + 1) ])\n* Equations already in slope-intercept form (e.g., [ y = x + 1 ] and [ y = \\frac{1}{3}x - 10 ])",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Worked Example 6",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 6 — Write Standard Form Given Two Points\n\nGiven two points, write the equation of the line in standard form [ Ax + By = C ].\n\n### Step 1: Calculate the Slope\n\nUse the slope formula:\n[\nm = \\frac{y_2 - y_1}{x_2 - x_1}\n]\n\nFor example, with points [ (-2, -3) ] and [ (4, -7) ]:\n[\nm = \\frac{-7 - (-3)}{4 - (-2)} = \\frac{-4}{6} = -\\frac{2}{3}\n]\n\n### Step 2: Write in Point-Slope Form, Then Convert\n\nUsing point [ (-2, -3) ]:\n[\ny - (-3) = -\\frac{2}{3}(x - (-2))\n]\n[\ny + 3 = -\\frac{2}{3}(x + 2)\n]\n\nMultiply through by [ 3 ] to clear fractions, then rearrange:\n[\n3y + 9 = -2x - 4\n]\n[\n2x + 3y = -13\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Worked Example 7",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 7 — Parallel and Perpendicular Lines\n\nGiven a point and the equation of a line, write equations in slope-intercept form for the line through the given point that is parallel to the given line, and for the line through the given point that is perpendicular to the given line.\n\n### Step 1: Identify the Slope of the Given Line\n\nFor a line [ y = mx + b ], the slope is [ m ].\n\nFor example, given [ y = x + 4 ] (slope [ m = 1 ]) and point [ (3, -2) ]:\n\n### Step 2: Write the Parallel Line\n\nParallel lines have the same slope. Use [ y - y_1 = m(x - x_1) ] and solve for [ y ]:\n[\ny - (-2) = 1(x - 3)\n]\n[\ny = x - 5\n]\n\n### Step 3: Write the Perpendicular Line\n\nPerpendicular lines have slopes that are negative reciprocals. The perpendicular slope is [ -\\frac{1}{m} ]:\n[\ny - (-2) = -1(x - 3)\n]\n[\ny = -x + 1\n]\n\nVariations in the worksheet include:\n* Integer slopes (e.g., [ y = 3x - 5 ])\n* Negative slopes (e.g., [ y = -5x + 8 ])\n* Fractional slopes (e.g., [ y = -\\frac{1}{2}x + 6 ] and [ y = -\\frac{3}{4}x + 4 ])\n* Large integer slopes (e.g., [ y = 13x - 4 ])",
                },
              },
            ],
          },
          {
            phaseNumber: 10,
            title: "Worked Example 8",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 8 — Determine Parallel, Perpendicular, or Neither\n\nGiven two linear equations, determine whether their graphs are parallel, perpendicular, or neither by comparing their slopes.\n\n### Step 1: Write Both Equations in Slope-Intercept Form\n\nSolve each equation for [ y ] to identify [ m ].\n\nFor example:\n[\ny = 4x + 3 \\quad \\text{and} \\quad 4x + y = 3 \\implies y = -4x + 3\n]\n\n### Step 2: Compare the Slopes\n\n* **Parallel:** [ m_1 = m_2 ]\n* **Perpendicular:** [ m_1 \\cdot m_2 = -1 ] (negative reciprocals)\n* **Neither:** neither condition holds\n\nIn the example above, [ m_1 = 4 ] and [ m_2 = -4 ], so the lines are **neither** parallel nor perpendicular.\n\nVariations in the worksheet include pairs where the lines are:\n* Parallel (same slope)\n* Perpendicular (negative reciprocal slopes)\n* Neither (different slopes that are not negative reciprocals)",
                },
              },
            ],
          },
          {
            phaseNumber: 11,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice across all skills in this lesson. Problem types include:\n\n* Writing an equation in standard form given the [ x ]-intercept and [ y ]-intercept\n* Converting equations from point-slope form to both slope-intercept and standard forms\n* Analyzing three equations to identify which are parallel and which are perpendicular, with justification\n* A real-world geometry problem: determining whether two walls of a shed are perpendicular by calculating and comparing slopes\n* A coordinate geometry problem: determining whether two segments of a quadrilateral are parallel by comparing slopes\n* A multi-part problem about a jet's climb trajectory: writing the equation in point-slope form, slope-intercept form, and standard form\n* Finding an unknown coordinate [ p ] so that three given points lie on the same line\n* Open-response questions about what information is needed to write a line's equation\n* Analyzing claims about whether a line through two points is perpendicular or parallel to a given equation, with justification\n* Finding errors in reasoning about parallel lines without computing slopes\n* Writing a general point-slope equation for a line through [ (f, g) ] and [ (h, j) ]\n* Identifying which equation does not belong in a set and justifying the conclusion\n* Creating an original real-world scenario with a constant rate of change and representing it in both point-slope and slope-intercept forms",
                },
              },
            ],
          },
          {
            phaseNumber: 12,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n* Example 1, Exercises 1–3 reference coordinate plane grids for graphing (image: `media/image1.png`). Three graph images are provided.\n* Example 3, Exercise 11 references a coordinate plane grid (image: `media/image2.png`).\n* Exercise 47 references a graph showing a jet's trajectory after take-off (image: `media/image3.png`). The graph data should be reviewed for accuracy.\n* Exercise 54 references a set of equations for \"Which One Doesn't Belong?\" (image: `media/image4.png`). The equations should be reviewed for accuracy.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-5-lesson-3",
        title: "Scatter Plots and Lines of Fit",
        description:
          "Analyze scatter plots to determine whether they show positive, negative, or no correlation, write equations of lines of fit, and use lines of fit to make predictions and evaluate reliability.",
        orderIndex: 3,
        phaseData: [
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
                    "## Key Terms\n\n- **Scatter plot** — A graph that displays pairs of data as points on a coordinate plane to show the relationship between two variables.\n- **Correlation** — A relationship between two variables in a data set.\n- **Positive correlation** — As one variable increases, the other variable tends to increase.\n- **Negative correlation** — As one variable increases, the other variable tends to decrease.\n- **No correlation** — There is no apparent relationship between the two variables.\n- **Line of fit** — A line drawn on a scatter plot that approximates the trend of the data.\n- **Slope-intercept form** — The form [ y = mx + b ], where [ m ] is the slope and [ b ] is the [ y ]-intercept.\n- **Extrapolation** — Using a line of fit to estimate values that lie outside the range of the original data.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Scatter Plots and Correlation\n\nScatter plots display pairs of quantitative data as points on a coordinate plane. By observing the overall pattern of the points, you can identify the type of correlation and describe what it means in the situation.\n\n### Key Concept: Types of Correlation\n\n* **Positive correlation:** Points trend upward from left to right.\n* **Negative correlation:** Points trend downward from left to right.\n* **No correlation:** Points show no discernible pattern or trend.\n* When a correlation exists, describe its real-world meaning in the context of the problem.",
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
                    "## Learn: Lines of Fit\n\nA line of fit approximates the trend shown in a scatter plot. Once you find its equation, you can use it to predict values within or beyond the data set.\n\n### Key Concept: Writing and Using a Line of Fit\n\n* Choose two points [ (x_1, y_1) ] and [ (x_2, y_2) ] that lie on or near the line of fit.\n* Calculate the slope:\n[\n  m = \\frac{y_2 - y_1}{x_2 - x_1}\n]\n* Substitute the slope and one point into [ y = mx + b ] to solve for [ b ].\n* Write the equation [ y = mx + b ] and use it to make predictions by substituting the known value of [ x ] or [ y ].",
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
                    "## Example 1 — Identify Correlation from Scatter Plots\n\nExamine scatter plots and classify the relationship between the variables as positive, negative, or no correlation. For plots that show a correlation, explain what the relationship means in the context of the situation.\n\n\n### Step 1: Observe the Trend\n\nLook at the overall direction of the data points.\n\n### Step 2: Classify the Correlation\n\n* Upward trend → positive correlation\n* Downward trend → negative correlation\n* No pattern → no correlation\n\n### Step 3: Interpret in Context\n\n\nDescribe what the correlation means for the real-world variables. For example, a positive correlation between study time and test scores means that as study time increases, test scores tend to increase.",
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
                    "## Example 2 — Write and Use Lines of Fit\n\nGiven a scatter plot or data table that shows a linear trend, use two points to write an equation for the line of fit in slope-intercept form. Then use the equation to predict a value.\n\n### Step 1: Calculate the Slope\n\nUse two given points, such as [ (2, 2485.6) ] and [ (6, 1172.5) ]:\n\n[\nm = \\frac{1172.5 - 2485.6}{6 - 2} = \\frac{-1313.1}{4}\n]\n\n### Step 2: Find the [ y ]-Intercept\n\nSubstitute the slope and one point into [ y = mx + b ] and solve for [ b ]:\n\n[\n2485.6 = m(2) + b \\quad \\Rightarrow \\quad b = 2485.6 - 2m\n]\n\n### Step 3: Write the Equation\n\nState the line of fit:\n\n[\ny = mx + b\n]\n\nwhere [ x ] represents years since a base year and [ y ] represents the quantity being measured.\n\n### Step 4: Make Predictions\n\nSubstitute the desired [ x ]-value into the equation. For example, to predict a value in 2019 when [ x ] is years since 2010, substitute [ x = 9 ]:\n\n[\ny = m(9) + b\n]",
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
                    "## Mixed Exercises\n\nThe mixed exercises integrate all skills from the lesson. Students:\n\n* Create scatter plots from tables, draw lines of fit, and describe the relationships in the data\n* Classify correlations from scatter plots and interpret their meaning in real-world contexts\n* Write equations of lines of fit in slope-intercept form and use them to interpolate or extrapolate\n* Evaluate the reliability of predictions and explain the assumptions made when using a line of fit\n* Analyze data sets from contexts such as family costs, baseball game lengths, income by age, football ticket prices, life expectancy, and volunteer work groups\n* Construct original real-world situations that can be modeled with scatter plots and justify the type of correlation\n* Compare multiple lines of fit for the same data and determine which model is more appropriate\n* Reflect on whether an accurate line of fit always guarantees accurate future predictions",
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
                    "## Review Notes\n\n* Problems 1–4, 8–10, 13, 14, and 19 rely on scatter plot images that cannot be described in text; these require visual review.\n* Problems 7, 11, 12, 15, and 16 include data tables presented as images; tabular values should be verified during review.\n* Problem 18 presents four situations as an image for a \"Which One Doesn't Belong\" analysis; the text content needs visual verification.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-5-lesson-4",
        title: "Correlation and Causation",
        description:
          "Create scatter plots from bivariate data tables, identify the type of correlation shown, distinguish between correlation and causation, and identify possible lurking variables.",
        orderIndex: 4,
        phaseData: [
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
                    "## Key Terms\n\n- **Correlation** — A statistical relationship between two variables, measured as positive, negative, or none, based on the pattern of a scatter plot.\n- **Causation** — A relationship in which a change in one variable directly produces a change in another variable.\n- **Scatter plot** — A graph that displays ordered pairs of bivariate data to reveal patterns or trends.\n- **Lurking variable** — An unmeasured factor that may influence the relationship between two variables.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Distinguishing Correlation and Causation\n\nWhen two variables change together, they may be correlated. However, correlation alone does not prove that one variable causes the other. To claim causation, there must be evidence of a direct cause-and-effect mechanism, such as a controlled experiment.\n\n### Key Concept: Correlation vs. Causation\n\n* A **positive correlation** means that as one variable increases, the other tends to increase.\n* A **negative correlation** means that as one variable increases, the other tends to decrease.\n* **Correlation does not imply causation** — two variables may be correlated because of a common underlying factor, coincidence, or a lurking variable.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Analyze Real-World Data with Scatter Plots\n\nFor each bivariate data set, create a scatter plot and interpret the relationship.\n\n### Step 1: Graph the Ordered Pairs\n\nPlot the given ordered pairs with one quantity on the horizontal axis and the other on the vertical axis. For example:\n\n[\n(\\text{pounds of frozen yogurt}, \\text{pounds of sherbet})\n]\n\nor\n\n[\n(\\text{minutes reading}, \\text{minutes watching television})\n]\n\n### Step 2: Identify the Correlation\n\nExamine the overall trend of the plotted points to determine whether the scatter plot shows a positive, negative, or no correlation, and explain your reasoning based on the pattern.\n\n### Step 3: Distinguish Correlation from Causation\n\nDetermine whether the data illustrate correlation only or causation. Consider what other factors (lurking variables) may influence the data, such as season, personal preference, or economic conditions.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Classify Relationships as Correlation or Causation\n\nDetermine whether each described situation illustrates correlation (but not causation) or causation. Explain your reasoning by considering whether one variable directly causes the other, or whether a third factor or coincidence could explain the relationship.\n\nRepresentative situations include:\n\n* A negative correlation between the width of a person's palm and daily television time.\n* A positive association between shoe size and reading level.\n* A negative association between the price of cereal and the number of boxes sold.\n* An observed relationship between daily temperature and time spent outside.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises integrate the skills from Examples 1 and 2. Students create scatter plots from tabular data, classify correlations, distinguish correlation from causation, and construct arguments about why correlation does not imply causation. Some exercises also require analyzing a given scatter plot and critiquing a causal claim based on correlational data.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n* The worksheet contains embedded images and data tables (`media/image1.png` through `media/image5.png`) that could not be described in this extracted source. These include the data tables for Exercises 1, 2, 7, and 8, as well as the scatter plot referenced in Exercises 12 and 13. A human reviewer should verify the numerical values and the scatter plot details when building interactive practice items.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-5-lesson-5",
        title: "Linear Regression",
        description:
          "Use technology to calculate the equation of a best-fit line and correlation coefficient, interpret the correlation coefficient, make predictions using a regression equation, and construct and analyze a residual plot.",
        orderIndex: 5,
        phaseData: [
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
                    "## Key Terms\n\n- **Linear regression** — a statistical method for finding the line of best fit that models the relationship between two quantitative variables.\n- **Best-fit line** — the line [ y = ax + b ] that minimizes the sum of the squared residuals for a data set.\n- **Correlation coefficient** — a value [ r ] between -1 and 1 that measures the strength and direction of a linear relationship; values close to [ \\pm 1 ] indicate a strong linear fit.\n- **Residual** — the difference between an observed [ y ]-value and the [ y ]-value predicted by the regression line: [ y_i - \\hat{y}_i ].\n- **Residual plot** — a scatter plot of the residuals versus the independent variable, used to check whether a linear model is appropriate.\n- **Extrapolation** — using a regression equation to estimate values outside the range of the original data, which may produce unreliable predictions.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Linear Regression and Prediction\n\nWhen two variables appear to have a linear relationship, a regression line can model the trend and help make predictions. Technology (graphing calculator or statistical software) is typically used to find the exact equation and correlation coefficient.\n\n### Key Concept: Interpreting Linear Regression\n\n\n* The best-fit line has the form [ y = ax + b ], where [ a ] is the slope (rate of change) and [ b ] is the [ y ]-intercept.\n* The correlation coefficient [ r ] tells you how closely the data points cluster around the line. [ |r| \\approx 1 ] means a strong linear fit; [ r \\approx 0 ] means little to no linear relationship.\n* A residual plot with no obvious pattern suggests a linear model is appropriate. A curved pattern suggests a different model may be better.\n* Predictions made within the data range (interpolation) are generally more reliable than predictions outside the range (extrapolation).",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Worked Example 1",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Best-Fit Line and Correlation Coefficient\n\nGiven a table of paired data, find the equation of the best-fit line and interpret the correlation coefficient.\n\n### Step 1: Enter the Data\n\nInput the paired values into a graphing calculator or statistical software. Let [ x ] represent the independent variable (such as years since a base year) and [ y ] represent the dependent variable (such as goals scored, revenue, or sales).\n\n### Step 2: Perform Linear Regression\n\nRun the linear regression command to obtain:\n[\ny = ax + b\n]\nand the correlation coefficient:\n[\nr\n]\n\n### Step 3: Interpret the Results\n\nState the equation in context. Interpret [ r ] by describing the strength and direction of the linear relationship. For example, [ r = 0.95 ] indicates a strong positive linear association.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Worked Example 2",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Prediction with Linear Regression\n\nGiven a data set, find the best-fit line and use it to predict a future or unknown value.\n\n### Step 1: Find the Regression Equation\n\nEnter the data and compute the best-fit line:\n[\ny = ax + b\n]\n\n### Step 2: Substitute to Predict\n\nIdentify the [ x ]-value for the desired prediction. Substitute into the equation:\n[\n\\hat{y} = a(x_{\\text{new}}) + b\n]\n\nFor example, if [ x ] represents years since 2010, to predict a value in 2025 use [ x = 15 ].\n\n### Step 3: Consider Reasonableness\n\nEvaluate whether the prediction is interpolation (within the data range) or extrapolation (beyond the data range). Extrapolated predictions should be reported with caution.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Residual Plot Analysis\n\nGiven a data set, find the best-fit line and use a residual plot to assess whether a linear model is appropriate.\n\n### Step 1: Find the Best-Fit Line\n\nPerform linear regression to obtain:\n[\n\\hat{y} = ax + b\n]\n\n### Step 2: Calculate Residuals\n\nFor each data point, compute:\n[\n\\text{residual} = y_i - \\hat{y}_i = y_i - (ax_i + b)\n]\n\n### Step 3: Graph and Analyze the Residual Plot\n\nPlot each residual against its corresponding [ x ]-value.\n\n\n* If the points are randomly scattered around the horizontal axis with no obvious pattern, a linear model is appropriate.\n* If a curved pattern (such as a U-shape) is visible, the relationship may be nonlinear and a different model should be considered.",
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
                    "## Mixed Exercises\n\nThe mixed exercises provide practice combining all skills: finding best-fit lines, interpreting correlation coefficients, making predictions, analyzing residual plots, and evaluating the reasonableness of extrapolation. Problems also ask students to consider constraints in real-world contexts, compare lines of fit with linear regression, and distinguish between correlation and causation.",
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
                    "## Review Notes\n\n* The extracted worksheet references 13 image files (image1.png through image13.png) containing data tables. These images were not converted to text and must be reviewed to obtain the numerical values for each problem.\n* Several problems involve real-world contexts (soccer, revenue, sales, sunscreen, gold prices, golf, plant growth, physical fitness, farming, football, athletics) that require students to interpret slopes and predictions in context.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-5-lesson-6",
        title: "Inverses of Linear Functions",
        description:
          "Find the inverse of a relation given its graph, table, or set of ordered pairs, find the inverse of a linear function algebraically, graph the inverse of a function by reflecting across y=x, and use inverse functions to solve real-world problems.",
        orderIndex: 6,
        phaseData: [
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
                    "## Key Terms\n\n- **Inverse relation** — a relation obtained by switching the coordinates of each ordered pair in the original relation.\n- **Inverse function** — a function that undoes the action of another function; if [ f(a) = b ], then [ f^{-1}(b) = a ].\n- **Reflection** — a transformation that flips a graph across a line; the graph of an inverse function is the reflection of the original function across [ y = x ].",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Finding Inverses of Relations\n\nTo find the inverse of a relation, switch the [ x ]- and [ y ]-values of each ordered pair.\n\n### Key Concept: Inverse of a Relation\n\n* If a relation contains the ordered pair [ (a, b) ], its inverse contains [ (b, a) ].\n* The domain of the inverse is the range of the original relation, and the range of the inverse is the domain of the original relation.",
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
                    "## Learn: Finding Inverses of Functions Algebraically\n\nTo find the inverse of a function [ f(x) ]:\n\n1. Replace [ f(x) ] with [ y ].\n2. Switch [ x ] and [ y ].\n3. Solve for [ y ].\n4. Replace [ y ] with [ f^{-1}(x) ].\n\n### Key Concept: Inverse of a Linear Function\n\n* The inverse of a linear function is also a linear function.\n* The graph of [ f^{-1}(x) ] is the reflection of the graph of [ f(x) ] across the line [ y = x ].\n* The slopes of inverse linear functions are reciprocals of each other.\n* The [ x ]-intercept of [ f(x) ] becomes the [ y ]-intercept of [ f^{-1}(x) ], and vice versa.",
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
                    "## Example 1 — Find the Inverse from a Graph or Table\n\nGiven a linear function represented by a graph or table, find its inverse relation.\n\n### Step 1: Read Ordered Pairs\n\nIdentify several points [ (x, y) ] from the graph or table.\n\n### Step 2: Switch Coordinates\n\nWrite the inverse relation by switching each [ x ]- and [ y ]-coordinate:\n[\n(x, y) \\rightarrow (y, x)\n]",
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
                    "## Example 2 — Find the Inverse from Ordered Pairs\n\nGiven a set of ordered pairs, write the inverse relation by switching the coordinates of each pair.\n\nFor a relation [ \\{(-3, 2), (-1, 8), (1, 14), (3, 20)\\} ], the inverse is:\n[\n\\{(2, -3), (8, -1), (14, 1), (20, 3)\\}\n]",
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
                    "## Example 3 — Graph the Inverse of a Function\n\nGiven the graph of a function, sketch the graph of its inverse.\n\n### Step 1: Identify Points on the Original Graph\n\nLocate several points on the given function.\n\n### Step 2: Reflect Across [ y = x ]\n\nSwitch the [ x ]- and [ y ]-coordinates of each point to find corresponding points on the inverse:\n[\n(2, 4) \\rightarrow (4, 2)\n]\n\n### Step 3: Sketch the Inverse\n\nPlot the reflected points and draw the line through them.",
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
                    "## Example 4 — Find the Inverse of a Linear Function\n\nFind the inverse of linear functions given in slope-intercept or similar form.\n\n### Step 1: Write as [ y = ]\n\nReplace [ f(x) ] with [ y ]:\n[\nf(x) = 8x - 5 \\quad \\rightarrow \\quad y = 8x - 5\n]\n\n### Step 2: Switch [ x ] and [ y ]\n\n[\nx = 8y - 5\n]\n\n### Step 3: Solve for [ y ]\n\n[\nx + 5 = 8y \\quad \\rightarrow \\quad y = \\frac{x + 5}{8}\n]\n\n### Step 4: Write in Inverse Notation\n\n[\nf^{-1}(x) = \\frac{x + 5}{8}\n]",
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
                    "## Example 5 — Find the Inverse of Rational Linear Functions\n\nFind the inverse of linear functions expressed as fractions or with fractional coefficients.\n\nFor a function such as:\n[\nf(x) = \\frac{3x + 5}{4}\n]\n\nSwitch [ x ] and [ y ], then solve:\n[\nx = \\frac{3y + 5}{4} \\quad \\rightarrow \\quad 4x = 3y + 5 \\quad \\rightarrow \\quad y = \\frac{4x - 5}{3}\n]\n\nSo:\n[\nf^{-1}(x) = \\frac{4x - 5}{3}\n]",
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
                  markdown:
                    "## Example 6 — Inverse Functions in Context\n\nUse inverse functions to solve real-world problems.\n\n### Step 1: Identify the Original Function\n\nRead the problem to find the function that relates two quantities, such as profit and number of items sold.\n\n\n### Step 2: Find the Inverse Function\n\nUse the switch-and-solve method to find [ f^{-1}(x) ].\n\n\n### Step 3: Interpret the Inverse\n\nDescribe what the input and output of the inverse function represent in the context of the problem. For example, if [ P(x) = 1.25x - 15 ] represents profit from selling [ x ] glasses of lemonade, then [ P^{-1}(x) ] gives the number of glasses that must be sold to earn a profit of [ x ] dollars.\n\n\n### Step 4: Answer the Question\n\nSubstitute the given value into the inverse function and evaluate.",
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
                    "## Mixed Exercises\n\nThe mixed exercises section provides comprehensive practice with inverse functions across multiple representations and problem types. Students practice:\n\n* Writing the inverse of linear equations in standard form by solving for [ y ] and then switching variables, or by switching first and then solving.\n* Constructing the equation of an inverse function from given conditions, such as the slope of the original function and a point on the inverse graph.\n* Matching linear functions to the graphs of their inverses by analyzing slopes and intercepts.\n* Writing inverses of functions given in fractional form and verifying by graphing.\n* Reasoning about the properties of inverse functions, including how to check an inverse using ordered pairs and the relationship between slopes and intercepts.\n* Analyzing common errors, such as confusing the inverse notation [ f^{-1}(x) ] with the reciprocal.\n* Solving challenge problems involving unknown parameters in a function and its inverse.\n* Determining whether statements about inverse functions are sometimes, always, or never true, with explanation.",
                },
              },
            ],
          },
          {
            phaseNumber: 11,
            title: "Review Notes",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 5,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Review Notes\n\n* Problems 1–3 require reading inverse relations from graphs or tables shown in images. The images contain three separate graphs/tables that students use to find inverse relations by switching coordinates.\n* Problems 10–15 require graphing the inverse of functions shown in images. Six separate graphs are provided; students must reflect each across [ y = x ] to sketch the inverse.\n* Problems 37–39 require matching three functions to the graphs of their inverses labeled A, B, and C. The three graphs are shown in images.",
                },
              },
            ],
          },
        ],
      },
    ];

    for (const lesson of lessons) {
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

      if (!existingLessonVersion) lessonVersionsCreated++;

      for (const phase of lesson.phaseData) {
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
