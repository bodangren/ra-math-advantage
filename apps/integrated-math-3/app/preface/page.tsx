import Link from 'next/link';

export default function PrefacePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hero-gradient relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 font-mono-num text-xs font-medium tracking-widest text-white/70 uppercase">
            <span className="w-8 h-[1px] bg-white/40"></span>
            Course Introduction
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[0.95] text-white">
            Preface
          </h1>
        </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
        <div className="space-y-16">
          <div className="space-y-6">
            <p className="text-lg md:text-xl text-foreground/90 leading-relaxed">
              <strong>Integrated Math 3</strong> is the third course in a three-year integrated
              mathematics sequence. This course deepens students&apos; understanding of the algebraic and
              analytical tools introduced in earlier years, connecting them to new topics in statistics,
              trigonometry, and mathematical modeling.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-primary" />
              <span className="font-mono-num text-xs font-medium tracking-widest text-primary uppercase">
                What You Will Learn
              </span>
            </div>
            <p className="text-muted-foreground">
              Over nine modules and 52 lessons, you will explore the following topics:
            </p>
            <ul className="grid sm:grid-cols-2 gap-3">
              {[
                'Quadratic functions and complex numbers',
                'Polynomials and polynomial equations',
                'Inverse and radical functions',
                'Exponential functions and geometric series',
                'Logarithmic functions',
                'Rational functions and equations',
                'Inferential statistics',
                'Trigonometric functions'
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-primary" />
              <span className="font-mono-num text-xs font-medium tracking-widest text-primary uppercase">
                How This Course Works
              </span>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Each lesson is structured into six sequential phases: a <strong className="text-foreground">Hook</strong> to
                activate prior knowledge, an <strong className="text-foreground">Introduction</strong> of new concepts, a
                <strong className="text-foreground">Guided Practice</strong> section worked through together, an{' '}
                <strong className="text-foreground">Independent Practice</strong> completed on your own, an{' '}
                <strong className="text-foreground">Assessment</strong> to measure understanding, and a{' '}
                <strong className="text-foreground">Closing</strong> reflection.
              </p>
              <p>
                All graded work is completed in class. Retakes are permitted with a maximum score of 85%.
                The goal is mastery, not perfection on the first attempt.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-primary" />
              <span className="font-mono-num text-xs font-medium tracking-widest text-primary uppercase">
                CAP Reflection
              </span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              At the end of each lesson you will reflect on three qualities: <strong className="text-foreground">Courage</strong>
              &apos; — taking on challenges; <strong className="text-foreground">Adaptability</strong> — adjusting your approach
              when something isn&apos;t working; and <strong className="text-foreground">Persistence</strong> — continuing through
              difficulty. Mathematics is as much about these habits of mind as it is about the content.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Explore the course
              </h3>
              <p className="text-muted-foreground">
                Ready to dive into the curriculum?
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/curriculum"
                className="group inline-flex items-center gap-2 px-6 py-3 border-2 border-border text-foreground font-medium rounded-sm transition-all hover:border-primary hover:text-primary"
              >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                View Curriculum
              </Link>
              <Link
                href="/auth/login"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-sm transition-all hover:bg-primary/90 hover:translate-x-1"
              >
                Sign In
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
