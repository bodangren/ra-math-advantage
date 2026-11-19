import Image from "next/image";
import Link from "next/link";

const stats = [
  { value: "4", label: "Units", description: "From polynomial functions to matrices" },
  { value: "58", label: "Lessons", description: "Interactive lessons with practice activities" },
  {
    value: "100+",
    label: "Worked Examples",
    description: "Step-by-step examples to build understanding",
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
                <span className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-secondary-text uppercase">
                  <span className="w-8 h-[1px] bg-border-strong" />
                  AP Precalculus
                </span>
                <div className="space-y-2">
                  <h1
                    className="text-primary-text"
                    style={{
                      fontSize: "clamp(48px, 8vw, 96px)",
                      fontWeight: 510,
                      lineHeight: 0.95,
                      letterSpacing: "-3px",
                    }}
                  >
                    APPC
                  </h1>
                  <p
                    className="text-primary-text/90"
                    style={{
                      fontSize: "clamp(20px, 3vw, 30px)",
                      fontWeight: 510,
                      letterSpacing: "-0.5px",
                    }}
                  >
                    AP Precalculus
                  </p>
                </div>
              </div>

              <p className="text-lg md:text-xl text-secondary-text leading-relaxed max-w-lg animate-fade-up-1">
                Master polynomial, rational, exponential, logarithmic, trigonometric, and parametric
                functions through interactive lessons and real-world activities.
              </p>

              <div className="flex flex-wrap gap-4 animate-fade-up-2">
                <Link
                  href="/auth/login"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-comfortable font-medium transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: "#5e6ad2", color: "#fff", fontWeight: 510 }}
                >
                  Sign In
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
                <Link
                  href="/curriculum"
                  className="group inline-flex items-center gap-2 px-8 py-4 border border-border-strong text-primary-text rounded-comfortable transition-all hover:bg-surface"
                  style={{ fontWeight: 510 }}
                >
                  View Curriculum
                </Link>
              </div>
            </div>

            <div className="relative animate-fade-up-1">
              <div
                className="absolute -inset-4 rounded-panel blur-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(94,106,210,0.12) 0%, transparent 50%, rgba(56,189,248,0.08) 100%)",
                }}
              />
              <div className="relative bg-panel rounded-panel shadow-elevated overflow-hidden border border-border-strong">
                <Image
                  src="/pre-calculus-hero.png"
                  alt="AP Precalculus — interactive course platform"
                  width={600}
                  height={600}
                  className="w-full h-auto"
                  priority
                />
              </div>
              <div
                className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-2xl"
                style={{ backgroundColor: "rgba(56,189,248,0.15)" }}
              />
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.10), transparent)",
          }}
        />
      </div>

      <div className="bg-canvas max-w-content mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={stat.label} className={`group p-8 card-surface animate-fade-up-${index + 3}`}>
              <div className="flex items-start justify-between mb-6">
                <span
                  className="font-mono text-7xl font-semibold group-hover:opacity-80 transition-opacity"
                  style={{ color: "rgba(94,106,210,0.25)" }}
                >
                  {stat.value}
                </span>
                <span
                  className="w-2 h-2 rounded-full mt-2"
                  style={{ backgroundColor: "#5e6ad2" }}
                />
              </div>
              <h3 className="text-primary-text text-2xl mb-2" style={{ fontWeight: 510 }}>
                {stat.label}
              </h3>
              <p className="text-secondary-text">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-canvas max-w-4xl mx-auto px-6 pb-20">
        <div
          className="relative p-10 md:p-14 rounded-card border border-border animate-fade-up-6"
          style={{
            background: "linear-gradient(135deg, rgba(30,35,48,0.8) 0%, rgba(20,24,32,0.6) 100%)",
          }}
        >
          <div
            className="absolute top-0 left-0 w-full h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.10), transparent)",
            }}
          />
          <div className="relative">
            <span className="inline-block font-mono text-xs tracking-widest text-muted-text uppercase mb-4">
              Course Scope
            </span>
            <h2 className="text-primary-text text-3xl md:text-4xl mb-4" style={{ fontWeight: 510 }}>
              Standards-Aligned
            </h2>
            <p className="text-lg text-secondary-text leading-relaxed mb-6">
              Covers polynomial and rational functions, exponential and logarithmic functions,
              trigonometric and polar functions, and functions with parameters, vectors, and
              matrices.
            </p>
            <Link
              href="/curriculum"
              className="inline-flex items-center gap-2 text-sm transition-all hover:gap-3"
              style={{ color: "#38bdf8", fontWeight: 510 }}
            >
              Explore the full curriculum
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
