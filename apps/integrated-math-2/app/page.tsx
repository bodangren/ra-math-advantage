import Image from 'next/image';
import Link from 'next/link';

const stats = [
  { value: '13', label: 'Units', description: 'From geometric reasoning to advanced trigonometry' },
  { value: '67', label: 'Lessons', description: 'Interactive lessons with practice activities' },
  { value: '100+', label: 'Activities', description: 'Hands-on exercises to build understanding' },
];

const unitGroups = [
  {
    title: 'Geometry',
    units: [
      { number: 1, title: 'Relationships in Triangles', lessons: 6 },
      { number: 2, title: 'Quadrilaterals', lessons: 5 },
      { number: 3, title: 'Similarity', lessons: 5 },
      { number: 4, title: 'Right Triangles & Trigonometry', lessons: 6 },
      { number: 5, title: 'Circles', lessons: 5 },
      { number: 6, title: 'Measurement', lessons: 5 },
    ],
  },
  {
    title: 'Probability',
    units: [
      { number: 7, title: 'Probability', lessons: 6 },
    ],
  },
  {
    title: 'Algebra',
    units: [
      { number: 8, title: 'Relations and Functions', lessons: 6 },
      { number: 9, title: 'Linear Equations, Inequalities & Systems', lessons: 5 },
      { number: 10, title: 'Exponents and Roots', lessons: 5 },
      { number: 11, title: 'Polynomials', lessons: 6 },
      { number: 12, title: 'Quadratic Functions', lessons: 5 },
    ],
  },
  {
    title: 'Trigonometry',
    units: [
      { number: 13, title: 'Trigonometric Identities & Equations', lessons: 5 },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <div className="gradient-hero relative overflow-hidden">
        <div className="relative max-w-content mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8">
              <div className="space-y-4 animate-fade-up">
                <span className="inline-flex items-center gap-2 font-mono-num text-xs tracking-widest text-[#E07030] uppercase">
                  <span className="w-8 h-[1px] bg-[#E07030]/40" />
                  Integrated Math 2
                </span>
                <div className="space-y-2">
                  <h1
                    className="text-[#EDEBE8] font-display"
                    style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 700, lineHeight: 0.95, letterSpacing: '-2px' }}
                  >
                    IM2
                  </h1>
                  <p
                    className="text-[#EDEBE8]/90 font-display"
                    style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 600, letterSpacing: '-0.5px' }}
                  >
                    Integrated Math 2
                  </p>
                </div>
              </div>

              <p className="text-lg md:text-xl text-[#B5B0A8] leading-relaxed max-w-lg animate-fade-up-1">
                Master geometry, algebra, trigonometry, and probability through
                interactive lessons and real-world activities.
              </p>

              <div className="flex flex-wrap gap-4 animate-fade-up-2">
                <Link
                  href="/auth/login"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-md font-medium transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: '#B14C00', color: '#fff', fontWeight: 500 }}
                >
                  Sign In
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/curriculum"
                  className="group inline-flex items-center gap-2 px-8 py-4 border border-[#E07030]/30 text-[#EDEBE8] rounded-md transition-all hover:bg-white/5"
                  style={{ fontWeight: 500 }}
                >
                  View Curriculum
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-up-1">
              <div className="absolute -inset-4 rounded-panel blur-3xl" style={{ background: 'linear-gradient(135deg, oklch(0.55 0.19 40 / 0.15) 0%, transparent 50%, oklch(0.60 0.14 195 / 0.10) 100%)' }} />
              <div className="relative bg-panel rounded-panel shadow-default overflow-hidden border border-subtle">
                <Image
                  src="/im-2-hero.png"
                  alt="Integrated Math 2 — interactive course platform"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-2xl" style={{ backgroundColor: 'oklch(0.60 0.14 195 / 0.15)' }} />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, transparent, oklch(0.55 0.19 40 / 0.20), transparent)' }} />
      </div>

      <div className="bg-canvas max-w-content mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`group p-8 card-surface animate-fade-up-${index + 3}`}
            >
              <div className="flex items-start justify-between mb-6">
                <span
                  className="font-mono-num text-7xl font-semibold group-hover:opacity-80 transition-opacity"
                  style={{ color: 'oklch(0.55 0.19 40 / 0.25)' }}
                >
                  {stat.value}
                </span>
                <span className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#B14C00' }} />
              </div>
              <h3 className="text-primary-text text-2xl mb-2 font-display" style={{ fontWeight: 600 }}>
                {stat.label}
              </h3>
              <p className="text-secondary-text">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-canvas max-w-content mx-auto px-6 pb-20">
        <div className="mb-12">
          <span className="section-label mb-4 inline-block">Course Overview</span>
          <h2 className="text-primary-text text-3xl md:text-4xl mb-4 font-display" style={{ fontWeight: 700 }}>
            13 Units Across 4 Subject Areas
          </h2>
          <p className="text-secondary-text text-lg max-w-2xl">
            From geometric reasoning through algebraic modeling to advanced functions and trigonometry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {unitGroups.map((group, groupIndex) => (
            <div key={group.title} className={`space-y-3 animate-fade-up-${groupIndex + 3}`}>
              <h3 className="text-sm font-mono-num tracking-widest uppercase text-muted-text/60 mb-3">
                {group.title}
              </h3>
              {group.units.map((unit) => (
                <div key={unit.number} className="card-surface p-4 flex items-center gap-4">
                  <span
                    className="flex items-center justify-center w-8 h-8 rounded-md text-sm font-bold text-white shrink-0"
                    style={{ backgroundColor: '#B14C00' }}
                  >
                    {unit.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-primary-text text-sm font-medium truncate">{unit.title}</h4>
                  </div>
                  <span className="text-muted-text text-xs font-mono-num shrink-0">{unit.lessons} lessons</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-canvas max-w-4xl mx-auto px-6 pb-20">
        <div className="relative p-10 md:p-14 rounded-lg border border-subtle animate-fade-up-6" style={{ background: 'linear-gradient(135deg, oklch(0.985 0.003 75 / 0.8) 0%, oklch(0.94 0.012 70 / 0.6) 100%)' }}>
          <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(to right, transparent, oklch(0.55 0.19 40 / 0.20), transparent)' }} />
          <div className="relative">
            <span className="inline-block font-mono-num text-xs tracking-widest text-muted-text uppercase mb-4">
              Course Scope
            </span>
            <h2 className="text-primary-text text-3xl md:text-4xl mb-4 font-display" style={{ fontWeight: 700 }}>
              Standards-Aligned
            </h2>
            <p className="text-lg text-secondary-text leading-relaxed mb-6">
              Covers relationships in triangles, quadrilaterals, similarity, right triangles,
              circles, measurement, probability, relations and functions, linear systems,
              exponents, polynomials, quadratic functions, and trigonometric identities.
            </p>
            <Link
              href="/curriculum"
              className="inline-flex items-center gap-2 text-sm transition-all hover:gap-3"
              style={{ color: '#00828C', fontWeight: 500 }}
            >
              Explore the full curriculum
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
