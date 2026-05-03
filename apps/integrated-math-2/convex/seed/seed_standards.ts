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
