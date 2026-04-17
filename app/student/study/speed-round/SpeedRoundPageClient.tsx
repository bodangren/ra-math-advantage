'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SpeedRoundGame } from '@/components/student/SpeedRoundGame';
import type { GlossaryTerm } from '@/lib/study/types';
import { getGlossaryTermsByModule } from '@/lib/study/glossary';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import type { Id } from '@/convex/_generated/dataModel';

interface SpeedRoundPageClientProps {
  allTerms: GlossaryTerm[];
  moduleNumbers: number[];
  studentId: string;
}

export function SpeedRoundPageClient({
  allTerms,
  moduleNumbers,
  studentId,
}: SpeedRoundPageClientProps) {
  const searchParams = useSearchParams();
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [sessionTerms, setSessionTerms] = useState<GlossaryTerm[]>([]);
  const [showGame, setShowGame] = useState(false);

  const handleModuleSelect = useCallback(
    (moduleNumber: number | null) => {
      setSelectedModule(moduleNumber);
      if (moduleNumber === null) {
        setSessionTerms(allTerms);
      } else {
        setSessionTerms(getGlossaryTermsByModule(moduleNumber));
      }
    },
    [allTerms]
  );

  useEffect(() => {
    const moduleParam = searchParams.get('module');
    if (moduleParam) {
      const moduleNumber = parseInt(moduleParam, 10);
      if (!isNaN(moduleNumber) && moduleNumbers.includes(moduleNumber)) {
        handleModuleSelect(moduleNumber);
        return;
      }
    }
    handleModuleSelect(null);
  }, [searchParams, moduleNumbers, handleModuleSelect]);

  const handleStartGame = () => {
    setShowGame(true);
  };

  const handleComplete = useCallback(
    async (results: {
      itemsSeen: number;
      itemsCorrect: number;
      itemsIncorrect: number;
      durationSeconds: number;
    }) => {
      try {
        await fetchInternalMutation(internal.study.recordStudySession, {
          userId: studentId as Id<'profiles'>,
          activityType: 'speed_round',
          curriculumScope:
            selectedModule !== null
              ? { type: 'module', moduleNumber: selectedModule }
              : { type: 'all_units' },
          results,
        });
      } catch (err) {
        console.error('Failed to record speed round session:', err);
      }
    },
    [studentId, selectedModule]
  );

  if (showGame) {
    return (
      <div>
        <div className="mb-6 max-w-2xl mx-auto px-4">
          <Link
            href="/student/study"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Study Hub
          </Link>
        </div>
        <SpeedRoundGame terms={sessionTerms} onComplete={handleComplete} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      <div className="space-y-1">
        <Link
          href="/student/study"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Study Hub
        </Link>
        <h1 className="text-3xl font-display font-bold text-foreground mt-2">
          Speed Round
        </h1>
        <p className="text-muted-foreground">
          Test your knowledge in a timed challenge! Match terms to definitions as fast as you can.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleModuleSelect(null)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              selectedModule === null
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-foreground hover:border-primary/40'
            }`}
          >
            All Modules ({allTerms.length} terms)
          </button>
          {moduleNumbers.map((mod) => {
            const modTerms = getGlossaryTermsByModule(mod);
            return (
              <button
                key={mod}
                onClick={() => handleModuleSelect(mod)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedModule === mod
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary/40'
                }`}
              >
                Module {mod} ({modTerms.length} terms)
              </button>
            );
          })}
        </div>

        {selectedModule !== null && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-medium text-foreground mb-2">
              Module {selectedModule} Terms Preview
            </h3>
            <ul className="space-y-1">
              {getGlossaryTermsByModule(selectedModule)
                .slice(0, 5)
                .map((term) => (
                  <li key={term.slug} className="text-sm text-muted-foreground">
                    • {term.term}
                  </li>
                ))}
              {getGlossaryTermsByModule(selectedModule).length > 5 && (
                <li className="text-sm text-muted-foreground">
                  ...and {getGlossaryTermsByModule(selectedModule).length - 5} more
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="font-medium text-foreground">How to Play</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• You have <span className="font-semibold text-foreground">90 seconds</span> to answer as many questions as possible</li>
          <li>• Each question shows a term — pick the correct definition from 4 options</li>
          <li>• You have <span className="font-semibold text-foreground">3 lives</span> — wrong answers cost a life</li>
          <li>• Build <span className="font-semibold text-foreground">streaks</span> for bonus points</li>
        </ul>
      </div>

      <button
        onClick={handleStartGame}
        disabled={sessionTerms.length === 0}
        className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Start Speed Round
      </button>
    </div>
  );
}