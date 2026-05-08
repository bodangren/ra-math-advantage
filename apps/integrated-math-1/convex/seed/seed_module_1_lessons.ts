import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedModule1Result {
  lessonsCreated: number;
  phasesCreated: number;
}

export const seedModule1Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule1Result> => {
    const now = Date.now();

    const lessons = [
      {
        slug: "module-1-lesson-1",
        title: "Numerical Expressions",
        orderIndex: 1,
        description:
          "Students translate verbal descriptions into numerical expressions using operation symbols and grouping, and evaluate expressions using the order of operations.",
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
                    "## Vocabulary\n\n* **numerical expression** — A mathematical phrase containing numbers and operation symbols.\n* **evaluate** — To find the value of a numerical expression.\n* **sum** — The result of adding two or more numbers.\n* **difference** — The result of subtracting one number from another.\n* **product** — The result of multiplying two or more numbers.\n* **quotient** — The result of dividing one number by another.\n* **order of operations** — The rules that tell which operation to perform first when evaluating an expression.",
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
                    "## Explore: What Does \"Two More Than Three Times Four\" Mean?\n\nStudents discuss how the wording of a verbal expression affects the mathematical operations and their order. Consider whether different groupings of the same words can produce different answers.\n\nInquiry Question:\nHow can the same words produce different answers if parentheses or the order of operations are ignored?",
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
                    "## Learn: Writing and Evaluating Numerical Expressions\n\nNumerical expressions use numbers, operation symbols, and sometimes grouping symbols to represent mathematical relationships.\n\n### Key Concept: Order of Operations\n\n* Evaluate expressions inside grouping symbols (parentheses, brackets, fraction bars) first.\n* Evaluate all exponents.\n* Multiply and divide from left to right.\n* Add and subtract from left to right.\n\n### Key Concept: Translating Verbal Expressions\n\n* \"More than\" and \"increased by\" indicate addition.\n* \"Less than\" and \"decreased by\" indicate subtraction — note that order matters.\n* \"Times\" and \"product of\" indicate multiplication.\n* \"Divided by\" and \"quotient of\" indicate division.\n* Grouping symbols are needed when an operation applies to a combined quantity.",
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
                    "## Example 1 — Write Numerical Expressions from Verbal Descriptions\n\nTranslate simple verbal expressions into numerical expressions using the correct operation symbols and order.\n\n### Step 1: Identify Operations and Order\n\nRead the verbal description to determine which operations are needed and in what order.\n\nFor example, \"two plus twelve divided by four\" becomes:\n[\n2 + 12 \\div 4\n]\n\n\"Eighteen more than five\" becomes:\n[\n5 + 18\n]\n\n\"Seven more than three times eleven\" becomes:\n[\n3 \\times 11 + 7\n]\n\n### Step 2: Watch for Left-to-Right and Grouping\n\nWhen multiple operations appear in sequence, respect the natural order or use grouping.\n\n\"Twenty-five less than one hundred\" becomes:\n[\n100 - 25\n]\n\n\"Six minus three minus one\" becomes:\n[\n6 - 3 - 1\n]\n\n\"Fourteen decreased by three times four\" becomes:\n[\n14 - 3 \\times 4\n]\n\n\"Twenty-four divided by six plus seven\" becomes:\n[\n24 \\div 6 + 7\n]\n\n\"Eight times six divided by two minus nine\" becomes:\n[\n8 \\times 6 \\div 2 - 9\n]",
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
                    "## Example 2 — Verbal Expressions with Sum, Difference, Product, and Quotient\n\nWrite numerical expressions for verbal descriptions that explicitly name operations such as sum, difference, product, and quotient.\n\n### Step 1: Recognize Operation Names\n\nIdentify whether the problem names an operation explicitly.\n\n\n\"The sum of three and seven divided by two\" becomes:\n[\n(3 + 7) \\div 2\n]\n\n\"The difference of six and two divided by four\" becomes:\n[\n(6 - 2) \\div 4\n]\n\n\"The sum of four and nine times three\" becomes:\n[\n(4 + 9) \\times 3\n]\n\n### Step 2: Handle Nested Operations\n\nWhen one operation is applied to the result of another, use parentheses to show grouping.\n\n\"Eighteen divided by the sum of two and seven\" becomes:\n[\n18 \\div (2 + 7)\n]\n\n\"Ten divided by the product of four and five\" becomes:\n[\n10 \\div (4 \\times 5)\n]\n\n\"The difference of eleven and four times five\" becomes:\n[\n(11 - 4) \\times 5\n]\n\n### Step 3: Combine Multiple Grouped Quantities\n\nFor more complex expressions, identify all grouped quantities first.\n\n\"The sum of twelve and sixteen divided by the sum of three and four\" becomes:\n[\n(12 + 16) \\div (3 + 4)\n]\n\n\"The difference of twenty-two and six divided by the sum of five and three\" becomes:\n[\n(22 - 6) \\div (5 + 3)\n]\n\n\"The sum of thirty-six and fourteen divided by the product of two and five\" becomes:\n[\n(36 + 14) \\div (2 \\times 5)\n]\n\n\"The quotient of thirty-two and four divided by the sum of one and three\" becomes:\n[\n(32 \\div 4) \\div (1 + 3)\n]\n\n\"The sum of six and fifteen divided by the difference of thirteen and three\" becomes:\n[\n(6 + 15) \\div (13 - 3)\n]\n\n\"The difference of thirty-one and seventeen divided by the product of ten and four\" becomes:\n[\n(31 - 17) \\div (10 \\times 4)\n]",
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
                    "## Example 3 — Real-World Applications\n\nWrite numerical expressions to model real-world situations described in words.\n\n### Step 1: Identify Quantities and Relationships\n\nExtract the numbers and the relationships between them from the problem context.\n\n**Solar System:** It takes Earth about 365 days to orbit the Sun. It takes Uranus about 85 times as long.\n[\n365 \\times 85\n]\n\n**Test Scores:** Ryan scored 85, 92, 88, and 98 on four tests. Write an expression for his average.\n[\n(85 + 92 + 88 + 98) \\div 4\n]\n\n### Step 2: Translate Multi-Step Relationships\n\nWhen a description involves multiple operations, combine them in the correct order.\n\n**Homework:** Carrie took five less minutes than twice the amount of time Hua took (35 minutes).\n[\n2 \\times 35 - 5\n]\n\n**Perimeter:** The perimeter of Stephanie's triangle is half the perimeter of Juan's triangle. (Juan's triangle side lengths are shown in a diagram.)\n[\n(a + b + c) \\div 2\n]\n\n**Bedroom Area:** A rectangular bedroom is 12 feet long and 7 feet wide.\n[\n12 \\times 7\n]",
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
                    "## Examples 4, 5, and 7 — Evaluate Numerical Expressions\n\nEvaluate numerical expressions using the order of operations. The problems progress from simple powers to complex expressions with nested grouping symbols and fractions.\n\n### Step 1: Evaluate Powers\n\nFind the value of exponential expressions.\n\n[\n7^2 = 49\n]\n\n[\n14^3 = 2744\n]\n\n[\n2^6 = 64\n]\n\n### Step 2: Apply Order of Operations\n\nEvaluate expressions with multiple operations.\n\n[\n35 - 3 \\times 8\n]\n\nFirst multiply, then subtract:\n[\n35 - 24 = 11\n]\n\n[\n18 \\div 9 + 2 \\times 6\n]\n\nDivide and multiply from left to right, then add:\n[\n2 + 12 = 14\n]\n\n[\n10 + 8^3 \\div 16\n]\n\nEvaluate the power first, then divide, then add:\n[\n10 + 512 \\div 16 = 10 + 32 = 42\n]\n\n### Step 3: Evaluate Expressions with Grouping Symbols\n\nWork from the innermost grouping outward.\n\n[\n(6^3 - 9) \\div 23 \\times 4\n]\n\nEvaluate the power inside parentheses:\n[\n(216 - 9) \\div 23 \\times 4\n]\n\nSubtract inside parentheses:\n[\n207 \\div 23 \\times 4\n]\n\nDivide, then multiply:\n[\n9 \\times 4 = 36\n]\n\n### Step 4: Evaluate Fraction Expressions\n\nTreat the fraction bar as a grouping symbol for numerator and denominator.\n\n[\n\\frac{8 + 3^3}{12 - 7}\n]\n\nEvaluate the power in the numerator:\n[\n\\frac{8 + 27}{12 - 7}\n]\n\nAdd and subtract:\n[\n\\frac{35}{5} = 7\n]\n\n[\n\\frac{(1 + 6) \\times 9}{5^2 - 4}\n]\n\nEvaluate inside parentheses and the power:\n[\n\\frac{7 \\times 9}{25 - 4}\n]\n\nMultiply, subtract, then divide:\n[\n\\frac{63}{21} = 3\n]\n\n\n### Step 5: Evaluate Expressions with Parentheses and Fractions\n\n[\n4(16 \\div 2 + 6)\n]\n\nDivide inside parentheses first:\n[\n4(8 + 6)\n]\n\nAdd inside parentheses:\n[\n4 \\times 14 = 56\n]\n\n[\n13 - \\frac{1}{3}(11 - 5)\n]\n\nSubtract inside parentheses:\n[\n13 - \\frac{1}{3} \\times 6\n]\n\nMultiply the fraction:\n[\n13 - 2 = 11\n]\n\n[\n(5 \\times 2 - 9) + 2 \\times \\frac{1}{2}\n]\n\nMultiply inside parentheses:\n[\n(10 - 9) + 2 \\times \\frac{1}{2}\n]\n\nSubtract inside parentheses:\n[\n1 + 2 \\times \\frac{1}{2}\n]\n\nMultiply, then add:\n[\n1 + 1 = 2\n]\n\n### Step 6: Evaluate More Complex Expressions\n\n[\n62 - 3^2 \\times 8 + 11\n]\n\nEvaluate the power:\n[\n62 - 9 \\times 8 + 11\n]\n\nMultiply:\n[\n62 - 72 + 11\n]\n\nSubtract and add from left to right:\n[\n1\n]\n\n[\n4^3 \\div 8\n]\n\nEvaluate the power, then divide:\n[\n64 \\div 8 = 8\n]\n\n[\n20 + 3(8 - 5)\n]\n\nSubtract inside parentheses:\n[\n20 + 3 \\times 3\n]\n\nMultiply, then add:\n[\n20 + 9 = 29\n]\n\n### Step 7: Evaluate Expressions with Nested Brackets\n\n[\n3[4 - 8 + 4^2(2 + 5)] \n]\n\nWork from the innermost parentheses outward:\n[\n3[4 - 8 + 16(7)] \n]\n\nMultiply:\n[\n3[4 - 8 + 112] \n]\n\nAdd and subtract inside brackets:\n[\n3[108] = 324\n]\n\n### Step 8: Evaluate Complex Fraction Expressions\n\n[\n\\frac{2 \\times 8^2 - 2^2 \\times 8}{2 \\times 8}\n]\n\nEvaluate powers:\n[\n\\frac{2 \\times 64 - 4 \\times 8}{16}\n]\n\n\nMultiply in numerator:\n[\n\\frac{128 - 32}{16}\n]\n\nSubtract:\n[\n\\frac{96}{16} = 6\n]\n\n### Step 9: Evaluate Expressions with Multiple Grouping Levels\n\n[\n25 + [(16 - 3 \\times 5) + \\frac{12 + 3}{5}] \n]\n\nMultiply inside the inner parentheses:\n[\n25 + [(16 - 15) + \\frac{15}{5}] \n]\n\nSubtract and divide:\n[\n25 + [1 + 3] \n]\n\nAdd inside brackets:\n[\n25 + 4 = 29\n]\n\n### Step 10: Evaluate Expressions with Fractions and Powers\n\n[\n7^3 - \\frac{2}{3}(13 \\times 6 + 9) \\times 4\n]\n\nEvaluate the power and work inside parentheses:\n[\n343 - \\frac{2}{3}(78 + 9) \\times 4\n]\n\nAdd inside parentheses:\n[\n343 - \\frac{2}{3} \\times 87 \\times 4\n]\n\nMultiply fractions and whole numbers:\n[\n343 - 58 \\times 4\n]\n\nMultiply, then subtract:\n[\n343 - 232 = 111\n]",
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
                    "## Example 6 — Evaluate Real-World Expressions\n\nWrite and evaluate numerical expressions to solve real-world problems.\n\n### Step 1: Write the Expression\n\nTranslate the problem into a numerical expression before evaluating.\n\n\n**Biology:** Lavania observes 20 fruit flies on day 1. After 6 days, she has nine more than five times the initial amount.\n\nExpression:\n[\n5 \\times 20 + 9\n]\n\n### Step 2: Evaluate the Expression\n\n[\n5 \\times 20 + 9 = 100 + 9 = 109\n]\n\n**Precision (Diving):** A dive score is calculated using judge scores and a degree of difficulty. (A table showing the scoring method is provided in the worksheet.) Tyrell's scores are 8.0, 7.5, 6.5, 7.5, and 7.0 with a degree of difficulty of 2.5.\n\nExpression:\n[\n(8.0 + 7.5 + 6.5 + 7.5 + 7.0) \\times 2.5\n]\n\n**Ramp:** The side panel of a skateboard ramp is a trapezoid. Write an expression for the amount of wood needed to build two side panels. (A diagram with dimensions is provided in the worksheet.)\n\nExpression for area of one trapezoid:\n[\n\\frac{1}{2}(b_1 + b_2)h\n]\n\nExpression for two panels:\n[\n2 \\times \\frac{1}{2}(b_1 + b_2)h\n]",
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
                    "## Example 8 — Multi-Step Real-World Problem\n\nSolve a multi-step problem by writing and evaluating a numerical expression.\n\n### Step 1: Identify All Costs\n\nExtract each cost component from the problem or diagram.\n\n**Skiing:** The Sanchez family wants lift tickets for 2 adults and 3 children, 2 complete ski rentals, and a 16-ounce hot chocolate for each person. (Cost information is shown in a diagram in the worksheet.)\n\nExpression structure:\n[\n2 \\times (\\text{adult lift ticket}) + 3 \\times (\\text{child lift ticket}) + 2 \\times (\\text{ski rental}) + 5 \\times (\\text{hot chocolate})\n]\n\n### Step 2: Evaluate the Total Cost\n\nSubstitute values and evaluate using the order of operations.",
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
                    "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson: translating verbal expressions into numerical expressions, evaluating expressions using the order of operations, and applying expressions to real-world contexts. Problems include:\n\n* Writing numerical expressions from verbal descriptions, including expressions with powers.\n* Constructing arguments about the correctness of an evaluated expression and identifying who applied the order of operations correctly.\n* Reasoning puzzles that require creating an expression with specific constraints (for example, using 2, 4, and 5 with one set of parentheses to get a value of 50).\n* Interpreting the meaning of numbers and operations in real-world cost expressions, and modifying expressions when a fee changes.\n* Finding errors in student work and explaining the correct approach using the order of operations.\n* Persevering through multi-step area problems by writing equivalent expressions in different ways.\n* Creating real-world situations that match given numerical expressions.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-1-lesson-2",
        title: "Algebraic Expressions",
        orderIndex: 2,
        description:
          "Students translate between algebraic and verbal expressions, write algebraic expressions to model real-world situations, and evaluate them by substituting given values.",
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
                    "## Vocabulary\n\n* **Algebraic expression** — A mathematical phrase that can contain numbers, variables, and operation symbols, but no equals sign\n* **Verbal expression** — A mathematical phrase described using words instead of symbols\n* **Variable** — A symbol, usually a letter, used to represent an unknown quantity\n* **Coefficient** — The numerical factor multiplied by a variable in a term\n* **Term** — A single number, variable, or the product of numbers and variables separated by addition or subtraction in an expression",
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
                    "## Learn: Translating Between Algebraic and Verbal Expressions\n\nMathematical communication requires fluency in moving between symbolic notation and verbal descriptions. Key translation rules include:\n\n### Key Concept: Translation Conventions\n\n* Addition is described as \"sum,\" \"more than,\" or \"increased by\"\n* Subtraction is described as \"difference,\" \"less than,\" or \"decreased by\"\n* Multiplication is described as \"product,\" \"times,\" or \"of\"\n* Division is described as \"quotient,\" \"divided by,\" or \"per\"\n* Exponents are described as \"squared,\" \"cubed,\" or \"to the power of\"\n* Grouping with parentheses indicates a quantity that is treated as a single unit",
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
                    "## Example 1 — Write Verbal Expressions for Algebraic Expressions\n\nGiven an algebraic expression, write a correct verbal expression using appropriate mathematical terminology.\n\n### Step 1: Identify the Operation Structure\n\nBreak the expression into its components: terms, coefficients, variables, exponents, and operations.\n\nRepresentative expressions:\n[\n4q \\quad \\frac{1}{8}y \\quad 15 + r \\quad w - 24 \\quad 3x^2 \\quad \\frac{r^4}{9}\n]\n\n### Step 2: Construct the Verbal Expression\n\nUse precise language that matches each operation. For example:\n* [ 4q ] → \"the product of 4 and [ q ]\"\n* [ 15 + r ] → \"15 more than [ r ]\" or \"the sum of 15 and [ r ]\"\n* [ 3x^2 ] → \"3 times [ x ] squared\"\n* [ \\frac{r^4}{9} ] → \"the quotient of [ r ] to the fourth power and 9\"\n\nFor more complex expressions with multiple operations:\n[\n2a + 6 \\quad r^4 \\cdot t^3 \\quad 25 + 6x^2 \\quad 6f^2 + 5f \\quad \\frac{3a^5}{2} \\quad 9(a^2 - 1)\n]\n\nDescribe each operation in the correct order, noting that parentheses indicate a grouped quantity.",
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
                    "## Example 2 — Write Algebraic Expressions for Verbal Expressions\n\nGiven a verbal description, translate it into a correct algebraic expression.\n\n### Step 1: Identify the Operation Words\n\nLocate keywords that indicate which operation to use.\n\n### Step 2: Write the Algebraic Expression\n\nRepresentative verbal descriptions and their translations:\n* \"[ x ] more than 7\" → [ x + 7 ] \n* \"5 times a number\" → [ 5n ] \n* \"one third of a number\" → [ \\frac{1}{3}n ] \n* \"[ f ] divided by 10\" → [ \\frac{f}{10} ] \n* \"the quotient of 45 and [ r ]\" → [ \\frac{45}{r} ] \n* \"three times a number plus 16\" → [ 3n + 16 ] \n* \"18 decreased by 3 times [ d ]\" → [ 18 - 3d ] \n* \"[ k ] squared minus 11\" → [ k^2 - 11 ] \n* \"20 divided by [ t ] to the fifth power\" → [ \\frac{20}{t^5} ] \n* \"the sum of a number and 10\" → [ n + 10 ] \n* \"15 less than the sum of [ k ] and 2\" → [ (k + 2) - 15 ] \n* \"the product of 18 and [ q ]\" → [ 18q ] \n* \"6 more than twice [ m ]\" → [ 2m + 6 ] \n\nPay special attention to phrases like \"less than,\" which reverses the order of subtraction.",
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
                    "## Example 3 — Write Expressions for Real-World Situations\n\nTranslate contextual descriptions into algebraic expressions that model quantities in real-world scenarios.\n\n### Step 1: Identify the Quantities and Relationships\n\nRead the problem to determine what quantities are known, what is unknown, and how they relate mathematically.\n\n### Step 2: Define Variables and Write the Expression\n\n\nRepresentative scenarios:\n* **Bytes and kilobytes:** If there are 1024 bytes in a kilobyte, the number of bytes in [ n ] kilobytes is [ 1024n ] \n* **Average rate:** The average number of shows attended per year over [ y ] years is [ \\frac{6136}{y} ] \n* **Average of two values:** The average difference between tides of 19 feet and [ x ] feet is [ \\frac{19 + x}{2} ] \n* **Cost with coupon:** The cost of [ t ] T-shirts at a given price with a 10-dollar-off coupon\n* **Membership cost:** A one-time fee of 100 dollars plus 30 dollars per month for [ m ] months is [ 100 + 30m ] \n* **Group activity cost:** [ f ] friends bowling at 5 dollars per player plus 45 dollars per hour for [ h ] hours is [ 5f + 45h ] ",
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
                    "## Example 4 — Evaluate Algebraic Expressions\n\nSubstitute given values for variables and evaluate the expression using the order of operations.\n\n### Step 1: Substitute the Given Values\n\nReplace each variable with its assigned value.\n\n### Step 2: Apply the Order of Operations\n\nSimplify exponents, then perform multiplication and division from left to right, then addition and subtraction from left to right.\n\nRepresentative expressions with [ g = 2 ], [ r = 3 ], [ t = 11 ]:\n[\ng + 6t \\quad 7 - gr \\quad r^2 + (g^3 - 8)^5 \\quad (2t + 3g) \\div 4 \\quad t^2 + 8rt + r^2 \\quad 3g(g + r)^2 - 1\n]\n\nRepresentative expressions with [ a = 8 ], [ b = 4 ], [ c = 16 ]:\n[\na^2bc - b^2 \\quad \\frac{c^2}{b^2} + \\frac{b^2}{a^2} \\quad \\frac{2b + 3c^2}{4a^2 - 2b} \\quad \\frac{3ab + c^2}{a} \\quad \\left(\\frac{a}{b}\\right)^2 - \\frac{c}{a - b} \\quad \\frac{(2a - b)^2}{ab} + \\frac{c - a}{b^2}\n]\n\nRepresentative expressions with [ x = 6 ], [ y = 8 ], [ z = 3 ]:\n[\nxy + z \\quad yz - x \\quad 2x + 3y - z \\quad 2(x + z) - y \\quad 5z + (y - x) \\quad 5x - (y + 2z)\n]\n[\nz^3 + (y^2 - 4x) \\quad \\frac{y + xz}{2} \\quad \\frac{3y + x^2}{z}\n]",
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
                    "## Example 5 — Write and Evaluate Expressions from Word Problems\n\nCreate an algebraic expression for a real-world situation, then substitute a given value to find a numerical answer.\n\n\n### Step 1: Write the Expression\n\nTranslate the word problem into an algebraic expression using the defined variable.\n\n### Step 2: Substitute and Evaluate\n\nReplace the variable with the given value and compute the result.\n\n\nRepresentative problems:\n* **School enrollment:** Jefferson High has 100 less than 5 times as many students as Taft High. If Taft has [ t ] students, Jefferson has [ 5t - 100 ]. When [ t = 300 ], Jefferson has [ 5(300) - 100 = 1400 ] students.\n* **Altitude comparison:** Guadalupe Peak is 671 feet more than double the altitude of Mount Sunflower. If Mount Sunflower has altitude [ n ], Guadalupe Peak has [ 2n + 671 ]. When [ n = 4039 ], the altitude is [ 2(4039) + 671 = 8749 ] feet.\n* **Taxi fare:** A base fee of 1.75 dollars plus 3.45 dollars per mile for [ m ] miles is [ 1.75 + 3.45m ]. For 8 miles, the cost is [ 1.75 + 3.45(8) = 29.35 ] dollars.\n* **Area of a circle:** The area is the product of [ \\pi ] and the square of the radius [ r ]: [ A = \\pi r^2 ]. Using [ \\pi = 3.14 ], evaluate for a given radius.",
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
                    "## Example 6 — Mixed Review with Structure and Reasoning\n\nApply expression-writing and evaluation skills to problems requiring deeper reasoning, multiple steps, or open-ended construction.\n\n### Step 1: Analyze the Problem Requirements\n\nIdentify whether the task asks for translation, evaluation, comparison, or construction.\n\n### Step 2: Execute the Required Process\n\n\nRepresentative problem types:\n* **Dual translation:** Write two different verbal expressions for a single algebraic expression, such as [ \\frac{5x}{2} + y^3 ], then evaluate for given values [ x = 4 ] and [ y = 2 ] \n* **Expression evaluation with multiple variables:** Evaluate [ \\frac{7a + b}{b + c} ] when [ a = 2 ], [ b = 6 ], [ c = 4 ] \n* **Open-ended construction:** Create an algebraic expression that includes both a sum and a product, then write its verbal expression; or create a verbal expression with a difference and a quotient, then write its algebraic form\n* **Surface area application:** For a cube with edge [ b ], write expressions for paint needed (one coat: surface area [ 6b^2 ]; two coats: [ 12b^2 ]), then set up an inequality for coverage\n* **Rental car cost analysis:** Write expressions for additional mileage charges and miles over 200, then solve for total miles driven given a total cost\n* **Persevere problem:** Find a positive whole number [ x ] such that the volume of a cube, [ x^3 ], equals 6 times the area of one face, [ 6x^2 ] ",
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
                    "## Mixed Exercises\n\nThe mixed exercises consolidate all skills from the lesson: translating between verbal and algebraic expressions, writing expressions from real-world contexts, and evaluating expressions with substitution. Problems range from straightforward translation and evaluation to multi-step word problems and open-ended reasoning tasks that require students to construct their own expressions and explain mathematical concepts in writing.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-1-lesson-3",
        title: "Properties of Real Numbers",
        orderIndex: 3,
        description:
          "Students identify and apply reflexive, symmetric, and transitive properties of equality, evaluate expressions by naming properties used, and use commutative, associative, identity, and inverse properties to simplify calculations.",
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
                    "## Vocabulary\n\n* **Reflexive Property of Equality** — Any quantity is equal to itself: [ a = a ].\n* **Symmetric Property of Equality** — If [ a = b ], then [ b = a ].\n* **Transitive Property of Equality** — If [ a = b ] and [ b = c ], then [ a = c ].\n* **Commutative Property** — The order of two addends or factors does not change the sum or product: [ a + b = b + a ] and [ ab = ba ].\n* **Associative Property** — The grouping of three or more addends or factors does not change the sum or product: [ (a + b) + c = a + (b + c) ] and [ (ab)c = a(bc) ].\n* **Additive Identity** — The sum of any number and zero is the number itself: [ a + 0 = a ].\n* **Multiplicative Identity** — The product of any number and one is the number itself: [ a \\times 1 = a ].\n* **Additive Inverse** — The sum of a number and its opposite is zero: [ a + (-a) = 0 ].\n* **Multiplicative Inverse** — The product of a number and its reciprocal is one: [ a \\times \\frac{1}{a} = 1 ], where [ a \\ne 0 ].\n* **Closure Property** — The sum or product of any two numbers in a set is also a member of that set.",
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
                    "## Learn: Properties of Equality\n\nRecognize and use the fundamental properties that allow equations to be rewritten and rearranged.\n\n### Key Concept: Properties of Equality\n\n* **Reflexive:** [ a = a ] \n* **Symmetric:** If [ a = b ], then [ b = a ].\n* **Transitive:** If [ a = b ] and [ b = c ], then [ a = c ].\n* These properties justify statements about equivalent quantities and are used to rearrange and simplify equations.",
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
                    "## Example 1 — Identify Properties of Equality\n\nGiven a true equation or statement, determine which property of equality justifies it.\n\n### Step 1: Analyze the Statement\n\nCompare the structure of the given statement to the form of each property.\n\n\nFor example, [ 4 + 17 = 21 ] implies [ 21 = 4 + 17 ], which uses the **Symmetric Property**.\n\nThe statement [ x + 3 = x + 3 ] uses the **Reflexive Property**.\n\nA chain such as [ 6 + 2 = 4 + 4 ] and [ 4 + 4 = 8 ] leading to [ 6 + 2 = 8 ] uses the **Transitive Property**.",
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
                    "## Example 2 — Apply Properties of Equality to Complete Statements\n\nUse a specified property to fill in the missing part of an equation.\n\n### Step 1: Identify the Given Property\n\nRead the name of the property provided for the problem.\n\n### Step 2: Rewrite the Equation\n\nApply the property to determine the missing value or expression.\n\nFor example, given [ 23 + 14 = 37 ], the Symmetric Property yields [ 37 = 23 + 14 ].\n\nGiven [ a + 5 = b + 3 ] and [ a + 5 = 12 ], the Transitive Property gives [ b + 3 = 12 ].\n\nGiven [ 34 = 19 + 15 ], the Symmetric Property gives [ 19 + 15 = 34 ].",
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
                    "## Example 3 — Real-World Application: Toll Roads\n\nApply properties of equality to interpret a real-world toll table.\n\n\n### Step 1: Read the Table\n\nExamine the toll amounts for travel between pairs of highway exits, assuming the toll is the same in both directions.\n\n### Step 2: Apply the Symmetric Property\n\nDetermine the toll for a reverse trip and justify which property guarantees the amount is unchanged.\n\nFor example, if traveling from Exit 8 to Exit 15 costs a certain amount, the return from Exit 15 to Exit 8 costs the same amount by the **Symmetric Property of Equality**.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Properties of Real Numbers\n\nSimplify numerical expressions by applying properties of real numbers at each step.\n\n### Key Concept: Order of Operations and Properties\n\n* Perform operations inside grouping symbols first.\n* Apply multiplication, division, addition, and subtraction in the correct order.\n* Name the property that justifies each rewrite, such as substitution or the commutative and associative properties.",
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
                    "## Example 4 — Evaluate Expressions and Name Properties\n\nEvaluate multi-step numerical expressions and justify each step with a property.\n\n\n### Step 1: Simplify Inside Grouping Symbols\n\nEvaluate parentheses or brackets first, following the order of operations.\n\n[\n3(22 - 3 \\times 7)\n]\n\n### Step 2: Perform Remaining Operations\n\nContinue simplifying and name the property used in each step, such as the Substitution Property of Equality.\n\nVariations include expressions with fractions, division inside brackets, and nested grouping symbols such as:\n\n[\n2\\left[5 - (15 \\div 3)\\right] \n]\n\n[\n6 + 9\\left[10 - 2(2 + 3)\\right] \n]\n\n\n[\n2(6 \\div 3 - 1) \\times \\frac{1}{2}\n]",
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
                    "## Example 5 — Simplify Expressions Using Properties of Numbers\n\nRearrange and group terms to make mental arithmetic easier, naming the property used in each step.\n\n### Step 1: Look for Compatible Numbers\n\nIdentify pairs that sum to a whole number, a multiple of 10, or a simple product.\n\n### Step 2: Rearrange and Group\n\nUse the Commutative and Associative Properties to reorder and regroup terms.\n\nFor sums:\n\n[\n25 + 14 + 15 + 36 = (25 + 15) + (14 + 36)\n]\n\nVariations include decimal sums such as [ 4.3 + 2.4 + 3.6 + 9.7 ], fraction sums such as [ 4\\frac{4}{9} + 7\\frac{2}{9} ], and products such as [ 2 \\times 8 \\times 10 \\times 2 ] and [ \\frac{4}{3} \\times 7 \\times 3 \\times 10 ].\n\nAdditional problems ask students to evaluate products involving mixed numbers, such as [ 1\\frac{5}{6} \\times 24 \\times 3\\frac{1}{11} ] and [ 2\\frac{3}{4} \\times 1\\frac{1}{8} \\times 32 ].",
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
                    "## Example 6 — Evaluate Algebraic Expressions\n\nSubstitute given values for variables and simplify, combining like terms when possible.\n\n### Step 1: Substitute Values\n\nReplace each variable with its given value. For example, with [ a = -1 ], [ b = 4 ], and [ c = 6 ]:\n\n[\n4a + 9b - 2c\n]\n\n### Step 2: Simplify\n\nPerform the arithmetic and combine like terms.\n\nVariations include expressions with squared terms such as [ 3c^2 + 2c + 2c^2 ] and expressions requiring distribution or combining like terms such as [ a - b + 5a - 2b ] and [ 8a + 5b - 11a - 7b ].\n\nAdditional problems ask students to identify which property produces a given result (for example, [ 5 \\times n \\times 2 = 0 ] uses the Zero Product Property) and to evaluate expressions while naming multiple properties used.",
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
                    "## Mixed Exercises\n\nApply properties of real numbers to solve for an unknown, solve word problems, and analyze mathematical statements.\n\n* **Solve for x and name the property:** Given equations such as [ 8 = 8 + x ], [ 3.2 + x = 3.2 ], [ 10x = 10 ], [ \\frac{1}{2} \\times x = \\frac{1}{2} \\times 7 ], [ x + 0 = 5 ], [ 1 \\times x = 3 ], [ \\frac{4}{3} \\times \\frac{3}{4} = x ], and [ \\frac{1}{3} \\times x = 1 ], determine the value of [ x ] and identify whether the Additive Identity, Multiplicative Identity, Additive Inverse, Multiplicative Inverse, or Symmetric Property applies.\n\n* **Mental math and word problems:** Calculate the area of a triangular banner by rearranging factors, determine the total amount paid for a car including a down payment and monthly payments, count total bones in the human body using the Associative Property, and find the total cost of school supplies using compatible pairs.\n\n* **Analyze and justify:** Determine whether the Commutative Property holds for subtraction (sometimes, always, or never), provide counterexamples showing division is not commutative or associative, explain why 0 has no multiplicative inverse, analyze whether 1 can be an additive identity, decide whether whole numbers are closed under subtraction, multiplication, and division, identify which equation among four does not belong, and write an original expression that simplifies to 160 using the Commutative and Associative Properties.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-1-lesson-4",
        title: "Distributive Property",
        orderIndex: 4,
        description:
          "Students apply the Distributive Property to rewrite and evaluate numerical expressions, simplify algebraic expressions with one or more variables, and translate verbal expressions into algebraic form.",
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
                    "## Vocabulary\n\n* **Distributive Property** — For all real numbers [ a ], [ b ], and [ c ], [ a(b + c) = ab + ac ] and [ a(b - c) = ab - ac ].\n* **Like terms** — Terms that have the same variable raised to the same power.\n* **Coefficient** — The numerical factor of a term that contains a variable.\n* **Constant** — A term that has no variable factor.\n* **Simplest form** — An expression with no like terms or parentheses.",
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
                    "## Learn: The Distributive Property\n\nThe Distributive Property connects multiplication with addition and subtraction. It allows you to multiply a sum or difference by a factor by distributing the factor to each term inside the parentheses.\n\n### Key Concept: Distributive Property\n\n* For any real numbers [ a ], [ b ], and [ c ]:\n[\n  a(b + c) = ab + ac\n]\n[\n  a(b - c) = ab - ac\n]\n* The property works from the left ([ a(b + c) ]) or from the right ([ (b + c)a ]).\n* When the factor is negative, distribute the negative sign to each term.",
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
                    "## Example 1 — Evaluate Numerical Expressions\n\nUse the Distributive Property to rewrite a product of a number and a sum or difference, then evaluate.\n\n### Step 1: Rewrite Using the Distributive Property\n\nSplit the sum or difference inside the parentheses and multiply each part by the factor outside.\n\n[\n(4 + 5)6 = 4 \\cdot 6 + 5 \\cdot 6\n]\n\n[\n7(13 + 12) = 7 \\cdot 13 + 7 \\cdot 12\n]\n\n[\n6(6 - 1) = 6 \\cdot 6 - 6 \\cdot 1\n]\n\n### Step 2: Evaluate\n\n\nAdd or subtract the resulting products.\n\n[\n4 \\cdot 6 + 5 \\cdot 6 = 24 + 30 = 54\n]\n\n### Word Problem Applications\n\nWrite an expression that models a real-world situation and use the Distributive Property to find the total.\n\n* **Ticket costs:** Find the total cost for a group when each ticket has the same price.\n[\n  39(23 + 2) = 39 \\cdot 23 + 39 \\cdot 2\n]\n* **Salaries:** Estimate the total cost to employ two people for multiple years.\n[\n  5(55{,}000 + 52{,}000) = 5 \\cdot 55{,}000 + 5 \\cdot 52{,}000\n]\n* **Fabric needed:** Multiply a whole number by a mixed number by writing the mixed number as a sum of an integer and a fraction.\n[\n  10 \\cdot 3\\frac{3}{5} = 10\\left(3 + \\frac{3}{5}\\right) = 10 \\cdot 3 + 10 \\cdot \\frac{3}{5}\n]\n* **Monthly deposits:** Find the total in multiple accounts after a given number of months.",
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
                    "## Example 2 — Mental Math with the Distributive Property\n\nRewrite a product involving a number close to a round value, then evaluate using mental math.\n\n### Step 1: Rewrite in a Convenient Form\n\nExpress the factor as a sum or difference that uses a multiple of 10, 100, or a whole number.\n\n[\n7 \\cdot 497 = 7(500 - 3) = 7 \\cdot 500 - 7 \\cdot 3\n]\n\n[\n6(525) = 6(500 + 25) = 6 \\cdot 500 + 6 \\cdot 25\n]\n\n[\n36 \\cdot 3\\frac{1}{4} = 36\\left(3 + \\frac{1}{4}\\right) = 36 \\cdot 3 + 36 \\cdot \\frac{1}{4}\n]\n\n[\n5 \\cdot 89 = 5(90 - 1) = 5 \\cdot 90 - 5 \\cdot 1\n]\n\n[\n9 \\cdot 99 = 9(100 - 1) = 9 \\cdot 100 - 9 \\cdot 1\n]\n\n### Step 2: Compute Mentally\n\nUse the simpler products to find the result quickly.\n\n[\n7 \\cdot 500 - 7 \\cdot 3 = 3500 - 21 = 3479\n]\n\nVariations include decimals ([ 8 \\cdot 1.5 ]), numbers near 100 ([ 12 \\cdot 98 = 12(100 - 2) ]), and fractions ([ 15\\left(2\\frac{1}{3}\\right) ]).",
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
                    "## Examples 3 and 4 — Simplify Algebraic Expressions\n\nRewrite an algebraic expression by distributing a constant to each term inside parentheses, then simplify if possible.\n\n### Step 1: Distribute the Factor\n\nMultiply the outside factor by every term inside the parentheses.\n\n\n[\n2(x + 4) = 2 \\cdot x + 2 \\cdot 4 = 2x + 8\n]\n\n[\n(5 + n)3 = 5 \\cdot 3 + n \\cdot 3 = 15 + 3n\n]\n\n[\n(4 - 3m)8 = 4 \\cdot 8 - 3m \\cdot 8 = 32 - 24m\n]\n\n\n[\n11(4d + 6) = 11 \\cdot 4d + 11 \\cdot 6 = 44d + 66\n]\n\n[\n4(8p + 16q - 7r) = 32p + 64q - 28r\n]\n\n[\n6(2c - cd^2 + d) = 12c - 6cd^2 + 6d\n]\n\n### Step 2: Distribute Negative and Fractional Coefficients\n\nWhen the outside factor is negative or a fraction, watch the sign of each term after distributing.\n\n[\n-3(2x - 6) = -3 \\cdot 2x - 3(-6) = -6x + 18\n]\n\n[\n\\left(\\frac{1}{3} - 2b\\right)27 = \\frac{1}{3} \\cdot 27 - 2b \\cdot 27 = 9 - 54b\n]\n\n[\n-2(7m - 8n - 5p) = -14m + 16n + 10p\n]\n\n[\n(0.3 - 6x)9 = 0.3 \\cdot 9 - 6x \\cdot 9 = 2.7 - 54x\n]\n\n[\n-4\\left(4a + 2b - \\frac{1}{2}c\\right) = -16a - 8b + 2c\n]\n\n### Step 3: Combine Like Terms (if any)\n\nAfter distributing, add or subtract any like terms.",
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
                    "## Example 5 — Combine Like Terms\n\nSimplify an expression by combining like terms. If no like terms exist, write **simplified**.\n\n### Step 1: Identify Like Terms\n\nTerms are alike only if they have the same variable raised to the same power.\n\n\n[\n13r + 5r = (13 + 5)r = 18r\n]\n\n[\n7m + 7 - 5m = (7m - 5m) + 7 = 2m + 7\n]\n\n[\n5z^2 + 3z + 8z^2 = (5z^2 + 8z^2) + 3z = 13z^2 + 3z\n]\n\n[\n7m + 2m + 5p + 4m = (7m + 2m + 4m) + 5p = 13m + 5p\n]\n\n[\n6x + 4y + 5x = (6x + 5x) + 4y = 11x + 4y\n]\n\n[\n3m + 5g + 6g + 11m = (3m + 11m) + (5g + 6g) = 14m + 11g\n]\n\n### Step 2: Recognize When Simplification Is Not Possible\n\nExpressions such as [ 3x^3 - 2x^2 ] or [ 3y^2 - 2y + 9 ] contain no like terms, so they are already simplified.\n\n### Variations\n\n* Higher powers: [ 5k + 3k^3 + 7k + 9k^3 = 12k + 12k^3 ] \n* Single variable: [ 17g + g = 18g ] and [ 2x^2 + 6x^2 = 8x^2 ] \n* Three terms with subtraction: [ 3q^2 + q - q^2 = 2q^2 + q ] ",
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
                    "## Example 6 — Translate and Simplify Verbal Expressions\n\nTranslate a verbal description into an algebraic expression, then simplify and name the properties used.\n\n### Step 1: Write the Algebraic Expression\n\nParse the words to identify operations and their order.\n\n*The product of 9 and t squared, increased by 3 times the sum of 2 and t squared:*\n[\n9t^2 + 3(2 + t^2)\n]\n\n*The product of 3 and a, plus 5 times the difference of a and b:*\n[\n3a + 5(a - b)\n]\n\n*3 times the sum of r and d squared increased by 2 times the sum of r and d squared:*\n[\n3(r + d^2) + 2(r + d^2)\n]\n\n### Step 2: Simplify and Identify Properties\n\n\nDistribute and combine like terms, then state which properties were applied.\n\n[\n9t^2 + 3(2 + t^2) = 9t^2 + 6 + 3t^2 = 12t^2 + 6\n]\n\nProperties used: Distributive Property, Commutative Property of Addition, Associative Property of Addition.\n\n\n[\n3a + 5(a - b) = 3a + 5a - 5b = 8a - 5b\n]",
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
                    "## Mixed Exercises\n\nSimplify a variety of expressions that require one or more skills from the lesson:\n\n* Distribute a constant across parentheses and then combine like terms.\n[\n  3x + 7(3x + 4) = 3x + 21x + 28 = 24x + 28\n]\n* Distribute across multiple terms and combine with existing terms.\n[\n  4(fg + 3g) + 5g = 4fg + 12g + 5g = 4fg + 17g\n]\n* Combine like terms involving fractions.\n[\n  a + \\frac{a}{5} + \\frac{2}{5}a\n]\n* Simplify expressions with grouping and multiple variables.\n[\n  7(2x + y) + 6(x + 5y) = 14x + 7y + 6x + 30y = 20x + 37y\n]\n\nAdditional problems include reasoning about the Distributive Property in geometric contexts (perimeter, area), identifying errors in calculations, analyzing whether statements about properties are true or false, and creating original expressions that simplify to a given result.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-1-lesson-5",
        title: "Expressions Involving Absolute Value",
        orderIndex: 5,
        description:
          "Students write absolute value expressions that model real-world distances and accuracy as positive differences, evaluate absolute value expressions by substituting given values, and analyze whether absolute value statements are equivalent or true in general.",
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
                    "## Vocabulary\n\n* **Absolute value** — The distance of a number from zero on the number line, always nonnegative; denoted [ |x| ].\n* **Accuracy** — The positive difference between a measured or reported value and the actual value.\n* **Positive difference** — The nonnegative distance between two quantities on the number line, equivalent to the absolute value of their difference.",
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
                    "## Learn: Absolute Value as Distance and Difference\n\nThe absolute value of a number represents its distance from zero. More broadly, [ |a - b| ] represents the distance between two values [ a ] and [ b ] on the number line, regardless of which is larger. This property makes absolute value useful for describing accuracy, tolerance, and any situation where only the magnitude of a difference matters.\n\n### Key Concept: Equivalent Absolute Value Expressions for a Difference\n\n* The positive difference between two quantities [ a ] and [ b ] can be written equivalently as [ |a - b| ] or [ |b - a| ].\n* Both forms yield the same nonnegative result because distance is symmetric.\n* When evaluating expressions containing absolute value, simplify inside the absolute value bars first, then apply the absolute value, and finally complete any remaining operations.",
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
                    "## Example 1 — Write Absolute Value Expressions for Real-World Accuracy\n\nTranslate real-world accuracy and tolerance situations into two equivalent absolute value expressions.\n\n### Step 1: Identify the Two Quantities\n\nDetermine the reported or measured value and the actual or target value. For example, a thermometer reading [ t ] and the actual pool temperature [ p ].\n\n### Step 2: Write the Expressions\n\nWrite two equivalent absolute value expressions representing the positive difference:\n\n[\n|t - p| \\quad \\text{and} \\quad |p - t|\n]\n\nRepeat this process for scenarios such as a box of golf balls with a target weight of 540 grams and an actual weight of [ g ] grams:\n\n[\n|g - 540| \\quad \\text{and} \\quad |540 - g|\n]",
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
                    "## Example 2 — Evaluate Absolute Value Expressions with Integers\n\nSubstitute given integer values into absolute value expressions and simplify.\n\n### Step 1: Substitute Values\n\nReplace each variable with its assigned integer value. For example, given [ m = -4 ], [ n = 1 ], [ p = 2 ], [ q = -6 ], [ r = 5 ], and [ t = -2 ], substitute into an expression such as:\n\n[\n|-n - 2mp|\n]\n\n### Step 2: Simplify Inside the Absolute Value\n\nFollow the order of operations. Multiply before adding or subtracting:\n\n[\n|-1 - 2(-4)(2)| = |-1 + 16| = |15| = 15\n]\n\n### Step 3: Apply the Absolute Value and Final Operations\n\nFor expressions with a negative sign outside the absolute value, such as:\n\n[\n-|10 - 7r + 8m + 2p|\n]\n\nsimplify inside first, take the absolute value, then apply the outer negative sign.",
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
                    "## Example 3 — Evaluate Absolute Value Expressions with Integers, Decimals, and Fractions\n\nEvaluate more complex absolute value expressions using three different sets of assigned values.\n\n### Part A — Integer Values\n\nGiven integer values for [ a ], [ b ], [ c ], [ h ], [ y ], and [ z ], evaluate expressions that combine absolute value with addition, subtraction, and multiplication. For example:\n\n[\n|2b - 3y| + 5z\n]\n\nSubstitute, simplify inside the absolute value, apply the absolute value, and then complete the remaining arithmetic.\n\n\n### Part B — Decimal and Integer Values\n\nGiven values including decimals such as [ x = 2.1 ] and [ z = -4.2 ], evaluate expressions such as:\n\n[\n|2x + z| + 2y\n]\n\n\nand\n\n[\n-a + |2x - a|\n]\n\n### Part C — Fraction Values\n\nGiven fractional values such as [ a = -\\frac{1}{2} ], [ b = \\frac{3}{4} ], and [ c = -\\frac{2}{3} ], evaluate expressions by carefully applying order of operations with fractions. For example:\n\n[\n-|6c - 16b| + 1\n]\n\nand\n\n[\n|2 - (a - 6b)| + 18c\n]",
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
                    "## Mixed Exercises\n\nThe mixed exercises consolidate all skills from the lesson: writing absolute value expressions for real-world accuracy, evaluating absolute value expressions with various number types, and analyzing the structure and properties of absolute value. Problems include a two-part GPS accuracy application, a jar-guessing accuracy and evaluation task, creating an original real-world situation for a given expression, identifying an error in a proposed equivalent expression, and determining whether a general claim about absolute value is true or false with justification.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-1-lesson-6",
        title: "Descriptive Modeling and Accuracy",
        orderIndex: 6,
        description:
          "Students use ratios and percentages as metrics to model real-world situations, apply appropriate rounding strategies based on context, determine reasonable levels of accuracy in multi-step calculations, and evaluate the accuracy of reported data.",
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
                    "## Vocabulary\n\n* **metric** — a standard of measurement used to compare or evaluate a quantity.\n* **ratio** — a comparison of two quantities by division.\n* **debt-to-income ratio** — the ratio of monthly debt payments to monthly gross income.\n* **accuracy** — the degree to which a measured or calculated value conforms to the actual value.\n* **reasonable level of accuracy** — an appropriate precision for a given real-world context.",
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
                    "## Learn: Using Ratios as Metrics\n\nA metric is a ratio used to evaluate a situation. To apply a metric, set up the ratio, compare it to a given threshold, and solve for the unknown quantity.\n\n### Key Concept: Ratios as Metrics\n\n* A metric has the form [ \\frac{\\text{part}}{\\text{whole}} ].\n* To test whether a quantity meets a standard, set up an inequality using the metric and the threshold value.\n* Solve the inequality for the unknown value.",
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
                    "## Example 1 — Set Up and Evaluate Ratios as Metrics\n\nStudents set up ratios from real-world scenarios and compare them to a threshold value to answer questions.\n\n### Step 1: Define the Ratio\n\nIdentify the part and the whole in the problem. Write the ratio in the form:\n[\n\\frac{\\text{part}}{\\text{whole}}\n]\n\nFor example, a test score metric is:\n[\n\\frac{\\text{number of questions answered correctly}}{\\text{total number of questions}}\n]\n\n### Step 2: Compare to the Threshold\n\nSet up an inequality using the metric and the given threshold. For a student to earn an A or B, the ratio must be greater than or equal to 0.8:\n[\n\\frac{x}{40} \\ge 0.8\n]\n\n\nSolve for [ x ] to find the minimum number of correct answers needed.\n\n### Variation: Percentage Thresholds\n\nSome problems use a percentage threshold instead of a decimal ratio. Convert the percentage to a decimal and set up the inequality the same way. For example, scoring 84% or greater on a 46-point exam:\n[\n\\frac{x}{46} \\ge 0.84\n]\n\n\n### Variation: Time Ratios\n\nA track coach may compare a runner's time to a benchmark. If the ratio of a runner's time to 12 seconds must be less than or equal to 0.95:\n[\n\\frac{t}{12} \\le 0.95\n]\n\nSolve for [ t ] to find the slowest allowable time.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Comparing Calculation Methods\n\nDifferent methods for estimating a quantity can produce different results. Students compare an estimated method to an exact method and evaluate which is more appropriate.\n\n### Key Concept: Estimated vs. Exact Methods\n\n* An estimated method uses an average or rounded value to simplify calculations.\n* An exact method uses the precise value.\n* The context determines whether an estimate or an exact value is more useful.",
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
                    "## Example 2 — Calculate and Compare Using Different Methods\n\nStudents calculate ratios and compare estimated versus exact calculation methods in real-world contexts.\n\n\n### Step 1: Calculate a Debt-to-Income Ratio\n\nThe debt-to-income ratio is calculated as:\n[\n\\frac{\\text{monthly expenses}}{\\text{monthly salary}}\n]\n\nFor monthly expenses of [ 1850 ] and a monthly salary of [ 2500 ]:\n[\n\\frac{1850}{2500}\n]\n\n### Step 2: Compare Estimated and Exact Methods\n\nSome problems present two pricing or planning methods. One method multiplies an average value by a rate; the other multiplies the exact value by a different rate. Calculate both and compare. For example, if a service multiplies the average number of hours by [ 50 ] while another multiplies the exact hours by [ 60 ], compute the cost from each provider and determine which is lower for a given situation.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Context-Appropriate Rounding\n\nWhen a calculator returns a long decimal, the context determines how to round the result. You cannot simply round to the nearest whole number if the context requires a different approach.\n\n### Key Concept: Rounding Strategies\n\n* When sharing a fixed quantity, you may need to round down, round up, or report a repeating decimal depending on the context.\n* When determining how many items fit in a space, you may need to round down because partial items are not possible.\n* When ensuring everyone gets enough, you may need to round up.",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Worked Example 3",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Apply Context-Appropriate Rounding\n\nStudents interpret calculator results and choose an appropriate rounding strategy based on the real-world context.\n\n\n### Step 1: Perform the Division\n\nA calculator may return a long decimal such as:\n[\n20 \\div 3 = 6.666666667\n]\n\n### Step 2: Choose the Appropriate Rounding\n\n* **Sharing money:** If [ 20 ] is shared among 3 people, each person could receive [ 6.67 ] to distribute the full amount fairly.\n* **Dividing snack bars:** If 14 snack bars are shared among 6 students, each student could receive 2 whole snack bars with some remainder.\n* **Seating arrangements:** If 60 people attend a banquet and 8 people fit at a table, round up to ensure enough seating:\n[\n  \\lceil \\frac{60}{8} \\rceil = 8\n]\n* **Spacing plants:** If plants need to be spaced at least 8 inches apart in a 1 foot by 4.5 foot plot, first convert units, then determine how many whole plants fit.",
                },
              },
            ],
          },
          {
            phaseNumber: 8,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Reasonable Accuracy in Multi-Step Problems\n\nIn complex real-world problems, intermediate values may be approximate. The final answer should reflect a reasonable level of accuracy given the approximations in the problem.\n\n\n### Key Concept: Reasonable Accuracy\n\n* When inputs are approximate, the output cannot be more precise than the least precise input.\n* Do not report more decimal places than the context justifies.\n* Round the final answer to a level that makes sense for the situation.",
                },
              },
            ],
          },
          {
            phaseNumber: 9,
            title: "Worked Example 4",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Compute with Reasonable Accuracy\n\nStudents perform multi-step calculations and report the final answer with a reasonable level of accuracy.\n\n### Step 1: Identify All Quantities\n\nBreak the problem into parts. For example, a fundraiser has multiple revenue sources: cupcakes sold, cookies sold, and donations received.\n\n\n### Step 2: Compute Each Part\n\nCalculate the revenue from each source. If almost all items were sold, use the approximate quantity to compute revenue:\n[\n50 \\times 1.50 + 100 \\times 1.00 + 7 \\times 4.25\n]\n\n### Step 3: Combine and Report with Reasonable Accuracy\n\nSum the values and report the total with an appropriate level of precision. Because the problem uses words like \"almost all\" and \"averaging,\" the final answer should reflect that these are estimates.\n\n\n### Variation: Expenses with Tax\n\nFor problems involving tax, compute the subtotal, then apply the tax rate:\n[\n\\text{Total} = \\text{subtotal} \\times (1 + \\text{tax rate})\n]\n\nFor a 7.25% tax rate, multiply by [ 1.0725 ]. Report the annual total with a reasonable level of accuracy.\n\n### Variation: Time Reductions\n\nWhen reducing time by a fraction, multiply the original time by [ 1 - \\frac{1}{6} = \\frac{5}{6} ]. Convert all time units to a common unit before calculating the annual total.",
                },
              },
            ],
          },
          {
            phaseNumber: 10,
            title: "Learn",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Evaluating the Accuracy of Reported Data\n\nA reported number may be exact, approximate, or rounded. The context tells you how accurate the report is likely to be.\n\n\n### Key Concept: Assessing Accuracy\n\n* Numbers like population counts from a census are estimates, not exact counts.\n* A number with many significant figures may imply false precision.\n* The tool or method used to obtain the number affects its accuracy.",
                },
              },
            ],
          },
          {
            phaseNumber: 11,
            title: "Worked Example 5",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Evaluate Accuracy of Reported Data\n\nStudents assess how accurate a reported number is and explain their reasoning.\n\n### Step 1: Consider the Context\n\nAsk how the number was obtained. For example:\n* A school enrollment of 3103 students was likely counted directly and is reasonably accurate.\n* A state population of 27,862,596 from a census is an estimate and is accurate to the nearest person only in a formal statistical sense.\n* A report of about 12,000 traffic lights is intentionally rounded and only accurate to the nearest thousand.\n* A report of exactly 1,578,932 grains of sand in one cubic foot implies a precision that is extremely difficult to verify.\n\n### Step 2: Explain the Reasoning\n\nWrite a clear explanation connecting the context to the likely accuracy. Consider whether the number is an exact count, a rounded estimate, or a statistical projection.",
                },
              },
            ],
          },
          {
            phaseNumber: 12,
            title: "Independent Practice",
            phaseType: "independent_practice" as const,
            estimatedMinutes: 20,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Mixed Exercises\n\nThe mixed exercises combine skills from all five examples. Problems include:\n\n\n* Using ratio metrics with real-world data sources to make comparisons and decisions.\n* Selecting the most appropriate unit of measurement for a given context (feet, inches, meters, kilometers, light-years).\n* Comparing the accuracy of two different reported values and explaining which is more reasonable.\n* Interpreting a scatter plot with a line of best fit and evaluating the accuracy of the line as a model.\n* Comparing two different metric thresholds to determine which requires a greater value.\n* Writing about real-world metrics and explaining why different measurement tools can produce different yet correct results.\n* Calculating costs with fractional pricing and discussing how much accuracy is possible versus necessary.",
                },
              },
            ],
          },
        ],
      },
    ];

    let lessonsCreated = 0;
    let phasesCreated = 0;

    for (const lesson of lessons) {
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

    return { lessonsCreated, phasesCreated };
  },
});
