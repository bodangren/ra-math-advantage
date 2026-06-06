import { internalMutation } from "../_generated/server";

interface SeedCompetencyStandard {
  code: string;
  description: string;
  studentFriendlyDescription?: string;
  category?: string;
  isActive: boolean;
}

export const seedStandards = internalMutation({
  args: {},
  handler: async (ctx) => {
    const standards: SeedCompetencyStandard[] = [
      // Expressions and Equations — Grade 6 (6.EE)
      {
        code: "6.EE.A.1",
        description: "Write and evaluate numerical expressions involving whole-number exponents",
        studentFriendlyDescription: "I can write and solve math problems with exponents.",
        category: "Expressions and Equations",
        isActive: true,
      },
      {
        code: "6.EE.A.2",
        description: "Write, read, and evaluate expressions in which letters stand for numbers",
        studentFriendlyDescription: "I can use variables to write and evaluate expressions.",
        category: "Expressions and Equations",
        isActive: true,
      },
      {
        code: "6.EE.A.3",
        description: "Apply the properties of operations to generate equivalent expressions",
        studentFriendlyDescription: "I can use math properties to rewrite expressions in different ways.",
        category: "Expressions and Equations",
        isActive: true,
      },
      {
        code: "6.EE.B.5",
        description: "Understand solving an equation or inequality as a process of answering a question: which values from a specified set, if any, make the equation or inequality true",
        studentFriendlyDescription: "I can find values that make an equation or inequality true.",
        category: "Expressions and Equations",
        isActive: true,
      },

      // Statistics and Probability — Grade 6 (6.SP)
      {
        code: "6.SP.B.4",
        description: "Display numerical data in plots on a number line, including dot plots, histograms, and box plots",
        studentFriendlyDescription: "I can create graphs to display data on a number line.",
        category: "Statistics and Probability",
        isActive: true,
      },
      {
        code: "6.SP.B.5",
        description: "Summarize numerical data sets in relation to their context",
        studentFriendlyDescription: "I can summarize and describe data sets.",
        category: "Statistics and Probability",
        isActive: true,
      },
      {
        code: "6.SP.B.5d",
        description: "Relate the choice of measures of center and variability to the shape of the data distribution and the context in which the data were gathered",
        studentFriendlyDescription: "I can choose the right way to describe data based on its shape.",
        category: "Statistics and Probability",
        isActive: true,
      },

      // Expressions and Equations — Grade 7 (7.EE)
      {
        code: "7.EE.A.1",
        description: "Apply properties of operations as strategies to add, subtract, factor, and expand linear expressions with rational coefficients",
        studentFriendlyDescription: "I can simplify and rewrite linear expressions.",
        category: "Expressions and Equations",
        isActive: true,
      },
      {
        code: "7.EE.B.3",
        description: "Solve multi-step real-life and mathematical problems posed with positive and negative rational numbers in any form",
        studentFriendlyDescription: "I can solve multi-step problems with different types of numbers.",
        category: "Expressions and Equations",
        isActive: true,
      },
      {
        code: "7.EE.B.4",
        description: "Use variables to represent quantities in a real-world or mathematical problem, and construct simple equations and inequalities to solve problems",
        studentFriendlyDescription: "I can write and solve equations to answer real-world questions.",
        category: "Expressions and Equations",
        isActive: true,
      },

      // Expressions and Equations — Grade 8 (8.EE)
      {
        code: "8.EE.C.7",
        description: "Solve linear equations in one variable",
        studentFriendlyDescription: "I can solve linear equations step by step.",
        category: "Expressions and Equations",
        isActive: true,
      },
      {
        code: "8.EE.C.8",
        description: "Analyze and solve pairs of simultaneous linear equations",
        studentFriendlyDescription: "I can solve systems of two linear equations.",
        category: "Expressions and Equations",
        isActive: true,
      },

      // Functions — Grade 8 (8.F)
      {
        code: "8.F.A.1",
        description: "Understand that a function is a rule that assigns to each input exactly one output",
        studentFriendlyDescription: "I can explain what a function is and identify one.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "8.F.A.2",
        description: "Compare properties of two functions each represented in a different way",
        studentFriendlyDescription: "I can compare functions shown in different formats.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "8.F.B.4",
        description: "Construct a function to model a linear relationship between two quantities",
        studentFriendlyDescription: "I can build a function that models a linear relationship.",
        category: "Functions",
        isActive: true,
      },

      // Geometry — Grade 8 (8.G)
      {
        code: "8.G.A.1",
        description: "Verify experimentally the properties of rotations, reflections, and translations",
        studentFriendlyDescription: "I can test and verify how transformations work.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "8.G.A.2",
        description: "Understand that a two-dimensional figure is congruent to another if the second can be obtained from the first by a sequence of rotations, reflections, and translations",
        studentFriendlyDescription: "I can explain congruence using transformations.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "8.G.A.4",
        description: "Understand that a two-dimensional figure is similar to another if the second can be obtained from the first by a sequence of rotations, reflections, translations, and dilations",
        studentFriendlyDescription: "I can explain similarity using transformations.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "8.G.A.5",
        description: "Use informal arguments to establish facts about the angle sum and exterior angle of triangles, about the angles created when parallel lines are cut by a transversal, and the angle-angle criterion for similarity",
        studentFriendlyDescription: "I can use angle relationships to solve problems.",
        category: "Geometry",
        isActive: true,
      },

      // Statistics and Probability — Grade 8 (8.SP)
      {
        code: "8.SP.A.1",
        description: "Construct and interpret scatter plots for bivariate measurement data to investigate patterns of association between two quantities",
        studentFriendlyDescription: "I can create and read scatter plots to find patterns.",
        category: "Statistics and Probability",
        isActive: true,
      },
      {
        code: "8.SP.A.2",
        description: "Know that straight lines are widely used to model relationships between two quantitative variables",
        studentFriendlyDescription: "I can use a line to show how two things are related.",
        category: "Statistics and Probability",
        isActive: true,
      },

      // Algebra — Creating Equations (A-CED)
      {
        code: "A-CED.A.1",
        description: "Create equations and inequalities in one variable and use them to solve problems",
        studentFriendlyDescription: "I can write equations to model and solve problems.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "A-CED.A.2",
        description: "Create equations in two or more variables to represent relationships between quantities",
        studentFriendlyDescription: "I can write equations with multiple variables.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "A-CED.A.3",
        description: "Represent constraints by equations or inequalities, and by systems of equations and/or inequalities",
        studentFriendlyDescription: "I can model real-world limits with equations and inequalities.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "A-CED.A.4",
        description: "Rearrange formulas to highlight a quantity of interest, using the same reasoning as in solving equations",
        studentFriendlyDescription: "I can rearrange formulas to solve for a specific variable.",
        category: "Algebra",
        isActive: true,
      },

      // Algebra — Reasoning with Equations and Inequalities (A-REI)
      {
        code: "A-REI.A.1",
        description: "Explain each step in solving a simple equation as following from the equality of numbers asserted at the previous step",
        studentFriendlyDescription: "I can explain each step when solving an equation.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "A-REI.B.3",
        description: "Solve linear equations and inequalities in one variable, including equations with coefficients represented by letters",
        studentFriendlyDescription: "I can solve linear equations and inequalities.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "A-REI.C.5",
        description: "Prove that, given a system of two equations in two variables, replacing one equation by the sum of that equation and a multiple of the other produces a system with the same solutions",
        studentFriendlyDescription: "I can explain why combining equations keeps the same solutions.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "A-REI.C.6",
        description: "Solve systems of linear equations exactly and approximately",
        studentFriendlyDescription: "I can solve systems of equations using different methods.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "A-REI.D.10",
        description: "Understand that the graph of an equation in two variables is the set of all its solutions plotted in the coordinate plane",
        studentFriendlyDescription: "I know that a graph shows all the solutions to an equation.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "A-REI.D.12",
        description: "Graph the solutions to a linear inequality in two variables as a half-plane, and graph the solution set to a system of linear inequalities",
        studentFriendlyDescription: "I can graph inequalities and systems of inequalities.",
        category: "Algebra",
        isActive: true,
      },

      // Algebra — Seeing Structure in Expressions (A-SSE)
      {
        code: "A-SSE.A.1",
        description: "Interpret expressions that represent a quantity in terms of its context",
        studentFriendlyDescription: "I can explain what each part of an expression means.",
        category: "Algebra",
        isActive: true,
      },

      // Functions — Building Functions (F-BF)
      {
        code: "F-BF.A.1",
        description: "Write a function that describes a relationship between two quantities",
        studentFriendlyDescription: "I can write functions that model relationships.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-BF.A.2",
        description: "Write arithmetic and geometric sequences both recursively and with an explicit formula",
        studentFriendlyDescription: "I can write sequences in different forms.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-BF.B.3",
        description: "Identify the effect on the graph of replacing f(x) by f(x) + k, k f(x), f(kx), and f(x + k) for specific values of k",
        studentFriendlyDescription: "I can describe how changes to a function affect its graph.",
        category: "Functions",
        isActive: true,
      },

      // Functions — Interpreting Functions (F-IF)
      {
        code: "F-IF.A.1",
        description: "Understand that a function from one set (domain) to another set (range) assigns to each element of the domain exactly one element of the range",
        studentFriendlyDescription: "I can explain what a function is and understand domain and range.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-IF.A.2",
        description: "Use function notation, evaluate functions for inputs in their domains, and interpret statements that use function notation in terms of a context",
        studentFriendlyDescription: "I can use function notation like f(x) and evaluate functions.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-IF.A.3",
        description: "Recognize that sequences are functions, sometimes defined recursively, whose domain is a subset of the integers",
        studentFriendlyDescription: "I understand that sequences are a type of function.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-IF.B.4",
        description: "For a function that models a relationship between two quantities, interpret key features of graphs and tables in terms of the quantities",
        studentFriendlyDescription: "I can interpret key features of function graphs like intercepts and maxima.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-IF.B.5",
        description: "Relate the domain of a function to its graph and, where applicable, to the quantitative relationship it describes",
        studentFriendlyDescription: "I can connect the domain of a function to its graph.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-IF.B.6",
        description: "Calculate and interpret the average rate of change of a function over a specified interval",
        studentFriendlyDescription: "I can calculate and explain the average rate of change of a function.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-IF.C.7",
        description: "Graph functions expressed symbolically and show key features of the graph",
        studentFriendlyDescription: "I can graph functions and identify their key features.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-IF.C.7e",
        description: "Graph exponential and logarithmic functions, showing intercepts and end behavior",
        studentFriendlyDescription: "I can graph exponential and logarithmic functions.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-IF.C.8",
        description: "Write a function defined by an expression in different but equivalent forms to reveal and explain different properties of the function",
        studentFriendlyDescription: "I can rewrite functions to show their properties.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-IF.C.9",
        description: "Compare properties of two functions each represented in a different way",
        studentFriendlyDescription: "I can compare functions shown in different formats.",
        category: "Functions",
        isActive: true,
      },

      // Functions — Linear, Quadratic, and Exponential Models (F-LE)
      {
        code: "F-LE.A.1",
        description: "Distinguish between situations that can be modeled with linear functions and with exponential functions",
        studentFriendlyDescription: "I can tell whether a situation is linear or exponential.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-LE.A.2",
        description: "Construct linear and exponential functions, including arithmetic and geometric sequences, given a graph, a description of a relationship, or two input-output pairs",
        studentFriendlyDescription: "I can build linear and exponential functions from different representations.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-LE.A.4",
        description: "For exponential models, express as a logarithm the solution of ab^ct = d where a, b, c, and d are numbers and the base b is 2, 10, or e",
        studentFriendlyDescription: "I can use logarithms to solve exponential equations.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-LE.B.5",
        description: "Interpret the parameters in a linear function or an exponential function in terms of a context",
        studentFriendlyDescription: "I can explain what the numbers in a function mean in real life.",
        category: "Functions",
        isActive: true,
      },

      // Geometry — Congruence (G-CO)
      {
        code: "G-CO.A.1",
        description: "Know precise definitions of angle, perpendicular line, parallel line, and line segment based on the undefined notions of point, line, distance along a line, and distance around a circular arc",
        studentFriendlyDescription: "I can define and use precise geometric vocabulary.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.A.2",
        description: "Represent transformations in the plane using transparencies and geometry software",
        studentFriendlyDescription: "I can represent and describe transformations.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.A.3",
        description: "Given a rectangle, parallelogram, trapezoid, or regular polygon, describe the rotations and reflections that carry it onto itself",
        studentFriendlyDescription: "I can find the symmetries of geometric shapes.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.A.4",
        description: "Develop definitions of rotations, reflections, and translations in terms of angles, circles, perpendicular lines, parallel lines, and line segments",
        studentFriendlyDescription: "I can define transformations using geometric concepts.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.A.5",
        description: "Given a geometric figure and a rotation, reflection, or translation, draw the transformed figure",
        studentFriendlyDescription: "I can draw a figure after applying a transformation.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.B.6",
        description: "Use geometric descriptions of rigid motions to transform figures and predict the effect of a given rigid motion",
        studentFriendlyDescription: "I can use rigid motions to show figures are congruent.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.B.7",
        description: "Use the definition of congruence in terms of rigid motions to show that two triangles are congruent if and only if corresponding pairs of sides and angles are congruent",
        studentFriendlyDescription: "I can use rigid motions to explain why congruent triangles match.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.B.8",
        description: "Explain how the criteria for triangle congruence (ASA, SAS, and SSS) follow from the definition of congruence in terms of rigid motions",
        studentFriendlyDescription: "I can explain why ASA, SAS, and SSS prove congruence.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.C.9",
        description: "Prove theorems about lines and angles, including that vertical angles are congruent and that when a transversal crosses parallel lines, alternate interior angles are congruent",
        studentFriendlyDescription: "I can prove theorems about lines and angles.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.C.10",
        description: "Prove theorems about triangles, including that the measures of interior angles sum to 180° and that the segment joining midpoints of two sides is parallel to the third side",
        studentFriendlyDescription: "I can prove key theorems about triangles.",
        category: "Geometry",
        isActive: true,
      },

      // Geometric Measurement and Dimension (G-GMD)
      {
        code: "G-GMD.A.3",
        description: "Use volume formulas for cylinders, pyramids, cones, and spheres to solve problems",
        studentFriendlyDescription: "I can use volume formulas to solve real-world problems.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-GMD.B.4",
        description: "Identify the shapes of two-dimensional cross-sections of three-dimensional objects",
        studentFriendlyDescription: "I can identify 2D shapes from slicing 3D objects.",
        category: "Geometry",
        isActive: true,
      },

      // Expressing Geometric Properties with Equations (G-GPE)
      {
        code: "G-GPE.B.4",
        description: "Use coordinates to prove simple geometric theorems algebraically",
        studentFriendlyDescription: "I can use coordinates to prove geometric theorems.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-GPE.B.5",
        description: "Prove the slope criteria for parallel and perpendicular lines and use them to solve geometric problems",
        studentFriendlyDescription: "I can prove and apply slope rules for parallel and perpendicular lines.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-GPE.B.6",
        description: "Find the point on a directed line segment between two given points that partitions the segment in a given ratio",
        studentFriendlyDescription: "I can find points that divide line segments in given ratios.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-GPE.B.7",
        description: "Use coordinates to compute perimeters of polygons and areas of triangles and rectangles using the distance formula",
        studentFriendlyDescription: "I can calculate perimeters and areas using coordinates.",
        category: "Geometry",
        isActive: true,
      },

      // Modeling with Geometry (G-MG)
      {
        code: "G-MG.A.1",
        description: "Use geometric shapes, their measures, and their properties to describe objects",
        studentFriendlyDescription: "I can model real-world objects using geometric shapes.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-MG.A.2",
        description: "Apply concepts of density based on area and volume in modeling situations",
        studentFriendlyDescription: "I can use geometric density to model real situations.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-MG.A.3",
        description: "Apply geometric methods to solve design problems",
        studentFriendlyDescription: "I can use geometry to solve practical design problems.",
        category: "Geometry",
        isActive: true,
      },

      // Statistics and Probability — Interpreting Categorical and Quantitative Data (S-ID)
      {
        code: "S-ID.A.1",
        description: "Represent data with plots on the real number line (dot plots, histograms, and box plots)",
        studentFriendlyDescription: "I can display data using different types of graphs.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-ID.A.2",
        description: "Use statistics appropriate to the shape of the data distribution to compare center (median, mean) and spread (interquartile range, standard deviation) of two or more different data sets",
        studentFriendlyDescription: "I can compare data sets using center and spread.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-ID.A.3",
        description: "Interpret differences in shape, center, and spread in the context of the data sets, accounting for possible effects of extreme data points (outliers)",
        studentFriendlyDescription: "I can explain what differences in data distributions mean.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-ID.B.5",
        description: "Summarize categorical data for two categories in two-way frequency tables, and interpret relative frequencies in the context of the data",
        studentFriendlyDescription: "I can create and interpret two-way frequency tables.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-ID.B.6",
        description: "Represent data on two quantitative variables on a scatter plot, and describe how the variables are related",
        studentFriendlyDescription: "I can create scatter plots and describe relationships between variables.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-ID.C.7",
        description: "Interpret the slope (rate of change) and the intercept (constant term) of a linear model in the context of the data",
        studentFriendlyDescription: "I can explain what the slope and intercept mean in context.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-ID.C.8",
        description: "Compute (using technology) and interpret the correlation coefficient of a linear fit",
        studentFriendlyDescription: "I can calculate and explain the correlation coefficient.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-ID.C.9",
        description: "Distinguish between correlation and causation",
        studentFriendlyDescription: "I can tell the difference between correlation and causation.",
        category: "Statistics",
        isActive: true,
      },

      // Statistics and Probability — Making Inferences and Justifying Conclusions (S-IC)
      {
        code: "S-IC.A.1",
        description: "Understand statistics as a process for making inferences about population parameters based on a random sample from that population",
        studentFriendlyDescription: "I understand how samples help us learn about populations.",
        category: "Statistics",
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
