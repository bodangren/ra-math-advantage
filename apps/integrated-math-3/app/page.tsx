import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hero-gradient relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-8">
            <div className="space-y-4 animate-fade-up">
              <span className="inline-flex items-center gap-2 font-mono-num text-xs font-medium tracking-widest text-white/70 uppercase">
                <span className="w-8 h-[1px] bg-white/40"></span>
                Integrated Math 3 Honors
              </span>
              <div className="space-y-2">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[0.95] text-white">
                  IM3
                </h1>
                <p className="text-2xl md:text-3xl font-display font-semibold text-white/90">
                  Integrated Mathematics 3
                </p>
              </div>
            </div>

            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-lg animate-fade-up-1">
              Master algebra, functions, modeling, and statistical reasoning through
              interactive lessons and real-world activities.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up-2">
              <Link
                href="/auth/login"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-sm transition-all hover:bg-primary/90 hover:translate-x-1"
              >
                Sign In
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/curriculum"
                className="group inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-medium rounded-sm transition-all hover:bg-white/10"
              >
                View Curriculum
              </Link>
            </div>
          </div>

            <div className="relative animate-fade-up-1">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-2xl blur-3xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                <Image
                  src="/im3-hero.png"
                  alt="Integrated Math 3"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group p-8 bg-white rounded-lg border border-border hover:border-primary/50 transition-all duration-300 animate-fade-up-3">
            <div className="flex items-start justify-between mb-6">
              <span className="font-mono-num text-7xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors">9</span>
              <span className="w-2 h-2 bg-primary rounded-full mt-2" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground mb-2">Modules</h3>
            <p className="text-muted-foreground">
              From quadratic functions to trigonometry
            </p>
          </div>

          <div className="group p-8 bg-white rounded-lg border border-border hover:border-primary/50 transition-all duration-300 animate-fade-up-4">
            <div className="flex items-start justify-between mb-6">
              <span className="font-mono-num text-7xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors">52</span>
              <span className="w-2 h-2 bg-primary rounded-full mt-2" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground mb-2">Lessons</h3>
            <p className="text-muted-foreground">
              Interactive lessons with practice activities
            </p>
          </div>

          <div className="group p-8 bg-white rounded-lg border border-border hover:border-primary/50 transition-all duration-300 animate-fade-up-5">
            <div className="flex items-start justify-between mb-6">
              <span className="font-mono-num text-7xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors">100+</span>
              <span className="w-2 h-2 bg-primary rounded-full mt-2" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground mb-2">Worked Examples</h3>
            <p className="text-muted-foreground">
              Step-by-step examples to build understanding
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="relative p-10 md:p-14 bg-gradient-to-br from-secondary/60 to-secondary/40 rounded-lg border border-border animate-fade-up-6">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="relative">
            <span className="inline-block font-mono-num text-xs font-medium tracking-widest text-secondary-foreground uppercase mb-4">
              Course Scope
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Standards-Aligned
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Covers quadratic functions, polynomials, inverses and radicals, exponentials,
              logarithms, rational functions, inferential statistics, and trigonometry.
            </p>
            <Link
              href="/preface"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
            >
              Read the course preface
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
