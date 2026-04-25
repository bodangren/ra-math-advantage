const units = [
  {
    number: 1,
    title: "Relationships in Triangles",
    description: "Triangle properties, congruence criteria, and reasoning through proofs.",
    lessons: [
      "1.1 Classifying Triangles",
      "1.2 Triangle Angle Relationships",
      "1.3 Triangle Inequality Theorem",
      "1.4 Congruence Criteria (SSS, SAS, ASA, AAS, HL)",
      "1.5 Proving Triangle Congruence",
      "1.6 Isosceles & Equilateral Triangle Properties",
    ],
  },
  {
    number: 2,
    title: "Quadrilaterals",
    description: "Properties and classification of quadrilaterals, coordinate proofs.",
    lessons: [
      "2.1 Polygon Basics & Angle Sums",
      "2.2 Parallelogram Properties",
      "2.3 Special Parallelograms (Rectangle, Rhombus, Square)",
      "2.4 Trapezoids and Isosceles Trapezoids",
      "2.5 Coordinate Proofs with Quadrilaterals",
    ],
  },
  {
    number: 3,
    title: "Similarity",
    description: "Scale factors, proportional reasoning, and similarity proofs.",
    lessons: [
      "3.1 Similar Figures and Scale Factors",
      "3.2 Triangle Similarity (AA, SAS, SSS)",
      "3.3 Proportions and Indirect Measurement",
      "3.4 Similarity Proofs",
      "3.5 Applications of Similarity",
    ],
  },
  {
    number: 4,
    title: "Right Triangles & Trigonometry",
    description: "Pythagorean theorem, special right triangles, trigonometric ratios, and laws.",
    lessons: [
      "4.1 Pythagorean Theorem",
      "4.2 Special Right Triangles (30-60-90, 45-45-90)",
      "4.3 Introduction to Sine, Cosine, Tangent",
      "4.4 Solving Right Triangles",
      "4.5 Law of Sines",
      "4.6 Law of Cosines",
    ],
  },
  {
    number: 5,
    title: "Circles",
    description: "Circle geometry, angles, arcs, tangents, and coordinate equations.",
    lessons: [
      "5.1 Circle Vocabulary and Basic Properties",
      "5.2 Angles in Circles (Central, Inscribed)",
      "5.3 Arcs and Chords",
      "5.4 Tangents and Secants",
      "5.5 Equations of Circles (Coordinate Plane)",
    ],
  },
  {
    number: 6,
    title: "Measurement",
    description: "Area, surface area, volume, and composite solids.",
    lessons: [
      "6.1 Area of Polygons",
      "6.2 Surface Area of 3D Figures",
      "6.3 Volume of Prisms and Cylinders",
      "6.4 Volume of Cones and Spheres",
      "6.5 Cross-Sections and Composite Solids",
    ],
  },
  {
    number: 7,
    title: "Probability",
    description: "Counting principles, permutations, combinations, and compound probability.",
    lessons: [
      "7.1 Basic Probability Concepts",
      "7.2 Counting Principle",
      "7.3 Permutations",
      "7.4 Combinations",
      "7.5 Compound Probability",
      "7.6 Fair Decisions and Expected Value",
    ],
  },
  {
    number: 8,
    title: "Relations and Functions",
    description: "Function concepts, notation, transformations, and comparisons.",
    lessons: [
      "8.1 Relations vs. Functions",
      "8.2 Domain and Range",
      "8.3 Function Notation",
      "8.4 Linear and Nonlinear Functions",
      "8.5 Function Transformations",
      "8.6 Comparing Functions",
    ],
  },
  {
    number: 9,
    title: "Linear Equations, Inequalities & Systems",
    description: "Solving and graphing linear equations, inequalities, and systems.",
    lessons: [
      "9.1 Solving Linear Equations",
      "9.2 Graphing Linear Equations",
      "9.3 Linear Inequalities",
      "9.4 Systems of Equations (Graphing, Substitution, Elimination)",
      "9.5 Systems of Inequalities",
    ],
  },
  {
    number: 10,
    title: "Exponents and Roots",
    description: "Laws of exponents, rational exponents, scientific notation, and radicals.",
    lessons: [
      "10.1 Laws of Exponents",
      "10.2 Negative and Rational Exponents",
      "10.3 Scientific Notation",
      "10.4 Radical Expressions",
      "10.5 Solving Radical Equations",
    ],
  },
  {
    number: 11,
    title: "Polynomials",
    description: "Polynomial operations, factoring techniques, and solving polynomial equations.",
    lessons: [
      "11.1 Polynomial Vocabulary and Classification",
      "11.2 Adding and Subtracting Polynomials",
      "11.3 Multiplying Polynomials",
      "11.4 Special Products",
      "11.5 Factoring Techniques",
      "11.6 Solving Polynomial Equations",
    ],
  },
  {
    number: 12,
    title: "Quadratic Functions",
    description: "Graphing, factoring, completing the square, and the quadratic formula.",
    lessons: [
      "12.1 Graphing Quadratics (Vertex Form)",
      "12.2 Factoring Quadratics",
      "12.3 Completing the Square",
      "12.4 Quadratic Formula",
      "12.5 Applications of Quadratic Models",
    ],
  },
  {
    number: 13,
    title: "Trigonometric Identities & Equations",
    description: "Fundamental identities, sum/difference, double/half-angle, and solving trig equations.",
    lessons: [
      "13.1 Fundamental Trig Identities",
      "13.2 Pythagorean Identities",
      "13.3 Sum and Difference Identities",
      "13.4 Double-Angle and Half-Angle Identities",
      "13.5 Solving Trigonometric Equations",
    ],
  },
];

export default function CurriculumPage() {
  return (
    <div className="max-w-content mx-auto px-6 py-16">
      <div className="mb-12">
        <span className="section-label mb-4 inline-block">Curriculum</span>
        <h1
          className="text-primary-text mb-4 font-display"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.10, letterSpacing: '-1px' }}
        >
          Integrated Math 2 Curriculum
        </h1>
        <p className="text-secondary-text text-lg max-w-2xl">
          13 units, 67 lessons covering geometry, algebra, trigonometry, and probability.
        </p>
      </div>

      <div className="space-y-8">
        {units.map((unit) => (
          <div key={unit.number} className="card-surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="flex items-center justify-center w-8 h-8 rounded-md text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: "#B14C00" }}
              >
                {unit.number}
              </span>
              <h2 className="text-primary-text font-display" style={{ fontSize: '20px', fontWeight: 600 }}>
                {unit.title}
              </h2>
              <span className="text-muted-text text-sm font-mono-num ml-auto">
                {unit.lessons.length} lessons
              </span>
            </div>
            <p className="text-secondary-text text-sm mb-4 leading-relaxed">
              {unit.description}
            </p>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {unit.lessons.map((lesson, i) => (
                <div
                  key={i}
                  className="text-sm text-muted-text py-1.5 px-2 rounded-md hover:bg-surface-light transition-colors"
                >
                  {lesson}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
