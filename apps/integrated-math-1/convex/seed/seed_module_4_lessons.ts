import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedModule4Result {
  lessonsCreated: number;
  lessonIds: Id<"lessons">[];
  totalPhases: number;
}

const LESSONS = [
  {
    slug: "module-4-lesson-1",
    title: "Graphing Linear Functions",
    orderIndex: 1,
    description:
      "Graph linear equations by making a table of values. Graph linear equations by finding and plotting the x- and y-intercepts. Interpret intercepts in the context of real-world situations modeled by linear functions. Rewrite linear equations in equivalent forms to identify intercepts and slope.",
    phases: [
      {
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Vocabulary\n\n- **linear function** — A function whose graph is a straight line and can be written in the form [ y = mx + b ] or [ Ax + By = C ].\n- **x-intercept** — The point where the graph crosses the x-axis; occurs where [ y = 0 ].\n- **y-intercept** — The point where the graph crosses the y-axis; occurs where [ x = 0 ].\n- **slope** — The ratio of vertical change to horizontal change between any two points on a line.\n- **table of values** — A set of ordered pairs used to plot points and sketch the graph of an equation.\n- **standard form** — A linear equation written as [ Ax + By = C ], where [ A ], [ B ], and [ C ] are constants.",
            },
          },
        ],
      },
      {
        title: "Learn: Graphing by Making a Table",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Graphing by Making a Table\n\nOne way to graph a linear equation is to create a table of values. Choose several values for [ x ], substitute them into the equation to find the corresponding [ y ] values, plot the resulting ordered pairs, and draw a straight line through the points.\n\n### Key Concept: Using a Table to Graph\n\n- Choose at least three values for [ x ], including positive, negative, and zero when possible.\n- Substitute each [ x ] value into the equation and solve for [ y ].\n- Write the results as ordered pairs [ (x, y) ].\n- Plot the points on a coordinate plane and draw the line.",
            },
          },
        ],
      },
      {
        title: "Learn: Graphing Using Intercepts",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Graphing Using Intercepts\n\nThe intercepts of a line are often the easiest points to find. Because an intercept lies on an axis, one of its coordinates is always zero. Plotting the two intercepts determines the line.\n\n### Key Concept: Finding Intercepts\n\n- To find the **x-intercept**, substitute [ y = 0 ] into the equation and solve for [ x ]. The intercept is at [ (x, 0) ].\n- To find the **y-intercept**, substitute [ x = 0 ] into the equation and solve for [ y ]. The intercept is at [ (0, y) ].\n- Plot both intercepts and draw the line through them.",
            },
          },
        ],
      },
      {
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Graph by Making a Table\n\nGraph linear equations by choosing input values, computing outputs, and plotting the resulting points. Problems include vertical lines, horizontal lines, and lines with various slopes and [ y ]-intercepts.\n\n### Step 1: Choose Input Values\n\nSelect convenient values for [ x ], such as [ -2 ], [ 0 ], and [ 2 ]. For equations solved for [ y ], any real number will work. For equations like [ x = -2 ], the [ x ] value is fixed.\n\n### Step 2: Compute Output Values\n\nSubstitute each chosen [ x ] into the equation and solve for [ y ]. For example, with [ y = \\frac{1}{2}x + 1 ]:\n\n[\n\\begin{align*}\nx &= -2 \\quad\\Rightarrow\\quad y = \\frac{1}{2}(-2) + 1 = 0 \\\\\nx &= 0 \\quad\\Rightarrow\\quad y = 1 \\\\\nx &= 2 \\quad\\Rightarrow\\quad y = 2\n\\end{align*}\n]\n\n### Step 3: Plot and Draw\n\nPlot the ordered pairs on a coordinate plane and draw a straight line through them. For a vertical line such as [ x = -2 ], all points have [ x ]-coordinate [ -2 ]. For a horizontal line such as [ y = -4 ], all points have [ y ]-coordinate [ -4 ].\n\n> **Note:** Problems in this group vary in equation form (e.g., [ y = -8x ], [ 3x = y ], [ y - 8 = -x ], [ x = 10 - y ], [ y + 2 = \\frac{1}{4}x ]). The process is the same: rewrite if needed, build a table, plot, and connect.",
            },
          },
        ],
      },
      {
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Graph Using x- and y-Intercepts\n\nGraph linear equations by finding the intercepts. This method is especially efficient when the equation is in standard form or when the intercepts are integers.\n\n### Step 1: Find the x-Intercept\n\nSubstitute [ y = 0 ] and solve for [ x ]. For [ x + y = 4 ]:\n\n[\nx + 0 = 4 \\quad\\Rightarrow\\quad x = 4\n]\n\nThe x-intercept is [ (4, 0) ].\n\n### Step 2: Find the y-Intercept\n\nSubstitute [ x = 0 ] and solve for [ y ]. For the same equation:\n\n[\n0 + y = 4 \\quad\\Rightarrow\\quad y = 4\n]\n\nThe y-intercept is [ (0, 4) ].\n\n### Step 3: Plot and Draw\n\nPlot the two intercepts and draw the line through them. Repeat for equations such as [ y = 4 + 2x ], [ 5 - y = -3x ], [ x = 5y + 5 ], [ x - y = -3 ], and [ y = 8 - 6x ].\n\n> **Note:** The general process is identical for all problems in this group. Variations are in the coefficients and whether the equation needs to be rearranged before substituting.",
            },
          },
        ],
      },
      {
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Interpret Intercepts in Context\n\nApply intercept-finding skills to real-world situations. Write or use a given linear model, find its intercepts, and explain what each intercept means in the problem's context.\n\n### Step 1: Identify the Model\n\nRead the problem to find or write the linear equation. For example, Amanda's lunch account balance is modeled by:\n\n[\ny = 210 - 35x\n]\n\nwhere [ y ] is the dollar balance and [ x ] is the number of weeks.\n\n### Step 2: Find and Interpret the y-Intercept\n\nSet [ x = 0 ] to find the starting value:\n\n[\ny = 210 - 35(0) = 210\n]\n\nThe y-intercept [ (0, 210) ] means Amanda starts with [ $210 ] in her account.\n\n### Step 3: Find and Interpret the x-Intercept\n\nSet [ y = 0 ] to find when the balance reaches zero:\n\n[\n0 = 210 - 35x \\quad\\Rightarrow\\quad x = 6\n]\n\nThe x-intercept [ (6, 0) ] means Amanda will run out of money after [ 6 ] weeks.\n\n### Step 4: Graph the Equation\n\nPlot the two intercepts and draw the line segment connecting them. Label the axes with appropriate units (weeks and dollars).\n\n> **Note:** The second problem in this group involves a shipping scenario modeled by [ y = 8063 - 60x ]. The process is the same: find intercepts, interpret them as initial containers and hours to unload, and graph.",
            },
          },
        ],
      },
      {
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nThe mixed exercises integrate the lesson's graphing methods and reinforce intercept concepts through varied problem types.\n\n- **Graphing practice:** Graph equations given in slope-intercept form, standard form, or other equivalent forms (e.g., [ 1.25x + 7.5 = y ], [ 2x - 3 = 4y + 6 ], [ 3y - 7 = 4x + 1 ]).\n- **Finding intercepts algebraically:** Given an equation in standard form or slope-intercept form, compute the x-intercept and y-intercept without graphing (e.g., [ 5x + 3y = 15 ], [ 2x - 7y = 14 ], [ 2x - 3y = 5 ], [ 6x + 2y = 8 ], [ y = \\frac{1}{4}x - 3 ], [ y = \\frac{2}{3}x + 1 ]).\n- **Modeling and interpreting:** Write a linear equation from a verbal description, graph it, and interpret the intercepts. Problems include predicting height from bone length ([ h = 81.2 + 3.34r ]), towing costs ([ y = 40 + 1.70x ]), and budget constraints for party snacks.\n- **Reasoning and error analysis:** Evaluate whether intercepts are reasonable in a given context (e.g., a football team's wins and losses). Identify common misconceptions, such as the claim that every line has both intercepts.\n- **Writing and creating:** Invent a real-world linear situation, define variables, write an equation, find intercepts, and graph by making a table. State a reasonable domain and explain axis labels.\n- **Comparing and analyzing:** Compare the graph of a linear function with a discrete domain versus a continuous domain. Determine which equation among a set does not belong and justify the choice. Analyze how to graph a given equation using intercepts.\n\n## Review Notes\n\n- Images referenced in the source worksheet (`media/image1.png` through `media/image19.png`) could not be described. These images contain blank coordinate grids for students to graph equations by hand. Verify that the grid scales and axis labels match the original worksheet.\n- Problem 32 (\"Which One Doesn't Belong?\") references an image (`media/image19.png`) containing a set of equations. The image could not be described; teachers should verify the equation set shown.\n- Problem 31 asks students to evaluate Geroy's claim that every line has both an x- and y-intercept. Remind students to consider vertical and horizontal lines.\n- Problems 35–37 ask students to create linear equations in standard form [ Ax + By = C ] with specific coefficient conditions ([ A = 0 ], [ B = 0 ], [ C = 0 ]) and describe the resulting graphs.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-4-lesson-2",
    title: "Rate of Change and Slope",
    orderIndex: 2,
    description:
      "Calculate the rate of change from tables, graphs, and real-world data. Compute the slope of a line passing through two given points, including horizontal and vertical lines. Determine whether a function is linear by checking for a constant rate of change. Solve for an unknown coordinate given two points and a target slope. Interpret slope and rate of change in real-world contexts.",
    phases: [
      {
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Vocabulary\n\n- **Rate of change** — The ratio of the change in the dependent variable to the change in the independent variable between two points\n- **Slope** — A measure of the steepness of a line, defined as the ratio of vertical change to horizontal change between any two points on the line\n- **Linear function** — A function whose graph is a straight line and has a constant rate of change\n- **Undefined slope** — The slope of a vertical line, where the horizontal change is zero\n- **Grade** — The slope of a road or hill, often expressed as a percentage",
            },
          },
        ],
      },
      {
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Rate of Change and Slope\n\nThe rate of change describes how one quantity changes with respect to another. For a linear function, this rate is constant and equal to the slope of its graph.\n\n### Key Concept: Rate of Change from Two Points\n\n- Given two points [ (x_1, y_1) ] and [ (x_2, y_2) ], the rate of change is:\n[\n  \\text{rate of change} = \\frac{y_2 - y_1}{x_2 - x_1}\n]\n- For a table of values, select any two rows and compute the ratio of the change in output to the change in input\n\n### Key Concept: Slope of a Line\n\n- The slope [ m ] of a line through [ (x_1, y_1) ] and [ (x_2, y_2) ] is:\n[\n  m = \\frac{y_2 - y_1}{x_2 - x_1}\n]\n- Horizontal lines have slope [ m = 0 ] \n- Vertical lines have undefined slope because [ x_2 - x_1 = 0 ] \n\n### Key Concept: Linear Functions\n\n- A function is linear if it has a constant rate of change across all pairs of points\n- If the rate of change varies, the function is not linear",
            },
          },
        ],
      },
      {
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Find the Rate of Change from a Table\n\nGiven a table of input-output values for a function, compute the rate of change by selecting two points.\n\n### Step 1: Identify Two Points\n\nExtract coordinate pairs from the table, such as [ (x_1, y_1) ] and [ (x_2, y_2) ].\n\n### Step 2: Apply the Rate of Change Formula\n\n[\n\\text{rate of change} = \\frac{y_2 - y_1}{x_2 - x_1}\n]\n\nRepeat for different pairs to verify consistency. Some problems present real-world contexts (e.g., population density over time, band enrollment over years) where students interpret the average annual rate of change.",
            },
          },
        ],
      },
      {
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Find the Rate of Change from a Graph\n\nGiven a graph showing how a quantity changes over time or another variable, calculate the rate of change between two specified points and interpret its meaning.\n\n### Step 1: Read Coordinates from the Graph\n\nIdentify the values on the horizontal and vertical axes at the two given points.\n\n### Step 2: Compute the Rate of Change\n\n[\n\\text{rate of change} = \\frac{\\text{change in vertical quantity}}{\\text{change in horizontal quantity}}\n]\n\n### Step 3: Interpret in Context\n\nDescribe whether the quantity is increasing or decreasing and at what rate. Contexts include temperature over hours of a day and annual coal exports over years.",
            },
          },
        ],
      },
      {
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 and 4 — Determine Whether a Function Is Linear\n\nGiven a table or equation, decide whether the function is linear by checking for a constant rate of change.\n\n### Step 1: Compute Rates of Change Across Multiple Pairs\n\nFor a table, calculate [ \\frac{\\Delta y}{\\Delta x} ] between successive pairs of points.\n\n### Step 2: Compare and Conclude\n\n- If all rates are equal, the function is linear and that common value is the rate of change\n- If rates differ, the function is not linear\n\nRepresentative forms include sets of [ (x, y) ] pairs and equations relating [ x ] and [ y ].",
            },
          },
        ],
      },
      {
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Examples 5 through 8 — Find the Slope Through Two Points\n\nGiven pairs of coordinate points, find the slope of the line passing through each pair.\n\n### Step 1: Label Coordinates\n\nIdentify [ (x_1, y_1) ] and [ (x_2, y_2) ] from the given pair.\n\n### Step 2: Apply the Slope Formula\n\n[\nm = \\frac{y_2 - y_1}{x_2 - x_1}\n]\n\nThis set includes a wide variety of points:\n- Points with positive, negative, and zero slopes\n- Horizontal lines, e.g., [ (5, -4) ] and [ (9, -4) ], giving [ m = 0 ] \n- Vertical lines, e.g., [ (6, -10) ] and [ (6, 14) ], giving undefined slope\n- Fractional and integer results\n\nSimplify fractions to lowest terms where applicable.",
            },
          },
        ],
      },
      {
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 9 — Find an Unknown Coordinate Given Slope\n\nGiven two points where one coordinate is an unknown [ r ] and a target slope [ m ], solve for [ r ].\n\n### Step 1: Set Up the Slope Equation\n\nSubstitute known values and [ r ] into the slope formula:\n[\nm = \\frac{y_2 - y_1}{x_2 - x_1}\n]\n\n### Step 2: Solve for r\n\nRearrange and solve the resulting linear equation. Examples include integer slopes such as [ m = -4 ] and [ m = 8 ], and fractional slopes such as [ m = \\frac{3}{4} ] and [ m = -\\frac{1}{2} ].",
            },
          },
        ],
      },
      {
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 10 — Slope in Real-World Contexts\n\nApply the concept of slope to practical situations involving grade, elevation, and positioning.\n\n### Step 1: Identify Rise and Run\n\nExtract the vertical change (rise) and horizontal change (run) from the problem description.\n\n### Step 2: Compute the Slope\n\n[\n\\text{slope} = \\frac{\\text{rise}}{\\text{run}}\n]\n\nContexts include:\n- Road signs describing a steep downgrade\n- Soil grading around a house foundation (6 inches of height per 10 feet horizontal)\n- Wheelchair ramp regulations under the Americans with Disabilities Act\n- Relative positions of a boat, scuba diver, and fish below the water surface",
            },
          },
        ],
      },
      {
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice across all skills in the lesson:\n\n- Find the slope of a line from a coordinate plane graph\n- Find the slope through pairs of points, including positive, negative, zero, and undefined slopes\n- Solve for an unknown coordinate to produce a specific slope, including cases with undefined and zero slopes\n- Reason about when a slope is undefined or zero\n- Create a line on a coordinate plane and explain how to determine its slope\n- Analyze a real-world graph to evaluate a claim about the rate of change\n- Describe a function from a table using rate of change\n- Explain the relationship between rate of change and slope\n- Find and explain an error in a slope calculation\n- Solve for a general unknown coordinate in terms of variables given a target slope\n- Analyze why vertical lines have undefined slope\n\n## Review Notes\n\n- Images referenced in the source document (image1 through image17) contain tables, graphs, and diagrams that could not be fully described from the extracted text. Human review is recommended to transcribe tabular data, graph coordinates, and diagram measurements for accurate problem reproduction.\n- Problem 48 (USE A SOURCE) asks students to research the Americans with Disabilities Act (ADA) wheelchair ramp slope regulation. The expected maximum slope of [ \\frac{1}{12} ] (approximately 8.33%) may need to be provided if students do not have internet access.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-4-lesson-3",
    title: "Slope-Intercept Form",
    orderIndex: 3,
    description:
      "Write linear equations in slope-intercept form given the slope and y-intercept. Rewrite linear equations from standard form into slope-intercept form by solving for y. Model real-world situations with linear equations in slope-intercept form and interpret the meaning of slope and intercept in context. Graph linear functions given in slope-intercept form or standard form.",
    phases: [
      {
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Vocabulary\n\n- **slope-intercept form** — The form [ y = mx + b ], where [ m ] is the slope and [ b ] is the [ y ]-intercept.\n- **slope** — The rate of change of a line, representing rise over run.\n- **[ y ]-intercept** — The point [ (0, b) ] where the graph crosses the [ y ]-axis.\n- **standard form** — A linear equation written as [ Ax + By = C ], where [ A ], [ B ], and [ C ] are constants.",
            },
          },
        ],
      },
      {
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Slope-Intercept Form\n\nThe slope-intercept form of a linear equation is the most useful form for graphing and interpreting linear relationships.\n\n### Key Concept: Slope-Intercept Form\n\n- A linear equation in slope-intercept form is written as [ y = mx + b ].\n- [ m ] represents the slope (rate of change).\n- [ b ] represents the [ y ]-intercept (starting value when [ x = 0 ]).\n- To graph, plot the [ y ]-intercept [ (0, b) ] and use the slope to find additional points.",
            },
          },
        ],
      },
      {
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Write Equations from Slope and [ y ]-Intercept\n\nWrite an equation of a line in slope-intercept form when given the slope and [ y ]-intercept.\n\nSubstitute the given values of [ m ] and [ b ] directly into [ y = mx + b ].\n\nFor example, with slope [ 5 ] and [ y ]-intercept [ -3 ]:\n\n[\ny = 5x - 3\n]\n\nProblems include positive, negative, and zero slopes, as well as positive and negative [ y ]-intercepts.",
            },
          },
        ],
      },
      {
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Rewrite in Slope-Intercept Form\n\nRewrite linear equations from standard form into slope-intercept form by isolating [ y ].\n\n### Step 1: Isolate the [ y ]-Term\n\nMove all terms except [ y ] to the right side of the equation.\n\nFor example, starting with:\n\n[\n-10x + 2y = 12\n]\n\nAdd [ 10x ] to both sides:\n\n[\n2y = 10x + 12\n]\n\n### Step 2: Solve for [ y ] \n\nDivide every term by the coefficient of [ y ].\n\n[\ny = 5x + 6\n]\n\nProblems include cases where the coefficient of [ y ] requires division by a constant, as well as equations where the constant term is a fraction after dividing.",
            },
          },
        ],
      },
      {
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Model Real-World Situations\n\nWrite an equation in slope-intercept form to represent a real-world scenario, identifying the initial value and the rate of change.\n\n### Step 1: Identify the Starting Value and Rate\n\nDetermine what value corresponds to [ b ] (the amount when [ x = 0 ]) and what value corresponds to [ m ] (the amount that changes per unit).\n\nFor example, if Wade starts with [ 100 ] and saves [ 25 ] per month, the equation is:\n\n[\ny = 25x + 100\n]\n\n### Step 2: Define the Variables\n\nClearly state what [ x ] and [ y ] represent in the context of the problem.\n\nProblems include savings over time, costs with enrollment fees, earnings with hourly wages and commission, and energy consumption trends.",
            },
          },
        ],
      },
      {
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Graph from Slope and [ y ]-Intercept\n\nGraph a linear function when given the slope and [ y ]-intercept.\n\n### Step 1: Plot the [ y ]-Intercept\n\nPlot the point [ (0, b) ] on the coordinate plane.\n\n### Step 2: Use the Slope to Find Another Point\n\nFrom the [ y ]-intercept, use [ m = \\frac{\\text{rise}}{\\text{run}} ] to locate a second point. Then draw a line through the points.\n\nFor example, with slope [ 5 ] and [ y ]-intercept [ 8 ], plot [ (0, 8) ], then rise [ 5 ] and run [ 1 ] to reach [ (1, 13) ].",
            },
          },
        ],
      },
      {
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Examples 5 and 6 — Graph Linear Functions\n\nGraph linear functions presented in various forms, including standard form and equations of horizontal lines.\n\n### Step 1: Convert to Slope-Intercept Form (if needed)\n\nFor equations in standard form, solve for [ y ] to identify the slope and [ y ]-intercept.\n\nFor example, [ 5x + 2y = 8 ] becomes:\n\n[\ny = -\\frac{5}{2}x + 4\n]\n\n### Step 2: Graph Horizontal Lines\n\nFor equations like [ y = 7 ] or [ y = -\\frac{2}{3} ], draw a horizontal line through the [ y ]-value on the [ y ]-axis.\n\n### Step 3: Graph Using Intercepts or Slope-Intercept\n\nPlot the [ y ]-intercept, use the slope to find additional points, and draw the line.",
            },
          },
        ],
      },
      {
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 7 — Equation, Graph, and Evaluation\n\nWrite a slope-intercept equation for a real-world situation, graph the function, and use it to answer follow-up questions.\n\n### Step 1: Write the Equation\n\nIdentify the fixed cost and variable rate, then write [ y = mx + b ].\n\nFor a basic streaming plan at [ 13 ] per month plus [ 8 ] per premium channel:\n\n[\nc = 8p + 13\n]\n\n### Step 2: Graph the Function\n\nPlot the [ y ]-intercept (or [ c ]-intercept) and use the slope to draw the line.\n\n### Step 3: Evaluate\n\nSubstitute a given value into the equation to find a specific cost or quantity.\n\nFor example, the cost of [ 3 ] premium channels is:\n\n[\nc = 8(3) + 13 = 37\n]",
            },
          },
        ],
      },
      {
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice across all skills from the lesson:\n\n- Writing equations in slope-intercept form from given slope and [ y ]-intercept, including fractional slopes.\n- Graphing lines from slope and [ y ]-intercept.\n- Graphing functions given in standard form.\n- Writing equations from graphed lines (requires interpreting graphs).\n- Multi-part real-world problems involving movies, factory heating, savings accounts, and charity walks, requiring students to write equations, graph, and interpret results.\n- Analyzing a specific linear function over a restricted domain, completing a table, and identifying maximum and minimum values.\n- Determining whether a graphical method can be used to solve a linear equation.\n- Finding an unknown coordinate given three collinear points.\n- Creating an original real-world linear model and making a prediction.\n\n## Review Notes\n\n- Problems 37–39 require interpreting graphs shown as images (`media/image1.png`, `media/image2.png`, `media/image3.png`) to write equations in slope-intercept form. These images were not described in the source extraction and will need to be recreated or described during content implementation.\n- Problem 44 includes a table image (`media/image4.png`) for completing values of [ y = -\\frac{4}{5}x + \\frac{2}{5} ] over the interval [ -2 \\le x \\le 5 ]. The table structure will need to be recreated during implementation.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-4-lesson-4",
    title: "Transformations of Linear Functions",
    orderIndex: 4,
    description:
      "Describe translations, dilations, and reflections of linear functions in relation to the parent function f(x) = x. Distinguish between vertical and horizontal transformations given a function rule. Write transformed linear functions from verbal descriptions and real-world contexts.",
    phases: [
      {
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Vocabulary\n\n- **Parent function** — The simplest form of a function in a family; for linear functions, [ f(x) = x ] \n- **Translation** — A shift of a graph horizontally, vertically, or both without changing its shape\n- **Dilation** — A stretch or compression of a graph that changes its steepness\n- **Reflection** — A flip of a graph across an axis\n- **Vertical stretch** — A dilation where [ |a| > 1 ] in [ g(x) = a \\cdot f(x) ], making the graph steeper\n- **Vertical compression** — A dilation where [ 0 < |a| < 1 ] in [ g(x) = a \\cdot f(x) ], making the graph flatter\n- **Horizontal compression** — A dilation where [ |b| > 1 ] in [ g(x) = f(bx) ], making the graph steeper\n- **Horizontal stretch** — A dilation where [ 0 < |b| < 1 ] in [ g(x) = f(bx) ], making the graph flatter",
            },
          },
        ],
      },
      {
        title: "Learn: Translations of Linear Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Translations of Linear Functions\n\nA translation shifts every point of a graph by the same amount.\n\n### Key Concept: Vertical and Horizontal Translations\n\n- **Vertical translation:** [ g(x) = f(x) + k ] shifts the graph [ k ] units up if [ k > 0 ], or down if [ k < 0 ] \n- **Horizontal translation:** [ g(x) = f(x - h) ] shifts the graph [ h ] units right if [ h > 0 ], or left if [ h < 0 ] \n- **Combined translation:** [ g(x) = f(x - h) + k ] shifts right [ h ] and up [ k ] ",
            },
          },
        ],
      },
      {
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Describe Vertical Translations\n\nDescribe how the graph of [ g(x) ] is related to the graph of the parent function [ f(x) = x ].\n\n### Step 1: Identify the Transformation Type\n\nLook at the form of [ g(x) ]. When a constant is added or subtracted outside the function, the transformation is vertical.\n\nFor example:\n[\ng(x) = x + 11\n]\nThe [ +11 ] is outside the function, so this is a vertical shift.\n\n### Step 2: State the Direction and Magnitude\n\n[\ng(x) = x + 11 \\quad \\text{translates the graph 11 units up}\n]\n[\ng(x) = x - 8 \\quad \\text{translates the graph 8 units down}\n]",
            },
          },
        ],
      },
      {
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Describe Horizontal Translations\n\nDescribe how the graph of [ g(x) ] is related to the graph of the parent function [ f(x) = x ].\n\n### Step 1: Identify the Transformation Type\n\nWhen a constant is added or subtracted inside the function argument, the transformation is horizontal.\n\nFor example:\n[\ng(x) = (x - 7)\n]\nThe [ -7 ] is inside with [ x ], so this is a horizontal shift.\n\n### Step 2: State the Direction and Magnitude\n\nRemember: [ g(x) = f(x - h) ] shifts [ h ] units to the right when [ h > 0 ].\n\n[\ng(x) = (x - 7) \\quad \\text{translates the graph 7 units to the right}\n]\n[\ng(x) = (x + 12) \\quad \\text{translates the graph 12 units to the left}\n]",
            },
          },
        ],
      },
      {
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Describe Combined Translations\n\nDescribe how the graph of [ g(x) ] is related to the graph of the parent function when both horizontal and vertical shifts are present.\n\n### Step 1: Identify Both Transformations\n\nFor example:\n[\ng(x) = (x + 10) - 1\n]\n- The [ +10 ] inside indicates a horizontal shift left 10 units\n- The [ -1 ] outside indicates a vertical shift down 1 unit\n\n### Step 2: State the Combined Translation\n\n[\ng(x) = (x + 10) - 1 \\quad \\text{translates the graph 10 units left and 1 unit down}\n]\n[\ng(x) = (x - 9) + 5 \\quad \\text{translates the graph 9 units right and 5 units up}\n]",
            },
          },
        ],
      },
      {
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Translations in Context\n\nWrite and describe translated functions based on real-world scenarios.\n\n### Step 1: Identify the Original Function and What Changes\n\nRead the problem to find:\n- The original function modeling the situation\n- What quantity increases or decreases\n\nFor example, if the cost to bowl is [ f(x) = 4x + 3.5 ] where [ 3.5 ] is a shoe rental fee, and the fee is removed:\n[\ng(x) = 4x \\quad \\text{or equivalently} \\quad g(x) = f(x) - 3.5\n]\n\n### Step 2: Describe the Translation\n\nDetermine whether the change represents a vertical or horizontal shift and state its direction and magnitude.\n\n- Removing a flat fee: vertical shift down by that amount\n- Adding a deposit: vertical shift up by that amount\n- Changing a starting balance: vertical shift up or down",
            },
          },
        ],
      },
      {
        title: "Learn: Dilations of Linear Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Dilations of Linear Functions\n\nA dilation stretches or compresses a graph, changing its steepness.\n\n### Key Concept: Vertical and Horizontal Dilations\n\n- **Vertical dilation:** [ g(x) = a \\cdot f(x) ] stretches vertically by factor [ |a| ] if [ |a| > 1 ], or compresses if [ 0 < |a| < 1 ] \n- **Horizontal dilation:** [ g(x) = f(bx) ] compresses horizontally by factor [ \\frac{1}{|b|} ] if [ |b| > 1 ], or stretches if [ 0 < |b| < 1 ] \n- For linear functions, a vertical stretch by [ a ] produces the same graph as a horizontal compression by [ a ] ",
            },
          },
        ],
      },
      {
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 5 — Describe Vertical Dilations\n\nDescribe how the graph of [ g(x) ] is related to the graph of the parent function [ f(x) = x ].\n\n### Step 1: Identify the Coefficient Location\n\nWhen the coefficient multiplies the entire function, the dilation is vertical.\n\nFor example:\n[\ng(x) = 5(x)\n]\nThe [ 5 ] is outside, so this is a vertical dilation.\n\n### Step 2: Determine Stretch or Compression\n\nCompare [ |a| ] to 1:\n\n[\ng(x) = 5(x) \\quad \\text{vertical stretch by a factor of 5}\n]\n[\ng(x) = \\frac{1}{3}(x) \\quad \\text{vertical compression by a factor of } \\frac{1}{3}\n]\n[\ng(x) = 1.5(x) \\quad \\text{vertical stretch by a factor of 1.5}\n]",
            },
          },
        ],
      },
      {
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 6 — Describe Horizontal Dilations\n\nDescribe how the graph of [ g(x) ] is related to the graph of the parent function when the coefficient is inside the function argument.\n\n### Step 1: Identify the Coefficient Location\n\nWhen the coefficient multiplies [ x ] inside the function, the dilation is horizontal.\n\nFor example:\n[\ng(x) = (3x)\n]\nThe [ 3 ] is inside with [ x ], so this is a horizontal dilation.\n\n### Step 2: Determine Stretch or Compression\n\nFor horizontal dilations, [ |b| > 1 ] gives a compression:\n\n[\ng(x) = (3x) \\quad \\text{horizontal compression by a factor of } \\frac{1}{3}\n]\n[\ng(x) = \\left(\\frac{3}{4}x\\right) \\quad \\text{horizontal stretch by a factor of } \\frac{4}{3}\n]\n[\ng(x) = (0.4x) \\quad \\text{horizontal stretch by a factor of } \\frac{1}{0.4} = 2.5\n]",
            },
          },
        ],
      },
      {
        title: "Worked Example 7",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 7 — Reflections Across the x-Axis\n\nDescribe how the graph of [ g(x) ] is related to the graph of the parent function when a negative coefficient is outside.\n\n### Step 1: Identify the Reflection\n\nA negative coefficient outside the function reflects the graph across the x-axis.\n\nFor example:\n[\ng(x) = -4(x)\n]\n\n### Step 2: State the Dilation and Reflection\n\n[\ng(x) = -4(x) \\quad \\text{reflected across the x-axis and vertically stretched by a factor of 4}\n]\n[\ng(x) = -8(x) \\quad \\text{reflected across the x-axis and vertically stretched by a factor of 8}\n]\n[\ng(x) = -\\frac{2}{3}(x) \\quad \\text{reflected across the x-axis and vertically compressed by a factor of } \\frac{2}{3}\n]",
            },
          },
        ],
      },
      {
        title: "Worked Example 8",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 8 — Reflections Across the y-Axis\n\nDescribe how the graph of [ g(x) ] is related to the graph of the parent function when a negative coefficient is inside with [ x ].\n\n### Step 1: Identify the Reflection\n\nA negative coefficient multiplying [ x ] inside the function reflects the graph across the y-axis.\n\nFor example:\n[\ng(x) = \\left(-\\frac{4}{5}x\\right)\n]\n\n### Step 2: State the Dilation and Reflection\n\n[\ng(x) = \\left(-\\frac{4}{5}x\\right) \\quad \\text{reflected across the y-axis and horizontally stretched by a factor of } \\frac{5}{4}\n]\n[\ng(x) = (-6x) \\quad \\text{reflected across the y-axis and horizontally compressed by a factor of } \\frac{1}{6}\n]\n[\ng(x) = (-1.5x) \\quad \\text{reflected across the y-axis and horizontally compressed by a factor of } \\frac{1}{1.5} = \\frac{2}{3}\n]",
            },
          },
        ],
      },
      {
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice with all transformation types. Students identify translations, dilations, and reflections from function rules; write transformed functions from verbal descriptions; and solve real-world problems involving rates, costs, and geometric quantities. The exercises also include reasoning questions that ask students to compare horizontal and vertical shifts, analyze the relationship between vertical and horizontal dilations, and justify which function does not belong in a given group.\n\n## Review Notes\n\n- The extracted worksheet contains image placeholders (`media/image1.png` through `media/image8.png`) that could not be described. These likely contain graphs of the parent function and transformed functions for problems 1–6, 10–21, and 22–27. Verify that graph images are available for the activity renderer.\n- The worksheet notation uses parentheses [ (x - h) ] and [ (bx) ] to denote horizontal transformations of the linear parent function. Confirm that the absolute value bars seen in the original printed worksheet are properly rendered if applicable.\n- Problems 34–36 are open-ended reasoning and creation tasks that may require free-response input or discussion prompts rather than auto-graded numeric answers.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-4-lesson-5",
    title: "Arithmetic Sequences",
    orderIndex: 5,
    description:
      "Determine whether a given sequence is arithmetic and justify the reasoning using the common difference. Find the common difference of an arithmetic sequence and extend it to find additional terms. Write an explicit equation for the nth term of an arithmetic sequence and use it to find specific terms. Model real-world situations with arithmetic sequences and use the resulting function to answer questions.",
    phases: [
      {
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Vocabulary\n\n- **Arithmetic sequence** — A sequence in which the difference between consecutive terms is constant.\n- **Common difference** — The constant difference [ d ] between any two consecutive terms in an arithmetic sequence.\n- **Explicit formula** — A formula that defines the [ n ]th term of a sequence directly in terms of [ n ], written as [ a_n = a_1 + (n - 1)d ].",
            },
          },
        ],
      },
      {
        title: "Learn: Identifying Arithmetic Sequences",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Identifying Arithmetic Sequences\n\nAn arithmetic sequence is identified by a constant difference between consecutive terms. To test whether a sequence is arithmetic, subtract each term from the term that follows it. If all differences are equal, the sequence is arithmetic.\n\n### Key Concept: Arithmetic Sequence Test\n\n- Subtract consecutive terms: [ a_2 - a_1 ], [ a_3 - a_2 ], [ a_4 - a_3 ], and so on.\n- If all differences equal the same value [ d ], the sequence is arithmetic.\n- If the differences are not equal, the sequence is not arithmetic.",
            },
          },
        ],
      },
      {
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Determine Whether a Sequence Is Arithmetic\n\nDetermine whether each given sequence is arithmetic. Justify the reasoning by examining the differences between consecutive terms.\n\n### Step 1: Compute Consecutive Differences\n\nFor a sequence such as [ -3, 1, 5, 9, \\ldots ], calculate:\n[\n1 - (-3) = 4, \\quad 5 - 1 = 4, \\quad 9 - 5 = 4\n]\n\nSince the difference is constant, the sequence is arithmetic with common difference [ d = 4 ].\n\nFor a sequence such as [ \\frac{1}{2}, \\frac{3}{4}, \\frac{5}{8}, \\frac{7}{16}, \\ldots ], calculate:\n[\n\\frac{3}{4} - \\frac{1}{2} = \\frac{1}{4}, \\quad \\frac{5}{8} - \\frac{3}{4} = -\\frac{1}{8}\n]\n\nThe differences are not equal, so the sequence is not arithmetic.\n\n### Step 2: State the Conclusion\n\n- If all differences are equal, state that the sequence is arithmetic and identify [ d ].\n- If the differences vary, state that the sequence is not arithmetic.",
            },
          },
        ],
      },
      {
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Find the Common Difference and Next Three Terms\n\nFind the common difference [ d ] of each arithmetic sequence, then use it to find the next three terms.\n\n### Step 1: Find the Common Difference\n\nSubtract any term from the term that follows it:\n[\nd = a_{n+1} - a_n\n]\n\nFor example, given [ 0.02, 1.08, 2.14, 3.2, \\ldots ]:\n[\nd = 1.08 - 0.02 = 1.06\n]\n\n### Step 2: Extend the Sequence\n\nAdd [ d ] repeatedly to the last known term to generate the next three terms:\n[\n3.2 + 1.06 = 4.26, \\quad 4.26 + 1.06 = 5.32, \\quad 5.32 + 1.06 = 6.38\n]\n\nVariations in the worksheet include sequences with:\n- Integer terms (e.g., [ 6, 12, 18, 24, \\ldots ])\n- Negative integer terms (e.g., [ 21, 19, 17, 15, \\ldots ])\n- Fractional terms (e.g., [ -\\frac{1}{2}, 0, \\frac{1}{2}, 1, \\ldots ])\n- Mixed-number terms (e.g., [ 2\\frac{1}{3}, 2\\frac{2}{3}, 3, 3\\frac{1}{3}, \\ldots ])\n- Decimal terms (e.g., [ 22, 19.5, 17, 14.5, \\ldots ])",
            },
          },
        ],
      },
      {
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Write an Equation and Find the 7th Term\n\nUse a given arithmetic sequence to write an explicit equation for the [ n ]th term, then find the 7th term.\n\n### Step 1: Identify [ a_1 ] and [ d ] \n\nFrom the sequence [ -3, -8, -13, -18, \\ldots ]:\n[\na_1 = -3, \\quad d = -8 - (-3) = -5\n]\n\n### Step 2: Write the Explicit Formula\n\nSubstitute into [ a_n = a_1 + (n - 1)d ]:\n[\na_n = -3 + (n - 1)(-5) = -3 - 5n + 5 = 2 - 5n\n]\n\n### Step 3: Find the 7th Term\n\nEvaluate at [ n = 7 ]:\n[\na_7 = 2 - 5(7) = 2 - 35 = -33\n]",
            },
          },
        ],
      },
      {
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Model Real-World Situations with Arithmetic Sequences\n\nCreate a function to represent an arithmetic sequence modeling a real-world scenario, graph the function, and use it to answer a question.\n\n### Step 1: Define the Function\n\nIdentify the first term [ a_1 ] (the initial value at [ n = 1 ]) and the common difference [ d ] (the constant rate of change). Write the function in the form:\n[\nf(n) = a_1 + (n - 1)d\n]\n\nFor example, a 128-ounce cooler loses 4 ounces per cup handed out:\n[\na_1 = 128, \\quad d = -4, \\quad f(n) = 128 + (n - 1)(-4) = 132 - 4n\n]\n\n### Step 2: Graph the Function\n\nGraph the discrete points [ (n, f(n)) ] for positive integer values of [ n ]. The points lie on a line with slope [ d ] and a [ y ]-intercept determined by the explicit form.\n\n### Step 3: Answer the Question\n\nSubstitute the given value into the function and solve. For example, to find the water remaining after the 14th cup:\n[\nf(14) = 132 - 4(14) = 132 - 56 = 76\n]\n\nScenarios in the worksheet include:\n- Water remaining in a cooler as cups are handed out\n- Theater seats per row increasing by a fixed amount\n- Postage cost increasing by a fixed amount per additional ounce\n- Video download cost increasing by a fixed amount per episode\n- Weekly push-up count increasing by a fixed amount each week",
            },
          },
        ],
      },
      {
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice across all skills in this lesson. Problem types include:\n\n- Determining whether a sequence is arithmetic and justifying the argument (similar to Example 1)\n- Writing an explicit equation for the [ n ]th term of a given sequence and graphing the first five terms (similar to Examples 2 and 3)\n- Solving word problems by modeling with arithmetic sequences and using the explicit formula\n- Analyzing well-known sequences (such as the Fibonacci sequence) to determine whether they are arithmetic\n- Using the structure of an arithmetic sequence to find a specific term\n- Creating original arithmetic sequences with given properties\n- Determining a variable value that makes a set of expressions form an arithmetic sequence\n- Comparing two arithmetic sequences in a real-world context and using tables and graphs to find when two quantities are equal\n\n## Review Notes\n\n- Exercise 25 references a table showing postage costs for weights up to 5 ounces (image: `media/image1.png`). The table data should be reviewed to ensure the values are correctly incorporated into the curriculum.\n- Exercises 44–46 reference a table showing Sam's daily reading progress (image: `media/image2.png`). The table data should be reviewed for accuracy.\n- Exercise 46 references a coordinate plane for sketching graphs (image: `media/image3.png`). A blank coordinate plane should be provided for student use.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-4-lesson-6",
    title: "Piecewise and Step Functions",
    orderIndex: 6,
    description:
      "Graph piecewise-defined functions and identify their domain and range. Graph step functions (greatest integer functions) and identify their domain and range. Model real-world situations using piecewise-linear and step functions. Write piecewise and step functions from tables, graphs, and verbal descriptions.",
    phases: [
      {
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Vocabulary\n\n- **Piecewise-defined function** — A function defined by different expressions over different intervals of its domain.\n- **Step function** — A piecewise function whose graph resembles a set of steps; the output values are constant over intervals of the input.\n- **Greatest integer function** — The step function [ f(x) = \\llbracket x \\rrbracket ], which returns the greatest integer less than or equal to [ x ]; also called the floor function.\n- **Domain** — The set of all possible input values ([ x ]-values) for a function.\n- **Range** — The set of all possible output values ([ f(x) ]-values) for a function.",
            },
          },
        ],
      },
      {
        title: "Learn: Piecewise-Defined Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Piecewise-Defined Functions\n\nA piecewise-defined function uses different rules for different parts of its domain. To graph a piecewise function, graph each piece over its specified interval only, paying attention to whether endpoints are included (closed circle) or excluded (open circle).\n\n### Key Concept: Graphing Piecewise Functions\n\n- Identify the boundary value where the expression changes.\n- Graph each linear piece over its specified interval.\n- Use an open circle at an endpoint if the inequality is strict ([ > ] or [ < ]).\n- Use a closed circle at an endpoint if the inequality includes equality ([ \\ge ] or [ \\le ]).\n- State the domain as the union of all intervals and the range from the resulting [ y ]-values.",
            },
          },
        ],
      },
      {
        title: "Learn: Step Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Step Functions\n\nStep functions are a special type of piecewise function where the output is constant over intervals of the input. The greatest integer function is the most common example.\n\n### Key Concept: Transformations of the Greatest Integer Function\n\n- Vertical stretch: [ f(x) = a \\llbracket x \\rrbracket ] changes the height of each step.\n- Vertical shift: [ f(x) = \\llbracket x \\rrbracket + k ] moves the graph up or down.\n- Reflection: [ f(x) = -\\llbracket x \\rrbracket ] or [ f(x) = \\llbracket -x \\rrbracket ] reflects the graph.\n- The domain of any greatest integer function is all real numbers.\n- The range is a set of discrete values (integers or scaled integers).",
            },
          },
        ],
      },
      {
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Graph Piecewise-Defined Functions\n\nGraph piecewise-defined linear functions and state the domain and range for each.\n\n### Step 1: Identify the Pieces and Boundaries\n\nFor a function such as:\n\n[\nf(x) = \\begin{cases} \\frac{1}{2}x - 1 & \\text{if } x > 3 \\\\ -2x + 3 & \\text{if } x \\le 3 \\end{cases}\n]\n\nIdentify the two linear expressions and the boundary at [ x = 3 ].\n\n### Step 2: Graph Each Piece\n\nGraph [ y = \\frac{1}{2}x - 1 ] only for [ x ]-values greater than 3, using an open circle at [ x = 3 ].\n\nGraph [ y = -2x + 3 ] only for [ x ]-values less than or equal to 3, using a closed circle at [ x = 3 ].\n\n### Step 3: State Domain and Range\n\n- Domain: All real numbers, [ (-\\infty, \\infty) ] \n- Range: Determine the [ y ]-values produced by each piece and combine them.",
            },
          },
        ],
      },
      {
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Graph Step Functions\n\nGraph step functions involving the greatest integer function and state the domain and range for each.\n\n### Step 1: Identify the Transformation\n\nRecognize the form of the function:\n\n- [ f(x) = 3\\llbracket x \\rrbracket ] — vertical stretch by a factor of 3\n- [ f(x) = \\llbracket -x \\rrbracket ] — reflection across the [ y ]-axis\n- [ g(x) = \\llbracket x \\rrbracket + 3 ] — vertical shift up 3 units\n- [ h(x) = \\frac{1}{2}\\llbracket x \\rrbracket + 1 ] — vertical compression by [ \\frac{1}{2} ] and shift up 1\n\n### Step 2: Graph the Steps\n\nDraw horizontal segments of length 1. At each integer, place a closed circle on the left and an open circle on the right (or adjust for reflections). Apply any stretches, compressions, or shifts.\n\n### Step 3: State Domain and Range\n\n- Domain: All real numbers, [ (-\\infty, \\infty) ] \n- Range: All integer multiples of the stretch factor, shifted vertically if applicable.",
            },
          },
        ],
      },
      {
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Model Real-World Situations with Step Functions\n\nUse step functions to model situations where quantities are rounded or charged in discrete intervals.\n\n### Step 1: Understand the Rounding Rule\n\nRead the problem to determine how fractions are handled. For example, rounding every fraction of an hour up to the next half-hour means the charge increases in half-hour steps.\n\n### Step 2: Define the Variables and Step Size\n\n- Let [ x ] represent the input quantity (hours, pounds, boxes, etc.).\n- Let [ y ] or [ f(x) ] represent the output (cost, earnings, cases needed, etc.).\n- Determine the step size based on the rounding rule.\n\n### Step 3: Draw the Graph\n\nDraw horizontal segments with jumps at the boundary values. Use closed circles where the higher value applies and open circles where the lower value ends.",
            },
          },
        ],
      },
      {
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nThe mixed exercises provide practice across all lesson skills:\n\n- **Piecewise-linear functions from tables:** Given a table of shipping costs by weight, write a piecewise-linear function, state the domain and range, and answer application questions.\n- **Piecewise earnings models:** Given a dual pay rate, organize information in a table, write a piecewise equation, and graph daily earnings.\n- **Writing step functions from graphs:** Analyze a given graph and write the corresponding step function using greatest integer notation.\n- **Evaluating step functions:** Substitute values into transformed greatest integer functions such as [ f(x) = 2\\llbracket x - 1 \\rrbracket ] and simplify.\n- **Step function word problems:** Calculate costs when fractions of days or hours are rounded up to the next whole unit.\n- **Piecewise functions from tables:** Write a piecewise-linear cost function from a pricing table, graph it, and use it to find specific costs.\n- **Step function tables and graphs:** Complete a table for a repair pricing model, write the step function, graph it, and solve for an unknown input given an output.\n- **Piecewise functions from graphs:** Analyze a graph with multiple linear segments, write the piecewise function, identify domain and range, and evaluate the function at specific points.\n- **Conceptual questions:** Create an original piecewise-defined function, identify errors in reasoning about step functions, explain differences between step and piecewise functions, and analyze whether a given piecewise relation represents a function.\n\n## Review Notes\n\n- The original worksheet contains numerous blank graph grids (image placeholders) for student graphing. These cannot be described in text; digital activities should provide an interactive graphing canvas or pre-plotted coordinate grid.\n- Problems 13, 14, 16, 20, 21, and 22 reference tables and graphs in the original document that are represented as image placeholders. The tabular data should be extracted and presented as structured tables in any digital implementation.\n- Problems 17 and 27–31 refer to graphs that students must analyze. Descriptions of these graphs (key points, segments, open/closed circles) would need to be provided or replaced with interactive graph elements.\n- Problem 26 asks students to analyze whether a piecewise relation is a function, noting that the two pieces overlap in their domain conditions.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-4-lesson-7",
    title: "Absolute Value Functions",
    orderIndex: 7,
    description:
      "Describe translations, dilations, and reflections of absolute value functions from their equations. Write the equation of an absolute value function given its graph. Graph absolute value functions and state their domain and range. Model real-world situations using absolute value functions.",
    phases: [
      {
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Vocabulary\n\n- **Absolute value function** — A function of the form [ f(x) = a|x - h| + k ], where [ a ], [ h ], and [ k ] are constants and [ a \\neq 0 ].\n- **Parent function** — The simplest form of a function in a family, [ f(x) = |x| ] for absolute value functions.\n- **Translation** — A shift of a graph horizontally, vertically, or both without changing its shape or orientation.\n- **Dilation** — A transformation that stretches or compresses a graph vertically or horizontally.\n- **Reflection** — A transformation that flips a graph across an axis, producing a mirror image.\n- **Domain** — The set of all possible input values ([ x ]) for a function.\n- **Range** — The set of all possible output values ([ y ]) for a function.",
            },
          },
        ],
      },
      {
        title: "Learn: Transformations of Absolute Value Functions",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Transformations of Absolute Value Functions\n\nThe general form of an absolute value function is:\n\n[\ng(x) = a|x - h| + k\n]\n\nEach parameter transforms the parent graph [ f(x) = |x| ] in a specific way.\n\n### Key Concept: Transformations of Absolute Value Functions\n\n- **Horizontal translation:** [ h ] shifts the graph right if [ h > 0 ] and left if [ h < 0 ].\n- **Vertical translation:** [ k ] shifts the graph up if [ k > 0 ] and down if [ k < 0 ].\n- **Vertical stretch/compression:** [ |a| > 1 ] stretches the graph vertically; [ 0 < |a| < 1 ] compresses it vertically.\n- **Horizontal stretch/compression:** [ |a| > 1 ] inside the absolute value with [ x ] compresses horizontally; [ 0 < |a| < 1 ] stretches horizontally.\n- **Reflection:** If [ a < 0 ], the graph reflects across the [ x ]-axis. If [ x ] is replaced by [ -x ], the graph reflects across the [ y ]-axis.\n- The vertex of the transformed graph is at [ (h, k) ].",
            },
          },
        ],
      },
      {
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Describe Translations\n\nGiven an absolute value function in the form [ g(x) = |x - h| + k ], describe how the graph is translated from the parent function [ f(x) = |x| ].\n\n### Step 1: Identify Horizontal Shift\n\nLook at the expression inside the absolute value. For [ g(x) = |x + 6| ], rewrite as [ |x - (-6)| ] to see the horizontal shift.\n\n[\ng(x) = |x - h| + k\n]\n\n- [ h ] determines the horizontal shift.\n\n### Step 2: Identify Vertical Shift\n\nLook at the constant outside the absolute value. For [ g(x) = |x| - 5 ], the value [ k = -5 ] indicates a vertical shift.\n\n- [ k ] determines the vertical shift.\n\n### Step 3: Describe the Translation\n\nState the shift in words. For example, [ g(x) = |x - 2| + 7 ] is translated 2 units right and 7 units up from the parent function.",
            },
          },
        ],
      },
      {
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 2 — Write the Equation from a Graph\n\nGiven the graph of an absolute value function, determine its equation in the form [ g(x) = a|x - h| + k ].\n\n### Step 1: Locate the Vertex\n\nIdentify the vertex [ (h, k) ] from the graph.\n\n### Step 2: Determine the Value of a\n\nUse another point on the graph and substitute into the equation to solve for [ a ].\n\n[\ny = a|x - h| + k\n]\n\nFor example, if the vertex is [ (3, 1) ] and the point [ (4, 3) ] lies on the graph:\n\n[\n3 = a|4 - 3| + 1 \\implies 3 = a + 1 \\implies a = 2\n]\n\n### Step 3: Write the Equation\n\nSubstitute [ a ], [ h ], and [ k ] into [ g(x) = a|x - h| + k ].",
            },
          },
        ],
      },
      {
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 3 — Describe Dilations\n\nGiven an absolute value function with a coefficient inside or outside the absolute value, describe the dilation from the parent function.\n\n### Step 1: Identify Vertical Dilation\n\nWhen the coefficient is outside the absolute value, such as [ g(x) = \\frac{2}{5}|x| ] or [ g(x) = 1.3|x| ], the graph is vertically stretched or compressed by the factor [ |a| ].\n\n### Step 2: Identify Horizontal Dilation\n\nWhen the coefficient is inside the absolute value, such as [ g(x) = |3x| ] or [ g(x) = \\left|\\frac{1}{6}x\\right| ], the graph is horizontally compressed or stretched. A coefficient [ b ] inside gives a horizontal compression by [ \\frac{1}{|b|} ] if [ |b| > 1 ], or stretch by [ \\frac{1}{|b|} ] if [ 0 < |b| < 1 ].",
            },
          },
        ],
      },
      {
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 4 — Describe Combined Transformations\n\nGiven an absolute value function involving reflection, dilation, and translation, describe all transformations from the parent function.\n\n### Step 1: Identify Reflections\n\n- If [ a < 0 ], the graph reflects across the [ x ]-axis.\n- If [ x ] is replaced by [ -x ] inside the absolute value, the graph reflects across the [ y ]-axis.\n\nFor example, [ g(x) = -3|x| ] reflects across the [ x ]-axis and vertically stretches by a factor of 3.\n\n### Step 2: Identify Dilations\n\nDetermine the stretch or compression factor from the coefficient.\n\n### Step 3: Identify Translations\n\nDetermine any horizontal and vertical shifts from [ h ] and [ k ].\n\nFor [ g(x) = -|x - 7| + 3 ], the graph reflects across the [ x ]-axis, shifts 7 units right, and shifts 3 units up.",
            },
          },
        ],
      },
      {
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 5 — Graph Absolute Value Functions and State Domain and Range\n\nGraph an absolute value function that includes translations, dilations, and/or reflections, then state the domain and range.\n\n### Step 1: Identify the Vertex\n\nFrom [ g(x) = a|x - h| + k ], the vertex is at [ (h, k) ].\n\n### Step 2: Plot Additional Points\n\nChoose [ x ]-values on either side of the vertex and compute [ y ]. Account for the stretch or compression factor.\n\nFor [ g(x) = |x + 2| + 3 ], the vertex is [ (-2, 3) ].\n\n### Step 3: Draw the Graph\n\nDraw a V-shaped graph with the vertex at the identified point. The slopes of the two rays depend on [ a ].\n\n### Step 4: State Domain and Range\n\n- Domain: All real numbers, [ (-\\infty, \\infty) ] \n- Range: If [ a > 0 ], [ y \\ge k ]; if [ a < 0 ], [ y \\le k ] \n\nFor example, for [ h(x) = -2|x - 3| + 2 ], the range is [ y \\le 2 ].",
            },
          },
        ],
      },
      {
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 6 — Model with Absolute Value Functions\n\nWrite an absolute value function that models a real-world situation involving a target value and a tolerance.\n\n### Step 1: Identify the Target and Tolerance\n\nDetermine the ideal or target value (the vertex) and how much deviation is allowed.\n\n### Step 2: Write the Equation\n\nUse the form [ y = |x - h| + k ] or an equation comparing the absolute difference to a tolerance. For example, if a bag should contain 16 ounces and the difference cannot exceed [ x ] ounces:\n\n[\n|s - 16| \\le x\n]\n\nwhere [ s ] is the actual amount.\n\n### Step 3: Interpret the Results\n\nSolve to find the maximum and minimum acceptable values.",
            },
          },
        ],
      },
      {
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 20,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice with all transformation types and modeling. Problems include:\n\n- Graphing functions, stating domain and range, and describing how each graph relates to its parent graph.\n- Writing equations from given graphs.\n- Modeling real-world scenarios such as manufacturing tolerances (sunflower seeds, cereal boxes), travel time to a destination, a scuba diver's elevation, and a bicycle racer's distance from a start line.\n- Writing an absolute value function as a piecewise-defined function.\n- Creating an original absolute value function meeting given domain and range constraints.\n\n## Review Notes\n\n- Problems 7–12 require images of graphs that were not described in the source extraction. These graphs show V-shaped absolute value functions with various vertices, orientations, and steepness. A human reviewer should verify the exact vertices and slopes depicted.\n- Problem involving Example 15 (image7.png) requires an image that was not described in the source extraction. A human reviewer should supply the situation details from the original worksheet.\n- Problems 39–42 require images of graphs that were not described in the source extraction.",
            },
          },
        ],
      },
    ],
  },
];

export const seedModule4Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule4Result> => {
    const now = Date.now();
    let totalPhases = 0;
    const lessonIds: Id<"lessons">[] = [];

    for (const lesson of LESSONS) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 4,
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            orderIndex: lesson.orderIndex,
            createdAt: now,
            updatedAt: now,
          });

      lessonIds.push(lessonId);

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

      for (const phase of lesson.phases) {
        const existingPhase = await ctx.db
          .query("phase_versions")
          .withIndex("by_lesson_version_and_phase", (q) =>
            q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", lesson.phases.indexOf(phase) + 1)
          )
          .first();

        if (existingPhase) continue;

        const phaseId = await ctx.db.insert("phase_versions", {
          lessonVersionId,
          phaseNumber: lesson.phases.indexOf(phase) + 1,
          title: phase.title,
          estimatedMinutes: phase.estimatedMinutes,
          phaseType: phase.phaseType,
          createdAt: now,
        });

        totalPhases++;

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
      lessonsCreated: LESSONS.length,
      lessonIds,
      totalPhases,
    };
  },
});