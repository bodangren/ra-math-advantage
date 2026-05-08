import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule9LessonsResult {
  lessons: Array<{
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    phasesCreated: number;
    activitiesCreated: number;
  }>;
}

const LESSONS = [
  {
    slug: "module-9-lesson-1",
    title: "Measures of Center",
    description:
      "Calculate the mean, median, and mode of a data set. Determine the percentile rank of a data value. Analyze how outliers and data changes affect each measure of center.",
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
                "## Key Terms\n\n" +
                "* **Mean** — The arithmetic average of a data set, found by summing all values and dividing by the number of values.\n" +
                "* **Median** — The middle value of an ordered data set; for an even number of values, it is the average of the two middle values.\n" +
                "* **Mode** — The value that occurs most frequently in a data set.\n" +
                "* **Percentile Rank** — The percentage of values in a data set that are less than or equal to a given value.\n" +
                "* **Outlier** — A data value that is substantially larger or smaller than most other values in the set.",
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
                "## Explore: What Is a \"Typical\" Value?\n\n" +
                "Students discuss what it means for a value to be \"typical\" or \"average\" for a group. They consider a data set with one very large or very small value and debate whether the mean, median, or mode best represents the group.\n\n" +
                "**Inquiry Question:** How can different measures of center give very different pictures of the same data set?",
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
                "## Learn: Measures of Center\n\n" +
                "The three main measures of center describe the \"typical\" value in a data set in different ways.\n\n" +
                "### Key Concept: Mean, Median, and Mode\n\n" +
                "* **Mean** — Add all values and divide by the number of values.\n" +
                "\n" +
                "  \\bar{x} = \\frac{\\sum x_i}{n}\n" +
                "\n" +
                "* **Median** — Arrange values in order from least to greatest. If there is an odd number of values, the median is the middle one. If there is an even number, the median is the mean of the two middle values.\n" +
                "* **Mode** — Identify the value that appears most often. A data set can have one mode, more than one mode, or no mode.\n\n" +
                "### Key Concept: Percentile Rank\n\n" +
                "The percentile rank of a value tells you what percentage of the data falls at or below that value.\n\n" +
                "\n" +
                "\\text{Percentile Rank} = \\frac{\\text{number of values less than the selected value}}{\\text{total number of values}} \\times 100\n" +
                "\n",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Find Mean, Median, and Mode\n\n" +
                "Given a data set, find all three measures of center.\n\n" +
                "### Step 1: Order the Data\n\n" +
                "List the values from least to greatest. This makes the median and mode easier to identify.\n\n" +
                "### Step 2: Compute the Mean\n\n" +
                "Add all values and divide by the count.\n\n" +
                "Representative data set:\n" +
                "\n" +
                "\\{17,\\; 11,\\; 8,\\; 15,\\; 28,\\; 20,\\; 10,\\; 16\\}\n" +
                "\n" +
                "Mean:\n" +
                "\n" +
                "\\bar{x} = \\frac{8 + 10 + 11 + 15 + 16 + 17 + 20 + 28}{8} = \\frac{125}{8} = 15.625\n" +
                "\n" +
                "### Step 3: Find the Median\n\n" +
                "With 8 ordered values, the median is the average of the 4th and 5th values:\n" +
                "\n" +
                "\\text{Median} = \\frac{15 + 16}{2} = 15.5\n" +
                "\n" +
                "### Step 4: Identify the Mode\n\n" +
                "Look for the most frequently occurring value. In this data set, every value appears once, so there is no mode.\n\n" +
                "Variations include data sets with decimals, repeated values, and real-world contexts (weights, speeds, ratings).",
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
                "## Example 2 — Find Percentile Rank\n\n" +
                "Given a ranked distribution of scores, determine the percentile rank for a specific data value.\n\n" +
                "### Step 1: Count Values Below the Selected Score\n\n" +
                "Determine how many scores in the distribution are strictly less than the value of interest.\n\n" +
                "### Step 2: Apply the Percentile Rank Formula\n\n" +
                "\n" +
                "\\text{Percentile Rank} = \\frac{\\text{number of values below}}{\\text{total number of values}} \\times 100\n" +
                "\n" +
                "Representative problem: In a competition of 12 marching bands with scores from 0 to 100, a band's percentile rank is found by counting how many of the 12 bands scored lower and multiplying that fraction by 100.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Mixed Exercises",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\n" +
                "The mixed exercises integrate all skills from the lesson and extend them through reasoning, real-world applications, and error analysis. Problem types include:\n\n" +
                "* Computing mean, median, and mode for tabular and contextual data (football weights, basketball points, bowling scores, novel lengths, volunteer hours, laptop prices).\n" +
                "* Finding percentile ranks in competition and ranking contexts (singing, dance, band, sports medals).\n" +
                "* Reasoning about why the mean and median differ, including the effect of outliers and skewed data.\n" +
                "* Determining an unknown data value needed to achieve a target mean and median.\n" +
                "* Analyzing how adding, removing, or multiplying all values affects each measure of center.\n" +
                "* Evaluating statements about percentile rank and identifying errors in reasoning.\n" +
                "* Constructing a data set that satisfies given mean, median, and mode conditions.\n" +
                "* Choosing the best measure of center for a given situation and justifying the choice.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n" +
                "* **Image references (media/image1.png through media/image10.png)** — The worksheet contains images and diagrams whose content could not be fully extracted as text. Key images include:\n" +
                "  * Image1, image2 — Likely blank work spaces for problems 1–4.\n" +
                "  * Image3 — Marching band competition score chart for problems 10–12.\n" +
                "  * Image4 — Basketball points table for problem 19.\n" +
                "  * Image5 — Laptop prices table for problem 24.\n" +
                "  * Image6 — Novel lengths table for problem 25.\n" +
                "  * Image7 — Volunteer hours table for problem 26.\n" +
                "  * Image8 — Pet adoptions table for problem 28.\n" +
                "  * Image9 — Bowling scores table for problem 30.\n" +
                "  * Image10 — \"Which One Doesn't Belong\" options for problem 36.\n" +
                "  A human reviewer should verify that all tables and charts are correctly represented or transcribed into the digital curriculum.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-9-lesson-2",
    title: "Representing Data",
    description:
      "Construct dot plots, bar graphs, and histograms to represent data sets. Distinguish between discrete and continuous data and select the appropriate display.",
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
                "## Key Terms\n\n" +
                "* **Dot Plot** — A data display that uses dots over a number line to show the frequency of each value.\n" +
                "* **Bar Graph** — A display that uses bars of different heights to compare categories of data.\n" +
                "* **Histogram** — A display that uses bars to show the frequency of data values grouped into intervals.\n" +
                "* **Discrete Data** — Data that can only take specific, separate values (usually counts).\n" +
                "* **Continuous Data** — Data that can take any value within a range (usually measurements).",
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
                "## Explore: Which Graph Best Tells the Story?\n\n" +
                "Students examine a small data set and discuss which visual display — a list, a dot plot, a bar graph, or a histogram — makes patterns easiest to see. They consider how the type of data (categorical vs. numerical, discrete vs. continuous) affects the choice.\n\n" +
                "**Inquiry Question:** Why does the type of data determine which display is most appropriate?",
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
                "## Learn: Choosing a Data Display\n\n" +
                "Different types of data require different displays. The choice depends on whether the data are categorical or numerical, and whether they are discrete or continuous.\n\n" +
                "### Key Concept: Data Display Selection\n\n" +
                "* Use a **dot plot** for small numerical data sets where individual values matter.\n" +
                "* Use a **bar graph** for categorical data or discrete numerical data with distinct categories.\n" +
                "* Use a **histogram** for continuous numerical data or large data sets grouped into intervals.\n" +
                "* Always scale the number line appropriately so all data fit and patterns are visible.",
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
                "## Example 1 — Make a Dot Plot from a Table\n\n" +
                "### Step 1: Identify the Data Values\n\n" +
                "Read the data from the given table. List each distinct value and its frequency.\n\n" +
                "### Step 2: Draw and Scale the Number Line\n\n" +
                "Create a number line that includes all data values. Choose a scale with equal intervals so every value has a place.\n\n" +
                "### Step 3: Place Dots Above Each Value\n\n" +
                "For each occurrence of a value, place one dot above that value on the number line. Stack dots vertically when a value appears more than once.\n\n" +
                "\n" +
                "\\text{value} \\rightarrow \\text{dot count} = \\text{frequency}\n" +
                "\n",
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
                "## Example 2 — Make a Dot Plot from a List\n\n" +
                "### Step 1: Organize the Data\n\n" +
                "Arrange the given list of numerical values in order from least to greatest to identify the range.\n\n" +
                "### Step 2: Scale the Number Line\n\n" +
                "Set the number line from slightly below the minimum value to slightly above the maximum value. Use consistent tick marks.\n\n" +
                "### Step 3: Plot Each Value\n\n" +
                "Place a dot above the corresponding value on the number line for each data point. Stacked dots show repeated values.\n\n" +
                "\n" +
                "21,\\ 22,\\ 23,\\ 24,\\ 25,\\ 27,\\ 28,\\ 35,\\ 37,\\ 38,\\ 41,\\ 42,\\ 43,\\ 45,\\ 50\n" +
                "\n",
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
                "## Example 3 — Make a Bar Graph from a Survey\n\n" +
                "### Step 1: Identify Categories and Frequencies\n\n" +
                "Read the survey results to determine each category and how many responses it received.\n\n" +
                "### Step 2: Draw and Label the Axes\n\n" +
                "Label the horizontal axis with the category names. Label the vertical axis with frequency (number of responses). Choose a scale for the vertical axis that fits the largest frequency.\n\n" +
                "### Step 3: Draw the Bars\n\n" +
                "Draw a bar for each category. Bars should have equal width and be separated by gaps. The height of each bar matches its frequency.\n\n" +
                "\n" +
                "\\text{bar height} = \\text{frequency of category}\n" +
                "\n",
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
                "## Example 4 — Discrete vs. Continuous Data and Graph Selection\n\n" +
                "### Step 1: Determine the Data Type\n\n" +
                "Decide whether the data are discrete or continuous:\n\n" +
                "* **Discrete:** Counts of whole, separate items (e.g., number of students, number of movies).\n" +
                "* **Continuous:** Measurements that can take any value in a range (e.g., height, weight, age as a measurement).\n\n" +
                "### Step 2: Choose the Appropriate Graph\n\n" +
                "* For **discrete** categorical data, use a **bar graph**.\n" +
                "* For **continuous** numerical data, use a **histogram**.\n\n" +
                "### Step 3: Construct the Graph\n\n" +
                "Draw the axes, label them, scale appropriately, and create bars to represent the data.\n\n" +
                "\n" +
                "\\text{discrete} \\rightarrow \\text{bar graph} \\qquad \\text{continuous} \\rightarrow \\text{histogram}\n" +
                "\n",
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
                "## Example 5 — Bar Graph or Histogram?\n\n" +
                "### Step 1: Analyze the Data Structure\n\n" +
                "Examine whether the data represent distinct categories (bar graph) or intervals of numerical values (histogram).\n\n" +
                "### Step 2: Select and Construct the Display\n\n" +
                "If the data are grouped by age ranges or other intervals, use a histogram with touching bars. If the data are separate counts by distinct group, use a bar graph with gaps between bars.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Mixed Exercises",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\n" +
                "The mixed exercises provide practice across all data display types. Problems include:\n\n" +
                "* Determining whether data are discrete or continuous and selecting the appropriate graph.\n" +
                "* Constructing dot plots, bar graphs, and histograms from tables and lists.\n" +
                "* Interpreting data displays to answer questions about frequency, range, and intervals.\n" +
                "* Analyzing dot plots and bar graphs to draw conclusions about a data set.\n" +
                "* Explaining when histograms are the best model and why scaling is necessary for dot plots.\n" +
                "* Comparing bar graphs and histograms by explaining their similarities and differences.",
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n" +
                "* **Image 1 (media/image1.png):** Table showing number of books read by students — contains the data set for Example 1.\n" +
                "* **Image 2 (media/image2.png):** Blank number line for quiz scores — template for Example 2 dot plot.\n" +
                "* **Image 3 (media/image3.png):** Table showing field trip destination survey results — contains data for Example 3.\n" +
                "* **Image 4 (media/image4.png):** Table showing number of prizes won at a carnival — contains data for Mixed Exercise 6.\n" +
                "* **Image 5 (media/image5.png):** Table showing number of movies released theatrically each year — contains data for Mixed Exercise 8.\n" +
                "* **Image 6 (media/image6.png):** Dot plot showing product ratings — needed for Mixed Exercise 13 analysis.\n" +
                "* **Image 7 (media/image7.png):** Double bar graph about peanut butter sales — needed for Mixed Exercise 16 conclusions.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-9-lesson-3",
    title: "Using Data",
    description:
      "Identify sample bias in survey and sampling methods. Recognize biased survey questions. Calculate and compare measures of center. Evaluate whether graphs misrepresent data.",
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
                "## Key Terms\n\n" +
                "* **Population** — The entire group of individuals or items that a researcher wants to know about.\n" +
                "* **Sample** — A subset of the population selected to represent the whole group in a survey or study.\n" +
                "* **Bias** — A systematic distortion in a sample or question that favors a particular outcome.\n" +
                "* **Mean** — The average of a data set, found by summing all values and dividing by the number of values.\n" +
                "* **Median** — The middle value of a data set when values are arranged in order.\n" +
                "* **Mode** — The value that appears most frequently in a data set.\n" +
                "* **Outlier** — A data value that is much greater or much less than the other values in the set.",
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
                "## Explore: Can Statistics Be Misleading?\n\n" +
                "Students look at a news headline based on survey data and discuss whether the headline is fair. They consider who was surveyed, how the question was worded, and whether the graph's scale might change the story.\n\n" +
                "**Inquiry Question:** How can the way data is collected or displayed change what people believe about it?",
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
                "## Learn: Sampling and Survey Bias\n\n" +
                "Understanding how data is collected is just as important as analyzing the data itself. A biased sample or a leading question can produce misleading conclusions.\n\n" +
                "### Key Concept: Sampling Bias\n\n" +
                "* A sample is biased when some members of the population are more likely to be included than others.\n" +
                "* Bias can arise from where, when, and how a sample is chosen.\n" +
                "* An unbiased sample should represent the whole population fairly.\n\n" +
                "### Key Concept: Survey Question Bias\n\n" +
                "* Questions that suggest a desired answer or include emotional language are biased.\n" +
                "* The placement of a question or surrounding content can also introduce bias.\n" +
                "* Biased questions may serve the interests of a particular group or viewpoint.\n\n" +
                "## Learn: Measures of Center\n\n" +
                "Different measures of center describe a data set in different ways. Choosing the right one depends on the data values and whether outliers are present.\n\n" +
                "### Key Concept: Mean, Median, and Mode\n\n" +
                "* The mean is sensitive to outliers; a single extreme value can pull the mean up or down significantly.\n" +
                "* The median is resistant to outliers and is often a better measure when the data contains extreme values.\n" +
                "* The mode is useful for categorical data or when identifying the most common value matters.\n\n" +
                "### Key Concept: Effects of Transformations on Data\n\n" +
                "* Adding a constant to every data value increases the mean and median by that same constant.\n" +
                "* The mode also shifts by the same constant if it was a single value.",
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
                "## Example 1 — Identify Sample Bias\n\n" +
                "Given a survey scenario, determine the intended population and identify potential bias in the sampling method. Then describe how to choose an unbiased sample.\n\n" +
                "### Step 1: Identify the Population\n\n" +
                "Determine the entire group the researcher wants to study.\n\n" +
                "### Step 2: Analyze the Sampling Method\n\n" +
                "Evaluate whether the sampling method gives every member of the population an equal chance of being selected. Consider where and when the survey is conducted.\n\n" +
                "*Example:* Surveying only students leaving basketball practice to find the favorite sport of all students introduces bias because athletes are overrepresented.\n\n" +
                "### Step 3: Design an Unbiased Sample\n\n" +
                "Describe a method that represents the population fairly, such as random sampling across grade levels or locations within the population.",
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
                "## Example 2 — Identify Survey Question Bias\n\n" +
                "Analyze survey questions and the context in which they appear to identify potential bias. Determine whose interests may be served by a biased question.\n\n" +
                "### Step 1: Read the Question Carefully\n\n" +
                "Look for leading phrases, emotional language, or assumptions that suggest a preferred answer.\n\n" +
                "*Example:* \"Music education enriches student learning. Do you support music education in schools?\" uses a leading premise that encourages a positive response.\n\n" +
                "### Step 2: Consider Contextual Bias\n\n" +
                "Examine where the question appears. Placement next to an opinion piece or advertisement can influence responses.\n\n" +
                "*Example:* A poll about mayoral candidates placed on the same page as an opinion piece supporting one candidate introduces contextual bias.\n\n" +
                "### Step 3: Identify Whose Interests Are Served\n\n" +
                "Determine which group or viewpoint benefits from the biased wording or placement.",
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
                "## Example 3 — Calculate and Choose Measures of Center\n\n" +
                "For a given data set, calculate the mean, median, and mode. Determine which measure(s) most accurately summarize the data, especially in the presence of outliers.\n\n" +
                "### Step 1: Calculate the Mean\n\n" +
                "Sum all data values and divide by the number of values.\n\n" +
                "\n" +
                "\\text{mean} = \\frac{1 + 8 + 2 + 2 + 5 + 6 + 4}{7}\n" +
                "\n" +
                "### Step 2: Find the Median\n\n" +
                "Arrange the data in order and identify the middle value.\n\n" +
                "\n" +
                "1,\\ 2,\\ 2,\\ 4,\\ 5,\\ 6,\\ 8 \\quad \\Rightarrow \\quad \\text{median} = 4\n" +
                "\n" +
                "### Step 3: Identify the Mode\n\n" +
                "Find the value that occurs most frequently.\n\n" +
                "\n" +
                "\\text{mode} = 2\n" +
                "\n" +
                "### Step 4: Select the Appropriate Measure\n\n" +
                "Compare the three measures. If they are similar, any may be appropriate. If outliers are present, the median is usually the better choice.",
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
                "## Example 4 — Analyze Graphs for Misrepresentation\n\n" +
                "Compare graphs of the same or related data to determine whether differences in scale or visual design misrepresent the information. Explain how those differences affect interpretation.\n\n" +
                "### Step 1: Compare the Scales\n\n" +
                "Examine the [y]-axis scales on each graph. A truncated or stretched scale can exaggerate or minimize differences between data sets.\n\n" +
                "### Step 2: Evaluate the Visual Impact\n\n" +
                "Determine whether the graph makes differences appear larger or smaller than they actually are.\n\n" +
                "*Example:* Graphing the same data with a [y]-axis from [0] to [10] versus [0] to [100] will make fluctuations look more dramatic on the narrower scale.\n\n" +
                "### Step 3: Draw a Conclusion About Misrepresentation\n\n" +
                "State whether the graph is misleading and explain how the scale choice affects the viewer's interpretation.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Mixed Exercises",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\n" +
                "The mixed exercises provide practice across all skills from the lesson. Problems include identifying and correcting biased sampling methods, analyzing survey questions and their context for bias, calculating and comparing measures of center with and without outliers, evaluating graphs and charts for misleading design choices, and reasoning about how transformations such as adding a constant affect the mean and median. Some problems ask students to construct their own biased and unbiased examples or to justify their reasoning in writing.",
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
                "## Review Notes\n\n" +
                "* **Image 1** (`media/image1.png`): A pair of graphs comparing T-shirt sales by two vendors at a baseball tournament over two years. The graphs appear to use different vertical scales. The curriculum file describes the general concept (comparing scales) but does not reproduce the exact data or visual layout. Reviewer should verify the specific values and scale differences.\n" +
                "* **Image 2** (`media/image2.png`): A graph or chart related to a food drive showing canned goods collected by Valley High School in 2012 and 2017. The curriculum file describes the general scenario but does not reproduce the exact visual representation. Reviewer should verify the data values and whether the graph is misleading.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-9-lesson-4",
    title: "Measures of Spread",
    description:
      "Calculate the range, interquartile range, and standard deviation of a data set. Determine the five-number summary and construct a box plot from a data set.",
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
                "## Key Terms\n\n" +
                "* **Range** — The difference between the maximum and minimum values in a data set\n" +
                "* **Five-Number Summary** — The minimum, first quartile [ Q_1 ], median, third quartile [ Q_3 ], and maximum of a data set\n" +
                "* **Box Plot** — A graphical display of the five-number summary that shows the spread and center of a data set\n" +
                "* **Interquartile Range (IQR)** — The difference between the third and first quartiles, [ IQR = Q_3 - Q_1 ], representing the middle 50% of data\n" +
                "* **Standard Deviation** — A measure of how much the values in a data set deviate from the mean",
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
                "## Explore: How Much Do Values Vary?\n\n" +
                "Students compare two data sets with the same mean but very different spreads. They discuss why knowing the center alone is not enough to describe a data set and brainstorm ways to measure how spread out the values are.\n\n" +
                "**Inquiry Question:** Why do we need more than a measure of center to fully describe a data set?",
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
                "## Learn: Measures of Spread\n\n" +
                "Measures of spread describe how data values are distributed around the center. Common measures include the range, interquartile range, and standard deviation. Together with the five-number summary, they provide a complete picture of a data set's variability.\n\n" +
                "### Key Concept: Range and Five-Number Summary\n\n" +
                "* The **range** is found by subtracting the minimum value from the maximum value:\n" +
                "\n" +
                "  \\text{Range} = \\text{max} - \\text{min}\n" +
                "\n" +
                "* The **five-number summary** divides the data into four parts using the minimum, first quartile, median, third quartile, and maximum.\n" +
                "* A **box plot** displays the five-number summary visually, with a box from [ Q_1 ] to [ Q_3 ] and whiskers extending to the minimum and maximum.\n\n" +
                "### Key Concept: Interquartile Range and Standard Deviation\n\n" +
                "* The **interquartile range** measures the spread of the middle half of the data:\n" +
                "\n" +
                "  IQR = Q_3 - Q_1\n" +
                "\n" +
                "* The **standard deviation** measures the average distance of each data point from the mean. To calculate it:\n" +
                "  1. Find the mean of the data set.\n" +
                "  2. Find the squared deviation of each data value from the mean.\n" +
                "  3. Find the mean of the squared deviations (variance).\n" +
                "  4. Take the square root of the variance.",
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
                "## Example 1 — Find the Range\n\n" +
                "Find the range of a given data set by identifying the maximum and minimum values and subtracting.\n\n" +
                "### Step 1: Identify the Maximum and Minimum\n\n" +
                "Locate the smallest and largest values in the data set.\n\n" +
                "### Step 2: Calculate the Range\n\n" +
                "Subtract the minimum from the maximum:\n" +
                "\n" +
                "\\text{Range} = \\text{max} - \\text{min}\n" +
                "\n" +
                "For example, given the data set [ 12, 27, 43, 52, 43, 18, 45, 53, 26 ], the maximum is [ 53 ] and the minimum is [ 12 ], so:\n" +
                "\n" +
                "\\text{Range} = 53 - 12 = 41\n" +
                "\n" +
                "Problems also include data sets with decimal values and a real-world context involving daily exercise minutes.",
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
                "## Example 2 — Five-Number Summary and Box Plot\n\n" +
                "Determine the five-number summary for a data set and use it to draw a box plot.\n\n" +
                "### Step 1: Order the Data\n\n" +
                "Arrange the data values from least to greatest.\n\n" +
                "### Step 2: Find the Five-Number Summary\n\n" +
                "* **Minimum:** the smallest value\n" +
                "* **Maximum:** the largest value\n" +
                "* **Median:** the middle value (or average of the two middle values)\n" +
                "* **[ Q_1 ]:** the median of the lower half of the data\n" +
                "* **[ Q_3 ]:** the median of the upper half of the data\n\n" +
                "For example, for smartphone prices [ 311, 309, 312, 314, 399, 312 ]:\n" +
                "\n" +
                "\\text{Min} = 309, \\quad Q_1 = 311.5, \\quad \\text{Median} = 312, \\quad Q_3 = 313, \\quad \\text{Max} = 399\n" +
                "\n" +
                "### Step 3: Draw the Box Plot\n\n" +
                "Mark the five-number summary on a number line. Draw a box from [ Q_1 ] to [ Q_3 ] with a line at the median, and extend whiskers to the minimum and maximum.",
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
                "## Example 3 — Find the Interquartile Range\n\n" +
                "Find the interquartile range of a data set by first determining the first and third quartiles.\n\n" +
                "### Step 1: Order the Data and Find Quartiles\n\n" +
                "Arrange the data in order and locate [ Q_1 ] (median of the lower half) and [ Q_3 ] (median of the upper half).\n\n" +
                "### Step 2: Calculate the IQR\n\n" +
                "Subtract the first quartile from the third quartile:\n" +
                "\n" +
                "IQR = Q_3 - Q_1\n" +
                "\n" +
                "For example, given [ 43, 36, 51, 68, 50, 27, 38, 81, 33 ], the ordered data is [ 27, 33, 36, 38, 43, 50, 51, 68, 81 ]. The median is [ 43 ], [ Q_1 = 34.5 ], and [ Q_3 = 59.5 ], so:\n" +
                "\n" +
                "IQR = 59.5 - 34.5 = 25\n" +
                "\n" +
                "Problems include whole numbers, larger values, and a real-world heart rate context.",
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
                "## Example 4 — Find the Standard Deviation\n\n" +
                "Calculate the standard deviation of a data set using the mean and squared deviations.\n\n" +
                "### Step 1: Find the Mean\n\n" +
                "Add all data values and divide by the number of values:\n" +
                "\n" +
                "\\bar{x} = \\frac{\\sum x_i}{n}\n" +
                "\n" +
                "### Step 2: Find the Squared Deviations\n\n" +
                "For each data value, subtract the mean and square the result:\n" +
                "\n" +
                "(x_i - \\bar{x})^2\n" +
                "\n" +
                "### Step 3: Find the Variance and Standard Deviation\n\n" +
                "Find the mean of the squared deviations (variance), then take the square root:\n" +
                "\n" +
                "\\sigma = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{n}}\n" +
                "\n" +
                "For example, for the data set [ \\{10, 9, 11, 6, 9\\} ], the mean is [ \\bar{x} = 9 ]. The squared deviations are [ 1, 0, 4, 9, 0 ], the variance is [ \\frac{14}{5} = 2.8 ], and the standard deviation is [ \\sigma = \\sqrt{2.8} \\approx 1.67 ].\n\n" +
                "Problems also include a real-world parking context.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Mixed Exercises",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\n" +
                "The mixed exercises integrate all four skills — range, five-number summary, interquartile range, and standard deviation — along with box plot construction. Problems include:\n\n" +
                "* Reasoning and interpreting standard deviation in context (hockey goals)\n" +
                "* Analyzing data from a table to find and interpret standard deviation (football carries)\n" +
                "* Determining a five-number summary and drawing a box plot for a real-world data set (movie ages)\n" +
                "* Finding the five-number summary and drawing a box plot for gasoline prices\n" +
                "* A comprehensive problem requiring all four measures and a box plot for a single data set (seashells and shoe sizes)\n" +
                "* Error analysis about methods to decrease standard deviation\n" +
                "* Analyzing whether two random samples from the same population always have the same mean and standard deviation\n" +
                "* Creating a survey, collecting data, and calculating all measures of spread\n" +
                "* Writing about what the interquartile range reveals about data clustering around the median",
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
                "## Review Notes\n\n" +
                "* **Image needed:** Problem 5 includes a table or diagram showing Kent's daily exercise minutes (image1.png).\n" +
                "* **Image needed:** Problem 22 includes a table showing the number of carries a running back had over several years (image2.png).\n" +
                "* **Image needed:** Problem 27 includes a dialogue or work sample from Jennifer and Megan discussing how to decrease the standard deviation of a data set (image3.png).",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-9-lesson-5",
    title: "Distributions of Data",
    description:
      "Construct and interpret histograms and box plots to visualize the shape of a data distribution. Choose appropriate measures of center and spread based on whether a distribution is symmetric or skewed.",
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
                "## Key Terms\n\n" +
                "* **Histogram** — A bar graph that shows the frequency of data values within equal intervals\n" +
                "* **Box Plot** — A graphical display of the five-number summary of a data set\n" +
                "* **Symmetric Distribution** — A distribution whose left and right sides are approximately mirror images\n" +
                "* **Skewed Distribution** — A distribution whose tail extends farther to one side; skewed left if the tail is on the left, skewed right if the tail is on the right\n" +
                "* **Five-Number Summary** — The minimum, first quartile, median, third quartile, and maximum of a data set\n" +
                "* **Outlier** — A data value that is much greater or much less than the other values in the data set\n" +
                "* **Mean** — The average of a data set, found by summing all values and dividing by the number of values\n" +
                "* **Standard Deviation** — A measure of spread that describes the typical distance of data values from the mean\n" +
                "* **Interquartile Range (IQR)** — The difference between the third quartile and the first quartile, [ Q_3 - Q_1 ]",
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
                "## Explore: What Shape Does the Data Take?\n\n" +
                "Students sketch what they think a histogram of test scores or household incomes might look like. They discuss whether the data would cluster in the middle, tail off to one side, or have gaps, and how that shape affects which statistics they trust most.\n\n" +
                "**Inquiry Question:** How does the shape of a distribution help us choose the best measures of center and spread?",
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
                "## Learn: Describing Distributions\n\n" +
                "When analyzing a data set, begin by creating a visual display to identify the overall shape. Then choose statistics that best represent the center and spread without being distorted by outliers or skewness.\n\n" +
                "### Key Concept: Choosing Measures of Center and Spread\n\n" +
                "* For a **symmetric** distribution, use the **mean** and **standard deviation** to describe center and spread\n" +
                "* For a **skewed** distribution or one with outliers, use the **median** and the **five-number summary** (or IQR) to describe center and spread\n" +
                "* Always justify the choice by referencing the shape shown in the histogram or box plot",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Construct Histograms and Box Plots\n\n" +
                "Use a graphing calculator or statistical software to construct a histogram and a box plot for a given data set, then describe the shape of the distribution.\n\n" +
                "### Step 1: Enter the Data\n\n" +
                "Input all data values into a list.\n\n" +
                "### Step 2: Create the Graphs\n\n" +
                "Generate a histogram and a box plot from the data list.\n\n" +
                "### Step 3: Describe the Shape\n\n" +
                "Identify whether the distribution is approximately symmetric, skewed left, or skewed right by examining the histogram and box plot. Note the direction of the longest tail.\n\n" +
                "Representative data set:\n" +
                "\n" +
                "14, 71, 63, 42, 24, 76, 34, 77, 37, 69, 54, 64, 47, 74, 59, 43, 76, 56,\n" +
                "78, 52, 18, 54, 39, 28, 56, 74, 68, 36, 20, 49, 67, 47, 69, 68, 72, 69",
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
                "## Example 2 — Describe Center and Spread Using a Histogram\n\n" +
                "Describe the center and spread of a data set using either the mean and standard deviation or the five-number summary. Justify the choice by constructing a histogram.\n\n" +
                "### Step 1: Construct a Histogram\n\n" +
                "Create a histogram to visualize the shape of the distribution.\n\n" +
                "### Step 2: Determine the Shape\n\n" +
                "Examine the histogram to decide whether the distribution is symmetric or skewed. Look for tails, gaps, or clusters.\n\n" +
                "### Step 3: Choose and Calculate Statistics\n\n" +
                "* If symmetric, report the mean [ \\bar{x} ] and standard deviation [ \\sigma ]\n" +
                "* If skewed or containing outliers, report the five-number summary: [ \\text{min}, Q_1, \\text{median}, Q_3, \\text{max} ]\n\n" +
                "Representative data set:\n" +
                "\n" +
                "32, 44, 50, 49, 21, 12, 27, 41, 48, 30, 50, 23, 37, 16, 49, 53, 33, 25,\n" +
                "35, 40, 48, 39, 50, 24, 15, 29, 37, 50, 36, 43, 49, 44, 46, 27, 42, 47",
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
                "## Example 3 — Describe Center and Spread Using a Box Plot\n\n" +
                "Describe the center and spread of a data set using either the mean and standard deviation or the five-number summary. Justify the choice by constructing a box plot.\n\n" +
                "### Step 1: Construct a Box Plot\n\n" +
                "Create a box plot from the data to visualize the spread and identify any outliers.\n\n" +
                "### Step 2: Determine the Shape\n\n" +
                "Use the box plot to assess symmetry. A symmetric distribution has the median roughly centered in the box and whiskers of similar length. Skewed distributions have a longer whisker on one side and the median closer to one end of the box.\n\n" +
                "### Step 3: Choose and Calculate Statistics\n\n" +
                "* If the box plot shows symmetry, use the mean and standard deviation\n" +
                "* If the box plot shows skewness or outliers, use the five-number summary\n\n" +
                "Representative data set:\n" +
                "\n" +
                "47, 16, 70, 80, 28, 33, 91, 55, 60, 45, 86, 54, 30, 98, 34, 87, 44, 35,\n" +
                "64, 58, 27, 67, 72, 68, 31, 95, 37, 41, 97, 56, 49, 71, 84, 66, 45, 93",
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
                "## Example 4 — Analyze Outliers and Their Effects\n\n" +
                "In real-world contexts, identify outliers in a data set, construct a box plot, calculate appropriate statistics, and describe how the outlier affects the measures of center and spread.\n\n" +
                "### Step 1: Identify Potential Outliers\n\n" +
                "Examine the data for values that are substantially different from the rest. For example, in a data set of daily exercise minutes, a value of 10 minutes might be an outlier if most values cluster around 55–62 minutes.\n\n" +
                "### Step 2: Construct a Box Plot\n\n" +
                "Create a box plot to confirm the presence of outliers visually.\n\n" +
                "### Step 3: Calculate Statistics With and Without the Outlier\n\n" +
                "Calculate appropriate measures of center and spread for the full data set. Then remove the outlier and recalculate to compare.\n\n" +
                "### Step 4: Describe the Effect\n\n" +
                "Explain how the outlier influences the mean, median, standard deviation, or range. Outliers typically have a larger effect on the mean and standard deviation than on the median and IQR.\n\n" +
                "Representative contexts:\n\n" +
                "* Flight prices from Los Angeles to New York:\n" +
                "\n" +
                "182, 234, 264, 271, 277, 314, 317, 455\n" +
                "\n" +
                "* Exercise minutes tracked over 10 days:\n" +
                "\n" +
                "57, 60, 53, 59, 57, 61, 61, 54, 62, 10",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Mixed Exercises",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\n" +
                "The mixed exercises provide practice across all skills from this lesson. Problems include:\n\n" +
                "* Constructing histograms and box plots for raw data sets and describing distribution shape\n" +
                "* Selecting and justifying appropriate measures of center and spread for symmetric versus skewed data\n" +
                "* Working with contextual data sets involving outliers and analyzing their effect on statistics\n" +
                "* Comparing two data sets or distributions using statistical summaries and graphical displays\n" +
                "* Removing outliers from a data set, reconstructing the box plot, and comparing means and medians before and after\n" +
                "* Matching histograms to their corresponding box plots\n" +
                "* Interpreting real-world data presented in tables and graphs\n" +
                "* Researching and defining distribution types such as bimodal distributions\n" +
                "* Creating examples of symmetric and non-symmetric real-world data\n" +
                "* Explaining why the mean and standard deviation are used for symmetric distributions while the five-number summary is preferred for skewed distributions\n\n" +
                "Some problems present data in tables or graphs that require reading values before analysis.",
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
                "## Review Notes\n\n" +
                "* **Image needed:** Problem 13 (GOLF) contains a box plot or table image (`media/image1.png`) showing miniature golf scores that cannot be described from the source\n" +
                "* **Image needed:** Problem 15 (PRESIDENTS) contains a table of presidential inauguration ages as an image (`media/image2.png`) that cannot be described from the source\n" +
                "* **Image needed:** Problem 16 (AUTOMOTIVE) contains two images (`media/image3.png`, `media/image4.png`) showing cars serviced per day data that cannot be described from the source\n" +
                "* **Image needed:** Problem 17 (COMMUTE) contains an image (`media/image5.png`) showing weekly miles driven data that cannot be described from the source\n" +
                "* **Image needed:** Problem 19 (USE A MODEL) contains a histogram image (`media/image6.png`) comparing two brands of pasta weights that cannot be described from the source\n" +
                "* **Image needed:** Problem 20 (STRUCTURE) contains a table image (`media/image7.png`) of Space Shuttle flight durations that cannot be described from the source\n" +
                "* **Image needed:** Problem 22 contains two box plot images (`media/image8.png`, `media/image9.png`) for comparison that cannot be described from the source\n" +
                "* **Image needed:** Problem 23 (SUPREME COURT) references a table of Supreme Court Justice ages that appears to be an embedded image not described in the source text\n" +
                "* **Image needed:** Problem 24 contains a histogram image (`media/image10.png`) and three box plot images (`media/image11.png` labeled A, B, C) for matching that cannot be described from the source\n" +
                "* **Missing data:** Problem 18 (ELEVATION) references a table of 10 U.S. elevations, but the actual values are not present in the extracted source text",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-9-lesson-6",
    title: "Comparing Sets of Data",
    description:
      "Describe how adding or multiplying every value in a data set by a constant affects the mean, median, mode, range, and standard deviation. Construct and interpret box plots and histograms to compare two data sets.",
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
                "## Key Terms\n\n" +
                "* **Mean** — The average of a data set, found by summing all values and dividing by the number of values.\n" +
                "* **Median** — The middle value of an ordered data set; the second quartile [ Q_2 ].\n" +
                "* **Mode** — The value(s) that appear most frequently in a data set.\n" +
                "* **Range** — The difference between the maximum and minimum values in a data set.\n" +
                "* **Standard Deviation** — A measure of the spread of a data set, based on the average squared distance from the mean.\n" +
                "* **Five-Number Summary** — The minimum, first quartile [ Q_1 ], median [ Q_2 ], third quartile [ Q_3 ], and maximum of a data set.\n" +
                "* **Interquartile Range (IQR)** — The difference [ Q_3 - Q_1 ], representing the spread of the middle 50% of data.\n" +
                "* **Symmetrical Distribution** — A distribution whose left and right sides are approximately mirror images.\n" +
                "* **Skewed Distribution** — A distribution with a longer tail on one side; described as left-skewed or right-skewed.",
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
                "## Explore: How Do Changes to Data Affect Its Description?\n\n" +
                "Students imagine a teacher adds 5 points to every student's test score or converts every score to a percentage out of 100. They predict how the mean, median, range, and standard deviation would change and explain their reasoning.\n\n" +
                "**Inquiry Question:** What happens to the measures of center and spread when every value in a data set is changed by the same amount?",
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
                "## Learn: Effects of Transformations on Data\n\n" +
                "When every value in a data set is transformed by addition or multiplication, the measures of center and spread change in predictable ways.\n\n" +
                "### Key Concept: Adding a Constant\n\n" +
                "* Adding a constant [ c ] to every value shifts all measures of center by [ c ].\n" +
                "* Measures of spread (range, standard deviation) remain unchanged because the distances between values do not change.\n" +
                "* If the original mean is [ \\bar{x} ], the new mean is [ \\bar{x} + c ].\n" +
                "* The new range equals the original range: [ \\text{Range}_{\\text{new}} = \\text{Range}_{\\text{old}} ].\n\n" +
                "### Key Concept: Multiplying by a Constant\n\n" +
                "* Multiplying every value by a constant [ k ] scales all measures of center and spread by [ |k| ].\n" +
                "* If the original mean is [ \\bar{x} ], the new mean is [ k \\cdot \\bar{x} ].\n" +
                "* The new standard deviation is [ |k| \\cdot \\sigma ].\n" +
                "* The new range is [ |k| \\cdot \\text{Range}_{\\text{old}} ].\n\n" +
                "### Key Concept: Choosing Comparison Statistics\n\n" +
                "* For symmetrical distributions, use the **mean** and **standard deviation** to compare center and spread.\n" +
                "* For skewed distributions, or when comparing a symmetric and a skewed distribution, use the **five-number summary** (or median and IQR).",
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
                "## Example 1 — Add a Constant and Find Statistics\n\n" +
                "Given a data set, add a constant to each value and compute the mean, median, mode, range, and standard deviation of the transformed data.\n\n" +
                "### Step 1: Apply the Transformation\n\n" +
                "Add the given constant to every data value. For example, with data [ 52, 53, 49, 61, 57, 52, 48, 60, 50, 47 ] and constant [ +8 ]:\n" +
                "\n" +
                "60, 61, 57, 69, 65, 60, 56, 68, 58, 55\n" +
                "\n" +
                "### Step 2: Compute Measures of Center and Spread\n\n" +
                "Find the mean, median, mode, range, and standard deviation of the new data set. Notice that:\n\n" +
                "* Mean, median, and mode each increase by [ 8 ].\n" +
                "* Range and standard deviation stay the same as the original data set.",
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
                "## Example 2 — Multiply by a Constant and Find Statistics\n\n" +
                "Given a data set, multiply each value by a constant and compute the mean, median, mode, range, and standard deviation of the transformed data.\n\n" +
                "### Step 1: Apply the Transformation\n\n" +
                "Multiply every data value by the given constant. For example, with data [ 11, 7, 3, 13, 16, 8, 3, 11, 17, 3 ] and constant [ \\times 4 ]:\n" +
                "\n" +
                "44, 28, 12, 52, 64, 32, 12, 44, 68, 12\n" +
                "\n" +
                "### Step 2: Compute Measures of Center and Spread\n\n" +
                "Find the mean, median, mode, range, and standard deviation of the new data set. Notice that:\n\n" +
                "* Mean, median, and mode are each multiplied by [ 4 ].\n" +
                "* Range and standard deviation are also multiplied by [ 4 ].",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Examples 3 and 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Examples 3 and 4 — Compare Data Sets with Graphs and Statistics\n\n" +
                "Use technology and statistical reasoning to compare two real-world data sets.\n\n" +
                "### Step 1: Construct Graphs\n\n" +
                "Use a graphing calculator to build a box plot or histogram for each data set. Describe the shape of each distribution (symmetric, skewed left, skewed right).\n\n" +
                "### Step 2: Choose and Apply Comparison Statistics\n\n" +
                "* If both distributions are roughly symmetric, compare using **means and standard deviations**.\n" +
                "* If either distribution is skewed, compare using **five-number summaries** (or medians and IQRs).\n\n" +
                "### Step 3: Justify the Choice\n\n" +
                "Explain why the chosen statistics are appropriate for the shapes of the distributions. Summarize how the center and spread differ between the two data sets.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Mixed Exercises",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\n" +
                "The mixed exercises provide practice across all lesson skills:\n\n" +
                "* Compute statistics after adding a constant, multiplying by a constant, or applying a sequence of both operations.\n" +
                "* Solve real-world problems involving unit conversions (e.g., Fahrenheit to Celsius) and analyze how the transformation affects each statistic.\n" +
                "* Construct box plots and histograms for paired data sets, describe their shapes, and compare them using the appropriate statistics.\n" +
                "* Analyze the effect of eliminating outliers on comparisons.\n" +
                "* Use the median and IQR to evaluate which of two samples is more representative of a population.\n" +
                "* Explain reasoning for choosing specific statistical measures based on distribution shape.\n" +
                "* Analyze combined transformations: if [ k ] is added to every value and then each result is multiplied by [ m ] (where [ m > 0 ]), the new measures of center become [ m(\\bar{x} + k) ] and measures of spread become [ m ] times the original spread.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n" +
                "* Problems 9, 10, 21–28 contain images/tables (baseball win data, treadmill times, bowling scores, football distances, temperature tables, fantasy sports points, phone accessory prices, snail shell samples, height samples, and rainfall data) that cannot be described from the extracted text. These require visual review of the original worksheet or scanned images.\n" +
                "* The data tables in problems 21–26 and 28 are represented as images in the source document and should be recreated or referenced from the original `.docx`.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-9-lesson-7",
    title: "Summarizing Categorical Data",
    description:
      "Construct and complete two-way frequency tables. Convert two-way frequency tables into relative frequency tables and conditional relative frequency tables. Calculate and interpret joint, marginal, and conditional relative frequencies.",
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
                "## Key Terms\n\n" +
                "* **Categorical Data** — Data that can be sorted into groups or categories rather than measured numerically.\n" +
                "* **Two-Way Frequency Table** — A table that displays the frequencies of data classified according to two different categories.\n" +
                "* **Joint Frequency** — The number of responses that belong to both a specific row category and a specific column category.\n" +
                "* **Marginal Frequency** — The total frequency for a single row or column, found in the margins of a two-way table.\n" +
                "* **Relative Frequency** — A ratio of a frequency to the total number of observations, often expressed as a percentage.\n" +
                "* **Joint Relative Frequency** — The ratio of a joint frequency to the total number of observations.\n" +
                "* **Conditional Relative Frequency** — The ratio of a joint frequency to the marginal total of a specific row or column.\n" +
                "* **Association** — A relationship between two categorical variables where the distribution of one variable changes depending on the category of the other.",
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
                "## Explore: How Can We Organize Data with Two Categories?\n\n" +
                "Students consider a collection of survey responses that each have two attributes — for example, a favorite snack and a grade level. They discuss how listing the raw responses makes it difficult to see patterns, and they explore ways to arrange the counts in a rectangular grid.\n\n" +
                "**Inquiry Question:** How does organizing paired categorical data into a two-way table make it easier to compare groups and spot relationships?",
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
                "## Learn: Two-Way Tables and Relative Frequencies\n\n" +
                "Two-way tables organize paired categorical data so that joint counts, marginal totals, and derived relative frequencies can be read systematically.\n\n" +
                "### Key Concept: Two-Way Frequency Table\n\n" +
                "* Rows represent one categorical variable and columns represent another.\n" +
                "* The cell where a row and column intersect shows the joint frequency for that pair of categories.\n" +
                "* The rightmost column and bottom row contain the marginal frequencies (row totals and column totals).\n" +
                "* The bottom-right corner contains the grand total.\n\n" +
                "### Key Concept: Relative Frequency Table\n\n" +
                "* Each cell value is divided by the grand total to produce a joint relative frequency.\n" +
                "* Marginal relative frequencies are row or column totals divided by the grand total.\n" +
                "* All joint relative frequencies sum to [ 1 ] (or [ 100\\% ]).\n\n" +
                "### Key Concept: Conditional Relative Frequency Table\n\n" +
                "* Each joint frequency is divided by the marginal total of a chosen row or column.\n" +
                "* A table conditioned on rows expresses each cell as a percentage of its row total.\n" +
                "* A table conditioned on columns expresses each cell as a percentage of its column total.\n" +
                "* Conditional relative frequencies help compare groups of different sizes.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 1 — Construct a Two-Way Frequency Table\n\n" +
                "Use verbal clues about totals and relationships to build a complete two-way frequency table with row and column categories.\n\n" +
                "### Step 1: Identify the Categories and Grand Total\n\n" +
                "Determine the two variables, their categories, and the overall total number of observations.\n\n" +
                "Representative totals:\n" +
                "\n" +
                "\\text{Total snow cones} = 125\n" +
                "\n" +
                "\\text{Large} = 40\\% \\text{ of } 125 = 50\n" +
                "\n" +
                "\\text{Small} = 125 - 50 = 75\n" +
                "\n" +
                "### Step 2: Use Percentages to Find Category Totals\n\n" +
                "Apply the given percentages to the grand total to find marginal frequencies for one variable.\n" +
                "\n" +
                "\\text{Grape} = 32\\% \\text{ of } 125 = 40\n" +
                "\n" +
                "\\text{Small watermelon} = 12\\% \\text{ of } 125 = 15\n" +
                "\n" +
                "### Step 3: Use Differences and Relationships to Fill Remaining Cells\n\n" +
                "Use clues such as \"15 more than\" or \"most popular\" to find missing joint frequencies, then subtract to find the remaining values.\n" +
                "\n" +
                "\\text{Cherry} = \\text{Grape} + 15 = 40 + 15 = 55\n" +
                "\n" +
                "\\text{Watermelon total} = 125 - 40 - 55 = 30\n" +
                "\n" +
                "\\text{Large watermelon} = 30 - 15 = 15\n" +
                "\n" +
                "### Step 4: Verify the Table\n\n" +
                "Check that all row totals and column totals match the given constraints and that the grand total is correct.",
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
                "## Example 2 — Construct and Interpret a Relative Frequency Table\n\n" +
                "Convert a two-way frequency table into a relative frequency table by dividing each frequency by the grand total, then interpret a joint relative frequency in context.\n\n" +
                "### Step 1: Read the Two-Way Frequency Table\n\n" +
                "Extract the joint and marginal frequencies from the given table. (The source table is provided as an image; values must be read from the original worksheet.)\n\n" +
                "### Step 2: Compute Joint Relative Frequencies\n\n" +
                "Divide each joint frequency by the grand total and express the result as a percentage rounded to the nearest tenth.\n\n" +
                "\n" +
                "\\text{Joint relative frequency} = \\frac{\\text{joint frequency}}{\\text{grand total}} \\times 100\n" +
                "\n" +
                "### Step 3: Compute Marginal Relative Frequencies\n\n" +
                "Divide each row total and column total by the grand total.\n\n" +
                "### Step 4: Interpret the Data\n\n" +
                "Use the relative frequency table to describe what percentage of the surveyed group falls into a specific combined category or into a single category overall.",
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
                "## Example 3 — Construct a Conditional Relative Frequency Table\n\n" +
                "Build a conditional relative frequency table by conditioning on one variable, then interpret conditional probabilities and compare them to joint probabilities.\n\n" +
                "### Step 1: Organize the Raw Counts\n\n" +
                "Place the given counts into a two-way frequency table and compute all marginal totals.\n\n" +
                "Representative structure:\n" +
                "\n" +
                "\\text{Male voters} = 145\n" +
                "\n" +
                "\\text{Female voters} = 139\n" +
                "\n" +
                "\\text{Male for Santiago} = 68\n" +
                "\n" +
                "\\text{Male for Measha} = 145 - 68 = 77\n" +
                "\n" +
                "\\text{Female for Measha} = 89\n" +
                "\n" +
                "\\text{Female for Santiago} = 139 - 89 = 50\n" +
                "\n" +
                "### Step 2: Condition on the Column Variable\n\n" +
                "Divide each joint frequency by its column total to produce conditional relative frequencies based on voter preference.\n\n" +
                "\n" +
                "\\text{Conditional relative frequency} = \\frac{\\text{joint frequency}}{\\text{column total}}\n" +
                "\n" +
                "For example, the conditional relative frequency of male voters given a vote for Santiago is:\n" +
                "\n" +
                "\\frac{68}{68 + 50} = \\frac{68}{118}\n" +
                "\n" +
                "### Step 3: Interpret the Conditional Probabilities\n\n" +
                "Explain what each conditional relative frequency represents. For instance, a value in the Santiago column shows what fraction of all Santiago voters are male or female.\n\n" +
                "### Step 4: Compare Conditional and Joint Probabilities\n\n" +
                "Distinguish between:\n" +
                "* The probability that a vote for Measha comes from a female student (conditional on Measha).\n" +
                "* The probability that a female student intends to vote for Measha (conditional on female).\n\n" +
                "These two probabilities have different denominators and answer different questions.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Mixed Exercises",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Mixed Exercises\n\n" +
                "The mixed exercises provide practice with all skills from the lesson:\n\n" +
                "* Read values from a two-way frequency table and answer questions about specific joint or marginal counts (veterinarian visit data).\n" +
                "* Construct a two-way frequency table from verbal percentages and relationships, then use it to answer comparison questions (bird watching data).\n" +
                "* Convert a two-way frequency table into a relative frequency table, find joint relative frequencies, and determine what percentage of a subgroup does or does not belong to a category (school activities data).\n" +
                "* Read a two-way frequency table and compute totals, subtotals, and overall percentages for a voting survey (school mascot data).\n" +
                "* Complete a two-way frequency table from partial data, compute relative frequencies, and construct a conditional relative frequency table conditioned on one variable; interpret the resulting probabilities (Thanksgiving pie preferences by region).\n" +
                "* Convert relative frequencies back to joint and marginal frequencies given a total count, then reason about conditional relative frequencies without calculating every value individually (vehicle drive systems).\n" +
                "* Analyze a two-way frequency table to determine whether there appears to be an association between two categorical variables and explain the reasoning (gasoline prices and vacation distance).\n" +
                "* Create an original two-way frequency table, write a related question, and provide the solution.\n" +
                "* Compare and contrast two-way relative frequency tables and two-way conditional relative frequency tables in writing.\n" +
                "* Interpret a conditional relative frequency table related to age groups, evaluate competing claims about the data, and determine which claim is supported by the percentages (snack survey data).",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n" +
                "* **Image references (media/image1.png through media/image8.png)** — The worksheet contains images and tables whose content could not be fully extracted as text. Key images include:\n" +
                "  * Image1 — Foreign language survey two-way frequency table for Example 2 (problems 5–7).\n" +
                "  * Image2 — Veterinarian visit two-way frequency table for problems 11–12.\n" +
                "  * Image3 — School activities participation two-way frequency table for problems 17–20.\n" +
                "  * Image4 — School mascot voting two-way frequency table for problems 21–28.\n" +
                "  * Image5 — Thanksgiving pie preferences by region two-way frequency table for problems 29–32.\n" +
                "  * Image6 — Vehicle drive systems relative frequency table for problems 33–34.\n" +
                "  * Image7 — Gasoline prices versus vacation distance two-way frequency table for problem 35.\n" +
                "  * Image8 — Snack survey conditional relative frequency table for problem 38.\n" +
                "  A human reviewer should verify that all tables are correctly represented or transcribed into the digital curriculum from the original `.docx`.",
            },
          },
        ],
      },
    ],
  },
];

export const seedModule9Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule9LessonsResult> => {
    const now = Date.now();
    const results = [];

    for (const lesson of LESSONS) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 9,
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
