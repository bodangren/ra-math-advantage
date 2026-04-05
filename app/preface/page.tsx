import Link from 'next/link';

export default function PrefacePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10 py-8">
      <div className="space-y-3">
        <span className="section-label">Course Introduction</span>
        <h1 className="text-4xl font-display font-bold text-foreground">Preface</h1>
      </div>

      <div className="prose prose-stone max-w-none space-y-6 text-foreground/90 leading-relaxed">
        <p className="text-lg">
          <strong>Integrated Math 3</strong> is the third course in a three-year integrated
          mathematics sequence. This course deepens students&apos; understanding of the algebraic and
          analytical tools introduced in earlier years, connecting them to new topics in statistics,
          trigonometry, and mathematical modeling.
        </p>

        <h2 className="font-display text-2xl font-semibold text-foreground mt-8">
          What You Will Learn
        </h2>
        <p>
          Over nine modules and 52 lessons, you will explore the following topics:
        </p>
        <ul className="space-y-1 pl-4 list-disc text-muted-foreground">
          <li>Quadratic functions and complex numbers</li>
          <li>Polynomials and polynomial equations</li>
          <li>Inverse and radical functions</li>
          <li>Exponential functions and geometric series</li>
          <li>Logarithmic functions</li>
          <li>Rational functions and equations</li>
          <li>Inferential statistics</li>
          <li>Trigonometric functions</li>
        </ul>

        <h2 className="font-display text-2xl font-semibold text-foreground mt-8">
          How This Course Works
        </h2>
        <p>
          Each lesson is structured into six sequential phases: a <strong>Hook</strong> to
          activate prior knowledge, an <strong>Introduction</strong> of new concepts, a
          <strong> Guided Practice</strong> section worked through together, an{' '}
          <strong>Independent Practice</strong> completed on your own, an{' '}
          <strong>Assessment</strong> to measure understanding, and a{' '}
          <strong>Closing</strong> reflection.
        </p>
        <p>
          All graded work is completed in class. Retakes are permitted with a maximum score of 85%.
          The goal is mastery, not perfection on the first attempt.
        </p>

        <h2 className="font-display text-2xl font-semibold text-foreground mt-8">
          CAP Reflection
        </h2>
        <p>
          At the end of each lesson you will reflect on three qualities: <strong>Courage</strong>
          {' '}— taking on challenges; <strong>Adaptability</strong> — adjusting your approach
          when something isn&apos;t working; and <strong>Persistence</strong> — continuing through
          difficulty. Mathematics is as much about these habits of mind as it is about the content.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
        <Link
          href="/curriculum"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← View full curriculum
        </Link>
        <Link
          href="/auth/login"
          className="text-sm font-medium text-primary hover:underline"
        >
          Sign in to start →
        </Link>
      </div>
    </div>
  );
}
