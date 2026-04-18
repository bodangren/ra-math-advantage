import { internalMutation } from "../_generated/server";
import type { SeedCompetencyStandard } from "./types";

export const seedStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    const standards: SeedCompetencyStandard[] = [
      {
        code: "HSA-SSE.B.3",
        description: "Choosing and producing equivalent forms of expressions",
        studentFriendlyDescription: "I can rewrite expressions in different forms.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSA-REI.B.4",
        description: "Solving quadratic equations in one variable",
        studentFriendlyDescription: "I can solve quadratic equations.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSA-APR.A.1",
        description: "Adding, subtracting, and multiplying polynomials",
        studentFriendlyDescription: "I can add, subtract, and multiply polynomial expressions.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSA-APR.B.2",
        description: "Know and apply the Remainder Theorem: for a polynomial p(x) and a number a, the remainder on division by x - a is p(a)",
        studentFriendlyDescription: "I can use the Remainder Theorem to evaluate polynomials.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSA-APR.B.3",
        description: "Identifying zeros of polynomials",
        studentFriendlyDescription: "I can find where polynomials equal zero.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSA-CED.A.1",
        description: "Creating equations in one variable",
        studentFriendlyDescription: "I can create equations to solve problems.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "N-CN.A.1",
        description: "Knowing the definition of complex numbers",
        studentFriendlyDescription: "I know what imaginary numbers are.",
        category: "Number",
        isActive: true,
      },
      {
        code: "N-CN.C.7",
        description: "Solving quadratics with complex solutions",
        studentFriendlyDescription: "I can solve equations with complex answers.",
        category: "Number",
        isActive: true,
      },
      {
        code: "N-RN.A.1",
        description: "Understanding nth roots and rational exponents",
        studentFriendlyDescription: "I can convert between radical and exponential forms.",
        category: "Number",
        isActive: true,
      },
      {
        code: "N-RN.A.2",
        description: "Rewriting expressions involving radicals and rational exponents",
        studentFriendlyDescription: "I can simplify expressions with radicals and exponents.",
        category: "Number",
        isActive: true,
      },
      {
        code: "HSF-IF.B.4",
        description: "Interpreting key features of functions from graphs and tables",
        studentFriendlyDescription: "I can describe what a function graph tells us.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-BF.A.1",
        description: "Building functions that describe relationships between quantities",
        studentFriendlyDescription: "I can write functions that model real situations.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-BF.B.3",
        description: "Effects of transformations on function graphs",
        studentFriendlyDescription: "I can describe how changing a function changes its graph.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-BF.B.4",
        description: "Finding inverse functions",
        studentFriendlyDescription: "I can find and verify inverse functions.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-BF.B.5",
        description: "Understanding the inverse relationship between exponents and logarithms",
        studentFriendlyDescription: "I can use the relationship between exponents and logarithms to solve problems.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-LE.A.4",
        description: "Expressing solutions to exponential models as logarithms",
        studentFriendlyDescription: "I can solve exponential equations using logarithms and technology.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-IF.C.7e",
        description: "Graphing exponential and logarithmic functions, showing intercepts and end behavior",
        studentFriendlyDescription: "I can graph exponential and logarithmic functions and identify their key features.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-LE.A.1",
        description: "Distinguish between situations that can be modeled with linear functions and with exponential functions",
        studentFriendlyDescription: "I can tell whether a situation is modeled by a linear or exponential function.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSA-CED.A.2",
        description: "Create equations in two or more variables to represent relationships between quantities",
        studentFriendlyDescription: "I can write equations that relate two or more quantities.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSA-APR.D.6",
        description: "Rewrite simple rational expressions in different forms; write a(x)/b(x) in the form q(x) + r(x)/b(x) where a, b, q, and r are polynomials",
        studentFriendlyDescription: "I can rewrite rational expressions in different forms using polynomial long division.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSF-IF.C.7d",
        description: "Graph rational functions, showing intercepts and asymptotes when suitable factorizations are available",
        studentFriendlyDescription: "I can graph rational functions and identify key features like intercepts and asymptotes.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSA-REI.A.2",
        description: "Solve rational equations in one variable and give examples showing how extraneous solutions can arise",
        studentFriendlyDescription: "I can solve rational equations and check for extraneous solutions.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSS-ID.A.1",
        description: "Represent data with plots on the real number line (dot plots, histograms, box plots)",
        studentFriendlyDescription: "I can display data using different types of graphs.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "HSS-ID.A.2",
        description: "Use statistics appropriate to the shape of the data distribution to compare center and spread of two or more different data sets",
        studentFriendlyDescription: "I can use statistics to compare different data sets.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "HSS-ID.A.3",
        description: "Interpret differences in shape, center, and spread in the context of the data sets",
        studentFriendlyDescription: "I can describe what differences in data distributions mean.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "HSS-ID.B.6",
        description: "Represent data on two quantitative variables, and describe how those variables vary together",
        studentFriendlyDescription: "I can show how two variables relate to each other.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "HSS-IC.A.1",
        description: "Understand statistics as a process for making inferences about population parameters based on a random sample from that population",
        studentFriendlyDescription: "I understand how statistics helps us make conclusions about a whole population from a sample.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "HSS-IC.B.3",
        description: "Recognize the purposes of and differences among sample surveys, experiments, and observational studies",
        studentFriendlyDescription: "I can explain how surveys, experiments, and observational studies are different.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "HSS-IC.B.4",
        description: "Use data from a sample survey to estimate a population mean or proportion and develop a margin of error through simulations",
        studentFriendlyDescription: "I can use sample data to estimate population values.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "HSS-IC.B.5",
        description: "Use data from a randomized experiment to compare two treatments and use simulations to decide if differences between them are statistically significant",
        studentFriendlyDescription: "I can compare two treatments and determine if their differences are meaningful.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "HSS-IC.B.6",
        description: "Evaluate reports based on data by identifying sources of bias, questionable conclusions, and the statistical question asked",
        studentFriendlyDescription: "I can evaluate whether data conclusions are trustworthy.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "HSF-TF.A.1",
        description: "Extend the domain of the trigonometric functions using the unit circle",
        studentFriendlyDescription: "I can use the unit circle to extend trigonometric functions to all angles.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-TF.A.2",
        description: "Explain how the unit circle in the coordinate plane enables the extension of trigonometric functions to all real numbers, and interpret these functions in terms of a periodic phenomenon",
        studentFriendlyDescription: "I can explain how the unit circle helps find trigonometric values for any angle.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-TF.A.4",
        description: "Use the unit circle to explain symmetry and periodicity of trigonometric functions",
        studentFriendlyDescription: "I can use the unit circle to show why trigonometric functions repeat.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-TF.B.5",
        description: "Choose trigonometric functions to model periodic phenomena with specified amplitude, frequency, and midline",
        studentFriendlyDescription: "I can use sine and cosine functions to model repeating patterns.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSA-CED.A.3",
        description: "Represent constraints by equations or inequalities, and by systems of equations and/or inequalities, and interpret solutions as viable or nonviable options",
        studentFriendlyDescription: "I can represent real-world constraints with equations/inequalities and interpret solutions.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSA-REI.C.7",
        description: "Solve systems consisting of linear and quadratic equations graphically and algebraically",
        studentFriendlyDescription: "I can solve systems with linear and quadratic equations.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSF-IF.C.7c",
        description: "Graph polynomial functions, identifying zeros when suitable factorizations are available, and showing end behavior",
        studentFriendlyDescription: "I can graph polynomial functions and identify their key features.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-IF.A.2",
        description: "Use function notation, evaluate functions for inputs in their domains, and interpret statements that use function notation in terms of a context",
        studentFriendlyDescription: "I can use function notation and evaluate functions.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSA-APR.C.4",
        description: "Prove polynomial identities and use them to describe numerical relationships",
        studentFriendlyDescription: "I can prove polynomial identities.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSF-IF.C.7a",
        description: "Graph square root, cube root, and piecewise-defined functions, including step functions and absolute value functions",
        studentFriendlyDescription: "I can graph square root, cube root, and piecewise functions.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-BF.A.1a",
        description: "Determine an explicit expression, a recursive process, or steps for calculation from a context",
        studentFriendlyDescription: "I can determine an expression, recursive process, or steps for calculation from a real-world context.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-LE.A.2",
        description: "Construct linear and exponential functions, including arithmetic and geometric sequences, given a graph, a description of a relationship, or two input-output pairs",
        studentFriendlyDescription: "I can construct linear and exponential functions from graphs, descriptions, or data pairs.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-LE.B.5",
        description: "Interpret the parameters in a linear function or an exponential function in terms of a context",
        studentFriendlyDescription: "I can interpret what linear and exponential function parameters mean in context.",
        category: "Functions",
        isActive: true,
      },
    ];

    const results: { code: string; id: string }[] = [];

    for (const standard of standards) {
      const existing = await ctx.db
        .query("competency_standards")
        .withIndex("by_code", (q) => q.eq("code", standard.code))
        .unique();

      if (existing) {
        results.push({ code: standard.code, id: existing._id });
      } else {
        const id = await ctx.db.insert("competency_standards", {
          code: standard.code,
          description: standard.description,
          studentFriendlyDescription: standard.studentFriendlyDescription,
          category: standard.category,
          isActive: standard.isActive,
          createdAt: Date.now(),
        });
        results.push({ code: standard.code, id });
      }
    }

    return results;
  },
});
