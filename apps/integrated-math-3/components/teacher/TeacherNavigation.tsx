'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface TeacherNavigationProps {
  activeRoute: string;
}

const navItems = [
  { href: '/teacher/dashboard', label: 'Dashboard' },
  { href: '/teacher/gradebook', label: 'Gradebook' },
  { href: '/teacher/students', label: 'Students' },
  { href: '/teacher/units', label: 'Units' },
  { href: '/teacher/settings', label: 'Settings' },
];

export function TeacherNavigation({ activeRoute }: TeacherNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border border-border"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <nav
        aria-label="Teacher navigation"
        className={cn(
          'fixed left-0 top-0 h-screen w-64 bg-background border-r border-border p-6 pt-20 transition-transform',
          'md:block md:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ul className="space-y-4">
          {navItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'block py-2 px-4 rounded-md transition-colors',
                  'hover:bg-muted',
                  activeRoute === item.href ? 'text-orange-600 font-semibold' : 'text-foreground'
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
