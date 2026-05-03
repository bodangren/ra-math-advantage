import Link from 'next/link';
import type { ReactNode } from 'react';

export interface FooterLink {
  href: string;
  label: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  /** Brand name displayed in footer */
  brandName: string;
  /** Brand description */
  brandDescription?: string;
  /** Brand icon element */
  brandIcon?: ReactNode;
  /** Sections of links */
  sections?: FooterSection[];
  /** Copyright text */
  copyright?: string;
  /** Accent color (CSS oklch value) */
  accentColor?: string;
  /** Background class */
  bgClassName?: string;
}

export function Footer({
  brandName,
  brandDescription,
  brandIcon,
  sections = [],
  copyright,
  accentColor = 'oklch(0.46 0.18 264)',
  bgClassName = 'bg-slate-dark',
}: FooterProps) {
  return (
    <footer role="contentinfo" className={`${bgClassName} mt-auto`}>
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {brandIcon && (
                <div
                  className="flex items-center justify-center w-7 h-7 rounded font-mono-num text-sm font-bold text-white shrink-0"
                  style={{ backgroundColor: accentColor }}
                  aria-hidden="true"
                >
                  {brandIcon}
                </div>
              )}
              <h3 className="font-display font-semibold text-white text-sm leading-tight">
                {brandName}
              </h3>
            </div>
            {brandDescription && (
              <p className="text-sm text-white/45 font-body leading-relaxed">
                {brandDescription}
              </p>
            )}
            {copyright && (
              <p className="text-xs text-white/30 font-mono-num">{copyright}</p>
            )}
          </div>

          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="text-xs font-mono-num font-medium tracking-widest uppercase text-white/40">
                {section.title}
              </h4>
              <nav className="flex flex-col space-y-2 text-sm font-body">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    className="text-white/55 hover:text-white transition-colors"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-white/25 font-mono-num">{brandName}</p>
          <div
            className="h-1 w-8 rounded-full"
            style={{ backgroundColor: accentColor }}
            aria-hidden="true"
          />
        </div>
      </div>
    </footer>
  );
}
