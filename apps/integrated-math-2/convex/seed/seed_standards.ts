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
      // Geometry — Congruence (G-CO)
      {
        code: "G-CO.A.1",
        description: "Know precise definitions of angle, perpendicular line, parallel line, and line segment",
        studentFriendlyDescription: "I can define and use precise geometric vocabulary for angles, lines, and segments.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.A.2",
        description: "Represent transformations in the plane using transparencies and geometry software",
        studentFriendlyDescription: "I can describe and represent geometric transformations on a coordinate plane.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.A.4",
        description: "Develop definitions of rotations, reflections, and translations in terms of angles, circles, perpendicular lines, parallel lines, and line segments",
        studentFriendlyDescription: "I can define rotations, reflections, and translations using geometric concepts.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.A.5",
        description: "Given a geometric figure and a rotation, reflection, or translation, draw the transformed figure",
        studentFriendlyDescription: "I can draw a figure after applying a rotation, reflection, or translation.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.B.6",
        description: "Use geometric descriptions of rigid motions to transform figures and predict the effect of a given rigid motion",
        studentFriendlyDescription: "I can use rigid motions to show figures are congruent and predict transformation results.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.B.7",
        description: "Use the definition of congruence in terms of rigid motions to show that two triangles are congruent if and only if corresponding pairs of sides and angles are congruent",
        studentFriendlyDescription: "I can use rigid motions to explain why congruent triangles have matching sides and angles.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.B.8",
        description: "Explain how the criteria for triangle congruence (ASA, SAS, and SSS) follow from the definition of congruence in terms of rigid motions",
        studentFriendlyDescription: "I can explain why ASA, SAS, and SSS prove triangle congruence.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.C.10",
        description: "Prove theorems about triangles, including that the measures of interior angles sum to 180°, base angles of isosceles triangles are congruent, and the segment joining midpoints of two sides of a triangle is parallel to the third side",
        studentFriendlyDescription: "I can prove key theorems about triangles using logical reasoning.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.C.11",
        description: "Prove theorems about parallelograms, including opposite sides are congruent, opposite angles are congruent, and diagonals bisect each other",
        studentFriendlyDescription: "I can prove theorems about parallelograms and their properties.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-CO.D.12",
        description: "Make formal geometric constructions with a variety of tools and methods, including compass and straightedge",
        studentFriendlyDescription: "I can create geometric constructions using compass, straightedge, and other tools.",
        category: "Geometry",
        isActive: true,
      },

      // Geometry — Similarity (G-SRT)
      {
        code: "G-SRT.A.1",
        description: "Verify experimentally the properties of dilations given by a center and a scale factor",
        studentFriendlyDescription: "I can explore and verify how dilations transform figures.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-SRT.A.2",
        description: "Given two figures, use the definition of similarity in terms of similarity transformations to decide if they are similar",
        studentFriendlyDescription: "I can determine if two figures are similar using similarity transformations.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-SRT.A.3",
        description: "Use the properties of similarity transformations to establish the AA criterion for two triangles to be similar",
        studentFriendlyDescription: "I can explain why AA proves two triangles are similar.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-SRT.B.4",
        description: "Prove theorems about triangles, including a line parallel to one side of a triangle divides the other two proportionally",
        studentFriendlyDescription: "I can prove theorems involving similar triangles and proportional relationships.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-SRT.B.5",
        description: "Use congruence and similarity criteria for triangles to solve problems and prove relationships in geometric figures",
        studentFriendlyDescription: "I can use congruence and similarity to solve geometric problems.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-SRT.C.6",
        description: "Understand that by similarity, side ratios in right triangles are properties of the angles in the triangle, leading to definitions of trigonometric ratios",
        studentFriendlyDescription: "I can explain how similarity relates to trigonometric ratios in right triangles.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-SRT.C.8",
        description: "Use trigonometric ratios and the Pythagorean Theorem to solve right triangles in applied problems",
        studentFriendlyDescription: "I can use trig ratios and the Pythagorean Theorem to solve real-world problems.",
        category: "Geometry",
        isActive: true,
      },

      // Geometry — Circles (G-C)
      {
        code: "G-C.A.1",
        description: "Prove that all circles are similar",
        studentFriendlyDescription: "I can prove that all circles are similar to each other.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-C.A.2",
        description: "Identify and describe relationships among inscribed angles, radii, and chords",
        studentFriendlyDescription: "I can identify and explain relationships between angles, radii, and chords in circles.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-C.A.3",
        description: "Construct the inscribed and circumscribed circles of a triangle, and prove properties of angles for a quadrilateral inscribed in a circle",
        studentFriendlyDescription: "I can construct inscribed and circumscribed circles and prove angle properties.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-C.B.5",
        description: "Derive using similarity the fact that the length of the arc intercepted by an angle is proportional to the radius, and define the radian measure of the angle",
        studentFriendlyDescription: "I can derive arc length formulas and understand radian measure.",
        category: "Geometry",
        isActive: true,
      },

      // Expressing Geometric Properties with Equations (G-GPE)
      {
        code: "G-GPE.A.1",
        description: "Derive the equation of a circle given center and radius using the Pythagorean Theorem",
        studentFriendlyDescription: "I can write the equation of a circle from its center and radius.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-GPE.B.4",
        description: "Use coordinates to prove simple geometric theorems algebraically, including using the distance formula",
        studentFriendlyDescription: "I can use coordinate geometry and the distance formula to prove geometric theorems.",
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
        studentFriendlyDescription: "I can calculate perimeters and areas using coordinate geometry.",
        category: "Geometry",
        isActive: true,
      },

      // Geometric Measurement and Dimension (G-GMD)
      {
        code: "G-GMD.A.1",
        description: "Give an informal argument for the formulas for the circumference of a circle, area of a circle, volume of a cylinder, pyramid, and cone",
        studentFriendlyDescription: "I can explain why volume and area formulas work using informal arguments.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-GMD.A.3",
        description: "Use volume formulas for cylinders, pyramids, cones, and spheres to solve problems",
        studentFriendlyDescription: "I can use volume formulas to solve real-world problems involving 3D shapes.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-GMD.B.4",
        description: "Identify the shapes of two-dimensional cross-sections of three-dimensional objects",
        studentFriendlyDescription: "I can identify the 2D shapes formed by slicing through 3D objects.",
        category: "Geometry",
        isActive: true,
      },

      // Modeling with Geometry (G-MG)
      {
        code: "G-MG.A.1",
        description: "Use geometric shapes, their measures, and their properties to describe objects",
        studentFriendlyDescription: "I can model real-world objects using geometric shapes and measurements.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-MG.A.2",
        description: "Apply concepts of density based on area and volume in modeling situations",
        studentFriendlyDescription: "I can use geometric density concepts to model real-world situations.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "G-MG.A.3",
        description: "Apply geometric methods to solve design problems",
        studentFriendlyDescription: "I can use geometry to solve practical design and engineering problems.",
        category: "Geometry",
        isActive: true,
      },

      // Conditional Probability (S-CP)
      {
        code: "S-CP.A.1",
        description: "Describe events as subsets of a sample space using characteristics of the outcomes, or as unions, intersections, or complements",
        studentFriendlyDescription: "I can describe events using set notation like unions, intersections, and complements.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-CP.A.2",
        description: "Understand that two events A and B are independent if the probability of A and B occurring together is the product of their probabilities",
        studentFriendlyDescription: "I can determine if two events are independent by comparing their joint and individual probabilities.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-CP.A.3",
        description: "Understand the conditional probability of A given B as P(A and B)/P(B), and interpret independence",
        studentFriendlyDescription: "I can calculate and interpret conditional probability.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-CP.A.4",
        description: "Construct and interpret two-way frequency tables of data",
        studentFriendlyDescription: "I can build and analyze two-way frequency tables to find probabilities.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-CP.A.5",
        description: "Recognize and explain the concepts of conditional probability and independence in everyday language and everyday situations",
        studentFriendlyDescription: "I can explain conditional probability and independence in everyday contexts.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-CP.B.6",
        description: "Find the conditional probability of A given B as the fraction of B's outcomes that also belong to A",
        studentFriendlyDescription: "I can find conditional probabilities using fractions of outcomes.",
        category: "Statistics",
        isActive: true,
      },

      // Functions — Interpreting Functions (HSF-IF)
      {
        code: "HSF-IF.A.1",
        description: "Understand that a function from one set (domain) to another set (range) assigns to each element of the domain exactly one element of the range",
        studentFriendlyDescription: "I can explain what a function is and understand domain and range.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-IF.A.2",
        description: "Use function notation, evaluate functions for inputs in their domains, and interpret statements that use function notation in terms of a context",
        studentFriendlyDescription: "I can use function notation like f(x) and evaluate functions for given inputs.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-IF.B.4",
        description: "For a function that models a relationship between two quantities, interpret key features of graphs and tables in terms of the quantities",
        studentFriendlyDescription: "I can interpret key features of function graphs like intercepts, maxima, and intervals of increase/decrease.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-IF.B.5",
        description: "Relate the domain of a function to its graph and, where applicable, to the quantitative relationship it describes",
        studentFriendlyDescription: "I can connect the domain of a function to its graph and real-world meaning.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-IF.B.6",
        description: "Calculate and interpret the average rate of change of a function over a specified interval",
        studentFriendlyDescription: "I can calculate and explain the average rate of change of a function.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-IF.C.7",
        description: "Graph functions expressed symbolically and show key features of the graph, by hand in simple cases and using technology for more complicated cases",
        studentFriendlyDescription: "I can graph functions and identify their key features from equations.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-IF.C.9",
        description: "Compare properties of two functions each represented in a different way (algebraically, graphically, numerically in tables, or by verbal descriptions)",
        studentFriendlyDescription: "I can compare functions that are represented in different formats.",
        category: "Functions",
        isActive: true,
      },

      // Building Functions (HSF-BF)
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
        studentFriendlyDescription: "I can describe how changes to a function's equation affect its graph.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "HSF-BF.B.4",
        description: "Find inverse functions by solving equations of the form f(x) = c and verifying by composition",
        studentFriendlyDescription: "I can find and verify inverse functions.",
        category: "Functions",
        isActive: true,
      },

      // Statistics and Probability — Grade 7 (7.SP)
      {
        code: "7.SP.C.5",
        description: "Understand that the probability of a chance event is a number between 0 and 1 that expresses the likelihood of the event occurring",
        studentFriendlyDescription: "I understand that probability is a number between 0 and 1.",
        category: "Statistics and Probability",
        isActive: true,
      },

      // Expressions and Equations — Grade 8 (8.EE)
      {
        code: "8.EE.A.1",
        description: "Know and apply the properties of integer exponents to generate equivalent numerical expressions",
        studentFriendlyDescription: "I can use exponent rules to simplify expressions.",
        category: "Expressions and Equations",
        isActive: true,
      },
      {
        code: "8.EE.A.2",
        description: "Use square root and cube root symbols to represent solutions to equations of the form x^2 = p and x^3 = p",
        studentFriendlyDescription: "I can use square roots and cube roots to solve equations.",
        category: "Expressions and Equations",
        isActive: true,
      },

      // Geometry — Grade 8 (8.G)
      {
        code: "8.G.B.6",
        description: "Explain a proof of the Pythagorean Theorem and its converse",
        studentFriendlyDescription: "I can prove the Pythagorean Theorem and its converse.",
        category: "Geometry",
        isActive: true,
      },
      {
        code: "8.G.B.7",
        description: "Apply the Pythagorean Theorem to determine unknown side lengths in right triangles in real-world and mathematical problems",
        studentFriendlyDescription: "I can use the Pythagorean Theorem to find missing sides.",
        category: "Geometry",
        isActive: true,
      },

      // Algebra — Arithmetic with Polynomials and Rational Expressions (A-APR)
      {
        code: "A-APR.B.3",
        description: "Identify zeros of polynomials when suitable factorizations are available, and use the zeros to construct a rough graph of the function",
        studentFriendlyDescription: "I can find zeros of polynomials and sketch their graphs.",
        category: "Algebra",
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
        code: "A-REI.B.4",
        description: "Use the method of completing the square to transform any quadratic equation in x into an equation of the form (x - p)^2 = q",
        studentFriendlyDescription: "I can complete the square to solve quadratic equations.",
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
        code: "A-REI.C.7",
        description: "Solve a simple system consisting of a linear equation and a quadratic equation in two variables algebraically and graphically",
        studentFriendlyDescription: "I can solve systems with one linear and one quadratic equation.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "A-REI.C.9",
        description: "Find the inverse of a matrix if it exists and use it to solve systems of linear equations",
        studentFriendlyDescription: "I can use matrices to solve systems of equations.",
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
      {
        code: "A-SSE.A.2",
        description: "Use the structure of an expression to identify ways to rewrite it",
        studentFriendlyDescription: "I can use the structure of expressions to rewrite them.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "A-SSE.B.3",
        description: "Choose and produce an equivalent form of an expression to reveal and explain properties of the quantity represented",
        studentFriendlyDescription: "I can rewrite expressions to reveal their properties.",
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
        code: "F-BF.B.3",
        description: "Identify the effect on the graph of replacing f(x) by f(x) + k, k f(x), f(kx), and f(x + k) for specific values of k",
        studentFriendlyDescription: "I can describe how changes to a function affect its graph.",
        category: "Functions",
        isActive: true,
      },

      // Functions — Interpreting Functions (F-IF)
      {
        code: "F-IF.B.4",
        description: "For a function that models a relationship between two quantities, interpret key features of graphs and tables in terms of the quantities",
        studentFriendlyDescription: "I can interpret key features of function graphs like intercepts and maxima.",
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
        code: "F-IF.C.9",
        description: "Compare properties of two functions each represented in a different way",
        studentFriendlyDescription: "I can compare functions shown in different formats.",
        category: "Functions",
        isActive: true,
      },

      // Functions — Linear, Quadratic, and Exponential Models (F-LE)
      {
        code: "F-LE.A.2",
        description: "Construct linear and exponential functions, including arithmetic and geometric sequences, given a graph, a description of a relationship, or two input-output pairs",
        studentFriendlyDescription: "I can build linear and exponential functions from different representations.",
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

      // Functions — Trigonometric Functions (F-TF)
      {
        code: "F-TF.A.1",
        description: "Understand radian measure of an angle as the length of the arc on the unit circle subtended by the angle",
        studentFriendlyDescription: "I can explain what a radian measures.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-TF.A.2",
        description: "Explain how the unit circle in the coordinate plane enables the extension of trigonometric functions to all real numbers",
        studentFriendlyDescription: "I can use the unit circle to find trig values for any angle.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-TF.C.6",
        description: "Understand that restricting a trigonometric function to a domain on which it is always increasing or always decreasing allows its inverse to be constructed",
        studentFriendlyDescription: "I can explain how inverse trig functions are defined.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-TF.C.7",
        description: "Use inverse functions to solve trigonometric equations that arise in modeling contexts",
        studentFriendlyDescription: "I can use inverse trig functions to solve equations.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-TF.C.8",
        description: "Prove the Pythagorean identity sin^2(θ) + cos^2(θ) = 1 and use it to find sin(θ), cos(θ), or tan(θ) given one of them and the quadrant",
        studentFriendlyDescription: "I can use the Pythagorean identity to find trig values.",
        category: "Functions",
        isActive: true,
      },
      {
        code: "F-TF.C.9",
        description: "Prove the addition and subtraction formulas for sine, cosine, and tangent and use them to solve problems",
        studentFriendlyDescription: "I can use addition and subtraction formulas for trig functions.",
        category: "Functions",
        isActive: true,
      },

      // Geometry — Circles (G-C)
      {
        code: "G-C.A.4",
        description: "Construct a tangent line from a point outside a given circle to the circle",
        studentFriendlyDescription: "I can construct a tangent line to a circle from an outside point.",
        category: "Geometry",
        isActive: true,
      },

      // Geometry — Congruence (G-CO)
      {
        code: "G-CO.A.3",
        description: "Given a rectangle, parallelogram, trapezoid, or regular polygon, describe the rotations and reflections that carry it onto itself",
        studentFriendlyDescription: "I can find the symmetries of geometric shapes.",
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

      // Geometric Measurement and Dimension (G-GMD)
      {
        code: "G-GMD.A.2",
        description: "Give an informal argument using Cavalieri's principle for the formulas for the volume of a sphere and other solid figures",
        studentFriendlyDescription: "I can explain volume formulas using Cavalieri's principle.",
        category: "Geometry",
        isActive: true,
      },

      // Geometry — Similarity, Right Triangles, and Trigonometry (G-SRT)
      {
        code: "G-SRT.C.7",
        description: "Explain and use the relationship between the sine and cosine of complementary angles",
        studentFriendlyDescription: "I can explain how sine and cosine of complementary angles are related.",
        category: "Geometry",
        isActive: true,
      },

      // High School Algebra — Arithmetic with Polynomials (HSA-APR)
      {
        code: "HSA-APR.A.1",
        description: "Understand that polynomials form a system analogous to the integers, namely, they are closed under the operations of addition, subtraction, and multiplication",
        studentFriendlyDescription: "I can add, subtract, and multiply polynomials.",
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
        description: "Identify zeros of polynomials when suitable factorizations are available, and use the zeros to construct a rough graph of the function",
        studentFriendlyDescription: "I can find zeros of polynomials and sketch their graphs.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSA-APR.C.4",
        description: "Prove polynomial identities and use them to describe numerical relationships",
        studentFriendlyDescription: "I can prove polynomial identities.",
        category: "Algebra",
        isActive: true,
      },

      // High School Algebra — Creating Equations (HSA-CED)
      {
        code: "HSA-CED.A.2",
        description: "Create equations in two or more variables to represent relationships between quantities",
        studentFriendlyDescription: "I can write equations with multiple variables.",
        category: "Algebra",
        isActive: true,
      },
      {
        code: "HSA-CED.A.3",
        description: "Represent constraints by equations or inequalities, and by systems of equations and/or inequalities",
        studentFriendlyDescription: "I can model real-world limits with equations and inequalities.",
        category: "Algebra",
        isActive: true,
      },

      // High School Algebra — Seeing Structure in Expressions (HSA-SSE)
      {
        code: "HSA-SSE.A.2",
        description: "Use the structure of an expression to identify ways to rewrite it",
        studentFriendlyDescription: "I can use the structure of expressions to rewrite them.",
        category: "Algebra",
        isActive: true,
      },

      // High School Functions — Building Functions (HSF-BF)
      {
        code: "HSF-BF.A.2",
        description: "Write arithmetic and geometric sequences both recursively and with an explicit formula",
        studentFriendlyDescription: "I can write sequences in different forms.",
        category: "Functions",
        isActive: true,
      },

      // High School Functions — Interpreting Functions (HSF-IF)
      {
        code: "HSF-IF.C.7b",
        description: "Graph square root, cube root, and piecewise-defined functions, including step functions and absolute value functions",
        studentFriendlyDescription: "I can graph square root, cube root, and piecewise functions.",
        category: "Functions",
        isActive: true,
      },

      // Number and Quantity — The Complex Number System (N-CN)
      {
        code: "N-CN.A.2",
        description: "Use the relation i^2 = -1 and the commutative, associative, and distributive properties to add, subtract, and multiply complex numbers",
        studentFriendlyDescription: "I can add, subtract, and multiply complex numbers.",
        category: "Number and Quantity",
        isActive: true,
      },

      // Number and Quantity — The Real Number System (N-RN)
      {
        code: "N-RN.A.1",
        description: "Explain how the definition of the meaning of rational exponents follows from extending the properties of integer exponents to those values",
        studentFriendlyDescription: "I can explain what rational exponents mean.",
        category: "Number and Quantity",
        isActive: true,
      },
      {
        code: "N-RN.A.2",
        description: "Rewrite expressions involving radicals and rational exponents using the properties of exponents",
        studentFriendlyDescription: "I can convert between radical and exponential forms.",
        category: "Number and Quantity",
        isActive: true,
      },

      // Statistics and Probability — Conditional Probability (S-CP)
      {
        code: "S-CP.B.7",
        description: "Apply the Addition Rule, P(A or B) = P(A) + P(B) - P(A and B), and interpret the answer in terms of the model",
        studentFriendlyDescription: "I can use the Addition Rule to find probabilities.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-CP.B.8",
        description: "Apply the general Multiplication Rule in a uniform probability model, P(A and B) = P(A)P(B|A) = P(B)P(A|B)",
        studentFriendlyDescription: "I can use the Multiplication Rule to find probabilities.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-CP.B.9",
        description: "Use permutations and combinations to compute probabilities of compound events and solve problems",
        studentFriendlyDescription: "I can use permutations and combinations to find probabilities.",
        category: "Statistics",
        isActive: true,
      },
      {
        code: "S-CP.C.9",
        description: "Use permutations and combinations to compute probabilities of compound events and solve problems",
        studentFriendlyDescription: "I can use counting methods to solve probability problems.",
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
