import Link from 'next/link';

export function Footer() {
  return (
    <footer role="contentinfo" className="bg-panel mt-auto border-t border-subtle">
      <div className="max-w-content mx-auto px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-md text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: "#B14C00", fontFamily: "var(--font-display)" }}
                aria-hidden="true"
              >
                2
              </div>
              <h3 className="text-primary-text text-sm font-medium">
                Integrated Math 2
              </h3>
            </div>
            <p className="text-sm text-muted-text leading-relaxed">
              An interactive course platform for Integrated Math 2.
            </p>
            <p className="text-xs text-muted-text/60 font-mono-num">&copy; 2026 Daniel Bodanske</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono-num tracking-widest uppercase text-muted-text/60">
              Quick Links
            </h4>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link className="text-secondary-text hover:text-primary-text transition-colors" href="/curriculum">
                Curriculum
              </Link>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono-num tracking-widest uppercase text-muted-text/60">
              Resources
            </h4>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link className="text-secondary-text hover:text-primary-text transition-colors" href="/student/dashboard">
                Student Dashboard
              </Link>
              <Link className="text-secondary-text hover:text-primary-text transition-colors" href="/teacher/dashboard">
                Teacher Dashboard
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-subtle flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-muted-text/40 font-mono-num">Integrated Math 2 &middot; Interactive Course</p>
          <div
            className="h-1 w-8 rounded-full"
            style={{ backgroundColor: "#B14C00" }}
            aria-hidden="true"
          />
        </div>
      </div>
    </footer>
  );
}
