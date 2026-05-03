import { internalMutation } from "../_generated/server";
import type { SeedCompetencyStandard } from "./types";

export const seedStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    const standards: SeedCompetencyStandard[] = [
      // Unit 1 — Polynomial & Rational Functions
      {
        code: "HSF-IF.B.4",
        description: "For a function that models a relationship between two quantities, interpret key features of graphs and tables in terms of the quantities",
        studentFriendlyDescription: "I can interpret key features of function graphs and tables.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-IF.C.7c",
        description: "Graph polynomial functions, identifying zeros when suitable factorizations are available, and showing end behavior",
        studentFriendlyDescription: "I can graph polynomial functions and identify their zeros and end behavior.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-IF.C.7d",
        description: "Graph rational functions, identifying zeros and asymptotes when suitable factorizations are available, and showing end behavior",
        studentFriendlyDescription: "I can graph rational functions and identify intercepts, asymptotes, and end behavior.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSA-APR.A.1",
        description: "Understand that polynomials form a system analogous to the integers; add, subtract, and multiply polynomials",
        studentFriendlyDescription: "I can add, subtract, and multiply polynomial expressions.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSA-APR.B.2",
        description: "Know and apply the Remainder Theorem: for a polynomial p(x) and a number a, the remainder on division by x − a is p(a)",
        studentFriendlyDescription: "I can use the Remainder Theorem to evaluate and factor polynomials.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSA-APR.B.3",
        description: "Identify zeros of polynomials when suitable factorizations are available, and use the zeros to construct a rough graph of the function",
        studentFriendlyDescription: "I can find zeros of polynomials and use them to sketch graphs.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSA-APR.D.6",
        description: "Rewrite simple rational expressions in different forms; write a(x)/b(x) in the form q(x) + r(x)/b(x)",
        studentFriendlyDescription: "I can rewrite rational expressions using long division or other methods.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSA-REI.A.2",
        description: "Solve simple rational and radical equations in one variable, and give examples showing how extraneous solutions may arise",
        studentFriendlyDescription: "I can solve rational equations and identify extraneous solutions.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSF-BF.A.1",
        description: "Write a function that describes a relationship between two quantities",
        studentFriendlyDescription: "I can write functions that model relationships between quantities.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-BF.B.3",
        description: "Identify the effect on the graph of replacing f(x) by f(x) + k, k f(x), f(kx), and f(x + k) for specific values of k",
        studentFriendlyDescription: "I can describe how transformations change a function's graph.",
        category: "Functions",
        isActive: true,
      },

      // Unit 2 — Exponential & Logarithmic Functions
      {
        code: "HSF-LE.A.1",
        description: "Distinguish between situations that can be modeled with linear functions and with exponential functions",
        studentFriendlyDescription: "I can determine whether a situation is linear or exponential.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-LE.A.2",
        description: "Construct linear and exponential functions, including arithmetic and geometric sequences, given a graph, a description, or two input-output pairs",
        studentFriendlyDescription: "I can construct linear and exponential functions from given information.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-LE.A.4",
        description: "For exponential models, express as a logarithm the solution to a b^(ct) = d where a, c, and d are numbers and the base b is 2, 10, or e",
        studentFriendlyDescription: "I can use logarithms to solve exponential equations.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-LE.B.5",
        description: "Interpret the parameters in an exponential function in terms of a context",
        studentFriendlyDescription: "I can explain what the parameters of an exponential function mean in context.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-IF.C.7e",
        description: "Graph exponential and logarithmic functions, showing intercepts and end behavior",
        studentFriendlyDescription: "I can graph exponential and logarithmic functions and identify key features.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-BF.B.4",
        description: "Find inverse functions",
        studentFriendlyDescription: "I can find and verify inverse functions.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-BF.B.5",
        description: "Understand the inverse relationship between exponents and logarithms and use this relationship to solve problems",
        studentFriendlyDescription: "I can use the relationship between exponents and logarithms to solve problems.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-IF.A.2",
        description: "Use function notation, evaluate functions for inputs in their domains, and interpret statements that use function notation in terms of a context",
        studentFriendlyDescription: "I can use and interpret function notation.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-BF.A.1a",
        description: "Determine an explicit expression, a recursive process, or steps for calculation from a context",
        studentFriendlyDescription: "I can determine an expression or process from a real-world context.",
        category: "Functions",
        isActive: true,
      },

      // Unit 3 — Trigonometric & Polar Functions
      {
        code: "HSF-TF.A.1",
        description: "Understand radian measure of an angle as the length of the arc on the unit circle subtended by the angle",
        studentFriendlyDescription: "I can understand and work with radian measure.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-TF.A.2",
        description: "Explain how the unit circle enables the extension of trigonometric functions to all real numbers",
        studentFriendlyDescription: "I can use the unit circle to evaluate trig functions for any angle.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-TF.A.4",
        description: "Use the unit circle to explain symmetry (odd and even) and periodicity of trigonometric functions",
        studentFriendlyDescription: "I can explain why trig functions are periodic and identify symmetry.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-TF.B.5",
        description: "Choose trigonometric functions to model periodic phenomena with specified amplitude, frequency, and midline",
        studentFriendlyDescription: "I can write trig functions to model real-world periodic behavior.",
        category: "Functions",
        isActive: true,
      },

      // Unit 4 — CED-defined standards (Parametric, Vectors, Matrices)
      {
        code: "HSA-REI.C.8",
        description: "Represent a system of linear equations as a single matrix equation in a vector variable",
        studentFriendlyDescription: "I can write systems of equations as matrix equations.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSA-REI.C.9",
        description: "Find the inverse of a matrix if it exists and use it to solve systems of linear equations (using technology for matrices of dimension 3 × 3 or greater)",
        studentFriendlyDescription: "I can use matrix inverses to solve systems of equations.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSN-VM.C.6",
        description: "Use matrices to represent and manipulate data, e.g., to represent payoffs or incidence relationships in a network",
        studentFriendlyDescription: "I can use matrices to organize and represent data.",
        category: "Number & Quantity",
        isActive: true,
      },
      {
        code: "HSN-VM.C.7",
        description: "Multiply matrices by scalars to produce new matrices, e.g., as when all of the payoffs in a game are doubled",
        studentFriendlyDescription: "I can multiply a matrix by a scalar.",
        category: "Number & Quantity",
        isActive: true,
      },
      {
        code: "HSN-VM.C.8",
        description: "Add, subtract, and multiply matrices of appropriate dimensions",
        studentFriendlyDescription: "I can add, subtract, and multiply matrices.",
        category: "Number & Quantity",
        isActive: true,
      },
      {
        code: "HSN-VM.C.9",
        description: "Understand that, unlike multiplication of numbers, matrix multiplication for square matrices is not a commutative operation, but still satisfies the associative and distributive properties",
        studentFriendlyDescription: "I understand properties of matrix multiplication.",
        category: "Number & Quantity",
        isActive: true,
      },
      {
        code: "HSN-VM.C.10",
        description: "Understand that the zero and identity matrices play a role in matrix addition and multiplication similar to the role of 0 and 1 in the real numbers; the determinant of a square matrix is nonzero if and only if the matrix has a multiplicative inverse",
        studentFriendlyDescription: "I understand special matrices and when a matrix has an inverse.",
        category: "Number & Quantity",
        isActive: true,
      },
      {
        code: "HSN-VM.C.11",
        description: "Multiply a vector (regarded as a matrix with one column) by a matrix of suitable dimensions to produce another vector; work with matrices as transformations of vectors",
        studentFriendlyDescription: "I can use matrices to transform vectors.",
        category: "Number & Quantity",
        isActive: true,
      },
      {
        code: "HSN-VM.A.1",
        description: "Recognize vector quantities as having both magnitude and direction; represent vector quantities by directed line segments",
        studentFriendlyDescription: "I can represent and understand vectors as quantities with magnitude and direction.",
        category: "Number & Quantity",
        isActive: true,
      },
      {
        code: "HSN-VM.A.2",
        description: "Find the components of a vector by subtracting the coordinates of an initial point from the coordinates of a terminal point",
        studentFriendlyDescription: "I can find vector components from coordinates.",
        category: "Number & Quantity",
        isActive: true,
      },
      {
        code: "HSN-VM.A.3",
        description: "Solve problems involving velocity and other quantities that can be represented by vectors",
        studentFriendlyDescription: "I can solve problems using vectors.",
        category: "Number & Quantity",
        isActive: true,
      },
      {
        code: "HSN-VM.B.4",
        description: "Add and subtract vectors; multiply a vector by a scalar",
        studentFriendlyDescription: "I can add, subtract, and scale vectors.",
        category: "Number & Quantity",
        isActive: true,
      },
      {
        code: "HSN-VM.B.5",
        description: "Understand vector subtraction v − w as v + (−w); represent vector subtraction graphically by connecting the tips in the appropriate order",
        studentFriendlyDescription: "I can subtract vectors and represent it graphically.",
        category: "Number & Quantity",
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
