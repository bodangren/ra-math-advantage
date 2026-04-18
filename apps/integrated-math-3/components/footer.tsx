import Link from 'next/link';

export function Footer() {
  return (
    <footer role="contentinfo" className="bg-slate-dark mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-7 h-7 rounded font-mono-num text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: "oklch(0.46 0.18 264)" }}
                aria-hidden="true"
              >
                ∫
              </div>
              <h3 className="font-display font-semibold text-white text-sm leading-tight">
                Integrated Math 3
              </h3>
            </div>
            <p className="text-sm text-white/45 font-body leading-relaxed">
              An interactive textbook for Integrated Math 3.
            </p>
            <p className="text-xs text-white/30 font-mono-num">© 2025 Daniel Bodanske</p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono-num font-medium tracking-widest uppercase text-white/40">
              Quick Links
            </h4>
            <nav className="flex flex-col space-y-2 text-sm font-body">
              <Link className="text-white/55 hover:text-white transition-colors" href="/preface">
                Preface
              </Link>
              <Link className="text-white/55 hover:text-white transition-colors" href="/curriculum">
                Curriculum
              </Link>
            </nav>
          </div>

          {/* Teacher Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono-num font-medium tracking-widest uppercase text-white/40">
              Teacher Resources
            </h4>
            <nav className="flex flex-col space-y-2 text-sm font-body">
              <Link className="text-white/55 hover:text-white transition-colors" href="/teacher/dashboard">
                Teacher Dashboard
              </Link>
              <Link className="text-white/55 hover:text-white transition-colors" href="/teacher/gradebook">
                Gradebook
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom border */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-white/25 font-mono-num">Integrated Math 3 · Interactive Textbook</p>
          <div
            className="h-1 w-8 rounded-full"
            style={{ backgroundColor: "oklch(0.46 0.18 264)" }}
            aria-hidden="true"
          />
        </div>
      </div>
    </footer>
  );
}
