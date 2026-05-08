import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule11LessonsResult {
  lessons: Array<{
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    phasesCreated: number;
    activitiesCreated: number;
  }>;
}

const lessonsData = [
  {
    slug: "module-11-lesson-1",
    title: "Adding and Subtracting Polynomials",
    description:
      "Classify polynomials by degree and number of terms, write them in standard form, and add and subtract using horizontal and vertical methods.",
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
                "## Explore: What Makes a Polynomial?\n\nStudents consider what separates polynomials from other algebraic expressions. They explore why certain expressions do or do not qualify as polynomials and investigate how degree and term count determine classification.\n\n**Inquiry Question:**\nWhat characteristics determine whether an algebraic expression is a polynomial, and how does the degree affect the classification?",
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
                "## Key Terms\n\n- **Polynomial** — A mathematical expression consisting of terms combined by addition or subtraction.\n- **Monomial** — A polynomial with one term.\n- **Binomial** — A polynomial with two terms.\n- **Trinomial** — A polynomial with three terms.\n- **Degree of a Polynomial** — The highest exponent in a polynomial when written in standard form.\n- **Standard Form** — A polynomial written with terms in descending order of exponent.\n- **Leading Coefficient** — The coefficient of the term with the highest exponent.\n- **Closed under Addition** — A property where the sum of any two elements in a set remains in that set.",
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
                "## Learn: Adding and Subtracting Polynomials\n\n### Key Concept: Identifying Polynomials\n\nA polynomial is a sum of terms each consisting of a coefficient multiplied by a variable raised to a nonnegative integer power.\n\nDetermine whether each expression is a polynomial. If it is, find the degree and classify it as a monomial, binomial, or trinomial.\n\n### Key Concept: Standard Form\n\nA polynomial is in standard form when its terms are arranged from highest to lowest degree. The leading coefficient is the coefficient of the first term.\n\nWrite each polynomial in standard form and identify the leading coefficient.\n\n### Key Concept: Adding Polynomials\n\nTo add polynomials, combine like terms by adding coefficients of terms with the same variable part.\n\nFind each sum or difference.\n\n(2x + 3y) + (4x + 9y)\n(6s + 5t) + (4t + 8s)\n(5a + 9b) - (2a + 4b)\n(11m - 7n) - (2m + 6n)\n\n### Key Concept: Subtracting Polynomials\n\nTo subtract polynomials, distribute the negative sign to each term of the polynomial being subtracted, then combine like terms.\n\n(m^2 - m) + (2m + m^2)\n(x^2 - 3x) - (2x^2 + 5x)\n(d^2 - d + 5) - (2d + 5)\n(2h^2 - 5h) + (7h - 3h^2)",
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
                "## Example 1 — Classify Polynomials\n\nDetermine whether each expression is a polynomial. If it is a polynomial, find the degree and determine whether it is a monomial, binomial, or trinomial.\n\n### Step 1: Identify Polynomial Characteristics\n\nCheck if every term has a variable raised to a nonnegative integer power and no variables in denominators. If it qualifies, count the terms and find the highest exponent.\n\n5y^3/x^2 + 4x — Not a polynomial (negative exponent in denominator)\n21 — Monomial, degree 0\nc^4 - 2c^2 + 1 — Trinomial, degree 4\nd + 3d^c — Not a polynomial (variable exponent)\n\n### Step 2: Classify and Determine Degree\n\na - a^2 — Binomial (reorder to standard form: -a^2 + a)\n5n^3 + nq^3 — Trinomial, degree 4 (when treated as polynomial in n)",
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
                "## Example 2 — Write Polynomials in Standard Form\n\nWrite each polynomial in standard form and identify the leading coefficient.\n\n### Step 1: Arrange Terms by Descending Exponent\n\n5x^2 - 2 + 3x → 5x^2 + 3x - 2, leading coefficient: 5\n8y + 7y^3 → 7y^3 + 8y, leading coefficient: 7\n4 - 3c - 5c^2 → -5c^2 - 3c + 4, leading coefficient: -5\n-y^3 + 3y - 3y^2 + 2 → -y^3 - 3y^2 + 3y + 2, leading coefficient: -1",
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
                "## Example 3 — Add and Subtract Polynomials\n\nFind each sum or difference using the horizontal method.\n\n### Step 1: Group Like Terms\n\n(5f + g - 2) + (-2f + 3)\n= 5f - 2f + g - 2 + 3\n= 3f + g + 1\n\n(6k^2 + 2k + 9) + (4k^2 - 5k)\n= 6k^2 + 4k^2 + 2k - 5k + 9\n= 10k^2 - 3k + 9\n\n(2c^2 + 6c + 4) + (5c^2 - 7)\n= 7c^2 + 6c - 3\n\n(2x + 3x^2) - (7 - 8x^2)\n= 2x + 3x^2 - 7 + 8x^2\n= 11x^2 + 2x - 7",
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
                "## Example 4 — Subtract with Negative Signs\n\n(3c^3 - c + 11) - (c^2 + 2c + 8)\n= 3c^3 - c^2 - c - 2c + 11 - 8\n= 3c^3 - c^2 - 3c + 3\n\n(z^2 + z) + (z^2 - 11)\n= 2z^2 + z - 11",
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
                "## Example 5 — Polynomials with Multiple Variables\n\n(x^2y - 3x^2 + y) + (3y - 2x^2y)\n= -x^2y - 3x^2 + 4y\n\n(-8xy + 3x^2 - 5y) + (4x^2 - 2y + 6xy)\n= -2xy + 7x^2 - 7y\n\n(5n - 2p^2 + 2np) - (4p^2 + 4n)\n= 5n - 2p^2 + 2np - 4p^2 - 4n\n= n - 6p^2 + 2np",
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
                "## Example 6 — Real-World Applications\n\nWrite polynomial equations to represent real-world situations and evaluate them.\n\n### Step 1: Write a Polynomial Equation\n\nCompany A profit: P = 3.2x + 12\nCompany B profit: P = 2.7x + 10\n\nWrite a polynomial equation to give the difference in profit D after x years.\n\nD = (3.2x + 12) - (2.7x + 10)\n\n### Step 2: Evaluate the Polynomial\n\nPredict the difference in profit after 10 years.\n\nD = 3.2(10) + 12 - (2.7(10) + 10) = 32 + 12 - 27 - 10 = 7 million dollars\n\n### Step 3: Perimeter Application\n\nThe length of an envelope is always 4 centimeters more than double the width x.\n\nWrite a polynomial equation to give the perimeter P of any envelope.\n\nP = 2(2x + 4) + 2x = 6x + 8\n\nPredict the perimeter when x = 6 cm.\n\nP = 6(6) + 8 = 44 cm",
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
                "## Mixed Exercises\n\nPractice covers all skills from the lesson. Problems include:\n\n- Classifying polynomials by degree and number of terms\n- Adding three or more polynomials with multiple variables\n- A rocket height problem: Two toy rockets are launched straight up. Rocket A height is -16t^2 + 122t and Rocket B height is -16t^2 + 84t. Write an equation to find the difference in height after t seconds, then predict the difference after 5 seconds.\n- A surface area problem: Two identical cylindrical drums with radius r and height h have surface area S = 2πrh + 2πr^2. Write a polynomial for the total surface area of both drums, then evaluate when h = 2 m and r = 0.5 m.\n- A box volume problem: A company ships products in cubic boxes of volume x^3. A new box is 3 inches longer in one dimension and 1 inch shorter in another, with volume x^3 + 2x^2 - 3x. Write expressions for the total volume of 4 of each kind of box and the difference in volume between the boxes.\n- Analyzing whether polynomials are closed under addition using a counterexample\n- A volume comparison: The volume of a sphere with radius x is 4/3 πx^3 and a cube with side length x is x^3. Find the total combined volume and how much more volume the sphere contains.\n- Structure questions about subtracting polynomials in different orders\n- Finding and correcting errors in polynomial subtraction\n- Analyzing whether statements about binomials and subtraction order are true or false\n- Writing a polynomial representing the sum of 2n + 1 and the next two consecutive odd integers\n- Creating two polynomials that add to -11x^3 - x^2 + 5x + 6",
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- Images referenced: Rocket diagram for the toy rocket problem. Student work showing two incorrect approaches to polynomial subtraction. Teachers should consult the original worksheet for the exact diagrams and student examples.\n- The worksheet contains 58 practice problems covering classification, standard form, polynomial operations, and real-world applications.\n- Key concept: Polynomials are closed under addition — the sum of any two polynomials is always a polynomial.\n- When subtracting polynomials, order matters: (a - b) ≠ (b - a) in general.\n- Additive inverses exist for all polynomials: for any polynomial p, there exists -p such that p + (-p) = 0.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-11-lesson-2",
    title: "Multiplying Polynomials by Monomials",
    description:
      "Multiply polynomials by monomials using the Distributive Property, simplify expressions, and solve equations involving polynomial multiplication.",
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
                "## Explore: Distributing Over Polynomials\n\nStudents explore what happens when a single term multiplies an expression with multiple terms. They consider why each term in the polynomial must be multiplied and how the Distributive Property applies to increasingly complex expressions.\n\n**Inquiry Question:**\nHow does the Distributive Property extend when multiplying a monomial by a polynomial with three or more terms?",
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
                "## Key Terms\n\n- **Distributive Property** — For any numbers a, b, and c: a(b + c) = ab + ac\n- **Monomial** — A polynomial with one term, such as 3x^2 or -7ab\n- **Term** — A single mathematical expression consisting of a coefficient and variable(s)\n- **Like Terms** — Terms that have the same variable factors with the same exponents",
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
                "## Learn: Multiplying Polynomials by Monomials\n\n### Key Concept: Distributive Property with Polynomials\n\nTo multiply a monomial by a polynomial, distribute the monomial to each term of the polynomial.\n\nb(b^2 - 12b + 1) → b^3 - 12b^2 + b\n\n### Key Concept: Coefficients and Exponents\n\nWhen multiplying like bases, add the exponents. Apply this rule to each term after distributing.\n\n2pr^2(2pr + 5p^2r - 15p) → 4p^2r^3 + 10p^3r^3 - 30p^2r^2",
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
                "## Example 1 — Multiply Monomials by Polynomials\n\nSimplify each expression by distributing the monomial.\n\n### Step 1: Distribute to Each Term\n\nb(b^2 - 12b + 1) = b^3 - 12b^2 + b\n\nf(f^2 + 2f + 25) = f^3 + 2f^2 + 25f\n\n-3m^3(2m^3 - 12m^2 + 2m + 25) = -6m^6 + 36m^5 - 6m^4 - 75m^3\n\n2j^2(5j^3 - 15j^2 + 2j + 2) = 10j^5 - 30j^4 + 4j^3 + 4j^2",
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
                "## Example 2 — Combine Multiplication with Addition/Subtraction\n\nSimplify each expression involving multiple operations.\n\n### Step 1: Distribute First, Then Combine Like Terms\n\n-3(5x^2 + 2x + 9) + x(2x - 3)\n= -15x^2 - 6x - 27 + 2x^2 - 3x\n= -13x^2 - 9x - 27\n\na(-8a^2 + 2a + 4) + 3(6a^2 - 4)\n= -8a^3 + 2a^2 + 4a + 18a^2 - 12\n= -8a^3 + 20a^2 + 4a - 12\n\n-4d(5d^2 - 12) + 7(d + 5)\n= -20d^3 + 48d + 7d + 35\n= -20d^3 + 55d + 35\n\n-9g(-2g + g^2) + 3(g^3 + 4)\n= 18g^2 - 9g^3 + 3g^3 + 12\n= -6g^3 + 18g^2 + 12",
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
                "## Example 3 — Real-World Applications\n\nApply polynomial multiplication to solve problems involving sums, volumes, and linear equations.\n\n### Step 1: Write and Simplify an Expression\n\nThe sum of the first n whole numbers is given by 1/2(n^2 + n). Expand the expression by multiplying, then find the sum of the first 12 whole numbers.\n\n1/2(n^2 + n) = n^2/2 + n/2\nFor n = 12: 12^2/2 + 12/2 = 72 + 6 = 78\n\n### Step 2: Apply to College Savings\n\nTroy's grandfather gives him $700 to start an account, then $40 each month. His mother gives him $50 each month but has been doing so for 4 fewer months than the grandfather. Write a simplified expression for the amount after m months.\n\nLet grandfather's months = m, mother's months = m - 4.\nTotal = 700 + 40m + 50(m - 4) = 700 + 40m + 50m - 200 = 90m + 500\n\n### Step 3: Geometry Application — Pyramid Volume\n\nThe volume of a pyramid is one-third of base area times height. The base area is B = x^2 - 4x - 12. Write a polynomial for the volume when the height is 10 meters, then find the volume when x = 12 m.\n\nV = 1/3(x^2 - 4x - 12)(10) = 10/3x^2 - 40/3x - 40\nWhen x = 12: V = 10/3(144) - 40/3(12) - 40 = 480 - 160 - 40 = 280 cubic meters",
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
                "## Example 4 — Solve Equations with Polynomial Multiplication\n\nSolve each equation by first simplifying both sides using the Distributive Property.\n\n### Step 1: Expand Both Sides\n\n7(t^2 + 5t - 9) + t = t(7t - 2) + 13\n= 7t^2 + 35t - 63 + t = 7t^2 - 2t + 13\n= 7t^2 + 36t - 63 = 7t^2 - 2t + 13\n= 36t + 13 = -2t + 13\n= 38t = 0\n= t = 0\n\nw(4w + 6) + 2w = 2(2w^2 + 7w - 3)\n= 4w^2 + 6w + 2w = 4w^2 + 14w - 6\n= 4w^2 + 8w = 4w^2 + 14w - 6\n= 8w = 14w - 6\n= -6w = -6\n= w = 1",
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
                "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills. Problems include:\n\n- Simplifying products of monomials and binomials: a(4a + 3), -c(11c + 4)\n- Simplifying products with powers: 3n(n^2 + 2n), 4h(3h - 5)\n- Simplifying trinomial products: 3x(5x^2 - x + 4), 7c(5 - 2c^2 + c^3)\n- Combining distribution with addition/subtraction: w(3w + 2) + 5w, f(5f - 3) - 2f\n- Multi-term distribution: 4b(-5b - 3) - 2(b^2 - 7b - 4), -5q^2w^3(4q + 7w) + 4qw^2(7q^2w + 2q) - 3qw(3q^2w^2 + 9)\n- Solving basic linear equations before multi-step versions\n- A landmarks problem: A circle of 50 flags with a 12-foot sidewalk around it. The outside circumference is 1.10 times the inside circumference. Write and solve an equation for the radius. Recall C = 2πr.\n- A structure problem: Write and simplify an expression for the area of a trapezoid given polynomial expressions for the base lengths in terms of height h.\n- A volume problem: Write and simplify an expression for the volume of a right rectangular prism given polynomial dimensions.\n- A revenue problem: A company expects to sell 45 - 5x products at a price of $1.25x per product. Write and simplify a revenue expression, then determine the price and revenue when x = 4.5.\n- An enclosure area problem: Write and simplify an expression for the area enclosed by a fence with polynomial side lengths.\n- Finding a value p such that 3x^p(4x^{2p} + 3 + 2x^{3p} - 2) = 12x^{12} + 6x^{10}\n- Simplifying an expression with negative exponents: 4x^{-3}y^2(2x^5y^{-4} + 6x^{-7}y^6 - 4x^0y^{-2})\n- Analyzing whether a value of x exists that makes (x + 2)^2 = x^2 + 2^2 true",
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
                "## Review Notes\n\n- Images referenced: Farmers market vegetable problem context. Circle of flags and sidewalk diagram. Trapezoid with polynomial base lengths. Student work showing simplification errors. Revenue problem context. Enclosure fence diagram with polynomial side lengths. Teachers should consult the original worksheet for exact diagrams and values.\n- The worksheet contains 64 practice problems covering multiplication of monomials by polynomials, equation solving, and real-world applications.\n- When multiplying monomials by polynomials, each term gets multiplied and like terms are combined.\n- Negative exponents require care: subtract exponents when dividing like bases.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-11-lesson-3",
    title: "Multiplying Polynomials",
    description:
      "Multiply binomials using FOIL and algebraic multiplication, multiply polynomials with more than two terms, and apply special product patterns.",
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
                "## Explore: Patterns in Polynomial Multiplication\n\nStudents investigate what happens when two binomials are multiplied in different orders. They notice that (a + b)(c + d) = (c + d)(a + b), but (a + b)(a - b) produces a special result different from squaring a single binomial.\n\n**Inquiry Question:**\nWhy do some polynomial products produce predictable patterns while others do not?",
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
                "## Key Terms\n\n- **FOIL Method** — A technique for multiplying two binomials: First, Outer, Inner, Last\n- **Special Products** — Products of polynomials that follow predictable patterns (sum and difference, perfect square trinomials)\n- **Conjugate Pairs** — Two binomials of the form (a + b) and (a - b) whose product is a difference of squares\n- **Perfect Square Trinomial** — A trinomial that results from squaring a binomial",
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
                "## Learn: Multiplying Polynomials\n\n### Key Concept: FOIL Method\n\nWhen multiplying two binomials, multiply in this order: First terms, Outer terms, Inner terms, Last terms.\n\n(3c - 5)(c + 3) → 3c^2 + 9c - 5c - 15 → 3c^2 + 4c - 15\n\n### Key Concept: Sum and Difference Pattern\n\nThe product of conjugates (a + b)(a - b) = a^2 - b^2\n\n(12t - 5)(12t + 5) = (12t)^2 - 5^2 = 144t^2 - 25",
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
                "## Example 1 — Multiply Binomials\n\nFind each product using FOIL or vertical method.\n\n### Step 1: Apply FOIL\n\n(3c - 5)(c + 3) = 3c^2 + 9c - 5c - 15 = 3c^2 + 4c - 15\n\n(g + 10)(2g - 5) = 2g^2 - 5g + 20g - 50 = 2g^2 + 15g - 50\n\n(6a + 5)(5a + 3) = 30a^2 + 18a + 25a + 15 = 30a^2 + 43a + 15\n\n(4x + 1)(6x + 3) = 24x^2 + 12x + 6x + 3 = 24x^2 + 18x + 3\n\n### Step 2: Check for Special Patterns\n\n(5r + 7)(5r - 7) = (5r)^2 - 7^2 = 25r^2 - 49 (sum and difference)",
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
                "## Example 2 — Multiply Binomials with Different Variables\n\n(8w + 4x)(5w - 6x) = 40w^2 - 48wx + 20wx - 24x^2 = 40w^2 - 28wx - 24x^2\n\n(11z - 5y)(3z + 2y) = 33z^2 + 22zy - 15zy - 10y^2 = 33z^2 + 7zy - 10y^2",
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
                "## Example 3 — Area and Volume Applications\n\n### Step 1: Write Polynomial Expressions for Area\n\nA playground has width 9x + 1 feet and length 5x - 2 feet. Write an expression for the area.\n\nA = (9x + 1)(5x - 2) = 45x^2 - 18x + 5x - 2 = 45x^2 - 13x - 2 square feet\n\nA theater has 3c + 8 rows with 4c - 1 seats per row. Write an expression for total seats.\n\nSeats = (3c + 8)(4c - 1) = 12c^2 - 3c + 32c - 8 = 12c^2 + 29c - 8\n\n### Step 2: Number Trick with Polynomials\n\nThink of a whole number n. Subtract 2 and write it down. Take the original number, add 2, and write it down. Find the product and subtract n^2. The result is always -4. Show why using polynomials.\n\nOriginal: n\nFirst result: n - 2\nSecond result: n + 2\nProduct: (n - 2)(n + 2) = n^2 - 4\nSubtract n^2: (n^2 - 4) - n^2 = -4",
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
                "## Example 4 — Multiply a Binomial by a Trinomial\n\nUse horizontal distribution: multiply each term of the binomial by each term of the trinomial.\n\n### Step 1: Distribute Each Term\n\n(2y - 11)(y^2 - 3y + 2)\n= 2y(y^2) + 2y(-3y) + 2y(2) - 11(y^2) - 11(-3y) - 11(2)\n= 2y^3 - 6y^2 + 4y - 11y^2 + 33y - 22\n= 2y^3 - 17y^2 + 37y - 22\n\n(4a + 7)(9a^2 + 2a - 7)\n= 36a^3 + 8a^2 - 28a + 63a^2 + 14a - 49\n= 36a^3 + 71a^2 - 14a - 49",
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
                "## Example 5 — Cubes of Binomials\n\n### Step 1: Expand Step by Step\n\n(2r - 3t)^3 = (2r - 3t)(2r - 3t)(2r - 3t)\n\nFirst: (2r - 3t)^2 = 4r^2 - 12rt + 9t^2\n\nThen: (4r^2 - 12rt + 9t^2)(2r - 3t)\n= 8r^3 - 12r^2t - 24r^2t + 36rt^2 + 18rt^2 - 27t^3\n= 8r^3 - 36r^2t + 54rt^2 - 27t^3",
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
                "## Example 6 — Simplify and Find Products\n\n### Step 1: Combine Like Terms Before Multiplying\n\n(m + 2)[(m^2 + 3m - 6) + (m^2 - 2m + 4)]\n= (m + 2)(2m^2 + m - 2)\n= 2m^3 + m^2 - 2m + 4m^2 + 2m - 4\n= 2m^3 + 5m^2 - 4\n\n### Step 2: Subtract First, Then Multiply\n\n[(t^2 + 3t - 8) - (t^2 - 2t + 6)](t - 4)]\n= (t^2 + 3t - 8 - t^2 + 2t - 6)](t - 4)]\n= (5t - 14)](t - 4)]\n= 5t^2 - 20t - 14t + 56\n= 5t^2 - 34t + 56",
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
                "## Mixed Exercises\n\nPractice includes:\n\n- Multiplying binomials: (m + 4)(m + 1), (x + 2)(x + 2), (r + 1)(r - 2), etc.\n- Multiplying binomials with coefficients: (3c + 1)(c - 2), (2x - 6)(x + 3), (3b + 3)(3b - 2)\n- Multiplying binomials with different variables: (w + 4)(w^2 + 3w - 6), (t + 1)(t^2 + 2t + 4)\n- Squaring binomials: (a - 2b)^2, (3c + 4d)^2\n- Cubing binomials: (2r - 3t)^3, (5g + 2h)^3\n- Mixed operations with brackets: (m + 2)[(m^2 + 3m - 6) + (m^2 - 2m + 4)]\n- A mural frame problem: A museum mural has length 5 feet longer than its width, with a 2-foot wide frame covering 100 square feet total. Write expressions for the mural area, frame area, and solve for mural dimensions.\n- A composite figure area problem: Write and simplify a quadratic expression for the area of a figure with dimensions given in terms of triangle height h. If h = 1.42 units, find the area to the nearest hundredth.\n- A profit model problem: Monthly profit is given by P = n(p - U) - F, where n = 5000 - 40p is monthly sales, U = $30 unit cost, and F = $3000 fixed cost. Write profit as a quadratic in p, then find profit when p = $77.50.\n- A rectangular prism volume problem: Find an expression for the volume given polynomial dimensions.\n- Analyzing whether the FOIL method can multiply a binomial and trinomial (and why or why not)\n- Simplifying expressions with exponents: x^{4p+1}(x^{1-2p})^2p+3\n- Which one doesn't belong: Identify which of four polynomial expressions does not belong with the others.\n- Finding errors in multiplication: Two students incorrectly multiplied (2x + 1)(x - 4). Find their mistakes.",
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Review Notes",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Review Notes\n\n- Images referenced: Flag case diagram. Frame and mural dimensions. Composite figure with triangular height. Profit model diagram. Four polynomial expressions for \"Which One Doesn't Belong?\". Student work for (2x + 1)(x - 4). Teachers should consult the original worksheet for exact diagrams.\n- The worksheet contains 68 practice problems.\n- FOIL only applies to binomials — for larger polynomials, use distribution or vertical multiplication.\n- The sum and difference pattern (a + b)(a - b) always produces a difference of squares.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-11-lesson-4",
    title: "Special Products",
    description:
      "Identify and apply special product patterns: sum and difference, square of a sum, square of a difference, and extend to cubes of binomials.",
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
                "## Explore: Patterns in Squaring Binomials\n\nStudents investigate what happens when they multiply (a + b)(a + b) compared to adding a and b first, then squaring. They discover that (a + b)^2 ≠ a^2 + b^2 in general — there is a middle term.\n\n**Inquiry Question:**\nWhy is (a + b)^2 not equal to a^2 + b^2? What term appears between them and why?",
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
                "## Key Terms\n\n- **Sum and Difference Pattern** — (a + b)(a - b) = a^2 - b^2\n- **Square of a Sum** — (a + b)^2 = a^2 + 2ab + b^2\n- **Square of a Difference** — (a - b)^2 = a^2 - 2ab + b^2\n- **Perfect Square Trinomial** — A trinomial that results from squaring a binomial\n- **Conjugate Pairs** — Two binomials that differ only in the sign between terms: (a + b) and (a - b)",
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
                "## Learn: Special Products\n\n### Key Concept: Square of a Sum\n\n(a + b)^2 = (a + b)(a + b) = a^2 + 2ab + b^2\n\n(h + 7)^2 = h^2 + 14h + 49\n(x + 6)^2 = x^2 + 12x + 36\n\n### Key Concept: Square of a Difference\n\n(a - b)^2 = (a - b)(a - b) = a^2 - 2ab + b^2\n\n(8 - m)^2 = 64 - 16m + m^2\n(9 - 2y)^2 = 81 - 36y + 4y^2\n(2b + 3)^2 = 4b^2 + 12b + 9\n\n### Key Concept: Sum and Difference\n\n(a + b)(a - b) = a^2 - b^2\n\n(a + 10)(a - 10) = a^2 - 100\n(2q + 5r)(2q - 5r) = 4q^2 - 25r^2",
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
                "## Example 1 — Apply Special Product Patterns\n\nFind each product using the appropriate special pattern.\n\n### Step 1: Identify the Pattern\n\n(8h - 4n)^2 — Square of a difference: a = 8h, b = 4n\n= (8h)^2 - 2(8h)(4n) + (4n)^2\n= 64h^2 - 64hn + 16n^2\n\n(4m - 5n)^2 — Square of a difference: a = 4m, b = 5n\n= (4m)^2 - 2(4m)(5n) + (5n)^2\n= 16m^2 - 40mn + 25n^2",
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
                "## Example 2 — Real-World Applications\n\n### Step 1: Roundabout Area Problem\n\nA city roundabout has radius r for the traffic circle and a 18-foot wide road surrounding it. Write a polynomial for the total area A of the traffic circle.\n\nTotal radius = r + 18\nA = π(r + 18)^2 = π(r^2 + 36r + 324) = πr^2 + 36πr + 324π\n\n### Step 2: Number Cube Problem\n\nCube A has edges 3 mm less than cube B. If cube B has edge length x mm, write a model for the surface area of cube A.\n\nCube B edge: x mm\nCube A edge: x - 3 mm\nSurface area of cube A: 6(x - 3)^2 = 6(x^2 - 6x + 9) = 6x^2 - 36x + 54 square mm\n\n### Step 3: Probability with Square of a Sum\n\nA spinner has two equal sections, blue (B) and red (R). Use the square of a sum to determine all possible combinations when spinning the spinner twice.\n\n(B + R)^2 = B^2 + 2BR + R^2\nPossible combinations: BB, BR, RB, RR\n\n### Step 4: Business Profit Model\n\nA company's profit from 2015 to present is modeled by y = (2n + 11)^2, where y is profit n years since 2015. Which special product does this demonstrate? Simplify it.\n\nThis is the square of a sum: (2n)^2 + 2(2n)(11) + 11^2 = 4n^2 + 44n + 121",
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
                "## Example 3 — More Sum and Difference Products\n\n(u + 3)(u - 3) = u^2 - 9\n(b + 7)(b - 7) = b^2 - 49\n(2 + x)(2 - x) = 4 - x^2\n(4 - x)(4 + x) = 16 - x^2\n(2q + 5r)(2q - 5r) = 4q^2 - 25r^2\n(3a^2 + 7b)(3a^2 - 7b) = 9a^4 - 49b^2",
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
                "## Example 4 — Cubes of Binomials\n\n### Step 1: Pattern for Cube of a Sum\n\n(a + b)^3 = (a + b)(a + b)(a + b)\n\nFirst find (a + b)^2: a^2 + 2ab + b^2\n\nThen multiply by (a + b): (a^2 + 2ab + b^2)(a + b)\n= a^3 + a^2b + 2a^2b + 2ab^2 + ab^2 + b^3\n= a^3 + 3a^2b + 3ab^2 + b^3\n\n### Step 2: Pattern for Cube of a Difference\n\n(a - b)^3 = a^3 - 3a^2b + 3ab^2 - b^3\n\n### Step 3: Apply to Find (x + 2)^3\n\nLet a = x and b = 2:\n(x + 2)^3 = x^3 + 3x^2(2) + 3x(2^2) + 2^3 = x^3 + 6x^2 + 12x + 8",
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
                "## Mixed Exercises\n\nPractice includes:\n\n- Squares of binomials: (n + 3)^2, (y - 7)^2, (3g + 2)^2\n- Sum and difference products: (b + 1)(b - 1), (3q + 1)(3q - 1)\n- Products with coefficients: (6 + u)^2, (2k - 2)^2\n- Multi-variable squares: (r + t)^2, (c - d)^2, (w + 3h)^2, (x - 4y)^2\n- Product of conjugates: (3y - 3g)(3y + 3g), (3a^4 - b)(3a^4 + b)\n- Squaring expressions with exponents: (n^2 + r^2)^2, (2k + m^2)^2, (3t^2 - n)^2\n- Products with fractions: (3/4k + 8)^2, (2/5y - 4)^2\n- Products of multiple binomials: (2m + 3)(2m - 3)(m + 4), (r + 2)(r - 5)(r - 2)(r + 5)\n- Cubing binomials: (c + d)(c + d)(c + d), (2a - b)^3\n- Raising products to powers: (f + g)(f - g)(f + g), (k - m)^2(k + m)\n- Geometry problem: A rectangle's length is the sum of two whole numbers, width is the difference of the same two numbers. Write a verbal expression for the area.\n- Product of (10 - 4t) and (10 + 4t) — identify the special product type.\n- Storage problem: A cylindrical tank and PVC pipe in a corner. Given tank radius r and pipe radius s, use the Pythagorean Theorem to write a relationship, then write a polynomial to solve for s when r = 20 inches.\n- Structure investigation: Tanisha investigates square growth patterns. How much more area does a square with side s + 1 have than one with side s? With side s + 2 compared to s + 1? With side s + 3 compared to s + 2?\n- Which one doesn't belong: Which expression does not belong with the others?\n- Pattern investigation: Find (a + b)^3 by multiplying (a + b)(a + b)(a + b), then use it to find (x + 2)^3, and describe a geometric model.\n- Find c so that 25x^2 - 90x + c is a perfect square trinomial.",
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
                "## Review Notes\n\n- Images referenced: Roundabout traffic circle diagram. Number cubes comparison. Probability spinner. Cylindrical tank and PVC pipe side view. Square growth pattern diagram. Four expressions for \"Which One Doesn't Belong?\". Teachers should consult the original worksheet for exact diagrams.\n- The worksheet contains 80 practice problems.\n- Key patterns to remember:\n  - (a + b)(a - b) = a^2 - b^2\n  - (a + b)^2 = a^2 + 2ab + b^2\n  - (a - b)^2 = a^2 - 2ab + b^2\n  - (a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3\n  - (a - b)^3 = a^3 - 3a^2b + 3ab^2 - b^3",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-11-lesson-5",
    title: "Using the Distributive Property",
    description:
      "Use the Distributive Property to factor out the greatest common factor from polynomials and factor by grouping when there is no single common factor.",
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
                "## Explore: Reversing Multiplication\n\nStudents consider what it means to work backwards from a product. They explore taking a polynomial like 12x + 18 and asking \"what multiplied by what gives this result?\"\n\n**Inquiry Question:**\nIf 3(4 + 6) = 30, what question does this answer in reverse? What does factoring reveal about the structure of a polynomial?",
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
                "## Key Terms\n\n- **Greatest Common Factor (GCF)** — The largest expression that divides evenly into each term of a polynomial\n- **Factoring** — The process of rewriting a polynomial as a product of its factors\n- **Factoring by Grouping** — A technique where terms are grouped to reveal a common factor in each group\n- **Distributive Property (factoring form)** — ab + ac = a(b + c)",
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
                "## Learn: Using the Distributive Property to Factor\n\n### Key Concept: Finding the Greatest Common Factor\n\nTo factor a polynomial, find the largest expression that divides evenly into every term.\n\n16t - 40y → GCF is 8 → 8(2t - 5y)\n30v + 50x → GCF is 10 → 10(3v + 5x)\n2k^2 + 4k → GCF is 2k → 2k(k + 2)\n\n### Key Concept: Factoring with Multiple Variables\n\nWhen factoring expressions with multiple variables, find the GCF for both the numerical coefficients and each variable separately.\n\n4a^2b^2 + 2a^2b - 10ab^2 → GCF is 2ab\n= 2ab(2ab + a - 5b)\n\n5c^2v - 15c^2v^2 + 5c^2v^3 → GCF is 5c^2v\n= 5c^2v(1 - 3v + v^2)",
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
                "## Example 1 — Factor Using the Distributive Property\n\nUse the Distributive Property to factor each polynomial by extracting the GCF.\n\n### Step 1: Find the GCF of All Terms\n\n16t - 40y → Numbers: factors of 16: 1, 2, 4, 8, 16; factors of 40: 1, 2, 4, 5, 8, 10, 20, 40 → GCF of coefficients: 8. No common variable. → 8(2t - 5y)\n\n5z^2 + 10z → GCF is 5z → 5z(z + 2)",
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
                "## Example 2 — Factor to Solve Real-World Problems\n\nFactor expressions that model real-world scenarios.\n\n### Step 1: Falling Object Height\n\nThe height of an object launched upward from ground level at 32 feet per second is given by 32t - 16t^2. Factor this expression.\n\nGCF is 16t: 16t(2 - t)\n\n### Step 2: Swimming Pool Area\n\nThe area of a rectangular pool is given by 12w - w^2, where w is the width. Factor this expression.\n\nGCF is w: w(12 - w)\n\n### Step 3: Vertical Jump Height\n\nA basketball player's height above standing reach after t seconds is modeled by 162t - 192t^2. Factor this expression.\n\nGCF is 6t: 6t(27 - 32t)\n\n### Step 4: Treat Toss Height\n\nA treat tossed upward at 13.7 meters per second has height given by 13.7t - 4.9t^2. Factor this expression.\n\nGCF is 0.7t: 0.7t(19.5 - 7t)",
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
                "## Example 3 — Factor by Grouping\n\nWhen a polynomial has four or more terms, try grouping terms that share a common factor.\n\n### Step 1: Group Terms with Common Factors\n\nfg - 5g + 4f - 20\nGroup: (fg - 5g) + (4f - 20)\nFactor each group: g(f - 5) + 4(f - 5)\nFactor out (f - 5): (f - 5)(g + 4)\n\nxy - 2x - 2 + y\nGroup: (xy - 2x) + (y - 2)\nFactor each group: x(y - 2) + 1(y - 2)\nFactor out (y - 2): (y - 2)(x + 1)\n\n### Step 2: Arrange Terms Before Grouping\n\n3dt - 21d + 35 - 5t\nReorder: 3dt - 21d - 5t + 35\nGroup: (3dt - 21d) + (-5t + 35)\nFactor each group: 3d(t - 7) - 5(t - 7)\nFactor out (t - 7): (t - 7)(3d - 5)",
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
                "## Example 4 — More Factoring by Grouping\n\nContinue practicing the grouping technique with various polynomial structures.\n\n45pq - 27q - 50p + 30\nGroup: (45pq - 27q) + (-50p + 30)\nFactor each group: 9q(5p - 3) - 10(5p - 3)\nFactor out (5p - 3): (5p - 3)(9q - 10)\n\n24ty - 18t + 4y - 3\nGroup: (24ty - 18t) + (4y - 3)\nFactor each group: 6t(4y - 3) + 1(4y - 3)\nFactor out (4y - 3): (4y - 3)(6t + 1)\n\nvp + 12v + 8p + 96\nGroup: (vp + 12v) + (8p + 96)\nFactor each group: v(p + 12) + 8(p + 12)\nFactor out (p + 12): (p + 12)(v + 8)\n\n5br - 25b + 2r - 10\nGroup: (5br - 25b) + (2r - 10)\nFactor each group: 5b(r - 5) + 2(r - 5)\nFactor out (r - 5): (r - 5)(5b + 2)\n\n2nu - 8u + 3n - 12\nGroup: (2nu - 8u) + (3n - 12)\nFactor each group: 2u(n - 4) + 3(n - 4)\nFactor out (n - 4): (n - 4)(2u + 3)",
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
                "## Mixed Exercises\n\nPractice includes:\n\n- Factoring with GCF: 7x + 49, 8m - 6, 5a^2 - 15\n- Factoring with powers: 10q - 25q^2, a^2b^2 + a, x + x^2y + x^3y^2\n- Factoring complex expressions: 3p^2r^2 + 6pr + p, 4a^2b^2 + 16ab + 12a, 10h^3n^3 - 2hn^2 + 14hn\n- Factoring expressions with coefficients: 48a^2b^2 - 12ab, 6x^2y - 21y^2w + 24xw\n- Factoring by grouping: x^2 + 3x + x + 3, 2x^2 - 5x + 6x - 15, 3n^2 + 6np - np - 2p^2\n- Decimals in coefficients: 4x^2 - 1.2x + 0.5x - 0.15, 3x^2 + 24x - 1.5x - 12, 2x^2 - 0.6x + 3x - 0.9\n- Mixed grouping with different variable arrangements: 9x^2 - 3xy + 6x - 2y\n- An archery problem: The height of an arrow is modeled by 80t - 16t^2. Factor the expression.\n- A regularity question: Compare factoring using the Distributive Property versus factoring by grouping — what are the similarities?\n- Create your own four-term polynomial that can be factored by grouping.\n- Find the error: Theresa says to factor 3x^2 + 7x - 18x - 42 using groups (3x^2 - 18x) and (7x - 42). Akash says to use (3x^2 + 7x) and (-18x - 42). Determine who is correct and justify.\n- Choose a value q so that 2x^2 + qx + 7x - 21 can be factored by grouping, then factor the expression.\n- Explain how to factor 12a^2b^2 - 16a^2b^3.",
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
                "## Review Notes\n\n- Images are not heavily used in this lesson; the problems are primarily algebraic manipulation.\n- The worksheet contains 49 practice problems covering GCF factoring, factoring by grouping, and real-world applications.\n- Key insight: The Distributive Property works in both directions — to expand (distribute) or to factor (提取).\n- When factoring by grouping, the factored form must be the same binomial factor in each group.\n- Physical interpretation of factored forms: For 16t(2 - t), the 16t represents \"16 times t groups\" and (2 - t) represents \"2 minus t per group\".",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-11-lesson-6",
    title: "Factoring Quadratic Trinomials",
    description:
      "Factor trinomials of the form x^2 + bx + c and ax^2 + bx + c where a ≠ 1, determine whether a trinomial is prime, and apply factoring to real-world problems.",
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
                "## Explore: Reversing FOIL\n\nStudents consider the reverse of multiplying two binomials. Given a quadratic trinomial, what two binomials, when multiplied, produce it?\n\n**Inquiry Question:**\nGiven that (x + 3)(x + 5) = x^2 + 8x + 15, how can we work backwards from x^2 + 8x + 15 to find the original binomials?",
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
                "## Key Terms\n\n- **Prime Trinomial** — A trinomial that cannot be factored using integer coefficients\n- **Factoring Quadratic Trinomials** — Writing a quadratic expression as a product of two binomials\n- **AC Method** — A technique for factoring trinomials where a ≠ 1 by multiplying a and c, then finding factors that sum to b",
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
                "## Learn: Factoring Quadratic Trinomials\n\n### Key Concept: Factoring x^2 + bx + c\n\nFind two numbers that multiply to c and add to b.\n\nx^2 + 17x + 42 → Find two numbers that multiply to 42 and add to 17: 3 and 14.\n→ (x + 3)(x + 14)\n\ny^2 - 17y + 72 → Find two numbers that multiply to 72 and add to -17: -8 and -9.\n→ (y - 8)(y - 9)\n\n### Key Concept: Sign Patterns\n\nWhen c is positive and b is negative, both factors are negative.\nWhen c is negative, one factor is positive and one is negative.\n\na^2 + 8a - 48 → Two numbers that multiply to -48 and add to 8: 12 and -4.\n→ (a + 12)(a - 4)\n\nn^2 - 2n - 35 → Two numbers that multiply to -35 and add to -2: -7 and 5.\n→ (n - 7)(n + 5)",
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
                "## Example 1 — Factor x^2 + bx + c Trinomials\n\nFactor each polynomial, if possible. If the polynomial cannot be factored using integers, write prime.\n\n### Step 1: Identify the Sign Pattern\n\nFor x^2 + 17x + 42: c is positive, b is positive → both factors positive.\nFor y^2 - 17y + 72: c is positive, b is negative → both factors negative.\nFor a^2 + 8a - 48: c is negative → one factor positive, one negative.\n\n### Step 2: Find the Number Pair\n\n44 + 15h + h^2 → Rewrite as h^2 + 15h + 44. Find numbers that multiply to 44 and add to 15: 4 and 11.\n→ (h + 4)(h + 11)\n\n40 - 22x + x^2 → Rewrite as x^2 - 22x + 40. Find numbers that multiply to 40 and add to -22: -2 and -20.\n→ (x - 2)(x - 20)\n\n-24 - 5x + x^2 → Rewrite as x^2 - 5x - 24. Find numbers that multiply to -24 and add to -5: -8 and 3.\n→ (x - 8)(x + 3)\n\n### Step 3: Check for Prime Cases\n\nd^2 + 5d - 13 → Find two numbers that multiply to -13 and add to 5: ±1 and ±13. No pair works. → prime\n\ny^2 - 6y + 17 → Find two numbers that multiply to 17 and add to -6: ±1 and ±17. No pair works. → prime",
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
                "## Example 2 — More x^2 + bx + c Problems\n\nContinue factoring or identifying prime trinomials.\n\nn^2 + 7n + 12 → Numbers that multiply to 12 and add to 7: 3 and 4 → (n + 3)(n + 4)\n\nb^2 - 12b - 101 → No integer pair multiplies to -101 and adds to -12. → prime\n\np^2 + 9p + 20 → Numbers that multiply to 20 and add to 9: 4 and 5 → (p + 4)(p + 5)\n\nc^2 + c + 21 → No integer pair multiplies to 21 and adds to 1. → prime",
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
                "## Example 3 — Real-World Applications\n\n### Step 1: Cosmetics Case Problem\n\nA cosmetics case has width that is 2 cm greater than the length x. The area is x^2 + 26x + 168. Factor this expression.\n\nFind numbers that multiply to 168 and add to 26: 12 and 14.\nx^2 + 26x + 168 = (x + 12)(x + 14)\nThe length is x + 12 and the width is x + 14 (or vice versa).\n\n### Step 2: Carpentry Crate Problem\n\nA crate volume is 2x^2 - 6x - 80. Factor this expression.\n\n2x^2 - 6x - 80 → First factor out 2: 2(x^2 - 3x - 40)\nFind numbers that multiply to -40 and add to -3: -8 and 5.\n→ 2(x - 8)(x + 5)\n\n### Step 3: Bridge Cable Height\n\nA cable's height above the deck at distance d yards from the first tower is d^2 - 36d + 324. Factor this expression.\n\nFind numbers that multiply to 324 and add to -36: -18 and -18.\nd^2 - 36d + 324 = (d - 18)^2\n\n### Step 4: Break-Even Point\n\nA museum's break-even point is modeled by 2h^2 - 2h - 24, where h is hours open per day. Factor this expression.\n\n2h^2 - 2h - 24 → Factor out 2: 2(h^2 - h - 12)\nFind numbers that multiply to -12 and add to -1: -4 and 3.\n→ 2(h - 4)(h + 3)",
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
                "## Example 4 — Factor ax^2 + bx + c where a ≠ 1\n\nUse the AC method: multiply a and c, find factors that sum to b, then rewrite and group.\n\n### Step 1: Apply AC Method\n\n5x^2 + 34x + 24 → Multiply a and c: 5 × 24 = 120\nFind factors of 120 that sum to 34: 4 and 30\nRewrite: 5x^2 + 4x + 30x + 24\nGroup: (5x^2 + 4x) + (30x + 24)\nFactor: x(5x + 4) + 6(5x + 4)\n→ (5x + 4)(x + 6)\n\n2x^2 + 19x + 24 → Multiply: 2 × 24 = 48\nFind factors of 48 that sum to 19: 3 and 16\nRewrite: 2x^2 + 3x + 16x + 24\nFactor: x(2x + 3) + 8(2x + 3)\n→ (2x + 3)(x + 8)\n\n### Step 2: Check if Prime\n\n4x^2 + 22x + 10 → Multiply: 4 × 10 = 40\nFind factors of 40 that sum to 22: No pair works → prime\n\n2x^2 + 3x + 6 → Multiply: 2 × 6 = 12\nFind factors of 12 that sum to 3: No pair works → prime\n\n5x^2 + 3x + 4 → Multiply: 5 × 4 = 20\nFind factors of 20 that sum to 3: No pair works → prime\n\n### Step 3: Trinomials with Negative Middle Term\n\n4x^2 - 13x + 10 → Multiply: 4 × 10 = 40\nFind factors of 40 that sum to -13: -5 and -8\nRewrite: 4x^2 - 5x - 8x + 10\nFactor: x(4x - 5) - 2(4x - 5)\n→ (4x - 5)(x - 2)",
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
                "## Mixed Exercises\n\nPractice includes:\n\n- Factor x^2 + bx + c trinomials: n^2 + 3n - 18, x^2 + 2x - 8, r^2 + 4r - 12, x^2 - x - 12, w^2 - w - 6, y^2 - 6y + 8, t^2 - 15t + 56\n- Reorder and factor: -4 - 3m + m^2\n- Factor ax^2 + bx + c trinomials: 2x^2 + 5x + 2, 3n^2 + 5n + 2, 3g^2 - 7g + 2, 2t^2 - 11t + 15, 4x^2 - 3x - 3, 4b^2 + 15b - 4\n- Prime identification: x^2 + 2x - 15, x^2 - 6x - 7, p^2 - 10p + 21, x^2 + x - 20\n- Factor with different variable arrangements: 9p^2 + 6p - 8, 6q^2 - 13q + 6, q^2 + 11qr + 18r^2, x^2 - 14xy - 51y^2, x^2 - 6xy + 5y^2, a^2 + 10ab - 39b^2\n- Negative coefficient trinomials: -6x^2 - 23x - 20, -4x^2 - 15x - 14, -5x^2 + 18x + 8, -6x^2 + 31x - 35, -4x^2 + 5x - 12, -12x^2 + x + 20\n- Pyramidal monument problem: A stone monument has height 9 feet, base length is 5 feet greater than width, and volume is 3x^2 - 15x - 150. Factor the expression and interpret each factor.\n- Projectile time problem: A T-shirt is launched from 32 feet above ground at 16 ft/s initial velocity. The height model is -16t^2 + 16t + 32. Write and factor an expression for the time in the air.\n- Which one doesn't belong: Which expression does not belong with the others?\n- Find the error: Jamaall and Charles factored x^2 + 6x - 16 differently. Determine who is correct.\n- Analyze problems: Find all values of k so that x^2 + kx - 19 and x^2 + kx + 14 can be factored with integers. Find k values so that x^2 - 8x + k and x^2 - 5x + k with k > 0 are factorable.\n- Determine whether the absolute value of b is sometimes, always, or never less than the absolute value of c in factorable trinomials x^2 + bx + c.\n- Persevere: Factor (4y - 5)^2 + 3(4y - 5) - 70 by treating (4y - 5) as a single variable.\n- Analyze: A square has area 9x^2 + 30xy + 25y^2. The dimensions are binomials with positive integer coefficients. Find the perimeter.\n- Find all values of k so that 2x^2 + kx + 12 can be factored as two binomials using integers.",
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
                "## Review Notes\n\n- Images referenced: Cosmetics case diagram. Suspension bridge cable diagram. Four expressions for \"Which One Doesn't Belong?\". Student work for factoring x^2 + 6x - 16. Teachers should consult the original worksheet for exact diagrams.\n- The worksheet contains 85 practice problems covering factoring techniques and applications.\n- For x^2 + bx + c: Find two numbers that multiply to c and add to b.\n- For ax^2 + bx + c: Use the AC method — multiply a and c, find two numbers that multiply to ac and add to b, then rewrite and group.\n- When c is negative in x^2 + bx + c: The two factors have opposite signs, with the larger absolute value taking the sign of b.\n- Prime trinomials cannot be factored using integers.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "module-11-lesson-7",
    title: "Factoring Special Products",
    description:
      "Factor polynomials using the difference of squares pattern and recognize perfect square trinomials, then apply special factoring to solve real-world problems.",
    orderIndex: 7,
    phases: [
      {
        phaseNumber: 1,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Learn: Difference of Squares\n\nPolynomials that fit the difference of squares pattern can be factored quickly once the two perfect squares are identified.\n\n### Key Concept: Difference of Squares\n\n- A binomial is a difference of squares if it can be written as a^2 - b^2.\n- The factored form is (a+b)(a-b).\n- Always look for a greatest common factor (GCF) before applying special factoring patterns.\n- The difference of squares pattern can sometimes be applied more than once.",
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
                "## Key Terms\n\n- **Difference of squares** — A binomial of the form a^2 - b^2 that factors into (a+b)(a-b).\n- **Perfect square trinomial** — A trinomial of the form a^2 + 2ab + b^2 or a^2 - 2ab + b^2 that factors into a binomial squared.\n- **Prime polynomial** — A polynomial that cannot be factored using integer coefficients.\n- **Factor by grouping** — A factoring method used for polynomials with four or more terms by grouping terms with common factors.",
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
                "## Example 1 — Factor Difference of Squares\n\nFactor polynomials that are differences of squares, including those requiring multiple applications of the pattern or preliminary factoring.\n\n### Step 1: Look for a GCF\n\nCheck whether all terms share a common factor. If so, factor it out first.\n\n3c^3 + 2c^2 - 147c - 98 = c^2(3c + 2) - 49(3c + 2)\n\n### Step 2: Identify Perfect Squares\n\nRewrite each term as a perfect square.\n\na^2 - b^2\n\n### Step 3: Apply the Pattern\n\nWrite the factored form using the sum and difference of the square roots.\n\na^2 - b^2 = (a+b)(a-b)\n\n### Step 4: Check for Repeated Patterns\n\nIf a factor is itself a difference of squares, apply the pattern again until fully factored.\n\nw^4 - 625 = (w^2+25)(w^2-25) = (w^2+25)(w+5)(w-5)",
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
                "## Example 2 — Factor by Grouping\n\nFactor polynomials with four terms by grouping pairs of terms and then applying special factoring patterns.\n\n### Step 1: Group Terms\n\nGroup the first two terms and the last two terms.\n\n(2x^3 - x^2) - (162x - 81)\n\n### Step 2: Factor Out the GCF from Each Group\n\nFactor out the greatest common factor from each group.\n\nx^2(2x - 1) - 81(2x - 1)\n\n### Step 3: Factor Out the Common Binomial\n\nFactor out the common binomial factor.\n\n(2x - 1)(x^2 - 81)\n\n### Step 4: Apply Special Factoring Patterns\n\nIf the remaining factor fits a special pattern, continue factoring.\n\n(2x - 1)(x+9)(x-9)",
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
                "## Example 3 — Apply Difference of Squares to Area Problems\n\nUse the difference of squares pattern to factor expressions that represent areas of squares and rectangles, then interpret the factors as dimensions.\n\n### Step 1: Write the Area Expression\n\nIdentify the expression that represents the area of the region.\n\nA = x^2 - 25\n\n### Step 2: Factor the Expression\n\nRecognize the difference of squares and factor.\n\nx^2 - 25 = (x+5)(x-5)\n\n### Step 3: Interpret the Factors\n\nThe factors represent the possible length and width of the rectangular region.\n\nA = a^2 - 4b^2 = (a+2b)(a-2b)\n\nThe factors (a+2b) and (a-2b) represent the length and width.",
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
                "## Example 4 — Identify Perfect Square Trinomials\n\nDetermine whether a trinomial is a perfect square by checking the relationship between its terms.\n\n### Step 1: Check the First and Last Terms\n\nVerify that the first term and the last term are perfect squares.\n\n16x^2 = (4x)^2, 49 = 7^2\n\n### Step 2: Check the Middle Term\n\nConfirm that the middle term equals 2ab or -2ab.\n\n-56x = -2(4x)(7)\n\n### Step 3: Write Yes or No\n\nIf all conditions are met, write yes and factor. Otherwise, write no.\n\n16x^2 - 56x + 49 = (4x - 7)^2",
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
                "## Example 5 — Factor Perfect Square Trinomials\n\nFactor trinomials that have been identified as perfect squares.\n\n### Step 1: Identify a and b\n\nFind the square roots of the first and last terms.\n\na = 9n, b = 5\n\n### Step 2: Write the Factored Form\n\nUse the sign of the middle term to determine whether to use (a+b)^2 or (a-b)^2.\n\n9n^2 + 30n + 25 = (3n + 5)^2",
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
                "## Mixed Exercises\n\nThe mixed exercises provide comprehensive practice in factoring special products. Problems include:\n\n- Factoring differences of squares, including those with a GCF or multiple variables.\n- Identifying and factoring perfect square trinomials.\n- Recognizing prime polynomials such as sums of squares that cannot be factored over the integers.\n- Factoring four-term polynomials by grouping.\n- Applying factoring skills to real-world contexts including garden design, parking lots, and manufacturing volumes.\n- Analyzing and critiquing the reasoning of others about factoring patterns.",
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
                "## Review Notes\n\n- Several diagrams and images appear in the original worksheet (rug, roof truss, washers, error analysis, and \"which one doesn't belong\") that could not be described from the text extraction. These should be reviewed for visual context.\n- Problems involving geometric diagrams may require image assets or teacher-provided descriptions.\n- The \"Find the Error\" problem references a visual comparison of two students' work that is not available in text form.\n- The triangular roof truss area problem includes a fraction coefficient that should be reviewed for proper rendering.",
            },
          },
        ],
      },
    ],
  },
];

export const seedModule11Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule11LessonsResult> => {
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
            unitNumber: 11,
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
      let activitiesCreated = 0;

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