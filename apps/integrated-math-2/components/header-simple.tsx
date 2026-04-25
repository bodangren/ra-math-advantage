"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/user-menu";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/curriculum", label: "Curriculum" },
];

export function HeaderSimple() {
  const pathname = usePathname();

  return (
    <header
      role="banner"
      className="sticky top-0 z-50 w-full bg-panel border-b border-subtle"
    >
      <div className="max-w-content mx-auto px-6">
        <div className="flex h-16 items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-md text-base font-bold text-white shrink-0"
              style={{ backgroundColor: "#B14C00", fontFamily: "var(--font-display)" }}
              aria-hidden="true"
            >
              2
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-primary-text text-base font-medium">
                <span className="hidden sm:inline">Integrated Math 2</span>
                <span className="sm:hidden">IM2</span>
              </span>
              <span className="hidden md:block text-[10px] tracking-wider text-muted-text mt-0.5 font-mono-num">
                Interactive Course
              </span>
            </div>
          </Link>

          <nav
            className="hidden md:flex items-center gap-0.5 flex-1"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-2 text-sm transition-colors duration-150 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? "text-primary-text"
                      : "text-secondary-text hover:text-primary-text hover:bg-surface"
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {item.label}
                  {isActive && (
                    <span
                      className="absolute bottom-1.5 left-3 right-3 h-0.5 rounded-full"
                      style={{ backgroundColor: "#B14C00" }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto md:ml-0 flex items-center shrink-0">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
