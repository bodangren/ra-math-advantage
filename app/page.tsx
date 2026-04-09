import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="space-y-16">
      <div className="hero-gradient text-center space-y-6 py-20 px-6 rounded-xl">
        <div className="flex justify-center mb-4 animate-fade-up">
          <Image
            src="/im3-hero.png"
            alt="Integrated Math 3 Hero"
            width={200}
            height={200}
            className="rounded-lg shadow-2xl"
          />
        </div>
        <span className="section-label section-label-light">Integrated Math 3 Honors</span>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight animate-fade-up">
          Integrated Math 3
        </h1>
        <p className="text-lg text-white/75 max-w-2xl mx-auto animate-fade-up-1">
          Master algebra, functions, modeling, and statistical reasoning through
          interactive lessons and real-world activities.
        </p>
        <div className="flex items-center justify-center gap-4 animate-fade-up-2">
          <Link
            href="/auth/login"
            className="rounded-md px-6 py-3 text-sm font-medium text-primary-foreground bg-primary transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Sign In
          </Link>
          <Link
            href="/curriculum"
            className="rounded-md border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            View Curriculum
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        <div className="card-workbook p-6 space-y-2 animate-fade-up-3">
          <p className="font-mono-num text-3xl font-bold text-primary">9</p>
          <h3 className="font-display font-semibold text-card-foreground">9 Modules</h3>
          <p className="text-sm text-muted-foreground">
            From quadratic functions to trigonometry
          </p>
        </div>

        <div className="card-workbook p-6 space-y-2 animate-fade-up-4">
          <p className="font-mono-num text-3xl font-bold text-primary">52</p>
          <h3 className="font-display font-semibold text-card-foreground">52 Lessons</h3>
          <p className="text-sm text-muted-foreground">
            Interactive lessons with practice activities
          </p>
        </div>

        <div className="card-workbook p-6 space-y-2 animate-fade-up-5">
          <p className="font-mono-num text-3xl font-bold text-primary">6</p>
          <h3 className="font-display font-semibold text-card-foreground">Phases Per Lesson</h3>
          <p className="text-sm text-muted-foreground">
            Hook → Introduction → Practice → Assessment → Closing
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-secondary/60 rounded-xl p-8 text-center space-y-4 animate-fade-up-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Standards-Aligned Curriculum
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Covers quadratic functions, polynomials, inverses and radicals, exponentials,
          logarithms, rational functions, inferential statistics, and trigonometry.
        </p>
        <Link
          href="/preface"
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          Read the course preface →
        </Link>
      </div>
    </div>
  );
}
