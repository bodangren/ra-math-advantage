'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ReviewSession } from '@/components/student/ReviewSession';
import type { GlossaryTerm } from '@/lib/study/types';
import { getGlossaryTermBySlug } from '@/lib/study/glossary';
import { fetchInternalQuery, fetchInternalMutation, internal } from '@/lib/convex/server';
import type { Id } from '@/convex/_generated/dataModel';

interface ReviewPageClientProps {
  studentId: string;
}

interface DueTerm {
  termSlug: string;
  fsrsState: unknown;
  scheduledFor: number;
}

export function ReviewPageClient({ studentId }: ReviewPageClientProps) {
  const [dueTerms, setDueTerms] = useState<GlossaryTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    async function loadDueTerms() {
      try {
        const due: DueTerm[] = await fetchInternalQuery(
          internal.study.getDueTerms,
          { userId: studentId as Id<'profiles'> }
        );
        const terms: GlossaryTerm[] = [];
        for (const d of due) {
          const term = getGlossaryTermBySlug(d.termSlug);
          if (term) {
            terms.push(term);
          }
        }
        setDueTerms(terms);
      } catch (err) {
        console.error('Failed to load due terms:', err);
        setDueTerms([]);
      } finally {
        setIsLoading(false);
      }
    }
    void loadDueTerms();
  }, [studentId]);

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
          activityType: 'srs_review',
          results: {
            itemsSeen: results.itemsSeen,
            itemsCorrect: results.itemsCorrect,
            itemsIncorrect: results.itemsIncorrect,
            durationSeconds: results.durationSeconds,
          },
        });
      } catch (err) {
        console.error('Failed to record session:', err);
      }
    },
    [studentId]
  );

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48 mx-auto" />
          <div className="h-4 bg-muted rounded w-64 mx-auto" />
        </div>
      </div>
    );
  }

  if (showPlayer) {
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
        <ReviewSession terms={dueTerms} onComplete={handleComplete} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 px-4">
      <div className="space-y-1">
        <Link
          href="/student/study"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Study Hub
        </Link>
        <h1 className="text-3xl font-display font-bold text-foreground mt-2">
          SRS Review
        </h1>
        <p className="text-muted-foreground">
          Review terms scheduled by the spaced repetition system
        </p>
      </div>

      {dueTerms.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">
            All Caught Up!
          </h2>
          <p className="text-muted-foreground">
            You have no terms due for review today. Great job!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-center space-y-2">
              <p className="text-4xl font-display font-bold text-primary">
                {dueTerms.length}
              </p>
              <p className="text-muted-foreground">
                term{dueTerms.length !== 1 ? 's' : ''} due for review
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPlayer(true)}
            className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start SRS Review ({dueTerms.length} cards)
          </button>
        </div>
      )}
    </div>
  );
}