import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule2Result {
  lessons: {
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    slug: string;
    phasesCreated: number;
  }[];
}

export const seedModule2Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule2Result> => {
    const now = Date.now();
    const result: SeedModule2Result["lessons"] = [];

    const lessonsData = [
      {
        slug: "module-2-lesson-1",
        title: "Writing and Interpreting Equations",
        description:
          "Translate verbal sentences and real-world situations into algebraic equations and formulas. Translate algebraic equations and formulas into complete verbal sentences. Interpret formulas in the context of geometry, finance, and science.",
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
                    "## Key Terms\n\n- **equation** — A mathematical statement that two expressions are equal, often containing variables.\n- **formula** — A special type of equation that shows the relationship between two or more quantities.\n- **variable** — A symbol (usually a letter) used to represent an unknown number or quantity.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Translating Between Words and Algebra",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Translating Between Words and Algebra\n\n### Key Concept: Verbal to Algebraic Translation\n\n- Identify the unknown quantity and assign a variable.\n- Look for key words that indicate operations: sum/addition, difference/subtraction, product/multiplication, quotient/division, squared/exponent.\n- Pay attention to grouping words such as \"the sum of\" or \"the product of,\" which often require parentheses.\n- Write the equation so that both sides are equal.\n\n### Key Concept: Algebraic to Verbal Translation\n\n- Read the equation left to right, naming each operation and quantity in words.\n- Use phrases like \"is equal to,\" \"is the same as,\" or \"is identical to\" for the equals sign.\n- Describe variables as \"a number\" or use their defined names in context.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1 — Write an Equation from a Verbal Sentence",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Write an Equation from a Verbal Sentence\n\nTranslate verbal descriptions into algebraic equations using one or more variables.\n\n### Step 1: Identify the Variable and Operations\n\nRead the sentence carefully and determine which words indicate addition, subtraction, multiplication, division, or exponents. Watch for phrases like \"the sum of\" or \"the product of\" that require grouping with parentheses.\n\n### Step 2: Write the Equation\n\nPlace the verbal description on the left and the value on the right, connected by an equals sign.\n\nRepresentative equations:\n[\n2 + 3m = 18\n]\n[\n5(x + 3) = 12\n]\n[\n85 - 9y = 7(4 + y)\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2 — Write an Equation from a Real-World Situation",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Write an Equation from a Real-World Situation\n\nRead a short scenario and write an equation that models the described situation.\n\n### Step 1: Identify the Known and Unknown Quantities\n\nDetermine what values are given and what quantity the problem asks you to find. Assign a variable to the unknown.\n\n### Step 2: Relate the Quantities with an Equation\n\nUse the relationships described in the problem to build an equation. The equation should represent how the known and unknown quantities are related.\n\nRepresentative situations:\n* A person has already walked 2 miles and walks 3 miles per hour. The goal is 6 miles total.\n[\n  2 + 3h = 6\n]\n* A business sold 216,000 cars, which was 39,000 more than three times the number of trucks sold.\n[\n  216{,}000 = 3t + 39{,}000\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 3 — Translate Sentences into Equations or Formulas",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Translate Sentences into Equations or Formulas\n\nTranslate verbal sentences into equations with variables, including geometric and scientific formulas.\n\n### Step 1: Distinguish Equations from Formulas\n\nAn equation typically has a single unknown. A formula defines a relationship among multiple quantities that can be reused.\n\n### Step 2: Write the Algebraic Statement\n\nRepresent each verbal description using appropriate variables and operations.\n\nRepresentative formulas:\n[\nA = \\ell^2\n]\n[\nP = a + b + c\n]\n[\nI = Prt\n]\n[\nSA = 2(wh + \\ell w + \\ell h)\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 4 and 5 — Write a Sentence for Each Equation",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 and 5 — Write a Sentence for Each Equation\n\nGiven an algebraic equation, write a complete verbal sentence that describes the same relationship.\n\n### Step 1: Read the Equation Left to Right\n\nName each term using words. Use \"a number\" when a variable appears without context.\n\n### Step 2: Choose Appropriate Verbal Connectors\n\nUse phrases such as \"is equal to,\" \"is the same as,\" \"is as much as,\" or \"is identical to\" for the equals sign.\n\nRepresentative equations:\n[\nj + 16 = 35\n]\n[\n7(p + 23) = 102\n]\n[\n\\frac{2}{5}v + \\frac{3}{4} = \\frac{2}{3}x^2\n]\n[\n2(t + 4q) = 2q + 4t\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 6 — Interpret Formulas in Context",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 6 — Interpret Formulas in Context\n\nGiven a formula from geometry, finance, or science, write a sentence describing it and explain what it means in the given situation.\n\n### Step 1: Write the Formula in Words\n\nDescribe what each side of the equation represents and how the variables are related.\n\n### Step 2: Interpret in Context\n\nExplain the meaning of the formula within its real-world or mathematical domain.\n\nRepresentative formulas:\n* Volume of a cylinder:\n[\n  V = \\pi r^2 h\n]\n* Compound interest:\n[\n  A = P\\left(1 + \\frac{r}{n}\\right)^{nt}\n]\n* Newton's second law:\n[\n  F = ma\n]",
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
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice translating between verbal descriptions and algebraic equations in both directions.\n\n* **Matching:** Match a verbal sentence to its correct equation from a set of choices.\n* **Verbal to algebraic:** Translate sentences involving exponents, fractions, and grouping into equations.\n* **Algebraic to verbal:** Translate equations involving products, differences, and powers into complete sentences.\n* **Formulas:** Write formulas for geometric relationships such as the area of a circle and the volume of a rectangular prism.\n* **Reasoning and analysis:** Write equations for real-world scenarios, determine whether two sentences describe the same equation, and evaluate whether an equation accurately translates a given sentence.\n* **Create:** Write original scenarios that correspond to a given equation.",
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
                    "## Review Notes\n\n* Problem 50 references an image (`media/image1.png`) of a kitchen floor plan that cannot be described from the extracted text. The problem states: \"The area of a kitchen is 182 square feet. This is 20% of the area of the first floor of the house. Let [ F ] represent the area of the first floor. Write an equation to represent the situation.\"\n* Problem 56 references an image (`media/image2.png`) that cannot be described from the extracted text. The problem asks students to translate the formula [ A = \\frac{b_1 + b_2}{2} \\cdot h ] into words and list any constraints on the variables.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-2-lesson-2",
        title: "Solving One-Step Equations",
        description:
          "Solve one-step equations involving addition, subtraction, multiplication, and division using the Properties of Equality. Write and solve one-step equations to model real-world situations. Apply the correct Property of Equality to isolate the variable and verify solutions.",
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
                    "## Key Terms\n\n- **equation** — A mathematical sentence stating that two expressions are equal.\n- **solution** — A value for a variable that makes an equation true.\n- **inverse operations** — Operations that undo each other, such as addition and subtraction or multiplication and division.\n- **Addition Property of Equality** — If you add the same number to both sides of an equation, the two sides remain equal.\n- **Subtraction Property of Equality** — If you subtract the same number from both sides of an equation, the two sides remain equal.\n- **Multiplication Property of Equality** — If you multiply both sides of an equation by the same number, the two sides remain equal.\n- **Division Property of Equality** — If you divide both sides of an equation by the same non-zero number, the two sides remain equal.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Solving One-Step Equations",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Solving One-Step Equations\n\nA one-step equation contains a single operation. To solve it, apply the inverse operation to both sides using the appropriate Property of Equality, isolating the variable on one side.\n\n### Key Concept: Properties of Equality\n\n- **Addition equations** [ x + a = b ]: Use the Subtraction Property of Equality. Subtract [ a ] from both sides.\n- **Subtraction equations** [ x - a = b ]: Use the Addition Property of Equality. Add [ a ] to both sides.\n- **Multiplication equations** [ ax = b ]: Use the Division Property of Equality. Divide both sides by [ a ].\n- **Division equations** [ \\frac{x}{a} = b ]: Use the Multiplication Property of Equality. Multiply both sides by [ a ].",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1 — Solve Addition and Subtraction Equations with Integers",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Solve Addition and Subtraction Equations with Integers\n\nSolve one-step equations where the variable is added to or subtracted from an integer, including cases with negative numbers and subtracting a negative.\n\n### Step 1: Identify the Operation\n\nDetermine whether the variable is being added to or subtracted from a number.\n\nRepresentative equations:\n[\nv - 9 = 14\n]\n[\n44 = t - 72\n]\n[\n18 + z = 40\n]\n[\n-61 = d + (-18)\n]\n\n### Step 2: Apply the Inverse Operation\n\nUse the Addition or Subtraction Property of Equality to isolate the variable.\n\nFor [ v - 9 = 14 ], add 9 to both sides:\n[\nv - 9 + 9 = 14 + 9\n]\n[\nv = 23\n]\n\nFor equations involving subtracting a negative, simplify first:\n[\n18 - (-f) = 91 \\quad \\rightarrow \\quad 18 + f = 91\n]\n[\nf = 91 - 18 = 73\n]\n\n### Step 3: Solve Equations with Larger Integers\n\nThe same process applies regardless of the size of the numbers.\n\n[\nv + 914 = -23\n]\n[\n447 + x = -261\n]\n\nSubtract the constant from both sides to isolate the variable.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2 — Solve Multiplication and Division Equations with Integers",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Solve Multiplication and Division Equations with Integers\n\nSolve one-step equations where the variable is multiplied or divided by an integer, including negative coefficients and divisors.\n\n### Step 1: Identify the Operation\n\nDetermine whether the variable is multiplied by a number or divided by a number.\n\nRepresentative equations:\n[\n-4a = 48\n]\n[\n12t = -132\n]\n[\n\\frac{c}{4} = 16\n]\n[\n\\frac{a}{16} = 9\n]\n\n### Step 2: Apply the Inverse Operation\n\nFor multiplication equations, divide both sides by the coefficient.\n\n[\n-4a = 48 \\quad \\rightarrow \\quad a = \\frac{48}{-4} = -12\n]\n\nFor division equations, multiply both sides by the divisor.\n\n[\n\\frac{c}{4} = 16 \\quad \\rightarrow \\quad c = 16 \\times 4 = 64\n]\n\n### Step 3: Handle Negative Coefficients and Divisors\n\nWhen the coefficient or constant is negative, apply the same inverse operation and track signs carefully.\n\n[\n-7t = 49 \\quad \\rightarrow \\quad t = \\frac{49}{-7} = -7\n]\n[\n-84 = \\frac{d}{3} \\quad \\rightarrow \\quad d = -84 \\times 3 = -252\n]\n[\n-6d = -42 \\quad \\rightarrow \\quad d = \\frac{-42}{-6} = 7\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 3 — Write and Solve Real-World Equations",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Write and Solve Real-World Equations\n\nTranslate contextual situations into one-step equations, then solve to find the unknown quantity.\n\n### Step 1: Define the Variable\n\nIdentify what quantity is unknown and assign a variable to represent it.\n\n### Step 2: Write the Equation\n\nUse keywords and relationships from the problem to build the equation.\n\nRepresentative problems:\n\n**Supreme Court:** Chief Justice Rehnquist served 33 years until his death in 2005. Find the year he was confirmed.\n[\ny + 33 = 2005\n]\n\n**Salary:** The Governor of Tennessee earned 94000 dollars less than New York's salary of 179000 dollars.\n[\nt = 179{,}000 - 94{,}000\n]\n\n**Weather:** Temperature dropped 21 degrees to [-9°C]. Find the starting temperature.\n[\nt - 21 = -9\n]\n\n**Farming:** Rolling Hills (126 acres) is [ \\frac{1}{4} ] the size of Briarwood Farm.\n[\n\\frac{1}{4}b = 126\n]\n\n### Step 3: Solve and Interpret\n\nApply the appropriate Property of Equality and state the answer in context.\n\nFor the farming problem:\n[\nb = 126 \\times 4 = 504 \\text{ acres}\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 4 — Solve Equations with Fractions",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Solve Equations with Fractions\n\nSolve one-step equations where coefficients or constants are fractions, including negative fractions and fractional coefficients.\n\n### Step 1: Addition and Subtraction Equations with Fractions\n\nUse the Addition or Subtraction Property of Equality. Find a common denominator when needed.\n\n[\n\\frac{3}{4} = w + \\frac{2}{5}\n]\n\nSubtract [ \\frac{2}{5} ] from both sides using a common denominator of 20:\n[\nw = \\frac{3}{4} - \\frac{2}{5} = \\frac{15}{20} - \\frac{8}{20} = \\frac{7}{20}\n]\n\nOther representative equations:\n[\n-\\frac{1}{2} + a = \\frac{5}{8}\n]\n[\n-\\frac{5}{7} = y - 2\n]\n\n### Step 2: Multiplication Equations with Fractions\n\nWhen the variable is multiplied by a fraction, multiply both sides by the reciprocal.\n\n[\n\\frac{1}{3}v = -5\n]\n[\nv = -5 \\times 3 = -15\n]\n\n[\n-\\frac{1}{7}c = 21\n]\n[\nc = 21 \\times (-7) = -147\n]\n\n[\n-\\frac{2}{3}v = -22\n]\n[\nv = -22 \\times \\left(-\\frac{3}{2}\\right) = 33\n]\n\n### Step 3: Division Equations with Fractions\n\nWhen the variable is divided by a number, multiply both sides by that number. When a negative fraction equals a fraction, multiply by the denominator.\n\n[\n-\\frac{k}{5} = \\frac{7}{5}\n]\n[\nk = \\frac{7}{5} \\times (-5) = -7\n]\n\n[\n-\\frac{t}{7} = \\frac{1}{15}\n]\n[\nt = \\frac{1}{15} \\times (-7) = -\\frac{7}{15}\n]\n\n[\n\\frac{n}{8} = -\\frac{1}{4}\n]\n[\nn = -\\frac{1}{4} \\times 8 = -2\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 7,
            title: "Example 5 — Multi-Part Application with Percentages",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 5 — Multi-Part Application with Percentages\n\nSolve a multi-part real-world problem that requires defining a variable, writing an expression, writing an equation, and solving it.\n\n### Step 1: Assign a Variable and Write an Expression\n\n**Soccer league:** 13% of players dropped out, and 174 players finished. Let [ p ] be the number of players who signed up. The number who finished is the total minus 13% of the total:\n[\np - 0.13p \\quad \\text{or} \\quad 0.87p\n]\n\n### Step 2: Write and Solve the Equation\n\nSet the expression equal to the known finished amount:\n[\n0.87p = 174\n]\n\nDivide both sides by 0.87:\n[\np = \\frac{174}{0.87} = 200\n]",
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
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice with all one-step equation skills, including:\n\n* Writing equations from verbal sentences and then solving them, such as \"Six times a number is 132\" ([ 6x = 132 ]) and \"Two thirds equals negative eight times a number\" ([ \\frac{2}{3} = -8n ]).\n* Solving equations with fractions and checking solutions, including equations like [ \\frac{2}{3}n = 14 ], [ 4\\frac{1}{5} = 3p ], and [ -\\frac{2}{5} = -\\frac{z}{45} ].\n* Real-world applications involving travel distances, ticket prices, and food costs, requiring students to define variables, write equations, and solve multi-part problems.\n* Identifying and naming the Property of Equality used to solve an equation, such as [ \\frac{x}{9} = 24 ], [ m - 183 = -79 ], and [ -\\frac{4}{5}p = 32 ].\n* Deeper reasoning tasks including \"Which One Doesn't Belong,\" persevering through related-equation problems, analyzing whether statements are sometimes/always/never true, and comparing solution methods for multiplication versus addition equations.",
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
                    "## Review Notes\n\n* Problem 89 references an image (`media/image1.png`) that was not extracted. The context suggests it is a standard equation-solving problem, but the exact expression is unclear without the image.\n* Problem 99 references an image (`media/image2.png`) showing four equations for a \"Which One Doesn't Belong?\" task. The image was not extracted; teachers should consult the original worksheet for the exact equations.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-2-lesson-3",
        title: "Solving Multi-Step Equations",
        description:
          "Solve multi-step linear equations using properties of equality and check solutions by substitution. Write and solve equations to model real-world situations involving multiple operations. Solve literal equations for a specified variable.",
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
                    "## Key Terms\n\n- **Multi-step equation** — An equation that requires more than one operation to isolate the variable.\n- **Properties of equality** — Rules stating that performing the same operation on both sides of an equation preserves the solution.\n- **Literal equation** — An equation that involves two or more variables, often solved for one variable in terms of the others.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Solving Multi-Step Equations",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Solving Multi-Step Equations\n\nTo solve a multi-step equation, undo operations in reverse order of operations (PEMDAS). First isolate terms containing the variable, then isolate the variable itself. Always check the solution by substituting back into the original equation.\n\n### Key Concept: Properties of Equality\n\n- **Addition Property:** Add the same value to both sides.\n- **Subtraction Property:** Subtract the same value from both sides.\n- **Multiplication Property:** Multiply both sides by the same nonzero value.\n- **Division Property:** Divide both sides by the same nonzero value.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1 — Solve Linear Equations Using Properties of Equality",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Solve Linear Equations Using Properties of Equality\n\nSolve linear equations that require two or more inverse operations. Check each solution by substituting the result back into the original equation.\n\n### Step 1: Isolate the Variable Term\n\nUse addition or subtraction to move constant terms to one side of the equation.\n\nRepresentative equations include two-step forms such as:\n[\n3t + 7 = -8\n]\n[\n8 = 16 + 8n\n]\n[\n-34 = 6m - 4\n]\n\n### Step 2: Isolate the Variable\n\nUse multiplication or division to solve for the variable.\n\nFor equations involving fractions, first undo the subtraction or addition, then multiply by the denominator:\n[\n\\frac{y}{5} - 6 = 8\n]\n[\n1 + \\frac{r}{9} = 4\n]\n\n### Step 3: Check the Solution\n\nSubstitute the value found back into the original equation to verify.\n\nSome problems involve rational expressions with binomial numerators:\n[\n\\frac{n - 2}{7} = 2\n]\n[\n14 = \\frac{6 + z}{-2}\n]\n[\n\\frac{22 - w}{3} = -7\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2 — Write and Solve Equations from Word Problems",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Write and Solve Equations from Word Problems\n\nTranslate real-world situations into multi-step equations, then solve and interpret the result in context.\n\n### Step 1: Define the Variable\n\nIdentify the unknown quantity and assign a variable.\n\n### Step 2: Write the Equation\n\nRepresent the described operations and relationships algebraically. Problem types include:\n\n* **Spending scenarios:** Ricardo spent half his allowance on supplies, then [ 5.25 ] on a snack, and had [ 22.50 ] left.\n[\n\\frac{a}{2} - 5.25 = 22.50\n]\n\n* **Sequential purchases:** Liza earned money, made several purchases, spent two-thirds of the remainder, and had [ 38.50 ] left.\n\n* **Equal distribution:** A package of treats minus [ 10 ] set-aside treats, divided equally among [ 15 ] dogs with [ 4 ] treats each.\n[\n\\frac{t - 10}{15} = 4\n]\n\n* **Averages:** The average of three game scores is [ 63 ], with the first two scores equal and each [ 6 ] points more than the third.\n\n* **Comparisons:** Adult height is one less than twice the height at age 2, with adult height [ 71 ] inches.\n[\n2h - 1 = 71\n]\n\n### Step 3: Solve and Interpret\n\nSolve the equation and state the answer in the context of the problem.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 3 — Solve Literal Equations",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Solve Literal Equations\n\nSolve equations for [x] when the coefficients are given as other variables. Assume [a \\ne 0].\n\n### Step 1: Isolate the Term Containing x\n\nUse addition or subtraction to move constants to the other side.\n\nRepresentative forms include:\n[\nax + 3 = 23\n]\n[\n4 = ax - 14\n]\n[\n6 + ax = -29\n]\n\n### Step 2: Solve for x\n\nDivide both sides by the coefficient [a].\n\n[\nx = \\frac{20}{a}\n]\n\n### Step 3: Handle Rational Forms\n\nFor equations where [x] appears in the denominator, first isolate the fractional term, then take the reciprocal and solve:\n[\n\\frac{8}{ax} - 5 = -3\n]\n[\n5 = \\frac{5}{ax} + 1\n]\n\nEquations may also involve a negative leading coefficient:\n[\n-7 = -ax - 16\n]",
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
                    "## Mixed Exercises\n\nPractice solving a variety of multi-step equations that combine all skills from the lesson. Problems include:\n\n* Two-step linear equations:\n[\n3x + 8 = 29\n]\n[\n-27 = -6 - 3p\n]\n\n* Equations with fractional coefficients:\n[\n\\frac{a}{6} - 5 = 9\n]\n[\n\\frac{5r}{2} - 6 = 19\n]\n[\n5 + \\frac{x}{4} = 1\n]\n[\n-\\frac{h}{3} - 4 = 13\n]\n\n* Equations requiring the distributive property:\n[\n5(1 + n) = -5\n]\n\n* Reasoning problems that require translating verbal descriptions into equations and solving:\n  * A number divided by 2, then increased by 8, gives 33\n  * Two subtracted from a number, then divided by 3, gives 30\n  * The sum of 4 consecutive odd integers equals zero\n\n* Error analysis, creation, and analysis problems:\n  * Evaluate two students' methods for solving an equation with a fractional coefficient\n  * Create a real-world problem for a given equation\n  * Determine whether equations have solutions and justify\n  * Determine whether a statement about consecutive odd integers is sometimes, always, or never true\n  * Write a paragraph explaining the general order of steps for solving multi-step equations",
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
                    "## Review Notes\n\n* No images or diagrams were present in the source material; all content is text-based.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-2-lesson-4",
        title: "Solving Equations with the Variable on Each Side",
        description:
          "Solve linear equations that have the variable on both sides of the equation, including those with fractions and grouping symbols. Write and solve equations to model real-world and geometric situations. Determine whether an equation has one solution, no solution, or is an identity.",
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
                    "## Key Terms\n\n- **identity** — An equation that is true for every value of the variable.\n- **no solution** — An equation that is not true for any value of the variable.\n- **one solution** — An equation that is true for exactly one value of the variable.\n- **consecutive integers** — Integers that follow one after another in order (e.g., [ n ] and [ n + 1 ]).\n- **consecutive even integers** — Even integers that follow one after another (e.g., [ n ] and [ n + 2 ]).\n- **consecutive odd integers** — Odd integers that follow one after another (e.g., [ n ] and [ n + 2 ]).\n- **supplementary angles** — Two angles whose measures sum to [ 180^\\circ ].\n- **complementary angles** — Two angles whose measures sum to [ 90^\\circ ].",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Solving Equations with Variables on Both Sides",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Solving Equations with Variables on Both Sides\n\nTo solve an equation with the variable on each side, collect variable terms on one side and constant terms on the other. Then isolate the variable.\n\n### Key Concept: Solving Equations with Variables on Both Sides\n\n- Simplify each side by distributing and combining like terms.\n- Add or subtract to move all variable terms to one side and all constants to the other.\n- Divide by the coefficient to isolate the variable.\n- Check the solution by substituting back into the original equation.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1 — Solve Equations with Variables on Both Sides",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Solve Equations with Variables on Both Sides\n\nSolve linear equations where the variable appears on both sides of the equal sign. The equations vary in complexity: some require combining like terms first, some involve fractions, and some require using the Distributive Property.\n\n### Step 1: Collect Variable Terms\n\nMove all terms containing the variable to one side by adding or subtracting.\n\nFor a basic equation:\n[\n7c + 12 = -4c + 78\n]\n\nAdd [ 4c ] to both sides:\n[\n11c + 12 = 78\n]\n\nFor an equation with fractions:\n[\n\\frac{b - 4}{6} = \\frac{b}{2}\n]\n\nMultiply both sides by the LCD to clear fractions, then collect variable terms.\n\n### Step 2: Collect Constant Terms\n\nMove all constant terms to the opposite side.\n\n[\n11c + 12 = 78\n]\n\nSubtract [ 12 ] from both sides:\n[\n11c = 66\n]\n\n### Step 3: Isolate the Variable\n\nDivide by the coefficient.\n\n[\nc = 6\n]\n\n### Variations\n\n* Equations with the Distributive Property:\n[\n  2(r + 6) = 4(r + 4)\n]\n  Distribute first, then collect variable terms.\n\n* Equations with multiple grouping symbols:\n[\n  3(3m - 2) = 2(3m + 3)\n]\n\n* Equations with fractional coefficients:\n[\n  12 - \\frac{4}{5}(x + 15) = \\frac{2}{5}x + 6\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2 — Write and Solve Equations from Word Problems",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Write and Solve Equations from Word Problems\n\nTranslate a verbal description into an equation with the variable on both sides, then solve.\n\n### Step 1: Define the Variable\n\nIdentify the unknown quantity and assign a variable.\n\n**Olympics:** The United States won 1 more than 4 times the number of gold medals France won. The United States also won 7 more gold medals than France.\n\nLet [ f ] = number of gold medals France won.\n\n### Step 2: Write the Equation\n\nTranslate both relationships into expressions and set them equal.\n\n[\n4f + 1 = f + 7\n]\n\n### Step 3: Solve and Interpret\n\nCollect variable terms and constants, then solve. State the answer in the context of the problem.\n\n### Variations\n\n* **Ages:** Compare two expressions for the same person's age.\n* **Nature:** Use a table showing current heights and growth rates of two tree species to find when their heights will be equal.\n* **Weight:** Compare the weights of two animals using two different relationships.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 3 — Geometry Applications",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Geometry Applications\n\nWrite and solve equations based on geometric relationships such as supplementary angles, complementary angles, and equal areas.\n\n### Step 1: Write the Geometric Relationship\n\n**Supplementary and Complementary Angles:** The measure of the supplement of an angle is [ 10^\\circ ] more than twice the measure of the complement of the angle.\n\nLet [ x ] = the measure of the angle.\nComplement: [ 90 - x ] \nSupplement: [ 180 - x ] \n\nEquation:\n[\n180 - x = 2(90 - x) + 10\n]\n\n### Step 2: Solve for the Unknown\n\nSolve the equation to find the angle measure or the value of [ x ].\n\n### Variations\n\n* **Equal areas:** Write and solve an equation so that two geometric figures have the same area. One problem involves a trapezoid, using the formula:\n[\n  A = \\frac{1}{2}h(b_1 + b_2)\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 4 — Classify Equations",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Classify Equations\n\nSolve each equation and determine whether it has one solution, no solution, or is an identity.\n\n### Step 1: Simplify Each Side\n\nDistribute and combine like terms.\n\n[\n-6y - 3 = 3 - 6y\n]\n\n### Step 2: Collect Variable Terms\n\nAdd [ 6y ] to both sides:\n[\n-3 = 3\n]\n\n### Step 3: Classify the Result\n\n- If you obtain a true statement with no variable (such as [ 5 = 5 ]), the equation is an **identity**.\n- If you obtain a false statement with no variable (such as [ -3 = 3 ]), the equation has **no solution**.\n- If you isolate the variable to a single value, the equation has **one solution**.\n\n### Representative Equations\n\n* Identity:\n[\n  8q + 12 = 4(3 + 2q)\n]\n  Simplifies to [ 8q + 12 = 8q + 12 ].\n\n* No solution:\n[\n  \\frac{1}{2}(x + 6) = \\frac{1}{2}x - 9\n]\n  Simplifies to [ \\frac{1}{2}x + 3 = \\frac{1}{2}x - 9 ], which gives [ 3 = -9 ].\n\n* One solution:\n[\n  2a + 2 = 3(a + 2)\n]\n  Simplifies to [ 2a + 2 = 3a + 6 ], which gives [ a = -4 ].",
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
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice with all skills from the lesson:\n\n* Solve equations with variables on both sides, including those with decimals and multiple grouping levels.\n[\n  6.78j - 5.2 = 4.33j + 2.15\n]\n* Solve equations with nested grouping symbols.\n[\n  5[2p - 4(p + 5)] = 25\n]\n* Solve equations with fractions on both sides.\n[\n  \\frac{3d - 2}{8} = -d + 16\\frac{1}{4}\n]\n* Write and solve equations involving consecutive odd or even integers.\n* Use a model: write an equation from a description of two figures with equal perimeters, solve for the unknown, and verify by computing both perimeters.\n* Analyze student work to find and explain errors in solving equations.\n* Persevere: write an equation with specific constraints (variables on both sides, at least one fractional coefficient, and a given solution).\n* Create: write an equation with at least two grouping symbols that has no solution.\n* Analyze: determine whether a given solution is correct and justify the argument.\n* Find the value of a parameter that makes an equation an identity.\n* Solve a literal equation for a variable, assuming the coefficient is non-zero.\n[\n  5x + 2 = ax - 1, \\quad a \\ne 5\n]",
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
                    "## Review Notes\n\n* **Problem 19 (NATURE):** Requires a table (`media/image1.png`) showing the current heights and average growth rates of two tree species. The table cannot be described from the extracted text.\n* **Problem 21 (GEOMETRY):** Requires a diagram (`media/image2.png`) showing an angle and its complement/supplement relationship.\n* **Problem 22 (GEOMETRY):** Requires a diagram (`media/image3.png`) showing two geometric figures whose areas must be equal.\n* **Problem 23 or 24 (GEOMETRY):** Requires a diagram (`media/image4.png`) showing two geometric figures whose areas must be equal. One figure is a trapezoid.\n* **Problem 53 (FIND THE ERROR):** Requires an image (`media/image5.png`) showing Anthony's and Patty's work solving an equation. The image content is needed to evaluate their reasoning.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-2-lesson-5",
        title: "Solving Equations Involving Absolute Value",
        description:
          "Solve absolute value equations of the form [ |expression| = constant ] and recognize when no solution exists. Graph the solution set of an absolute value equation on a number line. Write absolute value equations that model real-world tolerance, margin-of-error, and range situations. Translate between number-line graphs and their corresponding absolute value equations.",
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
                    "## Key Terms\n\n- **Absolute value** — The distance of a number from zero on the number line; always nonnegative\n- **Tolerance** — An allowable deviation from a specified value in manufacturing or measurement\n- **Margin of error** — The range of values above and below a sample statistic in a survey or poll\n- **Standard deviation** — A statistical measure of how far data values are from the mean\n- **Solution set** — The set of all values that satisfy an equation",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Solving Absolute Value Equations",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Solving Absolute Value Equations\n\nAn absolute value equation states that the distance between an expression and zero equals a given number.\n\n### Key Concept: Absolute Value Equations\n\n- If [ |A| = p ] and [ p > 0 ], then the equation splits into two cases: [ A = p ] or [ A = -p ] \n- If [ |A| = p ] and [ p < 0 ], there is **no solution** because absolute value is never negative\n- If [ |A| = 0 ], there is exactly one solution: [ A = 0 ] \n- After solving, check each solution in the original equation",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1 — Solve and Graph Simple Absolute Value Equations",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Solve and Graph Simple Absolute Value Equations\n\nSolve equations of the form [ |expression| = \\text{positive constant} ], then graph the solution set on a number line.\n\n### Step 1: Split into Two Cases\n\nRewrite the absolute value equation as two separate linear equations.\n\nFor [ |x - 3| = 5 ]:\n[\nx - 3 = 5 \\quad \\text{or} \\quad x - 3 = -5\n]\n\n### Step 2: Solve Each Equation\n\n[\nx = 8 \\quad \\text{or} \\quad x = -2\n]\n\n### Step 3: Graph the Solution Set\n\nPlot both solutions on a number line using closed circles.\n\nVariations include equations with fractions, such as:\n[\n\\left| \\frac{3}{4}a - 3 \\right| = 9\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2 — Identify Equations with No Solution",
            phaseType: "worked_example" as const,
            estimatedMinutes: 10,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Identify Equations with No Solution\n\nDetermine whether an absolute value equation has solutions before attempting to solve.\n\n### Step 1: Examine the Right-Hand Side\n\nIf the constant on the right side is negative, the equation has no solution.\n\n[\n|v - 2| = -5 \\quad \\Rightarrow \\quad \\text{no solution}\n]\n[\n|6y - 7| = -1 \\quad \\Rightarrow \\quad \\text{no solution}\n]\n\n### Step 2: Solve When a Solution Exists\n\nWhen the right-hand side is positive or zero, proceed with the two-case method.\n\n[\n|4t - 8| = 20 \\quad \\Rightarrow \\quad 4t - 8 = 20 \\; \\text{or} \\; 4t - 8 = -20\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 3 — Apply Absolute Value to Real-World Problems",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Apply Absolute Value to Real-World Problems\n\nUse absolute value equations to model tolerance, margin of error, and range in everyday contexts.\n\n### Step 1: Identify the Target Value and Allowable Deviation\n\nDetermine what quantity represents the center (mean or set point) and what represents the allowed distance from that center.\n\n### Step 2: Write the Absolute Value Equation\n\nFor a thermostat set to [ 400^\\circ \\text{F} ] with a tolerance of [ \\pm 15^\\circ \\text{F} ]:\n[\n|T - 400| = 15\n]\n\n### Step 3: Solve and Interpret\n\n[\nT - 400 = 15 \\quad \\text{or} \\quad T - 400 = -15\n]\n[\nT = 415 \\quad \\text{or} \\quad T = 385\n]\n\nThe maximum temperature is [ 415^\\circ \\text{F} ] and the minimum is [ 385^\\circ \\text{F} ].\n\nContexts include:\n* **Polling:** A poll result of [ 38\\% ] with [ \\pm 5\\% ] margin of error\n* **Standard deviation:** An ACT mean of [ 20.9 ] with standard deviation [ 5.3 ] \n* **Manufacturing:** A labeled weight of [ 35 ] pounds within [ 8 ] ounces\n* **Aviation:** A survey margin of error applied to a population of [ 40 ] million students",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 4 — Write Absolute Value Equations from Graphs",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Write Absolute Value Equations from Graphs\n\nGiven a number-line graph showing two symmetric points, write the corresponding absolute value equation.\n\n### Step 1: Identify the Center and the Distance\n\nFind the midpoint of the two graphed points — this is the value inside the absolute value expression. Find the distance from the center to either endpoint — this is the constant on the right side.\n\n### Step 2: Construct the Equation\n\nIf the graph shows solutions at [ x = -1 ] and [ x = 5 ]:\n[\n\\text{center} = \\frac{-1 + 5}{2} = 2, \\quad \\text{distance} = 3\n]\n[\n|x - 2| = 3\n]\n\nVariations include graphs with fractional or negative centers and different distances.",
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
                    "## Mixed Exercises\n\nThe mixed exercises integrate all skills from the lesson:\n\n* Solving absolute value equations with variables on either side and fractional coefficients, then graphing the solutions\n* Handling equations that require isolating the absolute value first, such as [ 2|h| - 3 = 8 ] or [ 4 - 3|q| = 10 ] \n* Writing absolute value equations from number-line graphs with varied scales and intervals\n* Applying absolute value to range, tolerance, and error-bound contexts including temperature control, manufacturing quality, chlorine concentration, and aquarium conditions\n* Reasoning about why absolute value can never be negative, analyzing common errors, and creating original real-world situations modeled by absolute value equations\n* Using the structure of absolute value to represent definitions such as betweenness of points on a line",
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
                    "## Review Notes\n\n* The worksheet contains 17 embedded images (`media/image1.png` through `media/image17.png`) that show number-line graphs for problems 24–31 and 38–43, a bar graph for the aviation survey in problem 22, a fish-tank illustration for problem 48, and student work for the error-analysis problem 51. These images must be reviewed and described or reproduced during activity implementation.\n* Problem 21 references the Wechsler IQ test mean and standard deviation as background context.\n* Problems 44–47 and 49–53 are open-ended writing, reasoning, and creation prompts that do not require numeric answer verification.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-2-lesson-6",
        title: "Solving Proportions",
        description:
          "Solve proportions algebraically, including those with variable expressions in numerators and denominators. Set up and solve real-world problems using proportions. Apply proportions to percent situations, scaling problems, and mixture contexts.",
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
                    "## Key Terms\n\n- **proportion** — An equation stating that two ratios are equal\n- **cross products** — The products obtained by multiplying the numerator of each ratio by the denominator of the other ratio; in a true proportion, the cross products are equal\n- **rate** — A ratio that compares two quantities measured in different units\n- **scale** — A ratio that compares a measurement on a model or drawing to the corresponding actual measurement\n- **unit cost** — The cost of a single unit of a quantity",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Solving Proportions Algebraically",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Solving Proportions Algebraically\n\nTo solve a proportion, use the Cross Products Property: if [ \\frac{a}{b} = \\frac{c}{d} ] then [ ad = bc ] (where [ b \\ne 0 ] and [ d \\ne 0 ]). After cross-multiplying, solve the resulting equation for the unknown.\n\n### Key Concept: Cross Products Property\n\n- In any proportion, the product of the means equals the product of the extremes\n- Cross-multiplying turns a rational equation into a linear (or simpler) equation\n- Always check that the solution does not make any denominator zero",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1 — Basic Proportions",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 — Basic Proportions\n\nSolve proportions containing simple numbers, decimals, or basic variable expressions. Round to the nearest hundredth if necessary.\n\n### Step 1: Cross-Multiply\n\nMultiply the numerator of each ratio by the denominator of the other ratio.\n\nFor a simple numerical proportion:\n[\n\\frac{3}{8} = \\frac{15}{a}\n]\n\nFor a proportion with decimals:\n[\n\\frac{w}{2} = \\frac{4.5}{6.8}\n]\n\n### Step 2: Solve for the Variable\n\nIsolate the variable and simplify. For proportions with an expression containing the variable:\n[\n\\frac{x - 3}{5} = \\frac{6}{10}\n]\n\nDistribute and combine like terms as needed, then solve.",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 2 — Proportions with Linear Expressions",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 2 — Proportions with Linear Expressions\n\nSolve proportions where one or both sides contain linear expressions in the numerator or denominator.\n\n### Step 1: Cross-Multiply to Eliminate Denominators\n\nSet the cross products equal to each other.\n[\n\\frac{4v + 7}{15} = \\frac{6v + 2}{10}\n]\n\n[\n10(4v + 7) = 15(6v + 2)\n]\n\n### Step 2: Distribute and Solve the Linear Equation\n\nExpand both sides, collect variable terms on one side and constants on the other, then isolate the variable.\n\nFor proportions with variables in denominators, such as:\n[\n\\frac{2}{g + 6} = \\frac{4}{5g + 10}\n]\n\ncross-multiply, distribute, and solve while checking that the final value does not make any original denominator zero.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 3 — Real-World Proportion Problems",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Real-World Proportion Problems\n\nUse proportions to solve contextual problems involving rates, ratios, and scaling.\n\n### Step 1: Identify the Relationship\n\nDetermine the two equivalent ratios described in the problem (e.g., gallons per hour, cost per pack, distance per time).\n\n### Step 2: Set Up and Solve\n\nWrite a proportion matching the given rate to the unknown quantity, then cross-multiply and solve.\n\nRepresentative contexts include:\n\n* Fuel consumption: [\\frac{5 \\text{ gal}}{4 \\text{ hr}} = \\frac{g}{10 \\text{ hr}}] \n* Unit pricing: [\\frac{3 \\text{ packs}}{5} = \\frac{10 \\text{ packs}}{c}] \n* Currency exchange: [\\frac{2}{1.78 \\text{ Euros}} = \\frac{121}{e}] \n* Picture scaling: [\\frac{6 \\text{ in}}{4 \\text{ in}} = \\frac{w}{15 \\text{ in}}]",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Example 4 — Percent and Mixture Problems",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Percent and Mixture Problems\n\nApply proportions to situations involving percents, part-whole relationships, and mixtures.\n\n### Step 1: Translate the Percent or Part-Whole Relationship\n\nExpress the given information as a ratio. For a percent problem, the percent compares the part to the whole.\n\n[\n\\frac{\\text{part}}{\\text{whole}} = \\frac{\\text{percent}}{100}\n]\n\n### Step 2: Solve for the Unknown Quantity\n\nCross-multiply and solve. Representative contexts include:\n\n* Fundraising expenses: [\\frac{500}{p} = \\frac{15}{100}] \n* Coffee blending: [\\frac{8 \\text{ lb}}{b} = \\frac{25}{100}] \n* Acid solutions: [\\frac{a}{a + 1500} = \\frac{12}{100}] \n* Recipe ratios: [\\frac{18 \\text{ oz}}{t} = \\frac{20}{100}]",
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
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice across all proportion skills covered in the lesson. Problems range from straightforward numerical proportions to proportions with variables on one or both sides, multi-step word problems, percent applications, map-scale questions, estimation tasks, and writing prompts that ask students to compare ratios and rates or create their own examples.",
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
                    "## Review Notes\n\n* Problem 70 requires students to look up the actual heights of Willis Tower and the John Hancock Center in Chicago (including the tip) from an external source and then use a proportion to find the scale-model height of the John Hancock Center.\n* Problem 71 references a map image (`media/image1.png`) of Waco, Texas and neighboring towns that is not available in the extracted text. Students must use a metric ruler to measure the map distance between Robinson and Neale, then apply the given scale ([1 \\text{ cm} = 3 \\text{ mi}]) to find actual distances and area.",
                },
              },
            ],
          },
        ],
      },
      {
        slug: "module-2-lesson-7",
        title: "Using Formulas",
        description:
          "Solve literal equations and formulas for a specified variable using inverse operations. Apply formulas to solve real-world problems involving geometry, finance, and everyday contexts. Use dimensional analysis to convert between units of measurement.",
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
                    "## Key Terms\n\n- **Literal equation** — An equation that involves two or more variables.\n- **Formula** — A special type of literal equation that expresses a relationship between quantities, often from geometry, science, or finance.\n- **Dimensional analysis** — A method of converting between units of measurement by multiplying by conversion factors written as fractions equal to one.",
                },
              },
            ],
          },
          {
            phaseNumber: 2,
            title: "Learn: Solving Literal Equations and Formulas",
            phaseType: "learn" as const,
            estimatedMinutes: 15,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Learn: Solving Literal Equations and Formulas\n\n### Key Concept: Isolating a Variable\n\n- Use inverse operations to undo whatever is being done to the variable you want to solve for.\n- If the variable appears in multiple terms, collect those terms on one side and factor out the variable.\n- When fractions are present, eliminate denominators first by multiplying both sides by the least common denominator.\n\n### Key Concept: Dimensional Analysis\n\n- Write the given quantity as a fraction over 1.\n- Multiply by conversion factors so that unwanted units cancel, leaving the desired unit in the numerator.\n- Chain multiple conversions together in a single multiplication string.",
                },
              },
            ],
          },
          {
            phaseNumber: 3,
            title: "Example 1 and 2 — Solve for a Specified Variable",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 1 and 2 — Solve for a Specified Variable\n\nSolve linear equations and formulas for a given variable by applying inverse operations systematically.\n\n### Step 1: Identify the Target Variable\n\nDetermine which variable must be isolated.\n\n### Step 2: Undo Addition and Subtraction\n\nMove all terms containing the target variable to one side and all other terms to the opposite side.\n\nRepresentative equations:\n[\nx - 2y = 1, \\quad \\text{for } y\n]\n[\n7f + g = 5, \\quad \\text{for } f\n]\n[\nq - r = r, \\quad \\text{for } r\n]\n\n### Step 3: Undo Multiplication and Division\n\nIf the target variable is multiplied by a coefficient, divide both sides by that coefficient. If it appears inside a fraction, eliminate the denominator first.\n\nRepresentative equations:\n[\nr = wp, \\quad \\text{for } p\n]\n[\n4m - t = m, \\quad \\text{for } m\n]\n[\n\\frac{10ac - x}{11} = -3, \\quad \\text{for } a\n]\n\n### Step 4: Factor if the Variable Appears in Multiple Terms\n\nWhen the target variable occurs in more than one term, collect those terms, factor out the variable, and then divide.\n\nRepresentative equations:\n[\n7a - b = 15a, \\quad \\text{for } a\n]\n[\n-5c + d = 2c, \\quad \\text{for } c\n]\n\n### Step 5: Solve Formulas with Multiple Operations\n\nFor formulas involving several variables and operations, work from the outside in using inverse operations.\n\nRepresentative formulas:\n[\nu = vw + z, \\quad \\text{for } v\n]\n[\nr = \\frac{2}{3}t + v, \\quad \\text{for } t\n]\n[\n\\frac{df + 10}{6} = g, \\quad \\text{for } f\n]",
                },
              },
            ],
          },
          {
            phaseNumber: 4,
            title: "Example 3 — Apply Formulas to Real-World Situations",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 3 — Apply Formulas to Real-World Situations\n\nGiven a formula from geometry or a real-world context, solve it for a specific variable and then substitute known values to find an unknown quantity.\n\n### Step 1: Solve the Formula for the Desired Variable\n\nUse inverse operations to isolate the variable you need to find.\n\nRepresentative formulas:\n* Perimeter of a rectangle:\n[\n  P = 2\\ell + 2w, \\quad \\text{for } \\ell\n]\n* Batting average:\n[\n  a = \\frac{h}{b}, \\quad \\text{for } b\n]\n* Volume of a rectangular prism:\n[\n  V = \\ell wh, \\quad \\text{for } h\n]\n\n### Step 2: Substitute Known Values and Compute\n\nReplace the other variables with the given numbers and evaluate to find the unknown.",
                },
              },
            ],
          },
          {
            phaseNumber: 5,
            title: "Example 4 — Solve Formulas with Constraints",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Example 4 — Solve Formulas with Constraints\n\nGiven a real-world formula, describe the constraints on the variables, solve for a specified variable, and use the result to answer questions involving budgets or limits.\n\n### Step 1: Identify Constraints\n\nDetermine what values or conditions the variables must satisfy based on the context, such as a maximum budget or a minimum number of items.\n\nRepresentative situations:\n* Coffee shop budget:\n[\n  T = 5.50p + 7f\n]\n  where [ T = 40 ] dollars is the maximum amount to spend.\n* Towel and washcloth order:\n[\n  T = 6b + 2w\n]\n  where [ T = 85 ] dollars is the budget and at least 20 washcloths are needed.\n\n### Step 2: Solve for the Desired Variable\n\nIsolate the variable you need to analyze.\n\n### Step 3: Apply the Constraint to Answer the Question\n\nSubstitute the known or constrained values and solve the resulting inequality or equation to find a maximum or minimum.",
                },
              },
            ],
          },
          {
            phaseNumber: 6,
            title: "Examples 5-7 — Dimensional Analysis and Unit Conversion",
            phaseType: "worked_example" as const,
            estimatedMinutes: 12,
            sections: [
              {
                sequenceOrder: 1,
                sectionType: "text" as const,
                content: {
                  markdown:
                    "## Examples 5-7 — Dimensional Analysis and Unit Conversion\n\nUse dimensional analysis to convert measurements from one unit to another in real-world contexts.\n\n### Step 1: Write the Given Quantity as a Fraction\n\nExpress the starting measurement as a fraction over 1.\n\n### Step 2: Multiply by Conversion Factors\n\nUse known conversion relationships written as fractions so that unwanted units cancel.\n\nRepresentative conversions:\n* Metric tons to trillion pounds:\n[\n  1 \\text{ trillion lb} = 0.4536 \\text{ billion metric tons}\n]\n* Euros to U.S. dollars:\n[\n  \\$1 \\text{ U.S.} = 0.678 \\text{ euros}\n]\n* Centimeters to inches to feet:\n[\n  1 \\text{ cm} = 0.39 \\text{ in}, \\quad 1 \\text{ ft} = 12 \\text{ in}\n]\n* Meters to feet to miles for track laps:\n[\n  1 \\text{ ft} = 0.3048 \\text{ m}, \\quad 1 \\text{ mi} = 5280 \\text{ ft}\n]\n* Kilometers to yards to miles:\n[\n  1 \\text{ m} = 1.094 \\text{ yd}, \\quad 1 \\text{ mi} = 1760 \\text{ yd}\n]\n\n### Step 3: Compute and Round as Directed\n\nMultiply the numerators, divide by the denominators, and round to the specified place value.\n\nAdditional contexts include production rates over time, water usage across multiple showers, time until an event in seconds, and determining how many students can be served from a given mass of material.",
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
                    "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice across all skills from the lesson.\n\n* **Solve for a variable:** A range of literal equations requiring collection of variable terms, factoring, and clearing fractions.\n[\n  rt - 2n = y, \\quad \\text{for } t\n]\n[\n  \\frac{x - c}{2} = d, \\quad \\text{for } x \\text{ and for } c\n]\n[\n  ax + z = aw - y, \\quad \\text{for } a\n]\n* **Structure and reasoning:** Analyze conversion factors to determine possible initial and final units of a rate.\n* **Financial reasoning:** Solve the simple interest formula [ A = P(1 + r) ] for [ r ] and interpret the result in context.\n* **Geometric reasoning:** Use the area of a triangle formula [ A = \\frac{1}{2}bh ] to find the height of congruent triangles forming a regular octagon.\n* **Variable restrictions:** Solve [ \\frac{ry + z}{m} - t = x ] for [ y ] and explain any restrictions on the variables.\n* **Create:** Write an original area formula involving a fraction and solve it for a non-area variable.\n* **Error analysis:** Evaluate whether a worked solution for solving the temperature conversion formula for [ C ] is correct.\n* **Compound interest:** Solve [ A = P(1 + r)^t ] for [ P ] and analyze whether [ A ] is always greater than [ P ] when [ r > 0 ] and [ t ] is a positive integer.",
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
                    "## Review Notes\n\n* Problem 46 references an image (`media/image1.png`) showing a regular octagon divided into 8 congruent triangles. The problem asks students to find the side length of the octagon, solve the triangle area formula for height, and compute the height of each triangle.\n* Problem 49 references an image (`media/image2.png`) showing Sasha's worked solution for solving the Fahrenheit-to-Celsius temperature conversion formula for [ C ]. The problem asks students to determine whether her solution is correct and explain their reasoning.",
                },
              },
            ],
          },
        ],
      },
    ];

    for (const lesson of lessonsData) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 2,
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

      result.push({
        lessonId,
        lessonVersionId,
        slug: lesson.slug,
        phasesCreated,
      });
    }

    return { lessons: result };
  },
});