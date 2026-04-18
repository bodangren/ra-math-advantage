'use client';

import { useState } from 'react';
import { Menu, X, CheckCircle2, Circle } from 'lucide-react';
import type { PhaseType } from '@/lib/curriculum/phase-types';

export interface PhaseNavItem {
  phaseType: PhaseType;
  label: string;
  completed: boolean;
  isCurrent: boolean;
}

export interface LessonPageLayoutProps {
  lessonTitle: string;
  moduleLabel: string;
  lessonNumber: number;
  goals?: string;
  phases: PhaseNavItem[];
  children: React.ReactNode;
  showTeacherPreviewBadge?: boolean;
}

export function LessonPageLayout({
  lessonTitle,
  moduleLabel,
  lessonNumber,
  goals,
  phases,
  children,
  showTeacherPreviewBadge = false,
}: LessonPageLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const completedCount = phases.filter(p => p.completed).length;
  const progressPct = phases.length > 0
    ? Math.round((completedCount / phases.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky progress bar */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPct}
        aria-label="Lesson progress"
        className="sticky top-0 z-50 h-1 bg-muted"
      >
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Header */}
      <header className="border-b bg-card px-4 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-0.5">
              <span>{moduleLabel}</span>
              <span>·</span>
              <span>Lesson {lessonNumber}</span>
            </div>
            <h1 className="font-display text-xl font-semibold text-foreground truncate">
              {lessonTitle}
            </h1>
            {showTeacherPreviewBadge && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
                Teacher Preview
              </span>
            )}
            {goals && (
              <p className="mt-0.5 text-sm text-muted-foreground">{goals}</p>
            )}
          </div>

          {/* Mobile sidebar toggle */}
          <button
            type="button"
            aria-label="Toggle phases navigation"
            onClick={() => setSidebarOpen(o => !o)}
            className="flex-shrink-0 p-2 rounded-md hover:bg-secondary transition-colors lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto w-full max-w-7xl flex flex-1 gap-0 lg:gap-6 px-4 py-6">
        {/* Sidebar */}
        <nav
          aria-label="Lesson phases"
          data-sidebar
          data-sidebar-open={sidebarOpen}
          className={[
            'flex-shrink-0 w-56 space-y-1',
            // Mobile: absolute overlay toggled by sidebarOpen
            sidebarOpen
              ? 'fixed inset-y-0 left-0 z-40 bg-card border-r p-4 pt-20 w-64'
              : 'hidden lg:block',
          ].join(' ')}
        >
          {phases.map((phase, idx) => (
            <div
              key={`${phase.phaseType}-${idx}`}
              data-current={phase.isCurrent ? 'true' : undefined}
              data-completed={phase.completed ? 'true' : undefined}
              className={[
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                phase.isCurrent
                  ? 'bg-primary/10 text-primary font-medium'
                  : phase.completed
                    ? 'text-muted-foreground'
                    : 'text-foreground/70',
              ].join(' ')}
            >
              {phase.completed
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-primary" />
                : <Circle className="w-4 h-4 flex-shrink-0" />
              }
              <span>{phase.label}</span>
            </div>
          ))}
        </nav>

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            aria-hidden
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 max-w-3xl">
          {children}
        </main>
      </div>
    </div>
  );
}
